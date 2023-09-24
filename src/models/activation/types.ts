import { User } from '@prisma/client';

export interface CreateAndSendActivationEmailParams {
  user: User;
}

export interface CreateActivationTokenParams {
  user: User;
}

export interface SendEmailToUserParams {
  user: User;
  tokenId: string;
}

export interface ActivateUserUsingTokenIdParams {
  tokenId: string;
}

export interface ActivateUserByUserIdParams {
  userId: string;
}
