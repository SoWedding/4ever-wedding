"use client";

import { useEffect } from "react";

type Guest = {
  id: number;
  name: string;
  status: "Confermato" | "In attesa" | "Non partecipa";
  invitationSent: boolean;
  child?: boolean;
  origin?: "manual" | "rsvp";
  addedBy?: string;
  rsvpId?: string;
  needs?: {
    allergies?: string;
    intolerances?: string;
    dietary?: string;
    accessibility?: string;
    highchair?: boolean;
    stroller?: boolean;
    other?: string;
    notes?: string;
  };
};

const readGuests = (): Guest[] => {
  try {
    const raw = localStorage.getItem("4ever-demo");
    if (!raw) return [];
    const data = JSON.parse(raw) as { guests?: Guest[] };
    return Array.isArray(data.guests) ? data.guests : [];
  } catch {
    return [];
  }
};

const clean = (value: string) => value.trim().replace(/\s+/g, " ").toLocaleLowerCase("it");

function addBadge(container: HTMLElement, text: string, tone = "neutral") {
  const key = `guest-badge-${clean(text).replace(/[^a-z0-9]+/g, "-")}`;
  if (container.querySelector(`[data-enhancement="${key}"]`)) return;
  const badge = document.createElement("span");
  badge.dataset.enhancement = key;
  badge.textContent = text;
  badge.style.display = "inline-flex";
  badge.style.alignItems = "center";
  badge.style.gap = "4px";
  badge.style.margin = "5px 6px 0 0";
  badge.style.padding = "4px 8px";
  badge.style.borderRadius = "999px";
  badge.style.fontSize = "11px";
  badge.style.fontWeight = "700";
  badge.style.lineHeight = "1.2";
  badge.style.background = tone === "warning" ? "#fff3da" : tone === "info" ? "#edf4f7" : tone === "child" ? "#f5eef8" : "#f3f1ec";
  badge.style.color = tone === "warning" ? "#8a6517" : tone === "info" ? "#526f82" : tone === "child" ? "#785b86" : "#6f716c";
  container.appendChild(badge);
}

function enhanceGuestRows() {
  if (window.location.pathname !== "/") return;
  const guests = readGuests();
  const rows = Array.from(document.querySelectorAll<HTMLElement>(".guest-row"));
  rows.forEach(row => {
    const nameElement = row.querySelector<HTMLElement>("b");
    const info = nameElement?.parentElement;
    if (!nameElement || !info) return;
    const visibleName = clean(nameElement.childNodes[0]?.textContent || nameElement.textContent || "");
    const guest = guests.find(item => clean(item.name) === visibleName || visibleName.startsWith(clean(item.name)));
    if (!guest) return;

    let badges = info.querySelector<HTMLElement>("[data-enhancement='guest-badges']");
    if (!badges) {
      badges = document.createElement("div");
      badges.dataset.enhancement = "guest-badges";
      badges.style.display = "flex";
      badges.style.flexWrap = "wrap";
      badges.style.marginTop = "3px";
      info.appendChild(badges);
    }

    if (guest.child) addBadge(badges, "👶 Bambino", "child");
    if (guest.needs?.allergies) addBadge(badges, `⚠ Allergia · ${guest.needs.allergies}`, "warning");
    if (guest.needs?.intolerances) addBadge(badges, `Intolleranza · ${guest.needs.intolerances}`, "warning");
    if (guest.needs?.dietary) addBadge(badges, `Alimentazione · ${guest.needs.dietary}`, "info");
    if (guest.needs?.accessibility) addBadge(badges, `Accessibilità · ${guest.needs.accessibility}`, "info");
    if (guest.needs?.highchair) addBadge(badges, "Seggiolone", "info");
    if (guest.needs?.stroller) addBadge(badges, "Posto passeggino", "info");
    if (guest.needs?.other) addBadge(badges, `Esigenza · ${guest.needs.other}`, "info");
    if (guest.origin === "rsvp") addBadge(badges, "RSVP digitale", "info");
    if (guest.addedBy) addBadge(badges, `Aggiunto da ${guest.addedBy}`, "info");
    if (guest.invitationSent && guest.status === "In attesa") addBadge(badges, "Da sollecitare", "warning");
    if (guest.needs?.notes?.toLocaleLowerCase("it").includes("da verificare")) addBadge(badges, "Da verificare", "warning");
    row.dataset.guestName = clean(guest.name);
    row.dataset.status = guest.status;
    row.dataset.sent = String(Boolean(guest.invitationSent));
    row.dataset.child = String(Boolean(guest.child));
    row.dataset.origin = guest.origin || "manual";
    row.dataset.addedBy = guest.addedBy ? "true" : "false";
    row.dataset.allergies = guest.needs?.allergies ? "true" : "false";
    row.dataset.intolerances = guest.needs?.intolerances ? "true" : "false";
    row.dataset.special = guest.needs && (guest.needs.dietary || guest.needs.accessibility || guest.needs.highchair || guest.needs.stroller || guest.needs.other) ? "true" : "false";
  });
}

