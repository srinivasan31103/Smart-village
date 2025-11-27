import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Complaint from '../models/Complaint.js';
import Resource from '../models/Resource.js';
import UsageLog from '../models/UsageLog.js';
import User from '../models/User.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics
// @access  Private
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = {};

    if (req.user.role === 'citizen') {
      // Citizen dashboard
      const myComplaints = await Complaint.countDocuments({ reportedBy: req.user._id });
      const myPendingComplaints = await Complaint.countDocuments({
        reportedBy: req.user._id,
        status: 'pending'
      });
      const myResolvedComplaints = await Complaint.countDocuments({
        reportedBy: req.user._id,
        status: 'resolved'
      });

      stats.myComplaints = myComplaints;
      stats.pendingComplaints = myPendingComplaints;
      stats.resolvedComplaints = myResolvedComplaints;

    } else {
      // Admin/Officer dashboard
      const totalComplaints = await Complaint.countDocuments();
      const pendingComplaints = await Complaint.countDocuments({ status: 'pending' });
      const inProgressComplaints = await Complaint.countDocuments({ status: 'in-progress' });
      const resolvedComplaints = await Complaint.countDocuments({ status: 'resolved' });

      const totalResources = await Resource.countDocuments();
      const activeResources = await Resource.countDocuments({ status: 'active' });
      const criticalResources = await Resource.countDocuments({ status: 'critical' });

      const totalUsers = await User.countDocuments();
      const citizenCount = await User.countDocuments({ role: 'citizen' });

      stats.totalComplaints = totalComplaints;
      stats.pendingComplaints = pendingComplaints;
      stats.inProgressComplaints = inProgressComplaints;
      stats.resolvedComplaints = resolvedComplaints;
      stats.resolutionRate = totalComplaints > 0
        ? ((resolvedComplaints / totalComplaints) * 100).toFixed(2)
        : 0;

      stats.totalResources = totalResources;
      stats.activeResources = activeResources;
      stats.criticalResources = criticalResources;

      stats.totalUsers = totalUsers;
      stats.citizenCount = citizenCount;
    }

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/complaints-by-category
// @desc    Get complaints grouped by category
// @access  Private/Admin/Officer
router.get('/complaints-by-category', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const complaintsByCategory = await Complaint.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = complaintsByCategory.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/complaints-by-status
// @desc    Get complaints grouped by status
// @access  Private/Admin/Officer
router.get('/complaints-by-status', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const complaintsByStatus = await Complaint.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const result = complaintsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/resource-usage
// @desc    Get resource usage statistics
// @access  Private/Admin/Officer
router.get('/resource-usage', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    const usageByType = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$resourceType',
          totalUsage: { $sum: '$usage.value' },
          count: { $sum: 1 }
        }
      }
    ]);

    const result = usageByType.reduce((acc, item) => {
      acc[item._id] = {
        total: item.totalUsage,
        records: item.count
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/recent-complaints
// @desc    Get recent complaints
// @access  Private
router.get('/recent-complaints', protect, async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const query = req.user.role === 'citizen'
      ? { reportedBy: req.user._id }
      : {};

    const complaints = await Complaint.find(query)
      .populate('reportedBy', 'name email')
      .populate('assignedTo', 'name')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      complaints
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/resource-status
// @desc    Get resource status overview
// @access  Private/Admin/Officer
router.get('/resource-status', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const resources = await Resource.find()
      .select('type name status currentUsage capacity')
      .sort({ type: 1, name: 1 });

    const grouped = resources.reduce((acc, resource) => {
      if (!acc[resource.type]) {
        acc[resource.type] = [];
      }
      acc[resource.type].push({
        _id: resource._id,
        name: resource.name,
        status: resource.status,
        usage: resource.currentUsage.value,
        capacity: resource.capacity.value,
        unit: resource.capacity.unit,
        utilizationRate: ((resource.currentUsage.value / resource.capacity.value) * 100).toFixed(2)
      });
      return acc;
    }, {});

    res.json({
      success: true,
      data: grouped
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/dashboard/monthly-trends
// @desc    Get monthly trends for complaints and usage
// @access  Private/Admin/Officer
router.get('/monthly-trends', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - parseInt(months));

    // Complaints trend
    const complaintsTrend = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0]
            }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // Usage trend
    const usageTrend = await UsageLog.aggregate([
      {
        $match: {
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$timestamp' },
            month: { $month: '$timestamp' },
            type: '$resourceType'
          },
          totalUsage: { $sum: '$usage.value' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      success: true,
      complaintsTrend,
      usageTrend
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
