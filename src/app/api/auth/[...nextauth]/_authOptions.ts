import CredentialsProvider from "next-auth/providers/credentials";
import { JWT } from "next-auth/jwt";
import { AuthOptions, Session, User } from "next-auth";

import { createAndStoreSecret, generateOTP, verifyOtp } from "@/utils/otp";
import { sendSms } from "@/utils/sms";
import { prisma } from "@/service/prisma";
import bcrypt from "bcryptjs";

export const authOptions: AuthOptions = {
  session: { strategy: "jwt" },
  providers: [
    CredentialsProvider({
      name: "Credentials + OTP",
      credentials: {
        username: { label: "Username" },
        password: { label: "Password", type: "password" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(
        credentials:
          | Record<"username" | "password" | "otp", string>
          | undefined,
      ) {
        if (!credentials) {
          throw new Error("Missing credentials");
        }

        const { username, password, otp } = credentials;

        const user = await prisma.admin.findUnique({
          where: { username },
          select: {
            id: true,
            fullName: true,
            phone: true,
            email: true,
            adminAuth: { select: { password: true } },
          },
        });
        if (!user) throw new Error("Invalid username!");

        // 1️⃣ OTP step:
        if (otp != "undefined") {
          const valid = await verifyOtp(user.id, otp);
          if (!valid) throw new Error("Invalid OTP");
          // ✔️ OTP ok → return user to finish sign‑in
          return {
            id: user.id,
            name: user.fullName,
            phone: user.phone,
            email: user.email,
          };
        }

        // 2️⃣ First factor: username + password
        const pwOk = await bcrypt.compare(
          password,
          user.adminAuth?.password ?? "",
        );
        if (!pwOk) throw new Error("Invalid credentials!");

        // Generate & SMS OTP, then tell client we need OTP
        const secret = await createAndStoreSecret(user.id);
        const code = generateOTP(secret);

        await sendSms(user.phone, `Your login code is ${code}`);

        // signal client to show OTP form
        throw new Error(`OTP_REQUIRED:${user.phone.slice(-4)}`);
      },
    }),
  ],

  // point to our own signin page
  pages: { signIn: "/login", error: "/login", signOut: "/login" },

  callbacks: {
    // include any user props in the JWT
    async jwt({ token, user }: { token: JWT; user?: User }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.phone = user.phone;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      session.user = {
        id: token.id as string,
        name: token.name as string,
        phone: token.phone as string,
        email: token.email as string,
      };
      return session;
    },
  },
};
