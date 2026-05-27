import { z } from "zod";


//get user by Email 
export const getUserByEmailInput = z.object({
  email: z.email().transform((value) => value.toLowerCase()).describe("The email of the user"),
})

export type GetUserByEmailInputType = z.infer<typeof getUserByEmailInput>

//create user
export const createUserWithEmailAndPasswordInputSchema = z.object({
  email: z.email().transform((value) => value.toLowerCase()).describe("The email of the user"),
  password: z.string().min(8).max(128).describe("The password of the user"),
  fullName: z.string().trim().min(2).max(80).describe("The full name of the user"),
});
export type CreateUserWithEmailAndPasswordInputSchemaType= z.infer<typeof createUserWithEmailAndPasswordInputSchema>


//token-payload and type
export const generateUserTokenPayload = z.object({
  id: z.string().describe("The UUID of the user")
})
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>


//signin input
export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().transform((value) => value.toLowerCase()).describe("email of the user"),
  password: z.string().min(1).describe("password of the user")
})
export type SignInUserWIthEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>

export const verifyEmailInput = z.object({
  token: z.string().min(20).describe("email verification token"),
});
export type VerifyEmailInputType = z.infer<typeof verifyEmailInput>

export const requestPasswordResetInput = z.object({
  email: z.email().transform((value) => value.toLowerCase()).describe("email of the user"),
});
export type RequestPasswordResetInputType = z.infer<typeof requestPasswordResetInput>

export const resetPasswordInput = z.object({
  token: z.string().min(20).describe("password reset token"),
  password: z.string().min(8).max(128).describe("new password"),
});
export type ResetPasswordInputType = z.infer<typeof resetPasswordInput>

