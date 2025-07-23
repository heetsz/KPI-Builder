const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const { verifyToken, clearExpiredTokens } = require('./middleware/authMiddleware');

// Import routes
const marketingKpiRoutes = require('./routes/marketingKPIRoutes');
const salesKpiRoutes = require('./routes/salesKPIRoutes');
const financeKpiRoutes = require('./routes/financeKPIRoutes');
const operationsKpiRoutes = require('./routes/operationsKPIRoutes');
const manufacturingKpiRoutes = require('./routes/manufacturingKPIRoutes');
const saasKpiRoutes = require('./routes/saasKPIRoutes');
const productionKpiRoutes = require('./routes/productionKPIRoutes');
const customerGrowthKpiRoutes = require('./routes/customerGrowthKPIRoutes');
const flaskRoutes = require('./routes/flaskRoutes');
const companyRoutes = require('./routes/companyRoutes');
const insightsRoutes = require('./routes/insightsRoutes');
const reportRoutes = require('./routes/reportRoutes'); // Import our report routes

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());
// JWT Configuration
if (!process.env.JWT_SECRET) {
  console.error('FATAL ERROR: JWT_SECRET is not defined');
  process.exit(1);
}

// Public routes
app.use('/api/companies', companyRoutes);

// Protected routes - apply authentication middleware
// app.use('/api/marketing/kpis', verifyToken, marketingKpiRoutes);
// app.use('/api/sales/kpis', verifyToken, salesKpiRoutes);
// app.use('/api/finance/kpis', verifyToken, financeKpiRoutes);
// app.use('/api/operations/kpis', verifyToken, operationsKpiRoutes);
// app.use('/api/manufacturing/kpis', verifyToken, manufacturingKpiRoutes);
// app.use('/api/saas/kpis', verifyToken, saasKpiRoutes);
// app.use('/api/production/kpis', verifyToken, productionKpiRoutes);
// app.use('/api/customer-growth/kpis', verifyToken, customerGrowthKpiRoutes);
// app.use('/api/flask', verifyToken, flaskRoutes); 

// Uncomment the above lines to protect the routes with JWT authentication
app.use('/api/marketing/kpis', marketingKpiRoutes);
app.use('/api/sales/kpis',  salesKpiRoutes);
app.use('/api/finance/kpis', financeKpiRoutes);
app.use('/api/operations/kpis',  operationsKpiRoutes);
app.use('/api/manufacturing/kpis', manufacturingKpiRoutes);
app.use('/api/saas/kpis',  saasKpiRoutes);
app.use('/api/production/kpis', productionKpiRoutes);
app.use('/api/customer-growth/kpis',  customerGrowthKpiRoutes);
app.use('/api/flask', flaskRoutes);
app.use('/api/insights', insightsRoutes);
app.use('/api/reports', reportRoutes); // Add our report routes


// MongoDB Atlas connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log('Connected to MongoDB Atlas'))
.catch((error) => console.error('MongoDB connection error:', error));

// Periodically clean up expired tokens (every hour)
setInterval(clearExpiredTokens, 3600000);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    cors({ origin: "https://frontend-lud5.onrender.com", credentials: true,
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});