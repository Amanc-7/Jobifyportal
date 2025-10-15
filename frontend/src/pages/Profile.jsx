import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Briefcase,
  Upload,
  Save,
  Edit3
} from 'lucide-react'
import { useMutation, useQueryClient } from 'react-query'
import { usersAPI } from '../services/api'
import { useAuth } from '../contexts/AuthContext'
import Button from '../components/common/Button'
import Card from '../components/common/Card'
import Input from '../components/common/Input'
import Textarea from '../components/common/Textarea'
import Select from '../components/common/Select'
import toast from 'react-hot-toast'

const Profile = () => {
  const { user, updateUser } = useAuth()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    profile: {
      phone: user?.profile?.phone || '',
      location: user?.profile?.location || '',
      bio: user?.profile?.bio || '',
      skills: user?.profile?.skills?.join(', ') || '',
      experience: user?.profile?.experience || 'entry',
      education: user?.profile?.education || '',
      website: user?.profile?.website || '',
      company: user?.profile?.company || '',
      companySize: user?.profile?.companySize || '',
      industry: user?.profile?.industry || ''
    }
  })

  const [errors, setErrors] = useState({})

  const experienceOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ]

  const companySizeOptions = [
    { value: '', label: 'Select company size' },
    { value: '1-10', label: '1-10 employees' },
    { value: '11-50', label: '11-50 employees' },
    { value: '51-200', label: '51-200 employees' },
    { value: '201-500', label: '201-500 employees' },
    { value: '500+', label: '500+ employees' }
  ]

  const updateProfileMutation = useMutation(
    (profileData) => usersAPI.updateUser(user.id, profileData),
    {
      onSuccess: (response) => {
        updateUser(response.data.data)
        toast.success('Profile updated successfully!')
        setIsEditing(false)
        queryClient.invalidateQueries('auth/me')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update profile')
      }
    }
  )

  const uploadResumeMutation = useMutation(
    (file) => usersAPI.uploadResume(user.id, file),
    {
      onSuccess: (response) => {
        updateUser({ profile: { ...user.profile, resume: response.data.data.resume } })
        toast.success('Resume uploaded successfully!')
        queryClient.invalidateQueries('auth/me')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload resume')
      }
    }
  )

  const uploadProfilePictureMutation = useMutation(
    (file) => usersAPI.uploadProfilePicture(user.id, file),
    {
      onSuccess: (response) => {
        updateUser({ profile: { ...user.profile, profilePicture: response.data.data.profilePicture } })
        toast.success('Profile picture uploaded successfully!')
        queryClient.invalidateQueries('auth/me')
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to upload profile picture')
      }
    }
  )

  const handleChange = (e) => {
    const { name, value } = e.target
    
    if (name.startsWith('profile.')) {
      const profileField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        profile: {
          ...prev.profile,
          [profileField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
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

  const handleSubmit = (e) => {
    e.preventDefault()
    
    const profileData = {
      ...formData,
      profile: {
        ...formData.profile,
        skills: formData.profile.skills.split(',').map(skill => skill.trim()).filter(skill => skill)
      }
    }

    updateProfileMutation.mutate(profileData)
  }

  const handleFileUpload = (e, type) => {
    const file = e.target.files[0]
    if (!file) return

    if (type === 'resume') {
      uploadResumeMutation.mutate(file)
    } else if (type === 'profilePicture') {
      uploadProfilePictureMutation.mutate(file)
    }
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
              Profile Settings
            </h1>
            <p className="text-gray-600">
              Manage your profile information and preferences
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Picture & Basic Info */}
            <div className="lg:col-span-1">
              <Card className="p-6 text-center">
                <div className="relative inline-block mb-6">
                  {user?.profile?.profilePicture ? (
                    <img
                      src={user.profile.profilePicture}
                      alt={user.name}
                      className="w-32 h-32 rounded-full object-cover mx-auto"
                    />
                  ) : (
                    <div className="w-32 h-32 bg-primary-100 rounded-full flex items-center justify-center mx-auto">
                      <User className="w-16 h-16 text-primary-600" />
                    </div>
                  )}
                  
                  <label className="absolute bottom-0 right-0 bg-primary-600 text-white p-2 rounded-full cursor-pointer hover:bg-primary-700 transition-colors">
                    <Upload className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'profilePicture')}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  {user?.name}
                </h2>
                <p className="text-gray-600 mb-4 capitalize">
                  {user?.role}
                </p>

                {/* Resume Upload */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Resume
                  </label>
                  {user?.profile?.resume ? (
                    <div className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center">
                        <Briefcase className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-sm text-green-800">Resume uploaded</span>
                      </div>
                      <a
                        href={user.profile.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-green-600 hover:text-green-700"
                      >
                        View
                      </a>
                    </div>
                  ) : (
                    <label className="block">
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => handleFileUpload(e, 'resume')}
                        className="hidden"
                      />
                      <div className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-center cursor-pointer hover:border-primary-500 transition-colors">
                        <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Upload Resume</span>
                      </div>
                    </label>
                  )}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setIsEditing(!isEditing)}
                  className="w-full"
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  {isEditing ? 'Cancel' : 'Edit Profile'}
                </Button>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">
                  Profile Information
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Basic Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Full Name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                    <Input
                      label="Email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Input
                      label="Phone"
                      name="profile.phone"
                      value={formData.profile.phone}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                    <Input
                      label="Location"
                      name="profile.location"
                      value={formData.profile.location}
                      onChange={handleChange}
                      disabled={!isEditing}
                      placeholder="City, State"
                    />
                  </div>

                  <Textarea
                    label="Bio"
                    name="profile.bio"
                    value={formData.profile.bio}
                    onChange={handleChange}
                    disabled={!isEditing}
                    rows={4}
                    placeholder="Tell us about yourself..."
                  />

                  {/* Job Seeker Specific Fields */}
                  {user?.role === 'jobseeker' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Select
                          label="Experience Level"
                          name="profile.experience"
                          value={formData.profile.experience}
                          onChange={handleChange}
                          options={experienceOptions}
                          disabled={!isEditing}
                        />
                        <Input
                          label="Education"
                          name="profile.education"
                          value={formData.profile.education}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="e.g. Bachelor's in Computer Science"
                        />
                      </div>

                      <Input
                        label="Skills (comma-separated)"
                        name="profile.skills"
                        value={formData.profile.skills}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. React, Node.js, Python, AWS"
                      />
                    </>
                  )}

                  {/* Employer Specific Fields */}
                  {user?.role === 'employer' && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                          label="Company"
                          name="profile.company"
                          value={formData.profile.company}
                          onChange={handleChange}
                          disabled={!isEditing}
                          placeholder="Company name"
                        />
                        <Select
                          label="Company Size"
                          name="profile.companySize"
                          value={formData.profile.companySize}
                          onChange={handleChange}
                          options={companySizeOptions}
                          disabled={!isEditing}
                        />
                      </div>

                      <Input
                        label="Industry"
                        name="profile.industry"
                        value={formData.profile.industry}
                        onChange={handleChange}
                        disabled={!isEditing}
                        placeholder="e.g. Technology, Healthcare, Finance"
                      />
                    </>
                  )}

                  <Input
                    label="Website"
                    name="profile.website"
                    value={formData.profile.website}
                    onChange={handleChange}
                    disabled={!isEditing}
                    placeholder="https://yourwebsite.com"
                  />

                  {isEditing && (
                    <div className="flex justify-end space-x-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsEditing(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={updateProfileMutation.isLoading}
                      >
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </Card>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Profile
