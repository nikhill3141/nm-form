import db, { and, eq } from "@repo/database";
import { formLinksTable, formsTable } from "@repo/database/schema";
import {
  assertFormNotDeleted,
  assertFormNotExpired,
  assertFormPublished,
} from "../utils/formAccess";
import { generateHash } from "../utils/generateHash";
import {
  createFormLinkInputModel,
  CreateFormLinkInputModelType,
  deleteFormLinkInputModel,
  DeleteFormLinkInputModelType,
  getFormByLinkSlugInputModel,
  GetFormByLinkSlugInputModelType,
  getFormLinksByFormIdInputModel,
  GetFormLinksByFormIdInputModelType,
} from "./model";

class FormLinkService {
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

  public assertPasswordAccess(
    form: {
      passwordHash: string | null;
      passwordSalt: string | null;
    },
    formPassword?: string
  ) {
    if (!form.passwordHash || !form.passwordSalt) {
      return { requiresPassword: false, accessGranted: true };
    }

    if (!formPassword) {
      return { requiresPassword: true, accessGranted: false };
    }

    const providedHash = generateHash(form.passwordSalt, formPassword);
    if (providedHash !== form.passwordHash) {
      return { requiresPassword: true, accessGranted: false };
    }

    return { requiresPassword: true, accessGranted: true };
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

  //resolve unlisted form by slug (public)
  public async getFormByLinkSlug(payload: GetFormByLinkSlugInputModelType) {
    const { slug, formPassword } =
      await getFormByLinkSlugInputModel.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.slug, slug))
      .limit(1);

    if (!form) {
      throw new Error("form not found");
    }

    assertFormNotDeleted(form);
    assertFormPublished(form);
    assertFormNotExpired(form);
    const passwordAccess = this.assertPasswordAccess(form, formPassword);

    if (form.visibility === "public") {
      return {
        link: null,
        form,
        ...passwordAccess,
      };
    }

    const [link] = await db
      .select()
      .from(formLinksTable)
      .where(eq(formLinksTable.formId, form.id))
      .limit(1);

    if (!link) {
      throw new Error("form link not found");
    }

    this.assertLinkNotExpired(link);

    return {
      link,
      form,
      ...passwordAccess,
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
