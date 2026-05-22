import { randomBytes } from "crypto";
import db, { and, eq } from "@repo/database";
import { formLinksTable, formsTable } from "@repo/database/schema";
import {
  assertFormNotDeleted,
  assertFormNotExpired,
  assertFormPublished,
} from "../utils/formAccess";
import {
  createFormLinkInputModel,
  CreateFormLinkInputModelType,
  deleteFormLinkInputModel,
  DeleteFormLinkInputModelType,
  getFormByLinkTokenInputModel,
  GetFormByLinkTokenInputModelType,
  getFormLinksByFormIdInputModel,
  GetFormLinksByFormIdInputModelType,
} from "./model";

class FormLinkService {
  private generateToken() {
    return randomBytes(32).toString("hex");
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

  private assertLinkNotExpired(link: { expiresAt: Date | null }) {
    if (link.expiresAt && link.expiresAt < new Date()) {
      throw new Error("form link has expired");
    }
  }

  //create shareable link for unlisted forms
  public async createFormLink(
    userId: string,
    payload: CreateFormLinkInputModelType
  ) {
    const { formId, expiresAt } =
      await createFormLinkInputModel.parseAsync(payload);
    const form = await this.getOwnedForm(userId, formId);

    if (form.visibility !== "unlisted") {
      throw new Error("shareable links are only for unlisted forms");
    }

    const createFormLink = await db
      .insert(formLinksTable)
      .values({
        formId,
        token: this.generateToken(),
        ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
      })
      .returning();

    return {
      createFormLink,
    };
  }

  //used internally when a form is created/updated to unlisted
  public async ensureFormLinkForUnlistedForm(
    userId: string,
    formId: string,
    formExpiresAt: Date | null
  ) {
    const form = await this.getOwnedForm(userId, formId);

    if (form.visibility !== "unlisted") {
      return { createFormLink: [] };
    }

    const existingLinks = await db
      .select()
      .from(formLinksTable)
      .where(eq(formLinksTable.formId, formId))
      .limit(1);

    if (existingLinks.length > 0) {
      return { createFormLink: existingLinks };
    }

    const createFormLink = await db
      .insert(formLinksTable)
      .values({
        formId,
        token: this.generateToken(),
        ...(formExpiresAt && { expiresAt: formExpiresAt }),
      })
      .returning();

    return {
      createFormLink,
    };
  }

  //get all links for a form (owner)
  public async getFormLinksByFormId(
    userId: string,
    payload: GetFormLinksByFormIdInputModelType
  ) {
    const { formId } = await getFormLinksByFormIdInputModel.parseAsync(payload);
    await this.getOwnedForm(userId, formId);

    const formLinks = await db
      .select()
      .from(formLinksTable)
      .where(eq(formLinksTable.formId, formId));

    return {
      formLinks,
    };
  }

  //resolve unlisted form by token (public)
  public async getFormByLinkToken(payload: GetFormByLinkTokenInputModelType) {
    const { token } = await getFormByLinkTokenInputModel.parseAsync(payload);

    const [link] = await db
      .select()
      .from(formLinksTable)
      .where(eq(formLinksTable.token, token))
      .limit(1);

    if (!link) {
      throw new Error("form link not found");
    }

    this.assertLinkNotExpired(link);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, link.formId))
      .limit(1);

    if (!form) {
      throw new Error("form not found");
    }

    assertFormNotDeleted(form);
    assertFormPublished(form);
    assertFormNotExpired(form);

    if (form.visibility !== "unlisted") {
      throw new Error("this form is public; use the explore route");
    }

    return {
      link,
      form,
    };
  }

  //delete form link (owner)
  public async deleteFormLink(
    userId: string,
    payload: DeleteFormLinkInputModelType
  ) {
    const { id } = await deleteFormLinkInputModel.parseAsync(payload);

    const [link] = await db
      .select()
      .from(formLinksTable)
      .where(eq(formLinksTable.id, id))
      .limit(1);

    if (!link) {
      throw new Error("form link not found");
    }

    await this.getOwnedForm(userId, link.formId);

    const deleteFormLink = await db
      .delete(formLinksTable)
      .where(eq(formLinksTable.id, id))
      .returning();

    return {
      deleteFormLink,
    };
  }
}

export default FormLinkService;
