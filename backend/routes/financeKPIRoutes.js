const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const upload = multer({ dest: 'uploads/' });

const financeKPIController = require('../controllers/financeKPIController');

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Finance.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', financeKPIController.createDashboardLayout);

// Upload KPI data
router.post('/upload', upload.single('file'), financeKPIController.uploadFinanceKPIFromCSV);

// Get KPI data
router.get('/:companyId', financeKPIController.getFinanceKPI);

// Update KPI data
router.put('/:companyId', financeKPIController.updateFinanceKPI);

// Delete KPI data
router.delete('/:companyId', financeKPIController.deleteFinanceKPI);

// Dashboard layout routes
router.get('/:companyId/layout', financeKPIController.getDashboardLayout);
router.put('/:companyId/layout', financeKPIController.saveDashboardLayout);
router.delete('/:companyId/layout', financeKPIController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', financeKPIController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', financeKPIController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', financeKPIController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', financeKPIController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', financeKPIController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', financeKPIController.resetChartConfigurations);

module.exports = router;
