import { and, eq, gt } from "drizzle-orm";
import { getDb } from "../../../db";
import { rsvpResponses } from "../../../db/schema";

type Participant = {
  nome: string;
  cognome: string;
  allergie?: string;
  necessita?: string;
  bambino?: boolean;
};

type RsvpPayload = {
  partecipazione: "si" | "no";
  rispondente?: { nome: string; cognome: string };
  partecipanti?: Participant[];
};

const EVENT_KEY = "giada-francesco";
const normalize = (value: unknown) => String(value ?? "").trim().replace(/\s+/g, " ");

export async function POST(request: Request) {
  try {
    const body = await request.json() as { eventKey?: string; payload?: RsvpPayload };
    const eventKey = normalize(body.eventKey || EVENT_KEY);
    if (eventKey !== EVENT_KEY || !body.payload) return Response.json({ error: "Richiesta non valida" }, { status: 400 });

    const payload = body.payload;
    if (payload.partecipazione !== "si" && payload.partecipazione !== "no") return Response.json({ error: "Risposta RSVP non valida" }, { status: 400 });

    if (payload.partecipazione === "si") {
      if (!payload.partecipanti?.length) return Response.json({ error: "Inserisci almeno un partecipante" }, { status: 400 });
      payload.partecipanti = payload.partecipanti.map(item => ({
        nome: normalize(item.nome),
        cognome: normalize(item.cognome),
        allergie: normalize(item.allergie),
        necessita: normalize(item.necessita),
        bambino: Boolean(item.bambino),
      }));
      if (payload.partecipanti.some(item => !item.nome || !item.cognome)) return Response.json({ error: "Nome e cognome sono obbligatori" }, { status: 400 });
    } else {
      payload.rispondente = { nome: normalize(payload.rispondente?.nome), cognome: normalize(payload.rispondente?.cognome) };
      if (!payload.rispondente.nome || !payload.rispondente.cognome) return Response.json({ error: "Nome e cognome sono obbligatori" }, { status: 400 });
    }

    const id = crypto.randomUUID();
    const createdAt = Date.now();
    const db = getDb();
    await db.insert(rsvpResponses).values({ id, eventKey, payload: JSON.stringify(payload), createdAt });
    return Response.json({ id, createdAt });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore inatteso";
    return Response.json({ error: message }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventKey = normalize(url.searchParams.get("event") || EVENT_KEY);
    const since = Number(url.searchParams.get("since") || 0);
    if (eventKey !== EVENT_KEY) return Response.json({ error: "Evento non valido" }, { status: 400 });
    const db = getDb();
    const rows = await db.select().from(rsvpResponses).where(since > 0 ? and(eq(rsvpResponses.eventKey, eventKey), gt(rsvpResponses.createdAt, since)) : eq(rsvpResponses.eventKey, eventKey));
    return Response.json({ responses: rows.map(row => ({ id: row.id, createdAt: row.createdAt, payload: JSON.parse(row.payload) })) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore inatteso";
    return Response.json({ error: message }, { status: 500 });
  }
}
