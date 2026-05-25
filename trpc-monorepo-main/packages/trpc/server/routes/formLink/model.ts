import { z } from "zod";
import { formOutputModel, formRowSchema, serializeForm } from "../form/model";

const formLinkRowSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
});

export const formLinkOutputModel = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

export const serializeFormLink = (link: z.infer<typeof formLinkRowSchema>) => ({
  id: link.id,
  formId: link.formId,
  expiresAt: link.expiresAt?.toISOString() ?? null,
  createdAt: link.createdAt.toISOString(),
});

export const createFormLinkOutputModel = formLinkOutputModel;
export const getFormLinksByFormIdOutputModel = z.array(formLinkOutputModel);
export const deleteFormLinkOutputModel = formLinkOutputModel;

export const getFormBySlugOutputModel = z.object({
  link: formLinkOutputModel.nullable(),
  form: formOutputModel,
});

export const serializeFormBySlug = (payload: {
  link: z.infer<typeof formLinkRowSchema> | null;
  form: z.infer<typeof formRowSchema>;
}) => ({
  link: payload.link ? serializeFormLink(payload.link) : null,
  form: serializeForm(payload.form),
});
