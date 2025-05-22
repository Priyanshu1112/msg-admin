import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextResponse } from "next/server";

export const GET = catchApiError(async () => {
  const subjectsRaw = await prisma.subject.findMany({
    select: {
      id: true,
      name: true,
      year: true,
      country: true,
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
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  const subjects = subjectsRaw.map((subject) => {
    let totalTopics = 0;
    let totalMindmaps = 0;
    let totalQuestions = 0;

    subject.chapters.forEach((chapter) => {
      totalTopics += chapter._count.topics;
      chapter.topics.forEach((topic) => {
        totalMindmaps += topic._count.mindMaps;
        totalQuestions += topic._count.question;
      });
    });

    return {
      id: subject.id,
      name: subject.name,
      year: subject.year,
      country: subject.country,
      _count: {
        chapters: subject._count.chapters,
        topics: totalTopics,
        mindmaps: totalMindmaps,
        questions: totalQuestions,
      },
    };
  });

  return NextResponse.json({ success: true, data: subjects });
});
