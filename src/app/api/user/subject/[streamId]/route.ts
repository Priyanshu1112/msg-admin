import { catchApiError } from "@/app/api/_utils/catchApiError";
import { successResponse } from "@/app/api/_utils/Response";
import { reduceSubject } from "@/app/api/subject/route";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (req: NextRequest, params: Promise<{ streamId: string }>) => {
    const streamId = (await params).streamId;

    const subjectsRaw = await prisma.subject.findMany({
      where: { streamId },
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

    return successResponse(subjects, "Subjects fetched successfully!");
  }
);
