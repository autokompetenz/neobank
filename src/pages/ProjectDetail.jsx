import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Home,
  Car,
  Briefcase,
  GraduationCap,
  HardHat,
  Wrench,
  Globe,
  User,
  FileText,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Users,
  Shield,
  Heart,
  TreePine,
  BookOpen,
  Award,
} from 'lucide-react'
import PageHero from '../components/shared/PageHero'
import CTASection from '../components/shared/CTASection'
import FloatingDecorations from '../components/shared/FloatingDecorations'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

const projectData = {
  immobilier: {
    icon: Home,
    title: 'Projet immobilier',
    heroLead: 'Accompagnement pour votre projet immobilier : achat, construction ou investissement locatif.',
    description: 'Que vous souhaitiez acquérir un bien résidentiel, investir dans l\'immobilier locatif ou financer un projet de construction, NEOBANK vous accompagne dans l\'orientation de votre projet immobilier. Notre équipe vous aide à structurer votre demande et à identifier les solutions de financement les plus adaptées à votre situation.',
    keyPoints: [
      { icon: Home, text: 'Achat de résidence principale ou secondaire' },
      { icon: Briefcase, text: 'Investissement locatif (LMNP, pinel, etc.)' },
      { icon: HardHat, text: 'Construction neuve ou programme VEFA' },
      { icon: Wrench, text: 'Gros œuvre, extension ou rénovation lourde' },
    ],
    documents: [
      'Justificatif de revenus (3 derniers bulletins de salaire ou bilans)',
      'Relevés bancaires des 3 derniers mois',
      'Compromis de vente ou devis de travaux',
      'Attestation de propriété du terrain (le cas échéant)',
      'Document d\'identité en cours de validité',
    ],
  },
  automobile: {
    icon: Car,
    title: 'Projet automobile',
    heroLead: 'Financement de votre véhicule neuf ou d\'occasion : accompagnement personnalisé.',
    description: 'NEOBANK vous aide à trouver la solution de financement la plus adaptée pour l\'acquisition d\'un véhicule, qu\'il soit neuf ou d\'occasion. Notre équipe analyse votre situation et vous oriente vers les options les plus avantageuses : crédit auto, leasing, LOA ou LLD.',
    keyPoints: [
      { icon: Car, text: 'Achat de véhicule neuf ou d\'occasion' },
      { icon: Briefcase, text: 'Véhicule professionnel ou utilitaire' },
      { icon: Globe, text: 'Véhicule importé ou électrique' },
      { icon: CheckCircle, text: 'Options de financement multiples' },
    ],
    documents: [
      'Devis du véhicule (concessionnaire ou professionnel)',
      'Justificatif de revenus',
      'Relevés bancaires des 3 derniers mois',
      'Permis de conduire valide',
      'Document d\'identité en cours de validité',
    ],
  },
  entreprise: {
    icon: Briefcase,
    title: 'Création d\'entreprise',
    heroLead: 'Financement de votre projet entrepreneurial : de l\'idée au lancement.',
    description: 'Créer ou reprendre une entreprise nécessite un financement solide. NEOBANK vous accompagne dans l\'orientation de votre projet entrepreneurial, en vous connectant avec des partenaires financiers spécialisés en financement d\'entreprise. Nous vous aidons à structurer votre plan d\'affaires et à préparer votre demande.',
    keyPoints: [
      { icon: Briefcase, text: 'Création d\'entreprise ou start-up' },
      { icon: Users, text: 'Reprise d\'activité existante' },
      { icon: Globe, text: 'Expansion internationale' },
      { icon: Shield, text: 'Accompagnement personnalisé' },
    ],
    documents: [
      'Business plan prévisionnel (3 à 5 ans)',
      'Statuts de la société (ou projet de statuts)',
      'Justificatif d\'apport personnel',
      'Étude de marché',
      'CV et parcours professionnel des dirigeants',
      'Devis d\'investissement initial',
    ],
  },
  etudes: {
    icon: GraduationCap,
    title: 'Projet d\'études',
    heroLead: 'Financement de votre parcours académique : études en France ou à l\'étranger.',
    description: 'Que vous souhaitiez poursuivre des études supérieures en France ou à l\'étranger, NEOBANK vous oriente vers les solutions de financement adaptées à votre projet académique. Notre équipe vous accompagne dans la préparation de votre dossier et l\'identification des dispositifs disponibles.',
    keyPoints: [
      { icon: GraduationCap, text: 'Études supérieures en France' },
      { icon: Globe, text: 'Études à l\'étranger' },
      { icon: BookOpen, text: 'Formation professionnelle continue' },
      { icon: Award, text: 'Programmes d\'excellence' },
    ],
    documents: [
      'Certificat d\'inscription ou de pré-inscription',
      'Détail des frais de scolarité',
      'Justificatif de revenus (ou garants)',
      'Attestation de bourse (le cas échéant)',
      'Document d\'identité en cours de validité',
    ],
  },
  construction: {
    icon: HardHat,
    title: 'Projet de construction',
    heroLead: 'Construction neuve : accompagnement pour la réalisation de votre projet immobilier.',
    description: 'Construire un bien immobilier est un projet ambitieux qui nécessite un financement adapté. NEOBANK vous accompagne dans l\'orientation de votre projet de construction, de l\'obtention du permis de construire à la réception des travaux. Notre équipe vous met en relation avec des partenaires spécialisés.',
    keyPoints: [
      { icon: HardHat, text: 'Construction de maison individuelle' },
      { icon: Home, text: 'Programme VEFA (Vente en l\'État Futur d\'Achèvement)' },
      { icon: Wrench, text: 'Extension ou surélévation' },
      { icon: Shield, text: 'Garanties de livraison' },
    ],
    documents: [
      'Plan architectural et notice descriptive',
      'Devis du constructeur ou maître d\'œuvre',
      'Permis de construire (ou demande en cours)',
      'Justificatif de propriété du terrain',
      'Justificatif de revenus et d\'apport personnel',
      'Assurance dommages-ouvrage',
    ],
  },
  travaux: {
    icon: Wrench,
    title: 'Projet de travaux',
    heroLead: 'Travaux de rénovation, amélioration ou mise aux normes de votre habitat.',
    description: 'Vous souhaitez réaliser des travaux dans votre logement ? NEOBANK vous accompagne dans l\'orientation de votre projet de rénovation, qu\'il s\'agisse d\'amélioration esthétique, de mise aux normes énergétiques ou de transformation de votre habitat. Nous vous orientons vers les dispositifs de financement disponibles.',
    keyPoints: [
      { icon: Wrench, text: 'Rénovation énergétique (isolation, chauffage)' },
      { icon: Home, text: 'Aménagement intérieur (cuisine, salle de bain)' },
      { icon: HardHat, text: 'Mise aux normes (électricité, plomberie)' },
      { icon: TreePine, text: 'Ravalement de façade, toiture' },
    ],
    documents: [
      'Devis détaillé des travaux (au moins 2 devis)',
      'Justificatif de propriété',
      'Justificatif de revenus',
      'Description du projet et des travaux prévus',
      'Document d\'identité en cours de validité',
    ],
  },
  international: {
    icon: Globe,
    title: 'Projet international',
    heroLead: 'Financement de projets à dimension internationale : expatriation, investissement ou commerce.',
    description: 'Les projets à dimension internationale nécessitent un accompagnement spécifique. NEOBANK vous oriente vers les solutions de financement adaptées à l\'expatriation, l\'investissement immobilier à l\'étranger, l\'import-export ou le développement commercial international.',
    keyPoints: [
      { icon: Globe, text: 'Expatriation ou retour en France' },
      { icon: Home, text: 'Achat immobilier à l\'étranger' },
      { icon: Briefcase, text: 'Commerce international' },
      { icon: Shield, text: 'Adapté aux situations spécifiques' },
    ],
    documents: [
      'Justificatif de situation professionnelle internationale',
      'Contrat de travail ou convention d\'accueil',
      'Justificatif de revenus (traduction si nécessaire)',
      'Relevés bancaires',
      'Document d\'identité en cours de validité',
    ],
  },
  personnel: {
    icon: User,
    title: 'Projet personnel',
    heroLead: 'Financement de votre projet personnel : mariage, voyage, santé ou dépenses importantes.',
    description: 'Un projet personnel important mérite un accompagnement adapté. NEOBANK vous aide à structurer votre demande de financement pour tout projet personnel nécessitant un apport financier : mariage, voyage, dépenses de santé, achat d\'un bien de consommation ou tout autre projet.',
    keyPoints: [
      { icon: Heart, text: 'Mariage ou événement familial' },
      { icon: Globe, text: 'Voyage ou expédition' },
      { icon: Shield, text: 'Frais de santé ou bien-être' },
      { icon: User, text: 'Tout autre projet personnel' },
    ],
    documents: [
      'Justificatif de revenus',
      'Relevés bancaires des 3 derniers mois',
      'Devis ou devis estimatif du projet',
      'Document d\'identité en cours de validité',
    ],
  },
}

