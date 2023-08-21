import { api } from '@lib/api';
import { Statement } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export async function getStatement() {
  const { data } = await api.get<{ statement: Statement[] }>('/statement');

  return data.statement;
}

export function useStatement() {
  return useQuery({
    queryKey: ['statement'],
    queryFn: getStatement,
  });
}
