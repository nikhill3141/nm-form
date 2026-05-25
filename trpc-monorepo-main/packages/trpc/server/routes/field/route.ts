import {
  createFieldInputModel,
  deleteFieldInputModel,
  getFieldsByFormIdInputModel,
  updateFieldInputModel,
} from "@repo/services/field/model";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { fieldService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFieldOutputModel,
  deleteFieldOutputModel,
  getFieldsByFormIdOutputModel,
  serializeField,
  updateFieldOutputModel,
} from "./model";

const TAGS = ["Field"];
const getPath = generatePath("/field");

export const fieldRouter = router({
  createField: protectedProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/create"),
        tags: TAGS,
      },
    })
    .input(createFieldInputModel)
    .output(createFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { createField } = await fieldService.createField(ctx.user.id, input);
      const field = createField[0];
      if (!field) throw new Error("Failed to create field");
      return serializeField(field);
    }),

  updateField: protectedProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/update"),
        tags: TAGS,
      },
    })
    .input(updateFieldInputModel)
    .output(updateFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { updateField } = await fieldService.updateField(ctx.user.id, input);
      const field = updateField[0];
      if (!field) throw new Error("Failed to update field");
      return serializeField(field);
    }),

  deleteField: protectedProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/delete"),
        tags: TAGS,
      },
    })
    .input(deleteFieldInputModel)
    .output(deleteFieldOutputModel)
    .mutation(async ({ input, ctx }) => {
      const { deleteField } = await fieldService.deleteField(ctx.user.id, input);
      const field = deleteField[0];
      if (!field) throw new Error("Failed to delete field");
      return serializeField(field);
    }),

  getFieldsByFormId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-form"),
        tags: TAGS,
      },
    })
    .input(getFieldsByFormIdInputModel)
    .output(getFieldsByFormIdOutputModel)
    .query(async ({ input }) => {
      const { fields } = await fieldService.getFieldsByFormId(input);
      return fields.map(serializeField);
    }),

  getFieldsByFormIdForOwner: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-form/owner"),
        tags: TAGS,
      },
    })
    .input(getFieldsByFormIdInputModel)
    .output(getFieldsByFormIdOutputModel)
    .query(async ({ input, ctx }) => {
      const { fields } = await fieldService.getFieldsByFormIdForOwner(
        ctx.user.id,
        input
      );
      return fields.map(serializeField);
    }),
});
