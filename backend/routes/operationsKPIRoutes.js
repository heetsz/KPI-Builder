const express = require('express');
const router = express.Router();
const path = require('path');
const operationsKPIController = require('../controllers/operationsKPIController');
const upload = require('../services/csvParser'); // for handling CSV uploads

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Operations.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', operationsKPIController.createDashboardLayout);

// Upload KPI data
router.post('/upload', upload.single('file'), operationsKPIController.uploadOperationsKPIFromCSV);

// Create new Operations KPIs for a company
router.post('/add', operationsKPIController.createOperationsKPI);

// Update Operations KPIs for a company
router.put('/update/:companyId', operationsKPIController.updateOperationsKPI);

// Delete Operations KPIs for a company
router.delete('/delete/:companyId', operationsKPIController.deleteOperationsKPI);

// Get Operations KPIs for a company
router.get('/:companyId', operationsKPIController.getOperationsKPI);

// Dashboard layout routes
router.get('/:companyId/layout', operationsKPIController.getDashboardLayout);
router.put('/:companyId/layout', operationsKPIController.saveDashboardLayout);
router.delete('/:companyId/layout', operationsKPIController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', operationsKPIController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', operationsKPIController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', operationsKPIController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', operationsKPIController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', operationsKPIController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', operationsKPIController.resetChartConfigurations);

module.exports = router;