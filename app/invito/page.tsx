"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./invito.module.css";

const INVITO = {
  nomi: "Giada & Francesco",
  data: "2027-06-04T15:30:00",
  dataEstesa: "4 giugno 2027",
  frase: "Con gioia vi invitiamo a condividere con noi il giorno in cui diremo sì.",
  storia:
    "Ci siamo incontrati quasi per caso, abbiamo scelto di camminare insieme e oggi desideriamo festeggiare con le persone che rendono la nostra storia ancora più bella.",
  cerimonia: {
    ora: "15:30",
    luogo: "Santuario Nostra Signora della Rovere",
    indirizzo: "Piazza Rovere 4, San Bartolomeo al Mare (IM)",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Santuario%20Nostra%20Signora%20della%20Rovere%2C%20Piazza%20Rovere%204%2C%20San%20Bartolomeo%20al%20Mare%20IM",
  },
  ricevimento: {
    ora: "17:00",
    luogo: "Femme Wedding Venue",
    indirizzo: "Via Cesare Battisti 58/5, 18016 San Bartolomeo al Mare (IM)",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Femme%20Wedding%20Venue%2C%20Via%20Cesare%20Battisti%2058%2F5%2C%2018016%20San%20Bartolomeo%20al%20Mare%20IM",
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
  const [albumFiles, setAlbumFiles] = useState<AlbumFile[]>([]);
  const [albumMessage, setAlbumMessage] = useState("");
  const [bustaAperta, setBustaAperta] = useState(false);
  const [bustaInApertura, setBustaInApertura] = useState(false);

  useEffect(() => {
    const aggiorna = () => setCountdown(getCountdown());
    const avvio = window.setTimeout(aggiorna, 0);
    const timer = window.setInterval(aggiorna, 1000);
    return () => {
      window.clearTimeout(avvio);
      window.clearInterval(timer);
    };
  }, []);

  function apriBusta(event: React.MouseEvent<HTMLButtonElement>) {
    if (bustaInApertura) return;
    setBustaInApertura(true);

    const overlay = event.currentTarget.closest('[data-envelope-overlay]') as HTMLElement | null;
    const envelope = overlay?.querySelector('[data-envelope]') as HTMLElement | null;
    const flap = overlay?.querySelector('[data-envelope-flap]') as HTMLElement | null;
    const letter = overlay?.querySelector('[data-envelope-letter]') as HTMLElement | null;
    const seal = overlay?.querySelector('[data-envelope-seal]') as HTMLElement | null;
    const hint = overlay?.querySelector('[data-envelope-hint]') as HTMLElement | null;

    if (envelope) envelope.style.transform = "scale(.985)";
    if (flap) flap.style.transform = "rotateX(165deg)";
    if (letter) letter.style.transform = "translateY(-36%)";
    if (seal) {
      seal.style.opacity = "0";
      seal.style.transform = "translate(-50%,-50%) scale(.7)";
    }
    if (hint) hint.style.opacity = "0";

    window.setTimeout(() => {
      if (overlay) {
        overlay.style.transition = "opacity .7s ease";
        overlay.style.opacity = "0";
        overlay.style.pointerEvents = "none";
      }
    }, 950);

    window.setTimeout(() => setBustaAperta(true), 1650);
  }

  function inviaRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dati = Object.fromEntries(new FormData(event.currentTarget).entries());
    localStorage.setItem("invito-giada-francesco-rsvp", JSON.stringify(dati));
    setInviato(true);
    event.currentTarget.reset();
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

    setAlbumMessage(
      "Modalità demo: i file non sono stati inviati né salvati. Il salvataggio online sicuro verrà attivato nella versione definitiva."
    );
  }

  return (
    <main className={styles.invito}>
      {!bustaAperta && (
        <div data-envelope-overlay className={styles.envelopeOverlay} role="dialog" aria-modal="true" aria-label="Apri l'invito">
          <div className={styles.envelopeIntro}>
            <p className={styles.envelopeEyebrow}>IL NOSTRO GIORNO</p>
            <h2>Francesco &amp; Giada</h2>
            <p className={styles.envelopeDate}>4 giugno 2027</p>

            <button className={styles.envelopeButton} type="button" onClick={apriBusta} disabled={bustaInApertura} aria-label="Apri la busta e scopri l'invito">
              <span data-envelope className={styles.envelope} aria-hidden="true">
                <span className={styles.envelopeBack} />
                <span data-envelope-letter className={styles.envelopeLetter}>Francesco <b>&amp;</b> Giada</span>
                <span data-envelope-flap className={styles.envelopeFlap} />
                <span data-envelope-seal className={styles.envelopeSeal}>✦</span>
              </span>
            </button>

            <p data-envelope-hint className={styles.envelopeHint}>Tocca la busta per aprire il nostro invito</p>
          </div>
        </div>
      )}

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
              <address><a className={styles.addressLink} href={INVITO.cerimonia.mapsUrl} target="_blank" rel="noopener noreferrer">{INVITO.cerimonia.indirizzo} <span aria-hidden="true">↗</span></a></address>
            </div>
          </article>
          <article>
            <span className={styles.time}>{INVITO.ricevimento.ora}</span>
            <div className={styles.icon}>✦</div>
            <div>
              <p>RICEVIMENTO</p>
              <h3>{INVITO.ricevimento.luogo}</h3>
              <address><a className={styles.addressLink} href={INVITO.ricevimento.mapsUrl} target="_blank" rel="noopener noreferrer">{INVITO.ricevimento.indirizzo} <span aria-hidden="true">↗</span></a></address>
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
          <p className={styles.rsvpIntro}>Vi chiediamo di confermare la vostra presenza entro il <strong>4 maggio</strong> 2027 compilando questo breve modulo.</p>

          {inviato ? (
            <div className={styles.success} role="status"><span>✓</span><h3>Grazie!</h3><p>La risposta è stata salvata su questo dispositivo per la demo.</p><button type="button" onClick={() => setInviato(false)}>Invia un’altra risposta</button></div>
          ) : (
            <form onSubmit={inviaRsvp}>
              <fieldset><legend>Parteciperete?</legend><label className={styles.radio}><input type="radio" name="partecipazione" value="si" required /><span>Sì, con gioia</span></label><label className={styles.radio}><input type="radio" name="partecipazione" value="no" required /><span>Purtroppo no</span></label></fieldset>
              <label className={styles.field}>Nome e cognome degli invitati<input name="nomi" required placeholder="Es. Maria e Luca Rossi" /></label>
              <label className={styles.field}>Numero di partecipanti<input name="partecipanti" type="number" min="1" max="12" defaultValue="1" required /></label>
              <label className={styles.field}>Allergie o intolleranze<textarea name="allergie" placeholder="Indicate nomi e necessità alimentari" /></label>
              <label className={styles.field}>Necessità particolari<textarea name="necessita" placeholder="Accessibilità, seggiolone o altre attenzioni" /></label>
              <button className={styles.submit} type="submit">Invia la risposta</button>
              <small>Questa è una demo: la risposta resta salvata solo su questo dispositivo.</small>
            </form>
          )}
        </div>
      </section>

      <section id="album" className={styles.album}>
        <div className={styles.albumCard}>
          <div className={styles.cameraIcon} aria-hidden="true"><span /><i /></div>
          <div className={styles.sectionHeading}><span>03</span><p>I VOSTRI RICORDI</p><h2>Il nostro album condiviso</h2></div>
          <p className={styles.albumIntro}>Aiutateci a custodire ogni istante di questo giorno. Caricate qui le fotografie e i video che realizzerete e contribuite a creare il nostro album di ricordi.</p>
          <form className={styles.albumForm} onSubmit={submitAlbumDemo}>
            <div className={styles.fileChooser}><input id="album-files" className={styles.srOnly} type="file" accept="image/*,video/*" multiple onChange={selectAlbumFiles} /><label htmlFor="album-files">Scegli foto e video</label><small>Potete selezionare più immagini e video insieme.</small></div>
            {albumFiles.length > 0 && <div className={styles.fileList} aria-live="polite"><h3>File selezionati</h3>{albumFiles.map(item => <article key={item.id} className={styles.filePreview}>{item.file.type.startsWith("image/") ? <img src={item.previewUrl} alt="" /> : <video src={item.previewUrl} muted preload="metadata" aria-label={`Anteprima di ${item.file.name}`} />}<div><strong>{item.file.name}</strong><small>{(item.file.size / 1024 / 1024).toFixed(1)} MB</small></div><button type="button" onClick={() => removeAlbumFile(item.id)} aria-label={`Rimuovi ${item.file.name}`}>×</button></article>)}</div>}
            <label className={styles.field}>Il vostro nome <span>(facoltativo)</span><input name="autore" placeholder="Es. Maria e Luca" /></label>
            <label className={styles.consent}><input type="checkbox" name="consenso" required /><span>Confermo di voler condividere questi contenuti con gli sposi per il loro album privato.</span></label>
            <button className={styles.albumSubmit} type="submit" disabled={albumFiles.length === 0}>Carica i ricordi</button>
            {albumMessage && <p className={styles.albumMessage} role="status">{albumMessage}</p>}
          </form>
        </div>
      </section>

      <footer><span>G <i>&</i> F</span><p>4 · 06 · 2027</p><small>Con amore, Giada & Francesco</small></footer>
    </main>
  );
}
