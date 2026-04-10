import cors, { CorsOptions } from 'cors';
import { corsConfig } from '../config';

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin) {
      // Allow server-to-server or mobile app requests with no origin
      return callback(null, true);
    }

    if (corsConfig.allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Enable cookies/auth headers
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept-Language'],
};
