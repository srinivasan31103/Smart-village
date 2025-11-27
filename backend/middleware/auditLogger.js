import AuditLog from '../models/AuditLog.js';

export const createAuditLog = async (req, action, resourceType, resourceId, description, metadata = {}) => {
  try {
    if (!req.user) {
      return;
    }

    await AuditLog.create({
      user: req.user._id,
      action,
      resourceType,
      resourceId,
      description,
      metadata,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent')
    });
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw error to prevent disrupting main operations
  }
};

// Middleware to automatically log actions
export const auditLog = (action, resourceType, getDescription) => {
  return async (req, res, next) => {
    // Store original res.json
    const originalJson = res.json.bind(res);

    // Override res.json
    res.json = function(data) {
      // Log the action
      if (req.user && data.success !== false) {
        const description = typeof getDescription === 'function'
          ? getDescription(req, data)
          : getDescription;

        const resourceId = data.user?._id || data.complaint?._id || data.resource?._id || req.params.id;

        createAuditLog(
          req,
          action,
          resourceType,
          resourceId,
          description,
          {
            method: req.method,
            path: req.path,
            body: req.body,
            params: req.params
          }
        ).catch(err => console.error('Audit log error:', err));
      }

      // Call original json method
      return originalJson(data);
    };

    next();
  };
};

export default {
  createAuditLog,
  auditLog
};
