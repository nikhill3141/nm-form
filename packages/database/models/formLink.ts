import { pgTable, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { formsTable } from "./form";
import { relations } from "drizzle-orm";



export const formLinksTable = pgTable(
  "form_links",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    formId: uuid("form_id")
      .references(() => formsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    formIdx: uniqueIndex("form_links_form_idx").on(
      table.formId
    ),
  })
);

// export types
export type SelectFormLink = typeof formLinksTable.$inferSelect;
export type InsertFormLink = typeof formLinksTable.$inferInsert;

export const formLinksRelations = relations(
  formLinksTable,
  ({ one }) => ({
    form: one(formsTable, {
      fields: [formLinksTable.formId],
      references: [formsTable.id],
    }),
  })
);
