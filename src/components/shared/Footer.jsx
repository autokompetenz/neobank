import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="navbar-brand" style={{ marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 14 }}>P</div>
          </Link>
          <p style={{ maxWidth: 300 }}>Prestiter SPA è una piattaforma di prestito tra privati, semplice, veloce e 100% online.</p>
          <p className="small" style={{ marginTop: 12 }}>OAM n. A3056 — Registrato ORIAS</p>
        </div>

        <div>
          <h3>Richiedere</h3>
          <ul>
            <li><Link to="/comment-ca-marche">Come funziona</Link></li>
            <li><Link to="/emprunter">Simulatore di prestito</Link></li>
            <li><Link to="/profils-acceptes">Profili accettati</Link></li>
            <li><Link to="/faq">FAQ richiedente</Link></li>
          </ul>
        </div>

        <div>
          <h3>Investire</h3>
          <ul>
            <li><Link to="/preter">Diventa investitore</Link></li>
            <li><Link to="/preter#fonctionnement">Funzionamento</Link></li>
            <li><Link to="/faq">FAQ investitore</Link></li>
          </ul>
        </div>

        <div>
          <h3>Legale</h3>
          <ul>
            <li><Link to="/mentions-legales">Note legali</Link></li>
            <li><Link to="/cgu">CGU</Link></li>
            <li><Link to="/politique-confidentialite">Informativa sulla privacy</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider" />
      <div className="footer-bottom">
        <p className="small" style={{ margin: 0 }}>© {new Date().getFullYear()} Prestiter SPA. Tutti i diritti riservati.</p>
        <div className="footer-security">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> SSL sicuro</span>
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Dati crittografati</span>
        </div>
      </div>
    </footer>
  )
}
