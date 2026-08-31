import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const steps = [
  { n: '01', title: 'Compilo il modulo online', text: 'Niente di più semplice. Indica l\'importo desiderato (da 100€ a 3.000.000€), la durata (da 3 a 120 mesi) e i tuoi dati personali. Il modulo è accessibile dal tuo computer o telefono e ti richiederà solo 5 minuti.', details: ['Nessuna registrazione richiesta', 'Modulo responsive e intuitivo', 'Simulatore integrato per calcolare la rata mensile'] },
  { n: '02', title: 'Ricevo una conferma via email', text: 'Subito dopo l\'invio del modulo ricevi una email di conferma con il tuo numero di pratica unico. Questa email riepiloga le informazioni della tua richiesta e i prossimi passi.', details: ['Conferma via email immediata', 'Numero di pratica assegnato', 'Riepilogo completo della richiesta'] },
  { n: '03', title: 'Il team esamina la mia pratica', text: 'Il nostro team analizza la tua richiesta entro 24 ore lavorative. Verifichiamo le informazioni fornite e la tua capacità di rimborso. Se la pratica è completa, ti contattiamo via email o telefono.', details: ['Analisi rapida entro 24h', 'Contatto via email o telefono', 'Nessun documento complesso richiesto'] },
  { n: '04', title: 'Ricevo i fondi sul mio conto', text: 'Se la tua richiesta è accettata, i fondi vengono accreditati sul tuo conto bancario entro 48h. I rimborsi mensili vengono prelevati automaticamente dalla tua carta bancaria.', details: ['Accredito entro 48h', 'Prelievo automatico mensile', 'Nessuna penale per rimborso anticipato'] },
]

export default function CommentCaMarche() {
  return (
    <>
      <PageHero title="Come funziona?" lead="Scopri come ottenere un prestito in 4 semplici passi, dall'invio della richiesta fino all'accredito dei fondi." />

      {steps.map((step, i) => (
        <section key={i} className={`section${i % 2 === 1 ? ' section--alt' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
          <FloatingDecorations />
          <div className="container">
            <motion.div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(24px,4vw,64px)', flexWrap: 'wrap' }} {...fadeUp}>
              <div style={{ flex: '1 1 300px', background: 'var(--blue-bg)', borderRadius: 'var(--radius-xl)', padding: 'clamp(32px,5vw,48px)', textAlign: 'center', fontSize: 'clamp(40px,8vw,64px)', fontWeight: 900, color: 'var(--blue)', lineHeight: 1 }}>{step.n}</div>
              <div style={{ flex: '1 1 300px' }}>
                <div className="section-eyebrow">Passo {i + 1}</div>
                <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, marginBottom: 12, color: 'var(--text)' }}>{step.title}</h2>
                <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>{step.text}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: '16px 0 0' }}>
                  {step.details.map((d, j) => (
                    <li key={j} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 14, color: 'var(--text-2)' }}>
                      <span style={{ color: 'var(--blue)', fontWeight: 700 }}>✓</span> {d}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </div>
        </section>
      ))}

      <CTASection title="Pronto a iniziare?" text="Invia la tua richiesta ora, senza registrazione." cta={{ to: '/emprunter', label: 'Fai richiesta' }} />
    </>
  )
}
