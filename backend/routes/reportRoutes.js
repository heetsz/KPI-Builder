const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');

// Report generation routes
router.get('/company/:companyId', reportController.generateCompanyReport);
router.get('/insight/:insightId', reportController.getInsightPDF);

module.exports = router;