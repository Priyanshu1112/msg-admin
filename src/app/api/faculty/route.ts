import { NextRequest } from "next/server";
import { catchApiError } from "../_utils/catchApiError";
import { CustomError, successResponse } from "../_utils/Response";
import { prisma } from "@/service/prisma";

export const GET = catchApiError(async () => {
  const faculties = await prisma.faculty.findMany({
    select: {
      id: true,
      name: true,
      bio: true,
      qualification: true,
      imageUrl: true,
    },
  });

  return successResponse(faculties);
});

export const POST = catchApiError(async (request: NextRequest) => {
  const formData = await request.formData();

  const name = formData.get("name") as string;
  const qualification = formData.get("qualification") as string;
  const bio = formData.get("bio") as string;
  const image = formData.get("image") as string | null;

  if (!name) CustomError("Faculty name is required!");
  if (!qualification) CustomError("Qualification is required!");
  if (!bio) CustomError("Bio is required!");

  const imageUrl: string | null = image;

  //   if (image) {
  //     const buffer = Buffer.from(await image.arrayBuffer());
  //     imageUrl = `data:${image.type};base64,${buffer.toString("base64")}`;
  //   }

  const faculty = await prisma.faculty.create({
    data: {
      name,
      qualification,
      bio,
      imageUrl,
    },
  });

  return successResponse(faculty, "Faculty created successfully!");
});
