const express = require('express');
const router = express.Router();
const flaskController = require('../controllers/flaskController');

// Route to generate insights using Flask API
router.post('/generate-insights/:companyId', flaskController.generateInsights);

module.exports = router;