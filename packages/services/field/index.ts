import { z } from "zod";
import db, { and, asc, eq } from "@repo/database";
import { formFieldsTable, formsTable } from "@repo/database/schema";
import FormLinkService from "../formLink";
import {
  assertFormNotDeleted,
  assertFormNotExpired,
  assertFormPublished,
} from "../utils/formAccess";
import {
  createFieldInputModel,
  CreateFieldInputModelType,
  deleteFieldInputModel,
  DeleteFieldInputModelType,
  fieldTypeSchema,
  getFieldsByFormIdInputModel,
  GetFieldsByFormIdInputModelType,
  selectFieldTypes,
  updateFieldInputModel,
  UpdateFieldInputModelType,
} from "./model";

class FieldService {
  private assertSelectFieldOptions(
    type: z.infer<typeof fieldTypeSchema>,
    options?: string[]
  ) {
    if (
      selectFieldTypes.includes(type as (typeof selectFieldTypes)[number]) &&
      (!options || options.length === 0)
    ) {
      throw new Error("options are required for select field types");
    }
  }
  private formLinkService = new FormLinkService();

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

  private async assertReadableForm(
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

  //create field
  public async createField(userId: string, payload: CreateFieldInputModelType) {
    const parsed = await createFieldInputModel.parseAsync(payload);
    this.assertSelectFieldOptions(parsed.type, parsed.options);
    await this.getOwnedForm(userId, parsed.formId);

    const [existingOrder] = await db
      .select()
      .from(formFieldsTable)
      .where(
        and(
          eq(formFieldsTable.formId, parsed.formId),
          eq(formFieldsTable.order, parsed.order)
        )
      )
      .limit(1);

    if (existingOrder) {
      throw new Error("field order already exists for this form");
    }

    const createField = await db
      .insert(formFieldsTable)
      .values({
        formId: parsed.formId,
        label: parsed.label,
        description: parsed.description,
        type: parsed.type,
        placeholder: parsed.placeholder,
        required: parsed.required,
        order: parsed.order,
        validationRules: parsed.validationRules,
        options: parsed.options,
      })
      .returning();

    return {
      createField,
    };
  }

  //update field
  public async updateField(userId: string, payload: UpdateFieldInputModelType) {
    const {
      id,
      label,
      description,
      type,
      placeholder,
      required,
      order,
      validationRules,
      options,
    } = await updateFieldInputModel.parseAsync(payload);

    const [existingField] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, id))
      .limit(1);

    if (!existingField) {
      throw new Error("field not found");
    }

    await this.getOwnedForm(userId, existingField.formId);

    const nextType = type ?? existingField.type;
    const nextOptions =
      options !== undefined ? options : (existingField.options as string[] | null);

    if (
      type !== undefined ||
      options !== undefined
    ) {
      this.assertSelectFieldOptions(
        nextType,
        Array.isArray(nextOptions) ? nextOptions : undefined
      );
    }

    const hasUpdate =
      label !== undefined ||
      description !== undefined ||
      type !== undefined ||
      placeholder !== undefined ||
      required !== undefined ||
      order !== undefined ||
      validationRules !== undefined ||
      options !== undefined;

    if (!hasUpdate) {
      throw new Error("provide at least one field to update");
    }

    if (order !== undefined && order !== existingField.order) {
      const [orderConflict] = await db
        .select()
        .from(formFieldsTable)
        .where(
          and(
            eq(formFieldsTable.formId, existingField.formId),
            eq(formFieldsTable.order, order)
          )
        )
        .limit(1);

      if (orderConflict && orderConflict.id !== id) {
        throw new Error("field order already exists for this form");
      }
    }

    const updateField = await db
      .update(formFieldsTable)
      .set({
        ...(label !== undefined && { label }),
        ...(description !== undefined && { description }),
        ...(type !== undefined && { type }),
        ...(placeholder !== undefined && { placeholder }),
        ...(required !== undefined && { required }),
        ...(order !== undefined && { order }),
        ...(validationRules !== undefined && { validationRules }),
        ...(options !== undefined && { options }),
      })
      .where(eq(formFieldsTable.id, id))
      .returning();

    return {
      updateField,
    };
  }

  //delete field
  public async deleteField(userId: string, payload: DeleteFieldInputModelType) {
    const { id } = await deleteFieldInputModel.parseAsync(payload);

    const [existingField] = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.id, id))
      .limit(1);

    if (!existingField) {
      throw new Error("field not found");
    }

    await this.getOwnedForm(userId, existingField.formId);

    const deleteField = await db
      .delete(formFieldsTable)
      .where(eq(formFieldsTable.id, id))
      .returning();

    return {
      deleteField,
    };
  }

  //get fields by form id (public or owner via token)
  public async getFieldsByFormId(payload: GetFieldsByFormIdInputModelType) {
    const { formId, linkSlug, formPassword } =
      await getFieldsByFormIdInputModel.parseAsync(payload);

    await this.assertReadableForm(formId, linkSlug, formPassword);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    return {
      fields,
    };
  }

  //get fields for owner (includes draft forms)
  public async getFieldsByFormIdForOwner(
    userId: string,
    payload: GetFieldsByFormIdInputModelType
  ) {
    const { formId } = await getFieldsByFormIdInputModel.parseAsync(payload);
    await this.getOwnedForm(userId, formId);

    const fields = await db
      .select()
      .from(formFieldsTable)
      .where(eq(formFieldsTable.formId, formId))
      .orderBy(asc(formFieldsTable.order));

    return {
      fields,
    };
  }
}

export default FieldService;
