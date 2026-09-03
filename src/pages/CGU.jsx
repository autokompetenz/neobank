import { motion } from 'framer-motion'
import PageHero from '../components/shared/PageHero'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const sections = [
  {
    title: 'Champ d\'application',
    content: [
      'Les présentes Conditions Générales d\'Utilisation (CGU) régissent l\'accès et l\'utilisation de la plateforme NEOBANK accessible à l\'adresse indiquée sur le site.',
      'En accédant ou en utilisant la plateforme, l\'utilisateur reconnaît avoir pris connaissance des présentes CGU et les accepter sans réserve.',
      'NEOBANK se réserve le droit de modifier ces CGU à tout moment. Les modifications prennent effet dès leur publication. Il est conseillé de consulter régulièrement cette page.',
    ],
  },
  {
    title: 'Définitions',
    content: [
      '« Plateforme » : le site web NEOBANK et l\'ensemble des services proposés en ligne.',
      '« Utilisateur » : toute personne physique accédant à la plateforme, qu\'elle dispose d\'un compte ou non.',
      '« Compte » : l\'espace personnel créé par un Utilisateur après inscription.',
      '« Service » : l\'ensemble des fonctionnalités proposées par NEOBANK, notamment le simulateur, les formulaires de demande et le suivi de dossier.',
      '« Partenaire financier » : l\'établissement ou l\'intermédiaire avec lequel NEOBANK collabore dans le cadre de l\'accompagnement.',
    ],
  },
  {
    title: 'Création de compte',
    content: [
      'La création d\'un compte est facultative pour utiliser le simulateur, mais nécessaire pour soumettre une demande d\'accompagnement et suivre un dossier.',
      'L\'Utilisateur s\'engage à fournir des informations exactes et à maintenir la confidentialité de ses identifiants.',
      'Chaque compte est strictement personnel et ne peut être transféré à un tiers.',
      'L\'Utilisateur est responsable de toute activité effectuée depuis son compte. En cas de suspicion d\'utilisation non autorisée, il doit en informer NEOBANK sans délai.',
    ],
  },
  {
    title: 'Nature du service',
    content: [
      'NEOBANK est une plateforme d\'accompagnement et d\'orientation financière. Elle propose :',
      'Un simulateur permettant d\'estimer les caractéristiques d\'un projet de financement.',
      'Des formulaires de demande pour présenter un projet à l\'équipe NEOBANK.',
      'Un suivi de dossier via l\'espace personnel.',
      'Une mise en relation avec des partenaires financiers qualifiés.',
      '',
      'NEOBANK n\'est PAS :',
      'Un établissement de crédit, un organisme de financement ou un intermédiaire en opérations de banque.',
      'Un prestataire de conseil financier personnalisé.',
      '',
      'Les résultats des simulations sont purement indicatifs et ne constituent en aucun cas une offre de crédit, une promesse de financement ou un engagement de la part de NEOBANK ou de ses partenaires.',
      'La décision finale de financement appartient exclusivement au partenaire financier compétent.',
    ],
  },
  {
    title: 'Obligations de l\'utilisateur',
    content: [
      'L\'Utilisateur s\'engage à :',
      'Utiliser la plateforme uniquement dans un but licite et conformément aux présentes CGU.',
      'Fournir des informations exactes et complètes lors de l\'utilisation des formulaires.',
      'Ne pas perturber ou tenter de perturber le fonctionnement de la plateforme.',
      'Ne pas usurper l\'identité d\'un tiers ou fournir de fausses informations.',
      'Respecter les droits de propriété intellectuelle de NEOBANK.',
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: [
      'L\'ensemble du contenu de la plateforme (textes, images, logos, graphismes, code source, bases de données) est la propriété exclusive de NEOBANK ou de ses concédants de licence.',
      'Toute reproduction, représentation, modification, adaptation ou exploitation non autorisée est strictement interdite.',
    ],
  },
  {
    title: 'Limitation de responsabilité',
    content: [
      'NEOBANK met en œuvre les meilleurs efforts pour assurer la disponibilité et la fiabilité de la plateforme. Cependant, elle ne garantit pas l\'absence d\'interruption ni l\'absence d\'erreurs.',
      'NEOBANK ne saurait être tenue responsable des dommages résultant de l\'utilisation de la plateforme, de l\'impossibilité d\'y accéder ou des décisions prises par les partenaires financiers.',
      'La responsabilité de NEOBANK ne peut en aucun cas excéder le montant des sommes versées par l\'Utilisateur à titre de contrepartie du Service.',
    ],
  },
  {
    title: 'Résiliation',
    content: [
      'L\'Utilisateur peut supprimer son compte à tout moment depuis son espace personnel ou en contactant l\'équipe NEOBANK.',
      'NEOBANK se réserve le droit de suspendre ou de supprimer le compte d\'un Utilisateur en cas de manquement aux présentes CGU, sans préavis.',
      'En cas de résiliation, les données de l\'Utilisateur sont conservées conformément à la durée définie dans la Politique de Confidentialité.',
    ],
  },
  {
    title: 'Droit applicable et litiges',
    content: [
      'Les présentes CGU sont soumises au droit français.',
      'En cas de litige, les parties s\'efforceront de trouver une solution amiable avant toute procédure judiciaire.',
      'À défaut, les tribunaux compétents seront ceux du ressort du siège social de NEOBANK, sauf disposition impérative contraire.',
    ],
  },
]

export default function CGU() {
  return (
    <>
      <PageHero title="Conditions Générales d'Utilisation" lead="Les règles régissant l'utilisation de la plateforme NEOBANK et les obligations de chaque partie." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 780 }}>
          <motion.div {...fadeUp} style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
              Les présentes Conditions Générales d'Utilisation (CGU) définissent les modalités et conditions dans lesquelles NEOBANK met à disposition de ses utilisateurs la plateforme d'accompagnement financier et les services associés.
            </p>
          </motion.div>

          {sections.map((section, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              style={{ marginBottom: 40 }}
            >
              <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12, color: 'var(--text)' }}>{section.title}</h2>
              <div style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
                {section.content.map((paragraph, j) =>
                  paragraph === '' ? <br key={j} /> : <p key={j} style={{ marginBottom: 10 }}>{paragraph}</p>
                )}
              </div>
            </motion.div>
          ))}

          <motion.div {...fadeUp} style={{ borderTop: '1px solid var(--border)', paddingTop: 24, fontSize: 13, color: 'var(--text-3)', textAlign: 'center' }}>
            Dernière mise à jour : Septembre 2026. Ces conditions peuvent être modifiées à tout moment. Il est conseillé de les consulter régulièrement.
          </motion.div>
        </div>
      </section>
    </>
  )
}
