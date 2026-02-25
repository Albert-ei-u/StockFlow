import AuditLog from '../models/AuditLog.js';

// Audit logging middleware
export const auditLog = (action, resource) => {
  return async (req, res, next) => {
    // Store original res.json function
    const originalJson = res.json;
    
    // Override res.json to capture response
    res.json = function(data) {
      // Create audit log entry
      const logEntry = {
        user: req.user?._id,
        action,
        resource,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        userAgent: req.get('User-Agent'),
        requestBody: req.body,
        params: req.params,
        query: req.query,
        statusCode: res.statusCode,
        response: data,
        timestamp: new Date()
      };

      // Don't log sensitive data
      if (logEntry.requestBody) {
        const { password, ...sanitizedBody } = logEntry.requestBody;
        logEntry.requestBody = sanitizedBody;
      }

      // Log asynchronously (don't block response)
      AuditLog.create(logEntry).catch(err => {
        console.error('Failed to create audit log:', err);
      });

      // Call original json function
      return originalJson.call(this, data);
    };

    next();
  };
};

// Activity logger for user actions
export const logActivity = (activity) => {
  return async (req, res, next) => {
    if (!req.user) {
      return next();
    }

    const activityLog = {
      user: req.user._id,
      business: req.user.businessId?._id,
      activity,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date(),
      details: {
        method: req.method,
        url: req.originalUrl,
        params: req.params,
        body: req.body
      }
    };

    // Log asynchronously
    console.log('Activity:', JSON.stringify(activityLog));

    next();
  };
};

// Security event logger
export const logSecurityEvent = (eventType) => {
  return async (req, res, next) => {
    const securityLog = {
      eventType,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      url: req.originalUrl,
      method: req.method,
      timestamp: new Date(),
      user: req.user?._id,
      details: {
        params: req.params,
        query: req.query,
        headers: req.headers
      }
    };

    // Log security events
    console.warn('Security Event:', JSON.stringify(securityLog));

    next();
  };
};
