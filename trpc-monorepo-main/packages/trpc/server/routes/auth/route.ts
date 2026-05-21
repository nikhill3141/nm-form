import { userService } from "../../services";
import { createUserWithEmailAndPasswordInputSchema, createUserWithEmailAndPasswordOutputSchema, signInUserWithEmailAndPasswordInput, signInUserWithEmailAndPasswordOutput } from "../auth/model";
import { publicProcedure, router } from "../../trpc";
import { generatePath } from "../../utils/path-generator";
import { setAuthenticationCookie } from "../../utils/cookie";


const TAGS = ["Authentication"];
const getPath = generatePath("/authentication");

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
    const {id, token} = await userService.signinUserWithEmailAndPassword({email, password})
    setAuthenticationCookie(ctx,token)
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

    const {id, token} = await userService.createUserWithEmailAndPassword({
      fullName,email,password
    })
    //sending cookies
     setAuthenticationCookie(ctx , token)

    return{
      id,
    }
  })

  
});
