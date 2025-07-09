import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const POST = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await params;
    const { questionId, isCorrect } = await req.json();

    if (!userId || !questionId) {
      return CustomError("Missing user ID or question ID", 400);
    }

    let isCorrectBoolean: boolean;
    // Convert isCorrect to boolean if it's a string
    if (typeof isCorrect === "string") {
      if (isCorrect.toLowerCase() === "true") isCorrectBoolean = true;
      else if (isCorrect.toLowerCase() === "false") isCorrectBoolean = false;
      else {
        return CustomError(
          "Invalid isCorrect value. Must be 'true' or 'false'",
          400
        );
      }
    } else if (typeof isCorrect === "boolean") {
      isCorrectBoolean = isCorrect;
    } else {
      return CustomError(
        "isCorrect must be a boolean or 'true'/'false' string",
        400
      );
    }

    const question = await prisma.question.findUnique({
      where: { id: questionId },
      select: { tags: true },
    });

    if (!question) {
      return CustomError("Question not found", 404);
    }

    // Upsert the response to allow tracking only latest attempt
    const response = await prisma.userMCQResponse.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId,
        },
      },
      update: {
        isCorrect: isCorrectBoolean,
        tags: question.tags,
        updatedAt: new Date(),
      },
      create: {
        userId,
        questionId,
        tags: question.tags,
        isCorrect: isCorrectBoolean,
      },
    });

    return successResponse(response, "MCQ response recorded");
  }
);

export const GET = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id: userId } = await params;
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");
    const correct = searchParams.get("correct");

    const where: any = { userId };
    if (tag) where.tags = { has: tag };
    if (correct !== null) where.isCorrect = correct === "true";

    const responses = await prisma.userMCQResponse.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return successResponse(responses, "Fetched user MCQ responses");
  }
);
