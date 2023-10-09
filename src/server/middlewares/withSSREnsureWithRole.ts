/* eslint-disable @typescript-eslint/no-explicit-any */
// import { api } from '@lib/api';
import session from '@models/session';
import user from '@models/user';
import { prisma } from '@server/db';
import { UserRole } from '@prisma/client';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
} from 'next';

export function withSSREnsureWithRole<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>,
  allowedRoles: UserRole[]
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const sessionObject = await session.findOneValidFromRequest({
      req: ctx.req as NextApiRequest,
    });

    if (!sessionObject) {
      return {
        redirect: {
          destination: '/login?error=not-logged-in',
          permanent: false,
        },
      };
    }

    const userObject = await user.findOneById({
      userId: sessionObject.userId,
      prismaInstance: prisma,
    });

    if (!allowedRoles.includes(userObject.role)) {
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
