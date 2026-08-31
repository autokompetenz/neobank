import { useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../services/api';
import { Check, X, User, Clock, AlertCircle, Eye, Building2, FileText, Shield } from 'lucide-react';

function TabIban({ users, requests, load }) {
  const [activeSection, setActiveSection] = useState('requests');
  const [manualIbanForm, setManualIbanForm] = useState({});
  const [rejectionReasons, setRejectionReasons] = useState({});
  const [proofFilter, setProofFilter] = useState('all');

  const ibanRequests = requests.filter(r => (r.type === 'iban_request' || r.step === 'iban_request') && r.status === 'pending');
  const ibanProofs = requests.filter(r => r.step === 'iban_proof' && r.status === 'pending');
  const transferProofs = requests.filter(r => r.step === 'transfer_proof' && r.status === 'pending');

  const usersWithoutIban = users.filter(u => !u.iban || u.iban_status !== 'active');

  const getUserInfo = (userId) => {
    if (!userId) return null;
    return users.find(u => u.id === userId);
  };

  const handleProposeIban = async (userId) => {
    const iban = manualIbanForm[userId]?.iban?.trim();
    const bic = manualIbanForm[userId]?.bic?.trim();

    if (!iban || !bic) {
      toast.error('Veuillez entrer un IBAN et un BIC personnalisés');
      return;
    }

    if (iban.length < 5) {
      toast.error('IBAN trop court (minimum 5 caractères)');
      return;
    }

    if (bic.length < 3) {
      toast.error('BIC trop court (minimum 3 caractères)');
      return;
    }

    try {
      await api.post(`/admin/users/${userId}/iban`, { iban, bic });
      toast.success('IBAN proposé ! En attente du justificatif client.');
      setManualIbanForm(prev => ({ ...prev, [userId]: { iban: '', bic: '' } }));
      setTimeout(() => load(), 500);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la proposition IBAN');
    }
  };

  const approveIbanProof = async (requestId) => {
    try {
      await api.post(`/admin/activation-requests/${requestId}/approve`);
      toast.success('Justificatif approuvé ! IBAN confirmé.');
      setTimeout(() => load(), 500);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'approbation');
    }
  };

  const approveTransferProof = async (userId, requestId) => {
    try {
      await api.post(`/admin/activation-requests/${requestId}/approve`);
      await api.post(`/admin/users/${userId}/verify`);
      toast.success('Compte activé avec succès !');
      setTimeout(() => load(), 500);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'activation');
    }
  };

  const rejectProof = async (requestId) => {
    const reason = rejectionReasons[requestId]?.trim();
    if (!reason) return toast.error('Motif de rejet requis');

    try {
      await api.post(`/admin/activation-requests/${requestId}/reject`, { reason });
      toast.success('Demande rejetée');
      setRejectionReasons(prev => ({ ...prev, [requestId]: '' }));
      setTimeout(() => load(), 500);
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors du rejet');
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

  const filteredProofs = proofFilter === 'all'
    ? [...ibanProofs, ...transferProofs]
    : proofFilter === 'iban_proof' ? ibanProofs : transferProofs;

  return (
    <div className="space-y-6">
      <h1 className="text-[18px] font-semibold">Gestion IBAN</h1>

      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto">
        {[
          { id: 'requests', label: `Demandes (${ibanRequests.length})` },
          { id: 'proofs', label: `Preuves (${ibanProofs.length + transferProofs.length})` },
          { id: 'assign', label: `Attribution (${usersWithoutIban.length})` }
        ].map(section => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition whitespace-nowrap ${
              activeSection === section.id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {section.label}
          </button>
        ))}
      </div>

      {activeSection === 'requests' && (
        <div className="space-y-3">
          {ibanRequests.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-[13px]">Aucune demande IBAN en cours</p>
            </div>
          ) : (
            ibanRequests.map(request => {
              const userInfo = getUserInfo(request.user_id || request.userId);
              return (
                <div key={request.id} className="bg-white border border-slate-100 rounded-xl p-4">
                  <div className="mb-4">
                    <p className="font-medium text-[13px]">{userInfo?.displayName || userInfo?.email || 'Client'}</p>
                    <p className="text-[11px] text-slate-500">{userInfo?.email}</p>
                  </div>

                  <div className="space-y-3 border-t pt-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] text-slate-600 font-medium block mb-1">IBAN personnalisé</label>
                        <input
                          type="text"
                          placeholder="FR7630004000030000000000043"
                          value={manualIbanForm[request.user_id || request.userId]?.iban || ''}
                          onChange={(e) => setManualIbanForm(prev => ({
                            ...prev,
                            [request.user_id || request.userId]: { ...prev[request.user_id || request.userId], iban: e.target.value }
                          }))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-teal-400"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-600 font-medium block mb-1">BIC personnalisé</label>
                        <input
                          type="text"
                          placeholder="BNPAFRPPXXX"
                          value={manualIbanForm[request.user_id || request.userId]?.bic || ''}
                          onChange={(e) => setManualIbanForm(prev => ({
                            ...prev,
                            [request.user_id || request.userId]: { ...prev[request.user_id || request.userId], bic: e.target.value }
                          }))}
                          className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-teal-400"
                          style={{ fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => handleProposeIban(request.user_id || request.userId)}
                      className="w-full px-3 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg text-[11px] transition"
                    >
                      Proposer IBAN/BIC (justificatif client requis ensuite)
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSection === 'proofs' && (
        <div className="space-y-3">
          <div className="flex gap-2 mb-2">
            {[
              { id: 'all', label: `Toutes (${ibanProofs.length + transferProofs.length})` },
              { id: 'iban_proof', label: `Justificatifs IBAN (${ibanProofs.length})` },
              { id: 'transfer_proof', label: `Virements 500€ (${transferProofs.length})` }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setProofFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition ${
                  proofFilter === f.id
                    ? 'bg-teal-100 text-teal-800'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filteredProofs.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-400" />
              <p className="text-[13px]">Aucune preuve en attente</p>
            </div>
          ) : (
            filteredProofs.map(proof => {
              const userInfo = getUserInfo(proof.user_id || proof.userId);
              const isIbanProof = proof.step === 'iban_proof';
              return (
                <div key={proof.id} className="bg-white border border-slate-100 rounded-xl p-4 space-y-3">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-[12px] flex-shrink-0 ${isIbanProof ? 'bg-purple-100 text-purple-800' : 'bg-teal-100 text-teal-800'}`}>
                      {(userInfo?.displayName || userInfo?.email || 'C').charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-[12px] sm:text-[13px]">{userInfo?.displayName || 'Client'}</p>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium flex items-center gap-1 ${
                          isIbanProof ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'
                        }`}>
                          {isIbanProof ? <Shield className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                          {isIbanProof ? 'Justificatif IBAN' : 'Virement 500€'}
                        </span>
                      </div>
                      <p className="text-[11px] sm:text-[12px] text-slate-500">{userInfo?.email}</p>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 space-y-2">
                    {isIbanProof ? (
                      <>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-slate-600">IBAN proposé :</span>
                          <span className="font-mono text-[11px] font-semibold text-slate-800">{userInfo?.iban || '—'}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[11px] text-slate-600">BIC :</span>
                          <span className="font-mono text-[11px] text-slate-800">{userInfo?.bic || '—'}</span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-center">
                        <span className="text-[11px] text-slate-600">Montant du virement :</span>
                        <span className="font-mono text-[12px] font-semibold text-teal-700">{fmt(proof.amount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] text-slate-600">Soumis le :</span>
                      <span className="text-[11px] text-slate-500">{formatDate(proof.created_at)}</span>
                    </div>
                  </div>

                  {proof.proof_url && (
                    <div>
                      <p className="text-[11px] text-slate-600 mb-2 flex items-center gap-2">
                        <Eye className="w-3 h-3" />
                        {isIbanProof ? 'Justificatif client :' : 'Preuve de virement :'}
                      </p>
                      <div className="border border-slate-200 rounded-xl overflow-hidden">
                        {proof.proof_url.toLowerCase().endsWith('.pdf') ? (
                          <div className="p-4 bg-slate-100 flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-100 rounded flex items-center justify-center">
                              <span className="text-red-600 font-bold text-xs">PDF</span>
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-medium">Document PDF</p>
                              <p className="text-xs text-slate-500">{proof.proof_url.split('/').pop()}</p>
                            </div>
                            <a
                              href={proof.proof_url}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 bg-teal-600 text-white rounded-lg text-xs font-medium hover:bg-teal-700 transition"
                            >
                              Ouvrir
                            </a>
                          </div>
                        ) : (
                          <img
                            src={proof.proof_url}
                            alt={isIbanProof ? 'Justificatif' : 'Preuve de virement'}
                            className="w-full h-auto max-h-64 object-contain bg-white"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        )}
                        <div className="p-4 bg-slate-100 flex items-center gap-3" style={{ display: 'none' }}>
                          <AlertCircle className="w-8 h-8 text-slate-400" />
                          <div>
                            <p className="text-sm font-medium">Image non disponible</p>
                            <p className="text-xs text-slate-500">Le fichier n'a pas pu être chargé</p>
                          </div>
                        </div>
                      </div>
                      <a
                        href={proof.proof_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-teal-600 underline mt-2 inline-block flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        Ouvrir dans un nouvel onglet
                      </a>
                    </div>
                  )}

                  {proof.status === 'rejected' && proof.reject_reason && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-[11px] text-red-700"><span className="font-medium">Motif du rejet :</span> {proof.reject_reason}</p>
                    </div>
                  )}

                  {proof.status === 'pending' && (
                    <>
                      <div>
                        <label className="text-[11px] text-slate-600 font-medium block mb-1">Motif de rejet (si applicable)</label>
                        <textarea
                          value={rejectionReasons[proof.id] || ''}
                          onChange={(e) => setRejectionReasons(prev => ({ ...prev, [proof.id]: e.target.value }))}
                          placeholder="Entrez le motif du rejet..."
                          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-[11px] sm:text-[12px]"
                          rows={2}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          type="button"
                          onClick={() => isIbanProof
                            ? approveIbanProof(proof.id)
                            : approveTransferProof(proof.user_id || proof.userId, proof.id)
                          }
                          className="flex-1 py-2.5 bg-teal-700 text-white rounded-xl text-[11px] sm:text-[12px] font-semibold flex items-center justify-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          {isIbanProof ? 'Approuver le justificatif' : 'Approuver et Activer'}
                        </button>
                        <button
                          type="button"
                          onClick={() => rejectProof(proof.id)}
                          className="flex-1 py-2 bg-red-50 text-red-700 rounded-xl text-[11px] sm:text-[12px] border border-red-200 flex items-center justify-center gap-1"
                        >
                          <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          Rejeter
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {activeSection === 'assign' && (
        <div className="space-y-3">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-6">
            <h3 className="text-[14px] font-semibold mb-2 flex items-center gap-1.5"><Building2 className="w-4 h-4" /> Attribution personnalisée d'IBAN/BIC</h3>
            <p className="text-[11px] text-slate-600 mb-4">
              Entrez n'importe quel IBAN et BIC personnalisés. Le client devra soumettre un justificatif pour validation.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {usersWithoutIban.map(user => (
                <div key={user.id} className="bg-white border border-slate-100 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <User className="w-4 h-4 text-slate-600" />
                    <div>
                      <p className="font-medium text-[12px]">{user.displayName || 'Client'}</p>
                      <p className="text-[10px] text-slate-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">IBAN personnalisé</label>
                      <input
                        type="text"
                        placeholder="FR7630004000030000000000043"
                        value={manualIbanForm[user.id]?.iban || ''}
                        onChange={(e) => setManualIbanForm(prev => ({
                          ...prev,
                          [user.id]: { ...prev[user.id], iban: e.target.value }
                        }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-teal-400"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-600 font-medium">BIC personnalisé</label>
                      <input
                        type="text"
                        placeholder="BNPAFRPPXXX"
                        value={manualIbanForm[user.id]?.bic || ''}
                        onChange={(e) => setManualIbanForm(prev => ({
                          ...prev,
                          [user.id]: { ...prev[user.id], bic: e.target.value }
                        }))}
                        className="w-full px-2 py-1.5 border border-slate-200 rounded text-[11px] focus:outline-none focus:border-teal-400"
                        style={{ fontFamily: 'monospace' }}
                      />
                    </div>
                    <button
                      onClick={() => handleProposeIban(user.id)}
                      className="w-full px-2 py-1.5 bg-teal-600 hover:bg-teal-700 disabled:opacity-60 text-white text-[11px] font-medium rounded transition"
                    >
                      Proposer IBAN/BIC
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TabIban;