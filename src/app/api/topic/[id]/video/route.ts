import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;

    if (!id) return CustomError("Topic id is required!");

    const videos = await prisma.video.findMany({
      where: { topicId: id },
      select: {
        id: true,
        url: true,
        title: true,
        faculty: {
          select: {
            id: true,
            name: true,
            bio: true,
            imageUrl: true,
            qualification: true,
          },
        },
      },
    });

    return successResponse(videos);
  }
);
