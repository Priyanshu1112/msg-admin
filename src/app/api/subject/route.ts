import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextResponse } from "next/server";

export const GET = catchApiError(async () => {
  const subjects = await prisma.subject.findMany({
    include: {
      _count: {
        select: { chapters: true },
      },
      chapters: {
        select: {
          topics: {
            select: { _count: { select: { mindMaps: true, question: true } } },
          },
          _count: {
            select: { topics: true },
          },
        },
      },
    },
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  return NextResponse.json({ success: true, data: subjects });
});
