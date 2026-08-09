const express = require('express');
const { getLayout } = require('../controllers/layoutController');

const router = express.Router();

router.get('/', getLayout);

module.exports = router;
