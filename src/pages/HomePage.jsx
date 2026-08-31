import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Target, Zap, GraduationCap, Briefcase, FileText, Users, XCircle, Smartphone, Lock, HeartHandshake, Banknote, Clock, Star, Car, BookOpen, Home as HomeIcon, ClipboardList, Laptop, Wrench, Calendar, RefreshCw, User, Landmark, Building, ShieldCheck, FileSignature, Shield, Check, ArrowRight, CreditCard, Globe, TrendingUp, PiggyBank, Wallet, BarChart3 } from 'lucide-react'
import LoanSimulator from '../components/shared/LoanSimulator'
import AnimatedCounter from '../components/shared/AnimatedCounter'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
const stagger = { whileInView: 'animate', viewport: { once: true, margin: '-40px' }, initial: 'initial', variants: { animate: { transition: { staggerChildren: 0.08 } } } }

const loanTypes = [
  { icon: Target, label: 'Cessione del Quinto', to: '/prets/personnel', desc: 'Da 5 000€ a 75 000€ — Rimborso automatico dalla busta paga', tag: 'Popolare' },
  { icon: Zap, label: 'Prestito di emergenza', to: '/prets/urgence', desc: 'Da 100€ a 50 000€ — Risposta in poche ore', tag: 'Prioritario' },
  { icon: GraduationCap, title: 'Prestito studentesco', to: '/prets/etudiant', desc: 'Da 100€ a 50 000€ — Senza redditi stabili', tag: 'Giovani' },
  { icon: Briefcase, label: 'Prestito professionale', to: '/prets/professionnel', desc: 'Da 1 000€ a 3 000 000€ — Freelance & partite IVA', tag: 'Pro' },
]

const advantages = [
  { icon: FileText, title: 'Nessun giustificativo complesso', text: 'Basta con le pratiche amministrative infinite. Basta un documento d\'identità.' },
  { icon: Users, title: 'Aperto a tutti i profili', text: 'Studenti, freelance, determinato, interinali, RSA, pensionati... Tutti accettati.' },
  { icon: XCircle, title: 'Nessuna registrazione richiesta', text: 'Nessun account da creare. Compila il modulo in 5 minuti.' },
  { icon: Smartphone, title: '100% mobile', text: 'Fai la tua richiesta dal telefono, ovunque tu sia.' },
  { icon: Lock, title: 'Contratto sicuro', text: 'Piattaforma sicura, dati crittografati, contratto elettronico conforme.' },
  { icon: Zap, title: 'Risposta in 24h', text: 'Una risposta rapida e un bonifico entro 48h dopo l\'accettazione.' },
]

const stats = [
  { icon: HeartHandshake, end: 500, suffix: '+', label: 'Prestiti finanziati', desc: 'Dal nostro lancio' },
  { icon: Banknote, end: 150000, suffix: ' €', label: 'Importo totale prestato', desc: 'Distribuito ai mutuatari' },
  { icon: Clock, end: 24, suffix: 'h', label: 'Tempo di risposta', desc: 'Entro 24h lavorative' },
  { icon: Star, end: 4.8, suffix: '/5', label: 'Soddisfazione', desc: 'Voto medio dei clienti' },
]

const useCases = [
  { icon: Car, title: 'Acquisto veicolo', montant: 15000, scenario: 'Marco, 32 anni, ha bisogno di un\'auto per andare al lavoro. Prestito di 15.000€ rimborsabile in 60 mesi.', mensualite: '281,67 €' },
  { icon: BookOpen, title: 'Finanziamento studi', montant: 8000, scenario: 'Luca, 21 anni, studente universitario. Finanziamento delle tasse scolastiche. Prestito di 8.000€ in 36 mesi.', mensualite: '240,24 €' },
  { icon: HomeIcon, title: 'Ristrutturazione casa', montant: 25000, scenario: 'Maria e Paolo, giovani genitori. Ristrutturazione completa della loro casa. Prestito di 25.000€ in 84 mesi.', mensualite: '331,10 €' },
]

const profiles = [
  { icon: GraduationCap, label: 'Studente' }, { icon: Briefcase, label: 'Indeterminato' }, { icon: ClipboardList, label: 'Determinato' },
  { icon: Laptop, label: 'Freelance' }, { icon: Wrench, label: 'Indipendente' }, { icon: Calendar, label: 'Interinale' },
  { icon: HeartHandshake, label: 'RSA' }, { icon: RefreshCw, label: 'Disoccupato' }, { icon: User, label: 'Pensionato' },
  { icon: Landmark, label: 'Non residente' }, { icon: HomeIcon, label: 'Proprietario' }, { icon: Building, label: 'Affittuario' },
]

