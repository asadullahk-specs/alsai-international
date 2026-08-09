const express = require('express');
const controller = require('../controllers/adminAuthController');
const protectAdmin = require('../middleware/adminAuth');
const validate = require('../middleware/validate');
const verifyCsrf = require('../middleware/csrf');
const { authLimiter } = require('../middleware/security');
const {
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/adminAuthValidators');

const router = express.Router();

router.post('/login', authLimiter, loginValidator, validate, controller.login);
router.post('/refresh', verifyCsrf('csrf_admin_token'), controller.refresh);
router.post('/logout', verifyCsrf('csrf_admin_token'), controller.logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, controller.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, controller.resetPassword);
router.get('/me', protectAdmin, controller.getMe);

module.exports = router;
