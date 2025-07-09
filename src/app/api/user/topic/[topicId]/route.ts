import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ topicId: string }> }
  ) => {
    const topicId = (await params).topicId;

    const topics = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,

        _count: {
          select: {
            mindMaps: true,
            question: true,
            flashCard: true,
            video: true,
          },
        },
      },
    });

    return successResponse(topics, "Topics fetched successfully!");
  }
);
