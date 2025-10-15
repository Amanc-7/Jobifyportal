const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  resume: {
    type: String,
    required: [true, 'Please upload your resume']
  },
  coverLetter: {
    type: String,
    maxlength: [1000, 'Cover letter cannot be more than 1000 characters']
  },
  status: {
    type: String,
    enum: ['applied', 'under-review', 'shortlisted', 'interview', 'accepted', 'rejected'],
    default: 'applied'
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot be more than 500 characters']
  },
  interviewDate: {
    type: Date
  },
  interviewLocation: {
    type: String,
    trim: true
  },
  interviewType: {
    type: String,
    enum: ['phone', 'video', 'in-person', 'technical'],
    default: 'in-person'
  },
  feedback: {
    type: String,
    maxlength: [1000, 'Feedback cannot be more than 1000 characters']
  },
  salaryOffered: {
    type: Number
  },
  startDate: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
applicationSchema.index({ userId: 1 });
applicationSchema.index({ jobId: 1 });
applicationSchema.index({ status: 1 });
applicationSchema.index({ appliedDate: -1 });

// Compound index to prevent duplicate applications
applicationSchema.index({ userId: 1, jobId: 1 }, { unique: true });

// Virtual for application age
applicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.appliedDate);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
  return `${Math.ceil(diffDays / 365)} years ago`;
});

// Ensure virtual fields are serialized
applicationSchema.set('toJSON', { virtuals: true });

// Pre-save middleware to update job application count
applicationSchema.pre('save', async function(next) {
  if (this.isNew) {
    try {
      const Job = mongoose.model('Job');
      await Job.findByIdAndUpdate(this.jobId, { $inc: { applicationCount: 1 } });
    } catch (error) {
      console.error('Error updating job application count:', error);
    }
  }
  next();
});

// Pre-remove middleware to update job application count
applicationSchema.pre('remove', async function(next) {
  try {
    const Job = mongoose.model('Job');
    await Job.findByIdAndUpdate(this.jobId, { $inc: { applicationCount: -1 } });
  } catch (error) {
    console.error('Error updating job application count:', error);
  }
  next();
});

module.exports = mongoose.model('Application', applicationSchema);
