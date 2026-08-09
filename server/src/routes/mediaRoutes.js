const express = require('express');
const { getDriveMedia } = require('../controllers/mediaController');

const router = express.Router();

router.get('/:fileId', getDriveMedia);

module.exports = router;
