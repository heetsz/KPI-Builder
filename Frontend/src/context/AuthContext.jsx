import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const URL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('isAuthenticated') === 'true';
  });
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => {
    return localStorage.getItem('token');
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const navigate = useNavigate();
  const location = useLocation();

  // Effect to persist authentication state
  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    const savedUser = localStorage.getItem('user');
    const savedIsAuthenticated = localStorage.getItem('isAuthenticated');

    if (savedToken && savedUser && savedIsAuthenticated === 'true') {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (userData) => {
    try {
      if (!userData.email || !userData.password) {
        throw new Error('Email and password are required');
      }

      const loginResponse = await fetch(`${URL}/api/companies/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: userData.email,
          password: userData.password
        })
      });

      const data = await loginResponse.json();

      if (!data.success) {
        throw new Error(data.message || 'Login failed');
      }

      // Set auth state
      const user = {
        email: userData.email,
        name: data.company.name,
        companyId: data.company.companyId,
        isNewUser: false
      };
      
      setIsAuthenticated(true);
      setUser(user);
      setToken(data.token);
      
      // Store in localStorage
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', data.token);
      
      setMessage({ text: 'Logged in successfully', type: 'success' });

      // Navigate to dashboard or the originally requested page
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (error) {
      console.error('Error during login:', error);
      setMessage({ text: error.message || 'Login failed', type: 'error' });
      throw error;
    }
  };

  const signup = async (userData) => {
    try {
      if (!userData.password) {
        throw new Error('Password is required');
      }

      const user = { 
        email: userData.email, 
        name: userData.name, 
        companyId: null,
        isNewUser: true,
        password: userData.password // Store password temporarily for company registration
      };

      setIsAuthenticated(true);
      setUser(user);
      setToken(null); // Token will be set after company info is submitted

      // Store minimal info in localStorage until company registration is complete
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('user', JSON.stringify(user));
      
      setMessage({ text: 'Account created successfully', type: 'success' });
      navigate('/company-info');
    } catch (error) {
      console.error('Error during signup:', error);
      setMessage({ text: `Error during signup: ${error.message}`, type: 'error' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user'));
      const currentToken = localStorage.getItem('token');
      
      if (storedUser?.companyId) {
        await fetch(`${URL}/api/companies/logout/${storedUser.companyId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
          }
        });
      }

      // Clear authentication state
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);

      // Clear all localStorage data
      localStorage.clear();
      
      // Clear specific auth items
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('companyInfo');

      // Clear any stored KPI data and layouts
      const dashboardTypes = [
        'sales', 'marketing', 'finance', 'manufacturing', 
        'production', 'operations', 'customer-growth', 'saas'
      ];
      
      dashboardTypes.forEach(type => {
        localStorage.removeItem(`${type}-layout`);
        localStorage.removeItem(`${type}-chart-config`);
        localStorage.removeItem(`${type}-selected-kpis`);
      });

      setMessage({ text: 'Logged out successfully', type: 'success' });

      // Navigate to landing page and reset history
      navigate('/', { 
        replace: true,
        state: { isLoggedOut: true }
      });

      // Clear browser history
      if (window.history && window.history.pushState) {
        window.history.pushState(null, '', '/');
        window.addEventListener('popstate', handlePopState);
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setMessage({ text: 'Error during logout. Please try again.', type: 'error' });
    }
  };

  // Create axios interceptor to add token to all requests
  useEffect(() => {
    const interceptor = axios.interceptors.request.use(
      (config) => {
        const currentToken = localStorage.getItem('token');
        if (currentToken) {
          config.headers.Authorization = `Bearer ${currentToken}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Cleanup interceptor on unmount
    return () => {
      axios.interceptors.request.eject(interceptor);
    };
  }, []);

  const handlePopState = (event) => {
    event.preventDefault();
    if (!isAuthenticated) {
      navigate('/', { replace: true });
    }
  };

  useEffect(() => {
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isAuthenticated]);

  const clearMessage = () => {
    setMessage({ text: '', type: '' });
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        token,
        message,
        login,
        signup,
        logout,
        clearMessage,
        setIsAuthenticated,
        setUser,
        setToken
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;