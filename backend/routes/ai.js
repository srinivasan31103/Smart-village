import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { classifyComplaint, generateResourceInsights, generateMonthlySummary } from '../utils/claudeAI.js';
import Complaint from '../models/Complaint.js';
import Resource from '../models/Resource.js';
import UsageLog from '../models/UsageLog.js';

const router = express.Router();

// @route   POST /api/ai/classify-complaint
// @desc    Classify a complaint using Claude AI
// @access  Private/Admin/Officer
router.post('/classify-complaint', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { complaintId } = req.body;

    const complaint = await Complaint.findById(complaintId);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const classification = await classifyComplaint(complaint);

    // Update complaint with AI classification
    complaint.aiClassification = classification;

    // Optionally update priority if AI suggests higher priority
    if (classification.priority &&
        ['high', 'critical'].includes(classification.priority) &&
        !['high', 'critical'].includes(complaint.priority)) {
      complaint.priority = classification.priority;
    }

    await complaint.save();

    res.json({
      success: true,
      classification,
      complaint
    });

  } catch (error) {
    console.error('AI classification error:', error);
    res.status(500).json({ message: 'AI classification failed' });
  }
});

// @route   POST /api/ai/resource-insights
// @desc    Generate optimization insights for a resource
// @access  Private/Admin/Officer
router.post('/resource-insights', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { resourceId } = req.body;

    const resource = await Resource.findById(resourceId);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Get historical data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const historicalData = await UsageLog.find({
      resource: resourceId,
      timestamp: { $gte: thirtyDaysAgo }
    }).sort({ timestamp: 1 });

    const resourceData = {
      type: resource.type,
      currentUsage: resource.currentUsage,
      capacity: resource.capacity,
      historicalData: historicalData.map(log => ({
        date: log.timestamp,
        usage: log.usage.value,
        unit: log.usage.unit
      }))
    };

    const insights = await generateResourceInsights(resourceData);

    res.json({
      success: true,
      insights,
      resource
    });

  } catch (error) {
    console.error('AI insights error:', error);
    res.status(500).json({ message: 'Failed to generate insights' });
  }
});

// @route   GET /api/ai/monthly-summary
// @desc    Generate monthly summary using Claude AI
// @access  Private/Admin/Officer
router.get('/monthly-summary', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { year, month } = req.query;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Get monthly statistics
    const totalComplaints = await Complaint.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const resolvedComplaints = await Complaint.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate },
      status: 'resolved'
    });

    const resolutionRate = totalComplaints > 0
      ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2)
      : 0;

    // Complaints by category
    const complaintsByCategory = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const categoryData = complaintsByCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Resource usage
    const resourceUsage = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$resourceType',
          total: { $sum: '$usage.value' }
        }
      }
    ]);

    const usageData = resourceUsage.reduce((acc, item) => {
      acc[item._id] = { total: item.total };
      return acc;
    }, {});

    const monthlyData = {
      totalComplaints,
      resolvedComplaints,
      resolutionRate,
      complaintsByCategory: categoryData,
      resourceUsage: usageData
    };

    const summary = await generateMonthlySummary(monthlyData);

    res.json({
      success: true,
      summary,
      data: monthlyData
    });

  } catch (error) {
    console.error('Monthly summary error:', error);
    res.status(500).json({ message: 'Failed to generate monthly summary' });
  }
});

export default router;