const faq = [
  { q: 'Come posso richiedere un prestito?', a: 'Compila il modulo online in meno di 5 minuti. Nessuna registrazione richiesta. Riceverai una conferma via email e il nostro team ti contatterà entro 24h.' },
  { q: 'Quali documenti servono?', a: 'Solo un documento d\'identità valido e un estratto conto degli ultimi 3 mesi. Nessun certificato di reddito complesso.' },
  { q: 'Quanto tempo ci vuole per ricevere i fondi?', a: 'Dopo l\'accettazione della tua richiesta, il bonifico viene effettuato entro 48 ore lavorative.' },
  { q: 'Quali profili sono accettati?', a: 'Tutti: indeterminato, determinato, freelance, studenti, pensionati, RSA, disoccupati. Ogni pratica viene valutata individualmente.' },
]

const testimonials = [
  { name: 'Marco R.', detail: 'Impiegato, Roma', avatar: 'M', stars: 5, text: 'Servizio rapido e professionale. Ho ricevuto il prestito in meno di 48h. Consigliato!' },
  { name: 'Laura B.', detail: 'Freelance, Milano', avatar: 'L', stars: 5, text: 'Come freelance era difficile trovare finanziamento. Prestiter mi ha aiutato senza complicazioni.' },
  { name: 'Giovanni T.', detail: 'Pensionato, Napoli', avatar: 'G', stars: 4, text: 'Personale cordiale e competente. Il processo è stato semplice e trasparente.' },
]

