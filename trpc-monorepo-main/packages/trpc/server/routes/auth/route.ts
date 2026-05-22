import { userService } from "../../services";
import { createUserWithEmailAndPasswordInputSchema, createUserWithEmailAndPasswordOutputSchema, getLoggedInUserInfoInputModel, getLoggedInUserInfoOutputModel, refreshTokenVerificationInputModel, refreshTokenVerificationOutputModel, signInUserWithEmailAndPasswordInput, signInUserWithEmailAndPasswordOutput } from "../auth/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie, setAccessTokenCookie, setRefreshTokenCookie } from "../../utils/cookie";



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
  .query(async ({input}) => {
    const {token} = await refreshTokenVerificationInputModel.parseAsync(input)

    const{refreshToken, accessToken} = await userService.checkUserRefreshToken(token)
    return{
      refreshToken,
      accessToken
    }
  }),

  //getme route
  getLogedInUser: publicProcedure.
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
    const userToken = await getAccessTokenCookie(ctx)
    if(!userToken) throw new Error(`user is not logged in`)
    
    const {id,email, fullName, profileImageUrl} = await userService.verifyAndDecodeUserToken(userToken) 
    
    return{
      id,
      email,
      fullName,
      profileImageUrl
    }

  })




  
});
