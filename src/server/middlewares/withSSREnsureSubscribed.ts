/* eslint-disable @typescript-eslint/no-explicit-any */
import session from '@models/session';
import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult,
  NextApiRequest,
} from 'next';

export function withSSREnsureSubscribed<P extends { [key: string]: any }>(
  fn: GetServerSideProps<P>
) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    try {
      await session.findOneValidFromRequest({
        req: ctx.req as NextApiRequest,
      });

      return fn(ctx);
    } catch (err) {
      console.error(err);

      if (ctx.req.url === '/') {
        return {
          redirect: {
            destination: '/login',
            permanent: false,
          },
        };
      }

      return {
        redirect: {
          destination: '/login?error=not-logged-in',
          permanent: false,
        },
      };
    }
  };
}
