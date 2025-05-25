import { prisma } from "@/service/prisma";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { NextRequest } from "next/server";

export const GET = catchApiError(async () => {
  const streams = await prisma.stream.findMany({
    select: {
      id: true,
      name: true,
      course: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  return successResponse(streams);
});

export const POST = catchApiError(async (request: NextRequest) => {
  const data = await request.json();

  if (!data.name) CustomError("Name is required to create stream!");

  const stream = await prisma.stream.create({ data: { name: data.name } });

  return successResponse(stream);
});
