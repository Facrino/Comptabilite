import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BookText, 
  BarChart3, 
  Scale, 
  Wallet,
  UserCircle, 
  CloudUpload,
  CloudDownload,
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Tableau de bord', path: '/' },
  { icon: BookText, label: 'Opérations', path: '/operations' },
  { icon: BarChart3, label: 'Compte de résultat', path: '/reports/income' },
  { icon: Scale, label: 'Bilan', path: '/reports/balance' },
  { icon: UserCircle, label: 'Mon compte', path: '/profile' },
  { icon: CloudUpload, label: 'Sauvegarde', path: '/backup' },
  { icon: CloudDownload, label: 'Restauration', path: '/restore' },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <>
      <button 
        id="sidebar-toggle"
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-primary text-white md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar transform transition-transform duration-300 ease-in-out md:translate-x-0 border-r border-sidebar-border",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-full bg-[#0f172a] text-slate-300">
          <div className="p-6 flex items-center gap-3 border-b border-sidebar-border">
            <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center text-white font-bold shadow-sm">Z</div>
            <span className="text-lg font-semibold tracking-tight text-white leading-tight">Comptabilité<br/><span className="text-indigo-400 font-black">ZAINA</span></span>
          </div>

          <nav className="flex-1 p-4 space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all duration-200",
                  isActive 
                    ? "bg-slate-800 text-white shadow-sm ring-1 ring-white/5" 
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                )}
                onClick={() => setIsOpen(false)}
              >
                <item.icon className={cn("size-5 opacity-70")} />
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 border-t border-sidebar-border mt-auto">
            <div className="bg-indigo-900/10 p-3 rounded-lg border border-indigo-500/10">
              <p className="text-[10px] uppercase font-bold text-indigo-400 mb-1 tracking-wider">Statut Système</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.3)]"></div>
                <span className="text-xs text-indigo-100/60 font-medium">Connecté & Sécurisé</span>
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
