"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./invito.module.css";

const INVITO = {
  nomi: "Giada & Francesco",
  data: "2027-06-12T16:00:00",
  dataEstesa: "12 giugno 2027",
  frase: "Con gioia vi invitiamo a condividere con noi il giorno in cui diremo sì.",
  storia:
    "Ci siamo incontrati quasi per caso, abbiamo scelto di camminare insieme e oggi desideriamo festeggiare con le persone che rendono la nostra storia ancora più bella.",
  cerimonia: {
    ora: "16:00",
    luogo: "Chiesa di San Giovanni Bosco e San Gaetano",
    indirizzo: "Via Carlo Rolando 15, Genova",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Chiesa%20di%20San%20Giovanni%20Bosco%20e%20San%20Gaetano%2C%20Via%20Carlo%20Rolando%2015%2C%20Genova",
  },
  ricevimento: {
    ora: "18:00",
    luogo: "Pizzeria Moromare Foce",
    indirizzo: "Corso Guglielmo Marconi 76R, Genova",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Pizzeria%20Moromare%20Foce%2C%20Corso%20Guglielmo%20Marconi%2076R%2C%20Genova",
  },
};

type Countdown = { giorni: number; ore: number; minuti: number; secondi: number };
type AlbumFile = { id: string; file: File; previewUrl: string };

function getCountdown(): Countdown {
  const distanza = Math.max(0, new Date(INVITO.data).getTime() - Date.now());
  return {
    giorni: Math.floor(distanza / 86400000),
    ore: Math.floor((distanza / 3600000) % 24),
    minuti: Math.floor((distanza / 60000) % 60),
    secondi: Math.floor((distanza / 1000) % 60),
  };
}

