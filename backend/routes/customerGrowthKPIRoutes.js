const express = require('express');
const router = express.Router();
const path = require('path');
const customerGrowthKpiController = require('../controllers/customerGrowthKPIController');
const upload = require('../services/csvParser'); // for handling CSV uploads

// route to download KPI template
router.get('/template/download', (req, res) => {
  const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Customer_Growth.csv');
  res.download(templatePath);
});

// route to create the dashboard layout while initializing the company
router.post('/layout', customerGrowthKpiController.createDashboardLayout);

// Create new Customer Growth KPIs for a company
router.post('/add', customerGrowthKpiController.createCustomerGrowthKPI);

// Update Customer Growth KPIs for a company
router.put('/update/:companyId', customerGrowthKpiController.updateCustomerGrowthKPI);

// Delete Customer Growth KPIs for a company
router.delete('/delete/:companyId', customerGrowthKpiController.deleteCustomerGrowthKPI);

// Get Customer Growth KPIs for a company
router.get('/:companyId', customerGrowthKpiController.getCustomerGrowthKPI);

// Upload CSV for Customer Growth KPIs
router.post('/upload', upload.single('file'), customerGrowthKpiController.uploadCustomerGrowthKPIFromCSV);

// Dashboard layout routes
router.get('/:companyId/layout', customerGrowthKpiController.getDashboardLayout);
router.put('/:companyId/layout', customerGrowthKpiController.saveDashboardLayout);
router.delete('/:companyId/layout', customerGrowthKpiController.resetDashboardLayout);

// KPI selection management routes
router.put('/:companyId/select', customerGrowthKpiController.selectKPI);
router.delete('/:companyId/deselect/:kpiId', customerGrowthKpiController.deselectKPI);

// Chart configuration routes
router.get('/:companyId/chartConfigurations', customerGrowthKpiController.getChartConfigurations);
router.put('/:companyId/chartConfigurations', customerGrowthKpiController.saveChartConfigurations);
router.put('/:companyId/chartConfiguration/:kpiId', customerGrowthKpiController.updateChartConfiguration);
router.delete('/:companyId/chartConfigurations', customerGrowthKpiController.resetChartConfigurations);

module.exports = router;
