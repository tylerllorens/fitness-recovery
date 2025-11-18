import rateLimit from "express-rate-limit";

// General limiter: limits all requests
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // Max 200 requests per IP per 15 min
  standardHeaders: true, // Return rate limit info in RateLimit-* headers
  legacyHeaders: false, // Disable X-RateLimit-* headers
});

// Stricter limiter: good for login / auth routes
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Only 10 login attempts per 15 min per IP
  message: {
    error: "Too many login attempts, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
