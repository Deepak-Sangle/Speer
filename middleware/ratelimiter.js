const setRateLimit = require("express-rate-limit");

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 1000,
  max: 20,
  message: "You have exceeded your 20 requests per seconds limit.",
  headers: true,
  legacyHeaders: false,
});

module.exports = rateLimitMiddleware;