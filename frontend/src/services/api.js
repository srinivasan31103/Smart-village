import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

// Complaints API
export const complaintAPI = {
  getAll: (params) => axios.get(`${API_URL}/complaints`, { params }),
  getById: (id) => axios.get(`${API_URL}/complaints/${id}`),
  create: (data) => axios.post(`${API_URL}/complaints`, data, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  update: (id, data) => axios.put(`${API_URL}/complaints/${id}`, data),
  resolve: (id, data) => axios.put(`${API_URL}/complaints/${id}/resolve`, data),
  delete: (id) => axios.delete(`${API_URL}/complaints/${id}`),
  addComment: (id, data) => axios.post(`${API_URL}/complaints/${id}/comments`, data)
}

// Resources API
export const resourceAPI = {
  getAll: (params) => axios.get(`${API_URL}/resources`, { params }),
  getById: (id) => axios.get(`${API_URL}/resources/${id}`),
  create: (data) => axios.post(`${API_URL}/resources`, data),
  update: (id, data) => axios.put(`${API_URL}/resources/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/resources/${id}`),
  logUsage: (id, data) => axios.post(`${API_URL}/resources/${id}/usage`, data),
  getUsageHistory: (id, params) => axios.get(`${API_URL}/resources/${id}/usage-history`, { params })
}

// Users API
export const userAPI = {
  getAll: (params) => axios.get(`${API_URL}/users`, { params }),
  getById: (id) => axios.get(`${API_URL}/users/${id}`),
  update: (id, data) => axios.put(`${API_URL}/users/${id}`, data),
  delete: (id) => axios.delete(`${API_URL}/users/${id}`)
}

// Dashboard API
export const dashboardAPI = {
  getStats: () => axios.get(`${API_URL}/dashboard/stats`),
  getComplaintsByCategory: () => axios.get(`${API_URL}/dashboard/complaints-by-category`),
  getComplaintsByStatus: () => axios.get(`${API_URL}/dashboard/complaints-by-status`),
  getResourceUsage: (params) => axios.get(`${API_URL}/dashboard/resource-usage`, { params }),
  getRecentComplaints: (params) => axios.get(`${API_URL}/dashboard/recent-complaints`, { params }),
  getResourceStatus: () => axios.get(`${API_URL}/dashboard/resource-status`),
  getMonthlyTrends: (params) => axios.get(`${API_URL}/dashboard/monthly-trends`, { params })
}

// AI API
export const aiAPI = {
  classifyComplaint: (data) => axios.post(`${API_URL}/ai/classify-complaint`, data),
  getResourceInsights: (data) => axios.post(`${API_URL}/ai/resource-insights`, data),
  getMonthlySummary: (params) => axios.get(`${API_URL}/ai/monthly-summary`, { params })
}

// Reports API
export const reportAPI = {
  generateMonthly: (data) => axios.post(`${API_URL}/reports/monthly`, data),
  generateComplaint: (id) => axios.post(`${API_URL}/reports/complaint/${id}`)
}

export default {
  complaint: complaintAPI,
  resource: resourceAPI,
  user: userAPI,
  dashboard: dashboardAPI,
  ai: aiAPI,
  report: reportAPI
}
