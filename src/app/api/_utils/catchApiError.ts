/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from "next/server";

/**
 * Generic handler for async API routes in Next.js App Router.
 * Catches any thrown error and returns a standardized JSON error response.
 */
export function catchApiError<T extends (...args: any[]) => Promise<Response>>(
  handler: T
): (...args: Parameters<T>) => Promise<Response> {
  return async (...args: Parameters<T>): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error: any) {
      console.error(
        "API Error:",
        error instanceof Error
          ? {
              cause: error.cause,
              name: error.name,
              stack: error.stack,
              msg: error.message,
            }
          : error
      );

      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unexpected error occurred",
        },
        { status: 500 }
      );
    }
  };
}
