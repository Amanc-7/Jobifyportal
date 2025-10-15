import React from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  MapPin, 
  Clock, 
  Users, 
  DollarSign,
  Briefcase,
  Building,
  Calendar,
  ArrowLeft,
  ExternalLink,
  CheckCircle
} from 'lucide-react'
import { useQuery, useMutation, useQueryClient } from 'react-query'
import { jobsAPI, applicationsAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import LoadingSpinner from '../components/common/LoadingSpinner'
import toast from 'react-hot-toast'

const JobDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user, isAuthenticated } = useAuth()
  const queryClient = useQueryClient()

  // Fetch job details
  const { data: job, isLoading, error } = useQuery(
    ['job', id],
    () => jobsAPI.getJob(id),
    {
      select: (response) => response.data.data,
      enabled: !!id
    }
  )

  // Apply for job mutation
  const applyMutation = useMutation(
    (applicationData) => applicationsAPI.applyForJob(applicationData),
    {
      onSuccess: () => {
        toast.success('Application submitted successfully!')
        queryClient.invalidateQueries(['job', id])
        queryClient.invalidateQueries('my-applications')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to apply for job')
      }
    }
  )

  const handleApply = () => {

    console.log("HELO>>>>>>>>>>>>>>>>>>>>>>>>", )
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: `/jobs/${id}` } } })
      return
    }
    console.log("HELO22222222222222>>>>>>>>>>>>>>>>>>>>>>>>", )

    if (user.role !== 'jobseeker') {
      toast.error('Only job seekers can apply for jobs')
      return
    }
    console.log("HELO333333333333333333>>>>>>>>>>>>>>>>>>>>>>>>", )


    if (!user.profile?.resume) {
      toast.error('Please upload your resume before applying')
      navigate('/profile')
      return
    }
    console.log("HEL88888888888888O>>>>>>>>>>>>>>>>>>>>>>>>", )


    applyMutation.mutate({
      jobId: id,
      coverLetter: ''
    })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h2>
          <p className="text-gray-600 mb-6">The job you're looking for doesn't exist or has been removed.</p>
          <Link to="/jobs">
            <Button>Browse All Jobs</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="container-custom py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <button
              onClick={() => navigate(-1)}
              className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Jobs
            </button>

            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                      {job.title}
                    </h1>
                    <div className="flex items-center text-xl text-gray-600 mb-4">
                      <Building className="w-5 h-5 mr-2" />
                      {job.company}
                    </div>
                  </div>
                  {job.featured && (
                    <span className="bg-yellow-100 text-yellow-800 text-sm font-medium px-3 py-1 rounded-full">
                      Featured
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1" />
                    {job.location}
                    {job.remote && (
                      <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        Remote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-1" />
                    {new Date(job.createdAt).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {job.applicationCount} applications
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <span className="bg-primary-100 text-primary-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.category}
                  </span>
                  <span className="bg-gray-100 text-gray-800 text-sm font-medium px-3 py-1 rounded-full">
                    {job.experience} level
                  </span>
                  {job.skills?.slice(0, 3).map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 lg:mt-0 lg:ml-8">
                <Card className="p-6 w-full lg:w-80">
                  <div className="text-center mb-6">
                    <div className="text-2xl font-bold text-gray-900 mb-1">
                      {job.formattedSalary}
                    </div>
                    <div className="text-sm text-gray-600">
                      {job.salary?.period || 'yearly'}
                    </div>
                  </div>

                  {isAuthenticated && user.role === 'jobseeker' ? (
                    <div className="space-y-3">
                      {job.hasApplied ? (
                        <div className="text-center">
                          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                          <p className="text-green-600 font-medium mb-1">Application Submitted</p>
                          <p className="text-sm text-gray-600">
                            Status: {job.applicationStatus}
                          </p>
                        </div>
                      ) : (
                        <Button
                          onClick={handleApply}
                          loading={applyMutation.isLoading}
                          className="w-full"
                          size="lg"
                        >
                          Apply Now
                        </Button>
                      )}
                    </div>
                  ) : !isAuthenticated ? (
                    <div className="space-y-3">
                      <p className="text-sm text-gray-600 text-center mb-4">
                        Sign in to apply for this job
                      </p>
                      <Link to="/login" className="block">
                        <Button className="w-full" size="lg">
                          Sign In to Apply
                        </Button>
                      </Link>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        Only job seekers can apply for jobs
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Posted by</span>
                      <span className="font-medium">{job.postedBy?.name}</span>
                    </div>
                    {job.postedBy?.profile?.company && (
                      <div className="flex items-center justify-between text-sm text-gray-600 mt-1">
                        <span>Company</span>
                        <span className="font-medium">{job.postedBy.profile.company}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Job Details */}
      <div className="container-custom py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              {/* Job Description */}
              <Card className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                </div>
              </Card>

              {/* Requirements */}
              <Card className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">{job.requirements}</p>
                </div>
              </Card>

              {/* Skills */}
              {job.skills && job.skills.length > 0 && (
                <Card className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Required Skills</h2>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </Card>
              )}

              {/* Benefits */}
              {job.benefits && job.benefits.length > 0 && (
                <Card>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                  <ul className="space-y-2">
                    {job.benefits.map((benefit, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{benefit}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-6"
            >
              {/* Job Overview */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Job Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Job Type</span>
                    <span className="font-medium">{job.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-medium">{job.experience}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Location</span>
                    <span className="font-medium">{job.location}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Remote</span>
                    <span className="font-medium">{job.remote ? 'Yes' : 'No'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-medium">{job.applicationCount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Views</span>
                    <span className="font-medium">{job.views}</span>
                  </div>
                </div>
              </Card>

              {/* Company Info */}
              {job.postedBy && (
                <Card>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">About the Company</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-gray-900">{job.postedBy.name}</p>
                      {job.postedBy.profile?.company && (
                        <p className="text-gray-600">{job.postedBy.profile.company}</p>
                      )}
                    </div>
                    {job.postedBy.profile?.website && (
                      <a
                        href={job.postedBy.profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700"
                      >
                        Visit Website
                        <ExternalLink className="w-4 h-4 ml-1" />
                      </a>
                    )}
                  </div>
                </Card>
              )}

              {/* Share Job */}
              <Card>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Share this Job</h3>
                <div className="flex space-x-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href)
                      toast.success('Job link copied to clipboard!')
                    }}
                    className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
                  >
                    Copy Link
                  </button>
                </div>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default JobDetails
