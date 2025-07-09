import { prisma } from "@/service/prisma";
import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { NextRequest } from "next/server";
import { ContentType } from "@prisma/client";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; topicId: string }> }
  ) => {
    const { id: userId, topicId } = await params;

    // Fetch videos and subjectId separately for internal use
    const [videos, videoWithSubject] = await Promise.all([
      prisma.video.findMany({
        where: { topicId },
        select: {
          id: true,
          title: true,
          url: true,
          faculty: {
            select: {
              id: true,
              name: true,
              imageUrl: true,
              bio: true,
              qualification: true,
            },
          },
        },
      }),
      prisma.video.findFirst({
        where: { topicId },
        select: {
          id: true,
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
      }),
    ]);

    if (!videos || videos.length === 0 || !videoWithSubject) {
      return CustomError("No videos found for this topic", 404);
    }

    const subjectId = videoWithSubject.topic?.chapter?.subject?.id;
    const topicIdResolved = videoWithSubject.topic?.id ?? "";

    // Check subject unlock
    const isSubjectUnlocked = await prisma.userUnlockedSubject.findFirst({
      where: { userId, subjectId },
    });

    const isVideoGroupUnlocked = await prisma.userUnlockedContent.findFirst({
      where: {
        userId,
        resourceId: topicId,
        resourceType: ContentType.Video,
      },
    });

    if (!isSubjectUnlocked && !isVideoGroupUnlocked) {
      return CustomError("Access denied. Video group is not unlocked.", 403);
    }

    // Log the visit only if access is granted
    await prisma.visitLog.create({
      data: {
        userId,
        resourceId: topicId,
        resourceType: ContentType.Video,
        topicId: topicIdResolved,
      },
    });

    return successResponse(
      videos,
      isSubjectUnlocked
        ? "Videos accessed via unlocked subject"
        : "Videos accessed via direct topic unlock"
    );
  }
);
