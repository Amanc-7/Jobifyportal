const express = require('express');
const { body, validationResult } = require('express-validator');
const Job = require('../models/Job');
const Application = require('../models/Application');
const { protect, authorize, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all jobs with filters and pagination
// @route   GET /api/jobs
// @access  Public
router.get('/', optionalAuth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Build filter object
    const filter = { status: 'active' };

    if (req.query.search) {
      filter.$text = { $search: req.query.search };
    }

    if (req.query.location) {
      filter.location = { $regex: req.query.location, $options: 'i' };
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    if (req.query.experience) {
      filter.experience = req.query.experience;
    }

    if (req.query.remote) {
      filter.remote = req.query.remote === 'true';
    }

    if (req.query.minSalary) {
      filter['salary.min'] = { $gte: parseInt(req.query.minSalary) };
    }

    if (req.query.maxSalary) {
      filter['salary.max'] = { $lte: parseInt(req.query.maxSalary) };
    }

    if (req.query.featured) {
      filter.featured = req.query.featured === 'true';
    }

    // Build sort object
    let sort = { createdAt: -1 };
    if (req.query.sort) {
      switch (req.query.sort) {
        case 'newest':
          sort = { createdAt: -1 };
          break;
        case 'oldest':
          sort = { createdAt: 1 };
          break;
        case 'salary-high':
          sort = { 'salary.max': -1 };
          break;
        case 'salary-low':
          sort = { 'salary.min': 1 };
          break;
        case 'applications':
          sort = { applicationCount: -1 };
          break;
        default:
          sort = { createdAt: -1 };
      }
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email profile.company')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    // Check if user has applied to any of these jobs
    let jobsWithApplicationStatus = jobs;
    if (req.user) {
      const jobIds = jobs.map(job => job._id);
      const applications = await Application.find({
        userId: req.user.id,
        jobId: { $in: jobIds }
      });

      const applicationMap = {};
      applications.forEach(app => {
        applicationMap[app.jobId.toString()] = app.status;
      });

      jobsWithApplicationStatus = jobs.map(job => ({
        ...job.toObject(),
        hasApplied: !!applicationMap[job._id.toString()],
        applicationStatus: applicationMap[job._id.toString()] || null
      }));
    }

    res.json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobsWithApplicationStatus
    });
  } catch (error) {
    console.error('Get jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get job by ID
// @route   GET /api/jobs/:id
// @access  Public
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('postedBy', 'name email profile.company profile.website');

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    // Check if user has applied to this job
    let hasApplied = false;
    let applicationStatus = null;
    if (req.user) {
      const application = await Application.findOne({
        userId: req.user.id,
        jobId: req.params.id
      });
      if (application) {
        hasApplied = true;
        applicationStatus = application.status;
      }
    }

    res.json({
      success: true,
      data: {
        ...job.toObject(),
        hasApplied,
        applicationStatus
      }
    });
  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Create new job
// @route   POST /api/jobs
// @access  Private/Employer
router.post('/', [
  protect,
  authorize('employer', 'admin'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('company')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Company name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters'),
  body('requirements')
    .trim()
    .isLength({ min: 20, max: 1000 })
    .withMessage('Requirements must be between 20 and 1000 characters'),
  body('location')
    .trim()
    .notEmpty()
    .withMessage('Location is required'),
  body('category')
    .isIn(['internship', 'full-time', 'part-time', 'contract', 'freelance'])
    .withMessage('Invalid category'),
  body('experience')
    .isIn(['entry', 'mid', 'senior', 'executive'])
    .withMessage('Invalid experience level')
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

    const jobData = {
      ...req.body,
      postedBy: req.user.id
    };

    const job = await Job.create(jobData);

    const populatedJob = await Job.findById(job._id)
      .populate('postedBy', 'name email profile.company');

    res.status(201).json({
      success: true,
      message: 'Job posted successfully',
      data: populatedJob
    });
  } catch (error) {
    console.error('Create job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update job
// @route   PUT /api/jobs/:id
// @access  Private/Employer
router.put('/:id', [
  protect,
  authorize('employer', 'admin'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 50, max: 2000 })
    .withMessage('Description must be between 50 and 2000 characters')
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

    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this job'
      });
    }

    const updatedJob = await Job.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('postedBy', 'name email profile.company');

    res.json({
      success: true,
      message: 'Job updated successfully',
      data: updatedJob
    });
  } catch (error) {
    console.error('Update job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Delete job
// @route   DELETE /api/jobs/:id
// @access  Private/Employer
router.delete('/:id', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({
        success: false,
        message: 'Job not found'
      });
    }

    // Check if user is the job poster or admin
    if (job.postedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this job'
      });
    }

    // Delete all applications for this job
    await Application.deleteMany({ jobId: req.params.id });

    // Delete the job
    await Job.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Job deleted successfully'
    });
  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get jobs posted by user
// @route   GET /api/jobs/my-jobs
// @access  Private/Employer
router.get('/my-jobs', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = { postedBy: req.user.id };
    if (req.query.status) {
      filter.status = req.query.status;
    }

    const jobs = await Job.find(filter)
      .populate('postedBy', 'name email profile.company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Job.countDocuments(filter);

    res.json({
      success: true,
      count: jobs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: jobs
    });
  } catch (error) {
    console.error('Get my jobs error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get job statistics
// @route   GET /api/jobs/stats
// @access  Private/Employer
router.get('/stats', protect, authorize('employer', 'admin'), async (req, res) => {
  try {
    const stats = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      {
        $group: {
          _id: null,
          totalJobs: { $sum: 1 },
          activeJobs: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          totalApplications: { $sum: '$applicationCount' },
          totalViews: { $sum: '$views' }
        }
      }
    ]);

    const categoryStats = await Job.aggregate([
      { $match: { postedBy: req.user._id } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          totalViews: 0
        },
        categories: categoryStats
      }
    });
  } catch (error) {
    console.error('Get job stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

module.exports = router;
