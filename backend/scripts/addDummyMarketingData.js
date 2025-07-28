const mongoose = require('mongoose');
const MarketingKPI = require('../models/marketingKPIModel');

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/kpi-builder', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Generate dummy data for marketing KPIs
const generateDummyData = (companyId) => {
  const months = [
    '2024-01-01', '2024-02-01', '2024-03-01', '2024-04-01', '2024-05-01', '2024-06-01',
    '2024-07-01', '2024-08-01', '2024-09-01', '2024-10-01', '2024-11-01', '2024-12-01'
  ];

  const kpiData = [];

  months.forEach((month, index) => {
    const metrics = new Map();
    
    // Generate realistic marketing KPI data with some variation
    metrics.set('customerAcquisitionCost', Math.round(50 + Math.random() * 100 + index * 5)); // $50-$200, increasing trend
    metrics.set('returnOnMarketingInvestment', Math.round(200 + Math.random() * 150 + index * 10)); // 200-400%, improving
    metrics.set('websiteTraffic', Math.round(5000 + Math.random() * 3000 + index * 200)); // 5k-10k visitors, growing
    metrics.set('conversionRate', Math.round((2 + Math.random() * 3 + index * 0.1) * 100) / 100); // 2-5%, slight improvement
    metrics.set('socialMediaEngagement', Math.round(1000 + Math.random() * 500 + index * 50)); // 1k-2k engagements
    metrics.set('emailOpenRate', Math.round((20 + Math.random() * 15 + index * 0.5) * 100) / 100); // 20-35%
    metrics.set('clickThroughRate', Math.round((1 + Math.random() * 3 + index * 0.1) * 100) / 100); // 1-4%
    metrics.set('leadGenerationVolume', Math.round(100 + Math.random() * 80 + index * 10)); // 100-200 leads
    metrics.set('marketingQualifiedLeads', Math.round(30 + Math.random() * 40 + index * 5)); // 30-80 MQLs
    metrics.set('campaignROI', Math.round(150 + Math.random() * 100 + index * 8)); // 150-300% ROI

    kpiData.push({
      date: new Date(month),
      department: 'marketing',
      metrics: metrics
    });
  });

  return kpiData;
};

