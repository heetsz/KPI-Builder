const mongoose = require('mongoose');

// Schema for individual KPI metrics
const MetricsSchema = new mongoose.Schema({
  value: { type: Number, required: true }
}, { _id: false });

// Schema for KPI data entry
const KPIDataEntrySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  department: { type: String, required: true },
  metrics: { type: Map, of: String, required: true }
}, { _id: false });

// Schema for layout item configuration
const LayoutItemSchema = new mongoose.Schema({
  i: { type: String, required: true },
  x: { type: Number, required: true },
  y: { type: Number, required: true },
  w: { type: Number, required: true },
  h: { type: Number, required: true }
}, { _id: false });

// Schema for responsive layouts
const ResponsiveLayoutSchema = new mongoose.Schema({
  lg: [LayoutItemSchema],
  md: [LayoutItemSchema],
  sm: [LayoutItemSchema]
}, { _id: false });

// Schema for KPI chart configurations
const KPIChartConfigSchema = new mongoose.Schema({
  kpiId: { type: String, required: true },
  chartType: { type: String, required: true }
}, { _id: false });

// Main schema for Manufacturing KPIs
const ManufacturingKPISchema = new mongoose.Schema({
  companyId: { type: String, required: true },
  companyName: { type: String, required: false },
  department: { type: String, required: true },
  lastUpdated: { type: Date, required: true, default: Date.now },
  selectedKPIs: {
    type: [String],
    required: true,
    enum: [
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
    ]
  },
  dashboardLayout: { 
    type: ResponsiveLayoutSchema, 
    required: false
  },
  chartConfigurations: [KPIChartConfigSchema],
  data: [KPIDataEntrySchema]
});

module.exports = mongoose.model('ManufacturingKPI', ManufacturingKPISchema);