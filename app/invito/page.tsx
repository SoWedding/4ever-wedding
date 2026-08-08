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
    luogo: "Chiesa di Santa Maria",
    indirizzo: "Piazza della Chiesa 1, Genova",
  },
  ricevimento: {
    ora: "18:00",
    luogo: "Villa dei Limoni",
    indirizzo: "Via del Mare 24, Genova",
  },
};

type Countdown = { giorni: number; ore: number; minuti: number; secondi: number };

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

  useEffect(() => {
    setCountdown(getCountdown());
    const timer = window.setInterval(() => setCountdown(getCountdown()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  function inviaRsvp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dati = Object.fromEntries(new FormData(event.currentTarget).entries());
    localStorage.setItem("invito-giada-francesco-rsvp", JSON.stringify(dati));
    setInviato(true);
    event.currentTarget.reset();
  }

  return (
    <main className={styles.invito}>
      <nav className={styles.nav} aria-label="Sezioni dell'invito">
        <a href="#home" className={styles.logo}>G <span>&</span> F</a>
        <div>
          <a href="#storia">La nostra storia</a>
          <a href="#programma">Programma</a>
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
            <div><span>La vostra fotografia</span><small>Formato verticale</small></div>
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
            <div><p>CERIMONIA</p><h3>{INVITO.cerimonia.luogo}</h3><address>{INVITO.cerimonia.indirizzo}</address></div>
          </article>
          <article>
            <span className={styles.time}>{INVITO.ricevimento.ora}</span>
            <div className={styles.icon}>✦</div>
            <div><p>RICEVIMENTO</p><h3>{INVITO.ricevimento.luogo}</h3><address>{INVITO.ricevimento.indirizzo}</address></div>
          </article>
        </div>
        <p className={styles.programNote}>Non vediamo l’ora di brindare, cenare e ballare insieme a voi.</p>
      </section>

      <section id="rsvp" className={styles.rsvp}>
        <div className={styles.rsvpCard}>
          <div className={styles.sectionHeading}>
            <span>03</span><p>RÉPONDEZ S'IL VOUS PLAÎT</p>
            <h2>Ci sarete?</h2>
          </div>
          <p className={styles.rsvpIntro}>Vi chiediamo di confermare la vostra presenza compilando questo breve modulo.</p>

          {inviato ? (
            <div className={styles.success} role="status">
              <span>✓</span><h3>Grazie!</h3>
              <p>La risposta è stata salvata su questo dispositivo per la demo.</p>
              <button type="button" onClick={() => setInviato(false)}>Invia un'altra risposta</button>
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
                <textarea name="allergie" placeholder="Indicate nomi e necessità alimentari" />
              </label>
              <label className={styles.field}>Necessità particolari
                <textarea name="necessita" placeholder="Accessibilità, seggiolone o altre attenzioni" />
              </label>
              <button className={styles.submit} type="submit">Invia la risposta</button>
              <small>Questa è una demo: la risposta resta salvata solo su questo dispositivo.</small>
            </form>
          )}
        </div>
      </section>

      <footer>
        <p>{INVITO.nomi}</p><span>{INVITO.dataEstesa}</span>
      </footer>
    </main>
  );
}
