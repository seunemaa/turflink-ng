import { pgTable, text, serial, integer, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const pitchesTable = pgTable("pitches", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  location: text("location").notNull(),
  format: text("format").notNull(), // e.g. "11v11"
  surface: text("surface").notNull(), // e.g. "Hybrid Grass"
  pricePerHour: real("price_per_hour").notNull(),
  imageUrl: text("image_url"),
  description: text("description"),
  amenities: text("amenities").array().notNull().default([]),
});

export const insertPitchSchema = createInsertSchema(pitchesTable).omit({ id: true });
export type InsertPitch = z.infer<typeof insertPitchSchema>;
export type Pitch = typeof pitchesTable.$inferSelect;
