import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home, Zap, Briefcase, GraduationCap, Wrench, Building2, Globe, Wallet, ArrowRight,
} from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
const stagger = { whileInView: 'animate', viewport: { once: true, margin: '-40px' }, initial: 'initial', variants: { animate: { transition: { staggerChildren: 0.08 } } } }

const projects = [
  {
    icon: Home,
    slug: 'immobilier',
    title: 'Immobilier',
    desc: 'Achat, reprise, investissement locatif. Structurons ensemble votre projet immobilier.',
  },
  {
    icon: Zap,
    slug: 'automobile',
    title: 'Automobile',
    desc: 'Véhicule neuf ou d\'occasion. Trouvez le financement adapté à votre budget.',
  },
  {
    icon: Briefcase,
    slug: 'entreprise',
    title: 'Création d\'entreprise',
    desc: 'Lancez ou développez votre activité avec un accompagnement structuré.',
  },
  {
    icon: GraduationCap,
    slug: 'etudes',
    title: 'Études',
    desc: 'Formation, scolarité, mobilité internationale. Investissez dans votre avenir.',
  },
  {
    icon: Wrench,
    slug: 'travaux',
    title: 'Travaux',
    desc: 'Rénovation, aménagement, transition énergétique pour votre habitat.',
  },
  {
    icon: Building2,
    slug: 'construction',
    title: 'Construction',
    desc: 'Construction d\'un bien neuf. Du terrain à la livraison, un suivi complet.',
  },
  {
    icon: Globe,
    slug: 'international',
    title: 'Projets internationaux',
    desc: 'Projets à l\'étranger : études, investissement, installation.',
  },
  {
    icon: Wallet,
    slug: 'personnel',
    title: 'Projets personnels',
    desc: 'Mariage, santé, équipement, voyages. Donnez vie à vos projets.',
  },
]

export default function ProjectsPage() {
  return (
    <>
      <PageHero title="Nos projets" lead="Explorez nos huit catégories de projets et découvrez l'accompagnement adapté à chaque besoin financier." />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Projets</div>
            <h2 className="section-header">Explorez nos domaines d'expertise</h2>
            <p className="section-sub">Choisissez la catégorie qui correspond à votre projet pour en savoir plus sur nos solutions d'accompagnement.</p>
          </motion.div>

          <motion.div
            {...stagger}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 280px), 1fr))',
              gap: 20,
            }}
          >
            {projects.map((p) => {
              const Icon = p.icon
              return (
                <motion.div
                  key={p.slug}
                  variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}
                  whileHover={{ y: -6, boxShadow: '0 16px 48px rgba(0,86,179,0.12)' }}
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-lg)',
                    padding: 'clamp(24px, 3vw, 32px)',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    cursor: 'pointer',
                    textDecoration: 'none',
                    color: 'inherit',
                  }}
                >
                  <Link
                    to={`/projets/${p.slug}`}
                    style={{ textDecoration: 'none', color: 'inherit', display: 'flex', flexDirection: 'column', height: '100%' }}
                  >
                    <div style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      background: 'var(--blue-bg)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: 18,
                      transition: 'all 0.3s cubic-bezier(0.16,1,0.3,1)',
                    }}>
                      <Icon size={26} style={{ color: 'var(--blue)' }} />
                    </div>

                    <h3 style={{ fontSize: 17, fontWeight: 800, marginBottom: 8 }}>{p.title}</h3>
                    <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.65, flex: 1 }}>{p.desc}</p>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--blue)',
                      marginTop: 18,
                    }}>
                      Explorer <ArrowRight size={15} />
                    </div>
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <div className="section-eyebrow" style={{ marginBottom: 12 }}>Transparence</div>
            <h2 className="section-header" style={{ marginBottom: 8 }}>Un projet, un accompagnement</h2>
            <p className="section-sub" style={{ maxWidth: 600, margin: '0 auto 20px' }}>
              NEOBANK vous oriente et vous accompagne dans la structuration de votre projet financier.
              La présentation d'une demande ne garantit pas l'obtention d'un financement.
            </p>
            <Link to="/solutions" className="btn btn-ghost">Découvrir nos solutions</Link>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Prêt à démarrer votre projet ?"
        text="Créez votre compte et décrivez votre projet en quelques minutes."
        cta={{ to: '/register', label: 'Créer mon compte' }}
      />
    </>
  )
}
