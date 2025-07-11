import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const RadarChartComponent = ({
  data = [],
  xKey = "subject",
  yKey = "value",
  color = "#8B5CF6",
  theme,
}) => {
  // Use theme object properly for dark mode detection
  const isDarkMode = theme?.cardBg?.includes('bg-gray-800') || false;
  
  const chartTheme = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    textColor: isDarkMode ? '#f1f5f9' : '#0f172a',
    gridColor: isDarkMode ? 'rgba(148, 163, 184, 0.1)' : 'rgba(148, 163, 184, 0.2)',
    tooltipBg: isDarkMode ? 'rgba(31, 41, 55, 0.95)' : 'rgba(255, 255, 255, 0.95)',
    tooltipBorder: isDarkMode ? '#4b5563' : '#e2e8f0',
    tooltipText: isDarkMode ? '#f1f5f9' : '#0f172a',
  };

  // Format numbers with commas
  const formatNumber = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  // Calculate domain based on data
  const calculateDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    const values = data.map(item => item[yKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1;
    return [
      Math.floor(Math.max(0, min - padding)),
      Math.ceil(max + padding)
    ];
  };

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { subject, value } = payload[0].payload;
      return (
        <div className={`${theme.cardBg} p-3 rounded-lg shadow-lg border ${theme.border}`}>
          <p className={`font-medium ${theme.text} mb-1`}>{subject}</p>
          <p 
            className="text-sm"
            style={{ color: color }}
          >
            Value: {formatNumber(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Handle empty data state
  if (!data || data.length === 0) {
    return (
      <motion.div 
        className={`w-full h-80 flex items-center justify-center ${theme.cardBg} rounded-lg`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className={theme.textSecondary}>No data available</p>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart 
          data={data}
          margin={{ top: 20, right: 30, left: 30, bottom: 20 }}
        >
          <PolarGrid 
            stroke={chartTheme.gridColor}
            strokeDasharray="3 3"
          />
          <PolarAngleAxis
            dataKey={xKey}
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 12,
              dy: 4
            }}
            stroke={chartTheme.textColor}
            axisLine={{ stroke: chartTheme.textColor }}
          />
          <PolarRadiusAxis
            angle={30}
            domain={calculateDomain()}
            tick={{ 
              fill: chartTheme.textColor, 
              fontSize: 12
            }}
            stroke={chartTheme.textColor}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            tickFormatter={formatNumber}
          />
          <Radar
            name="Value"
            dataKey={yKey}
            stroke={color}
            fill={color}
            fillOpacity={0.2}
            dot={{ 
              fill: chartTheme.background,
              stroke: color,
              strokeWidth: 2,
              r: 3
            }}
            activeDot={{ 
              fill: chartTheme.background,
              stroke: color,
              strokeWidth: 2,
              r: 5
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default RadarChartComponent;
