import { z } from "zod";

const answerRowSchema = z.object({
  id: z.uuid(),
  responseId: z.uuid(),
  fieldId: z.uuid(),
  value: z.string(),
  createdAt: z.date(),
});

export const answerOutputModel = z.object({
  id: z.uuid(),
  responseId: z.uuid(),
  fieldId: z.uuid(),
  value: z.string(),
  createdAt: z.string(),
});

export const serializeAnswer = (answer: z.infer<typeof answerRowSchema>) => ({
  id: answer.id,
  responseId: answer.responseId,
  fieldId: answer.fieldId,
  value: answer.value,
  createdAt: answer.createdAt.toISOString(),
});

export const getAnswersByResponseIdOutputModel = z.array(answerOutputModel);
