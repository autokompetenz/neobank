import { useState, useEffect } from 'react';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import { FileText, Upload, Trash2, Send, Plus, Folder, ChevronRight, MessageSquare, CheckCircle2, Clock, AlertCircle, Loader2 } from 'lucide-react';

const STATUS_META = {
  nouveau: { label: 'Nouveau', color: 'badge-blue', icon: CheckCircle2 },
  en_analyse: { label: 'En analyse', color: 'badge-blue', icon: Clock },
  informations_requises: { label: 'Informations requises', color: 'badge-amber', icon: AlertCircle },
  documents_recus: { label: 'Documents reçus', color: 'badge-green', icon: FileText },
  en_cours: { label: 'En cours', color: 'badge-amber', icon: Clock },
  termine: { label: 'Terminé', color: 'badge-green', icon: CheckCircle2 },
  refuse: { label: 'Refusé', color: 'badge-red', icon: AlertCircle },
};

const projectTypeLabel = (t) => {
  const map = {
    immobilier: 'Immobilier', automobile: 'Automobile', entreprise: 'Création d\'entreprise',
    etudes: 'Études', construction: 'Construction', travaux: 'Travaux',
    international: 'Projet international', personnel: 'Projet personnel',
  };
  return map[t] || t;
};

function Chip({ color = 'gray', children }) {
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${color === 'red' ? 'badge-red' : color === 'amber' ? 'badge-amber' : color === 'green' ? 'badge-green' : 'badge-blue'}`}>{children}</span>;
}

const fmt = (n) => n ? `${new Intl.NumberFormat('fr-FR').format(n)} €` : '—';

function ProjectDetail({ project, onBack }) {
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/projects/${project.id}`);
        setDetail(data);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Erreur de chargement du dossier');
      } finally {
        setLoading(false);
      }
    })();
  }, [project.id]);

  const meta = STATUS_META[detail?.application.status] || STATUS_META.nouveau;
  const StatusIcon = meta.icon;

  const send = async () => {
    if (!msg.trim()) return;
    setSending(true);
    try {
      await api.post(`/projects/${project.id}/messages`, { message: msg.trim() });
      setMsg('');
      const { data } = await api.get(`/projects/${project.id}`);
      setDetail(data);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'envoi');
    } finally {
      setSending(false);
    }
  };

  const upload = async () => {
    if (!file) return toast.error('Sélectionnez un document');
    if (!['application/pdf', 'image/jpeg', 'image/png'].includes(file.type)) {
      return toast.error('Format non autorisé (PDF, JPG, PNG uniquement)');
    }
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const url = reader.result; // stockage côté serveur à relier en production
        await api.post(`/projects/${project.id}/documents`, { filename: file.name, mimetype: file.type, size: file.size, url });
        toast.success('Document envoyé (en attente de vérification)');
        setFile(null);
        const { data } = await api.get(`/projects/${project.id}`);
        setDetail(data);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Erreur lors de l\'envoi du document');
      }
    };
    reader.readAsDataURL(file);
  };

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Chargement du dossier…</div>;
  }

  const metrics = [
    { k: 'Type de projet', v: projectTypeLabel(detail.application.projectType) },
    { k: 'Montant souhaité', v: fmt(detail.application.amount) },
    { k: 'Revenus mensuels', v: fmt(detail.application.monthlyIncome) },
    { k: 'Situation', v: detail.application.employmentStatus || '—' },
    { k: 'Pays', v: detail.application.country || '—' },
  ];

  return (
    <div className="space-y-4">
      <button onClick={onBack} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 12.5, fontWeight: 600, color: 'var(--blue)', cursor: 'pointer', background: 'none', border: 'none' }}>
        <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Retour à mes projets
      </button>

      {/* Header dossier */}
      <div className="card p-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>{projectTypeLabel(detail.application.projectType)}</h2>
              <Chip color={meta.color}>{meta.label}</Chip>
            </div>
            <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
              Demande du {new Date(detail.application.createdAt).toLocaleDateString('fr-FR')} · n° {detail.application.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'var(--blue-bg)', padding: '6px 12px', borderRadius: 10, fontSize: 12, fontWeight: 700, color: 'var(--blue)' }}>
            <StatusIcon size={15} />
            {meta.label}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card p-4">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Avancement de votre demande</h3>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {[['nouveau', 'Demande reçue'], ['en_analyse', 'Analyse en cours'], ['informations_requises', 'Infos complémentaires'], ['en_cours', 'Étude en cours'], ['termine', 'Dossier terminé']].map(([s, label], i, arr) => {
            const order = ['nouveau', 'en_analyse', 'informations_requises', 'en_cours', 'termine'].indexOf(detail.application.status);
            const done = i <= order;
            return (
              <div key={s} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
                <div style={{ width: 22, height: 22, margin: '0 auto', borderRadius: '50%', background: done ? '#1D9E75' : 'var(--bg-card2)', color: done ? '#fff' : 'var(--text-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, position: 'relative', zIndex: 2 }}>
                  {done ? <CheckCircle2 size={12} /> : i + 1}
                </div>
                <div style={{ fontSize: 9.5, color: done ? 'var(--green)' : 'var(--text-3)', marginTop: 6 }}>{label}</div>
                {i < arr.length - 1 && (
                  <div style={{ position: 'absolute', top: 11, left: '50%', width: '100%', height: 2, background: 'var(--border)', zIndex: 1 }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Infos */}
      <div className="card p-4">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14 }}>Informations du dossier</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {metrics.map((m) => (
            <div key={m.k} style={{ background: 'var(--bg)', borderRadius: 10, padding: 12 }}>
              <div style={{ fontSize: 10.5, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '.04em' }}>{m.k}</div>
              <div style={{ fontSize: 14, fontWeight: 700, marginTop: 4 }}>{m.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Documents */}
      <div className="card p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>Documents</h3>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input type="file" id="doc-upload" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }}
              onChange={(e) => setFile(e.target.files?.[0] || null)} />
            <label htmlFor="doc-upload" className="btn btn-secondary" style={{ fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <Plus size={13} /> Choisir
            </label>
            {file && (
              <button onClick={upload} className="btn btn-primary" style={{ fontSize: 11, display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                <Upload size={13} /> Envoyer
              </button>
            )}
          </div>
        </div>
        {file && <p style={{ fontSize: 11, color: 'var(--text-2)', marginBottom: 10 }}>Fichier sélectionné : {file.name}</p>}
        {detail.documents.length === 0 ? (
          <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Aucun document transmis pour le moment.</p>
        ) : (
          <div className="space-y-2">
            {detail.documents.map((d) => (
              <div key={d.id} className="flex items-center gap-3 p-3" style={{ background: 'var(--bg)', borderRadius: 10 }}>
                <FileText size={16} style={{ color: 'var(--blue)', flexShrink: 0 }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: 12.5, fontWeight: 600, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.filename}</p>
                  <p style={{ fontSize: 10.5, color: 'var(--text-3)', margin: 0 }}>
                    {d.status === 'valide' ? 'Validé' : d.status === 'en_vérification' ? 'En cours de vérification' : d.status === 'a_remplacer' ? 'À remplacer' : d.status === 'recu' ? 'Reçu' : 'En attente'}
                  </p>
                </div>
                <span style={{ fontSize: 11, color: 'var(--text-3)' }}>{(d.size / 1024).toFixed(0)} Ko</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="card p-4">
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>Messages avec votre conseiller</h3>
        <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
          {detail.messages.length === 0 && <p style={{ fontSize: 12, color: 'var(--text-3)' }}>Aucun message pour le moment.</p>}
          {detail.messages.map((m) => (
            <div key={m.id} style={{ maxWidth: '80%', alignSelf: m.senderRole === 'client' ? 'flex-end' : 'flex-start', background: m.senderRole === 'client' ? 'var(--blue)' : 'var(--bg-card2)', color: m.senderRole === 'client' ? '#fff' : 'var(--text)', padding: '8px 12px', borderRadius: 14, fontSize: 12.5 }}>
              {m.message}
              <div style={{ fontSize: 9.5, marginTop: 4, opacity: 0.7 }}>{new Date(m.createdAt).toLocaleString('fr-FR')}</div>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder="Écrire un message à votre conseiller…"
            className="input-base"
            style={{ flex: 1 }}
          />
          <button onClick={send} disabled={sending || !msg.trim()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProjectsSection() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/projects');
        setProjects(data.applications || []);
      } catch (e) {
        toast.error(e.response?.data?.error || 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (selected) {
    return <ProjectDetail project={selected} onBack={() => setSelected(null)} />;
  }

  if (loading) {
    return <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Chargement de vos projets…</div>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 style={{ fontSize: 18, fontWeight: 700 }}>Mes projets</h2>
        <p style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
          Suivez l’avancement de vos demandes, envoyez vos documents et échangez avec votre conseiller.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="card p-10 text-center">
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Folder size={26} style={{ color: 'var(--blue)' }} />
          </div>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>Aucun projet pour le moment</h3>
          <p style={{ fontSize: 12.5, color: 'var(--text-3)', maxWidth: 360, margin: '0 auto 16px' }}>
            Présentez votre projet via le simulateur pour commencer votre accompagnement NEOBANK.
          </p>
          <a href="/simulateur" className="btn btn-primary" style={{ textDecoration: 'none' }}>Évaluer mon projet</a>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map((p) => {
            const meta = STATUS_META[p.status] || STATUS_META.nouveau;
            return (
              <button key={p.id} onClick={() => setSelected(p)} className="card p-4 w-full text-left" style={{ cursor: 'pointer', display: 'block', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--blue-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MessageSquare size={18} style={{ color: 'var(--blue)' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 14, fontWeight: 700, margin: 0 }}>{projectTypeLabel(p.projectType)}</p>
                      <p style={{ fontSize: 11, color: 'var(--text-3)', margin: '2px 0 0' }}>
                        {fmt(p.amount)} · {new Date(p.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Chip color={meta.color}>{meta.label}</Chip>
                    <ChevronRight size={18} style={{ color: 'var(--text-3)' }} />
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}