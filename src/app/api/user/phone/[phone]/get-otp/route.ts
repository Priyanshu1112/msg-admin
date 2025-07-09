import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { CoinSource } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ phone: string }> }
  ) => {
    const { phone } = await params;

    const e164 = phone.startsWith("+") ? phone : `+91${phone}`;

    const user = await prisma.user.findUnique({
      where: { phone: e164 },
      include: { userAuth: true },
    });

    const url = `https://2factor.in/API/V1/${
      process.env.NEXT_PUBLIC_2FACTOR_SECRET
    }/SMS/${encodeURIComponent(e164)}/AUTOGEN`;

    const res = await fetch(url);
    const body = await res.json();

    if (!res.ok || !body.Details) {
      throw new Error("Failed to send OTP");
    }

    const otpSecret = body.Details;

    if (!user) {
      await prisma.user.create({
        data: {
          phone: e164,
          userAuth: {
            create: { otpSecret },
          },
          coinTransaction: {
            create: {
              source: CoinSource.Reward,
              amount: 200,
            },
          },
        },
      });
    } else {
      await prisma.userAuth.upsert({
        where: { userId: user.id },
        update: { otpSecret },
        create: { userId: user.id, otpSecret },
      });
    }

    return successResponse({}, "OTP sent successfully!");
  }
);
