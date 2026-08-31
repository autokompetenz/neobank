import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { Upload, CheckCircle2, Clock, AlertCircle, XCircle } from 'lucide-react';

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

export default function ProfilePage({ onSaved }) {
  const { userProfile, setUserProfile } = useAuth();
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
  });
  const [selfieFile, setSelfieFile] = useState(null);
  const [idFile, setIdFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [kycLoading, setKycLoading] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  useEffect(() => {
    if (!userProfile) return;
    const parts = (userProfile.displayName || userProfile.name || '').split(/\s+/);
    setForm({
      firstName: userProfile.firstName || parts[0] || '',
      lastName: userProfile.lastName || parts.slice(1).join(' ') || '',
      phone: userProfile.phone || '',
      address: userProfile.address || '',
    });
  }, [userProfile]);

  const save = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.patch('/profile', {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: form.address,
      });
      setUserProfile((p) => ({ ...p, ...data.user }));
      toast.success('Profil mis à jour !');
      onSaved?.();
    } catch {
      toast.error('Erreur');
    } finally {
      setLoading(false);
    }
  };

  const uploadKyc = async () => {
    if (!selfieFile || !idFile) {
      toast.error('Veuillez sélectionner les deux documents');
      return;
    }
    const MAX_SIZE = 1 * 1024 * 1024;
    if (selfieFile.size > MAX_SIZE || idFile.size > MAX_SIZE) {
      toast.error('Les fichiers ne doivent pas dépasser 1MB chacun');
      return;
    }
    if (!selfieFile.type.startsWith('image/') || !idFile.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner des images valides (JPG, PNG, etc.)');
      return;
    }
    setKycLoading(true);
    try {
      const selfieUrl = await readFileAsDataUrl(selfieFile);
      const documentUrl = await readFileAsDataUrl(idFile);
      const { data } = await api.post('/kyc/submit', { selfieUrl, documentUrl });
      setUserProfile((p) => ({ ...p, ...data.user }));
      setSelfieFile(null);
      setIdFile(null);
      toast.success('Demande KYC envoyée avec succès !');
      onSaved?.();
    } catch (e) {
      let errorMessage = 'Erreur lors de l\'envoi des documents';
      if (e.response?.data?.error) {
        errorMessage = e.response.data.error;
      } else if (e.response?.data?.details) {
        errorMessage = `${errorMessage}: ${e.response.data.details}`;
      } else if (e.message) {
        errorMessage = `${errorMessage}: ${e.message}`;
      }
      toast.error(errorMessage);
    } finally {
      setKycLoading(false);
    }
  };

  const kycConf = {
    pending: { icon: AlertCircle, cls: 'badge-amber', label: 'Non vérifié', desc: 'Soumettez une pièce d\'identité' },
    submitted: { icon: Clock, cls: 'badge-blue', label: 'En cours de vérification', desc: 'Document reçu' },
    approved: { icon: CheckCircle2, cls: 'badge-green', label: 'Identité vérifiée', desc: 'Votre identité a été confirmée' },
    rejected: { icon: XCircle, cls: 'badge-red', label: 'Document rejeté', desc: 'Soumettez un autre document' },
  };
  const kyc = kycConf[userProfile?.kycStatus] || kycConf.pending;
  const KycIcon = kyc.icon;

  return (
    <div className="space-y-4 fade-in max-w-xl">
      <div><h1 className="text-[19px] font-semibold tracking-tight">Mon profil</h1></div>

      {/* Account Summary Card */}
      <div className="card p-5">
        <h3 className="text-[13px] font-medium mb-3">Résumé du compte</h3>
        {[['Email', userProfile?.email], ['Nom complet', `${userProfile?.firstName || ''} ${userProfile?.lastName || ''}`.trim() || '—'], ['Téléphone', userProfile?.phone || '—'], ['Compte créé', userProfile?.createdAt ? new Date(userProfile.createdAt).toLocaleDateString('fr-FR') : '—'], ['Statut KYC', kyc.label]].map(([k, v]) => (
          <div key={k} className="flex justify-between items-center py-2 border-b border-[var(--border)] last:border-0">
            <span className="text-[12px] text-[var(--text-3)]">{k}</span>
            <span className="text-[12px] font-medium font-mono">{v}</span>
          </div>
        ))}
      </div>

      <div className={`${kyc.cls} p-4 flex items-start gap-3`}>
        <KycIcon className="w-5 h-5 mt-0.5 flex-shrink-0" />
        <div>
          <p className="text-[12.5px] font-semibold">{kyc.label}</p>
          <p className="text-[11.5px] mt-0.5 opacity-80">{kyc.desc}</p>
        </div>
      </div>
      <form onSubmit={save} className="card p-5 space-y-3.5">
        <p className="text-[13px] font-medium">Informations personnelles</p>
        <div className="grid grid-cols-2 gap-3">
          {[['firstName', 'Prénom'], ['lastName', 'Nom']].map(([k, ph]) => (
            <div key={k}>
              <input value={form[k]} onChange={set(k)} placeholder={ph} required
                className="input-base" />
            </div>
          ))}
        </div>
        <input value={form.phone} onChange={set('phone')} placeholder="Téléphone"
          className="input-base" />
        <textarea value={form.address} onChange={set('address')} placeholder="Adresse" rows={2}
          className="input-base" />
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? '…' : 'Enregistrer'}
        </button>
      </form>
      {userProfile?.kycStatus !== 'approved' && (
        <div className="card p-5 space-y-3">
          <p className="text-[13px] font-medium flex items-center gap-2"><Upload className="w-4 h-4" /> Vérification d'identité (KYC)</p>
          <div className="text-[11px] text-[var(--text-3)] space-y-1">
            <p>Format : Images uniquement (JPG, PNG, etc.)</p>
            <p>Taille maximale : 1MB par fichier</p>
            <p>Documents requis : Selfie + Pièce d'identité</p>
          </div>
          <div className="space-y-3">
            <div>
              <label className="label">Selfie (photo portrait)</label>
              <input type="file" accept="image/*"
                onChange={(e) => setSelfieFile(e.target.files?.[0] || null)}
                className="block w-full text-[12px] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-[var(--blue)] hover:file:bg-blue-100" />
              {selfieFile && (
                <div className="mt-1 text-[10px] text-[var(--green)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {selfieFile.name} ({(selfieFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
            <div>
              <label className="label">Pièce d'identité (carte d'identité, passeport, etc.)</label>
              <input type="file" accept="image/*"
                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                className="block w-full text-[12px] file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-blue-50 file:text-[var(--blue)] hover:file:bg-blue-100" />
              {idFile && (
                <div className="mt-1 text-[10px] text-[var(--green)] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  {idFile.name} ({(idFile.size / 1024 / 1024).toFixed(2)} MB)
                </div>
              )}
            </div>
          </div>
          <button type="button" onClick={uploadKyc}
            disabled={kycLoading || !selfieFile || !idFile}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed">
            {kycLoading ? 'Envoi en cours...' : 'Envoyer les documents'}
          </button>
        </div>
      )}
    </div>
  );
}
