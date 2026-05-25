import { z } from "zod";

const responseRowSchema = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  respondentIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  isCompleted: z.boolean(),
  submittedAt: z.date(),
  createdAt: z.date(),
});

export const responseOutputModel = z.object({
  id: z.uuid(),
  formId: z.uuid(),
  respondentIp: z.string().nullable(),
  userAgent: z.string().nullable(),
  isCompleted: z.boolean(),
  submittedAt: z.string(),
  createdAt: z.string(),
});

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

export const serializeResponse = (
  response: z.infer<typeof responseRowSchema>
) => ({
  id: response.id,
  formId: response.formId,
  respondentIp: response.respondentIp,
  userAgent: response.userAgent,
  isCompleted: response.isCompleted,
  submittedAt: response.submittedAt.toISOString(),
  createdAt: response.createdAt.toISOString(),
});

export const serializeAnswer = (answer: z.infer<typeof answerRowSchema>) => ({
  id: answer.id,
  responseId: answer.responseId,
  fieldId: answer.fieldId,
  value: answer.value,
  createdAt: answer.createdAt.toISOString(),
});

export const submitResponseOutputModel = z.object({
  response: responseOutputModel,
  answers: z.array(answerOutputModel),
});

export const serializeSubmitResponse = (payload: {
  createResponse: z.infer<typeof responseRowSchema>;
  createAnswers: z.infer<typeof answerRowSchema>[];
}) => ({
  response: serializeResponse(payload.createResponse),
  answers: payload.createAnswers.map(serializeAnswer),
});

export const getResponsesByFormIdOutputModel = z.array(responseOutputModel);

const responseFieldOutputModel = z.object({
  id: z.uuid(),
  label: z.string(),
  type: z.string(),
  order: z.number(),
});

export const responseDetailsOutputModel = z.object({
  fields: z.array(responseFieldOutputModel),
  responses: z.array(
    z.object({
      response: responseOutputModel,
      answers: z.array(answerOutputModel),
    })
  ),
});

export const serializeResponseDetails = (payload: {
  fields: Array<{
    id: string;
    label: string;
    type: string;
    order: number;
  }>;
  responses: Array<{
    response: z.infer<typeof responseRowSchema>;
    answers: z.infer<typeof answerRowSchema>[];
  }>;
}) => ({
  fields: payload.fields
    .map((field) => ({
      id: field.id,
      label: field.label,
      type: field.type,
      order: field.order,
    }))
    .sort((a, b) => a.order - b.order),
  responses: payload.responses.map((item) => ({
    response: serializeResponse(item.response),
    answers: item.answers.map(serializeAnswer),
  })),
});
