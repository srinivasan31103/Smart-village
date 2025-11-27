import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import { upload, handleUploadError } from '../middleware/upload.js';
import Complaint from '../models/Complaint.js';
import { classifyComplaint } from '../utils/claudeAI.js';
import { sendComplaintStatusEmail } from '../utils/emailService.js';
import { sendComplaintStatusSMS } from '../utils/smsService.js';

const router = express.Router();

// @route   GET /api/complaints
// @desc    Get all complaints
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const { category, status, priority, page = 1, limit = 10 } = req.query;

    const query = {};

    // Citizens can only see their own complaints
    if (req.user.role === 'citizen') {
      query.reportedBy = req.user._id;
    }

    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Complaint.countDocuments(query);

    res.json({
      success: true,
      complaints,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET /api/complaints/:id
// @desc    Get single complaint
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email')
      .populate('statusHistory.updatedBy', 'name')
      .populate('resolution.resolvedBy', 'name')
      .populate('comments.user', 'name');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Citizens can only view their own complaints
    if (req.user.role === 'citizen' && complaint.reportedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to view this complaint' });
    }

    res.json({
      success: true,
      complaint
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/complaints
// @desc    Create complaint with photos
// @access  Private
router.post('/',
  protect,
  upload.array('photos', 5),
  handleUploadError,
  async (req, res) => {
    try {
      const {
        title,
        description,
        category,
        subCategory,
        location
      } = req.body;

      // Parse location if it's a string
      const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

      // Process uploaded photos
      const photos = req.files ? req.files.map(file => ({
        url: `/uploads/${file.filename}`,
        caption: file.originalname
      })) : [];

      const complaint = await Complaint.create({
        title,
        description,
        category,
        subCategory,
        location: parsedLocation,
        photos,
        reportedBy: req.user._id
      });

      // Classify complaint using Claude AI (don't wait for it)
      classifyComplaint(complaint)
        .then(async (classification) => {
          complaint.aiClassification = classification;

          // Update priority if AI suggests higher priority
          if (classification.priority &&
              ['high', 'critical'].includes(classification.priority) &&
              complaint.priority === 'medium') {
            complaint.priority = classification.priority;
          }

          await complaint.save();
        })
        .catch(err => console.error('AI classification error:', err));

      const populatedComplaint = await Complaint.findById(complaint._id)
        .populate('reportedBy', 'name email phone');

      res.status(201).json({
        success: true,
        message: 'Complaint submitted successfully',
        complaint: populatedComplaint
      });

    } catch (error) {
      console.error('Create complaint error:', error);
      res.status(500).json({ message: 'Server error' });
    }
  }
);

// @route   PUT /api/complaints/:id
// @desc    Update complaint
// @access  Private/Admin/Officer
router.put('/:id', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const {
      status,
      priority,
      assignedTo,
      comment
    } = req.body;

    const oldStatus = complaint.status;

    if (status) complaint.status = status;
    if (priority) complaint.priority = priority;
    if (assignedTo) complaint.assignedTo = assignedTo;

    // Add to status history
    if (status && status !== oldStatus) {
      complaint.statusHistory.push({
        status,
        updatedBy: req.user._id,
        comment: comment || `Status changed from ${oldStatus} to ${status}`
      });

      // Send notification if status changed
      sendComplaintStatusEmail(complaint, complaint.reportedBy)
        .catch(err => console.error('Email notification error:', err));

      sendComplaintStatusSMS(complaint, complaint.reportedBy)
        .catch(err => console.error('SMS notification error:', err));
    }

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('reportedBy', 'name email phone')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      message: 'Complaint updated successfully',
      complaint: updatedComplaint
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT /api/complaints/:id/resolve
// @desc    Resolve complaint
// @access  Private/Admin/Officer
router.put('/:id/resolve', protect, authorize('admin', 'officer'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('reportedBy', 'name email phone');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { description, actionsTaken } = req.body;

    complaint.status = 'resolved';
    complaint.resolution = {
      description,
      resolvedBy: req.user._id,
      resolvedAt: new Date(),
      actionsTaken: actionsTaken || []
    };

    complaint.statusHistory.push({
      status: 'resolved',
      updatedBy: req.user._id,
      comment: 'Complaint resolved'
    });

    await complaint.save();

    // Send notification
    sendComplaintStatusEmail(complaint, complaint.reportedBy)
      .catch(err => console.error('Email notification error:', err));

    sendComplaintStatusSMS(complaint, complaint.reportedBy)
      .catch(err => console.error('SMS notification error:', err));

    const resolvedComplaint = await Complaint.findById(complaint._id)
      .populate('reportedBy', 'name email phone')
      .populate('resolution.resolvedBy', 'name');

    res.json({
      success: true,
      message: 'Complaint resolved successfully',
      complaint: resolvedComplaint
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST /api/complaints/:id/comments
// @desc    Add comment to complaint
// @access  Private
router.post('/:id/comments', protect, async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const { text } = req.body;

    complaint.comments.push({
      user: req.user._id,
      text
    });

    await complaint.save();

    const updatedComplaint = await Complaint.findById(complaint._id)
      .populate('comments.user', 'name');

    res.json({
      success: true,
      message: 'Comment added successfully',
      comments: updatedComplaint.comments
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE /api/complaints/:id
// @desc    Delete complaint
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    await complaint.deleteOne();

    res.json({
      success: true,
      message: 'Complaint deleted successfully'
    });

  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
