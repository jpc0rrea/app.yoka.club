/* eslint-disable @typescript-eslint/no-explicit-any */
// import { api } from '@lib/api';
import { UserRole } from '@prisma/client';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export function withSSREnsureWithRole<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>,
  allowedRoles: UserRole[]
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const session = await getServerSession(ctx.req, ctx.res, authOptions);

    if (!session || !session.user) {
      return {
        redirect: {
          destination: '/login?error=not-logged-in',
          permanent: false,
        },
      };
    }

    if (!allowedRoles.includes(session.user.role)) {
      return {
        redirect: {
          destination: '/?error=not-allowed',
          permanent: false,
        },
      };
    }

    return fn(ctx);
  };
}
