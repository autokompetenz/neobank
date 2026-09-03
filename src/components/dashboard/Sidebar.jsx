import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  LayoutDashboard, Activity, CreditCard, ArrowLeftRight,
  Globe, User, Bell, LogOut, Shield, ChevronLeft, ChevronRight,
  Building2, Wallet, Users, Target
} from 'lucide-react';

const navItems = [
  { section: 'Principal' },
  { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'transactions', label: 'Transactions', icon: Activity },
  { id: 'card', label: 'Ma carte', icon: CreditCard },
  { id: 'transfer', label: 'Virements', icon: ArrowLeftRight },
  { id: 'beneficiaries', label: 'Bénéficiaires', icon: Users },
  { section: 'Accompagnement' },
  { id: 'projects', label: 'Mes projets', icon: Target },
  { section: 'Compte' },
  { id: 'account', label: 'Mon compte', icon: Wallet },
  { id: 'iban', label: 'IBAN / BIC', icon: Globe },
  { id: 'profile', label: 'Mon profil', icon: User },
  { id: 'notifications', label: 'Notifications', icon: Bell, badge: true },
];

export default function Sidebar({ activePage, onNavigate, sidebarOpen, setSidebarOpen, unreadCount, variant = 'desktop', onClose }) {
  const { user, userProfile, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const isMobile = variant === 'mobile';
  const expanded = isMobile || sidebarOpen;

  const go = (id) => {
    onNavigate(id);
    if (isMobile) onClose?.();
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Déconnexion réussie');
      onClose?.();
      navigate('/');
    } catch (e) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  const initials = userProfile
    ? `${userProfile.firstName?.[0] || ''}${userProfile.lastName?.[0] || ''}`.toUpperCase()
    : (user?.email?.[0] || 'U').toUpperCase();

  return (
    <aside className={`sidebar ${isMobile ? 'w-full' : 'fixed left-0 top-0 z-30'} ${!isMobile && (sidebarOpen ? 'w-[260px]' : 'w-16')}`}>
      {/* Logo */}
      <div className={`sidebar-logo ${!isMobile && !sidebarOpen ? 'relative' : ''}`}>
        <div className="sidebar-logo-icon">
          <Building2 size={16} color="white" />
        </div>
        {expanded && (
          <>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-logo-title">NEOBANK</div>
              <div className="sidebar-logo-version">v2.0</div>
            </div>
            {isMobile ? (
              <button type="button" onClick={onClose} className="sidebar-close-btn" aria-label="Fermer le menu">
                <ChevronLeft size={20} />
              </button>
            ) : (
              <button type="button" onClick={() => setSidebarOpen(false)} className="sidebar-collapse-btn">
                <ChevronLeft size={14} />
              </button>
            )}
          </>
        )}
        {!expanded && !isMobile && (
          <button type="button" onClick={() => setSidebarOpen(true)} className="sidebar-expand-btn">
            <ChevronRight size={12} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            if (!expanded) return null;
            return (
              <div key={i} className="sidebar-section-title">
                {item.section}
              </div>
            );
          }
          const Icon = item.icon;
          const active = activePage === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => go(item.id)}
              title={!expanded ? item.label : undefined}
              className={`sidebar-link ${active ? 'active' : ''}`}
            >
              <Icon size={15} />
              {expanded && <span style={{ flex: 1, textAlign: 'left' }}>{item.label}</span>}
              {item.badge && unreadCount > 0 && (
                <span className={`sidebar-badge ${expanded ? '' : 'absolute'}`}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
          );
        })}

        {isAdmin && (
          <>
            {expanded && <div className="sidebar-section-title">Admin</div>}
            <button
              type="button"
              onClick={() => { navigate('/admin'); onClose?.(); }}
              className="sidebar-link admin"
            >
              <Shield size={15} />
              {expanded && <span>Espace Admin</span>}
            </button>
          </>
        )}
      </nav>

      {/* User block */}
      <div className="sidebar-user">
        <div className={`sidebar-user-info ${!expanded && !isMobile ? 'justify-center' : ''}`}>
          <div className="sidebar-avatar">
            {userProfile?.photoURL
              ? <img src={userProfile.photoURL} alt="" className="sidebar-avatar-img" />
              : initials}
          </div>
          {expanded && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="sidebar-user-name">{userProfile?.displayName || user?.email}</div>
              <div className="sidebar-user-role">Compte Standard</div>
            </div>
          )}
          <button type="button" onClick={handleLogout} title="Déconnexion" className="sidebar-logout-btn">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
}
