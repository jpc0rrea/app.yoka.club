import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { BillingPeriod, PlanCode } from '@lib/stripe/plans';
import subscription from '@models/subscription';

interface CreateCheckoutSessionRequest extends EnsureAuthenticatedRequest {
  body: {
    billingPeriod: BillingPeriod;
    planCode: PlanCode;
  };
}

const createCheckoutSession = async (
  req: CreateCheckoutSessionRequest,
  res: NextApiResponse
) => {
  if (req.method === 'POST') {
    // check if the user already has a stripeId
    const { userId } = req;
    const { billingPeriod, planCode } = req.body;

    const sessionId = await subscription.createSubscriptionCheckoutSession({
      userId,
      planCode,
      billingPeriod,
      prismaInstance: prisma,
    });

    return res.status(200).json({
      sessionId,
    });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
};

export default ensureAuthenticated(createCheckoutSession);
