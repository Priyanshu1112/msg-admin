import { NextResponse } from "next/server";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const successResponse = (data: any, message = "") => {
  return NextResponse.json({
    status: 200,
    success: true,
    data: data,
    ...(message ? { message } : {}),
  });
};

export class AppError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

export const CustomError = (message: string, status?: number) => {
  throw new AppError(message, status);
};
