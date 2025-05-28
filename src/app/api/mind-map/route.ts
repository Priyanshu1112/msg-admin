import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/service/prisma";
import { randomUUID } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { topicId, mindMaps } = await request.json();

    if (!topicId || !mindMaps || !Array.isArray(mindMaps)) {
      return NextResponse.json(
        { message: "Invalid request: topicId and mindMaps array required" },
        { status: 400 }
      );
    }

    // Prepare mind maps for bulk creation
    const mindMapsForBulkCreate = mindMaps.map((mindMap) => ({
      id: randomUUID(),
      topicId: topicId,
      mindMap: mindMap, // Store the entire mind map structure as JSON
    }));

    // Perform bulk creation
    await prisma.mindMap.createMany({
      data: mindMapsForBulkCreate,
    });

    // Get updated topic with counts
    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,
        _count: { select: { question: true, mindMaps: true } },
      },
    });

    return NextResponse.json(
      {
        message: `Successfully created ${mindMaps.length} mind map(s)`,
        data: topic,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Mind map creation error:", error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
