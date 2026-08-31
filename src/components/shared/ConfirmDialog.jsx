import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ open, title, message, confirmLabel = 'Confirmer', cancelLabel = 'Annuler', danger = false, loading = false, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-slate-900/60" onClick={onCancel} />
      <div className="relative bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl" role="alertdialog" aria-labelledby="confirm-title">
        <button type="button" onClick={onCancel} className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:bg-slate-100 transition">
          <X className="w-4 h-4" />
        </button>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${danger ? 'bg-red-100' : 'bg-blue-100'}`}>
          <AlertTriangle className={`w-5 h-5 ${danger ? 'text-red-600' : 'text-blue-600'}`} />
        </div>
        <h3 id="confirm-title" className="text-[16px] font-semibold text-slate-900 mb-2">{title}</h3>
        <p className="text-[13px] text-slate-600 leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} disabled={loading} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-xl text-[13px] font-medium text-slate-700 hover:bg-slate-50 transition disabled:opacity-50">
            {cancelLabel}
          </button>
          <button type="button" onClick={onConfirm} disabled={loading} className={`flex-1 px-4 py-2.5 rounded-xl text-[13px] font-medium text-white transition disabled:opacity-50 flex items-center justify-center gap-2 ${danger ? 'bg-red-600 hover:bg-red-700' : 'bg-teal-700 hover:bg-teal-800'}`}>
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
