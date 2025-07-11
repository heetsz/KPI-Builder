import { motion } from "framer-motion";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const RadialBarChartComponent = ({
  data = [],
  dataKey = "value",
  colors = [
    "#3B82F6", // blue
    "#10B981", // green
    "#F59E0B", // yellow
    "#EF4444", // red
    "#8B5CF6", // purple
    "#EC4899", // pink
  ],
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

  // Format numbers with commas and percentage
  const formatNumber = (value) => {
    if (typeof value === "number") {
      return `${value.toLocaleString()}%`;
    }
    return value;
  };

  // Calculate domain based on data
  const calculateDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    const values = data.map(item => item.value);
    const max = Math.max(...values);
    return [0, Math.ceil(max * 1.1)]; // Add 10% padding to max
  };

  // Sort data by value descending for better visual hierarchy
  const sortedData = [...data].sort((a, b) => b.value - a.value);

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, value, fill } = payload[0].payload;
      return (
        <div className={`${theme.cardBg} p-3 rounded-lg shadow-lg border ${theme.border}`}>
          <p className={`font-medium ${theme.text} mb-1`}>{name}</p>
          <p 
            className="text-sm"
            style={{ color: fill }}
          >
            Progress: {formatNumber(value)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend content
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-col gap-2 px-4">
        {payload.map((entry) => (
          <li key={entry.value} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className={`text-sm ${theme.text}`}>
                {entry.payload.name}
              </span>
            </div>
            <span className={`text-sm ${theme.text}`}>
              {formatNumber(entry.payload.value)}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Handle empty data state
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          cx="50%"
          cy="50%"
          innerRadius="20%"
          outerRadius="90%"
          barSize={20}
          data={sortedData}
          startAngle={90}
          endAngle={-270}
        >
          <RadialBar
            label={{
              fill: chartTheme.textColor,
              position: 'insideStart',
              fontSize: 12,
            }}
            background={{ fill: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}
            dataKey={dataKey}
            cornerRadius={15}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          >
            {sortedData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={colors[index % colors.length]}
                stroke={chartTheme.background}
                strokeWidth={2}
              />
            ))}
          </RadialBar>
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
          />
          <Legend
            iconType="circle"
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              paddingLeft: '24px',
              color: chartTheme.textColor,
            }}
            content={<CustomLegend />}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default RadialBarChartComponent;
