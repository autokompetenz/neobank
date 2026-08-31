import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Globe, CreditCard, ArrowLeftRight,
  FileText, TrendingUp, Shield, LogOut,
  AlertTriangle, Search, ChevronLeft,
  Menu, X, Ban, RefreshCw, User, Plus, Minus,
  AlertCircle, Upload, Trash2, DollarSign,
  Scale, ClipboardList, ShieldCheck
} from 'lucide-react';
import TabIban from '../components/admin/TabIban';
import TabWithdrawalRequests from '../components/admin/TabWithdrawalRequests';
import TabProofValidation from '../components/admin/TabProofValidation';
import TabKyc from '../components/admin/TabKyc';
import TabTransactions from '../components/admin/TabTransactions';
import ConfirmDialog from '../components/shared/ConfirmDialog';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

function Chip({ color = 'gray', children }) {
  const cls = {
    green: 'badge-green',
    amber: 'badge-amber',
    red: 'badge-red',
    blue: 'badge-blue',
    gray: '',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${cls[color]}`}>{children}</span>;
}

function Avatar({ name = '', size = 'sm' }) {
  const initials = name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-teal-100 text-teal-800', 'bg-blue-100 text-blue-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-800'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : size === 'lg' ? 'w-12 h-12 text-[13px]' : 'w-10 h-10 text-[12px]';
  return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>{initials}</div>;
}

const TABS = [
  { id: 'overview', label: 'Aperçu', icon: LayoutDashboard },
  { id: 'clients', label: 'Comptes Clients', icon: Users },
  { id: 'kyc', label: 'KYC', icon: Shield },
  { id: 'iban', label: 'IBAN', icon: Globe },
  { id: 'withdrawal-requests', label: 'Retraits', icon: ArrowLeftRight },
  { id: 'withdrawal-proofs', label: 'Preuves Retrait', icon: Upload },
  { id: 'cards', label: 'Cartes', icon: CreditCard },
  { id: 'transactions', label: 'Transactions', icon: TrendingUp },
  { id: 'tx', label: 'Dépôts/Retraits', icon: DollarSign },
  { id: 'transfers', label: 'Virements', icon: ArrowLeftRight },
  { id: 'rules', label: 'Règles', icon: Scale },
  { id: 'audit', label: 'Journal Audit', icon: ClipboardList },
  { id: 'admins', label: 'Rôles Admin', icon: ShieldCheck },
];

export default function AdminPage() {
  const { isAdmin, logout, userProfile, user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebar] = useState(false);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ open: false, title: '', message: '', danger: false, onConfirm: () => {} });
  const [rules, setRules] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [allTransfers, setAllTransfers] = useState([]);
  const [adminUsers, setAdminUsers] = useState([]);

  const load = useCallback(async () => {
    try {
      const { data: d } = await api.get('/admin/data');
      setData(d);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Chargement admin impossible');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }
    load();
  }, [isAdmin, navigate, load]);

  const loadRules = async () => {
    try {
      const { data: d } = await api.get('/admin/rules');
      setRules(d.rules || []);
    } catch (e) { toast.error('Erreur lors du chargement des règles'); }
  };

  const loadAudit = async () => {
    try {
      const { data: d } = await api.get('/admin/audit-logs?limit=100');
      setAuditLogs(d.logs || []);
    } catch (e) { toast.error('Erreur lors du chargement du journal'); }
  };

  const loadTransfers = async () => {
    try {
      const { data: d } = await api.get('/admin/transfers');
      setAllTransfers(d.transfers || []);
    } catch (e) { toast.error('Erreur lors du chargement des virements'); }
  };

  const loadAdmins = async () => {
    try {
      const { data: d } = await api.get('/admin/admins');
      setAdminUsers(d.admins || []);
    } catch (e) { toast.error('Erreur lors du chargement des admins'); }
  };

  useEffect(() => {
    if (tab === 'rules') loadRules();
    if (tab === 'audit') loadAudit();
    if (tab === 'transfers') loadTransfers();
    if (tab === 'admins') loadAdmins();
  }, [tab]);

  if (!isAdmin) return null;
  if (loading && !data) {
    return <div className="min-h-screen bg-slate-50 flex items-center justify-center"><p className="text-slate-500">Chargement admin…</p></div>;
  }


  const { users = [], requests = [], accounts = [], cards: cardsAdmin = [], cardRequests = [], transactions = [], kycSubmissions = [] } = data || {};

  // Calculer les compteurs pour l'aperçu
  const pendingAccounts = users.filter((u) => u.accountStatus === 'pending').length;
  const pendingKyc = kycSubmissions.filter((r) => r.status === 'pending').length;
  const pendingIban = requests.filter((r) => (r.type === 'iban_request' || r.step === 'iban_request') && r.status === 'pending').length;
  const pendingCards = cardRequests.filter((c) => c.status === 'pending').length; // Utiliser cardRequests
  const pendingActivations = requests.filter((r) => r.step === 'transfer_proof' && r.status === 'pending').length;
  const totalBalance = accounts.reduce((s, a) => s + (a.balance || 0), 0);
  const shared = { users, requests, accounts, cards: cardsAdmin, cardRequests, transactions, kycSubmissions, setTab, load, adminId: user?.id, setConfirm, rules, loadRules, auditLogs, allTransfers, loadTransfers, adminUsers, loadAdmins };

  return (
    <div className="min-h-screen bg-[var(--bg)] flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-[var(--bg-card)] border-r border-[var(--border)]">
        <div className="p-4 border-b border-[var(--border)]">
          <h2 className="font-semibold text-[var(--text)]">Prestiter Admin</h2>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {TABS.map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                  tab === t.id
                    ? 'bg-blue-50 text-[var(--blue)] border border-blue-200'
                    : 'text-[var(--text-2)] hover:bg-[var(--bg)]'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </nav>
        <div className="p-4 border-t border-[var(--border)]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
          >
            <LogOut className="w-4 h-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* Mobile menu */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebar(false)} />
          <aside className="relative flex flex-col w-64 bg-[var(--bg-card)]">
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="font-semibold text-[var(--text)]">Prestiter Admin</h2>
              <button onClick={() => setSidebar(false)} className="text-[var(--text-3)]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <nav className="flex-1 p-2 space-y-1">
              {TABS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setTab(t.id); setSidebar(false); }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
                      tab === t.id
                        ? 'bg-blue-50 text-[var(--blue)] border border-blue-200'
                        : 'text-[var(--text-2)] hover:bg-[var(--bg)]'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {t.label}
                  </button>
                );
              })}
            </nav>
            <div className="p-4 border-t border-[var(--border)]">
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition"
              >
                <LogOut className="w-4 h-4" />
                Déconnexion
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="md:hidden flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 bg-[var(--bg-card)] border-b border-[var(--border)] sticky top-0 z-30">
          <button type="button" onClick={() => setSidebar(true)} className="text-[var(--text-2)] p-1">
            <Menu className="w-4.5 h-4.5 sm:w-5 sm:h-5" />
          </button>
          <span className="font-semibold text-[13px] sm:text-[14px]">Prestiter Admin</span>
        </header>
        <main className="flex-1 p-3 sm:p-4 md:p-6 overflow-y-auto">
          {loading && !data ? (
            <p className="text-[var(--text-3)] text-[13px]">Chargement…</p>
          ) : (
            <>
              {tab === 'overview' && <TabOverview {...shared} totalBalance={totalBalance} pendingIban={pendingIban} pendingCards={pendingCards} pendingAccounts={pendingAccounts} pendingKyc={pendingKyc} pendingActivations={pendingActivations} />}
              {tab === 'clients' && <TabClients {...shared} />}
              {tab === 'kyc' && <TabKyc {...shared} />}
              {tab === 'iban' && <TabIban {...shared} />}
              {tab === 'withdrawal-requests' && <TabWithdrawalRequests {...shared} />}
              {tab === 'withdrawal-proofs' && <TabProofValidation {...shared} />}
              {tab === 'cards' && <TabCards {...shared} />}
              {tab === 'transactions' && <TabTransactions {...shared} />}
              {tab === 'tx' && <TabTx {...shared} />}
              {tab === 'transfers' && <TabTransfers {...shared} />}
              {tab === 'rules' && <TabRules {...shared} />}
              {tab === 'audit' && <TabAudit {...shared} />}
              {tab === 'admins' && <TabAdminRoles {...shared} />}
            </>
          )}
        </main>
      </div>
      <ConfirmDialog
        open={confirm.open}
        title={confirm.title}
        message={confirm.message}
        danger={confirm.danger}
        confirmLabel="Supprimer"
        onConfirm={confirm.onConfirm}
        onCancel={() => setConfirm(prev => ({ ...prev, open: false }))}
      />
    </div>
  );
}

// TabOverview component
function TabOverview({ users, totalBalance, pendingIban, pendingCards, pendingAccounts, pendingKyc, pendingActivations, setTab }) {
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Vue d'ensemble</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Clients', val: users.length, icon: Users, color: 'bg-blue-50 text-[var(--blue)]' },
          { label: 'Masse (EUR)', val: fmt(totalBalance), icon: TrendingUp, color: 'bg-blue-50 text-[var(--blue)]' },
          { label: 'IBAN attente', val: pendingIban, icon: Globe, color: pendingIban ? 'bg-amber-50 text-amber-700' : 'bg-[var(--bg)]' },
          { label: 'Activations', val: pendingActivations, icon: User, color: pendingActivations ? 'bg-red-50 text-red-600' : 'bg-[var(--bg)]' },
        ].map((s, i) => {
          const Icon = s.icon;
          return (
            <div key={i} className="card p-3 sm:p-4">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center mb-2 sm:mb-3 ${s.color}`}>
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <p className="text-[10px] sm:text-[11px] text-[var(--text-3)]">{s.label}</p>
              <p className="text-[14px] sm:text-[18px] font-semibold font-mono mt-0.5">{s.val}</p>
            </div>
          );
        })}
      </div>
      {(pendingIban + pendingCards + pendingAccounts + pendingKyc + pendingActivations) > 0 && (
        <div className="badge-amber p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
          <span className="text-[11px] sm:text-[13px] flex-1">Actions en attente — utilisez les onglets.</span>
          {pendingActivations > 0 && <button type="button" onClick={() => setTab('withdrawal-requests')} className="text-[11px] font-semibold underline whitespace-nowrap">Voir les activations</button>}
          {pendingIban > 0 && <button type="button" onClick={() => setTab('iban')} className="text-[11px] font-semibold underline whitespace-nowrap">Voir les demandes IBAN</button>}
          {pendingKyc > 0 && <button type="button" onClick={() => setTab('kyc')} className="text-[11px] font-semibold underline whitespace-nowrap">Voir les KYC</button>}
        </div>
      )}
    </div>
  );
}

