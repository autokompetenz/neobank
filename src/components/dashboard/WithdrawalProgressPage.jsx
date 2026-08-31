import { useState, useEffect, useRef } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { 
  ArrowLeftRight, Clock, CheckCircle, Key, AlertCircle, TrendingUp,
  FileText, Shield, RefreshCw, Mail
} from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
const fmtDate = (d) => format(new Date(d), "d MMM yyyy 'à' HH:mm", { locale: fr });

export default function WithdrawalProgressPage({ account, onRefresh }) {
  const styleRef = useRef(null);

  useEffect(() => {
    if (!styleRef.current) {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes wp-fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wp-slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes wp-bounce-slow {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        @keyframes wp-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        @keyframes wp-pulse-slow {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.8; }
        }
        @keyframes wp-progress-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(147, 51, 234, 0.5); }
          50% { box-shadow: 0 0 30px rgba(236, 72, 153, 0.8); }
        }
        @keyframes wp-float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-3px); }
        }
        .wp-animate-fade-in { animation: wp-fade-in 0.6s ease-out; }
        .wp-animate-slide-up { animation: wp-slide-up 0.5s ease-out; }
        .wp-animate-bounce-slow { animation: wp-bounce-slow 2s infinite; }
        .wp-animate-shimmer { animation: wp-shimmer 2s infinite; }
        .wp-animate-pulse-slow { animation: wp-pulse-slow 3s infinite; }
        .wp-animate-progress-glow { animation: wp-progress-glow 2s ease-in-out infinite; }
        .wp-animate-float { animation: wp-float 3s ease-in-out infinite; }
      `;
      document.head.appendChild(style);
      styleRef.current = style;
    }
    return () => {
      if (styleRef.current) {
        document.head.removeChild(styleRef.current);
        styleRef.current = null;
      }
    };
  }, []);

  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [codeInput, setCodeInput] = useState('');
  const [submittingCode, setSubmittingCode] = useState({});
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [showFullIban, setShowFullIban] = useState({});

  useEffect(() => {
    loadWithdrawalRequests();
    const interval = setInterval(loadWithdrawalRequests, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadWithdrawalRequests = async () => {
    try {
      const res = await api.get('/client/withdrawal-requests');
      const requests = res.data.requests || [];
      setRequests(requests);
    } catch (e) {
      toast.error('Erreur lors du chargement des demandes');
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (requestId) => {
    const code = codeInput.trim();
    if (!code) {
      toast.error('Veuillez entrer un code');
      return;
    }

    setSubmittingCode(prev => ({ ...prev, [requestId]: true }));
    
    try {
      await api.post(`/client/withdrawal-requests/${requestId}/submit-code`, { code });
      toast.success('Code validé avec succès !');
      setCodeInput('');
      await loadWithdrawalRequests();
      onRefresh?.();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Code invalide');
    } finally {
      setSubmittingCode(prev => ({ ...prev, [requestId]: false }));
    }
  };

  const toggleExpand = (requestId) => {
    setExpandedRequest(expandedRequest === requestId ? null : requestId);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { cls: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock, text: 'En attente' },
      approved: { cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle, text: 'Approuvé' },
      code_generated: { cls: 'bg-blue-100 text-blue-700 border-blue-200', icon: Key, text: 'Code généré' },
      step_completed: { cls: 'bg-purple-100 text-purple-700 border-purple-200', icon: CheckCircle, text: 'Étape complétée' },
      completed: { cls: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle, text: 'Complété' },
      rejected: { cls: 'bg-red-100 text-red-700 border-red-200', icon: AlertCircle, text: 'Rejeté' },
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 ${badge.cls} text-[11px] font-medium rounded-full border`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 wp-animate-fade-in">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold">Suivi des virements</h1>
              <p className="text-teal-100 text-xs">Suivez vos virements en temps réel</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold">{requests.length}</div>
            <div className="text-xs text-teal-100">Actif{requests.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ArrowLeftRight className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">Aucun virement en cours</h3>
          <p className="text-slate-500 text-sm">
            Vous n'avez aucune demande de virement active.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-xl shadow-sm">
              {/* Header */}
              <div className="p-4 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-slate-900">Virement vers {req.external_account_holder}</h3>
                    <p className="text-sm text-slate-500">{fmtDate(req.created_at)}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-slate-900">{fmt(req.amount)}</div>
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="p-4 space-y-3">
                {/* Bénéficiaire */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-xs text-slate-500 mb-1">Titulaire du compte</div>
                    <div className="text-sm font-medium text-slate-900">{req.external_account_holder}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">IBAN</div>
                    <div className="text-sm font-mono text-slate-900">{req.external_iban}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 mb-1">BIC/SWIFT</div>
                    <div className="text-sm font-mono text-slate-900">{req.external_bic}</div>
                  </div>
                  {req.label && (
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Motif</div>
                      <div className="text-sm text-slate-900">{req.label}</div>
                    </div>
                  )}
                </div>

                {/* Progression */}
                {req.current_percentage > 0 && (
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-slate-600">Progression</span>
                      <span className="font-medium text-teal-600">{Number(req.current_percentage).toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden relative wp-animate-progress-glow">
                      <div 
                        className="bg-gradient-to-r from-purple-500 via-purple-600 to-pink-500 h-full rounded-full transition-all duration-1000 relative overflow-hidden"
                        style={{ width: `${Math.min(req.current_percentage, 100)}%` }}
                      >
                        {/* Animation shimmer */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent wp-animate-shimmer" />
                        
                        {/* Particules animées */}
                        {req.current_percentage > 0 && (
                          <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg animate-pulse">
                            <div className="w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-ping" />
                          </div>
                        )}
                      </div>
                      
                      {/* Ombre de progression */}
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-full blur-sm" />
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      Virement initié
                    </div>
                  </div>
                )}

                {/* Condition actuelle du virement */}
                {req.steps && req.steps.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-slate-800 mb-2">Condition pour continuer</div>
                    {(() => {
                      const currentStep = req.steps.find(step => !step.is_completed);
                      if (currentStep) {
                        return (
                          <div className={`p-4 rounded-lg border bg-amber-50 border-amber-200`}>
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 mt-0.5 bg-amber-100 text-amber-700">
                                {currentStep.step_order}
                              </div>
                              <div className="flex-1">
                                <div className="mb-1">
                                  <span className="text-sm font-medium text-slate-900">
                                    Condition {currentStep.step_order}
                                  </span>
                                </div>
                                {currentStep.condition ? (
                                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                    {currentStep.condition}
                                  </p>
                                ) : (
                                  <p className="text-xs text-slate-500 mt-1 italic">
                                    Effectuez le transfert pour continuer
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      } else {
                        return (
                          <div className="p-4 rounded-lg border bg-green-50 border-green-200">
                            <div className="flex items-center gap-3">
                              <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium bg-green-100 text-green-700">
                                !
                              </div>
                              <div className="text-sm font-medium text-slate-900">
                                Toutes les conditions sont remplies
                              </div>
                            </div>
                          </div>
                        );
                      }
                    })()}
                  </div>
                )}

                {/* Formulaire de code */}
                {(req.status === 'code_generated' || req.status === 'step_completed' || req.status === 'approved') && (
                  <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-2xl shadow-lg">
                    {/* Titre */}
                    <div className="flex items-center justify-center gap-2 mb-3">
                      <AlertCircle className="w-5 h-5 animate-pulse" />
                      <span className="text-lg font-bold">CODE REÇU</span>
                    </div>

                    <p className="text-center text-sm font-medium mb-4">
                      Vérifiez vos notifications et entrez votre code
                    </p>

                    {/* Input + bouton */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={codeInput}
                        onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                        placeholder="ENTREZ LE CODE"
                        className="w-full px-4 py-3 bg-white text-lg font-bold text-center rounded-xl text-gray-900 placeholder-gray-300 focus:outline-none tracking-widest"
                        maxLength={12}
                      />
                      <button
                        onClick={() => submitCode(req.id)}
                        disabled={submittingCode[req.id] || !codeInput.trim()}
                        className="w-full py-3 bg-white text-red-600 text-base font-bold rounded-xl hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
                      >
                        {submittingCode[req.id] ? (
                          <><RefreshCw className="w-5 h-5 animate-spin" /><span>Validation...</span></>
                        ) : (
                          <><CheckCircle className="w-5 h-5" /><span>Valider le code</span></>
                        )}
                      </button>
                    </div>

                    {/* Indicateurs */}
                    <div className="flex justify-center gap-6 mt-4">
                      <div className="text-center">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <Mail className="w-4 h-4" />
                        </div>
                        <p className="text-xs">Notifications</p>
                      </div>
                      <div className="text-center">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <Clock className="w-4 h-4" />
                        </div>
                        <p className="text-xs">Valide 4h</p>
                      </div>
                      <div className="text-center">
                        <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-1">
                          <Shield className="w-4 h-4" />
                        </div>
                        <p className="text-xs">Sécurisé</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Rejeté */}
                {req.status === 'rejected' && req.reject_reason && (
                  <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-4 text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Virement rejeté</h4>
                        <p className="text-red-100 text-xs mt-0.5">Motif : {req.reject_reason}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}