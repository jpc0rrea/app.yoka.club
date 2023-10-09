import { api } from '@lib/api';
import { Payment, RecurrencePeriod } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export async function getPayments() {
  const { data } = await api.get<{
    payments: (Payment & {
      plan: {
        recurrencePeriod: RecurrencePeriod;
      } | null;
    })[];
  }>('/payments');

  return data.payments;
}

export function usePayments() {
  return useQuery({
    queryKey: ['payments'],
    queryFn: getPayments,
  });
}
