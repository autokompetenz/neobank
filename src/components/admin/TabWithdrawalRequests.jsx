import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Clock, User, CreditCard, AlertCircle, Key, ArrowRight, Search, Check, X, TrendingUp } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function TabWithdrawalRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [rejectReason, setRejectReason] = useState({});
  const [actionLoading, setActionLoading] = useState(null);
  const [approveModal, setApproveModal] = useState(null);
  const [stepConfig, setStepConfig] = useState({ steps: [{ pct: 50, label: 'Première moitié' }, { pct: 50, label: 'Seconde moitié' }] });

  useEffect(() => { loadRequests(); }, []);

  const loadRequests = async () => {
    try {
      const res = await api.get('/admin/withdrawal-requests');
      setRequests(res.data.requests || []);
    } catch (e) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10.5px] font-medium rounded-full"><Clock className="w-3 h-3" /> En attente</span>;
      case 'code_generated': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10.5px] font-medium rounded-full"><Key className="w-3 h-3" /> Code généré</span>;
      case 'step_completed': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 text-[10.5px] font-medium rounded-full"><ArrowRight className="w-3 h-3" /> Étape complétée — décision requise</span>;
      case 'approved': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 text-[10.5px] font-medium rounded-full"><ArrowRight className="w-3 h-3" /> Approuvé — générer un code</span>;
      case 'completed': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10.5px] font-medium rounded-full"><CheckCircle className="w-3 h-3" /> Complété</span>;
      case 'rejected': return <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-[10.5px] font-medium rounded-full"><XCircle className="w-3 h-3" /> Rejeté</span>;
      default: return null;
    }
  };

  const handleApprove = async (reqId) => {
    const steps = stepConfig.steps.filter(s => s.pct > 0);
    if (steps.length === 0) return toast.error('Ajoutez au moins une étape');

    const totalPct = steps.reduce((sum, s) => sum + Number(s.pct), 0);
    if (totalPct > 100) return toast.error('Le total des pourcentages ne peut pas dépasser 100%');

    setActionLoading(reqId);
    try {
      await api.post(`/admin/withdrawal-requests/${reqId}/approve`, {
        targetPercentage: totalPct,
        steps: steps.map((s, i) => ({ percentage: Number(s.pct), condition: s.label || `Étape ${i + 1}` }))
      });
      toast.success('Retrait approuvé !');
      setApproveModal(null);
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'approbation');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reqId) => {
    const reason = rejectReason[reqId]?.trim();
    if (!reason) return toast.error('Motif de rejet requis');

    setActionLoading(reqId);
    try {
      await api.post(`/admin/withdrawal-requests/${reqId}/reject`, { reason });
      toast.success('Retrait rejeté');
      setRejectReason(prev => ({ ...prev, [reqId]: '' }));
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors du rejet');
    } finally {
      setActionLoading(null);
    }
  };

  const handleGenerateCode = async (reqId, stepOrder = 1) => {
    setActionLoading(`${reqId}-code`);
    try {
      const res = await api.post(`/admin/withdrawal-requests/${reqId}/generate-code`, { stepOrder });
      toast.success(`Code généré : ${res.data.code}`);
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la génération du code');
    } finally {
      setActionLoading(null);
    }
  };

  const handleDecide = async (reqId, decision, nextStepPct = 50) => {
    setActionLoading(`${reqId}-${decision}`);
    try {
      const payload = { decision };
      if (decision === 'continue') {
        payload.nextStepPercentage = nextStepPct;
        payload.clientType = 'STANDARD';
      }
      await api.post(`/admin/withdrawal-requests/${reqId}/decide`, payload);
      toast.success(decision === 'complete' ? 'Virement complété !' : 'Nouvelle étape créée !');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur de décision');
    } finally {
      setActionLoading(null);
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch = searchTerm === '' || 
      req.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.external_account_holder?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const renderActions = (req) => {
    switch (req.status) {
      case 'pending':
        return (
          <div className="flex flex-col gap-2">
            <div>
              <textarea
                value={rejectReason[req.id] || ''}
                onChange={(e) => setRejectReason(prev => ({ ...prev, [req.id]: e.target.value }))}
                placeholder="Motif de rejet (obligatoire pour rejeter)..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-[11px]"
                rows={2}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setApproveModal(req.id)}
                disabled={actionLoading === req.id}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition"
              >
                <Check className="w-3.5 h-3.5" /> Approuver
              </button>
              <button
                onClick={() => handleReject(req.id)}
                disabled={actionLoading === req.id || !rejectReason[req.id]?.trim()}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition"
              >
                <X className="w-3.5 h-3.5" /> Rejeter
              </button>
            </div>
          </div>
        );

      case 'approved':
        return (
          <div>
            <button
              onClick={() => handleGenerateCode(req.id, 1)}
              disabled={actionLoading === `${req.id}-code`}
              className="w-full flex items-center justify-center gap-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition"
            >
              {actionLoading === `${req.id}-code` ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Key className="w-3.5 h-3.5" />
              )}
              Générer le code de retrait
            </button>
          </div>
        );

      case 'step_completed':
        return (
          <div className="flex flex-col gap-2">
            <p className="text-[11px] text-slate-600 font-medium">Décision requise :</p>
            <div className="flex gap-2">
              <button
                onClick={() => handleDecide(req.id, 'continue', 100)}
                disabled={actionLoading === `${req.id}-continue`}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition"
              >
                <TrendingUp className="w-3.5 h-3.5" /> Continuer
              </button>
              <button
                onClick={() => handleDecide(req.id, 'complete')}
                disabled={actionLoading === `${req.id}-complete`}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg text-[11px] font-medium transition"
              >
                <CheckCircle className="w-3.5 h-3.5" /> Compléter
              </button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-teal-600 border-t-transparent rounded-full animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      {approveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl space-y-4">
            <h3 className="font-semibold text-slate-900">Configurer les étapes du retrait</h3>
            <p className="text-[11px] text-slate-500">Définissez les pourcentages par étape. Le total doit être ≤ 100%.</p>
            {stepConfig.steps.map((step, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-[11px] font-medium text-slate-700 w-16">Étape {i + 1}</span>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={step.pct}
                  onChange={(e) => {
                    const n = [...stepConfig.steps];
                    n[i] = { ...n[i], pct: Number(e.target.value) };
                    setStepConfig({ ...stepConfig, steps: n });
                  }}
                  className="w-16 px-2 py-1.5 border border-slate-200 rounded text-[11px]"
                />
                <span className="text-[10px] text-slate-400">%</span>
                <input
                  type="text"
                  value={step.label}
                  onChange={(e) => {
                    const n = [...stepConfig.steps];
                    n[i] = { ...n[i], label: e.target.value };
                    setStepConfig({ ...stepConfig, steps: n });
                  }}
                  placeholder="Condition..."
                  className="flex-1 px-2 py-1.5 border border-slate-200 rounded text-[11px]"
                />
                {i > 0 && (
                  <button onClick={() => setStepConfig({ ...stepConfig, steps: stepConfig.steps.filter((_, j) => j !== i) })} className="text-red-500 text-lg leading-none">×</button>
                )}
              </div>
            ))}
            {stepConfig.steps.length < 5 && (
              <button
                onClick={() => setStepConfig({ ...stepConfig, steps: [...stepConfig.steps, { pct: 0, label: '' }] })}
                className="text-[11px] text-teal-600 font-medium"
              >
                + Ajouter une étape
              </button>
            )}
            <div className="flex gap-2 pt-2">
              <button onClick={() => { setApproveModal(null); setStepConfig({ steps: [{ pct: 50, label: 'Première moitié' }, { pct: 50, label: 'Seconde moitié' }] }); }} className="flex-1 px-3 py-2 border border-slate-200 rounded-lg text-[11px]">Annuler</button>
              <button onClick={() => handleApprove(approveModal)} disabled={actionLoading === approveModal} className="flex-1 px-3 py-2 bg-teal-600 text-white rounded-lg text-[11px] font-medium disabled:opacity-50">
                {actionLoading === approveModal ? 'Approbation...' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <CreditCard className="w-6 h-6 text-teal-600" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">Historique des retraits</h2>
            <p className="text-sm text-slate-500">{filteredRequests.length} sur {requests.length} retraits</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un retrait par nom, email ou titulaire..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
              />
            </div>
          </div>
          <div className="lg:w-48">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-teal-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="approved">Approuvé</option>
              <option value="code_generated">Code généré</option>
              <option value="step_completed">Étape complétée</option>
              <option value="completed">Complété</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
      </div>

      {filteredRequests.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-xl border border-slate-100">
          <AlertCircle className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600">
            {requests.length === 0 ? 'Aucun retrait dans l\'historique' : 'Aucun retrait ne correspond aux filtres'}
          </p>
          {requests.length > 0 && (
            <button onClick={() => { setSearchTerm(''); setStatusFilter('all'); }} className="mt-3 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white text-sm rounded-lg transition">
              Réinitialiser les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-0 sm:justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-full flex items-center justify-center shrink-0">
                    <User className="w-5 h-5 text-teal-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 truncate">{req.name}</p>
                    <p className="text-xs text-slate-500 truncate">{req.email}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {getStatusBadge(req.status)}
                  <span className="text-xs text-slate-500 whitespace-nowrap">{fmtDate(req.created_at)}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-sm mb-3">
                <div className="flex flex-wrap items-baseline gap-1"><span className="font-medium text-slate-700 shrink-0">Montant :</span><span className="font-semibold text-teal-600">{fmt(req.amount)}</span></div>
                <div className="flex flex-wrap items-baseline gap-1"><span className="font-medium text-slate-700 shrink-0">Titulaire :</span><span className="text-slate-900 break-words">{req.external_account_holder}</span></div>
                <div className="flex flex-wrap items-baseline gap-1"><span className="font-medium text-slate-700 shrink-0">IBAN :</span><span className="font-mono text-xs text-slate-900 break-all">{req.external_iban}</span></div>
                <div className="flex flex-wrap items-baseline gap-1"><span className="font-medium text-slate-700 shrink-0">BIC :</span><span className="font-mono text-xs text-slate-900 break-all">{req.external_bic}</span></div>
              </div>

              {req.label && <div className="text-sm mb-3"><span className="font-medium text-slate-700">Motif :</span><span className="ml-2 text-slate-900">{req.label}</span></div>}

              {req.current_percentage > 0 && (
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-slate-600">Progression</span>
                    <span className="text-xs font-medium">{Number(req.current_percentage).toFixed(1)}% ({fmt(req.total_withdrawn)})</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div className="bg-gradient-to-r from-teal-500 to-teal-600 h-full rounded-full" style={{ width: `${Math.min(req.current_percentage, 100)}%` }} />
                  </div>
                </div>
              )}

              {req.steps && req.steps.length > 0 && (
                <div className="mb-3">
                  <span className="font-medium text-slate-700 text-xs">Étapes :</span>
                  <div className="mt-1 space-y-1">
                    {req.steps.map((step, idx) => (
                      <div key={idx} className="text-xs text-slate-600 flex items-center gap-2">
                        <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-medium shrink-0 ${step.is_completed ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                          {step.step_order}
                        </span>
                        <span className="whitespace-nowrap">{step.percentage}% ({fmt(step.amount)})</span>
                        {step.is_completed && <CheckCircle className="w-3 h-3 text-green-600 shrink-0" />}
                        {step.condition && <span className="text-slate-400 italic truncate min-w-0">— {step.condition}</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {req.reject_reason && (
                <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-3">
                  <span className="font-medium text-red-700">Motif de rejet :</span>
                  <span className="ml-2 text-red-900">{req.reject_reason}</span>
                </div>
              )}

              {renderActions(req)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}