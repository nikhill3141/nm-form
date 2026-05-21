import { z } from "zod";

export const createUserWithEmailAndPasswordInputSchema = z.object({
  email: z.email().describe("The email of the user"),
  password: z.string().describe("The password of the user"),
  fullName: z.string().describe("The full name of the user"),
  profileImageUrl: z.string().describe("The profile image URL of the user").optional(),
});


export const createUserWithEmailAndPasswordOutputSchema = z.object({
  id: z.string().describe("The UUID of the user"),
});



export const signInUserWithEmailAndPasswordInput = z.object({
  email: z.email().describe("email of the user"),
  password: z.string().describe("password of the user"),
})
export const signInUserWithEmailAndPasswordOutput = z.object({
  id: z.string().describe("id of the user"),
})