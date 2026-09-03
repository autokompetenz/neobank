import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHero from '../components/shared/PageHero'
import FloatingDecorations from '../components/shared/FloatingDecorations'
import { api } from '../services/api'
import { useAuth } from '../context/AuthContext'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const STEP_LABELS = ['Projet', 'Montant', 'Situation', 'Revenus', 'Pays', 'Infos', 'Résumé']

const PROJECT_TYPES = [
  'Immobilier',
  'Automobile',
  'Création d\'entreprise',
  'Études',
  'Construction',
  'Travaux',
  'Projet international',
  'Projet personnel',
]

const EMPLOYMENT_STATUS = [
  'Salarié',
  'Entrepreneur',
  'Indépendant',
  'Étudiant',
  'Retraité',
  'Autre',
]

const formatCurrency = (val) => {
  if (!val) return '0 €'
  return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(val)
}

export default function SimulatorPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    projectType: '',
    amount: '',
    employmentStatus: '',
    monthlyIncome: '',
    country: '',
    lastName: '',
    firstName: '',
    email: '',
    phone: '',
  })

  const totalSteps = 7
  const canNext = () => {
    if (step === 1) return form.projectType !== ''
    if (step === 2) return form.amount !== '' && Number(form.amount) > 0
    if (step === 3) return form.employmentStatus !== ''
    if (step === 4) return form.monthlyIncome !== '' && Number(form.monthlyIncome) >= 0
    if (step === 5) return form.country.trim() !== ''
    if (step === 6) return form.lastName.trim() !== '' && form.firstName.trim() !== '' && form.email.trim() !== ''
    return true
  }

  const handleNext = () => { if (canNext() && step < totalSteps) setStep(step + 1) }
  const handlePrev = () => { if (step > 1) setStep(step - 1) }

  const handleSubmit = async () => {
    setSubmitting(true)
    const fullName = `${form.firstName.trim()} ${form.lastName.trim()}`
    const payload = {
      projectType: form.projectType,
      amount: Number(form.amount),
      monthlyIncome: Number(form.monthlyIncome),
      employmentStatus: form.employmentStatus,
      country: form.country.trim(),
      fullName,
      phone: form.phone.trim(),
      resume: {
        step,
        summary: `Projet ${form.projectType} — ${formatCurrency(form.amount)} — ${form.employmentStatus} — ${form.country}`,
      },
    }

    if (user) {
      try {
        await api.post('/projects', payload)
        toast.success('Votre demande a été enregistrée avec succès !')
        setSubmitted(true)
      } catch {
        toast.error('Une erreur est survenue. Veuillez réessayer.')
      }
    } else {
      toast.success('Simulation enregistrée localement.')
      setSubmitted(true)
    }
    setSubmitting(false)
  }

  if (submitted) {
    return (
      <>
        <PageHero title="Simulateur" lead="Simulateur d'accompagnement financier NEOBANK." />
        <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
          <FloatingDecorations />
          <div className="container" style={{ maxWidth: 640, textAlign: 'center' }}>
            <motion.div className="confirmation" style={{ padding: '60px 20px' }} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}>
              <div className="confirmation-icon"><Check size={32} /></div>
              <h1 style={{ fontSize: 28, fontWeight: 900, marginBottom: 8 }}>Votre projet a bien été enregistré</h1>
              <p className="lead" style={{ marginBottom: 24 }}>Notre équipe prendra contact avec vous prochainement pour un accompagnement personnalisé.</p>

              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                textAlign: 'left',
                marginBottom: 24,
              }}>
                <dl>
                  <dt>Type de projet</dt>
                  <dd style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{form.projectType}</dd>
                  <dt>Montant souhaité</dt>
                  <dd style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{formatCurrency(form.amount)}</dd>
                  <dt>Situation professionnelle</dt>
                  <dd style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{form.employmentStatus}</dd>
                  <dt>Revenus mensuels</dt>
                  <dd style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>{formatCurrency(form.monthlyIncome)}</dd>
                  <dt>Pays de résidence</dt>
                  <dd style={{ fontWeight: 600, fontSize: 15 }}>{form.country}</dd>
                </dl>
              </div>

              <div style={{
                background: 'rgba(250, 199, 117, 0.1)',
                border: '1px solid rgba(250, 199, 117, 0.3)',
                borderRadius: 'var(--radius)',
                padding: '14px 18px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
                marginBottom: 24,
              }}>
                <AlertTriangle size={18} style={{ color: '#B8860B', flexShrink: 0, marginTop: 2 }} />
                <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
                  <strong style={{ color: 'var(--text)' }}>Avertissement :</strong> Cette simulation est indicative et ne constitue en aucun cas une promesse de crédit ou de financement. NEOBANK est une plateforme d'accompagnement et d'orientation financière.
                </p>
              </div>

              {!user && (
                <div style={{
                  background: 'var(--blue-bg)',
                  border: '1px solid var(--blue-border)',
                  borderRadius: 'var(--radius)',
                  padding: '14px 18px',
                  marginBottom: 24,
                }}>
                  <p style={{ fontSize: 14, margin: 0, color: 'var(--text-2)' }}>
                    Pour suivre votre dossier et bénéficier d'un accompagnement complet, <Link to="/register" style={{ fontWeight: 700 }}>créez un compte gratuit</Link>.
                  </p>
                </div>
              )}

              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link to="/" className="btn btn-ghost">Retour à l'accueil</Link>
                <Link to="/simulateur" className="btn btn-primary" onClick={() => { setSubmitted(false); setStep(1); setForm({ projectType: '', amount: '', employmentStatus: '', monthlyIncome: '', country: '', lastName: '', firstName: '', email: '', phone: '' }) }}>
                  Nouvelle simulation
                </Link>
              </div>
            </motion.div>
          </div>
        </section>
      </>
    )
  }

  return (
    <>
      <PageHero title="Simulateur" lead="Estimez votre projet en quelques étapes. Notre équipe vous accompagnera ensuite personnellement." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 700 }}>
          {/* Progress bar */}
          <div className="progress-bar" role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={totalSteps}>
            {STEP_LABELS.map((label, i) => {
              const n = i + 1
              const isCompleted = n < step
              const isActive = n === step
              return (
                <div key={i} className={`progress-step${isCompleted ? ' completed' : ''}${isActive ? ' active' : ''}`}>
                  <div className="progress-circle">
                    {isCompleted ? '' : n}
                  </div>
                  <div className="progress-label">{label}</div>
                </div>
              )
            })}
          </div>

          <div className="form-wrapper" style={{ minHeight: 340 }}>
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="step1" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Quel est votre projet ?</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Sélectionnez la nature de votre projet pour nous permettre de mieux vous orienter.</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {PROJECT_TYPES.map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, projectType: type }))}
                        style={{
                          padding: '14px 16px',
                          border: `1.5px solid ${form.projectType === type ? 'var(--blue)' : 'var(--border-2)'}`,
                          borderRadius: 'var(--radius)',
                          background: form.projectType === type ? 'var(--blue-bg)' : 'var(--bg-card)',
                          color: form.projectType === type ? 'var(--blue)' : 'var(--text)',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'Outfit, sans-serif',
                          transition: 'all 0.2s',
                        }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                <motion.div key="step2" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Quel montant souhaitez-vous ?</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Indiquez le montant approximatif dont vous avez besoin pour votre projet.</p>
                  <div className="form-group">
                    <label>Montant souhaité</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex : 25000"
                      min="1000"
                      step="500"
                      value={form.amount}
                      onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
                    />
                  </div>
                  {form.amount > 0 && (
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
                      Montant : <strong style={{ color: 'var(--blue)' }}>{formatCurrency(form.amount)}</strong>
                    </p>
                  )}
                </motion.div>
              )}

              {step === 3 && (
                <motion.div key="step3" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Situation professionnelle</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Quelle est votre situation actuelle ?</p>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                    {EMPLOYMENT_STATUS.map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => setForm(f => ({ ...f, employmentStatus: status }))}
                        style={{
                          padding: '14px 16px',
                          border: `1.5px solid ${form.employmentStatus === status ? 'var(--blue)' : 'var(--border-2)'}`,
                          borderRadius: 'var(--radius)',
                          background: form.employmentStatus === status ? 'var(--blue-bg)' : 'var(--bg-card)',
                          color: form.employmentStatus === status ? 'var(--blue)' : 'var(--text)',
                          fontWeight: 600,
                          fontSize: 14,
                          cursor: 'pointer',
                          textAlign: 'left',
                          fontFamily: 'Outfit, sans-serif',
                          transition: 'all 0.2s',
                        }}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {step === 4 && (
                <motion.div key="step4" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Revenus mensuels</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Indiquez vos revenus mensuels nets avant impôts.</p>
                  <div className="form-group">
                    <label>Revenus mensuels nets</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Ex : 2500"
                      min="0"
                      step="100"
                      value={form.monthlyIncome}
                      onChange={e => setForm(f => ({ ...f, monthlyIncome: e.target.value }))}
                    />
                  </div>
                  {form.monthlyIncome > 0 && (
                    <p style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 8 }}>
                      Revenus : <strong style={{ color: 'var(--blue)' }}>{formatCurrency(form.monthlyIncome)}</strong> / mois
                    </p>
                  )}
                </motion.div>
              )}

              {step === 5 && (
                <motion.div key="step5" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Pays de résidence</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Dans quel pays résidez-vous actuellement ?</p>
                  <div className="form-group">
                    <label>Pays</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ex : France"
                      value={form.country}
                      onChange={e => setForm(f => ({ ...f, country: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {step === 6 && (
                <motion.div key="step6" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Informations personnelles</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Vos coordonnées nous permettront de vous recontacter.</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Nom</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Dupont"
                        value={form.lastName}
                        onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                      />
                    </div>
                    <div className="form-group">
                      <label>Prénom</label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Jean"
                        value={form.firstName}
                        onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      className="form-control"
                      placeholder="jean@example.com"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label>Téléphone (optionnel)</label>
                    <input
                      type="tel"
                      className="form-control"
                      placeholder="+33 6 00 00 00 00"
                      value={form.phone}
                      onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    />
                  </div>
                </motion.div>
              )}

              {step === 7 && (
                <motion.div key="step7" className="form-step" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                  <h3>Récapitulatif de votre demande</h3>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 20 }}>Vérifiez les informations ci-dessous avant de soumettre votre demande.</p>
                  <div style={{ background: 'var(--bg-card2)', borderRadius: 'var(--radius)', padding: 20 }}>
                    <dl style={{ margin: 0 }}>
                      {[
                        { label: 'Type de projet', value: form.projectType },
                        { label: 'Montant souhaité', value: formatCurrency(form.amount) },
                        { label: 'Situation professionnelle', value: form.employmentStatus },
                        { label: 'Revenus mensuels', value: formatCurrency(form.monthlyIncome) },
                        { label: 'Pays de résidence', value: form.country },
                        { label: 'Nom complet', value: `${form.firstName.trim()} ${form.lastName.trim()}` },
                        { label: 'Email', value: form.email },
                        ...(form.phone ? [{ label: 'Téléphone', value: form.phone }] : []),
                      ].map((item, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 7 ? '1px solid var(--border)' : 'none', flexWrap: 'wrap', gap: 4 }}>
                          <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 600 }}>{item.label}</span>
                          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>{item.value}</span>
                        </div>
                      ))}
                    </dl>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="form-actions">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handlePrev}
                disabled={step === 1}
                style={{ opacity: step === 1 ? 0.4 : 1, cursor: step === 1 ? 'not-allowed' : 'pointer' }}
              >
                <ArrowLeft size={16} /> Précédent
              </button>
              {step < totalSteps ? (
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  onClick={handleNext}
                  disabled={!canNext()}
                  style={{ opacity: canNext() ? 1 : 0.5, cursor: canNext() ? 'pointer' : 'not-allowed' }}
                >
                  Suivant <ArrowRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ opacity: submitting ? 0.6 : 1, cursor: submitting ? 'not-allowed' : 'pointer' }}
                >
                  {submitting ? 'Envoi en cours…' : 'Soumettre la demande'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
