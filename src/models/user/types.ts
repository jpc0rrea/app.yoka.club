import { BillingPeriod, PlanCode } from '@lib/stripe/plans';
import { UpdateProfileFormData } from '@pages/profile';
import { Prisma, RecurrencePeriod, User } from '@prisma/client';
import { PrismaInstance } from '@server/db';

export interface CreateUserData {
  email: string;
  password: string;
  name: string;
  phoneNumber: string;
  planCode: PlanCode;
  billingPeriod: BillingPeriod;
}

export interface CreateWithoutPasswordUserData {
  email: string;
  phoneNumber: string;
  name: string;
  planCode: PlanCode;
  billingPeriod: BillingPeriod;
}

export interface FindOneByIdParams {
  userId: string;
  prismaInstance: PrismaInstance;
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
  bio: true,
  displayName: true,
  createdAt: true,
  updatedAt: true,
};

export const userWithProtectedFields =
  Prisma.validator<Prisma.UserDefaultArgs>()({
    select: selectUserProtectedFields,
  });

export type UserWithProtectedFields = Prisma.UserGetPayload<
  typeof userWithProtectedFields
>;

export interface UpdateUserSubscriptionParams {
  userId: string;
  recurrencePeriod: RecurrencePeriod;
  subscriptionId: string;
  checkInsQuantity: number;
  prismaInstance: PrismaInstance;
}

export interface UpdateUserProfileParams extends UpdateProfileFormData {
  userId: string;
}

export interface GetUserProfileByUsernameParams {
  username: string;
}

export const selectUserProfile = {
  displayName: true,
  username: true,
  bio: true,
  imageUrl: true,
  createdAt: true,
};

export const userProfile = Prisma.validator<Prisma.UserDefaultArgs>()({
  select: selectUserProfile,
});

export type UserProfile = Prisma.UserGetPayload<typeof userProfile>;

export interface UpdateProfilePictureParams {
  userId: string;
  profilePictureUrl: string;
}
