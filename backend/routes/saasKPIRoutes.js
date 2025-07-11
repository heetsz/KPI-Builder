const express = require('express');
const router = express.Router();
const path = require('path');
const saasKpiController = require('../controllers/saasKPIController');
const upload = require('../services/csvParser');

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_SaaS.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', saasKpiController.createDashboardLayout);

// Create new SaaS KPIs for a company
router.post('/add', saasKpiController.createSaaSKPI);

// Update SaaS KPIs for a company
router.put('/update/:companyId', saasKpiController.updateSaaSKPI);

// Delete SaaS KPIs for a company
router.delete('/delete/:companyId', saasKpiController.deleteSaaSKPI);

// Get SaaS KPIs for a company
router.get('/:companyId', saasKpiController.getSaaSKPI);

// Upload CSV for SaaS KPIs
router.post('/upload', upload.single('file'), saasKpiController.uploadSaaSKPIFromCSV);

// Dashboard layout routes
router.get('/:companyId/layout', saasKpiController.getDashboardLayout);
router.put('/:companyId/layout', saasKpiController.saveDashboardLayout);
router.delete('/:companyId/layout', saasKpiController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', saasKpiController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', saasKpiController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', saasKpiController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', saasKpiController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', saasKpiController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', saasKpiController.resetChartConfigurations);

module.exports = router;
