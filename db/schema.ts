import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const sharedWeddings = sqliteTable("shared_weddings", {
  code: text("code").primaryKey(),
  data: text("data").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const weddings = sqliteTable("weddings", {
  id: text("id").primaryKey(),
  publicSlug: text("public_slug").notNull().unique(),
  coupleNames: text("couple_names").notNull(),
  weddingDate: text("wedding_date"),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const guests = sqliteTable("guests", {
  id: text("id").primaryKey(),
  weddingId: text("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  displayName: text("display_name").notNull(),
  normalizedName: text("normalized_name").notNull(),
  partySize: integer("party_size").notNull().default(1),
  status: text("status", { enum: ["Confermato", "In attesa", "Non partecipa"] }).notNull(),
  source: text("source", { enum: ["Manuale", "Invito digitale"] }).notNull().default("Manuale"),
  invitationSent: integer("invitation_sent", { mode: "boolean" }).notNull().default(false),
  allergies: text("allergies").notNull().default(""),
  intolerances: text("intolerances").notNull().default(""),
  dietaryNeeds: text("dietary_needs").notNull().default(""),
  accessibilityNeeds: text("accessibility_needs").notNull().default(""),
  specialNeeds: text("special_needs").notNull().default(""),
  notes: text("notes").notNull().default(""),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
  deletedAt: integer("deleted_at"),
}, table => [
  index("guests_wedding_idx").on(table.weddingId),
  index("guests_wedding_name_idx").on(table.weddingId, table.normalizedName),
]);

export const rsvpResponses = sqliteTable("rsvp_responses", {
  id: text("id").primaryKey(),
  weddingId: text("wedding_id").notNull().references(() => weddings.id, { onDelete: "cascade" }),
  guestId: text("guest_id").notNull().references(() => guests.id, { onDelete: "cascade" }),
  idempotencyKey: text("idempotency_key").notNull(),
  fingerprint: text("fingerprint").notNull(),
  participation: text("participation", { enum: ["si", "no"] }).notNull(),
  displayName: text("display_name").notNull(),
  partySize: integer("party_size").notNull(),
  allergies: text("allergies").notNull().default(""),
  intolerances: text("intolerances").notNull().default(""),
  specialNeeds: text("special_needs").notNull().default(""),
  privacyConsentAt: integer("privacy_consent_at").notNull(),
  submittedAt: integer("submitted_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
}, table => [
  uniqueIndex("rsvp_wedding_idempotency_uidx").on(table.weddingId, table.idempotencyKey),
  uniqueIndex("rsvp_wedding_fingerprint_uidx").on(table.weddingId, table.fingerprint),
  index("rsvp_guest_idx").on(table.guestId),
]);
