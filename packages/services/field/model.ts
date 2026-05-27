import { z } from "zod";
import {
  fieldLabelSchema,
  formPasswordSchema,
  optionalFieldTextSchema,
  uuidSchema,
} from "../shared/schema";

export const fieldTypeSchema = z.enum([
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "phone",
  "date",
  "rating",
  "yes_no",
  "password",
  "url",
  "time",
]);

export const selectFieldTypes = [
  "single_select",
  "multi_select",
  "checkbox",
  "yes_no",
] as const;

export const createFieldInputModel = z.object({
  formId: uuidSchema.describe("id of the form"),
  label: fieldLabelSchema.describe("field label"),
  description: z.string().optional().describe("field description"),
  type: fieldTypeSchema.describe("field type"),
  placeholder: optionalFieldTextSchema.describe("field placeholder"),
  required: z.boolean().default(false).describe("whether field is required"),
  order: z.number().int().nonnegative().describe("field order in the form"),
  validationRules: z.record(z.string(), z.unknown()).optional(),
  options: z.array(z.string()).optional().describe("options for select fields"),
});
export type CreateFieldInputModelType = z.infer<typeof createFieldInputModel>;

export const updateFieldInputModel = z.object({
  id: uuidSchema.describe("id of the field"),
  label: fieldLabelSchema.optional(),
  description: z.string().optional(),
  type: fieldTypeSchema.optional(),
  placeholder: optionalFieldTextSchema,
  required: z.boolean().optional(),
  order: z.number().int().nonnegative().optional(),
  validationRules: z.record(z.string(), z.unknown()).optional(),
  options: z.array(z.string()).optional(),
});
export type UpdateFieldInputModelType = z.infer<typeof updateFieldInputModel>;

export const deleteFieldInputModel = z.object({
  id: uuidSchema.describe("id of the field to delete"),
});
export type DeleteFieldInputModelType = z.infer<typeof deleteFieldInputModel>;

export const getFieldsByFormIdInputModel = z.object({
  formId: uuidSchema.describe("id of the form"),
  linkSlug: z
    .string()
    .optional()
    .describe("required when accessing an unlisted form"),
  formPassword: formPasswordSchema
    .optional()
    .describe("required when accessing a password-protected form"),
});
export type GetFieldsByFormIdInputModelType = z.infer<
  typeof getFieldsByFormIdInputModel
>;
