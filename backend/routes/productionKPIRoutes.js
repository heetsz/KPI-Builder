const express = require('express');
const router = express.Router();
const path = require('path');
const productionKpiController = require('../controllers/productionKPIController');
const upload = require('../services/csvParser'); // for handling CSV uploads

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Production.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', productionKpiController.createDashboardLayout);

// Create new Production KPIs for a company
router.post('/add', productionKpiController.createProductionKPI);

// Update Production KPIs for a company
router.put('/update/:companyId', productionKpiController.updateProductionKPI);

// Delete Production KPIs for a company
router.delete('/delete/:companyId', productionKpiController.deleteProductionKPI);

// Get Production KPIs for a company
router.get('/:companyId', productionKpiController.getProductionKPI);

// Upload CSV for Production KPIs
router.post('/upload', upload.single('file'), productionKpiController.uploadProductionKPIFromCSV);

// Dashboard layout routes
router.get('/:companyId/layout', productionKpiController.getDashboardLayout);
router.put('/:companyId/layout', productionKpiController.saveDashboardLayout);
router.delete('/:companyId/layout', productionKpiController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', productionKpiController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', productionKpiController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', productionKpiController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', productionKpiController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', productionKpiController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', productionKpiController.resetChartConfigurations);

module.exports = router;