// TabClients component
function TabClients({ users, accounts, load, setConfirm }) {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState(null);
  const [ibanForm, setIbanForm] = useState({});
  const filtered = users.filter((u) => !q || `${u.displayName} ${u.email}`.toLowerCase().includes(q.toLowerCase()));

  const acc = (id) => accounts.find((a) => a.id === id);
  const verify = async (id) => {
    try {
      await api.post(`/admin/users/${id}/verify`);
      toast.success('Compte client validé avec succès !');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la validation');
    }
  };
  const suspend = async (id) => {
    try {
      await api.post(`/admin/users/${id}/status`, { status: 'suspended' });
      toast.success('Compte suspendu');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la suspension');
    }
  };
  const activate = async (id) => {
    try {
      await api.post(`/admin/users/${id}/status`, { status: 'active' });
      toast.success('Réactivé');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la réactivation');
    }
  };
  const approveKycQuick = async (id) => {
    try {
      await api.post(`/admin/users/${id}/kyc-quick`);
      toast.success('KYC approuvé');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Erreur lors de l'approbation KYC");
    }
  };
  const assignIban = async (id) => {
    const iban = ibanForm[id]?.iban?.trim();
    const bic = ibanForm[id]?.bic?.trim();
    if (!iban || !bic) return toast.error('IBAN et BIC requis');
    try {
      await api.post(`/admin/users/${id}/iban`, { iban, bic });
      toast.success('IBAN attribué');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || "Erreur lors de l'attribution IBAN");
    }
  };
  const deleteClient = async (id) => {
    const user = users.find(u => u.id === id);
    if (!user) return;
    
    setConfirm({
      open: true,
      title: 'Supprimer le compte',
      message: `Êtes-vous sûr de vouloir supprimer définitivement le compte de ${user.displayName || user.email} ? Cette action est irréversible et supprimera toutes les données associées (transactions, cartes, demandes, etc.).`,
      danger: true,
      onConfirm: async () => {
        setConfirm(prev => ({ ...prev, open: false }));
        try {
          await api.delete(`/admin/users/${id}`);
          toast.success(`Compte de ${user.displayName || user.email} supprimé avec succès`);
          load();
        } catch (e) {
          toast.error(e.response?.data?.error || 'Erreur lors de la suppression');
        }
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">Comptes Clients</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="input-base pl-10"
          />
        </div>
      </div>

      {selected && (
        <div className="card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{selected.displayName || selected.email}</h3>
            <button onClick={() => setSelected(null)} className="text-[var(--text-3)] hover:text-[var(--text)]">
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">IBAN</label>
              <input
                type="text"
                value={ibanForm[selected.id]?.iban || ''}
                onChange={(e) => setIbanForm(prev => ({ ...prev, [selected.id]: { ...prev[selected.id], iban: e.target.value } }))}
                className="input-base mt-1"
                placeholder="FR7630004000030000000000043"
              />
            </div>
            <div>
              <label className="label">BIC</label>
              <input
                type="text"
                value={ibanForm[selected.id]?.bic || ''}
                onChange={(e) => setIbanForm(prev => ({ ...prev, [selected.id]: { ...prev[selected.id], bic: e.target.value } }))}
                className="input-base mt-1"
                placeholder="BNPAFRPP"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => assignIban(selected.id)} className="flex-1 btn-primary py-2 text-[12px]">Attribuer IBAN</button>
            <button onClick={() => approveKycQuick(selected.id)} className="flex-1 bg-[var(--blue)] text-white py-2 rounded-lg text-[12px] font-medium hover:opacity-90">Approuver KYC</button>
            <button onClick={() => verify(selected.id)} className="flex-1 bg-[var(--green)] text-white py-2 rounded-lg text-[12px] font-medium hover:opacity-90">Valider compte</button>
            <button onClick={() => suspend(selected.id)} className="flex-1 btn-danger py-2 text-[12px]">Suspendre</button>
          </div>
          <div className="flex gap-2 pt-2 border-t border-[var(--border)]">
            <button onClick={() => deleteClient(selected.id)} className="flex-1 btn-danger py-2 text-[12px] flex items-center justify-center gap-2">
              <Trash2 className="w-4 h-4" />
              Supprimer le compte
            </button>
          </div>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Client</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Statut</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Solde</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">IBAN</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={u.displayName || u.email} />
                      <div>
                        <p className="font-medium">{u.displayName || 'N/A'}</p>
                        <p className="text-xs text-[var(--text-3)]">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3">
                    <Chip color={u.accountStatus === 'active' ? 'green' : u.accountStatus === 'suspended' ? 'red' : 'amber'}>
                      {u.accountStatus || 'pending'}
                    </Chip>
                  </td>
                  <td className="p-3 font-mono">{fmt(acc(u.id)?.balance)}</td>
                  <td className="p-3 font-mono text-xs">{u.iban || '—'}</td>
                  <td className="p-3">
                    <button onClick={() => setSelected(u)} className="text-[var(--blue)] hover:opacity-80 text-xs font-medium">
                      Gérer
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLES_ADMIN = {
  executed: 'badge-green', completed: 'badge-green', verifying: 'badge-blue', authorized: 'badge-blue',
  suspended: 'badge-red', refused: 'badge-red', pending: 'badge-amber', failed: 'badge-red',
};

function TabTransfers({ allTransfers, loadTransfers }) {
  const [q, setQ] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [deciding, setDeciding] = useState(null);

  const decide = async (id, decision, reason = '') => {
    setDeciding(id);
    try {
      await api.post(`/admin/transfers/${id}/decide`, { decision, reason });
      toast.success(`Virement ${decision === 'authorize' ? 'autorisé' : decision === 'refuse' ? 'refusé' : decision === 'suspend' ? 'suspendu' : 'libéré'}`);
      await loadTransfers();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setDeciding(null);
    }
  };

  const refund = async (id) => {
    try {
      await api.post(`/admin/transfers/${id}/refund`);
      toast.success('Virement remboursé');
      await loadTransfers();
    } catch (e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  const filtered = allTransfers.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (q && !`${t.clientName} ${t.clientEmail} ${t.reference} ${t.externalAccountHolder}`.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Gestion des virements</h1>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
          <input type="text" placeholder="Rechercher client, référence..." value={q} onChange={(e) => setQ(e.target.value)} className="input-base pl-10" />
        </div>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-base">
          <option value="">Tous les statuts</option>
          <option value="verifying">En vérification</option>
          <option value="suspended">Suspendu</option>
          <option value="executed">Exécuté</option>
          <option value="refused">Refusé</option>
          <option value="pending">En attente</option>
        </select>
      </div>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Client</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Réf</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Bénéficiaire</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Statut</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Raison</th>
                <th className="text-right p-3 font-medium text-[var(--text-2)]">Montant</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <Avatar name={t.clientName || t.clientEmail} />
                      <div>
                        <p className="text-[12px] font-medium">{t.clientName}</p>
                        <p className="text-[10px] text-[var(--text-3)]">{t.clientEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono text-[11px]">{t.reference}</td>
                  <td className="p-3 text-[12px]">{t.externalAccountHolder}</td>
                  <td className="p-3"><Chip color={STATUS_STYLES_ADMIN[t.status]?.replace('badge-', '') || 'gray'}>{t.statusLabel}</Chip></td>
                  <td className="p-3 text-[11px] text-[var(--text-2)] max-w-[180px] truncate">{t.reason || '—'}</td>
                  <td className="p-3 text-right font-mono font-medium">{fmt(t.amount)}</td>
                  <td className="p-3">
                    {(t.status === 'verifying' || t.status === 'suspended') && (
                      <div className="flex gap-1">
                        <button onClick={() => decide(t.id, 'authorize')} className="text-[10.5px] px-2 py-1 rounded-lg bg-green-50 text-green-700 font-medium hover:bg-green-100 transition">
                          Autoriser
                        </button>
                        <button onClick={() => decide(t.id, 'refuse', 'Refusé par l\'administrateur')} className="text-[10.5px] px-2 py-1 rounded-lg bg-red-50 text-red-600 font-medium hover:bg-red-100 transition">
                          Refuser
                        </button>
                        {t.status === 'verifying' && (
                          <button onClick={() => decide(t.id, 'suspend', 'Suspendu pour vérification')} className="text-[10.5px] px-2 py-1 rounded-lg bg-amber-50 text-amber-700 font-medium hover:bg-amber-100 transition">
                            Suspendre
                          </button>
                        )}
                      </div>
                    )}
                    {['refused', 'suspended', 'verifying', 'failed'].includes(t.status) && (
                      <button onClick={() => refund(t.id)} className="text-[10.5px] px-2 py-1 rounded-lg bg-blue-50 text-[var(--blue)] font-medium hover:bg-blue-100 transition ml-1">
                        Rembourser
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="7" className="p-8 text-center text-[var(--text-3)] text-[12px]">Aucun virement trouvé</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabRules({ rules, loadRules }) {
  const toggle = async (id) => {
    try {
      await api.post(`/admin/rules/${id}/toggle`);
      toast.success('Règle mise à jour');
      await loadRules();
    } catch (e) { toast.error(e.response?.data?.error || 'Erreur'); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Règles de sécurité (Transferts)</h1>
      <p className="text-[12px] text-[var(--text-3)]">Activez ou désactivez les règles qui bloquent/vérifient automatiquement les virements. Les paramètres (seuils) sont dans les variables de chaque règle.</p>
      <div className="space-y-2">
        {rules.map((r) => (
          <div key={r.id} className="card p-4 flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-semibold text-[var(--text)]">{r.name}</h3>
                <Chip color={r.enabled ? 'green' : 'gray'}>{r.enabled ? 'Activée' : 'Désactivée'}</Chip>
                <Chip color={r.action === 'suspended' ? 'red' : 'blue'}>Action: {r.action}</Chip>
              </div>
              <p className="text-[11px] text-[var(--text-3)] mt-1">{r.description}</p>
              {r.params && Object.keys(r.params).length > 0 && (
                <p className="text-[10.5px] text-[var(--text-3)] font-mono mt-1">Paramètres: {JSON.stringify(r.params)}</p>
              )}
            </div>
            <button onClick={() => toggle(r.id)} className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${r.enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}>
              {r.enabled ? 'Désactiver' : 'Activer'}
            </button>
          </div>
        ))}
        {rules.length === 0 && <p className="text-[var(--text-3)] text-center py-8 text-[12px]">Aucune règle configurée</p>}
      </div>
    </div>
  );
}

function TabAudit({ auditLogs }) {
  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Journal d'audit</h1>
      <p className="text-[12px] text-[var(--text-3)]">Historique des actions administratives. Les journaux ne peuvent pas être supprimés.</p>
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
              <tr>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Date</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Acteur</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Rôle</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Action</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Type</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">Détails</th>
                <th className="text-left p-3 font-medium text-[var(--text-2)]">IP</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map((l) => (
                <tr key={l.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]">
                  <td className="p-3 text-[11px]">{new Date(l.createdAt).toLocaleString('fr-FR')}</td>
                  <td className="p-3 text-[11px]">{l.actorName || l.actorEmail || 'System'}</td>
                  <td className="p-3"><Chip color="blue">{l.actorRole || '—'}</Chip></td>
                  <td className="p-3 font-mono text-[11px]">{l.action}</td>
                  <td className="p-3 text-[11px]">{l.entityType} {l.entityId ? `#${l.entityId.slice(0,8)}` : ''}</td>
                  <td className="p-3 text-[11px] max-w-[180px] truncate">
                    {l.newValue ? JSON.stringify(l.newValue) : '—'}
                  </td>
                  <td className="p-3 text-[11px] font-mono">{l.ip}</td>
                </tr>
              ))}
              {auditLogs.length === 0 && <tr><td colSpan="7" className="p-8 text-center text-[var(--text-3)] text-[12px]">Aucune action enregistrée</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function TabAdminRoles({ adminUsers, loadAdmins }) {
  const [saving, setSaving] = useState(null);

  const setRole = async (id, adminRole) => {
    setSaving(id);
    try {
      await api.post(`/admin/admins/${id}/role`, { adminRole });
      toast.success('Rôle mis à jour');
      await loadAdmins();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setSaving(null);
    }
  };

  const roleOptions = [
    { value: 'superadmin', label: 'Super Admin', desc: 'Accès complet' },
    { value: 'compliance', label: 'Compliance', desc: 'Vérification users, contrôle transactions, alertes' },
    { value: 'finance', label: 'Finance', desc: 'Gestion prêts/financements, consultation transactions' },
    { value: 'support', label: 'Support', desc: 'Consultation clients, assistance, aucun accès soldes' },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Rôles administratifs</h1>
      <div className="space-y-2">
        {adminUsers.map((a) => (
          <div key={a.id} className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Avatar name={a.name || a.email} size="md" />
              <div className="min-w-0">
                <p className="text-[13px] font-medium text-[var(--text)]">{a.name || 'Admin'}</p>
                <p className="text-[11px] text-[var(--text-3)]">{a.email}</p>
                <Chip color={a.adminRole === 'superadmin' ? 'blue' : a.adminRole === 'compliance' ? 'green' : a.adminRole === 'finance' ? 'amber' : 'gray'}>
                  {roleOptions.find((r) => r.value === a.adminRole)?.label || a.adminRole}
                </Chip>
              </div>
            </div>
            <div className="flex gap-1 flex-wrap">
              {roleOptions.map((r) => (
                <button
                  key={r.value}
                  disabled={saving === a.id}
                  onClick={() => setRole(a.id, r.value)}
                  className={`px-2 py-1 rounded-lg text-[10.5px] font-medium transition ${a.adminRole === r.value ? 'bg-[var(--blue)] text-white' : 'bg-[var(--bg)] text-[var(--text-2)] hover:bg-[var(--bg)] border border-[var(--border)]'}`}
                  title={r.desc}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {adminUsers.length === 0 && <p className="text-[var(--text-3)] text-center py-8 text-[12px]">Aucun administrateur trouvé</p>}
      </div>
    </div>
  );
}

// TabCards component
function TabCards({ cards, cardRequests, users, load }) {
  const pending = cardRequests.filter((c) => c.status === 'pending'); // Utiliser cardRequests
  const [cardForms, setCardForms] = useState({});

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId);
  };

  const approveCard = async (cardId, userId) => {
    const form = cardForms[cardId];
    try {
      await api.post(`/admin/users/${userId}/card/activate`, {
        fullNumber: form.fullNumber,
        expiryMonth: form.expiryMonth,
        expiryYear: form.expiryYear,
        cvv: form.cvv
      });
      toast.success('Carte approuvée et activée');
      setCardForms(prev => ({ ...prev, [cardId]: {} }));
      load();
    } catch (e) {
      toast.error('Erreur lors de l\'approbation');
    }
  };

  const rejectCard = async (cardId, userId) => {
    try {
      await api.post(`/admin/users/${userId}/card/reject`);
      toast.success('Demande de carte rejetée');
      load();
    } catch (e) {
      toast.error('Erreur lors du rejet');
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-[18px] font-semibold">Demandes de cartes</h1>
      {pending.length === 0 ? (
        <p className="text-[var(--text-3)] text-center py-8">Aucune demande de carte en attente</p>
      ) : (
        pending.map(card => {
          const userInfo = getUserInfo(card.user_id || card.userId);
          return (
            <div key={card.id} className="card p-4 space-y-3">
              <div className="flex items-start gap-3">
                <Avatar name={userInfo?.displayName || userInfo?.email || 'Client'} size="lg" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[12px] sm:text-[13px]">{userInfo?.displayName || 'Client'}</p>
                  <p className="text-[11px] sm:text-[12px] text-[var(--text-3)]">{userInfo?.email}</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <Chip color={userInfo?.accountStatus === 'active' ? 'green' : userInfo?.accountStatus === 'suspended' ? 'red' : 'amber'}>
                      {userInfo?.accountStatus || 'pending'}
                    </Chip>
                    <Chip color="blue">
                      {userInfo?.kycStatus || 'unknown'}
                    </Chip>
                  </div>
                </div>
              </div>
              <div className="space-y-3 border-t border-[var(--border)] pt-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Numéro complet (16 chiffres)</label>
                    <input
                      type="text"
                      value={cardForms[card.id]?.fullNumber || ''}
                      onChange={(e) => setCardForms(prev => ({ ...prev, [card.id]: { ...prev[card.id], fullNumber: e.target.value } }))}
                      className="input-base"
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                    />
                  </div>
                  <div>
                    <label className="label">CVV (3 chiffres)</label>
                    <input
                      type="text"
                      value={cardForms[card.id]?.cvv || ''}
                      onChange={(e) => setCardForms(prev => ({ ...prev, [card.id]: { ...prev[card.id], cvv: e.target.value } }))}
                      className="input-base"
                      placeholder="123"
                      maxLength={3}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="label">Mois d'expiration</label>
                    <input
                      type="text"
                      value={cardForms[card.id]?.expiryMonth || ''}
                      onChange={(e) => setCardForms(prev => ({ ...prev, [card.id]: { ...prev[card.id], expiryMonth: e.target.value } }))}
                      className="input-base"
                      placeholder="12"
                      maxLength={2}
                    />
                  </div>
                  <div>
                    <label className="label">Année d'expiration</label>
                    <input
                      type="text"
                      value={cardForms[card.id]?.expiryYear || ''}
                      onChange={(e) => setCardForms(prev => ({ ...prev, [card.id]: { ...prev[card.id], expiryYear: e.target.value } }))}
                      className="input-base"
                      placeholder="2028"
                      maxLength={4}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => approveCard(card.id, card.user_id || card.userId)}
                    className="flex-1 btn-primary py-2 text-[11px]"
                  >
                    Approuver et activer
                  </button>
                  <button
                    onClick={() => rejectCard(card.id, card.user_id || card.userId)}
                    className="flex-1 btn-danger py-2 text-[11px]"
                  >
                    Rejeter
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}

// TabTx component with deposit/withdrawal functionality
function TabTx({ users, load, transactions }) {
  const [selectedUser, setSelectedUser] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('deposit');
  const [label, setLabel] = useState('');
  const [bankName, setBankName] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [saving, setSaving] = useState(false);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [showTransactions, setShowTransactions] = useState(false);

  const clients = users.filter((u) => u.role !== 'admin');

  const filteredUsers = clients.filter((u) =>
    (u.displayName || u.name)?.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email?.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filtered = transactions.filter((t) => {
    const matchesSearch = !q || `${t.type} ${t.label}`.toLowerCase().includes(q.toLowerCase());
    const matchesType = typeFilter === 'all' || t.type === typeFilter;
    return matchesSearch && matchesType;
  });

  const selected = clients.find((u) => u.id === selectedUser);
  const getUser = (userId) => users.find((u) => u.id === userId);

  const handleSubmit = async () => {
    if (!selectedUser) return toast.error('Sélectionnez un client');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Montant invalide');
    if (type === 'deposit' && !bankName?.trim()) return toast.error('Nom de la banque requis');

    setSaving(true);
    try {
      const endpoint = type === 'deposit'
        ? `/admin/users/${selectedUser}/deposit`
        : `/admin/users/${selectedUser}/withdraw`;
      const payload = type === 'deposit' 
        ? { amount: amt, bankName: bankName.trim(), label: label.trim() || undefined }
        : { amount: amt, label: label.trim() || undefined };
      await api.post(endpoint, payload);
      toast.success(type === 'deposit' ? `+${amt} EUR crédité` : `-${amt} EUR débité`);
      setAmount('');
      setLabel('');
      setBankName('');
      setSelectedUser('');
      setUserSearch('');
      load();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-[18px] font-semibold">Dépôts / Retraits</h1>
        <button
          onClick={() => setShowTransactions(!showTransactions)}
          className="btn-outline px-3 py-1.5 text-sm"
        >
          {showTransactions ? 'Masquer' : 'Voir'} les transactions
        </button>
      </div>

      <div className="card p-5 space-y-4">
        <div>
          <label className="label">Client</label>
          <input
            className="input-base mt-1"
            value={userSearch}
            onChange={(e) => { setUserSearch(e.target.value); setSelectedUser(''); }}
            placeholder="Rechercher par nom ou email..."
          />
          {userSearch && !selected && (
            <div className="mt-1 border border-[var(--border)] rounded-xl overflow-hidden max-h-44 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <p className="text-[11px] text-[var(--text-3)] text-center py-3">Aucun client trouvé</p>
              ) : filteredUsers.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => { setSelectedUser(u.id); setUserSearch(u.displayName || u.name); }}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-blue-50 transition text-left"
                >
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-[var(--blue)] flex items-center justify-center text-[10px] font-bold flex-shrink-0">
                    {(u.displayName || u.name)?.slice(0, 2).toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[var(--text)] truncate">{u.displayName || u.name}</p>
                    <p className="text-[10px] text-[var(--text-3)] truncate">{u.email}</p>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--text-3)]">
                    {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(u.balance || 0)}
                  </span>
                </button>
              ))}
            </div>
          )}
          {selected && (
            <div className="mt-2 flex items-center gap-2 bg-blue-50 border border-blue-100 px-3 py-2 rounded-xl">
              <div className="w-8 h-8 rounded-full bg-blue-200 text-[var(--blue)] flex items-center justify-center text-[11px] font-bold flex-shrink-0">
                {(selected.displayName || selected.name)?.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-semibold text-[var(--text)]">{selected.displayName || selected.name}</p>
                <p className="text-[10px] text-[var(--text-3)]">{selected.email} · Solde : {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(selected.balance || 0)}</p>
              </div>
              <button type="button" onClick={() => { setSelectedUser(''); setUserSearch(''); }} className="text-[var(--text-3)] hover:text-red-400 transition">
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setType('deposit')}
            className={`py-3 rounded-xl border-2 text-[12px] font-medium transition flex items-center justify-center gap-2 ${
              type === 'deposit' ? 'border-[var(--blue)] bg-blue-50 text-[var(--blue)]' : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--text-3)]'
            }`}
          >
            <Plus className="w-4 h-4" /> Dépôt
          </button>
          <button
            type="button"
            onClick={() => setType('withdraw')}
            className={`py-3 rounded-xl border-2 text-[12px] font-medium transition flex items-center justify-center gap-2 ${
              type === 'withdraw' ? 'border-red-400 bg-red-50 text-red-600' : 'border-[var(--border)] text-[var(--text-3)] hover:border-[var(--text-3)]'
            }`}
          >
            <Minus className="w-4 h-4" /> Retrait
          </button>
        </div>

        <div>
          <label className="label">Montant (EUR)</label>
          <div className="relative mt-1">
            <input
              type="number"
              min="0.01"
              step="0.01"
              className="input-base pr-10"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-[var(--text-3)] font-medium">EUR</span>
          </div>
        </div>

        {type === 'deposit' && (
          <div>
            <label className="label">Nom de la banque *</label>
            <input
              className="input-base mt-1"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="Ex: BNP Paribas, Société Générale..."
            />
          </div>
        )}

        <div>
          <label className="label">Libellé <span className="text-[var(--text-3)]">(optionnel)</span></label>
          <input
            className="input-base mt-1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Crédit de bienvenue"
          />
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !selectedUser || !amount || (type === 'deposit' && !bankName?.trim())}
          className={`w-full rounded-xl py-2.5 text-[12px] font-medium transition disabled:opacity-40 ${
            type === 'deposit'
              ? 'btn-primary'
              : 'btn-danger'
          }`}
        >
          {saving ? 'Traitement...' : type === 'deposit' ? `Créditer ${amount ? amount + ' EUR' : ''}` : `Débiter ${amount ? amount + ' EUR' : ''}`}
        </button>
      </div>

      {showTransactions && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-3)]" />
              <input
                type="text"
                placeholder="Rechercher une transaction..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="input-base pl-10"
              />
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="input-base"
            >
              <option value="all">Tous les types</option>
              <option value="deposit">Dépôts</option>
              <option value="withdrawal">Retraits</option>
              <option value="transfer">Virements</option>
            </select>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-[var(--bg)] border-b border-[var(--border)]">
                  <tr>
                    <th className="text-left p-3 font-medium text-[var(--text-2)]">Date</th>
                    <th className="text-left p-3 font-medium text-[var(--text-2)]">Client</th>
                    <th className="text-left p-3 font-medium text-[var(--text-2)]">Type</th>
                    <th className="text-left p-3 font-medium text-[var(--text-2)]">Description</th>
                    <th className="text-right p-3 font-medium text-[var(--text-2)]">Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((t) => {
                    const user = getUser(t.user_id);
                    return (
                      <tr key={t.id} className="border-b border-[var(--border)] hover:bg-[var(--bg)]">
                        <td className="p-3 text-[var(--text-2)]">
                          {new Date(t.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Avatar name={user?.displayName || user?.email} />
                            <span>{user?.displayName || user?.email}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Chip color={t.type === 'deposit' ? 'green' : t.type === 'withdrawal' ? 'red' : 'blue'}>
                            {t.type === 'deposit' ? 'Dépôt' : t.type === 'withdrawal' ? 'Retrait' : 'Virement'}
                          </Chip>
                        </td>
                        <td className="p-3 text-[var(--text-2)]">{t.label}</td>
                        <td className={`p-3 font-mono font-medium ${t.type === 'deposit' ? 'text-[var(--green)]' : 'text-red-600'}`}>
                          {t.type === 'deposit' ? '+' : '-'}{fmt(t.amount)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
