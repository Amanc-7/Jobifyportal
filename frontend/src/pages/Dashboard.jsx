import React from 'react'
import { motion } from 'framer-motion'
import { 
  Briefcase, 
  Users, 
  TrendingUp, 
  Plus,
  Eye,
  FileText,
  Calendar,
  CheckCircle
} from 'lucide-react'
import { useQuery } from 'react-query'
import { useAuth } from '../contexts/AuthContext'
import { jobsAPI, applicationsAPI } from '../services/api'
import Card from '../components/common/Card'
import Button from '../components/common/Button'
import LoadingSpinner from '../components/common/LoadingSpinner'
import { Link } from 'react-router-dom'

const Dashboard = () => {
  const { user } = useAuth()

  // Fetch dashboard data based on user role
  const { data: jobStats, isLoading: jobStatsLoading } = useQuery(
    'job-stats',
    () => jobsAPI.getJobStats(),
    {
      enabled: user?.role === 'employer' || user?.role === 'admin'
    }
  )

  const { data: applicationStats, isLoading: appStatsLoading } = useQuery(
    'application-stats',
    () => applicationsAPI.getApplicationStats(),
    {
      enabled: user?.role === 'employer' || user?.role === 'admin'
    }
  )

  const { data: myApplications, isLoading: applicationsLoading } = useQuery(
    'my-applications',
    () => applicationsAPI.getMyApplications({ limit: 5 }),
    {
      enabled: user?.role === 'jobseeker'
    }
  )

  const { data: myJobs, isLoading: jobsLoading } = useQuery(
    'my-jobs',
    () => jobsAPI.getMyJobs({ limit: 5 }),
    {
      enabled: user?.role === 'employer' || user?.role === 'admin'
    }
  )

  if (user?.role === 'jobseeker') {
    return <JobSeekerDashboard 
      applications={myApplications?.data?.data} 
      isLoading={applicationsLoading} 
    />
  }

  if (user?.role === 'employer' || user?.role === 'admin') {
    return <EmployerDashboard 
      jobStats={jobStats?.data}
      applicationStats={applicationStats?.data}
      myJobs={myJobs?.data?.data}
      isLoading={jobStatsLoading || appStatsLoading || jobsLoading}
    />
  }

  return null
}

const JobSeekerDashboard = ({ applications, isLoading }) => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Applications Sent',
      value: applications?.length || 0,
      icon: FileText,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Profile Views',
      value: '0', // This would come from analytics
      icon: Eye,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Profile Completion',
      value: user?.profile?.resume ? '100%' : '60%',
      icon: CheckCircle,
      color: 'bg-purple-100 text-purple-600'
    }
  ]

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
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's what's happening with your job search
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Applications</h2>
                <Link to="/applications">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : applications?.length > 0 ? (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <div key={application._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{application.jobId?.title}</h3>
                        <p className="text-sm text-gray-600">{application.jobId?.company}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        application.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        application.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        application.status === 'interview' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {application.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No applications yet</p>
                  <Link to="/jobs">
                    <Button>Browse Jobs</Button>
                  </Link>
                </div>
              )}
            </Card>

            {/* Quick Actions */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
              <div className="space-y-4">
                <Link to="/jobs" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Briefcase className="w-4 h-4 mr-2" />
                    Browse Jobs
                  </Button>
                </Link>
                <Link to="/profile" className="block">
                  <Button className="w-full justify-start" variant="outline">
                    <Users className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                </Link>
                {!user?.profile?.resume && (
                  <Link to="/profile" className="block">
                    <Button className="w-full justify-start" variant="outline">
                      <FileText className="w-4 h-4 mr-2" />
                      Upload Resume
                    </Button>
                  </Link>
                )}
              </div>
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

const EmployerDashboard = ({ jobStats, applicationStats, myJobs, isLoading }) => {
  const { user } = useAuth()

  const stats = [
    {
      title: 'Total Jobs',
      value: jobStats?.overview?.totalJobs || 0,
      icon: Briefcase,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      title: 'Active Jobs',
      value: jobStats?.overview?.activeJobs || 0,
      icon: TrendingUp,
      color: 'bg-green-100 text-green-600'
    },
    {
      title: 'Total Applications',
      value: applicationStats?.overview?.totalApplications || 0,
      icon: Users,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      title: 'Total Views',
      value: jobStats?.overview?.totalViews || 0,
      icon: Eye,
      color: 'bg-orange-100 text-orange-600'
    }
  ]

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
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600">
              Here's your hiring dashboard overview
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="p-6">
                  <div className="flex items-center">
                    <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center mr-4`}>
                      <stat.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                      <p className="text-gray-600">{stat.title}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Recent Jobs and Applications */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Recent Jobs</h2>
                <Link to="/post-job">
                  <Button size="sm">
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </Link>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : myJobs?.length > 0 ? (
                <div className="space-y-4">
                  {myJobs.map((job) => (
                    <div key={job._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h3 className="font-medium text-gray-900">{job.title}</h3>
                        <p className="text-sm text-gray-600">{job.location}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{job.applicationCount} applications</p>
                        <p className="text-xs text-gray-500">{job.views} views</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No jobs posted yet</p>
                  <Link to="/post-job">
                    <Button>Post Your First Job</Button>
                  </Link>
                </div>
              )}
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Application Status</h2>
              </div>

              {applicationStats?.overview ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Applied</span>
                    <span className="font-medium">{applicationStats.overview.applied}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Under Review</span>
                    <span className="font-medium">{applicationStats.overview.underReview}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Shortlisted</span>
                    <span className="font-medium">{applicationStats.overview.shortlisted}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Interview</span>
                    <span className="font-medium">{applicationStats.overview.interview}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Accepted</span>
                    <span className="font-medium text-green-600">{applicationStats.overview.accepted}</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No applications yet</p>
                </div>
              )}
            </Card>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
