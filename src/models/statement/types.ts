export interface FindAllCreditsByUserIdParams {
  userId: string;
}

export interface AddCreditsParams {
  userId: string;
  amount: number;
  title: string;
  description: string;
  paymentId?: string;
}
