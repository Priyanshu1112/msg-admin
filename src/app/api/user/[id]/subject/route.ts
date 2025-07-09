import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const userId = (await params).id;

    const unlockedSubjects = await prisma.userUnlockedSubject.findMany({
      where: { userId },
      select: {
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return successResponse(unlockedSubjects);
  }
);
