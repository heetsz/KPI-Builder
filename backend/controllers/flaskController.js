const axios = require('axios');
const Company = require('../models/companyModel'); // Import your Company model
const Insights = require('../models/insightsModel');

// POST request to Flask API
exports.generateInsights = async (req, res) => {
  try {
    // Receives company ID
    const { companyId } = req.params;

    // Fetch company data from the backend
    const company = await Company.findOne({ companyId });
    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    console.log('Company data:', company);

    // Fetch all KPI data from backend APIs
    const financeData = await axios.get(`http://localhost:5000/api/finance/kpis/${companyId}`);
    const salesData = await axios.get(`http://localhost:5000/api/sales/kpis/${companyId}`);
    const marketingData = await axios.get(`http://localhost:5000/api/marketing/kpis/${companyId}`); 
    const operationsData = await axios.get(`http://localhost:5000/api/operations/kpis/${companyId}`);
    const manufacturingData = await axios.get(`http://localhost:5000/api/manufacturing/kpis/${companyId}`);
    const saasData = await axios.get(`http://localhost:5000/api/saas/kpis/${companyId}`);
    const productionData = await axios.get(`http://localhost:5000/api/production/kpis/${companyId}`);
    const customerGrowthData = await axios.get(`http://localhost:5000/api/customer-growth/kpis/${companyId}`);

    // Log the data for debugging
    // console.log('Finance data:', financeData.data);
    // console.log('Sales data:', salesData.data);
    // console.log('Marketing data:', marketingData.data);
    // console.log('Operations data:', operationsData.data);
    // console.log('Manufacturing data:', manufacturingData.data);
    // console.log('SaaS data:', saasData.data);
    // console.log('Production data:', productionData.data);
    // console.log('Customer Growth data:', customerGrowthData.data);

    // Process the data for each department
    const processKPIs = (data, departmentName) => {
      if (!data || !data.kpis) {
        console.log(`No valid data for ${departmentName}`);
        return [];
      }
      
      const result = [];
      const selectedKPIs = data.selectedKPIs || [];
      
      // For each KPI key in the kpis object
      Object.keys(data.kpis).forEach(kpiName => {
        // If it's in the selected KPIs, add it to our result
        if (selectedKPIs.includes(kpiName)) {
          const kpiData = data.kpis[kpiName];
          
          // Ensure kpiData is an array before trying to iterate
          if (Array.isArray(kpiData)) {
            kpiData.forEach(dataPoint => {
              // Add the processed data point with department information
              result.push({
                ...dataPoint,
                kpiName,
                department: departmentName
              });
            });
          }
        }
      });
      
      return result;
    };

    // Process data for each department
    const financeKPIData = processKPIs(financeData.data, 'Finance');
    const salesKPIData = processKPIs(salesData.data, 'Sales');
    const marketingKPIData = processKPIs(marketingData.data, 'Marketing');
    const operationsKPIData = processKPIs(operationsData.data, 'Operations');
    const manufacturingKPIData = processKPIs(manufacturingData.data, 'Manufacturing');
    const saasKPIData = processKPIs(saasData.data, 'SaaS');
    const productionKPIData = processKPIs(productionData.data, 'Production');
    const customerGrowthKPIData = processKPIs(customerGrowthData.data, 'Customer Growth');

    // Combine all KPI data into a single array
    const allKPIData = [
      ...financeKPIData,
      ...salesKPIData,
      ...marketingKPIData,
      ...operationsKPIData,
      ...manufacturingKPIData,
      ...saasKPIData,
      ...productionKPIData,
      ...customerGrowthKPIData
    ];

    // Convert allKPIData array to an object: { kpiName: value, ... }
    const kpiDataObject = {};
    allKPIData.forEach(kpi => {
      // Use the latest value for each KPI name
      if (kpi.kpiName && kpi.value !== undefined) {
        kpiDataObject[kpi.kpiName] = kpi.value;
      }
    });

    // Prepare data to send to the Flask API
    const requestData = {
      company_data: {
        name: company.name,
        industry: company.industry,
        stage: company.stage,
        product: company.product,
        founded: company.founded,
        employees: company.employees,
        target_market: company.targetMarket,
        technology_readiness_level: company.technologyReadinessLevel,
        tam: company.tam,
        sam: company.sam,
        som: company.som,
        marketCGAR: company.marketCAGR,
        elevator_pitch: company.elevatorPitch,
      },
      kpi_data: kpiDataObject, // send as object, not array
    };

    console.log('Request data to Flask API:', requestData);

    // Make the POST request to the Flask API
    const flaskResponse = await axios.post('http://localhost:5001/generate-insights', requestData);

    // Add the response data to the schema
    const sendDataResponse = await axios.post(`http://localhost:5000/api/insights/${companyId}`, flaskResponse.data);
    // Send the response from Flask back to the client
    res.status(flaskResponse.status).json(flaskResponse.data);
  } catch (error) {
    console.error('Error calling Flask API:', error.message);
    if (error.response) {
      res.status(error.response.status).json(error.response.data);
    } else {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
};