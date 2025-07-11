import { useState } from 'react';
import { useAuth } from "../../context/AuthContext";
import { File, AlertCircle, CheckCircle, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingReportButton = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  
  const COMPANY_ID = user?.companyId;
  const URL = import.meta.env.VITE_BACKEND_URL;
  
  const handleDownload = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${URL}/api/reports/company/${COMPANY_ID}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${user?.token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to download: ${response.statusText}`);
      }
      
      const blob = await response.blob();
      
      // Create a URL for the blob
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link element
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'business-insights-report.pdf');
      
      // Append to the document
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(err.message || 'Failed to download report');
      setTimeout(() => setError(null), 6000);
    } finally {
      setLoading(false);
    }
  };

  const dismissNotification = () => {
    setSuccess(false);
    setError(null);
  };

  return (
    <>
      <motion.button
        className="fixed z-50 p-4 rounded-full bg-gradient-to-r from-primary to-primary/80 text-white shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-primary/70 transition-all duration-300"
        style={{ 
          bottom: '2rem', 
          right: '2rem' 
        }}
        onClick={handleDownload}
        disabled={loading}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
      >
        {loading ? (
          <Loader2 className="h-6 w-6 animate-spin" />
        ) : (
          <div className="flex items-center gap-2">
            <File className="h-5 w-5" />
            <span className="font-medium">PDF Report</span>
          </div>
        )}
      </motion.button>
      
      <AnimatePresence>
        {(error || success) && (
          <motion.div 
            className={`fixed bottom-24 right-6 p-4 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
              error ? 'bg-destructive text-destructive-foreground' : 'bg-green-600 text-white'
            }`}
            initial={{ opacity: 0, y: 20, x: 20 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10, x: 20 }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          >
            {error ? (
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
            ) : (
              <CheckCircle className="h-5 w-5 flex-shrink-0" />
            )}
            <span className="text-sm font-medium">
              {error || 'Report downloaded successfully!'}
            </span>
            <button 
              onClick={dismissNotification}
              className="ml-2 p-1 rounded-full hover:bg-black/10"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FloatingReportButton;