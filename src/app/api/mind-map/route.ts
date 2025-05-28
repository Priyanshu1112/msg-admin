/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest } from "next/server";
import { prisma } from "@/service/prisma";
import { randomUUID } from "crypto";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";

export const POST = catchApiError(async (request: NextRequest) => {
  const { topicId, mindMaps } = await request.json();

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
    select: { id: true }
  });

  if (!existingTopic) {
    CustomError("Topic not found");
  }

  // Validate mind map structure
  mindMaps.forEach((mindMap: { id: any; name: any; }, index: any) => {
    if (!mindMap || typeof mindMap !== 'object') {
      CustomError(`Mind map at index ${index} is invalid`);
    }

    // Basic structure validation - adjust based on your ExtendedMindMapNode interface
    if (!mindMap.id || !mindMap.name) {
      CustomError(`Mind map at index ${index} must have 'id' and 'name' properties`);
    }
  });

  // Prepare mind maps for bulk creation
  const mindMapsForBulkCreate = mindMaps.map((mindMap: any) => ({
    id: randomUUID(),
    topicId: topicId,
    mindMap: mindMap, // Store the entire mind map structure as JSON
  }));

  // Perform bulk creation
  await prisma.mindMap.createMany({
    data: mindMapsForBulkCreate,
  });

  // Get updated topic with counts
  const updatedTopic = await prisma.topic.findUnique({
    where: { id: topicId },
    select: {
      id: true,
      name: true,
      _count: { select: { question: true, mindMaps: true } },
    },
  });

  return successResponse(
    updatedTopic,
    `Successfully created ${mindMaps.length} mind map(s)`
  );
});