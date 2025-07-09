import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";

export const POST = catchApiError(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();
    const { subjectId } = body;

    // Validate input
    if (!id || !subjectId) {
      return CustomError("Missing user ID or subject ID", 400);
    }

    const unlockedSubject = await prisma.userUnlockedSubject.create({
      data: { subjectId, userId: id },
    });

    return successResponse(unlockedSubject, "Subject unlocked successfully!");
  }
);
