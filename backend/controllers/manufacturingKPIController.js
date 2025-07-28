const ManufacturingKPI = require('../models/manufacturingKPIModel');
const { parseCSVFile, parseInlineCSV, transformRow, saveKPIData } = require('../services/commonServices');

// Generate dummy manufacturing data for demonstration
const generateDummyManufacturingData = () => {
  const months = [
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01',
    '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01'
  ];

  const kpiData = [];

  months.forEach((month, index) => {
    const metrics = new Map();
    
    // Generate realistic manufacturing KPI data with trends
    metrics.set('productionVolume', Math.round(8000 + Math.random() * 4000 + index * 200)); // 8k-12k units, growing
    metrics.set('oee', Math.round((72 + Math.random() * 15 + index * 0.5) * 100) / 100); // 72-87% OEE, improving
    metrics.set('cycleTime', Math.round((45 + Math.random() * 20 - index * 0.8) * 100) / 100); // 45-65 minutes, decreasing
    metrics.set('downtime', Math.round((8 + Math.random() * 6 - index * 0.3) * 100) / 100); // 8-14%, decreasing
    metrics.set('yield', Math.round((92 + Math.random() * 6 + index * 0.2) * 100) / 100); // 92-98%, improving
    metrics.set('scrapRate', Math.round((3 + Math.random() * 4 - index * 0.15) * 100) / 100); // 3-7%, decreasing
    metrics.set('defectDensity', Math.round((15 + Math.random() * 10 - index * 0.5) * 100) / 100); // 15-25 defects/1000, decreasing
    metrics.set('maintenanceCostPerUnit', Math.round((8 + Math.random() * 6 - index * 0.2) * 100) / 100); // $8-14, decreasing
    metrics.set('inventoryTurnover', Math.round((10 + Math.random() * 6 + index * 0.3) * 100) / 100); // 10-16 times, improving
    metrics.set('energyConsumptionPerUnit', Math.round((12 + Math.random() * 8 - index * 0.3) * 100) / 100); // 12-20 kWh, decreasing

    kpiData.push({
      date: new Date(month),
      department: 'manufacturing',
      metrics: metrics
    });
  });

  return kpiData;
};

/**
* Upload Manufacturing KPI Controller
*/
exports.uploadManufacturingKPIFromCSV = async (req, res) => {
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

   const result = await saveKPIData(ManufacturingKPI, companyId, processedData, 'Manufacturing');

   return res.status(200).json({
     message: 'Manufacturing KPIs processed and uploaded successfully',
     data: result
   });

 } catch (error) {
   console.error('Manufacturing KPI upload error:', error);
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

    const newLayout = new ManufacturingKPI({
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

// Create new Manufacturing KPIs for a company
exports.createManufacturingKPI = async (req, res) => {
  try {
    const { companyId, companyName, selectedKPIs, kpis } = req.body;

    const newManufacturingKPI = new ManufacturingKPI({ companyId, companyName, selectedKPIs, kpis });
    await newManufacturingKPI.save();
    res.status(201).json({ message: 'Manufacturing KPI data added successfully', newManufacturingKPI });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Manufacturing KPIs for a company
exports.updateManufacturingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const manufacturingKpi = await ManufacturingKPI.findOneAndUpdate({ companyId }, updatedData, { new: true });
    if (!manufacturingKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Manufacturing KPI data updated successfully', manufacturingKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Manufacturing KPIs for a company
exports.deleteManufacturingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const manufacturingKpi = await ManufacturingKPI.findOneAndDelete({ companyId });
    if (!manufacturingKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Manufacturing KPI data deleted successfully', manufacturingKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getManufacturingKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const manufacturingKpi = await ManufacturingKPI.findOne({ companyId });
    if (!manufacturingKpi || !manufacturingKpi.data || manufacturingKpi.data.length === 0) {
      // Generate dummy data for demonstration
      const dummyData = generateDummyManufacturingData();
      
      // Create a new document with dummy data if none exists
      const newManufacturingKPI = new ManufacturingKPI({
        companyId,
        department: 'manufacturing',
        selectedKPIs: [
          'productionVolume',
          'oee',
          'cycleTime',
          'downtime',
          'yield',
          'scrapRate',
          'defectDensity',
          'maintenanceCostPerUnit',
          'inventoryTurnover',
          'energyConsumptionPerUnit'
        ],
        data: dummyData,
        dashboardLayout: {
          lg: [],
          md: [],
          sm: []
        }
      });
      await newManufacturingKPI.save();
      
      // Format data for charts using the utility function
      const { formatChartData } = require('../services/kpiProcessor');
      const chartData = formatChartData(dummyData);
      
      return res.status(200).json({
        selectedKPIs: newManufacturingKPI.selectedKPIs,
        kpis: chartData
      });
    }

    // Format data for charts using the utility function
    const { formatChartData } = require('../services/kpiProcessor');
    const chartData = formatChartData(manufacturingKpi.data);

    // Return data in the format expected by frontend
    res.status(200).json({
      selectedKPIs: manufacturingKpi.selectedKPIs,
      kpis: chartData
    });
  } catch (error) {
    console.error('Error fetching Manufacturing KPI data:', error);
    res.status(500).json({ message: error.message });
  }
};


// Get dashboard layout
exports.getDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await ManufacturingKPI.findOne(
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

    const result = await ManufacturingKPI.findOneAndUpdate(
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

    const result = await ManufacturingKPI.findOneAndUpdate(
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
    
    const result = await ManufacturingKPI.findOneAndUpdate(
      { companyId },
      { $addToSet: { selectedKPIs: kpiId } },
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
    
    const result = await ManufacturingKPI.findOneAndUpdate(
      { companyId },
      { $pull: { selectedKPIs: kpiId } },
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

    const result = await ManufacturingKPI.findOne(
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

    if (!chartConfigurations || !Array.isArray(chartConfigurations)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid chart configurations data'
      });
    }

    for (const config of chartConfigurations) {
      if (!config.kpiId || !config.chartType) {
        return res.status(400).json({
          success: false,
          message: 'Each chart configuration must include kpiId and chartType'
        });
      }
    }

    const result = await ManufacturingKPI.findOneAndUpdate(
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

    const document = await ManufacturingKPI.findOne({ companyId });
    
    if (!document) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const existingConfigIndex = document.chartConfigurations?.findIndex(
      config => config.kpiId === kpiId
    );

    let updateOperation;
    
    if (existingConfigIndex !== undefined && existingConfigIndex >= 0) {
      updateOperation = {
        $set: {
          [`chartConfigurations.${existingConfigIndex}.chartType`]: chartType
        }
      };
    } else {
      updateOperation = {
        $push: {
          chartConfigurations: { kpiId, chartType }
        }
      };
    }

    const result = await ManufacturingKPI.findOneAndUpdate(
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

    const result = await ManufacturingKPI.findOneAndUpdate(
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