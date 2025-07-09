import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { ContentType } from "@prisma/client";

export const POST = catchApiError(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { bundleId } = body;

    // Validate input
    if (!id || !bundleId) {
      return CustomError("Missing user ID or bundleId ID", 400);
    }

    const unlockedBundle = await prisma.userUnlockedContent.create({
      data: {
        resourceId: bundleId,
        userId: id,
        resourceType: ContentType.MCQ,
      },
    });

    return successResponse(
      unlockedBundle,
      "Question-bundle unlocked successfully!"
    );
  }
);
