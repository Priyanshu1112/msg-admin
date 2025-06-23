import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { reduceChapter } from "@/app/api/chapter/route";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (req: NextRequest, params: Promise<{ subjectId: string }>) => {
    const subjectId = (await params).subjectId;

    const chaptersRaw = await prisma.chapter.findMany({
      where: { subjectId },
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
                flashCard: true,
                video: true,
              },
            },
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    });

    const chapters = chaptersRaw.map(reduceChapter);

    return successResponse(chapters, "Chapters fetched successfully!");
  }
);
