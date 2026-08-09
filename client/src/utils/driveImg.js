/**
 * Admin-provided media across the site is entered as a Google Drive share
 * link (e.g. "https://drive.google.com/file/d/FILE_ID/view?usp=sharing").
 * That share-page URL returns an HTML viewer, not raw image bytes, so using
 * it directly as an <img>/<video> src renders a broken image.
 *
 * This used to convert the link straight into one of Google's undocumented
 * hotlink endpoints (drive.google.com/thumbnail, lh3.googleusercontent.com).
 * Those endpoints get throttled hard once a page requests more than a
 * handful at once (an 11-item shop grid = 20+ simultaneous requests), and
 * intermittently just stop serving - which looked like images and links
 * "disappearing".
 *
 * Instead, this now points at our own backend (/api/media/:fileId), which
 * fetches the file from Drive once, caches it to local disk, and serves the
 * cached copy on every request after that - so display no longer depends on
 * Google's endpoints being reachable at render time, and survives restarts.
 *
 * Any URL that isn't a Drive link (customer-uploaded review images, which
 * are stored locally, or a URL already pointing at our own /api/media proxy)
 * is returned unchanged.
 */

const API_BASE = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api`;

const extractFileId = (trimmed) => {
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

  return null;
};

export const driveImg = (url) => {
  if (!url || typeof url !== 'string') return url;
  const trimmed = url.trim();
  if (!trimmed) return trimmed;

  // Already our own proxy URL, or a locally-stored file (e.g. review images) - leave as-is.
  if (trimmed.includes('/api/media/') || trimmed.startsWith('/uploads/')) return trimmed;

  const isDriveLink = trimmed.includes('drive.google.com') || trimmed.includes('googleusercontent.com');
  if (!isDriveLink) return trimmed;

  const fileId = extractFileId(trimmed);
  if (!fileId) return trimmed;

  return `${API_BASE}/media/${fileId}`;
};
