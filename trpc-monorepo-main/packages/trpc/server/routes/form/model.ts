import { z } from "zod";

const visibilitySchema = z.enum(["public", "unlisted"]);
const formStatusSchema = z.enum(["draft", "published", "deleted"]);

export const formRowSchema = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  theme: z.string().nullable(),
  slug: z.string(),
  visibility: visibilitySchema,
  status: formStatusSchema,
  isPublished: z.boolean(),
  allowAnonymous: z.boolean(),
  responseLimit: z.number().nullable(),
  responseCount: z.number(),
  expiresAt: z.date().nullable(),
  userId: z.uuid(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const formOutputModel = z.object({
  id: z.uuid(),
  title: z.string(),
  description: z.string().nullable(),
  theme: z.string().nullable(),
  slug: z.string(),
  visibility: visibilitySchema,
  status: formStatusSchema,
  isPublished: z.boolean(),
  allowAnonymous: z.boolean(),
  responseLimit: z.number().nullable(),
  responseCount: z.number(),
  expiresAt: z.string().nullable(),
  userId: z.uuid(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const serializeForm = (form: z.infer<typeof formRowSchema>) => ({
  id: form.id,
  title: form.title,
  description: form.description,
  theme: form.theme,
  slug: form.slug,
  visibility: form.visibility,
  status: form.status,
  isPublished: form.isPublished,
  allowAnonymous: form.allowAnonymous,
  responseLimit: form.responseLimit,
  responseCount: form.responseCount,
  expiresAt: form.expiresAt?.toISOString() ?? null,
  userId: form.userId,
  createdAt: form.createdAt.toISOString(),
  updatedAt: form.updatedAt.toISOString(),
});

export const createFormOutputModel = formOutputModel;
export const getFormByIdOutputModel = formOutputModel;
export const getAllFormsByUserIdInputModel = z.object({});
export const getAllFormsByUserIdOutputModel = z.array(formOutputModel);
export const editFormOutputModel = formOutputModel;
export const deleteFormOutputModel = formOutputModel;

export type FormOutputModelType = z.infer<typeof formOutputModel>;
