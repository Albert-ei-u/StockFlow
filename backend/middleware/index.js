// Authentication & Authorization
export {
  protect,
  authorize,
  businessOwner,
  sameBusiness,
  optionalAuth
} from './auth.js';

// Validation
export {
  handleValidationErrors,
  validateUserRegistration,
  validateBusinessRegistration,
  validateJoinBusiness,
  validateLogin,
  validateProduct,
  validateSale,
  validateEmployee,
  validateMongoId,
  validatePagination,
  validateDateRange
} from './validation.js';

// Error Handling
export {
  errorHandler,
  asyncHandler,
  notFound
} from './errorHandler.js';

// Rate Limiting
export {
  generalLimiter,
  authLimiter,
  passwordResetLimiter,
  apiLimiter,
  uploadLimiter
} from './rateLimiter.js';

// Security
export {
  securityHeaders,
  corsOptions,
  sanitizeData,
  preventHPP,
  requestLogger,
  ipWhitelist
} from './security.js';
