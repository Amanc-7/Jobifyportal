import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useMutation, useQueryClient } from 'react-query'
import { jobsAPI } from '../services/api'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Textarea from '../components/common/Textarea'
import Select from '../components/common/Select'
import toast from 'react-hot-toast'

const PostJob = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    location: '',
    category: '',
    experience: '',
    skills: '',
    benefits: '',
    salary: {
      min: '',
      max: '',
      currency: 'USD',
      period: 'yearly'
    },
    remote: false,
    applicationDeadline: ''
  })

  const [errors, setErrors] = useState({})

  const categoryOptions = [
    { value: '', label: 'Select job type' },
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'internship', label: 'Internship' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' }
  ]

  const experienceOptions = [
    { value: '', label: 'Select experience level' },
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ]

  const currencyOptions = [
    { value: 'USD', label: 'USD' },
    { value: 'EUR', label: 'EUR' },
    { value: 'GBP', label: 'GBP' },
    { value: 'INR', label: 'INR' },
    { value: 'CAD', label: 'CAD' },
    { value: 'AUD', label: 'AUD' }
  ]

  const periodOptions = [
    { value: 'hourly', label: 'Per Hour' },
    { value: 'monthly', label: 'Per Month' },
    { value: 'yearly', label: 'Per Year' }
  ]

  const createJobMutation = useMutation(
    (jobData) => jobsAPI.createJob(jobData),
    {
      onSuccess: () => {
        toast.success('Job posted successfully!')
        queryClient.invalidateQueries('my-jobs')
        navigate('/dashboard')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to post job')
      }
    }
  )

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    
    if (name.startsWith('salary.')) {
      const salaryField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        salary: {
          ...prev.salary,
          [salaryField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }))
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Job title is required'
    }

    if (!formData.company.trim()) {
      newErrors.company = 'Company name is required'
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Job description is required'
    } else if (formData.description.trim().length < 50) {
      newErrors.description = 'Description must be at least 50 characters'
    }

    if (!formData.requirements.trim()) {
      newErrors.requirements = 'Job requirements are required'
    }

    if (!formData.location.trim()) {
      newErrors.location = 'Location is required'
    }

    if (!formData.category) {
      newErrors.category = 'Job type is required'
    }

    if (!formData.experience) {
      newErrors.experience = 'Experience level is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    const jobData = {
      ...formData,
      skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
      benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit),
      salary: {
        ...formData.salary,
        min: formData.salary.min ? parseInt(formData.salary.min) : undefined,
        max: formData.salary.max ? parseInt(formData.salary.max) : undefined
      }
    }

    createJobMutation.mutate(jobData)
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
              Post a New Job
            </h1>
            <p className="text-gray-600">
              Fill out the form below to post your job opportunity
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Form */}
              <div className="lg:col-span-2 space-y-8">
                {/* Basic Information */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Basic Information
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Job Title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      error={errors.title}
                      required
                      placeholder="e.g. Senior Software Engineer"
                    />
                    <Input
                      label="Company Name"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      error={errors.company}
                      required
                      placeholder="e.g. Tech Corp"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                    <Select
                      label="Job Type"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      options={categoryOptions}
                      error={errors.category}
                      required
                    />
                    <Select
                      label="Experience Level"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      options={experienceOptions}
                      error={errors.experience}
                      required
                    />
                  </div>

                  <div className="mt-6">
                    <Input
                      label="Location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      error={errors.location}
                      required
                      placeholder="e.g. San Francisco, CA or Remote"
                    />
                  </div>

                  <div className="mt-6">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        name="remote"
                        checked={formData.remote}
                        onChange={handleChange}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        This is a remote position
                      </span>
                    </label>
                  </div>
                </Card>

                {/* Job Description */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Job Description
                  </h2>
                  
                  <Textarea
                    label="Job Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    error={errors.description}
                    required
                    rows={6}
                    placeholder="Describe the role, responsibilities, and what makes this opportunity exciting..."
                  />
                </Card>

                {/* Requirements */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Requirements
                  </h2>
                  
                  <Textarea
                    label="Job Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    error={errors.requirements}
                    required
                    rows={4}
                    placeholder="List the required skills, qualifications, and experience..."
                  />
                </Card>

                {/* Skills and Benefits */}
                <Card className="p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">
                    Skills & Benefits
                  </h2>
                  
                  <div className="space-y-6">
                    <Input
                      label="Required Skills (comma-separated)"
                      name="skills"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="e.g. React, Node.js, MongoDB, AWS"
                    />
                    
                    <Input
                      label="Benefits (comma-separated)"
                      name="benefits"
                      value={formData.benefits}
                      onChange={handleChange}
                      placeholder="e.g. Health insurance, 401k, Flexible hours"
                    />
                  </div>
                </Card>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  {/* Salary Information */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Salary Information
                    </h2>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <Input
                          label="Min Salary"
                          type="number"
                          name="salary.min"
                          value={formData.salary.min}
                          onChange={handleChange}
                          placeholder="50000"
                        />
                        <Input
                          label="Max Salary"
                          type="number"
                          name="salary.max"
                          value={formData.salary.max}
                          onChange={handleChange}
                          placeholder="80000"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <Select
                          label="Currency"
                          name="salary.currency"
                          value={formData.salary.currency}
                          onChange={handleChange}
                          options={currencyOptions}
                        />
                        <Select
                          label="Period"
                          name="salary.period"
                          value={formData.salary.period}
                          onChange={handleChange}
                          options={periodOptions}
                        />
                      </div>
                    </div>
                  </Card>

                  {/* Application Deadline */}
                  <Card className="p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">
                      Application Deadline
                    </h2>
                    
                    <Input
                      label="Deadline (optional)"
                      type="date"
                      name="applicationDeadline"
                      value={formData.applicationDeadline}
                      onChange={handleChange}
                    />
                  </Card>

                  {/* Submit Button */}
                  <Card className="p-6">
                    <Button
                      type="submit"
                      loading={createJobMutation.isLoading}
                      className="w-full"
                      size="lg"
                    >
                      Post Job
                    </Button>
                    <p className="text-sm text-gray-600 mt-3 text-center">
                      Your job will be reviewed and published within 24 hours
                    </p>
                  </Card>
                </div>
              </div>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

export default PostJob
