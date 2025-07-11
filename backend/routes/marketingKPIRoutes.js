const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const marketingKPIController = require('../controllers/marketingKPIController');

const upload = multer({ dest: 'uploads/' });

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Marketing.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', marketingKPIController.createDashboardLayout);

// Upload KPI data
router.post('/upload', upload.single('file'), marketingKPIController.uploadMarketingKPIFromCSV);

// Update Marketing KPIs for a company
router.put('/update/:companyId', marketingKPIController.updateMarketingKPI);

// Delete Marketing KPIs for a company
router.delete('/delete/:companyId', marketingKPIController.deleteMarketingKPI);

// Get Marketing KPIs for a company
router.get('/:companyId', marketingKPIController.getMarketingKPI);

// Upload CSV and process the data for Marketing KPIs
router.post('/upload', upload.single('file'), marketingKPIController.uploadMarketingKPIFromCSV);

// Dashboard layout routes
router.get('/:companyId/layout', marketingKPIController.getDashboardLayout);
router.put('/:companyId/layout', marketingKPIController.saveDashboardLayout);
router.delete('/:companyId/layout', marketingKPIController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', marketingKPIController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', marketingKPIController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', marketingKPIController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', marketingKPIController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', marketingKPIController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', marketingKPIController.resetChartConfigurations);

module.exports = router;