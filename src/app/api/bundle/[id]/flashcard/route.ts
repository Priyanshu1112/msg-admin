import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    if (!id) return CustomError("Bundle id is required!");

    const flashCards = await prisma.flashCard.findMany({
      where: { bundleId: id },
      select: {
        id: true,
        answer: true,
        images: true,
        question: true,
        tags: true,
      },
    });

    return successResponse(flashCards);
  }
);
