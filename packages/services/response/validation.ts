import { z } from "zod";
import { answerInputModel } from "../answer/model";
import { fieldVisibilityRuleSchema } from "../shared/schema";

type ResponseFieldForValidation = {
  id: string;
  label: string;
  type: string;
  required: boolean;
  options: unknown;
  validationRules: unknown;
};

const skippedValue = "Skipped";

const getStringOptions = (options: unknown) => {
  if (!Array.isArray(options)) return [];
  return options.filter((option): option is string => typeof option === "string");
};

const fieldValueSchema = (field: ResponseFieldForValidation) => {
  const baseValueSchema = field.required
    ? z.string().trim().min(1, `missing required field: ${field.label}`)
    : z.string().trim();

  return baseValueSchema.superRefine((value, ctx) => {
    const normalizedValue = value.trim();

    if (!normalizedValue || normalizedValue === skippedValue) {
      if (field.required) {
        ctx.addIssue({
          code: "custom",
          message: `missing required field: ${field.label}`,
        });
      }
      return;
    }

    const options = getStringOptions(field.options);
    const assertOption = (optionValue: string) => {
      if (!options.includes(optionValue)) {
        ctx.addIssue({
          code: "custom",
          message: `invalid option for field: ${field.label}`,
        });
      }
    };

    switch (field.type) {
      case "single_select":
      case "yes_no":
        assertOption(normalizedValue);
        return;
      case "multi_select":
      case "checkbox": {
        const selectedValues = normalizedValue
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean);

        if (selectedValues.length === 0) {
          ctx.addIssue({
            code: "custom",
            message: `invalid option for field: ${field.label}`,
          });
          return;
        }

        selectedValues.forEach(assertOption);
        return;
      }
      case "email":
        if (!z.email().safeParse(normalizedValue).success) {
          ctx.addIssue({
            code: "custom",
            message: `invalid email for field: ${field.label}`,
          });
        }
        return;
      case "number":
        if (!Number.isFinite(Number(normalizedValue))) {
          ctx.addIssue({
            code: "custom",
            message: `invalid number for field: ${field.label}`,
          });
        }
        return;
      case "url":
        if (!z.url().safeParse(normalizedValue).success) {
          ctx.addIssue({
            code: "custom",
            message: `invalid URL for field: ${field.label}`,
          });
        }
        return;
      case "date":
        if (Number.isNaN(Date.parse(normalizedValue))) {
          ctx.addIssue({
            code: "custom",
            message: `invalid date for field: ${field.label}`,
          });
        }
        return;
      case "time":
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalizedValue)) {
          ctx.addIssue({
            code: "custom",
            message: `invalid time for field: ${field.label}`,
          });
        }
        return;
      case "rating": {
        const rating = Number.parseInt(normalizedValue, 10);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          ctx.addIssue({
            code: "custom",
            message: `invalid rating for field: ${field.label}`,
          });
        }
      }
    }
  });
};

function fieldIsVisible(
  field: ResponseFieldForValidation,
  answerValuesByFieldId: Map<string, string>
) {
  const visibilityRule = fieldVisibilityRuleSchema.safeParse(
    field.validationRules ?? {}
  );
  const showWhen = visibilityRule.success ? visibilityRule.data.showWhen : undefined;

  if (!showWhen) return true;

  const controllingValue = answerValuesByFieldId.get(showWhen.fieldId) ?? "";
  const selectedValues = controllingValue
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return selectedValues.includes(showWhen.equals) || controllingValue === showWhen.equals;
}

export function buildResponseAnswersSchema(fields: ResponseFieldForValidation[]) {
  const fieldMap = new Map(fields.map((field) => [field.id, field]));

  return z.array(answerInputModel).min(1).superRefine((answers, ctx) => {
    const answeredFieldIds = new Set<string>();
    const answerValuesByFieldId = new Map(
      answers.map((answer) => [answer.fieldId, answer.value])
    );
    const visibleFields = fields.filter((field) =>
      fieldIsVisible(field, answerValuesByFieldId)
    );
    const visibleFieldIds = new Set(visibleFields.map((field) => field.id));
    const requiredFieldIds = new Set(
      visibleFields.filter((field) => field.required).map((field) => field.id)
    );

    answers.forEach((answer, index) => {
      const field = fieldMap.get(answer.fieldId);

      if (!field) {
        ctx.addIssue({
          code: "custom",
          message: "answer field does not belong to this form",
          path: [index, "fieldId"],
        });
        return;
      }

      if (!visibleFieldIds.has(answer.fieldId)) {
        ctx.addIssue({
          code: "custom",
          message: `field is hidden by conditional logic: ${field.label}`,
          path: [index, "fieldId"],
        });
        return;
      }

      if (answeredFieldIds.has(answer.fieldId)) {
        ctx.addIssue({
          code: "custom",
          message: "duplicate answer for the same field",
          path: [index, "fieldId"],
        });
        return;
      }

      answeredFieldIds.add(answer.fieldId);
      const result = fieldValueSchema(field).safeParse(answer.value);
      if (!result.success) {
        for (const issue of result.error.issues) {
          ctx.addIssue({
            code: "custom",
            message: issue.message,
            path: [index, "value"],
          });
        }
      }
    });

    for (const requiredFieldId of requiredFieldIds) {
      if (!answeredFieldIds.has(requiredFieldId)) {
        const field = fieldMap.get(requiredFieldId);
        ctx.addIssue({
          code: "custom",
          message: `missing required field: ${field?.label ?? requiredFieldId}`,
        });
      }
    }
  });
}
