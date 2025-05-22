// types/next-auth.d.ts

import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string;
      name: string;
      phone: string;
    } & DefaultSession["user"]; // Ensure it extends the default user properties
  }

  interface User extends DefaultUser {
    id: string;
    name: string;
    phone: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    name: string;
    phone: string;
  }
}