const fallbackProject = {
  icon: FileText,
  title: 'Projet',
  heroLead: 'Découvrez les informations relatives à ce type de projet.',
  description: 'Ce type de projet peut nécessiter un financement adapté. NEOBANK vous accompagne dans l\'orientation de votre projet et vous met en relation avec des partenaires financiers qualifiés.',
  keyPoints: [],
  documents: [],
}

export default function ProjectDetail() {
  const { slug } = useParams()
  const project = projectData[slug] || fallbackProject
  const Icon = project.icon

  return (
    <>
      <PageHero
        title={project.title}
        lead={project.heroLead}
      />

      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container" style={{ maxWidth: 800 }}>
          <motion.div {...fadeUp}>
            <p style={{ fontSize: 16, color: 'var(--text-2)', lineHeight: 1.75, marginBottom: 32 }}>
              {project.description}
            </p>
          </motion.div>

          {project.keyPoints.length > 0 && (
            <motion.div {...fadeUp}>
              <div className="section-eyebrow">Points clés</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>
                Ce que ce projet implique
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
                {project.keyPoints.map((point, i) => {
                  const PointIcon = point.icon
                  return (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 14,
                      padding: 18,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius)',
                      transition: 'box-shadow 0.2s',
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 10,
                        background: 'var(--blue-bg)',
                        color: 'var(--blue)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}>
                        <PointIcon size={20} />
                      </div>
                      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)', lineHeight: 1.5, paddingTop: 8 }}>
                        {point.text}
                      </span>
                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {project.documents.length > 0 && (
            <motion.div {...fadeUp} style={{ marginTop: 40 }}>
              <div className="section-eyebrow">Documents</div>
              <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>
                Documents habituellement requis
              </h2>
              <div style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                padding: 24,
              }}>
                <p style={{ fontSize: 13, color: 'var(--text-3)', marginBottom: 16, lineHeight: 1.6 }}>
                  La liste ci-dessous est indicative. Les documents exacts vous seront communiqués par notre équipe après analyse de votre dossier.
                </p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {project.documents.map((doc, i) => (
                    <li key={i} style={{
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 10,
                      padding: '8px 0',
                      borderBottom: i < project.documents.length - 1 ? '1px solid var(--border)' : 'none',
                      fontSize: 14,
                      color: 'var(--text-2)',
                    }}>
                      <FileText size={16} style={{ color: 'var(--blue)', flexShrink: 0, marginTop: 3 }} />
                      {doc}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}

          <motion.div {...fadeUp} style={{
            marginTop: 32,
            background: 'rgba(250, 199, 117, 0.1)',
            border: '1px solid rgba(250, 199, 117, 0.3)',
            borderRadius: 'var(--radius)',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <AlertTriangle size={18} style={{ color: '#B8860B', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 13, color: 'var(--text-2)', margin: 0, lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text)' }}>Rappel :</strong> NEOBANK est une plateforme d'accompagnement et d'orientation financière. La soumission d'une demande ne constitue en aucun cas une promesse de financement. La décision finale appartient aux partenaires financiers.
            </p>
          </motion.div>

          <motion.div {...fadeUp} style={{ textAlign: 'center', marginTop: 32 }}>
            <Link to="/simulateur" className="btn btn-primary">
              Lancer une simulation <ArrowRight size={16} />
            </Link>
          </motion.div>
        </div>
      </section>

      <CTASection
        title="Besoin d'accompagnement ?"
        text="Notre équipe est disponible pour répondre à vos questions et vous orienter."
        cta={{ to: '/contact', label: 'Nous contacter' }}
      />
    </>
  )
}
