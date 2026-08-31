import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'
import { Banknote, BarChart3, Shield, TrendingDown, TrendingUp, Gem, HeartHandshake, Lock, Smartphone, RefreshCw, Shuffle, CheckCircle } from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
const stagger = { whileInView: 'animate', viewport: { once: true, margin: '-40px' }, initial: 'initial', variants: { animate: { transition: { staggerChildren: 0.1 } } } }

export default function Preter() {
  const [invest, setInvest] = useState(5000)
  const [duree, setDuree] = useState(12)
  const rendement = 0.03
  const interetsAnnuel = invest * rendement
  const totalRembourse = invest + interetsAnnuel * (duree / 12)
  const mensualite = totalRembourse / duree

  return (
    <>
      <PageHero title="Investire" lead="Fai fruttare i tuoi risparmi finanziando progetti quotidiani. Un'alternativa agli investimenti tradizionali." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 48, alignItems: 'center' }} initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="section-eyebrow">Investimento</div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, marginBottom: 16, color: 'var(--text)' }}>Un nuovo modo di investire</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>Il prestito tra privati ti permette di generare un rendimento interessante aiutando persone in difficoltà. Ogni pratica è rigorosamente selezionata dal nostro team.</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {['Rendimento annuo fino al 3%', 'Pratiche selezionate dai nostri esperti', 'Monitoraggio personalizzato dal team Prestiter', 'Possibilità di diversificare su più prestiti'].map((c, i) => (
                  <li key={i} style={{ display: 'flex', gap: 10, padding: '6px 0', fontSize: 14, color: 'var(--text-2)' }}><span style={{ color: 'var(--blue)', fontWeight: 700 }}>✓</span> {c}</li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="simulator-card" style={{ margin: 0 }}>
                <h3>Simula il tuo investimento</h3>
                <div className="simulator-group">
                  <div className="simulator-label"><span>Importo investito</span><strong>{invest.toLocaleString('fr-FR')} €</strong></div>
                  <input type="range" className="simulator-range" min={1000} max={2000000} step={1000} value={invest} onChange={e => setInvest(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}><span>1 000 €</span><span>2 000 000 €</span></div>
                </div>
                <div className="simulator-group">
                  <div className="simulator-label"><span>Durata</span><strong>{duree} mesi</strong></div>
                  <input type="range" className="simulator-range" min={6} max={60} step={6} value={duree} onChange={e => setDuree(Number(e.target.value))} />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-3)', marginTop: 4 }}><span>6 mesi</span><span>60 mesi</span></div>
                </div>
                <div className="simulator-result" style={{ gap: 12, padding: 16, margin: '16px 0 0' }}>
                  <div><div className="label">Rendimento annuale</div><div className="value">{interetsAnnuel.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div></div>
                  <div><div className="label">Mensilità ricevuta</div><div className="value">{mensualite.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div></div>
                  <div><div className="label">Totale rimborsato</div><div className="value">{totalRembourse.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div></div>
                  <div><div className="label">Di cui interessi</div><div className="value" style={{ color: 'var(--green)' }}>+{interetsAnnuel.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</div></div>
                </div>
                <p className="simulator-note">Simulazione basata su un rendimento annuo del 3%. Le performance passate non sono indicative di quelle future.</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section section--alt" id="fonctionnement" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Funzionamento</div>
            <h2 className="section-header">Come funziona per l'investitore?</h2>
          </motion.div>
          <motion.div className="how-it-works" {...stagger}>
            {[
              { n: '1', title: 'Compila il modulo', text: "Indica l'importo che desideri investire." },
              { n: '2', title: 'Il team ti contatta', text: 'Entro 24h per validare il tuo profilo e le tue intenzioni.' },
              { n: '3', title: 'Scegli le pratiche', text: 'Seleziona i mutuatari da finanziare secondo i tuoi criteri.' },
              { n: '4', title: 'Ricevi i rimborsi', text: 'Automaticamente ogni mese sul tuo conto bancario.' },
            ].map((s, i) => (
              <motion.div key={i} className="step-card tilt-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <div className="step-number">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Informazioni chiave</div>
            <h2 className="section-header">Cosa sapere prima di investire</h2>
            <p className="section-sub">Trasparenza totale su condizioni, fiscalità e rischi.</p>
          </motion.div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }} {...stagger}>
            {[
              { icon: Banknote, title: 'Importo minimo', text: "Investi da 1.000 €, senza tetto massimo. Diversifica i tuoi investimenti su più mutuatari per ridurre i rischi." },
              { icon: Banknote, title: "Spese per l'investitore", text: "Prestiter trattiene una commissione del 2% sugli interessi percepiti. Nessun costo nascosto, nessuna spesa di pratica." },
              { icon: BarChart3, title: 'Fiscalità', text: "Gli interessi percepiti sono soggetti a tassazione secondo la normativa fiscale italiana." },
              { icon: Shield, title: 'Garanzie', text: "Ogni prestito è garantito da un contratto elettronico firmato da entrambe le parti." },
              { icon: TrendingDown, title: 'Tasso di default storico', text: "Il nostro tasso di default è inferiore al 2% su tutti i prestiti effettuati." },
              { icon: Shuffle, title: 'Diversificazione consigliata', text: "Raccomandiamo di distribuire il tuo investimento su almeno 5-10 prestiti diversi." },
            ].map((c, i) => {
              const Icon = c.icon
              return (
              <motion.div key={i} className="advantage-card tilt-card h-100" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <div className="advantage-icon"><Icon size={22} /></div>
                <h3>{c.title}</h3>
                <p>{c.text}</p>
              </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="section section--blue" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Avvertenza</div>
            <h2 className="section-header">Informazione importante</h2>
          </motion.div>
          <motion.div style={{ maxWidth: 700, margin: '0 auto', background: 'var(--bg-card)', border: '1px solid var(--blue-border)', borderRadius: 'var(--radius-lg)', padding: 28, fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7 }} {...fadeUp}>
            Le richieste di prestito sono rigorosamente selezionate dalla piattaforma ma il rischio zero non esiste. Ti raccomandiamo di diversificare i tuoi investimenti su più prestiti. Un prestito tra privati comporta rischi di perdita di capitale. Prestiter SPA non garantisce il rimborso dei prestiti in caso di inadempienza del mutuatario.
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Contatto</div>
            <h2 className="section-header">Diventa investitore</h2>
            <p className="section-sub">Lasciaci i tuoi contatti, il nostro team ti ricontatterà entro 24h per guidarti.</p>
          </motion.div>
          <motion.div style={{ maxWidth: 500, margin: '0 auto' }} {...fadeUp}>
            <LenderForm />
          </motion.div>
        </div>
      </section>

      <CTASection title="Domande sull'investimento?" text="Consulta la nostra FAQ o contattaci direttamente." cta={{ to: '/faq', label: 'Consulta la FAQ' }} />
    </>
  )
}

function LenderForm() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ nom: '', prenom: '', email: '', telephone: '', montant: '1 000 €', message: '' })

  if (sent) {
    return (
      <div className="form-wrapper" style={{ textAlign: 'center' }}>
        <div style={{ marginBottom: 12 }}><CheckCircle size={32} color="var(--green)" /></div>
        <h3>Grazie per il tuo interesse!</h3>
        <p className="text-muted small">Una email di conferma ti è stata inviata. Il nostro team ti contatterà entro 24h.</p>
      </div>
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.nom || !form.prenom || !form.email) return
    setSending(true)
    setError('')
    try {
      await fetch('/api/investor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      setSent(true)
    } catch {
      setError('Si è verificato un errore. Riprova.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="form-wrapper">
      <h3>Modulo investitore</h3>
      <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group"><label>Cognome</label><input className="form-control" placeholder="Rossi" value={form.nom} onChange={e => setForm(f => ({ ...f, nom: e.target.value }))} /></div>
          <div className="form-group"><label>Nome</label><input className="form-control" placeholder="Mario" value={form.prenom} onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))} /></div>
        </div>
        <div className="form-row">
          <div className="form-group"><label>Email</label><input type="email" className="form-control" placeholder="mario@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className="form-group"><label>Telefono</label><input type="tel" className="form-control" placeholder="+39 123 456 7890" value={form.telephone} onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))} /></div>
        </div>
        <div className="form-group"><label>Importo che desideri investire</label><select className="form-control" value={form.montant} onChange={e => setForm(f => ({ ...f, montant: e.target.value }))}><option>1 000 €</option><option>2 000 €</option><option>3 000 €</option><option>5 000 €</option><option>10 000 €</option><option>15 000 €</option><option>20 000 €</option><option>Altro</option></select></div>
        <div className="form-group"><label>Messaggio (facoltativo)</label><textarea className="form-control" placeholder="Eventuali domande..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} /></div>
        <button type="submit" className="btn btn-primary" style={{ justifyContent: 'center' }} disabled={sending}>{sending ? 'Invio in corso...' : 'Invia la mia richiesta'}</button>
        {error && <p style={{ fontSize: 13, color: '#C8102E', textAlign: 'center', margin: 0 }}>{error}</p>}
      </form>
      <p className="small text-muted" style={{ margin: '12px 0 0', fontSize: 11, lineHeight: 1.5 }}>
        Inviando questo modulo, accetti di essere contattato da Prestiter SPA riguardo alle tue opportunità di investimento.
      </p>
    </div>
  )
}
