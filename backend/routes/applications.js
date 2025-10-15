const express = require('express');
const { body, validationResult } = require('express-validator');
const Application = require('../models/Application');
const Job = require('../models/Job');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');
const { uploadSingle } = require('../middleware/upload');

const router = express.Router();

// @desc    Apply for a job
// @route   POST /api/applications
// @access  Private/JobSeeker
router.post('/', [
  protect,
  authorize('jobseeker'),
  body('jobId')
    .isMongoId()
    .withMessage('Valid job ID is required'),
  body('coverLetter')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Cover letter cannot be more than 1000 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { jobId, coverLetter } = req.body;

    // Check if job exists and is active
    const job = await Job.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'This job is no longer accepting applications'
      });
    }

    // Check if user has already applied
    const existingApplication = await Application.findOne({
      userId: req.user.id,
      jobId: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You have already applied for this job'
      });
    }

    // Check if user has a resume
    if (!req.user.profile.resume) {
      return res.status(400).json({
        success: false,
        message: 'Please upload your resume before applying for jobs'
      });
    }

    // Create application
    const application = await Application.create({
      userId: req.user.id,
      jobId: jobId,
      resume: req.user.profile.resume,
      coverLetter: coverLetter || ''
    });

    const populatedApplication = await Application.findById(application._id)
      .populate('userId', 'name email profile')
      .populate('jobId', 'title company location');

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      data: populatedApplication
    });
  } catch (error) {
    console.error('Apply for job error:', error);

    console.log("THIS iS AAAAAAAAAAAAAAAAAAAAAAA>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>")
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get user's applications
// @route   GET /api/applications/my-applications
// @access  Private/JobSeeker
router.get('/my-applications', protect, authorize('jobseeker'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { userId: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('jobId', 'title company location category salary experience')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    console.error('Get my applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get applications for a specific job
// @route   GET /api/applications/job/:jobId
// @access  Private/Employer
router.get('/job/:jobId', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Check if job exists and user is the poster
    const job = await Job.findById(req.params.jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view applications for this job'
      });
    }

    const filter = { jobId: req.params.jobId };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const applications = await Application.find(filter)
      .populate('userId', 'name email profile')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    console.error('Get job applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all applications (Admin only)
// @route   GET /api/applications
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.jobId) filter.jobId = req.query.jobId;
    if (req.query.userId) filter.userId = req.query.userId;

    const applications = await Application.find(filter)
      .populate('userId', 'name email profile')
      .populate('jobId', 'title company location')
      .sort({ appliedDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Application.countDocuments(filter);

    res.json({
      success: true,
      count: applications.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: applications
    });
  } catch (error) {
    console.error('Get all applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update application status
// @route   PUT /api/applications/:id/status
// @access  Private/Employer
router.put('/:id/status', [
  protect,
  authorize('employer', 'admin'),
  body('status')
    .isIn(['applied', 'under-review', 'shortlisted', 'interview', 'accepted', 'rejected'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Notes cannot be more than 500 characters')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { status, notes, interviewDate, interviewLocation, interviewType } = req.body;

    const application = await Application.findById(req.params.id)
      .populate('jobId', 'postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to update this application
    if (application.jobId.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this application'
      });
    }

    // Update application
    const updateData = { status, notes };
    if (interviewDate) updateData.interviewDate = interviewDate;
    if (interviewLocation) updateData.interviewLocation = interviewLocation;
    if (interviewType) updateData.interviewType = interviewType;

    const updatedApplication = await Application.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('userId', 'name email profile')
     .populate('jobId', 'title company location');

    res.json({
      success: true,
      message: 'Application status updated successfully',
      data: updatedApplication
    });
  } catch (error) {
    console.error('Update application status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get application by ID
// @route   GET /api/applications/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id)
      .populate('userId', 'name email profile')
      .populate('jobId', 'title company location postedBy');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to view this application
    const isJobSeeker = req.user.id === application.userId._id.toString();
    const isEmployer = req.user.id === application.jobId.postedBy.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobSeeker && !isEmployer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this application'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete application
// @route   DELETE /api/applications/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if user is authorized to delete this application
    const isJobSeeker = req.user.id === application.userId.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isJobSeeker && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this application'
      });
    }

    await Application.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Application deleted successfully'
    });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get application statistics
// @route   GET /api/applications/stats
// @access  Private/Employer
router.get('/stats', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const stats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $match: { 'job.postedBy': req.user._id } },
      {
        $group: {
          _id: null,
          totalApplications: { $sum: 1 },
          applied: { $sum: { $cond: [{ $eq: ['$status', 'applied'] }, 1, 0] } },
          underReview: { $sum: { $cond: [{ $eq: ['$status', 'under-review'] }, 1, 0] } },
          shortlisted: { $sum: { $cond: [{ $eq: ['$status', 'shortlisted'] }, 1, 0] } },
          interview: { $sum: { $cond: [{ $eq: ['$status', 'interview'] }, 1, 0] } },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          rejected: { $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] } }
        }
      }
    ]);

    const statusStats = await Application.aggregate([
      {
        $lookup: {
          from: 'jobs',
          localField: 'jobId',
          foreignField: '_id',
          as: 'job'
        }
      },
      { $unwind: '$job' },
      { $match: { 'job.postedBy': req.user._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalApplications: 0,
          applied: 0,
          underReview: 0,
          shortlisted: 0,
          interview: 0,
          accepted: 0,
          rejected: 0
        },
        statusBreakdown: statusStats
      }
    });
  } catch (error) {
    console.error('Get application stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
