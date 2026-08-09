const express = require('express');
const { getDashboardStats } = require('../controllers/adminDashboardController');
const protectAdmin = require('../middleware/adminAuth');
const authorize = require('../middleware/authorize');

const router = express.Router();

router.get('/', protectAdmin, authorize('dashboard', 'view'), getDashboardStats);

module.exports = router;
