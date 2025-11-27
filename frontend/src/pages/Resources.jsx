import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { resourceAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { PlusIcon, CubeIcon } from '@heroicons/react/24/outline'

const Resources = () => {
  const { user } = useAuth()
  const [resources, setResources] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: '', status: '' })

  useEffect(() => {
    fetchResources()
  }, [filter])

  const fetchResources = async () => {
    try {
      const response = await resourceAPI.getAll(filter)
      setResources(response.data.resources)
    } catch (error) {
      console.error('Failed to fetch resources:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      case 'maintenance': return 'bg-yellow-100 text-yellow-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Resources</h1>
          <p className="text-gray-600 mt-1">Manage village resources</p>
        </div>
        {(user.role === 'admin' || user.role === 'officer') && (
          <Link to="/resources/new" className="btn btn-primary flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Add Resource</span>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
              className="input"
            >
              <option value="">All Types</option>
              <option value="water">Water</option>
              <option value="electricity">Electricity</option>
              <option value="waste">Waste</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
              className="input"
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="maintenance">Maintenance</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <Link key={resource._id} to={`/resources/${resource._id}`} className="card hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary-100 rounded-lg">
                    <CubeIcon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800">{resource.name}</h3>
                    <p className="text-sm text-gray-500 capitalize">{resource.type}</p>
                  </div>
                </div>
                <span className={`badge ${getStatusColor(resource.status)}`}>
                  {resource.status}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Capacity:</span>
                  <span className="font-medium">{resource.capacity.value} {resource.capacity.unit}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Usage:</span>
                  <span className="font-medium">{resource.currentUsage.value} {resource.currentUsage.unit}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary-600 h-2 rounded-full"
                    style={{ width: `${(resource.currentUsage.value / resource.capacity.value) * 100}%` }}
                  ></div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default Resources
