import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";

export const PUT = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;
    const body = await req.json();

    if (!id) {
      CustomError("Id is required to update mind-map.");
    }

    // Collect only the allowed fields if they exist
    const updateData: {
      name?: string;
      description?: string | null;
      mindMap?: string; // Prisma Json accepts any
    } = {};

    if (typeof body.name === "string" && body.name.trim() !== "") {
      updateData.name = body.name.trim();
    }

    if ("description" in body) {
      // allow null or string
      updateData.description = body.description ?? null;
    }

    if ("mindMap" in body) {
      // If they passed mindMap, we store it as JSON
      updateData.mindMap = body.mindMap;
    }

    // If nothing to update, bail
    if (Object.keys(updateData).length === 0) {
      CustomError("No updatable fields (name, description, mindMap) provided.");
    }

    const updated = await prisma.mindMap.update({
      where: { id },
      data: updateData,
    });

    return successResponse(updated, "MindMap updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete mind-map.");

    const res = await prisma.mindMap.delete({ where: { id } });

    return successResponse(res, "Mindmap deleted successfully!");
  }
);
