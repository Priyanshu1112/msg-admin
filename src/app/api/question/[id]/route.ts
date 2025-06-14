import { NextRequest } from "next/server";
import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { prisma } from "@/service/prisma";
import { Option } from "@prisma/client";

export const PUT = catchApiError(
  async (req: Request, { params }: { params: { id: string } }) => {
    const questionId = params.id;
    const data = await req.json();

    // Update base question fields
    const updatedQuestion = await prisma.question.update({
      where: { id: questionId },
      data: {
        text: data.text,
        explanation: data.explanation,
        images: data.images,
      },
    });

    // Fetch existing options
    const existingOptions = await prisma.option.findMany({
      where: { questionId },
    });

    const existingOptionIds = new Set(existingOptions.map((o) => o.id));
    const incomingOptionIds = new Set(
      data.options.map((opt: Option) => opt.id)
    );

    // Delete removed options
    const optionsToDelete = [...existingOptionIds].filter(
      (id) => !incomingOptionIds.has(id)
    );
    if (optionsToDelete.length > 0) {
      await prisma.option.deleteMany({
        where: {
          id: { in: optionsToDelete },
        },
      });
    }

    // Upsert options (update existing or create new)
    for (const option of data.options) {
      if (existingOptionIds.has(option.id)) {
        await prisma.option.update({
          where: { id: option.id },
          data: {
            text: option.text,
            isCorrect: option.isCorrect,
          },
        });
      } else {
        await prisma.option.create({
          data: {
            id: option.id,
            text: option.text,
            isCorrect: option.isCorrect,
            questionId: questionId,
          },
        });
      }
    }

    return successResponse(updatedQuestion, "Question updated successfully!");
  }
);

export const DELETE = catchApiError(
  async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { id } = await params;

    if (!id) CustomError("Id is required to delete question.");

    const res = await prisma.question.delete({ where: { id } });

    return successResponse(res, "Question deleted successfully!");
  }
);
