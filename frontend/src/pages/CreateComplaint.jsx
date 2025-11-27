import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { complaintAPI } from '../services/api'
import Map, { Marker } from 'react-map-gl'
import { MapPinIcon, PhotoIcon } from '@heroicons/react/24/outline'

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || ''

const CreateComplaint = () => {
  const navigate = useNavigate()
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'water',
    subCategory: '',
    location: {
      type: 'Point',
      coordinates: [78.9629, 20.5937], // Default: Center of India
      address: ''
    }
  })

  const [photos, setPhotos] = useState([])
  const [photoPreviews, setPhotoPreviews] = useState([])
  const [loading, setLoading] = useState(false)

  const [viewport, setViewport] = useState({
    longitude: 78.9629,
    latitude: 20.5937,
    zoom: 5
  })

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleMapClick = (event) => {
    const { lng, lat } = event.lngLat
    setFormData({
      ...formData,
      location: {
        ...formData.location,
        coordinates: [lng, lat]
      }
    })

    // Reverse geocode to get address (simplified)
    setFormData(prev => ({
      ...prev,
      location: {
        ...prev.location,
        address: `Location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`
      }
    }))
  }

  const handlePhotoChange = (e) => {
    const files = Array.from(e.target.files)

    if (files.length + photos.length > 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }

    setPhotos([...photos, ...files])

    // Create previews
    const newPreviews = files.map(file => URL.createObjectURL(file))
    setPhotoPreviews([...photoPreviews, ...newPreviews])
  }

  const removePhoto = (index) => {
    const newPhotos = photos.filter((_, i) => i !== index)
    const newPreviews = photoPreviews.filter((_, i) => i !== index)

    // Revoke URL to avoid memory leaks
    URL.revokeObjectURL(photoPreviews[index])

    setPhotos(newPhotos)
    setPhotoPreviews(newPreviews)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.location.address) {
      toast.error('Please select a location on the map')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category', formData.category)
      submitData.append('subCategory', formData.subCategory)
      submitData.append('location', JSON.stringify(formData.location))

      photos.forEach(photo => {
        submitData.append('photos', photo)
      })

      await complaintAPI.create(submitData)

      toast.success('Complaint submitted successfully!')
      navigate('/complaints')
    } catch (error) {
      console.error('Failed to create complaint:', error)
      toast.error(error.response?.data?.message || 'Failed to submit complaint')
    } finally {
      setLoading(false)
    }
  }

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords
          setFormData({
            ...formData,
            location: {
              ...formData.location,
              coordinates: [longitude, latitude],
              address: `Current Location: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
            }
          })
          setViewport({
            ...viewport,
            longitude,
            latitude,
            zoom: 14
          })
          toast.success('Location updated to your current position')
        },
        (error) => {
          console.error('Geolocation error:', error)
          toast.error('Failed to get current location')
        }
      )
    } else {
      toast.error('Geolocation is not supported by your browser')
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Report New Complaint</h1>
        <p className="text-gray-600 mt-1">Fill in the details to report an issue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Basic Information</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Brief description of the issue"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="input"
                rows="4"
                placeholder="Detailed description of the issue"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="water">Water</option>
                  <option value="electricity">Electricity</option>
                  <option value="waste">Waste</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700 mb-1">
                  Sub-Category (Optional)
                </label>
                <input
                  type="text"
                  id="subCategory"
                  name="subCategory"
                  value={formData.subCategory}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., Leaking pipe, Power outage"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Location *</h2>
            <button
              type="button"
              onClick={getCurrentLocation}
              className="btn btn-secondary text-sm flex items-center space-x-2"
            >
              <MapPinIcon className="h-4 w-4" />
              <span>Use Current Location</span>
            </button>
          </div>

          <div className="space-y-4">
            {MAPBOX_TOKEN ? (
              <div className="h-96 rounded-lg overflow-hidden border border-gray-300">
                <Map
                  {...viewport}
                  onMove={evt => setViewport(evt.viewState)}
                  onClick={handleMapClick}
                  mapStyle="mapbox://styles/mapbox/streets-v12"
                  mapboxAccessToken={MAPBOX_TOKEN}
                >
                  <Marker
                    longitude={formData.location.coordinates[0]}
                    latitude={formData.location.coordinates[1]}
                    anchor="bottom"
                  >
                    <MapPinIcon className="h-8 w-8 text-red-600" />
                  </Marker>
                </Map>
              </div>
            ) : (
              <div className="h-96 rounded-lg bg-gray-100 border border-gray-300 flex items-center justify-center">
                <p className="text-gray-500">Map not available (Mapbox token required)</p>
              </div>
            )}

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                Address
              </label>
              <input
                type="text"
                id="address"
                value={formData.location.address}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, address: e.target.value }
                })}
                className="input"
                placeholder="Enter or click on map to set location"
                required
              />
            </div>
          </div>
        </div>

        {/* Photos */}
        <div className="card">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Photos (Optional)</h2>

          <div className="space-y-4">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoChange}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="btn btn-secondary flex items-center space-x-2"
                disabled={photos.length >= 5}
              >
                <PhotoIcon className="h-5 w-5" />
                <span>Add Photos (Max 5)</span>
              </button>
              <p className="text-sm text-gray-500 mt-1">{photos.length}/5 photos selected</p>
            </div>

            {photoPreviews.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {photoPreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                    >
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/complaints')}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateComplaint
