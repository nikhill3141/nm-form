import { pgTable, uuid, varchar, text, boolean, integer, timestamp, index, uniqueIndex, pgEnum } from "drizzle-orm/pg-core";
import { usersTable } from "./user";
import { relations } from "drizzle-orm";



export const visibilityEnum = pgEnum("visibility", [
  "public",
  "unlisted",
]);

export const formStatusEnum = pgEnum("form_status", [
  "draft",
  "published",  
  "deleted",
]);

export const formsTable = pgTable(
  "forms",
  {
    id: uuid("id")
      .defaultRandom()
      .primaryKey(),

    title: varchar("title", {
      length: 255,
    }).notNull(),

    description: text("description"),

    theme: varchar("theme", {
      length: 100,
    }).default("default"),

    slug: varchar("slug", {
      length: 255,
    })
      .notNull()
      .unique(),

    visibility: visibilityEnum("visibility")
      .default("unlisted")
      .notNull(),

    status: formStatusEnum("status")
      .default("draft")
      .notNull(),

    isPublished: boolean("is_published")
      .default(false)
      .notNull(),

    allowAnonymous: boolean("allow_anonymous")
      .default(true)
      .notNull(),

    responseLimit: integer("response_limit"),

    responseCount: integer("response_count")
      .default(0)
      .notNull(),

    expiresAt: timestamp("expires_at", {
      withTimezone: true,
    }),

    userId: uuid("user_id")
      .references(() => usersTable.id, {
        onDelete: "cascade",
      })
      .notNull(),

    createdAt: timestamp("created_at", {
      withTimezone: true,
    })
      .defaultNow()
      .notNull(),

    updatedAt: timestamp("updated_at", {
      withTimezone: true,
    })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => ({
    slugIdx: uniqueIndex("forms_slug_idx").on(table.slug),

    userIdx: index("forms_user_idx").on(table.userId),

    visibilityIdx: index("forms_visibility_idx").on(
      table.visibility
    ),

    statusIdx: index("forms_status_idx").on(table.status),
  })
);

// export types
export type SelectForm = typeof formsTable.$inferSelect;
export type InsertForm = typeof formsTable.$inferInsert;




export const formsRelations = relations(formsTable, ({ one, many }) => ({
  creator: one(usersTable, {
    fields: [formsTable.userId],
    references: [usersTable.id],
  })
}));