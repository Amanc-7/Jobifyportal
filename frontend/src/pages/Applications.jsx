import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  FileText, 
  Calendar, 
  MapPin, 
  Building,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import { useQuery } from 'react-query'
import { applicationsAPI } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import Select from '../components/common/Select'
import { Link } from 'react-router-dom'

const Applications = () => {
  const [statusFilter, setStatusFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'applied', label: 'Applied' },
    { value: 'under-review', label: 'Under Review' },
    { value: 'shortlisted', label: 'Shortlisted' },
    { value: 'interview', label: 'Interview' },
    { value: 'accepted', label: 'Accepted' },
    { value: 'rejected', label: 'Rejected' }
  ]

  const { data: applicationsData, isLoading } = useQuery(
    ['my-applications', statusFilter, currentPage],
    () => applicationsAPI.getMyApplications({ 
      status: statusFilter, 
      page: currentPage, 
      limit: 10 
    }),
    {
      select: (response) => response.data
    }
  )

  const getStatusIcon = (status) => {
    switch (status) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'interview':
        return <Calendar className="w-5 h-5 text-blue-500" />
      case 'shortlisted':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      default:
        return <FileText className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'accepted':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'interview':
        return 'bg-blue-100 text-blue-800'
      case 'shortlisted':
        return 'bg-yellow-100 text-yellow-800'
      case 'under-review':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container-custom py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              My Applications
            </h1>
            <p className="text-gray-600">
              Track the status of your job applications
            </p>
          </div>

          {/* Filters */}
          <div className="mb-6">
            <Card className="p-4">
              <div className="flex flex-col sm:flex-row gap-4 items-center">
                <div className="flex-1">
                  <Select
                    label="Filter by Status"
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value)
                      setCurrentPage(1)
                    }}
                    options={statusOptions}
                  />
                </div>
                <div className="text-sm text-gray-600">
                  {applicationsData?.total || 0} total applications
                </div>
              </div>
            </Card>
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : applicationsData?.data?.length > 0 ? (
            <div className="space-y-6">
              {applicationsData.data.map((application, index) => (
                <motion.div
                  key={application._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-1">
                              {application.jobId?.title}
                            </h3>
                            <div className="flex items-center text-gray-600 mb-2">
                              <Building className="w-4 h-4 mr-1" />
                              {application.jobId?.company}
                            </div>
                            <div className="flex items-center text-gray-600">
                              <MapPin className="w-4 h-4 mr-1" />
                              {application.jobId?.location}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(application.status)}
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
                              {application.status.replace('-', ' ')}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center text-sm text-gray-500 mb-4">
                          <Clock className="w-4 h-4 mr-1" />
                          Applied on {formatDate(application.appliedDate)}
                        </div>

                        {application.coverLetter && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Cover Letter:</h4>
                            <p className="text-sm text-gray-600 line-clamp-2">
                              {application.coverLetter}
                            </p>
                          </div>
                        )}

                        {application.notes && (
                          <div className="mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">Notes:</h4>
                            <p className="text-sm text-gray-600">
                              {application.notes}
                            </p>
                          </div>
                        )}

                        {application.interviewDate && (
                          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="text-sm font-medium text-blue-900 mb-1">Interview Scheduled</h4>
                            <p className="text-sm text-blue-700">
                              {formatDate(application.interviewDate)} at {application.interviewLocation}
                            </p>
                            {application.interviewType && (
                              <p className="text-xs text-blue-600 mt-1">
                                Type: {application.interviewType}
                              </p>
                            )}
                          </div>
                        )}

                        {application.feedback && (
                          <div className="mb-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                            <h4 className="text-sm font-medium text-gray-900 mb-1">Feedback:</h4>
                            <p className="text-sm text-gray-600">
                              {application.feedback}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="mt-4 lg:mt-0 lg:ml-6">
                        <Link to={`/jobs/${application.jobId?._id}`}>
                          <Button variant="outline" size="sm">
                            View Job
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No applications found
              </h3>
              <p className="text-gray-600 mb-6">
                {statusFilter 
                  ? `No applications with status "${statusFilter}"`
                  : "You haven't applied to any jobs yet"
                }
              </p>
              <Link to="/jobs">
                <Button>
                  Browse Jobs
                </Button>
              </Link>
            </Card>
          )}

          {/* Pagination */}
          {applicationsData?.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </Button>
                
                {Array.from({ length: Math.min(5, applicationsData.pages) }, (_, i) => {
                  const page = i + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? 'primary' : 'outline'}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
                
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === applicationsData.pages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default Applications
