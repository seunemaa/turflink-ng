import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const membershipsTable = pgTable("memberships", {
  id: serial("id").primaryKey(),
  userId: text("user_id").unique(),
  email: text("email").notNull().unique(),
  name: text("name").notNull(),
  memberSince: timestamp("member_since", { withTimezone: true }).notNull().defaultNow(),
});

export const insertMembershipSchema = createInsertSchema(membershipsTable).omit({ id: true, memberSince: true });
export type InsertMembership = z.infer<typeof insertMembershipSchema>;
export type Membership = typeof membershipsTable.$inferSelect;
