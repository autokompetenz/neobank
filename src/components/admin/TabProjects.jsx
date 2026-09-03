import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { ChevronLeft, ChevronRight, Folder, Search, MessageSquare, FileText, Send, Loader2, Plus, Phone, Mail } from 'lucide-react';

const STATUS_META = {
  nouveau: { label: 'Nouveau', cls: 'bg-blue-100 text-blue-800', order: 0 },
  en_analyse: { label: 'En analyse', cls: 'bg-indigo-100 text-indigo-800', order: 1 },
  informations_requises: { label: 'Infos requises', cls: 'bg-amber-100 text-amber-800', order: 2 },
  documents_recus: { label: 'Documents reçus', cls: 'bg-cyan-100 text-cyan-800', order: 3 },
  en_cours: { label: 'En cours', cls: 'bg-violet-100 text-violet-800', order: 4 },
  termine: { label: 'Terminé', cls: 'bg-emerald-100 text-emerald-800', order: 5 },
  refuse: { label: 'Refusé', cls: 'bg-red-100 text-red-800', order: 6 },
};
const STATUSES = Object.keys(STATUS_META);

const fmt = (n) => n ? new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(n) : '—';
const projectLabel = (t) => ({
  immobilier: 'Immobilier', automobile: 'Automobile', entreprise: 'Création d’entreprise',
  etudes: 'Études', construction: 'Construction', travaux: 'Travaux',
  international: 'International', personnel: 'Personnel',
}[t] || t);

