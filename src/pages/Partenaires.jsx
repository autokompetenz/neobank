import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Shield, Clock, Users, ArrowRight, CheckCircle } from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const values = [
  { icon: Shield, title: 'Sécurité', text: 'Chaque partenaire est vérifié et doit répondre aux normes de conformité en vigueur.' },
  { icon: CheckCircle, title: 'Transparence', text: 'Conditions claires, aucun frais cachés, informations accessibles à tout moment.' },
  { icon: Clock, title: 'Réactivité', text: 'Traitement rapide des dossiers et retour sous 24 à 48 heures ouvrées.' },
  { icon: Users, title: 'Accompagnement', text: 'Un interlocuteur dédié pour chaque dossier, du premier contact à la finalisation.' },
]

export default function Partenaires() {
  return (
    <>
      <PageHero title="Nos partenaires" lead="Découvrez l'approche de NEOBANK en matière de partenariats financiers et nos critères de sélection." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div {...fadeUp}>
            <div className="section-eyebrow">Notre approche</div>
            <h2 style={{ fontSize: 'clamp(24px, 3vw, 34px)', fontWeight: 900, marginBottom: 16, color: 'var(--text)' }}>
              Un réseau de partenaires sélectionnés avec soin
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 12 }}>
              NEOBANK travaille en étroite collaboration avec des établissements financiers et des intermédiaires qualifiés pour proposer à ses utilisateurs les solutions les plus adaptées à leurs projets.
            </p>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 24 }}>
              Notre processus de sélection repose sur des critères stricts de conformité réglementaire, de transparence tarifaire et de qualité de service. Chaque partenaire est évalué avant toute collaboration.
            </p>
          </motion.div>

          <motion.div {...fadeUp} style={{
            background: 'rgba(250, 199, 117, 0.1)',
            border: '1px solid rgba(250, 199, 117, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '18px 22px',
            marginBottom: 40,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 14,
          }}>
            <div style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>ℹ️</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)', marginBottom: 4 }}>
                Partenaires en cours de constitution
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, margin: 0 }}>
                NEOBANK est en phase de structuration. Les partenaires financiers seront affichés sur cette page une fois les accords de partenariat formellement conclus. Aucun établissement fictif n'est présenté. Nous vous tiendrons informé dès que ces partenariats seront actifs.
              </p>
            </div>
          </motion.div>

          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Critères</div>
            <h2 className="section-header">Nos exigences envers nos partenaires</h2>
          </motion.div>

          <motion.div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }} variants={{ animate: { transition: { staggerChildren: 0.08 } } }}>
            {values.map((v, i) => (
              <motion.div key={i} className="advantage-card tilt-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } } }}>
                <div className="advantage-icon"><v.icon size={22} /></div>
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div {...fadeUp}>
            <h2 style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 900, marginBottom: 16, color: 'var(--text)', textAlign: 'center' }}>
              Vous souhaitez devenir partenaire ?
            </h2>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75, textAlign: 'center', marginBottom: 24, maxWidth: 600, margin: '0 auto 24px' }}>
              Si vous êtes un établissement financier, un organisme de crédit ou un intermédiaire agréé et souhaitez collaborer avec NEOBANK, contactez-nous pour discuter des modalités de partenariat.
            </p>
            <div style={{ textAlign: 'center' }}>
              <Link to="/contact" className="btn btn-primary">
                Nous contacter <ArrowRight size={16} />
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Besoin d'accompagnement ?"
        text="Présentez votre projet, nous vous orientons vers les solutions les plus adaptées."
        cta={{ to: '/simulateur', label: 'Lancer une simulation' }}
      />
    </>
  )
}
