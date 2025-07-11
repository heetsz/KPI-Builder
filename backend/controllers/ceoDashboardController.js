const Finance = require('../models/financeKPIModel');
const SaaS = require('../models/saasKPIModel');
const Sales = require('../models/salesKPIModel');
const CustomerGrowth = require('../models/customerGrowthKPIModel');
const Manufacturing = require('../models/manufacturingKPIModel');
const Marketing = require('../models/marketingKPIModel');
const Operations = require('../models/operationsKPIModel');
const Production = require('../models/productionKPIModel');
const { formatChartData } = require('../services/kpiProcessor');

exports.createDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.body;
    const defaultLayout = {
      lg: [],
      md: [],
      sm: []
    };

    // Find and update layouts in all KPI collections
    const updatePromises = [
      Finance, SaaS, Sales, CustomerGrowth,
      Manufacturing, Marketing, Operations, Production
    ].map(Model => 
      Model.findOneAndUpdate(
        { companyId },
        { $set: { dashboardLayout: defaultLayout } },
        { upsert: true, new: true }
      )
    );

    await Promise.all(updatePromises);
  
    res.status(201).json({
      message: 'CEO Dashboard layouts created successfully',
      layout: defaultLayout
    });
  } catch (error) {
    console.error('Error creating CEO dashboard layouts:', error);
    res.status(500).json({
      message: 'Server error while creating dashboard layouts',
      error: error.message
    });
  }
};

exports.getCEODashboard = async (req, res) => {
  try {
    const { companyId } = req.params;

    // Fetch all department KPIs in parallel
    const [
      financeKPIs,
      saasKPIs,
      salesKPIs,
      customerKPIs,
      manufacturingKPIs,
      marketingKPIs,
      operationsKPIs,
      productionKPIs
    ] = await Promise.all([
      Finance.findOne({ companyId }),
      SaaS.findOne({ companyId }),
      Sales.findOne({ companyId }),
      CustomerGrowth.findOne({ companyId }),
      Manufacturing.findOne({ companyId }),
      Marketing.findOne({ companyId }),
      Operations.findOne({ companyId }),
      Production.findOne({ companyId })
    ]);

    // Format chart data for each department
    const dashboardData = {
      kpis: {
        finance: financeKPIs ? formatChartData(financeKPIs.data) : {},
        saas: saasKPIs ? formatChartData(saasKPIs.data) : {},
        sales: salesKPIs ? formatChartData(salesKPIs.data) : {},
        customerGrowth: customerKPIs ? formatChartData(customerKPIs.data) : {},
        manufacturing: manufacturingKPIs ? formatChartData(manufacturingKPIs.data) : {},
        marketing: marketingKPIs ? formatChartData(marketingKPIs.data) : {},
        operations: operationsKPIs ? formatChartData(operationsKPIs.data) : {},
        production: productionKPIs ? formatChartData(productionKPIs.data) : {}
      },
      selectedKPIs: {
        finance: financeKPIs?.selectedKPIs || [],
        saas: saasKPIs?.selectedKPIs || [],
        sales: salesKPIs?.selectedKPIs || [],
        customerGrowth: customerKPIs?.selectedKPIs || [],
        manufacturing: manufacturingKPIs?.selectedKPIs || [],
        marketing: marketingKPIs?.selectedKPIs || [],
        operations: operationsKPIs?.selectedKPIs || [],
        production: productionKPIs?.selectedKPIs || []
      },
      layouts: {
        finance: financeKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        saas: saasKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        sales: salesKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        customerGrowth: customerKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        manufacturing: manufacturingKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        marketing: marketingKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        operations: operationsKPIs?.dashboardLayout || { lg: [], md: [], sm: [] },
        production: productionKPIs?.dashboardLayout || { lg: [], md: [], sm: [] }
      }
    };

    res.status(200).json({ success: true, data: dashboardData });
  } catch (error) {
    console.error('Error fetching CEO dashboard:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.saveDashboardLayouts = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { layouts } = req.body;

    // Validate layout data
    if (!layouts) {
      return res.status(400).json({
        success: false,
        message: 'Invalid layout data'
      });
    }

    // Update layouts for each department
    const updatePromises = [];
    for (const [dept, layout] of Object.entries(layouts)) {
      let Model;
      switch (dept) {
        case 'finance': Model = Finance; break;
        case 'saas': Model = SaaS; break;
        case 'sales': Model = Sales; break;
        case 'customerGrowth': Model = CustomerGrowth; break;
        case 'manufacturing': Model = Manufacturing; break;
        case 'marketing': Model = Marketing; break;
        case 'operations': Model = Operations; break;
        case 'production': Model = Production; break;
        default: continue;
      }

      updatePromises.push(
        Model.findOneAndUpdate(
          { companyId },
          { $set: { dashboardLayout: layout } },
          { new: true, upsert: true }
        )
      );
    }

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'CEO Dashboard layouts saved successfully'
    });
  } catch (error) {
    console.error('Error saving CEO dashboard layouts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving dashboard layouts',
      error: error.message
    });
  }
};

exports.resetDashboardLayouts = async (req, res) => {
  try {
    const { companyId } = req.params;

    const updatePromises = [
      Finance, SaaS, Sales, CustomerGrowth,
      Manufacturing, Marketing, Operations, Production
    ].map(Model => 
      Model.findOneAndUpdate(
        { companyId },
        { $set: { dashboardLayout: { lg: [], md: [], sm: [] } } },
        { new: true }
      )
    );

    await Promise.all(updatePromises);

    return res.status(200).json({
      success: true,
      message: 'CEO Dashboard layouts reset successfully'
    });
  } catch (error) {
    console.error('Error resetting CEO dashboard layouts:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting dashboard layouts',
      error: error.message
    });
  }
};
