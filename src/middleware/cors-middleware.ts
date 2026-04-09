// src/middleware/cors.ts
import cors, { CorsOptions } from 'cors';

const allowedOrigins: string[] = process.env.ALLOWED_ORIGINS?.split(',') || [];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow server-to-server or mobile app requests with no origin
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },

  credentials: true, // Enable cookies/auth headers
};
