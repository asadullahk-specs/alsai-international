const express = require('express');
const { listGiftSets, getGiftSetBySlug } = require('../controllers/giftSetController');

const router = express.Router();

router.get('/', listGiftSets);
router.get('/:slug', getGiftSetBySlug);

module.exports = router;
