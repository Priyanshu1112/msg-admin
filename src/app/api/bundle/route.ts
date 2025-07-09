/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { catchApiError } from "../_utils/catchApiError";
import { successResponse } from "../_utils/Response";
import { prisma } from "@/service/prisma";
import { v4 as uuidv4 } from "uuid";
import { ContentType } from "@prisma/client";

export const POST = catchApiError(async (request: NextRequest) => {
  const { bundles, topicId } = await request.json();

  if (!topicId) {
    throw new Error("Topic ID is required");
  }

  if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
    throw new Error("Bundles array is required and cannot be empty");
  }

  const bundleIds: string[] = [];
  const allQuestions: any[] = [];
  const allOptions: any[] = [];
  const questionsWithImages: { id: string; images: any }[] = [];

  // Prepare bundle entries with UUIDs
  const bundleEntries = bundles.map((bundle) => {
    const bundleId = uuidv4();
    bundleIds.push(bundleId);
    return {
      id: bundleId,
      name: bundle.name,
      topicId,
      description: bundle.description || "",
      type: ContentType.MCQ,
    };
  });

  // Create all bundles
  await prisma.bundle.createMany({
    data: bundleEntries,
  });

  // Prepare questions and options for each bundle
  bundles.forEach((bundle, index) => {
    const bundleId = bundleIds[index];

    bundle.questions.forEach((q) => {
      const questionId = uuidv4();

      if (!q.question || !q.explanation) {
        throw new Error(
          "Each question must have question text and explanation"
        );
      }

      if (!q.options || q.options.length === 0) {
        throw new Error("Each question must have at least one option");
      }

      const hasCorrect = q.options.some((o) => o.isCorrect);
      if (!hasCorrect) {
        throw new Error("Each question must have at least one correct answer");
      }

      allQuestions.push({
        id: questionId,
        text: q.question,
        explanation: q.explanation,
        topicId,
        bundleId: bundleId,
        tags: q.tags,
      });

      if (q.images && q.images.length > 0) {
        questionsWithImages.push({ id: questionId, images: q.images });
      }

      q.options.forEach((opt) => {
        if (!opt.text) {
          throw new Error("All options must have text");
        }
        allOptions.push({
          text: opt.text,
          isCorrect: opt.isCorrect,
          questionId,
        });
      });
    });
  });

  await prisma.$transaction([
    prisma.question.createMany({
      data: allQuestions,
    }),
    prisma.option.createMany({
      data: allOptions,
    }),
  ]);

  if (questionsWithImages.length > 0) {
    await Promise.all(
      questionsWithImages.map((q) =>
        prisma.question.update({
          where: { id: q.id },
          data: { images: q.images },
        })
      )
    );
  }

  const bundleSummaries = bundleEntries.map((entry, i) => ({
    id: entry.id,
    name: entry.name,
    _count: {
      questions: bundles[i].questions.length,
    },
  }));

  return successResponse(
    bundleSummaries,
    "Question bundles and questions created successfully"
  );
});
