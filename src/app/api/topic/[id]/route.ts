import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";


export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    if (!id) CustomError("Id is required to update topic.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.chapterId !== undefined) data.chapterId = body.chapterId;

    const res = await prisma.topic.update({
      where: { id },
      data: data,
      select: {
        id: true,
        name: true,
        chapter: {
          select: { id: true, name: true },
        },
        _count: { select: { mindMaps: true, question: true } },
      },
    });

    return successResponse(res, "Topic updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: { id: string } }) => {
    const { id } = params;

    if (!id) CustomError("Id is required to delete topic.");

    const res = await prisma.topic.delete({ where: { id } });

    return successResponse(res, "Topic deleted successfully!");
  }
);
