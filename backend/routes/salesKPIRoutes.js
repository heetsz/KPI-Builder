const express = require('express');
const router = express.Router();
const path = require('path');
const salesKPIController = require('../controllers/salesKPIController');
const upload = require('../services/csvParser'); // for handling CSV uploads

// route to download KPI template
router.get('/template/download', salesKPIController.downloadSalesKPITemplate);

// route to create the dashboard layout while initializing the company
router.post('/layout', salesKPIController.createDashboardLayout);

// Upload KPI data
router.post('/upload', upload.single('file'), salesKPIController.uploadSalesKPIFromCSV);

// Update Sales KPIs for a company
router.put('/update/:companyId', salesKPIController.updateSalesKPI);

// Delete Sales KPIs for a company
router.delete('/delete/:companyId', salesKPIController.deleteSalesKPI);

// Get Sales KPIs for a company
router.get('/:companyId', salesKPIController.getSalesKPI);

// Upload CSV for Sales KPIs
router.post('/upload', upload.single('file'), salesKPIController.uploadSalesKPIFromCSV);

// New routes for dashboard layout
router.get('/:companyId/layout', salesKPIController.getDashboardLayout);
router.put('/:companyId/layout', salesKPIController.saveDashboardLayout);
router.delete('/:companyId/layout', salesKPIController.resetDashboardLayout);

// New routes for KPI selection management
router.put('/:companyId/select', salesKPIController.selectKPI);
router.delete('/:companyId/deselect/:KPIId', salesKPIController.deselectKPI);

// New routes for chart configurations
router.get('/:companyId/chartConfigurations', salesKPIController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', salesKPIController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:KPIId', salesKPIController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', salesKPIController.resetChartConfigurations);

module.exports = router;