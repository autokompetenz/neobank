import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

const fadeUp = { initial: { opacity: 0, y: 24 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true }, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }

export default function CTASection({ title, text, cta }) {
  return (
    <section className="section" style={{ position: 'relative' }}>
      <div className="container">
        <motion.div className="cta-card" {...fadeUp} whileHover={{ scale: 1.01 }}>
          <h2>{title}</h2>
          <p>{text}</p>
          <div className="d-flex gap-3 justify-content-center flex-wrap">
            <Link to={cta.to} className="btn btn-primary">{cta.label}</Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
