import { getAnswersByResponseIdInputModel } from "@repo/services/answer/model";
import { protectedProcedure, router } from "../../trpc";
import { answerService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  getAnswersByResponseIdOutputModel,
  serializeAnswer,
} from "./model";

const TAGS = ["Answer"];
const getPath = generatePath("/answer");

export const answerRouter = router({
  getAnswersByResponseId: protectedProcedure
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
      const { answers } = await answerService.getAnswersByResponseId(
        ctx.user.id,
        input
      );
      return answers.map(serializeAnswer);
    }),
});
