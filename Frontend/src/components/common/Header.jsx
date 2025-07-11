import { Bell, Home, Sun, Moon, Search, ChevronDown, Menu } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import sptbiLogo from "../../assets/sptbilogo.svg";
import dhruvaaLogo from "../../assets/D_Logo_1.svg";
import { useTheme } from "../../context/ThemeContext";
import { motion, AnimatePresence } from "framer-motion";

const Header = ({ title }) => {
  const { isDarkMode, toggleTheme } = useTheme();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [notificationCount, setNotificationCount] = useState(3);
  const [notifications, setNotifications] = useState([
    "New KPI update from Sales.",
    "AI Insight ready for review.",
    "Dashboard layout saved."
  ]);
  const [scrolled, setScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const notificationRef = useRef(null);
  const searchRef = useRef(null);
  const mobileMenuRef = useRef(null);

  // Sample pages for search - replace with your actual pages
  const pages = [
    { title: "Dashboard", path: "/dashboard" },
    { title: "Sales Dashboard", path: "/dashboard/sales" },
    { title: "Marketing Dashboard", path: "/dashboard/marketing" },
    { title: "Finance Dashboard", path: "/dashboard/finance" },
    { title: "Manufacturing Dashboard", path: "dashboard/manufacturing" },
    { title: "Production Dashboard", path: "/dashboard/production" },
    { title: "Operations Dashboard", path: "/dashboard/operations" },
    { title: "Customer & Growth", path: "/dashboard/customer-growth" },
    { title: "Insights Page", path: "/dashboard/insights" },
    { title: "Settings", path: "/dashboard/settings" },
    { title: "Executive Dashboard", path: "/dashboard/overview" },
  ];

  // Handle search input
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      return;
    }

    const filteredResults = pages.filter(page => 
      page.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setSearchResults(filteredResults);
  }, [searchQuery]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle scroll glassmorphism
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close notification popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(p => p);
    if (paths.length === 0) return null;

    return (
      <div className="flex items-center text-xs md:text-sm font-medium tracking-wide overflow-hidden">
        {paths.map((path, index) => {
          const formattedPath = path.split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          // Build the path up to this breadcrumb
          const linkPath = `/${paths.slice(0, index + 1).join('/')}`;

          return (
            <div key={path} className="flex items-center whitespace-nowrap">
              {index > 0 && (
                <ChevronDown 
                  className="mx-1.5 h-3 w-3 text-muted-foreground rotate-270" 
                  style={{ transform: 'rotate(-90deg)' }}
                />
              )}
              <motion.span 
                className="text-muted-foreground hover:text-foreground transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(linkPath)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {formattedPath}
              </motion.span>
            </div>
          );
        })}
      </div>
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications([]);
    setNotificationCount(0);
    setShowNotifications(false);
  };

  const handleSearchItemClick = (path) => {
    navigate(path);
    setSearchOpen(false);
    setSearchQuery("");
    setSearchResults([]);
  };

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-background/85 backdrop-blur-xl shadow-sm border-b border-border/30" 
          : "bg-background/50 backdrop-blur-md"
      }`}
    >
      <div className="container mx-auto">
        <div className="flex h-20 items-center justify-between px-4">
          
          {/* Left: Logos and Title */}
          <div className="flex items-center gap-4">
            {/* Mobile menu button */}
            <button 
              className="md:hidden inline-flex items-center justify-center rounded-full h-10 w-10 text-foreground hover:bg-muted/50 transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Mobile Menu"
            >
              <Menu size={20} />
            </button>
            
            {/* Logos */}
            <div className="flex items-center space-x-3">
              <motion.a
                href="https://www.sptbi.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <img src={sptbiLogo} alt="SPTBI Logo" className="h-8 w-auto" />
              </motion.a>
              <div className="h-8 w-px bg-border/70 hidden sm:block" />
              <motion.img 
                src={dhruvaaLogo} 
                alt="Dhruvaa Logo" 
                className="h-12 sm:h-16 w-auto" 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              />
            </div>

            {/* Title & Breadcrumbs */}
            <div className="ml-2 flex flex-col">
              <Link 
                to="/title" 
                className="text-lg md:text-2xl font-bold text-foreground tracking-tight cursor-pointer bg-clip-text hover:text-transparent hover:bg-gradient-to-r hover:from-primary hover:to-primary/70 transition-colors duration-300"
              >
                {title}
              </Link>
              <div className="mt-1 opacity-80 hover:opacity-100 transition-opacity duration-200 cursor-pointer">
                {generateBreadcrumbs()}
              </div>
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex-1 max-w-md mx-6 hidden md:flex">
            <div className="relative w-full group" ref={searchRef}>
              <motion.input
                type="text"
                placeholder="Search Pages"
                className={`w-full bg-muted/20 text-foreground rounded-full pl-12 pr-4 py-2.5 border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent transition-all duration-300 ${
                  searchOpen ? "shadow-lg" : "group-hover:shadow-sm"
                }`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchOpen(true)}
                whileFocus={{ scale: 1.01 }}
                initial={{ scale: 1 }}
              />
              <Search className={`absolute left-4 top-3 h-5 w-5 text-muted-foreground transition-colors duration-300 ${
                searchOpen ? "text-primary" : ""
              }`} />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchOpen && searchResults.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className="absolute mt-2 w-full bg-background/95 backdrop-blur-sm border border-border/60 rounded-xl shadow-xl z-50 max-h-72 overflow-y-auto"
                  >
                    <ul className="py-2">
                      {searchResults.map((result, index) => (
                        <motion.li 
                          key={index} 
                          className="px-4 py-2.5 hover:bg-muted/30 cursor-pointer flex items-center"
                          onClick={() => handleSearchItemClick(result.path)}
                          whileHover={{ backgroundColor: 'rgba(0,0,0,0.05)', x: 3 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Search className="h-4 w-4 mr-3 text-primary/80" />
                          <span className="font-medium">{result.title}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Right: Icons */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center rounded-full text-sm font-medium transition-all focus:outline-none hover:bg-primary/10 hover:text-primary h-10 px-4 py-2 active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onMouseUp={(e) => e.currentTarget.blur()}
              >
                <Home className="h-5 w-5 mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Link>
            </motion.div>

            {/* Notification Bell */}
            <div className="relative" ref={notificationRef}>
              <motion.button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="inline-flex items-center justify-center rounded-full text-sm transition-all focus:outline-none hover:bg-primary/10 hover:text-primary h-10 w-10 relative active:scale-95"
                style={{ WebkitTapHighlightColor: 'transparent' }}
                onMouseUp={(e) => e.currentTarget.blur()}
                aria-label="Notifications"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <motion.span 
                    className="absolute -top-1 -right-1 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center"
                    initial={{ scale: 0.8 }}
                    animate={{ scale: [0.8, 1.2, 1] }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      repeatType: "reverse",
                    }}
                  >
                    {notificationCount}
                  </motion.span>
                )}
              </motion.button>

              {/* Popup */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-background/95 backdrop-blur-sm shadow-xl rounded-xl border border-border/60 z-50 overflow-hidden"
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="text-sm font-medium">Notifications</h5>
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                          {notificationCount > 0 ? `${notificationCount} new` : 'None'}
                        </span>
                      </div>
                      
                      {notifications.length > 0 ? (
                        <ul className="space-y-3 max-h-60 overflow-y-auto custom-scrollbar">
                          {notifications.map((note, idx) => (
                            <motion.li 
                              key={idx} 
                              className="text-sm text-foreground bg-muted/20 px-4 py-3 rounded-lg border border-border/10"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.1 }}
                            >
                              {note}
                            </motion.li>
                          ))}
                        </ul>
                      ) : (
                        <div className="text-sm text-muted-foreground text-center py-8 px-4">
                          <Bell className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                          No new notifications
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div 
                        className="border-t border-border/30 px-4 py-2.5 text-sm text-primary hover:text-primary/80 hover:bg-muted/20 transition-colors cursor-pointer font-medium text-center"
                        onClick={handleMarkAllAsRead}
                      >
                        Mark all as read
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Theme Toggle */}
            <motion.button
              onClick={toggleTheme}
              className="inline-flex items-center justify-center rounded-full text-sm transition-all focus:outline-none hover:bg-primary/10 hover:text-primary h-10 w-10 relative overflow-hidden active:scale-95"
              style={{ WebkitTapHighlightColor: 'transparent' }}
              onMouseUp={(e) => e.currentTarget.blur()}
              aria-label="Toggle Theme"
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
            >
              <div className="relative w-5 h-5">
                <Sun className={`h-5 w-5 absolute transition-all duration-300 ${
                  isDarkMode ? "opacity-100 rotate-0" : "opacity-0 -rotate-90"
                }`} />
                <Moon className={`h-5 w-5 absolute transition-all duration-300 ${
                  isDarkMode ? "opacity-0 rotate-90" : "opacity-100 rotate-0"
                }`} />
              </div>
            </motion.button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            ref={mobileMenuRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/30 bg-background/95 backdrop-blur-sm shadow-md"
          >
            <div className="container mx-auto px-4 py-3">
              {/* Mobile search */}
              <div className="relative w-full mb-4">
                <input
                  type="text"
                  placeholder="Search Pages"
                  className="w-full bg-muted/20 text-foreground rounded-lg pl-10 pr-4 py-2 border border-border/40 focus:outline-none focus:ring-2 focus:ring-primary/60 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
              </div>
              
              {/* Search Results for mobile */}
              {searchQuery.trim() !== "" && searchResults.length > 0 && (
                <div className="bg-background/80 border border-border/30 rounded-lg mb-4 py-1">
                  <ul>
                    {searchResults.map((result, index) => (
                      <li 
                        key={index} 
                        className="px-4 py-2.5 hover:bg-muted/30 cursor-pointer flex items-center"
                        onClick={() => {
                          handleSearchItemClick(result.path);
                          setMobileMenuOpen(false);
                        }}
                      >
                        <Search className="h-4 w-4 mr-3 text-primary/80" />
                        <span>{result.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              
              {/* Navigation links for mobile */}
              <div className="grid grid-cols-2 gap-2 pb-2">
                {pages.map((page, index) => (
                  <Link
                    key={index}
                    to={page.path}
                    className="px-4 py-2.5 rounded-lg hover:bg-muted/30 text-sm font-medium transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {page.title}
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
