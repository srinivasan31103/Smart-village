import Complaint from '../models/Complaint.js';
import Resource from '../models/Resource.js';
import UsageLog from '../models/UsageLog.js';

// Calculate complaint trends
export const getComplaintTrends = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const trends = await Complaint.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          category: '$category'
        },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { '_id.date': 1 }
    }
  ]);

  return trends;
};

// Predict resource usage
export const predictResourceUsage = async (resourceId, days = 7) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const usageLogs = await UsageLog.find({
    resource: resourceId,
    timestamp: { $gte: thirtyDaysAgo }
  }).sort({ timestamp: 1 });

  if (usageLogs.length < 7) {
    return { prediction: null, confidence: 0, message: 'Insufficient data for prediction' };
  }

  // Simple linear regression for prediction
  const values = usageLogs.map(log => log.usage.value);
  const n = values.length;

  // Calculate average daily usage
  const avgDailyUsage = values.reduce((sum, val) => sum + val, 0) / n;

  // Calculate trend
  let trend = 0;
  for (let i = 1; i < n; i++) {
    trend += (values[i] - values[i - 1]);
  }
  trend = trend / (n - 1);

  // Predict future usage
  const predictions = [];
  for (let i = 1; i <= days; i++) {
    predictions.push({
      day: i,
      predictedUsage: Math.max(0, avgDailyUsage + (trend * i))
    });
  }

  return {
    predictions,
    avgDailyUsage,
    trend: trend > 0 ? 'increasing' : trend < 0 ? 'decreasing' : 'stable',
    confidence: Math.min(95, (n / 30) * 100)
  };
};

// Get peak usage times
export const getPeakUsageTimes = async (resourceType, days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const peakTimes = await UsageLog.aggregate([
    {
      $match: {
        resourceType,
        timestamp: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          hour: { $hour: '$timestamp' },
          dayOfWeek: { $dayOfWeek: '$timestamp' }
        },
        avgUsage: { $avg: '$usage.value' },
        count: { $sum: 1 }
      }
    },
    {
      $sort: { avgUsage: -1 }
    },
    {
      $limit: 10
    }
  ]);

  return peakTimes;
};

// Get complaint resolution efficiency
export const getResolutionEfficiency = async (days = 30) => {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const complaints = await Complaint.find({
    createdAt: { $gte: startDate },
    status: 'resolved'
  });

  const resolutionTimes = complaints.map(complaint => {
    if (complaint.resolution && complaint.resolution.resolvedAt) {
      const timeToResolve = complaint.resolution.resolvedAt - complaint.createdAt;
      return {
        complaintId: complaint._id,
        category: complaint.category,
        priority: complaint.priority,
        timeToResolve: timeToResolve / (1000 * 60 * 60), // Convert to hours
        resolvedAt: complaint.resolution.resolvedAt
      };
    }
    return null;
  }).filter(Boolean);

  // Calculate averages by category
  const avgByCategory = {};
  const avgByPriority = {};

  resolutionTimes.forEach(item => {
    if (!avgByCategory[item.category]) {
      avgByCategory[item.category] = { sum: 0, count: 0 };
    }
    if (!avgByPriority[item.priority]) {
      avgByPriority[item.priority] = { sum: 0, count: 0 };
    }

    avgByCategory[item.category].sum += item.timeToResolve;
    avgByCategory[item.category].count += 1;
    avgByPriority[item.priority].sum += item.timeToResolve;
    avgByPriority[item.priority].count += 1;
  });

  // Calculate final averages
  Object.keys(avgByCategory).forEach(key => {
    avgByCategory[key] = (avgByCategory[key].sum / avgByCategory[key].count).toFixed(2);
  });

  Object.keys(avgByPriority).forEach(key => {
    avgByPriority[key] = (avgByPriority[key].sum / avgByPriority[key].count).toFixed(2);
  });

  const overallAvg = resolutionTimes.length > 0
    ? (resolutionTimes.reduce((sum, item) => sum + item.timeToResolve, 0) / resolutionTimes.length).toFixed(2)
    : 0;

  return {
    overallAvgHours: overallAvg,
    avgByCategory,
    avgByPriority,
    totalResolved: resolutionTimes.length
  };
};

// Get resource health score
export const getResourceHealthScore = async (resourceId) => {
  const resource = await Resource.findById(resourceId);
  if (!resource) {
    return null;
  }

  let score = 100;
  const issues = [];

  // Check capacity utilization
  const utilizationRate = (resource.currentUsage.value / resource.capacity.value) * 100;

  if (utilizationRate > 90) {
    score -= 30;
    issues.push('Critical: Near capacity limit');
  } else if (utilizationRate > 75) {
    score -= 15;
    issues.push('Warning: High utilization');
  }

  // Check maintenance schedule
  if (resource.metadata?.nextMaintenance) {
    const daysUntilMaintenance = (new Date(resource.metadata.nextMaintenance) - new Date()) / (1000 * 60 * 60 * 24);

    if (daysUntilMaintenance < 0) {
      score -= 25;
      issues.push('Critical: Maintenance overdue');
    } else if (daysUntilMaintenance < 7) {
      score -= 10;
      issues.push('Warning: Maintenance due soon');
    }
  }

  // Check status
  if (resource.status === 'critical') {
    score -= 40;
    issues.push('Critical: Resource marked as critical');
  } else if (resource.status === 'maintenance') {
    score -= 20;
    issues.push('Info: Under maintenance');
  } else if (resource.status === 'inactive') {
    score = 0;
    issues.push('Critical: Resource inactive');
  }

  return {
    resourceId: resource._id,
    name: resource.name,
    type: resource.type,
    score: Math.max(0, score),
    status: score >= 80 ? 'healthy' : score >= 50 ? 'warning' : 'critical',
    issues,
    utilizationRate: utilizationRate.toFixed(2),
    recommendations: generateRecommendations(score, issues, utilizationRate)
  };
};

const generateRecommendations = (score, issues, utilizationRate) => {
  const recommendations = [];

  if (utilizationRate > 90) {
    recommendations.push('Consider increasing capacity or optimizing usage');
  }

  if (issues.some(issue => issue.includes('Maintenance'))) {
    recommendations.push('Schedule maintenance immediately');
  }

  if (score < 50) {
    recommendations.push('Immediate attention required - escalate to admin');
  }

  if (utilizationRate > 75 && utilizationRate <= 90) {
    recommendations.push('Monitor closely and plan for capacity expansion');
  }

  return recommendations;
};

export default {
  getComplaintTrends,
  predictResourceUsage,
  getPeakUsageTimes,
  getResolutionEfficiency,
  getResourceHealthScore
};
