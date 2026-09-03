import { useState } from 'react'
import { motion } from 'framer-motion'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const faq = [
  {
    category: 'Fonctionnement',
    questions: [
      { q: 'Comment fonctionne NEOBANK ?', a: 'NEOBANK est une plateforme d\'accompagnement et d\'orientation financière. Vous présentez votre projet en ligne, notre équipe l\'analyse et vous propose des solutions adaptées à votre situation. NEOBANK n\'est pas un établissement bancaire et n\'accorde pas de financement directement.' },
      { q: 'Faut-il créer un compte pour utiliser NEOBANK ?', a: 'Vous pouvez explorer nos solutions et utiliser le simulateur sans compte. Pour soumettre une demande d\'accompagnement, la création d\'un compte gratuit est nécessaire.' },
      { q: 'NEOBANK est-il une banque ?', a: 'Non. NEOBANK est une plateforme d\'accompagnement financier. Nous vous orientons et vous assistons dans la structuration de votre projet, mais nous n\'octroyons pas de crédits ni de financements.' },
      { q: 'Comment contacter l\'équipe NEOBANK ?', a: 'Vous pouvez nous contacter via le formulaire de contact sur notre site. Notre équipe s\'engage à répondre sous 24 heures ouvrées.' },
    ],
  },
  {
    category: 'Projets',
    questions: [
      { q: 'Quels types de projets accompagnez-vous ?', a: 'Nous accompagnons huit catégories de projets : immobilier, automobile, création d\'entreprise, études, travaux, construction, projets internationaux et projets personnels.' },
      { q: 'Est-ce que la présentation d\'une demande garantit l\'obtention d\'un financement ?', a: 'Non. La présentation d\'une demande ne garantit en rien l\'obtention d\'un financement. NEOBANK vous oriente et vous accompagne, mais la décision finale appartient toujours aux partenaires financiers ou institutions compétentes.' },
      { q: 'Puis-je présenter plusieurs projets ?', a: 'Oui, vous pouvez soumettre plusieurs demandes pour des projets différents. Chaque demande est analysée individuellement.' },
      { q: 'Combien de temps dure l\'analyse de mon projet ?', a: 'Notre équipe analyse les demandes sous 24 à 48 heures ouvrées. Vous êtes informé(e) de l\'avancement par email et via votre espace personnel.' },
    ],
  },
  {
    category: 'Documents',
    questions: [
      { q: 'Quels documents dois-je fournir ?', a: 'Les documents varient selon le type de projet. En général, un justificatif d\'identité et des justificatifs de revenus sont nécessaires. La liste détaillée est indiquée sur chaque page de solution.' },
      { q: 'Comment transmettre mes documents ?', a: 'Vos documents sont transmis de manière sécurisée via votre espace personnel NEOBANK. Aucun document ne doit être envoyé par email.' },
      { q: 'Mes documents sont-ils sécurisés ?', a: 'Oui. Tous les documents sont stockés de manière chiffrée et ne sont jamais partagés avec des tiers sans votre consentement explicite.' },
    ],
  },
  {
    category: 'Confidentialité',
    questions: [
      { q: 'Comment mes données sont-elles protégées ?', a: 'Nous utilisons un chiffrement SSL 256 bits et respectons le RGPD. Vos données personnelles ne sont jamais vendues ni partagées avec des tiers à des fins commerciales.' },
      { q: 'Puis-je supprimer mon compte et mes données ?', a: 'Oui. Vous pouvez demander la suppression de votre compte et de toutes vos données personnelles à tout moment en nous contactant.' },
      { q: 'Qui a accès à mes informations ?', a: 'Seuls les membres autorisés de l\'équipe NEOBANK ont accès à vos informations dans le cadre de l\'analyse de votre projet. Aucun accès n\'est accordé à des tiers.' },
    ],
  },
  {
    category: 'Transparence',
    questions: [
      { q: 'Quels sont vos tarifs ?', a: 'L\'utilisation de la plateforme NEOBANK est gratuite pour les utilisateurs. Nous ne facturons aucun frais pour l\'accompagnement ni l\'analyse de projet.' },
      { q: 'Comment êtes-vous rémunérés ?', a: 'NEOBANK peut percevoir une commission de la part de ses partenaires financiers lorsque le projet aboutit. Cette rémunération n\'engage aucun surcoût pour l\'utilisateur.' },
      { q: 'Quelles garanties proposez-vous ?', a: 'NEOBANK s\'engage à fournir un accompagnement transparent et personnalisé. Cependant, nous ne garantissons pas l\'obtention d\'un financement. Chaque projet est évalué au cas par cas.' },
    ],
  },
]

export default function FAQPage() {
  return (
    <>
      <PageHero title="Questions fréquentes" lead="Tout ce que vous devez savoir avant de vous engager. Transparence et clarté sont au coeur de notre démarche." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          {faq.map((cat, ci) => (
            <motion.div key={ci} {...fadeUp} style={{ marginBottom: ci < faq.length - 1 ? 48 : 0 }}>
              <div className="section-eyebrow" style={{ marginBottom: 24 }}>{cat.category}</div>
              <div className="accordion">
                {cat.questions.map((item, qi) => (
                  <AccordionItem key={qi} question={item.q} answer={item.a} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="section section--alt">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <div className="section-eyebrow" style={{ marginBottom: 12 }}>Important</div>
            <p style={{ fontSize: 14, color: 'var(--text-3)', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>
              NEOBANK est une plateforme d'accompagnement et d'orientation financière.
              La présentation d'une demande ne garantit pas l'obtention d'un financement.
              Aucune promesse de crédit n'est faite par NEOBANK.
            </p>
          </motion.div>
        </div>
      </section>

      <CTASection title="Une question supplémentaire ?" text="Notre équipe est à votre disposition pour toute demande d'information." cta={{ to: '/contact', label: 'Nous contacter' }} />
    </>
  )
}

function AccordionItem({ question, answer }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="accordion-item">
      <div className="accordion-header">
        <button className="accordion-button" onClick={() => setOpen(!open)} aria-expanded={open}>
          {question}
        </button>
      </div>
      <div className={`accordion-collapse${open ? ' show' : ''}`}>
        <p className="accordion-body">{answer}</p>
      </div>
    </div>
  )
}
