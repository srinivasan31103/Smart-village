import mongoose from 'mongoose';

const usageLogSchema = new mongoose.Schema({
  resource: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource',
    required: true
  },
  resourceType: {
    type: String,
    enum: ['water', 'electricity', 'waste'],
    required: true
  },
  usage: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      required: true
    }
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  metadata: {
    meterReading: Number,
    billingCycle: String,
    cost: Number,
    notes: String
  }
}, {
  timestamps: true
});

// Index for efficient querying
usageLogSchema.index({ resource: 1, timestamp: -1 });
usageLogSchema.index({ resourceType: 1, timestamp: -1 });
usageLogSchema.index({ user: 1, timestamp: -1 });

export default mongoose.model('UsageLog', usageLogSchema);
