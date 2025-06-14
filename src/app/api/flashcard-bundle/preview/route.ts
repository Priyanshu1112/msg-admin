import { prisma } from "@/service/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { year, tags } = body;

    if (
      !year ||
      year < 1 ||
      year > 5 ||
      !Array.isArray(tags) ||
      tags.length === 0
    ) {
      return NextResponse.json(
        { error: "Invalid year or tags" },
        { status: 400 }
      );
    }

    const matchingFlashCardCount = await prisma.flashCard.count({
      where: {
        tags: {
          hasSome: tags, // case-sensitive match
        },
        topic: {
          chapter: {
            subject: {
              year: {
                has: year, // assuming subject.year is string[]
              },
            },
          },
        },
      },
    });

    console.log(tags, year, matchingFlashCardCount);

    return NextResponse.json({ matchingFlashCardCount });
  } catch (error) {
    console.error("Error fetching flashcard count:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
