import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { generateMonthlyReport, generateComplaintReport } from '../utils/pdfGenerator.js';
import Complaint from '../models/Complaint.js';
import UsageLog from '../models/UsageLog.js';

const router = express.Router();

// @route   POST /api/reports/monthly
// @desc    Generate monthly PDF report
// @access  Private/Admin/Officer
router.post('/monthly', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const { year, month } = req.body;

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    // Gather monthly statistics
    const totalComplaints = await Complaint.countDocuments({
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const complaintsData = await Complaint.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusCounts = complaintsData.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    const pending = statusCounts.pending || 0;
    const inProgress = statusCounts['in-progress'] || 0;
    const resolved = statusCounts.resolved || 0;

    const resolutionRate = totalComplaints > 0
      ? ((resolved / totalComplaints) * 100).toFixed(2)
      : 0;

    // Complaints by category
    const categoryData = await Complaint.aggregate([
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

    const complaintsByCategory = categoryData.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    // Resource usage
    const waterUsage = await UsageLog.aggregate([
      {
        $match: {
          resourceType: 'water',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$usage.value' }
        }
      }
    ]);

    const electricityUsage = await UsageLog.aggregate([
      {
        $match: {
          resourceType: 'electricity',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$usage.value' }
        }
      }
    ]);

    const wasteUsage = await UsageLog.aggregate([
      {
        $match: {
          resourceType: 'waste',
          timestamp: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$usage.value' }
        }
      }
    ]);

    // Top issues
    const topIssues = await Complaint.find({
      createdAt: { $gte: startDate, $lte: endDate },
      priority: { $in: ['high', 'critical'] }
    })
      .sort({ priority: -1, createdAt: -1 })
      .limit(10)
      .select('title category status priority');

    const reportData = {
      period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`,
      complaints: {
        total: totalComplaints,
        pending,
        inProgress,
        resolved,
        resolutionRate
      },
      complaintsByCategory,
      resources: {
        water: {
          total: waterUsage[0]?.total || 0,
          unit: 'liters'
        },
        electricity: {
          total: electricityUsage[0]?.total || 0,
          unit: 'kWh'
        },
        waste: {
          total: wasteUsage[0]?.total || 0,
          unit: 'kg'
        }
      },
      topIssues
    };

    const result = await generateMonthlyReport(reportData);

    res.json({
      success: true,
      message: 'Monthly report generated successfully',
      report: result
    });

  } catch (error) {
    console.error('Monthly report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

// @route   POST /api/reports/complaint/:id
// @desc    Generate complaint PDF report
// @access  Private
router.post('/complaint/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.updatedBy', 'name')
      .populate('resolution.resolvedBy', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Citizens can only generate reports for their own complaints
    if (req.user.role === 'citizen' && complaint.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const result = await generateComplaintReport(complaint);

    res.json({
      success: true,
      message: 'Complaint report generated successfully',
      report: result
    });

  } catch (error) {
    console.error('Complaint report error:', error);
    res.status(500).json({ message: 'Failed to generate report' });
  }
});

export default router;
