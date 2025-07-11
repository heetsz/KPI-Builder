import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const LineChartComponent = ({
  data = [],
  xKey = "name",
  yKey = "value",
  color = "#10B981",
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

  // Format numbers with commas and currency symbol
  const formatNumber = (value) => {
    if (typeof value === "number") {
      return `$${value.toLocaleString()}`;
    }
    return value;
  };

  // Calculate Y-axis domain based on data
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    const values = data.map(item => item[yKey]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const padding = (max - min) * 0.1; // Add 10% padding
    return [
      Math.floor(Math.max(0, min - padding)), // Don't go below 0 unless data is negative
      Math.ceil(max + padding)
    ];
  };

  // Calculate angle for x-axis labels based on length
  const calculateXAxisTickRotation = () => {
    return data.length > 6 ? -45 : 0;
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <LineChart 
          data={data}
          margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.2}/>
              <stop offset="95%" stopColor={color} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={chartTheme.gridColor} vertical={false} />
          <XAxis 
            dataKey={xKey} 
            stroke={chartTheme.textColor}
            tick={{ 
              fill: chartTheme.textColor,
              fontSize: 12
            }}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
          />
          <YAxis 
            stroke={chartTheme.textColor}
            tick={{ 
              fill: chartTheme.textColor,
              fontSize: 12
            }}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            domain={calculateYDomain()}
            tickFormatter={formatNumber}
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
            formatter={(value) => formatNumber(value)}
            cursor={{ stroke: chartTheme.gridColor, strokeWidth: 1 }}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: chartTheme.textColor,
            }}
          />
          <Line
            type="monotone"
            dataKey={yKey}
            stroke={color}
            strokeWidth={2}
            dot={{ 
              fill: chartTheme.background,
              stroke: color,
              strokeWidth: 2,
              r: 4
            }}
            activeDot={{ 
              fill: chartTheme.background,
              stroke: color,
              strokeWidth: 2,
              r: 6
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default LineChartComponent;
