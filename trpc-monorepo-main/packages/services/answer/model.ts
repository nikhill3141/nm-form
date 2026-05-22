import { z } from "zod";

export const answerInputModel = z.object({
  fieldId: z.uuid().describe("id of the form field"),
  value: z.string().min(1).describe("answer value"),
});

export const getAnswersByResponseIdInputModel = z.object({
  responseId: z.uuid().describe("id of the form response"),
});
export type GetAnswersByResponseIdInputModelType = z.infer<
  typeof getAnswersByResponseIdInputModel
>;
