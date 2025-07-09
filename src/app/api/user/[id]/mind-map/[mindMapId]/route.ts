import { prisma } from "@/service/prisma";
import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { NextRequest } from "next/server";
import { ContentType } from "@prisma/client";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; mindMapId: string }> }
  ) => {
    const { id: userId, mindMapId } = await params;

    // Fetch the mind map with its topic and subject relationship
    const mindMap = await prisma.mindMap.findUnique({
      where: { id: mindMapId },
      select: {
        id: true,
        name: true,
        mindMap: true,
        topic: {
          select: {
            id: true,
            chapter: {
              select: {
                subject: {
                  select: { id: true },
                },
              },
            },
          },
        },
      },
    });

    if (!mindMap) {
      return CustomError("Mind map not found", 404);
    }

    const subjectId = mindMap.topic.chapter.subject.id;
    const topicId = mindMap.topic.id;

    // Check if subject is unlocked
    const isSubjectUnlocked = await prisma.userUnlockedSubject.findFirst({
      where: { userId, subjectId },
    });

    const isMindMapUnlocked = await prisma.userUnlockedContent.findFirst({
      where: {
        userId,
        resourceId: mindMapId,
        resourceType: ContentType.MindMap,
      },
    });

    if (!isSubjectUnlocked && !isMindMapUnlocked) {
      return CustomError("Access denied. Mind map is not unlocked.", 403);
    }

    // ✅ Log the visit (no duplicate prevention needed as per requirement)
    await prisma.visitLog.create({
      data: {
        userId,
        resourceId: mindMapId,
        resourceType: ContentType.MindMap,
        topicId,
      },
    });

    return successResponse(mindMap, "Mind map access granted and logged");
  }
);
