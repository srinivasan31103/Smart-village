import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI } from '../services/api'
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js'
import { Pie, Bar, Line } from 'react-chartjs-2'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import {
  ChartBarIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  CubeIcon
} from '@heroicons/react/24/outline'

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [complaintsByCategory, setComplaintsByCategory] = useState(null)
  const [complaintsByStatus, setComplaintsByStatus] = useState(null)
  const [recentComplaints, setRecentComplaints] = useState([])
  const [resourceStatus, setResourceStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsRes, categoryRes, statusRes, recentRes] = await Promise.all([
        dashboardAPI.getStats(),
        user.role !== 'citizen' ? dashboardAPI.getComplaintsByCategory() : Promise.resolve(null),
        user.role !== 'citizen' ? dashboardAPI.getComplaintsByStatus() : Promise.resolve(null),
        dashboardAPI.getRecentComplaints({ limit: 5 })
      ])

      setStats(statsRes.data.stats)
      setComplaintsByCategory(categoryRes?.data.data)
      setComplaintsByStatus(statusRes?.data.data)
      setRecentComplaints(recentRes.data.complaints)

      if (user.role !== 'citizen') {
        const resourceRes = await dashboardAPI.getResourceStatus()
        setResourceStatus(resourceRes.data.data)
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />
  }

  // Chart configurations
  const categoryChartData = complaintsByCategory ? {
    labels: Object.keys(complaintsByCategory).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      label: 'Complaints by Category',
      data: Object.values(complaintsByCategory),
      backgroundColor: [
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(245, 158, 11, 0.8)',
        'rgba(239, 68, 68, 0.8)',
        'rgba(139, 92, 246, 0.8)',
      ],
    }]
  } : null

  const statusChartData = complaintsByStatus ? {
    labels: Object.keys(complaintsByStatus).map(k => k.charAt(0).toUpperCase() + k.slice(1)),
    datasets: [{
      label: 'Complaints by Status',
      data: Object.values(complaintsByStatus),
      backgroundColor: [
        'rgba(251, 191, 36, 0.8)',
        'rgba(59, 130, 246, 0.8)',
        'rgba(16, 185, 129, 0.8)',
        'rgba(239, 68, 68, 0.8)',
      ],
    }]
  } : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'citizen' ? (
          <>
            <StatCard
              title="My Complaints"
              value={stats?.myComplaints || 0}
              icon={ExclamationTriangleIcon}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={stats?.pendingComplaints || 0}
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolvedComplaints || 0}
              icon={CheckCircleIcon}
              color="green"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Complaints"
              value={stats?.totalComplaints || 0}
              icon={ExclamationTriangleIcon}
              color="blue"
            />
            <StatCard
              title="Pending"
              value={stats?.pendingComplaints || 0}
              icon={ClockIcon}
              color="yellow"
            />
            <StatCard
              title="In Progress"
              value={stats?.inProgressComplaints || 0}
              icon={ChartBarIcon}
              color="indigo"
            />
            <StatCard
              title="Resolved"
              value={stats?.resolvedComplaints || 0}
              icon={CheckCircleIcon}
              color="green"
            />
          </>
        )}
      </div>

      {/* Additional Stats for Admin/Officer */}
      {user.role !== 'citizen' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Resources"
            value={stats?.totalResources || 0}
            icon={CubeIcon}
            color="purple"
          />
          <StatCard
            title="Active Resources"
            value={stats?.activeResources || 0}
            icon={CheckCircleIcon}
            color="green"
          />
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={ChartBarIcon}
            color="blue"
          />
          <StatCard
            title="Resolution Rate"
            value={`${stats?.resolutionRate || 0}%`}
            icon={ChartBarIcon}
            color="green"
          />
        </div>
      )}

      {/* Charts for Admin/Officer */}
      {user.role !== 'citizen' && categoryChartData && statusChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaints by Category</h3>
            <div className="h-64">
              <Pie data={categoryChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Complaints by Status</h3>
            <div className="h-64">
              <Bar data={statusChartData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      )}

      {/* Recent Complaints */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">Recent Complaints</h3>
          <Link to="/complaints" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        </div>

        {recentComplaints.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentComplaints.map((complaint) => (
                  <tr key={complaint._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Link to={`/complaints/${complaint._id}`} className="text-primary-600 hover:text-primary-700">
                        {complaint.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">
                      {complaint.category}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <StatusBadge status={complaint.status} />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(complaint.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No recent complaints</p>
        )}
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link to="/complaints/new" className="btn btn-primary text-center">
            Report New Complaint
          </Link>
          <Link to="/complaints" className="btn btn-secondary text-center">
            View All Complaints
          </Link>
          <Link to="/resources" className="btn btn-secondary text-center">
            View Resources
          </Link>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    red: 'bg-red-100 text-red-600',
    purple: 'bg-purple-100 text-purple-600',
    indigo: 'bg-indigo-100 text-indigo-600'
  }

  return (
    <div className="card">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

export default Dashboard
