import {CreateExpressContextOptions} from '@trpc/server/adapters/express'
import { clearCookieFactory, createCookieFactory, getCookieFactory } from './utils/cookie';
export interface TRPCContext {
  createCookie:ReturnType<typeof createCookieFactory>
  getCookie:ReturnType<typeof getCookieFactory>
  clearCookie:ReturnType<typeof clearCookieFactory>
  requestIp?: string
  userAgent?: string
  user?: {
    id: string;
    email: string;
    fullName: string;
    profileImageUrl: string | null;
  }
}

export async function createContext({req, res}:CreateExpressContextOptions):Promise<TRPCContext> {
  const ctx : TRPCContext = {
    createCookie: createCookieFactory(res),
    getCookie: getCookieFactory(req),
    clearCookie: clearCookieFactory(res),
    requestIp:
      req.ip ||
      req.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim(),
    userAgent: req.headers["user-agent"],
  }


  return ctx
}
export type Context = Awaited<ReturnType<typeof createContext>>;
