import { useState, useEffect, useRef } from "react";
import { Responsive, WidthProvider } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import DraggableKPIChartCard from "../components/common/DraggableKPIChartCard";
import { useTheme } from "../context/ThemeContext";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const ResponsiveGridLayout = WidthProvider(Responsive);
const URL = import.meta.env.VITE_BACKEND_URL;
const LAYOUT_STORAGE_KEY = "production-dashboard-layouts";
const CHART_CONFIG_STORAGE_KEY = "production-dashboard-chart-config";

const ProductionDashboardPage = () => {
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

  const COMPANY_ID = user?.companyId;

  // KPI visibility states
  const [visibleKPIs, setVisibleKPIs] = useState({
    productionVolume: false,
    productionEfficiency: false,
    downtime: false,
    cycleTime: false,
    yieldRate: false,
    reworkRate: false,
    scrapRate: false,
    capacityUtilization: false,
    oee: false,
    onTimeProduction: false
  });

  // Mapping between frontend KPI IDs and backend schema fields
  const kpiMapping = {
    productionVolume: 'productionVolume',
    productionEfficiency: 'productionEfficiency',
    downtime: 'downtime',
    cycleTime: 'cycleTime',
    yieldRate: 'yieldRate',
    reworkRate: 'reworkRate',
    scrapRate: 'scrapRate',
    capacityUtilization: 'capacityUtilization',
    oee: 'overallEquipmentEffectiveness',
    onTimeProduction: 'onTimeProductionRate'
  };

  // Chart configurations state
  const [chartConfigurations, setChartConfigurations] = useState({});

  // Default chart configurations
  const defaultChartConfigurations = {
    productionVolume: "BarChart",
    productionEfficiency: "LineChart",
    downtime: "AreaChart",
    cycleTime: "LineChart",
    yieldRate: "LineChart",
    reworkRate: "AreaChart",
    scrapRate: "AreaChart",
    capacityUtilization: "BarChart",
    oee: "LineChart",
    onTimeProduction: "LineChart"
  };

  // Layout configuration
  const defaultLayout = [
    { i: "productionVolume", x: 0, y: 0, w: 6, h: 4 },
    { i: "productionEfficiency", x: 6, y: 0, w: 6, h: 4 },
    { i: "downtime", x: 0, y: 4, w: 6, h: 4 },
    { i: "cycleTime", x: 6, y: 4, w: 6, h: 4 },
    { i: "yieldRate", x: 0, y: 8, w: 6, h: 4 },
    { i: "reworkRate", x: 6, y: 8, w: 6, h: 4 },
    { i: "scrapRate", x: 0, y: 12, w: 6, h: 4 },
    { i: "capacityUtilization", x: 6, y: 12, w: 6, h: 4 },
    { i: "oee", x: 0, y: 16, w: 6, h: 4 },
    { i: "onTimeProduction", x: 6, y: 16, w: 6, h: 4 }
  ];

  const defaultLayouts = {
    lg: defaultLayout,
    md: defaultLayout,
    sm: defaultLayout.map(item => ({ ...item, w: 12, h: 4 }))
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
        const response = await axios.get(`${URL}/api/production/kpis/${COMPANY_ID}`);
        setKpiData(response.data.kpis);
        
        // Map backend schema KPI names to frontend IDs for selection
        if (response.data.selectedKPIs && Array.isArray(response.data.selectedKPIs)) {
          const mappedSelectedKPIs = response.data.selectedKPIs.map(kpiName => {
            const entry = Object.entries(kpiMapping).find(([_, value]) => value === kpiName);
            return entry ? entry[0] : null;
          }).filter(id => id !== null);
          
          setSelectedKPIs(mappedSelectedKPIs);
          
          // Update visibility state based on selectedKPIs
          const newVisibility = { ...visibleKPIs };
          Object.keys(newVisibility).forEach(key => {
            newVisibility[key] = mappedSelectedKPIs.includes(key);
          });
          setVisibleKPIs(newVisibility);
        }
        
        // Try to fetch saved layouts from server
        try {
          const layoutResponse = await axios.get(`${URL}/api/production/kpis/${COMPANY_ID}/layout`);
          if (layoutResponse.data.success && layoutResponse.data.layout) {
            setLayouts(layoutResponse.data.layout);
            localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layoutResponse.data.layout));
          }
        } catch (layoutError) {
          console.log("No saved layout found on server, using default or localStorage");
        }
        
        // Try to fetch saved chart configurations from server
        try {
          const chartConfigResponse = await axios.get(`${URL}/api/production/kpis/${COMPANY_ID}/chartConfigurations`);
          if (chartConfigResponse.data.success && chartConfigResponse.data.chartConfigurations) {
            const chartConfigObj = {};
            chartConfigResponse.data.chartConfigurations.forEach(config => {
              chartConfigObj[config.kpiId] = config.chartType;
            });
            
            const completeChartConfig = { ...defaultChartConfigurations };
            Object.keys(chartConfigObj).forEach(kpiId => {
              completeChartConfig[kpiId] = chartConfigObj[kpiId];
            });
            
            setChartConfigurations(completeChartConfig);
            localStorage.setItem(CHART_CONFIG_STORAGE_KEY, JSON.stringify(completeChartConfig));
          }
        } catch (chartConfigError) {
          console.log("No saved chart configurations found on server, using defaults or localStorage");
        }
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch dashboard data");
        setLoading(false);
      }
    };

    fetchData();
  }, [COMPANY_ID]);

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
      await axios.put(`${URL}/api/production/kpis/${COMPANY_ID}/select`, { kpiId });
      console.log(`KPI ${kpiId} added successfully`);

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
      await axios.delete(`${URL}/api/production/kpis/${COMPANY_ID}/deselect/${kpiId}`);
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

  // Handle layout change - save to localStorage and server with debounce
  const onLayoutChange = (layout, allLayouts) => {
    // Save immediately to localStorage
    localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(allLayouts));
    
    // Update state
    setLayouts(allLayouts);
    
    // Save to server with debounce
    if (!savingLayout) {
      setSavingLayout(true);
      
      setTimeout(async () => {
        try {
          await axios.put(`${URL}/api/production/kpis/${COMPANY_ID}/layout`, {
            layout: allLayouts
          });
          console.log("Layout saved to server successfully");
        } catch (error) {
          console.error("Failed to save layout to server:", error);
        } finally {
          setSavingLayout(false);
        }
      }, 1000);
    }
  };

  // Handle chart type change
  const handleChartTypeChange = async (kpiId, chartType) => {
    // Update local state
    const updatedChartConfigs = { ...chartConfigurations, [kpiId]: chartType };
    setChartConfigurations(updatedChartConfigs);
    localStorage.setItem(CHART_CONFIG_STORAGE_KEY, JSON.stringify(updatedChartConfigs));
    
    // Save to server with debounce
    if (!savingChartConfig) {
      setSavingChartConfig(true);
      
      setTimeout(async () => {
        try {
          await axios.put(`${URL}/api/production/kpis/${COMPANY_ID}/chartConfiguration/${kpiId}`, {
            chartType: chartType
          });
          console.log(`Chart type for ${kpiId} saved to server successfully`);
        } catch (error) {
          console.error(`Failed to save chart type for ${kpiId} to server:`, error);
        } finally {
          setSavingChartConfig(false);
        }
      }, 1000);
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
      await axios.delete(`${URL}/api/production/kpis/${COMPANY_ID}/layout`);
      console.log("Layout reset on server successfully");
    } catch (error) {
      console.error("Failed to reset layout on server:", error);
    }
    
    // Reset on server - chart configurations
    try {
      await axios.delete(`${URL}/api/production/kpis/${COMPANY_ID}/chartConfigurations`);
      console.log("Chart configurations reset on server successfully");
    } catch (error) {
      console.error("Failed to reset chart configurations on server:", error);
    }
  };

  const kpiConfigs = [
    {
      id: "productionVolume",
      title: "Production Volume (Units)",
      data: kpiData?.productionVolume || [],
      chartType: chartConfigurations.productionVolume || "BarChart",
      color: "#10B981",
      xKey: "month",
      yKey: "value",
      icon: "📦"
    },
    {
      id: "productionEfficiency",
      title: "Production Efficiency (%)",
      data: kpiData?.productionEfficiency || [],
      chartType: chartConfigurations.productionEfficiency || "LineChart",
      color: "#8B5CF6",
      xKey: "month",
      yKey: "value",
      icon: "⚡"
    },
    {
      id: "downtime",
      title: "Downtime (Hours)",
      data: kpiData?.downtime || [],
      chartType: chartConfigurations.downtime || "AreaChart",
      color: "#F59E0B",
      xKey: "month",
      yKey: "value",
      icon: "⏰"
    },
    {
      id: "cycleTime",
      title: "Cycle Time (Minutes)",
      data: kpiData?.cycleTime || [],
      chartType: chartConfigurations.cycleTime || "LineChart",
      color: "#EC4899",
      xKey: "month",
      yKey: "value",
      icon: "⏱️"
    },
    {
      id: "yieldRate",
      title: "Yield Rate (%)",
      data: kpiData?.yieldRate || [],
      chartType: chartConfigurations.yieldRate || "LineChart",
      color: "#14B8A6",
      xKey: "month",
      yKey: "value",
      icon: "📈"
    },
    {
      id: "reworkRate",
      title: "Rework Rate (%)",
      data: kpiData?.reworkRate || [],
      chartType: chartConfigurations.reworkRate || "AreaChart",
      color: "#6366F1",
      xKey: "month",
      yKey: "value",
      icon: "🔄"
    },
    {
      id: "scrapRate",
      title: "Scrap Rate (%)",
      data: kpiData?.scrapRate || [],
      chartType: chartConfigurations.scrapRate || "AreaChart",
      color: "#F43F5E",
      xKey: "month",
      yKey: "value",
      icon: "🗑️"
    },
    {
      id: "capacityUtilization",
      title: "Capacity Utilization (%)",
      data: kpiData?.capacityUtilization || [],
      chartType: chartConfigurations.capacityUtilization || "BarChart",
      color: "#0EA5E9",
      xKey: "month",
      yKey: "value",
      icon: "📊"
    },
    {
      id: "oee",
      title: "Overall Equipment Effectiveness (%)",
      data: kpiData?.overallEquipmentEffectiveness || [],
      chartType: chartConfigurations.oee || "LineChart",
      color: "#A855F7",
      xKey: "month",
      yKey: "value",
      icon: "⚙️"
    },
    {
      id: "onTimeProduction",
      title: "On-Time Production Rate (%)",
      data: kpiData?.onTimeProductionRate || [],
      chartType: chartConfigurations.onTimeProduction || "LineChart",
      color: "#F97316",
      xKey: "month",
      yKey: "value",
      icon: "⏲️"
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
          <h1 className="text-2xl font-bold mb-4">Production Dashboard</h1>
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

      {/* Display no KPIs message if none are selected */}
      {selectedKPIs.length === 0 && (
        <div className={`${theme.textColor} mb-4 p-4 rounded-lg bg-yellow-100 dark:bg-yellow-900`}>
          No KPIs selected. Please add KPIs using the + button.
        </div>
      )}
      
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
                onChartTypeChange={(type) => handleChartTypeChange(config.id, type)}
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

export default ProductionDashboardPage;