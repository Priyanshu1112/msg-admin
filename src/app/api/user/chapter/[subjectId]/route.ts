import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ subjectId: string }> }
  ) => {
    const subjectId = (await params).subjectId;

    const chapters = await prisma.chapter.findMany({
      where: { subjectId },
      select: {
        id: true,
        name: true,
        topics: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    });

    return successResponse(chapters, "Chapters fetched successfully!");
  }
);
