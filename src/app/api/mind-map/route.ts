/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/service/prisma";
import { randomUUID } from "crypto";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { MindMap } from "@/store/content";

export const POST = catchApiError(async (request: NextRequest) => {
  const { topicId, mindMaps }: { topicId: string; mindMaps: MindMap[] } =
    await request.json();

  // Validation
  if (!topicId) {
    CustomError("Topic ID is required");
  }

  if (!mindMaps || !Array.isArray(mindMaps) || mindMaps.length === 0) {
    CustomError("Mind maps array is required and cannot be empty");
  }

  // Verify topic exists
  const existingTopic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: { id: true },
  });

  if (!existingTopic) {
    CustomError("Topic not found");
  }

  // Prepare mind maps for bulk creation
  const mindMapsForBulkCreate = mindMaps.map((mindMap: MindMap) => ({
    id: randomUUID(),
    topicId: topicId,
    name: mindMap.name,
    description: mindMap.description,
    mindMap: JSON.stringify(mindMap.mindMap), // Store the entire mind map structure as JSON
  }));

  // Perform bulk creation
  await prisma.mindMap.createMany({
    data: mindMapsForBulkCreate,
  });

  const createdMindMaps = await prisma.mindMap.findMany({
    where: { topicId, name: { in: mindMaps.map((m: MindMap) => m.name) } },
    select: { id: true, mindMap: true, name: true, description: true },
  });

  return successResponse(
    createdMindMaps,
    `Successfully created ${mindMaps.length} mind map(s)`
  );
});
