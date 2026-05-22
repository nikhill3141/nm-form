import { z } from "zod";


//get user by Email 
export const getUserByEmailInput = z.object({
  email: z.email().describe("The email of the user"),
})

export type GetUserByEmailInputType = z.infer<typeof getUserByEmailInput>

//create user
export const createUserWithEmailAndPasswordInputSchema = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().describe("The password of the user"),
  fullName: z.string().describe("The full name of the user"),
});
export type CreateUserWithEmailAndPasswordInputSchemaType= z.infer<typeof createUserWithEmailAndPasswordInputSchema>


//token-payload and type
export const generateUserTokenPayload = z.object({
  id: z.string().describe("The UUID of the user")
})
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>


//signin input
export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user")
})
export type SignInUserWIthEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>



