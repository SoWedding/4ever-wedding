import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import { sharedWeddings } from "../../../db/schema";

type RequestBody = { action?: "create" | "load" | "save"; code?: string; data?: unknown };

const normalizeCode = (value?: string) => (value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
const makeCode = () => {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = crypto.getRandomValues(new Uint8Array(8));
  return Array.from(bytes, value => alphabet[value % alphabet.length]).join("");
};

export async function POST(request: Request) {
  try {
    const body = await request.json() as RequestBody;
    const db = getDb();

    if (body.action === "create") {
      const serialized = JSON.stringify(body.data ?? {});
      if (serialized.length > 900_000) return Response.json({ error: "Dati troppo grandi" }, { status: 413 });
      for (let attempt = 0; attempt < 5; attempt += 1) {
        const code = makeCode();
        const existing = await db.select({ code: sharedWeddings.code }).from(sharedWeddings).where(eq(sharedWeddings.code, code)).limit(1);
        if (existing.length) continue;
        const updatedAt = Date.now();
        await db.insert(sharedWeddings).values({ code, data: serialized, updatedAt });
        return Response.json({ code, updatedAt });
      }
      return Response.json({ error: "Impossibile creare il codice" }, { status: 503 });
    }

    const code = normalizeCode(body.code);
    if (!/^[A-Z0-9]{8}$/.test(code)) return Response.json({ error: "Codice non valido" }, { status: 400 });

    if (body.action === "load") {
      const [record] = await db.select().from(sharedWeddings).where(eq(sharedWeddings.code, code)).limit(1);
      if (!record) return Response.json({ error: "Codice non trovato" }, { status: 404 });
      return Response.json({ code, data: JSON.parse(record.data), updatedAt: record.updatedAt });
    }

    if (body.action === "save") {
      const serialized = JSON.stringify(body.data ?? {});
      if (serialized.length > 900_000) return Response.json({ error: "Dati troppo grandi" }, { status: 413 });
      const updatedAt = Date.now();
      const result = await db.update(sharedWeddings).set({ data: serialized, updatedAt }).where(eq(sharedWeddings.code, code)).returning({ code: sharedWeddings.code });
      if (!result.length) return Response.json({ error: "Codice non trovato" }, { status: 404 });
      return Response.json({ code, updatedAt });
    }

    return Response.json({ error: "Operazione non valida" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Errore inatteso";
    return Response.json({ error: message }, { status: 500 });
  }
}
