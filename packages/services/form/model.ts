import { z } from "zod";
import { formThemeSchema } from "../theme/model";

const visibilitySchema = z.enum(["public", "unlisted"]);
const formStatusSchema = z.enum(["draft", "published", "deleted"]);

export const createFormInputModel = z.object({
  title: z.string().trim().min(1).max(255).describe("title string of form"),
  description: z
    .string()
    .max(2000)
    .optional()
    .default("")
    .describe("description of form"),
  visibility: visibilitySchema.describe(
    "this is the visibility options of form"
  ),
  status: formStatusSchema.describe("status of the form"),
  theme: formThemeSchema.describe("theme of the form"),
  allowAnonymous: z
    .boolean()
    .describe("boolean for form creation based on authentication"),
  expiresAt: z.iso.datetime().describe("form expiry time"),
  formPassword: z
    .string()
    .min(4)
    .max(80)
    .optional()
    .nullable()
    .describe("optional password required to open the form"),
});
export type CreateFormInputModelType = z.infer<typeof createFormInputModel>;

export const editFormInputModel = z.object({
  id: z.uuid().describe("id of the form to update"),
  title: z.string().trim().min(1).max(255).optional().describe("title string of form"),
  description: z.string().max(2000).optional().describe("description of form"),
  visibility: visibilitySchema
    .optional()
    .describe("visibility options of form"),
  status: formStatusSchema.optional().describe("status of the form"),
  theme: formThemeSchema.optional().describe("theme of the form"),
  allowAnonymous: z
    .boolean()
    .optional()
    .describe("whether anonymous responses are allowed"),
  expiresAt: z.iso.datetime().optional().describe("form expiry time"),
  isPublished: z.boolean().optional().describe("whether the form is published"),
  formPassword: z
    .string()
    .min(4)
    .max(80)
    .optional()
    .nullable()
    .describe("new password required to open the form"),
  clearPassword: z
    .boolean()
    .optional()
    .describe("remove existing form password protection"),
});
export type EditFormInputModelType = z.infer<typeof editFormInputModel>;

export const deleteFormInputModel = z.object({
  id: z.uuid().describe("id of the form to delete"),
});
export type DeleteFormInputModelType = z.infer<typeof deleteFormInputModel>;

export const getFormByIdInputModel = z.object({
  id: z.uuid().describe("id of the form"),
});
export type GetFormByIdInputModelType = z.infer<typeof getFormByIdInputModel>;

export const getPublicFormByIdInputModel = z.object({
  id: z.uuid().describe("id of the public form"),
});
export type GetPublicFormByIdInputModelType = z.infer<
  typeof getPublicFormByIdInputModel
>;
