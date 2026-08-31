import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import PageHero from '../components/shared/PageHero'
import LoanSimulator from '../components/shared/LoanSimulator'
import FloatingDecorations from '../components/shared/FloatingDecorations'
import { CreditCard, Landmark, FileText } from 'lucide-react'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const loanTypeNames = {
  personnel: 'Prestito personale', urgence: 'Prestito d\'emergenza', etudiant: 'Prestito studentesco',
  professionnel: 'Prestito professionale', travaux: 'Prestito lavori',
  consolidation: 'Prestito di consolidamento', ptz: 'PTZ Solidale (0%)', p2p: 'Prestito P2P',
}

export default function Emprunter() {
  const { search } = useLocation()
  const preselectedType = new URLSearchParams(search).get('type')

  const docIcons = [CreditCard, Landmark, CreditCard]

  return (
    <>
      <PageHero title="Richiedere" lead="Fai la tua richiesta di prestito in pochi minuti. Semplice, veloce, senza registrazione.">
        {preselectedType && loanTypeNames[preselectedType] && (
          <span className="badge" style={{ marginTop: 12, fontSize: 12, padding: '6px 16px' }}>
            {loanTypeNames[preselectedType]}
          </span>
        )}
      </PageHero>

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))', gap: 40, alignItems: 'flex-start' }}>
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="section-eyebrow">Simulatore</div>
              <h2 style={{ fontSize: 'clamp(26px,3vw,36px)', fontWeight: 900, marginBottom: 12, color: 'var(--text)' }}>Calcola la tua mensilità</h2>
              <p style={{ color: 'var(--text-2)', lineHeight: 1.7, marginBottom: 20 }}>Usa il nostro simulatore per stimare la tua mensilità e il costo totale del tuo prestito.</p>
              <motion.div style={{ maxWidth: 440 }} whileHover={{ scale: 1.01 }} transition={{ duration: 0.3 }}>
                <LoanSimulator />
              </motion.div>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <motion.div className="form-wrapper" whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <h3>Requisiti di idoneità</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    'Essere maggiorenne (18 anni minimo)',
                    'Possedere un conto corrente con IBAN',
                    'Avere una capacità di rimborso dimostrata',
                    'Possedere una carta bancaria valida',
                  ].map((c, i) => (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.2 + i * 0.08, duration: 0.3 }} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 0', fontSize: 14, color: 'var(--text-2)', borderBottom: '1px solid var(--border)' }}>
                      <motion.span style={{ color: 'var(--blue)', fontWeight: 700 }} whileHover={{ scale: 1.3, color: 'var(--green)' }}>✓</motion.span> {c}
                    </motion.li>
                  ))}
                </ul>
              </motion.div>

              <motion.div className="form-wrapper" style={{ marginTop: 16 }} whileHover={{ y: -2 }} transition={{ duration: 0.3 }}>
                <h3>Documenti da preparare</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {[
                    { doc: 'Documento d\'identità', desc: 'Carta d\'identità o passaporto in corso di validità' },
                    { doc: 'IBAN / RIB', desc: 'Per ricevere i fondi' },
                    { doc: 'Carta bancaria', desc: 'Per i rimborsi automatici' },
                  ].map((d, i) => {
                    const DocIcon = docIcons[i];
                    return (
                    <motion.li key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: 0.3 + i * 0.1, duration: 0.3 }} style={{ display: 'flex', gap: 12, padding: '10px 0', borderBottom: i < 2 ? '1px solid var(--border)' : 'none' }}>
                      <motion.span style={{ fontSize: 18 }} whileHover={{ scale: 1.2, rotate: [0, -15, 15, 0] }}><DocIcon size={18} /></motion.span>
                      <div><div style={{ fontWeight: 700, fontSize: 14 }}>{d.doc}</div><div style={{ fontSize: 13, color: 'var(--text-3)' }}>{d.desc}</div></div>
                    </motion.li>
                    );
                  })}
                </ul>
                <p className="small text-muted" style={{ margin: '12px 0 0' }}>Tutto online, nessun documento cartaceo da inviare.</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section section--alt" id="formulaire" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Richiesta</div>
            <h2 className="section-header">Fai la tua richiesta di prestito</h2>
            <p className="section-sub">Compila il modulo qui sotto. Riceverai una conferma via email immediatamente.</p>
          </motion.div>
          <motion.div style={{ maxWidth: 700, margin: '0 auto' }} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
            <MultiStepForm preselectedType={preselectedType} />
          </motion.div>
        </div>
      </section>
    </>
  )
}

const stepVariants = {
  enter: { opacity: 0, x: 30, scale: 0.97 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -30, scale: 0.97 },
}

