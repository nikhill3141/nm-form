import UserService from "@repo/services/user";
import type { TRPCContext } from "../context";
import {
  clearAuthenticationCookie,
  getAccessTokenCookie,
  getRefreshTokenCookie,
  setAccessTokenCookie,
  setRefreshTokenCookie,
} from "./cookie";

const userService = new UserService();

export async function authenticateRequest(ctx: TRPCContext) {
  const accessToken = getAccessTokenCookie(ctx);

  if (accessToken) {
    try {
      return await userService.verifyAndDecodeUserToken(accessToken);
    } catch {
      // Fall through to refresh-cookie recovery.
    }
  }

  const refreshToken = getRefreshTokenCookie(ctx);
  if (!refreshToken) {
    throw new Error("User is not logged in");
  }

  try {
    const refreshed = await userService.checkUserRefreshToken(refreshToken);
    setAccessTokenCookie(ctx, refreshed.accessToken);
    setRefreshTokenCookie(ctx, refreshed.refreshToken);
    return await userService.verifyAndDecodeUserToken(refreshed.accessToken);
  } catch (error) {
    clearAuthenticationCookie(ctx, "access_token");
    clearAuthenticationCookie(ctx, "refresh_token");
    throw error;
  }
}
