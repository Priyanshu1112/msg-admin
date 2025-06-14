/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { prisma } from "@/service/prisma";

export const GET = catchApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  // Extract query parameters
  const year = searchParams.get("year");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search");

  // Build where clause
  const where: any = {};

  if (year) {
    const yearInt = parseInt(year);
    if (yearInt >= 1 && yearInt <= 5) {
      where.year = yearInt;
    }
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get bundles with flashcard count
  const [bundles, total] = await Promise.all([
    prisma.flashCardBundle.findMany({
      where,
      select: {
        id: true,
        name: true,
        year: true,
        tags: true,
        description: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.flashCardBundle.count({ where }),
  ]);

  // Get flashcard count for each bundle
  const bundlesWithCount = await Promise.all(
    bundles.map(async (bundle) => {
      const flashCardCount = await prisma.flashCard.count({
        where: {
          AND: [
            {
              topic: {
                chapter: {
                  subject: {
                    year: { has: bundle.year },
                  },
                },
              },
            },
            {
              tags: { hasSome: bundle.tags },
            },
          ],
        },
      });

      return {
        ...bundle,
        flashCardCount,
      };
    })
  );

  return successResponse({
    bundles: bundlesWithCount,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  });
});

export const POST = catchApiError(async (request: NextRequest) => {
  const body = await request.json();

  const { name, year, tags, description } = body;

  // Validation
  if (!name) CustomError("Bundle name is required!");
  if (!year) CustomError("Year is required!");
  if (!tags || !Array.isArray(tags) || tags.length === 0) {
    CustomError("Tags are required and must be a non-empty array!");
  }

  // Validate year range
  if (year < 1 || year > 5) {
    CustomError("Year must be between 1 and 5!");
  }

  // Check uniqueness: name must be unique per year
  const existingBundle = await prisma.flashCardBundle.findFirst({
    where: {
      name,
      year,
    },
  });

  if (existingBundle) {
    CustomError(`Bundle "${name}" already exists for year ${year}!`);
  }

  // Create the bundle
  const bundle = await prisma.flashCardBundle.create({
    data: {
      name: name.trim(),
      year,
      tags: tags.map((tag: string) => tag.trim()),
      description: description?.trim() || null,
    },
  });

  // Get preview of matching flashcards
  const matchingFlashCardCount = await prisma.flashCard.count({
    where: {
      AND: [
        {
          topic: {
            chapter: {
              subject: {
                year: { has: year },
              },
            },
          },
        },
        {
          tags: { hasSome: tags },
        },
      ],
    },
  });

  // Get subjects that will be included
  const subjectsFound = await prisma.subject.findMany({
    where: {
      year: { has: year },
    },
    select: {
      name: true,
    },
  });

  return successResponse(
    {
      bundle,
      preview: {
        matchingFlashCardCount,
        subjectsFound: subjectsFound.map((s) => s.name),
      },
    },
    `Bundle created successfully! ${matchingFlashCardCount} flashcards match the criteria.`
  );
});
