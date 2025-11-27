import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['water', 'electricity', 'waste'],
    required: [true, 'Resource type is required']
  },
  name: {
    type: String,
    required: [true, 'Resource name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true
    },
    address: String
  },
  capacity: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  currentUsage: {
    value: {
      type: Number,
      default: 0
    },
    unit: {
      type: String
    },
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'critical'],
    default: 'active'
  },
  metadata: {
    waterQuality: String, // For water resources
    voltage: Number, // For electricity
    wasteType: [String], // For waste management
    collectionSchedule: String,
    lastMaintenance: Date,
    nextMaintenance: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for geospatial queries
resourceSchema.index({ location: '2dsphere' });

// Index for efficient filtering
resourceSchema.index({ type: 1, status: 1 });

export default mongoose.model('Resource', resourceSchema);
