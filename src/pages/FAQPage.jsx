import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const faq = [
  { category: 'Richiesta di prestito', questions: [
    { q: 'Come posso richiedere un prestito?', a: 'Compila il modulo online in meno di 5 minuti. Nessuna registrazione richiesta. Riceverai una conferma via email e il nostro team ti contatterà entro 24h.' },
    { q: 'Quali documenti servono?', a: 'Solo un documento d\'identità valido e un estratto conto degli ultimi 3 mesi. Nessun certificato di reddito complesso.' },
    { q: 'Quanto tempo ci vuole per ricevere i fondi?', a: 'Dopo l\'accettazione della tua richiesta, il bonifico viene effettuato entro 48 ore lavorative.' },
    { q: 'Cosa succede se la mia richiesta viene rifiutata?', a: 'Ti inviamo una spiegazione dettagliata. Puoi fare richiesta nuovamente dopo 30 giorni o rivolgerti al nostro team per capire come migliorare la tua prossima candidatura.' },
    { q: 'Posso modificare la mia richiesta dopo l\'invio?', a: 'No, una volta inviata la richiesta non può essere modificata. Tuttavia, puoi contattarci per annullarla e presentarne una nuova.' },
  ]},
  { category: 'Tipi di prestito', questions: [
    { q: 'Quali tipi di prestito offrite?', a: 'Offriamo 8 tipi di prestito: personale, emergenza, studentesco, professionale, lavori, consolidamento, PTZ 0% e P2P.' },
    { q: 'Qual è il TAEG?', a: 'Il nostro TAEG è fisso al 4,5% per tutti i tipi di prestito, qualunque sia l\'importo.' },
    { q: 'Qual è l\'importo minimo e massimo?', a: 'Da 100€ a 3.000.000€. Il prestito personale parte da 100€ senza giustificativo.' },
    { q: 'Posso ottenere un prestito con un contratto a tempo determinato?', a: 'Sì! Accettiamo tutti i profili lavorativi: indeterminato, determinato, freelance, studenti, pensionati, RSA.' },
  ]},
  { category: 'Profilo e idoneità', questions: [
    { q: 'Quali profili sono accettati?', a: 'Tutti: indeterminato, determinato, freelance, studenti, pensionati, RSA, disoccupati, non residenti, proprietari e inquilini. Nessuna discriminazione.' },
    { q: 'Quali sono i requisiti di idoneità?', a: 'Essere maggiorenni, avere un documento d\'identità valido e un conto bancario italiano. Ogni pratica viene valutata individualmente.' },
    { q: 'Posso richiedere un prestito se sono residente all\'estero?', a: 'Sì, accettiamo anche non residenti con un conto bancario italiano o europeo.' },
  ]},
  { category: 'Rimborsi', questions: [
    { q: 'Come avvengono i rimborsi?', a: 'I rimborsi mensili vengono prelevati automaticamente dal tuo conto bancario con un SEPA Direct Debit.' },
    { q: 'Posso effettuare un rimborso anticipato?', a: 'Sì, puoi rimborsare anticipatamente in qualsiasi momento senza penali né costi aggiuntivi.' },
    { q: 'Cosa succede in caso di mancato pagamento?', a: 'Ti contattiamo prima di qualsiasi azione. In caso di difficoltà, possiamo trovare insieme una soluzione di ristrutturazione.' },
  ]},
  { category: 'Sicurezza e normativa', questions: [
    { q: 'La piattaforma è sicura?', a: 'Sì. Dati crittografati SSL 256-bit, conformità GDPR, contratto elettronico con valore legale.' },
    { q: 'Siete regolamentati?', a: 'Sì, siamo iscritti all\'OAM (Organismo Agenti e Mediatori) con numero A3056.' },
    { q: 'Come vengono protetti i miei dati?', a: 'I tuoi dati sono crittografati end-to-end e non vengono mai condivisi con terze parti senza il tuo consenso.' },
  ]},
]

export default function FAQPage() {
  return (
    <>
      <PageHero title="Domande frequenti" lead="Tutto quello che devi sapere prima di fare la tua richiesta di prestito." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          {faq.map((cat, ci) => (
            <motion.div key={ci} {...fadeUp} style={{ marginBottom: ci < faq.length - 1 ? 48 : 0 }}>
              <div className="section-eyebrow" style={{ marginBottom: 24 }}>{cat.category}</div>
              <div className="accordion">
                {cat.questions.map((item, qi) => (
                  <AccordionItem key={qi} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CTASection title="Ancora domande?" text="Contattaci, il nostro team ti risponderà entro 24h." cta={{ to: '/contact', label: 'Contattaci' }} />
    </>
  )
}

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="accordion-item">
      <div className="accordion-header">
        <button className="accordion-button" onClick={() => setOpen(!open)} aria-expanded={open}>
          {question}
        </button>
      </div>
      <div className={`accordion-collapse${open ? ' show' : ''}`}>
        <p className="accordion-body">{answer}</p>
      </div>
    </div>
  )
}
