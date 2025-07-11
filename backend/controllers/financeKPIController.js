const FinanceKPI = require('../models/financeKPIModel');
const { parseCSVFile, parseInlineCSV, transformRow, saveKPIData } = require('../services/commonServices');


/**
* Upload Finance KPI Controller
*/
exports.uploadFinanceKPIFromCSV = async (req, res) => {
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

   const result = await saveKPIData(FinanceKPI, companyId, processedData, 'finance');

   return res.status(200).json({
     message: 'Finance KPIs processed and uploaded successfully',
     data: result
   });

 } catch (error) {
   console.error('Finance KPI upload error:', error);
   res.status(500).json({ message: 'Internal server error: ' + error.message });
 }
};

exports.createDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.body;
    const defaultLayout = {
      lg: [],
      md: [],
      sm: []
    };

    const newLayout = new FinanceKPI({
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

// Create new Finance KPIs for a company
exports.createFinanceKPI = async (req, res) => {
  try {
    const { companyId, companyName, selectedKPIs, kpis } = req.body;

    const newFinanceKPI = new FinanceKPI({ companyId, companyName, selectedKPIs, kpis });
    await newFinanceKPI.save();
    res.status(201).json({ message: 'Finance KPI data added successfully', newFinanceKPI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Finance KPIs for a company
exports.updateFinanceKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const financeKpi = await FinanceKPI.findOneAndUpdate({ companyId }, updatedData, { new: true });
    if (!financeKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Finance KPI data updated successfully', financeKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Finance KPIs for a company
exports.deleteFinanceKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const financeKpi = await FinanceKPI.findOneAndDelete({ companyId });
    if (!financeKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Finance KPI data deleted successfully', financeKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFinanceKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const financeKpi = await FinanceKPI.findOne({ companyId });
    if (!financeKpi) {
      // Create a new document with default values if none exists
      const newFinanceKPI = new FinanceKPI({
        companyId,
        department: 'finance',
        selectedKPIs: [],
        data: [],
        dashboardLayout: {
          lg: [],
          md: [],
          sm: []
        }
      });
      await newFinanceKPI.save();
      return res.status(200).json({
        selectedKPIs: [],
        kpis: {}
      });
    }

    // Format data for charts using the utility function
    const { formatChartData } = require('../services/kpiProcessor');
    const chartData = formatChartData(financeKpi.data);

    // Return data in the format expected by frontend
    res.status(200).json({
      selectedKPIs: financeKpi.selectedKPIs,
      kpis: chartData
    });
  } catch (error) {
    console.error('Error fetching Finance KPI data:', error);
    res.status(500).json({ message: error.message });
  }
};

// // Get all
// exports.getAllFinanceKPIs = async (req, res) => {
//   try {
//     const data = await FinanceKPI.find();
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// // Get by company
// exports.getFinanceKPIByCompany = async (req, res) => {
//   try {
//     const data = await FinanceKPI.findOne({ companyId: req.params.companyId });
//     if (!data) return res.status(404).json({ message: 'Not found' });
//     res.status(200).json(data);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// Get dashboard layout
exports.getDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await FinanceKPI.findOne(
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
    // console.log("Here in saveDashboardLayout");
    const { companyId } = req.params;
    const { layout } = req.body;

    // Validate layout data
    if (!layout || !layout.lg || !Array.isArray(layout.lg)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid layout data'
      });
    }

    const result = await FinanceKPI.findOneAndUpdate(
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

    const result = await FinanceKPI.findOneAndUpdate(
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
    const result = await FinanceKPI.findOneAndUpdate(
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
    const result = await FinanceKPI.findOneAndUpdate(
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

    const result = await FinanceKPI.findOne(
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

    const result = await FinanceKPI.findOneAndUpdate(
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
    const document = await FinanceKPI.findOne({ companyId });

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

    const result = await FinanceKPI.findOneAndUpdate(
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

    const result = await FinanceKPI.findOneAndUpdate(
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

// exports.getFinanceKPIById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const kpi = await FinanceKPI.findById(id);

//     if (!kpi) {
//       return res.status(404).json({ message: 'KPI not found' });
//     }

//     res.status(200).json(kpi);
//   } catch (error) {
//     console.error('Error fetching KPI by ID:', error);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };