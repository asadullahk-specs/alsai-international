const rateLimit = require('express-rate-limit');
const xss = require('xss');

const corsOptions = {
  origin: (process.env.CLIENT_URL || 'http://localhost:5173').split(','),
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
};

const sanitizeValue = (value) => {
  if (typeof value !== 'string') return value;
  return xss(value, { whiteList: {}, stripIgnoreTag: true, stripIgnoreTagBody: ['script'] });
};

const deepSanitize = (obj) => {
  if (!obj || typeof obj !== 'object') return;
  Object.keys(obj).forEach((key) => {
    const value = obj[key];
    if (value && typeof value === 'object') {
      deepSanitize(value);
    } else {
      obj[key] = sanitizeValue(value);
    }
  });
};

const xssSanitize = (req, res, next) => {
  if (req.body) deepSanitize(req.body);
  if (req.query) deepSanitize(req.query);
  if (req.params) deepSanitize(req.params);
  next();
};

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  message: { success: false, message: 'Too many attempts, please try again later.' },
});

// A single page can render 20-30+ media items (shop grid, hero slider,
// gallery, etc). Cache hits are cheap local disk reads, so this gets a much
// higher ceiling than the general API limiter rather than sharing its budget.
const mediaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});

module.exports = { corsOptions, xssSanitize, generalLimiter, authLimiter, mediaLimiter };
