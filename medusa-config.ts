import { loadEnv, defineConfig } from '@medusajs/framework/utils';
import { Modules, ContainerRegistrationKeys } from '@medusajs/framework/utils';
import { channel } from 'diagnostics_channel';

loadEnv(process.env.NODE_ENV || 'development', process.cwd());

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    // thêm databaseDriverOptions để hỗ trợ SSL khi connect Supabase
    databaseDriverOptions: {
      ssl: {
        // ở dev, nếu gặp lỗi chứng chỉ, rejectUnauthorized: false sẽ giúp connect.
        // (Không khuyến khích dùng trong production — ở production nên verify cert)
        rejectUnauthorized: false,
      },
    },
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || 'supersecret',
      cookieSecret: process.env.COOKIE_SECRET || 'supersecret',
    },
  },
  modules: [
    {
      resolve: './src/modules/blog',
    },
    {
      resolve: './src/modules/brand',
    },
    {
      resolve: './src/modules/cms',
      options: {
        apiKey: process.env.CMS_API_KEY,
      },
    },
    {
      resolve: '@medusajs/medusa/auth',
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          {
            resolve: '@medusajs/medusa/auth-emailpass',
            id: 'emailpass',
            options: {
              // hashConfig nếu bạn muốn tùy chỉnh
            },
          },
        ],
      },
    },
    {
      resolve: '@medusajs/medusa/notification',
      options: {
        providers: [
          // ... thêm các provider bạn muốn sử dụng
          {
            resolve: '@medusajs/medusa/notification-local',
            id: 'local',
            options: {
              channels: ['email'],
            },
          },
        ],
      },
    },
  ],
});
