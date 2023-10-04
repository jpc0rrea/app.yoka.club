import webserver from '@infra/webserver';

export const PLANS = [
  {
    id: 'MONTHLY_8',
    stripePriceId: webserver.isProduction
      ? 'price_1NZ06uEsKOl8ftViVB9jPE7o'
      : 'price_1NwU1MEsKOl8ftViuhc2l8RN',
    billingPeriod: 'monthly',
    checkInsQuantity: 8,
    fullPricePerBillingPeriod: 199.9,
    pricePerMonth: 199.9,
  },
  {
    id: 'MONTHLY_12',
    stripePriceId: webserver.isProduction
      ? 'price_1NZ06uEsKOl8ftVivK1F7BZH'
      : 'price_1NwU1MEsKOl8ftVivAloGOth',
    billingPeriod: 'monthly',
    checkInsQuantity: 12,
    fullPricePerBillingPeriod: 259.9,
    pricePerMonth: 259.9,
  },
  {
    id: 'QUARTERLY_8',
    stripePriceId: webserver.isProduction
      ? 'price_1NZ06uEsKOl8ftVi0JRv5aKu'
      : 'price_1NwU1MEsKOl8ftViSjnJ9FE2',
    billingPeriod: 'quarterly',
    checkInsQuantity: 8,
    fullPricePerBillingPeriod: 499.7,
    pricePerMonth: 166.57,
  },
  {
    id: 'QUARTERLY_12',
    stripePriceId: webserver.isProduction
      ? 'price_1NZ06uEsKOl8ftVi9AGDDwvB'
      : 'price_1NwU1MEsKOl8ftViFSld3EUV',
    billingPeriod: 'quarterly',
    checkInsQuantity: 12,
    fullPricePerBillingPeriod: 649.7,
    pricePerMonth: 216.57,
  },
];
