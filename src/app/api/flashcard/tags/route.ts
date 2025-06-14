// /api/flashcards/tags/route.ts
import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const GET = catchApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const search = searchParams.get("search");
  const limit = parseInt(searchParams.get("limit") || "20");
  const year = searchParams.get("year");

  if (!search || search.trim().length < 2) {
    CustomError("Search term must be at least 2 characters long!");
  }

  const searchTerm = search.trim().toLowerCase();

  let flashCardWhere: any = {
    tags: {
      isEmpty: false,
    },
  };

  if (year) {
    const yearInt = parseInt(year);
    if (yearInt >= 1 && yearInt <= 5) {
      flashCardWhere.topic = {
        chapter: {
          subject: {
            year: { has: yearInt },
          },
        },
      };
    }
  }

  try {
    const flashCards = await prisma.flashCard.findMany({
      where: flashCardWhere,
      select: {
        tags: true,
      },
    });

    const tagFrequency = new Map<string, number>();

    flashCards.forEach((flashCard) => {
      flashCard.tags?.forEach((tag) => {
        if (tag && typeof tag === "string") {
          const trimmedTag = tag.trim();

          // Check for match (case-insensitive)
          if (trimmedTag.toLowerCase().includes(searchTerm)) {
            tagFrequency.set(
              trimmedTag,
              (tagFrequency.get(trimmedTag) || 0) + 1
            );
          }
        }
      });
    });

    const sortedTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, frequency]) => ({
        tag,
        frequency,
      }));

    const tags = sortedTags.map((item) => item.tag); // preserve original casing

    return successResponse({
      tags,
      totalFound: tagFrequency.size,
      searchTerm: search,
      details: sortedTags,
    });
  } catch (error) {
    console.error("Error fetching tags:", error);
    CustomError("Failed to fetch tags from database!");
  }
});

// Alternative route for getting popular tags (no search required)
// /api/flashcards/tags/popular/route.ts
export const getPopularTags = catchApiError(async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);

  const limit = parseInt(searchParams.get("limit") || "50");
  const year = searchParams.get("year");

  try {
    // Build where clause
    let flashCardWhere: any = {
      tags: {
        isEmpty: false, // Has tags
      },
    };

    // Filter by year if specified
    if (year) {
      const yearInt = parseInt(year);
      if (yearInt >= 1 && yearInt <= 5) {
        flashCardWhere.topic = {
          chapter: {
            subject: {
              year: { has: yearInt },
            },
          },
        };
      }
    }

    // Get all flashcards with tags
    const flashCards = await prisma.flashCard.findMany({
      where: flashCardWhere,
      select: {
        tags: true,
      },
    });

    // Count tag frequency
    const tagFrequency = new Map<string, number>();

    flashCards.forEach((flashCard) => {
      flashCard.tags?.forEach((tag) => {
        if (tag && typeof tag === "string") {
          const normalizedTag = tag.trim().toLowerCase();
          if (normalizedTag) {
            tagFrequency.set(
              normalizedTag,
              (tagFrequency.get(normalizedTag) || 0) + 1
            );
          }
        }
      });
    });

    // Sort by frequency and format
    const popularTags = Array.from(tagFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([tag, frequency]) => ({
        tag: tag.charAt(0).toUpperCase() + tag.slice(1),
        frequency,
      }));

    return successResponse({
      popularTags,
      totalUniqueTags: tagFrequency.size,
      totalFlashCards: flashCards.length,
    });
  } catch (error) {
    console.error("Error fetching popular tags:", error);
    CustomError("Failed to fetch popular tags!");
  }
});

// Enhanced search with additional filters
// This could be a separate endpoint: /api/flashcards/tags/advanced/route.ts
export const POST = catchApiError(async (request: NextRequest) => {
  const body = await request.json();

  const { search, year, subjects, limit = 20, includeFrequency = false } = body;

  // Validation
  if (!search || search.trim().length < 2) {
    CustomError("Search term must be at least 2 characters long!");
  }

  const searchTerm = search.trim().toLowerCase();

  try {
    // Build complex where clause
    let flashCardWhere: any = {
      tags: {
        isEmpty: false, // At least one tag exists
      },
    };

    const topicFilters: any = {};

    // Year filter
    if (year && year >= 1 && year <= 5) {
      topicFilters.chapter = {
        subject: {
          year: { has: year },
        },
      };
    }

    // Subject filter
    if (subjects && Array.isArray(subjects) && subjects.length > 0) {
      if (topicFilters.chapter) {
        topicFilters.chapter.subject = {
          ...topicFilters.chapter.subject,
          id: { in: subjects },
        };
      } else {
        topicFilters.chapter = {
          subject: {
            id: { in: subjects },
          },
        };
      }
    }

    // Apply topic filters if any exist
    if (Object.keys(topicFilters).length > 0) {
      flashCardWhere.topic = topicFilters;
    }

    // Execute query
    const flashCards = await prisma.flashCard.findMany({
      where: flashCardWhere,
      select: {
        tags: true,
        ...(includeFrequency && {
          topic: {
            select: {
              name: true,
              chapter: {
                select: {
                  subject: {
                    select: {
                      name: true,
                      year: true,
                    },
                  },
                },
              },
            },
          },
        }),
      },
    });

    // Process tags
    const tagData = new Map<string, any>();

    flashCards.forEach((flashCard) => {
      flashCard.tags?.forEach((tag) => {
        if (tag && typeof tag === "string") {
          const normalizedTag = tag.trim();
          if (normalizedTag.toLowerCase().includes(searchTerm)) {
            const lowerTag = normalizedTag.toLowerCase();

            if (!tagData.has(lowerTag)) {
              tagData.set(lowerTag, {
                tag:
                  normalizedTag.charAt(0).toUpperCase() +
                  normalizedTag.slice(1),
                frequency: 0,
                subjects: new Set(),
                topics: new Set(),
              });
            }

            const data = tagData.get(lowerTag);
            data.frequency += 1;

            if (includeFrequency && flashCard.topic) {
              data.subjects.add(flashCard.topic.chapter.subject.name);
              data.topics.add(flashCard.topic.name);
            }
          }
        }
      });
    });

    // Format response
    const results = Array.from(tagData.values())
      .sort((a, b) => b.frequency - a.frequency)
      .slice(0, limit)
      .map((item) => ({
        tag: item.tag,
        frequency: item.frequency,
        ...(includeFrequency && {
          subjectCount: item.subjects.size,
          topicCount: item.topics.size,
          subjects: Array.from(item.subjects),
          topics: Array.from(item.topics),
        }),
      }));

    return successResponse({
      tags: results.map((r) => r.tag), // Simple array for basic usage
      details: results, // Full details with frequency info
      totalFound: tagData.size,
      searchTerm: search,
      filters: {
        year,
        subjects: subjects || [],
        limit,
      },
    });
  } catch (error) {
    console.error("Error in advanced tag search:", error);
    CustomError("Failed to perform advanced tag search!");
  }
});
