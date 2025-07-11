const express = require('express');
const router = express.Router();
const ceoDashboardController = require('../controllers/ceoDashboardController');

router.get('/:companyId', ceoDashboardController.getDashboard);

module.exports = router;
