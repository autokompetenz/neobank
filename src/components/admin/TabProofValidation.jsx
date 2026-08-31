import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Eye, Download, CheckCircle, XCircle, AlertCircle, Clock, FileText, Search, Filter, Calendar } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);
const fmtDate = (d) => new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

export default function TabProofValidation() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedRequest, setExpandedRequest] = useState(null);
  const [validating, setValidating] = useState({});
  const [rejectModal, setRejectModal] = useState({ open: false, requestId: null, proofIndex: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadRequests();
  }, []);

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

  const handleApproveProof = async (requestId, proofIndex) => {
    setValidating(prev => ({ ...prev, [`${requestId}-${proofIndex}`]: true }));
    try {
      await api.post(`/admin/withdrawal-requests/${requestId}/approve-proof`, { proofIndex });
      toast.success('Preuve approuvée avec succès !');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'approbation');
    } finally {
      setValidating(prev => ({ ...prev, [`${requestId}-${proofIndex}`]: false }));
    }
  };

  const handleRejectProof = async (requestId, proofIndex, reason) => {
    if (!reason.trim()) {
      toast.error('Veuillez fournir une raison pour le rejet');
      return;
    }
    
    setValidating(prev => ({ ...prev, [`${requestId}-${proofIndex}`]: true }));
    try {
      await api.post(`/admin/withdrawal-requests/${requestId}/reject-proof`, { proofIndex, reason });
      toast.success('Preuve rejetée avec succès !');
      loadRequests();
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors du rejet');
    } finally {
      setValidating(prev => ({ ...prev, [`${requestId}-${proofIndex}`]: false }));
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { cls: 'bg-amber-100 text-amber-700', icon: Clock, text: 'En attente' },
      approved: { cls: 'bg-blue-100 text-blue-700', icon: CheckCircle, text: 'Approuvé' },
      code_generated: { cls: 'bg-blue-100 text-blue-700', icon: CheckCircle, text: 'Code généré' },
      step_completed: { cls: 'bg-purple-100 text-purple-700', icon: CheckCircle, text: 'Étape complétée' },
      completed: { cls: 'bg-green-100 text-green-700', icon: CheckCircle, text: 'Complété' },
      rejected: { cls: 'bg-red-100 text-red-700', icon: XCircle, text: 'Rejeté' }
    };
    const badge = badges[status] || badges.pending;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 ${badge.cls} text-[10.5px] font-medium rounded-full`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getProofStatusBadge = (proof) => {
    if (proof.status === 'approved') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-[10.5px] font-medium rounded-full">
          <CheckCircle className="w-3 h-3" />
          Approuvée
        </span>
      );
    } else if (proof.status === 'rejected') {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 text-[10.5px] font-medium rounded-full">
          <XCircle className="w-3 h-3" />
          Rejetée
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 text-[10.5px] font-medium rounded-full">
          <Clock className="w-3 h-3" />
          En attente
        </span>
      );
    }
  };

  const filteredRequests = requests.filter(req => {
    const hasProofs = req.proofs && req.proofs.length > 0;
    if (!hasProofs) return false;
    
    const matchesSearch = req.external_account_holder?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-4 sm:p-6 text-white shadow-lg">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold">Validation des preuves</h1>
            <p className="text-purple-100 text-xs sm:text-sm">Examinez et validez les preuves de virement soumises</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par bénéficiaire ou ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-600" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-purple-500"
            >
              <option value="all">Tous les statuts</option>
              <option value="approved">Approuvé</option>
              <option value="code_generated">Code généré</option>
              <option value="step_completed">Étape complétée</option>
              <option value="completed">Complété</option>
              <option value="rejected">Rejeté</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results */}
      {filteredRequests.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-200">
          <div className="w-16 h-16 bg-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-700 mb-2">
            {searchTerm || statusFilter !== 'all' ? 'Aucun résultat trouvé' : 'Aucune preuve à valider'}
          </h3>
          <p className="text-slate-500 text-sm">
            {searchTerm || statusFilter !== 'all' 
              ? 'Essayez d\'ajuster vos filtres de recherche.'
              : 'Aucune preuve de virement n\'a été soumise pour le moment.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredRequests.map((req) => (
            <div key={req.id} className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              {/* Header */}
              <div className="bg-slate-50 p-3 sm:p-4 border-b border-slate-200">
                <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-slate-900 text-sm sm:text-base mb-2 break-words">
                      Virement vers {req.external_account_holder}
                    </h3>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-slate-600">
                      <span className="truncate max-w-[120px] sm:max-w-none">ID: {req.id}</span>
                      <span className="whitespace-nowrap">Montant: {fmt(req.amount)}</span>
                      <span className="whitespace-nowrap">{fmtDate(req.created_at)}</span>
                    </div>
                  </div>
                  <div className="shrink-0 self-start sm:self-auto">
                    {getStatusBadge(req.status)}
                  </div>
                </div>
              </div>

              {/* Proofs Section */}
              <div className="p-4 sm:p-6">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                    Preuves soumises ({req.proofs.length})
                  </h4>
                  <button
                    onClick={() => setExpandedRequest(expandedRequest === req.id ? null : req.id)}
                    className="text-xs sm:text-sm text-slate-400 hover:text-slate-600 transition-colors shrink-0"
                  >
                    {expandedRequest === req.id ? 'Masquer' : 'Voir les détails'}
                  </button>
                </div>

                <div className="space-y-3">
                  {req.proofs.map((proof, index) => (
                    <div key={index} className="bg-slate-50 rounded-xl p-3 sm:p-4 border border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0 order-2 sm:order-1">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <FileText className="w-4 h-4 text-slate-600 shrink-0" />
                            <span className="font-medium text-slate-900 text-sm break-all">{proof.filename}</span>
                            {getProofStatusBadge(proof)}
                          </div>
                          <div className="text-xs sm:text-sm text-slate-600 space-y-0.5">
                            <p>Type: {proof.mimetype}</p>
                            <p>Taille: {proof.size ? `${(proof.size / 1024 / 1024).toFixed(2)} MB` : 'Inconnue'}</p>
                            <p>Soumise: {fmtDate(proof.created_at)}</p>
                            {proof.status === 'rejected' && proof.reject_reason && (
                              <p className="text-red-600 mt-1">Raison: {proof.reject_reason}</p>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 order-1 sm:order-2 shrink-0">
                          {proof.url && (
                            <button
                              onClick={() => window.open(proof.url, '_blank')}
                              className="p-2.5 sm:p-2 text-slate-600 hover:text-slate-800 hover:bg-slate-200 rounded-lg transition-colors"
                              title="Voir la preuve"
                            >
                              <Eye className="w-5 h-5 sm:w-4 sm:h-4" />
                            </button>
                          )}
                          
                          {proof.status === 'pending' && (
                            <>
                              <button
                                onClick={() => {
                                  setRejectModal({ open: true, requestId: req.id, proofIndex: index });
                                  setRejectReason('');
                                }}
                                disabled={validating[`${req.id}-${index}`]}
                                className="p-2.5 sm:p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Rejeter la preuve"
                              >
                                <XCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                              </button>
                              
                              <button
                                onClick={() => handleApproveProof(req.id, index)}
                                disabled={validating[`${req.id}-${index}`]}
                                className="p-2.5 sm:p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                                title="Approuver la preuve"
                              >
                                {validating[`${req.id}-${index}`] ? (
                                  <div className="w-5 h-5 sm:w-4 sm:h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
                                ) : (
                                  <CheckCircle className="w-5 h-5 sm:w-4 sm:h-4" />
                                )}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Proof Preview */}
                      {expandedRequest === req.id && proof.url && (
                        <div className="mt-4 pt-4 border-t border-slate-200">
                          <div className="bg-white rounded-lg p-1 sm:p-2 border border-slate-200">
                            <img 
                              src={proof.url} 
                              alt={proof.filename}
                              className="w-full max-w-md mx-auto rounded"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="text-center text-slate-500 p-4" style={{ display: 'none' }}>
                              <FileText className="w-8 h-8 mx-auto mb-2" />
                              <p>Impossible d'afficher l'aperçu</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejeter la preuve</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Raison du rejet (optionnel)..."
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
              rows={4}
              autoFocus
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setRejectModal({ open: false, requestId: null, proofIndex: null })}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  handleRejectProof(rejectModal.requestId, rejectModal.proofIndex, rejectReason);
                  setRejectModal({ open: false, requestId: null, proofIndex: null });
                }}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Rejeter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
