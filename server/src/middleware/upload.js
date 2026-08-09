const fs = require('fs');
const path = require('path');
const multer = require('multer');
const ApiError = require('../utils/ApiError');

// Per the admin spec, every image across the site is a Google Drive link entered
// by the admin, EXCEPT customer review images, which customers upload straight
// from their own device. This is the only place in the app that touches the
// server's local disk for media.
//
// On Vercel serverless, the writable directory is /tmp. On local dev the path
// resolves to the project's uploads/reviews folder as before.
const uploadDir = process.env.VERCEL
  ? '/tmp/uploads/reviews'
  : path.join(__dirname, '..', '..', 'uploads', 'reviews');

fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ['.jpg', '.jpeg', '.png', '.webp'].includes(ext) ? ext : '.jpg';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}${safeExt}`;
    cb(null, unique);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowed.includes(file.mimetype)) {
    return cb(new ApiError(400, 'Only JPG, PNG, or WEBP images are allowed'));
  }
  cb(null, true);
};

const uploadReviewImage = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 },
}).single('image');

module.exports = uploadReviewImage;
