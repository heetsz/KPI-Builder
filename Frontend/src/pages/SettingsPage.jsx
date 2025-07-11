import { useState, useEffect } from "react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import axios from "axios";
import {
  Bell,
  Shield,
  Palette,
  Users,
  Mail,
  Building2,
  LifeBuoy,
  User,
  Upload,
  Trash2,
  Check,
  ChevronRight,
  Save,
  AlertCircle,
} from "lucide-react";

const URL = import.meta.env.VITE_BACKEND_URL;

const SettingsPage = () => {
  const { theme, isDarkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("startup");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSaveToast, setShowSaveToast] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [companyData, setCompanyData] = useState(null);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${URL}/api/companies/email/${user.email}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setCompanyData(response.data.company);
        }
      } catch (err) {
        console.error('Error fetching company info:', err);
        setError(err.message || 'Failed to fetch company information');
      } finally {
        setLoading(false);
      }
    };

    if (user?.email) {
      fetchCompanyInfo();
    }
  }, [user]);

  const handleUpdate = async (sectionId) => {
    try {
      if (sectionId === "startup") {
        // Transform data to match backend schema
        const companyUpdateData = {
          ...companyData,
          // Ensure proper casing for MongoDB schema
          targetMarket: companyData.targetMarket,
          technologyReadinessLevel: companyData.technologyReadinessLevel,
          marketCAGR: companyData.marketCAGR,
          elevatorPitch: companyData.elevatorPitch,
        };

        const response = await axios.put(
          `${URL}/api/companies/${companyData.companyId}`,
          companyUpdateData,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );

        if (response.data.success) {
          setShowSaveToast(true);
          setTimeout(() => setShowSaveToast(false), 3000);
        }
      }
    } catch (err) {
      console.error('Error updating company info:', err);
      setError(err.message || 'Failed to update company information');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCompanyData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-lg font-medium text-foreground">Loading your settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-6">
        <div className="max-w-md p-6 rounded-lg shadow-lg border border-red-200 bg-red-50 text-red-700">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-6 w-6" />
            <h3 className="text-lg font-semibold">Something went wrong</h3>
          </div>
          <p className="mt-2">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const settingsSections = [
    {
      id: "startup",
      title: "Company Information",
      icon: Building2,
      color: "#F59E0B",
      description: "Manage your company profile and business details",
      settings: [
        {
          title: "Company Logo",
          description: "Your company's brand image",
          control: (
            <div className="flex items-center gap-4">
              <div className="h-20 w-20 rounded-lg bg-muted flex items-center justify-center overflow-hidden border-2 border-dashed border-border hover:border-primary transition-colors group relative">
                {companyData?.logo ? (
                  <img src={companyData.logo} alt="Company Logo" className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-primary/20 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Upload className="h-6 w-6 text-white" />
                </div>
              </div>
              <button className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-all focus-visible:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-md h-10 px-4">
                <Upload className="h-4 w-4" />
                Upload Logo
              </button>
            </div>
          ),
        },
        {
          title: "Company Name",
          description: "Your startup or company name",
          control: (
            <input
              type="text"
              name="name"
              value={companyData?.name || ""}
              onChange={handleInputChange}
              placeholder="e.g., Acme Inc."
              className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Company Email",
          description: "Primary contact email",
          control: (
            <input
              type="email"
              name="email"
              value={companyData?.email || ""}
              onChange={handleInputChange}
              placeholder="contact@company.com"
              className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Industry",
          description: "Select your industry sector",
          control: (
            <select 
              name="industry"
              value={companyData?.industry || ""}
              onChange={handleInputChange}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select Industry</option>
              <option value="HealthTech">HealthTech</option>
              <option value="FinTech">FinTech</option>
              <option value="EdTech">EdTech</option>
              <option value="CleanTech">CleanTech</option>
              <option value="AgriTech">AgriTech</option>
              <option value="E-commerce">E-commerce</option>
              <option value="Manufacturing">Manufacturing</option>
            </select>
          ),
        },
        {
          title: "Founded Year",
          description: "When was your company founded",
          control: (
            <input
              type="number"
              name="founded"
              value={companyData?.founded || ""}
              onChange={handleInputChange}
              placeholder="2023"
              min="1900"
              max={new Date().getFullYear()}
              className="h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Number of Employees",
          description: "Current team size",
          control: (
            <select 
              name="employees"
              value={companyData?.employees || ""}
              onChange={handleInputChange}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          ),
        },
        {
          title: "Product/Service Description",
          description: "Describe your main product or service",
          control: (
            <textarea
              name="product"
              value={companyData?.product || ""}
              onChange={handleInputChange}
              placeholder="Briefly describe what your company offers..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
            />
          ),
        },
        {
          title: "Target Market",
          description: "Who are your primary customers",
          control: (
            <textarea
              name="targetMarket"
              value={companyData?.targetMarket || ""}
              onChange={handleInputChange}
              placeholder="Describe your target market..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
            />
          ),
        },
        {
          title: "Technology Readiness Level",
          description: "Current state of your technology",
          control: (
            <select 
              name="technologyReadinessLevel"
              value={companyData?.technologyReadinessLevel || ""}
              onChange={handleInputChange}
              className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Select TRL</option>
              <option value="TRL 1">TRL 1 - Basic principles observed</option>
              <option value="TRL 2">TRL 2 - Technology concept formulated</option>
              <option value="TRL 3">TRL 3 - Experimental proof of concept</option>
              <option value="TRL 4">TRL 4 - Technology validated in lab</option>
              <option value="TRL 5">TRL 5 - Technology validated in relevant environment</option>
              <option value="TRL 6">TRL 6 - Technology demonstrated in relevant environment</option>
              <option value="TRL 7">TRL 7 - System prototype demonstration in operational environment</option>
              <option value="TRL 8">TRL 8 - System complete and qualified</option>
              <option value="TRL 9">TRL 9 - Actual system proven in operational environment</option>
            </select>
          ),
        },
        {
          title: "Elevator Pitch",
          description: "Your company's brief description",
          control: (
            <textarea
              name="elevatorPitch"
              value={companyData?.elevatorPitch || ""}
              onChange={handleInputChange}
              placeholder="Describe your company in a compelling way (30-60 seconds if spoken)..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px] resize-none"
            />
          ),
        },
        {
          title: "Total Addressable Market (TAM)",
          description: "Total market size",
          control: (
            <input
              type="text"
              name="tam"
              value={companyData?.tam || ""}
              onChange={handleInputChange}
              placeholder="e.g., ₹25,000 crore"
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Serviceable Available Market (SAM)",
          description: "Segment of TAM that can be reached",
          control: (
            <input
              type="text"
              name="sam"
              value={companyData?.sam || ""}
              onChange={handleInputChange}
              placeholder="e.g., ₹8,000 crore"
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Serviceable Obtainable Market (SOM)",
          description: "Portion of SAM you can capture",
          control: (
            <input
              type="text"
              name="som"
              value={companyData?.som || ""}
              onChange={handleInputChange}
              placeholder="e.g., ₹500 crore"
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
        {
          title: "Market CAGR (%)",
          description: "Compound Annual Growth Rate",
          control: (
            <input
              type="number"
              step="0.1"
              name="marketCAGR"
              value={companyData?.marketCAGR || ""}
              onChange={handleInputChange}
              placeholder="e.g., 14.5"
              className="w-full h-9 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          ),
        },
      ],
    },
    {
      id: "notifications",
      title: "Notifications",
      icon: Bell,
      color: "#EC4899",
      settings: [
        {
          title: "Email Notifications",
          description: "Receive email updates about your KPI alerts",
          control: (
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="email-notifications"
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              <label htmlFor="email-notifications" className="text-sm">Enable</label>
            </div>
          ),
        },
        {
          title: "Report Frequency",
          description: "How often would you like to receive reports",
          control: (
            <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="instant">Instant Updates</option>
              <option value="daily">Daily Summary</option>
              <option value="weekly">Weekly Digest</option>
              <option value="monthly">Monthly Report</option>
            </select>
          ),
        },
      ],
    },
    {
      id: "privacy",
      title: "Privacy & Security",
      icon: Shield,
      color: "#EF4444",
      settings: [
        {
          title: "Two-Factor Authentication",
          description: "Add an extra layer of security to your account",
          control: (
            <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
              Enable 2FA
            </button>
          ),
        },
        {
          title: "Export Data",
          description: "Download all your KPI data",
          control: (
            <select className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
              <option value="csv">CSV Format</option>
              <option value="excel">Excel Format</option>
              <option value="json">JSON Format</option>
            </select>
          ),
        },
        {
          title: "Data Control",
          description: "Permanently delete all uploaded Excel files",
          control: (
            <button 
              className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Delete All Excel Files
            </button>
          ),
        },
        {
          title: "Delete Account",
          description: "Permanently delete your account and all data",
          control: (
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 px-4 bg-red-500"
            >
              <Trash2 className="h-4 w-4" />
              Delete Account
            </button>
          ),
        },
      ],
    },
    {
      id: "team",
      title: "Team Management",
      icon: Users,
      color: "#8B5CF6",
      settings: [
        {
          title: "Team Invitations",
          description: "Invite team members to collaborate",
          control: (
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Email address"
                className="h-9 flex-1 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <select className="h-9 w-32 rounded-md border border-border bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
                <option value="admin">Admin</option>
              </select>
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4">
                Invite
              </button>
            </div>
          ),
        },
      ],
    },
    {
      id: "support",
      title: "Support & Help",
      icon: LifeBuoy,
      color: "#14B8A6",
      settings: [
        {
          title: "Contact Support",
          description: "Get help with your account or dashboard",
          control: (
            <a
              href="mailto:support@dhruvaa.com"
              className="inline-flex items-center gap-2 justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-muted hover:bg-muted/80 h-9 px-4"
            >
              <Mail className="h-4 w-4" />
              Contact Support
            </a>
          ),
        },
        {
          title: "Feedback",
          description: "Help us improve by providing feedback",
          control: (
            <textarea
              placeholder="Your feedback helps us improve..."
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px] resize-none"
            />
          ),
        },
      ],
    },
  ];

  return (
    <div className="p-6 min-h-screen bg-background">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your account preferences and company information</p>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className={`${isDarkMode ? 'bg-card/50' : theme.cardBg} backdrop-blur-sm border-border border rounded-xl overflow-hidden shadow-xl max-w-7xl mx-auto`}
      >
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className={`md:w-72 border-r border-border md:h-auto ${isDarkMode ? 'bg-card/50' : 'bg-background/50'}`}>
            <nav className="p-4 sticky top-0">
              <ul className="space-y-1">
                {settingsSections.map((section) => (
                  <motion.li key={section.id} whileHover={{ x: 5 }} transition={{ type: "spring", stiffness: 400 }}>
                    <button
                      onClick={() => setActiveTab(section.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-[15px] font-medium rounded-lg transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                        activeTab === section.id
                          ? `text-foreground bg-gradient-to-r from-primary/10 to-primary/5 border-l-4 border-primary`
                          : `text-foreground/70 hover:text-foreground hover:bg-black/5 dark:hover:bg-white/5`
                      }`}
                    >
                      <section.icon size={20} style={{ color: section.color }} />
                      <span>{section.title}</span>
                    </button>
                  </motion.li>
                ))}
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-h-[80vh]">
            {settingsSections.map((section) => (
              <AnimatePresence mode="wait" key={section.id}>
                {activeTab === section.id && (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 md:p-8"
                >
                  <div className="flex items-center gap-4 mb-6 pb-4 border-b border-border">
                    <div className={`p-3 rounded-full bg-${section.color}/10`} style={{ backgroundColor: `${section.color}10` }}>
                      <section.icon size={28} style={{ color: section.color }} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-foreground">
                        {section.title}
                      </h2>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description || "Manage your preferences"}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {section.settings.map((setting, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: index * 0.05 }}
                        className={`flex flex-col md:flex-row md:items-start justify-between p-5 rounded-xl ${theme.border} border bg-card/30 hover:bg-card/50 transition-colors duration-200 gap-5`}
                      >
                        <div className="md:max-w-[50%]">
                          <h3 className="text-lg font-semibold text-foreground">
                            {setting.title}
                          </h3>
                          <p className={`text-sm text-muted-foreground mt-1`}>
                            {setting.description}
                          </p>
                        </div>
                        <div className="w-full md:w-auto">
                          {setting.control}
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  <motion.div 
                    className="flex justify-end pt-6 mt-8 border-t border-border"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <button
                      onClick={() => handleUpdate(section.id)}
                      className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 active:scale-95 h-11 px-6 shadow-sm hover:shadow"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </button>
                  </motion.div>
                </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Delete Account Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowDeleteModal(false)}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${theme.cardBg} ${theme.border} rounded-xl border p-6 w-full max-w-md shadow-2xl`}
            >
              <div className="flex items-center justify-center mb-4 p-4 bg-red-100 rounded-full w-16 h-16 mx-auto">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-center text-foreground mb-2">Delete Account</h3>
              <p className={`text-sm text-center text-muted-foreground mb-6`}>
                Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-muted hover:bg-muted/80 active:scale-95 h-11 px-6"
                >
                  Cancel
                </button>
                <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus:ring-2 focus:ring-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-destructive text-destructive-foreground hover:bg-destructive/90 active:scale-95 h-11 px-6">
                  Delete Account
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Toast */}
      <AnimatePresence>
        {showSaveToast && (
          <motion.div
            initial={{ opacity: 0, y: 20, x: '-50%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2"
          >
            <Check className="h-5 w-5" />
            <span className="font-medium">Settings saved successfully!</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SettingsPage;