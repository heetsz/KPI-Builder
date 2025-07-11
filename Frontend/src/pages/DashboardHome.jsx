import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import {
  CircleDollarSign,
  Target,
  Factory,
  LineChart,
  Package,
  Activity,
  TrendingUp,
  Plus,
  Sparkles,
  BarChart2,
} from "lucide-react";

const DashboardHome = () => {
  const { theme } = useTheme();

  const dashboards = [
    {
      name: "Sales Dashboard",
      description: "Track revenue, growth, and sales performance metrics",
      icon: CircleDollarSign,
      color: "#34D399",
      href: "/dashboard/sales",
    },
    {
      name: "Marketing Dashboard",
      description: "Monitor campaigns, ROI, and customer acquisition",
      icon: Target,
      color: "#F59E0B",
      href: "/dashboard/marketing",
    },
    {
      name: "Finance Dashboard",
      description: "Analyze financial health and cash flow metrics",
      icon: LineChart,
      color: "#4ADE80",
      href: "/dashboard/finance",
    },
    {
      name: "Manufacturing Dashboard",
      description: "Track production efficiency and quality metrics",
      icon: Factory,
      color: "#A78BFA",
      href: "/dashboard/manufacturing",
    },
    {
      name: "Production Dashboard",
      description: "Monitor production volumes and performance",
      icon: Package,
      color: "#F87171",
      href: "/dashboard/production",
    },
    {
      name: "Operations Dashboard",
      description: "Track operational efficiency and logistics",
      icon: Activity,
      color: "#60A5FA",
      href: "/dashboard/operations",
    },
    {
      name: "Customer Growth",
      description: "Monitor customer satisfaction and growth metrics",
      icon: TrendingUp,
      color: "#FB923C",
      href: "/dashboard/customer-growth",
    },
    {
      name: "SaaS Dashboard",
      description: "Track subscription metrics and customer usage analytics",
      icon: BarChart2,
      color: "#C084FC",
      href: "/dashboard/saas",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        className={`relative overflow-hidden rounded-3xl ${theme.cardBg} border ${theme.border} p-8 md:p-12 mb-12 shadow-lg`}
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="flex items-center mb-4">
            <Sparkles className="h-6 w-6 text-primary mr-2" />
            <p className="text-sm font-medium text-primary">Control Center</p>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Welcome to Your Dashboard
          </h1>

          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Get started by selecting an existing dashboard or create a new one tailored to your needs.
          </p>

          <Link
            to="/dashboard/onboarding"
            className={`inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105`}
          >
            <Plus className="h-5 w-5" />
            Create New Dashboard
          </Link>
        </motion.div>

        {/* Background Decorative */}
        <div className="absolute right-0 top-0 opacity-10 pointer-events-none">
          <svg width="350" height="350" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
            <path
              fill="currentColor"
              d="M40,-62.7C53.2,-56.9,66.2,-49.4,71.7,-37.6C77.2,-25.9,75.2,-9.8,71.5,4.8C67.8,19.5,62.4,32.7,53.6,43.9C44.8,55.1,32.6,64.3,19.2,68.5C5.8,72.7,-8.8,71.9,-21,66.8C-33.2,61.8,-43,52.6,-52.1,42.1C-61.2,31.6,-69.7,19.8,-73.4,6.2C-77.1,-7.5,-76.1,-23,-69.3,-35.5C-62.5,-48,-49.9,-57.6,-36.9,-63.2C-23.9,-68.8,-11.9,-70.3,0.6,-71.3C13.2,-72.3,26.8,-68.6,40,-62.7Z"
              transform="translate(100 100)"
            />
          </svg>
        </div>
      </motion.div>

      {/* Dashboards Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3"
      >
        {dashboards.map((dashboard) => (
          <motion.div key={dashboard.name} variants={itemVariants}>
            <Link
              to={dashboard.href}
              className={`block p-6 ${theme.cardBg} rounded-2xl border ${theme.border} hover:border-primary/50 shadow-sm hover:shadow-md transition-all duration-300 group h-full`}
            >
              <div className="flex items-start gap-4 mb-3">
                <div
                  className="p-3 rounded-xl"
                  style={{ backgroundColor: `${dashboard.color}10` }}
                >
                  <motion.div
                    whileHover={{ rotate: 8, scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <dashboard.icon
                      style={{ color: dashboard.color }}
                      className="h-6 w-6"
                    />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
                    {dashboard.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {dashboard.description}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end">
                <motion.div
                  className="text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center text-sm font-medium"
                  whileHover={{ x: 4 }}
                >
                  Open
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </motion.div>
              </div>
            </Link>
          </motion.div>
        ))}

        {/* Create New Dashboard Card */}
        <motion.div variants={itemVariants}>
          <Link
            to="/dashboard/onboarding"
            className={`flex flex-col justify-center items-center p-6 ${theme.cardBg} rounded-2xl border ${theme.border} border-dashed hover:border-primary shadow-sm hover:shadow-md transition-all duration-300 group h-full`}
          >
            <div className="p-4 rounded-full bg-primary/10 mb-4">
              <Plus className="h-6 w-6 text-primary group-hover:scale-125 transition-transform duration-300" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-primary transition-colors duration-200">
              Create New Dashboard
            </h3>
            <p className="text-sm text-muted-foreground text-center">
              Build a custom dashboard for your specific needs
            </p>
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;
