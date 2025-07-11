const SalesKPI = require('../models/salesKPIModel');
const { parseCSVFile, parseInlineCSV, transformRow, saveKPIData } = require('../services/commonServices');


// Controller to create the dashboard layout which revieves just the company Id and default layout
exports.createDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.body;
    const defaultLayout = {
      lg: [], // Default empty layout for large screens
      md: [], // Default empty layout for medium screens    
      sm: []  // Default empty layout for small screens
    };

    const newLayout = new SalesKPI({
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

/**
* Upload Sales KPI Controller
*/
exports.uploadSalesKPIFromCSV = async (req, res) => {
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

   const result = await saveKPIData(SalesKPI, companyId, processedData, 'Sales');

   return res.status(200).json({
     message: 'Sales KPIs processed and uploaded successfully',
     data: result
   });

 } catch (error) {
   console.error('Sales KPI upload error:', error);
   res.status(500).json({ message: 'Internal server error: ' + error.message });
 }
};


// Update Sales KPIs for a company
exports.updateSalesKPI = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const salesKpi = await SalesKPI.findOneAndUpdate({ companyId }, updatedData, { new: true });
    if (!salesKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Sales KPI data updated successfully', salesKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Sales KPIs for a company
exports.deleteSalesKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const salesKpi = await SalesKPI.findOneAndDelete({ companyId });
    if (!salesKpi) {
      return res.status(404).json({ message: 'Company not found' });
    }

    res.status(200).json({ message: 'Sales KPI data deleted successfully', salesKpi });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get Sales KPIs for a company
exports.getSalesKPI = async (req, res) => {
  try {
    const { companyId } = req.params;

    const salesKpi = await SalesKPI.findOne({ companyId });
    if (!salesKpi) {
      // Create a new document with default values if none exists
      const newSalesKPI = new SalesKPI({
        companyId,
        department: 'sales',
        selectedKPIs: [],
        data: [],
        dashboardLayout: {
          lg: [],
          md: [],
          sm: []
        }
      });
      await newSalesKPI.save();
      return res.status(200).json({
        selectedKPIs: [],
        kpis: {}
      });
    }

    // Format data for charts using the utility function
    const { formatChartData } = require('../services/kpiProcessor');
    const chartData = formatChartData(salesKpi.data);

    // Return data in the format expected by frontend
    res.status(200).json({
      selectedKPIs: salesKpi.selectedKPIs,
      kpis: chartData
    });
  } catch (error) {
    console.error('Error fetching Sales KPI data:', error);
    res.status(500).json({ message: error.message });
  }
};
// Get dashboard layout
exports.getDashboardLayout = async (req, res) => {
  try {
    const { companyId } = req.params;

    const result = await SalesKPI.findOne(
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

    const result = await SalesKPI.findOneAndUpdate(
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

    const result = await SalesKPI.findOneAndUpdate(
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
    const result = await SalesKPI.findOneAndUpdate(
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
    const result = await SalesKPI.findOneAndUpdate(
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

    const result = await SalesKPI.findOne(
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

    const result = await SalesKPI.findOneAndUpdate(
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
    const document = await SalesKPI.findOne({ companyId });
    
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

    const result = await SalesKPI.findOneAndUpdate(
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

    const result = await SalesKPI.findOneAndUpdate(
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

// Upload Sales KPI data from CSV
exports.uploadSalesKPIData = async (req, res) => {
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: 'No file uploaded' 
      });
    }

    const { companyId } = req.body;
    if (!companyId) {
      return res.status(400).json({ 
        success: false,
        message: 'Company ID is required' 
      });
    }

    // Process the uploaded CSV file
    const results = [];
    const processFile = new Promise((resolve, reject) => {
      fs.createReadStream(req.file.path)
        .pipe(csv())
        .on('data', (data) => {
          // Convert date string to Date object and ensure it's valid
          const date = new Date(data.Date);
          if (isNaN(date)) {
            reject(new Error('Invalid date format in CSV'));
            return;
          }

          // Process each KPI column and create data points
          const kpiUpdates = [];
          const validKPIs = [
            'monthlyRecurringRevenue',
            'salesGrowthRate',
            'salesTargetAchievement',
            'leadToCustomerConversionRate',
            'averageDealSize',
            'customerAcquisitionCost',
            'salesCycleLength',
            'leadResponseTime',
            'churnRate',
            'upsellCrossSellRate'
          ];

          // Create update operations for each KPI
          validKPIs.forEach(kpiName => {
            if (data[kpiName] && !isNaN(parseFloat(data[kpiName]))) {
              kpiUpdates.push({
                kpiName,
                dataPoint: {
                  date,
                  value: parseFloat(data[kpiName])
                }
              });
            }
          });

          results.push(...kpiUpdates);
        })
        .on('end', () => {
          resolve(results);
        })
        .on('error', (error) => {
          reject(error);
        });
    });

    const kpiUpdates = await processFile;

    // Update MongoDB documents
    const updatePromises = kpiUpdates.map(update => {
      return SalesKPI.findOneAndUpdate(
        { 
          companyId,
          kpiName: update.kpiName
        },
        { 
          $set: {
            department: 'sales',
            companyId
          },
          $push: {
            dataPoints: update.dataPoint
          }
        },
        { 
          upsert: true,
          new: true
        }
      );
    });

    await Promise.all(updatePromises);

    // Clean up the uploaded file
    fs.unlink(req.file.path, (err) => {
      if (err) console.error('Error deleting uploaded file:', err);
    });

    res.status(200).json({
      success: true,
      message: 'Sales KPI data uploaded and processed successfully'
    });

  } catch (error) {
    console.error('Error processing Sales KPI data:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing Sales KPI data',
      error: error.message
    });
  }
};

// Download Sales KPI CSV template
exports.downloadSalesKPITemplate = async (req, res) => {
  try {
    const templatePath = path.join(__dirname, '../sample-KPI-csv/Dhruvaa_KPI_Sales.csv');
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=Dhruvaa_KPI_Sales.csv');
    
    // Send the file
    res.download(templatePath);
  } catch (error) {
    console.error('Error downloading Sales KPI template:', error);
    res.status(500).json({
      success: false,
      message: 'Error downloading Sales KPI template',
      error: error.message
    });
  }
};

