const express = require('express');
const router = express.Router();
const path = require('path');
const controller = require('../controllers/manufacturingKPIController');
const upload = require('../services/csvParser');

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Manufacturing.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', controller.createDashboardLayout);

router.post('/add', controller.createManufacturingKPI);
router.put('/update/:companyId', controller.updateManufacturingKPI);
router.delete('/delete/:companyId', controller.deleteManufacturingKPI);
router.get('/:companyId', controller.getManufacturingKPI);
router.post('/upload', upload.single('file'), controller.uploadManufacturingKPIFromCSV);

// New routes for dashboard layout
router.get('/:companyId/layout', controller.getDashboardLayout);
router.put('/:companyId/layout', controller.saveDashboardLayout);
router.delete('/:companyId/layout', controller.resetDashboardLayout);

// New routes for KPI selection management 
router.put('/:companyId/select', controller.selectKPI);
router.delete('/:companyId/deselect/:kpiId', controller.deselectKPI);

// New routes for chart configurations
router.get('/:companyId/chartConfigurations', controller.getChartConfigurations);
router.put('/:companyId/chartConfigurations', controller.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', controller.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', controller.resetChartConfigurations);

module.exports = router;
