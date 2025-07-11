import { motion } from "framer-motion";
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ZAxis,
} from "recharts";

const ScatterChartComponent = ({
  datasets = [],
  xLabel = "X",
  yLabel = "Y",
  unitX = "",
  unitY = "",
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

  // Format numbers with commas and units
  const formatNumber = (value, unit) => {
    if (typeof value === "number") {
      return `${value.toLocaleString()}${unit}`;
    }
    return value;
  };

  // Calculate domain based on all datasets
  const calculateDomain = (key) => {
    if (!datasets || datasets.length === 0) return [0, 100];
    const allValues = datasets.reduce((acc, dataset) => {
      acc.push(...dataset.data.map(item => item[key]));
      return acc;
    }, []);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
    const padding = (max - min) * 0.1;
    return [
      Math.floor(min - padding),
      Math.ceil(max + padding)
    ];
  };

  // Custom tooltip content
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const { name, fill } = payload[0];
      const { x, y } = payload[0].payload;
      return (
        <div className={`${theme.cardBg} p-3 rounded-lg shadow-lg border ${theme.border}`}>
          <p className={`font-medium ${theme.text} mb-1`}>{name}</p>
          <p 
            className="text-sm"
            style={{ color: fill }}
          >
            {xLabel}: {formatNumber(x, unitX)}
          </p>
          <p 
            className="text-sm"
            style={{ color: fill }}
          >
            {yLabel}: {formatNumber(y, unitY)}
          </p>
        </div>
      );
    }
    return null;
  };

  // Custom legend content
  const CustomLegend = ({ payload }) => {
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry) => (
          <li key={entry.value} className="flex items-center gap-2">
            <span
              className="w-3 h-3 rounded"
              style={{ backgroundColor: entry.color }}
            />
            <span className={`text-sm ${theme.text}`}>
              {entry.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  // Handle empty data state
  if (!datasets || datasets.length === 0) {
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
        <ScatterChart
          margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.gridColor} 
          />
          <XAxis 
            type="number"
            dataKey="x" 
            name={xLabel}
            domain={calculateDomain('x')}
            tick={{ 
              fill: chartTheme.textColor,
              fontSize: 12
            }}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            tickFormatter={value => formatNumber(value, unitX)}
            label={{ 
              value: xLabel,
              position: 'insideBottom',
              offset: -10,
              fill: chartTheme.textColor
            }}
          />
          <YAxis 
            type="number"
            dataKey="y"
            name={yLabel}
            domain={calculateDomain('y')}
            tick={{ 
              fill: chartTheme.textColor,
              fontSize: 12
            }}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            tickFormatter={value => formatNumber(value, unitY)}
            label={{ 
              value: yLabel,
              angle: -90,
              position: 'insideLeft',
              offset: -35,
              fill: chartTheme.textColor
            }}
          />
          <ZAxis 
            type="number" 
            range={[60, 400]}
            scale="pow"
          />
          <Tooltip 
            cursor={{ stroke: chartTheme.gridColor }}
            contentStyle={{
              backgroundColor: chartTheme.tooltipBg,
              border: `1px solid ${chartTheme.tooltipBorder}`,
              borderRadius: '6px',
              boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
            }}
            labelStyle={{ color: chartTheme.tooltipText }}
            itemStyle={{ color: chartTheme.tooltipText }}
            content={<CustomTooltip />}
          />
          <Legend
            content={<CustomLegend />}
            wrapperStyle={{
              color: chartTheme.textColor,
            }}
          />
          {datasets.map((set, index) => (
            <Scatter
              key={set.name}
              name={set.name}
              data={set.data}
              fill={set.fill}
              shape={set.shape || "circle"}
              isAnimationActive={true}
              animationBegin={index * 200}
              animationDuration={1000}
              animationEasing="ease-out"
            />
          ))}
        </ScatterChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ScatterChartComponent;
