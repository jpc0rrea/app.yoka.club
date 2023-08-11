/* eslint-disable @typescript-eslint/no-explicit-any */
// import { api } from '@lib/api';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
} from 'next';
import { getServerSession } from 'next-auth';
import { authOptions } from 'pages/api/auth/[...nextauth]';

export function withSSREnsureSubscribed<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>
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

    return fn(ctx);
  };
}
