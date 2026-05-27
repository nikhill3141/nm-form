import { z } from "zod";

export const uuidSchema = z.uuid();

export const emailSchema = z
  .email()
  .transform((value) => value.toLowerCase());

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password must be at most 128 characters.")
  .regex(/[A-Za-z]/, "Password must include at least one letter.")
  .regex(/\d/, "Password must include at least one number.");

export const nonEmptyTrimmedStringSchema = z.string().trim().min(1);

export const formTitleSchema = nonEmptyTrimmedStringSchema.max(255);
export const formDescriptionSchema = z.string().max(2000);
export const fieldLabelSchema = nonEmptyTrimmedStringSchema.max(255);
export const optionalFieldTextSchema = z.string().max(255).optional();
export const authTokenSchema = z.string().min(20);
export const formPasswordSchema = z.string().min(4).max(80);

export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(50).default(20),
});
