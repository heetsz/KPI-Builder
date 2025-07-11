import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from "framer-motion";
import { 
  BarChart2, 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Database, 
  Factory, 
  Package, 
  Settings, 
  Users,
  ChevronRight
} from 'lucide-react';

const OnboardingDomains = () => {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();

  const handleDomainClick = (domain) => {
    // Save the selected domain
    localStorage.setItem('domain', domain.toLowerCase().replace(/\s+/g, '-'));
    // Navigate to data upload page
    navigate(`/dashboard/dataupload?domain=${domain.toLowerCase().replace(/\s+/g, '-')}`);
  };

  // Domain data with icons and descriptions
  const domains = [
    {
      id: 'marketing',
      name: 'Marketing',
      description: 'Insights, trends, and tools to boost your marketing performance.',
      icon: <BarChart2 className="h-6 w-6" />,
      size: 'md:w-2/3'
    },
    {
      id: 'finance',
      name: 'Finance',
      description: 'Manage KPIs, forecasts, and financial insights in one place.',
      icon: <DollarSign className="h-6 w-6" />,
      size: 'md:w-1/3'
    },
    {
      id: 'sales',
      name: 'Sales',
      description: 'Track performance and close deals faster.',
      icon: <ShoppingCart className="h-6 w-6" />,
      size: 'md:w-1/4'
    },
    {
      id: 'saas',
      name: 'SaaS',
      description: 'Insights and tools for scaling your SaaS business.',
      icon: <Database className="h-6 w-6" />,
      size: 'md:w-2/4'
    },
    {
      id: 'manufacturing',
      name: 'Manufacturing',
      description: 'Optimize processes and monitor production efficiency.',
      icon: <Factory className="h-6 w-6" />,
      size: 'md:w-1/4'
    },
    {
      id: 'production',
      name: 'Production',
      description: 'Streamline workflows and enhance production quality.',
      icon: <Package className="h-6 w-6" />,
      size: 'md:w-1/3'
    },
    {
      id: 'operations',
      name: 'Operations',
      description: 'Improve operational efficiency and resource management.',
      icon: <Settings className="h-6 w-6" />,
      size: 'md:w-1/3'
    },
    {
      id: 'customer & growth',
      name: 'Customer & Growth',
      description: 'Enhance customer experience and satisfaction.',
      icon: <Users className="h-6 w-6" />,
      size: 'md:w-1/3'
    }
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 100 },
    },
  };
  
  // Group domains by row
  const firstRow = domains.slice(0, 2);
  const secondRow = domains.slice(2, 5);
  const thirdRow = domains.slice(5, 8);

  return (
    <div className={`min-h-screen py-12 bg-background relative overflow-hidden`}>
      {/* Background decorative elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute top-10 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-primary/10 rounded-full blur-3xl" />
        {isDarkMode && (
          <>
            <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-1/3 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl" />
          </>
        )}
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        {/* Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center p-2 bg-primary/10 rounded-full text-primary mb-4">
            <TrendingUp className="h-5 w-5 mr-2" />
            <span className="font-medium text-sm">Get started</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-foreground tracking-tight">
            KPI <span className="text-primary">Templates</span>
          </h1>
          <motion.h2 
            className="text-xl md:text-2xl font-medium mb-4 text-foreground/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Choose from over 8 industry focused templates
          </motion.h2>
          <p className="max-w-2xl mx-auto text-muted-foreground text-lg">
            Select your preferred domain to get started with tailored dashboards and insights.
          </p>
        </motion.div>

        {/* Domain Selection Cards */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-5xl mx-auto"
        >
          {/* First row */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {firstRow.map((domain) => (
              <motion.div
                key={domain.id}
                variants={itemVariants}
                className={`${domain.size} relative`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <button
                  onClick={() => handleDomainClick(domain.name)}
                  className={`w-full h-full p-6 rounded-xl flex flex-col justify-between
                    ${isDarkMode 
                      ? 'bg-gradient-to-br from-card to-card/60 hover:shadow-lg hover:shadow-primary/10' 
                      : 'bg-white hover:shadow-lg hover:shadow-primary/10'}
                    border border-border/60 hover:border-primary transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center p-3 mb-4 rounded-lg 
                      ${isDarkMode ? 'bg-primary/10' : 'bg-primary/5'}`}>
                      <span className="text-primary">{domain.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{domain.name}</h3>
                    <p className="text-muted-foreground">{domain.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end text-primary mt-2">
                    <span className="text-sm font-medium">Select</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Second row */}
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            {secondRow.map((domain) => (
              <motion.div
                key={domain.id}
                variants={itemVariants}
                className={`${domain.size} relative`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <button
                  onClick={() => handleDomainClick(domain.name)}
                  className={`w-full h-full p-6 rounded-xl flex flex-col justify-between
                    ${isDarkMode 
                      ? 'bg-gradient-to-br from-card to-card/60 hover:shadow-lg hover:shadow-primary/10' 
                      : 'bg-white hover:shadow-lg hover:shadow-primary/10'}
                    border border-border/60 hover:border-primary transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center p-3 mb-4 rounded-lg 
                      ${isDarkMode ? 'bg-primary/10' : 'bg-primary/5'}`}>
                      <span className="text-primary">{domain.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{domain.name}</h3>
                    <p className="text-muted-foreground">{domain.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end text-primary mt-2">
                    <span className="text-sm font-medium">Select</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>

          {/* Third row */}
          <div className="flex flex-col md:flex-row justify-center gap-6">
            {thirdRow.map((domain) => (
              <motion.div
                key={domain.id}
                variants={itemVariants}
                className={`${domain.size} relative`}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <button
                  onClick={() => handleDomainClick(domain.name)}
                  className={`w-full h-full p-6 rounded-xl flex flex-col justify-between
                    ${isDarkMode 
                      ? 'bg-gradient-to-br from-card to-card/60 hover:shadow-lg hover:shadow-primary/10' 
                      : 'bg-white hover:shadow-lg hover:shadow-primary/10'}
                    border border-border/60 hover:border-primary transition-all duration-300`}
                >
                  <div className="mb-4">
                    <div className={`inline-flex items-center justify-center p-3 mb-4 rounded-lg 
                      ${isDarkMode ? 'bg-primary/10' : 'bg-primary/5'}`}>
                      <span className="text-primary">{domain.icon}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">{domain.name}</h3>
                    <p className="text-muted-foreground">{domain.description}</p>
                  </div>
                  
                  <div className="flex items-center justify-end text-primary mt-2">
                    <span className="text-sm font-medium">Select</span>
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default OnboardingDomains;