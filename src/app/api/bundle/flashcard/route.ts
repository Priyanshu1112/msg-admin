/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";

import { prisma } from "@/service/prisma";
import { v4 as uuidv4 } from "uuid";
import { ContentType } from "@prisma/client";
import { catchApiError } from "../../_utils/catchApiError";
import { successResponse } from "../../_utils/Response";

export const POST = catchApiError(async (request: NextRequest) => {
  const { bundles, topicId } = await request.json();

  if (!topicId) {
    throw new Error("Topic ID is required");
  }

  if (!bundles || !Array.isArray(bundles) || bundles.length === 0) {
    throw new Error("Bundles array is required and cannot be empty");
  }

  const bundleIds: string[] = [];
  const allFlashCards: any[] = [];
  const flashCardsWithImages: { id: string; images: any }[] = [];

  // Prepare bundle entries with UUIDs
  const bundleEntries = bundles.map((bundle) => {
    const bundleId = uuidv4();
    bundleIds.push(bundleId);
    return {
      id: bundleId,
      name: bundle.name,
      topicId,
      description: bundle.description || "",
      type: ContentType.FlashCard,
    };
  });

  // Create all bundles
  await prisma.bundle.createMany({
    data: bundleEntries,
  });

  // Prepare flashcards for each bundle
  bundles.forEach((bundle, index) => {
    const bundleId = bundleIds[index];

    bundle.flashcards.forEach((card) => {
      const cardId = uuidv4();

      if (!card.question || !card.answer) {
        throw new Error("Each flashcard must have a question and an answer");
      }

      allFlashCards.push({
        id: cardId,
        question: card.question,
        answer: card.answer,
        tags: card.tag ? card.tag.split(",").map((t: string) => t.trim()) : [],
        images: [],
        topicId,
        bundleId,
      });

      if (card.images && card.images.length > 0) {
        flashCardsWithImages.push({ id: cardId, images: card.images });
      }
    });
  });

  await prisma.flashCard.createMany({
    data: allFlashCards,
  });

  // Update images separately since createMany doesn't support nested writes
  if (flashCardsWithImages.length > 0) {
    await Promise.all(
      flashCardsWithImages.map((card) =>
        prisma.flashCard.update({
          where: { id: card.id },
          data: { images: card.images },
        })
      )
    );
  }

  const bundleSummaries = bundleEntries.map((entry, i) => ({
    id: entry.id,
    name: entry.name,
    _count: {
      flashCards: bundles[i].flashcards.length,
    },
    description: entry.description,
  }));

  return successResponse(
    bundleSummaries,
    "Flashcard bundles and flashcards created successfully"
  );
});
