import React, { useState } from 'react';
import { 
  Scale, 
  Landmark, 
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PeriodSelector } from '@/src/components/PeriodSelector';

export default function BalanceSheet() {
  const { stats, currentPeriod, transactions: allTransactions } = useAccounting();
  const [selectedCategory, setSelectedCategory] = useState<{ label: string, prefixes: string[] } | null>(null);

  // For balance sheet, we take all transactions up to the selected month's end
  const transactions = allTransactions.filter(tx => tx.date.substring(0, 7) <= currentPeriod);

  // Simplified classification for the balance sheet
  const actifImmo = transactions.reduce((acc, tx) => {
    return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('2') ? l.debit - l.credit : 0), 0);
  }, 0);

  const actifCirculant = transactions.reduce((acc, tx) => {
    return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('3') || (l.accountCode.startsWith('41') && l.debit > l.credit) ? l.debit - l.credit : 0), 0);
  }, 0);

  const dispos = transactions.reduce((acc, tx) => {
    return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('5') ? l.debit - l.credit : 0), 0);
  }, 0);

  const capitauxPropres = transactions.reduce((acc, tx) => {
    return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('10') || l.accountCode.startsWith('11') || l.accountCode.startsWith('12') ? l.credit - l.debit : 0), 0);
  }, 0) + stats.netResult; // Include result in capital

  const dettes = transactions.reduce((acc, tx) => {
    return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('16') || (l.accountCode.startsWith('44') || l.accountCode.startsWith('42') || l.accountCode.startsWith('40') && l.credit > l.debit) ? l.credit - l.debit : 0), 0);
  }, 0);

  const totalActif = actifImmo + actifCirculant + dispos;
  const totalPassif = capitauxPropres + dettes;
  const isBalanced = Math.abs(totalActif - totalPassif) < 1;

  const getDetails = (prefixes: string[]) => {
    const detailsMap: Record<string, { label: string, amount: number }> = {};
    
    transactions.forEach(tx => {
      tx.lines.forEach(line => {
        if (prefixes.some(p => line.accountCode.startsWith(p))) {
          const key = line.accountCode;
          if (!detailsMap[key]) {
            detailsMap[key] = { label: line.accountLabel, amount: 0 };
          }
          
          // For balance sheet:
          // Assets (2, 3, 5, some 4) are typically debit - credit
          // Passives (1, some 4) are typically credit - debit
          const isAsset = line.accountCode.startsWith('2') || line.accountCode.startsWith('3') || line.accountCode.startsWith('5');
          const value = isAsset ? (line.debit - line.credit) : (line.credit - line.debit);
          detailsMap[key].amount += value;
        }
      });
    });

    return Object.entries(detailsMap)
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  return (
    <Layout title="Bilan Patrimonial">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <Scale className="text-white size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Bilan Mensuel</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">PATRIMOINE • {isBalanced ? "ÉQUILIBRÉ" : "DÉSÉQUILIBRÉ"}</p>
            </div>
          </div>
          <PeriodSelector />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {/* ACTIF */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-400" />
                Tableau de l'Actif
              </div>
              <span className="text-[9px] font-mono text-slate-500">ASSET_V2.BIN</span>
            </div>
            <div className="divide-y divide-slate-100">
              <BalanceSection 
                title="Emplois Permanent" 
                items={[{ 
                  label: 'ACTIF IMMOBILISÉ', 
                  value: actifImmo,
                  onClick: () => setSelectedCategory({ label: "Actif Immobilisé", prefixes: ['2'] })
                }]} 
              />
              <BalanceSection 
                title="Emplois Circulant" 
                items={[
                  { 
                    label: 'ACTIF CIRCULANT', 
                    value: actifCirculant,
                    onClick: () => setSelectedCategory({ label: "Actif Circulant", prefixes: ['3', '41'] })
                  }, 
                  { 
                    label: 'DISPONIBILITÉS', 
                    value: dispos,
                    onClick: () => setSelectedCategory({ label: "Disponibilités", prefixes: ['5'] })
                  }
                ]} 
              />
              
              <div className="p-4 bg-emerald-50/30 flex justify-between items-center sm:px-6">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total de l'Actif</span>
                <span className="text-lg font-black text-emerald-600 font-mono tracking-tight">{formatCurrency(totalActif)}</span>
              </div>
            </div>
          </div>

          {/* PASSIF */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
              <div className="text-xs font-bold uppercase tracking-widest text-white flex items-center gap-2">
                <Scale className="size-4 text-indigo-400" />
                Capitaux Propres & Passif
              </div>
              <span className="text-[9px] font-mono text-slate-500">LIABILITY_V2.BIN</span>
            </div>
            <div className="divide-y divide-slate-100">
              <BalanceSection 
                title="Ressources Internes" 
                items={[{ 
                  label: 'CAPITAUX PROPRES', 
                  value: capitauxPropres,
                  onClick: () => setSelectedCategory({ label: "Capitaux Propres", prefixes: ['10', '11', '12'] })
                }]} 
              />
              <BalanceSection 
                title="Ressources Externes" 
                items={[{ 
                  label: 'DETTES & PROVISIONS', 
                  value: dettes,
                  onClick: () => setSelectedCategory({ label: "Dettes", prefixes: ['16', '40', '42', '44'] })
                }]} 
              />
              
              <div className="p-4 bg-indigo-50/30 flex justify-between items-center sm:px-6">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total du Passif</span>
                <span className="text-lg font-black text-indigo-600 font-mono tracking-tight">{formatCurrency(totalPassif)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className={cn(
          "rounded-xl p-4 border flex flex-col sm:flex-row items-center justify-between gap-4 transition-all",
          isBalanced 
            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" 
            : "bg-rose-500/10 border-rose-500/20 text-rose-700 font-bold"
        )}>
          <div className="flex items-center gap-3">
             <div className={cn(
               "size-8 rounded-full flex items-center justify-center",
               isBalanced ? "bg-emerald-500 text-white" : "bg-rose-500 text-white"
             )}>
                <ShieldCheck className="size-4" />
             </div>
             <div>
                <p className="font-bold text-xs uppercase tracking-widest text-slate-500">Intégrité des Données</p>
                <p className="text-sm font-medium">
                  {isBalanced ? "Bilan équilibré." : `Écart détecté: ${formatCurrency(Math.abs(totalActif - totalPassif))}.`}
                </p>
             </div>
          </div>
          <div className="px-4 py-2 bg-white/50 rounded-lg border border-white/20 text-[10px] font-mono select-none">
            {isBalanced ? "SUM(ACTIF) === SUM(PASSIF)" : "SUM(ACTIF) !== SUM(PASSIF)"}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedCategory(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white shadow-2xl"
            >
              <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-indigo-600">
                    <Info className="size-5" />
                  </div>
                  <h3 className="font-bold text-slate-900">{selectedCategory.label}</h3>
                </div>
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="rounded-full p-1.5 text-slate-400 transition-colors hover:bg-slate-200 hover:text-slate-600"
                >
                  <X className="size-5" />
                </button>
              </div>
              
              <div className="max-h-[60vh] overflow-y-auto px-2 py-4">
                <table className="w-full text-xs text-left">
                  <thead className="text-[10px] uppercase tracking-wider text-slate-400 border-b border-slate-50">
                    <tr>
                      <th className="px-4 py-2 font-bold">Compte</th>
                      <th className="px-4 py-2 font-bold">Libellé</th>
                      <th className="px-4 py-2 font-bold text-right">Solde</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {getDetails(selectedCategory.prefixes).map((detail) => (
                      <tr key={detail.code}>
                        <td className="px-4 py-3 font-mono text-indigo-600">{detail.code}</td>
                        <td className="px-4 py-3 text-slate-600 font-medium">{detail.label}</td>
                        <td className={cn(
                          "px-4 py-3 text-right font-mono font-bold",
                          detail.amount < 0 ? "text-rose-500" : "text-emerald-600"
                        )}>
                          {formatCurrency(detail.amount)}
                        </td>
                      </tr>
                    ))}
                    {getDetails(selectedCategory.prefixes).length === 0 && (
                      <tr>
                        <td colSpan={3} className="px-4 py-8 text-center text-slate-400 italic">
                          Aucune écriture trouvée pour cette catégorie.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className="w-full rounded-xl bg-slate-900 py-2.5 text-sm font-bold text-white transition-all hover:bg-slate-800 active:scale-[0.98]"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </Layout>
  );
}

function BalanceSection({ title, items }: { title: string, items: { label: string, value: number, onClick?: () => void }[] }) {
  const total = items.reduce((sum, i) => sum + i.value, 0);

  return (
    <div className="flex flex-col">
      <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex justify-between items-center sm:px-6">
         <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{title}</h4>
         <span className="text-[9px] font-mono font-bold text-slate-300">{formatCurrency(total)}</span>
      </div>
      <div className="p-0">
        <table className="w-full text-xs">
          <tbody className="divide-y divide-slate-50">
            {items.map((item, idx) => (
              <tr 
                key={idx} 
                onClick={item.onClick}
                className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
              >
                <td className="px-6 py-3 text-slate-600 font-medium text-[11px] uppercase tracking-tighter flex items-center gap-2">
                  <ChevronRight className="size-3 text-slate-300 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  {item.label}
                </td>
                <td className="px-6 py-3 text-right font-mono font-bold text-slate-900">{formatCurrency(item.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

