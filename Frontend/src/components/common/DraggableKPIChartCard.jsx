import { useState, useRef } from "react";
import "react-resizable/css/styles.css";
import { useTheme } from "../../context/ThemeContext";

import AreaChartComponent from "../charts/AreaChart";
import BarChartComponent from "../charts/BarChart";
import ComposedChartComponent from "../charts/ComposedChart";
import LineChartComponent from "../charts/LineChart";
import PieChartComponent from "../charts/PieChart";
import RadarChartComponent from "../charts/RadarChart";
import RadialBarChartComponent from "../charts/RadialBarChart";
import ScatterChartComponent from "../charts/ScatterChart";

const DraggableKPIChartCard = ({ 
  initialChartType = "AreaChart",
  title,
  data,
  xKey,
  yKey,
  color = "#3B82F6",
  onDelete,
  width = "100%",
  height = "100%",
  className = ""
}) => {
  const [chartType, setChartType] = useState(initialChartType);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const chartContainerRef = useRef(null);
  const { theme } = useTheme();

  const chartTypes = [
    "AreaChart", 
    "BarChart", 
    "ComposedChart", 
    "LineChart", 
    "PieChart", 
    "RadarChart", 
    "RadialBarChart", 
    "ScatterChart"
  ];

  const selectChartType = (type, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setChartType(type);
    setIsDropdownOpen(false);
  };

  const handleDropdownClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleDeleteClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onDelete?.();
  };

  const getCurrentChartTypeName = () => {
    return chartType.replace(/([A-Z])/g, ' $1').trim();
  };

  // Determine which chart to render based on selected type
  const renderChart = () => {
    const commonProps = {
      data,
      color,
      theme,
    };

    switch (chartType) {
      case "AreaChart":
        return <AreaChartComponent {...commonProps} xKey={xKey} yKey={yKey} />;
      case "BarChart":
        return <BarChartComponent {...commonProps} xKey={xKey} yKey={yKey} />;
      case "ComposedChart":
        return (
          <ComposedChartComponent
            {...commonProps}
            areaKey={yKey}
            barKey={yKey}
            lineKey={yKey}
          />
        );
      case "LineChart":
        return <LineChartComponent {...commonProps} xKey={xKey} yKey={yKey} />;
      case "PieChart":
        return <PieChartComponent {...commonProps} valueKey={yKey} nameKey={xKey} />;
      case "RadarChart":
        return <RadarChartComponent {...commonProps} xKey={xKey} yKey={yKey} />;
      case "RadialBarChart":
        return <RadialBarChartComponent {...commonProps} dataKey={yKey} />;
      case "ScatterChart":
        return <ScatterChartComponent {...commonProps} yKey={yKey} />;
      default:
        return <AreaChartComponent {...commonProps} xKey={xKey} yKey={yKey} />;
    }
  };

  return (
    <div 
      className={`w-full h-full bg-card text-card-foreground rounded-xl flex flex-col relative group overflow-hidden border border-border/40 transition-all duration-300 hover:shadow-xl hover:border-border/80 ${className}`}
      ref={chartContainerRef}
      style={{ width, height }}
    >
      {/* Glassmorphism Header with Controls */}
      <div className={`h-14 bg-card/95 backdrop-blur-md px-4 flex items-center justify-between z-10 border-b border-border/30 transition-all duration-300`}>
        {/* Left side with drag handle */}
        <div className="flex items-center space-x-2">
          <div className={`drag-handle cursor-move px-3 py-1.5 text-foreground/80 hover:text-foreground hover:bg-muted/70 rounded-lg text-sm font-medium transition-all duration-200 flex items-center`}>
            <svg className="w-4 h-4 mr-1.5 text-foreground/70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8h16M4 16h16" />
            </svg>
            Move
          </div>
          
          {/* Delete Button */}
          {onDelete && (
            <button
              onClick={handleDeleteClick}
              className={`opacity-0 group-hover:opacity-100 transition-all duration-300 px-3 py-1.5 text-foreground/70 hover:text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-medium flex items-center focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-1 focus:ring-offset-background`}
              aria-label="Delete chart"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Remove
            </button>
          )}
        </div>

        {/* Chart Type Selector */}
        <div className="relative">
          <button
            onClick={handleDropdownClick}
            className={`flex items-center text-sm font-medium text-foreground/90 hover:text-foreground bg-muted/50 hover:bg-muted/80 rounded-lg px-3 py-1.5 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-1 focus:ring-offset-background`}
            aria-expanded={isDropdownOpen}
            aria-haspopup="true"
          >
            <svg 
              className="w-4 h-4 mr-2 text-primary" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>{getCurrentChartTypeName()}</span>
            <svg
              className={`ml-2 w-4 h-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>

          {isDropdownOpen && (
            <div 
              className={`absolute right-0 mt-1 w-52 bg-card/95 backdrop-blur-md rounded-xl shadow-lg shadow-black/5 z-20 border border-border/40 py-1 animate-in fade-in-0 zoom-in-95 overflow-hidden`}
              role="menu"
            >
              <div className="px-2 py-1.5 text-xs font-semibold text-foreground/50 border-b border-border/20 mb-1">
                Chart Type
              </div>
              {chartTypes.map((type) => (
                <button
                  key={type}
                  className={`block w-full text-left px-3 py-2 text-sm transition-colors duration-150 ${
                    chartType === type
                      ? `text-primary bg-primary/10 font-medium`
                      : `text-foreground/80 hover:text-foreground hover:bg-muted/50`
                  }`}
                  onClick={(e) => selectChartType(type, e)}
                  role="menuitem"
                >
                  {type.replace(/([A-Z])/g, ' $1').trim()}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Title with subtle gradient underline */}
      <div className="px-5 py-4">
        <h3 className={`font-medium text-foreground text-lg transition-colors duration-200 inline-block`}>
          {title}
          <div className="h-0.5 w-1/3 bg-gradient-to-r from-primary/60 to-transparent rounded-full mt-1"></div>
        </h3>
      </div>

      {/* Chart Container with improved padding and scroll handling */}
      <div className="flex-1 min-h-0 px-3 pb-5 scrollbar-custom">
        <div className="h-full w-full transition-all duration-300">
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

export default DraggableKPIChartCard;