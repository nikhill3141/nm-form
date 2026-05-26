import db, { and, desc, eq, inArray, sql } from "@repo/database";
import {
  formFieldsTable,
  formResponsesTable,
  formsTable,
  responseAnswersTable,
} from "@repo/database/schema";
import FormLinkService from "../formLink";
import {
  assertFormNotDeleted,
  assertFormNotExpired,
  assertFormPublished,
  assertResponseLimitNotReached,
} from "../utils/formAccess";
import { answerInputModel } from "../answer/model";
import {
  getResponsesByFormIdInputModel,
  GetResponsesByFormIdInputModelType,
  submitResponseInputModel,
  SubmitResponseInputModelType,
} from "./model";

class ResponseService {
  private formLinkService = new FormLinkService();

  private getStringOptions(options: unknown) {
    if (!Array.isArray(options)) return [];
    return options.filter((option): option is string => typeof option === "string");
  }

  private validateAnswerValue(
    field: {
      label: string;
      type: string;
      required: boolean;
      options: unknown;
    },
    value: string
  ) {
    const normalizedValue = value.trim();

    if (field.required && (!normalizedValue || normalizedValue === "Skipped")) {
      throw new Error(`missing required field: ${field.label}`);
    }

    if (!normalizedValue || normalizedValue === "Skipped") {
      return;
    }

    const options = this.getStringOptions(field.options);
    const assertOption = (optionValue: string) => {
      if (!options.includes(optionValue)) {
        throw new Error(`invalid option for field: ${field.label}`);
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
          throw new Error(`invalid option for field: ${field.label}`);
        }

        selectedValues.forEach(assertOption);
        return;
      }
      case "email":
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedValue)) {
          throw new Error(`invalid email for field: ${field.label}`);
        }
        return;
      case "number":
        if (!Number.isFinite(Number(normalizedValue))) {
          throw new Error(`invalid number for field: ${field.label}`);
        }
        return;
      case "url":
        try {
          new URL(normalizedValue);
        } catch {
          throw new Error(`invalid URL for field: ${field.label}`);
        }
        return;
      case "date":
        if (Number.isNaN(Date.parse(normalizedValue))) {
          throw new Error(`invalid date for field: ${field.label}`);
        }
        return;
      case "time":
        if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(normalizedValue)) {
          throw new Error(`invalid time for field: ${field.label}`);
        }
        return;
      case "rating": {
        const rating = Number.parseInt(normalizedValue, 10);
        if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
          throw new Error(`invalid rating for field: ${field.label}`);
        }
      }
    }
  }

  private async getReadableForm(
    formId: string,
    linkSlug?: string,
    formPassword?: string
  ) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw new Error("form not found");
    }

    assertFormNotDeleted(form);
    assertFormPublished(form);
    assertFormNotExpired(form);
    assertResponseLimitNotReached(form);
    const passwordAccess = this.formLinkService.assertPasswordAccess(
      form,
      formPassword
    );
    if (!passwordAccess.accessGranted) {
      throw new Error("form password is required");
    }

    if (form.visibility === "public") {
      return form;
    }

    if (!linkSlug) {
      throw new Error("share link slug is required for unlisted forms");
    }

    const { form: linkedForm } =
      await this.formLinkService.getFormByLinkSlug({ slug: linkSlug });

    if (linkedForm.id !== form.id) {
      throw new Error("share link does not match this form");
    }

    return form;
  }

  private async getOwnedForm(userId: string, formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, formId), eq(formsTable.userId, userId)));

    if (!form) {
      throw new Error("form not found");
    }

    assertFormNotDeleted(form);
    return form;
  }

  //submit response
  public async submitResponse(payload: SubmitResponseInputModelType) {
    const { formId, linkSlug, formPassword, respondentIp, userAgent, answers } =
      await submitResponseInputModel.parseAsync(payload);

    const parsedAnswers = await Promise.all(
      answers.map((answer) => answerInputModel.parseAsync(answer))
    );

    await this.getReadableForm(formId, linkSlug, formPassword);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    if (fields.length === 0) {
      throw new Error("form has no fields");
    }

    const fieldMap = new Map(fields.map((field) => [field.id, field]));
    const answeredFieldIds = new Set<string>();

    for (const answer of parsedAnswers) {
      const field = fieldMap.get(answer.fieldId);

      if (!field) {
        throw new Error("answer field does not belong to this form");
      }

      if (answeredFieldIds.has(answer.fieldId)) {
        throw new Error("duplicate answer for the same field");
      }

      answeredFieldIds.add(answer.fieldId);
      this.validateAnswerValue(field, answer.value);
    }

    const requiredFields = fields.filter((field) => field.required);
    for (const requiredField of requiredFields) {
      if (!answeredFieldIds.has(requiredField.id)) {
        throw new Error(`missing required field: ${requiredField.label}`);
      }
    }

    const submitResponse = await db.transaction(async (tx) => {
      const [createResponse] = await tx
        .insert(formResponsesTable)
        .values({
          formId,
          respondentIp,
          userAgent,
          isCompleted: true,
        })
        .returning();

      if (!createResponse) {
        throw new Error("failed to create response");
      }

      const createAnswers = await tx
        .insert(responseAnswersTable)
        .values(
          parsedAnswers.map((answer) => ({
            responseId: createResponse.id,
            fieldId: answer.fieldId,
            value: answer.value,
          }))
        )
        .returning();

      await tx
        .update(formsTable)
        .set({
          responseCount: sql`${formsTable.responseCount} + 1`,
        })
        .where(eq(formsTable.id, formId));

      return {
        createResponse,
        createAnswers,
      };
    });

    return submitResponse;
  }

  //get responses by form id (owner)
  public async getResponsesByFormId(
    userId: string,
    payload: GetResponsesByFormIdInputModelType
  ) {
    const { formId } = await getResponsesByFormIdInputModel.parseAsync(payload);
    await this.getOwnedForm(userId, formId);

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt));

    return {
      responses,
    };
  }

  public async getResponseDetailsByFormId(
    userId: string,
    payload: GetResponsesByFormIdInputModelType
  ) {
    const { formId } = await getResponsesByFormIdInputModel.parseAsync(payload);
    await this.getOwnedForm(userId, formId);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId));

    const responses = await db
      .select()
      .from(formResponsesTable)
      .where(eq(formResponsesTable.formId, formId))
      .orderBy(desc(formResponsesTable.submittedAt));

    if (responses.length === 0) {
      return {
        fields,
        responses: [],
      };
    }

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(
        inArray(
          responseAnswersTable.responseId,
          responses.map((response) => response.id)
        )
      );

    const answersByResponseId = new Map<string, typeof answers>();
    for (const answer of answers) {
      const responseAnswers = answersByResponseId.get(answer.responseId) ?? [];
      responseAnswers.push(answer);
      answersByResponseId.set(answer.responseId, responseAnswers);
    }

    return {
      fields,
      responses: responses.map((response) => ({
        response,
        answers: answersByResponseId.get(response.id) ?? [],
      })),
    };
  }
}

export default ResponseService;
