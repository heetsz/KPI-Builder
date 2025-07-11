import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

/**
 * This component renders a modern pie chart with guaranteed color separation.
 * Each segment will have a visually distinct color from its neighbors.
 */
const PieChartComponent = ({
  data = [],
  nameKey = "name",
  valueKey = "value",
  theme,
  title,
}) => {
  // Theme detection
  const isDarkMode = theme?.cardBg?.includes('bg-gray-800') || false;
  
  const chartTheme = {
    background: isDarkMode ? '#1f2937' : '#ffffff',
    textColor: isDarkMode ? '#f1f5f9' : '#0f172a',
    tooltipBg: isDarkMode ? 'rgba(15, 23, 42, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    tooltipBorder: isDarkMode ? '#374151' : '#e2e8f0',
    tooltipText: isDarkMode ? '#f1f5f9' : '#0f172a',
    legendText: isDarkMode ? '#e2e8f0' : '#1e293b',
  };

  // Colors guaranteed to be visually distinct from each other
  // These are handpicked to ensure maximum visual difference
  const DISTINCT_COLORS = [
    "#FF3B30", // Red
    "#34C759", // Green
    "#007AFF", // Blue
    "#FF9500", // Orange
    "#AF52DE", // Purple
    "#FFD60A", // Yellow
    "#5856D6", // Indigo
    "#00C7BE", // Teal
    "#FF2D55", // Pink
    "#8E8E93", // Gray
    "#64D2FF", // Light Blue
    "#FF9F0A", // Yellow/Orange
    "#5E5CE6", // Blue/Purple
    "#BF5AF2", // Light Purple
    "#30D158", // Light Green
  ];

  // Manually assign colors to guarantee no similar colors are adjacent
  const assignGuaranteedDistinctColors = (inputData) => {
    if (!inputData || inputData.length <= 1) return inputData;
    
    // Create a copy of the data to avoid mutating the original
    const processedData = [...inputData];
    
    // Determine coloring strategy based on data size
    if (processedData.length <= DISTINCT_COLORS.length) {
      // For small datasets, manually assign distinctly different colors
      return processedData.map((item, index) => ({
        ...item,
        color: DISTINCT_COLORS[index % DISTINCT_COLORS.length]
      }));
    } else {
      // For larger datasets, use a more sophisticated algorithm
      // First assign colors to ensure no similar colors are adjacent
      const result = [];
      const usedColorIndices = new Set();
      
      for (let i = 0; i < processedData.length; i++) {
        // Get the color indices of the previous and next items (circular)
        const prevIndex = (i - 1 + processedData.length) % processedData.length;
        const nextIndex = (i + 1) % processedData.length;
        
        // Get the color indices that cannot be used (to avoid adjacency issues)
        const prevColor = result[prevIndex]?.colorIndex;
        const nextColor = result[nextIndex]?.colorIndex;
        const forbiddenIndices = new Set([prevColor, nextColor].filter(x => x !== undefined));
        
        // Find an available color that hasn't been used and isn't forbidden
        let colorIndex = 0;
        while (usedColorIndices.has(colorIndex) || forbiddenIndices.has(colorIndex)) {
          colorIndex = (colorIndex + 1) % DISTINCT_COLORS.length;
        }
        
        // Assign the selected color
        result[i] = {
          ...processedData[i],
          colorIndex,
          color: DISTINCT_COLORS[colorIndex]
        };
        
        // Mark this color as used
        usedColorIndices.add(colorIndex);
        
        // If we've used all colors, reset and allow reuse
        if (usedColorIndices.size === DISTINCT_COLORS.length) {
          usedColorIndices.clear();
        }
      }
      
      return result;
    }
  };

  // Custom label renderer
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.03) return null;
    
    const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
    const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
    const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        className="font-medium text-sm"
        style={{ 
          filter: 'drop-shadow(0px 1px 1px rgba(0,0,0,0.5))',
          fontWeight: 600
        }}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Number formatter
  const formatNumber = (value) => {
    if (typeof value !== "number") return value;
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  // Handle empty data case
  if (!data || data.length === 0) {
    return (
      <motion.div 
        className="flex h-full w-full items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800/30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <p className="text-slate-500 dark:text-slate-400">No data available</p>
      </motion.div>
    );
  }

  // Process data with guaranteed distinct adjacent colors
  const enhancedData = assignGuaranteedDistinctColors(data);
  const totalValue = enhancedData.reduce((sum, item) => sum + item[valueKey], 0);

  // Custom tooltip formatter
  const customTooltipFormatter = (value, name) => [
    `${formatNumber(value)} (${((value / totalValue) * 100).toFixed(1)}%)`,
    name
  ];

  return (
    <motion.div 
      className="flex h-full w-full flex-col"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {title && (
        <h3 className="mb-4 text-center text-lg font-medium text-slate-800 dark:text-slate-200">
          {title}
        </h3>
      )}
      
      <div className="relative h-full w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={enhancedData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={renderCustomizedLabel}
              outerRadius={({ width, height }) => Math.min(width, height) * 0.35}
              innerRadius={({ width, height }) => Math.min(width, height) * 0.15}
              fill="#8884d8"
              dataKey={valueKey}
              nameKey={nameKey}
              paddingAngle={1}
              isAnimationActive={true}
              animationBegin={100}
              animationDuration={800}
              animationEasing="ease-out"
            >
              {enhancedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color}
                  strokeWidth={1}
                  stroke={isDarkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)'}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: chartTheme.tooltipBg,
                border: `1px solid ${chartTheme.tooltipBorder}`,
                borderRadius: '8px',
                boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                padding: '8px 12px',
              }}
              labelStyle={{ color: chartTheme.tooltipText, fontWeight: 600, marginBottom: '4px' }}
              itemStyle={{ color: chartTheme.tooltipText, padding: '2px 0' }}
              formatter={customTooltipFormatter}
            />
            <Legend
              verticalAlign="middle"
              align="right"
              layout="vertical"
              iconType="circle"
              iconSize={8}
              formatter={(value, entry) => (
                <span className="text-sm" style={{ color: chartTheme.legendText }}>
                  {value}
                </span>
              )}
              wrapperStyle={{
                paddingLeft: '24px',
                fontSize: '14px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};

export default PieChartComponent;