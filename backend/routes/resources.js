import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Resource from '../models/Resource.js';
import UsageLog from '../models/UsageLog.js';

const router = express.Router();

// @route   GET /api/resources
// @desc    Get all resources
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { type, status, page = 1, limit = 10 } = req.query;

    const query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const resources = await Resource.find(query)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Resource.countDocuments(query);

    res.json({
      success: true,
      resources,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id
// @desc    Get single resource
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Get recent usage logs
    const usageLogs = await UsageLog.find({ resource: resource._id })
      .sort({ timestamp: -1 })
      .limit(10)
      .populate('user', 'name');

    res.json({
      success: true,
      resource,
      recentUsage: usageLogs
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources
// @desc    Create resource
// @access  Private/Admin/Officer
router.post('/', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const {
      type,
      name,
      description,
      location,
      capacity,
      currentUsage,
      status,
      metadata
    } = req.body;

    const resource = await Resource.create({
      type,
      name,
      description,
      location,
      capacity,
      currentUsage,
      status,
      metadata,
      createdBy: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Resource created successfully',
      resource
    });

  } catch (error) {
    console.error('Create resource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/resources/:id
// @desc    Update resource
// @access  Private/Admin/Officer
router.put('/:id', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const {
      name,
      description,
      location,
      capacity,
      currentUsage,
      status,
      metadata
    } = req.body;

    if (name) resource.name = name;
    if (description) resource.description = description;
    if (location) resource.location = location;
    if (capacity) resource.capacity = capacity;
    if (currentUsage) {
      resource.currentUsage = {
        ...currentUsage,
        lastUpdated: new Date()
      };
    }
    if (status) resource.status = status;
    if (metadata) resource.metadata = { ...resource.metadata, ...metadata };

    resource.updatedBy = req.user._id;

    await resource.save();

    res.json({
      success: true,
      message: 'Resource updated successfully',
      resource
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/resources/:id
// @desc    Delete resource
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    await resource.deleteOne();

    res.json({
      success: true,
      message: 'Resource deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/resources/:id/usage
// @desc    Log resource usage
// @access  Private/Admin/Officer
router.post('/:id/usage', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const resource = await Resource.findById(req.params.id);

    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    const { value, unit, metadata } = req.body;

    const usageLog = await UsageLog.create({
      resource: resource._id,
      resourceType: resource.type,
      usage: { value, unit },
      user: req.user._id,
      metadata
    });

    // Update current usage
    resource.currentUsage = {
      value,
      unit,
      lastUpdated: new Date()
    };

    await resource.save();

    res.status(201).json({
      success: true,
      message: 'Usage logged successfully',
      usageLog,
      resource
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/resources/:id/usage-history
// @desc    Get resource usage history
// @access  Private
router.get('/:id/usage-history', protect, async (req, res) => {
  try {
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const query = { resource: req.params.id };

    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const usageLogs = await UsageLog.find(query)
      .populate('user', 'name')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ timestamp: -1 });

    const count = await UsageLog.countDocuments(query);

    res.json({
      success: true,
      usageLogs,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
