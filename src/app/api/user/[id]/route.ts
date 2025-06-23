import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { successResponse, CustomError } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const body = await req.json();
    const userId = (await params).id;

    const { name, streamId, year } = body;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        streamId,
        year,
      },
      select: {
        id: true,
        name: true,
        streamId: true,
        phone: true,
        year: true,
        updatedAt: true,
      },
    });

    return successResponse(updatedUser, "User updated successfully!");
  }
);

export const GET = catchApiError(
  async (
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
  ) => {
    const userId = (await params).id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        streamId: true,
        phone: true,
        year: true,
        updatedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      return CustomError("User not found", 404);
    }

    return successResponse(user, "User fetched successfully!");
  }
);
