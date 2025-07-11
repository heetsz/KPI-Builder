const express = require('express');
const router = express.Router();
const companyController = require('../controllers/companyController');
const { verifyToken } = require('../middleware/authMiddleware');

// Public routes
router.post('/login', companyController.loginCompany);
router.post('/register', companyController.createCompany);

// Protected routes
router.use(verifyToken); // Apply auth middleware to all routes below

router.post('/logout/:companyId', companyController.logout);
router.get('/email/:email', companyController.getCompanyByEmail);
router.get('/companyId/:companyId', companyController.getCompanyByCompanyId);

router.put('/:companyId', companyController.updateCompany);

module.exports = router;