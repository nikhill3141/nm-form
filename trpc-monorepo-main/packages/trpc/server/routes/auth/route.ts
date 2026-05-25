import { userService } from "../../services";
import { createUserWithEmailAndPasswordInputSchema, createUserWithEmailAndPasswordOutputSchema, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, logoutOutputModel, refreshTokenVerificationInputModel, refreshTokenVerificationOutputModel, signInUserWithEmailAndPasswordInput, signInUserWithEmailAndPasswordOutput } from "../auth/model";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { clearAuthenticationCookie, getRefreshTokenCookie, setAccessTokenCookie, setRefreshTokenCookie } from "../../utils/cookie";



const TAGS = ["Authentication"];
const getPath = generatePath("/auth");

export const authRouter = router({
  //SignIn procedure
  signinUserWithEmailAndPassword : publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/signinUserWithEmailAndPassword"),
      tags:TAGS
    }
  }).input(signInUserWithEmailAndPasswordInput)
  .output(signInUserWithEmailAndPasswordOutput)
  .mutation(async ({input, ctx})=>{
    const {email, password} = input
    const {id, refreshToken, accessToken} = await userService.signinUserWithEmailAndPassword({email, password})
    setAccessTokenCookie(ctx,accessToken)
    setRefreshTokenCookie(ctx,refreshToken)
    return{
      id
    }
  })
  ,
  

  //signUp procedure
  createUserWithEmailAndPassword : publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/createUserWithEmailAndPassword"),
      tags:TAGS
    }
  })
  .input(createUserWithEmailAndPasswordInputSchema)
  .output(createUserWithEmailAndPasswordOutputSchema)
  .mutation(async ({input, ctx})=>{
    const {fullName, email, password} = input

    const {id, refreshToken, accessToken} = await userService.createUserWithEmailAndPassword({
      fullName,email,password
    })
    //sending cookies
    setAccessTokenCookie(ctx,accessToken)
    setRefreshTokenCookie(ctx,refreshToken)

    return{
      id,
    }
  }),

  //token_varification and reseting
  refreshTokenRecreation : publicProcedure
  .meta({
    openapi:{
    method:"GET",
    path:getPath("/refresh-token-recreation"),
    tags:TAGS}
  })
  .input(refreshTokenVerificationInputModel)
  .output(refreshTokenVerificationOutputModel)
  .query(async ({input, ctx}) => {
    const fallbackToken = getRefreshTokenCookie(ctx);
    const {token} = await refreshTokenVerificationInputModel.parseAsync(input)

    const refreshTokenToVerify = token || fallbackToken;
    if (!refreshTokenToVerify) throw new Error("Invalid refreshToken");

    const{refreshToken, accessToken} = await userService.checkUserRefreshToken(refreshTokenToVerify)
    setAccessTokenCookie(ctx,accessToken)
    setRefreshTokenCookie(ctx,refreshToken)
    return{
      refreshToken,
      accessToken
    }
  }),

  //getme route
  getLogedInUser: protectedProcedure.
  meta({
    openapi:{
      method:"GET",
      path: getPath("/userInfo"),
      tags:TAGS
    }
  })
  .input(getLoggedInUserInfoInputModel)
  .output(getLoggedInUserInfoOutputModel)
  .query(async ({ctx})=>{
    const {id,email, fullName, profileImageUrl} = ctx.user

    return{
      id,
      email,
      fullName,
      profileImageUrl
    }

  }),

  logout: protectedProcedure
  .meta({
    openapi:{
      method:"POST",
      path: getPath("/logout"),
      tags:TAGS
    }
  })
  .output(logoutOutputModel)
  .mutation(async ({ctx})=>{
    clearAuthenticationCookie(ctx, "access_token")
    clearAuthenticationCookie(ctx, "refresh_token")

    return {
      success: true
    }
  })




  
});
