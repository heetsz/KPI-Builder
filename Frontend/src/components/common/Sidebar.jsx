import {
  BarChart2,
  Settings,
  Users,
  CircleDollarSign,
  Factory,
  TrendingUp,
  Activity,
  Package,
  Target,
  LineChart,
  Menu,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";

// Group navigation items by category - unchanged
const SIDEBAR_ITEMS = [
  {
    category: "Overview",
    items: [
      { name: "Overview Dashboard", icon: BarChart2, color: "#6366f1", href: "/dashboard/overview" },
    ]
  },
  {
    category: "Business",
    items: [
      { name: "Sales", icon: CircleDollarSign, color: "#34D399", href: "/dashboard/sales" },
      { name: "Marketing", icon: Target, color: "#F59E0B", href: "/dashboard/marketing" },
      { name: "Finance", icon: LineChart, color: "#4ADE80", href: "/dashboard/finance" },
    ]
  },
  {
    category: "Operations",
    items: [
      { name: "Manufacturing", icon: Factory, color: "#A78BFA", href: "/dashboard/manufacturing" },
      { name: "Production", icon: Package, color: "#F87171", href: "/dashboard/production" },
      { name: "Operations", icon: Activity, color: "#60A5FA", href: "/dashboard/operations" },
    ]
  },
  {
    category: "Performance",
    items: [
      { name: "Customer & Growth", icon: TrendingUp, color: "#FB923C", href: "/dashboard/customer-growth" },
      { name: "SaaS Dashboard", icon: BarChart2, color: "#C084FC", href: "/dashboard/saas" },
      { name: "Insights", icon: Users, color: "#F472B6", href: "/dashboard/insights" },
    ]
  },
  {
    category: "Settings",
    items: [
      { name: "Settings", icon: Settings, color: "#6EE7B7", href: "/dashboard/settings" },
    ]
  }
];

const Sidebar = () => {
  const { logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const sidebarRef = useRef(null);
  
  // Added state to track animation completion
  const [isAnimating, setIsAnimating] = useState(false);
  // Track hover state for items
  const [hoveredItem, setHoveredItem] = useState(null);

  // Fixed dimensions that match our variants
  const OPEN_WIDTH = 256;
  const CLOSED_WIDTH = 80;

  // Enhanced variants with improved transitions
  const variants = {
    open: { 
      width: OPEN_WIDTH, 
      minWidth: OPEN_WIDTH,
      transition: { 
        duration: 0.3, 
        type: "spring",
        stiffness: 300,
        damping: 30
      } 
    },
    closed: { 
      width: CLOSED_WIDTH, 
      minWidth: CLOSED_WIDTH,
      transition: { 
        duration: 0.3,
        type: "spring",
        stiffness: 300,
        damping: 30
      } 
    }
  };

  // Enhanced text variants with better transitions
  const textVariants = {
    open: { 
      opacity: 1, 
      x: 0, 
      display: "block", 
      transition: { 
        delay: 0.1, 
        duration: 0.2,
        ease: "easeOut"
      } 
    },
    closed: { 
      opacity: 0, 
      x: -10, 
      transitionEnd: { 
        display: "none" 
      }, 
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      } 
    }
  };
  
  const categoryVariants = {
    open: { 
      opacity: 1, 
      display: "block",
      marginTop: "0.75rem", 
      marginBottom: "0.75rem", 
      transition: { 
        duration: 0.3,
        ease: "easeOut"
      }
    },
    closed: { 
      opacity: 0, 
      display: "none",
      marginTop: 0, 
      marginBottom: 0, 
      transition: { 
        duration: 0.2,
        ease: "easeIn"
      }
    }
  };

  // Handle animation state
  const handleAnimationStart = () => {
    setIsAnimating(true);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
    
    // Force correct width after animation completes
    if (sidebarRef.current) {
      sidebarRef.current.style.width = isSidebarOpen ? `${OPEN_WIDTH}px` : `${CLOSED_WIDTH}px`;
      sidebarRef.current.style.minWidth = isSidebarOpen ? `${OPEN_WIDTH}px` : `${CLOSED_WIDTH}px`;
    }
  };

  // Effect to ensure sidebar has correct width on mount and state changes
  useEffect(() => {
    if (sidebarRef.current) {
      const width = isSidebarOpen ? OPEN_WIDTH : CLOSED_WIDTH;
      sidebarRef.current.style.width = `${width}px`;
      sidebarRef.current.style.minWidth = `${width}px`;
    }
  }, [isSidebarOpen]);

  // Helper for gradient colors based on theme
  const getGradient = (isDark) => {
    return isDark 
      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(12, 18, 36, 0.99))' 
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.95))';
  };

  return (
    <motion.div
      ref={sidebarRef}
      className="relative z-10 flex-shrink-0 h-full"
      initial={isSidebarOpen ? "open" : "closed"}
      animate={isSidebarOpen ? "open" : "closed"}
      variants={variants}
      onAnimationStart={handleAnimationStart}
      onAnimationComplete={handleAnimationComplete}
      style={{
        minWidth: isSidebarOpen ? OPEN_WIDTH : CLOSED_WIDTH,
        overflow: "hidden", // Prevent content from spilling out
        borderRight: `1px solid ${isDarkMode ? 'rgba(17, 24, 39, 0.6)' : 'rgba(226, 232, 240, 0.8)'}`,
        boxShadow: isDarkMode 
          ? '1px 0 16px -8px rgba(0, 0, 0, 0.4)' 
          : '1px 0 16px -12px rgba(0, 0, 0, 0.1)'
      }}
    >
      <div 
        className={`h-full flex flex-col backdrop-blur-md`}
        style={{ 
          width: "100%", // Always fill the container width
          minWidth: isSidebarOpen ? OPEN_WIDTH : CLOSED_WIDTH,
          background: getGradient(isDarkMode),
        }}
      >
        {/* Menu Button - Enhanced */}
        <div className="px-4 py-6 flex justify-center">
          <motion.div
            whileHover={{ scale: 1.02, backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => !isAnimating && setIsSidebarOpen(!isSidebarOpen)} // Prevent clicking during animation
            className="flex items-center gap-3 rounded-xl py-2.5 cursor-pointer transition-all w-full"
            style={{
              justifyContent: isSidebarOpen ? "space-between" : "center",
              paddingLeft: isSidebarOpen ? "0.875rem" : "0.75rem",
              paddingRight: isSidebarOpen ? "0.875rem" : "0.75rem",
            }}
          >
            <div className="flex items-center gap-3">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${isDarkMode ? 'bg-primary/20' : 'bg-primary/10'}`}>
                <Menu size={18} className="text-primary" />
              </div>
              <motion.span
                variants={textVariants}
                className="text-base font-medium text-foreground whitespace-nowrap"
              >
                Menu
              </motion.span>
            </div>
            
            <AnimatePresence>
              {isSidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, rotate: 0 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-muted-foreground"
                >
                  <ChevronRight size={16} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* Divider - Enhanced */}
        <div className="mx-4 h-px bg-gradient-to-r from-transparent via-border/70 to-transparent" />

        {/* Navigation with categories - Enhanced */}
        <div 
          className={`flex-1 overflow-y-auto overflow-x-hidden mt-2
            ${isDarkMode ? 'sidebar-dark' : 'sidebar-light'}`}
          style={{ width: "100%" }} // Force full width
        >
          <div className="px-4 py-2 w-full">
            <nav className="space-y-5 w-full">
              {SIDEBAR_ITEMS.map((group) => (
                <div key={group.category} className="space-y-1.5 w-full">
                  {/* Category Label - Enhanced */}
                  <motion.h3
                    variants={categoryVariants}
                    className={`px-3 text-xs font-semibold uppercase tracking-wider
                      ${isDarkMode ? 'text-gray-400/90' : 'text-gray-500/90'}`}
                  >
                    {group.category}
                  </motion.h3>

                  {/* Navigation Items - Enhanced */}
                  <div className="w-full">
                    {group.items.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link 
                          key={item.href} 
                          to={item.href} 
                          className="block w-full"
                          onMouseEnter={() => setHoveredItem(item.name)}
                          onMouseLeave={() => setHoveredItem(null)}
                        >
                          <motion.div 
                            className={`flex items-center gap-3 py-2.5 mb-2 rounded-xl transition-all relative w-full overflow-hidden
                              ${isActive 
                                ? 'text-foreground' 
                                : `${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}
                            `}
                            whileHover={{ x: isSidebarOpen ? 2 : 0 }}
                            whileTap={{ scale: 0.98 }}
                            style={{
                              justifyContent: isSidebarOpen ? "flex-start" : "center",
                              paddingLeft: isSidebarOpen ? "0.875rem" : "0",
                              paddingRight: isSidebarOpen ? "0.875rem" : "0",
                              background: isActive 
                                ? isDarkMode 
                                  ? 'linear-gradient(90deg, rgba(56, 189, 248, 0.08) 0%, rgba(59, 130, 246, 0.08) 100%)' 
                                  : 'linear-gradient(90deg, rgba(56, 189, 248, 0.05) 0%, rgba(59, 130, 246, 0.05) 100%)'
                                : 'transparent',
                              boxShadow: isActive 
                                ? isDarkMode 
                                  ? '0 0 0 1px rgba(255, 255, 255, 0.08), 0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                                  : '0 0 0 1px rgba(0, 0, 0, 0.02), 0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                                : 'none',
                            }}
                          >
                            {isActive && (
                              <motion.div
                                className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary rounded-r-full"
                                layoutId="activeIndicator"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                              />
                            )}
                            <motion.div 
                              className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200`}
                              style={{ 
                                backgroundColor: `${item.color}${isDarkMode ? '20' : '15'}`,
                                boxShadow: isActive || hoveredItem === item.name
                                  ? `0 0 8px ${item.color}30`
                                  : 'none'
                              }}
                              whileHover={{ scale: 1.05 }}
                            >
                              <item.icon 
                                size={17} 
                                style={{ 
                                  color: item.color,
                                  filter: isActive ? `drop-shadow(0 0 2px ${item.color}80)` : 'none'
                                }} 
                              />
                            </motion.div>
                            <motion.span
                              variants={textVariants}
                              className="text-[15px] font-medium whitespace-nowrap"
                            >
                              {item.name}
                            </motion.span>
                            
                            {/* Subtle hover effect */}
                            {isSidebarOpen && hoveredItem === item.name && !isActive && (
                              <motion.div
                                className="absolute inset-0 -z-10 rounded-xl"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                  background: isDarkMode
                                    ? 'rgba(255, 255, 255, 0.03)'
                                    : 'rgba(0, 0, 0, 0.02)'
                                }}
                              />
                            )}
                          </motion.div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}
            </nav>
          </div>
        </div>

        {/* Footer with Logout - Enhanced */}
        <div className="mt-auto pt-3 pb-5 w-full border-t border-border/30">
          <div className="px-4 w-full">
            <button 
              className="flex items-center gap-3 py-2.5 rounded-xl transition-all w-full relative overflow-hidden"
              onClick={logout}
              onMouseEnter={() => setHoveredItem('logout')}
              onMouseLeave={() => setHoveredItem(null)}
              style={{
                justifyContent: isSidebarOpen ? "flex-start" : "center",
                paddingLeft: isSidebarOpen ? "0.875rem" : "0",
                paddingRight: isSidebarOpen ? "0.875rem" : "0",
                color: isDarkMode ? 'rgb(239, 68, 68)' : 'rgb(220, 38, 38)'
              }}
            >
              <motion.div 
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-200"
                style={{
                  backgroundColor: isDarkMode ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                  boxShadow: hoveredItem === 'logout'
                    ? isDarkMode
                      ? '0 0 12px rgba(239, 68, 68, 0.2)'
                      : '0 0 8px rgba(239, 68, 68, 0.15)'
                    : 'none'
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <LogOut size={17} />
              </motion.div>
              <motion.span 
                variants={textVariants}
                className="text-[15px] font-medium whitespace-nowrap"
              >
                Logout
              </motion.span>
              
              {/* Subtle hover effect for logout */}
              {isSidebarOpen && hoveredItem === 'logout' && (
                <motion.div
                  className="absolute inset-0 -z-10 rounded-xl"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{
                    background: isDarkMode
                      ? 'rgba(239, 68, 68, 0.06)'
                      : 'rgba(239, 68, 68, 0.03)'
                  }}
                />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced CSS for scroll and theme-specific styles */}
      <style>{`
        /* Scrollbar styling */
        .sidebar-dark::-webkit-scrollbar,
        .sidebar-light::-webkit-scrollbar {
          width: 4px;
        }
        .sidebar-dark::-webkit-scrollbar-track,
        .sidebar-light::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar-dark::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.25);
          border-radius: 20px;
        }
        .sidebar-light::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.15);
          border-radius: 20px;
        }
        .sidebar-dark:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.4);
        }
        .sidebar-light:hover::-webkit-scrollbar-thumb {
          background-color: rgba(156, 163, 175, 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default Sidebar;