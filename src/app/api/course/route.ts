import { NextRequest } from "next/server";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { prisma } from "@/service/prisma";

export const POST = catchApiError(async (request: NextRequest) => {
  const data = await request.json();

  if (!data.name && !data.streamId)
    CustomError("Both name and stream Id is required to create course!");

  const course = await prisma.course.create({
    data: { name: data.name, streamId: data.streamId },
  });

  return successResponse(course);
});
