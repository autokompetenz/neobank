import { useLocation, Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './Navbar'
import Footer from './Footer'

export default function Layout({ children }) {
  const { pathname } = useLocation()
  const isBank = pathname.startsWith('/banque') || pathname.startsWith('/dashboard') || pathname.startsWith('/admin')

  return (
    <>
      {!isBank && <Navbar />}
      <AnimatePresence mode="wait">
        <motion.main
          key={pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          {children}
        </motion.main>
      </AnimatePresence>
      {!isBank && <Footer />}
      {!isBank && pathname !== '/simulateur' && pathname !== '/register' && pathname !== '/login' && (
        <Link to="/simulateur" className="btn-floating-demande">
          Évaluer mon projet
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
        </Link>
      )}
    </>
  )
}
