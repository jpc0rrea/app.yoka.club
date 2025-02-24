import webserver from '@infra/webserver';

export const PLAN_CODES = ['free', 'zen', 'flow'];

export type PlanCode = 'free' | 'zen' | 'flow';

export type PlanType = 'free' | 'premium';

export type PlanId =
  | 'FREE'
  // | 'MONTHLY_8'
  // | 'MONTHLY_12'
  // | 'QUARTERLY_8'
  // | 'QUARTERLY_12'
  | 'MONTHLY'
  | 'QUARTERLY';

export const BILLING_PERIODS = ['monthly', 'quarterly'];

export type BillingPeriod = 'monthly' | 'quarterly';

interface Plan {
  id: PlanId;
  stripePriceId: string;
  billingPeriod: BillingPeriod;
  checkInsQuantity: number;
  fullPricePerBillingPeriod: number;
  pricePerMonth: number;
  name: string;
  code: PlanCode;
  type: PlanType;
}

export type PlanName = 'plano gratuito' | 'plano zen' | 'plano flow';

export const PLANS: Plan[] = [
  // PLANOS COM CHECK-INS FORAM REMOVIDOS
  // {
  //   id: 'MONTHLY_8',
  //   stripePriceId: webserver.isProduction
  //     ? 'price_1NZ06uEsKOl8ftViVB9jPE7o'
  //     : 'price_1NwU1MEsKOl8ftViuhc2l8RN',
  //   billingPeriod: 'monthly',
  //   checkInsQuantity: 8,
  //   fullPricePerBillingPeriod: 199.9,
  //   pricePerMonth: 199.9,
  //   name: 'plano gratuito',
  //   code: 'flow',
  //   type: 'premium',
  // },
  // PLANOS DE 12 CHECKINS FORAM REMOVIDOS
  // {
  //   id: 'MONTHLY_12',
  //   stripePriceId: webserver.isProduction
  //     ? 'price_1NZ06uEsKOl8ftVivK1F7BZH'
  //     : 'price_1NwU1MEsKOl8ftVivAloGOth',
  //   billingPeriod: 'monthly',
  //   checkInsQuantity: 12,
  //   fullPricePerBillingPeriod: 259.9,
  //   pricePerMonth: 259.9,
  // },
  // PLANOS DE 8 CHECKINS FORAM REMOVIDOS
  // {
  //   id: 'QUARTERLY_8',
  //   stripePriceId: webserver.isProduction
  //     ? 'price_1NZ06uEsKOl8ftVi0JRv5aKu'
  //     : 'price_1NwU1MEsKOl8ftViSjnJ9FE2',
  //   billingPeriod: 'quarterly',
  //   checkInsQuantity: 8,
  //   fullPricePerBillingPeriod: 499.7,
  //   pricePerMonth: 166.57,
  //   name: 'plano flow',
  //   code: 'flow',
  //   type: 'premium',
  // },
  // PLANOS DE 12 CHECKINS FORAM REMOVIDOS
  // {
  //   id: 'QUARTERLY_12',
  //   stripePriceId: webserver.isProduction
  //     ? 'price_1NZ06uEsKOl8ftVi9AGDDwvB'
  //     : 'price_1Nz25TEsKOl8ftViAvnpeLlB',
  //   billingPeriod: 'quarterly',
  //   checkInsQuantity: 12,
  //   fullPricePerBillingPeriod: 649.7,
  //   pricePerMonth: 216.57,
  // },
  {
    id: 'MONTHLY',
    stripePriceId: webserver.isProduction
      ? 'price_1QvoI0Ak5STM82fxv4TTnzfP'
      : 'price_1QvpEgAk5STM82fx1tnIAcm7',
    billingPeriod: 'monthly',
    checkInsQuantity: 0,
    fullPricePerBillingPeriod: 89.9,
    pricePerMonth: 89.9,
    name: 'plano zen',
    code: 'zen',
    type: 'premium',
  },
  {
    id: 'QUARTERLY',
    stripePriceId: webserver.isProduction
      ? 'price_1QvoI0Ak5STM82fxkvjafAmG'
      : 'price_1QvpEgAk5STM82fxAQsD5AFn',
    billingPeriod: 'quarterly',
    checkInsQuantity: 0,
    fullPricePerBillingPeriod: 179.7,
    pricePerMonth: 59.9,
    name: 'plano zen',
    code: 'zen',
    type: 'premium',
  },
];
