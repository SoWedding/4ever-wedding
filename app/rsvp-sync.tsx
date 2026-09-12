"use client";

import { useEffect } from "react";

type Needs = { allergies: string; intolerances: string; dietary: string; accessibility: string; highchair: boolean; stroller: boolean; other: string; notes: string };
type Guest = { id: number; name: string; firstName?: string; lastName?: string; group: string; status: "Confermato" | "In attesa" | "Non partecipa"; plus: number; invitationSent: boolean; child?: boolean; origin?: "manual" | "rsvp"; addedBy?: string; rsvpId?: string; rsvpDate?: number; needs: Needs };
type RsvpParticipant = { nome: string; cognome: string; allergie?: string; necessita?: string; bambino?: boolean };
type Rsvp = { id: string; createdAt: number; payload: { partecipazione: "si" | "no"; rispondente?: { nome: string; cognome: string }; partecipanti?: RsvpParticipant[] } };

const normalize = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("it");
const fullName = (nome: string, cognome: string) => `${nome.trim()} ${cognome.trim()}`.trim();
const splitLegacyName = (value: string) => { const parts = value.trim().replace(/\s+/g, " ").split(" "); return { firstName: parts.slice(0, -1).join(" ") || parts[0] || "", lastName: parts.length > 1 ? parts.at(-1) || "" : "" }; };
const keyOf = (guest: Guest) => { const legacy = splitLegacyName(guest.name); return `${normalize(guest.firstName || legacy.firstName)}|${normalize(guest.lastName || legacy.lastName)}`; };
const key = (nome: string, cognome: string) => `${normalize(nome)}|${normalize(cognome)}`;

function mergeResponses(data: Record<string, unknown>, responses: Rsvp[]) {
  let guests = Array.isArray(data.guests) ? data.guests as Guest[] : [];
  let changed = false;
  const processed = new Set<string>(Array.isArray(data.processedRsvpIds) ? data.processedRsvpIds as string[] : []);

  for (const response of responses) {
    if (processed.has(response.id)) continue;
    const payload = response.payload;
    const participants = payload.partecipazione === "si" ? (payload.partecipanti || []) : payload.rispondente ? [{ ...payload.rispondente }] : [];
    const owner = participants[0] ? fullName(participants[0].nome, participants[0].cognome) : "Risposta RSVP";

    participants.forEach((person, index) => {
      const personKey = key(person.nome, person.cognome);
      const matches = guests.filter(item => keyOf(item) === personKey);
      if (matches.length === 1) {
        const target = matches[0];
        guests = guests.map(item => item.id === target.id ? {
          ...item,
          firstName: person.nome,
          lastName: person.cognome,
          name: fullName(person.nome, person.cognome),
          invitationSent: true,
          status: payload.partecipazione === "si" ? "Confermato" : "Non partecipa",
          rsvpId: response.id,
          rsvpDate: response.createdAt,
          child: "bambino" in person ? Boolean(person.bambino) : item.child,
          needs: { ...item.needs, allergies: person.allergie && normalize(person.allergie) !== "nessuna" ? person.allergie : item.needs?.allergies || "", other: person.necessita && normalize(person.necessita) !== "nessuna" ? person.necessita : item.needs?.other || "" },
        } : item);
      } else if (matches.length === 0) {
        guests = [...guests, {
          id: Date.now() + Math.floor(Math.random() * 100000), name: fullName(person.nome, person.cognome), firstName: person.nome, lastName: person.cognome,
          group: "Da assegnare", status: payload.partecipazione === "si" ? "Confermato" : "Non partecipa", plus: 1, invitationSent: true,
          child: Boolean(person.bambino), origin: "rsvp", addedBy: index === 0 ? undefined : owner, rsvpId: response.id, rsvpDate: response.createdAt,
          needs: { allergies: person.allergie && normalize(person.allergie) !== "nessuna" ? person.allergie : "", intolerances: "", dietary: "", accessibility: "", highchair: false, stroller: false, other: person.necessita && normalize(person.necessita) !== "nessuna" ? person.necessita : "", notes: index === 0 ? "Creato da RSVP digitale" : `Aggiunto tramite RSVP di ${owner}` },
        }];
      } else {
        guests = guests.map(item => keyOf(item) === personKey ? { ...item, needs: { ...item.needs, notes: `${item.needs?.notes ? `${item.needs.notes} · ` : ""}RSVP da verificare: omonimo rilevato` } } : item);
      }
    });
    processed.add(response.id);
    changed = true;
  }
  return changed ? { ...data, guests, processedRsvpIds: [...processed] } : null;
}

async function loadBaseData() {
  const shareCode = localStorage.getItem("4ever-shared-code");
  if (shareCode) {
    const cloudResponse = await fetch("/api/shared-wedding", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "load", code: shareCode }),
    });
    if (cloudResponse.ok) {
      const cloud = await cloudResponse.json() as { data?: Record<string, unknown> };
      if (cloud.data) return { data: cloud.data, shareCode };
    }
  }

  const saved = localStorage.getItem("4ever-demo");
  if (!saved) return null;
  return { data: JSON.parse(saved) as Record<string, unknown>, shareCode: null as string | null };
}

async function persistMerged(data: Record<string, unknown>, shareCode: string | null) {
  localStorage.setItem("4ever-demo", JSON.stringify(data));
  if (!shareCode) return;
  const cloudResponse = await fetch("/api/shared-wedding", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "save", code: shareCode, data }),
  });
  if (!cloudResponse.ok) throw new Error("Salvataggio RSVP nel cloud non riuscito");
}

export default function RsvpSync() {
  useEffect(() => {
    if (window.location.pathname !== "/") return;
    let stopped = false;
    const sync = async () => {
      try {
        const response = await fetch("/api/rsvp?event=giada-francesco", { cache: "no-store" });
        if (!response.ok || stopped) return;
        const result = await response.json() as { responses?: Rsvp[] };
        const base = await loadBaseData();
        if (!base || stopped) return;
        const merged = mergeResponses(base.data, result.responses || []);
        if (merged) {
          await persistMerged(merged, base.shareCode);
          if (stopped) return;
          sessionStorage.setItem("rsvp-sync-reload", "1");
          window.location.reload();
        }
      } catch { /* retry on next interval */ }
    };
    sync();
    const timer = window.setInterval(sync, 15000);
    return () => { stopped = true; window.clearInterval(timer); };
  }, []);
  return null;
}
