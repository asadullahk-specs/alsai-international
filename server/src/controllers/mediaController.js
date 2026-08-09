const fs = require('fs');
const path = require('path');
const { extractFileId, resolveDriveMedia } = require('../utils/driveMedia');

const PLACEHOLDER_PATH = path.join(__dirname, '..', 'assets', 'media-placeholder.svg');

const sendPlaceholder = (res) => {
  res.status(200);
  res.set('Content-Type', 'image/svg+xml');
  // Short cache only - if the admin fixes sharing permissions on the Drive
  // file, we want the real image to start showing up again quickly.
  res.set('Cache-Control', 'public, max-age=60');
  fs.createReadStream(PLACEHOLDER_PATH).pipe(res);
};

// GET /api/media/:fileId
// Serves the actual bytes of an admin-entered Google Drive image/video,
// resolving + caching on first request and serving straight from local disk
// on every request after that. Supports HTTP Range requests so <video>
// scrubbing works.
exports.getDriveMedia = async (req, res) => {
  const fileId = extractFileId(req.params.fileId);
  if (!fileId) return sendPlaceholder(res);

  const resolved = await resolveDriveMedia(fileId);
  if (!resolved) return sendPlaceholder(res);

  const { filePath, contentType } = resolved;
  const stat = fs.statSync(filePath);
  res.set('Content-Type', contentType);
  // Media is content-addressed by Drive fileId and never mutates in place
  // (a changed link is a different fileId), so it's safe to cache hard.
  res.set('Cache-Control', 'public, max-age=31536000, immutable');

  const range = req.headers.range;
  if (range) {
    const [startStr, endStr] = range.replace(/bytes=/, '').split('-');
    const start = parseInt(startStr, 10);
    const end = endStr ? parseInt(endStr, 10) : stat.size - 1;
    res.status(206);
    res.set('Accept-Ranges', 'bytes');
    res.set('Content-Range', `bytes ${start}-${end}/${stat.size}`);
    res.set('Content-Length', end - start + 1);
    fs.createReadStream(filePath, { start, end }).pipe(res);
    return;
  }

  res.set('Content-Length', stat.size);
  fs.createReadStream(filePath).pipe(res);
};
