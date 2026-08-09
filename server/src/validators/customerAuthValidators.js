const { body } = require('express-validator');
const passwordRules = require('./passwordRules');

exports.registerValidator = [
  body('fullName').trim().notEmpty().withMessage('Full name is required').isLength({ min: 2, max: 80 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{7,20}$/)
    .withMessage('Enter a valid phone number'),
  body('cnic')
    .trim()
    .notEmpty()
    .withMessage('CNIC is required')
    .matches(/^\d{5}-\d{7}-\d{1}$/)
    .withMessage('Enter a valid CNIC in the format 12345-1234567-1'),
  body('gender')
    .trim()
    .notEmpty()
    .withMessage('Gender is required')
    .isIn(['male', 'female', 'other'])
    .withMessage('Select a valid gender'),
  body('dob')
    .notEmpty()
    .withMessage('Date of birth is required')
    .isISO8601()
    .withMessage('Enter a valid date of birth')
    .custom((value) => new Date(value) < new Date())
    .withMessage('Date of birth cannot be in the future'),
  passwordRules('password'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];

exports.loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

exports.forgotPasswordValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
];

exports.resetPasswordValidator = [
  passwordRules('password'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password)
    .withMessage('Passwords do not match'),
];
