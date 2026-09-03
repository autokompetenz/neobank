import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Zap, Briefcase, GraduationCap, Wrench, Building2, Globe, Wallet,
  FileText, CheckCircle, ArrowRight,
} from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
const stagger = { whileInView: 'animate', viewport: { once: true, margin: '-40px' }, initial: 'initial', variants: { animate: { transition: { staggerChildren: 0.08 } } } }

const solutions = [
  {
    icon: Home,
    slug: 'immobilier',
    title: 'Financement immobilier',
    desc: 'Accompagnement pour l\'achat, la reprise ou l\'investissement locatif. Nous vous aidons à structurer votre projet immobilier et à identifier les solutions adaptées.',
    conditions: ['Être majeur(e)', 'Revenus stables ou projet viable', 'Avoir un projet immobilier clairement défini'],
    documents: ['Justificatif d\'identité en cours de validité', 'Justificatifs de revenus (3 derniers mois)', 'Compromis de vente ou offre de prêt (si disponible)', 'Attestation de fonds propres'],
    steps: ['Décrivez votre projet immobilier', 'Analyse personnalisée par notre équipe', 'Identification des solutions pertinentes', 'Suivi de votre dossier en ligne'],
  },
  {
    icon: Zap,
    slug: 'automobile',
    title: 'Financement automobile',
    desc: 'Solution pour l\'acquisition d\'un véhicule neuf ou d\'occasion. Un accompagnement simple pour trouver le financement adapté à votre budget.',
    conditions: ['Être majeur(e)', 'Avoir un permis de conduire valide', 'Justifier de revenus suffisants'],
    documents: ['Justificatif d\'identité', 'Permis de conduire', 'Devis du véhicule ou facture', 'Justificatifs de revenus'],
    steps: ['Indiquez le type et le montant du véhicule', 'Recevez une analyse de votre demande', 'Découvrez les options d\'accompagnement', 'Suivez votre dossier en temps réel'],
  },
  {
    icon: Briefcase,
    slug: 'entreprise',
    title: 'Création d\'entreprise',
    desc: 'Accompagnement pour le lancement ou le développement de votre activité. Structuration du projet, analyse financière et orientation vers les bonnes solutions.',
    conditions: ['Avoir un projet entrepreneurial défini', 'Présenter un business plan ou un plan d\'activité', 'Être en mesure de démontrer la viabilité du projet'],
    documents: ['Business plan ou prévisionnel financier', 'Justificatif d\'identité', 'Statuts de la société (si existants)', 'CV du porteur de projet'],
    steps: ['Présentez votre projet entrepreneurial', 'Analyse de la faisabilité par notre équipe', 'Définition de la stratégie financière', 'Suivi et accompagnement continu'],
  },
  {
    icon: GraduationCap,
    slug: 'etudes',
    title: 'Financement études',
    desc: 'Accompagnement pour les études supérieures, la formation continue ou la mobilité internationale. Construisez votre avenir avec un plan financier solide.',
    conditions: ['Être accepté(e) dans un établissement ou une formation', 'Justifier de revenus ou d\'un garant', 'Avoir un projet d\'études clair'],
    documents: ['Certificat d\'inscription ou lettre d\'acceptation', 'Justificatif d\'identité', 'Justificatifs de revenus du garant (si applicable)', 'Devis de la formation ou de la scolarité'],
    steps: ['Décrivez votre projet d\'études', 'Analyse de vos besoins financiers', 'Identification des solutions d\'orientation', 'Accompagnement personnalisé'],
  },
  {
    icon: Wrench,
    slug: 'travaux',
    title: 'Financement travaux',
    desc: 'Accompagnement pour la rénovation, l\'amélioration énergétique ou la transformation de votre habitat. Optimisez votre projet de travaux.',
    conditions: ['Être propriétaire ou copropriétaire', 'Avoir un devis détaillé des travaux', 'Justifier de revenus suffisants'],
    documents: ['Devis détaillé des travaux', 'Justificatif d\'identité', 'Justificatifs de revenus', 'Certificat de propriété'],
    steps: ['Décrivez vos travaux prévus', 'Analyse technique et financière', 'Oriention vers les solutions adaptées', 'Suivi de votre demande en ligne'],
  },
  {
    icon: Building2,
    slug: 'construction',
    title: 'Financement construction',
    desc: 'Accompagnement pour la construction d\'un bien immobilier neuf. Du terrain à la livraison, nous vous guidons dans chaque étape.',
    conditions: ['Disposer d\'un terrain ou d\'une offre foncière', 'Avoir un projet architectural défini', 'Justifier de revenus ou de fonds propres'],
    documents: ['Permis de construire ou projet architectural', 'Justificatif d\'identité', 'Justificatifs de revenus', 'Attestation de propriété du terrain'],
    steps: ['Présentez votre projet de construction', 'Analyse financière et technique', 'Définition du plan d\'accompagnement', 'Suivi jusqu\'à la livraison'],
  },
  {
    icon: Globe,
    slug: 'international',
    title: 'Projets internationaux',
    desc: 'Accompagnement pour les projets à l\'étranger : études, investissement, installation. Une expertise pour vos démarches internationales.',
    conditions: ['Avoir un projet international défini', 'Justifier de revenus ou de ressources', 'Disposer des documents requis par le pays cible'],
    documents: ['Justificatif d\'identité valide pour l\'étranger', 'Justificatifs de revenus', 'Contrat ou promesse liée au projet international', 'Justificatif de résidence ou de projet d\'installation'],
    steps: ['Décrivez votre projet international', 'Analyse des exigences spécifiques', 'Orientation vers les solutions pertinentes', 'Suivi personnalisé de votre dossier'],
  },
  {
    icon: Wallet,
    slug: 'personnel',
    title: 'Projets personnels',
    desc: 'Accompagnement pour vos projets de vie : mariage, santé, équipement, voyages. Donnez vie à vos projets avec un plan financier solide.',
    conditions: ['Avoir un projet personnel clairement défini', 'Justifier de revenus suffisants', 'Être majeur(e)'],
    documents: ['Justificatif d\'identité', 'Justificatifs de revenus', 'Devis ou estimation du projet', 'Complément selon la nature du projet'],
    steps: ['Décrivez votre projet personnel', 'Analyse de vos besoins financiers', 'Identification des solutions d\'accompagnement', 'Suivi et conseil personnalisé'],
  },
]

