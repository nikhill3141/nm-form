import { z } from "zod";
import { authTokenSchema, emailSchema, passwordSchema, uuidSchema } from "../shared/schema";


//get user by Email 
export const getUserByEmailInput = z.object({
  email: emailSchema.describe("The email of the user"),
})

export type GetUserByEmailInputType = z.infer<typeof getUserByEmailInput>

//create user
export const createUserWithEmailAndPasswordInputSchema = z.object({
  email: emailSchema.describe("The email of the user"),
  password: passwordSchema.describe("The password of the user"),
  fullName: z.string().trim().min(2).max(80).describe("The full name of the user"),
});
export type CreateUserWithEmailAndPasswordInputSchemaType= z.infer<typeof createUserWithEmailAndPasswordInputSchema>


//token-payload and type
export const generateUserTokenPayload = z.object({
  id: uuidSchema.describe("The UUID of the user")
})
export type GenerateUserTokenPayloadType = z.infer<typeof generateUserTokenPayload>


//signin input
export const signInUserWithEmailAndPasswordInput = z.object({
  email: emailSchema.describe("email of the user"),
  password: z.string().min(1).describe("password of the user")
})
export type SignInUserWIthEmailAndPasswordInputType = z.infer<typeof signInUserWithEmailAndPasswordInput>

export const verifyEmailInput = z.object({
  token: authTokenSchema.describe("email verification token"),
});
export type VerifyEmailInputType = z.infer<typeof verifyEmailInput>

export const requestPasswordResetInput = z.object({
  email: emailSchema.describe("email of the user"),
});
export type RequestPasswordResetInputType = z.infer<typeof requestPasswordResetInput>

export const resetPasswordInput = z.object({
  token: authTokenSchema.describe("password reset token"),
  password: passwordSchema.describe("new password"),
});
export type ResetPasswordInputType = z.infer<typeof resetPasswordInput>
