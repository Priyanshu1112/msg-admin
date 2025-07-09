import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { successResponse, CustomError } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const body = await req.json();
    const userId = (await params).id;

    const { name, streamId, year, referralCode } = body;

    // Ensure the user exists before trying to update
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return CustomError("User not found", 404);
    }

    // If referral code is provided, validate it
    let referredById: string | undefined;
    if (referralCode) {
      const referredUser = await prisma.user.findUnique({
        where: { referralCode },
      });

      if (!referredUser) {
        return CustomError(
          "Invalid referral code | Referred user not found",
          404
        );
      }

      if (referralCode === existingUser.referralCode) {
        return CustomError("You cannot use your own referral code", 400);
      }

      referredById = referredUser.id;
    }

    // Proceed to update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        streamId,
        year,
        referredById,
      },
      select: {
        id: true,
        name: true,
        streamId: true,
        phone: true,
        year: true,
        referralCode: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser, "User updated successfully!");
  }
);

export const GET = catchApiError(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const userId = (await params).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        stream: { select: { id: true, name: true } },
        phone: true,
        year: true,
        referralCode: true,
      },
    });

    if (!user) {
      return CustomError("User not found", 404);
    }

    return successResponse(user, "User fetched successfully!");
  }
);
