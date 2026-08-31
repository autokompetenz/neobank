import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ArrowLeftRight, Info, TrendingUp, Eye } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

export default function TransferPage({ account, onSuccess }) {
  const { user } = useAuth();
  const [form, setForm] = useState({ accountHolder: '', iban: '', bic: '', amount: '', label: '' });
  const [loading, setLoading] = useState(false);
  const [withdrawalRequests, setWithdrawalRequests] = useState([]);
  const [showProgress, setShowProgress] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const previewAmt = parseFloat(form.amount) || 0;
  const balanceAfter = (account?.balance || 0) - previewAmt;

  useEffect(() => {
    loadWithdrawalRequests();
  }, []);

  const loadWithdrawalRequests = async () => {
    try {
      const res = await api.get('/client/withdrawal-requests');
      setWithdrawalRequests(res.data.requests || []);
    } catch (e) {
      toast.error('Erreur lors du chargement des demandes');
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Montant invalide'); return; }
    if (amount > (account?.balance || 0)) { toast.error('Solde insuffisant'); return; }
    if (!form.accountHolder.trim()) { toast.error('Le nom du titulaire est requis'); return; }
    if (!form.iban.trim()) { toast.error('IBAN requis'); return; }
    if (!form.bic.trim()) { toast.error('BIC/SWIFT requis'); return; }
    setLoading(true);
    try {
      await api.post('/client/withdrawal-requests', {
        accountHolder: form.accountHolder.trim(),
        iban: form.iban.trim(),
        bic: form.bic.trim(),
        amount,
        label: form.label || undefined,
      });
      toast.success('Demande de retrait soumise ! En attente de validation admin.');
      setForm({ accountHolder: '', iban: '', bic: '', amount: '', label: '' });
      await loadWithdrawalRequests();
      onSuccess?.();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du virement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 fade-in max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Virements</h1>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">Effectuer et suivre vos demandes de virement</p>
        </div>
        {withdrawalRequests.length > 0 && (
          <button
            onClick={() => setShowProgress(!showProgress)}
            className="px-3 py-1.5 badge-green text-[11.5px] flex items-center gap-1"
          >
            <Eye className="w-3 h-3" />
            {showProgress ? 'Masquer' : 'Voir'} la progression
          </button>
        )}
      </div>

      {showProgress && withdrawalRequests.length > 0 && (
        <div className="bg-[var(--bg)] rounded-xl border border-[var(--border)] p-4">
          <h3 className="text-sm font-semibold text-[var(--text)] mb-3 flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            Virements en cours ({withdrawalRequests.length})
          </h3>
          <div className="space-y-3">
            {withdrawalRequests.map((req) => (
              <div key={req.id} className="card p-3">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="text-sm font-medium text-[var(--text)]">{fmt(req.amount)}</p>
                    <p className="text-xs text-[var(--text-3)]">vers {req.external_account_holder}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    req.status === 'completed' ? 'badge-green' :
                    req.status === 'code_generated' ? 'badge-blue' :
                    req.status === 'step_completed' ? 'badge-blue' :
                    'badge-amber'
                  }`}>
                    {req.status === 'pending' ? 'En attente' :
                     req.status === 'code_generated' ? 'Code généré' :
                     req.status === 'step_completed' ? 'Étape complétée' :
                     req.status === 'completed' ? 'Complété' : req.status}
                  </span>
                </div>
                {req.current_percentage > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[var(--text-2)]">Progression</span>
                      <span className="text-xs font-medium text-[var(--blue)]">{Number(req.current_percentage).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[var(--blue)] to-[var(--blue)] h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(req.current_percentage, 100)}%` }}
                      />
                    </div>
                    <div className="mt-1 text-xs text-[var(--text-3)]">
                      {fmt(req.total_withdrawn || 0)} / {fmt(req.amount)} versés
                    </div>
                  </div>
                )}
                {req.steps && req.steps.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-[var(--border)]">
                    <div className="flex gap-1">
                      {req.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-medium ${
                            step.is_completed ? 'badge-green' : 'bg-gray-100 text-gray-500'
                          }`}
                        >
                          {step.is_completed ? '!' : step.step_order}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-lg">
        <div>
          <h2 className="text-[17px] font-semibold tracking-tight">Nouvelle demande de retrait</h2>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">Effectuer une demande de retrait vers un compte externe</p>
        </div>
        <div className="badge-amber p-3 flex items-center gap-2 mt-3">
          <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
          <p className="text-[11.5px]">Votre demande sera traitée par l'administrateur</p>
        </div>
        <form onSubmit={submit} className="card p-5 space-y-4 mt-3">
          <div>
            <label className="label">Nom du titulaire du compte</label>
            <input type="text" value={form.accountHolder} onChange={set('accountHolder')} placeholder="Jean Dupont" required
              className="input-base" />
          </div>
          <div>
            <label className="label">IBAN</label>
            <input type="text" value={form.iban} onChange={set('iban')} placeholder="Entrez votre IBAN" required
              className="input-base" />
          </div>
          <div>
            <label className="label">BIC/SWIFT</label>
            <input type="text" value={form.bic} onChange={set('bic')} placeholder="Entrez votre BIC" required
              className="input-base" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Montant (€)</label>
              <input type="number" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" placeholder="0,00" required
                className="input-base" />
            </div>
            <div>
              <label className="label">Motif du virement</label>
              <input type="text" value={form.label} onChange={set('label')} placeholder="Loyer, remboursement..."
                className="input-base" />
            </div>
          </div>
          <div className="bg-[var(--bg)] rounded-xl p-3 flex justify-between items-center">
            <span className="text-[11px] text-[var(--text-3)]">Solde après virement</span>
            <span className={`text-[13px] font-semibold font-mono ${balanceAfter < 0 ? 'text-red-600' : 'text-[var(--text)]'}`}>
              {fmt(balanceAfter)}
            </span>
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
            Soumettre la demande
          </button>
        </form>
      </div>
    </div>
  );
}
