import {
  getResponsesByFormIdInputModel,
  submitResponseInputModel,
} from "@repo/services/response/model";
import { protectedProcedure, publicProcedure, router } from "../../trpc";
import { responseService } from "../../services";
import { generatePath } from "../../utils/path-generator";
import {
  responseDetailsOutputModel,
  getResponsesByFormIdOutputModel,
  serializeResponseDetails,
  serializeResponse,
  serializeSubmitResponse,
  submitResponseOutputModel,
} from "./model";
import { assertRateLimit } from "../../utils/rate-limit";

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
    .mutation(async ({ input, ctx }) => {
      const clientKey = ctx.requestIp ?? "unknown";
      await assertRateLimit({
        key: `response:${input.formId}:${clientKey}`,
        limit: 8,
        windowMs: 10 * 60 * 1000,
        message: "Too many submissions from this device. Please wait before submitting again.",
      });
      const result = await responseService.submitResponse({
        ...input,
        respondentIp: input.respondentIp ?? ctx.requestIp,
        userAgent: input.userAgent ?? ctx.userAgent,
      });
      return serializeSubmitResponse(result);
    }),

  getResponsesByFormId: protectedProcedure
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
      const { responses } = await responseService.getResponsesByFormId(
        ctx.user.id,
        input
      );
      return responses.map(serializeResponse);
    }),

  getResponseDetailsByFormId: protectedProcedure
    .meta({
      openapi: {
        method: "GET",
        path: getPath("/by-form/details"),
        tags: TAGS,
      },
    })
    .input(getResponsesByFormIdInputModel)
    .output(responseDetailsOutputModel)
    .query(async ({ input, ctx }) => {
      const details = await responseService.getResponseDetailsByFormId(
        ctx.user.id,
        input
      );
      return serializeResponseDetails(details);
    }),
});
