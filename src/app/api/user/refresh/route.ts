import { catchApiError } from "../../_utils/catchApiError";
import { CustomError, successResponse } from "../../_utils/Response";
import { verifyRefreshToken, generateAccessToken } from "@/utils/tokens";
import { NextRequest } from "next/server";

export const GET = catchApiError(async (req: NextRequest) => {
  const refreshToken = req.cookies.get("refreshToken")?.value || req.headers.get("x-refresh-token") || "";

  if (!refreshToken) {
    return CustomError("Missing refresh token", 400);
  }

  const payload = await verifyRefreshToken(refreshToken);

  if (!payload) {
    return CustomError("Invalid or expired refresh token", 401);
  }

  const newAccessToken = await generateAccessToken({
    id: payload.id,
    username: payload.username,
    email: payload.email,
    name: payload.name,
    phone: payload.phone,
  });

  return successResponse(
    {
      accessToken: newAccessToken,
    },
    "Access token refreshed"
  );
});
