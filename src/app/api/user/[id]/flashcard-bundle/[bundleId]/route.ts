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

    // Fetch the bundle and related data
    const bundle = await prisma.bundle.findUnique({
      where: { id: bundleId, type: ContentType.FlashCard },
      select: {
        id: true,
        name: true,
        flashCards: true,
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
      return CustomError("Flashcard bundle not found", 404);
    }

    const subjectId = bundle.topic.chapter.subject.id;
    const topicId = bundle.topic.id;

    // Check subject unlock
    const isSubjectUnlocked = await prisma.userUnlockedSubject.findFirst({
      where: { userId, subjectId },
    });

    const isBundleUnlocked = await prisma.userUnlockedContent.findFirst({
      where: {
        userId,
        resourceId: bundleId,
        resourceType: ContentType.FlashCard,
      },
    });

    if (!isSubjectUnlocked && !isBundleUnlocked) {
      return CustomError(
        "Access denied. Flashcard bundle is not unlocked.",
        403
      );
    }

    // ✅ Log visit here
    await prisma.visitLog.create({
      data: {
        userId,
        resourceId: bundleId,
        resourceType: ContentType.FlashCard,
        topicId,
      },
    });

    return successResponse(
      bundle,
      "Flashcard bundle access granted and logged"
    );
  }
);
