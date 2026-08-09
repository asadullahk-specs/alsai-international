const express = require('express');
const { listSeasonalCollections } = require('../controllers/seasonalCollectionController');

const router = express.Router();

router.get('/', listSeasonalCollections);

module.exports = router;
