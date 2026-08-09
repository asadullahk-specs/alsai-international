const path = require('path');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const morgan = require('morgan');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const { corsOptions, xssSanitize, generalLimiter, mediaLimiter } = require('./middleware/security');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const routes = require('./routes');
const mediaRoutes = require('./routes/mediaRoutes');

const app = express();

// Needed so req.ip / rate-limit / secure cookies behave correctly behind a reverse proxy (Render, Heroku, Nginx, etc.)
app.set('trust proxy', 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());
app.use(compression());
app.use(mongoSanitize());
app.use(hpp());
app.use(xssSanitize);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "AL SA'I API is running" });
});

// Static/media serving is mounted BEFORE the general API rate limiter: a
// single page can render dozens of images (shop grid, hero slider, gallery),
// and those requests shouldn't eat into the same 300-per-15-min budget as
// actual API calls (cart, auth, admin actions, etc).
//
// Customer-uploaded review photos, stored directly on this server's disk.
app.use('/uploads/reviews', express.static(path.join(__dirname, '..', 'uploads', 'reviews')));

// Every other image/video across the site is a Google Drive share link
// entered by the admin. This resolves + caches those links to local disk on
// first request and serves the cached copy after that, so display doesn't
// depend on Google's hotlinking endpoints staying reachable (see
// src/utils/driveMedia.js for why that matters).
app.use('/api/media', mediaLimiter, mediaRoutes);

app.use(generalLimiter);

app.use('/api', routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
