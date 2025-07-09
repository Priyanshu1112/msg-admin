import { catchApiError } from "@/app/api/_utils/catchApiError";
import { prisma } from "@/service/prisma";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { NextRequest } from "next/server";

export const PUT = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; completeId: string }> }
  ) => {
    const { id: userId, completeId } = await params;
    let { completePercentage } = await req.json();

    if (!userId || !completeId) {
      return CustomError("User ID and Completion ID are required", 400);
    }

    completePercentage = Number(completePercentage);

    if (
      typeof completePercentage !== "number" ||
      isNaN(completePercentage) ||
      completePercentage < 0 ||
      completePercentage > 100
    ) {
      return CustomError("Invalid completePercentage (must be 0 to 100)", 400);
    }

    const existing = await prisma.userCompletedContent.findUnique({
      where: { id: completeId },
    });

    if (!existing || existing.userId !== userId) {
      return CustomError("Completion record not found for this user", 404);
    }

    const updated = await prisma.userCompletedContent.update({
      where: { id: completeId },
      data: {
        completePercentage,
        completedAt: new Date(),
      },
    });

    return successResponse(updated, "Completion record updated");
  }
);
