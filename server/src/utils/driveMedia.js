const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

// Every image/video across the site (other than customer review photos) is
// entered by the admin as a Google Drive share link. Historically the app
// hot-linked straight to Google's endpoints from the browser
// (drive.google.com/thumbnail, lh3.googleusercontent.com, etc). Those
// endpoints are undocumented, unauthenticated, and get throttled hard once a
// page requests more than a handful of them at once (e.g. an 11-item shop
// grid = 20+ simultaneous thumbnail requests) - Google starts returning 403s
// or blank responses, which looks exactly like "the image disappeared",
// especially after a period of no traffic (dev server restarted, etc).
//
// This module fetches the real file bytes ONCE per Drive file and caches
// them to local disk under server/uploads/drive-cache. Every request after
// that is served from disk - fast, not subject to Google's rate limits, and
// it survives restarts (unlike relying on Google's endpoint being reachable
// at render time).

const CACHE_DIR = process.env.VERCEL
  ? '/tmp/drive-cache'
  : path.join(__dirname, '..', '..', 'uploads', 'drive-cache');
fs.mkdirSync(CACHE_DIR, { recursive: true });

const FETCH_TIMEOUT_MS = 10000;
const NEGATIVE_CACHE_MS = 10 * 60 * 1000; // don't hammer Google for a link we just failed to resolve

// fileId -> timestamp of last failed resolution attempt
const negativeCache = new Map();

const EXT_BY_CONTENT_TYPE = {
  'image/jpeg': '.jpg',
  'image/jpg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
  'video/quicktime': '.mov',
  'video/x-matroska': '.mkv',
};

/**
 * Pulls a Google Drive file ID out of any of the URL shapes an admin might
 * paste in (share link, "open?id=", uc link, thumbnail link, lh3 link) or a
 * bare file ID.
 */
const extractFileId = (input) => {
  if (!input || typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];

  const dMatch = trimmed.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (dMatch) return dMatch[1];

  try {
    const u = new URL(trimmed);
    const idParam = u.searchParams.get('id');
    if (idParam) return idParam;
  } catch {
    // not a full URL - fall through
  }

  // A bare Drive file ID (typically 25+ chars of alnum/-/_)
  if (/^[a-zA-Z0-9_-]{15,}$/.test(trimmed)) return trimmed;

  return null;
};

const cachedFilePath = async (fileId) => {
  const entries = await fsp.readdir(CACHE_DIR).catch(() => []);
  const hit = entries.find((f) => f.startsWith(`${fileId}.`));
  return hit ? path.join(CACHE_DIR, hit) : null;
};

const fetchWithTimeout = async (url, options = {}) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...options, signal: controller.signal, redirect: 'follow' });
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Google shows an interstitial "can't scan this file for viruses" HTML page
 * instead of the file for larger downloads. That page contains a form with a
 * "confirm" token we can resubmit to get the real bytes.
 */
const extractConfirmToken = (html) => {
  const match = html.match(/confirm=([0-9A-Za-z_-]+)/);
  return match ? match[1] : null;
};

const isMediaContentType = (contentType) =>
  !!contentType && (contentType.startsWith('image/') || contentType.startsWith('video/'));

/**
 * Tries several Google endpoints in order, returning the first one that
 * actually serves image/video bytes rather than an HTML page.
 */
const fetchFromGoogle = async (fileId) => {
  const attempts = [
    `https://drive.google.com/uc?export=download&id=${fileId}`,
    `https://lh3.googleusercontent.com/d/${fileId}=w2000`,
    `https://drive.google.com/thumbnail?id=${fileId}&sz=w2000`,
  ];

  for (const url of attempts) {
    try {
      let res = await fetchWithTimeout(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
      let contentType = res.headers.get('content-type') || '';

      if (contentType.startsWith('text/html')) {
        const html = await res.text();
        const token = extractConfirmToken(html);
        if (token) {
          const confirmUrl = `https://drive.google.com/uc?export=download&confirm=${token}&id=${fileId}`;
          res = await fetchWithTimeout(confirmUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          contentType = res.headers.get('content-type') || '';
        }
      }

      if (res.ok && isMediaContentType(contentType)) {
        const buffer = Buffer.from(await res.arrayBuffer());
        // Google occasionally returns a 200 with an empty/near-empty body for
        // a file it won't actually serve - treat that as a miss, not success.
        if (buffer.length > 200) {
          return { buffer, contentType: contentType.split(';')[0].trim() };
        }
      }
    } catch {
      // try the next candidate endpoint
    }
  }

  return null;
};

/**
 * Resolves a Drive fileId to local bytes, using the disk cache when
 * available and only reaching out to Google on a cache miss.
 *
 * Returns { filePath, contentType } or null if the file could not be
 * resolved (not shared publicly, deleted, etc).
 */
const resolveDriveMedia = async (fileId) => {
  const existing = await cachedFilePath(fileId);
  if (existing) {
    const ext = path.extname(existing).slice(1).toLowerCase();
    const contentType =
      Object.entries(EXT_BY_CONTENT_TYPE).find(([, e]) => e === `.${ext}`)?.[0] ||
      (ext === 'mp4' ? 'video/mp4' : 'image/jpeg');
    return { filePath: existing, contentType };
  }

  const lastFailure = negativeCache.get(fileId);
  if (lastFailure && Date.now() - lastFailure < NEGATIVE_CACHE_MS) {
    return null;
  }

  const result = await fetchFromGoogle(fileId);
  if (!result) {
    negativeCache.set(fileId, Date.now());
    return null;
  }

  negativeCache.delete(fileId);
  const ext = EXT_BY_CONTENT_TYPE[result.contentType] || '.jpg';
  const filePath = path.join(CACHE_DIR, `${fileId}${ext}`);
  await fsp.writeFile(filePath, result.buffer);
  return { filePath, contentType: result.contentType };
};

module.exports = { extractFileId, resolveDriveMedia, CACHE_DIR };