export default function HomePage() {
  const { user } = useAuth()
  return (
    <>
      {!user && (
        <div className="floating-auth">
          <Link to="/login" className="floating-auth-link">Accedi</Link>
          <span className="floating-auth-sep" />
          <Link to="/register" className="floating-auth-link accent">Registrati</Link>
        </div>
      )}
      {/* ─── HERO ─── */}
      <section className="hero" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="hero-bg" style={{ background: 'linear-gradient(135deg, #0056B3, #003d7a)' }} />
        <div className="hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ flex: '1 1 min(100%, 400px)' }}>
            <div className="hero-badges">
              {['Risposta 24h', 'Bonifico 48h', '100% sicuro', 'Senza registrazione'].map(b => (
                <span key={b} className="hero-badge">
                  <Check size={14} />
                  {b}
                </span>
              ))}
            </div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            >Il tuo alleato finanziario<br />dal <span className="shimmer-text">1998</span></motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >Prestiter S.p.A. accomagna dipendenti e pensionati nei loro progetti di vita con soluzioni di credito su misura, con la solidità del Gruppo Intesa Sanpaolo.</motion.p>
            <motion.div className="hero-actions"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link to="/emprunter" className="btn btn-primary">Fai richiesta</Link>
              <Link to="/comment-ca-marche" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>Scopri di più</Link>
            </motion.div>
          </motion.div>
          <motion.div className="hero-simulator" initial={{ opacity: 0, x: 30, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <LoanSimulator />
          </motion.div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="section" style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {[
              { val: '27+', lab: 'Anni di esperienza' },
              { val: '10 000+', lab: 'Recensioni 5 stelle' },
              { val: '155', lab: 'Dipendenti' },
              { val: '14,7 M€', lab: 'Fatturato 2024' },
            ].map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--blue)', marginBottom: 4 }}>{s.val}</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '.05em' }}>{s.lab}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PROCESSUS ─── */}
      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Processo</div>
            <h2 className="section-header">Come funziona?</h2>
            <p className="section-sub">Ottieni il tuo prestito in 4 semplici passaggi, senza spostarti e senza carta.</p>
          </motion.div>
          <motion.div className="how-it-works" {...stagger}>
            {[
              { n: '1', title: 'Compilo il modulo', text: 'Meno di 5 minuti, senza registrazione. Importo, durata e informazioni personali.' },
              { n: '2', title: 'Ricevo una conferma', text: 'Una email di conferma con il tuo numero di pratica unico ti viene inviata immediatamente.' },
              { n: '3', title: 'Il team esamina la mia pratica', text: 'Analisi rapida della tua richiesta. Ti contattiamo via email o telefono entro 24h.' },
              { n: '4', title: 'Ricevo i fondi', text: 'Bonifico sul tuo conto bancario entro 48h se la richiesta è accettata.' },
            ].map((s, i) => (
              <motion.div key={i} className="step-card tilt-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <motion.div className="step-number" whileHover={{ scale: 1.15, rotate: [0, -5, 5, 0] }} transition={{ duration: 0.4 }}>{s.n}</motion.div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TON COMPTE PRESTITER ─── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Tuo conto</div>
            <h2 className="section-header">Il tuo conto personale Prestiter</h2>
            <p className="section-sub">Crea il tuo account gratuito, ricevi i fondi direttamente sul tuo conto Prestiter e gestisci tutto online.</p>
          </motion.div>
          <motion.div className="account-benefits" {...stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20, maxWidth: 900, margin: '0 auto' }}>
            {[
              { icon: User, title: 'Iscriviti in 2 minuti', text: 'Crea il tuo account con email e password. Nessun documento richiesto per iniziare.' },
              { icon: Wallet, title: 'Ricevi i fondi sul tuo conto', text: 'Una volta approvato, il prestito viene accreditato direttamente sul tuo conto Prestiter.' },
              { icon: BarChart3, title: 'Gestisci tutto online', text: 'Visualizza saldo, transazioni, IBAN e carte dal tuo pannello personale, 24 ore su 24.' },
            ].map((b, i) => {
              const Icon = b.icon
              return (
                <motion.div key={i} className="card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,86,179,0.1)' }} style={{ textAlign: 'center', padding: '32px 24px' }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                    <Icon size={22} style={{ color: 'var(--blue)' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 8 }}>{b.title}</h3>
                  <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>{b.text}</p>
                </motion.div>
              )
            })}
          </motion.div>
          <motion.div className="text-center mt-4" {...fadeUp}>
            <Link to="/register" className="btn btn-primary">Crea il tuo conto gratuito</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── TYPES DE PRÊTS ─── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Offerte</div>
            <h2 className="section-header">Le nostre soluzioni di prestito</h2>
            <p className="section-sub">Soluzioni di finanziamento adatte a ogni situazione. TAEG fisso del 4,5% in ogni caso.</p>
          </motion.div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
            {loanTypes.map((l, i) => {
              const Icon = l.icon
              return (
                <motion.div key={i} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <Link to={l.to} className="advantage-card tilt-card d-block h-100" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column' }}>
                    {l.tag && <span className="badge" style={{ position: 'absolute', top: 12, right: 12, fontSize: 10 }}>{l.tag}</span>}
                    <div className="advantage-icon"><Icon size={22} /></div>
                    <h3>{l.label}</h3>
                    <p style={{ flex: 1 }}>{l.desc}</p>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--blue)', marginTop: 8 }}>Vedi l'offerta →</span>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
          <motion.div className="text-center mt-5" {...fadeUp}>
            <Link to="/profils-acceptes" className="btn btn-ghost">Vedi tutte le offerte (8 tipi)</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── AVANTAGES ─── */}
      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Vantaggi</div>
            <h2 className="section-header">Perché scegliere Prestiter?</h2>
            <p className="section-sub">Una soluzione di finanziamento semplice, accessibile e trasparente, senza costi nascosti.</p>
          </motion.div>
          <motion.div className="advantage-grid" {...stagger}>
            {advantages.map((a, i) => {
              const Icon = a.icon
              return (
                <motion.div key={i} className="advantage-card tilt-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <motion.div className="advantage-icon" whileHover={{ rotate: [0, -10, 10, -5, 0], scale: 1.15 }} transition={{ duration: 0.3 }}><Icon size={22} /></motion.div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── EXEMPLES CONCRETS ─── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Casi concreti</div>
            <h2 className="section-header">Situazioni reali, soluzioni semplici</h2>
            <p className="section-sub">Scopri come Prestiter ha aiutato centinaia di persone nella vita quotidiana.</p>
          </motion.div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} variants={{ animate: { transition: { staggerChildren: 0.1 } } }}>
            {useCases.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div key={i} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                  <div className="advantage-card tilt-card h-100">
                    <div className="advantage-icon"><Icon size={22} /></div>
                    <h3>{c.title}</h3>
                    <p style={{ fontSize: 13, marginBottom: 12 }}>{c.scenario}</p>
                    <div style={{ borderTop: '1px solid var(--border)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 12, color: 'var(--text-3)' }}>Mensilità</span>
                      <span style={{ fontSize: 18, fontWeight: 900, color: 'var(--blue)' }}>{c.mensualite}</span>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── PROFILS ─── */}
      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Accessibilità</div>
            <h2 className="section-header">Tutti i profili sono accettati</h2>
            <p className="section-sub">Indeterminato, determinato, studente, freelance, RSA, pensionato, disoccupato... Non discriminiamo.</p>
          </motion.div>
          <motion.div className="profile-chips" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ staggerChildren: 0.04 }}>
            {profiles.map((p, i) => {
              const Icon = p.icon
              return (
                <motion.span key={i} className="profile-chip" variants={{ initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 } }} whileHover={{ scale: 1.05, y: -2 }}>
                  <motion.span className="profile-chip-icon" whileHover={{ rotate: 360 }} transition={{ duration: 0.5 }}><Icon size={14} /></motion.span>
                  {p.label}
                </motion.span>
              )
            })}
          </motion.div>
          <motion.div className="text-center mt-4" {...fadeUp}>
            <p className="small text-muted" style={{ maxWidth: 500, margin: '0 auto 16px' }}>Nessuna discriminazione basata su età, situazione lavorativa o nazionalità. Ogni pratica viene valutata individualmente.</p>
            <Link to="/profils-acceptes" className="btn btn-ghost">Vedi i requisiti di idoneità</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section className="section section--blue" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Testimonianze</div>
            <h2 className="section-header">Ci hanno dato fiducia</h2>
            <p className="section-sub" style={{ color: 'var(--text-2)' }}>Voto medio: 4.8/5 — Basato su oltre 10 000 recensioni verificate.</p>
          </motion.div>
          <motion.div className="testimonials" {...stagger}>
            {testimonials.map((t, i) => (
              <motion.div key={i} className="testimonial-card tilt-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <motion.div className="testimonial-stars" whileHover={{ scale: 1.1 }}>{'★'.repeat(t.stars)}{'☆'.repeat(5 - t.stars)}</motion.div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <motion.div className="testimonial-avatar" whileHover={{ scale: 1.15, rotate: 5 }}>{t.avatar}</motion.div>
                  <div><div className="testimonial-name">{t.name}</div><div className="testimonial-detail">{t.detail}</div></div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── STATS ─── */}
      <section className="section section--dark" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow" style={{ color: 'rgba(255,255,255,0.5)', borderColor: 'rgba(255,255,255,0.3)' }}>Numeri</div>
            <h2 className="section-header">Prestiter in numeri</h2>
            <p className="section-sub" style={{ color: 'rgba(255,255,255,0.6)' }}>Il nostro impatto in numeri chiave.</p>
          </motion.div>
          <motion.div className="stats-grid" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            {stats.map((s, i) => {
              const Icon = s.icon
              return (
                <motion.div key={i} className="stat-card"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  whileHover={{ y: -6, scale: 1.02 }}
                >
                  <div className="stat-card-icon"><Icon size={28} /></div>
                  <div className="stat-card-value"><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                  <div className="stat-card-label">{s.label}</div>
                  <div className="stat-card-desc">{s.desc}</div>
                </motion.div>
              )
            })}
          </motion.div>
          <motion.div className="features-row" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            {[
              { val: '4,5 %', lab: 'TAEG fisso', desc: 'Qualunque sia l\'importo' },
              { val: '100 %', lab: '100% online', desc: 'Dal modulo al bonifico' },
              { val: '0 €', lab: 'Spese di pratica', desc: 'Nessun costo nascosto' },
              { val: '48 h', lab: 'Bonifico', desc: 'Dopo accettazione' },
            ].map((s, i) => (
              <motion.div key={i} className="features-row-item" initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <div className="features-row-val">{s.val}</div>
                <div className="features-row-lab">{s.lab}</div>
                <div className="features-row-desc">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── FAQ (EXTRAIT) ─── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-header">Domande frequenti</h2>
            <p className="section-sub">Le risposte alle domande più comuni sui nostri prestiti.</p>
          </motion.div>
          <motion.div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }} {...fadeUp}>
            {faq.map((item, i) => <FaqItem key={i} q={item.q} r={item.a} />)}
          </motion.div>
          <motion.div className="text-center mt-4" {...fadeUp}>
            <Link to="/faq" className="btn btn-ghost">Vedi tutte le domande</Link>
          </motion.div>
        </div>
      </section>

      {/* ─── CTA FINAL ─── */}
      <section className="section section--alt" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="cta-card"
            initial={{ opacity: 0, y: 30, scale: 0.98 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            whileHover={{ scale: 1.01 }}
          >
            <h2>Pronto a fare richiesta?</h2>
            <p>Unisciti alle centinaia di mutuatari che ci hanno dato fiducia. Risposta in 24h, bonifico in 48h.</p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link to="/emprunter" className="btn btn-primary">Richiedi ora</Link>
              <Link to="/comment-ca-marche" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>Come funziona</Link>
            </div>
          </motion.div>
          <motion.div className="text-center mt-4" {...fadeUp}>
            <p className="small text-muted" style={{ fontSize: 11 }}>Un credito ti impegna e deve essere rimborsato. Verifica la tua capacità di rimborso prima di impegnarti. TAEG fisso 4,5%. Prestiter S.p.A. — Via Corsica, 57 — 86039 Termoli (CB). OAM n. A3056.</p>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function FaqItem({ q, r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ flexShrink: 0, transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.3s' }}>
        <p className="faq-answer">{r}</p>
      </div>
    </div>
  )
}
