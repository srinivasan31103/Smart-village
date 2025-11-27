/**
 * Advanced search and filter helper
 * Supports: text search, date ranges, multi-field filters, sorting, pagination
 */

export const buildSearchQuery = (filters = {}) => {
  const query = {};

  // Text search (searches multiple fields)
  if (filters.search) {
    query.$or = [
      { title: { $regex: filters.search, $options: 'i' } },
      { description: { $regex: filters.search, $options: 'i' } },
      { 'location.address': { $regex: filters.search, $options: 'i' } }
    ];
  }

  // Category filter
  if (filters.category) {
    query.category = filters.category;
  }

  // Status filter (supports multiple statuses)
  if (filters.status) {
    if (Array.isArray(filters.status)) {
      query.status = { $in: filters.status };
    } else {
      query.status = filters.status;
    }
  }

  // Priority filter
  if (filters.priority) {
    if (Array.isArray(filters.priority)) {
      query.priority = { $in: filters.priority };
    } else {
      query.priority = filters.priority;
    }
  }

  // Date range filter
  if (filters.startDate || filters.endDate) {
    query.createdAt = {};
    if (filters.startDate) {
      query.createdAt.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.createdAt.$lte = new Date(filters.endDate);
    }
  }

  // User filter (for complaints by specific user)
  if (filters.userId) {
    query.reportedBy = filters.userId;
  }

  // Assigned to filter
  if (filters.assignedTo) {
    query.assignedTo = filters.assignedTo;
  }

  // Location-based filter (geo-spatial search)
  if (filters.longitude && filters.latitude && filters.radius) {
    query.location = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [parseFloat(filters.longitude), parseFloat(filters.latitude)]
        },
        $maxDistance: parseInt(filters.radius) * 1000 // Convert km to meters
      }
    };
  }

  return query;
};

export const buildSortOptions = (sortBy = 'createdAt', sortOrder = 'desc') => {
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;
  return sortOptions;
};

export const getPaginationOptions = (page = 1, limit = 10) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  return {
    skip: (pageNum - 1) * limitNum,
    limit: limitNum
  };
};

// Export data to CSV format
export const exportToCSV = (data, fields) => {
  if (!data || data.length === 0) {
    return '';
  }

  // Create headers
  const headers = fields.join(',');

  // Create rows
  const rows = data.map(item => {
    return fields.map(field => {
      const value = getNestedValue(item, field);
      // Escape commas and quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value || '';
    }).join(',');
  });

  return headers + '\n' + rows.join('\n');
};

// Helper to get nested object values
const getNestedValue = (obj, path) => {
  return path.split('.').reduce((current, prop) => {
    return current && current[prop] !== undefined ? current[prop] : '';
  }, obj);
};

// Advanced filter for resources
export const buildResourceQuery = (filters = {}) => {
  const query = {};

  if (filters.type) {
    query.type = filters.type;
  }

  if (filters.status) {
    query.status = filters.status;
  }

  // Utilization rate filter
  if (filters.minUtilization || filters.maxUtilization) {
    // This requires aggregation pipeline
    query.$expr = {};
    if (filters.minUtilization) {
      query.$expr.$gte = [
        { $divide: ['$currentUsage.value', '$capacity.value'] },
        parseFloat(filters.minUtilization) / 100
      ];
    }
    if (filters.maxUtilization) {
      query.$expr.$lte = [
        { $divide: ['$currentUsage.value', '$capacity.value'] },
        parseFloat(filters.maxUtilization) / 100
      ];
    }
  }

  return query;
};

export default {
  buildSearchQuery,
  buildSortOptions,
  getPaginationOptions,
  exportToCSV,
  buildResourceQuery
};
