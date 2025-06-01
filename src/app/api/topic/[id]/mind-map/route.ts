import { NextRequest } from "next/server";
import { prisma } from "@/service/prisma";
import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";

export const GET = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    const mindMaps = await prisma.mindMap.findMany({
      where: { topicId: id },
      select: { id: true, mindMap: true, name: true, description: true },
    });

    return successResponse(mindMaps);
  }
);
