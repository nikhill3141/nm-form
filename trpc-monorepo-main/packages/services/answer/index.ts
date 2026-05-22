import db, { and, eq } from "@repo/database";
import {
  formResponsesTable,
  formsTable,
  responseAnswersTable,
} from "@repo/database/schema";
import {
  getAnswersByResponseIdInputModel,
  GetAnswersByResponseIdInputModelType,
} from "./model";

class AnswerService {
  private async getOwnedResponse(userId: string, responseId: string) {
    const [response] = await db
      .select({
        response: formResponsesTable,
        form: formsTable,
      })
      .from(formResponsesTable)
      .innerJoin(formsTable, eq(formResponsesTable.formId, formsTable.id))
      .where(eq(formResponsesTable.id, responseId))
      .limit(1);

    if (!response) {
      throw new Error("response not found");
    }

    if (response.form.userId !== userId) {
      throw new Error("response not found");
    }

    return response.response;
  }

  //get answers by response id (owner)
  public async getAnswersByResponseId(
    userId: string,
    payload: GetAnswersByResponseIdInputModelType
  ) {
    const { responseId } =
      await getAnswersByResponseIdInputModel.parseAsync(payload);

    await this.getOwnedResponse(userId, responseId);

    const answers = await db
      .select()
      .from(responseAnswersTable)
      .where(eq(responseAnswersTable.responseId, responseId));

    return {
      answers,
    };
  }
}

export default AnswerService;
