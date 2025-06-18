import { prisma } from "@/service/prisma";
import { NextRequest, NextResponse } from "next/server";

export const DELETE = async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  try {
    const id = (await params).id;

    await prisma.admin.delete({ where: { id } });

    return NextResponse.json({});
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unexpected error occured!",
      status: 500,
    });
  }
};
