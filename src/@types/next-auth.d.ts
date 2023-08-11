import { Account } from "@prisma/client";
import { UserRole } from '@prisma/client';
import NextAuth from "next-auth";

declare module 'next-auth' {
  interface User {
    id: string;
    name: string;
    displayName: string;
    email: string;
    emailVerified: Date | null;
    image: string | null;
    username: string;
    role: UserRole;
    checkInsQuantity: number;
  }

  interface Session {
    user: User & { accounts: Account[] };
  }
}