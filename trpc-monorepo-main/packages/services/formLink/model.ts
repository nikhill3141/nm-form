import { z } from "zod";

export const createFormLinkInputModel = z.object({
  formId: z.uuid().describe("id of the form to share"),
  expiresAt: z.iso.datetime().optional().describe("optional link expiry time"),
});
export type CreateFormLinkInputModelType = z.infer<
  typeof createFormLinkInputModel
>;

export const getFormLinksByFormIdInputModel = z.object({
  formId: z.uuid().describe("id of the form"),
});
export type GetFormLinksByFormIdInputModelType = z.infer<
  typeof getFormLinksByFormIdInputModel
>;

export const getFormByLinkSlugInputModel = z.object({
  slug: z.string().min(1).describe("shareable form slug"),
});
export type GetFormByLinkSlugInputModelType = z.infer<
  typeof getFormByLinkSlugInputModel
>;

export const deleteFormLinkInputModel = z.object({
  id: z.uuid().describe("id of the form link to delete"),
});
export type DeleteFormLinkInputModelType = z.infer<
  typeof deleteFormLinkInputModel
>;
