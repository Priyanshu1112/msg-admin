import { prisma } from "@/service/prisma";
import { catchApiError } from "../../_utils/catchApiError";
import { successResponse } from "../../_utils/Response";

export const GET = catchApiError(async () => {
  const streams = await prisma.stream.findMany({
    select: { id: true, name: true },
  });

  return successResponse({ streams }, "");
});
