import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete question.");

    const res = await prisma.question.delete({ where: { id } });

    return successResponse(res, "Question deleted successfully!");
  }
);
