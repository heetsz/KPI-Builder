const express = require('express');
const router = express.Router();
const insightsController = require('../controllers/insightsController');

// Add or update insight (upsert)
router.post('/:companyId', insightsController.addOrUpdateInsight);

// Get insight by companyId
router.get('/:companyId', insightsController.getInsight);

// Delete insight by companyId
router.delete('/:companyId', insightsController.deleteInsight);

module.exports = router;