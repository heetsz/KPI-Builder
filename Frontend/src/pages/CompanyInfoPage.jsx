import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { Building2, Rocket, Users } from "lucide-react";

const URL = import.meta.env.VITE_BACKEND_URL; // Ensure this is set in your .env file
//;
const CompanyInfoPage = () => {
  const { theme } = useTheme();
  const { user, setUser, message, setMessage } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    industry: "",
    stage: "",
    founded: "",
    employees: "",
    product: "",
    target_market: "",
    technology_readiness_level: "",
    tam: "",
    sam: "",
    som: "",
    market_cagr: "",
    elevator_pitch: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Transform the form data to match backend model field names
      const companyData = {
        name: formData.name,
        industry: formData.industry,
        stage: formData.stage,
        founded: formData.founded,
        employees: formData.employees,
        product: formData.product,
        targetMarket: formData.target_market,          // Convert snake_case to camelCase
        technologyReadinessLevel: formData.technology_readiness_level, // Convert snake_case to camelCase
        tam: formData.tam,
        sam: formData.sam,
        som: formData.som,
        marketCAGR: formData.market_cagr,              // Convert snake_case to camelCase
        elevatorPitch: formData.elevator_pitch,        // Convert snake_case to camelCase
        email: user?.email, // from user context
        password: user?.password, // from user context
      };
  
      const response = await fetch(`${URL}/api/companies/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(companyData)
      });
  
      const data = await response.json();

      if (data.success) {
        const updatedUser = { 
          ...user, 
          isNewUser: false, 
          companyId: data.company.companyId 
        };
        setUser(updatedUser);
        setMessage({ text: 'Company information saved successfully', type: 'success' });
        navigate('/login', { replace: true });
      } else {
        throw new Error(data.message || 'Failed to save company information');
      }
    } catch (error) {
      console.error('Error saving company info:', error);
      setMessage({ text: `Error saving company information: ${error.message}`, type: 'error' });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <motion.div 
      className="min-h-screen bg-background"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="container mx-auto py-10 px-4 sm:px-6">
        <div className="flex items-center gap-3 mb-8">
          <Building2 className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Help us know you better</h1>
            <p className="text-muted-foreground">This information will help us provide personalized insights for your startup</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className={`${theme.border} border rounded-lg p-6 bg-background/50 shadow-sm`}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Company Basics
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Company Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g., Grameen Diagnostics"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Industry</label>
                <select
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
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
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Founded Year</label>
                <input
                  type="number"
                  name="founded"
                  value={formData.founded}
                  onChange={handleChange}
                  placeholder="e.g., 2022"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>
          </div>

          <div className={`${theme.border} border rounded-lg p-6 bg-background/50 shadow-sm`}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Rocket className="h-5 w-5 text-primary" />
              Business Stage & Structure
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Startup Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                >
                  <option value="">Select Stage</option>
                  <option value="Ideation">Ideation</option>
                  <option value="MVP">MVP</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B">Series B</option>
                  <option value="Growth">Growth</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Number of Employees</label>
                <input
                  type="number"
                  name="employees"
                  value={formData.employees}
                  onChange={handleChange}
                  placeholder="e.g., 11"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">Technology Readiness Level</label>
                <select
                  name="technology_readiness_level"
                  value={formData.technology_readiness_level}
                  onChange={handleChange}
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
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
              </div>
            </div>
          </div>

          <div className={`${theme.border} border rounded-lg p-6 bg-background/50 shadow-sm`}>
            <h2 className="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Market & Product
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Product/Service Description</label>
                <textarea
                  name="product"
                  value={formData.product}
                  onChange={handleChange}
                  placeholder="e.g., Affordable rural diagnostic testing network using mobile vans"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Target Market</label>
                <textarea
                  name="target_market"
                  value={formData.target_market}
                  onChange={handleChange}
                  placeholder="e.g., Tier 3 towns and rural India"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[80px]"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Total Addressable Market (TAM)</label>
                  <input
                    type="text"
                    name="tam"
                    value={formData.tam}
                    onChange={handleChange}
                    placeholder="e.g., ₹25,000 crore"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Serviceable Available Market (SAM)</label>
                  <input
                    type="text"
                    name="sam"
                    value={formData.sam}
                    onChange={handleChange}
                    placeholder="e.g., ₹8,000 crore"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Serviceable Obtainable Market (SOM)</label>
                  <input
                    type="text"
                    name="som"
                    value={formData.som}
                    onChange={handleChange}
                    placeholder="e.g., ₹500 crore"
                    className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Market CAGR (%)</label>
                <input
                  type="number"
                  step="0.1"
                  name="market_cagr"
                  value={formData.market_cagr}
                  onChange={handleChange}
                  placeholder="e.g., 14.5"
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Elevator Pitch</label>
                <textarea
                  name="elevator_pitch"
                  value={formData.elevator_pitch}
                  onChange={handleChange}
                  placeholder="A brief, compelling description of your business..."
                  className="w-full px-4 py-2 rounded-md border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary min-h-[120px]"
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-primary text-primary-foreground py-3 px-8 rounded-md font-medium hover:bg-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Save and Continue to Dashboard
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default CompanyInfoPage;