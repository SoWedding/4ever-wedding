"use client";

import { useEffect } from "react";

const splitName = (value: string) => {
  const parts = value.trim().replace(/\s+/g, " ").split(" ").filter(Boolean);
  if (parts.length < 2) return { nome: parts[0] || "", cognome: "" };
  return { nome: parts.slice(0, -1).join(" "), cognome: parts.at(-1) || "" };
};

export default function RsvpSubmitBridge() {
  useEffect(() => {
    if (window.location.pathname !== "/invito") return;
    const handler = (event: SubmitEvent) => {
      const form = event.target as HTMLFormElement | null;
      if (!form?.closest("#rsvp")) return;
      const data = new FormData(form);
      const partecipazione = String(data.get("partecipazione") || "");
      if (partecipazione !== "si" && partecipazione !== "no") return;

      const payload = partecipazione === "no"
        ? { partecipazione: "no", rispondente: splitName(String(data.get("rispondente") || "")) }
        : {
            partecipazione: "si",
            partecipanti: Array.from({ length: Math.max(1, Number(data.get("numeroPartecipanti") || 1)) }, (_, index) => ({
              ...splitName(String(data.get(`partecipante-${index}-nome`) || "")),
              allergie: String(data.get(`partecipante-${index}-allergie`) || "").trim(),
              necessita: String(data.get(`partecipante-${index}-necessita`) || "").trim(),
              bambino: data.get(`partecipante-${index}-bambino`) === "on",
            })),
          };

      void fetch("/api/rsvp", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ eventKey: "giada-francesco", payload }) });
    };
    document.addEventListener("submit", handler, true);
    return () => document.removeEventListener("submit", handler, true);
  }, []);
  return null;
}
