import { api } from '@lib/api';
import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export async function getUsers() {
  const { data } = await api.get<{ users: User[] }>('/admin/users');

  return data.users;
}

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsers,
  });
}
