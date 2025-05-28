import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";
import { reduceChapter } from "../route";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    if (!id) CustomError("Id is required to update chapter.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.subjectId !== undefined) data.subjectId = body.subjectId;

    const res = await prisma.chapter.update({
      where: { id },
      data: data,
      select: {
        id: true,
        name: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { topics: true },
        },
        topics: {
          select: {
            _count: {
              select: {
                mindMaps: true,
                question: true,
              },
            },
          },
        },
      },
    });

    return successResponse(reduceChapter(res), "Chapter updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete chapter.");

    const res = await prisma.chapter.delete({ where: { id } });

    return successResponse(res, "Chapter deleted successfully!");
  }
);
