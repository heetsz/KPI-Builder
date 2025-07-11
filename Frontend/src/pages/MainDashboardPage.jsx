import { useState, useEffect } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import DraggableKPIChartCard from "../components/common/DraggableKPIChartCard";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const URL = import.meta.env.VITE_BACKEND_URL;
const ResponsiveGridLayout = WidthProvider(Responsive);

// Weight factors for KPI importance calculation
const WEIGHT_FACTORS = {
  financial: 0.2,
  customer: 0.2,
  operational: 0.15,
  manufacturing: 0.1,
  production: 0.1,
  sales: 0.1,
  marketing: 0.075,
  saas: 0.075
};

const MainDashboardPage = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [layouts, setLayouts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Function to calculate KPI importance score
  const calculateKPIScore = (kpi) => {
    if (!kpi) return 0;
    
    let score = 0;
    const title = (kpi.title || '').toLowerCase();
    const department = (kpi.department || '').toLowerCase();
  
    // Department weights (should add up to 1)
    const WEIGHT_FACTORS = {
      financial: 0.2,
      customer: 0.2,
      operational: 0.15,
      manufacturing: 0.1,
      production: 0.1,
      sales: 0.1,
      marketing: 0.075,
      saas: 0.075
    };
  
    // Financial metrics
    if (title.includes('revenue') || 
        title.includes('margin') ||
        title.includes('cash') ||
        title.includes('profit') ||
        title.includes('cost') ||
        department === 'finance') {
      score += WEIGHT_FACTORS.financial;
    }
    
    // Customer metrics
    if (title.includes('customer') ||
        title.includes('satisfaction') ||
        title.includes('nps') ||
        title.includes('churn') ||
        title.includes('retention') ||
        department === 'customer') {
      score += WEIGHT_FACTORS.customer;
    }
    
    // Operational metrics
    if (title.includes('efficiency') ||
        title.includes('utilization') ||
        title.includes('cycle') ||
        title.includes('fulfillment') ||
        title.includes('inventory') ||
        department === 'operations') {
      score += WEIGHT_FACTORS.operational;
    }
    
    // Manufacturing metrics
    if (title.includes('oee') ||
        title.includes('downtime') ||
        title.includes('maintenance') ||
        title.includes('defect') ||
        title.includes('quality') ||
        department === 'manufacturing') {
      score += WEIGHT_FACTORS.manufacturing;
    }
    
    // Production metrics
    if (title.includes('production') ||
        title.includes('yield') ||
        title.includes('scrap') ||
        title.includes('rework') ||
        title.includes('capacity') ||
        department === 'production') {
      score += WEIGHT_FACTORS.production;
    }
    
    // Sales metrics
    if (title.includes('sales') ||
        title.includes('pipeline') ||
        title.includes('deal') ||
        title.includes('quota') ||
        title.includes('win rate') ||
        department === 'sales') {
      score += WEIGHT_FACTORS.sales;
    }
    
    // Marketing metrics
    if (title.includes('marketing') ||
        title.includes('campaign') ||
        title.includes('conversion') ||
        title.includes('traffic') ||
        title.includes('leads') ||
        department === 'marketing') {
      score += WEIGHT_FACTORS.marketing;
    }
    
    // SaaS metrics
    if (title.includes('arr') ||
        title.includes('mrr') ||
        title.includes('cac') ||
        title.includes('ltv') ||
        title.includes('active users') ||
        department === 'saas') {
      score += WEIGHT_FACTORS.saas;
    }
  
    // Additional scoring based on data trends and importance
    if (kpi.data && Array.isArray(kpi.data) && kpi.data.length > 0) {
      try {
        const values = kpi.data.map(item => {
          const value = Object.values(item)[1];
          return typeof value === 'number' ? value : parseFloat(value);
        }).filter(val => !isNaN(val));
  
        if (values.length >= 2) {
          const latestValue = values[values.length - 1];
          const previousValue = values[0];
  
          // Score boost for metrics showing improvement
          if (latestValue > previousValue) {
            score += 0.1;
          }
          
          // Score boost for metrics with significant change
          const change = Math.abs((latestValue - previousValue) / (previousValue || 1));
          if (change > 0.1) {
            score += 0.1;
          }
  
          // Score boost for metrics with consistent data
          const hasConsistentData = values.every(v => v !== undefined && v !== null);
          if (hasConsistentData) {
            score += 0.05;
          }
        }
      } catch (error) {
        console.warn('Error calculating trend scores:', error);
        // Don't add trend-based scores if there's an error
      }
    }
  
    // Score boost for metrics with recent data
    if (kpi.lastUpdated) {
      try {
        const lastUpdateTime = new Date(kpi.lastUpdated).getTime();
        const now = Date.now();
        const daysSinceUpdate = (now - lastUpdateTime) / (24 * 60 * 60 * 1000);
        
        if (daysSinceUpdate < 7) {
          score += 0.1; // Updated within last week
        } else if (daysSinceUpdate < 30) {
          score += 0.05; // Updated within last month
        }
      } catch (error) {
        console.warn('Error calculating recency score:', error);
        // Don't add recency score if there's an error
      }
    }
  
    return score;
  };

  // Function to fetch KPI data from a department
  const fetchDepartmentKPIs = async (department) => {
    try {
      const response = await axios.get(`${URL}/api/${department}/kpis/${user.companyId}`);
      
      // Early return if no data
      if (!response.data) {
        console.warn(`No data received from ${department} KPIs`);
        return [];
      }
      
      // Check if response.data.kpis exists and is an array (old format)
      if (Array.isArray(response.data.kpis)) {
        return response.data.kpis.map(kpi => ({
          ...kpi,
          department,
          lastUpdated: kpi.updatedAt || kpi.lastUpdated
        }));
      }
      
      // If response.data.kpis is an object with metric arrays (new format)
      if (response.data.kpis && typeof response.data.kpis === 'object') {
        const transformedKPIs = [];
        
        // Convert each metric array into individual KPI objects
        Object.entries(response.data.kpis).forEach(([metricName, dataArray]) => {
          if (Array.isArray(dataArray) && dataArray.length > 0) {
            const kpiData = dataArray.map(item => {
              if (typeof item === 'object') {
                // Handle object format (e.g. {date: '2023-01', value: 100})
                const period = item.date || item.month || item.quarter || `Period ${dataArray.indexOf(item) + 1}`;
                const value = typeof item.value === 'number' 
                  ? item.value 
                  : Object.values(item).find(v => typeof v === 'number');
                return { period, value };
              } else {
                // Handle direct value format
                return {
                  period: `Period ${dataArray.indexOf(item) + 1}`,
                  value: typeof item === 'number' ? item : parseFloat(item)
                };
              }
            });

            transformedKPIs.push({
              id: `${department}-${metricName}`,
              title: metricName.replace(/([A-Z])/g, ' $1').trim(), // Convert camelCase to Title Case
              data: kpiData,
              department,
              chartType: "LineChart",
              color: "#10B981",
              xKey: "period",
              yKey: "value",
              lastUpdated: new Date().toISOString()
            });
          }
        });
        
        return transformedKPIs;
      }
      
      console.warn(`Invalid data structure for ${department} KPIs:`, response.data.kpis);
      return [];
    } catch (error) {
      console.error(`Error fetching ${department} KPIs:`, error);
      return [];
    }
  };

  // Function to analyze and select KPIs
  const analyzeAndSelectKPIs = async () => {
    try {
      setLoading(true);

      // Fetch KPIs from all departments
      const departments = [
        'finance',
        'sales',
        'customer-growth',
        'operations',
        'manufacturing',
        'production',
        'marketing',
        'saas'
      ];

      const departmentKPIs = await Promise.all(
        departments.map(dept => fetchDepartmentKPIs(dept))
      );

      // Flatten and prepare KPIs with proper structure
      const allKPIs = departmentKPIs.flat().filter(kpi => kpi && kpi.data).map(kpi => ({
        id: kpi._id || `${kpi.department}-${kpi.name}`,
        title: kpi.name || kpi.title,
        data: Array.isArray(kpi.data) ? kpi.data : [],
        chartType: kpi.preferredChartType || "LineChart",
        color: kpi.color || "#10B981",
        xKey: kpi.xAxisKey || "period",
        yKey: kpi.yAxisKey || "value",
        department: kpi.department,
        lastUpdated: kpi.lastUpdated
      }));

      // Calculate scores and initial sorting
      const scoredKPIs = allKPIs.map(kpi => ({
        ...kpi,
        score: calculateKPIScore(kpi)
      })).sort((a, b) => b.score - a.score);

      // Ensure representation from each department
      const departmentQuota = new Map();
      const MAX_KPIS = 12;
      const selectedKPIs = [];

      // First pass: Select at least one KPI from each department
      for (const kpi of scoredKPIs) {
        const dept = kpi.department;
        if (!departmentQuota.has(dept)) {
          selectedKPIs.push(kpi);
          departmentQuota.set(dept, 1);
        }
        
        if (departmentQuota.size >= departments.length) break;
      }

      // Second pass: Fill remaining slots with highest scoring KPIs
      const remainingSlots = MAX_KPIS - selectedKPIs.length;
      if (remainingSlots > 0) {
        const additionalKPIs = scoredKPIs
          .filter(kpi => !selectedKPIs.find(selected => selected.id === kpi.id))
          .slice(0, remainingSlots);
        selectedKPIs.push(...additionalKPIs);
      }

      // Generate layout for selected KPIs
      const defaultLayout = selectedKPIs.map((kpi, index) => ({
        i: kpi.id,
        x: (index % 2) * 6,
        y: Math.floor(index / 2) * 4,
        w: 6,
        h: 4
      }));

      setSelectedKPIs(selectedKPIs);
      setLayouts({
        lg: defaultLayout,
        md: defaultLayout,
        sm: defaultLayout.map(item => ({ ...item, w: 12, h: 4 }))
      });

      setLoading(false);
    } catch (err) {
      console.error("Error in analyzeAndSelectKPIs:", err);
      setError("Failed to load KPI data");
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.companyId) {
      analyzeAndSelectKPIs();
    }
  }, [user?.companyId]);

  // Handle layout changes
  const onLayoutChange = (layout, layouts) => {
    setLayouts(layouts);
  };

  // Define breakpoints for responsive layout
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 12, sm: 12, xs: 1, xxs: 1 };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold">Loading dashboard data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl font-semibold text-red-500">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen">
      <h1 className={`text-2xl font-bold mb-6 ${theme.text}`}>Executive Dashboard</h1>
      <div className={`grid grid-cols-2 gap-4 mb-6`}>
        <div className={`${theme.cardBg} ${theme.border} rounded-lg p-4`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-2`}>Dashboard Overview</h2>
          <p className={`${theme.text} opacity-80`}>
            Showing top {selectedKPIs.length} KPIs across all departments, 
            automatically selected based on business impact and performance trends.
          </p>
        </div>
        <div className={`${theme.cardBg} ${theme.border} rounded-lg p-4`}>
          <h2 className={`text-lg font-semibold ${theme.text} mb-2`}>Data Freshness</h2>
          <p className={`${theme.text} opacity-80`}>
            Last updated: {new Date().toLocaleString()}
          </p>
        </div>
      </div>
      <ResponsiveGridLayout
        className="layout"
        layouts={layouts}
        breakpoints={breakpoints}
        cols={cols}
        rowHeight={100}
        margin={[16, 16]}
        containerPadding={[0, 0]}
        onLayoutChange={onLayoutChange}
        isDraggable={true}
        isResizable={true}
        useCSSTransforms={true}
        compactType="vertical"
        draggableHandle=".drag-handle"
      >
        {selectedKPIs.map((kpi) => (
          <div key={kpi.id} className={`${theme.cardBg} ${theme.border} rounded-lg overflow-hidden border`}>
            <DraggableKPIChartCard
              initialChartType={kpi.chartType}
              title={kpi.title}
              data={kpi.data}
              xKey={kpi.xKey}
              yKey={kpi.yKey}
              color={kpi.color}
              width="100%"
              height="100%"
              className="h-full"
            />
          </div>
        ))}
      </ResponsiveGridLayout>
    </div>
  );
};

export default MainDashboardPage;