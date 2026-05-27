import { userService } from "../../services";
import { createUserWithEmailAndPasswordInputSchema, createUserWithEmailAndPasswordOutputSchema, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, guestLoginOutputModel, logoutOutputModel, refreshTokenVerificationInputModel, refreshTokenVerificationOutputModel, requestPasswordResetInputModel, requestPasswordResetOutputModel, resetPasswordInputModel, resetPasswordOutputModel, signInUserWithEmailAndPasswordInput, signInUserWithEmailAndPasswordOutput, verifyEmailInputModel, verifyEmailOutputModel } from "../auth/model";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { clearAuthenticationCookie, getRefreshTokenCookie, setAccessTokenCookie, setRefreshTokenCookie } from "../../utils/cookie";
import { assertRateLimit } from "../../utils/rate-limit";



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
    await assertRateLimit({
      key: `auth:signin:${ctx.requestIp ?? "unknown"}:${email}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: "Too many sign-in attempts. Please wait before trying again.",
    });
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
    await assertRateLimit({
      key: `auth:signup:${ctx.requestIp ?? "unknown"}`,
      limit: 5,
      windowMs: 60 * 60 * 1000,
      message: "Too many account creation attempts. Please wait before creating another account.",
    });

    const {id, verificationToken, emailVerificationRequired} = await userService.createUserWithEmailAndPassword({
      fullName,email,password
    })

    return{
      id,
      verificationToken,
      emailVerificationRequired,
    }
  }),

  guestLogin: publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/guest-login"),
      tags:TAGS
    }
  })
  .output(guestLoginOutputModel)
  .mutation(async ({ctx})=>{
    await assertRateLimit({
      key: `auth:guest:${ctx.requestIp ?? "unknown"}`,
      limit: 20,
      windowMs: 60 * 60 * 1000,
      message: "Too many guest login attempts. Please wait and try again.",
    });
    const {id, refreshToken, accessToken} = await userService.signinGuestUser()
    setAccessTokenCookie(ctx,accessToken)
    setRefreshTokenCookie(ctx,refreshToken)

    return {
      id,
    }
  }),

//this will add email logic is future
  verifyEmail: publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/verify-email"),
      tags:TAGS
    }
  })
  .input(verifyEmailInputModel)
  .output(verifyEmailOutputModel)
  .mutation(async ({input, ctx})=>{
    await assertRateLimit({
      key: `auth:verify-email:${ctx.requestIp ?? "unknown"}`,
      limit: 10,
      windowMs: 15 * 60 * 1000,
      message: "Too many verification attempts. Please wait before trying again.",
    });
    const {id, refreshToken, accessToken} = await userService.verifyEmail(input)
    setAccessTokenCookie(ctx,accessToken)
    setRefreshTokenCookie(ctx,refreshToken)

    return {
      id,
    }
  }),

  requestPasswordReset: publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/request-password-reset"),
      tags:TAGS
    }
  })
  .input(requestPasswordResetInputModel)
  .output(requestPasswordResetOutputModel)
  .mutation(async ({input, ctx})=>{
    await assertRateLimit({
      key: `auth:password-reset-request:${ctx.requestIp ?? "unknown"}:${input.email}`,
      limit: 3,
      windowMs: 15 * 60 * 1000,
      message: "Too many password reset requests. Please wait before trying again.",
    });

    return await userService.requestPasswordReset(input)
  }),
//resetPassword will get the email verification flow in future
  resetPassword: publicProcedure
  .meta({
    openapi:{
      method:"POST",
      path:getPath("/reset-password"),
      tags:TAGS
    }
  })
  .input(resetPasswordInputModel)
  .output(resetPasswordOutputModel)
  .mutation(async ({input, ctx})=>{
    await assertRateLimit({
      key: `auth:password-reset:${ctx.requestIp ?? "unknown"}`,
      limit: 5,
      windowMs: 15 * 60 * 1000,
      message: "Too many password reset attempts. Please wait before trying again.",
    });

    return await userService.resetPassword(input)
  }),

  //token_varification and reseting (email in future)
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
    const {id,email, fullName, profileImageUrl, emailVerified} = ctx.user

    return{
      id,
      email,
      fullName,
      profileImageUrl,
      emailVerified
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
