import { prisma } from "@/service/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

export const GET = async () => {
  try {
    const admins = await prisma.admin.findMany();

    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unexpected error occured!",
      status: 500,
    });
  }
};

export const POST = async (request: NextRequest) => {
  try {
    const { username, phone, email, fullName, password } = await request.json();
    const hashedPassword = await bcrypt.hash(password, 10);

    let formattedPhone = phone;
    if (!phone.startsWith("+91 ")) {
      formattedPhone = "+91 " + phone;
    }

    const newUser = await prisma.admin.create({
      data: {
        username,
        phone: formattedPhone,
        email,
        fullName,
        adminAuth: {
          create: {
            password: hashedPassword,
          },
        },
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unexpected error occurred!",
      status: 500,
    });
  }
};
