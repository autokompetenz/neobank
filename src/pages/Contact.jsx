import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { MapPin, Mail, Phone, CheckCircle, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'
import toast from 'react-hot-toast'
import PageHero from '../components/shared/PageHero'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

// Adresse de contact à configurer
const CONTACT_CONFIG = {
  phone: '+33 1 00 00 00 00',
  phoneHours: 'Lun — Ven : 9h00 — 18h00',
  email: 'contact@neobank.fr',
  emailNote: 'Réponse sous 24h ouvrées',
  address: 'Adresse à configurer\nVille, Pays',
}

const sujetOptions = [
  'Demande d\'information',
  'Question sur un projet',
  'Suivi de dossier',
  'Suggestion d\'amélioration',
  'Réclamation',
  'Autre',
]

export default function Contact() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [form, setForm] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    sujet: sujetOptions[0],
    message: '',
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!form.nom || !form.prenom || !form.email || !form.message) {
      toast.error('Veuillez remplir tous les champs obligatoires.')
      return
    }
    setSending(true)
    setTimeout(() => {
      setSent(true)
      setSending(false)
      toast.success('Message envoyé avec succès ! Nous vous répondrons sous 24h ouvrées.')
    }, 800)
  }

  return (
    <>
      <PageHero title="Contactez-nous" lead="Une question, un besoin d'information ou un retour ? Notre équipe est à votre disposition." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 400px), 1fr))',
              gap: 40,
            }}
            initial="initial"
            animate="animate"
            variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          >
            <motion.div variants={{ initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="form-wrapper">
                <h3>Envoyez-nous un message</h3>
                {sent ? (
                  <div style={{ textAlign: 'center', padding: 24 }}>
                    <div style={{ marginBottom: 12 }}><CheckCircle size={32} style={{ color: 'var(--green)' }} /></div>
                    <p style={{ fontWeight: 700 }}>Message envoyé !</p>
                    <p style={{ fontSize: 14, color: 'var(--text-3)', marginTop: 4 }}>
                      Nous vous avons envoyé une confirmation par email. Notre équipe vous répondra sous 24 heures ouvrées.
                    </p>
                  </div>
                ) : (
                  <form className="d-flex flex-column gap-3" onSubmit={handleSubmit}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Nom</label>
                        <input
                          className="form-control"
                          placeholder="Dupont"
                          value={form.nom}
                          onChange={e => setForm(f => ({ ...f, nom: e.target.value }))}
                        />
                      </div>
                      <div className="form-group">
                        <label>Prénom</label>
                        <input
                          className="form-control"
                          placeholder="Jean"
                          value={form.prenom}
                          onChange={e => setForm(f => ({ ...f, prenom: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-row">
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
                        <label>Téléphone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="+33 6 00 00 00 00"
                          value={form.telephone}
                          onChange={e => setForm(f => ({ ...f, telephone: e.target.value }))}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Sujet</label>
                      <select
                        className="form-control"
                        value={form.sujet}
                        onChange={e => setForm(f => ({ ...f, sujet: e.target.value }))}
                      >
                        {sujetOptions.map(s => (
                          <option key={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Message</label>
                      <textarea
                        className="form-control"
                        placeholder="Décrivez votre demande..."
                        value={form.message}
                        onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      />
                    </div>
                    <button
                      type="submit"
                      className="btn btn-primary"
                      style={{ justifyContent: 'center' }}
                      disabled={sending}
                    >
                      {sending ? 'Envoi en cours…' : 'Envoyer le message'}
                    </button>
                  </form>
                )}
              </div>
            </motion.div>

            <motion.div variants={{ initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
              <div className="d-flex flex-column gap-4">
                {[
                  { icon: Phone, title: 'Téléphone', text: `${CONTACT_CONFIG.phone}\n${CONTACT_CONFIG.phoneHours}` },
                  { icon: Mail, title: 'Email', text: `${CONTACT_CONFIG.email}\n${CONTACT_CONFIG.emailNote}` },
                  { icon: MapPin, title: 'Adresse', text: CONTACT_CONFIG.address },
                ].map((item, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    gap: 16,
                    alignItems: 'flex-start',
                    padding: 16,
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius)',
                  }}>
                    <div style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: 'var(--blue-bg)',
                      color: 'var(--blue)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 style={{ fontSize: 15, marginBottom: 4, color: 'var(--text)' }}>{item.title}</h4>
                      <p style={{ whiteSpace: 'pre-line', fontSize: 14, margin: 0, color: 'var(--text-3)' }}>{item.text}</p>
                    </div>
                  </div>
                ))}

                <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: 16 }}>
                  <h4 style={{ fontSize: 15, marginBottom: 12, color: 'var(--text)' }}>Suivez-nous</h4>
                  <div style={{ display: 'flex', gap: 12 }}>
                    {[
                      { icon: Linkedin, label: 'LinkedIn', url: '#' },
                      { icon: Twitter, label: 'X (Twitter)', url: '#' },
                      { icon: Facebook, label: 'Facebook', url: '#' },
                      { icon: Instagram, label: 'Instagram', url: '#' },
                    ].map((s, i) => (
                      <a
                        key={i}
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          background: 'var(--blue-bg)',
                          color: 'var(--blue)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          textDecoration: 'none',
                          transition: 'transform 0.2s',
                        }}
                        title={s.label}
                        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.1)'}
                        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                      >
                        <s.icon size={20} />
                      </a>
                    ))}
                  </div>
                  <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '8px 0 0' }}>
                    Restez informé de nos actualités et services.
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      <section className="section section--alt">
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">FAQ</div>
            <h2 className="section-header">Questions fréquentes</h2>
            <p className="section-sub">Les réponses aux questions les plus courantes.</p>
          </motion.div>
          <motion.div style={{ maxWidth: 700, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }} {...fadeUp}>
            {[
              { q: 'Quels sont vos horaires d\'ouverture ?', r: 'Notre équipe est disponible du lundi au vendredi, de 9h00 à 18h00. Le formulaire de contact est accessible 24h/24 et nous répondons sous 24h ouvrées.' },
              { q: 'Comment suivre ma demande d\'accompagnement ?', r: 'Après soumission de votre demande, vous recevez un email de confirmation immédiat. Notre équipe vous recontacte sous 24h pour faire le point. Vous pouvez également nous écrire via le formulaire.' },
              { q: 'NEOBANK accorde-t-il des financements ?', r: 'Non. NEOBANK est une plateforme d\'accompagnement et d\'orientation financière. Nous vous aidons à structurer votre projet et à identifier les solutions pertinentes, mais la décision finale appartient aux partenaires financiers.' },
            ].map((item, i) => (
              <ContactFaqItem key={i} q={item.q} r={item.r} />
            ))}
          </motion.div>
          <motion.div className="text-center mt-4" {...fadeUp}>
            <Link to="/faq" className="btn btn-ghost">Voir toutes les questions →</Link>
          </motion.div>
        </div>
      </section>
    </>
  )
}

function ContactFaqItem({ q, r }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="faq-item">
      <button className="faq-question" onClick={() => setOpen(!open)} aria-expanded={open}>
        <span>{q}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s', flexShrink: 0 }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div style={{ maxHeight: open ? 300 : 0, overflow: 'hidden', transition: 'max-height 0.3s' }}>
        <p className="faq-answer">{r}</p>
      </div>
    </div>
  )
}
