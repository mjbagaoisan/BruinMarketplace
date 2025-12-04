import rateLimit from "express-rate-limit";

// Rate limiters to prevent abuse and brute-force attacks

export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: { error: "Too many requests, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Stricter limit for auth endpoints
  message: { error: "Too many authentication attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

export const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit file uploads
  message: { error: "Too many uploads, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});
