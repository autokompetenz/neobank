import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Send, Mail, Users, LayoutDashboard, ArrowRight } from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const steps = [
  {
    n: '01',
    icon: Send,
    title: 'Présentez votre projet',
    text: 'Remplissez le formulaire en ligne en quelques minutes. Indiquez la nature de votre projet, le montant souhaité et votre situation personnelle.',
    details: ['Formulaire rapide et intuitif', 'Aucune inscription requise pour démarrer', 'Simulateur intégré pour estimer vos besoins'],
  },
  {
    n: '02',
    icon: Mail,
    title: 'Recevez une confirmation',
    text: 'Après soumission de votre demande, vous recevez un email de confirmation avec votre numéro de dossier. Vous disposez d\'un récapitulatif complet de votre demande.',
    details: ['Confirmation par email immédiate', 'Numéro de dossier unique attribué', 'Récapitulatif détaillé de votre demande'],
  },
  {
    n: '03',
    icon: Users,
    title: 'Notre équipe analyse votre dossier',
    text: 'Notre équipe étudie votre demande sous 24 heures ouvrées. Nous vérifions les informations et évaluons votre situation pour vous proposer un accompagnement adapté.',
    details: ['Analyse personnalisée sous 24h', 'Contact par email ou téléphone', 'Pas de document complexe requis à ce stade'],
  },
  {
    n: '04',
    icon: LayoutDashboard,
    title: 'Suivez votre dossier en ligne',
    text: 'Accédez à votre espace personnel pour suivre l\'avancement de votre demande, transmettre les documents requis et échanger avec votre conseiller dédié.',
    details: ['Espace de suivi en temps réel', 'Échange direct avec votre conseiller', 'Transmission sécurisée des documents'],
  },
]

export default function CommentCaMarche() {
  return (
    <>
      <PageHero
        title="Comment ça marche ?"
        lead="Découvrez le parcours d'accompagnement NEOBANK en quatre étapes simples, de la présentation de votre projet au suivi de votre dossier."
      />

      {steps.map((step, i) => {
        const Icon = step.icon
        return (
          <section key={i} className={`section${i % 2 === 1 ? ' section--alt' : ''}`} style={{ position: 'relative', overflow: 'hidden' }}>
            <FloatingDecorations />
            <div className="container">
              <motion.div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'clamp(24px, 4vw, 64px)',
                  flexWrap: 'wrap',
                }}
                {...fadeUp}
              >
                <div style={{
                  flex: '1 1 300px',
                  background: 'var(--blue-bg)',
                  borderRadius: 'var(--radius-xl)',
                  padding: 'clamp(32px, 5vw, 48px)',
                  textAlign: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 16,
                }}>
                  <div style={{
                    fontSize: 'clamp(40px, 8vw, 64px)',
                    fontWeight: 900,
                    color: 'var(--blue)',
                    lineHeight: 1,
                  }}>
                    {step.n}
                  </div>
                  <Icon size={32} style={{ color: 'var(--blue)' }} />
                </div>

                <div style={{ flex: '1 1 300px' }}>
                  <div className="section-eyebrow">Étape {i + 1}</div>
                  <h2 style={{
                    fontSize: 'clamp(22px, 3vw, 34px)',
                    fontWeight: 900,
                    marginBottom: 12,
                    color: 'var(--text)',
                  }}>
                    {step.title}
                  </h2>
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
        )
      })}

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Transparence</div>
            <h2 className="section-header">Un processus clair et transparent</h2>
            <p className="section-sub">
              NEOBANK est une plateforme d'accompagnement et d'orientation financière.
              La présentation d'une demande ne garantit pas l'obtention d'un financement.
            </p>
          </motion.div>
          <motion.div {...fadeUp} style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/solutions" className="btn btn-ghost">
              Découvrir nos solutions <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Prêt à démarrer ?"
        text="Présentez votre projet maintenant, sans engagement."
        cta={{ to: '/register', label: 'Commencer' }}
      />
    </>
  )
}
