import { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Target, Zap, GraduationCap, Briefcase, Home as HomeIcon, Wrench, Globe, Wallet, Check, ArrowRight,
  Users, Clock, Star, TrendingUp, FileText, Lock, Smartphone, ShieldCheck, Banknote, Building,
} from 'lucide-react'
import FloatingDecorations from '../components/shared/FloatingDecorations'
import AnimatedCounter from '../components/shared/AnimatedCounter'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
const stagger = { whileInView: 'animate', viewport: { once: true, margin: '-40px' }, initial: 'initial', variants: { animate: { transition: { staggerChildren: 0.08 } } } }

// 8 grandes catégories de projets (modifiables facilement)
const categories = [
  { icon: HomeIcon, label: 'Immobilier', to: '/projets/immobilier', desc: 'Achat, reprise, investissement locatif.' },
  { icon: Zap, label: 'Automobile', to: '/projets/automobile', desc: 'Véhicule neuf ou d’occasion.' },
  { icon: Briefcase, label: 'Création d’entreprise', to: '/projets/entreprise', desc: 'Lancez ou développez votre activité.' },
  { icon: GraduationCap, label: 'Études', to: '/projets/etudes', desc: 'Formation, scolarité, mobilité.' },
  { icon: Wrench, label: 'Travaux', to: '/projets/travaux', desc: 'Rénovation, aménagement, énergie.' },
  { icon: Building, label: 'Construction', to: '/projets/construction', desc: 'Construction d’un bien neuf.' },
  { icon: Globe, label: 'Projet international', to: '/projets/international', desc: 'Projets à l’étranger.' },
  { icon: Wallet, label: 'Projet personnel', to: '/projets/personnel', desc: 'Mariage, santé, équipement.' },
]

// Indicateurs — à adapter selon les chiffres réellement vérifiés
const indicators = [
  { icon: Users, end: 10000, suffix: '+', label: 'Projets accompagnés' },
  { icon: Star, end: 98, suffix: ' %', label: 'Satisfaction' },
  { icon: Clock, end: 7, suffix: '/7', label: 'Disponibilité' },
  { icon: ShieldCheck, end: 100, suffix: ' %', label: 'Accompagnement personnalisé' },
]

const steps = [
  { n: '1', title: 'Présentez votre projet', text: 'Décrivez votre besoin, le montant souhaité et votre situation. Quelques minutes suffisent.' },
  { n: '2', title: 'Nous analysons votre demande', text: 'Notre équipe étudie votre dossier et revient vers vous avec une analyse personnalisée.' },
  { n: '3', title: 'Je définis vos besoins', text: 'Nous identifions ensemble les solutions d’accompagnement adaptées à votre situation.' },
  { n: '4', title: 'Vous suivez votre dossier', text: 'Suivez l’avancement, envoyez vos documents et échangez avec votre conseiller en ligne.' },
]

const testimonials = [
  { name: 'Claire M.', detail: 'Projet immobilier', avatar: 'C', stars: 5, text: 'Un accompagnement clair et professionnel. J’ai enfin su par où commencer.' },
  { name: 'Thomas B.', detail: 'Création d’entreprise', avatar: 'T', stars: 5, text: 'On m’a aidé à structurer mon projet de A à Z. Très rassurant.' },
  { name: 'Sarah D.', detail: 'Études à l’étranger', avatar: 'S', stars: 4, text: 'Équipe réactive et à l’écoute. Le suivi en ligne est très pratique.' },
]

