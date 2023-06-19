import NextAuth, { type NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
// Prisma adapter for NextAuth, optional and can be removed

import { env } from '../../../env/server.mjs';
import { prisma } from '@server/db';
import { BcryptHashAdapter } from '@lib/hash/BcryptHashAdapter';
import PrismaAdapter from '@lib/auth/prisma-adapter';
// import { PrismaAdapter } from '@next-auth/prisma-adapter';

export const authOptions: NextAuthOptions = {
  // Include user.id on session
  callbacks: {
    async session({ session }) {
      console.log('SESSION');
      console.log(session);

      const user = await prisma.user.findUnique({
        where: {
          email: session.user?.email || '',
        },
        include: {
          accounts: true,
        },
      });

      if (!user) {
        return session;
      }

      return {
        ...session,
        user: {
          id: user.id,
          name: user.displayName,
          displayName: user.displayName,
          image: user.image,
          email: user.email,
          username: user.username,
          emailVerified: user.emailVerified,
          accounts: user.accounts,
        },
      };
    },

    async signIn({ account, user }) {
      if (
        account?.provider === 'google' &&
        !account?.scope?.includes('https://www.googleapis.com/auth/calendar')
      ) {
        return '/register?error=calendar-permission';
      }

      console.log('SIGN IN');
      console.log(account);

      console.log('user');
      console.table(user);

      return true;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
    newUser: '/register',
  },

  // jwt: {
  //   maxAge: 30 * 24 * 60 * 60, // 30 days
  // },
  // Configure one or more authentication providers
  // adapter: PrismaAdapter(prisma),
  adapter: PrismaAdapter(),
  providers: [
    GoogleProvider({
      clientId: env.GOOGLE_CLIENT_ID,
      clientSecret: env.GOOGLE_CLIENT_SECRET,
      authorization: {
        params: {
          scope:
            'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/calendar',
        },
      },
    }),

    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'e-mail', type: 'text', placeholder: 'e-mail' },
        password: { label: 'senha', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials || !credentials?.email || !credentials?.password) {
          throw new Error('invalid-input');
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email,
          },
        });

        if (!user) {
          throw new Error('invalid-credentials');
        }

        if (!user.password) {
          throw new Error('invalid-login-method');
        }

        const bcryptHashAdapter = new BcryptHashAdapter();

        const passwordMatch = await bcryptHashAdapter.compareHash(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          console.log('password dont match');
          throw new Error('invalid-credentials');
        }

        return user;
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' },
};

export default NextAuth(authOptions);
