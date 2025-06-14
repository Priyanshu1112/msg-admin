import { catchApiError } from "@/app/api/_utils/catchApiError";
import { CustomError, successResponse } from "@/app/api/_utils/Response";
import { prisma } from "@/service/prisma";
import { BundleType } from "@prisma/client";
import { NextRequest } from "next/server";

export const GET = catchApiError(
  async (
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const { id } = await params;
    if (!id) return CustomError("Topic id is required!");

    const searchParams = request.nextUrl.searchParams;
    const typeParam = searchParams.get("type") || "question";

    // Convert string to BundleType safely
    const bundleType = typeParam as keyof typeof BundleType;
    if (!(bundleType in BundleType)) {
      return CustomError("Invalid content type.");
    }

    const typedValue = BundleType[bundleType];

    const questionBundles = await prisma.bundle.findMany({
      where: { topicId: id, type: typedValue },
      select: {
        id: true,
        name: true,
        description: true,
        _count: {
          select:
            typedValue === BundleType.MCQ
              ? { questions: true }
              : { flashCards: true },
        },
      },
    });

    return successResponse(questionBundles);
  }
);
