export const environment = process.env.NODE_ENV;
export const port = process.env.PORT;
export const timezone = process.env.TZ;

export const database = {
  name: process.env.MONGO_DB_NAME || '',
  uri:
    process.env.MONGO_URI ||
    `mongodb://${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}`,
  options: {
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL_SIZE || '5', 10),
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL_SIZE || '10', 10),
  },
};

export const corsUrl = process.env.CORS_URL;

export const tokenInfo = {
  jwtSecret: process.env.JWT_SECRET || '',
  accessTokenValidity: parseInt(process.env.ACCESS_TOKEN_VALIDITY_SEC || '0'),
  refreshTokenValidity: parseInt(process.env.REFRESH_TOKEN_VALIDITY_SEC || '0'),
  issuer: process.env.TOKEN_ISSUER || '',
  audience: process.env.TOKEN_AUDIENCE || '',
};

export const logDirectory = process.env.LOG_DIR;

export const redis = {
  host: process.env.REDIS_HOST || '',
  port: parseInt(process.env.REDIS_PORT || '0'),
};

export const superAdminApiKey = process.env.SUPER_ADMIN_API_KEY;

export const caching = {
  contentCacheDuration: parseInt(process.env.CONTENT_CACHE_DURATION_MILLIS || '600000'),
};
