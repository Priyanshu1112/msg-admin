import { prisma } from "@/service/prisma";
import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse, CustomError } from "@/app/api/_utils/Response";
import { NextRequest } from "next/server";
import { ContentType } from "@prisma/client";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ id: string; bundleId: string }> }
  ) => {
    const { id: userId, bundleId } = await params;

    // Fetch the question bundle and its topic and subject relationship
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId, type: ContentType.MCQ },
      select: {
        id: true,
        name: true,
        questions: {
          select: {
            id: true,
            text: true,
            options: true,
            explanation: true,
            images: true,
            tags: true,
          },
        },
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

    if (!bundle) {
      return CustomError("Question bundle not found", 404);
    }

    const subjectId = bundle.topic.chapter.subject.id;
    const topicId = bundle.topic.id;

    // Check if subject is unlocked
    const isSubjectUnlocked = await prisma.userUnlockedSubject.findFirst({
      where: { userId, subjectId },
    });

    // Check if this question bundle is unlocked directly
    const isBundleUnlocked = await prisma.userUnlockedContent.findFirst({
      where: {
        userId,
        resourceId: bundleId,
        resourceType: ContentType.MCQ,
      },
    });

    if (!isSubjectUnlocked && !isBundleUnlocked) {
      return CustomError(
        "Access denied. Question bundle is not unlocked.",
        403
      );
    }

    // Log visit
    await prisma.visitLog.create({
      data: {
        userId,
        resourceId: bundleId,
        resourceType: ContentType.MCQ,
        topicId,
      },
    });

    return successResponse(
      bundle,
      isSubjectUnlocked
        ? "Question bundle accessed via unlocked subject"
        : "Question bundle accessed via direct unlock"
    );
  }
);
