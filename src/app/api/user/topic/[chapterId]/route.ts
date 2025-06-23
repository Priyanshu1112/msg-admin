import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (req: NextRequest, params: Promise<{ chapterId: string }>) => {
    const chapterId = (await params).chapterId;

    const topics = await prisma.topic.findMany({
      where: { chapterId },
      select: {
        id: true,
        name: true,
        chapter: {
          select: { id: true, name: true },
        },
        _count: {
          select: {
            mindMaps: true,
            question: true,
            flashCard: true,
            video: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
      take: 10,
    });

    return successResponse(topics, "Topics fetched successfully!");
  }
);
