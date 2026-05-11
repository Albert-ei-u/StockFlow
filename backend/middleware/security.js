import helmet from 'helmet';
import cors from 'cors';
import xss from 'xss';
import hpp from 'hpp';

// Custom MongoDB injection protection
export const sanitizeData = (req, res, next) => {
  const sanitize = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(sanitize);
    }
    
    const sanitized = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        // Remove MongoDB operators
        if (key.startsWith('$')) {
          continue;
        }
        sanitized[key] = sanitize(obj[key]);
      }
    }
    return sanitized;
  };

  // Sanitize request body, query, and params
  if (req.body) {
    req.body = sanitize(req.body);
  }
  if (req.query) {
    req.query = sanitize(req.query);
  }
  if (req.params) {
    req.params = sanitize(req.params);
  }

  next();
};

// Security headers
export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
});

// CORS configuration
export const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = process.env.ALLOWED_ORIGINS 
      ? process.env.ALLOWED_ORIGINS.split(',')
      : ['http://localhost:3000', 'http://localhost:5173'];
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

// HTTP parameter pollution protection
export const preventHPP = hpp({
  whitelist: ['sort', 'fields', 'page', 'limit'],
});

// Request logging
export const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const log = `${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms - ${req.ip}`;
    
    if (process.env.NODE_ENV === 'development') {
      console.log(log);
    }
  });
  
  next();
};

// IP whitelist for admin routes
export const ipWhitelist = (req, res, next) => {
  const allowedIPs = process.env.ALLOWED_IPS 
    ? process.env.ALLOWED_IPS.split(',')
    : ['127.0.0.1', '::1'];
  
  if (!allowedIPs.includes(req.ip) && !allowedIPs.includes(req.connection.remoteAddress)) {
    return res.status(403).json({
      success: false,
      message: 'Access denied from this IP address'
    });
  }
  
  next();
};
