export const environment = process.env.NODE_ENV;
export const timezone = process.env.TZ;

function getEnvOrDefault(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is missing. Please set it in your .env file.`);
  }
  return value;
}

export const port = getEnvOrDefault('PORT', '8000');

export const database = {
  name: getRequiredEnv('MONGO_DB_NAME'),
  uri: getEnvOrDefault(
    'MONGO_URI',
    `mongodb://${getEnvOrDefault('MONGO_HOST', 'localhost')}:${getEnvOrDefault('MONGO_PORT', '27017')}`,
  ),
  options: {
    minPoolSize: parseInt(getEnvOrDefault('MONGO_MIN_POOL_SIZE', '5'), 10),
    maxPoolSize: parseInt(getEnvOrDefault('MONGO_MAX_POOL_SIZE', '10'), 10),
  },
};

export const corsConfig = {
  allowedOrigins: getEnvOrDefault('ALLOWED_ORIGINS', 'http://localhost:3000').split(','),
  corsUrl: process.env.CORS_URL,
};

export const tokenInfo = {
  jwtSecret: getRequiredEnv('JWT_SECRET'),
  accessTokenValidity: parseInt(getEnvOrDefault('ACCESS_TOKEN_VALIDITY_SEC', '86400')),
  refreshTokenValidity: parseInt(getEnvOrDefault('REFRESH_TOKEN_VALIDITY_SEC', '604800')),
  issuer: getRequiredEnv('TOKEN_ISSUER'),
  audience: getRequiredEnv('TOKEN_AUDIENCE'),
};

export const logDirectory = getEnvOrDefault('LOG_DIR', 'logs');

export const redis = {
  host: getEnvOrDefault('REDIS_HOST', 'localhost'),
  port: parseInt(getEnvOrDefault('REDIS_PORT', '6379')),
};

export const caching = {
  contentCacheDuration: parseInt(getEnvOrDefault('CONTENT_CACHE_DURATION_MILLIS', '600000')),
};

export const encryption = {
  secretKey: getRequiredEnv('ENCRYPTION_SECRET'),
};
