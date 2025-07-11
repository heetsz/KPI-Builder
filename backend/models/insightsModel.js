const mongoose = require('mongoose');

const CitationSchema = new mongoose.Schema({
  id: String,
  source: String,
  title: String,
  date: String,
  url: String
}, { _id: false });

const SWOTSchema = new mongoose.Schema({
  strengths: [String],
  weaknesses: [String],
  opportunities: [String],
  threats: [String]
}, { _id: false });

const InsightSchema = new mongoose.Schema({
    companyId : { type: String, required: true },
  executive_summary: { type: String, required: true },
  swot_analysis: { type: SWOTSchema, required: true },
  growth_tactics: { type: [String], required: true },
  competitive_positioning: { type: String, required: true },
  kpi_action_items: { type: [String], required: true },
  citations: { type: [CitationSchema], required: false }
}, { timestamps: true });

module.exports = mongoose.model('Insight', InsightSchema);