const Badge = ({ s }) => {
  const m = STATUS_META[s] || STATUS_META.nouveau;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${m.cls}`}>{m.label}</span>;
};

function DocRow({ doc, onValidate }) {
  return (
    <div className="flex items-center justify-between p-3 border border-[var(--border)] rounded-xl bg-white/60">
      <div className="flex items-center gap-3 min-w-0">
        <FileText size={16} className="text-[var(--blue)] shrink-0" />
        <div className="min-w-0">
          <p className="text-[12.5px] font-semibold truncate">{doc.filename}</p>
          <p className="text-[10.5px] text-[var(--text-3)]">{Math.round(doc.size / 1024)} Ko · {new Date(doc.createdAt).toLocaleDateString('fr-FR')}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {doc.status !== 'valide' ? (
          <button onClick={() => onValidate(doc, 'valide')} className="text-[11px] font-semibold text-emerald-600 hover:underline">Valider</button>
        ) : (
          <span className="text-[11px] font-semibold text-emerald-600">Validé</span>
        )}
        {doc.status === 'valide' ? (
          <button onClick={() => onValidate(doc, 'a_remplacer')} className="text-[11px] font-semibold text-amber-600 hover:underline">À remplacer</button>
        ) : (
          <button onClick={() => onValidate(doc, 'a_remplacer')} className="text-[11px] font-semibold text-amber-600 hover:underline">Remplacer</button>
        )}
      </div>
    </div>
  );
}

export default function TabProjects({ adminId }) {
  const [applications, setApplications] = useState([]);
  const [counts, setCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [note, setNote] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [advisors, setAdvisors] = useState([]);

  const loadList = async () => {
    try {
      const { data } = await api.get('/admin/projects');
      setApplications(data.applications || []);
      setCounts(data.counts || {});
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur de chargement des projets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadList();
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    (async () => {
      setDetailLoading(true);
      try {
        const { data } = await api.get(`/projects/${selectedId}`);
        setDetail(data);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Erreur de chargement du dossier');
      } finally {
        setDetailLoading(false);
      }
    })();
  }, [selectedId]);

  const updateStatus = async (status) => {
    setBusy(true);
    try {
      await api.post(`/admin/projects/${selectedId}/decide`, { status });
      toast.success('Statut mis à jour');
      const { data } = await api.get(`/projects/${selectedId}`);
      setDetail(data);
      await loadList();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    setBusy(true);
    try {
      await api.post(`/admin/projects/${selectedId}/decide`, { note: note.trim() });
      setNote('');
      toast.success('Note interne ajoutée');
      const { data } = await api.get(`/projects/${selectedId}`);
      setDetail(data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const sendMsg = async () => {
    if (!msg.trim()) return;
    setBusy(true);
    try {
      await api.post(`/projects/${selectedId}/messages`, { message: msg.trim() });
      setMsg('');
      toast.success('Message envoyé au client');
      const { data } = await api.get(`/projects/${selectedId}`);
      setDetail(data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const validateDoc = async (doc, status) => {
    setBusy(true);
    try {
      await api.post(`/admin/projects/${selectedId}/documents/${doc.id}`, { status });
      toast.success('Document mis à jour');
      const { data } = await api.get(`/projects/${selectedId}`);
      setDetail(data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setBusy(false);
    }
  };

  const filtered = applications.filter((a) => {
    if (filter !== 'all' && a.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${a.clientName || ''} ${a.clientEmail || ''} ${projectLabel(a.projectType)} ${a.fullName || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  if (selectedId && detail) {
    const app = detail.application;
    return (
      <div>
        <button onClick={() => { setSelectedId(null); setDetail(null); }} className="inline-flex items-center gap-1 text-[12.5px] font-semibold text-[var(--blue)] hover:underline mb-3">
          <ChevronLeft size={14} /> Retour à la liste
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Colonne info + actions */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-[14px]">Dossier</h3>
                <Badge s={app.status} />
              </div>
              <div className="space-y-2 text-[12.5px]">
                <Row k="Type" v={projectLabel(app.projectType)} />
                <Row k="Montant" v={fmt(app.amount)} />
                <Row k="Revenus" v={fmt(app.monthlyIncome)} />
                <Row k="Situation" v={app.employmentStatus || '—'} />
                <Row k="Pays" v={app.country || '—'} />
                <Row k="Conseiller" v={app.advisorName || '—'} />
                <Row k="Déposée le" v={new Date(app.createdAt).toLocaleDateString('fr-FR')} />
              </div>
            </div>

            {/* Changement de statut */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <h4 className="font-bold text-[13px] mb-3">Changer le statut</h4>
              <div className="grid grid-cols-2 gap-2">
                {STATUSES.filter((s) => s !== 'nouveau').map((s) => (
                  <button
                    key={s}
                    onClick={() => updateStatus(s)}
                    disabled={busy || s === app.status}
                    className={`text-[12px] font-semibold px-3 py-2 rounded-xl border transition-colors ${
                      s === app.status ? 'border-[var(--blue)] text-[var(--blue)] bg-[var(--blue-bg)]' : 'border-[var(--border)] hover:border-[var(--blue)]'
                    } disabled:opacity-60`}
                  >
                    {STATUS_META[s].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notes internes */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <h4 className="font-bold text-[13px] mb-3">Notes internes</h4>
              <div className="space-y-2 mb-3">
                {(app.internalNotes || []).length === 0 && <p className="text-[12px] text-[var(--text-3)]">Aucune note.</p>}
                {(app.internalNotes || []).map((n, i) => (
                  <div key={i} className="p-2.5 rounded-lg bg-amber-50 text-[12px]">
                    {n.note}
                    <div className="text-[10px] text-[var(--text-3)] mt-1">{new Date(n.at).toLocaleString('fr-FR')}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Ajouter une note…" className="input-base flex-1 text-[12px]" />
                <button onClick={addNote} disabled={busy || !note.trim()} className="btn btn-primary text-[12px]"><Plus size={14} /></button>
              </div>
            </div>
          </div>

          {/* Colonne documents + messages */}
          <div className="lg:col-span-2 space-y-4">
            {/* Client */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <h3 className="font-bold text-[14px] mb-3">Client</h3>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center font-bold text-[13px]">
                  {app.clientName ? app.clientName.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase() : '?'}
                </div>
                <div>
                  <p className="text-[13.5px] font-semibold">{app.clientName || 'Client'}{app.fullName ? ` · ${app.fullName}` : ''}</p>
                  <p className="text-[11.5px] text-[var(--text-3)] flex items-center gap-1"><Mail size={12} /> {app.clientEmail}</p>
                  {app.phone && <p className="text-[11.5px] text-[var(--text-3)] flex items-center gap-1"><Phone size={12} /> {app.phone}</p>}
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <h3 className="font-bold text-[14px] mb-3">Documents ({detail.documents.length})</h3>
              {detail.detailLoading ? <p className="text-[12px] text-[var(--text-3)]">Chargement…</p> : detail.documents.length === 0 ? (
                <p className="text-[12px] text-[var(--text-3)]">Aucun document transmis.</p>
              ) : (
                <div className="space-y-2">
                  {detail.documents.map((d) => <DocRow key={d.id} doc={d} onValidate={validateDoc} />)}
                </div>
              )}
            </div>

            {/* Messages */}
            <div className="bg-white rounded-2xl border border-[var(--border)] p-4">
              <h3 className="font-bold text-[14px] mb-3">Messages ({detail.messages.length})</h3>
              <div className="space-y-2 mb-3 max-h-64 overflow-y-auto">
                {detail.messages.length === 0 && <p className="text-[12px] text-[var(--text-3)]">Aucun message.</p>}
                {detail.messages.map((m) => (
                  <div key={m.id} className={`max-w-[80%] p-2.5 rounded-2xl text-[12.5px] ${m.senderRole === 'conseiller' ? 'bg-[var(--blue)] text-white ml-auto' : 'bg-slate-100'}`}>
                    {m.message}
                    <div className={`text-[10px] mt-1 ${m.senderRole === 'conseiller' ? 'text-white/70' : 'text-[var(--text-3)]'}`}>
                      {m.senderRole === 'conseiller' ? 'Conseiller' : 'Client'} · {new Date(m.createdAt).toLocaleString('fr-FR')}
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <input value={msg} onChange={(e) => setMsg(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && sendMsg()} placeholder="Répondre au client…" className="input-base flex-1 text-[12px]" />
                <button onClick={sendMsg} disabled={busy || !msg.trim()} className="btn btn-primary text-[12px] shrink-0">
                  {busy ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const statusFilterTabs = [['all', 'Toutes'], ...STATUSES.map((s) => [s, STATUS_META[s].label])];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg font-bold">Demandes de projets</h2>
          <p className="text-[12.5px] text-[var(--text-3)]">Accompagnement NEOBANK · analyse, documents et suivi des dossiers.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-4">
        {STATUSES.map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`rounded-xl border p-3 text-left transition-colors ${filter === s ? 'border-[var(--blue)] bg-[var(--blue-bg)]' : 'bg-white border-[var(--border)]'}`}>
            <p className="text-[18px] font-extrabold">{counts[s] || 0}</p>
            <p className="text-[10.5px] text-[var(--text-3)] leading-tight">{STATUS_META[s].label}</p>
          </button>
        ))}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2 mb-3">
        {statusFilterTabs.map(([id, label]) => (
          <button key={id} onClick={() => setFilter(id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-semibold transition-colors ${filter === id ? 'bg-[var(--blue)] text-white' : 'bg-white border border-[var(--border)] text-[var(--text-2)]'}`}>
            {label}
          </button>
        ))}
      </div>

      <div className="relative mb-4 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]" />
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher client / type…" className="input-base pl-9 text-[13px]" />
      </div>

      {loading ? (
        <p className="text-[13px] text-[var(--text-3)] py-8 text-center">Chargement…</p>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[var(--border)] py-12 text-center">
          <Folder size={28} className="mx-auto mb-2 text-[var(--text-3)]" />
          <p className="text-[13.5px] text-[var(--text-3)]">Aucun dossier dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((a) => (
            <button key={a.id} onClick={() => setSelectedId(a.id)}
              className="w-full flex items-center justify-between gap-3 bg-white rounded-xl border border-[var(--border)] p-3 hover:border-[var(--blue)] transition-colors text-left">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[var(--blue-bg)] text-[var(--blue)] flex items-center justify-center font-bold text-[12px] shrink-0">
                  {projectLabel(a.projectType).slice(0, 1)}
                </div>
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold truncate">{projectLabel(a.projectType)} · {fmt(a.amount)}</p>
                  <p className="text-[11.5px] text-[var(--text-3)] truncate">{a.clientName || a.fullName || '—'} {a.fullName ? `(${a.fullName})` : ''}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge s={a.status} />
                <ChevronRight size={16} className="text-[var(--text-3)]" />
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Row({ k, v }) {
  return (
    <div className="flex justify-between gap-2">
      <span className="text-[var(--text-3)]">{k}</span>
      <span className="font-semibold">{v}</span>
    </div>
  );
}