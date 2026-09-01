import { useState } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { api } from '../../services/api';
import { Search, TrendingUp, TrendingDown, ArrowLeftRight, Receipt } from 'lucide-react';

const fmt = (n) => new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(n || 0);

function formatTxDate(createdAt) {
  if (!createdAt) return '—';
  const d = typeof createdAt === 'string' ? new Date(createdAt) : createdAt?.toDate?.() || new Date(createdAt);
  return format(d, "d MMM yyyy 'à' HH:mm", { locale: fr });
}

export default function TransactionsPage({ transactions, onRefresh }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const safeTransactions = Array.isArray(transactions) ? transactions : [];

  const filtered = safeTransactions.filter((tx) => {
    const matchSearch = !search || (tx.label || '').toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'all' || tx.type === filter;
    return matchSearch && matchFilter;
  });

  const totalIn = safeTransactions.filter((t) => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
  const totalOut = safeTransactions.filter((t) => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-4 fade-in">
      <div>
        <h1 className="text-[19px] font-semibold tracking-tight">Transactions</h1>
        <p className="text-[12px] text-[var(--text-3)] mt-0.5">{safeTransactions.length} opération(s) au total</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingDown className="w-4 h-4 text-[var(--green)]" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-0.5">Total crédités</div>
            <div className="text-[18px] font-semibold font-mono text-[var(--green)] tracking-tight">{fmt(totalIn)}</div>
          </div>
        </div>
        <div className="card p-4 flex items-center gap-3">
          <div className="w-9 h-9 bg-red-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-4 h-4 text-red-500" />
          </div>
          <div>
            <div className="text-[11px] text-[var(--text-3)] mb-0.5">Total débités</div>
            <div className="text-[18px] font-semibold font-mono text-red-600 tracking-tight">{fmt(totalOut)}</div>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--text-3)]" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher…"
            className="input-base pl-9" />
        </div>
        <div className="flex gap-1 bg-white border border-[var(--border)] rounded-xl p-1">
          {[['all', 'Tout'], ['deposit', 'Crédits'], ['withdrawal', 'Débits']].map(([val, label]) => (
            <button key={val} type="button" onClick={() => setFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-[11.5px] font-medium transition ${filter === val ? 'btn-primary' : 'text-[var(--text-3)] hover:bg-[var(--bg)]'}`}>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 px-4">
            <div className="w-12 h-12 bg-[var(--bg)] rounded-2xl flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5 text-[var(--text-3)]" />
            </div>
            <p className="text-[13px] font-medium text-[var(--text-2)]">
              {safeTransactions.length === 0 ? 'Aucune transaction' : 'Aucun résultat'}
            </p>
            <p className="text-[11px] text-[var(--text-3)] mt-1">
              {safeTransactions.length === 0 ? 'Les transactions apparaîtront ici une fois effectuées.' : 'Essayez de modifier vos filtres de recherche.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {filtered.map((tx) => {
              const isCredit = tx.type === 'deposit';
              const isTransfer = tx.label?.toLowerCase().includes('virement');
              const date = formatTxDate(tx.createdAt);
              return (
                <div key={tx.id} className="flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg)]/50 transition">
                  <div className={`w-8 h-8 rounded-[10px] flex items-center justify-center flex-shrink-0 ${
                    isTransfer ? 'bg-blue-50 text-blue-700' : isCredit ? 'bg-green-50 text-[var(--green)]' : 'bg-red-50 text-red-600'
                  }`}>
                    {isTransfer ? <ArrowLeftRight className="w-3.5 h-3.5" /> : isCredit ? <TrendingDown className="w-3.5 h-3.5" /> : <TrendingUp className="w-3.5 h-3.5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-medium truncate">
                      {tx.label || (isCredit ? (tx.bank_name ? `Dépôt ${tx.bank_name}` : 'Dépôt') : 'Retrait')}
                    </p>
                    <p className="text-[10.5px] text-[var(--text-3)]">{date}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold font-mono text-[12.5px] ${isCredit ? 'text-[var(--green)]' : 'text-red-600'}`}>
                      {isCredit ? '+' : '-'}{fmt(tx.amount)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
