import { Route, Routes, Navigate, useNavigate, Outlet, useLocation } from "react-router-dom";
import { useTheme } from "./context/ThemeContext";
import { useAuth } from "./context/AuthContext";
import Help from "./pages/Help";
import Sidebar from "./components/common/Sidebar";
import Header from "./components/common/Header";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import CompanyInfoPage from "./pages/CompanyInfoPage";
import DashboardHome from "./pages/DashboardHome";
import MainDashboardPage from "./pages/MainDashboardPage";
import SalesDashboardPage from "./pages/SalesDashboardPage";
import MarketingDashboardPage from "./pages/MarketingDashboardPage";
import ManufacturingDashboardPage from "./pages/ManufacturingDashboardPage";
import FinanceDashboardPage from "./pages/FinanceDashboardPage";
import ProductionDashboardPage from "./pages/ProductionDashboardPage";
import OperationDashboardPage from "./pages/OperationDashboardPage";
import CustomerDashboardPage from "./pages/CustomerDashboardPage";
import InsightsPage from "./pages/InsightsPage";
import SettingsPage from "./pages/SettingsPage";
import OnboardingPage from "./pages/Onboarding";
import DataUploadPage from "./pages/DataUpload";
import SaaSDashboardPage from "./pages/SaasDashboardPage";

import React from 'react';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // Only redirect to landing if explicitly logged out
  if (location.state?.isLoggedOut) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  // If not authenticated, store the attempted location and redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace state={{ from: location }} />;
  }

  return children;
};

const DashboardLayout = ({ children }) => {
  const { isDarkMode } = useTheme();
  const { message, clearMessage } = useAuth();
  
  React.useEffect(() => {
    if (message.text) {
      const timer = setTimeout(() => {
        clearMessage();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [message, clearMessage]);
  
  return (
    <div className={`${isDarkMode ? 'dark' : ''}`}>
      <div className="flex h-screen bg-background text-foreground overflow-hidden">
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
        </div>
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          <Header title="Dhruvaa: Start-up KPI Builder" />
          <div className="flex-1 overflow-y-auto scrollbar-custom">
            {message.text && (
              <div className={`fixed top-4 right-4 z-50 py-2 px-4 rounded-lg shadow-lg ${
                message.type === 'success' ? 'bg-primary text-primary-foreground' : 'bg-destructive text-destructive-foreground'
              }`}>
                {message.text}
              </div>
            )}
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  const { isAuthenticated, user } = useAuth();
  const hasCompanyInfo = localStorage.getItem('companyInfo') !== null;
  const isNewUser = user?.isNewUser;

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LandingPage />
      } />
      <Route path="help" element={<Help />} />
      
      /* Auth routes */
      <Route path="/auth/login" element={
        isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
      } />

      <Route path="/auth/signup" element={
        isAuthenticated
          ? (hasCompanyInfo
              ? <Navigate to="/dashboard" replace />
              : <Navigate to="/company-info" replace />
            )
          : <SignupPage />
      } />

      {/* Show CompanyInfoPage as a component if user is authenticated, is new, and has no company info */}
      {isAuthenticated && isNewUser && !hasCompanyInfo && <CompanyInfoPage />}}

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={
        <PrivateRoute>
          <DashboardLayout />
          {/* {!isNewUser || hasCompanyInfo ? <DashboardLayout /> : <Navigate to="/company-info" replace />} */}
        </PrivateRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="overview" element={<MainDashboardPage />} />
        <Route path="sales" element={<SalesDashboardPage />} />
        <Route path="marketing" element={<MarketingDashboardPage />} />
        <Route path="saas" element={<SaaSDashboardPage />} />
        <Route path="manufacturing" element={<ManufacturingDashboardPage />} />
        <Route path="finance" element={<FinanceDashboardPage />} />
        <Route path="production" element={<ProductionDashboardPage />} />
        <Route path="operations" element={<OperationDashboardPage />} />
        <Route path="customer-growth" element={<CustomerDashboardPage />} />
        <Route path="settings" element={<SettingsPage />} />
        <Route path="onboarding" element={<OnboardingPage />} />
        <Route path="dataupload" element={<DataUploadPage />} />
        <Route path="insights" element={<InsightsPage />} />
      </Route>

      {/* Error and fallback routes */}
      <Route path="/404" element={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
            <p className="text-muted-foreground mb-4">The page you're looking for doesn't exist.</p>
            <a href="/dashboard" className="text-primary hover:underline">Go back home</a>
          </div>
        </div>
      } />
      
      {/* Catch all redirect to 404 */}
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Routes>
  );
}

export default App;
