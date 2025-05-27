import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "../_utils/Response";
import { reduceSubject } from "../subject/route";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reduceChapter = (chapter: any) => {
  let totalMindmaps = 0;
  let totalQuestions = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  chapter.topics.forEach((topic: any) => {
    totalMindmaps += topic._count.mindMaps;
    totalQuestions += topic._count.question;
  });

  return {
    id: chapter.id,
    name: chapter.name,
    subject: chapter.subject,
    _count: {
      topics: chapter._count.topics,
      mindMaps: totalMindmaps,
      questions: totalQuestions,
    },
  };
};

export const GET = catchApiError(async () => {
  const rawChapters = await prisma.chapter.findMany({
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
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  const chapters = rawChapters.map((chapter) => {
    return reduceChapter(chapter);
  });

  return NextResponse.json({ success: true, data: chapters });
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
        _count: {
          select: { chapters: true },
        },
        chapters: {
          select: {
            _count: { select: { topics: true } },
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
