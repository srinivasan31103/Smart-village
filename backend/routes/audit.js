import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import AuditLog from '../models/AuditLog.js';

const router = express.Router();

// @route   GET /api/audit
// @desc    Get audit logs
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      action,
      resourceType,
      userId,
      startDate,
      endDate
    } = req.query;

    const query = {};

    if (action) query.action = action;
    if (resourceType) query.resourceType = resourceType;
    if (userId) query.user = userId;

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const auditLogs = await AuditLog.find(query)
      .populate('user', 'name email role')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments(query);

    res.json({
      success: true,
      auditLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    console.error('Audit logs error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/audit/user/:userId
// @desc    Get audit logs for specific user
// @access  Private/Admin
router.get('/user/:userId', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const auditLogs = await AuditLog.find({ user: req.params.userId })
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments({ user: req.params.userId });

    res.json({
      success: true,
      auditLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/audit/resource/:resourceType/:resourceId
// @desc    Get audit logs for specific resource
// @access  Private/Admin
router.get('/resource/:resourceType/:resourceId', protect, authorize('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const auditLogs = await AuditLog.find({
      resourceType: req.params.resourceType,
      resourceId: req.params.resourceId
    })
      .populate('user', 'name email')
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const count = await AuditLog.countDocuments({
      resourceType: req.params.resourceType,
      resourceId: req.params.resourceId
    });

    res.json({
      success: true,
      auditLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
