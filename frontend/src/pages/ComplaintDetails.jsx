import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useAuth } from '../context/AuthContext'
import { complaintAPI, reportAPI } from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import StatusBadge from '../components/StatusBadge'
import PriorityBadge from '../components/PriorityBadge'
import { ArrowLeftIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'

const ComplaintDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [complaint, setComplaint] = useState(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [comment, setComment] = useState('')

  const [updateForm, setUpdateForm] = useState({
    status: '',
    priority: '',
    comment: ''
  })

  const [resolutionForm, setResolutionForm] = useState({
    description: '',
    actionsTaken: ''
  })

  useEffect(() => {
    fetchComplaint()
  }, [id])

  const fetchComplaint = async () => {
    try {
      const response = await complaintAPI.getById(id)
      setComplaint(response.data.complaint)
      setUpdateForm({
        status: response.data.complaint.status,
        priority: response.data.complaint.priority,
        comment: ''
      })
    } catch (error) {
      console.error('Failed to fetch complaint:', error)
      toast.error('Failed to load complaint details')
      navigate('/complaints')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      await complaintAPI.update(id, updateForm)
      toast.success('Complaint updated successfully')
      fetchComplaint()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update complaint')
    } finally {
      setUpdating(false)
    }
  }

  const handleResolve = async (e) => {
    e.preventDefault()
    setUpdating(true)

    try {
      const actions = resolutionForm.actionsTaken
        .split('\n')
        .filter(action => action.trim())

      await complaintAPI.resolve(id, {
        description: resolutionForm.description,
        actionsTaken: actions
      })

      toast.success('Complaint resolved successfully')
      fetchComplaint()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to resolve complaint')
    } finally {
      setUpdating(false)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!comment.trim()) return

    try {
      await complaintAPI.addComment(id, { text: comment })
      toast.success('Comment added')
      setComment('')
      fetchComplaint()
    } catch (error) {
      toast.error('Failed to add comment')
    }
  }

  const generateReport = async () => {
    try {
      const response = await reportAPI.generateComplaint(id)
      const reportUrl = response.data.report.relativePath
      window.open(`http://localhost:5000${reportUrl}`, '_blank')
      toast.success('Report generated successfully')
    } catch (error) {
      toast.error('Failed to generate report')
    }
  }

  if (loading) {
    return <LoadingSpinner className="min-h-screen" />
  }

  if (!complaint) {
    return <div>Complaint not found</div>
  }

  const canManage = user.role === 'admin' || user.role === 'officer'

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/complaints')}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Complaints</span>
        </button>

        <button
          onClick={generateReport}
          className="btn btn-secondary flex items-center space-x-2"
        >
          <DocumentArrowDownIcon className="h-5 w-5" />
          <span>Download Report</span>
        </button>
      </div>

      {/* Complaint Details */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{complaint.title}</h1>
            <p className="text-sm text-gray-500 mt-1">ID: {complaint._id}</p>
          </div>
          <div className="flex items-center space-x-2">
            <StatusBadge status={complaint.status} />
            <PriorityBadge priority={complaint.priority} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-600">{complaint.description}</p>
          </div>

          <div className="space-y-3">
            <div>
              <span className="text-sm font-semibold text-gray-700">Category:</span>
              <span className="ml-2 capitalize text-gray-600">{complaint.category}</span>
            </div>
            {complaint.subCategory && (
              <div>
                <span className="text-sm font-semibold text-gray-700">Sub-Category:</span>
                <span className="ml-2 text-gray-600">{complaint.subCategory}</span>
              </div>
            )}
            <div>
              <span className="text-sm font-semibold text-gray-700">Reported By:</span>
              <span className="ml-2 text-gray-600">{complaint.reportedBy?.name}</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Reported On:</span>
              <span className="ml-2 text-gray-600">
                {new Date(complaint.createdAt).toLocaleString()}
              </span>
            </div>
            <div>
              <span className="text-sm font-semibold text-gray-700">Location:</span>
              <span className="ml-2 text-gray-600">{complaint.location.address}</span>
            </div>
          </div>
        </div>

        {/* Photos */}
        {complaint.photos && complaint.photos.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Photos</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {complaint.photos.map((photo, index) => (
                <img
                  key={index}
                  src={`http://localhost:5000${photo.url}`}
                  alt={photo.caption || `Photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border cursor-pointer hover:opacity-75"
                  onClick={() => window.open(`http://localhost:5000${photo.url}`, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* AI Classification */}
        {complaint.aiClassification && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">AI Analysis</h3>
            <div className="bg-blue-50 p-4 rounded-lg space-y-2">
              <p><strong>Suggested Priority:</strong> <PriorityBadge priority={complaint.aiClassification.priority} /></p>
              {complaint.aiClassification.suggestedActions && (
                <div>
                  <strong>Suggested Actions:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {complaint.aiClassification.suggestedActions.map((action, i) => (
                      <li key={i}>{action}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Resolution */}
        {complaint.resolution && complaint.resolution.description && (
          <div className="mt-6 pt-6 border-t">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Resolution</h3>
            <div className="bg-green-50 p-4 rounded-lg">
              <p className="text-gray-700">{complaint.resolution.description}</p>
              <p className="text-sm text-gray-500 mt-2">
                Resolved on {new Date(complaint.resolution.resolvedAt).toLocaleString()}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Update Form (Admin/Officer only) */}
      {canManage && complaint.status !== 'resolved' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Update Complaint</h2>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={updateForm.status}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value })}
                  className="input"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={updateForm.priority}
                  onChange={(e) => setUpdateForm({ ...updateForm, priority: e.target.value })}
                  className="input"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
              <textarea
                value={updateForm.comment}
                onChange={(e) => setUpdateForm({ ...updateForm, comment: e.target.value })}
                className="input"
                rows="2"
                placeholder="Add a comment about this update"
              />
            </div>
            <button type="submit" disabled={updating} className="btn btn-primary">
              {updating ? 'Updating...' : 'Update Complaint'}
            </button>
          </form>
        </div>
      )}

      {/* Resolve Form (Admin/Officer only) */}
      {canManage && complaint.status !== 'resolved' && (
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Resolve Complaint</h2>
          <form onSubmit={handleResolve} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resolution Description</label>
              <textarea
                value={resolutionForm.description}
                onChange={(e) => setResolutionForm({ ...resolutionForm, description: e.target.value })}
                className="input"
                rows="3"
                placeholder="Describe how the issue was resolved"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actions Taken (one per line)</label>
              <textarea
                value={resolutionForm.actionsTaken}
                onChange={(e) => setResolutionForm({ ...resolutionForm, actionsTaken: e.target.value })}
                className="input"
                rows="3"
                placeholder="Fixed water leakage&#10;Replaced damaged pipe&#10;Tested water supply"
              />
            </div>
            <button type="submit" disabled={updating} className="btn btn-primary">
              {updating ? 'Resolving...' : 'Mark as Resolved'}
            </button>
          </form>
        </div>
      )}

      {/* Comments */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Comments</h2>

        {complaint.comments && complaint.comments.length > 0 && (
          <div className="space-y-3 mb-6">
            {complaint.comments.map((comment, index) => (
              <div key={index} className="bg-gray-50 p-3 rounded-lg">
                <p className="text-sm font-semibold text-gray-700">{comment.user?.name}</p>
                <p className="text-gray-600 mt-1">{comment.text}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAddComment} className="space-y-3">
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="input"
            rows="2"
            placeholder="Add a comment..."
          />
          <button type="submit" className="btn btn-secondary">
            Add Comment
          </button>
        </form>
      </div>
    </div>
  )
}

export default ComplaintDetails
