const MarketingKPI = require('../models/marketingKPIModel');
const { parseCSVFile, parseInlineCSV, transformRow, saveKPIData } = require('../services/commonServices');

/**
* Upload Marketing KPI Controller
*/
exports.uploadMarketingKPIFromCSV = async (req, res) => {
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

   const result = await saveKPIData(MarketingKPI, companyId, processedData, 'Marketing');

   return res.status(200).json({
     message: 'Marketing KPIs processed and uploaded successfully',
     data: result
   });

 } catch (error) {
   console.error('Marketing KPI upload error:', error);
   res.status(500).json({ message: 'Internal server error: ' + error.message });
 }
};

// Controller to create the dashboard layout which receives just the company Id and default layout
exports.createDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.body;
    const defaultLayout = {
      lg: [], // Default empty layout for large screens
      md: [], // Default empty layout for medium screens
      sm: []  // Default empty layout for small screens
    };

    const newLayout = new MarketingKPI({
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

// Create new Marketing KPIs for a company
exports.createMarketingKPI = async (req, res) => {
  try {
    const { companyId, companyName, selectedKPIs, kpis } = req.body;

    const newMarketingKPI = new MarketingKPI({ companyId, companyName, selectedKPIs, kpis });
    await newMarketingKPI.save();
    res.status(201).json({ message: 'Marketing KPI data added successfully', newMarketingKPI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Marketing KPIs for a company
exports.updateMarketingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const marketingKpi = await MarketingKPI.findOneAndUpdate({ companyId }, updatedData, { new: true });
    if (!marketingKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Marketing KPI data updated successfully', marketingKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Marketing KPIs for a company
exports.deleteMarketingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const marketingKpi = await MarketingKPI.findOneAndDelete({ companyId });
    if (!marketingKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Marketing KPI data deleted successfully', marketingKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Marketing KPIs for a company
exports.getMarketingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const marketingKpi = await MarketingKPI.findOne({ companyId });
    if (!marketingKpi) {
      // Create a new document with default values if none exists
      const newMarketingKPI = new MarketingKPI({
        companyId,
        department: 'marketing',
        selectedKPIs: [],
        data: [],
        dashboardLayout: {
          lg: [],
          md: [],
          sm: []
        }
      });
      await newMarketingKPI.save();
      return res.status(200).json({
        selectedKPIs: [],
        kpis: {}
      });
    }

    // Format data for charts using the utility function
    const { formatChartData } = require('../services/kpiProcessor');
    const chartData = formatChartData(marketingKpi.data);

    // Return data in the format expected by frontend
    res.status(200).json({
      selectedKPIs: marketingKpi.selectedKPIs,
      kpis: chartData
    });
  } catch (error) {
    console.error('Error fetching Marketing KPI data:', error);
    res.status(500).json({ message: error.message });
  }
};
// Get dashboard layout
exports.getDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await MarketingKPI.findOne(
      { companyId },
      { dashboardLayout: 1, _id: 0 }
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // If dashboardLayout is not present, return a default layout
    if (!result.dashboardLayout) {
      return res.status(200).json({
        success: true,
        message: 'Dashboard layout not found, returning default layout',
        layout: {
          lg: [], // Default empty layout for large screens
          md: [], // Default empty layout for medium screens
          sm: []  // Default empty layout for small screens
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

    // Validate layout data
    if (!layout || !layout.lg || !Array.isArray(layout.lg)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid layout data'
      });
    }

    const result = await MarketingKPI.findOneAndUpdate(
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

    const result = await MarketingKPI.findOneAndUpdate(
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

// New function to select a Marketing KPI
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
    const result = await MarketingKPI.findOneAndUpdate(
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
      message: 'Marketing KPI selected successfully',
      selectedKPIs: result.selectedKPIs
    });
  } catch (error) {
    console.error('Error selecting Marketing KPI:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while selecting Marketing KPI',
      error: error.message
    });
  }
};

// New function to deselect a Marketing KPI
exports.deselectKPI = async (req, res) => {
  try {
    const { companyId, kpiId } = req.params;
    
    // Find the document and update the selectedKPIs array
    const result = await MarketingKPI.findOneAndUpdate(
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
      message: 'Marketing KPI deselected successfully',
      selectedKPIs: result.selectedKPIs
    });
  } catch (error) {
    console.error('Error deselecting Marketing KPI:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while deselecting Marketing KPI',
      error: error.message
    });
  }
};

// Get chart configurations
exports.getChartConfigurations = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await MarketingKPI.findOne(
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

    const result = await MarketingKPI.findOneAndUpdate(
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
    const document = await MarketingKPI.findOne({ companyId });

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

    const result = await MarketingKPI.findOneAndUpdate(
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

    const result = await MarketingKPI.findOneAndUpdate(
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
