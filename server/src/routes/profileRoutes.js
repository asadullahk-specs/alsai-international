const express = require('express');
const controller = require('../controllers/profileController');
const protectCustomer = require('../middleware/customerAuth');

const router = express.Router();

router.use(protectCustomer);

router.put('/', controller.updateProfile);
router.put('/password', controller.changePassword);

module.exports = router;
