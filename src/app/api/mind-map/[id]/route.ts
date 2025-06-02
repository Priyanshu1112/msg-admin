import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

      if (!id) CustomError("Id is required to update mind-map.");

    const res = await prisma.mindMap.update({ where: { id }, data: body });

    return successResponse(res, "Mindmap updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete mind-map.");

    const res = await prisma.mindMap.delete({ where: { id } });

    return successResponse(res, "Mindmap deleted successfully!");
  }
);
