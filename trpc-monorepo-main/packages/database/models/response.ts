import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { relations } from "drizzle-orm";


export const formResponsesTable = pgTable(
  "form_responses",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    formId: uuid("form_id")
      .references(() => formsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    respondentIp: varchar("respondent_ip", {
      length: 100,
    }),

    userAgent: text("user_agent"),

    isCompleted: boolean("is_completed")
      .default(true)
      .notNull(),

    submittedAt: timestamp("submitted_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    formIdx: index("responses_form_idx").on(table.formId),

    submittedIdx: index("responses_submitted_idx").on(
      table.submittedAt
    ),
  })
);

// export types
export type SelectFormResponse = typeof formResponsesTable.$inferSelect;
export type InsertFormResponse = typeof formResponsesTable.$inferInsert;

export const formResponsesRelations = relations(
  formResponsesTable,
  ({ one, many }) => ({
    form: one(formsTable, {
      fields: [formResponsesTable.formId],
      references: [formsTable.id],
    }),
  })
);