import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) {
      return CustomError("User ID is required", 400);
    }

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    const visitLogs = await prisma.visitLog.findMany({
      where: { userId: id },
      orderBy: { visitedAt: "desc" },
      take: isNaN(limit) || limit < 1 ? 3 : limit,
      select: {
        id: true,
        resourceId: true,
        resourceType: true,
        topicId: true,
        visitedAt: true,
      },
    });

    return successResponse(visitLogs, `Fetched ${visitLogs.length} visit logs`);
  }
);
