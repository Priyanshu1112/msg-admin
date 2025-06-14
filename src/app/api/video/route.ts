import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { NextRequest } from "next/server";

export const POST = catchApiError(async (request: NextRequest) => {
  const { topicId, videos } = await request.json();

  if (!topicId) CustomError("Topic id is required to add videos!");

  if (!videos?.length) CustomError("No videos provided");

  const data = videos.map((v: any) => ({
    topicId,
    url: v.url,
    title: v.title,
    facultyId: v.facultyId,
  }));

  // Insert all videos
  await prisma.video.createMany({
    data,
  });

  // Fetch inserted videos with faculty details
  const insertedVideos = await prisma.video.findMany({
    where: {
      topicId,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      faculty: true,
    },
  });

  return successResponse(insertedVideos);
});
