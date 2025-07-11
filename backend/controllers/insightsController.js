const Insight = require('../models/insightsModel');

// Add or update insight for a company
exports.addOrUpdateInsight = async (req, res) => {
  try {
    const { companyId } = req.params;
    if (!companyId) {
      return res.status(400).json({ message: 'companyId is required' });
    }

    // Upsert: overwrite if exists, insert if not
    const updatedInsight = await Insight.findOneAndUpdate(
      { companyId },
      { ...req.body, companyId },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Insight added/updated successfully',
      insight: updatedInsight
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete insight by companyId
exports.deleteInsight = async (req, res) => {
  try {
    const { companyId } = req.params;
    const deleted = await Insight.findOneAndDelete({ companyId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Insight not found' });
    }
    res.status(200).json({ success: true, message: 'Insight deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get insight by companyId
exports.getInsight = async (req, res) => {
  try {
    const { companyId } = req.params;
    const insight = await Insight.findOne({ companyId });
    if (!insight) {
      return res.status(404).json({ success: false, message: 'Insight not found' });
    }
    res.status(200).json({ success: true, insight });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

