import ensureAuthenticated, {
  EnsureAuthenticatedRequest,
} from '@server/middlewares/ensureAuthenticated';
import { NextApiResponse } from 'next';
import { prisma } from '@server/db';
import { stripe } from '@lib/stripe';
import { PLANS } from '@lib/stripe/plans';

interface CreateCheckoutSessionRequest extends EnsureAuthenticatedRequest {
  body: {
    billingPeriod: 'monthly' | 'quarterly';
    checkInsQuantity: number;
  };
}

const createCheckoutSession = async (
  req: CreateCheckoutSessionRequest,
  res: NextApiResponse
) => {
  if (req.method === 'POST') {
    // check if the user already has a stripeId
    const { userId } = req;
    const { billingPeriod, checkInsQuantity } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: userId,
      },
      select: {
        stripeId: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: 'usuário não registrado',
        errorCode: 'user-not-found',
      });
    }

    const { stripeId } = user;

    let customerId = stripeId || '';

    if (!stripeId) {
      // se ele não tiver stripeId, eu vou criar
      const stripeCustomer = await stripe.customers.create({
        email: user.email,
        name: user.name,
        metadata: {
          userId,
        },
      });

      customerId = stripeCustomer.id;

      // atualizar o stripeId do user no banco
      await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          stripeId: customerId,
        },
      });
    }

    const priceId =
      PLANS.find(
        (plan) =>
          plan.billingPeriod === billingPeriod &&
          plan.checkInsQuantity === checkInsQuantity
      )?.stripePriceId || '';

    if (!priceId) {
      return res.status(400).json({
        message: 'plano não encontrado',
        errorCode: 'plan-not-found',
      });
    }

    const stripeCheckoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      billing_address_collection: 'auto',
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      allow_promotion_codes: true,
      success_url: process.env.STRIPE_SUCCESS_URL,
      cancel_url: process.env.STRIPE_CANCEL_URL,
    });

    return res.status(200).json({
      sessionId: stripeCheckoutSession.id,
    });
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method not allowed');
  }
};

export default ensureAuthenticated(createCheckoutSession);
