import db, { and, desc, eq, sql } from "@repo/database";
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

  private async getReadableForm(formId: string, linkToken?: string) {
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

    if (form.visibility === "public") {
      return form;
    }

    if (!linkToken) {
      throw new Error("link token is required for unlisted forms");
    }

    const { form: linkedForm } =
      await this.formLinkService.getFormByLinkToken({ token: linkToken });

    if (linkedForm.id !== form.id) {
      throw new Error("link token does not match this form");
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
    const { formId, linkToken, respondentIp, userAgent, answers } =
      await submitResponseInputModel.parseAsync(payload);

    const parsedAnswers = await Promise.all(
      answers.map((answer) => answerInputModel.parseAsync(answer))
    );

    const form = await this.getReadableForm(formId, linkToken);

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
}

export default ResponseService;
