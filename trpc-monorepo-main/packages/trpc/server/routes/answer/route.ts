import { getAnswersByResponseIdInputModel } from "@repo/services/answer/model";
import { publicProcedure, router } from "../../trpc";
import { answerService, userService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import { getAccessTokenCookie } from "../../utils/cookie";
import {
  getAnswersByResponseIdOutputModel,
  serializeAnswer,
} from "./model";

const TAGS = ["Answer"];
const getPath = generatePath("/answer");

export const answerRouter = router({
  getAnswersByResponseId: publicProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-response"),
        tags: TAGS,
      },
    })
    .input(getAnswersByResponseIdInputModel)
    .output(getAnswersByResponseIdOutputModel)
    .query(async ({ input, ctx }) => {
      const accessToken = getAccessTokenCookie(ctx);
      if (!accessToken) throw new Error("User is not logged in");

      const { id: userId } =
        await userService.verifyAndDecodeUserToken(accessToken);
      const { answers } = await answerService.getAnswersByResponseId(
        userId,
        input
      );
      return answers.map(serializeAnswer);
    }),
});
