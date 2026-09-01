import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Upload, CheckCircle, ArrowLeft, Globe, FileText, AlertTriangle, Clock, Copy, Building2, Landmark, Euro, CreditCard } from 'lucide-react';
import { ACTIVATION_AMOUNT, DEFAULT_BIC } from '../../utils/constants';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

function StepIndicator({ steps }) {
  return (
    <div className="flex items-center gap-0">
      {steps.map((step, idx) => {
        const isDone = step === 'done';
        const isActive = step === 'active';
        return (
          <div key={idx} className="flex items-center flex-1">
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center text-[10px] sm:text-xs font-bold transition-all ${
                isDone ? 'bg-teal-600 text-white shadow-sm shadow-teal-200' :
                isActive ? 'bg-teal-50 text-teal-700 border-2 border-teal-600' :
                'bg-slate-50 text-slate-300 border border-slate-200'
              }`}>
                {isDone ? <CheckCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : idx + 1}
              </div>
              <span className={`hidden sm:block text-[10px] font-medium whitespace-nowrap ${
                isDone ? 'text-teal-700' :
                isActive ? 'text-teal-700' :
                'text-slate-300'
              }`}>
                {['Demande', 'Justificatif', 'Dépôt', 'Validation', 'Active'][idx]}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-1 sm:mx-2 mt-[-16px] sm:mt-[-20px] rounded-full ${isDone ? 'bg-teal-400' : 'bg-slate-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function IbanCard({ iban, bic, onCopy }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-700 via-teal-800 to-teal-900 p-6 text-white shadow-xl shadow-teal-200/30">
      <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/5 rounded-full" />
      <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-white/5 rounded-full" />
      <div className="absolute top-1/2 right-8 w-16 h-16 bg-white/[0.03] rounded-full" />

      <div className="flex items-center gap-2 mb-6">
        <Building2 className="w-4 h-4 opacity-80" />
        <span className="text-xs font-medium tracking-wider opacity-80">NEOBANK</span>
      </div>

      <div className="space-y-4">
        <div>
          <p className="text-[10px] font-medium tracking-wider opacity-60 mb-1.5">IBAN</p>
          <div className="flex items-center gap-2">
            <p className="text-sm font-mono tracking-wider break-all font-medium">
              {iban || 'Non disponible'}
            </p>
            <button
              onClick={() => { navigator.clipboard.writeText(iban); toast.success('IBAN copié !'); }}
              className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center flex-shrink-0 transition ml-auto"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] font-medium tracking-wider opacity-60 mb-1">BIC</p>
            <p className="text-sm font-mono tracking-wider">{bic || DEFAULT_BIC}</p>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(bic || DEFAULT_BIC); toast.success('BIC copié !'); }}
            className="w-7 h-7 bg-white/15 hover:bg-white/25 rounded-lg flex items-center justify-center flex-shrink-0 transition"
          >
            <Copy className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function IbanFlow({ account, onRefresh, onBack }) {
  const status = account?.ibanStatus || 'none';

  const getStep = () => {
    if (status === 'active' || (status === 'approved' && account?.accountVerified))
      return 'completed';
    if ((status === 'assigned' || status === 'approved') && !account?.ibanProof)
      return 'deposit';
    if (status === 'proof_required')
      return 'proof';
    if (status === 'none' || status === 'pending')
      return 'request';
    return 'unknown';
  };

  const [step, setStep] = useState(getStep);
  const [formData, setFormData] = useState({ proofFile: null, proofUrl: '' });
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const next = getStep();
    if (step !== next) {
      if (next === 'completed') {
        toast.success('IBAN entièrement activé !');
      } else if (next === 'deposit' && step === 'proof') {
        toast.success('Justificatif validé ! Effectuez le dépôt pour activer.');
      } else if (next === 'proof' && step === 'request') {
        toast.success('IBAN proposé ! Veuillez fournir un justificatif.');
      }
      setStep(next);
    }
  }, [account?.ibanStatus, account?.ibanProof, account?.accountVerified]);

  const stepProgress = step === 'request' ? ['active', '', '', '', ''] :
    step === 'proof' ? ['done', 'active', '', '', ''] :
    step === 'deposit' ? ['done', 'done', 'active', '', ''] :
    step === 'completed' ? ['done', 'done', 'done', 'done', 'done'] :
    ['', '', '', '', ''];

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Veuillez sélectionner une image (PNG, JPG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 5MB");
      return;
    }

    setUploading(true);
    try {
      const reader = new FileReader();
      const base64Url = await new Promise((resolve, reject) => {
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      setFormData(prev => ({ ...prev, proofFile: file, proofUrl: base64Url }));
      toast.success('Image téléchargée avec succès');
    } catch {
      toast.error("Erreur lors du téléchargement de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleRequestIban = async () => {
    setLoading(true);
    try {
      const res = await api.post('/request-iban');
      toast.success("Demande d'IBAN envoyée !");
      if (res.data?.account) onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de la demande d'IBAN");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitIbanProof = async () => {
    if (!formData.proofFile) {
      toast.error('Veuillez télécharger votre justificatif');
      return;
    }
    setLoading(true);
    try {
      await api.post('/request-account-activation', {
        step: 'iban_proof',
        proofUrl: formData.proofUrl
      });
      toast.success('Justificatif envoyé ! En attente de validation admin...');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi du justificatif");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitProof = async () => {
    if (!formData.proofFile) {
      toast.error('Veuillez télécharger la preuve de virement');
      return;
    }

    setLoading(true);
    try {
      await api.post('/request-account-activation', {
        step: 'transfer_proof',
        amount: ACTIVATION_AMOUNT,
        proofUrl: formData.proofUrl
      });
      toast.success('Preuve envoyée ! En attente de validation admin...');
      onRefresh?.();
    } catch (err) {
      toast.error(err.response?.data?.error || "Erreur lors de l'envoi de la preuve");
    } finally {
      setLoading(false);
    }
  };

  if (step === 'unknown') {
    return (
      <div className="space-y-4 fade-in max-w-xl">
        {onBack && (
          <button type="button" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-[13px] text-amber-800 mb-1">État inconnu</h3>
              <p className="text-[11.5px] text-amber-700">Statut : <span className="font-mono bg-amber-100 px-1 rounded">{status}</span></p>
              <button onClick={() => onRefresh?.()} className="mt-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-medium transition">
                Actualiser
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'request') {
    const isPending = status === 'pending';
    return (
      <div className="space-y-5 fade-in max-w-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">IBAN / BIC</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">Coordonnées bancaires internationales</p>
          </div>
        </div>

        <StepIndicator steps={stepProgress} />

        {isPending ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[13px] text-amber-800">Demande en cours</h3>
                <p className="text-[11.5px] text-amber-700 mt-1">
                  Votre demande a été reçue. Un administrateur la traitera dans les plus brefs délais.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="bg-gradient-to-br from-teal-50 to-teal-100/50 border border-teal-200 rounded-xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-200">
                  <Landmark className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-[13px] text-teal-900">Activation de vos coordonnées bancaires</h3>
                  <p className="text-[11.5px] text-teal-800 mt-1 leading-relaxed">
                    Pour recevoir des virements, vous devez disposer d'un IBAN. Un administrateur vous attribuera 
                    un IBAN dans les 24h suivant votre demande.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-slate-100 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-teal-200/40">
                <Globe className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-[17px] font-semibold text-slate-900 mb-2">Vous n'avez pas encore d'IBAN</h3>
              <p className="text-[12px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                Faites votre demande pour obtenir un IBAN et commencer à recevoir des virements.
              </p>
              <button
                type="button"
                onClick={handleRequestIban}
                disabled={loading}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl text-[12px] transition w-full sm:w-auto shadow-sm shadow-teal-200"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Globe className="w-4 h-4" />
                )}
                {loading ? 'Envoi en cours...' : 'Demander mon IBAN'}
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  if (step === 'proof') {
    return (
      <div className="space-y-5 fade-in max-w-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">IBAN / BIC</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">Justificatif requis</p>
          </div>
        </div>

        <StepIndicator steps={stepProgress} />

        {account?.iban && account?.bic && (
          <IbanCard iban={account.iban} bic={account.bic} />
        )}

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[13px] text-amber-800">IBAN proposé — Validation requise</h3>
              <p className="text-[11.5px] text-amber-700 mt-1 leading-relaxed">
                Un administrateur vous a attribué un IBAN provisoire. Pour finaliser l'attribution, 
                veuillez fournir un justificatif d'identité ou un document officiel (passeport, carte d'identité, 
                permis de conduire).
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="text-[13px] font-semibold text-slate-800">Document justificatif</h3>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-2">
              Téléchargez votre justificatif (pièce d'identité, passeport, etc.)
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploading ? (
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                  <span className="text-[12px] text-slate-600">Téléchargement...</span>
                </div>
              ) : formData.proofUrl ? (
                <div className="inline-flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-teal-500" />
                  <span className="text-[12px] text-teal-700 font-medium">Fichier téléchargé</span>
                  <span className="text-[10px] text-slate-400">Cliquez pour changer</span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-[12px] text-slate-600">Cliquez pour télécharger</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG jusqu'à 5MB</span>
                </div>
              )}
            </div>

            {formData.proofUrl && (
              <div className="mt-4">
                <p className="text-[11px] font-medium text-slate-700 mb-2">Aperçu :</p>
                <img
                  src={formData.proofUrl}
                  alt="Justificatif"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitIbanProof}
            disabled={loading || !formData.proofFile}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl text-[12px] transition shadow-sm shadow-teal-200"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {loading ? 'Envoi en cours...' : 'Envoyer le justificatif'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'deposit') {
    return (
      <div className="space-y-5 fade-in max-w-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">IBAN / BIC</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">Activation de votre IBAN</p>
          </div>
        </div>

        <StepIndicator steps={stepProgress} />

        <IbanCard iban={account?.iban} bic={account?.bic} />

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-[13px] text-amber-800">IBAN attribué mais inactif</h3>
              <p className="text-[11.5px] text-amber-700 mt-1 leading-relaxed">
                Votre IBAN a été attribué mais nécessite une activation. Effectuez un dépôt de{' '}
                <span className="font-bold">{fmt(ACTIVATION_AMOUNT)}</span> et envoyez la preuve 
                pour l'activer définitivement.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-4 h-4 text-teal-600" />
            <h3 className="text-[13px] font-semibold text-slate-800">Preuve de dépôt requise</h3>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 mb-5">
            <ol className="space-y-2.5">
              {[
                `Effectuez un virement de ${fmt(ACTIVATION_AMOUNT)} depuis votre banque vers votre nouvel IBAN`,
                'Prenez une capture d\'écran de la confirmation de virement',
                'Téléchargez la capture ci-dessous comme preuve',
                'L\'administrateur validera votre activation sous 24h'
              ].map((text, i) => (
                <li key={i} className="flex items-start gap-3 text-[11.5px] text-slate-700">
                  <span className="w-5 h-5 bg-teal-100 text-teal-700 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {text}
                </li>
              ))}
            </ol>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-slate-700 mb-2">
              Capture d'écran de confirmation
            </label>
            <div
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-300 hover:bg-teal-50/30 transition-all cursor-pointer"
            >
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
              {uploading ? (
                <div className="inline-flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-2 border-teal-300 border-t-teal-600 rounded-full animate-spin" />
                  <span className="text-[12px] text-slate-600">Téléchargement...</span>
                </div>
              ) : formData.proofUrl ? (
                <div className="inline-flex flex-col items-center gap-2">
                  <CheckCircle className="w-8 h-8 text-teal-500" />
                  <span className="text-[12px] text-teal-700 font-medium">Fichier téléchargé</span>
                  <span className="text-[10px] text-slate-400">Cliquez pour changer</span>
                </div>
              ) : (
                <div className="inline-flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-[12px] text-slate-600">Cliquez pour télécharger</span>
                  <span className="text-[10px] text-slate-400">PNG, JPG jusqu'à 5MB</span>
                </div>
              )}
            </div>

            {formData.proofUrl && (
              <div className="mt-4">
                <p className="text-[11px] font-medium text-slate-700 mb-2">Aperçu :</p>
                <img
                  src={formData.proofUrl}
                  alt="Preuve de virement"
                  className="w-full h-48 object-cover rounded-xl border border-slate-200"
                />
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleSubmitProof}
            disabled={loading || !formData.proofFile}
            className="mt-5 w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-teal-700 hover:bg-teal-600 disabled:opacity-60 text-white font-semibold rounded-xl text-[12px] transition shadow-sm shadow-teal-200"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <FileText className="w-4 h-4" />
            )}
            {loading ? 'Envoi en cours...' : 'Envoyer la preuve de dépôt'}
          </button>
        </div>
      </div>
    );
  }

  if (step === 'completed') {
    return (
      <div className="space-y-5 fade-in max-w-2xl">
        <div className="flex items-center gap-3">
          {onBack && (
            <button type="button" onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg">
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h1 className="text-[19px] font-semibold tracking-tight">IBAN / BIC</h1>
            <p className="text-[12px] text-slate-500 mt-0.5">Coordonnées bancaires internationales</p>
          </div>
        </div>

        <StepIndicator steps={stepProgress} />

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-green-200/50">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-[18px] font-semibold text-green-900 mb-1">IBAN actif</h3>
          <p className="text-[12px] text-green-700 mb-5 max-w-sm mx-auto leading-relaxed">
            Votre IBAN est entièrement activé. Tous les services bancaires sont disponibles.
          </p>

          <IbanCard iban={account?.iban} bic={account?.bic} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Euro className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] font-semibold text-slate-800">Virements</span>
            </div>
            <p className="text-[11px] text-slate-500">Émettez et recevez des virements nationaux et internationaux</p>
          </div>
          <div className="bg-white border border-slate-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <CreditCard className="w-4 h-4 text-teal-600" />
              <span className="text-[11px] font-semibold text-slate-800">Carte bancaire</span>
            </div>
            <p className="text-[11px] text-slate-500">Demandez et gérez votre carte Visa Débit virtuelle</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
