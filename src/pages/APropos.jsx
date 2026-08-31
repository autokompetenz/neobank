import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { HeartHandshake, Banknote, Clock, Star, Search, Zap, Lock, Leaf, Smartphone } from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import AnimatedCounter from '../components/shared/AnimatedCounter'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const stats = [
  { icon: HeartHandshake, end: 500, suffix: '+', label: 'Prestiti finanziati', desc: 'Dal nostro lancio' },
  { icon: Banknote, end: 150000, suffix: ' €', label: 'Importo totale erogato', desc: 'Distribuito ai mutuatari' },
  { icon: Clock, end: 24, suffix: 'h', label: 'Tempo di risposta', desc: 'Entro 24 ore lavorative' },
  { icon: Star, end: 4.8, suffix: '/5', label: 'Soddisfazione', desc: 'Voto medio dei clienti' },
]

const values = [
  { icon: HeartHandshake, title: 'Accessibilità', text: 'Apriamo il credito a chi le banche ignorano, senza discriminazione di stato o situazione.' },
  { icon: Search, title: 'Trasparenza', text: 'Nessun costo nascosto, condizioni chiare fin dall\'inizio, un TAEG fisso dichiarato.' },
  { icon: Zap, title: 'Rapidità', text: 'Risposta entro 24h e accredito entro 48h. Niente attese bancarie interminabili.' },
  { icon: Lock, title: 'Sicurezza', text: 'Piattaforma crittografata, conformità GDPR, registrazione OAM e contratto elettronico.' },
  { icon: Leaf, title: 'Solidarietà', text: 'Il nostro impegno verso i più fragili, con soluzioni di finanziamento accessibili.' },
  { icon: Smartphone, title: 'Semplicità', text: '100% online, senza registrazione, senza carta. Un modulo di 5 minuti basta.' },
]

const timeline = [
  { year: '1998', text: 'Fondazione di Prestiter da parte di un gruppo di imprenditori a Termoli.' },
  { year: '2010', text: 'Prestitalia si integra in UBI Banca, poi nel Gruppo Intesa Sanpaolo.' },
  { year: '2024', text: 'Certificazione Great Place to Work® e Best Workplaces™ Italia.' },
  { year: 'Oggi', text: '+10 000 recensioni a 5 stelle, 27 uffici in Italia, 155 dipendenti.' },
]

export default function APropos() {
  return (
    <>
      <PageHero title="Chi siamo" lead="Prestiter S.p.A. — Il tuo alleato finanziario dal 1998. Top Partner Prestitalia, Gruppo Intesa Sanpaolo." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 48, alignItems: 'center' }} initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="section-eyebrow">La nostra storia</div>
              <h2 style={{ fontSize: 'clamp(24px,3vw,36px)', fontWeight: 900, marginBottom: 16, color: 'var(--text)', textAlign: 'left' }}>27 anni al servizio delle persone</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>La nostra storia inizia nel <strong style={{ color: 'var(--text)' }}>1998</strong>, quando un gruppo di imprenditori ha deciso di combinare le loro competenze in finanza e credito per creare una realtà nuova.</p>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 12 }}>Da allora, <strong style={{ color: 'var(--text)' }}>Prestiter S.p.A.</strong> è diventata il <strong style={{ color: 'var(--blue)' }}>Top Partner Prestitalia</strong>, società del Gruppo Intesa Sanpaolo, la più grande banca d'Italia.</p>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7 }}>Oggi, con <strong style={{ color: 'var(--text)' }}>27 uffici</strong> in tutta Italia e oltre <strong style={{ color: 'var(--text)' }}>155 dipendenti</strong>, continuiamo a mettere le persone al centro di tutto.</p>
              <Link to="/emprunter" className="btn btn-primary" style={{ marginTop: 20 }}>Fai richiesta</Link>
            </motion.div>
            <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div style={{ background: 'var(--blue-bg)', borderRadius: 'var(--radius-xl)', padding: 'clamp(28px,4vw,48px)', textAlign: 'center' }}>
                <div style={{ width: 64, height: 64, borderRadius: 16, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 28, margin: '0 auto 16px' }}>P</div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)', marginBottom: 4 }}>Prestiter S.p.A.</div>
                <div style={{ fontSize: 13, color: 'var(--text-2)' }}>Top Partner Prestitalia</div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Gruppo Intesa Sanpaolo</div>
                <div style={{ width: 40, height: 2, background: 'var(--blue)', margin: '16px auto' }} />
                <div style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>Via Corsica, 57 — 86039 Termoli (CB)<br />P.IVA 01542900707 — OAM n. A3056</div>
              </div>
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 12 }}>
                {timeline.map((t, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 12, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--blue)' }}>{t.year.length <= 4 ? t.year : 'Oggi'}</span>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--blue)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 2 }}>{t.year}</div>
                      <div style={{ fontSize: 13, color: 'var(--text-2)' }}>{t.text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section section--blue" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Numeri</div>
            <h2 className="section-header">Prestiter in numeri</h2>
            <p className="section-sub">Il nostro impatto dalla nostra creazione.</p>
          </motion.div>
          <motion.div className="stats-grid" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            {stats.map((s, i) => (
              <motion.div key={i} className="stat-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                whileHover={{ y: -6, scale: 1.02 }}
              >
                <div className="stat-card-icon"><s.icon size={24} /></div>
                <div className="stat-card-value"><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-desc">{s.desc}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Valori</div>
            <h2 className="section-header">Cosa ci anima</h2>
          </motion.div>
          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            {values.map((v, i) => (
              <motion.div key={i} className="advantage-card tilt-card h-100" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
                <div className="advantage-icon"><v.icon size={22} /></div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <CTASection title="Unisciti a noi" text="Che tu sia mutuatario o investitore, fai parte dell'avventura Prestiter." cta={{ to: '/contact', label: 'Contattaci' }} />
    </>
  )
}
