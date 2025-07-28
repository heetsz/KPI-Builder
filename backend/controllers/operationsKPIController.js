const OperationsKPI = require('../models/operationsKPIModel');
const { parseCSVFile, parseInlineCSV, transformRow, saveKPIData } = require('../services/commonServices');

// Generate dummy operations data for demonstration
const generateDummyOperationsData = () => {
  const months = [
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01',
    '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01'
  ];

  const kpiData = [];

  months.forEach((month, index) => {
    const metrics = new Map();
    
    // Generate realistic operations KPI data with trends
    metrics.set('orderFulfillmentTime', Math.round((72 + Math.random() * 48 - index * 2) * 100) / 100); // 72-120 hours, decreasing
    metrics.set('inventoryTurnover', Math.round((8 + Math.random() * 4 + index * 0.2) * 100) / 100); // 8-12 times, improving
    metrics.set('stockOutRate', Math.round((5 + Math.random() * 3 - index * 0.1) * 100) / 100); // 5-8%, decreasing
    metrics.set('orderAccuracyRate', Math.round((94 + Math.random() * 5 + index * 0.1) * 100) / 100); // 94-99%
    metrics.set('supplyChainCycleTime', Math.round(14 + Math.random() * 7 - index * 0.3)); // 14-21 days, decreasing
    metrics.set('warehouseUtilizationRate', Math.round((75 + Math.random() * 15 + index * 0.5) * 100) / 100); // 75-90%
    metrics.set('logisticsCostPerUnit', Math.round((12 + Math.random() * 8 - index * 0.2) * 100) / 100); // $12-20, decreasing
    metrics.set('returnRate', Math.round((3 + Math.random() * 4 - index * 0.1) * 100) / 100); // 3-7%, decreasing
    metrics.set('procurementCycleTime', Math.round(10 + Math.random() * 8 - index * 0.3)); // 10-18 days, decreasing
    metrics.set('forecastAccuracy', Math.round((82 + Math.random() * 12 + index * 0.3) * 100) / 100); // 82-94%

    kpiData.push({
      date: new Date(month),
      department: 'operations',
      metrics: metrics
    });
  });

  return kpiData;
};

/**
* Upload Operations KPI Controller
*/
exports.uploadOperationsKPIFromCSV = async (req, res) => {
 try {
   const { companyId } = req.body;
   if (!companyId) {
     return res.status(400).json({ message: 'Company ID is required' });
   }

   let processedData = [];

   if (req.file?.path) {
     console.log('Parsing file from disk:', req.file.path);
     processedData = await parseCSVFile(req.file.path);
   } else if (req.body.fileData) {
     console.log('Parsing inline CSV data from request body');
     processedData = parseInlineCSV(req.body.fileData);
   } else {
     return res.status(400).json({ message: 'No file or file data provided' });
   }

   if (!processedData.length) {
     return res.status(400).json({ message: 'No valid KPI data found in the file' });
   }

   const result = await saveKPIData(OperationsKPI, companyId, processedData, 'Operations');

   return res.status(200).json({
     message: 'Operations KPIs processed and uploaded successfully',
     data: result
   });

 } catch (error) {
   console.error('Operations KPI upload error:', error);
   res.status(500).json({ message: 'Internal server error: ' + error.message });
 }
};

// Controller to create the dashboard layout which receives just the company Id and default layout
exports.createDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.body;
    const defaultLayout = {
      lg: [],
      md: [],
      sm: []
    };

    const newLayout = new OperationsKPI({
      companyId,
      dashboardLayout: defaultLayout
    });

    await newLayout.save();
    res.status(201).json({
      message: 'Dashboard layout created successfully',
      layout: defaultLayout
    });
  } catch (error) {
    console.error('Error creating dashboard layout:', error);
    res.status(500).json({
      message: 'Server error while creating dashboard layout',
      error: error.message
    });
  }
};