export default function HomePage() {
  const { user } = useAuth()
  return (
    <>
      {/* ─── HERO ─── */}
      <section className="hero" style={{ position: 'relative' }}>
        <FloatingDecorations />
        <div className="hero-bg" style={{ background: 'linear-gradient(135deg, #0056B3, #003d7a)' }} />
        <div className="hero-overlay" />
        <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 32 }}>
          <motion.div className="hero-content" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }} style={{ flex: '1 1 min(100%, 400px)' }}>
            <div className="hero-badges">
              {['Accompagnement personnalisé', 'Suivi en ligne', '100% sécurisé'].map((b) => (
                <span key={b} className="hero-badge"><Check size={14} />{b}</span>
              ))}
            </div>
            <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}>
              Votre projet mérite une vraie <span className="shimmer-text">stratégie financière.</span>
            </motion.h1>
            <motion.p initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}>
              Présentez votre projet, définissez vos besoins et découvrez les solutions d’accompagnement adaptées à votre situation.
            </motion.p>
            <motion.div className="hero-actions" initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}>
              <Link to="/simulateur" className="btn btn-primary">Évaluer mon projet</Link>
              <Link to="/solutions" className="btn btn-ghost" style={{ borderColor: 'rgba(255,255,255,0.25)', color: '#fff' }}>Découvrir nos solutions</Link>
            </motion.div>
          </motion.div>
          <motion.div className="hero-simulator" initial={{ opacity: 0, x: 30, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}>
            <Link to="/simulateur" style={{ display: 'block', textDecoration: 'none' }}>
              <div className="card" style={{ padding: 32, textAlign: 'center', maxWidth: 360 }}>
                <div style={{ fontSize: 40, marginBottom: 8 }}>🧭</div>
                <h3 style={{ fontSize: 16, fontWeight: 800 }}>Simulez votre projet</h3>
                <p style={{ fontSize: 12, color: 'var(--text-3)', margin: '8px 0 16px' }}>Estimez vos besoins en quelques étapes simples.</p>
                <span className="btn btn-primary" style={{ display: 'inline-block' }}>Commencer</span>
              </div>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ─── INDICATEURS ─── */}
      <section className="section" style={{ padding: '32px 0' }}>
        <div className="container">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            {indicators.map((s, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08, duration: 0.4 }} style={{ textAlign: 'center', padding: 16, background: 'var(--bg-card)', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }}>
                <div style={{ width: 40, height: 40, margin: '0 auto 8px', borderRadius: 12, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon size={18} style={{ color: 'var(--blue)' }} />
                </div>
                <div style={{ fontSize: 22, fontWeight: 900, color: 'var(--blue)' }}><AnimatedCounter end={s.end} suffix={s.suffix} /></div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CATÉGORIES DE PROJETS ─── */}
      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Catégories</div>
            <h2 className="section-header">Quel est votre projet&nbsp;?</h2>
            <p className="section-sub">Choisissez une catégorie pour découvrir les solutions adaptées à votre projet.</p>
          </motion.div>
          <motion.div {...stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {categories.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div key={i} variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} whileHover={{ y: -4, boxShadow: '0 12px 40px rgba(0,86,179,0.12)' }} className="card" style={{ padding: 24 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 14, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                    <Icon size={22} style={{ color: 'var(--blue)' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, marginBottom: 6 }}>{c.label}</h3>
                  <p style={{ fontSize: 12.5, color: 'var(--text-2)', lineHeight: 1.5, minHeight: 38 }}>{c.desc}</p>
                  <Link to={c.to} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 700, color: 'var(--blue)', marginTop: 12 }}>
                    Explorer <ArrowRight size={14} />
                  </Link>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── PROCESSUS ─── */}
      <section className="section" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Accompagnement</div>
            <h2 className="section-header">Comment ça marche&nbsp;?</h2>
            <p className="section-sub">Un accompagnement simple et transparent, en quatre étapes.</p>
          </motion.div>
          <motion.div {...stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
            {steps.map((s, i) => (
              <motion.div key={i} className="step-card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }}>
                <motion.div className="step-number" whileHover={{ scale: 1.15 }} transition={{ duration: 0.4 }}>{s.n}</motion.div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── TÉMOIGNAGES ─── */}
      <section className="section section--alt" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingDecorations />
        <div className="container">
          <motion.div className="section-title" {...fadeUp}>
            <div className="section-eyebrow">Ils nous font confiance</div>
            <h2 className="section-header">Ce que disent nos clients</h2>
          </motion.div>
          <motion.div {...stagger} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
            {testimonials.map((t, i) => (
              <motion.div key={i} className="card" variants={{ initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0, transition: { duration: 0.5 } } }} style={{ padding: 24 }}>
                <div style={{ display: 'flex', gap: 1, color: '#FAC775', marginBottom: 12 }}>
                  {Array.from({ length: t.stars }).map((_, j) => <Star key={j} size={16} fill="currentColor" />)}
                </div>
                <p style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6, fontStyle: 'italic' }}>« {t.text} »</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--blue-bg)', color: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{t.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t.detail}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── CTA FINAL + TRANSPARENCE ─── */}
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div {...fadeUp}>
            <h2 className="section-header" style={{ marginBottom: 8 }}>Prêt à donner vie à votre projet&nbsp;?</h2>
            <p className="section-sub" style={{ maxWidth: 560, margin: '0 auto 20px' }}>Créez votre compte gratuit et lancez votre première demande en quelques minutes.</p>
            <Link to="/register" className="btn btn-primary">Démarrer mon projet</Link>
          </motion.div>
          <p className="small" style={{ marginTop: 24, maxWidth: 620, marginLeft: 'auto', marginRight: 'auto', color: 'var(--text-3)' }}>
            NEOBANK est une plateforme d’accompagnement et d’orientation financière. La présentation d’une demande ne garantit pas l’obtention d’un financement.
          </p>
        </div>
      </section>
    </>
  )
}