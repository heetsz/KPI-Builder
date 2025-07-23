import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import FloatingReportButton from '../components/ui/FloatingButton'; // <-- Add this import
import {
  TrendingUp,
  TrendingDown,
  Star,
  AlertTriangle,
  ArrowRight,
  BarChart2,
  Target,
  Lightbulb,
  Shield,
  ChevronRight,
  Activity,
  LineChart,
  Sparkles
} from 'lucide-react';
import { useAuth } from "../context/AuthContext";

const URL = import.meta.env.VITE_BACKEND_URL;

function renderWithCitations(text, citations) {
  if (!text) return null;
  // Replace [citationX] with a hyperlink using a user-friendly label and tooltip
  return text.split(/(\[citation\d+\])/g).map((part, i) => {
    const match = part.match(/^\[citation(\d+)\]$/);
    if (match) {
      const citationId = match[0].replace(/[\[\]]/g, '');
      const citation = citations?.find(c =>
        `[${c.id}]` === match[0] || c.id === citationId
      );
      if (citation && citation.url) {
        // Ensure the URL is absolute and not empty
        const isAbsolute = citation.url.startsWith('http://') || citation.url.startsWith('https://');
        const url = isAbsolute ? citation.url : `https://${citation.url}`;
        return (
          <a
            key={i}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary-focus font-medium transition-colors px-1.5 py-0.5 rounded-md bg-primary/10 hover:bg-primary/20"
            title={`${citation.title || 'Source'}${citation.source ? ' | ' + citation.source : ''}`}
          >
            <Sparkles className="h-3 w-3" />
            <span>Source</span>
          </a>
        );
      }
    }
    return part;
  });
}

