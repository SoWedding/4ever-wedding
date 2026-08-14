import { and, eq, isNull } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../../db";
import { guests, weddings } from "../../../../db/schema";
import { getChatGPTUser } from "../../../chatgpt-auth";

const WEDDING_ID = "giada-francesco-2027";
type GuestInput = {
  id?: string;
  name?: string;
  partySize?: number;
  status?: "Confermato" | "In attesa" | "Non partecipa";
  invitationSent?: boolean;
  allergies?: string;
  intolerances?: string;
  dietaryNeeds?: string;
  accessibilityNeeds?: string;
  specialNeeds?: string;
  notes?: string;
};

function allowedEmails() {
  const value = (env as unknown as { DASHBOARD_ALLOWED_EMAILS?: string }).DASHBOARD_ALLOWED_EMAILS ?? "";
  return new Set(value.split(",").map(email => email.trim().toLowerCase()).filter(Boolean));
}

async function authorized() {
  const user = await getChatGPTUser();
  return Boolean(user && allowedEmails().has(user.email.toLowerCase()));
}

const clean = (value: unknown, max = 1000) => String(value ?? "").trim().slice(0, max);
const normalizeName = (value: string) => value.normalize("NFKC").toLocaleLowerCase("it").replace(/\s+/g, " ").trim();

export async function GET() {
  if (!await authorized()) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const db = getDb();
  const records = await db.select().from(guests).where(and(eq(guests.weddingId, WEDDING_ID), isNull(guests.deletedAt)));
  return Response.json({ guests: records });
}

export async function POST(request: Request) {
  if (!await authorized()) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const body = await request.json() as GuestInput;
  const name = clean(body.name, 180);
  const partySize = Number(body.partySize ?? 1);
  if (!name || !Number.isInteger(partySize) || partySize < 1 || partySize > 12) {
    return Response.json({ error: "Dati invitato non validi" }, { status: 400 });
  }
  const db = getDb();
  const now = Date.now();
  await db.insert(weddings).values({
    id: WEDDING_ID, publicSlug: "giada-francesco", coupleNames: "Giada & Francesco",
    weddingDate: "2027-06-12", createdAt: now, updatedAt: now,
  }).onConflictDoUpdate({ target: weddings.id, set: { updatedAt: now } });
  const id = body.id && /^[A-Za-z0-9_-]{1,100}$/.test(body.id) ? body.id : crypto.randomUUID();
  await db.insert(guests).values({
    id, weddingId: WEDDING_ID, displayName: name, normalizedName: normalizeName(name), partySize,
    status: body.status ?? "In attesa", source: "Manuale", invitationSent: Boolean(body.invitationSent),
    allergies: clean(body.allergies), intolerances: clean(body.intolerances),
    dietaryNeeds: clean(body.dietaryNeeds), accessibilityNeeds: clean(body.accessibilityNeeds),
    specialNeeds: clean(body.specialNeeds), notes: clean(body.notes), createdAt: now, updatedAt: now,
  }).onConflictDoUpdate({
    target: guests.id,
    set: {
      displayName: name, normalizedName: normalizeName(name), partySize,
      status: body.status ?? "In attesa", invitationSent: Boolean(body.invitationSent),
      allergies: clean(body.allergies), intolerances: clean(body.intolerances),
      dietaryNeeds: clean(body.dietaryNeeds), accessibilityNeeds: clean(body.accessibilityNeeds),
      specialNeeds: clean(body.specialNeeds), notes: clean(body.notes), updatedAt: now, deletedAt: null,
    },
  });
  return Response.json({ ok: true, id });
}

export async function DELETE(request: Request) {
  if (!await authorized()) return Response.json({ error: "Non autorizzato" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id") ?? "";
  if (!id) return Response.json({ error: "ID mancante" }, { status: 400 });
  const db = getDb();
  await db.update(guests).set({ deletedAt: Date.now(), updatedAt: Date.now() })
    .where(and(eq(guests.id, id), eq(guests.weddingId, WEDDING_ID)));
  return Response.json({ ok: true });
}
