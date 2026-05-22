import { getPublicFormByIdInputModel } from "@repo/services/form/model";
import { publicProcedure, router } from "../../trpc";
import { fieldService, formService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  explorePublicFormByIdOutputModel,
  explorePublicFormsInputModel,
  explorePublicFormsOutputModel,
  serializeExplorePublicFormById,
} from "./model";
import { serializeForm } from "../form/model";

const TAGS = ["Explore"];
const getPath = generatePath("/explore");

export const exploreRouter = router({
  explorePublicForms: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms"),
        tags: TAGS,
      },
    })
    .input(explorePublicFormsInputModel)
    .output(explorePublicFormsOutputModel)
    .query(async () => {
      const { forms } = await formService.getAllPublicForms();
      return forms.map(serializeForm);
    }),

  explorePublicFormById: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/forms-by-id"),
        tags: TAGS,
      },
    })
    .input(getPublicFormByIdInputModel)
    .output(explorePublicFormByIdOutputModel)
    .query(async ({ input }) => {
      const { form } = await formService.getPublicFormById(input.id);
      const { fields } = await fieldService.getFieldsByFormId({
        formId: form.id,
      });
      return serializeExplorePublicFormById({ form, fields });
    }),
});
