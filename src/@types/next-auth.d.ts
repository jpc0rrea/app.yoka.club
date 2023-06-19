import { Account } from "@prisma/client";
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
  }

  interface Session {
    user: User & { accounts: Account[] };
  }
}