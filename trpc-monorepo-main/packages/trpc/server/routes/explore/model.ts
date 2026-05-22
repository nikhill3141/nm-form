import { z } from "zod";
import {
  fieldOutputModel,
  fieldRowSchema,
  serializeField,
} from "../field/model";
import { formOutputModel, formRowSchema, serializeForm } from "../form/model";

export const explorePublicFormsInputModel = z.object({});
export const explorePublicFormsOutputModel = z.array(formOutputModel);

export const explorePublicFormByIdOutputModel = z.object({
  form: formOutputModel,
  fields: z.array(fieldOutputModel),
});

export const serializeExplorePublicFormById = (payload: {
  form: z.infer<typeof formRowSchema>;
  fields: z.infer<typeof fieldRowSchema>[];
}) => ({
  form: serializeForm(payload.form),
  fields: payload.fields.map(serializeField),
});
