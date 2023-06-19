declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production';

      // SendGrid
      SENDGRID_API_KEY: string;

      // Prisma
      DATABASE_URL: string;
      SHADOW_DATABASE_URL: string;

      // NextAuth
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {};
