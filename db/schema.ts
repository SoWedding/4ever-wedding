import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sharedWeddings = sqliteTable("shared_weddings", {
  code: text("code").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const rsvpResponses = sqliteTable("rsvp_responses", {
  id: text("id").primaryKey(),
  eventKey: text("event_key").notNull(),
  payload: text("payload").notNull(),
  createdAt: integer("created_at").notNull(),
});