// Insert dummy data
const insertDummyData = async () => {
  try {
    await connectDB();

    // You can change this company ID to match your user's company ID
    const companyId = 'demo-company-123'; // Change this to your actual company ID
    
    // Check if data already exists for this company
    const existingData = await MarketingKPI.findOne({ companyId });
    
    if (existingData) {
      console.log(`Marketing KPI data already exists for company ${companyId}`);
      console.log('Updating with new dummy data...');
      
      // Clear existing data and add new dummy data
      await MarketingKPI.findOneAndUpdate(
        { companyId },
        {
          $set: {
            department: 'marketing',
            lastUpdated: new Date(),
            selectedKPIs: [
              'customerAcquisitionCost',
              'returnOnMarketingInvestment',
              'websiteTraffic',
              'conversionRate',
              'socialMediaEngagement',
              'emailOpenRate',
              'clickThroughRate',
              'leadGenerationVolume',
              'marketingQualifiedLeads',
              'campaignROI'
            ],
            data: generateDummyData(companyId)
          }
        },
        { new: true, upsert: true }
      );
    } else {
      // Create new document
      const marketingKPI = new MarketingKPI({
        companyId: companyId,
        department: 'marketing',
        selectedKPIs: [
          'customerAcquisitionCost',
          'returnOnMarketingInvestment',
          'websiteTraffic',
          'conversionRate',
          'socialMediaEngagement',
          'emailOpenRate',
          'clickThroughRate',
          'leadGenerationVolume',
          'marketingQualifiedLeads',
          'campaignROI'
        ],
        data: generateDummyData(companyId),
        dashboardLayout: {
          lg: [
            { i: "customerAcquisitionCost", x: 0, y: 0, w: 6, h: 4 },
            { i: "returnOnMarketingInvestment", x: 6, y: 0, w: 6, h: 4 },
            { i: "websiteTraffic", x: 0, y: 4, w: 6, h: 4 },
            { i: "conversionRate", x: 6, y: 4, w: 6, h: 4 },
            { i: "socialMediaEngagement", x: 0, y: 8, w: 4, h: 4 },
            { i: "emailOpenRate", x: 4, y: 8, w: 8, h: 4 },
            { i: "clickThroughRate", x: 0, y: 12, w: 6, h: 4 },
            { i: "leadGenerationVolume", x: 6, y: 12, w: 6, h: 4 },
            { i: "marketingQualifiedLeads", x: 0, y: 16, w: 6, h: 4 },
            { i: "campaignROI", x: 6, y: 16, w: 6, h: 4 }
          ],
          md: [
            { i: "customerAcquisitionCost", x: 0, y: 0, w: 6, h: 4 },
            { i: "returnOnMarketingInvestment", x: 6, y: 0, w: 6, h: 4 },
            { i: "websiteTraffic", x: 0, y: 4, w: 6, h: 4 },
            { i: "conversionRate", x: 6, y: 4, w: 6, h: 4 },
            { i: "socialMediaEngagement", x: 0, y: 8, w: 4, h: 4 },
            { i: "emailOpenRate", x: 4, y: 8, w: 8, h: 4 },
            { i: "clickThroughRate", x: 0, y: 12, w: 6, h: 4 },
            { i: "leadGenerationVolume", x: 6, y: 12, w: 6, h: 4 },
            { i: "marketingQualifiedLeads", x: 0, y: 16, w: 6, h: 4 },
            { i: "campaignROI", x: 6, y: 16, w: 6, h: 4 }
          ],
          sm: [
            { i: "customerAcquisitionCost", x: 0, y: 0, w: 12, h: 4 },
            { i: "returnOnMarketingInvestment", x: 0, y: 4, w: 12, h: 4 },
            { i: "websiteTraffic", x: 0, y: 8, w: 12, h: 4 },
            { i: "conversionRate", x: 0, y: 12, w: 12, h: 4 },
            { i: "socialMediaEngagement", x: 0, y: 16, w: 12, h: 4 },
            { i: "emailOpenRate", x: 0, y: 20, w: 12, h: 4 },
            { i: "clickThroughRate", x: 0, y: 24, w: 12, h: 4 },
            { i: "leadGenerationVolume", x: 0, y: 28, w: 12, h: 4 },
            { i: "marketingQualifiedLeads", x: 0, y: 32, w: 12, h: 4 },
            { i: "campaignROI", x: 0, y: 36, w: 12, h: 4 }
          ]
        },
        chartConfigurations: [
          { kpiId: 'customerAcquisitionCost', chartType: 'AreaChart' },
          { kpiId: 'returnOnMarketingInvestment', chartType: 'LineChart' },
          { kpiId: 'websiteTraffic', chartType: 'BarChart' },
          { kpiId: 'conversionRate', chartType: 'LineChart' },
          { kpiId: 'socialMediaEngagement', chartType: 'RadarChart' },
          { kpiId: 'emailOpenRate', chartType: 'LineChart' },
          { kpiId: 'clickThroughRate', chartType: 'AreaChart' },
          { kpiId: 'leadGenerationVolume', chartType: 'BarChart' },
          { kpiId: 'marketingQualifiedLeads', chartType: 'LineChart' },
          { kpiId: 'campaignROI', chartType: 'PieChart' }
        ]
      });

      await marketingKPI.save();
    }

    console.log(`✅ Dummy marketing KPI data inserted successfully for company: ${companyId}`);
    console.log('📊 Data includes 12 months of sample data for all marketing KPIs');
    console.log('🎯 You can now view charts in the marketing dashboard');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
    process.exit(1);
  }
};

// Run the script
insertDummyData();
