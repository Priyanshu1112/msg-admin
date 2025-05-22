import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { NextResponse } from "next/server";

export const GET = catchApiError(async () => {
  const topics = await prisma.topic.findMany({
    include: {
      _count: { select: { mindMaps: true, question: true } },
    },
    orderBy: {
      name: "asc",
    },
    take: 10,
  });

  return NextResponse.json({ success: true, data: topics });
});
