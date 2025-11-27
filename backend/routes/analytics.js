import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import {
  getComplaintTrends,
  predictResourceUsage,
  getPeakUsageTimes,
  getResolutionEfficiency,
  getResourceHealthScore
} from '../utils/analytics.js';

const router = express.Router();

// @route   GET /api/analytics/complaint-trends
// @desc    Get complaint trends over time
// @access  Private/Admin/Officer
router.get('/complaint-trends', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const trends = await getComplaintTrends(parseInt(days));

    res.json({
      success: true,
      trends
    });
  } catch (error) {
    console.error('Complaint trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/resource-prediction/:id
// @desc    Predict resource usage
// @access  Private/Admin/Officer
router.get('/resource-prediction/:id', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { days = 7 } = req.query;
    const prediction = await predictResourceUsage(req.params.id, parseInt(days));

    res.json({
      success: true,
      prediction
    });
  } catch (error) {
    console.error('Resource prediction error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/peak-usage
// @desc    Get peak usage times
// @access  Private/Admin/Officer
router.get('/peak-usage', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { resourceType, days = 30 } = req.query;

    if (!resourceType) {
      return res.status(400).json({ message: 'Resource type is required' });
    }

    const peakTimes = await getPeakUsageTimes(resourceType, parseInt(days));

    res.json({
      success: true,
      peakTimes
    });
  } catch (error) {
    console.error('Peak usage error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/resolution-efficiency
// @desc    Get complaint resolution efficiency
// @access  Private/Admin/Officer
router.get('/resolution-efficiency', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const efficiency = await getResolutionEfficiency(parseInt(days));

    res.json({
      success: true,
      efficiency
    });
  } catch (error) {
    console.error('Resolution efficiency error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/analytics/resource-health/:id
// @desc    Get resource health score
// @access  Private/Admin/Officer
router.get('/resource-health/:id', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const healthScore = await getResourceHealthScore(req.params.id);

    if (!healthScore) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    res.json({
      success: true,
      healthScore
    });
  } catch (error) {
    console.error('Resource health error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
