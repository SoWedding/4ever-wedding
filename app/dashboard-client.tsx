"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type View = "home" | "tasks" | "budget" | "guests" | "witnesses" | "tableau" | "vendors" | "bureaucracy" | "ceremony" | "honeymoon" | "ideas";
type Task = { id: number; title: string; category: string; due: string; dueDate?: string; done: boolean; progress?: "Da fare" | "In corso" | "Fatto"; witnessId?: number };
type GuestNeeds = { allergies: string; intolerances: string; dietary: string; accessibility: string; highchair: boolean; stroller: boolean; other: string; notes: string };
type Guest = { id: number; externalId?: string; source?: "Manuale" | "Invito digitale"; name: string; group: string; status: "Confermato" | "In attesa" | "Non partecipa"; plus: number; invitationSent: boolean; needs: GuestNeeds };
type RemoteGuest = { id: string; displayName: string; partySize: number; status: Guest["status"]; source: "Manuale" | "Invito digitale"; invitationSent: boolean; allergies: string; intolerances: string; dietaryNeeds: string; accessibilityNeeds: string; specialNeeds: string; notes: string };
type Expense = { id: number; category: string; description: string; planned: number; actual: number; paid: number; vendor: string; notes: string; color: string };
type Vendor = { id: number; icon: string; category: string; name: string; detail: string; phone: string; tone: string; notes: string; cost: number; paid: number };
type Wedding = { partnerOne: string; partnerTwo: string; date: string; location: string };
type Inspiration = { title: string; tag: string; style: string; image?: string };
type WeddingTable = { id: number; name: string; seats: number };
type TravelPlan = { status: "Da immaginare" | "In progettazione" | "Prenotato" | "Completato"; period: string; duration: string; style: string; notes: string; budget: number };
type Destination = { id: number; name: string; notes: string };
type TripStop = { id: number; place: string; start: string; end: string; hotel: string; transport: string; activities: string; booking: string };
type TravelTask = { id: number; title: string; category: string; done: boolean };
type TravelExpense = { id: number; category: string; description: string; planned: number; actual: number; paid: number; notes: string };
type TravelGift = { id: number; from: string; amount: number; date: string; message: string; thanked: boolean };
type ChecklistStatus = "Da fare" | "In corso" | "Completato";
type MarriageType = "Civile" | "Religioso concordatario" | "Solo religioso" | "Unione civile";
type BureauTask = { id: number; title: string; area: string; status: ChecklistStatus; due: string; appointment: string; notes: string; documents: string; appliesTo?: MarriageType[] };
type CeremonyItem = { id: number; section: string; title: string; text: string; person: string; music: string; notes: string };
type TravelDocument = { id: number; destinationId: number | null; title: string; status: ChecklistStatus; due: string; notes: string };
type Witness = { id: number; guestId: number | null; name: string; side: "Sposa" | "Sposo"; contact: string; status: "Da chiedere" | "Ha accettato" | "Confermato"; notes: string; photo: string; proposalMethod: string; proposalIdeas: string; proposalMessage: string };
type GuideItem = { id: string; phase: string; title: string; status: ChecklistStatus; due: string; view: View; dependency?: string; important?: boolean };
type TravelItemKind = "destination" | "stop" | "travelTask" | "travelExpense" | "gift";
type ItemKind = "task" | "expense" | "guest" | "vendor";
type Modal = ItemKind | "vendorDetails" | "wedding" | "budget" | "table" | "deleteTable" | "travelPlan" | TravelItemKind | "bureau" | "ceremonyItem" | "travelDocument" | "witness" | "delegate" | "deleteTravel" | "delete" | null;

const initialTasks: Task[] = [
  { id: 1, title: "Confermare il menu con il catering", category: "Ricevimento", due: "12 set", done: false },
  { id: 2, title: "Inviare le partecipazioni", category: "Invitati", due: "18 set", done: false },
  { id: 3, title: "Scegliere le fedi", category: "Cerimonia", due: "28 set", done: false },
  { id: 4, title: "Prenotare la prova trucco", category: "Beauty", due: "4 ott", done: true },
  { id: 5, title: "Definire la playlist aperitivo", category: "Musica", due: "10 ott", done: false },
  { id: 6, title: "Confermare il fotografo", category: "Fornitori", due: "Completata", done: true },
  { id: 7, title: "Scegliere la palette floreale", category: "Stile", due: "Completata", done: true },
];

const initialExpenses: Expense[] = [
  { id: 6, category: "Altro", description: "Partecipazioni e dettagli", planned: 2200, actual: 1980, paid: 420, vendor: "", notes: "", color: "#d2c3ad" },
];

const emptyGuestNeeds: GuestNeeds = { allergies: "", intolerances: "", dietary: "", accessibility: "", highchair: false, stroller: false, other: "", notes: "" };

const initialGuests: Guest[] = [
  { id: 1, name: "Giulia Bianchi", group: "Famiglia di Sofia", status: "Confermato", plus: 2, invitationSent: true, needs: { allergies: "Frutta a guscio", intolerances: "", dietary: "", accessibility: "", highchair: false, stroller: false, other: "", notes: "Avvisare il catering" } },
  { id: 2, name: "Marco e Anna Riva", group: "Amici", status: "Confermato", plus: 2, invitationSent: true, needs: { allergies: "", intolerances: "", dietary: "Un menu vegetariano", accessibility: "", highchair: false, stroller: false, other: "", notes: "" } },
  { id: 3, name: "Luca Moretti", group: "Amici", status: "In attesa", plus: 1, invitationSent: true, needs: { allergies: "", intolerances: "", dietary: "", accessibility: "", highchair: false, stroller: false, other: "", notes: "" } },
  { id: 4, name: "Elena Conti", group: "Famiglia di Andrea", status: "Confermato", plus: 1, invitationSent: true, needs: { allergies: "", intolerances: "Lattosio", dietary: "", accessibility: "", highchair: false, stroller: false, other: "", notes: "" } },
  { id: 5, name: "Paolo Ferri", group: "Colleghi", status: "Non partecipa", plus: 1, invitationSent: true, needs: { allergies: "", intolerances: "", dietary: "", accessibility: "", highchair: false, stroller: false, other: "", notes: "" } },
  { id: 6, name: "Chiara e Matteo", group: "Amici", status: "In attesa", plus: 2, invitationSent: false, needs: { allergies: "", intolerances: "", dietary: "", accessibility: "", highchair: true, stroller: true, other: "", notes: "Viaggiano con una bambina" } },
];

const initialVendors: Vendor[] = [
  { id: 1, icon: "⌂", category: "Location", name: "Villa Armonia", detail: "Firenze · Confermato", phone: "+39 055 555 0182", tone: "sage", notes: "Esclusiva della villa fino alle ore 01:00.", cost: 14200, paid: 4350 },
  { id: 2, icon: "◉", category: "Fotografia", name: "Luce Studio", detail: "Milano · Confermato", phone: "+39 02 555 0144", tone: "clay", notes: "Servizio completo con album e secondo fotografo.", cost: 3400, paid: 1600 },
  { id: 3, icon: "✽", category: "Fiori", name: "Selva Atelier", detail: "Firenze · Preventivo", phone: "+39 055 555 0167", tone: "olive", notes: "In attesa della palette floreale definitiva.", cost: 2950, paid: 800 },
  { id: 4, icon: "♫", category: "Musica", name: "The Golden Notes", detail: "Bologna · Confermato", phone: "+39 051 555 0119", tone: "sand", notes: "Band per aperitivo e cena, DJ set incluso.", cost: 1500, paid: 500 },
  { id: 5, icon: "◇", category: "Abiti", name: "Atelier Bianca", detail: "Firenze · Appuntamento", phone: "+39 055 555 0191", tone: "cream", notes: "Prossima prova da concordare.", cost: 3200, paid: 2900 },
  { id: 6, icon: "○", category: "Beauty", name: "Studio Alba", detail: "Firenze · Da confermare", phone: "+39 055 555 0175", tone: "rose", notes: "Prova trucco e acconciatura inclusa.", cost: 650, paid: 0 },
];

const initialTables: WeddingTable[] = [
  { id: 1, name: "Ulivo", seats: 8 },
  { id: 2, name: "Gelsomino", seats: 8 },
  { id: 3, name: "Limone", seats: 10 },
];

const initialTableAssignments: Record<number, number> = { 1: 1, 2: 1, 4: 2 };

const initialTravelPlan: TravelPlan = { status: "In progettazione", period: "Settembre 2027", duration: "14 giorni", style: "Mare, natura e relax", notes: "Un viaggio lento tra spiagge, natura e piccoli boutique hotel.", budget: 9000 };
const initialDestinations: Destination[] = [{ id: 1, name: "Giappone", notes: "Tokyo, Kyoto e qualche giorno al mare a Okinawa" }, { id: 2, name: "Polinesia Francese", notes: "Alternativa romantica tra Moorea e Bora Bora" }];
const initialTripStops: TripStop[] = [{ id: 1, place: "Tokyo", start: "2027-09-06", end: "2027-09-10", hotel: "Hotel K5", transport: "Volo diretto + metro", activities: "Asakusa, teamLab, cena panoramica", booking: "Hotel da confermare" }, { id: 2, place: "Kyoto", start: "2027-09-10", end: "2027-09-15", hotel: "Ryokan tradizionale", transport: "Shinkansen", activities: "Templi, Arashiyama, cerimonia del tè", booking: "Treno da prenotare" }];
const initialTravelTasks: TravelTask[] = [{ id: 1, title: "Controllare validità passaporti", category: "Documenti", done: true }, { id: 2, title: "Scegliere l’assicurazione viaggio", category: "Assicurazione", done: false }, { id: 3, title: "Verificare eventuali vaccinazioni", category: "Salute", done: false }, { id: 4, title: "Prenotare i voli internazionali", category: "Prenotazioni", done: false }, { id: 5, title: "Preparare la lista valigie", category: "Valigie", done: false }];
const initialTravelExpenses: TravelExpense[] = [{ id: 1, category: "Voli", description: "Voli internazionali", planned: 2400, actual: 0, paid: 0, notes: "Confrontare voli diretti" }, { id: 2, category: "Hotel", description: "Pernottamenti", planned: 3200, actual: 0, paid: 0, notes: "Mix hotel e ryokan" }, { id: 3, category: "Attività", description: "Esperienze e visite", planned: 900, actual: 0, paid: 0, notes: "" }];
const initialTravelGifts: TravelGift[] = [{ id: 1, from: "Famiglia Bianchi", amount: 1000, date: "2027-05-20", message: "Per un viaggio indimenticabile", thanked: true }, { id: 2, from: "Marco e Anna", amount: 300, date: "2027-06-02", message: "Buon viaggio agli sposi!", thanked: false }];
const initialBureauTasks: BureauTask[] = [
  { id: 1, title: "Richiedere le pubblicazioni di matrimonio", area: "Comune", status: "Da fare", due: "2027-02-15", appointment: "", notes: "Contattare l’Ufficio di Stato Civile", documents: "Documenti di identità e codici fiscali", appliesTo: ["Civile", "Religioso concordatario"] },
  { id: 2, title: "Verificare i documenti richiesti dal Comune", area: "Comune", status: "In corso", due: "2027-01-30", appointment: "2027-01-18T10:00", notes: "La lista può variare in base a Comune e cittadinanza", documents: "Autocertificazioni ed eventuali nulla osta", appliesTo: ["Civile", "Religioso concordatario"] },
  { id: 3, title: "Richiedere certificato di battesimo", area: "Parrocchia", status: "Da fare", due: "2027-02-28", appointment: "", notes: "Verificare validità e diciture con il parroco", documents: "Certificato di battesimo per uso matrimonio", appliesTo: ["Religioso concordatario", "Solo religioso"] },
  { id: 4, title: "Richiedere certificato di cresima", area: "Parrocchia", status: "Da fare", due: "2027-02-28", appointment: "", notes: "", documents: "Certificato di cresima", appliesTo: ["Religioso concordatario", "Solo religioso"] },
  { id: 5, title: "Completare il corso prematrimoniale", area: "Parrocchia", status: "In corso", due: "2027-03-31", appointment: "2027-02-04T20:30", notes: "Conservare l’attestato finale", documents: "Iscrizione e attestato", appliesTo: ["Religioso concordatario", "Solo religioso"] },
  { id: 6, title: "Pratiche matrimoniali con il parroco", area: "Parrocchia", status: "Da fare", due: "2027-04-15", appointment: "", notes: "Concordare colloqui e documentazione", documents: "Documenti indicati dalla parrocchia", appliesTo: ["Religioso concordatario", "Solo religioso"] },
  { id: 7, title: "Presentare la richiesta di costituzione dell’unione civile", area: "Unione civile", status: "Da fare", due: "2027-02-15", appointment: "", notes: "Contattare l’Ufficio di Stato Civile del Comune scelto", documents: "Documenti di identità e codici fiscali", appliesTo: ["Unione civile"] },
  { id: 8, title: "Verificare documenti, impedimenti e data della dichiarazione", area: "Unione civile", status: "Da fare", due: "2027-03-15", appointment: "", notes: "Confermare procedura e tempistiche con il Comune", documents: "Documentazione indicata dall’Ufficiale di Stato Civile", appliesTo: ["Unione civile"] },
];
const initialCeremonyItems: CeremonyItem[] = [{ id: 1, section: "Letture", title: "Prima lettura", text: "Brano da scegliere", person: "Da assegnare", music: "", notes: "Concordare con il sacerdote o celebrante" }, { id: 2, section: "Salmo", title: "Salmo responsoriale", text: "Testo da definire", person: "", music: "Eventuale versione cantata", notes: "" }, { id: 3, section: "Vangelo", title: "Vangelo", text: "Brano da concordare", person: "Sacerdote", music: "", notes: "" }, { id: 4, section: "Preghiere", title: "Preghiera dei fedeli", text: "Intenzioni da scrivere", person: "Familiari e amici", music: "", notes: "" }, { id: 5, section: "Ingresso", title: "Ingresso degli sposi", text: "Ordine di ingresso", person: "", music: "Brano da scegliere", notes: "Valido anche per rito civile o simbolico" }, { id: 6, section: "Offertorio", title: "Offertorio / momento simbolico", text: "Dettagli da definire", person: "", music: "", notes: "Adattare al tipo di cerimonia" }];
const initialTravelDocuments: TravelDocument[] = ["Passaporto", "Validità residua del passaporto", "Eventuale visto", "Carta d’identità valida per l’espatrio", "Assicurazione viaggio", "Documenti sanitari e requisiti di ingresso", "Patente internazionale"].map((title, index) => ({ id: index + 1, destinationId: 1, title, status: index === 0 ? "In corso" : "Da fare", due: "", notes: "Verificare sui siti ufficiali in base alla destinazione" }));
const initialWitnesses: Witness[] = [{ id: 1, guestId: 3, name: "Luca Moretti", side: "Sposo", contact: "+39 333 555 0123", status: "Ha accettato", notes: "Amico dai tempi dell’università", photo: "", proposalMethod: "Cena / sorpresa", proposalIdeas: "Invitarlo nel nostro ristorante preferito", proposalMessage: "Ci sei sempre stato: vuoi essere al nostro fianco anche quel giorno?" }, { id: 2, guestId: 4, name: "Elena Conti", side: "Sposa", contact: "+39 333 555 0178", status: "Da chiedere", notes: "", photo: "", proposalMethod: "Box testimone", proposalIdeas: "Foto insieme, lettera e un piccolo regalo", proposalMessage: "Non potrei immaginare questo giorno senza di te." }];
const witnessTaskSuggestions = ["Organizzazione addio al celibato/nubilato", "Custodia delle fedi", "Aiuto nella preparazione degli sposi", "Coordinamento con altri invitati", "Preparare un discorso", "Gestione di piccoli imprevisti", "Supporto durante la giornata", "Raccolta foto/video degli invitati"];

const inspirations: Inspiration[] = [
  { title: "Cena sotto le stelle", tag: "Ricevimento", style: "lights" },
  { title: "Fiori spontanei", tag: "Allestimenti", style: "flowers" },
  { title: "Promesse al tramonto", tag: "Cerimonia", style: "sunset" },
  { title: "Dettagli in carta cotone", tag: "Stationery", style: "paper" },
  { title: "Matrimonio al tramonto", tag: "Atmosfera", style: "photo", image: "/inspirations/matrimonio-tramonto.png" },
  { title: "Tavola a lume di candela", tag: "Mise en place", style: "photo", image: "/inspirations/tavola-candele.png" },
  { title: "Ulivi & limoni", tag: "Allestimenti", style: "photo", image: "/inspirations/ulivi-limoni.png" },
  { title: "Cena sotto le luci", tag: "Ricevimento", style: "photo", image: "/inspirations/cena-luci.png" },
  { title: "Angolo delle dediche", tag: "Dettagli", style: "photo", image: "/inspirations/angolo-dediche.png" },
  { title: "Welcome corner", tag: "Accoglienza", style: "photo", image: "/inspirations/welcome-corner.png" },
  { title: "Torta sotto le stelle", tag: "Wedding cake", style: "photo", image: "/inspirations/torta-stelle.png" },
  { title: "Cerimonia vista mare", tag: "Cerimonia", style: "photo", image: "/inspirations/cerimonia-mare.png" },
];

const nav: { id: View; label: string; icon: string }[] = [
  { id: "home", label: "Oggi", icon: "⌂" },
  { id: "tasks", label: "Attività", icon: "✓" },
  { id: "budget", label: "Budget", icon: "€" },
  { id: "guests", label: "Invitati", icon: "♙" },
  { id: "witnesses", label: "Testimoni", icon: "♧" },
  { id: "tableau", label: "Tableau de mariage", icon: "◌" },
  { id: "vendors", label: "Fornitori", icon: "◇" },
  { id: "bureaucracy", label: "Burocrazia", icon: "▤" },
  { id: "ceremony", label: "Rito e Cerimonia", icon: "❧" },
  { id: "honeymoon", label: "Viaggio di nozze", icon: "✈" },
  { id: "ideas", label: "Ispirazioni", icon: "✦" },
];

