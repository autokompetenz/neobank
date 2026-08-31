import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { CheckCircle, XCircle, Eye, Download, Calendar, User, FileText, AlertCircle } from 'lucide-react';

function Chip({ color = 'gray', children }) {
  const cls = {
    green: 'bg-teal-50 text-teal-800 border border-teal-200',
    amber: 'bg-amber-50 text-amber-800 border border-amber-200',
    red: 'bg-red-50 text-red-700 border border-red-200', 
    blue: 'bg-blue-50 text-blue-800 border border-blue-200',
    gray: 'bg-slate-100 text-slate-600 border border-slate-200',
  };
  return <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10.5px] font-medium ${cls[color]}`}>{children}</span>;
}

function Avatar({ name = '', size = 'sm' }) {
  const initials = name.split(' ').map((w) => w[0] || '').join('').slice(0, 2).toUpperCase() || '?';
  const colors = ['bg-teal-100 text-teal-800', 'bg-blue-100 text-blue-800', 'bg-violet-100 text-violet-800', 'bg-amber-100 text-amber-800'];
  const color = colors[initials.charCodeAt(0) % colors.length];
  const sz = size === 'sm' ? 'w-8 h-8 text-[11px]' : size === 'lg' ? 'w-12 h-12 text-[13px]' : 'w-10 h-10 text-[12px]';
  return <div className={`${sz} ${color} rounded-full flex items-center justify-center font-semibold flex-shrink-0`}>{initials}</div>;
}

export default function TabKyc({ kycSubmissions, users, load }) {
  const [selectedKyc, setSelectedKyc] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApprove = async (kycId) => {
    setLoading(true);
    try {
      await api.post(`/admin/kyc/${kycId}/approve`);
      toast.success('KYC approuvé avec succès');
      setSelectedKyc(null);
      load();
    } catch (e) {
      toast.error('Erreur lors de l\'approbation KYC');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      toast.error('Veuillez fournir un motif de rejet');
      return;
    }
    
    setLoading(true);
    try {
      await api.post(`/admin/kyc/${selectedKyc.id}/reject`, { reason: rejectReason.trim() });
      toast.success('KYC rejeté avec succès');
      setSelectedKyc(null);
      setRejectReason('');
      setShowRejectModal(false);
      load();
    } catch (e) {
      toast.error('Erreur lors du rejet KYC');
    } finally {
      setLoading(false);
    }
  };

  const openRejectModal = (kyc) => {
    setSelectedKyc(kyc);
    setShowRejectModal(true);
    setRejectReason('');
  };

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserInfo = (userId) => {
    return users.find(u => u.id === userId);
  };

  const pendingKyc = kycSubmissions.filter(r => r.status === 'pending');
  const approvedKyc = kycSubmissions.filter(r => r.status === 'approved');
  const rejectedKyc = kycSubmissions.filter(r => r.status === 'rejected');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[18px] font-semibold text-slate-900">Validation KYC</h2>
        <p className="text-[13px] text-slate-500 mt-1">Gérez les soumissions de vérification d'identité</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{pendingKyc.length}</p>
              <p className="text-[12px] text-slate-500">En attente</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{approvedKyc.length}</p>
              <p className="text-[12px] text-slate-500">Approuvés</p>
            </div>
          </div>
        </div>
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{rejectedKyc.length}</p>
              <p className="text-[12px] text-slate-500">Rejetés</p>
            </div>
          </div>
        </div>
      </div>

      {/* Liste des KYC en attente */}
      {pendingKyc.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-[14px] font-semibold text-slate-900">En attente de validation</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {pendingKyc.map((kyc) => {
              const userInfo = getUserInfo(kyc.user_id);
              return (
                <div key={kyc.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar name={userInfo?.displayName || userInfo?.email} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {userInfo?.displayName || 'Utilisateur inconnu'}
                        </p>
                        <Chip color="amber">En attente</Chip>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-3">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {userInfo?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(kyc.created_at)}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedKyc(kyc)}
                          className="px-3 py-1.5 bg-blue-600 text-white rounded-lg text-[11px] font-medium hover:bg-blue-700 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Voir documents
                        </button>
                        <button
                          onClick={() => handleApprove(kyc.id)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-[11px] font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Approuver
                        </button>
                        <button
                          onClick={() => openRejectModal(kyc)}
                          disabled={loading}
                          className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-[11px] font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3 h-3" />
                          Rejeter
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* KYC traités */}
      {(approvedKyc.length > 0 || rejectedKyc.length > 0) && (
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-slate-200">
            <h3 className="text-[14px] font-semibold text-slate-900">Historique des validations</h3>
          </div>
          <div className="divide-y divide-slate-100">
            {[...approvedKyc, ...rejectedKyc].map((kyc) => {
              const userInfo = getUserInfo(kyc.user_id);
              const isApproved = kyc.status === 'approved';
              return (
                <div key={kyc.id} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start gap-4">
                    <Avatar name={userInfo?.displayName || userInfo?.email} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <p className="text-sm font-medium text-slate-900 truncate">
                          {userInfo?.displayName || 'Utilisateur inconnu'}
                        </p>
                        <Chip color={isApproved ? 'green' : 'red'}>
                          {isApproved ? 'Approuvé' : 'Rejeté'}
                        </Chip>
                      </div>
                      <div className="flex items-center gap-4 text-[11px] text-slate-500 mb-2">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {userInfo?.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(kyc.created_at)}
                        </span>
                        {kyc.reviewed_at && (
                          <span className="flex items-center gap-1">
                            <CheckCircle className="w-3 h-3" />
                            Validé le {formatDate(kyc.reviewed_at)}
                          </span>
                        )}
                      </div>
                      {kyc.reject_reason && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
                          <p className="text-[11px] text-red-700">
                            <strong>Motif de rejet :</strong> {kyc.reject_reason}
                          </p>
                        </div>
                      )}
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => setSelectedKyc(kyc)}
                          className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-[11px] font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          Voir documents
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal de visualisation des documents */}
      {selectedKyc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Documents KYC - {getUserInfo(selectedKyc.user_id)?.displayName || 'Utilisateur'}
                </h3>
                <button
                  onClick={() => setSelectedKyc(null)}
                  className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition-colors"
                >
                  <XCircle className="w-4 h-4 text-slate-600" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Selfie */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Selfie
                </h4>
                {selectedKyc.selfie_url ? (
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img 
                        src={selectedKyc.selfie_url} 
                        alt="Selfie" 
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                    <button
                      onClick={() => downloadImage(selectedKyc.selfie_url, `selfie_${selectedKyc.id}.jpg`)}
                      className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-[11px] font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Télécharger
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Aucun selfie fourni</p>
                )}
              </div>

              {/* Document d'identité */}
              <div>
                <h4 className="text-sm font-medium text-slate-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Pièce d'identité
                </h4>
                {selectedKyc.document_url ? (
                  <div className="space-y-3">
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                      <img 
                        src={selectedKyc.document_url} 
                        alt="Pièce d'identité" 
                        className="w-full max-h-96 object-contain"
                      />
                    </div>
                    <button
                      onClick={() => downloadImage(selectedKyc.document_url, `document_${selectedKyc.id}.jpg`)}
                      className="px-3 py-1.5 bg-slate-600 text-white rounded-lg text-[11px] font-medium hover:bg-slate-700 transition-colors flex items-center gap-1"
                    >
                      <Download className="w-3 h-3" />
                      Télécharger
                    </button>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Aucun document fourni</p>
                )}
              </div>

              {/* Actions si en attente */}
              {selectedKyc.status === 'pending' && (
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    onClick={() => handleApprove(selectedKyc.id)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Approuver
                  </button>
                  <button
                    onClick={() => openRejectModal(selectedKyc)}
                    disabled={loading}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <XCircle className="w-4 h-4" />
                    Rejeter
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de rejet */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Rejeter la soumission KYC</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Motif du rejet
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Expliquez pourquoi vous rejetez cette soumission..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm resize-none"
                  rows={4}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowRejectModal(false)}
                  className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleReject}
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 transition-colors"
                >
                  Rejeter
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
