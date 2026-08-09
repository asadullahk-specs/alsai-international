const express = require('express');
const controller = require('../controllers/customerAuthController');
const protectCustomer = require('../middleware/customerAuth');
const validate = require('../middleware/validate');
const verifyCsrf = require('../middleware/csrf');
const { authLimiter } = require('../middleware/security');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
} = require('../validators/customerAuthValidators');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, controller.register);
router.post('/login', authLimiter, loginValidator, validate, controller.login);
router.post('/refresh', verifyCsrf('csrf_customer_token'), controller.refresh);
router.post('/logout', verifyCsrf('csrf_customer_token'), controller.logout);
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validate, controller.forgotPassword);
router.post('/reset-password/:token', authLimiter, resetPasswordValidator, validate, controller.resetPassword);
router.get('/me', protectCustomer, controller.getMe);

module.exports = router;
