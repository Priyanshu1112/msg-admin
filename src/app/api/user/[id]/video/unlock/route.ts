import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { ContentType } from "@prisma/client";

export const POST = catchApiError(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { topicId } = body;

    // Validate input
    if (!id || !topicId) {
      return CustomError("Missing user ID or topicId ID", 400);
    }

    const unlockedSubject = await prisma.userUnlockedContent.create({
      data: {
        resourceId: topicId,
        userId: id,
        resourceType: ContentType.Video,
      },
    });

    return successResponse(unlockedSubject, "Video unlocked successfully!");
  }
);
