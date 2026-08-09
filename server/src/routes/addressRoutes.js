const express = require('express');
const controller = require('../controllers/addressController');
const protectCustomer = require('../middleware/customerAuth');

const router = express.Router();

router.use(protectCustomer);

router.get('/', controller.listAddresses);
router.post('/', controller.createAddress);
router.put('/:id', controller.updateAddress);
router.delete('/:id', controller.deleteAddress);
router.patch('/:id/default', controller.setDefaultAddress);

module.exports = router;
