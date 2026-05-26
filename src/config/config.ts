/* eslint-disable no-restricted-syntax */
const isDevelopmentEnv = (): boolean => {
  const env = process.env.NODE_ENV
  return !env || ['development', 'localhost', 'local', 'dev'].includes(env)
}

const useLocalDatabaseFallback = (): boolean => {
  const host = process.env.DB_HOST || ''
  const allowedHost = 'proxy.rlwy.net'

  let normalizedHost = host.trim().toLowerCase()
  try {
    if (normalizedHost.includes('://')) {
      normalizedHost = new URL(normalizedHost).hostname.toLowerCase()
    } else {
      normalizedHost = normalizedHost.split('/')[0].split(':')[0]
    }
  } catch (_error) {
    normalizedHost = ''
  }

  normalizedHost = normalizedHost.replace(/\.$/, '')
  const isAllowedHost =
    normalizedHost === allowedHost ||
    normalizedHost.endsWith(`.${allowedHost}`)

  return isDevelopmentEnv() && (!normalizedHost || isAllowedHost)
}

export default () => ({
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3008,

  app: {
    name: process.env.APP_NAME || "St. Brian's Model College",
    slug: process.env.APP_SLUG,
    logo_url: process.env.LOGO_URL,
  },

  database: {
    host: useLocalDatabaseFallback() ? 'localhost' : process.env.DB_HOST,
    port: useLocalDatabaseFallback()
      ? 5433
      : parseInt(process.env.DB_PORT, 10),
    user: useLocalDatabaseFallback() ? 'postgres' : process.env.DB_USER,
    pass: useLocalDatabaseFallback() ? 'postgres' : process.env.DB_PASS,
    name: useLocalDatabaseFallback()
      ? 'school_portal_dev'
      : process.env.DB_NAME,
    ssl: useLocalDatabaseFallback() ? false : process.env.DB_SSL === 'true',
  },

  mail: {
    mailer: process.env.MAIL_MAILER,
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT, 10),
    username: process.env.MAIL_USERNAME,
    password: process.env.MAIL_PASSWORD,
    encryption: process.env.MAIL_ENCRYPTION,
    from: {
      address: process.env.MAIL_FROM_ADDRESS,
      name: process.env.MAIL_FROM_NAME,
    },
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessDuration: process.env.TOKEN_ACCESS_DURATION,
    refreshDuration: process.env.TOKEN_REFRESH_DURATION,
  },

  logger: {
    legLevel: process.env.LOG_LEVEL || 'info',
  },

  paystack: {
    url: process.env.PAYSTACK_URL,
    key: process.env.PAYSTACK_KEY,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  frontend: {
    url: process.env.FRONTEND_URL,
    superadmin_login_url: process.env.SUPERADMIN_LOGIN_URL,
  },
  google: {
    clientId: process.env.GOOGLE_CLIENT_ID,
  },
  school: {
    name: process.env.SCHOOL_NAME,
    logoUrl: process.env.SCHOOL_LOGO_URL,
  },

  invite: {
    expiry: process.env.INVITE_EXPIRATION_DAYS || '7',
  },

  isTest(): boolean {
    return process.env.NODE_ENV === 'test';
  },

  isDev(): boolean {
    const env = process.env.NODE_ENV;
    const envs = ['development', 'localhost', 'local', 'dev'];
    return !env || envs.includes(env);
  },
  isStaging(): boolean {
    return process.env.NODE_ENV === 'staging';
  },
  isProduction(): boolean {
    return process.env.NODE_ENV === 'production';
  },
  hash: {
    salt: process.env.HASH_SALT || '10',
  },
});
