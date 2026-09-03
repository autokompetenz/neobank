import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useSSE } from '../services/sse';
import Sidebar from '../components/dashboard/Sidebar';
import MobileTabBar from '../components/dashboard/MobileTabBar';
import Overview from '../components/dashboard/Overview.jsx';
import AccountPage from '../components/dashboard/AccountPage';
import CardPage from '../components/dashboard/CardPage';
import IbanFlow from '../components/dashboard/IbanFlow';
import TransactionsPage from '../components/dashboard/TransactionsPage.jsx';
import TransfersPage from '../components/dashboard/TransfersPage.jsx';
import BeneficiariesPage from '../components/dashboard/BeneficiariesPage.jsx';
import ProfilePage from '../components/dashboard/ProfilePage.jsx';
import NotificationsPanel from '../components/dashboard/NotificationsPanel';
import ProjectsSection from '../components/dashboard/ProjectsSection.jsx';
import { Clock, Menu, Ban, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { DashboardSkeleton } from '../components/shared/Skeleton';

function PendingBanner({ suspended }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 ${suspended ? 'bg-red-100' : 'bg-amber-100'}`}>
        {suspended ? <Ban className="w-8 h-8 text-red-600" /> : <Clock className="w-8 h-8 text-amber-600" />}
      </div>
      <h3 className="text-[16px] font-semibold mb-2">{suspended ? 'Compte suspendu' : 'Fonctionnalité indisponible'}</h3>
      <p className="text-[13px] text-slate-500 max-w-sm">
        {suspended
          ? 'Votre compte a été désactivé. Vous ne pouvez pas utiliser cette fonctionnalité.'
          : 'Votre compte doit d&apos;abord être validé par un administrateur.'}
      </p>
    </div>
  );
}

export default function DashboardPage() {
  const { userProfile, refreshProfile, logout } = useAuth();
  const navigate = useNavigate();
  const { isConnected } = useSSE();
  const [activePage, setActivePage] = useState('overview');
  const [account, setAccount] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [card, setCard] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastAccountStatus, setLastAccountStatus] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pageLoading, setPageLoading] = useState(true);
  const accountRef = useRef(account);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await loadDashboard();
      toast.success('Données actualisées !', { duration: 2000 });
    } catch (error) {
      toast.error('Erreur lors de l\'actualisation');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    if (userProfile?.role === 'admin') navigate('/admin', { replace: true });
  }, [userProfile, navigate]);

  const loadDashboard = useCallback(async () => {
    try {
      const { data } = await api.get('/me');
      const newAccount = data.account;

      if (lastAccountStatus && newAccount) {
        const wasInactive = !(lastAccountStatus?.status === 'active' && lastAccountStatus?.accountVerified && lastAccountStatus?.ibanStatus === 'active');
        const isActiveNow = newAccount?.status === 'active' && newAccount?.accountVerified && newAccount?.ibanStatus === 'active';

        if (wasInactive && isActiveNow) {
          toast.success('Félicitations ! Votre compte et votre IBAN sont maintenant activés !', {
            duration: 6000,
            position: 'top-center',
            icon: 'success'
          });
          setTimeout(() => setActivePage('overview'), 1000);
        }

        if (!lastAccountStatus?.iban && newAccount?.iban) {
          toast.success('IBAN attribué ! Vous pouvez maintenant effectuer le virement.', {
            duration: 4000,
            position: 'top-center'
          });
        }

        if (lastAccountStatus?.ibanStatus !== 'active' && newAccount?.ibanStatus === 'active') {
          toast.success('IBAN activé ! Tous les services sont maintenant disponibles.', {
            duration: 5000,
            position: 'top-center',
            icon: 'success'
          });
        }

        if (lastAccountStatus?.status === 'pending' && newAccount?.status === 'active') {
          toast.success('Compte activé par l\'administrateur !', {
            duration: 5000,
            position: 'top-center'
          });
        }

        if (lastAccountStatus?.cardStatus !== 'active' && newAccount?.cardStatus === 'active') {
          toast.success('Carte bancaire activée !', {
            duration: 4000,
            position: 'top-center'
          });
        }

        if (lastAccountStatus?.kycStatus !== 'approved' && newAccount?.kycStatus === 'approved') {
          toast.success('Vérification d\'identité approuvée !', {
            duration: 4000,
            position: 'top-center'
          });
        }
      }

      setAccount(newAccount);
      setLastAccountStatus(newAccount);
      setTransactions(data.transactions || []);
      setNotifications(data.notifications || []);
      setCard(data.card);
    } catch (error) {
      if (error.response?.status === 401) {
        navigate('/', { replace: true });
        return;
      }
      toast.error('Erreur lors du chargement des données');
    } finally {
      setPageLoading(false);
    }
  }, [navigate, lastAccountStatus]);

  useEffect(() => {
    accountRef.current = account;
  }, [account]);

  useEffect(() => {
    loadDashboard();
    
    let interval = null;
    
    const startPolling = () => {
      const a = accountRef.current;
      const pollingInterval = (
        (a?.ibanStatus === 'assigned' || a?.ibanStatus === 'approved') ? 5000 :
        (a?.status === 'pending') ? 8000 :
        (a?.ibanStatus === 'pending' || a?.ibanStatus === 'requested') ? 5000 :
        (a?.cardStatus === 'pending' || a?.cardStatus === 'requested') ? 5000 :
        15000
      );
      
      if (interval) clearInterval(interval);
      
      interval = setInterval(() => {
        const ac = accountRef.current;
        const shouldPoll = (
          ac?.status === 'pending' || 
          ac?.ibanStatus === 'pending' || 
          ac?.ibanStatus === 'requested' ||
          (ac?.iban && ac?.ibanStatus === 'assigned' && !ac?.accountVerified) ||
          (ac?.iban && ac?.ibanStatus === 'approved' && !ac?.accountVerified) ||
          ac?.cardStatus === 'pending' ||
          ac?.cardStatus === 'requested'
        );
        
        if (shouldPoll) {
          loadDashboard();
        } else {
          clearInterval(interval);
          interval = null;
        }
      }, pollingInterval);
    };
    
    const a = accountRef.current;
    const needsPolling = (
      a?.status === 'pending' || 
      a?.ibanStatus === 'pending' || 
      a?.ibanStatus === 'requested' ||
      (a?.iban && a?.ibanStatus === 'assigned' && !a?.accountVerified) ||
      (a?.iban && a?.ibanStatus === 'approved' && !a?.accountVerified) ||
      a?.cardStatus === 'pending' ||
      a?.cardStatus === 'requested'
    );
    
    if (needsPolling) {
      startPolling();
    }
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [loadDashboard]);

  // Rafraîchir quand l'utilisateur revient sur l'onglet
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && account) {
        const hasPendingStatus = (
          account?.status === 'pending' || 
          account?.ibanStatus === 'pending' || 
          account?.ibanStatus === 'requested' ||
          account?.cardStatus === 'pending' ||
          account?.cardStatus === 'requested'
        );

        if (hasPendingStatus && !isConnected) {
          loadDashboard();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [account, loadDashboard, isConnected]);

  // Ajouter un raccourci clavier pour rafraîchir
  useEffect(() => {
    const handleKeyPress = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        handleManualRefresh();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleManualRefresh]);

  useEffect(() => {
    const handleAccountVerified = () => loadDashboard();
    const handleIbanAssigned = () => loadDashboard();
    const handleStatusChanged = () => loadDashboard();

    window.addEventListener('accountVerified', handleAccountVerified);
    window.addEventListener('ibanAssigned', handleIbanAssigned);
    window.addEventListener('statusChanged', handleStatusChanged);

    return () => {
      window.removeEventListener('accountVerified', handleAccountVerified);
      window.removeEventListener('ibanAssigned', handleIbanAssigned);
      window.removeEventListener('statusChanged', handleStatusChanged);
    };
  }, [activePage, loadDashboard]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const isPending = userProfile?.accountStatus === 'pending' || account?.status === 'pending';
  const isSuspended = userProfile?.accountStatus === 'suspended' || account?.status === 'suspended' || account?.status === 'blocked';
  const isLockedOps = isPending || isSuspended;

  const renderPage = () => {
    if (isLockedOps && ['transfer', 'iban', 'card'].includes(activePage)) {
      return <PendingBanner suspended={isSuspended} />;
    }
    switch (activePage) {
      case 'overview':
        return (
          <Overview
            account={account}
            card={card}
            transactions={transactions}
            notifications={notifications}
            onNavigate={setActivePage}
          />
        );
      case 'account':
        return <AccountPage account={account} />;
      case 'card':
        return <CardPage card={card} onRefresh={loadDashboard} />;
      case 'iban':
        return <IbanFlow account={account} onRefresh={loadDashboard} />;
      case 'activation':
        return <IbanFlow account={account} onRefresh={loadDashboard} onBack={() => setActivePage('overview')} />;
      case 'transactions':
        return <TransactionsPage transactions={transactions} onRefresh={loadDashboard} />;
      case 'transfer':
        return <TransfersPage account={account} onSuccess={loadDashboard} />;
      case 'beneficiaries':
        return <BeneficiariesPage />;
      case 'profile':
        return <ProfilePage onSaved={loadDashboard} />;
      case 'notifications':
        return (
          <NotificationsPanel
            notifications={notifications}
            onChanged={loadDashboard}
          />
        );
      case 'projects':
        return <ProjectsSection />;
      default:
        return (
          <Overview account={account} card={card} transactions={transactions} onNavigate={setActivePage} />
        );
    }
  };

  const pageTitles = {
    overview: 'Tableau de bord',
    transactions: 'Transactions',
    card: 'Ma carte',
    iban: 'IBAN / BIC',
    transfer: 'Virements',
    beneficiaries: 'Bénéficiaires',
    profile: 'Mon profil',
    notifications: 'Notifications',
    activation: 'Activation IBAN',
    projects: 'Mes projets',
  };

  return (
    <div className="dashboard-layout">
      <div className="hidden md:block">
        <Sidebar
          activePage={activePage}
          onNavigate={setActivePage}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          unreadCount={unreadCount}
        />
      </div>

      <div
        className={`md:hidden fixed inset-0 z-50 transition-[visibility] duration-200 ${mobileMenuOpen ? 'visible' : 'invisible'}`}
        aria-hidden={!mobileMenuOpen}
      >
        <button
          type="button"
          className={`absolute inset-0 transition-opacity duration-200 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0'}`}
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setMobileMenuOpen(false)}
          aria-label="Fermer le menu"
        />
        <div
          className={`absolute left-0 top-0 bottom-0 w-[min(288px,88vw)] max-w-full shadow-2xl transition-transform duration-200 ease-out ${
            mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
          style={{ background: 'var(--bg-card)' }}
        >
          <Sidebar
            variant="mobile"
            onClose={() => setMobileMenuOpen(false)}
            activePage={activePage}
            onNavigate={setActivePage}
            sidebarOpen
            setSidebarOpen={setSidebarOpen}
            unreadCount={unreadCount}
          />
        </div>
      </div>

      <main className="main-content">
        <header className="topbar">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className="menu-btn"
            aria-label="Ouvrir le menu"
          >
            <Menu size={18} />
          </button>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 15, fontWeight: 700, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{pageTitles[activePage] || 'NEOBANK'}</p>
            <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{userProfile?.email || 'Espace client'}</p>
          </div>
          {userProfile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--blue)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800 }}>
                {userProfile.firstName?.[0] || userProfile.email?.[0] || 'U'}
              </div>
              <button
                type="button"
                onClick={() => { logout(); navigate('/'); }}
                title="Déconnexion"
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, border: 'none', background: 'transparent', color: 'var(--text-3)', cursor: 'pointer', transition: 'all .2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(200,16,46,0.06)'; e.currentTarget.style.color = '#C8102E'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-3)'; }}
              >
                <LogOut size={16} />
              </button>
            </div>
          )}
        </header>

        <div className="content-area">
          {pageLoading ? <DashboardSkeleton /> : <div key={activePage} className="slide-up">{renderPage()}</div>}
        </div>
      </main>

      <MobileTabBar
        activePage={activePage}
        onNavigate={setActivePage}
        onOpenMenu={() => setMobileMenuOpen(true)}
      />
    </div>
  );
}