function installGuestToolbar() {
  if (window.location.pathname !== "/") return;
  const guestList = document.querySelector<HTMLElement>(".guest-list");
  if (!guestList || document.querySelector("[data-enhancement='guest-toolbar']")) return;
  const host = guestList.parentElement;
  if (!host) return;

  const toolbar = document.createElement("div");
  toolbar.dataset.enhancement = "guest-toolbar";
  toolbar.style.display = "grid";
  toolbar.style.gap = "12px";
  toolbar.style.margin = "18px 0";
  toolbar.innerHTML = `<input data-guest-search type="search" placeholder="Cerca nome o cognome" aria-label="Cerca invitati" style="width:100%;padding:13px 15px;border:1px solid #ddd7cc;border-radius:14px;background:#fff;font:inherit"/><div data-guest-filters style="display:flex;gap:8px;overflow:auto;padding-bottom:3px"></div>`;
  host.insertBefore(toolbar, guestList);

  const filters = ["Tutti", "Da invitare", "Inviato senza risposta", "Partecipa", "Non partecipa", "Bambini", "Allergie", "Intolleranze", "Esigenze particolari", "Creati da RSVP", "Aggiunti da altri invitati"];
  let selected = "Tutti";
  const filterHost = toolbar.querySelector<HTMLElement>("[data-guest-filters]")!;
  const search = toolbar.querySelector<HTMLInputElement>("[data-guest-search]")!;

  const apply = () => {
    const query = clean(search.value);
    Array.from(document.querySelectorAll<HTMLElement>(".guest-row")).forEach(row => {
      const matchesSearch = !query || (row.dataset.guestName || "").includes(query);
      const matchesFilter = selected === "Tutti"
        || (selected === "Da invitare" && row.dataset.sent !== "true")
        || (selected === "Inviato senza risposta" && row.dataset.sent === "true" && row.dataset.status === "In attesa")
        || (selected === "Partecipa" && row.dataset.status === "Confermato")
        || (selected === "Non partecipa" && row.dataset.status === "Non partecipa")
        || (selected === "Bambini" && row.dataset.child === "true")
        || (selected === "Allergie" && row.dataset.allergies === "true")
        || (selected === "Intolleranze" && row.dataset.intolerances === "true")
        || (selected === "Esigenze particolari" && row.dataset.special === "true")
        || (selected === "Creati da RSVP" && row.dataset.origin === "rsvp")
        || (selected === "Aggiunti da altri invitati" && row.dataset.addedBy === "true");
      row.style.display = matchesSearch && matchesFilter ? "" : "none";
    });
  };

  filters.forEach(label => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = label;
    button.style.flex = "0 0 auto";
    button.style.border = "1px solid #ddd7cc";
    button.style.borderRadius = "999px";
    button.style.padding = "9px 12px";
    button.style.background = label === selected ? "#6d7762" : "#fff";
    button.style.color = label === selected ? "#fff" : "#555";
    button.style.cursor = "pointer";
    button.onclick = () => {
      selected = label;
      Array.from(filterHost.querySelectorAll("button")).forEach(item => {
        const active = item.textContent === selected;
        (item as HTMLButtonElement).style.background = active ? "#6d7762" : "#fff";
        (item as HTMLButtonElement).style.color = active ? "#fff" : "#555";
      });
      apply();
    };
    filterHost.appendChild(button);
  });
  search.addEventListener("input", apply);
  apply();
}

function installChildFieldInGuestModal() {
  if (window.location.pathname !== "/") return;
  const form = Array.from(document.querySelectorAll<HTMLFormElement>("form")).find(item => item.querySelector("input[name='guestNotes']"));
  if (!form || form.querySelector("input[name='child']")) return;
  const invitationField = form.querySelector<HTMLElement>(".invitation-field");
  if (!invitationField) return;
  const label = document.createElement("label");
  label.className = "wide invitation-field";
  label.innerHTML = `<input name="child" type="checkbox"/><span>Bambino</span>`;
  invitationField.insertAdjacentElement("afterend", label);
  const name = (form.querySelector<HTMLInputElement>("input[name='name']")?.value || "").trim();
  const guest = readGuests().find(item => clean(item.name) === clean(name));
  const checkbox = label.querySelector<HTMLInputElement>("input")!;
  checkbox.checked = Boolean(guest?.child);

  form.addEventListener("submit", () => {
    const guestName = (form.querySelector<HTMLInputElement>("input[name='name']")?.value || "").trim();
    const child = checkbox.checked;
    window.setTimeout(() => {
      try {
        const raw = localStorage.getItem("4ever-demo");
        if (!raw) return;
        const data = JSON.parse(raw) as { guests?: Guest[] };
        if (!Array.isArray(data.guests)) return;
        data.guests = data.guests.map(item => clean(item.name) === clean(guestName) ? { ...item, child } : item);
        localStorage.setItem("4ever-demo", JSON.stringify(data));
        window.location.reload();
      } catch { /* keep normal submit behavior */ }
    }, 120);
  }, { once: true });
}

function installChildFieldsInRsvp() {
  if (window.location.pathname !== "/invito") return;
  document.querySelectorAll<HTMLInputElement>("input[name^='partecipante-'][name$='-nome']").forEach(input => {
    const match = input.name.match(/^partecipante-(\d+)-nome$/);
    if (!match) return;
    const index = match[1];
    const card = input.closest("div");
    if (!card || card.querySelector(`input[name='partecipante-${index}-bambino']`)) return;
    const label = document.createElement("label");
    label.style.display = "flex";
    label.style.alignItems = "center";
    label.style.gap = "9px";
    label.style.marginTop = "12px";
    label.style.color = "#526f82";
    label.style.fontWeight = "600";
    label.innerHTML = `<input type="checkbox" name="partecipante-${index}-bambino" style="width:18px;height:18px"/><span>Bambino</span>`;
    card.appendChild(label);
  });
}

export default function GuestEnhancements() {
  useEffect(() => {
    const enhance = () => {
      enhanceGuestRows();
      installGuestToolbar();
      installChildFieldInGuestModal();
      installChildFieldsInRsvp();
    };
    enhance();
    const observer = new MutationObserver(enhance);
    observer.observe(document.body, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}
