import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { reduceSubject } from "@/app/api/subject/route";
import { prisma } from "@/service/prisma";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    req: NextRequest,
    { params }: { params: Promise<{ streamAndYear?: string[] }> }
  ) => {
    const [streamId, yearStr] = (await params).streamAndYear || [];
    const year = parseInt(yearStr || "", 10);

    if (!streamId || isNaN(year)) {
      return CustomError("Missing or invalid stream ID or year", 400);
    }

    const subjectsRaw = await prisma.subject.findMany({
      where: {
        streamId,
        year: { has: year }, // 🔍 match year inside array
      },
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
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const subjects = subjectsRaw.map(reduceSubject);
    return successResponse(subjects, "Subjects fetched successfully!");
  }
);
