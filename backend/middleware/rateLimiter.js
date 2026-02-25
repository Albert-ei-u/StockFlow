import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import Redis from 'ioredis';

// Create Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// General rate limiter
export const generalLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

// Strict rate limiter for auth routes
export const authLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }) : undefined,
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 auth requests per windowMs
  message: {
    success: false,
    message: 'Too many authentication attempts, please try again later.',
  },
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});

// Password reset rate limiter
export const passwordResetLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit each IP to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later.',
  },
});

// API rate limiter for data operations
export const apiLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }) : undefined,
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30, // Limit each IP to 30 API requests per minute
  message: {
    success: false,
    message: 'Too many API requests, please try again later.',
  },
});

// File upload rate limiter
export const uploadLimiter = rateLimit({
  store: process.env.NODE_ENV === 'production' ? new RedisStore({
    sendCommand: (...args) => redis.call(...args),
  }) : undefined,
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 file uploads per hour
  message: {
    success: false,
    message: 'Too many file uploads, please try again later.',
  },
});
