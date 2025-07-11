import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const BarChartComponent = ({
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

  const formatNumber = (value) => {
    if (typeof value === "number") {
      return value.toLocaleString();
    }
    return value;
  };

  const calculateYDomain = () => {
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

  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="w-full h-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="text-muted-foreground">No data available</p>
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
        <BarChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id={`barGradient-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={color} stopOpacity={0.3}/>
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={chartTheme.gridColor}
            vertical={false}
          />
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
            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
            formatter={(value) => formatNumber(value)}
          />
          <Legend
            wrapperStyle={{
              paddingTop: '20px',
              color: chartTheme.textColor,
            }}
          />
          <Bar
            dataKey={yKey}
            fill={`url(#barGradient-${color.replace('#', '')})`}
            stroke={color}
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default BarChartComponent;
