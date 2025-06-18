import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { prisma } from "@/service/prisma";
import { CustomError, successResponse } from "../../_utils/Response";

export const PUT = catchApiError(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const body = await request.json();
    const { name, tags, description } = body;

    // Get existing bundle
    const existingBundle = await prisma.flashCardBundle.findFirst({
      where: {
        id: params.id,
      },
    });

    if (!existingBundle) {
      CustomError("Bundle not found!");
    }

    // Prepare update data
    const updateData: any = {};

    if (name && name.trim() !== existingBundle?.name) {
      // Check uniqueness for new name with same year
      const duplicateBundle = await prisma.flashCardBundle.findFirst({
        where: {
          name: name.trim(),
          year: existingBundle?.year,
          id: { not: params.id },
        },
      });

      if (duplicateBundle) {
        CustomError(
          `Bundle "${name}" already exists for year ${existingBundle?.year}!`
        );
      }

      updateData.name = name.trim();
    }

    if (tags && Array.isArray(tags) && tags.length > 0) {
      updateData.tags = tags.map((tag: string) => tag.trim());
    }

    if (description !== undefined) {
      updateData.description = description?.trim() || null;
    }

    // Get previous flashcard count for comparison
    const previousFlashCardCount = await prisma.flashCard.count({
      where: {
        AND: [
          {
            topic: {
              chapter: {
                subject: {
                  year: { has: existingBundle?.year },
                },
              },
            },
          },
          {
            tags: { hasSome: existingBundle?.tags },
          },
        ],
      },
    });

    // Update the bundle
    const updatedBundle = await prisma.flashCardBundle.update({
      where: { id: params.id },
      data: updateData,
    });

    // Get new flashcard count
    const newFlashCardCount = await prisma.flashCard.count({
      where: {
        AND: [
          {
            topic: {
              chapter: {
                subject: {
                  year: { has: updatedBundle.year },
                },
              },
            },
          },
          {
            tags: { hasSome: updatedBundle.tags },
          },
        ],
      },
    });

    const countDifference = newFlashCardCount - previousFlashCardCount;
    let changeDescription = "No change in flashcard count";

    if (countDifference > 0) {
      changeDescription = `${countDifference} additional flashcards now match the updated criteria`;
    } else if (countDifference < 0) {
      changeDescription = `${Math.abs(
        countDifference
      )} fewer flashcards match the updated criteria`;
    }

    return successResponse(
      {
        bundle: updatedBundle,
        impact: {
          previousFlashCardCount,
          newFlashCardCount,
          changeDescription,
        },
      },
      "Bundle updated successfully!"
    );
  }
);

export const DELETE = catchApiError(
  async (request: NextRequest, { params }: { params: { id: string } }) => {
    const bundleId = params.id;

    // Check if the bundle exists
    const existingBundle = await prisma.flashCardBundle.findUnique({
      where: { id: bundleId },
    });

    if (!existingBundle) {
      CustomError("Bundle not found!");
    }

    // Delete the bundle
    await prisma.flashCardBundle.delete({
      where: { id: bundleId },
    });

    return successResponse({}, "Bundle deleted successfully!");
  }
);
