import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextRequest, NextResponse } from "next/server";
import { reduceSubject } from "../subject/route";
import { successResponse } from "../_utils/Response";

// Properly typed reducer
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reduceChapter = (chapter: any) => {
  let totalMindmaps = 0;
  let totalQuestions = 0;
  let totalFlashcards = 0;
  let totalVideos = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chapter.topics.forEach((topic: any) => {
    totalMindmaps += topic._count.mindMaps;
    totalQuestions += topic._count.question;
    totalFlashcards += topic._count.flashCard;
    totalVideos += topic._count.video;
  });

  return {
    id: chapter.id,
    name: chapter.name,
    subject: chapter.subject,
    _count: {
      topics: chapter._count.topics,
      mindMaps: totalMindmaps,
      questions: totalQuestions,
      flashcards: totalFlashcards,
      videos: totalVideos,
    },
  };
};

export const GET = catchApiError(async (req) => {
  const { searchParams } = new URL(req.url);
  const pageParam = parseInt(searchParams.get("pageNumber") || "1", 10);
  const pageSize = 10;
  const skip = (pageParam - 1) * pageSize;

  const [chaptersRaw, totalChapters] = await Promise.all([
    prisma.chapter.findMany({
      skip,
      take: pageSize,
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { topics: true },
        },
        topics: {
          select: {
            _count: {
              select: {
                mindMaps: true,
                question: true,
                flashCard: true,
                video: true,
              },
            },
          },
        },
      },
    }),
    prisma.chapter.count(),
  ]);

  const chapters = chaptersRaw.map(reduceChapter);

  return NextResponse.json({
    success: true,
    data: chapters,
    meta: {
      currentPage: pageParam,
      totalChapters,
      totalPages: Math.ceil(totalChapters / pageSize),
    },
  });
});

export const POST = catchApiError(async (req: NextRequest) => {
  const { subjectId, names } = await req.json();

  await prisma.chapter.createMany({
    data: names.map((name: string) => ({
      subjectId,
      name,
    })),
  });

  const [subject, chapters] = await Promise.all([
    prisma.subject.findUnique({
      where: { id: subjectId },
      select: {
        id: true,
        name: true,
        year: true,
        country: true,
        stream: { select: { id: true, name: true } },
        course: { select: { id: true, name: true } },
        _count: { select: { chapters: true } },
        chapters: {
          select: {
            _count: { select: { topics: true } },
            topics: {
              select: {
                _count: {
                  select: {
                    mindMaps: true,
                    question: true,
                    flashCard: true,
                    video: true,
                  },
                },
              },
            },
          },
        },
      },
    }),
    prisma.chapter.findMany({
      where: {
        subjectId,
        name: { in: names },
      },
      select: {
        id: true,
        name: true,
        subject: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { topics: true },
        },
        topics: {
          select: {
            _count: {
              select: {
                mindMaps: true,
                question: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return successResponse(
    {
      subject: reduceSubject(subject),
      chapters: chapters.map((chapter) => reduceChapter(chapter)),
    },
    "Chapters created successfully!"
  );
});
