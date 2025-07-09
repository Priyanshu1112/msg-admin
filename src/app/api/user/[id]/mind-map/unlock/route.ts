import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { ContentType } from "@prisma/client";

export const POST = catchApiError(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { mindMapId } = body;

    // Validate input
    if (!id || !mindMapId) {
      return CustomError("Missing user ID or mindMapId ID", 400);
    }

    const unlockedSubject = await prisma.userUnlockedContent.create({
      data: {
        resourceId: mindMapId,
        userId: id,
        resourceType: ContentType.MindMap,
      },
    });

    return successResponse(unlockedSubject, "Mind-map unlocked successfully!");
  }
);
