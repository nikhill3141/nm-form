import {
  createFormLinkInputModel,
  deleteFormLinkInputModel,
  getFormByLinkSlugInputModel,
  getFormLinksByFormIdInputModel,
} from "@repo/services/formLink/model";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { formLinkService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  createFormLinkOutputModel,
  deleteFormLinkOutputModel,
  getFormBySlugOutputModel,
  getFormLinksByFormIdOutputModel,
  serializeFormBySlug,
  serializeFormLink,
} from "./model";

const TAGS = ["Form Link"];
const getPath = generatePath("/form-link");

export const formLinkRouter = router({
  createFormLink: protectedProcedure
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
      const { createFormLink } = await formLinkService.createFormLink(
        ctx.user.id,
        input
      );
      const link = createFormLink[0];
      if (!link) throw new Error("Failed to create form link");
      return serializeFormLink(link);
    }),

  getFormLinksByFormId: protectedProcedure
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
      const { formLinks } = await formLinkService.getFormLinksByFormId(
        ctx.user.id,
        input
      );
      return formLinks.map(serializeFormLink);
    }),

  getFormByLinkSlug: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/resolve"),
        tags: TAGS,
      },
    })
    .input(getFormByLinkSlugInputModel)
    .output(getFormBySlugOutputModel)
    .query(async ({ input }) => {
      const { link, form } = await formLinkService.getFormByLinkSlug(input);
      return serializeFormBySlug({ link, form });
    }),

  deleteFormLink: protectedProcedure
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
      const { deleteFormLink } = await formLinkService.deleteFormLink(
        ctx.user.id,
        input
      );
      const link = deleteFormLink[0];
      if (!link) throw new Error("Failed to delete form link");
      return serializeFormLink(link);
    }),
});
