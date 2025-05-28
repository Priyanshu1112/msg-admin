import { ParsedOption, ParsedQuestion } from "@/app/(dahboard)/_parser/mcq";
import { prisma } from "@/service/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest } from "next/server";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";

export const POST = catchApiError(async (request: NextRequest) => {
  const { file, topicId } = await request.json();

  // Validation
  if (!topicId) {
    CustomError("Topic ID is required");
  }

  if (!file || !Array.isArray(file) || file.length === 0) {
    CustomError("Questions array is required and cannot be empty");
  }

  // Verify topic exists
  const existingTopic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true },
  });

  if (!existingTopic) {
    CustomError("Topic not found");
  }

  // Prepare data structures
  const questionsForBulkCreate: Prisma.QuestionCreateManyInput[] = [];
  const options: Prisma.OptionCreateManyInput[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const questionsWithImages: { id: string; images: any }[] = [];

  // Process each question
  file.forEach((f: ParsedQuestion) => {
    const questionId = randomUUID();

    // Validate question structure
    if (!f.question || !f.explanation) {
      CustomError("Each question must have question text and explanation");
    }

    if (!f.options || f.options.length === 0) {
      CustomError("Each question must have at least one option");
    }

    // Check if there's at least one correct answer
    const hasCorrectAnswer = f.options.some(
      (option: ParsedOption) => option.isCorrect
    );
    if (!hasCorrectAnswer) {
      CustomError("Each question must have at least one correct answer");
    }

    // Add to questions array WITHOUT images field for bulk creation
    questionsForBulkCreate.push({
      id: questionId,
      text: f.question,
      topicId: topicId,
      explanation: f.explanation,
    });

    // Track questions that have images for later update
    if (f.images && f.images.length > 0) {
      questionsWithImages.push({
        id: questionId,
        images: f.images,
      });
    }

    // Prepare options for bulk creation
    f.options.forEach((option: ParsedOption) => {
      if (!option.text) {
        CustomError("All options must have text");
      }

      options.push({
        text: option.text,
        isCorrect: option.isCorrect,
        questionId: questionId,
      });
    });
  });

  // Perform bulk operations inside a transaction
  await prisma.$transaction([
    // 1. Create all questions (without images)
    prisma.question.createMany({
      data: questionsForBulkCreate,
    }),

    // 2. Create all options
    prisma.option.createMany({
      data: options,
    }),
  ]);

  // 3. Update questions with images individually (if any)
  if (questionsWithImages.length > 0) {
    await Promise.all(
      questionsWithImages.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: {
            images: q.images as Prisma.InputJsonValue,
          },
        })
      )
    );
  }

  // Get updated topic with counts
  const updatedTopic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: {
      id: true,
      name: true,
      _count: { select: { question: true, mindMaps: true } },
    },
  });

  return successResponse(
    updatedTopic,
    `Successfully created ${file.length} question(s)!`
  );
});
