import { and, eq, or } from "drizzle-orm";
import { getDb } from "../../../db";
import { guests, rsvpResponses, weddings } from "../../../db/schema";

const WEDDING_ID = "giada-francesco-2027";
const PUBLIC_SLUG = "giada-francesco";

type RsvpBody = {
  idempotencyKey?: string;
  participation?: "si" | "no";
  names?: string;
  partySize?: number;
  allergies?: string;
  intolerances?: string;
  specialNeeds?: string;
  privacyConsent?: boolean;
};

const clean = (value: unknown, max = 500) => String(value ?? "").trim().slice(0, max);
const normalizeName = (value: string) => value.normalize("NFKC").toLocaleLowerCase("it").replace(/\s+/g, " ").trim();

async function fingerprint(body: Required<Pick<RsvpBody, "participation" | "names" | "partySize">>) {
  const source = `${normalizeName(body.names)}|${body.partySize}|${body.participation}`;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(source));
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as RsvpBody;
    const names = clean(body.names, 180);
    const participation = body.participation;
    const partySize = Number(body.partySize);
    const idempotencyKey = clean(body.idempotencyKey, 100);

    if (!body.privacyConsent) return Response.json({ error: "Il consenso privacy è necessario." }, { status: 400 });
    if (!names || !participation || !["si", "no"].includes(participation)) {
      return Response.json({ error: "Compilate i campi obbligatori." }, { status: 400 });
    }
    if (!Number.isInteger(partySize) || partySize < 1 || partySize > 12) {
      return Response.json({ error: "Numero di partecipanti non valido." }, { status: 400 });
    }
    if (!/^[A-Za-z0-9_-]{16,100}$/.test(idempotencyKey)) {
      return Response.json({ error: "Identificativo della risposta non valido." }, { status: 400 });
    }

    const db = getDb();
    const now = Date.now();
    const normalizedName = normalizeName(names);
    const responseFingerprint = await fingerprint({ participation, names, partySize });
    const allergies = clean(body.allergies);
    const intolerances = clean(body.intolerances);
    const specialNeeds = clean(body.specialNeeds, 1000);
    const status = participation === "si" ? "Confermato" : "Non partecipa";

    await db.insert(weddings).values({
      id: WEDDING_ID,
      publicSlug: PUBLIC_SLUG,
      coupleNames: "Giada & Francesco",
      weddingDate: "2027-06-12",
      createdAt: now,
      updatedAt: now,
    }).onConflictDoUpdate({ target: weddings.id, set: { updatedAt: now } });

    const [existing] = await db.select().from(rsvpResponses).where(
      and(
        eq(rsvpResponses.weddingId, WEDDING_ID),
        or(eq(rsvpResponses.idempotencyKey, idempotencyKey), eq(rsvpResponses.fingerprint, responseFingerprint)),
      ),
    ).limit(1);

    if (existing) {
      await db.batch([
        db.update(guests).set({
          displayName: names, normalizedName, partySize, status,
          allergies, intolerances, specialNeeds, source: "Invito digitale", updatedAt: now, deletedAt: null,
        }).where(eq(guests.id, existing.guestId)),
        db.update(rsvpResponses).set({
          idempotencyKey, fingerprint: responseFingerprint, participation, displayName: names,
          partySize, allergies, intolerances, specialNeeds, privacyConsentAt: now, updatedAt: now,
        }).where(eq(rsvpResponses.id, existing.id)),
      ]);
      return Response.json({ ok: true, repeated: true });
    }

    const guestId = crypto.randomUUID();
    const responseId = crypto.randomUUID();
    await db.batch([
      db.insert(guests).values({
        id: guestId, weddingId: WEDDING_ID, displayName: names, normalizedName, partySize,
        status, source: "Invito digitale", invitationSent: true, allergies, intolerances,
        specialNeeds, createdAt: now, updatedAt: now,
      }),
      db.insert(rsvpResponses).values({
        id: responseId, weddingId: WEDDING_ID, guestId, idempotencyKey,
        fingerprint: responseFingerprint, participation, displayName: names, partySize,
        allergies, intolerances, specialNeeds, privacyConsentAt: now, submittedAt: now, updatedAt: now,
      }),
    ]);

    return Response.json({ ok: true, repeated: false }, { status: 201 });
  } catch {
    return Response.json({ error: "Non è stato possibile registrare la risposta. Riprovate tra poco." }, { status: 500 });
  }
}
