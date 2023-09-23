import { Adapter } from 'next-auth/adapters';
import { prisma } from '@server/db';

export default function PrismaAdapter(): Adapter {
  return {
    async createUser(user) {
      let username = user.email.split('@')[0] || user.email;

      const userWithSameUsername = await prisma.user.findUnique({
        where: {
          username,
        },
      });

      if (userWithSameUsername) {
        username = `${username}-${Math.random().toString(36).substr(2, 9)}`;
      }
      const prismaUser = await prisma.user.create({
        data: {
          name: user.name,
          displayName: user.name.split(' ')[0] || user.name,
          email: user.email,
          image: user.image,
          username,
          phoneNumber: '',
        },
      });

      await prisma.statement.create({
        data: {
          userId: prismaUser.id,
          title: 'boas vindas à plataforma :)',
          description: 'check-in inicial para experimentar a plataforma',
          type: 'CREDIT',
          checkInsQuantity: 1,
        },
      });

      return prismaUser;
    },

    async getUser(id) {
      const user = await prisma.user.findUnique({
        where: {
          id,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    },

    async getUserByEmail(email) {
      const user = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (!user) {
        return null;
      }

      return user;
    },

    async getUserByAccount({ providerAccountId, provider }) {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            providerAccountId,
            provider,
          },
        },
        include: {
          user: true,
        },
      });

      if (!account) {
        return null;
      }

      return account.user;
    },

    async updateUser(user) {
      const prismaUser = await prisma.user.update({
        where: {
          id: user.id,
        },
        data: {
          name: user.name,
          email: user.email,
          image: user.image,
        },
      });

      return prismaUser;
    },

    // async deleteUser(userId) {
    //   return;
    // },

    async linkAccount(account) {
      console.table(account);
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refreshToken: account.refresh_token,
          accessToken: account.access_token,
          expiresAt: account.expires_at,
          tokenType: account.token_type,
          scope: account.scope,
          idToken: account.id_token,
          sessionState: account.session_state,
        },
      });
    },

    // async unlinkAccount({ providerAccountId, provider }) {
    //   return;
    // },

    async createSession({ sessionToken, userId, expires }) {
      console.table({ sessionToken, userId, expires });
      await prisma.session.create({
        data: {
          sessionToken,
          userId,
          expires,
        },
      });

      return {
        sessionToken,
        userId,
        expires,
      };
    },

    async getSessionAndUser(sessionToken) {
      console.table(sessionToken);
      const session = await prisma.session.findUnique({
        where: {
          sessionToken,
        },
        include: {
          user: true,
        },
      });

      if (!session) {
        return null;
      }

      return {
        session: {
          userId: session.userId,
          expires: session.expires,
          sessionToken: session.sessionToken,
        },
        user: session.user,
      };
    },

    async updateSession({ sessionToken, userId, expires }) {
      const prismaSession = await prisma.session.update({
        where: {
          sessionToken,
        },
        data: {
          expires,
          userId,
        },
      });

      return {
        sessionToken: prismaSession.sessionToken,
        userId: prismaSession.userId,
        expires: prismaSession.expires,
      };
    },

    async deleteSession(sessionToken) {
      await prisma.session.delete({
        where: {
          sessionToken,
        },
      });
    },

    async createVerificationToken({ identifier, expires, token }) {
      const verificationToken = await prisma.verificationToken.create({
        data: {
          identifier,
          expires,
          token,
        },
      });

      return verificationToken;
    },

    async useVerificationToken({ identifier, token }) {
      const verificationToken =
        await prisma.verificationToken.findUniqueOrThrow({
          where: {
            identifier_token: {
              identifier,
              token,
            },
          },
        });

      await prisma.verificationToken.delete({
        where: {
          identifier_token: {
            identifier: verificationToken.identifier,
            token: verificationToken.token,
          },
        },
      });

      return verificationToken;
    },
  };
}
