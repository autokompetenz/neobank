import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { ArrowLeftRight, Info, ShieldAlert, AlertTriangle, CheckCircle2, X } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

const STATUS_STYLES = {
  pending: 'badge-amber',
  pending_confirmation: 'badge-blue',
  verifying: 'badge-blue',
  transferring: 'badge-blue',
  completed: 'badge-green',
  refused: 'badge-red',
  blocked: 'badge-red',
};

const STATUS_LABELS = {
  pending: 'En attente',
  pending_confirmation: 'En cours de confirmation',
  verifying: 'En cours de validation',
  transferring: 'En cours de transfert',
  completed: 'Transfert effectué',
  refused: 'Refusé',
  blocked: 'Bloqué',
};

const OPENABLE = ['pending', 'pending_confirmation', 'verifying', 'blocked', 'refused'];

function BlockedReasonModal({ transfer, onClose, onConfirmed }) {
  const [loading, setLoading] = useState(false);
  if (!transfer) return null;

  const confirmVerification = async () => {
    setLoading(true);
    try {
      await api.post(`/transfers/${transfer.id}/confirm-verification`);
      toast.success('Validation complétée. Virement en cours de transfert !');
      onConfirmed?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const payFees = async () => {
    setLoading(true);
    try {
      await api.post(`/transfers/${transfer.id}/pay-fees`);
      toast.success('Frais NEOBANK payés. Virement en cours de transfert !');
      onConfirmed?.();
      onClose();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const canPayFees = ['pending_confirmation', 'verifying'].includes(transfer.status);
  const hasFees = Number(transfer.fees || 0) > 0;
  const showPay = hasFees && canPayFees;
  const blocked = transfer.status === 'blocked';
  const refused = transfer.status === 'refused';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-md bg-[var(--bg-card)] rounded-2xl shadow-xl p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{
              background: blocked || refused ? 'rgba(200,16,46,0.1)' : 'var(--blue-bg)',
              color: blocked || refused ? '#C8102E' : 'var(--blue)'
            }}>
              {blocked || refused ? <AlertTriangle className="w-4 h-4" /> : <ShieldAlert className="w-4 h-4" />}
            </div>
            <h3 className="text-[16px] font-bold tracking-tight">
              {blocked ? 'Virement bloqué' : refused ? 'Virement refusé' : STATUS_LABELS[transfer.status] || 'Virement'}
            </h3>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-lg text-[var(--text-3)] hover:text-[var(--text)]" aria-label="Fermer"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-1.5 text-[13px]">
          <div className="flex justify-between"><span className="text-[var(--text-3)]">Montant</span><span className="font-mono font-semibold">{fmt(transfer.amount)}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-3)]">Statut</span><span className={STATUS_STYLES[transfer.status]}>{STATUS_LABELS[transfer.status]}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-3)]">Vers</span><span className="font-medium truncate ml-4">{transfer.externalAccountHolder}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-3)]">Référence</span><span className="font-mono text-[11px]">{transfer.reference}</span></div>
          <div className="flex justify-between"><span className="text-[var(--text-3)]">Date</span><span>{new Date(transfer.createdAt).toLocaleDateString('fr-FR')}</span></div>
        </div>

        <div className="rounded-xl p-3" style={{ background: blocked || refused ? 'rgba(200,16,46,0.06)' : 'var(--blue-bg)' }}>
          <p className="text-[11px] font-semibold uppercase tracking-wide mb-1" style={{ color: blocked || refused ? '#C8102E' : 'var(--blue)' }}>Motif / Message NEOBANK</p>
          <p className="text-[13px] text-[var(--text)]">{transfer.reason || 'Votre virement est en cours de gestion. Toute éventuelle somme (frais) à payer vous sera indiquée ici.'}</p>
        </div>

        {transfer.actionRequired && (
          <div className="rounded-xl p-3 bg-[var(--bg)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-[var(--text-3)]">Action requise</p>
            <p className="text-[13px] text-[var(--text)]">{transfer.actionRequired}</p>
          </div>
        )}

        {hasFees && (
          <div className="rounded-xl p-3 bg-[var(--bg)]">
            <p className="text-[11px] font-semibold uppercase tracking-wide mb-1 text-[var(--text-3)]">Frais NEOBANK à payer</p>
            <p className="text-[16px] font-mono font-bold text-[var(--blue)]">{fmt(transfer.fees)}</p>
            <p className="text-[11px] text-[var(--text-3)] mt-1">{showPay ? 'Ces frais seront débités de votre solde pour lancer le transfert.' : 'Frais NEOBANK appliqués à ce virement.'}</p>
          </div>
        )}

        {transfer.status === 'verifying' && !showPay && (
          <button onClick={confirmVerification} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-[12px]">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Compléter la validation
          </button>
        )}
        {showPay && (
          <button onClick={payFees} disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2 py-2.5 text-[12px]">
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Payer les frais ({fmt(transfer.fees)})
          </button>
        )}
        {blocked && (
          <p className="text-[11.5px] text-[var(--text-3)] text-center">Virement bloqué. Contactez le support NEOBANK pour plus d'informations.</p>
        )}
      </div>
    </div>
  );
}

