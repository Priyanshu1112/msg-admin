import { ParsedOption, ParsedQuestion } from "@/app/(dahboard)/_parser/mcq";
import { prisma } from "@/service/prisma";
import { Prisma } from "@prisma/client";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { file, topicId } = await request.json();

    // Prepare data structures
    const questionsForBulkCreate: Prisma.QuestionCreateManyInput[] = [];
    const options: Prisma.OptionCreateManyInput[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const questionsWithImages: { id: string; images: any }[] = [];

    // Prepare data for bulk insertion
    file.forEach((f: ParsedQuestion) => {
      const id = randomUUID();

      // Add to questions array WITHOUT images field
      questionsForBulkCreate.push({
        id,
        text: f.question,
        topicId: topicId,
        explanation: f.explanation,
        // Omitting images field for bulk creation
      });

      // Track questions that have images for later update
      if (f.images && f.images.length > 0) {
        questionsWithImages.push({
          id,
          images: f.images,
        });
      }

      // Prepare options for bulk creation
      f.options.forEach((o: ParsedOption) => {
        options.push({
          text: o.text,
          isCorrect: o.isCorrect,
          questionId: id,
        });
      });
    });

    // Perform bulk operations inside a transaction
    await prisma.$transaction([
      // 1. Create all questions (without images)
      prisma.question.createMany({
        data: questionsForBulkCreate,
      }),

      // 2. Create all options
      prisma.option.createMany({
        data: options,
      }),
    ]);

    // 3. Update questions with images individually
    if (questionsWithImages.length > 0) {
      await Promise.all(
        questionsWithImages.map((q) =>
          prisma.question.update({
            where: { id: q.id },
            data: {
              images: q.images as Prisma.InputJsonValue,
            },
          })
        )
      );
    }

    const topic = await prisma.topic.findUnique({
      where: { id: topicId },
      select: {
        id: true,
        name: true,
        _count: { select: { question: true, mindMaps: true } },
      },
    });

    return NextResponse.json(topic, { status: 201 });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        message:
          error instanceof Error ? error.message : "Something went wrong",
      },
      { status: 500 }
    );
  }
}