function MultiStepForm({ preselectedType }) {
  const [step, setStep] = useState(1)
  const [direction, setDirection] = useState(1)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    montant: 5000, duree: 6, motif: preselectedType && loanTypeNames[preselectedType] ? loanTypeNames[preselectedType] : '',
    nom: '', prenom: '', naissance: '', email: '', telephone: '', adresse: '', situation: '',
    iban: '', titulaire: '',
    recto: null, verso: null,
    acceptCgu: false, acceptCertif: false,
  })

  const update = (key, val) => setForm(f => ({ ...f, [key]: val }))
  const next = () => { setDirection(1); setStep(s => Math.min(s + 1, 5)); setError('') }
  const prev = () => { setDirection(-1); setStep(s => Math.max(s - 1, 1)); setError('') }
  const canNext = () => {
    if (step === 1) return form.montant && form.duree
    if (step === 2) return form.nom && form.prenom && form.naissance && form.email && form.telephone && form.adresse && form.situation
    if (step === 3) return form.iban && form.titulaire
    if (step === 4) return form.recto && form.verso
    if (step === 5) return form.acceptCgu && form.acceptCertif
    return false
  }

  const navigate = useNavigate()
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!canNext() || sending) return
    setSending(true)
    setError('')
    try {
      await fetch('/api/loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: form.montant,
          duration: form.duree,
          purpose: form.motif || 'Non specificato',
          firstName: form.prenom,
          lastName: form.nom,
          birthDate: form.naissance,
          email: form.email,
          phone: form.telephone,
          address: form.adresse,
          employment: form.situation,
          iban: form.iban,
          accountHolder: form.titulaire,
        }),
      })
      navigate('/confirmation')
    } catch {
      setError('Si è verificato un errore. Riprova o contattaci per telefono.')
    } finally {
      setSending(false)
    }
  }

  const steps = ['Progetto', 'Identità', 'Banca', 'Documento d\'identità', 'Riepilogo']

  return (
    <div className="form-wrapper">
      <div className="progress-bar">
        {steps.map((s, i) => (
          <div key={i} className={`progress-step${step === i + 1 ? ' active' : ''}${step > i + 1 ? ' completed' : ''}`}>
            <div className="progress-circle">{step > i + 1 ? null : i + 1}</div>
            <div className="progress-label">{s}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ minHeight: 320 }}>
        <AnimatePresence mode="wait" custom={direction}>
          {step === 1 && (
          <motion.div className="form-step" key="step1" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3>Il tuo progetto</h3>
            <div className="form-group">
              <label>Importo desiderato</label>
              <input type="range" className="simulator-range" min={100} max={3000000} step={1000} value={form.montant}
                onChange={e => update('montant', Number(e.target.value))} />
              <input type="number" className="form-control" min={100} max={3000000} value={form.montant}
                onChange={e => {
                  const v = Number(e.target.value)
                  if (!isNaN(v) && v >= 100 && v <= 3000000) update('montant', v)
                }}
                style={{ marginTop: 4, textAlign: 'center', fontWeight: 700 }} />
              <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--blue)', fontSize: 18, marginTop: 4 }}>{Number(form.montant).toLocaleString('fr-FR')} €</div>
            </div>
            <div className="form-group">
              <label>Durata desiderata</label>
              <input type="range" className="simulator-range" min={3} max={10} step={1} value={form.duree}
                onChange={e => update('duree', Number(e.target.value))} />
              <div style={{ textAlign: 'right', fontWeight: 800, color: 'var(--blue)', fontSize: 18, marginTop: 4 }}>{form.duree} mesi</div>
            </div>
            <div className="form-group">
              <label>Motivo del prestito (facoltativo)</label>
              <select className="form-control" value={form.motif} onChange={e => update('motif', e.target.value)}>
                <option value="">Seleziona un motivo</option>
                <option>Spesa imprevista</option>
                <option>Riparazione auto/moto</option>
                <option>Spese mediche</option>
                <option>Attrezzatura elettronica</option>
                <option>Viaggio</option>
                <option>Altro</option>
              </select>
            </div>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div className="form-step" key="step2" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3>Le tue informazioni personali</h3>
            <div className="form-row">
              <div className="form-group">
                <label>Cognome</label>
                <input className="form-control" placeholder="Rossi" value={form.nom} onChange={e => update('nom', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Nome</label>
                <input className="form-control" placeholder="Mario" value={form.prenom} onChange={e => update('prenom', e.target.value)} />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Data di nascita</label>
                <input type="date" className="form-control" value={form.naissance} onChange={e => update('naissance', e.target.value)} />
              </div>
              <div className="form-group">
                <label>Situazione professionale</label>
                <select className="form-control" value={form.situation} onChange={e => update('situation', e.target.value)}>
                  <option value="">Seleziona</option>
                  <option>Tempo indeterminato</option><option>Tempo determinato</option><option>Freelance</option>
                  <option>Indipendente</option><option>Interinale</option>
                  <option>Studente</option><option>Pensionato</option>
                  <option>Beneficiario RSA</option><option>Disoccupato</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" className="form-control" placeholder="mario@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Telefono</label>
              <input type="tel" className="form-control" placeholder="+39 123 456 7890" value={form.telephone} onChange={e => update('telephone', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Indirizzo</label>
              <input className="form-control" placeholder="Via Corsica, 57, 86039 Termoli" value={form.adresse} onChange={e => update('adresse', e.target.value)} />
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div className="form-step" key="step3" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3>Le tue informazioni bancarie</h3>
            <div className="form-group">
              <label>IBAN</label>
              <input className="form-control" placeholder="IT00 X123 4567 8901 2345 6789 012" value={form.iban} onChange={e => update('iban', e.target.value)} />
            </div>
            <div className="form-group">
              <label>Intestatario del conto</label>
              <input className="form-control" placeholder="Mario Rossi" value={form.titulaire} onChange={e => update('titulaire', e.target.value)} />
            </div>
            <p className="small text-muted">Queste informazioni permettono di accreditare i fondi se la tua richiesta viene accettata.</p>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div className="form-step" key="step4" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3>Documento d'identità</h3>
            <p className="small text-muted" style={{ marginBottom: 16 }}>Carica il fronte e il retro del tuo documento d'identità (carta d'identità o passaporto).</p>
            <FileUpload label="Fronte del documento d'identità" onChange={f => update('recto', f)} />
            <div style={{ height: 16 }} />
            <FileUpload label="Retro del documento d'identità" onChange={f => update('verso', f)} />
            <p className="small text-muted" style={{ marginTop: 12 }}>Formati accettati: JPG, PNG, PDF (max 5 MB).</p>
          </motion.div>
        )}

        {step === 5 && (
          <motion.div className="form-step" key="step5" custom={direction} variants={stepVariants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}>
            <h3>Riepilogo della tua richiesta</h3>
            <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius)', padding: 16, marginBottom: 20 }}>
              <div className="admin-field"><span className="admin-field-label">Importo</span><span className="admin-field-value">{form.montant} €</span></div>
              <div className="admin-field"><span className="admin-field-label">Durata</span><span className="admin-field-value">{form.duree} mesi</span></div>
              <div className="admin-field"><span className="admin-field-label">Mensilità stimata</span><span className="admin-field-value">{(form.montant * 0.045 / 12 * Math.pow(1 + 0.045 / 12, form.duree) / (Math.pow(1 + 0.045 / 12, form.duree) - 1)).toFixed(2)} €</span></div>
              <div className="admin-field"><span className="admin-field-label">Nome</span><span className="admin-field-value">{form.prenom} {form.nom}</span></div>
              <div className="admin-field"><span className="admin-field-label">Email</span><span className="admin-field-value">{form.email}</span></div>
              <div className="admin-field" style={{ borderBottom: 'none' }}><span className="admin-field-label">Situazione</span><span className="admin-field-value">{form.situation}</span></div>
            </div>

            <div className="form-check">
              <input type="checkbox" id="cgu" checked={form.acceptCgu} onChange={e => update('acceptCgu', e.target.checked)} />
              <label htmlFor="cgu">Accetto i <Link to="/cgu" target="_blank">Termini e Condizioni d'Uso</Link> e la <Link to="/politique-confidentialite" target="_blank">Politica sulla privacy</Link>.</label>
            </div>
            <div className="form-check">
              <input type="checkbox" id="certif" checked={form.acceptCertif} onChange={e => update('acceptCertif', e.target.checked)} />
              <label htmlFor="certif">Certifico che le informazioni fornite sono esatte.</label>
            </div>
          </motion.div>
        )}

        </AnimatePresence>

        <div className="form-actions">
          {step > 1 ? <button type="button" className="btn btn-ghost" onClick={prev}>← Indietro</button> : <div />}
          {step < 5 ? (
            <button type="button" className="btn btn-primary" onClick={next} disabled={!canNext()} style={{ opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
              Avanti →
            </button>
          ) : (
            <button type="submit" className="btn btn-primary" disabled={!canNext() || sending} style={{ opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}>
              {sending ? 'Invio in corso…' : 'Invia richiesta'}
            </button>
          )}
        </div>
        {error && <p style={{ marginTop: 16, fontSize: 13, color: '#C8102E', textAlign: 'center' }}>{error}</p>}
      </form>
    </div>
  )
}

function FileUpload({ label, onChange }) {
  const [file, setFile] = useState(null)
  return (
    <div className={`file-upload${file ? ' has-file' : ''}`}>
      <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={e => { const f = e.target.files[0]; setFile(f); onChange(f) }} />
      {file ? (
        <>
          <div className="file-upload-icon" style={{ color: 'var(--green)' }}>✓</div>
          <div className="file-upload-text">{file.name}</div>
          <div className="file-upload-hint">{(file.size / 1024 / 1024).toFixed(1)} MB — Clicca per cambiare</div>
        </>
      ) : (
        <>
          <div className="file-upload-icon"><FileText size={22} /></div>
          <div className="file-upload-text">{label}</div>
          <div className="file-upload-hint">Clicca per selezionare un file</div>
        </>
      )}
    </div>
  )
}
