// lib/otp.js
import { prisma } from "@/service/prisma";
import { authenticator } from "otplib";
// import { setUserOtpSecret, getUserOtpSecret, clearUserOtpSecret } from "./db";

// generate and persist a new secret
export async function createAndStoreSecret(userId: string) {
  const secret = authenticator.generateSecret();
  await setUserOtpSecret(userId, secret, 300 /* ttlSeconds= */);
  return secret;
}

// send user’s TOTP code
export function generateOTP(secret: string) {
  return authenticator.generate(secret);
}

// verify code
export async function verifyOtp(adminId: string, otp: string) {
  const adminAuth = await prisma.adminAuth.findUnique({
    where: { adminId: adminId },
  });

  if (!adminAuth) return null;

  // Check if OTP exists and is valid
  if (
    adminAuth.otp === otp &&
    new Date(adminAuth.otpExpiresAt ?? 0) > new Date()
  ) {
    // OTP is valid
    // Clear OTP after successful verification
    await prisma.adminAuth.update({
      where: { adminId: adminId },
      data: { otp: null, otpExpiresAt: null },
    });

    return true;
  } else {
    // OTP is invalid or expired
    return false;
  }
}

async function setUserOtpSecret(
  adminId: string,
  secret: string,
  ttlSeconds: number,
) {
  const otp = authenticator.generate(secret); // Generate OTP using user-specific ID
  const ttl = new Date(Date.now() + ttlSeconds * 1000); // TTL in milliseconds

  await prisma.adminAuth.update({
    where: { adminId: adminId },
    data: {
      otp: otp,
      otpExpiresAt: ttl,
    },
  });

  return otp;
}