const money = new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

function SectionTitle({ eyebrow, title, action }: { eyebrow: string; title: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><span className="eyebrow">{eyebrow}</span><h2>{title}</h2></div>{action}</div>;
}

function ItemMenu({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return <details className="item-menu"><summary aria-label="Azioni">•••</summary><div><button onClick={onEdit}>Modifica</button><button className="danger" onClick={onDelete}>Elimina</button></div></details>;
}

export default function WeddingApp() {
  const [view, setView] = useState<View>("home");
  const [tasks, setTasks] = useState(initialTasks);
  const [guests, setGuests] = useState(initialGuests);
  const [expenses, setExpenses] = useState(initialExpenses);
  const [vendors, setVendors] = useState(initialVendors);
  const [tables, setTables] = useState(initialTables);
  const [tableAssignments, setTableAssignments] = useState<Record<number, number>>(initialTableAssignments);
  const [travelPlan, setTravelPlan] = useState<TravelPlan>(initialTravelPlan);
  const [destinations, setDestinations] = useState(initialDestinations);
  const [tripStops, setTripStops] = useState(initialTripStops);
  const [travelTasks, setTravelTasks] = useState(initialTravelTasks);
  const [travelExpenses, setTravelExpenses] = useState(initialTravelExpenses);
  const [travelGifts, setTravelGifts] = useState(initialTravelGifts);
  const [travelVendorIds, setTravelVendorIds] = useState<number[]>([]);
  const [marriageType, setMarriageType] = useState<MarriageType>("Civile");
  const [bureauTasks, setBureauTasks] = useState(initialBureauTasks);
  const [ceremonyItems, setCeremonyItems] = useState(initialCeremonyItems);
  const [travelDocuments, setTravelDocuments] = useState(initialTravelDocuments);
  const [witnesses, setWitnesses] = useState(initialWitnesses);
  const [budgetTotal, setBudgetTotal] = useState(35000);
  const [savedIdeas, setSavedIdeas] = useState<number[]>([1, 3]);
  const [toast, setToast] = useState("");
  const [taskFilter, setTaskFilter] = useState("Tutte");
  const [guestFilter, setGuestFilter] = useState("Tutti");
  const [modal, setModal] = useState<Modal>(null);
  const [hydrated, setHydrated] = useState(false);
  const [wedding, setWedding] = useState<Wedding>({ partnerOne: "Sofia", partnerTwo: "Andrea", date: "2027-06-12", location: "Villa Armonia, Firenze" });
  const [editing, setEditing] = useState<{ kind: ItemKind; id: number } | null>(null);
  const [deleting, setDeleting] = useState<{ kind: ItemKind; id: number; label: string } | null>(null);
  const [selectedVendorId, setSelectedVendorId] = useState<number | null>(null);
  const [editingTableId, setEditingTableId] = useState<number | null>(null);
  const [deletingTableId, setDeletingTableId] = useState<number | null>(null);
  const [editingTravel, setEditingTravel] = useState<{ kind: TravelItemKind; id: number } | null>(null);
  const [deletingTravel, setDeletingTravel] = useState<{ kind: TravelItemKind; id: number; label: string } | null>(null);
  const [linkNewVendorToTravel, setLinkNewVendorToTravel] = useState(false);
  const [editingGuide, setEditingGuide] = useState<{ kind: "bureau" | "ceremonyItem" | "travelDocument"; id: number } | null>(null);
  const [editingWitnessId, setEditingWitnessId] = useState<number | null>(null);
  const [editingDelegateId, setEditingDelegateId] = useState<number | null>(null);
  const [delegateSuggestion, setDelegateSuggestion] = useState("");
  const [showAllGuide, setShowAllGuide] = useState(false);
  const [guidePriorities, setGuidePriorities] = useState<Record<string, number>>({});
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showShareGuide, setShowShareGuide] = useState(false);
  const [shareCode, setShareCode] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [syncStatus, setSyncStatus] = useState<"locale" | "connessione" | "sincronizzato" | "salvataggio" | "errore">("locale");
  const [cloudReady, setCloudReady] = useState(false);
  const lastCloudUpdate = useRef(0);
  const lastCloudSnapshot = useRef("");
  const savingCloud = useRef(false);
  const remoteGuestsLoaded = useRef(false);

  useEffect(() => {
    const saved = localStorage.getItem("4ever-demo");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.tasks) setTasks(data.tasks.map((item: Task) => ({ ...item, progress: item.progress ?? (item.done ? "Fatto" : "Da fare") })));
        if (data.guests) setGuests(data.guests.map((item: Guest) => ({ ...item, invitationSent: item.invitationSent ?? false, needs: { ...emptyGuestNeeds, ...(item.needs ?? {}) } })));
        if (data.guidePriorities) setGuidePriorities(data.guidePriorities);
        const normalizedExpenses: Expense[] = (data.expenses ?? initialExpenses).map((item: Partial<Expense> & { name?: string }) => ({ id: item.id!, category: item.category ?? "Altro", description: item.description ?? item.name ?? "Spesa", planned: Number(item.planned ?? 0), actual: Number(item.actual ?? item.planned ?? 0), paid: Number(item.paid ?? 0), vendor: item.vendor ?? "", notes: item.notes ?? "", color: item.color ?? "#a96f59" }));
        const normalizedVendors: Vendor[] = (data.vendors ?? initialVendors).map((item: Vendor) => {
          const previousBudgetItem = normalizedExpenses.find(expense => expense.vendor.trim().toLocaleLowerCase("it") === item.name.trim().toLocaleLowerCase("it"));
          return { ...item, notes: item.notes ?? "", cost: Number(item.cost ?? previousBudgetItem?.actual ?? 0), paid: Number(item.paid ?? previousBudgetItem?.paid ?? 0) };
        });
        const vendorNames = new Set(normalizedVendors.map(item => item.name.trim().toLocaleLowerCase("it")));
        setVendors(normalizedVendors);
        setExpenses(normalizedExpenses.filter(item => !item.vendor || !vendorNames.has(item.vendor.trim().toLocaleLowerCase("it"))));
        if (data.tables) setTables(data.tables.map((item: WeddingTable) => ({ ...item, seats: Number(item.seats) })));
        if (data.tableAssignments) setTableAssignments(data.tableAssignments);
        if (data.travelPlan) setTravelPlan({ ...initialTravelPlan, ...data.travelPlan, budget: Number(data.travelPlan.budget ?? initialTravelPlan.budget) });
        if (data.destinations) setDestinations(data.destinations);
        if (data.tripStops) setTripStops(data.tripStops);
        if (data.travelTasks) setTravelTasks(data.travelTasks);
        if (data.travelExpenses) setTravelExpenses(data.travelExpenses.map((item: TravelExpense) => ({ ...item, planned: Number(item.planned), actual: Number(item.actual), paid: Number(item.paid) })));
        if (data.travelGifts) setTravelGifts(data.travelGifts.map((item: TravelGift) => ({ ...item, amount: Number(item.amount) })));
        if (data.travelVendorIds) setTravelVendorIds(data.travelVendorIds);
        if (data.marriageType) setMarriageType(data.marriageType as MarriageType);
        if (data.bureauTasks) {
          const savedBureauTasks = data.bureauTasks as BureauTask[];
          const unionDefaults = initialBureauTasks.filter(item => item.appliesTo?.includes("Unione civile"));
          setBureauTasks(data.bureauRiteMigration ? savedBureauTasks : [...savedBureauTasks, ...unionDefaults.filter(defaultItem => !savedBureauTasks.some(item => item.title === defaultItem.title))]);
        }
        if (data.ceremonyItems) setCeremonyItems(data.ceremonyItems);
        if (data.travelDocuments) setTravelDocuments(data.travelDocuments);
        if (data.witnesses) setWitnesses(data.witnesses);
        if (data.budgetTotal) setBudgetTotal(data.budgetTotal);
        if (data.savedIdeas) setSavedIdeas(data.savedIdeas);
        if (data.wedding) setWedding({ ...data.wedding, location: data.wedding.location ?? "Villa Armonia, Firenze" });
      } catch { /* keep demo defaults */ }
    }
    const savedShareCode = localStorage.getItem("4ever-shared-code");
    if (savedShareCode) setShareCode(savedShareCode);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem("4ever-demo", JSON.stringify({ tasks, guests, guidePriorities, expenses, vendors, tables, tableAssignments, travelPlan, destinations, tripStops, travelTasks, travelExpenses, travelGifts, travelVendorIds, marriageType, bureauTasks, bureauRiteMigration: 1, ceremonyItems, travelDocuments, witnesses, budgetTotal, savedIdeas, wedding }));
  }, [tasks, guests, guidePriorities, expenses, vendors, tables, tableAssignments, travelPlan, destinations, tripStops, travelTasks, travelExpenses, travelGifts, travelVendorIds, marriageType, bureauTasks, ceremonyItems, travelDocuments, witnesses, budgetTotal, savedIdeas, wedding, hydrated]);

  useEffect(() => {
    if (!hydrated || remoteGuestsLoaded.current) return;
    remoteGuestsLoaded.current = true;
    fetch("/api/dashboard/guests")
      .then(response => response.ok ? response.json() : Promise.reject())
      .then((payload: { guests: RemoteGuest[] }) => {
        const remote = payload.guests.map((item, index): Guest => ({
          id: 1_000_000_000 + index,
          externalId: item.id,
          source: item.source,
          name: item.displayName,
          group: item.source === "Invito digitale" ? "Invito digitale" : "Da assegnare",
          status: item.status,
          plus: item.partySize,
          invitationSent: item.invitationSent,
          needs: {
            allergies: item.allergies,
            intolerances: item.intolerances,
            dietary: item.dietaryNeeds,
            accessibility: item.accessibilityNeeds,
            highchair: false,
            stroller: false,
            other: item.specialNeeds,
            notes: item.notes,
          },
        }));
        setGuests(current => {
          const remoteIds = new Set(remote.map(item => item.externalId));
          return [...current.filter(item => !item.externalId || !remoteIds.has(item.externalId)), ...remote];
        });
      })
      .catch(() => notify("Gli invitati online saranno disponibili dopo l’attivazione sicura"));
  }, [hydrated]);

  useEffect(() => {
    if (!modal) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setModal(null); };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [modal]);

  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => undefined);
  }, []);

  const sharedSnapshot = useMemo(() => ({ tasks, guests, guidePriorities, expenses, vendors, tables, tableAssignments, travelPlan, destinations, tripStops, travelTasks, travelExpenses, travelGifts, travelVendorIds, marriageType, bureauTasks, bureauRiteMigration: 1, ceremonyItems, travelDocuments, witnesses, budgetTotal, savedIdeas, wedding }), [tasks, guests, guidePriorities, expenses, vendors, tables, tableAssignments, travelPlan, destinations, tripStops, travelTasks, travelExpenses, travelGifts, travelVendorIds, marriageType, bureauTasks, ceremonyItems, travelDocuments, witnesses, budgetTotal, savedIdeas, wedding]);
  const sharedSnapshotJson = useMemo(() => JSON.stringify(sharedSnapshot), [sharedSnapshot]);

  const applySharedSnapshot = (data: Record<string, unknown>) => {
    if (data.tasks) setTasks((data.tasks as Task[]).map(item => ({ ...item, progress: item.progress ?? (item.done ? "Fatto" : "Da fare") })));
    if (data.guests) setGuests((data.guests as Guest[]).map(item => ({ ...item, invitationSent: item.invitationSent ?? false, needs: { ...emptyGuestNeeds, ...(item.needs ?? {}) } })));
    if (data.guidePriorities) setGuidePriorities(data.guidePriorities as Record<string, number>);
    if (data.expenses) setExpenses(data.expenses as Expense[]);
    if (data.vendors) setVendors(data.vendors as Vendor[]);
    if (data.tables) setTables(data.tables as WeddingTable[]);
    if (data.tableAssignments) setTableAssignments(data.tableAssignments as Record<number, number>);
    if (data.travelPlan) setTravelPlan(data.travelPlan as TravelPlan);
    if (data.destinations) setDestinations(data.destinations as Destination[]);
    if (data.tripStops) setTripStops(data.tripStops as TripStop[]);
    if (data.travelTasks) setTravelTasks(data.travelTasks as TravelTask[]);
    if (data.travelExpenses) setTravelExpenses(data.travelExpenses as TravelExpense[]);
    if (data.travelGifts) setTravelGifts(data.travelGifts as TravelGift[]);
    if (data.travelVendorIds) setTravelVendorIds(data.travelVendorIds as number[]);
    if (data.marriageType) setMarriageType(data.marriageType as MarriageType);
    if (data.bureauTasks) setBureauTasks(data.bureauTasks as BureauTask[]);
    if (data.ceremonyItems) setCeremonyItems(data.ceremonyItems as CeremonyItem[]);
    if (data.travelDocuments) setTravelDocuments(data.travelDocuments as TravelDocument[]);
    if (data.witnesses) setWitnesses(data.witnesses as Witness[]);
    if (data.budgetTotal !== undefined) setBudgetTotal(Number(data.budgetTotal));
    if (data.savedIdeas) setSavedIdeas(data.savedIdeas as number[]);
    if (data.wedding) setWedding(data.wedding as Wedding);
  };

  const loadSharedSpace = async (code: string, showFeedback = false) => {
    setSyncStatus("connessione");
    const response = await fetch("/api/shared-wedding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "load", code }) });
    const result = await response.json() as { data?: Record<string, unknown>; updatedAt?: number; error?: string };
    if (!response.ok || !result.data) throw new Error(result.error || "Codice non trovato");
    lastCloudSnapshot.current = JSON.stringify(result.data);
    lastCloudUpdate.current = result.updatedAt ?? Date.now();
    applySharedSnapshot(result.data);
    setCloudReady(true);
    setSyncStatus("sincronizzato");
    if (showFeedback) notify("Spazio della coppia collegato");
  };

  useEffect(() => {
    if (!hydrated || !shareCode || cloudReady) return;
    loadSharedSpace(shareCode).catch(() => { setSyncStatus("errore"); localStorage.removeItem("4ever-shared-code"); setShareCode(""); });
  }, [hydrated, shareCode, cloudReady]);

  useEffect(() => {
    if (!hydrated || !shareCode || !cloudReady || sharedSnapshotJson === lastCloudSnapshot.current) return;
    const timer = window.setTimeout(async () => {
      savingCloud.current = true;
      setSyncStatus("salvataggio");
      try {
        const response = await fetch("/api/shared-wedding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "save", code: shareCode, data: sharedSnapshot }) });
        const result = await response.json() as { updatedAt?: number };
        if (!response.ok) throw new Error("Salvataggio non riuscito");
        lastCloudSnapshot.current = sharedSnapshotJson;
        lastCloudUpdate.current = result.updatedAt ?? Date.now();
        setSyncStatus("sincronizzato");
      } catch { setSyncStatus("errore"); }
      finally { savingCloud.current = false; }
    }, 700);
    return () => window.clearTimeout(timer);
  }, [sharedSnapshotJson, shareCode, cloudReady, hydrated]);

  useEffect(() => {
    if (!shareCode || !cloudReady) return;
    const timer = window.setInterval(async () => {
      if (savingCloud.current) return;
      try {
        const response = await fetch("/api/shared-wedding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "load", code: shareCode }) });
        const result = await response.json() as { data?: Record<string, unknown>; updatedAt?: number };
        if (response.ok && result.data && (result.updatedAt ?? 0) > lastCloudUpdate.current) {
          lastCloudSnapshot.current = JSON.stringify(result.data);
          lastCloudUpdate.current = result.updatedAt ?? Date.now();
          applySharedSnapshot(result.data);
          setSyncStatus("sincronizzato");
        }
      } catch { setSyncStatus("errore"); }
    }, 4000);
    return () => window.clearInterval(timer);
  }, [shareCode, cloudReady]);

  const createSharedSpace = async () => {
    setSyncStatus("connessione");
    try {
      const response = await fetch("/api/shared-wedding", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "create", data: sharedSnapshot }) });
      const result = await response.json() as { code?: string; updatedAt?: number; error?: string };
      if (!response.ok || !result.code) throw new Error(result.error || "Creazione non riuscita");
      localStorage.setItem("4ever-shared-code", result.code);
      lastCloudSnapshot.current = sharedSnapshotJson;
      lastCloudUpdate.current = result.updatedAt ?? Date.now();
      setShareCode(result.code); setJoinCode(result.code); setCloudReady(true); setSyncStatus("sincronizzato"); notify("Codice condiviso creato");
    } catch { setSyncStatus("errore"); notify("Non è stato possibile creare il codice"); }
  };

  const joinSharedSpace = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const code = joinCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    try { await loadSharedSpace(code, true); localStorage.setItem("4ever-shared-code", code); setShareCode(code); }
    catch { setSyncStatus("errore"); notify("Codice non trovato"); }
  };

  const leaveSharedSpace = () => {
    localStorage.removeItem("4ever-shared-code"); setShareCode(""); setJoinCode(""); setCloudReady(false); setSyncStatus("locale"); lastCloudUpdate.current = 0; lastCloudSnapshot.current = ""; notify("Dispositivo scollegato");
  };

  const notify = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(""), 2200);
  };

  const completed = tasks.filter(t => t.done).length;
  const planned = expenses.reduce((sum, item) => sum + item.planned, 0) + travelExpenses.reduce((sum, item) => sum + item.planned, 0) + vendors.reduce((sum, item) => sum + item.cost, 0);
  const paid = expenses.reduce((sum, item) => sum + item.paid, 0) + travelExpenses.reduce((sum, item) => sum + item.paid, 0) + vendors.reduce((sum, item) => sum + item.paid, 0);
  const confirmed = guests.filter(g => g.status === "Confermato").reduce((sum, g) => sum + g.plus, 0);
  const pending = guests.filter(g => g.status === "In attesa").reduce((sum, g) => sum + g.plus, 0);
  const hasWeddingDate = Boolean(wedding.date);
  const weddingDate = hasWeddingDate ? new Date(`${wedding.date}T12:00:00`) : null;
  const days = weddingDate ? Math.max(0, Math.ceil((weddingDate.getTime() - Date.now()) / 86400000)) : 0;
  const months = Math.floor(days / 30);
  const weeks = Math.floor((days % 30) / 7);
  const remainingDays = (days % 30) % 7;
  const formattedDate = weddingDate ? new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "long", year: "numeric" }).format(weddingDate) : "Data da scegliere";
  const monthYear = weddingDate ? new Intl.DateTimeFormat("it-IT", { month: "long", year: "numeric" }).format(weddingDate).toUpperCase() : "DATA DA SCEGLIERE";
  const dayOfMonth = weddingDate ? new Intl.DateTimeFormat("it-IT", { day: "2-digit" }).format(weddingDate) : "—";
  const initials = `${wedding.partnerOne.charAt(0)}&${wedding.partnerTwo.charAt(0)}`.toUpperCase();
  const personalizedGroup = (group: string) => group === "Famiglia di Sofia" ? `Famiglia di ${wedding.partnerOne}` : group === "Famiglia di Andrea" ? `Famiglia di ${wedding.partnerTwo}` : group;
  const filteredTasks = useMemo(() => tasks.filter(t => taskFilter === "Tutte" || (taskFilter === "Da fare" ? !t.done : t.done)), [tasks, taskFilter]);
  const filteredGuests = useMemo(() => guests.filter(g => guestFilter === "Tutti" || g.status === guestFilter), [guests, guestFilter]);
  const assignedGuestIds = new Set(Object.keys(tableAssignments).map(Number));
  const unassignedGuests = guests.filter(guest => !assignedGuestIds.has(guest.id));
  const guestsAtTable = (tableId: number) => guests.filter(guest => tableAssignments[guest.id] === tableId);
  const occupiedSeats = (tableId: number) => guestsAtTable(tableId).reduce((sum, guest) => sum + guest.plus, 0);
  const linkedTravelVendors = vendors.filter(vendor => travelVendorIds.includes(vendor.id));
  const travelPlanned = travelExpenses.reduce((sum, item) => sum + item.planned, 0) + linkedTravelVendors.reduce((sum, item) => sum + item.cost, 0);
  const travelActual = travelExpenses.reduce((sum, item) => sum + item.actual, 0) + linkedTravelVendors.reduce((sum, item) => sum + item.cost, 0);
  const travelPaid = travelExpenses.reduce((sum, item) => sum + item.paid, 0) + linkedTravelVendors.reduce((sum, item) => sum + item.paid, 0);
  const giftsTotal = travelGifts.reduce((sum, item) => sum + item.amount, 0);
  const travelToCover = Math.max(0, travelPlanned - giftsTotal);
  const bureauTaskAppliesToRite = (item: BureauTask) => {
    if (item.appliesTo?.length) return item.appliesTo.includes(marriageType);
    if (item.area === "Parrocchia" || item.area === "Diocesi") return marriageType === "Religioso concordatario" || marriageType === "Solo religioso";
    if (item.area === "Comune") return marriageType === "Civile" || marriageType === "Religioso concordatario";
    if (item.area === "Unione civile") return marriageType === "Unione civile";
    return true;
  };
  const activeBureauTasks = bureauTasks.filter(bureauTaskAppliesToRite);
  const ritePathDescription: Record<MarriageType, string> = {
    Civile: "Sono attive soltanto le pratiche civili da verificare con il Comune.",
    "Religioso concordatario": "Sono attivi sia il percorso civile con il Comune sia quello religioso con parrocchia e diocesi.",
    "Solo religioso": "Sono attive le pratiche religiose con parrocchia e diocesi; quelle civili restano conservate ma non vengono conteggiate.",
    "Unione civile": "Sono attive esclusivamente le pratiche pertinenti all’unione civile presso il Comune.",
  };
  const relativeDue = (daysBeforeWedding: number) => { if (!weddingDate) return ""; const date = new Date(weddingDate); date.setDate(date.getDate() - daysBeforeWedding); return date.toISOString().slice(0, 10); };
  const guideStatus = (complete: boolean, inProgress = false): ChecklistStatus => complete ? "Completato" : inProgress ? "In corso" : "Da fare";
  const matchingTask = (...words: string[]) => tasks.find(task => words.some(word => task.title.toLocaleLowerCase("it").includes(word.toLocaleLowerCase("it"))));
  const statusFromTask = (...words: string[]): ChecklistStatus => { const task = matchingTask(...words); return task ? (task.done ? "Completato" : task.progress === "In corso" ? "In corso" : "Da fare") : "Da fare"; };
  const vendorStatus = (...categories: string[]): ChecklistStatus => { const matches = vendors.filter(vendor => categories.some(category => `${vendor.category} ${vendor.name}`.toLocaleLowerCase("it").includes(category))); return guideStatus(matches.some(vendor => vendor.detail.includes("Confermato")), matches.length > 0); };
  const guideItems: GuideItem[] = [
    { id: "base-date", phase: "1. Impostare le basi", title: "Definire la data del matrimonio", status: guideStatus(hasWeddingDate), due: relativeDue(320), view: "home", dependency: "Serve per ordinare tutte le scadenze", important: true },
    { id: "base-place", phase: "1. Impostare le basi", title: "Definire luogo o zona", status: guideStatus(Boolean(wedding.location)), due: relativeDue(310), view: "home", dependency: "Necessario prima di cercare location e fornitori", important: true },
    { id: "base-budget", phase: "1. Impostare le basi", title: "Impostare il budget indicativo", status: guideStatus(budgetTotal > 0), due: relativeDue(305), view: "budget", important: true },
    { id: "base-guests", phase: "1. Impostare le basi", title: "Stimare il numero degli invitati", status: guideStatus(guests.length > 0), due: relativeDue(300), view: "guests" },
    { id: "base-style", phase: "1. Impostare le basi", title: "Scegliere stile e tipo di matrimonio", status: guideStatus(Boolean(marriageType), savedIdeas.length > 0), due: relativeDue(295), view: "bureaucracy" },
    { id: "priority-location", phase: "2. Bloccare le priorità", title: "Confermare la location", status: vendorStatus("location"), due: relativeDue(280), view: "vendors", dependency: "Sblocca catering, allestimenti e logistica", important: true },
    { id: "priority-rite", phase: "2. Bloccare le priorità", title: marriageType === "Unione civile" ? "Confermare Comune e data dell’unione civile" : marriageType === "Civile" ? "Confermare Comune o celebrante" : "Confermare parrocchia, chiesa o celebrante", status: guideStatus(activeBureauTasks.some(item => item.status === "Completato"), activeBureauTasks.some(item => item.status === "In corso")), due: relativeDue(260), view: "bureaucracy", important: true },
    { id: "priority-catering", phase: "2. Bloccare le priorità", title: "Confermare il catering", status: vendorStatus("catering"), due: relativeDue(250), view: "vendors", important: true },
    { id: "priority-photo", phase: "2. Bloccare le priorità", title: "Confermare fotografo o videomaker", status: vendorStatus("fotograf", "video"), due: relativeDue(245), view: "vendors" },
    { id: "priority-music", phase: "2. Bloccare le priorità", title: "Confermare musica e intrattenimento", status: vendorStatus("musica", "dj"), due: relativeDue(230), view: "vendors" },
    { id: "guests-list", phase: "3. Costruire la lista invitati", title: "Creare e definire la lista invitati", status: guideStatus(guests.length > 0), due: relativeDue(220), view: "guests", important: true },
    { id: "guests-contacts", phase: "3. Costruire la lista invitati", title: "Raccogliere contatti ed esigenze alimentari", status: statusFromTask("contatti", "alimentari"), due: relativeDue(170), view: "tasks" },
    { id: "guests-invites", phase: "3. Costruire la lista invitati", title: "Inviare le partecipazioni", status: guideStatus(guests.length > 0 && guests.every(item => item.invitationSent), guests.some(item => item.invitationSent)), due: relativeDue(150), view: "guests", important: true },
    { id: "guests-rsvp", phase: "3. Costruire la lista invitati", title: "Registrare le conferme", status: guideStatus(guests.length > 0 && pending === 0, guests.some(item => item.status !== "In attesa")), due: relativeDue(45), view: "guests" },
    { id: "guests-tableau", phase: "3. Costruire la lista invitati", title: "Iniziare il tableau de mariage", status: guideStatus(guests.length > 0 && unassignedGuests.length === 0, assignedGuestIds.size > 0), due: relativeDue(50), view: "tableau" },
    ...activeBureauTasks.map((item): GuideItem => ({ id: `bureau-${item.id}`, phase: "4. Burocrazia", title: item.title, status: item.status, due: item.due || relativeDue(120), view: "bureaucracy", important: item.area === "Comune" || item.area === "Unione civile" })),
    { id: "budget-quotes", phase: "5. Fornitori e budget", title: "Confrontare fornitori e registrare preventivi", status: guideStatus(vendors.length >= 5 && vendors.every(item => item.cost > 0), vendors.length > 0), due: relativeDue(210), view: "vendors" },
    { id: "budget-deposits", phase: "5. Fornitori e budget", title: "Registrare caparre e pagamenti", status: guideStatus(vendors.length > 0 && vendors.every(item => item.paid >= item.cost), vendors.some(item => item.paid > 0)), due: relativeDue(120), view: "budget" },
    { id: "budget-control", phase: "5. Fornitori e budget", title: "Controllare previsto, speso e rimanente", status: guideStatus(planned > 0 && paid > 0, planned > 0), due: relativeDue(90), view: "budget" },
    { id: "dress-bride", phase: "6. Abiti e preparazione", title: "Scegliere abiti, accessori e scarpe", status: vendorStatus("abiti", "atelier"), due: relativeDue(180), view: "vendors" },
    { id: "dress-fittings", phase: "6. Abiti e preparazione", title: "Organizzare prove, trucco e parrucco", status: guideStatus(statusFromTask("prova", "trucco", "parrucco") === "Completato", vendorStatus("beauty", "trucco") !== "Da fare"), due: relativeDue(75), view: "tasks" },
    { id: "details-style", phase: "7. Dettagli della giornata", title: "Definire fiori, decorazioni e bomboniere", status: guideStatus(statusFromTask("fiori", "decorazioni", "bomboniere") === "Completato", vendorStatus("fiori", "allestimenti") !== "Da fare"), due: relativeDue(90), view: "vendors" },
    { id: "details-menu", phase: "7. Dettagli della giornata", title: "Confermare menu e torta", status: statusFromTask("menu", "torta"), due: relativeDue(45), view: "tasks" },
    { id: "details-logistics", phase: "7. Dettagli della giornata", title: "Definire trasporti e pernottamenti", status: statusFromTask("trasporti", "pernottamenti"), due: relativeDue(60), view: "tasks" },
    { id: "witnesses-choose", phase: "8. Testimoni", title: "Scegliere e chiedere ai testimoni", status: guideStatus(witnesses.length > 0 && witnesses.every(item => item.status !== "Da chiedere"), witnesses.length > 0), due: relativeDue(180), view: "witnesses", important: true },
    { id: "witnesses-confirm", phase: "8. Testimoni", title: "Registrare le conferme", status: guideStatus(witnesses.length > 0 && witnesses.every(item => item.status === "Confermato"), witnesses.some(item => item.status === "Ha accettato")), due: relativeDue(120), view: "witnesses" },
    { id: "witnesses-tasks", phase: "8. Testimoni", title: "Assegnare eventuali compiti", status: guideStatus(tasks.some(item => item.witnessId) && tasks.filter(item => item.witnessId).every(item => item.done), tasks.some(item => item.witnessId)), due: relativeDue(30), view: "witnesses" },
    { id: "ceremony-texts", phase: "9. Rito e cerimonia", title: "Definire letture, Salmo, Vangelo e testi", status: guideStatus(ceremonyItems.length > 0 && ceremonyItems.every(item => item.text && !item.text.includes("definire") && !item.text.includes("scegliere")), ceremonyItems.length > 0), due: relativeDue(60), view: "ceremony" },
    { id: "ceremony-people", phase: "9. Rito e cerimonia", title: "Assegnare lettori e persone coinvolte", status: guideStatus(ceremonyItems.length > 0 && ceremonyItems.every(item => item.person && !item.person.includes("assegnare")), ceremonyItems.some(item => Boolean(item.person))), due: relativeDue(45), view: "ceremony" },
    { id: "ceremony-music", phase: "9. Rito e cerimonia", title: "Definire musica e programma", status: guideStatus(ceremonyItems.some(item => item.music) && statusFromTask("programma della cerimonia") === "Completato", ceremonyItems.some(item => item.music)), due: relativeDue(30), view: "ceremony" },
    { id: "travel-destination", phase: "10. Viaggio di nozze", title: "Scegliere destinazione, periodo e budget", status: guideStatus(destinations.length > 0 && Boolean(travelPlan.period) && travelPlan.budget > 0), due: relativeDue(150), view: "honeymoon" },
    { id: "travel-bookings", phase: "10. Viaggio di nozze", title: "Organizzare agenzia e prenotazioni", status: guideStatus(travelPlan.status === "Prenotato" || travelPlan.status === "Completato", tripStops.length > 0 || linkedTravelVendors.length > 0), due: relativeDue(90), view: "honeymoon" },
    { id: "travel-documents", phase: "10. Viaggio di nozze", title: "Verificare passaporti, documenti e visti", status: guideStatus(travelDocuments.every(item => item.status === "Completato"), travelDocuments.some(item => item.status === "In corso")), due: relativeDue(60), view: "honeymoon", important: true },
    { id: "last-guests", phase: "11. Ultimi mesi e settimane", title: "Confermare invitati e tableau definitivo", status: guideStatus(pending === 0 && unassignedGuests.length === 0, confirmed > 0 || assignedGuestIds.size > 0), due: relativeDue(20), view: "tableau", dependency: "Necessario per menu e disposizione finale" },
    { id: "last-suppliers", phase: "11. Ultimi mesi e settimane", title: "Contatto finale con fornitori e pagamenti", status: guideStatus(vendors.every(item => item.detail.includes("Confermato") && item.paid >= item.cost), vendors.some(item => item.detail.includes("Confermato"))), due: relativeDue(14), view: "vendors", important: true },
    { id: "last-timeline", phase: "11. Ultimi mesi e settimane", title: "Preparare timeline e deleghe della giornata", status: statusFromTask("timeline", "deleghe"), due: relativeDue(10), view: "tasks" },
    { id: "days-times", phase: "12. Ultimi giorni", title: "Confermare orari e contatti utili", status: statusFromTask("orari", "contatti utili"), due: relativeDue(5), view: "tasks", important: true },
    { id: "days-docs", phase: "12. Ultimi giorni", title: "Preparare documenti, fedi e pagamenti finali", status: guideStatus(activeBureauTasks.every(item => item.status === "Completato") && statusFromTask("fedi", "pagamenti finali") === "Completato", activeBureauTasks.some(item => item.status === "Completato")), due: relativeDue(3), view: "bureaucracy", important: true },
    { id: "days-kit", phase: "12. Ultimi giorni", title: "Preparare valigia e kit degli sposi", status: statusFromTask("kit sposi", "valigia"), due: relativeDue(2), view: "tasks" },
    { id: "days-critical", phase: "12. Ultimi giorni", title: "Verificare che non restino attività critiche", status: guideStatus(tasks.every(item => item.done) && activeBureauTasks.every(item => item.status === "Completato"), completed > tasks.length / 2), due: relativeDue(1), view: "tasks", important: true },
  ];
  const guideDaysUntil = (due: string) => due ? Math.ceil((new Date(`${due}T12:00:00`).getTime() - Date.now()) / 86400000) : Number.POSITIVE_INFINITY;
  const formatGuideDue = (due: string) => due ? new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short", year: "numeric" }).format(new Date(`${due}T12:00:00`)) : "In attesa della data";
  const prioritizedGuideItems = guideItems.filter(item => item.status !== "Completato").sort((a, b) => {
    const rank = (item: GuideItem) => item.id === "base-date" && !hasWeddingDate ? -1 : guideDaysUntil(item.due) < 0 ? 0 : guideDaysUntil(item.due) <= 30 ? 1 : item.dependency ? 2 : item.important ? 3 : item.status === "In corso" ? 4 : 5;
    return (guidePriorities[b.id] ?? 0) - (guidePriorities[a.id] ?? 0) || rank(a) - rank(b) || guideDaysUntil(a.due) - guideDaysUntil(b.due);
  });
  const guideProgress = Math.round(guideItems.filter(item => item.status === "Completato").length / Math.max(1, guideItems.length) * 100);
  const displayedGuideItems = showAllGuide ? prioritizedGuideItems : prioritizedGuideItems.slice(0, 5);
  const changeGuidePriority = (id: string, amount: number) => setGuidePriorities(current => ({ ...current, [id]: Math.max(-5, Math.min(5, (current[id] ?? 0) + amount)) }));
  const hasGuestNeeds = (guest: Guest) => Object.entries(guest.needs ?? emptyGuestNeeds).some(([, value]) => typeof value === "boolean" ? value : Boolean(value.trim()));
  const guestNeedsSummary = (guest: Guest) => { const needs = guest.needs ?? emptyGuestNeeds; return [needs.allergies && `Allergie: ${needs.allergies}`, needs.intolerances && `Intolleranze: ${needs.intolerances}`, needs.dietary && needs.dietary, needs.accessibility && `Accessibilità: ${needs.accessibility}`, needs.highchair && "Seggiolone", needs.stroller && "Posto passeggino", needs.other].filter(Boolean).join(" · "); };

  const go = (next: View) => { setView(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const toggleTask = (taskId: number) => setTasks(current => current.map(task => task.id === taskId ? { ...task, done: !task.done, progress: !task.done ? "Fatto" : "Da fare" } : task));

  const assignGuest = (guestId: number, tableId: number | null) => {
    if (tableId === null) {
      setTableAssignments(current => { const next = { ...current }; delete next[guestId]; return next; });
      notify("Invitato spostato in Da assegnare");
      return;
    }
    const guest = guests.find(item => item.id === guestId);
    const table = tables.find(item => item.id === tableId);
    if (!guest || !table) return;
    const currentlyAtTable = tableAssignments[guestId] === tableId ? guest.plus : 0;
    if (occupiedSeats(tableId) - currentlyAtTable + guest.plus > table.seats) {
      notify(`Il tavolo ${table.name} non ha abbastanza posti`);
      return;
    }
    setTableAssignments(current => ({ ...current, [guestId]: tableId }));
    notify(`${guest.name} assegnato al tavolo ${table.name}`);
  };

  const submitTable = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const seats = Number(data.get("seats"));
    if (editingTableId && seats < occupiedSeats(editingTableId)) {
      notify("La capienza non può essere inferiore ai posti già occupati");
      return;
    }
    const value: WeddingTable = { id: editingTableId ?? Date.now(), name: String(data.get("name")).trim(), seats };
    setTables(current => editingTableId ? current.map(table => table.id === editingTableId ? value : table) : [...current, value]);
    setModal(null); setEditingTableId(null); notify(editingTableId ? "Tavolo aggiornato" : "Tavolo creato");
  };

  const confirmDeleteTable = () => {
    if (!deletingTableId) return;
    setTables(current => current.filter(table => table.id !== deletingTableId));
    setTableAssignments(current => Object.fromEntries(Object.entries(current).filter(([, tableId]) => tableId !== deletingTableId)));
    setModal(null); setDeletingTableId(null); notify("Tavolo eliminato: gli invitati sono da riassegnare");
  };

  const openTravelForm = (kind: TravelItemKind, id?: number) => { setEditingTravel(id ? { kind, id } : null); setModal(kind); };
  const submitTravelPlan = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget);
    setTravelPlan({ status: String(data.get("status")) as TravelPlan["status"], period: String(data.get("period")).trim(), duration: String(data.get("duration")).trim(), style: String(data.get("style")), notes: String(data.get("notes")).trim(), budget: Number(data.get("budget")) });
    setModal(null); notify("Viaggio aggiornato");
  };
  const submitDestination = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: Destination = { id: editingTravel?.id ?? Date.now(), name: String(data.get("name")).trim(), notes: String(data.get("notes")).trim() };
    setDestinations(current => editingTravel ? current.map(item => item.id === editingTravel.id ? value : item) : [...current, value]); setModal(null); setEditingTravel(null); notify("Destinazione salvata");
  };
  const submitTripStop = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: TripStop = { id: editingTravel?.id ?? Date.now(), place: String(data.get("place")).trim(), start: String(data.get("start")), end: String(data.get("end")), hotel: String(data.get("hotel")).trim(), transport: String(data.get("transport")).trim(), activities: String(data.get("activities")).trim(), booking: String(data.get("booking")).trim() };
    setTripStops(current => editingTravel ? current.map(item => item.id === editingTravel.id ? value : item) : [...current, value]); setModal(null); setEditingTravel(null); notify("Tappa salvata");
  };
  const submitTravelTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const previous = travelTasks.find(item => item.id === editingTravel?.id); const value: TravelTask = { id: editingTravel?.id ?? Date.now(), title: String(data.get("title")).trim(), category: String(data.get("category")), done: previous?.done ?? false };
    setTravelTasks(current => editingTravel ? current.map(item => item.id === editingTravel.id ? value : item) : [...current, value]); setModal(null); setEditingTravel(null); notify("Attività viaggio salvata");
  };
  const submitTravelExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: TravelExpense = { id: editingTravel?.id ?? Date.now(), category: String(data.get("category")), description: String(data.get("description")).trim(), planned: Number(data.get("planned")), actual: Number(data.get("actual")), paid: Number(data.get("paid")), notes: String(data.get("notes")).trim() };
    setTravelExpenses(current => editingTravel ? current.map(item => item.id === editingTravel.id ? value : item) : [...current, value]); setModal(null); setEditingTravel(null); notify("Costo viaggio salvato");
  };
  const submitTravelGift = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: TravelGift = { id: editingTravel?.id ?? Date.now(), from: String(data.get("from")).trim(), amount: Number(data.get("amount")), date: String(data.get("date")), message: String(data.get("message")).trim(), thanked: data.get("thanked") === "on" };
    setTravelGifts(current => editingTravel ? current.map(item => item.id === editingTravel.id ? value : item) : [...current, value]); setModal(null); setEditingTravel(null); notify("Regalo salvato");
  };
  const askDeleteTravel = (kind: TravelItemKind, id: number, label: string) => { setDeletingTravel({ kind, id, label }); setModal("deleteTravel"); };
  const confirmDeleteTravel = () => {
    if (!deletingTravel) return;
    if (deletingTravel.kind === "destination") setDestinations(current => current.filter(item => item.id !== deletingTravel.id));
    if (deletingTravel.kind === "stop") setTripStops(current => current.filter(item => item.id !== deletingTravel.id));
    if (deletingTravel.kind === "travelTask") setTravelTasks(current => current.filter(item => item.id !== deletingTravel.id));
    if (deletingTravel.kind === "travelExpense") setTravelExpenses(current => current.filter(item => item.id !== deletingTravel.id));
    if (deletingTravel.kind === "gift") setTravelGifts(current => current.filter(item => item.id !== deletingTravel.id));
    setModal(null); setDeletingTravel(null); notify("Elemento eliminato");
  };
  const submitBureauTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: BureauTask = { id: editingGuide?.id ?? Date.now(), title: String(data.get("title")).trim(), area: String(data.get("area")), status: String(data.get("status")) as ChecklistStatus, due: String(data.get("due")), appointment: String(data.get("appointment")), notes: String(data.get("notes")).trim(), documents: String(data.get("documents")).trim(), appliesTo: editingBureauTask?.appliesTo ?? [marriageType] };
    setBureauTasks(current => editingGuide ? current.map(item => item.id === editingGuide.id ? value : item) : [...current, value]); setModal(null); setEditingGuide(null); notify("Pratica salvata");
  };
  const submitCeremonyItem = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: CeremonyItem = { id: editingGuide?.id ?? Date.now(), section: String(data.get("section")), title: String(data.get("title")).trim(), text: String(data.get("text")).trim(), person: String(data.get("person")).trim(), music: String(data.get("music")).trim(), notes: String(data.get("notes")).trim() };
    setCeremonyItems(current => editingGuide ? current.map(item => item.id === editingGuide.id ? value : item) : [...current, value]); setModal(null); setEditingGuide(null); notify("Momento della cerimonia salvato");
  };
  const submitTravelDocument = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const value: TravelDocument = { id: editingGuide?.id ?? Date.now(), destinationId: data.get("destinationId") ? Number(data.get("destinationId")) : null, title: String(data.get("title")).trim(), status: String(data.get("status")) as ChecklistStatus, due: String(data.get("due")), notes: String(data.get("notes")).trim() };
    setTravelDocuments(current => editingGuide ? current.map(item => item.id === editingGuide.id ? value : item) : [...current, value]); setModal(null); setEditingGuide(null); notify("Documento di viaggio salvato");
  };
  const submitWitness = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const guestId = data.get("guestId") ? Number(data.get("guestId")) : null;
    if (guestId && witnesses.some(item => item.guestId === guestId && item.id !== editingWitnessId)) { notify("Questa persona è già tra i testimoni"); return; }
    const selectedGuest = guests.find(item => item.id === guestId); const existing = witnesses.find(item => item.id === editingWitnessId); const photoFile = data.get("photo") as File; let photo = existing?.photo ?? "";
    if (photoFile?.size) photo = await new Promise<string>((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve(String(reader.result)); reader.onerror = () => reject(reader.error); reader.readAsDataURL(photoFile); });
    const value: Witness = { id: editingWitnessId ?? Date.now(), guestId, name: selectedGuest?.name ?? String(data.get("name")).trim(), side: String(data.get("side")) as Witness["side"], contact: String(data.get("contact")).trim(), status: String(data.get("status")) as Witness["status"], notes: String(data.get("notes")).trim(), photo, proposalMethod: String(data.get("proposalMethod")), proposalIdeas: String(data.get("proposalIdeas")).trim(), proposalMessage: String(data.get("proposalMessage")).trim() };
    if (!value.name) { notify("Inserisci o seleziona un nome"); return; }
    setWitnesses(current => editingWitnessId ? current.map(item => item.id === editingWitnessId ? value : item) : [...current, value]); setModal(null); setEditingWitnessId(null); notify("Testimone salvato");
  };
  const submitDelegate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const data = new FormData(event.currentTarget); const dueDate = String(data.get("dueDate")); const progress = String(data.get("progress")) as NonNullable<Task["progress"]>; const previous = tasks.find(item => item.id === editingDelegateId); const due = dueDate ? new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" }).format(new Date(`${dueDate}T12:00:00`)) : "Da definire";
    const value: Task = { id: editingDelegateId ?? Date.now(), title: String(data.get("title")).trim(), category: "Testimoni", due, dueDate, done: progress === "Fatto", progress, witnessId: Number(data.get("witnessId")) };
    setTasks(current => editingDelegateId ? current.map(item => item.id === editingDelegateId ? { ...previous, ...value } : item) : [...current, value]); setModal(null); setEditingDelegateId(null); setDelegateSuggestion(""); notify("Compito delegato salvato");
  };
  const isDueSoon = (due: string, status: ChecklistStatus) => { if (!due || status === "Completato") return false; const difference = new Date(`${due}T12:00:00`).getTime() - Date.now(); return difference >= 0 && difference <= 60 * 86400000; };

  const submitTask = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const date = String(data.get("due"));
    const due = date ? new Intl.DateTimeFormat("it-IT", { day: "numeric", month: "short" }).format(new Date(`${date}T12:00:00`)) : "Da definire";
    if (editing?.kind === "task") setTasks(current => current.map(item => item.id === editing.id ? { ...item, title: String(data.get("title")).trim(), category: String(data.get("category")), due: date ? due : item.due, dueDate: date || item.dueDate } : item));
    else setTasks(current => [...current, { id: Date.now(), title: String(data.get("title")).trim(), category: String(data.get("category")), due, dueDate: date, done: false, progress: "Da fare" }]);
    setModal(null); setEditing(null); notify(editing ? "Attività aggiornata" : "Attività aggiunta");
  };

  const submitExpense = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const vendorReference = String(data.get("vendor")).trim();
    if (vendorReference && vendors.some(vendor => vendor.name.toLocaleLowerCase("it") === vendorReference.toLocaleLowerCase("it"))) {
      notify("Questo fornitore è già collegato: aggiorna gli importi dalla sua scheda");
      return;
    }
    const value: Expense = { id: editing?.id ?? Date.now(), category: String(data.get("category")), description: String(data.get("description")).trim(), planned: Number(data.get("planned")), actual: Number(data.get("actual")), paid: Number(data.get("paid")), vendor: vendorReference, notes: String(data.get("notes")).trim(), color: editingExpense?.color ?? "#a96f59" };
    if (editing?.kind === "expense") setExpenses(current => current.map(item => item.id === editing.id ? value : item)); else setExpenses(current => [...current, value]);
    setModal(null); setEditing(null); notify(editing ? "Spesa aggiornata" : "Spesa aggiunta al budget");
  };

  const persistGuest = async (guest: Guest) => {
    const response = await fetch("/api/dashboard/guests", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        id: guest.externalId ?? `manual-${guest.id}`,
        name: guest.name,
        partySize: guest.plus,
        status: guest.status,
        invitationSent: guest.invitationSent,
        allergies: guest.needs.allergies,
        intolerances: guest.needs.intolerances,
        dietaryNeeds: guest.needs.dietary,
        accessibilityNeeds: guest.needs.accessibility,
        specialNeeds: guest.needs.other,
        notes: guest.needs.notes,
      }),
    });
    if (!response.ok) throw new Error("Salvataggio online non riuscito");
    return (await response.json() as { id: string }).id;
  };

  const updateGuest = (guest: Guest, changes: Partial<Guest>) => {
    const next = { ...guest, ...changes };
    setGuests(current => current.map(item => item.id === guest.id ? next : item));
    persistGuest(next).catch(() => notify("Aggiornamento online non riuscito"));
  };

  const submitGuest = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const value: Guest = { id: editing?.id ?? Date.now(), externalId: editingGuest?.externalId, source: editingGuest?.source ?? "Manuale", name: String(data.get("name")).trim(), group: String(data.get("group")), status: String(data.get("status")) as Guest["status"], plus: Number(data.get("plus")), invitationSent: data.get("invitationSent") === "on", needs: { allergies: String(data.get("allergies")).trim(), intolerances: String(data.get("intolerances")).trim(), dietary: String(data.get("dietary")).trim(), accessibility: String(data.get("accessibility")).trim(), highchair: data.get("highchair") === "on", stroller: data.get("stroller") === "on", other: String(data.get("otherNeeds")).trim(), notes: String(data.get("guestNotes")).trim() } };
    try {
      value.externalId = await persistGuest(value);
    } catch {
      notify("Impossibile salvare l’invitato online");
      return;
    }
    if (editing?.kind === "guest") setGuests(current => current.map(item => item.id === editing.id ? value : item)); else setGuests(current => [...current, value]);
    setModal(null); setEditing(null); notify(editing ? "Invitato aggiornato" : "Invitato aggiunto");
  };

  const submitVendor = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name")).trim();
    const previousBudgetItem = expenses.find(expense => expense.vendor.trim().toLocaleLowerCase("it") === name.toLocaleLowerCase("it"));
    const enteredCost = Number(data.get("cost"));
    const enteredPaid = Number(data.get("paid"));
    const vendorId = editing?.id ?? Date.now();
    const value: Vendor = { id: vendorId, name, category: String(data.get("category")), detail: `${String(data.get("city")).trim()} · ${String(data.get("status"))}`, phone: String(data.get("phone")).trim(), notes: String(data.get("notes")).trim(), cost: enteredCost || previousBudgetItem?.actual || previousBudgetItem?.planned || 0, paid: enteredPaid || previousBudgetItem?.paid || 0, icon: editingVendor?.icon ?? "◇", tone: editingVendor?.tone ?? "sage" };
    if (editing?.kind === "vendor") setVendors(current => current.map(item => item.id === editing.id ? value : item)); else setVendors(current => [...current, value]);
    if (previousBudgetItem) setExpenses(current => current.filter(item => item.id !== previousBudgetItem.id));
    if (linkNewVendorToTravel) setTravelVendorIds(current => current.includes(vendorId) ? current : [...current, vendorId]);
    setModal(null); setEditing(null); setLinkNewVendorToTravel(false); notify(editing ? "Fornitore aggiornato" : "Fornitore aggiunto");
  };

  const openEdit = (kind: ItemKind, id: number) => { setEditing({ kind, id }); setModal(kind); };
  const askDelete = (kind: ItemKind, id: number, label: string) => { setDeleting({ kind, id, label }); setModal("delete"); };
  const confirmDelete = () => {
    if (!deleting) return;
    if (deleting.kind === "task") setTasks(current => current.filter(item => item.id !== deleting.id));
    if (deleting.kind === "guest") {
      const removedGuest = guests.find(item => item.id === deleting.id);
      if (removedGuest?.externalId) {
        fetch(`/api/dashboard/guests?id=${encodeURIComponent(removedGuest.externalId)}`, { method: "DELETE" })
          .catch(() => notify("Eliminazione online non riuscita"));
      }
      setGuests(current => current.filter(item => item.id !== deleting.id));
      setTableAssignments(current => { const next = { ...current }; delete next[deleting.id]; return next; });
      setWitnesses(current => current.map(item => item.guestId === deleting.id ? { ...item, guestId: null, name: removedGuest?.name ?? item.name } : item));
    }
    if (deleting.kind === "expense") setExpenses(current => current.filter(item => item.id !== deleting.id));
    if (deleting.kind === "vendor") { setVendors(current => current.filter(item => item.id !== deleting.id)); setTravelVendorIds(current => current.filter(id => id !== deleting.id)); }
    setModal(null); setDeleting(null); notify("Elemento eliminato");
  };

  const submitWedding = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setWedding({ partnerOne: String(data.get("partnerOne")).trim(), partnerTwo: String(data.get("partnerTwo")).trim(), date: String(data.get("date")), location: String(data.get("location")).trim() });
    setModal(null); notify("Il vostro matrimonio è stato aggiornato");
  };

  const editingTask = editing?.kind === "task" ? tasks.find(item => item.id === editing.id) : undefined;
  const editingGuest = editing?.kind === "guest" ? guests.find(item => item.id === editing.id) : undefined;
  const editingExpense = editing?.kind === "expense" ? expenses.find(item => item.id === editing.id) : undefined;
  const editingVendor = editing?.kind === "vendor" ? vendors.find(item => item.id === editing.id) : undefined;
  const selectedVendor = vendors.find(item => item.id === selectedVendorId);
  const editingTable = tables.find(table => table.id === editingTableId);
  const deletingTable = tables.find(table => table.id === deletingTableId);
  const editingDestination = editingTravel?.kind === "destination" ? destinations.find(item => item.id === editingTravel.id) : undefined;
  const editingStop = editingTravel?.kind === "stop" ? tripStops.find(item => item.id === editingTravel.id) : undefined;
  const editingTravelTask = editingTravel?.kind === "travelTask" ? travelTasks.find(item => item.id === editingTravel.id) : undefined;
  const editingTravelExpense = editingTravel?.kind === "travelExpense" ? travelExpenses.find(item => item.id === editingTravel.id) : undefined;
  const editingGift = editingTravel?.kind === "gift" ? travelGifts.find(item => item.id === editingTravel.id) : undefined;
  const editingBureauTask = editingGuide?.kind === "bureau" ? bureauTasks.find(item => item.id === editingGuide.id) : undefined;
  const editingCeremonyItem = editingGuide?.kind === "ceremonyItem" ? ceremonyItems.find(item => item.id === editingGuide.id) : undefined;
  const editingTravelDocument = editingGuide?.kind === "travelDocument" ? travelDocuments.find(item => item.id === editingGuide.id) : undefined;
  const editingWitness = witnesses.find(item => item.id === editingWitnessId);
  const editingDelegate = tasks.find(item => item.id === editingDelegateId);
  const travelModalTitles: Record<TravelItemKind | "travelPlan", string> = { travelPlan: "Il vostro viaggio", destination: `${editingDestination ? "Modifica" : "Aggiungi"} una destinazione`, stop: `${editingStop ? "Modifica" : "Aggiungi"} una tappa`, travelTask: `${editingTravelTask ? "Modifica" : "Aggiungi"} un’attività`, travelExpense: `${editingTravelExpense ? "Modifica" : "Aggiungi"} un costo`, gift: `${editingGift ? "Modifica" : "Registra"} un regalo` };
  const isTravelModal = modal === "travelPlan" || modal === "destination" || modal === "stop" || modal === "travelTask" || modal === "travelExpense" || modal === "gift";
  const guideModalTitle = modal === "bureau" ? `${editingBureauTask ? "Modifica" : "Aggiungi"} una pratica` : modal === "ceremonyItem" ? `${editingCeremonyItem ? "Modifica" : "Aggiungi"} un momento` : modal === "travelDocument" ? `${editingTravelDocument ? "Modifica" : "Aggiungi"} un documento` : modal === "witness" ? `${editingWitness ? "Modifica" : "Aggiungi"} un testimone` : modal === "delegate" ? `${editingDelegate ? "Modifica" : "Aggiungi"} un compito` : "";

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <button className="brand" onClick={() => go("home")} aria-label="Vai alla home"><span className="brand-mark">4</span><span><b>Ever</b><small>Wedding</small></span></button>
        <nav aria-label="Navigazione principale">
          {nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => go(item.id)}><span>{item.icon}</span>{item.label}</button>)}
        </nav>
        <button className={`share-app-link ${shareCode ? "connected" : ""}`} onClick={() => { setJoinCode(shareCode); setShowShareGuide(true); }}><span>{shareCode ? "✓" : "⇄"}</span><div><b>{shareCode ? "Coppia collegata" : "Collega gli sposi"}</b><small>{shareCode ? `${shareCode} · ${syncStatus === "sincronizzato" ? "aggiornato" : syncStatus}` : "Modifiche condivise"}</small></div></button>
        <button className="install-app-link" onClick={() => setShowInstallGuide(true)}><span>⇧</span> Installa su iPhone</button>
        <div className="couple-mini"><div className="avatar">{wedding.partnerOne.charAt(0)}<span>&</span>{wedding.partnerTwo.charAt(0)}</div><div><b>{wedding.partnerOne} & {wedding.partnerTwo}</b><small>{formattedDate}</small></div></div>
      </aside>

      <main>
        <header className="topbar">
          <button className="mobile-brand" onClick={() => go("home")}><span>4</span>Ever <i>Wedding</i></button>
          <div className="top-date"><span>{dayOfMonth}</span><div><b>{monthYear}</b><small>{wedding.location}</small></div></div>
          <button className={`mobile-share ${shareCode ? "connected" : ""}`} onClick={() => { setJoinCode(shareCode); setShowShareGuide(true); }} aria-label="Collega gli sposi e sincronizza i dati">{shareCode ? "✓" : "⇄"}</button>
          <button className="mobile-install" onClick={() => setShowInstallGuide(true)} aria-label="Come installare 4Ever Wedding su iPhone">⇧</button>
          <div className="profile" aria-label={`Profilo di ${wedding.partnerOne} e ${wedding.partnerTwo}`}>{initials}</div>
        </header>

        <div className="content">
          {view === "home" && <>
            <section className="hero">
              <div className="hero-copy"><span className="eyebrow light">IL VOSTRO GIORNO</span><h1>{wedding.partnerOne} <i>&</i> {wedding.partnerTwo}</h1><p>Ogni dettaglio vi porta un po’ più vicino al vostro sì.</p><div className="date-line"><span></span>{formattedDate} · {wedding.location}<span></span></div><button className="edit-wedding" onClick={() => setModal("wedding")}>Modifica</button></div>
              {hasWeddingDate ? <div className="countdown"><strong>{days}</strong><span>{days === 1 ? "giorno al matrimonio" : "giorni al matrimonio"}</span><div className="count-details"><div><b>{months}</b><small>mesi</small></div><div><b>{weeks}</b><small>settimane</small></div><div><b>{remainingDays}</b><small>giorni</small></div></div></div> : <div className="countdown countdown-empty"><span className="date-flourish">❧</span><strong>La vostra data è ancora da scegliere</strong><p>Potete iniziare a organizzare tutto il resto con calma.</p><button onClick={() => setModal("wedding")}>Scegli la data</button></div>}
            </section>

            <section className="overview-grid">
              <button className="stat-card" onClick={() => go("tasks")}><div className="stat-icon sage">✓</div><div><span>ATTIVITÀ</span><strong>{completed} <small>di {tasks.length}</small></strong><div className="progress"><i style={{ width: `${completed / tasks.length * 100}%` }}></i></div><small>Prossima: menu catering</small></div><b>›</b></button>
              <button className="stat-card" onClick={() => go("budget")}><div className="stat-icon clay">€</div><div><span>BUDGET</span><strong>{money.format(paid)} <small>spesi</small></strong><div className="progress clay"><i style={{ width: `${Math.min(100, paid / Math.max(1, budgetTotal) * 100)}%` }}></i></div><small>{money.format(budgetTotal - paid)} rimanenti</small></div><b>›</b></button>
              <button className="stat-card" onClick={() => go("guests")}><div className="stat-icon sand">♙</div><div><span>INVITATI</span><strong>{confirmed} <small>confermati</small></strong><div className="guest-dots"><i></i><i></i><i></i><em>+{Math.max(0, confirmed - 3)}</em></div><small>{pending} risposte in attesa</small></div><b>›</b></button>
            </section>

            <section className="panel next-steps">
              <div className="next-steps-head">
                <div><span className="eyebrow">UNA COSA ALLA VOLTA</span><h2>Cosa fare adesso</h2><p>Le priorità più utili per continuare a organizzare il vostro matrimonio con serenità.</p></div>
                <div className="guide-progress"><span>Organizzazione</span><strong>{guideProgress}% completata</strong><div className="big-progress"><i style={{ width: `${guideProgress}%` }}></i></div><small>Un’indicazione gentile del percorso fatto insieme.</small></div>
              </div>
              <div className="guide-list">
                {displayedGuideItems.map((item, index) => {
                  const daysUntil = guideDaysUntil(item.due);
                  const dueTone = item.status !== "Completato" && daysUntil < 0 ? "overdue" : item.status !== "Completato" && daysUntil <= 30 ? "near" : "";
                  const manualPriority = guidePriorities[item.id] ?? 0;
                  return <article className={`guide-row ${manualPriority > 0 ? "manual-high" : ""} ${showAllGuide && index >= 5 ? "secondary-priority" : ""}`} key={item.id}>
                    <div className="guide-marker">{item.status === "Completato" ? "✓" : item.status === "In corso" ? "◐" : "○"}</div>
                    <div className="guide-copy"><span>{item.phase}</span><h3>{item.title}</h3><div className="guide-meta"><em className={`guide-status ${item.status.toLowerCase().replaceAll(" ", "-")}`}>{item.status}</em><em className={`guide-due ${dueTone} ${!item.due ? "waiting" : ""}`}>{item.due ? `${dueTone === "overdue" ? "Scaduta · " : dueTone === "near" ? "In scadenza · " : "Entro il "}${formatGuideDue(item.due)}` : "In attesa della data"}</em></div>{item.dependency && <small className="guide-dependency">Prima di procedere: {item.dependency}</small>}</div>
                    <div className="guide-actions"><div className="priority-controls" aria-label={`Priorità di ${item.title}`}><button onClick={() => changeGuidePriority(item.id, 1)} title="Aumenta priorità" aria-label={`Aumenta la priorità di ${item.title}`}>↑ <span>Su</span></button><button onClick={() => changeGuidePriority(item.id, -1)} title="Diminuisci priorità" aria-label={`Diminuisci la priorità di ${item.title}`}>↓ <span>Giù</span></button></div><button className="guide-link" onClick={() => go(item.view)} aria-label={`Apri la sezione relativa a ${item.title}`}>Apri <span>→</span></button></div>
                  </article>;
                })}
                {!displayedGuideItems.length && <div className="guide-empty"><b>Avete completato tutte le priorità.</b><span>Potete consultare l’intero percorso quando volete.</span></div>}
              </div>
              <button className="guide-toggle" onClick={() => setShowAllGuide(current => !current)}>{showAllGuide ? "Mostra solo le priorità" : "Vedi tutte le attività"} <span>{showAllGuide ? "↑" : "→"}</span></button>
            </section>

            <section className="home-columns home-inspiration">
              <div className="panel inspiration-preview"><SectionTitle eyebrow="ISPIRAZIONE DEL GIORNO" title="Una cena sotto le stelle" />
                <div className="idea-visual lights large"><div className="bulbs">•　•　•　•　•</div><div className="table-shape"></div></div><p>Luci calde, lino naturale e ulivi: un’atmosfera intima e senza tempo.</p><button className="text-btn" onClick={() => go("ideas")}>Esplora le ispirazioni →</button>
              </div>
            </section>
          </>}

          {view === "tasks" && <section className="page-section">
            <SectionTitle eyebrow="ORGANIZZAZIONE" title="Le vostre attività" action={<button className="primary" onClick={() => { setEditing(null); setModal("task"); }}>＋ Aggiungi</button>} />
            <div className="summary-strip"><div><strong>{completed}/{tasks.length}</strong><span>completate</span></div><div className="big-progress"><i style={{ width: `${completed / tasks.length * 100}%` }}></i></div><b>{Math.round(completed / tasks.length * 100)}%</b></div>
            <div className="filters">{["Tutte", "Da fare", "Completate"].map(f => <button key={f} className={taskFilter === f ? "selected" : ""} onClick={() => setTaskFilter(f)}>{f}</button>)}</div>
            <div className="panel task-list">{filteredTasks.map(task => <div key={task.id} className={`managed-row ${task.done ? "done" : ""}`}><label><input type="checkbox" checked={task.done} onChange={() => toggleTask(task.id)}/><span><b>{task.title}</b><small>{task.category}{task.witnessId ? ` · ${witnesses.find(item => item.id === task.witnessId)?.name ?? "Testimone"}` : ""}</small></span></label><em>{task.due}</em><ItemMenu onEdit={() => openEdit("task", task.id)} onDelete={() => askDelete("task", task.id, task.title)} /></div>)}</div>
          </section>}

          {view === "budget" && <section className="page-section">
            <SectionTitle eyebrow="TENIAMO I CONTI" title="Budget" action={<div className="heading-actions"><button className="secondary" onClick={() => setModal("budget")}>Modifica budget</button><button className="primary" onClick={() => { setEditing(null); setModal("expense"); }}>＋ Nuova spesa</button></div>} />
            <div className="budget-hero"><div><span>BUDGET TOTALE</span><strong>{money.format(budgetTotal)}</strong><small>Il {Math.round(paid / Math.max(1, budgetTotal) * 100)}% è già stato speso</small></div><div className="donut" style={{ background: `conic-gradient(#6d7762 ${Math.min(360, paid / Math.max(1, budgetTotal) * 360)}deg, #e8e3da 0)` }}><div><b>{Math.round(paid / Math.max(1, budgetTotal) * 100)}%</b><small>speso</small></div></div></div>
            <div className="money-cards four"><div><span>TOTALE PREVISTO</span><strong>{money.format(planned)}</strong><small>Fornitori e altre spese</small></div><div><span>TOTALE SPESO</span><strong>{money.format(paid)}</strong><small>Pagamenti effettuati</small></div><div><span>ANCORA DA PAGARE</span><strong>{money.format(Math.max(0, planned - paid))}</strong><small>Sugli importi previsti</small></div><div><span>BUDGET RIMANENTE</span><strong>{money.format(budgetTotal - paid)}</strong><small>Budget non ancora speso</small></div></div>
            <div className="panel expense-list"><div className="table-head"><b>Voce di spesa</b><b>Previsto</b><b>Speso</b><b></b></div>{vendors.map(item => <div className="expense" key={`vendor-${item.id}`}><span className="color-dot" style={{ background: "#6d7762" }}></span><div><b>{item.name}</b><small>{item.category} · Fornitore collegato</small><div className="progress"><i style={{ width: `${Math.min(100, item.paid / Math.max(1, item.cost) * 100)}%`, background: "#6d7762" }}></i></div></div><strong>{money.format(item.cost)}</strong><strong>{money.format(item.paid)}</strong><ItemMenu onEdit={() => openEdit("vendor", item.id)} onDelete={() => askDelete("vendor", item.id, item.name)} /></div>)}{travelExpenses.map(item => <div className="expense" key={`travel-${item.id}`}><span className="color-dot" style={{ background: "#a96f59" }}></span><div><b>{item.description}</b><small>{item.category} · Viaggio di nozze</small><div className="progress"><i style={{ width: `${Math.min(100, item.paid / Math.max(1, item.planned) * 100)}%`, background: "#a96f59" }}></i></div></div><strong>{money.format(item.planned)}</strong><strong>{money.format(item.paid)}</strong><ItemMenu onEdit={() => openTravelForm("travelExpense", item.id)} onDelete={() => askDeleteTravel("travelExpense", item.id, item.description)} /></div>)}{expenses.map(item => <div className="expense" key={`expense-${item.id}`}><span className="color-dot" style={{ background: item.color }}></span><div><b>{item.description}</b><small>{item.category}{item.vendor ? ` · ${item.vendor}` : ""} · Spesa indipendente</small><div className="progress"><i style={{ width: `${Math.min(100, item.paid / Math.max(1, item.planned) * 100)}%`, background: item.color }}></i></div></div><strong>{money.format(item.planned)}</strong><strong>{money.format(item.paid)}</strong><ItemMenu onEdit={() => openEdit("expense", item.id)} onDelete={() => askDelete("expense", item.id, item.description)} /></div>)}</div>
          </section>}

          {view === "guests" && <section className="page-section">
            <SectionTitle eyebrow="LE PERSONE CHE AMATE" title="Lista invitati" action={<button className="primary" onClick={() => { setEditing(null); setModal("guest"); }}>＋ Invitato</button>} />
            <div className="guest-stats"><div><i className="confirmed"></i><strong>{confirmed}</strong><span>Confermati</span></div><div><i className="pending"></i><strong>{pending}</strong><span>In attesa</span></div><div><i className="declined"></i><strong>{guests.filter(g => g.status === "Non partecipa").length}</strong><span>Non partecipano</span></div></div>
            <div className="filters">{["Tutti", "Confermato", "In attesa", "Non partecipa"].map(f => <button key={f} className={guestFilter === f ? "selected" : ""} onClick={() => setGuestFilter(f)}>{f}</button>)}</div>
            {guests.some(hasGuestNeeds) && <div className="guest-needs-overview"><span>⌁</span><p><b>{guests.filter(hasGuestNeeds).length} {guests.filter(hasGuestNeeds).length === 1 ? "invitato ha" : "invitati hanno"} esigenze particolari</b>Informazioni disponibili per tableau, location e catering.</p></div>}
            <div className="panel guest-list">{filteredGuests.map((guest, index) => <div className="guest-row" key={guest.id}><div className={`guest-avatar g${index % 4}`}>{guest.name.charAt(0)}</div><div><b>{guest.name}{guest.source === "Invito digitale" && <span className="role-badge">Invito digitale</span>}{hasGuestNeeds(guest) && <span className="needs-badge" title={guestNeedsSummary(guest)}>Esigenze</span>}</b><small>{personalizedGroup(guest.group)} · {guest.plus} {guest.plus > 1 ? "persone" : "persona"}{witnesses.some(item => item.guestId === guest.id) && <span className="role-badge">Testimone</span>}</small></div><label className="invitation-switch"><input type="checkbox" checked={guest.invitationSent} onChange={e => updateGuest(guest, { invitationSent: e.target.checked })} /><span aria-hidden="true"></span><em>{guest.invitationSent ? "Invito inviato" : "Da inviare"}</em></label><select value={guest.status} onChange={e => updateGuest(guest, { status: e.target.value as Guest["status"] })} aria-label={`Stato di ${guest.name}`}><option>Confermato</option><option>In attesa</option><option>Non partecipa</option></select><ItemMenu onEdit={() => openEdit("guest", guest.id)} onDelete={() => askDelete("guest", guest.id, guest.name)} /></div>)}</div>
          </section>}

          {view === "witnesses" && <section className="page-section witnesses-page">
            <SectionTitle eyebrow="AL VOSTRO FIANCO" title="Testimoni" action={<button className="primary" onClick={() => { setEditingWitnessId(null); setModal("witness"); }}>＋ Testimone</button>} />
            <div className="witness-summary"><div><span>TESTIMONI SCELTI</span><strong>{witnesses.filter(item => item.status !== "Da chiedere").length}</strong></div><div><span>PROPOSTE DA FARE</span><strong>{witnesses.filter(item => item.status === "Da chiedere").length}</strong></div><div><span>COMPITI ASSEGNATI</span><strong>{tasks.filter(item => item.witnessId).length}</strong></div><div><span>COMPITI COMPLETATI</span><strong>{tasks.filter(item => item.witnessId && item.done).length}</strong></div></div>
            <div className="witness-grid">{witnesses.map(item => { const linkedGuest = guests.find(guest => guest.id === item.guestId); const displayName = linkedGuest?.name ?? item.name; return <article className="witness-card" key={item.id}><div className="witness-photo">{item.photo ? <img src={item.photo} alt={displayName} /> : <span>{displayName.charAt(0)}</span>}</div><div className="witness-main"><span>TESTIMONE · LATO {item.side.toUpperCase()}</span><h3>{displayName}</h3><p>{item.contact || "Contatto non inserito"}</p><em className={`witness-status status-${item.status.replaceAll(" ", "-").toLowerCase()}`}>{item.status}</em>{item.guestId && <small>Collegato alla lista Invitati</small>}</div><ItemMenu onEdit={() => { setEditingWitnessId(item.id); setModal("witness"); }} onDelete={() => { setWitnesses(current => current.filter(entry => entry.id !== item.id)); setTasks(current => current.map(task => task.witnessId === item.id ? { ...task, witnessId: undefined } : task)); notify("Testimone rimosso"); }} /></article>; })}</div>

            <div className="witness-section panel"><div className="travel-section-head"><div><span className="eyebrow">COME GLIELO DICIAMO?</span><h3>La proposta ai testimoni</h3></div></div><div className="proposal-grid">{witnesses.map(item => <article key={item.id}><div><span>{item.proposalMethod || "Modalità da scegliere"}</span><h4>{guests.find(guest => guest.id === item.guestId)?.name ?? item.name}</h4></div><p>{item.proposalIdeas || "Annotate qui la vostra idea per la proposta."}</p><blockquote>{item.proposalMessage || "Messaggio ancora da scrivere."}</blockquote><button className="text-btn" onClick={() => { setEditingWitnessId(item.id); setModal("witness"); }}>Modifica proposta →</button></article>)}</div></div>

            <div className="witness-section panel"><div className="travel-section-head"><div><span className="eyebrow">COMPITI E DELEGHE</span><h3>Attività affidate</h3></div><button className="primary" onClick={() => { setEditingDelegateId(null); setDelegateSuggestion(""); setModal("delegate"); }}>＋ Compito</button></div><div className="delegate-list">{tasks.filter(item => item.witnessId).map(item => <article className={item.done ? "done" : ""} key={item.id}><button className="delegate-check" onClick={() => toggleTask(item.id)} aria-label={`Completa ${item.title}`}>{item.done ? "✓" : ""}</button><div><h4>{item.title}</h4><p>{witnesses.find(witness => witness.id === item.witnessId)?.name ?? "Responsabile da definire"} · {item.due}</p></div><select value={item.progress ?? (item.done ? "Fatto" : "Da fare")} onChange={event => { const progress = event.target.value as NonNullable<Task["progress"]>; setTasks(current => current.map(task => task.id === item.id ? { ...task, progress, done: progress === "Fatto" } : task)); }}><option>Da fare</option><option>In corso</option><option>Fatto</option></select><ItemMenu onEdit={() => { setEditingDelegateId(item.id); setDelegateSuggestion(""); setModal("delegate"); }} onDelete={() => askDelete("task", item.id, item.title)} /></article>)}</div><div className="suggestion-box"><span>SUGGERIMENTI FACOLTATIVI</span><div>{witnessTaskSuggestions.map(suggestion => <button key={suggestion} onClick={() => { setEditingDelegateId(null); setDelegateSuggestion(suggestion); setModal("delegate"); }}>＋ {suggestion}</button>)}</div></div></div>
          </section>}

          {view === "tableau" && <section className="page-section tableau-page">
            <SectionTitle eyebrow="IL VOSTRO RICEVIMENTO" title="Tableau de mariage" action={<button className="primary" onClick={() => { setEditingTableId(null); setModal("table"); }}>＋ Nuovo tavolo</button>} />
            <p className="intro">Organizzate i posti con semplicità. Ogni invitato può appartenere a un solo tavolo.</p>
            <div className="tableau-stats"><div><span>TAVOLI</span><strong>{tables.length}</strong></div><div><span>POSTI ASSEGNATI</span><strong>{guests.filter(guest => assignedGuestIds.has(guest.id)).reduce((sum, guest) => sum + guest.plus, 0)}</strong></div><div><span>DA ASSEGNARE</span><strong>{unassignedGuests.reduce((sum, guest) => sum + guest.plus, 0)}</strong></div></div>
            <div className="unassigned-panel panel"><div className="tableau-panel-heading"><div><span className="eyebrow">DA ASSEGNARE</span><h3>Invitati senza tavolo</h3></div><b>{unassignedGuests.length}</b></div>
              {unassignedGuests.length ? <div className="seat-guest-list">{unassignedGuests.map(guest => <div className="seat-guest" key={guest.id}><div className="guest-avatar">{guest.name.charAt(0)}</div><div><b>{guest.name}{hasGuestNeeds(guest) && <span className="needs-dot" title={guestNeedsSummary(guest)}>!</span>}</b><small>{guest.plus} {guest.plus > 1 ? "posti" : "posto"} · {personalizedGroup(guest.group)}</small>{hasGuestNeeds(guest) && <em className="seat-needs">{guestNeedsSummary(guest)}</em>}</div><select value="" onChange={event => assignGuest(guest.id, Number(event.target.value))} aria-label={`Assegna ${guest.name} a un tavolo`}><option value="" disabled>Scegli tavolo</option>{tables.map(table => <option key={table.id} value={table.id}>{table.name} · {table.seats - occupiedSeats(table.id)} liberi</option>)}</select></div>)}</div> : <p className="empty-state">Tutti gli invitati sono stati assegnati.</p>}
            </div>
            <div className="wedding-tables-grid">{tables.map((table, tableIndex) => { const seated = guestsAtTable(table.id); const occupied = occupiedSeats(table.id); const available = table.seats - occupied; return <article className="wedding-table-card" key={table.id}><div className="wedding-table-top"><div className={`table-symbol tone-${tableIndex % 4}`}>◌</div><div><span>TAVOLO</span><h3>{table.name}</h3></div><ItemMenu onEdit={() => { setEditingTableId(table.id); setModal("table"); }} onDelete={() => { setDeletingTableId(table.id); setModal("deleteTable"); }} /></div><div className="seat-meter"><div><b>{occupied}/{table.seats}</b><span>posti occupati</span></div><em>{available} {available === 1 ? "disponibile" : "disponibili"}</em></div><div className="big-progress"><i style={{ width: `${Math.min(100, occupied / Math.max(1, table.seats) * 100)}%` }}></i></div><div className="seat-guest-list">{seated.map(guest => <div className="seat-guest compact-seat" key={guest.id}><div className="guest-avatar">{guest.name.charAt(0)}</div><div><b>{guest.name}{hasGuestNeeds(guest) && <span className="needs-dot" title={guestNeedsSummary(guest)}>!</span>}</b><small>{guest.plus} {guest.plus > 1 ? "posti" : "posto"}</small>{hasGuestNeeds(guest) && <em className="seat-needs">{guestNeedsSummary(guest)}</em>}</div><select value={table.id} onChange={event => assignGuest(guest.id, event.target.value ? Number(event.target.value) : null)} aria-label={`Sposta ${guest.name}`}><option value="">Da assegnare</option>{tables.map(optionTable => <option key={optionTable.id} value={optionTable.id}>{optionTable.name}</option>)}</select></div>)}</div>{!seated.length && <p className="empty-state">Nessun invitato assegnato.</p>}</article>; })}</div>
          </section>}

          {view === "vendors" && <section className="page-section">
            <SectionTitle eyebrow="LA VOSTRA SQUADRA" title="Fornitori" action={<button className="primary" onClick={() => { setEditing(null); setModal("vendor"); }}>＋ Fornitore</button>} />
            <p className="intro">Tutti i professionisti che renderanno speciale il vostro giorno, in un unico posto.</p>
            <div className="vendor-grid">{vendors.map(v => <article className="vendor-card" key={v.id}><div className={`vendor-cover ${v.tone}`}><span>{v.icon}</span><em>{v.category}</em><ItemMenu onEdit={() => openEdit("vendor", v.id)} onDelete={() => askDelete("vendor", v.id, v.name)} /></div><div className="vendor-info"><h3>{v.name}</h3><p>{v.detail}</p><div><a href={`tel:${v.phone.replace(/\s/g, "")}`}>Chiama</a><button onClick={() => { setSelectedVendorId(v.id); setModal("vendorDetails"); }}>Dettagli →</button></div></div></article>)}</div>
          </section>}

          {view === "bureaucracy" && <section className="page-section guide-page">
            <SectionTitle eyebrow="VERSO IL VOSTRO SÌ" title="Burocrazia" action={<button className="primary" onClick={() => { setEditingGuide(null); setModal("bureau"); }}>＋ Altra pratica</button>} />
            <div className="guide-disclaimer"><span>i</span><p><b>Una guida, non una consulenza legale.</b> Documenti, procedure e tempistiche possono cambiare in base al Comune, alla diocesi, alla cittadinanza degli sposi e al tipo di matrimonio. Verificate sempre con gli uffici e le autorità competenti.</p></div>
            <div className="marriage-type-card panel"><div><span className="eyebrow">TIPO DI MATRIMONIO</span><h3>Quale rito avete scelto?</h3><p>{ritePathDescription[marriageType]}</p></div><select value={marriageType} onChange={event => setMarriageType(event.target.value as MarriageType)}><option>Civile</option><option>Religioso concordatario</option><option>Solo religioso</option><option>Unione civile</option></select></div>
            <div className="bureau-summary"><div><strong>{activeBureauTasks.filter(item => item.status === "Completato").length}</strong><span>Completate</span></div><div><strong>{activeBureauTasks.filter(item => item.status === "In corso").length}</strong><span>In corso</span></div><div><strong>{activeBureauTasks.filter(item => isDueSoon(item.due, item.status)).length}</strong><span>Scadenze vicine</span></div></div>
            <div className="panel bureaucracy-list">{activeBureauTasks.map(item => <article className={isDueSoon(item.due, item.status) ? "due-soon" : ""} key={item.id}><div className="bureau-status-dot"></div><div><span>{item.area}</span><h3>{item.title}</h3><p>{item.documents || "Nessun documento indicato"}</p><small>{item.notes || "Nessuna nota"}</small>{isDueSoon(item.due, item.status) && <em>Scadenza vicina</em>}</div><div className="bureau-meta"><select value={item.status} onChange={event => setBureauTasks(current => current.map(task => task.id === item.id ? { ...task, status: event.target.value as ChecklistStatus } : task))}><option>Da fare</option><option>In corso</option><option>Completato</option></select><b>{item.due || "Senza scadenza"}</b><small>{item.appointment ? `Appuntamento: ${item.appointment.replace("T", " ")}` : "Nessun appuntamento"}</small></div><ItemMenu onEdit={() => { setEditingGuide({ kind: "bureau", id: item.id }); setModal("bureau"); }} onDelete={() => { setBureauTasks(current => current.filter(task => task.id !== item.id)); notify("Pratica eliminata"); }} /></article>)}</div>
          </section>}

          {view === "ceremony" && <section className="page-section guide-page">
            <SectionTitle eyebrow="PAROLE, MUSICA E PERSONE" title="Rito e Cerimonia" action={<button className="primary" onClick={() => { setEditingGuide(null); setModal("ceremonyItem"); }}>＋ Momento</button>} />
            <p className="intro">Una struttura flessibile per rito religioso, civile o simbolico. Testi e scelte liturgiche vanno concordati con sacerdote, parrocchia o celebrante.</p>
            <div className="ceremony-intro"><span>❧</span><div><b>{marriageType}</b><p>Organizzate letture, interventi, musica e persone coinvolte mantenendo tutto in un unico ordine della celebrazione.</p></div></div>
            <div className="ceremony-grid">{ceremonyItems.map((item, index) => <article key={item.id}><div className="ceremony-number">{String(index + 1).padStart(2, "0")}</div><div className="ceremony-copy"><span>{item.section}</span><h3>{item.title}</h3><p>{item.text || "Testo da definire"}</p><small>{item.person ? `Persona: ${item.person}` : "Persona da assegnare"}{item.music ? ` · Musica: ${item.music}` : ""}</small>{item.notes && <em>{item.notes}</em>}</div><ItemMenu onEdit={() => { setEditingGuide({ kind: "ceremonyItem", id: item.id }); setModal("ceremonyItem"); }} onDelete={() => { setCeremonyItems(current => current.filter(entry => entry.id !== item.id)); notify("Momento eliminato"); }} /></article>)}</div>
          </section>}

          {view === "honeymoon" && <section className="page-section honeymoon-page">
            <SectionTitle eyebrow="IL VIAGGIO CHE SOGNATE" title="Viaggio di nozze" action={<button className="secondary" onClick={() => setModal("travelPlan")}>Modifica viaggio</button>} />
            <div className="travel-hero"><div><span className="eyebrow light">{travelPlan.status}</span><h3>{destinations.map(item => item.name).join(" · ") || "La vostra prossima destinazione"}</h3><p>{travelPlan.period} · {travelPlan.duration} · {travelPlan.style}</p><small>{travelPlan.notes}</small></div><div className="travel-compass">✦</div></div>
            <div className="travel-summary"><div><span>REGALI RICEVUTI</span><strong>{money.format(giftsTotal)}</strong></div><div><span>COSTO PREVISTO</span><strong>{money.format(travelPlanned)}</strong></div><div><span>COSTO SOSTENUTO</span><strong>{money.format(travelPaid)}</strong></div><div><span>ANCORA DA COPRIRE</span><strong>{money.format(travelToCover)}</strong></div></div>

            <div className="travel-section panel"><div className="travel-section-head"><div><span className="eyebrow">ISPIRAZIONE VIAGGIO</span><h3>Destinazioni desiderate</h3></div><button className="primary" onClick={() => openTravelForm("destination")}>＋ Destinazione</button></div><div className="destination-grid">{destinations.map(item => <article key={item.id}><div className="travel-pin">⌖</div><div><h4>{item.name}</h4><p>{item.notes || "Nessuna nota aggiunta"}</p></div><ItemMenu onEdit={() => openTravelForm("destination", item.id)} onDelete={() => askDeleteTravel("destination", item.id, item.name)} /></article>)}</div></div>

            <div className="travel-section panel"><div className="travel-section-head"><div><span className="eyebrow">PROGETTAZIONE</span><h3>Itinerario</h3></div><button className="primary" onClick={() => openTravelForm("stop")}>＋ Tappa</button></div><div className="itinerary-list">{tripStops.map((item, index) => <article key={item.id}><div className="stop-index">{index + 1}</div><div><h4>{item.place}</h4><span>{item.start || "Data da definire"}{item.end ? ` — ${item.end}` : ""}</span><p>{[item.hotel, item.transport, item.activities].filter(Boolean).join(" · ")}</p><small>{item.booking || "Prenotazioni da definire"}</small></div><ItemMenu onEdit={() => openTravelForm("stop", item.id)} onDelete={() => askDeleteTravel("stop", item.id, item.place)} /></article>)}</div></div>

            <div className="travel-columns"><div className="travel-section panel"><div className="travel-section-head"><div><span className="eyebrow">CHECKLIST</span><h3>Prima di partire</h3></div><button className="primary" onClick={() => openTravelForm("travelTask")}>＋ Attività</button></div><div className="travel-checklist">{travelTasks.map(item => <div className={item.done ? "done" : ""} key={item.id}><label><input type="checkbox" checked={item.done} onChange={() => setTravelTasks(current => current.map(task => task.id === item.id ? { ...task, done: !task.done } : task))} /><span><b>{item.title}</b><small>{item.category}</small></span></label><ItemMenu onEdit={() => openTravelForm("travelTask", item.id)} onDelete={() => askDeleteTravel("travelTask", item.id, item.title)} /></div>)}</div></div>
              <div className="travel-section panel"><div className="travel-section-head"><div><span className="eyebrow">FORNITORI COLLEGATI</span><h3>Agenzia e professionisti</h3></div></div><div className="travel-vendor-picker"><select value="" onChange={event => { const id = Number(event.target.value); if (id) setTravelVendorIds(current => current.includes(id) ? current : [...current, id]); }}><option value="">Collega un fornitore esistente</option>{vendors.filter(item => !travelVendorIds.includes(item.id)).map(item => <option key={item.id} value={item.id}>{item.name} · {item.category}</option>)}</select><button className="secondary" onClick={() => { setEditing(null); setLinkNewVendorToTravel(true); setModal("vendor"); }}>＋ Aggiungi ai Fornitori</button></div><div className="linked-vendors">{linkedTravelVendors.map(item => <div key={item.id}><span>◇</span><div><b>{item.name}</b><small>{item.category} · {money.format(item.cost)} previsto · {money.format(item.paid)} pagato</small></div><button onClick={() => setTravelVendorIds(current => current.filter(id => id !== item.id))} aria-label={`Scollega ${item.name}`}>×</button></div>)}{!linkedTravelVendors.length && <p className="empty-state">Nessun fornitore collegato al viaggio.</p>}</div></div></div>

            <div className="travel-section panel travel-documents"><div className="travel-section-head"><div><span className="eyebrow">DOCUMENTI DI VIAGGIO</span><h3>Requisiti per le destinazioni</h3></div><button className="primary" onClick={() => { setEditingGuide(null); setModal("travelDocument"); }}>＋ Documento</button></div><div className="guide-disclaimer compact-disclaimer"><span>i</span><p>I requisiti di ingresso possono cambiare. Verificate sempre passaporto, visti, requisiti sanitari e documenti necessari su fonti ufficiali per ogni destinazione.</p></div><div className="travel-doc-list">{travelDocuments.map(item => { const destination = destinations.find(entry => entry.id === item.destinationId); return <article key={item.id} className={isDueSoon(item.due, item.status) ? "due-soon" : ""}><div><span>{destination?.name || "Tutte le destinazioni"}</span><h4>{item.title}</h4><p>{item.notes}</p></div><select value={item.status} onChange={event => setTravelDocuments(current => current.map(document => document.id === item.id ? { ...document, status: event.target.value as ChecklistStatus } : document))}><option>Da fare</option><option>In corso</option><option>Completato</option></select><ItemMenu onEdit={() => { setEditingGuide({ kind: "travelDocument", id: item.id }); setModal("travelDocument"); }} onDelete={() => { setTravelDocuments(current => current.filter(document => document.id !== item.id)); notify("Documento eliminato"); }} /></article>; })}</div></div>

            <div className="travel-section panel"><div className="travel-section-head"><div><span className="eyebrow">BUDGET VIAGGIO</span><h3>Costi e prenotazioni</h3></div><button className="primary" onClick={() => openTravelForm("travelExpense")}>＋ Costo</button></div><div className="travel-budget-bar"><div><span>BUDGET DESIDERATO</span><b>{money.format(travelPlan.budget)}</b></div><div><span>PREVISTO</span><b>{money.format(travelPlanned)}</b></div><div><span>EFFETTIVO</span><b>{money.format(travelActual)}</b></div><div><span>PAGATO</span><b>{money.format(travelPaid)}</b></div></div><div className="travel-cost-list">{travelExpenses.map(item => <div key={item.id}><i></i><div><b>{item.description}</b><small>{item.category}{item.notes ? ` · ${item.notes}` : ""}</small></div><span>{money.format(item.planned)} previsto</span><strong>{money.format(item.paid)} pagato</strong><ItemMenu onEdit={() => openTravelForm("travelExpense", item.id)} onDelete={() => askDeleteTravel("travelExpense", item.id, item.description)} /></div>)}</div></div>

            <div className="travel-section panel gifts-panel"><div className="travel-section-head"><div><span className="eyebrow">REGALI PER IL VIAGGIO</span><h3>Contributi ricevuti</h3></div><button className="primary" onClick={() => openTravelForm("gift")}>＋ Regalo</button></div><p className="gift-note">I regali finanziano il viaggio ma restano separati dalle spese del Budget.</p><div className="gift-list">{travelGifts.map(item => <article key={item.id}><div className="gift-mark">♡</div><div><h4>{item.from}</h4><p>{item.message || "Nessun messaggio"}</p><small>{item.date || "Data non indicata"} · {item.thanked ? "Ringraziamento inviato" : "Da ringraziare"}</small></div><strong>{money.format(item.amount)}</strong><ItemMenu onEdit={() => openTravelForm("gift", item.id)} onDelete={() => askDeleteTravel("gift", item.id, item.from)} /></article>)}</div></div>
          </section>}

          {view === "ideas" && <section className="page-section">
            <SectionTitle eyebrow="IL VOSTRO STILE" title="Ispirazioni" action={<button className="primary" onClick={() => notify("Raccolta condivisa copiata")}>Condividi raccolta</button>} />
            <p className="intro">Salvate tutto ciò che vi emoziona. Il vostro matrimonio prenderà forma, un dettaglio alla volta.</p>
            <div className="inspiration-grid">{inspirations.map((idea, index) => <article key={idea.title} className="idea-card"><div className={`idea-visual ${idea.style}`}>{idea.image && <img src={idea.image} alt={idea.title} loading="lazy" />}<button aria-label={`Salva ${idea.title}`} className={savedIdeas.includes(index) ? "saved" : ""} onClick={() => setSavedIdeas(savedIdeas.includes(index) ? savedIdeas.filter(i => i !== index) : [...savedIdeas, index])}>♡</button>{idea.style === "lights" && <><div className="bulbs">•　•　•　•</div><div className="table-shape"></div></>}{idea.style === "flowers" && <div className="petals">✽<span>✽</span><em>✽</em></div>}{idea.style === "sunset" && <div className="sun">○</div>}{idea.style === "paper" && <div className="card-paper">{wedding.partnerOne.charAt(0)} <i>&</i> {wedding.partnerTwo.charAt(0)}</div>}</div><div><span>{idea.tag}</span><h3>{idea.title}</h3></div></article>)}</div>
          </section>}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Navigazione mobile">{nav.map(item => <button key={item.id} className={view === item.id ? "active" : ""} onClick={() => go(item.id)}><span>{item.icon}</span>{item.label}</button>)}</nav>
      {modal && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setModal(null); }}>
        <section className={`modal-card ${modal === "expense" || modal === "stop" || modal === "travelExpense" || modal === "guest" ? "modal-wide" : ""}`} role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <button className="modal-close" onClick={() => { setModal(null); setEditing(null); setDeleting(null); setEditingTableId(null); setDeletingTableId(null); setEditingTravel(null); setDeletingTravel(null); setEditingGuide(null); setEditingWitnessId(null); setEditingDelegateId(null); setDelegateSuggestion(""); setLinkNewVendorToTravel(false); }} aria-label="Chiudi">×</button>
          {modal === "deleteTable" ? <><span className="eyebrow">CONFERMA ELIMINAZIONE</span><h2 id="modal-title">Vuoi davvero eliminare questo tavolo?</h2><p>Il tavolo “{deletingTable?.name}” verrà eliminato e i suoi invitati torneranno nella sezione Da assegnare.</p><div className="modal-actions"><button className="secondary" onClick={() => { setModal(null); setDeletingTableId(null); }}>Annulla</button><button className="delete-button" onClick={confirmDeleteTable}>Elimina</button></div></> : modal === "deleteTravel" ? <><span className="eyebrow">CONFERMA ELIMINAZIONE</span><h2 id="modal-title">Vuoi davvero eliminare questo elemento?</h2><p>“{deletingTravel?.label}” verrà rimosso dal viaggio di nozze.</p><div className="modal-actions"><button className="secondary" onClick={() => { setModal(null); setDeletingTravel(null); }}>Annulla</button><button className="delete-button" onClick={confirmDeleteTravel}>Elimina</button></div></> : modal === "delete" ? <><span className="eyebrow">CONFERMA ELIMINAZIONE</span><h2 id="modal-title">Vuoi davvero eliminare questo elemento?</h2><p>“{deleting?.label}” verrà rimosso definitivamente dalla demo.</p><div className="modal-actions"><button className="secondary" onClick={() => { setModal(null); setDeleting(null); }}>Annulla</button><button className="delete-button" onClick={confirmDelete}>Elimina</button></div></> : <>
          <span className="eyebrow">{modal === "witness" || modal === "delegate" ? "AL VOSTRO FIANCO" : isTravelModal || modal === "travelDocument" ? "IL VOSTRO VIAGGIO" : modal === "bureau" ? "PRATICHE E DOCUMENTI" : modal === "ceremonyItem" ? "RITO E CERIMONIA" : modal === "task" ? "UN NUOVO PASSO" : modal === "expense" || modal === "budget" ? "TENIAMO I CONTI" : modal === "guest" ? "UNA PERSONA SPECIALE" : modal === "table" ? "IL VOSTRO TABLEAU" : modal === "vendor" || modal === "vendorDetails" ? "LA VOSTRA SQUADRA" : "IL VOSTRO GIORNO"}</span>
          <h2 id="modal-title">{guideModalTitle || (isTravelModal ? travelModalTitles[modal as TravelItemKind | "travelPlan"] : modal === "task" ? `${editing ? "Modifica" : "Aggiungi"} un’attività` : modal === "expense" ? `${editing ? "Modifica" : "Aggiungi"} una spesa` : modal === "guest" ? `${editing ? "Modifica" : "Aggiungi"} un invitato` : modal === "table" ? `${editingTable ? "Modifica" : "Crea"} un tavolo` : modal === "vendor" ? `${editing ? "Modifica" : "Aggiungi"} un fornitore` : modal === "vendorDetails" ? selectedVendor?.name : modal === "budget" ? "Budget totale" : "Il nostro matrimonio")}</h2>
          <p>{guideModalTitle ? "Inserite o aggiornate tutte le informazioni utili." : isTravelModal ? "Inserite o aggiornate i dettagli del vostro viaggio." : modal === "budget" ? "Potete aggiornare in ogni momento la cifra complessiva che desiderate destinare al matrimonio." : modal === "expense" ? "Aggiornate liberamente preventivi, accordi e pagamenti." : modal === "table" ? "Scegliete un nome e il numero massimo di posti disponibili." : modal === "vendorDetails" ? "Tutte le informazioni e gli accordi con questo fornitore." : modal === "wedding" ? "Personalizzate nomi, data e luogo del vostro giorno speciale." : "Inserite o aggiornate tutte le informazioni."}</p>
          {modal === "vendorDetails" && selectedVendor && <div className="vendor-details">
            <div><span>Categoria</span><b>{selectedVendor.category}</b></div>
            <div><span>Città</span><b>{selectedVendor.detail.split(" · ")[0]}</b></div>
            <div><span>Stato</span><b className="status-pill">{selectedVendor.detail.split(" · ")[1]}</b></div>
            <div><span>Contatto</span>{selectedVendor.phone ? <a href={`tel:${selectedVendor.phone.replace(/\s/g, "")}`}>{selectedVendor.phone}</a> : <b>Non inserito</b>}</div>
            <div><span>Costo / preventivo</span><b>{selectedVendor.cost ? money.format(selectedVendor.cost) : "Non inserito"}</b></div>
            <div><span>Importo già pagato</span><b>{selectedVendor.paid ? money.format(selectedVendor.paid) : "Non ancora pagato"}</b></div>
            <div className="wide"><span>Note</span><p>{selectedVendor.notes || "Nessuna nota inserita."}</p></div>
            <div className="vendor-detail-actions"><button className="secondary" onClick={() => { setEditing({ kind: "vendor", id: selectedVendor.id }); setModal("vendor"); }}>Modifica</button><button className="secondary" onClick={() => askDelete("vendor", selectedVendor.id, selectedVendor.name)}>Elimina fornitore</button></div>
          </div>}
          {modal === "wedding" && <form onSubmit={submitWedding}>
            <label>Primo nome<input name="partnerOne" required autoFocus defaultValue={wedding.partnerOne} placeholder="Es. Sofia" /></label>
            <label>Secondo nome<input name="partnerTwo" required defaultValue={wedding.partnerTwo} placeholder="Es. Andrea" /></label>
            <label className="wide">Data del matrimonio <small className="optional-field">Facoltativa · potete inserirla o rimuoverla quando volete</small><input name="date" type="date" defaultValue={wedding.date} /></label>
            <label className="wide">Luogo del matrimonio<input name="location" required defaultValue={wedding.location} placeholder="Es. Villa Armonia, Firenze" /></label>
            <div className="modal-actions">{hasWeddingDate && <button type="button" className="secondary date-remove" onClick={() => { setWedding(current => ({ ...current, date: "" })); setModal(null); notify("La data è stata rimossa"); }}>Rimuovi data</button>}<button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">Salva modifiche</button></div>
          </form>}
          {modal === "task" && <form onSubmit={submitTask}>
            <label className="wide">Attività<input name="title" required autoFocus defaultValue={editingTask?.title} placeholder="Es. Confermare la torta nuziale" /></label>
            <label>Categoria<select name="category" defaultValue={editingTask?.category ?? "Ricevimento"}><option>Ricevimento</option><option>Cerimonia</option><option>Invitati</option><option>Fornitori</option><option>Beauty</option><option>Musica</option><option>Personale</option></select></label>
            <label>Scadenza<input name="due" type="date" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">{editing ? "Salva modifiche" : "Aggiungi attività"}</button></div>
          </form>}
          {modal === "expense" && <form onSubmit={submitExpense}>
            <label>Categoria<select name="category" defaultValue={editingExpense?.category ?? "Ricevimento"}><option>Ricevimento</option><option>Location</option><option>Foto e video</option><option>Abiti</option><option>Allestimenti</option><option>Musica</option><option>Beauty</option><option>Trasporti</option><option>Altro</option></select></label>
            <label>Riferimento esterno<input name="vendor" defaultValue={editingExpense?.vendor} placeholder="Facoltativo" /></label>
            <label className="wide">Descrizione<input name="description" required autoFocus defaultValue={editingExpense?.description} placeholder="Es. Torta nuziale" /></label>
            <label>Importo previsto (€)<input name="planned" type="number" min="0" step="1" required defaultValue={editingExpense?.planned} placeholder="800" /></label>
            <label>Effettivo/concordato (€)<input name="actual" type="number" min="0" step="1" required defaultValue={editingExpense?.actual} placeholder="750" /></label>
            <label>Già pagato (€)<input name="paid" type="number" min="0" step="1" defaultValue={editingExpense?.paid ?? 0} required /></label>
            <label className="wide">Note<textarea name="notes" defaultValue={editingExpense?.notes} placeholder="Scadenze, dettagli o condizioni concordate" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">{editing ? "Salva modifiche" : "Aggiungi spesa"}</button></div>
          </form>}
          {modal === "guest" && <form onSubmit={submitGuest}>
            <label className="wide">Nome e cognome<input name="name" required autoFocus defaultValue={editingGuest?.name} placeholder="Es. Martina Rossi" /></label>
            <label>Gruppo<select name="group" defaultValue={editingGuest?.group ?? "Amici"}><option value="Famiglia di Sofia">Famiglia di {wedding.partnerOne}</option><option value="Famiglia di Andrea">Famiglia di {wedding.partnerTwo}</option><option>Amici</option><option>Colleghi</option><option>Da assegnare</option></select></label>
            <label>Numero di persone<input name="plus" type="number" min="1" max="10" defaultValue={editingGuest?.plus ?? 1} required /></label>
            <label className="wide">Stato RSVP<select name="status" defaultValue={editingGuest?.status ?? "In attesa"}><option>In attesa</option><option>Confermato</option><option>Non partecipa</option></select></label>
            <label className="wide invitation-field"><input name="invitationSent" type="checkbox" defaultChecked={editingGuest?.invitationSent ?? false} /><span>Invito inviato</span></label>
            <div className="guest-needs-title wide"><span>ESIGENZE E NOTE</span><p>Informazioni utili per il tableau, la location e il catering.</p></div>
            <label>Allergie<input name="allergies" defaultValue={editingGuest?.needs?.allergies} placeholder="Es. Frutta a guscio" /></label>
            <label>Intolleranze alimentari<input name="intolerances" defaultValue={editingGuest?.needs?.intolerances} placeholder="Es. Lattosio" /></label>
            <label className="wide">Esigenze alimentari particolari<input name="dietary" defaultValue={editingGuest?.needs?.dietary} placeholder="Es. Vegetariano, vegano, menu bambini" /></label>
            <label className="wide">Mobilità ridotta, disabilità o accessibilità<input name="accessibility" defaultValue={editingGuest?.needs?.accessibility} placeholder="Indicate accessi, spazi o supporti necessari" /></label>
            <label className="invitation-field"><input name="highchair" type="checkbox" defaultChecked={editingGuest?.needs?.highchair ?? false} /><span>Serve un seggiolone</span></label>
            <label className="invitation-field"><input name="stroller" type="checkbox" defaultChecked={editingGuest?.needs?.stroller ?? false} /><span>Serve posto per passeggino</span></label>
            <label className="wide">Altre necessità particolari<input name="otherNeeds" defaultValue={editingGuest?.needs?.other} placeholder="Altre attenzioni da ricordare" /></label>
            <label className="wide">Note libere<textarea name="guestNotes" defaultValue={editingGuest?.needs?.notes} placeholder="Informazioni aggiuntive da condividere con chi organizza" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">{editing ? "Salva modifiche" : "Aggiungi invitato"}</button></div>
          </form>}
          {modal === "table" && <form onSubmit={submitTable}>
            <label className="wide">Nome del tavolo<input name="name" required autoFocus defaultValue={editingTable?.name} placeholder="Es. Rosmarino" /></label>
            <label className="wide">Numero massimo di posti<input name="seats" type="number" min="1" max="50" required defaultValue={editingTable?.seats ?? 8} /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTableId(null); }}>Annulla</button><button className="primary" type="submit">{editingTable ? "Salva modifiche" : "Crea tavolo"}</button></div>
          </form>}
          {modal === "witness" && <form onSubmit={submitWitness}>
            <label className="wide">Seleziona dalla lista Invitati<select name="guestId" defaultValue={editingWitness?.guestId ?? ""}><option value="">Nuova persona / non presente</option>{guests.filter(guest => !witnesses.some(item => item.guestId === guest.id && item.id !== editingWitnessId)).map(guest => <option key={guest.id} value={guest.id}>{guest.name}</option>)}</select></label>
            <label className="wide">Nome, se non è tra gli invitati<input name="name" defaultValue={editingWitness?.name} placeholder="Nome e cognome" /></label><label>Lato<select name="side" defaultValue={editingWitness?.side ?? "Sposa"}><option>Sposa</option><option>Sposo</option></select></label><label>Stato<select name="status" defaultValue={editingWitness?.status ?? "Da chiedere"}><option>Da chiedere</option><option>Ha accettato</option><option>Confermato</option></select></label><label className="wide">Contatti<input name="contact" defaultValue={editingWitness?.contact} placeholder="Telefono o email" /></label><label className="wide">Foto opzionale<input name="photo" type="file" accept="image/*" /></label><label className="wide">Note<textarea name="notes" defaultValue={editingWitness?.notes} placeholder="Informazioni utili" /></label>
            <label>Modalità della proposta<select name="proposalMethod" defaultValue={editingWitness?.proposalMethod ?? "A voce"}><option>A voce</option><option>Lettera</option><option>Regalo</option><option>Box testimone</option><option>Cena / sorpresa</option><option>Altro</option></select></label><label className="wide">Idee per la proposta<textarea name="proposalIdeas" defaultValue={editingWitness?.proposalIdeas} placeholder="Come e quando vorreste chiederglielo?" /></label><label className="wide">Messaggio<textarea name="proposalMessage" defaultValue={editingWitness?.proposalMessage} placeholder="Scrivete il messaggio che vorreste utilizzare" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingWitnessId(null); }}>Annulla</button><button className="primary" type="submit">Salva testimone</button></div>
          </form>}
          {modal === "delegate" && <form onSubmit={submitDelegate}>
            <label className="wide">Descrizione<input name="title" required autoFocus defaultValue={editingDelegate?.title ?? delegateSuggestion} placeholder="Es. Custodire le fedi" /></label><label>Responsabile<select name="witnessId" required defaultValue={editingDelegate?.witnessId ?? ""}><option value="" disabled>Scegli un testimone</option>{witnesses.map(item => <option key={item.id} value={item.id}>{guests.find(guest => guest.id === item.guestId)?.name ?? item.name}</option>)}</select></label><label>Stato<select name="progress" defaultValue={editingDelegate?.progress ?? (editingDelegate?.done ? "Fatto" : "Da fare")}><option>Da fare</option><option>In corso</option><option>Fatto</option></select></label><label className="wide">Scadenza<input name="dueDate" type="date" defaultValue={editingDelegate?.dueDate} /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingDelegateId(null); setDelegateSuggestion(""); }}>Annulla</button><button className="primary" type="submit">Salva compito</button></div>
          </form>}
          {modal === "bureau" && <form onSubmit={submitBureauTask}>
            <label className="wide">Pratica<input name="title" required autoFocus defaultValue={editingBureauTask?.title} placeholder="Es. Prenotare appuntamento in Comune" /></label>
            <label>Area<select name="area" defaultValue={editingBureauTask?.area ?? (marriageType === "Unione civile" ? "Unione civile" : marriageType.includes("religioso") || marriageType.includes("Religioso") ? "Parrocchia" : "Comune")}><option>Comune</option><option>Unione civile</option><option>Parrocchia</option><option>Diocesi</option><option>Documenti personali</option><option>Altro</option></select></label><label>Stato<select name="status" defaultValue={editingBureauTask?.status ?? "Da fare"}><option>Da fare</option><option>In corso</option><option>Completato</option></select></label>
            <label>Da completare entro<input name="due" type="date" defaultValue={editingBureauTask?.due} /></label><label>Appuntamento<input name="appointment" type="datetime-local" defaultValue={editingBureauTask?.appointment} /></label>
            <label className="wide">Documenti necessari<textarea name="documents" defaultValue={editingBureauTask?.documents} placeholder="Elenco dei documenti richiesti" /></label><label className="wide">Note<textarea name="notes" defaultValue={editingBureauTask?.notes} placeholder="Indicazioni e informazioni da verificare" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingGuide(null); }}>Annulla</button><button className="primary" type="submit">Salva pratica</button></div>
          </form>}
          {modal === "ceremonyItem" && <form onSubmit={submitCeremonyItem}>
            <label>Momento<select name="section" defaultValue={editingCeremonyItem?.section ?? "Letture"}><option>Letture</option><option>Salmo</option><option>Vangelo</option><option>Preghiere</option><option>Ingresso</option><option>Offertorio</option><option>Intervento</option><option>Musica</option><option>Rito simbolico</option><option>Altro</option></select></label><label>Titolo<input name="title" required defaultValue={editingCeremonyItem?.title} placeholder="Es. Seconda lettura" /></label>
            <label className="wide">Testo o contenuto<textarea name="text" defaultValue={editingCeremonyItem?.text} placeholder="Brano, testo o descrizione" /></label><label>Persona incaricata<input name="person" defaultValue={editingCeremonyItem?.person} placeholder="Nome o ruolo" /></label><label>Musica / canto<input name="music" defaultValue={editingCeremonyItem?.music} placeholder="Brano o canto" /></label><label className="wide">Note da concordare<textarea name="notes" defaultValue={editingCeremonyItem?.notes} placeholder="Indicazioni per sacerdote, parrocchia o celebrante" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingGuide(null); }}>Annulla</button><button className="primary" type="submit">Salva momento</button></div>
          </form>}
          {modal === "travelDocument" && <form onSubmit={submitTravelDocument}>
            <label className="wide">Documento o requisito<input name="title" required autoFocus defaultValue={editingTravelDocument?.title} placeholder="Es. Visto turistico" /></label><label>Destinazione<select name="destinationId" defaultValue={editingTravelDocument?.destinationId ?? ""}><option value="">Tutte le destinazioni</option>{destinations.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label>Stato<select name="status" defaultValue={editingTravelDocument?.status ?? "Da fare"}><option>Da fare</option><option>In corso</option><option>Completato</option></select></label><label className="wide">Da verificare entro<input name="due" type="date" defaultValue={editingTravelDocument?.due} /></label><label className="wide">Note e fonte da consultare<textarea name="notes" defaultValue={editingTravelDocument?.notes} placeholder="Requisiti da verificare su fonti ufficiali" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingGuide(null); }}>Annulla</button><button className="primary" type="submit">Salva documento</button></div>
          </form>}
          {modal === "travelPlan" && <form onSubmit={submitTravelPlan}>
            <label>Stato<select name="status" defaultValue={travelPlan.status}><option>Da immaginare</option><option>In progettazione</option><option>Prenotato</option><option>Completato</option></select></label>
            <label>Budget desiderato (€)<input name="budget" type="number" min="0" step="100" defaultValue={travelPlan.budget} required /></label>
            <label>Periodo indicativo<input name="period" defaultValue={travelPlan.period} placeholder="Es. Settembre 2027" /></label>
            <label>Durata<input name="duration" defaultValue={travelPlan.duration} placeholder="Es. 14 giorni" /></label>
            <label className="wide">Stile del viaggio<select name="style" defaultValue={travelPlan.style}><option>Mare e relax</option><option>Avventura</option><option>Città e cultura</option><option>Road trip</option><option>Lusso</option><option>Natura</option><option>Mare, natura e relax</option></select></label>
            <label className="wide">Note e idee<textarea name="notes" defaultValue={travelPlan.notes} placeholder="Atmosfera, desideri e idee da ricordare" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">Salva viaggio</button></div>
          </form>}
          {modal === "destination" && <form onSubmit={submitDestination}>
            <label className="wide">Destinazione<input name="name" required autoFocus defaultValue={editingDestination?.name} placeholder="Es. Giappone" /></label>
            <label className="wide">Note e idee<textarea name="notes" defaultValue={editingDestination?.notes} placeholder="Luoghi, atmosfera ed esperienze desiderate" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTravel(null); }}>Annulla</button><button className="primary" type="submit">Salva destinazione</button></div>
          </form>}
          {modal === "stop" && <form onSubmit={submitTripStop}>
            <label className="wide">Tappa<input name="place" required autoFocus defaultValue={editingStop?.place} placeholder="Es. Kyoto" /></label>
            <label>Dal<input name="start" type="date" defaultValue={editingStop?.start} /></label><label>Al<input name="end" type="date" defaultValue={editingStop?.end} /></label>
            <label>Hotel<input name="hotel" defaultValue={editingStop?.hotel} placeholder="Hotel o alloggio" /></label><label>Voli / trasporti<input name="transport" defaultValue={editingStop?.transport} placeholder="Volo, treno, auto..." /></label>
            <label className="wide">Attività<textarea name="activities" defaultValue={editingStop?.activities} placeholder="Esperienze e visite" /></label><label className="wide">Prenotazioni<textarea name="booking" defaultValue={editingStop?.booking} placeholder="Conferme, codici o cose da prenotare" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTravel(null); }}>Annulla</button><button className="primary" type="submit">Salva tappa</button></div>
          </form>}
          {modal === "travelTask" && <form onSubmit={submitTravelTask}>
            <label className="wide">Attività<input name="title" required autoFocus defaultValue={editingTravelTask?.title} placeholder="Es. Richiedere il visto" /></label>
            <label className="wide">Categoria<select name="category" defaultValue={editingTravelTask?.category ?? "Documenti"}><option>Documenti</option><option>Passaporti</option><option>Visti</option><option>Assicurazione</option><option>Salute</option><option>Prenotazioni</option><option>Valigie</option><option>Altro</option></select></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTravel(null); }}>Annulla</button><button className="primary" type="submit">Salva attività</button></div>
          </form>}
          {modal === "travelExpense" && <form onSubmit={submitTravelExpense}>
            <label>Categoria<select name="category" defaultValue={editingTravelExpense?.category ?? "Voli"}><option>Voli</option><option>Hotel</option><option>Trasporti</option><option>Attività</option><option>Assicurazione</option><option>Documenti</option><option>Altro</option></select></label>
            <label className="wide">Descrizione<input name="description" required autoFocus defaultValue={editingTravelExpense?.description} placeholder="Es. Voli per Tokyo" /></label>
            <label>Previsto (€)<input name="planned" type="number" min="0" step="1" required defaultValue={editingTravelExpense?.planned ?? 0} /></label><label>Effettivo (€)<input name="actual" type="number" min="0" step="1" required defaultValue={editingTravelExpense?.actual ?? 0} /></label><label>Già pagato (€)<input name="paid" type="number" min="0" step="1" required defaultValue={editingTravelExpense?.paid ?? 0} /></label>
            <label className="wide">Note<textarea name="notes" defaultValue={editingTravelExpense?.notes} placeholder="Dettagli, scadenze o prenotazioni" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTravel(null); }}>Annulla</button><button className="primary" type="submit">Salva costo</button></div>
          </form>}
          {modal === "gift" && <form onSubmit={submitTravelGift}>
            <label className="wide">Persona o famiglia<input name="from" required autoFocus defaultValue={editingGift?.from} placeholder="Es. Famiglia Rossi" /></label>
            <label>Importo (€)<input name="amount" type="number" min="0" step="1" required defaultValue={editingGift?.amount ?? 0} /></label><label>Data<input name="date" type="date" defaultValue={editingGift?.date} /></label>
            <label className="wide">Messaggio o note<textarea name="message" defaultValue={editingGift?.message} placeholder="Messaggio ricevuto o nota personale" /></label>
            <label className="wide invitation-field"><input name="thanked" type="checkbox" defaultChecked={editingGift?.thanked ?? false} /><span>Ringraziamento inviato</span></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => { setModal(null); setEditingTravel(null); }}>Annulla</button><button className="primary" type="submit">Salva regalo</button></div>
          </form>}
          {modal === "vendor" && <form onSubmit={submitVendor}>
            <label className="wide">Nome fornitore<input name="name" required autoFocus defaultValue={editingVendor?.name} placeholder="Es. Dolce Atelier" /></label>
            <label>Categoria<select name="category" defaultValue={editingVendor?.category ?? (linkNewVendorToTravel ? "Agenzia viaggi" : "Catering")}><option>Location</option><option>Catering</option><option>Fotografia</option><option>Fiori</option><option>Musica</option><option>Abiti</option><option>Beauty</option><option>Agenzia viaggi</option><option>Trasporti</option><option>Altro</option></select></label>
            <label>Città<input name="city" required defaultValue={editingVendor?.detail.split(" · ")[0]} placeholder="Firenze" /></label>
            <label>Stato<select name="status" defaultValue={editingVendor?.detail.split(" · ")[1] ?? "Da confermare"}><option>Da confermare</option><option>Preventivo</option><option>Appuntamento</option><option>Confermato</option></select></label>
            <label>Telefono<input name="phone" defaultValue={editingVendor?.phone} placeholder="+39 055..." /></label>
            <label>Costo / preventivo (€)<input name="cost" type="number" min="0" step="1" defaultValue={editingVendor?.cost ?? 0} /></label>
            <label>Importo già pagato (€)<input name="paid" type="number" min="0" step="1" defaultValue={editingVendor?.paid ?? 0} /></label>
            <label className="wide">Note<textarea name="notes" defaultValue={editingVendor?.notes} placeholder="Accordi, scadenze o dettagli utili" /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">{editing ? "Salva modifiche" : "Aggiungi fornitore"}</button></div>
          </form>}
          {modal === "budget" && <form onSubmit={event => { event.preventDefault(); setBudgetTotal(Number(new FormData(event.currentTarget).get("budgetTotal"))); setModal(null); notify("Budget totale aggiornato"); }}>
            <label className="wide">Budget totale (€)<input name="budgetTotal" type="number" min="0" step="100" required autoFocus defaultValue={budgetTotal} /></label>
            <div className="modal-actions"><button type="button" className="secondary" onClick={() => setModal(null)}>Annulla</button><button className="primary" type="submit">Salva budget</button></div>
          </form>}
          </>}
        </section>
      </div>}
      {showShareGuide && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowShareGuide(false); }}><section className="modal-card share-guide" role="dialog" aria-modal="true" aria-labelledby="share-title"><button className="modal-close" onClick={() => setShowShareGuide(false)}>×</button><span className="eyebrow">INSIEME, IN TEMPO REALE</span><h2 id="share-title">Collegate i vostri iPhone</h2>{shareCode ? <><p>Entrambi gli sposi possono usare questo codice. Le modifiche vengono salvate online e compaiono automaticamente anche sull’altro dispositivo.</p><div className="couple-code"><span>CODICE DELLA COPPIA</span><strong>{shareCode}</strong><em className={`sync-${syncStatus}`}>{syncStatus === "sincronizzato" ? "● Tutto aggiornato" : syncStatus === "salvataggio" ? "● Salvataggio…" : syncStatus === "errore" ? "● Connessione da verificare" : "● Collegamento…"}</em></div><div className="share-code-actions"><button className="primary" onClick={async () => { await navigator.clipboard?.writeText(shareCode); notify("Codice copiato"); }}>Copia il codice</button>{typeof navigator.share === "function" && <button className="secondary" onClick={() => navigator.share({ title: "4Ever Wedding", text: `Usa il codice ${shareCode} per collegarti al nostro matrimonio su 4Ever Wedding.`, url: window.location.origin })}>Condividi</button>}</div><ol className="partner-steps"><li>Il secondo sposo apre o installa 4Ever Wedding.</li><li>Tocca <b>Collega gli sposi</b> e inserisce questo codice.</li><li>Da quel momento entrambi vedrete gli stessi aggiornamenti.</li></ol><button className="text-btn disconnect-share" onClick={leaveSharedSpace}>Scollega questo dispositivo</button></> : <><p>Se questo è il primo dispositivo, create un nuovo codice usando i dati già presenti. Se l’altro sposo ha già creato il codice, inseritelo qui.</p><button className="primary create-couple-code" onClick={createSharedSpace} disabled={syncStatus === "connessione"}>{syncStatus === "connessione" ? "Creazione…" : "Crea il codice della coppia"}</button><div className="share-divider"><span>oppure</span></div><form onSubmit={joinSharedSpace}><label>Inserisci il codice ricevuto<input value={joinCode} onChange={event => setJoinCode(event.target.value.toUpperCase().slice(0, 8))} minLength={8} maxLength={8} required placeholder="ES. AB12CD34" autoComplete="off" /></label><button className="secondary" type="submit">Collegati al matrimonio</button></form><small>Chi possiede il codice può vedere e modificare i dati del matrimonio. Condividetelo solo tra voi.</small></>}</section></div>}
      {showInstallGuide && <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) setShowInstallGuide(false); }}><section className="modal-card install-guide" role="dialog" aria-modal="true" aria-labelledby="install-title"><button className="modal-close" onClick={() => setShowInstallGuide(false)}>×</button><img src="/apple-touch-icon.png" alt="Icona 4Ever Wedding" /><span className="eyebrow">SUL VOSTRO IPHONE</span><h2 id="install-title">Installate 4Ever Wedding</h2><p>Apritela con Safari e aggiungetela alla schermata Home: funzionerà come una normale app, a schermo intero.</p><ol><li><b>1</b><span>Toccate il pulsante <strong>Condividi</strong> nella barra di Safari.</span></li><li><b>2</b><span>Scorrete e scegliete <strong>Aggiungi alla schermata Home</strong>.</span></li><li><b>3</b><span>Confermate con <strong>Aggiungi</strong>.</span></li></ol><button className="primary" onClick={() => setShowInstallGuide(false)}>Ho capito</button><small>I dati della demo rimangono salvati su questo dispositivo.</small></section></div>}
      {toast && <div className="toast">✓ {toast}</div>}
    </div>
  );
}
