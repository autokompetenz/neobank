import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const pretTypes = [
  { to: '/prets/personnel', label: 'Personale' },
  { to: '/prets/urgence', label: 'Emergenza' },
  { to: '/prets/etudiant', label: 'Studentesco' },
  { to: '/prets/professionnel', label: 'Professionale' },
  { to: '/prets/travaux', label: 'Lavori' },
  { to: '/prets/consolidation', label: 'Consolidamento' },
  { to: '/prets/ptz', label: 'PTZ 0%' },
  { to: '/prets/p2p', label: 'P2P' },
]

const links = [
  { to: '/emprunter', label: 'Richiedere' },
  { to: '/preter', label: 'Investire' },
  { to: '/profils-acceptes', label: 'Prestiti', dropdown: pretTypes },
  { to: '/comment-ca-marche', label: 'Come funziona' },
  { to: '/faq', label: 'FAQ' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const ddRef = useRef(null)
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setOpen(false); setDropdownOpen(false) }, [pathname])

  useEffect(() => {
    const handleClick = (e) => {
      if (ddRef.current && !ddRef.current.contains(e.target)) setDropdownOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const isActive = (to) => pathname === to || (to === '/profils-acceptes' && pathname.startsWith('/prets/'))

  return (
    <>
      <nav className={`navbar${scrolled ? ' scrolled' : ''}`}>
        <div className="container">
          <Link to="/" className="navbar-brand">
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 16 }}>P</div>
            <span style={{ fontWeight: 800, fontSize: 18, marginLeft: 10, letterSpacing: '-.03em', color: 'var(--text)' }}>PRESTITER</span>
          </Link>

          <ul className="nav align-items-center">
            {links.map(l => l.dropdown ? (
              <li
                key={l.to}
                className="nav-dropdown"
                ref={ddRef}
                onMouseEnter={() => setDropdownOpen(true)}
                onMouseLeave={() => setDropdownOpen(false)}
              >
                <button
                  className={`nav-link${isActive(l.to) ? ' active' : ''}`}
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  {l.label}
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ marginLeft: 3, transition: 'transform 0.2s', transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {dropdownOpen && (
                  <div className="nav-dropdown-menu">
                    {pretTypes.map(p => (
                      <Link key={p.to} to={p.to} className="nav-dropdown-link" style={{ color: pathname === p.to ? 'var(--blue)' : 'var(--text-2)' }}>
                        {p.label}
                      </Link>
                    ))}
                  </div>
                )}
              </li>
            ) : (
              <li key={l.to}>
                <Link to={l.to} className={`nav-link${pathname === l.to ? ' active' : ''}`}>{l.label}</Link>
              </li>
            ))}
            {user && (
              <>
                <li className="nav-account-btn">
                  <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-ghost" style={{ fontSize: 13 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                    Area personale
                  </Link>
                </li>
                <li className="nav-account-btn">
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="btn btn-ghost"
                    style={{ fontSize: 13, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--text-2)', display: 'flex', alignItems: 'center', gap: 6 }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                    Déconnexion
                  </button>
                </li>
              </>
            )}
          </ul>

          <button className="navbar-toggler" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {open ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></> : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
            </svg>
          </button>
        </div>
      </nav>

      {open && (
        <div className="mobile-menu">
          <div className="mobile-menu-header">
            <Link to="/" onClick={() => setOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>P</div>
              <span style={{ fontWeight: 800, fontSize: 16, color: 'var(--text)' }}>PRESTITER</span>
            </Link>
            <button className="navbar-toggler" onClick={() => setOpen(false)} aria-label="Fermer">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <ul className="nav">
            {links.filter(l => !l.dropdown).map(l => (
              <li key={l.to}>
                <Link to={l.to} className={`nav-link${pathname === l.to ? ' active' : ''}`} onClick={() => setOpen(false)}>{l.label}</Link>
              </li>
            ))}
            <li>
              <Link to="/profils-acceptes" className={`nav-link${pathname === '/profils-acceptes' || pathname.startsWith('/prets/') ? ' active' : ''}`} onClick={() => setOpen(false)}>
                Tutti i prestiti
              </Link>
              <div className="mobile-submenu">
                {pretTypes.map(p => (
                  <Link key={p.to} to={p.to} className={`nav-link-small${pathname === p.to ? ' active' : ''}`} onClick={() => setOpen(false)}>{p.label}</Link>
                ))}
              </div>
            </li>
            <li style={{ marginTop: 8, width: '100%' }}>
              <Link to="/emprunter" className="btn btn-secondary w-100" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
                Fai richiesta di prestito
              </Link>
            </li>
            <li style={{ marginTop: 8, width: '100%' }}>
              {user && (
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="btn btn-primary w-100" style={{ justifyContent: 'center' }} onClick={() => setOpen(false)}>
                  Area personale
                </Link>
              )}
            </li>
            <li style={{ marginTop: 8, width: '100%' }}>
              {user && (
                <button
                  onClick={() => { logout(); navigate('/'); setOpen(false); }}
                  className="btn btn-ghost w-100"
                  style={{ justifyContent: 'center', fontSize: 13, border: '1px solid var(--border)', color: 'var(--text-2)' }}
                >
                  Déconnexion
                </button>
              )}
            </li>
          </ul>
        </div>
      )}
    </>
  )
}
