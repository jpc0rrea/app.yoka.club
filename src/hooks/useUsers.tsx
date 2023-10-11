import { api } from '@lib/api';
import { User } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';
import { UserProfile } from '@models/user/types';

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

interface GetUserProfileParams {
  username: string;
}

export async function getUserProfile({ username }: GetUserProfileParams) {
  const { data } = await api.get<{ user: UserProfile }>(
    `/users/profile?username=${username}`
  );

  return data.user;
}

export function useUserProfile({ username }: GetUserProfileParams) {
  return useQuery({
    queryKey: ['user-profile', username],
    queryFn: () => getUserProfile({ username }),
    enabled: !!username,
  });
}
