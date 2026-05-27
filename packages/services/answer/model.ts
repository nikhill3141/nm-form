import { z } from "zod";
import { uuidSchema } from "../shared/schema";

export const answerInputModel = z.object({
  fieldId: uuidSchema.describe("id of the form field"),
  value: z.string().min(1).describe("answer value"),
});

export const getAnswersByResponseIdInputModel = z.object({
  responseId: uuidSchema.describe("id of the form response"),
});
export type GetAnswersByResponseIdInputModelType = z.infer<
  typeof getAnswersByResponseIdInputModel
>;
