import db, { and, eq, ne } from "@repo/database";
import { formsTable } from "@repo/database/schema";
import FormLinkService from "../formLink";
import {
  assertFormNotDeleted,
  assertFormNotExpired,
  assertFormPublished,
} from "../utils/formAccess";
import {
  createFormInputModel,
  CreateFormInputModelType,
  deleteFormInputModel,
  DeleteFormInputModelType,
  editFormInputModel,
  EditFormInputModelType,
  getFormByIdInputModel,
  GetFormByIdInputModelType,
} from "./model";

class FormService {
  private formLinkService = new FormLinkService();

  //create form
  public async createForm(userId: string, payload: CreateFormInputModelType) {
    const {
      title,
      description,
      expiresAt,
      allowAnonymous,
      visibility,
      status,
      theme,
    } = await createFormInputModel.parseAsync(payload);
    if (!title || !description || !expiresAt || !visibility) {
      throw new Error("provide all the details");
    }
    const createForm = await db
      .insert(formsTable)
      .values({
        title,
        description,
        expiresAt: new Date(expiresAt),
        allowAnonymous,
        visibility,
        userId,
        slug: title,
        status,
        theme,
        isPublished: false,
      })
      .returning();

    const form = createForm[0];
    if (!form) {
      throw new Error("Failed to create form");
    }

    if (visibility === "unlisted") {
      await this.formLinkService.ensureFormLinkForUnlistedForm(
        userId,
        form.id,
        form.expiresAt
      );
    }

    return {
      createForm,
    };
  }

  //get all public forms (used by explore)
  public async getAllPublicForms() {
    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(
          eq(formsTable.visibility, "public"),
          eq(formsTable.isPublished, true),
          eq(formsTable.status, "published"),
          ne(formsTable.status, "deleted")
        )
      );

    return {
      forms,
    };
  }

  //get public form by id (explore)
  public async getPublicFormById(formId: string) {
    const [form] = await db
      .select()
      .from(formsTable)
      .where(eq(formsTable.id, formId))
      .limit(1);

    if (!form) {
      throw new Error("form not found");
    }

    if (form.visibility !== "public") {
      throw new Error("form is not public");
    }

    assertFormNotDeleted(form);
    assertFormPublished(form);
    assertFormNotExpired(form);

    return {
      form,
    };
  }

  //get form by id (owner)
  public async getFormById(userId: string, payload: GetFormByIdInputModelType) {
    const { id } = await getFormByIdInputModel.parseAsync(payload);

    const [form] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId)));

    if (!form) {
      throw new Error("form not found");
    }

    assertFormNotDeleted(form);

    return {
      form,
    };
  }

  //get all forms by user id
  public async getAllFormsByUserId(userId: string) {
    const forms = await db
      .select()
      .from(formsTable)
      .where(
        and(eq(formsTable.userId, userId), ne(formsTable.status, "deleted"))
      );

    return {
      forms,
    };
  }

  //edit form
  public async editForm(userId: string, payload: EditFormInputModelType) {
    const {
      id,
      title,
      description,
      expiresAt,
      allowAnonymous,
      visibility,
      status,
      theme,
      isPublished,
    } = await editFormInputModel.parseAsync(payload);

    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId)));

    if (!existingForm) {
      throw new Error("form not found");
    }

    const hasUpdate =
      title !== undefined ||
      description !== undefined ||
      expiresAt !== undefined ||
      allowAnonymous !== undefined ||
      visibility !== undefined ||
      status !== undefined ||
      theme !== undefined ||
      isPublished !== undefined;

    if (!hasUpdate) {
      throw new Error("provide at least one field to update");
    }

    const updateForm = await db
      .update(formsTable)
      .set({
        ...(title !== undefined && { title, slug: title }),
        ...(description !== undefined && { description }),
        ...(expiresAt !== undefined && { expiresAt: new Date(expiresAt) }),
        ...(allowAnonymous !== undefined && { allowAnonymous }),
        ...(visibility !== undefined && { visibility }),
        ...(status !== undefined && { status }),
        ...(theme !== undefined && { theme }),
        ...(isPublished !== undefined && { isPublished }),
      })
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId)))
      .returning();

    const form = updateForm[0];
    if (!form) {
      throw new Error("Failed to update form");
    }

    const nextVisibility = visibility ?? existingForm.visibility;
    if (nextVisibility === "unlisted") {
      await this.formLinkService.ensureFormLinkForUnlistedForm(
        userId,
        form.id,
        form.expiresAt
      );
    }

    return {
      updateForm,
    };
  }

  //delete form (soft delete)
  public async deleteForm(userId: string, payload: DeleteFormInputModelType) {
    const { id } = await deleteFormInputModel.parseAsync(payload);

    const [existingForm] = await db
      .select()
      .from(formsTable)
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId)));

    if (!existingForm) {
      throw new Error("form not found");
    }

    const deleteForm = await db
      .update(formsTable)
      .set({
        status: "deleted",
        isPublished: false,
      })
      .where(and(eq(formsTable.id, id), eq(formsTable.userId, userId)))
      .returning();

    return {
      deleteForm,
    };
  }
}

export default FormService;
