import { prisma } from "@/service/prisma";
import useAppStore from "@/store/app";

const TWO_FACTOR_KEY = process.env.NEXT_PUBLIC_2FACTOR_SECRET; // or however you’ve named it

/**
 * Sends a one‐time PIN to the given phone number via SMS using 2factor.in,
 * shows errors via toast, and returns the session ID (Details) if successful.
 */
export const sendAndStoreOTP = async (
  phone: string,
  userId: string
): Promise<string | null> => {
  const { setError, setSuccess } = useAppStore.getState();

  if (!TWO_FACTOR_KEY) {
    console.error("2FACTOR_SECRET not set");
    setError("Configuration error: cannot send OTP.");
    return null;
  }

  // Normalize to E.164 for India
  const e164 = phone.startsWith("+") ? phone : `+91${phone}`;

  // NOTE: no extra path after AUTOGEN to ensure SMS (not voice)
  const url = `https://2factor.in/API/V1/${TWO_FACTOR_KEY}/SMS/${encodeURIComponent(
    e164
  )}/AUTOGEN2`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Network error: ${res.status}`);
    }
    const body = (await res.json()) as {
      Status: string;
      Details: string;
      OTP: string;
    };

    if (body.Status === "Success" && body.Details) {
      await prisma.adminAuth.update({
        where: { adminId: userId },
        data: { otp: body.OTP },
      });

      setSuccess("OTP sent successfully via SMS");
      return body.Details;
    } else {
      throw new Error("Unexpected response");
    }
  } catch (err) {
    setError(
      err instanceof Error
        ? err.message
        : "Failed to send OTP. Please try again later."
    );
    console.error("sendAndStoreOTP error:", err);
    return null;
  }
};

export const verifyOTP = async (
  userId: string,
  otp: string
): Promise<boolean> => {
  const { setError, setSuccess } = useAppStore.getState();

  if (!otp) {
    setError("Please enter the OTP.");
    return false;
  }

  try {
    // 1) fetch the row
    const auth = await prisma.adminAuth.findUnique({
      where: { adminId: userId },
      select: { otp: true, otpExpiresAt: true },
    });

    if (!auth || !auth.otp) {
      setError("No OTP was sent to this user.");
      return false;
    }

    // 2) optional: check expiry
    if (auth.otpExpiresAt && auth.otpExpiresAt < new Date()) {
      setError("OTP has expired. Please request a new one.");
      return false;
    }

    // 3) compare
    if (auth.otp !== otp) {
      setError("Invalid OTP, please try again.");
      return false;
    }

    // 4) clear the OTP so it can’t be reused
    await prisma.adminAuth.update({
      where: { adminId: userId },
      data: { otp: null, otpExpiresAt: null },
    });

    setSuccess("OTP verified successfully!");
    return true;
  } catch (err) {
    console.error("verifyOTP error:", err);
    setError(
      err instanceof Error
        ? err.message
        : "Unable to verify OTP. Please try again."
    );
    return false;
  }
};
