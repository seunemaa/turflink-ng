import { pgTable, text, serial, integer, real, date, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { pitchesTable } from "./pitches";

export const bookingsTable = pgTable("bookings", {
  id: serial("id").primaryKey(),
  referenceNumber: text("reference_number").notNull().unique(),
  pitchId: integer("pitch_id").notNull().references(() => pitchesTable.id),
  userId: text("user_id"),
  userName: text("user_name"),
  userEmail: text("user_email"),
  date: date("date", { mode: "string" }).notNull(),
  timeSlot: text("time_slot").notNull(), // e.g. "09:00"
  matchType: text("match_type").notNull(), // "friendly" | "competitive"
  addOns: text("add_ons").array().notNull().default([]),
  basePrice: real("base_price").notNull(),
  addOnsTotal: real("add_ons_total").notNull().default(0),
  discountApplied: real("discount_applied").notNull().default(0),
  totalPrice: real("total_price").notNull(),
  status: text("status").notNull().default("confirmed"), // "pending" | "confirmed" | "cancelled"
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookingsTable).omit({ id: true, createdAt: true });
export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookingsTable.$inferSelect;