export default function TransfersPage({ account, onSuccess }) {
  const [transfers, setTransfers] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [form, setForm] = useState({ beneficiaryId: '', accountHolder: '', iban: '', bic: '', bankName: '', amount: '', label: '' });
  const [loading, setLoading] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = useCallback(async () => {
    try {
      const [t, b] = await Promise.all([
        api.get('/transfers'),
        api.get('/beneficiaries'),
      ]);
      setTransfers(t.data.transfers || []);
      setBeneficiaries(b.data.beneficiaries || []);
    } catch (e) {
      toast.error('Erreur lors du chargement des virements');
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Rechargement auto : assure que les frais/messages NEOBANK imposés par l'admin
  // apparaissent chez le client sans rafraîchissement manuel.
  useEffect(() => {
    const id = setInterval(() => {
      api.get('/transfers')
        .then((res) => setTransfers(res.data.transfers || []))
        .catch(() => {});
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const selectBeneficiary = (id) => {
    const b = beneficiaries.find((x) => x.id === id);
    if (!b) return;
    setForm((f) => ({ ...f, beneficiaryId: id, accountHolder: b.name, iban: b.iban, bic: b.bic, bankName: b.bankName || '' }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const amount = parseFloat(form.amount);
    if (!amount || amount <= 0) { toast.error('Montant invalide'); return; }
    if (amount > (account?.balance || 0)) { toast.error('Solde insuffisant'); return; }
    if (!form.accountHolder.trim() || !form.iban.trim() || !form.bic.trim()) {
      toast.error('Informations du bénéficiaire requises');
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/transfers', {
        accountHolder: form.accountHolder.trim(),
        iban: form.iban.trim(),
        bic: form.bic.trim(),
        bankName: form.bankName?.trim() || undefined,
        amount,
        label: form.label?.trim() || undefined,
        beneficiaryId: form.beneficiaryId || undefined,
      });
      const st = data.transfer?.status;
      const openable = OPENABLE.includes(st);
      toast.success(openable ? 'Virement en attente de gestion' : (data.message || 'Virement traité'));
      setForm({ beneficiaryId: '', accountHolder: '', iban: '', bic: '', bankName: '', amount: '', label: '' });
      await load();
      onSuccess?.();
      if (openable) setSelected(data.transfer);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur lors du virement');
    } finally {
      setLoading(false);
    }
  };

  const previewAmt = parseFloat(form.amount) || 0;
  const balanceAfter = (account?.balance || 0) - previewAmt;

  return (
    <>
      <div className="space-y-4 fade-in max-w-4xl">
        <div>
          <h1 className="text-[19px] font-semibold tracking-tight">Virements</h1>
          <p className="text-[12px] text-[var(--text-3)] mt-0.5">Créez un virement et suivez son statut en temps réel</p>
        </div>

        {/* Liste des virements */}
        <div>
          <h3 className="text-[13px] font-semibold text-[var(--text)] mb-2">Mes virements ({transfers.length})</h3>
          {loadingList ? (
            <p className="text-[12px] text-[var(--text-3)]">Chargement…</p>
          ) : transfers.length === 0 ? (
            <div className="badge-amber p-3 flex items-center gap-2">
              <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
              <p className="text-[11.5px]">Aucun virement pour le moment.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {transfers.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => OPENABLE.includes(t.status) && setSelected(t)}
                  className={`card p-3 w-full text-left flex items-center justify-between gap-3 hover:border-[var(--text-3)] transition ${
                    OPENABLE.includes(t.status) ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text)] truncate">{t.externalAccountHolder}</p>
                    <p className="text-[11px] text-[var(--text-3)] font-mono truncate">{t.reference} · {new Date(t.createdAt).toLocaleDateString('fr-FR')}</p>
                    {t.label && <p className="text-[11px] text-[var(--text-3)] truncate">{t.label}</p>}
                    {Number(t.fees) > 0 && (
                      <p className="text-[11px] font-semibold text-[var(--blue)] mt-0.5">Frais NEOBANK : {fmt(Number(t.fees))}</p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className="font-mono text-[13px] font-semibold text-[var(--text)]">-{fmt(t.amount)}</span>
                    <span className={`text-[10.5px] px-2 py-0.5 rounded-full font-medium ${STATUS_STYLES[t.status] || 'badge-amber'}`}>
                      {STATUS_LABELS[t.status] || t.status}
                    </span>
                    {Number(t.fees) > 0 && ['pending_confirmation', 'verifying'].includes(t.status) && (
                      <span className="text-[10.5px] px-2 py-0.5 rounded-full font-semibold text-[var(--blue)] bg-[var(--blue-bg)]">
                        Frais à payer : {fmt(Number(t.fees))}
                      </span>
                    )}
                    {OPENABLE.includes(t.status) && (
                      <span className="text-[10.5px] text-[var(--blue)] font-medium flex items-center gap-0.5">
                        <ShieldAlert className="w-3 h-3" /> Voir le détail
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Formulaire */}
        <div className="max-w-lg pt-2">
          <h2 className="text-[17px] font-semibold tracking-tight">Nouveau virement</h2>
          <div className="badge-amber p-3 flex items-center gap-2 mt-3">
            <Info className="w-4 h-4 text-amber-500 flex-shrink-0" />
            <p className="text-[11.5px]">Selon le montant et les règles de sécurité, votre virement peut être vérifié ou suspendu automatiquement.</p>
          </div>

          {beneficiaries.length > 0 && (
            <div className="mt-3">
              <label className="label">Bénéficiaire enregistré (optionnel)</label>
              <select value={form.beneficiaryId} onChange={(e) => selectBeneficiary(e.target.value)} className="input-base">
                <option value="">— Choisir un bénéficiaire —</option>
                {beneficiaries.map((b) => (
                  <option key={b.id} value={b.id}>{b.name} · {b.iban}</option>
                ))}
              </select>
            </div>
          )}

          <form onSubmit={submit} className="card p-5 space-y-4 mt-3">
            <div>
              <label className="label">Nom du titulaire du compte</label>
              <input type="text" value={form.accountHolder} onChange={set('accountHolder')} placeholder="Jean Dupont" required className="input-base" />
            </div>
            <div>
              <label className="label">IBAN</label>
              <input type="text" value={form.iban} onChange={set('iban')} placeholder="FR76..." required className="input-base" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">BIC/SWIFT</label>
                <input type="text" value={form.bic} onChange={set('bic')} placeholder="BNPAFRPP" required className="input-base" />
              </div>
              <div>
                <label className="label">Banque (optionnel)</label>
                <input type="text" value={form.bankName} onChange={set('bankName')} placeholder="BNP Paribas..." className="input-base" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Montant (€)</label>
                <input type="number" value={form.amount} onChange={set('amount')} min="0.01" step="0.01" placeholder="0,00" required className="input-base" />
              </div>
              <div>
                <label className="label">Référence (optionnel)</label>
                <input type="text" value={form.label} onChange={set('label')} placeholder="Loyer, remboursement..." className="input-base" />
              </div>
            </div>
            <div className="bg-[var(--bg)] rounded-xl p-3 flex justify-between items-center">
              <span className="text-[11px] text-[var(--text-3)]">Solde après virement</span>
              <span className={`text-[13px] font-semibold font-mono ${balanceAfter < 0 ? 'text-red-600' : 'text-[var(--text)]'}`}>{fmt(balanceAfter)}</span>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowLeftRight className="w-4 h-4" />}
              Effectuer le virement
            </button>
          </form>
        </div>
      </div>

      <BlockedReasonModal
        transfer={selected}
        onClose={() => setSelected(null)}
        onConfirmed={load}
      />
    </>
  );
}
