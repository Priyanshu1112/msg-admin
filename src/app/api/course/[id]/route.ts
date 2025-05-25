import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    if (!id) CustomError("Id is required to delete course.");

    const res = await prisma.course.delete({ where: { id } });

    return successResponse(res, "Course deleted successfully!");
  }
);
