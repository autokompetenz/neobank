import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Eye, EyeOff, Plus } from 'lucide-react';

export default function CardPage({ card, onRefresh }) {
  const { userProfile } = useAuth();
  const [showDetails, setShowDetails] = useState(true);
  const [requesting, setRequesting] = useState(false);

  const requestCard = async () => {
    setRequesting(true);
    try {
      await api.post('/request-card');
      toast.success('Demande de carte envoyée !');
      onRefresh?.();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    } finally {
      setRequesting(false);
    }
  };

  const blockCard = async () => {
    try {
      await api.post('/card/block');
      toast.success('Carte bloquée');
      onRefresh?.();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur');
    }
  };

  const bgColor = card?.status === 'active' ? 'bg-[var(--blue)]' : card?.status === 'blocked' ? 'bg-slate-600' : 'bg-slate-500';

  return (
    <div className="space-y-4 fade-in">
      <div><h1 className="text-[19px] font-semibold tracking-tight">Carte bancaire</h1><p className="text-[12px] text-[var(--text-3)] mt-0.5">Carte virtuelle</p></div>

      {!card ? (
        <div className="card p-10 text-center">
          <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CreditCard className="w-7 h-7 text-[var(--blue)]" />
          </div>
          <h3 className="font-semibold mb-2">Aucune carte</h3>
          <p className="text-[12px] text-[var(--text-3)] mb-5">Demandez votre carte Visa Débit virtuelle</p>
          <button type="button" onClick={requestCard} disabled={requesting}
            className="btn-primary inline-flex items-center gap-2">
            {requesting ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus className="w-4 h-4" />}
            Demander ma carte
          </button>
        </div>
      ) : (
        <>
          <div className="flex justify-center mb-6">
            <div className={`w-full max-w-sm ${bgColor} rounded-2xl p-5 text-white relative overflow-hidden card-shine shadow-xl`}>
              <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -translate-y-10 translate-x-10" />
              <div className="absolute bottom-0 left-10 w-16 h-16 bg-white/5 rounded-full translate-y-8" />
              <div className="flex justify-between items-start mb-6">
                <p className="text-[11px] opacity-80 font-medium">NEOBANK</p>
                <div className="bg-white/20 px-2 py-1 rounded-full text-[10px]">
                  {card.status === 'active' ? 'Active' : card.status === 'blocked' ? 'Bloquée' : 'En attente'}
                </div>
              </div>
              <p className="text-[12px] sm:text-[16px] font-mono tracking-normal sm:tracking-widest mb-4 leading-relaxed break-all">
                {showDetails && card.fullNumber ? card.fullNumber : '**** **** **** ' + card.last4}
              </p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Titulaire</p>
                  <p className="text-[11px] truncate max-w-[120px]">{card.holderName || userProfile?.displayName}</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] opacity-60 uppercase tracking-wider mb-1">Expire</p>
                  <p className="text-[11px] font-mono">{String(card.expiryMonth || '').padStart(2, '0')}/{String(card.expiryYear || '').slice(-2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[14px] font-semibold text-[var(--text)]">Ma carte bancaire</h3>
              <span className={`badge ${card.status === 'active' ? 'badge-green' : card.status === 'blocked' ? 'badge-red' : 'badge-amber'}`}>
                {card.status === 'active' ? 'Active' : card.status === 'blocked' ? 'Bloquée' : 'En attente'}
              </span>
            </div>
            <div className="space-y-3">
              {[
                ['Type de carte', 'Visa Débit Virtuelle'],
                ['4 derniers chiffres', card.last4 || '----'],
                ['Date d\'expiration', `${String(card.expiryMonth || '--').padStart(2, '0')}/${String(card.expiryYear || '--').slice(-2)}`],
                ['Titulaire', card.holderName || userProfile?.displayName || 'Non spécifié'],
                ...(showDetails ? [
                  ['CVV', card.cvvEncrypted || '***'],
                  ...(card.fullNumber ? [['Numéro complet', card.fullNumber]] : []),
                ] : []),
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-3 border-b border-[var(--border)] last:border-0">
                  <span className="text-[12px] text-[var(--text-2)]">{k}</span>
                  <span className="text-[12px] font-medium font-mono text-[var(--text)]">{v}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 pt-2">
              <button type="button" onClick={() => setShowDetails((s) => !s)}
                className="flex-1 btn-outline py-2.5 text-[12px] font-medium flex items-center justify-center gap-2">
                {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                {showDetails ? 'Masquer les détails' : 'Afficher les détails'}
              </button>
              {card.status === 'active' && (
                <button type="button" onClick={blockCard}
                  className="flex-1 btn-danger py-2.5 text-[12px] font-medium">
                  Bloquer la carte
                </button>
              )}
            </div>
            <div className={`text-center text-[11px] p-3 rounded-lg ${
              card.status === 'active' ? 'badge-green' :
              card.status === 'blocked' ? 'badge-red' :
              'badge-amber'
            }`}>
              {card.status === 'pending' && 'Votre carte est en attente d\'activation par l\'administrateur'}
              {card.status === 'blocked' && 'Votre carte est bloquée. Contactez le support pour la réactiver'}
              {card.status === 'active' && 'Votre carte est active et prête à être utilisée'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
