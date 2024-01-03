const setRateLimit = require("express-rate-limit");

// Rate limit middleware
const rateLimitMiddleware = setRateLimit({
  windowMs: 1000,   // increase the time window if you want to test this
  max: 5,
  message: "You have exceeded your 5 requests per seconds limit.",
  headers: true,
  legacyHeaders: false,
});

module.exports = rateLimitMiddleware;