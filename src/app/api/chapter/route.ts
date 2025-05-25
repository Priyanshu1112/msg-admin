import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextResponse } from "next/server";

export const GET = catchApiError(async () => {
  const rawChapters = await prisma.chapter.findMany({
    select: {
      id: true,
      name: true,
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
    let totalMindmaps = 0;
    let totalQuestions = 0;

    chapter.topics.forEach((topic) => {
      totalMindmaps += topic._count.mindMaps;
      totalQuestions += topic._count.question;
    });

    return {
      id: chapter.id,
      name: chapter.name,
      _count: {
        topics: chapter._count.topics,
        mindMaps: totalMindmaps,
        questions: totalQuestions,
      },
    };
  });

  return NextResponse.json({ success: true, data: chapters });
});
