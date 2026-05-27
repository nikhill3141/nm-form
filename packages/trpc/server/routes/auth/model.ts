import { z } from "zod";
import { authTokenSchema, emailSchema, passwordSchema, uuidSchema } from "@repo/services/shared/schema";

//signup input output model
export const createUserWithEmailAndPasswordInputSchema = z.object({
  email: emailSchema.describe("The email of the user"),
  password: passwordSchema.describe("The password of the user"),
  fullName: z.string().trim().min(2).max(80).describe("The full name of the user"),
  profileImageUrl: z.string().describe("The profile image URL of the user").optional(),
});

export const createUserWithEmailAndPasswordOutputSchema = z.object({
  id: uuidSchema.describe("The UUID of the user"),
  verificationToken: z.string().optional().describe("demo verification token"),
  emailVerificationRequired: z.boolean(),
});


//signin input output model
export const signInUserWithEmailAndPasswordInput = z.object({
  email: emailSchema.describe("email of the user"),
  password: z.string().min(1).describe("password of the user"),
})
export const signInUserWithEmailAndPasswordOutput = z.object({
  id: uuidSchema.describe("id of the user"),
})

export const guestLoginOutputModel = z.object({
  id: uuidSchema.describe("id of the guest user"),
})

//refresh token verification input output model
export const refreshTokenVerificationInputModel = z.object({
  token : z.string().optional().describe("refresh token of the user") //this is the refreshToken
})
export const refreshTokenVerificationOutputModel = z.object({
  accessToken: z.string().describe("access token of user"),
  refreshToken : z.string().describe("refresh token of user")
})

//get logedin userinfo input output
export const getLoggedInUserInfoInputModel = z.object({})

export const getLoggedInUserInfoOutputModel = z.object({
  id: uuidSchema.describe("id of the created user"),
  email: emailSchema.describe("email of the created user"),
  fullName: z.string().describe("fullname of the created user"),
  profileImageUrl: z.string().describe("profile image url of the user").optional().nullable(),
  emailVerified: z.boolean().nullable().describe("whether the user's email is verified"),
}) 

export const logoutOutputModel = z.object({
  success: z.boolean(),
})

export const verifyEmailInputModel = z.object({
  token: authTokenSchema.describe("email verification token"),
});

export const verifyEmailOutputModel = z.object({
  id: uuidSchema.describe("verified user id"),
});

export const requestPasswordResetInputModel = z.object({
  email: emailSchema.describe("email of the user"),
});

export const requestPasswordResetOutputModel = z.object({
  success: z.boolean(),
  resetToken: z.string().optional().describe("demo reset token when email delivery is not configured"),
});

export const resetPasswordInputModel = z.object({
  token: authTokenSchema.describe("password reset token"),
  password: passwordSchema.describe("new password"),
});

export const resetPasswordOutputModel = z.object({
  success: z.boolean(),
});
