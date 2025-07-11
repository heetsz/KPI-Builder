const Company = require('../models/companyModel');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const { generateToken, invalidateToken } = require('../middleware/authMiddleware');
require('dotenv').config();
const BACKEND_URL = process.env.BACKEND_URL;

// Create a new company
exports.createCompany = async (req, res) => {
  try {
    const companyData = {
      ...req.body,
      companyId: uuidv4()
    };

    if (!companyData.password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required'
      });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    companyData.password = await bcrypt.hash(companyData.password, salt);

    // // Initialize the dashboard layouts
    // try {
    //   await Promise.all([
    //     axios.post(`${BACKEND_URL}/api/finance/kpis/layout`, { companyId: companyData.companyId }),
    //     axios.post(`${BACKEND_URL}/api/marketing/kpis/layout`, { companyId: companyData.companyId }),
    //     axios.post(`${BACKEND_URL}/api/operations/kpis/layout`, { companyId: companyData.companyId }),
    //     axios.post(`${BACKEND_URL}/api/sales/kpis/layout`, { companyId: companyData.companyId })
    //   ]);
    // } catch (error) {
    //   console.error('Error initializing dashboard layouts:', error);
    //   return res.status(500).json({
    //     success: false,
    //     message: 'Error initializing dashboard layouts',
    //     error: error.message
    //   });
    // }

    const company = new Company(companyData);
    await company.save();

    // Remove password from response
    company.password = undefined;

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Error creating company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while creating company',
      error: error.message
    });
  }
};

// Get a company by email
exports.getCompanyByCompanyId = async (req, res) => {
  try {
    const { companydId } = req.params;
    // console.log('Received email for company lookup:', companydId);
    const company = await Company.findOne({ companydId });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error fetching company by companyId:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company by companyId',
      error: error.message
    });
  }
};

// Get a company by email
exports.getCompanyByEmail = async (req, res) => {
  try {
    const { email } = req.params;
    // console.log('Received email for company lookup:', email);
    const company = await Company.findOne({ email });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Error fetching company by email:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company by email',
      error: error.message
    });
  }
};

// Update a company
exports.updateCompany = async (req, res) => {
  try {
    const { companyId } = req.params;
    const updatedData = req.body;

    const company = await Company.findOneAndUpdate(
      { companyId },
      { $set: updatedData, updatedAt: Date.now() },
      { new: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Error updating company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating company',
      error: error.message
    });
  }
};

// Login company
exports.loginCompany = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find company and explicitly include password field
    const company = await Company.findOne({ email }).select('+password');
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    if (!company.password) {
      console.error('Company found but password is undefined for email:', email);
      return res.status(500).json({
        success: false,
        message: 'Account setup is incomplete'
      });
    }

    const isMatch = await bcrypt.compare(password, company.password);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid password'
      });
    }

    // Generate JWT token
    const token = generateToken(company.companyId);

    // Update company status
    await Company.findOneAndUpdate(
      { companyId: company.companyId },
      { 
        $set: { 
          isActive: true,
          lastLogin: new Date()
        }
      }
    );

    // Remove password from response
    company.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      company
    });
  } catch (error) {
    console.error('Error logging in company:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while logging in company',
      error: error.message
    });
  }
};

// Logout company
exports.logout = async (req, res) => {
  try {
    const { companyId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'No token provided'
      });
    }

    // Invalidate the token
    invalidateToken(token);

    // Update company status
    await Company.findOneAndUpdate(
      { companyId },
      { 
        $set: { 
          isActive: false,
          lastLogout: new Date()
        }
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Error during logout:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error during logout',
      error: error.message
    });
  }
};