import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Target, Zap, GraduationCap, Briefcase, Home as HomeIcon, RefreshCw, Heart, HeartHandshake } from 'lucide-react'
import PageHero from '../../components/shared/PageHero'
import FloatingDecorations from '../../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const otherTypes = [
  { to: '/prets/personnel', label: 'Personale', icon: Target },
  { to: '/prets/urgence', label: 'Emergenza', icon: Zap },
  { to: '/prets/etudiant', label: 'Studentesco', icon: GraduationCap },
  { to: '/prets/professionnel', label: 'Professionale', icon: Briefcase },
  { to: '/prets/travaux', label: 'Lavori', icon: HomeIcon },
  { to: '/prets/consolidation', label: 'Consolidamento', icon: RefreshCw },
  { to: '/prets/ptz', label: 'PTZ 0%', icon: Heart },
  { to: '/prets/p2p', label: 'P2P', icon: HeartHandshake },
]

export default function PretTypeLayout({ data }) {
  const [montant, setMontant] = useState(data.minMontant || 1000)
  const [duree, setDuree] = useState(data.minDuree || 3)
  const taux = data.tauxZero ? 0 : 4.5
  const interets = montant * (taux / 100) / 12 * duree
  const mensualite = (montant + interets) / duree

  return (
    <>
      <PageHero title={data.title} lead={data.hero}>
        {data.badge && <span className="badge" style={{ marginTop: 12, fontSize: 12, padding: '6px 16px' }}>{data.badge}</span>}
      </PageHero>

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="row g-5 align-items-center" initial="initial" animate="animate" variants={{ animate: { transition: { staggerChildren: 0.12 } } }}>
            <motion.div className="col-lg-6" variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="section-eyebrow">{data.eyebrow || 'Prestito adatto'}</div>
              <h2 className="section-header" style={{ textAlign: 'left' }}>{data.subtitle}</h2>
              <p className="lead">{data.description}</p>
              <div className="d-flex gap-3 flex-wrap mt-4 mb-3">
                {data.cibles?.map((c, i) => <span key={i} className="profile-chip" style={{ fontSize: 12 }}>{c}</span>)}
              </div>
              <div className="d-flex gap-2 flex-wrap mt-3">
                <Link to={`/emprunter?type=${data.path.replace('/prets/', '')}`} className="btn btn-primary">Fai richiesta</Link>
                <Link to="/comment-ca-marche" className="btn btn-ghost">Come funziona</Link>
              </div>
            </motion.div>
            <motion.div className="col-lg-6" variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="simulator-card" style={{ margin: 0 }}>
                <h3 className="simulator-title">Simula il tuo prestito</h3>
                {data.badge === 'Urgence' && (
                  <div style={{ background: 'rgba(200,16,46,0.06)', border: '1px solid rgba(200,16,46,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 13, color: '#C8102E', fontWeight: 600 }}>
                    Elaborazione prioritaria — risposta in poche ore
                  </div>
                )}
                {taux === 0 && (
                  <div style={{ background: 'var(--green-bg)', border: '1px solid rgba(29,158,117,0.2)', borderRadius: 'var(--radius)', padding: '12px 16px', marginBottom: 16, fontSize: 13, color: 'var(--green)', fontWeight: 600 }}>
                    Prestito solidale a tasso zero — rimborsi solo il capitale
                  </div>
                )}
                <label className="simulator-label">Importo : <strong>{montant} €</strong></label>
                <input type="range" min={data.minMontant} max={data.maxMontant} step={1000} value={montant} onChange={e => setMontant(Number(e.target.value))} className="simulator-range" />
                <input type="number" className="form-control" min={data.minMontant} max={data.maxMontant} value={montant}
                  onChange={e => {
                    const v = Number(e.target.value)
                    if (!isNaN(v) && v >= data.minMontant && v <= data.maxMontant) setMontant(v)
                  }}
                  style={{ marginTop: 4, marginBottom: 8, textAlign: 'center', fontWeight: 700 }} />
                <label className="simulator-label">Durata : <strong>{duree} mesi</strong></label>
                <input type="range" min={data.minDuree} max={data.maxDuree} step={1} value={duree} onChange={e => setDuree(Number(e.target.value))} className="simulator-range" />
                <div className="simulator-result" style={{ gridTemplateColumns: '1fr 1fr', gap: 12, padding: 16, margin: '16px 0 0' }}>
                  <div><div className="label">Mensilità</div><div className="value">{mensualite.toFixed(2)} €</div></div>
                  <div><div className="label">Totale da rimborsare</div><div className="value">{(montant + interets).toFixed(2)} €</div></div>
                  <div><div className="label">Di cui interessi</div><div className="value" style={taux === 0 ? { color: 'var(--green)' } : {}}>{interets.toFixed(2)} €</div></div>
                  <div><div className="label">TAEG</div><div className="value" style={taux === 0 ? { color: 'var(--green)' } : {}}>{taux === 0 ? '0 %' : '4,5 %'}</div></div>
                </div>
                {taux > 0 && (
                  <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '8px 0 0', textAlign: 'center', lineHeight: 1.5 }}>
                    TAEG fisso del 4,5% — Nessuna spesa di istruttoria. Esempio: per {montant}€ su {duree} mesi, rimborsi {(montant + interets).toFixed(2)}€ con mensilità di {mensualite.toFixed(2)}€. Costo totale: {interets.toFixed(2)}€ di interessi.
                  </p>
                )}
                <Link to={`/emprunter?type=${data.path.replace('/prets/', '')}`} className="btn btn-primary w-100" style={{ marginTop: 16, justifyContent: 'center' }}>Fai richiesta</Link>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <h2 className="section-header">Perché scegliere questo prestito?</h2>
          </motion.div>
          <motion.div className="row g-4" initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            {data.avantages.map((a, i) => (
              <motion.div key={i} className="col-md-4" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <div className="advantage-card tilt-card h-100">
                  <div className="advantage-icon"><a.icon size={22} /></div>
                  <h3>{a.title}</h3>
                  <p>{a.text}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {data.exemple && (
        <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
          <FloatingDecorations />
          <div className="container">
            <motion.div className="section-title" {...fadeUp}>
              <div className="section-eyebrow">Esempio concreto</div>
              <h2 className="section-header">Un caso d'uso reale</h2>
            </motion.div>
            <motion.div className="row g-4 align-items-center" {...fadeUp}>
              <div className="col-md-6">
                <div style={{ background: 'var(--blue-bg)', borderRadius: 'var(--radius-lg)', padding: 'clamp(24px,4vw,40px)', textAlign: 'center' }}>
                  <div style={{ marginBottom: 8, display: 'flex', justifyContent: 'center' }}><data.exemple.icon size={48} /></div>
                  <h3 style={{ fontSize: 18, fontWeight: 800 }}>{data.exemple.title}</h3>
                </div>
              </div>
              <div className="col-md-6">
                <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 16 }}>{data.exemple.scenario}</p>
                <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-3)' }}>Mensilità</span>
                  <span style={{ fontSize: 20, fontWeight: 900, color: 'var(--blue)' }}>{data.exemple.mensualite}</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
      )}

      <section className="section section--alt">
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Condizioni</div>
            <h2 className="section-header">Condizioni e documenti richiesti</h2>
          </motion.div>
          <div className="row g-4" style={{ maxWidth: 800, margin: '0 auto' }}>
            <div className="col-md-6">
              <motion.div {...fadeUp}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--blue)' }}>Condizioni</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {data.conditions.map((c, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14 }}>
                      <div style={{ fontWeight: 800, fontSize: 13, marginBottom: 2 }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>{c.text}</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
            <div className="col-md-6">
              <motion.div {...fadeUp} transition={{ delay: 0.1 }}>
                <h3 style={{ fontSize: 14, fontWeight: 800, marginBottom: 12, color: 'var(--blue)' }}>Documenti da fornire</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {(data.documents || ['Documento d\'identità (carta d\'identità o passaporto)', 'IBAN / RIB', 'Carta bancaria per i prelievi']).map((d, i) => (
                    <div key={i} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 14, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>✓</span>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{d.doc || d}</div>
                        {d.desc && <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>{d.desc}</div>}
                      </div>
                    </div>
                  ))}
                </div>
                <p style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 12, lineHeight: 1.5 }}>
                  Tutto online, nessun documento cartaceo da inviare.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Confronta</div>
            <h2 className="section-header">Scopri gli altri nostri prestiti</h2>
          </motion.div>
          <motion.div className="row g-3" initial="initial" whileInView="animate" viewport={{ once: true }} variants={{ animate: { transition: { staggerChildren: 0.04 } } }}>
            {otherTypes.filter(t => t.to !== data.path).map((t, i) => (
              <motion.div key={i} className="col-6 col-md-3" variants={{ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } }}>
                <Link to={t.to} className="advantage-card tilt-card d-block h-100" style={{ padding: 16, textDecoration: 'none', color: 'inherit' }}>
                  <div style={{ marginBottom: 4 }}><t.icon size={20} /></div>
                  <div style={{ fontWeight: 700, fontSize: 12 }}>{t.label}</div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section section--blue">
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <h2 className="section-header">Domande frequenti</h2>
          </motion.div>
          <motion.div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }} {...fadeUp}>
            {data.faq.map((item, i) => <FaqItem key={i} q={item.q} r={item.r} />)}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <motion.div className="text-center" {...fadeUp}>
            <h2 className="section-header" style={{ fontSize: 22 }}>Pronto a fare richiesta?</h2>
            <p className="lead" style={{ fontSize: 15, color: 'var(--text-2)', marginBottom: 24, maxWidth: 500, marginLeft: 'auto', marginRight: 'auto' }}>Risposta entro 24h. Bonifico entro 48h se accettato.</p>
            <Link to={`/emprunter?type=${data.path.replace('/prets/', '')}`} className="btn btn-primary btn-lg">Fai richiesta</Link>
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
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.3s' }}>
        <p className="faq-answer">{r}</p>
      </div>
    </div>
  )
}