export default function SolutionsPage() {
  return (
    <>
      <PageHero title="Nos solutions" lead="Découvrez nos huit domaines d'accompagnement financier. Pour chaque projet, nous vous guidons dans l'analyse, la structuration et le suivi de votre demande." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Solutions</div>
            <h2 className="section-header">Un accompagnement pour chaque projet</h2>
            <p className="section-sub">Choisissez le domaine qui correspond à votre besoin et découvrez comment NEOBANK peut vous accompagner.</p>
          </motion.div>

          <motion.div {...stagger} style={{ display: 'flex', flexDirection: 'column', gap: 48 }}>
            {solutions.map((sol, i) => {
              const Icon = sol.icon
              return (
                <motion.div
                  key={sol.slug}
                  variants={{ initial: { opacity: 0, y: 24 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))',
                    gap: 'clamp(24px, 4vw, 48px)',
                    alignItems: 'start',
                    padding: 'clamp(24px, 4vw, 40px)',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-xl)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                      <div style={{ width: 52, height: 52, borderRadius: 14, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Icon size={24} style={{ color: 'var(--blue)' }} />
                      </div>
                      <div>
                        <div className="section-eyebrow" style={{ marginBottom: 2 }}>Solution {i + 1}</div>
                        <h3 style={{ fontSize: 'clamp(18px, 2.5vw, 24px)', fontWeight: 900, margin: 0 }}>{sol.title}</h3>
                      </div>
                    </div>
                    <p style={{ color: 'var(--text-2)', lineHeight: 1.7, fontSize: 15 }}>{sol.desc}</p>
                    <Link to="/register" className="btn btn-primary btn-sm" style={{ alignSelf: 'flex-start', marginTop: 4 }}>
                      Faire une demande <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="card" style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 10 }}>Conditions générales</h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sol.conditions.map((c, j) => (
                          <li key={j} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                            <CheckCircle size={16} style={{ color: 'var(--green)', flexShrink: 0, marginTop: 2 }} /> {c}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FileText size={14} /> Documents nécessaires
                      </h4>
                      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sol.documents.map((d, j) => (
                          <li key={j} style={{ display: 'flex', gap: 8, fontSize: 14, color: 'var(--text-2)' }}>
                            <span style={{ color: 'var(--blue)', fontWeight: 700, flexShrink: 0 }}>•</span> {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card" style={{ padding: 20 }}>
                      <h4 style={{ fontSize: 13, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-3)', marginBottom: 10 }}>Étapes</h4>
                      <ol style={{ padding: '0 0 0 20px', margin: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        {sol.steps.map((s, j) => (
                          <li key={j} style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.5 }}>{s}</li>
                        ))}
                      </ol>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Pas sûr(e) du choix adapté ?"
        text="Créez votre compte et décrivez votre projet. Notre équipe vous orientera vers la meilleure solution."
        cta={{ to: '/register', label: 'Commencer maintenant' }}
      />
    </>
  )
}
