import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextRequest, NextResponse } from "next/server";
import { successResponse } from "../_utils/Response";
import { reduceChapter } from "../chapter/route";

export const GET = catchApiError(async () => {
  const topics = await prisma.topic.findMany({
    select: {
      id: true,
      name: true,
      chapter: {
        select: { id: true, name: true },
      },
      _count: { select: { mindMaps: true, question: true } },
    },
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  return NextResponse.json({ success: true, data: topics });
});

export const POST = catchApiError(async (req: NextRequest) => {
  const { chapterId, names } = await req.json();

  await prisma.topic.createMany({
    data: names.map((name: string) => ({
      chapterId,
      name,
    })),
  });

  const [chapter, topics] = await Promise.all([
    prisma.chapter.findUnique({
      where: { id: chapterId },
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
    prisma.topic.findMany({
      where: {
        chapterId,
        name: { in: names },
      },
      select: {
        id: true,
        name: true,
        chapter: {
          select: { id: true, name: true },
        },
        _count: { select: { mindMaps: true, question: true } },
      },
    }),
  ]);

  return successResponse(
    { chapter: reduceChapter(chapter), topics },
    "Topics created successfully!"
  );
});
