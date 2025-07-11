const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const CompanySchema = new mongoose.Schema({
  companyId: {
    type: String,
    default: uuidv4, // Generate a unique UUID for each company
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true,
    select: false // This ensures password isn't included in queries unless explicitly requested
  },
  email: {
    type: String,
    required: true,
    unique: true // Ensure email is unique
  },
  industry: {
    type: String,
    required: true
  },
  stage: {
    type: String,
    required: true
  },
  founded: {
    type: Number,
    required: true
  },
  employees: {
    type: Number,
    required: true
  },
  product: {
    type: String,
    required: true
  },
  targetMarket: {
    type: String,
    required: true
  },
  technologyReadinessLevel: {
    type: String,
    required: true
  },
  tam: {
    type: String,
    required: true
  },
  sam: {
    type: String,
    required: true
  },
  som: {
    type: String,
    required: true
  },
  marketCAGR: {
    type: Number,
    required: true
  },
  elevatorPitch: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: false
  },
  lastLogin: {
    type: Date,
    default: null
  },
  lastLogout: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure middleware only hashes password if it's been modified
CompanySchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    next();
    return;
  }
  // Password hashing is handled in controller
  this.updatedAt = Date.now();
  next();
});

// Method to verify if a company has access to a resource
CompanySchema.methods.hasAccess = function(resourceCompanyId) {
  return this.companyId === resourceCompanyId;
};

module.exports = mongoose.model('Company', CompanySchema);