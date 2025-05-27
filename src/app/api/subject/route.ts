import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextRequest, NextResponse } from "next/server";
import { CustomError, successResponse } from "../_utils/Response";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const reduceSubject = (subject: any) => {
  let totalTopics = 0;
  let totalMindmaps = 0;
  let totalQuestions = 0;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject.chapters.forEach((chapter: any) => {
    totalTopics += chapter._count.topics;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    chapter.topics.forEach((topic: any) => {
      totalMindmaps += topic._count.mindMaps;
      totalQuestions += topic._count.question;
    });
  });

  return {
    id: subject.id,
    name: subject.name,
    year: subject.year,
    country: subject.country,
    stream: subject.stream,
    course: subject.course,
    _count: {
      chapters: subject._count.chapters,
      topics: totalTopics,
      mindMaps: totalMindmaps,
      questions: totalQuestions,
    },
  };
};

export const GET = catchApiError(async () => {
  const subjectsRaw = await prisma.subject.findMany({
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
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  const subjects = subjectsRaw.map((subject) => {
    return reduceSubject(subject);
  });

  return NextResponse.json({ success: true, data: subjects });
});

export const POST = catchApiError(async (req: NextRequest) => {
  const { name, country, stream, course, year } = await req.json();

  const foundStream = await prisma.stream.findFirst({
    where: { id: stream },
    select: { _count: { select: { course: true } } },
  });

  if (foundStream && foundStream._count.course > 0 && !course)
    CustomError("Course is required for this stream!");

  const subject = await prisma.subject.create({
    data: {
      name,
      country,
      streamId: stream,
      year,
      ...(course ? { courseId: course } : {}),
    },
    include: {
      stream: { select: { id: true, name: true } },
      course: { select: { id: true, name: true } },
    },
  });

  return successResponse(
    {
      ...subject,
      _count: { chapters: 0, topics: 0, mindMaps: 0, questions: 0 },
    },
    "Subject created successfully"
  );
});
