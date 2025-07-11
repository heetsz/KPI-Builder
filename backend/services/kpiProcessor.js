const fs = require('fs');
const csv = require('csv-parser');

/**
 * Format a date to YYYY-MM format
 * @param {Date} date Date object to format
 * @returns {string} Formatted date string
 */
const formatDateToMonth = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
};

/**
 * Process a CSV file and return its contents as an array of objects
 * @param {string} filePath Path to the CSV file
 * @returns {Promise<Array>} Array of objects representing CSV rows
 */
const processKPIFile = (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        fs.unlink(filePath, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
        resolve(results);
      })
      .on('error', reject);
  });
};

/**
 * Format KPI data for chart consumption
 * @param {Array} data Array of KPI data entries
 * @returns {Object} Formatted data for charts
 */
const formatChartData = (data) => {
  if (!Array.isArray(data) || data.length === 0) {
    return {};
  }

  // Create an object to store the formatted data for each KPI
  const formattedData = {};

  // Sort data by date
  const sortedData = [...data].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Process each data entry
  sortedData.forEach(entry => {
    if (!entry.metrics || !(entry.metrics instanceof Map)) {
      return;
    }

    const month = formatDateToMonth(entry.date);

    // For each metric in the entry
    entry.metrics.forEach((value, key) => {
      if (!formattedData[key]) {
        formattedData[key] = [];
      }

      // Handle special cases like active users metrics
      if (typeof value === 'object' && value !== null) {
        // For metrics that contain sub-metrics (like activeUsers with DAU, WAU, MAU)
        formattedData[key].push({
          month,
          ...value
        });
      } else {
        // Standard metrics
        formattedData[key].push({
          month,
          value: Number(value)
        });
      }
    });
  });

  return formattedData;
};

/**
 * Save KPI data to MongoDB
 * @param {Model} model Mongoose model for the KPI collection
 * @param {string} companyId Company ID
 * @param {Array} data Processed KPI data
 * @param {string} department Department name
 * @returns {Promise} Result of update operation
 */
const saveKPIData = async (model, companyId, data, department) => {
  // Convert raw data to KPI entries
  const kpiEntries = data.map(row => {
    const { Date: date, ...metrics } = row;
    
    // Convert metrics to a Map of numbers
    const numericMetrics = new Map();
    Object.entries(metrics).forEach(([key, value]) => {
      if (!isNaN(value)) {
        numericMetrics.set(key, Number(value));
      }
    });

    return {
      date: new Date(date),
      department,
      metrics: numericMetrics
    };
  });

  // Update or create document for this company
  const result = await model.findOneAndUpdate(
    { companyId },
    { 
      $set: { 
        department,
        lastUpdated: new Date()
      },
      $push: { 
        data: { 
          $each: kpiEntries 
        }
      }
    },
    { 
      new: true, 
      upsert: true 
    }
  );

  return result;
};

module.exports = {
  processKPIFile,
  saveKPIData,
  formatChartData
};