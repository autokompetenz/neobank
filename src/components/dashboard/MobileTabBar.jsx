import { LayoutDashboard, Activity, ArrowLeftRight, CreditCard, Menu } from 'lucide-react';

const tabs = [
  { id: 'overview', label: 'Accueil', icon: LayoutDashboard },
  { id: 'transactions', label: 'Mouv.', icon: Activity },
  { id: 'transfer', label: 'Virement', icon: ArrowLeftRight },
  { id: 'card', label: 'Carte', icon: CreditCard },
];

export default function MobileTabBar({ activePage, onNavigate, onOpenMenu }) {
  return (
    <nav className="mobile-tabs" aria-label="Navigation principale">
      <div className="mobile-tabs-inner">
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = activePage === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => onNavigate(id)}
              className={`mobile-tab ${active ? 'active' : ''}`}
            >
              <Icon size={20} strokeWidth={active ? 2.5 : 2} />
              <span className="mobile-tab-label">{label}</span>
            </button>
          );
        })}
        <button
          type="button"
          onClick={onOpenMenu}
          className={`mobile-tab ${['account', 'iban', 'profile', 'notifications'].includes(activePage) ? 'active' : ''}`}
        >
          <Menu size={20} strokeWidth={2} />
          <span className="mobile-tab-label">Plus</span>
        </button>
      </div>
    </nav>
  );
}
