import { User } from '@prisma/client';

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
