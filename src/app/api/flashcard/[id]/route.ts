import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const body = await req.json();

    if (!id) CustomError("Id is required to update flashcard.");

    const res = await prisma.flashCard.update({
      where: { id },
      data: { ...body },
    });

    return successResponse(res, "Flashcard updated successfully!");
  }
);
