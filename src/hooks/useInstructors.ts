import { api } from '@lib/api';
import { UserRole } from '@prisma/client';
import { useQuery } from '@tanstack/react-query';

export async function getInstructors() {
  const instructorsResponse = await api.get<
    {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      imageUrl: string;
    }[]
  >('/instructors');

  return instructorsResponse.data;
}

export function useInstructors() {
  return useQuery({
    queryKey: ['instructors'],
    queryFn: getInstructors,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
    cacheTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
