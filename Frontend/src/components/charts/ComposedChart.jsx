import { motion } from "framer-motion";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const ComposedChartComponent = ({
  data = [],
  xKey = "name",
  areaKey = "amt",
  barKey = "pv",
  lineKey = "uv",
  colors = {
    area: "#8B5CF6",
    bar: "#10B981",
    line: "#F59E0B"
  },
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

  // Calculate Y-axis domain based on all data series
  const calculateYDomain = () => {
    if (!data || data.length === 0) return [0, 100];
    const allValues = data.reduce((acc, item) => {
      acc.push(item[areaKey], item[barKey], item[lineKey]);
      return acc;
    }, []);
    const min = Math.min(...allValues);
    const max = Math.max(...allValues);
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

  // Custom tooltip content
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className={`${theme.cardBg} p-3 rounded-lg shadow-lg border ${theme.border}`}>
          <p className={`font-medium ${theme.text} mb-1`}>{label}</p>
          {payload.map((entry) => (
            <p
              key={entry.name}
              className={`text-sm ${theme.textSecondary}`}
              style={{ color: entry.color }}
            >
              {entry.name}: {formatNumber(entry.value)}
            </p>
          ))}
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart 
          data={data}
          margin={{ top: 20, right: 30, left: 50, bottom: 50 }}
        >
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={chartTheme.gridColor} 
          />
          <XAxis 
            dataKey={xKey} 
            stroke={chartTheme.textColor}
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dy={16}
                  textAnchor="end"
                  fill={chartTheme.textColor}
                  transform={`rotate(${calculateXAxisTickRotation()})`}
                >
                  {payload.value}
                </text>
              </g>
            )}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            height={60}
            label={{ 
              value: xKey.charAt(0).toUpperCase() + xKey.slice(1), 
              position: 'insideBottom',
              offset: -10,
              style: { fill: chartTheme.textColor }
            }}
          />
          <YAxis 
            stroke={chartTheme.textColor}
            domain={calculateYDomain()}
            tick={({ x, y, payload }) => (
              <g transform={`translate(${x},${y})`}>
                <text
                  x={0}
                  y={0}
                  dx={-10}
                  textAnchor="end"
                  fill={chartTheme.textColor}
                >
                  {formatNumber(payload.value)}
                </text>
              </g>
            )}
            tickLine={{ stroke: chartTheme.textColor }}
            axisLine={{ stroke: chartTheme.textColor }}
            label={{ 
              value: "Value", 
              angle: -90, 
              position: 'insideLeft',
              offset: -35,
              style: { 
                fill: chartTheme.textColor,
                textAnchor: 'middle'
              }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            formatter={(value) => (
              <span style={{ color: chartTheme.textColor }}>{value}</span>
            )}
            wrapperStyle={{
              paddingTop: '20px'
            }}
          />

          {/* Area Chart */}
          <defs>
            <linearGradient id={`colorGradient-${colors.area.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={colors.area} stopOpacity={0.3}/>
              <stop offset="95%" stopColor={colors.area} stopOpacity={0.05}/>
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={areaKey}
            name="Area"
            stroke={colors.area}
            fill={`url(#colorGradient-${colors.area.replace('#', '')})`}
            strokeWidth={2}
            dot={false}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* Bar Chart */}
          <defs>
            <linearGradient id={`barGradient-${colors.bar.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={colors.bar} stopOpacity={0.8}/>
              <stop offset="100%" stopColor={colors.bar} stopOpacity={0.5}/>
            </linearGradient>
          </defs>
          <Bar
            dataKey={barKey}
            name="Bar"
            fill={`url(#barGradient-${colors.bar.replace('#', '')})`}
            stroke={colors.bar}
            strokeWidth={1}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />

          {/* Line Chart */}
          <Line
            type="monotone"
            dataKey={lineKey}
            name="Line"
            stroke={colors.line}
            strokeWidth={2}
            dot={{ 
              stroke: colors.line,
              strokeWidth: 2,
              r: 4,
              fill: chartTheme.background
            }}
            activeDot={{ 
              stroke: colors.line,
              strokeWidth: 2,
              r: 6,
              fill: chartTheme.background
            }}
            isAnimationActive={true}
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </motion.div>
  );
};

export default ComposedChartComponent;
