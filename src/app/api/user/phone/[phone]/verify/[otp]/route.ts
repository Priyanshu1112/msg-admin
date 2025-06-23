// Modified OTP verification route using 2Factor API with session ID tracking

import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { generateTokenPair } from "@/utils/tokens";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ phone: string; otp: string }> }
  ) => {
    const { phone, otp } = await params;

    const e164 = phone.startsWith("+") ? phone : `+91${phone}`;

    const user = await prisma.user.findUnique({
      where: { phone: e164 },
      include: { userAuth: true },
    });

    if (!user || !user.userAuth?.otpSecret) {
      return CustomError("No OTP session found for this user", 400);
    }

    const sessionId = user.userAuth.otpSecret;
    const apiKey = process.env.NEXT_PUBLIC_2FACTOR_SECRET;

    const url = `https://2factor.in/API/V1/${apiKey}/SMS/VERIFY/${sessionId}/${otp}`;

    const res = await fetch(url);
    const body = await res.json();

    if (body.Status !== "Success") {
      return CustomError(body.Details || "Invalid OTP", 401);
    }

    const { accessToken, refreshToken } = await generateTokenPair(user);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { updatedAt, createdAt, userAuth, ...cleanUser } = user;

    return successResponse(
      { ...cleanUser, accessToken, refreshToken },
      "OTP verified successfully"
    );
  }
);
