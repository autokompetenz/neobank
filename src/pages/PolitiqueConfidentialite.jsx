import { motion } from 'framer-motion'
import PageHero from '../components/shared/PageHero'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const sections = [
  {
    title: 'Responsable du traitement',
    content: [
      'Le responsable du traitement des données à caractère personnel est NEOBANK SAS, dont le siège social et les coordonnées de contact seront communiqués dès finalisation de l\'immatriculation.',
    ],
  },
  {
    title: 'Données collectées',
    content: [
      'Dans le cadre de l\'utilisation de la plateforme NEOBANK, nous sommes amenés à collecter les données suivantes :',
      'Données d\'identification : nom, prénom, adresse email, numéro de téléphone.',
      'Données relatives au projet : type de projet, montant souhaité, situation professionnelle, revenus mensuels, pays de résidence.',
      'Données de connexion : adresse IP, type de navigateur, pages visitées, durée de la connexion.',
      'Données de transaction : historique des demandes soumises via la plateforme.',
      'Nous ne collectons pas de données sensibles (origine ethnique, opinions politiques, données de santé, etc.) sauf si cela est strictement nécessaire et avec votre consentement explicite.',
    ],
  },
  {
    title: 'Finalités du traitement',
    content: [
      'Vos données sont collectées et traitées aux fins suivantes :',
      'Gestion des demandes d\'accompagnement et de mise en relation avec des partenaires financiers.',
      'Suivi des dossiers et communication avec les utilisateurs.',
      'Amélioration de la plateforme et de l\'expérience utilisateur.',
      'Envoi de communications relatives à votre dossier (avec votre consentement).',
      'Respect des obligations légales et réglementaires.',
      'Statistiques anonymisées pour améliorer nos services.',
    ],
  },
  {
    title: 'Base légale du traitement',
    content: [
      'Le traitement de vos données repose sur :',
      'L\'exécution du contrat : traitement nécessaire à la fourniture du service d\'accompagnement demandé.',
      'Le consentement : envoi de communications commerciales et utilisation de cookies non essentiels.',
      'L\'obligation légale : conservation de certaines données conformément à la réglementation en vigueur.',
      'L\'intérêt légitime : amélioration de la plateforme et prévention de la fraude.',
    ],
  },
  {
    title: 'Durée de conservation',
    content: [
      'Vos données sont conservées pour la durée strictement nécessaire aux finalités pour lesquelles elles ont été collectées :',
      'Données de compte : durant toute la durée de la relation contractuelle et pendant 3 ans après la dernière interaction.',
      'Données de dossier : pendant la durée du traitement de la demande et pendant 2 ans après sa clôture.',
      'Données de connexion : pendant 13 mois maximum.',
      'Données à visée comptable : 10 ans conformément aux obligations légales.',
      'À l\'expiration de ces délais, les données sont supprimées ou anonymisées.',
    ],
  },
  {
    title: 'Destinataires des données',
    content: [
      'Vos données peuvent être partagées avec :',
      'Les partenaires financiers de NEOBANK, dans le cadre exclusif du traitement de votre demande d\'accompagnement.',
      'Les sous-traitants techniques (hébergeur, outils d\'analyse) agissant sous notre contrôle.',
      'Les autorités compétentes en cas d\'obligation légale.',
      'Nous ne vendons jamais vos données à des tiers à des fins commerciales.',
    ],
  },
  {
    title: 'Transferts hors Union européenne',
    content: [
      'Si des transferts de données en dehors de l\'UE sont nécessaires (par exemple via des outils d\'analyse), nous nous assurons que des garanties appropriées sont en place (clauses contractuelles types, adequacy decisions, etc.) conformément au RGPD.',
    ],
  },
  {
    title: 'Vos droits',
    content: [
      'Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez des droits suivants :',
      'Droit d\'accès : obtenir une copie des données vous concernant.',
      'Droit de rectification : corriger des données inexactes ou incomplètes.',
      'Droit à l\'effacement : demander la suppression de vos données.',
      'Droit à la limitation : demander la limitation du traitement.',
      'Droit à la portabilité : recevoir vos données dans un format structuré.',
      'Droit d\'opposition : vous opposer au traitement de vos données.',
      'Droit de retirer votre consentement à tout moment.',
      'Pour exercer ces droits, contactez-nous à l\'adresse email indiquée sur notre page Contact. Nous répondrons dans un délai maximum d\'un mois.',
    ],
  },
  {
    title: 'Cookies et traceurs',
    content: [
      'La plateforme NEOBANK utilise des cookies pour améliorer l\'expérience utilisateur et mesurer l\'audience du site.',
      'Cookies essentiels : indispensables au fonctionnement de la plateforme (session, sécurité).',
      'Cookies analytiques : permettent de mesurer l\'audience et d\'analyser l\'utilisation du site (anonymisés).',
      'Cookies de préférences : mémorisent vos choix (langue, région).',
      'Vous pouvez gérer vos préférences cookies via les paramètres de votre navigateur. La désactivation de certains cookies peut affecter votre expérience sur la plateforme.',
      'Nous n\'utilisons pas de cookies publicitaires ou de tracking à des fins commerciales.',
    ],
  },
  {
    title: 'Sécurité des données',
    content: [
      'NEOBANK met en œuvre les mesures techniques et organisationnelles appropriées pour protéger vos données contre tout accès non autorisé, altération, divulgation ou destruction.',
      'Ces mesures incluent le chiffrement des données en transit (TLS/SSL), le contrôle d\'accès strict, la journalisation des accès et des audits de sécurité réguliers.',
    ],
  },
  {
    title: 'Modification de la politique',
    content: [
      'Cette politique de confidentialité peut être modifiée à tout moment. En cas de modification substantielle, nous vous en informerons par email ou via une notification sur la plateforme.',
      'Dernière mise à jour : Septembre 2026.',
    ],
  },
]

export default function PolitiqueConfidentialite() {
  return (
    <>
      <PageHero title="Politique de confidentialité" lead="Comment NEOBANK collecte, utilise et protège vos données personnelles. Conforme au RGPD." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 780 }}>
          <motion.div {...fadeUp} style={{ marginBottom: 32 }}>
            <p style={{ fontSize: 15, color: 'var(--text-2)', lineHeight: 1.75 }}>
              Chez NEOBANK, la protection de vos données personnelles est une priorité. Cette politique de confidentialité décrit comment nous collectons, utilisons, partageons et protégeons vos informations dans le cadre de l'utilisation de notre plateforme d'accompagnement financier.
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
            Pour toute question relative à la protection de vos données, contactez-nous via notre page <a href="/contact" style={{ fontWeight: 700 }}>Contact</a>.
          </motion.div>
        </div>
      </section>
    </>
  )
}
