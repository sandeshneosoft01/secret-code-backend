import { rateLimit } from 'express-rate-limit';

/**
 * Basic rate limiter for API requests.
 * Allows 100 requests per 15 minutes per IP.
 */
export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res, _next, options) => {
    res.status(options.statusCode).json({
      success: false,
      // @ts-ignore - req.t is added by i18next-http-middleware
      message: req.t ? req.t('TOO_MANY_REQUESTS') : options.message.message,
    });
  },
});
