import type {CookieOptions,Request, Response} from "express"
import { TRPCContext } from "../context"
const defaultCookieOpt:CookieOptions = {
  path:"/",
  httpOnly:true,
  secure:false,
  sameSite:"strict",
  maxAge: 60*1000*60*24
}

export function createCookieFactory (res:Response){
  return function cereateCookie(
    title:string,
    value:string,
    opt: CookieOptions = defaultCookieOpt
  ){
    res.cookie(title , value , opt)
  }
}
export function getCookieFactory (req:Request){
  return function getCookie(
    title:string,
  ){
    return req.cookies[title]
  }
}
export function clearCookieFactory (res:Response){
  return function clearCookie(
    title:string,
  ){
     res.clearCookie(title)
  }
}

//auth cookies
export function setAuthenticationCookie(ctx:TRPCContext, accessToken:string){
  ctx.createCookie('authentication-token',accessToken)
}

export function getAuthenticationCookie(ctx:TRPCContext,){
  return ctx.getCookie('authentication-token')
}
export function clearAuthenticationCookie(ctx:TRPCContext,){
   ctx.clearCookie('authentication-token')
}
