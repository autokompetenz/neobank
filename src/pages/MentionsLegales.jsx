import { motion } from 'framer-motion'
import PageHero from '../components/shared/PageHero'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const sections = [
  {
    title: 'Éditeur du site',
    content: [
      'La plateforme NEOBANK est éditée par :',
      'NEOBANK SAS — Siège social à configurer.',
      'Capital social : à configurer.',
      'RCS : à configurer.',
      'N° SIREN / SIRET : à configurer dès que l\'immatriculation sera effective.',
      'N° d\'agrément : à configurer (le cas échéant).',
      'Directeur de la publication : à configurer.',
      'Hébergeur : à configurer.',
      '',
      'Les informations ci-dessus seront complétées dès que les formalités d\'immatriculation et d\'agrément seront finalisées. Aucune donnée d\'identification fictive n\'est communiquée.',
    ],
  },
  {
    title: 'Conditions d\'utilisation de la plateforme',
    content: [
      'NEOBANK est une plateforme d\'accompagnement et d\'orientation financière. Elle met à disposition des utilisateurs des outils de simulation, des formulaires de demande et un service de mise en relation avec des partenaires financiers.',
      'L\'accès à la plateforme est gratuit. L\'utilisateur s\'engage à fournir des informations exactes et à ne pas utiliser le service à des fins illicites.',
      'La plateforme ne constitue en aucun cas une offre de crédit, un conseil financier personnalisé ou une promesse de financement. Les résultats des simulations sont indicatifs et ne revêtent aucun caractère contractuel.',
      'NEOBANK se réserve le droit de modifier, suspendre ou interrompre tout ou partie du service à tout moment, sans préavis.',
    ],
  },
  {
    title: 'Propriété intellectuelle',
    content: [
      'L\'ensemble du contenu de la plateforme (textes, images, graphismes, logos, icônes, sons, logiciels, etc.) est la propriété exclusive de NEOBANK ou de ses partenaires et est protégé par les lois françaises et internationales relatives à la propriété intellectuelle.',
      'Toute reproduction, représentation, modification, publication, transmission ou dénaturation du site ou de son contenu, par quelque procédé que ce soit, est interdite sans autorisation préalable écrite.',
      'Les marques, logos et signes distinctifs reproduits sur le site sont déposés par NEOBANK ou ses partenaires. Toute reproduction sans autorisation constitue une contrefaçon.',
    ],
  },
  {
    title: 'Responsabilités',
    content: [
      'NEOBANK s\'efforce de fournir des informations fiables et actualisées sur sa plateforme. Cependant, elle ne garantit pas l\'exactitude, l\'exhaustivité ou l\'actualité des informations diffusées.',
      'NEOBANK ne saurait être tenue responsable des dommages directs ou indirects résultant de l\'utilisation de la plateforme, de l\'impossibilité d\'y accéder ou des erreurs ou omissions dans le contenu.',
      'Les liens hypertextes présents sur la plateforme renvoient vers des sites tiers. NEOBANK n\'exerce aucun contrôle sur leur contenu et décline toute responsabilité à leur égard.',
      'L\'utilisateur est seul responsable de l\'utilisation qu\'il fait de la plateforme et des informations qu\'il transmet.',
    ],
  },
  {
    title: 'Données personnelles',
    content: [
      'Le traitement des données à caractère personnel est décrit en détail dans notre Politique de Confidentialité, accessible depuis la page dédiée du site.',
      'NEOBANK s\'engage à respecter la réglementation en vigueur, notamment le Règlement Général sur la Protection des Données (RGPD) et la loi Informatique et Libertés.',
    ],
  },
  {
    title: 'Droit applicable',
    content: [
      'Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux compétents seront ceux du ressort du siège social de NEOBANK, sauf disposition impérative contraire.',
    ],
  },
]

export default function MentionsLegales() {
  return (
    <>
      <PageHero title="Mentions légales" lead="Informations légales relatives à l'édition, à l'utilisation et au contenu de la plateforme NEOBANK." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 780 }}>
          <motion.div {...fadeUp}>
            <div style={{
              background: 'rgba(250, 199, 117, 0.1)',
              border: '1px solid rgba(250, 199, 117, 0.3)',
              borderRadius: 'var(--radius)',
              padding: '14px 18px',
              marginBottom: 32,
              fontSize: 13,
              color: 'var(--text-2)',
              lineHeight: 1.6,
            }}>
              <strong style={{ color: 'var(--text)' }}>Note de transparence :</strong> NEOBANK est en phase de structuration. Les informations relatives à l'identité officielle de la société (SIREN, SIRET, agrément) seront mises à jour dès leur disponibilité. Aucune donnée fictive n'est affichée.
            </div>
          </motion.div>

          {sections.map((section, i) => (
            <motion.div
              key={i}
              {...fadeUp}
              style={{
                marginBottom: 40,
              }}
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
            Dernière mise à jour : Septembre 2026. Ces mentions légales peuvent être modifiées à tout moment. Il est conseillé de les consulter régulièrement.
          </motion.div>
        </div>
      </section>
    </>
  )
}
