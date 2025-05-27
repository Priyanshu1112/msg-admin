import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";
import { reduceSubject } from "../route";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    if (!id) CustomError("Id is required to update subject.");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = {};

    if (body.name !== undefined) data.name = body.name;
    if (body.country !== undefined) data.country = body.country;
    if (body.year !== undefined) data.year = body.year;

    if (body.stream !== undefined) {
      data.stream = {
        connect: { id: body.stream },
      };

      if (!body.course) {
        // optionally disconnect the course if empty string is provided
        data.course = { disconnect: true };
      }
    }

    if (body.course !== undefined) {
      if (body.course === "") {
        // optionally disconnect the course if empty string is provided
        data.course = { disconnect: true };
      } else {
        data.course = {
          connect: { id: body.course },
        };
      }
    }

    console.log(data);

    const res = await prisma.subject.update({
      where: { id },
      data: data,
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
    });

    return successResponse(reduceSubject(res), "Subject updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete subject.");

    const res = await prisma.subject.delete({ where: { id } });

    return successResponse(res, "Subject deleted successfully!");
  }
);
