import { z } from "zod";
import { fieldTypeSchema } from "@repo/services/field/model";

export const fieldRowSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  label: z.string(),
  description: z.string().nullable(),
  type: fieldTypeSchema,
  placeholder: z.string().nullable(),
  required: z.boolean(),
  order: z.number(),
  validationRules: z.unknown().nullable(),
  options: z.unknown().nullable(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
});

export const fieldOutputModel = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  label: z.string(),
  description: z.string().nullable(),
  type: fieldTypeSchema,
  placeholder: z.string().nullable(),
  required: z.boolean(),
  order: z.number(),
  validationRules: z.unknown().nullable(),
  options: z.unknown().nullable(),
  createdAt: z.string().nullable(),
  updatedAt: z.string().nullable(),
});

export const serializeField = (field: z.infer<typeof fieldRowSchema>) => ({
  id: field.id,
  formId: field.formId,
  label: field.label,
  description: field.description,
  type: field.type,
  placeholder: field.placeholder,
  required: field.required,
  order: field.order,
  validationRules: field.validationRules ?? null,
  options: field.options ?? null,
  createdAt: field.createdAt?.toISOString() ?? null,
  updatedAt: field.updatedAt?.toISOString() ?? null,
});

export const createFieldOutputModel = fieldOutputModel;
export const updateFieldOutputModel = fieldOutputModel;
export const deleteFieldOutputModel = fieldOutputModel;
export const getFieldsByFormIdOutputModel = z.array(fieldOutputModel);
