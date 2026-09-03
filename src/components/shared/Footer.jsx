import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <Link to="/" className="navbar-brand" style={{ marginBottom: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 13 }}>N</div>
            <span style={{ fontWeight: 800, fontSize: 17, marginLeft: 8, color: 'var(--text)' }}>NEOBANK</span>
          </Link>
          <p style={{ maxWidth: 300 }}>NEOBANK est une plateforme d'accompagnement et d'orientation financière : présentez votre projet, définissez vos besoins et découvrez les solutions adaptées.</p>
        </div>

        <div>
          <h3>Mon projet</h3>
          <ul>
            <li><Link to="/comment-ca-marche">Comment ça marche</Link></li>
            <li><Link to="/simulateur">Simulateur</Link></li>
            <li><Link to="/projets">Catégories de projets</Link></li>
            <li><Link to="/faq">FAQ</Link></li>
          </ul>
        </div>

        <div>
          <h3>Ressources</h3>
          <ul>
            <li><Link to="/solutions">Nos solutions</Link></li>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/mentions-legales">Mentions légales</Link></li>
            <li><Link to="/politique-confidentialite">Politique de confidentialité</Link></li>
          </ul>
        </div>

        <div>
          <h3>À savoir</h3>
          <ul>
            <li><Link to="/cgp">CGU</Link></li>
            <li><Link to="/partenaires">Nos partenaires</Link></li>
            <li><Link to="/auth">Connexion</Link></li>
            <li><Link to="/register">Démarrer mon projet</Link></li>
          </ul>
        </div>
      </div>

      <div className="footer-divider" />
      <div className="footer-bottom">
        <p className="small" style={{ margin: 0 }}>© {new Date().getFullYear()} NEOBANK. NEOBANK est une plateforme d'accompagnement et d'orientation. La présentation d'une demande ne garantit pas l'obtention d'un financement.</p>
        <div className="footer-security">
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> SSL sécurisé</span>
          <span><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> Données chiffrées</span>
        </div>
      </div>
    </footer>
  )
}