const ApiError = require('../utils/ApiError');

// The refresh/logout cookie is httpOnly, so the browser cannot be tricked into forging
// these requests unless it can also read the matching non-httpOnly CSRF cookie - which
// a cross-site attacker cannot do.
const verifyCsrf = (cookieName) => (req, res, next) => {
  const cookieToken = req.cookies?.[cookieName];
  const headerToken = req.headers['x-csrf-token'];

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    throw new ApiError(403, 'Invalid Credentials');
  }

  next();
};

module.exports = verifyCsrf;