const InsightsPage = () => {
  const { theme } = useTheme();
  const [insightsData, setInsightsData] = useState(null);
  const [activeTab, setActiveTab] = useState('executive');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth(); // Assuming you have a user context that provides user info
  const COMPANY_ID = user.companyId // Replace with dynamic company ID if needed

  useEffect(() => {
    // const companyId = 'comp123'; // Replace with actual company ID

    const fetchInsights = async () => {
      try {
        setLoading(true);
        const response = await axios.post(
          `${URL}/api/flask/generate-insights/${COMPANY_ID}`,
        );
        setInsightsData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Under Maintenance');
        setLoading(false);
      }
    };

    fetchInsights();
  }, []);
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-4 rounded-full bg-primary/10 mb-4">
        <Activity className="h-8 w-8 text-primary animate-pulse" />
      </div>
      <p className="text-lg font-medium text-foreground">Loading insights...</p>
      <p className="text-sm text-muted-foreground mt-2">Analyzing your business data</p>
    </div>
  );
  
  if (error) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <div className="p-4 rounded-full bg-destructive/10 mb-4">
        <AlertTriangle className="h-8 w-8 text-destructive" />
      </div>
      <p className="text-lg font-medium text-foreground">Error</p>
      <p className="text-md text-muted-foreground mt-2">{error}</p>
      {/* <button 
        onClick={() => window.location.reload()} 
        className="mt-6 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
      > */}
        {/* Retry
      </button> */}
    </div>
  );
  
  if (!insightsData) return null;

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };
  // Animation variants for staggered animations
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  const tabItems = [
    { id: 'executive', label: 'Executive Summary', icon: BarChart2, color: 'from-violet-500 to-purple-500' },
    { id: 'swot', label: 'SWOT Analysis', icon: Target, color: 'from-blue-500 to-cyan-400' },
    { id: 'growth', label: 'Growth Tactics', icon: TrendingUp, color: 'from-green-500 to-emerald-500' },
    { id: 'kpi', label: 'KPI Actions', icon: Lightbulb, color: 'from-amber-500 to-yellow-500' }
  ];
  const SwotCard = ({ title, items, icon: Icon, color, citations }) => {
    const gradientMap = {
      'Strengths': 'bg-gradient-to-br from-emerald-500 to-green-600',
      'Weaknesses': 'bg-gradient-to-br from-rose-500 to-red-600',
      'Opportunities': 'bg-gradient-to-br from-blue-500 to-indigo-600',
      'Threats': 'bg-gradient-to-br from-amber-500 to-orange-600'
    };
    
    const gradientClass = gradientMap[title] || color;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-card rounded-xl p-6 shadow-xl border border-border backdrop-blur-sm bg-opacity-80 hover:shadow-2xl hover:border-primary/20 transition-all duration-300 relative overflow-hidden group"
        whileHover={{ y: -5 }}
      >
        <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
          <div className="absolute inset-0 blur-3xl opacity-30 bg-gradient-to-br from-primary/20 to-primary/5"></div>
        </div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className={`p-2.5 rounded-xl ${gradientClass} shadow-lg`}>
              <Icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-foreground">{title}</h3>
          </div>
          
          <motion.ul 
            className="space-y-4"
            variants={container}
            initial="hidden"
            animate="show"
          >
            {items.map((item, index) => (
              <motion.li
                key={index}
                variants={item}
                className="flex items-start gap-3 text-muted-foreground group/item hover:text-foreground transition-colors"
              >
                <div className="mt-1 flex-shrink-0 p-1.5 rounded-full bg-primary/10 group-hover/item:bg-primary/20 transition-colors">
                  <ChevronRight className="h-3 w-3 text-primary" />
                </div>
                <span className="text-sm md:text-base leading-relaxed">{renderWithCitations(item, citations)}</span>
              </motion.li>
            ))}
          </motion.ul>
        </div>
      </motion.div>
    );
  };
  return (
    <div className="min-h-screen bg-background p-6 relative">
      {/* Background decoration elements */}
      <div className="absolute inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
      
      <motion.div {...fadeInUp} className="max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col gap-10">
          {/* Header */}
          <div className="text-center relative py-8">
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-24 h-1 bg-gradient-to-r from-primary/50 to-primary rounded-full"></div>
            
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Business Insights
            </motion.h1>
            
            <motion.p
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Comprehensive analysis and strategic recommendations tailored for your business
            </motion.p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-3 flex-wrap px-4">
            {tabItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all duration-200
                  ${
                    activeTab === item.id
                      ? `bg-gradient-to-r ${item.color} border-transparent text-white shadow-lg`
                      : 'bg-card/80 backdrop-blur-sm border-border text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-card'
                  }`}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <item.icon className={`h-4 w-4 ${activeTab !== item.id && 'text-primary'}`} />
                <span className="font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>          {/* Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="grid gap-6 mt-4"
          >
            {activeTab === 'executive' && (
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl border border-border relative overflow-hidden group hover:border-primary/20 transition-all duration-300">
                <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg">
                    <BarChart2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Executive Summary</h3>
                </div>
                <div className="relative z-10">
                  <p className="text-lg text-foreground leading-relaxed tracking-wide">
                    {renderWithCitations(insightsData.executive_summary, insightsData.citations)}
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'swot' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <SwotCard
                  title="Strengths"
                  items={insightsData.swot_analysis.strengths}
                  icon={Star}
                  color="bg-green-500"
                  citations={insightsData.citations}
                />
                <SwotCard
                  title="Weaknesses"
                  items={insightsData.swot_analysis.weaknesses}
                  icon={TrendingDown}
                  color="bg-red-500"
                  citations={insightsData.citations}
                />
                <SwotCard
                  title="Opportunities"
                  items={insightsData.swot_analysis.opportunities}
                  icon={TrendingUp}
                  color="bg-blue-500"
                  citations={insightsData.citations}
                />
                <SwotCard
                  title="Threats"
                  items={insightsData.swot_analysis.threats}
                  icon={AlertTriangle}
                  color="bg-yellow-500"
                  citations={insightsData.citations}
                />
              </div>
            )}

            {activeTab === 'growth' && (
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl border border-border overflow-hidden relative group hover:border-primary/20 transition-all duration-300">
                <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-600 to-green-600 shadow-lg">
                    <LineChart className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">Growth Tactics</h3>
                </div>
                <motion.ul 
                  className="space-y-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {insightsData.growth_tactics.map((tactic, index) => (
                    <motion.li
                      key={index}
                      variants={item}
                      className="flex items-start gap-4 group/item hover:bg-primary/5 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-primary/10"
                    >
                      <div className="bg-gradient-to-br from-emerald-500 to-green-600 p-3 rounded-xl shadow-md">
                        <TrendingUp className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed">{renderWithCitations(tactic, insightsData.citations)}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            )}

            {activeTab === 'kpi' && (
              <div className="bg-card/90 backdrop-blur-sm rounded-2xl p-8 md:p-10 shadow-xl border border-border overflow-hidden relative group hover:border-primary/20 transition-all duration-300">
                <div className="absolute inset-0 opacity-[0.02] group-hover:opacity-[0.04] transition-opacity">
                  <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px]"></div>
                </div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 shadow-lg">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">KPI Actions</h3>
                </div>
                <motion.ul 
                  className="space-y-6"
                  variants={container}
                  initial="hidden"
                  animate="show"
                >
                  {insightsData.kpi_action_items.map((item, index) => (
                    <motion.li
                      key={index}
                      variants={item}
                      className="flex items-start gap-4 group/item hover:bg-primary/5 p-4 rounded-xl transition-all duration-300 border border-transparent hover:border-primary/10"
                    >
                      <div className="bg-gradient-to-br from-amber-500 to-yellow-500 p-3 rounded-xl shadow-md">
                        <Lightbulb className="h-5 w-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <p className="text-foreground leading-relaxed">{renderWithCitations(item, insightsData.citations)}</p>
                      </div>
                    </motion.li>
                  ))}
                </motion.ul>
              </div>
            )}
          </motion.div>

                <FloatingReportButton />
        </div>
      </motion.div>
    </div>
  );
};

export default InsightsPage;