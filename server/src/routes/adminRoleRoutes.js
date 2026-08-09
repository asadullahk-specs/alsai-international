const express = require('express');
const roleController = require('../controllers/adminRoleController');
const userController = require('../controllers/adminUserController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();
router.use(protectAdmin);

router.get('/roles', authorize('users', 'view'), roleController.listRoles);
router.post('/roles', authorize('users', 'create'), roleController.createRole);
router.put('/roles/:id', authorize('users', 'edit'), roleController.updateRole);
router.delete('/roles/:id', authorize('users', 'delete'), roleController.deleteRole);

router.get('/admins', authorize('users', 'view'), userController.listAdmins);
router.post('/admins', authorize('users', 'create'), userController.createAdmin);
router.put('/admins/:id', authorize('users', 'edit'), userController.updateAdmin);
router.delete('/admins/:id', authorize('users', 'delete'), userController.deleteAdmin);

module.exports = router;