export default function InvitoPage() {
  const [countdown, setCountdown] = useState<Countdown | null>(null);
  const [inviato, setInviato] = useState(false);
  const [rsvpInCorso, setRsvpInCorso] = useState(false);
  const [rsvpErrore, setRsvpErrore] = useState("");
  const [albumFiles, setAlbumFiles] = useState<AlbumFile[]>([]);
  const [albumMessage, setAlbumMessage] = useState("");

  useEffect(() => {
    const aggiorna = () => setCountdown(getCountdown());
    const avvio = window.setTimeout(aggiorna, 0);
    const timer = window.setInterval(aggiorna, 1000);
    return () => {
      window.clearTimeout(avvio);
      window.clearInterval(timer);
    };
  }, []);

  async function inviaRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRsvpInCorso(true);
    setRsvpErrore("");
    const form = event.currentTarget;
    const dati = new FormData(form);
    let idempotencyKey = localStorage.getItem("invito-giada-francesco-rsvp-key");
    if (!idempotencyKey) {
      idempotencyKey = crypto.randomUUID();
      localStorage.setItem("invito-giada-francesco-rsvp-key", idempotencyKey);
    }

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          idempotencyKey,
          participation: String(dati.get("partecipazione")),
          names: String(dati.get("nomi")),
          partySize: Number(dati.get("partecipanti")),
          allergies: String(dati.get("allergie") ?? ""),
          intolerances: String(dati.get("intolleranze") ?? ""),
          specialNeeds: String(dati.get("necessita") ?? ""),
          privacyConsent: dati.get("privacyConsent") === "on",
        }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Invio non riuscito");
      setInviato(true);
      form.reset();
    } catch (error) {
      setRsvpErrore(error instanceof Error ? error.message : "Invio non riuscito. Riprovate tra poco.");
    } finally {
      setRsvpInCorso(false);
    }
  }

  function selectAlbumFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const nuoviFile = Array.from(event.target.files ?? []).map((file, index) => ({
      id: `${file.name}-${file.lastModified}-${index}`,
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setAlbumFiles(current => [...current, ...nuoviFile]);
    setAlbumMessage("");
    event.target.value = "";
  }

  function removeAlbumFile(id: string) {
    setAlbumFiles(current => {
      const fileDaRimuovere = current.find(item => item.id === id);
      if (fileDaRimuovere) URL.revokeObjectURL(fileDaRimuovere.previewUrl);
      return current.filter(item => item.id !== id);
    });
    setAlbumMessage("");
  }

  function submitAlbumDemo(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (albumFiles.length === 0) {
      setAlbumMessage("Selezionate almeno una fotografia o un video prima di continuare.");
      return;
    }

    // Nella versione definitiva questo sarà l'unico punto da collegare
    // al servizio di archiviazione protetto e alla relativa API di upload.
    setAlbumMessage(
      "Modalità demo: i file non sono stati inviati né salvati. Il salvataggio online sicuro verrà attivato nella versione definitiva."
    );
  }

  return (
    <main className={styles.invito}>
      <nav className={styles.nav} aria-label="Sezioni dell'invito">
        <a href="#home" className={styles.logo}>G <span>&</span> F</a>
        <div>
          <a href="#storia">La nostra storia</a>
          <a href="#programma">Programma</a>
          <a href="#album">Album</a>
          <a href="#rsvp">RSVP</a>
        </div>
      </nav>

      <section id="home" className={styles.hero}>
        <div className={styles.hydrangea} aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => <i key={i} />)}
        </div>
        <div className={styles.lemon} aria-hidden="true" />
        <div className={styles.heroContent}>
          <p className={styles.eyebrow}>CI SPOSIAMO</p>
          <h1>{INVITO.nomi}</h1>
          <div className={styles.divider}><span>✦</span></div>
          <p className={styles.date}>{INVITO.dataEstesa}</p>
          <p className={styles.invitation}>{INVITO.frase}</p>
          <a className={styles.primaryButton} href="#rsvp">Conferma la tua presenza</a>
        </div>

        <div className={styles.countdown} aria-label="Conto alla rovescia">
          {countdown ? Object.entries(countdown).map(([label, value]) => (
            <div key={label}><strong>{String(value).padStart(2, "0")}</strong><span>{label}</span></div>
          )) : <p>Il conto alla rovescia sta per iniziare…</p>}
        </div>
      </section>

      <section id="storia" className={styles.story}>
        <div className={styles.sectionHeading}>
          <span>01</span><p>LA NOSTRA STORIA</p>
          <h2>Un incontro,<br />la nostra strada</h2>
        </div>
        <div className={styles.storyGrid}>
          <figure className={styles.photoLarge}>
            <img
              src="/invito/giada-francesco-storia-01.jpeg"
              alt="Giada e Francesco insieme durante un volo in elicottero"
              width="1193"
              height="1600"
            />
          </figure>
          <div className={styles.storyText}>
            <span className={styles.flower}>❀</span>
            <p>{INVITO.storia}</p>
            <figure className={styles.photoSmall}>
              <div><span>Un altro ricordo</span><small>Formato orizzontale</small></div>
            </figure>
          </div>
        </div>
      </section>

      <section id="programma" className={styles.program}>
        <div className={styles.sectionHeading}>
          <span>02</span><p>IL GIORNO</p>
          <h2>Programma</h2>
        </div>
        <div className={styles.timeline}>
          <article>
            <span className={styles.time}>{INVITO.cerimonia.ora}</span>
            <div className={styles.icon}>♡</div>
            <div>
              <p>CERIMONIA</p>
              <h3>{INVITO.cerimonia.luogo}</h3>
              <address>
                <a className={styles.addressLink} href={INVITO.cerimonia.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {INVITO.cerimonia.indirizzo} <span aria-hidden="true">↗</span>
                </a>
              </address>
            </div>
          </article>
          <article>
            <span className={styles.time}>{INVITO.ricevimento.ora}</span>
            <div className={styles.icon}>✦</div>
            <div>
              <p>RICEVIMENTO</p>
              <h3>{INVITO.ricevimento.luogo}</h3>
              <address>
                <a className={styles.addressLink} href={INVITO.ricevimento.mapsUrl} target="_blank" rel="noopener noreferrer">
                  {INVITO.ricevimento.indirizzo} <span aria-hidden="true">↗</span>
                </a>
              </address>
            </div>
          </article>
        </div>
        <p className={styles.programNote}>Non vediamo l’ora di brindare, cenare e ballare insieme a voi.</p>
      </section>

      <section id="rsvp" className={styles.rsvp}>
        <div className={styles.rsvpCard}>
          <div className={styles.sectionHeading}>
            <span>04</span><p>RÉPONDEZ S&apos;IL VOUS PLAÎT</p>
            <h2>Ci sarete?</h2>
          </div>
          <p className={styles.rsvpIntro}>Vi chiediamo di confermare la vostra presenza compilando questo breve modulo.</p>

          {inviato ? (
            <div className={styles.success} role="status">
              <span>✓</span><h3>Grazie!</h3>
              <p>La vostra risposta è stata registrata e sarà visibile soltanto agli sposi.</p>
              <button type="button" onClick={() => setInviato(false)}>Invia un’altra risposta</button>
            </div>
          ) : (
            <form onSubmit={inviaRsvp}>
              <fieldset>
                <legend>Parteciperete?</legend>
                <label className={styles.radio}><input type="radio" name="partecipazione" value="si" required /><span>Sì, con gioia</span></label>
                <label className={styles.radio}><input type="radio" name="partecipazione" value="no" required /><span>Purtroppo no</span></label>
              </fieldset>
              <label className={styles.field}>Nome e cognome degli invitati
                <input name="nomi" required placeholder="Es. Maria e Luca Rossi" />
              </label>
              <label className={styles.field}>Numero di partecipanti
                <input name="partecipanti" type="number" min="1" max="12" defaultValue="1" required />
              </label>
              <label className={styles.field}>Allergie o intolleranze
                <textarea name="allergie" placeholder="Indicate eventuali allergie" />
              </label>
              <label className={styles.field}>Intolleranze
                <textarea name="intolleranze" placeholder="Indicate eventuali intolleranze alimentari" />
              </label>
              <label className={styles.field}>Necessità particolari
                <textarea name="necessita" placeholder="Accessibilità, seggiolone o altre attenzioni" />
              </label>
              <label className={styles.albumConsent}>
                <input type="checkbox" name="privacyConsent" required />
                <span>Acconsento al trattamento dei dati inseriti per gestire la partecipazione al matrimonio. I dati saranno visibili soltanto agli sposi e non saranno mostrati agli altri invitati.</span>
              </label>
              <p className={styles.privacyNote}>Informativa breve: i dati sono raccolti esclusivamente per organizzare il matrimonio, gestire presenze ed esigenze degli invitati e saranno conservati con accesso riservato agli sposi.</p>
              <button className={styles.submit} type="submit" disabled={rsvpInCorso}>{rsvpInCorso ? "Invio in corso…" : "Invia la risposta"}</button>
              {rsvpErrore && <p className={styles.rsvpError} role="alert">{rsvpErrore}</p>}
            </form>
          )}
        </div>
      </section>

      <section id="album" className={styles.album}>
        <div className={styles.albumCard}>
          <div className={styles.cameraIcon} aria-hidden="true">
            <span />
            <i />
          </div>
          <div className={styles.sectionHeading}>
            <span>03</span><p>I VOSTRI RICORDI</p>
            <h2>Il nostro album condiviso</h2>
          </div>
          <p className={styles.albumIntro}>
            Aiutateci a custodire ogni istante di questo giorno. Caricate qui le fotografie e i video che realizzerete e contribuite a creare il nostro album di ricordi.
          </p>

          <form className={styles.albumForm} onSubmit={submitAlbumDemo}>
            <div className={styles.fileChooser}>
              <input
                id="album-files"
                className={styles.srOnly}
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={selectAlbumFiles}
              />
              <label htmlFor="album-files">Scegli foto e video</label>
              <small>Potete selezionare più immagini e video insieme.</small>
            </div>

            {albumFiles.length > 0 && (
              <div className={styles.fileList} aria-live="polite">
                <h3>File selezionati</h3>
                {albumFiles.map(item => (
                  <article key={item.id} className={styles.filePreview}>
                    {item.file.type.startsWith("image/") ? (
                      <img src={item.previewUrl} alt="" />
                    ) : (
                      <video src={item.previewUrl} muted preload="metadata" aria-label={`Anteprima di ${item.file.name}`} />
                    )}
                    <div>
                      <strong>{item.file.name}</strong>
                      <small>{item.file.type.startsWith("video/") ? "Video" : "Fotografia"} · {(item.file.size / 1048576).toFixed(1)} MB</small>
                    </div>
                    <button type="button" onClick={() => removeAlbumFile(item.id)} aria-label={`Rimuovi ${item.file.name}`}>×</button>
                  </article>
                ))}
              </div>
            )}

            <label className={styles.albumField}>
              Nome di chi condivide <em>facoltativo</em>
              <input name="uploaderName" autoComplete="name" placeholder="Il vostro nome" />
            </label>

            <label className={styles.albumConsent}>
              <input type="checkbox" name="consent" required />
              <span>Acconsento al caricamento e al trattamento delle fotografie e dei video selezionati per l’album privato degli sposi.</span>
            </label>

            <button className={styles.albumSubmit} type="submit">Carica i ricordi</button>
            {albumMessage && <p className={styles.albumMessage} role="status">{albumMessage}</p>}
          </form>
        </div>
      </section>

      <footer>
        <p>{INVITO.nomi}</p><span>{INVITO.dataEstesa}</span>
      </footer>
    </main>
  );
}
