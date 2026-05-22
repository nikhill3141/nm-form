import {
  createFormLinkInputModel,
  deleteFormLinkInputModel,
  getFormByLinkTokenInputModel,
  getFormLinksByFormIdInputModel,
} from "@repo/services/formLink/model";
import { publicProcedure, router } from "../../trpc";
import { formLinkService, userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie } from "../../utils/cookie";
import {
  createFormLinkOutputModel,
  deleteFormLinkOutputModel,
  getFormByLinkTokenOutputModel,
  getFormLinksByFormIdOutputModel,
  serializeFormByLinkToken,
  serializeFormLink,
} from "./model";

const TAGS = ["Form Link"];
const getPath = generatePath("/form-link");

export const formLinkRouter = router({
  createFormLink: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/create"),
        tags: TAGS,
      },
    })
    .input(createFormLinkInputModel)
    .output(createFormLinkOutputModel)
    .mutation(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { createFormLink } = await formLinkService.createFormLink(
        userId,
        input
      );
      const link = createFormLink[0];
      if (!link) throw new Error("Failed to create form link");
      return serializeFormLink(link);
    }),

  getFormLinksByFormId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-form"),
        tags: TAGS,
      },
    })
    .input(getFormLinksByFormIdInputModel)
    .output(getFormLinksByFormIdOutputModel)
    .query(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { formLinks } = await formLinkService.getFormLinksByFormId(
        userId,
        input
      );
      return formLinks.map(serializeFormLink);
    }),

  getFormByLinkToken: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/resolve"),
        tags: TAGS,
      },
    })
    .input(getFormByLinkTokenInputModel)
    .output(getFormByLinkTokenOutputModel)
    .query(async ({ input }) => {
      const { link, form } = await formLinkService.getFormByLinkToken(input);
      return serializeFormByLinkToken({ link, form });
    }),

  deleteFormLink: publicProcedure
    .meta({
      openapi: {
        method: "DELETE",
        path: getPath("/delete"),
        tags: TAGS,
      },
    })
    .input(deleteFormLinkInputModel)
    .output(deleteFormLinkOutputModel)
    .mutation(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { deleteFormLink } = await formLinkService.deleteFormLink(
        userId,
        input
      );
      const link = deleteFormLink[0];
      if (!link) throw new Error("Failed to delete form link");
      return serializeFormLink(link);
    }),
});