// Create new Operations KPIs for a company
exports.createOperationsKPI = async (req, res) => {
  try {
    const { companyId, companyName, selectedKPIs, kpis } = req.body;

    const newOperationsKPI = new OperationsKPI({ companyId, companyName, selectedKPIs, kpis });
    await newOperationsKPI.save();
    res.status(201).json({ message: 'Operations KPI data added successfully', newOperationsKPI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Operations KPIs for a company
exports.updateOperationsKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const operationsKpi = await OperationsKPI.findOneAndUpdate({ companyId }, updatedData, { new: true });
    if (!operationsKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Operations KPI data updated successfully', operationsKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Operations KPIs for a company
exports.deleteOperationsKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const operationsKpi = await OperationsKPI.findOneAndDelete({ companyId });
    if (!operationsKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Operations KPI data deleted successfully', operationsKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Operations KPIs for a company
exports.getOperationsKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const operationsKpi = await OperationsKPI.findOne({ companyId });
    if (!operationsKpi || !operationsKpi.data || operationsKpi.data.length === 0) {
      // Generate dummy data for demonstration
      const dummyData = generateDummyOperationsData();
      
      const newOperationsKPI = new OperationsKPI({
        companyId,
        department: 'operations',
        selectedKPIs: [
          'orderFulfillmentTime',
          'inventoryTurnover',
          'stockOutRate',
          'orderAccuracyRate',
          'supplyChainCycleTime',
          'warehouseUtilizationRate',
          'logisticsCostPerUnit',
          'returnRate',
          'procurementCycleTime',
          'forecastAccuracy'
        ],
        data: dummyData,
        dashboardLayout: {
          lg: [],
          md: [],
          sm: []
        }
      });
      await newOperationsKPI.save();
      
      const { formatChartData } = require('../services/kpiProcessor');
      const chartData = formatChartData(dummyData);
      
      return res.status(200).json({
        selectedKPIs: newOperationsKPI.selectedKPIs,
        kpis: chartData
      });
    }

    const { formatChartData } = require('../services/kpiProcessor');
    const chartData = formatChartData(operationsKpi.data);

    res.status(200).json({
      selectedKPIs: operationsKpi.selectedKPIs,
      kpis: chartData
    });
  } catch (error) {
    console.error('Error fetching Operations KPI data:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get dashboard layout
exports.getDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await OperationsKPI.findOne(
      { companyId },
      { dashboardLayout: 1, _id: 0 }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!result.dashboardLayout) {
      return res.status(200).json({
        success: true,
        message: 'Dashboard layout not found, returning default layout',
        layout: {
          lg: [],
          md: [],
          sm: []
        }
      });
    }

    return res.status(200).json({
      success: true,
      layout: result.dashboardLayout
    });
  } catch (error) {
    console.error('Error fetching dashboard layout:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard layout',
      error: error.message
    });
  }
};

// Save dashboard layout
exports.saveDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { layout } = req.body;

    if (!layout || !layout.lg || !Array.isArray(layout.lg)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid layout data'
      });
    }

    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $set: { dashboardLayout: layout } },
      { new: true, upsert: true, projection: { dashboardLayout: 1, _id: 0 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Dashboard layout saved successfully',
      layout: result.dashboardLayout
    });
  } catch (error) {
    console.error('Error saving dashboard layout:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving dashboard layout',
      error: error.message
    });
  }
};

// Reset dashboard layout
exports.resetDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $unset: { dashboardLayout: "" } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Dashboard layout reset successfully'
    });
  } catch (error) {
    console.error('Error resetting dashboard layout:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting dashboard layout',
      error: error.message
    });
  }
};

