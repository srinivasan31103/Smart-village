import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { resourceAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const ResourceDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [resource, setResource] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchResource()
  }, [id])

  const fetchResource = async () => {
    try {
      const response = await resourceAPI.getById(id)
      setResource(response.data.resource)
    } catch (error) {
      console.error('Failed to fetch resource:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <LoadingSpinner className="min-h-screen" />
  if (!resource) return <div>Resource not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button onClick={() => navigate('/resources')} className="btn btn-secondary flex items-center space-x-2">
        <ArrowLeftIcon className="h-5 w-5" />
        <span>Back to Resources</span>
      </button>

      <div className="card">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{resource.name}</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-700">Type:</span>
              <span className="ml-2 capitalize text-gray-600">{resource.type}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Status:</span>
              <span className="ml-2 capitalize text-gray-600">{resource.status}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Capacity:</span>
              <span className="ml-2 text-gray-600">{resource.capacity.value} {resource.capacity.unit}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Current Usage:</span>
              <span className="ml-2 text-gray-600">{resource.currentUsage.value} {resource.currentUsage.unit}</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Location</h3>
            <p className="text-gray-600">{resource.location.address}</p>
          </div>
        </div>

        {resource.description && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{resource.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResourceDetails
