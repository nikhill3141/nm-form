import { pgTable, uuid, text, timestamp, index } from "drizzle-orm/pg-core";
import { formResponsesTable } from "./response";
import { formFieldsTable } from "./fields";
import { relations } from "drizzle-orm";


export const responseAnswersTable = pgTable(
  "response_answers",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    responseId: uuid("response_id")
      .references(() => formResponsesTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    fieldId: uuid("field_id")
      .references(() => formFieldsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    value: text("value").notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    responseIdx: index("answers_response_idx").on(
      table.responseId
    ),

    fieldIdx: index("answers_field_idx").on(
      table.fieldId
    ),
  })
);

// export types
export type SelectResponseAnswer = typeof responseAnswersTable.$inferSelect;
export type InsertResponseAnswer = typeof responseAnswersTable.$inferInsert;

export const responseAnswersRelations = relations(
  responseAnswersTable,
  ({ one }) => ({
    response: one(formResponsesTable, {
      fields: [responseAnswersTable.responseId],
      references: [formResponsesTable.id],
    }),
  })
);