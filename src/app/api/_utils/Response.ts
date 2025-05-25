import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const successResponse = (data: any, message = "") => {
  return NextResponse.json({
    success: true,
    data: data,
    ...(message ? { message } : {}),
  });
};

export const CustomError = (message: string) => {
  throw new Error(message);
};
