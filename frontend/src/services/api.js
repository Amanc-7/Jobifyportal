import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getMe: () => api.get('/auth/me'),
  updatePassword: (currentPassword, newPassword) =>
    api.put('/auth/password', { currentPassword, newPassword }),
  logout: () => api.post('/auth/logout'),
}

// Users API
export const usersAPI = {
  getUsers: (params) => api.get('/users', { params }),
  getUser: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  uploadProfilePicture: (id, file) => {
    const formData = new FormData()
    formData.append('profilePicture', file)
    return api.post(`/users/${id}/profile-picture`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  uploadResume: (id, file) => {
    const formData = new FormData()
    formData.append('resume', file)
    return api.post(`/users/${id}/resume`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
  deleteUser: (id) => api.delete(`/users/${id}`),
  toggleUserStatus: (id) => api.put(`/users/${id}/toggle-status`),
}

// Jobs API
export const jobsAPI = {
  getJobs: (params) => api.get('/jobs', { params }),
  getJob: (id) => api.get(`/jobs/${id}`),
  createJob: (jobData) => api.post('/jobs', jobData),
  updateJob: (id, jobData) => api.put(`/jobs/${id}`, jobData),
  deleteJob: (id) => api.delete(`/jobs/${id}`),
  getMyJobs: (params) => api.get('/jobs/my-jobs', { params }),
  getJobStats: () => api.get('/jobs/stats'),
}

// Applications API
export const applicationsAPI = {
  applyForJob: (applicationData) => api.post('/applications', applicationData),
  getMyApplications: (params) => api.get('/applications/my-applications', { params }),
  getJobApplications: (jobId, params) => api.get(`/applications/job/${jobId}`, { params }),
  getAllApplications: (params) => api.get('/applications', { params }),
  getApplication: (id) => api.get(`/applications/${id}`),
  updateApplicationStatus: (id, statusData) => api.put(`/applications/${id}/status`, statusData),
  deleteApplication: (id) => api.delete(`/applications/${id}`),
  getApplicationStats: () => api.get('/applications/stats'),
}

// Health check
export const healthAPI = {
  check: () => api.get('/health'),
}

export default api
