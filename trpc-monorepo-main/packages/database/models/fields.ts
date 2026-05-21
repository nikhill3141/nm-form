import { pgEnum, pgTable, uuid, varchar, text, boolean, integer, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import {formsTable } from "./form";
import { relations } from "drizzle-orm";
import { responseAnswersTable } from "./answer";



export const fieldTypeEnum = pgEnum("field_type", [
  "short_text",
  "long_text",
  "email",
  "number",
  "single_select",
  "multi_select",
  "checkbox",
  "phone",
  "date",
  "rating",
  "yes_no",
]);

export const formFieldsTable = pgTable(
  "form_fields",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    formId: uuid("form_id")
      .references(() => formsTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    label: varchar("label", {
      length: 255,
    }).notNull(),

    description: text("description"),

    type: fieldTypeEnum("type").notNull(),

    placeholder: varchar("placeholder", {
      length: 255,
    }),

    required: boolean("required")
      .default(false)
      .notNull(),

    order: integer("order").notNull(),

    validationRules: jsonb("validation_rules"),

    options: jsonb("options"),

    createdAt: timestamp("created_at").defaultNow(),

    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
  },
  (table) => ({
    formIdx: index("fields_form_idx").on(table.formId),

    orderIdx: index("fields_order_idx").on(
      table.formId,
      table.order
    ),
  })
);

// export types
export type SelectFormField = typeof formFieldsTable.$inferSelect;
export type InsertFormField = typeof formFieldsTable.$inferInsert;


export const formFieldsRelations = relations(
  formFieldsTable,
  ({ one, many }) => ({
    form: one(formsTable, {
      fields: [formFieldsTable.formId],
      references: [formsTable.id],
    }),

    answers: many(responseAnswersTable),
  })
);