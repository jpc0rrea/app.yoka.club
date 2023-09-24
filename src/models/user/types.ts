import { Prisma, User } from '@prisma/client';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
}

export interface FindOneByIdParams {
  userId: string;
}

export interface FindOneByEmailParams {
  email: string;
}

export interface CleanUserToFrontendParams {
  user: User;
}

export const selectUserProtectedFields = {
  id: true,
  email: true,
  name: true,
  phoneNumber: true,
  username: true,
  displayName: true,
  createdAt: true,
  updatedAt: true,
};

export const userWithProtectedFields =
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: selectUserProtectedFields,
  });

export type UserWithProtectedFields = Prisma.EventGetPayload<
  typeof userWithProtectedFields
>;
