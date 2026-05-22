import { z } from "zod";
import { formOutputModel, formRowSchema, serializeForm } from "../form/model";

const formLinkRowSchema = z.object({
  id: z.uuid(),
  token: z.string(),
  formId: z.uuid(),
  expiresAt: z.date().nullable(),
  createdAt: z.date(),
});

export const formLinkOutputModel = z.object({
  id: z.uuid(),
  token: z.string(),
  formId: z.uuid(),
  expiresAt: z.string().nullable(),
  createdAt: z.string(),
});

export const serializeFormLink = (link: z.infer<typeof formLinkRowSchema>) => ({
  id: link.id,
  token: link.token,
  formId: link.formId,
  expiresAt: link.expiresAt?.toISOString() ?? null,
  createdAt: link.createdAt.toISOString(),
});

export const createFormLinkOutputModel = formLinkOutputModel;
export const getFormLinksByFormIdOutputModel = z.array(formLinkOutputModel);
export const deleteFormLinkOutputModel = formLinkOutputModel;

export const getFormByLinkTokenOutputModel = z.object({
  link: formLinkOutputModel,
  form: formOutputModel,
});

export const serializeFormByLinkToken = (payload: {
  link: z.infer<typeof formLinkRowSchema>;
  form: z.infer<typeof formRowSchema>;
}) => ({
  link: serializeFormLink(payload.link),
  form: serializeForm(payload.form),
});
