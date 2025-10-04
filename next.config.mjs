// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
const validateEnv = async () => {
  if (!process.env.SKIP_ENV_VALIDATION) {
    await import('./src/env/server.mjs');
  }
};

// Invoke the async function immediately
validateEnv();

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    remotePatterns: [{
      protocol: 'https',
      hostname: 'i.ytimg.com',
    }, {
      protocol: 'https',
      hostname: 'img.youtube.com',
    }, {
      protocol: 'https',
      hostname: 'lriy63ibgf.ufs.sh',
    }, {
      protocol: 'https',
      hostname: 'utfs.io',
    }, {
      protocol: 'https',
      hostname: 'uploadthing.com',
    }, {
      protocol: 'https',
      hostname: 'www.youtube.com',
    }, {
      protocol: 'https',
      hostname: 'img.youtube.com',
    }],
  },
  async headers() {
    return [
      {
        // matching all API routes
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
          },
        ],
      },
    ];
  },
};
export default config;
