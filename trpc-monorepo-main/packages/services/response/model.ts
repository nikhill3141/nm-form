import { z } from "zod";
import { answerInputModel } from "../answer/model";

export const submitResponseInputModel = z.object({
  formId: z.uuid().describe("id of the form"),
  linkSlug: z
    .string()
    .optional()
    .describe("required when submitting to an unlisted form"),
  respondentIp: z.string().optional(),
  userAgent: z.string().optional(),
  answers: z
    .array(answerInputModel)
    .min(1)
    .describe("answers submitted for the form"),
});
export type SubmitResponseInputModelType = z.infer<
  typeof submitResponseInputModel
>;

export const getResponsesByFormIdInputModel = z.object({
  formId: z.uuid().describe("id of the form"),
});
export type GetResponsesByFormIdInputModelType = z.infer<
  typeof getResponsesByFormIdInputModel
>;
