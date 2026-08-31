import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { UserPlus, Trash2, Users, Pencil } from 'lucide-react';

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', iban: '', bic: '', bankName: '' });
  const [editingId, setEditingId] = useState(null);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const load = async () => {
    try {
      const { data } = await api.get('/beneficiaries');
      setBeneficiaries(data.beneficiaries || []);
    } catch (e) {
      toast.error('Erreur lors du chargement des bénéficiaires');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.iban.trim() || !form.bic.trim()) {
      toast.error('Nom, IBAN et BIC requis');
      return;
    }
    try {
      if (editingId) {
        await api.patch(`/beneficiaries/${editingId}`, form);
        toast.success('Bénéficiaire mis à jour');
      } else {
        await api.post('/beneficiaries', form);
        toast.success('Bénéficiaire ajouté');
      }
      setForm({ name: '', iban: '', bic: '', bankName: '' });
      setEditingId(null);
      await load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur');
    }
  };

  const remove = async (id) => {
    if (!confirm('Supprimer ce bénéficiaire ?')) return;
    try {
      await api.delete(`/beneficiaries/${id}`);
      toast.success('Bénéficiaire supprimé');
      await load();
    } catch (e) {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="space-y-4 fade-in max-w-4xl">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Bénéficiaires</h1>
        <p className="text-[12px] text-[var(--text-3)] mt-0.5">Gérez vos bénéficiaires pour accélérer vos virements</p>
      </div>

      <form onSubmit={submit} className="card p-5 space-y-4">
        <h2 className="text-[15px] font-semibold flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-[var(--blue)]" />
          {editingId ? 'Modifier le bénéficiaire' : 'Ajouter un bénéficiaire'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="label">Nom du bénéficiaire</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Jean Dupont" className="input-base" />
          </div>
          <div>
            <label className="label">Banque (optionnel)</label>
            <input type="text" value={form.bankName} onChange={set('bankName')} placeholder="BNP Paribas..." className="input-base" />
          </div>
          <div>
            <label className="label">IBAN</label>
            <input type="text" value={form.iban} onChange={set('iban')} placeholder="FR76..." className="input-base" />
          </div>
          <div>
            <label className="label">BIC/SWIFT</label>
            <input type="text" value={form.bic} onChange={set('bic')} placeholder="BNPAFRPP" className="input-base" />
          </div>
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary px-4 py-2 text-[12px]">
            {editingId ? 'Mettre à jour' : 'Ajouter le bénéficiaire'}
          </button>
          {editingId && (
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: '', iban: '', bic: '', bankName: '' }); }} className="btn-ghost px-4 py-2 text-[12px]">
              Annuler
            </button>
          )}
        </div>
      </form>

      <div>
        <h3 className="text-[13px] font-semibold text-[var(--text)] flex items-center gap-2 mb-2">
          <Users className="w-4 h-4" /> Mes bénéficiaires ({beneficiaries.length})
        </h3>
        {loading ? (
          <p className="text-[12px] text-[var(--text-3)]">Chargement…</p>
        ) : beneficiaries.length === 0 ? (
          <p className="text-[12px] text-[var(--text-3)] text-center py-8">Aucun bénéficiaire enregistré.</p>
        ) : (
          <div className="space-y-2">
            {beneficiaries.map((b) => (
              <div key={b.id} className="card p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center text-[12px] font-bold flex-shrink-0">
                    {b.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[var(--text)] truncate">{b.name}</p>
                    <p className="text-[11px] text-[var(--text-3)] font-mono truncate">{b.iban} · {b.bic}</p>
                    {b.bankName && <p className="text-[11px] text-[var(--text-3)]">{b.bankName}</p>}
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => { setEditingId(b.id); setForm({ name: b.name, iban: b.iban, bic: b.bic, bankName: b.bankName || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="p-2 text-[var(--text-3)] hover:text-[var(--blue)] transition" title="Modifier"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(b.id)} className="p-2 text-[var(--text-3)] hover:text-red-500 transition" title="Supprimer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
