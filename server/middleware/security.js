// Custom security middleware: lightweight rate limiter and CORS controls
const rateLimitCache = new Map();

/**
 * Custom memory-based rate limiter middleware.
 * Prevents DDoS and brute-force attacks.
 */
export const rateLimiter = (options = {}) => {
  const windowMs = options.windowMs || 60 * 1000; // Default: 1 minute
  const max = options.max || 100; // Limit each IP to 100 requests per window
  const message = options.message || { message: "Too many requests, please try again later." };

  // Cleanup cache periodically to avoid memory leak (every 10 minutes)
  setInterval(() => {
    const now = Date.now();
    for (const [ip, data] of rateLimitCache.entries()) {
      if (now > data.resetTime) {
        rateLimitCache.delete(ip);
      }
    }
  }, 10 * 60 * 1000).unref(); // Use .unref() to not block Node shutdown

  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"] || req.socket.remoteAddress;
    const now = Date.now();

    if (!rateLimitCache.has(ip)) {
      rateLimitCache.set(ip, {
        resetTime: now + windowMs,
        count: 1
      });
      return next();
    }

    const rateData = rateLimitCache.get(ip);

    if (now > rateData.resetTime) {
      // Reset window
      rateData.resetTime = now + windowMs;
      rateData.count = 1;
      return next();
    }

    rateData.count++;
    if (rateData.count > max) {
      res.setHeader("Retry-After", Math.ceil((rateData.resetTime - now) / 1000));
      return res.status(429).json(message);
    }

    next();
  };
};

/**
 * Configure secure CORS rules.
 */
export const getCorsOptions = () => {
  const allowedOrigins = process.env.ALLOWED_ORIGINS 
    ? process.env.ALLOWED_ORIGINS.split(",") 
    : ["http://localhost:5173", "http://localhost:8080", "http://localhost:3000", "http://localhost:8085"];

  return {
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Check origin
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        console.warn(`[SECURITY] Request rejected by CORS. Origin: ${origin}`);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    optionsSuccessStatus: 200
  };
};
