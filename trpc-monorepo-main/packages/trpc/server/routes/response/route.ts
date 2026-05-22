import {
  getResponsesByFormIdInputModel,
  submitResponseInputModel,
} from "@repo/services/response/model";
import { publicProcedure, router } from "../../trpc";
import { responseService, userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie } from "../../utils/cookie";
import {
  getResponsesByFormIdOutputModel,
  serializeResponse,
  serializeSubmitResponse,
  submitResponseOutputModel,
} from "./model";

const TAGS = ["Response"];
const getPath = generatePath("/response");

export const responseRouter = router({
  submitResponse: publicProcedure
    .meta({
      openapi: {
        method: "POST",
        path: getPath("/submit"),
        tags: TAGS,
      },
    })
    .input(submitResponseInputModel)
    .output(submitResponseOutputModel)
    .mutation(async ({ input }) => {
      const result = await responseService.submitResponse(input);
      return serializeSubmitResponse(result);
    }),

  getResponsesByFormId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-form"),
        tags: TAGS,
      },
    })
    .input(getResponsesByFormIdInputModel)
    .output(getResponsesByFormIdOutputModel)
    .query(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { responses } = await responseService.getResponsesByFormId(
        userId,
        input
      );
      return responses.map(serializeResponse);
    }),
});
