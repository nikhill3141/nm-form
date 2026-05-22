import {
  createFieldInputModel,
  deleteFieldInputModel,
  getFieldsByFormIdInputModel,
  updateFieldInputModel,
} from "@repo/services/field/model";
import { publicProcedure, router } from "../../trpc";
import { fieldService, userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie } from "../../utils/cookie";
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
  createField: publicProcedure
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
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { createField } = await fieldService.createField(userId, input);
      const field = createField[0];
      if (!field) throw new Error("Failed to create field");
      return serializeField(field);
    }),

  updateField: publicProcedure
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
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { updateField } = await fieldService.updateField(userId, input);
      const field = updateField[0];
      if (!field) throw new Error("Failed to update field");
      return serializeField(field);
    }),

  deleteField: publicProcedure
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
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { deleteField } = await fieldService.deleteField(userId, input);
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

  getFieldsByFormIdForOwner: publicProcedure
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
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { fields } = await fieldService.getFieldsByFormIdForOwner(
        userId,
        input
      );
      return fields.map(serializeField);
    }),
});
