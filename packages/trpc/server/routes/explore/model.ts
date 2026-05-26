import { z } from "zod";
import {
  fieldOutputModel,
  fieldRowSchema,
  serializeField,
} from "../field/model";
import { formOutputModel, formRowSchema, serializeForm } from "../form/model";

export const explorePublicFormsInputModel = z.object({});
export const explorePublicFormOutputModel = formOutputModel.extend({
  creatorName: z.string().nullable(),
});
export const explorePublicFormsOutputModel = z.array(explorePublicFormOutputModel);

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

export const serializeExplorePublicForm = (payload: {
  form: z.infer<typeof formRowSchema>;
  creatorName: string | null;
}) => ({
  ...serializeForm(payload.form),
  creatorName: payload.creatorName,
});
