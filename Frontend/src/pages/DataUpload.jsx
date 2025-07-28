import { useState, useEffect } from 'react';
import { FileDown, Upload, FileCheck, AlertCircle, X, ArrowRight, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { motion } from "framer-motion";
import axios from 'axios';
import { useAuth } from "../context/AuthContext";
// import {useAuth}

const URL = import.meta.env.VITE_BACKEND_URL;

export default function DataEntryPage() {
  const navigate = useNavigate();
  const { theme, isDarkMode } = useTheme();
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadStatus, setUploadStatus] = useState(null); // 'success', 'error', 'uploading', or null
  const [uploadError, setUploadError] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [domain, setDomain] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [companyName, setCompanyName] = useState('');
  const { user } = useAuth(); // Assuming you have a user context that provides user info
  const COMPANY_ID = user.companyId // Replace with dynamic company ID if needed
  
  // Get domain from localStorage on component mount
  useEffect(() => {
    const storedDomain = localStorage.getItem('domain');
    // Convert kebab-case back to display format
    const formattedDomain = storedDomain
      ? storedDomain.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
      : '';
    setDomain(formattedDomain);
    
    // For demo purposes - in a real app, these would come from user authentication or context
    setCompanyId(COMPANY_ID);
    // setCompanyName(localStorage.getItem('companyName') || 'Demo Company');
  }, []);

  // Function to convert domain to API-friendly format
  const getDomainSlug = (domain) => {
    return domain.toLowerCase().replace(/\s*&\s*/g, '-').replace(/\s+/g, '-');
  };

  // Function to determine the API endpoint based on the domain
  const getApiEndpoint = () => {
    const domainSlug = getDomainSlug(domain);

    // Backend API Call
    return `${URL}/api/${domainSlug}/kpis/upload`;
  };

  // Function to get dashboard route based on domain
  const getDashboardRoute = () => {
    const domainRoutes = {
      'Sales': '/dashboard/sales',
      'Marketing': '/dashboard/marketing',
      'Finance': '/dashboard/finance',
      'Manufacturing': '/dashboard/manufacturing',
      'Production': '/dashboard/production',
      'Operations': '/dashboard/operations',
      'Customer & Growth': '/dashboard/customer-growth',
      'SaaS': '/dashboard/overview'
    };
    
    return domainRoutes[domain] || '/dashboard/overview';
  };

  // Process and upload the data to the backend
  const handleProcessData = async () => {
    if (!uploadedFile) return;
    
    const formData = new FormData();
    formData.append('file', uploadedFile);
    formData.append('companyId', companyId);
    // formData.append('companyName', companyName);
    
    // Determine which KPIs to select based on domain
    // In a real app, this might come from user selection in the UI
    const defaultKPIs = {
      'Finance': ['revenueGrowthRate', 'grossProfitMargin', 'netProfitMargin', 'operatingCashFlow', 'burnRate', 'runway', 'ebitda', 'currentRatio'],
      'Sales': ['conversionRate', 'salesGrowth', 'avgDealSize', 'salesCycle'],
      'Marketing': ['cac', 'roas', 'ctr', 'conversionRate'],
      // Add more default KPIs for other domains as needed
    };
    
    // Add the selected KPIs to the form data
    const selectedKPIs = defaultKPIs[domain] || defaultKPIs['Finance'];
    formData.append('selectedKPIs', JSON.stringify(selectedKPIs));
    
    setUploadStatus('uploading');
    
    try {
      const endpoint = getApiEndpoint();
      
      // Upload with progress tracking
      console.log("Uploading to:", endpoint);
      const response = await axios.post(endpoint, formData, {

        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });
      
      // Check if response is successful
      if (response.status >= 200 && response.status < 300) {
        setUploadStatus('success');
        
        // Store successful upload info in localStorage
        localStorage.setItem('lastUploadedFile', uploadedFile.name);
        localStorage.setItem('lastUploadTimestamp', new Date().toISOString());
        
        // Allow the success state to be visible for a moment before redirecting
        console.log("Upload successful, will redirect to:", getDashboardRoute());
      } else {
        throw new Error('Upload failed with status: ' + response.status);
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setUploadError(
        error.response?.data?.message || 
        'An error occurred during upload. Please try again.'
      );
    }
  };
  
  // Function to handle redirect to dashboard
  const handleViewDashboard = async () => {
    try {
      // Navigate directly to dashboard since file was already uploaded successfully
      const dashboardRoute = getDashboardRoute();
      console.log("Navigating to dashboard:", dashboardRoute);
      navigate(dashboardRoute);
    } catch (error) {
      console.error("Navigation error:", error);
      // Fallback navigation
      navigate('/dashboard/overview');
    }
  };
  
  // Function to download template
  const downloadTemplate = async () => {
    try {
      const domainSlug = getDomainSlug(domain);
      const templateUrl = `${import.meta.env.VITE_BACKEND_URL}/api/${domainSlug}/kpis/template/download`;
      
      const response = await axios({
        url: templateUrl,
        method: 'GET',
        responseType: 'blob'
      });
      
      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'text/csv' });
      
      // Create object URL and trigger download
      const url = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.href = url;
      tempLink.setAttribute('download', `Dhruvaa_KPI_${formatDomainName().replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(tempLink);
      tempLink.click();
      document.body.removeChild(tempLink);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading template:', error);
    }
  };

  // Format domain name for display
  const formatDomainName = () => {
    if (!domain) return '';
    return domain; // Domain is already in display format from useEffect
  };
  
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    
    if (!file) return;
    
    // Check if file is Excel or CSV
    const validExtensions = ['.xlsx', '.xls', '.csv'];
    const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setUploadStatus('error');
      setUploadError('Please upload a valid file (.xlsx, .xls, or .csv)');
      setUploadedFile(null);
      return;
    }
    
    setUploadedFile(file);
    console.log(uploadedFile);
    setUploadStatus('success');
    setUploadError('');
  };
  
  const clearUpload = () => {
    setUploadedFile(null);
    setUploadStatus(null);
    setUploadError('');
    setUploadProgress(0);
  };

  return (
    <div className="min-h-screen p-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold mb-8 text-foreground tracking-tight"
        >
          Upload Data
        </motion.h1>
        
        {/* Main Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-xl shadow-md overflow-hidden mb-8 border border-border"
        >
          {/* Steps */}
          <div className="flex flex-wrap text-center">
            <div className={`w-full md:w-1/3 bg-slate-50 dark:bg-slate-800 p-6 border-b md:border-b-0 md:border-r border-border`}>
              <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <FileDown size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Step 1: Download Template</h3>
              <p className="mb-4 text-muted-foreground">Download our template to ensure your {formatDomainName()} data is formatted correctly</p>
              <button 
                onClick={downloadTemplate} 
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-md flex items-center mx-auto transition-colors duration-200"
              >
                Download Template <FileDown size={16} className="ml-2" />
              </button>
            </div>
            
            <div className={`w-full md:w-1/3 bg-white dark:bg-slate-900 p-6 border-b md:border-b-0 md:border-r border-border`}>
              <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <FileCheck size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Step 2: Fill Your Data</h3>
              <p className="mb-4 text-muted-foreground">Enter your {formatDomainName()} KPI data in the template following the provided format</p>
              <div className="flex flex-col items-center">
                <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-sm mb-1"></div>
                <div className="h-2 w-16 bg-slate-200 dark:bg-slate-700 rounded-sm mb-2"></div>
                <div className="grid grid-cols-4 gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-2 w-8 bg-slate-200 dark:bg-slate-700 rounded-sm"></div>
                  ))}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={`row2-${i}`} className="h-2 w-8 bg-slate-200 dark:bg-slate-700 rounded-sm"></div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="w-full md:w-1/3 bg-white dark:bg-slate-900 p-6">
              <div className="mx-auto bg-primary/10 text-primary rounded-full h-12 w-12 flex items-center justify-center mb-4">
                <Upload size={24} />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">Step 3: Upload File</h3>
              <p className="mb-4 text-muted-foreground">Upload your completed file to start analyzing your {formatDomainName()} data</p>
              <button 
                onClick={() => document.getElementById('file-upload').click()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-5 py-2 rounded-md flex items-center mx-auto transition-colors duration-200"
              >
                Choose File <Upload size={16} className="ml-2" />
              </button>
              <input 
                type="file" 
                id="file-upload" 
                className="hidden" 
                onChange={handleFileUpload}
                accept=".xlsx,.xls,.csv"
              />
            </div>
          </div>
        </motion.div>
        
        {/* Upload Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={`${theme.cardBg} border ${theme.border} rounded-xl shadow-md overflow-hidden p-6 mb-8`}
        >
          <h2 className="text-2xl font-bold mb-6 text-foreground">Upload your {formatDomainName()} data file</h2>
              
          <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center ${
            uploadStatus === 'error' ? (isDarkMode ? 'border-destructive/50 bg-destructive/10' : 'border-destructive/30 bg-destructive/5') : 
            uploadStatus === 'success' ? (isDarkMode ? 'border-green-700 bg-green-900/20' : 'border-green-300 bg-green-50') : 
            uploadStatus === 'uploading' ? (isDarkMode ? 'border-primary/50 bg-primary/10' : 'border-primary/30 bg-primary/5') :
            'border-border/60 bg-muted/20'
          }`}>
            {!uploadedFile ? (
              <>
                <div className="mb-4">
                  {uploadStatus === 'error' ? (
                    <div className="h-16 w-16 rounded-full bg-destructive/10 text-destructive flex items-center justify-center">
                      <AlertCircle size={32} />
                    </div>
                  ) : (
                    <div className="h-16 w-16 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Upload size={32} />
                    </div>
                  )}
                </div>
                
                <h3 className="text-lg font-medium mb-2 text-center text-foreground">
                  {uploadStatus === 'error' ? 'Upload Error' : 'Drag & drop your file here'}
                </h3>
                
                <p className={`text-sm mb-4 text-center ${
                  uploadStatus === 'error' ? 'text-destructive' : 'text-muted-foreground'
                }`}>
                  {uploadStatus === 'error' ? uploadError : 'or click the button below to browse files'}
                </p>
                
                <button 
                  onClick={() => document.getElementById('file-upload-main').click()}
                  className={`px-6 py-3 rounded-md font-medium flex items-center ${
                    uploadStatus === 'error' ? 
                    'bg-destructive hover:bg-destructive/90 text-destructive-foreground' : 
                    'bg-primary hover:bg-primary/90 text-primary-foreground'
                  } transition-colors duration-200`}
                >
                  {uploadStatus === 'error' ? 'Try Again' : 'Browse Files'}
                  <Upload size={18} className="ml-2" />
                </button>
                
                <input 
                  type="file" 
                  id="file-upload-main" 
                  className="hidden" 
                  onChange={handleFileUpload}
                  accept=".xlsx,.xls,.csv"
                />
                
                <p className="text-xs text-muted-foreground mt-4">
                  Supported formats: Excel (.xlsx, .xls) and CSV (.csv) – Maximum file size: 10MB
                </p>
              </>
            ) : (
              <div className="w-full">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center mr-4 ${
                      uploadStatus === 'uploading' ? 'bg-primary/10 text-primary' :
                      uploadStatus === 'success' ? 'bg-green-500/10 text-green-500' :
                      'bg-muted text-muted-foreground'
                    }`}>
                      {uploadStatus === 'uploading' ? (
                        <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <CheckCircle size={24} />
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-foreground">{uploadedFile.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • {
                          uploadedFile.name.endsWith('.csv') ? 'CSV file' : 'Excel file'
                        }
                      </p>
                    </div>
                  </div>
                  {uploadStatus !== 'uploading' && (
                    <button 
                      onClick={clearUpload}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
                
                <div className="w-full bg-muted rounded-full h-2.5 mb-6">
                  <div 
                    className={`${
                      uploadStatus === 'uploading' ? 'bg-primary' : 'bg-green-500'
                    } h-2.5 rounded-full transition-all duration-300`}
                    style={{ width: `${uploadStatus === 'uploading' ? uploadProgress : 100}%` }}
                  ></div>
                </div>
                
                <div className="flex justify-between">
                  {uploadStatus !== 'uploading' ? (
                    <>
                      <button 
                        onClick={clearUpload}
                        className="px-4 py-2 border border-border text-muted-foreground hover:bg-muted rounded-md transition-colors duration-200"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={uploadStatus === 'success' ? handleViewDashboard : handleProcessData}
                        className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md flex items-center justify-center font-medium shadow-lg transition-all duration-300"
                      >
                        {uploadStatus === 'success' ? 'View Dashboard' : 'Upload File'} 
                        <ArrowRight size={20} className="ml-2" />
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center text-primary font-medium">
                      Uploading... {uploadProgress}%
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
               
        
        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold mb-6 text-foreground">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            <div className={`${theme.cardBg} border ${theme.border} rounded-lg shadow-sm p-5`}>
              <h3 className="font-semibold text-lg mb-2 text-foreground">What format should my {formatDomainName()} data be in?</h3>
              <p className="text-muted-foreground">Your data should follow the exact format of our template. Each column represents a specific KPI and each row represents a time period or category.</p>
            </div>
            
            <div className={`${theme.cardBg} border ${theme.border} rounded-lg shadow-sm p-5`}>
              <h3 className="font-semibold text-lg mb-2 text-foreground">How large can my file be?</h3>
              <p className="text-muted-foreground">We accept files up to 10MB in size. If your data exceeds this limit, please contact our support team for alternative upload methods.</p>
            </div>
            
            <div className={`${theme.cardBg} border ${theme.border} rounded-lg shadow-sm p-5`}>
              <h3 className="font-semibold text-lg mb-2 text-foreground">Is my data secure?</h3>
              <p className="text-muted-foreground">Yes, all uploaded data is encrypted and stored securely. We follow industry best practices for data protection and privacy compliance.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}