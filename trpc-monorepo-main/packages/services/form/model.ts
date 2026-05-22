import { z } from "zod";

const visibilitySchema = z.enum(["public", "unlisted"]);
const formStatusSchema = z.enum(["draft", "published", "deleted"]);

export const createFormInputModel = z.object({
  title: z.string().describe("title string of form"),
  description: z.string().describe("description of form"),
  visibility: visibilitySchema.describe(
    "this is the visibility options of form"
  ),
  status: formStatusSchema.describe("status of the form"),
  theme: z.string().describe("theme of the form"),
  allowAnonymous: z
    .boolean()
    .describe("boolean for form creation based on authentication"),
  expiresAt: z.iso.datetime().describe("form expiry time"),
});
export type CreateFormInputModelType = z.infer<typeof createFormInputModel>;

export const editFormInputModel = z.object({
  id: z.uuid().describe("id of the form to update"),
  title: z.string().optional().describe("title string of form"),
  description: z.string().optional().describe("description of form"),
  visibility: visibilitySchema
    .optional()
    .describe("visibility options of form"),
  status: formStatusSchema.optional().describe("status of the form"),
  theme: z.string().optional().describe("theme of the form"),
  allowAnonymous: z
    .boolean()
    .optional()
    .describe("whether anonymous responses are allowed"),
  expiresAt: z.iso.datetime().optional().describe("form expiry time"),
  isPublished: z.boolean().optional().describe("whether the form is published"),
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
