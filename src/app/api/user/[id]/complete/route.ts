import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId") || undefined;
    const resourceId = searchParams.get("resourceId") || undefined;

    const completed = await prisma.userCompletedContent.findMany({
      where: {
        userId,
        ...(topicId ? { topicId } : {}),
        ...(resourceId ? { resourceId } : {}),
      },
      orderBy: { completedAt: "desc" },
    });

    return successResponse(completed, "Fetched completed content successfully");
  }
);

export const POST = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await params;
    const { resourceId, resourceType, topicId, completePercentage } =
      await req.json();

    if (!resourceId || !resourceType || !topicId) {
      return CustomError("Missing required fields", 400);
    }

    const created = await prisma.userCompletedContent.create({
      data: {
        userId,
        resourceId,
        resourceType,
        topicId,
        completePercentage: completePercentage || 0,
      },
    });

    return successResponse(created, "Marked content as completed");
  }
);
