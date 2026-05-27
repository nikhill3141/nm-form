import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { formsTable } from "./form";

export const usersTable = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  fullName: varchar("full_name", { length: 80 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  emailVerified: boolean("email_verified").default(false),
  password: varchar("password", { length: 255 }),
  profileImageUrl: text("profile_image_url"),
  salt: varchar("salt",{length:100}),
  refreshToken: varchar("refresh_token",{length:500}),
  emailVerificationTokenHash: varchar("email_verification_token_hash", {
    length: 255,
  }),
  emailVerificationExpiresAt: timestamp("email_verification_expires_at"),
  passwordResetTokenHash: varchar("password_reset_token_hash", {
    length: 255,
  }),
  passwordResetExpiresAt: timestamp("password_reset_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
});

export type SelectUser = typeof usersTable.$inferSelect;
export type InsertUser = typeof usersTable.$inferInsert;


export const usersRelations = relations(usersTable, ({ many }) => ({
  forms: many(formsTable),
}));




