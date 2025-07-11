import { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import DraggableKPIChartCard from "../components/common/DraggableKPIChartCard";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import axios from "axios";

const URL = import.meta.env.VITE_BACKEND_URL;
const ResponsiveGridLayout = WidthProvider(Responsive);
const LAYOUT_STORAGE_KEY = "marketing-dashboard-layouts";
const CHART_CONFIG_STORAGE_KEY = "marketing-dashboard-chart-config";


const MarketingDashboardPage = () => {
  const { theme } = useTheme();
  const [kpiData, setKpiData] = useState(null);
  const [selectedKPIs, setSelectedKPIs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingLayout, setSavingLayout] = useState(false);
  const [savingChartConfig, setSavingChartConfig] = useState(false);
  const [addKPIMenuOpen, setAddKPIMenuOpen] = useState(false);
  const addKPIMenuRef = useRef(null);

  const { user } = useAuth();
  const COMPANY_ID = user?.companyId; // Replace with actual company ID from context or props

  // KPI visibility states
  const [visibleKPIs, setVisibleKPIs] = useState({
    customerAcquisitionCost: false,
    returnOnMarketingInvestment: false,
    websiteTraffic: false,
    conversionRate: false,
    socialMediaEngagement: false,
    emailOpenRate: false,
    clickThroughRate: false,
    leadGenerationVolume: false,
    marketingQualifiedLeads: false,
    campaignROI: false
  });

  // Chart configurations state
  const [chartConfigurations, setChartConfigurations] = useState({});

  // Layout configuration
  const defaultLayout = [
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
  ];

  const defaultLayouts = {
    lg: defaultLayout,
    md: defaultLayout,
    sm: defaultLayout.map(item => ({ ...item, w: 12, h: 4 }))
  };

  // Default chart configurations
  const defaultChartConfigurations = {
    customerAcquisitionCost: "AreaChart",
    returnOnMarketingInvestment: "LineChart",
    websiteTraffic: "BarChart",
    conversionRate: "LineChart",
    socialMediaEngagement: "RadarChart",
    emailOpenRate: "LineChart",
    clickThroughRate: "AreaChart",
    leadGenerationVolume: "BarChart",
    marketingQualifiedLeads: "LineChart",
    campaignROI: "PieChart"
  };

  // Initialize layouts from localStorage first, then try server
  const [layouts, setLayouts] = useState(() => {
    const savedLayouts = localStorage.getItem(LAYOUT_STORAGE_KEY);
    if (savedLayouts) {
      try {
        return JSON.parse(savedLayouts);
      } catch (error) {
        console.error("Error parsing saved layouts from localStorage:", error);
      }
    }
    return defaultLayouts;
  });

  // Initialize chart configurations from localStorage first, then try server
  useEffect(() => {
    const savedChartConfigs = localStorage.getItem(CHART_CONFIG_STORAGE_KEY);
    if (savedChartConfigs) {
      try {
        setChartConfigurations(JSON.parse(savedChartConfigs));
      } catch (error) {
        console.error("Error parsing saved chart configurations from localStorage:", error);
        setChartConfigurations(defaultChartConfigurations);
      }
    } else {
      setChartConfigurations(defaultChartConfigurations);
    }
  }, []);

  // Define breakpoints and column numbers for different screen sizes
  const breakpoints = { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 };
  const cols = { lg: 12, md: 12, sm: 12, xs: 1, xxs: 1 };

  // Close add KPI menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (addKPIMenuRef.current && !addKPIMenuRef.current.contains(event.target)) {
        setAddKPIMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch KPI data, layouts, and chart configurations from the backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch KPI data
        const kpiResponse = await axios.get(`${URL}/api/marketing/kpis/${COMPANY_ID}`);
        setKpiData(kpiResponse.data.kpis);
        
        // Set the selected KPIs from the API response
        if (kpiResponse.data.selectedKPIs && Array.isArray(kpiResponse.data.selectedKPIs)) {
          setSelectedKPIs(kpiResponse.data.selectedKPIs);
          
          // Update visibility state based on selectedKPIs
          const newVisibility = { ...visibleKPIs };
          Object.keys(newVisibility).forEach(key => {
            newVisibility[key] = kpiResponse.data.selectedKPIs.includes(key);
          });
          setVisibleKPIs(newVisibility);
        }
        
        // Try to fetch saved layouts from server
        try {
          const layoutResponse = await axios.get(`${URL}/api/marketing/kpis/${COMPANY_ID}/layout`);
          if (layoutResponse.data.success && layoutResponse.data.layout) {
            // Update both state and localStorage with server layout
            setLayouts(layoutResponse.data.layout);
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutResponse.data.layout));
          }
        } catch (layoutError) {
          // If there's no saved layout on the server, we already have a default or localStorage value
          console.log("No saved layout found on server, using default or localStorage");
        }
        
        // Try to fetch saved chart configurations from server
        try {
          const chartConfigResponse = await axios.get(`${URL}/api/marketing/kpis/${COMPANY_ID}/chartConfigurations`);
          if (chartConfigResponse.data.success && chartConfigResponse.data.chartConfigurations) {
            // Convert array of configurations to object format for easier access
            const chartConfigObj = {};
            chartConfigResponse.data.chartConfigurations.forEach(config => {
              chartConfigObj[config.kpiId] = config.chartType;
            });
            
            // If any KPIs don't have configurations, use defaults
            const completeChartConfig = { ...defaultChartConfigurations };
            Object.keys(chartConfigObj).forEach(kpiId => {
              completeChartConfig[kpiId] = chartConfigObj[kpiId];
            });
            
            // Update both state and localStorage
            setChartConfigurations(completeChartConfig);
            localStorage.setItem(CHART_CONFIG_STORAGE_KEY, JSON.stringify(completeChartConfig));
          }
        } catch (chartConfigError) {
          // If there's no saved chart config on the server, we already have defaults or localStorage value
          console.log("No saved chart configurations found on server, using defaults or localStorage");
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete KPI - removes from selected KPIs in database
  const deleteKPI = async (kpiId) => {
    try {
      // First update local state for immediate UI feedback
      setVisibleKPIs(prev => ({
        ...prev,
        [kpiId]: false
      }));
      
      setSelectedKPIs(prev => prev.filter(id => id !== kpiId));
      
      // Update on server
      await axios.delete(`${URL}/api/marketing/kpis/${COMPANY_ID}/deselect/${kpiId}`);
      console.log(`KPI ${kpiId} removed successfully`);
    } catch (error) {
      console.error(`Error removing KPI ${kpiId}:`, error);
      // Revert the UI state if server update fails
      setVisibleKPIs(prev => ({
        ...prev,
        [kpiId]: true
      }));
      setSelectedKPIs(prev => [...prev, kpiId]);
    }
  };

  // Add KPI - adds to selected KPIs in database
  const addKPI = async (kpiId) => {
    try {
      // First update local state for immediate UI feedback
      setVisibleKPIs(prev => ({
        ...prev,
        [kpiId]: true
      }));
      
      setSelectedKPIs(prev => [...prev, kpiId]);
      
      // Update on server
      await axios.put(`${URL}/api/marketing/kpis/${COMPANY_ID}/select`, { kpiId });
      console.log(`KPI ${kpiId} added successfully`);

      // Reset the layout to default if the KPI is added
      const newLayouts = { ...defaultLayouts };
      setLayouts(newLayouts);
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(newLayouts));

      await axios.put(`${URL}/api/marketing/kpis/${COMPANY_ID}/layout`, { layout: newLayouts });
      console.log("Layout reset to default on server successfully");
      
      // Close the menu
      setAddKPIMenuOpen(false);
    } catch (error) {
      console.error(`Error adding KPI ${kpiId}:`, error);
      // Revert the UI state if server update fails
      setVisibleKPIs(prev => ({
        ...prev,
        [kpiId]: false
      }));
      setSelectedKPIs(prev => prev.filter(id => id !== kpiId));
    }
  };

  // Handle layout change - save to localStorage and server with debounce
  const onLayoutChange = (layout, allLayouts) => {
    // Save immediately to localStorage
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
    
    // Update state
    setLayouts(allLayouts);
    
    // Save to server with debounce (using a flag to prevent multiple simultaneous saves)
    if (!savingLayout) {
      setSavingLayout(true);
      
      // Use setTimeout to debounce frequent layout changes
      setTimeout(async () => {
        try {
          await axios.put(`${URL}/api/marketing/kpis/${COMPANY_ID}/layout`, {
            layout: allLayouts
          });
          console.log("Layout saved to server successfully");
        } catch (error) {
          console.error("Failed to save layout to server:", error);
        } finally {
          setSavingLayout(false);
        }
      }, 1000); // Wait 1 second after last change
    }
  };

  // Handle chart type change
  const handleChartTypeChange = async (kpiId, chartType) => {
    console.log(`Chart type for ${kpiId} changed to: ${chartType}`);
    
    // Save immediately to localStorage
    const updatedChartConfigs = { ...chartConfigurations, [kpiId]: chartType };
    setChartConfigurations(updatedChartConfigs);
    localStorage.setItem(CHART_CONFIG_STORAGE_KEY, JSON.stringify(updatedChartConfigs));
    
    // Save to server with debounce (using a flag to prevent multiple simultaneous saves)
    if (!savingChartConfig) {
      setSavingChartConfig(true);
      
      // Use setTimeout to debounce frequent chart type changes
      setTimeout(async () => {
        try {
          await axios.put(`${URL}/api/marketing/kpis/${COMPANY_ID}/chartConfiguration/${kpiId}`, {
            chartType: chartType
          });
          console.log(`Chart type for ${kpiId} saved to server successfully`);
        } catch (error) {
          console.error(`Failed to save chart type for ${kpiId} to server:`, error);
        } finally {
          setSavingChartConfig(false);
        }
      }, 1000); // Wait 1 second after last change
    }
  };

  // Reset layout to default
  const resetLayout = async () => {
    // Reset layout in localStorage
    localStorage.removeItem(LAYOUT_STORAGE_KEY);
    setLayouts(defaultLayouts);
    
    // Reset chart configurations in localStorage
    localStorage.removeItem(CHART_CONFIG_STORAGE_KEY);
    setChartConfigurations(defaultChartConfigurations);
    
    // Reset on server - layout
    try {
      await axios.delete(`${URL}/api/marketing/kpis/${COMPANY_ID}/layout`);
      console.log("Layout reset on server successfully");
    } catch (error) {
      console.error("Failed to reset layout on server:", error);
    }
    
    // Reset on server - chart configurations
    try {
      await axios.delete(`${URL}/api/marketing/kpis/${COMPANY_ID}/chartConfigurations`);
      console.log("Chart configurations reset on server successfully");
    } catch (error) {
      console.error("Failed to reset chart configurations on server:", error);
    }
  };

  const kpiConfigs = [
    {
      id: "customerAcquisitionCost",
      title: "Customer Acquisition Cost ($)",
      data: kpiData?.customerAcquisitionCost || [],
      chartType: chartConfigurations.customerAcquisitionCost || "AreaChart",
      color: "#10B981",
      xKey: "period",
      yKey: "value",
      icon: "💰"
    },
    {
      id: "returnOnMarketingInvestment",
      title: "Return on Marketing Investment (%)",
      data: kpiData?.returnOnMarketingInvestment || [],
      chartType: chartConfigurations.returnOnMarketingInvestment || "LineChart",
      color: "#8B5CF6",
      xKey: "period",
      yKey: "value",
      icon: "📈"
    },
    {
      id: "websiteTraffic",
      title: "Website Traffic",
      data: kpiData?.websiteTraffic || [],
      chartType: chartConfigurations.websiteTraffic || "BarChart",
      color: "#F59E0B",
      xKey: "period",
      yKey: "value",
      icon: "🌐"
    },
    {
      id: "conversionRate",
      title: "Website Conversion Rate (%)",
      data: kpiData?.conversionRate || [],
      chartType: chartConfigurations.conversionRate || "LineChart",
      color: "#EC4899",
      xKey: "period",
      yKey: "value",
      icon: "🎯"
    },
    {
      id: "socialMediaEngagement",
      title: "Social Media Engagement",
      data: kpiData?.socialMediaEngagement || [],
      chartType: chartConfigurations.socialMediaEngagement || "RadarChart",
      color: "#6366F1",
      xKey: "period",
      yKey: "value",
      icon: "👍"
    },
    {
      id: "emailOpenRate",
      title: "Email Open Rate (%)",
      data: kpiData?.emailOpenRate || [],
      chartType: chartConfigurations.emailOpenRate || "LineChart",
      color: "#14B8A6",
      xKey: "period",
      yKey: "value",
      icon: "✉️"
    },
    {
      id: "clickThroughRate",
      title: "Click Through Rate (%)",
      data: kpiData?.clickThroughRate || [],
      chartType: chartConfigurations.clickThroughRate || "AreaChart",
      color: "#06B6D4",
      xKey: "period",
      yKey: "value",
      icon: "👆"
    },
    {
      id: "leadGenerationVolume",
      title: "Lead Generation Volume",
      data: kpiData?.leadGenerationVolume || [],
      chartType: chartConfigurations.leadGenerationVolume || "BarChart",
      color: "#F43F5E",
      xKey: "period",
      yKey: "value",
      icon: "🧲"
    },
    {
      id: "marketingQualifiedLeads",
      title: "Marketing Qualified Leads",
      data: kpiData?.marketingQualifiedLeads || [],
      chartType: chartConfigurations.marketingQualifiedLeads || "LineChart",
      color: "#0EA5E9",
      xKey: "period",
      yKey: "value",
      icon: "✅"
    },
    {
      id: "campaignROI",
      title: "Campaign ROI (%)",
      data: kpiData?.campaignROI || [],
      chartType: chartConfigurations.campaignROI || "PieChart",
      color: "#8B5CF6",
      xKey: "campaign",
      yKey: "value",
      icon: "💹"
    }
  ];

  if (loading) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl font-semibold">Loading dashboard data...</div>
    </div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen">
      <div className="text-xl font-semibold text-red-500">Error: {error}</div>
    </div>;
  }

  return (
    <div className="p-6 min-h-screen relative">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-4">Marketing Dashboard</h1>
          <p className="mb-2">Displaying {selectedKPIs.length} selected KPIs</p>
        </div>
        <button 
          onClick={resetLayout}
          className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors flex items-center shadow-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset Layout
        </button>
      </div>
      
      {/* Add KPI Floating Button */}
      <div className="fixed bottom-8 right-8 z-10">
        <div className="relative" ref={addKPIMenuRef}>
          {/* KPI Selection Menu */}
          {addKPIMenuOpen && (
            <div className="absolute bottom-16 right-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 w-64 border dark:border-gray-700">
              <h3 className="font-semibold mb-3 text-gray-800 dark:text-white">Add KPI</h3>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {kpiConfigs
                  .filter(config => !selectedKPIs.includes(config.id))
                  .map(config => (
                    <div 
                      key={config.id}
                      className="flex items-center p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded cursor-pointer"
                      onClick={() => addKPI(config.id)}
                    >
                      <span className="mr-2">{config.icon}</span>
                      <span>{config.title}</span>
                    </div>
                  ))}
                {kpiConfigs.filter(config => !selectedKPIs.includes(config.id)).length === 0 && (
                  <p className="text-gray-500 text-sm italic">All KPIs are already displayed</p>
                )}
              </div>
            </div>
          )}
          
          {/* Add KPI Button */}
          <button
            onClick={() => setAddKPIMenuOpen(prev => !prev)}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
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
        {kpiConfigs
          .filter(config => visibleKPIs[config.id])
          .map((config) => (
            <div key={config.id} className={`${theme.cardBg} ${theme.border} rounded-lg overflow-hidden border`}>
              <DraggableKPIChartCard
                initialChartType={config.chartType}
                title={config.title}
                data={config.data}
                xKey={config.xKey}
                yKey={config.yKey}
                color={config.color}
                onDelete={() => deleteKPI(config.id)}
                onChartTypeChange={(type) => handleChartTypeChange(config.id, type)} // Updated to use handleChartTypeChange
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

export default MarketingDashboardPage;