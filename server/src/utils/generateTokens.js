const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const signAccessToken = (payload, secret, expiresIn) => jwt.sign(payload, secret, { expiresIn });

const verifyToken = (token, secret) => jwt.verify(token, secret);

// Refresh tokens are opaque random values (not JWTs) so they can be revoked
// individually by looking up their hash in the database.
const generateRefreshTokenValue = () => crypto.randomBytes(48).toString('hex');

const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

module.exports = { signAccessToken, verifyToken, generateRefreshTokenValue, hashToken };
