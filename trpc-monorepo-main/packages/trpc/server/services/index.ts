import AnswerService from "@repo/services/answer";
import FieldService from "@repo/services/field";
import FormService from "@repo/services/form";
import FormLinkService from "@repo/services/formLink";
import ResponseService from "@repo/services/response";
import UserService from "@repo/services/user";

export const userService = new UserService();
export const formService = new FormService();
export const formLinkService = new FormLinkService();
export const fieldService = new FieldService();
export const responseService = new ResponseService();
export const answerService = new AnswerService();
