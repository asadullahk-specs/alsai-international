const express = require('express');
const controller = require('../controllers/adminEmailTemplateController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/', authorize('settings', 'view'), controller.listTemplates);
router.get('/:key', authorize('settings', 'view'), controller.getTemplate);
router.put('/:key', authorize('settings', 'edit'), controller.updateTemplate);
router.post('/:key/reset', authorize('settings', 'edit'), controller.resetTemplate);

module.exports = router;
