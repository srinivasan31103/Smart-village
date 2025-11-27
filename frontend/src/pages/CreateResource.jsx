import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { resourceAPI } from '../services/api'

const CreateResource = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    type: 'water',
    name: '',
    description: '',
    location: { type: 'Point', coordinates: [0, 0], address: '' },
    capacity: { value: 0, unit: '' },
    status: 'active'
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await resourceAPI.create(formData)
      toast.success('Resource created successfully')
      navigate('/resources')
    } catch (error) {
      toast.error('Failed to create resource')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Add New Resource</h1>
      <form onSubmit={handleSubmit} className="card space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <select
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
            className="input"
            required
          >
            <option value="water">Water</option>
            <option value="electricity">Electricity</option>
            <option value="waste">Waste</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="input"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="input"
            rows="3"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Capacity Value</label>
            <input
              type="number"
              value={formData.capacity.value}
              onChange={(e) => setFormData({ ...formData, capacity: { ...formData.capacity, value: e.target.value } })}
              className="input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
            <input
              type="text"
              value={formData.capacity.unit}
              onChange={(e) => setFormData({ ...formData, capacity: { ...formData.capacity, unit: e.target.value } })}
              className="input"
              placeholder="liters, kWh, kg"
              required
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
            className="input"
            required
          />
        </div>
        <button type="submit" disabled={loading} className="btn btn-primary w-full">
          {loading ? 'Creating...' : 'Create Resource'}
        </button>
      </form>
    </div>
  )
}

export default CreateResource
