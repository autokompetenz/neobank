import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Shield, ArrowRight, Mail, Lock, User, CheckCircle2, XCircle } from 'lucide-react';

function PasswordStrength({ password, rules }) {
  if (!password) return null;
  const errors = rules(password);
  const total = 5;
  const passed = total - errors.length;
  const pct = (passed / total) * 100;
  const color = pct <= 40 ? '#E24B4A' : pct <= 60 ? '#EF9F27' : pct <= 80 ? 'var(--blue)' : 'var(--green)';
  const label = pct <= 40 ? 'Faible' : pct <= 60 ? 'Moyen' : pct <= 80 ? 'Fort' : 'Excellent';
  const allRules = [
    { text: '8+ caractères', ok: password.length >= 8 },
    { text: 'Majuscule', ok: /[A-Z]/.test(password) },
    { text: 'Minuscule', ok: /[a-z]/.test(password) },
    { text: 'Chiffre', ok: /[0-9]/.test(password) },
    { text: 'Spécial (!@#…)', ok: /[^A-Za-z0-9]/.test(password) },
  ];
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <div style={{ flex: 1, height: 4, background: 'var(--bg-card2)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 99, transition: 'width .4s' }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 700, color, textTransform: 'uppercase', letterSpacing: '.06em' }}>
          {label}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '2px 12px' }}>
        {allRules.map((r, i) => (
          <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10, color: r.ok ? 'var(--green)' : 'var(--text-3)' }}>
            {r.ok ? <CheckCircle2 size={10} /> : <XCircle size={10} />}
            {r.text}
          </span>
        ))}
      </div>
    </div>
  );
}

function apiErrorMessage(err) {
  const msg = err.response?.data?.error;
  if (msg) return msg;
  if (err.code === 'ERR_NETWORK') return 'API injoignable — lancez le serveur (npm run dev).';
  return err.message || 'Une erreur est survenue';
}

export default function AuthPage({ initialMode }) {
  const [mode, setMode] = useState(initialMode || 'login');
  const [showPwd, setShowPwd] = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ email: '', password: '', confirmPassword: '', firstName: '', lastName: '' });
  const { login, register, passwordRules, isAdmin, user } = useAuth();
  const navigate = useNavigate();
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!user) return;
    if (isAdmin) navigate('/admin', { replace: true });
    else navigate('/dashboard', { replace: true });
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(form.email, form.password);
        toast.success('Connexion réussie');
      } else if (mode === 'register') {
        if (form.password !== form.confirmPassword) {
          setError('Les mots de passe ne correspondent pas');
          return;
        }
        const errs = passwordRules(form.password);
        if (errs.length) {
          setError('Mot de passe trop faible');
          return;
        }
        await register(form.email, form.password, form.firstName, form.lastName);
        toast.success('Compte créé — en attente de validation.');
        setTimeout(() => navigate('/dashboard'), 500);
      }
    } catch (err) {
      if (err.message?.startsWith('PASSWORD_RULES:')) {
        setError('Mot de passe trop faible');
      } else {
        setError(apiErrorMessage(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div className="auth-logo">
            <Shield size={28} />
          </div>
          <h1>Prestiter Banca</h1>
          <p className="subtitle">
            {mode === 'login' ? 'Accédez à votre espace' : 'Créez votre compte'}
          </p>
        </div>

        <div className="tabs">
          {[['login', 'Connexion'], ['register', 'Inscription']].map(([m, l]) => (
            <button key={m} type="button" onClick={() => { setMode(m); setError(''); }}
              className={`tab ${mode === m ? 'active' : ''}`}>
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {mode === 'register' && (
            <div className="form-row" style={{ gap: 10 }}>
              {[['firstName', 'Prénom'], ['lastName', 'Nom']].map(([k, ph]) => (
                <div key={k} style={{ position: 'relative' }}>
                  <User size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
                  <input value={form[k]} onChange={set(k)} placeholder={ph} required
                    className="input-base" style={{ paddingLeft: 36 }} />
                </div>
              ))}
            </div>
          )}

          <div style={{ position: 'relative' }}>
            <Mail size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input type="email" value={form.email} onChange={set('email')} placeholder="Email" required
              className="input-base" style={{ paddingLeft: 36 }} />
          </div>

          <div style={{ position: 'relative' }}>
            <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
            <input type={showPwd ? 'text' : 'password'} value={form.password} onChange={set('password')}
              placeholder="Mot de passe" required
              className="input-base" style={{ paddingLeft: 36, paddingRight: 36 }} />
            <button type="button" onClick={() => setShowPwd(s => !s)}
              style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
              {showPwd ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          {mode === 'register' && form.password.length > 0 && (
            <PasswordStrength password={form.password} rules={passwordRules} />
          )}

          {mode === 'register' && (
            <div style={{ position: 'relative' }}>
              <Lock size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
              <input type={showPwd2 ? 'text' : 'password'} value={form.confirmPassword} onChange={set('confirmPassword')}
                placeholder="Confirmer le mot de passe" required
                className="input-base"
                style={{
                  paddingLeft: 36, paddingRight: 36,
                  borderColor: form.confirmPassword && form.confirmPassword !== form.password ? 'rgba(200,16,46,0.5)' : undefined,
                }} />
              <button type="button" onClick={() => setShowPwd2(s => !s)}
                style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', padding: 4 }}>
                {showPwd2 ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          )}

          {error && (
            <div style={{
              padding: '10px 14px', background: 'rgba(200,16,46,0.08)',
              border: '1px solid rgba(200,16,46,0.2)', borderRadius: 'var(--radius)',
              fontSize: 13, color: '#C8102E',
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading || (mode === 'register' && form.confirmPassword !== form.password)}
            className="btn-primary" style={{ width: '100%' }}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : 'Créer mon compte'}
            {!loading && <ArrowRight size={14} />}
          </button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-3)', marginTop: 16 }}>
          Un compte gratuit sans engagement
        </p>
      </div>
    </div>
  );
}