// New function to select a KPI
exports.selectKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { kpiId } = req.body;
    
    if (!kpiId) {
      return res.status(400).json({
        success: false,
        message: 'KPI ID is required'
      });
    }
    
    // Find the document and update the selectedKPIs array
    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $addToSet: { selectedKPIs: kpiId } }, // $addToSet ensures no duplicates
      { new: true, projection: { selectedKPIs: 1, _id: 0 } }
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'KPI selected successfully',
      selectedKPIs: result.selectedKPIs
    });
  } catch (error) {
    console.error('Error selecting KPI:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while selecting KPI',
      error: error.message
    });
  }
};

// New function to deselect a KPI
exports.deselectKPI = async (req, res) => {
  try {
    const { companyId, kpiId } = req.params;
    
    // Find the document and update the selectedKPIs array
    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $pull: { selectedKPIs: kpiId } }, // $pull removes kpiId from the array
      { new: true, projection: { selectedKPIs: 1, _id: 0 } }
    );
    
    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }
    
    return res.status(200).json({
      success: true,
      message: 'KPI deselected successfully',
      selectedKPIs: result.selectedKPIs
    });
  } catch (error) {
    console.error('Error deselecting KPI:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deselecting KPI',
      error: error.message
    });
  }
};

// Get chart configurations
exports.getChartConfigurations = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await OperationsKPI.findOne(
      { companyId },
      { chartConfigurations: 1, _id: 0 }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      chartConfigurations: result.chartConfigurations || []
    });
  } catch (error) {
    console.error('Error fetching chart configurations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while fetching chart configurations',
      error: error.message
    });
  }
};

// Save all chart configurations
exports.saveChartConfigurations = async (req, res) => {
  try {
    const { companyId } = req.params;
    const { chartConfigurations } = req.body;

    // Validate chart configurations data
    if (!chartConfigurations || !Array.isArray(chartConfigurations)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chart configurations data'
      });
    }

    // Ensure each configuration has the required fields
    for (const config of chartConfigurations) {
      if (!config.kpiId || !config.chartType) {
        return res.status(400).json({
          success: false,
          message: 'Each chart configuration must include kpiId and chartType'
        });
      }
    }

    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $set: { chartConfigurations: chartConfigurations } },
      { new: true, projection: { chartConfigurations: 1, _id: 0 } }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chart configurations saved successfully',
      chartConfigurations: result.chartConfigurations
    });
  } catch (error) {
    console.error('Error saving chart configurations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving chart configurations',
      error: error.message
    });
  }
};

// Update a single chart configuration
exports.updateChartConfiguration = async (req, res) => {
  try {
    const { companyId, kpiId } = req.params;
    const { chartType } = req.body;

    if (!chartType) {
      return res.status(400).json({
        success: false,
        message: 'chartType is required'
      });
    }

    // First find the document to check if it exists
    const document = await OperationsKPI.findOne({ companyId });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Check if a configuration for this KPI already exists
    const existingConfigIndex = document.chartConfigurations?.findIndex(
      config => config.kpiId === kpiId
    );

    let updateOperation;
    
    if (existingConfigIndex !== undefined && existingConfigIndex >= 0) {
      // Update existing configuration
      updateOperation = {
        $set: { [`chartConfigurations.${existingConfigIndex}.chartType`]: chartType }
      };
    } else {
      // Add new configuration
      updateOperation = {
        $push: { chartConfigurations: { kpiId, chartType } }
      };
    }

    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      updateOperation,
      { new: true, projection: { chartConfigurations: 1, _id: 0 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Chart configuration updated successfully',
      chartConfigurations: result.chartConfigurations
    });
  } catch (error) {
    console.error('Error updating chart configuration:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while updating chart configuration',
      error: error.message
    });
  }
};

// Reset chart configurations
exports.resetChartConfigurations = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await OperationsKPI.findOneAndUpdate(
      { companyId },
      { $set: { chartConfigurations: [] } },
      { new: true }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Chart configurations reset successfully'
    });
  } catch (error) {
    console.error('Error resetting chart configurations:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while resetting chart configurations',
      error: error.message
    });
  }
};
