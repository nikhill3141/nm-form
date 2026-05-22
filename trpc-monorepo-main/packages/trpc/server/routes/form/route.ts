import {
  createFormInputModel,
  deleteFormInputModel,
  editFormInputModel,
  getFormByIdInputModel,
} from "@repo/services/form/model";
import { publicProcedure, router } from "../../trpc";
import { formService, userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie } from "../../utils/cookie";
import {
  createFormOutputModel,
  deleteFormOutputModel,
  editFormOutputModel,
  getAllFormsByUserIdInputModel,
  getAllFormsByUserIdOutputModel,
  getFormByIdOutputModel,
  serializeForm,
} from "./model";

const TAGS = ["Form"];
const getPath = generatePath("/form");

export const formRouter = router({
  createForm: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/create-form"),
        tags: TAGS,
      },
    })
    .input(createFormInputModel)
    .output(createFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { createForm } = await formService.createForm(userId, input);
      const form = createForm[0];
      if (!form) throw new Error("Failed to create form");
      return serializeForm(form);
    }),

  getFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-id"),
        tags: TAGS,
      },
    })
    .input(getFormByIdInputModel)
    .output(getFormByIdOutputModel)
    .query(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { form } = await formService.getFormById(userId, input);
      return serializeForm(form);
    }),

  getAllFormsByUserId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/user-forms"),
        tags: TAGS,
      },
    })
    .input(getAllFormsByUserIdInputModel)
    .output(getAllFormsByUserIdOutputModel)
    .query(async ({ ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { forms } = await formService.getAllFormsByUserId(userId);
      return forms.map(serializeForm);
    }),

  editForm: publicProcedure
    .meta({
      openapi: {
        method: "PATCH",
        path: getPath("/edit-form"),
        tags: TAGS,
      },
    })
    .input(editFormInputModel)
    .output(editFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { updateForm } = await formService.editForm(userId, input);
      const form = updateForm[0];
      if (!form) throw new Error("Failed to update form");
      return serializeForm(form);
    }),

  deleteForm: publicProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/delete-form"),
        tags: TAGS,
      },
    })
    .input(deleteFormInputModel)
    .output(deleteFormOutputModel)
    .mutation(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { deleteForm } = await formService.deleteForm(userId, input);
      const form = deleteForm[0];
      if (!form) throw new Error("Failed to delete form");
      return serializeForm(form);
    }),
});
