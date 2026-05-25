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

const accessTokenCookieOpt:CookieOptions = {
  path:"/",
  httpOnly:true,
  secure:false,
  sameSite:"strict",
  maxAge: 60*1000*60 //1hr
}
const refreshTokenCookieOpt:CookieOptions = {
  path:"/",
  httpOnly:true,
  secure:false,
  sameSite:"strict",
  maxAge: 60*1000*60*24*7 //7 days
}

//auth cookies
export function setAccessTokenCookie(ctx:TRPCContext, accessToken:string){
  ctx.createCookie('access_token',accessToken,accessTokenCookieOpt)
}
export function setRefreshTokenCookie(ctx:TRPCContext, refreshToken:string){
  ctx.createCookie('refresh_token',refreshToken ,refreshTokenCookieOpt)
}

export function getAccessTokenCookie(ctx:TRPCContext){
  return ctx.getCookie('access_token')
}
export function getRefreshTokenCookie(ctx:TRPCContext){
  return ctx.getCookie('refresh_token')
}
export function clearAuthenticationCookie(ctx:TRPCContext,title:string){
   ctx.clearCookie(title)
}
