import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export const GET = async () => {
  try {
        const hashedPassword = await bcrypt.hash('admin', 10);
    

    return NextResponse.json(hashedPassword);
  } catch (error) {
    return NextResponse.json({
      success: false,
      message:
        error instanceof Error ? error.message : "Unexpected error occured!",
      status: 500,
    });
  }
};  