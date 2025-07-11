// Data fetching and transformation utilities for department KPIs
import { useState, useEffect } from 'react';

// Radar chart data transformations
const transformToRadarData = (data) => {
  if (!data || data.length === 0) return [];
  return data.map(item => ({
    subject: item.month || item.quarter,
    value: item.rate || item.score || item.value || item.days || 0
  }));
};

// Fetch KPI data from Sales Dashboard
export const fetchSalesKPIs = () => {
  const mrrData = [
    { month: "Jan", value: 150000 },
    { month: "Feb", value: 165000 },
    { month: "Mar", value: 180000 },
    { month: "Apr", value: 195000 },
    { month: "May", value: 220000 },
    { month: "Jun", value: 245000 },
  ];

  const growthRateData = [
    { month: "Jan", rate: 8.5 },
    { month: "Feb", rate: 10.2 },
    { month: "Mar", rate: 9.1 },
    { month: "Apr", rate: 8.3 },
    { month: "May", rate: 12.8 },
    { month: "Jun", rate: 11.4 },
  ];

  const conversionData = [
    { month: "Jan", rate: 18.5 },
    { month: "Feb", rate: 19.2 },
    { month: "Mar", rate: 20.1 },
    { month: "Apr", rate: 21.5 },
    { month: "May", rate: 22.8 },
    { month: "Jun", rate: 23.4 },
  ];

  // Add radar format for Sales Cycle
  const salesCycleRadarData = [
    { subject: "Prospecting", value: 8 },
    { subject: "Qualification", value: 6 },
    { subject: "Proposal", value: 9 },
    { subject: "Negotiation", value: 7 },
    { subject: "Closing", value: 5 }
  ];

  return { 
    mrrData, 
    growthRateData, 
    conversionData,
    salesCycleRadarData 
  };
};

// Fetch KPI data from Finance Dashboard
export const fetchFinanceKPIs = () => {
  const revGrowthData = [
    { month: "Jan", rate: 12.5 },
    { month: "Feb", rate: 15.2 },
    { month: "Mar", rate: 18.7 },
    { month: "Apr", rate: 16.9 },
    { month: "May", rate: 20.3 },
    { month: "Jun", rate: 22.1 },
  ];

  const operatingCashFlowData = [
    { month: "Jan", value: 850000 },
    { month: "Feb", value: 920000 },
    { month: "Mar", value: 980000 },
    { month: "Apr", value: 1050000 },
    { month: "May", value: 1150000 },
    { month: "Jun", value: 1250000 },
  ];

  const grossMarginData = [
    { month: "Jan", margin: 65.3 },
    { month: "Feb", margin: 66.8 },
    { month: "Mar", margin: 67.2 },
    { month: "Apr", margin: 68.5 },
    { month: "May", margin: 69.1 },
    { month: "Jun", margin: 70.4 },
  ];

  return { revGrowthData, operatingCashFlowData, grossMarginData };
};

// Fetch KPI data from Customer Dashboard
export const fetchCustomerKPIs = () => {
  const retentionRateData = [
    { month: "Jan", rate: 85 },
    { month: "Feb", rate: 86 },
    { month: "Mar", rate: 87 },
    { month: "Apr", rate: 88 },
    { month: "May", rate: 89 },
    { month: "Jun", rate: 90 },
  ];

  const npsData = [
    { quarter: "Q1", score: 45 },
    { quarter: "Q2", score: 48 },
    { quarter: "Q3", score: 52 },
    { quarter: "Q4", score: 55 },
  ];

  const clvData = [
    { month: "Jan", value: 2500 },
    { month: "Feb", value: 2600 },
    { month: "Mar", value: 2750 },
    { month: "Apr", value: 2900 },
    { month: "May", value: 3100 },
    { month: "Jun", value: 3300 },
  ];

  return { retentionRateData, npsData, clvData };
};

// Fetch KPI data from Marketing Dashboard
export const fetchMarketingKPIs = () => {
  const socialEngagementRadarData = [
    { subject: "Facebook", value: 75 },
    { subject: "Twitter", value: 65 },
    { subject: "LinkedIn", value: 85 },
    { subject: "Instagram", value: 78 },
    { subject: "YouTube", value: 70 }
  ];

  return { socialEngagementRadarData };
};

// Fetch KPI data from Operations Dashboard
export const fetchOperationsKPIs = () => {
  const fulfillmentTimeData = [
    { month: "Jan", hours: 48 },
    { month: "Feb", hours: 45 },
    { month: "Mar", hours: 42 },
    { month: "Apr", hours: 40 },
    { month: "May", hours: 38 },
    { month: "Jun", hours: 36 },
  ];

  const productionEfficiencyData = [
    { month: "Jan", rate: 82.5 },
    { month: "Feb", rate: 84.2 },
    { month: "Mar", rate: 85.7 },
    { month: "Apr", rate: 86.9 },
    { month: "May", rate: 88.3 },
    { month: "Jun", rate: 89.5 },
  ];

  const inventoryTurnoverData = [
    { month: "Jan", turns: 12 },
    { month: "Feb", turns: 12.5 },
    { month: "Mar", turns: 13.2 },
    { month: "Apr", turns: 13.8 },
    { month: "May", turns: 14.3 },
    { month: "Jun", turns: 15.0 },
  ];

  const warehouseUtilizationRadarData = [
    { subject: "Storage Space", value: 85 },
    { subject: "Picking Efficiency", value: 78 },
    { subject: "Loading Zones", value: 92 },
    { subject: "Inventory Flow", value: 88 },
    { subject: "Equipment Usage", value: 83 }
  ];

  return { 
    fulfillmentTimeData, 
    productionEfficiencyData, 
    inventoryTurnoverData,
    warehouseUtilizationRadarData 
  };
};

// Custom hook to manage KPI data
export const useKPIData = () => {
  const [kpiData, setKPIData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      // Fetch data from all departments
      const salesData = fetchSalesKPIs();
      const financeData = fetchFinanceKPIs();
      const customerData = fetchCustomerKPIs();
      const operationsData = fetchOperationsKPIs();
      const marketingData = fetchMarketingKPIs();

      setKPIData({
        ...salesData,
        ...financeData,
        ...customerData,
        ...operationsData,
        ...marketingData
      });
      setLoading(false);
    } catch (err) {
      setError(err);
      setLoading(false);
    }
  }, []);

  return { kpiData, loading, error };
};