import React, { useState } from 'react';
import { 
  FileText, 
  TrendingUp, 
  ChevronRight,
  Target,
  X,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { formatCurrency, cn } from '@/src/lib/utils';
import { PeriodSelector } from '@/src/components/PeriodSelector';

export default function IncomeStatement() {
  const { stats, filteredTransactions: transactions } = useAccounting();
  const [selectedCategory, setSelectedCategory] = useState<{ label: string, prefixes: string[] } | null>(null);

  // Logic to calculate SIG based on account codes
  const getSubtotal = (prefix: string) => {
    let total = 0;
    transactions.forEach(tx => {
      tx.lines.forEach(line => {
        if (line.accountCode.startsWith(prefix)) {
          total += (line.credit - line.debit);
        }
      });
    });
    return total;
  };

  // Simplified SIG calculation for demo
  const production = transactions.reduce((acc, tx) => {
      return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('70') || l.accountCode.startsWith('71') ? l.credit - l.debit : 0), 0);
  }, 0);

  const consommation = transactions.reduce((acc, tx) => {
      return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('60') || l.accountCode.startsWith('61') || l.accountCode.startsWith('62') ? l.debit - l.credit : 0), 0);
  }, 0);

  const valeurAjoutee = production - consommation;

  const chargesPersonnel = transactions.reduce((acc, tx) => {
      return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('64') ? l.debit - l.credit : 0), 0);
  }, 0);

  const ebe = valeurAjoutee - chargesPersonnel;
  
  const financialResult = transactions.reduce((acc, tx) => {
      return acc + tx.lines.reduce((sum, l) => sum + (l.accountCode.startsWith('76') ? l.credit - l.debit : 0) - (l.accountCode.startsWith('66') ? l.debit - l.credit : 0), 0);
  }, 0);

  const getDetails = (prefixes: string[]) => {
    const detailsMap: Record<string, { label: string, amount: number }> = {};
    
    transactions.forEach(tx => {
      tx.lines.forEach(line => {
        if (prefixes.some(p => line.accountCode.startsWith(p))) {
          const key = line.accountCode;
          if (!detailsMap[key]) {
            detailsMap[key] = { label: line.accountLabel, amount: 0 };
          }
          // For income statement: products are credit - debit, charges are debit - credit
          // But to show them nicely, we use the logic consistent with the SIG calculation
          const isIncome = line.accountCode.startsWith('7');
          const value = isIncome ? (line.credit - line.debit) : (line.debit - line.credit);
          detailsMap[key].amount += value;
        }
      });
    });

    return Object.entries(detailsMap)
      .map(([code, data]) => ({ code, ...data }))
      .sort((a, b) => a.code.localeCompare(b.code));
  };

  return (
    <Layout title="Compte de Résultat">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <TrendingUp className="text-white size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">SIG Mensuel</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">S.I.G • {stats.netResult >= 0 ? "BÉNÉFICE" : "PERTE"}</p>
            </div>
          </div>
          <PeriodSelector />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="rounded-xl border border-slate-200 bg-white lg:col-span-8 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <FileText className="size-4 text-indigo-400" />
                SIG: Détail par nature
              </div>
              <span className="text-[10px] font-mono opacity-50">COMPTERESULTAT.XML</span>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-slate-50 text-slate-500 border-b border-slate-100 font-bold uppercase text-[9px]">
                  <tr>
                    <th className="px-6 py-3 text-left">Postes de gestion</th>
                    <th className="px-6 py-3 text-right">Valeur N (MGA)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <SIGRow 
                    label="Production de l'exercice" 
                    value={production} 
                    onClick={() => setSelectedCategory({ label: "Production de l'exercice", prefixes: ['70', '71'] })}
                  />
                  <SIGRow 
                    label="Consommation de l'exercice" 
                    value={-consommation} 
                    onClick={() => setSelectedCategory({ label: "Consommation de l'exercice", prefixes: ['60', '61', '62'] })}
                  />
                  <SIGRow 
                    label="Valeur Ajoutée (VA)" 
                    value={valeurAjoutee} 
                    isSubtotal 
                    onClick={() => setSelectedCategory({ label: "Valeur Ajoutée", prefixes: ['70', '71', '60', '61', '62'] })}
                  />
                  <SIGRow 
                    label="Charges de personnel" 
                    value={-chargesPersonnel} 
                    onClick={() => setSelectedCategory({ label: "Charges de personnel", prefixes: ['64'] })}
                  />
                  <SIGRow 
                    label="Excédent Brut d'Exploitation (EBE)" 
                    value={ebe} 
                    isSubtotal 
                    onClick={() => setSelectedCategory({ label: "EBE", prefixes: ['70', '71', '60', '61', '62', '64'] })}
                  />
                  <SIGRow 
                    label="Résultat Financier" 
                    value={financialResult} 
                    onClick={() => setSelectedCategory({ label: "Résultat Financier", prefixes: ['76', '66'] })}
                  />
                  <SIGRow 
                    label="Résultat Avant Impôt" 
                    value={ebe + financialResult} 
                    isSubtotal 
                    onClick={() => setSelectedCategory({ label: "Résultat Avant Impôt", prefixes: ['70', '71', '60', '61', '62', '64', '76', '66'] })}
                  />
                  <SIGRow label="Résultat Exceptionnel" value={0} />
                  
                  <tr className="bg-indigo-600 text-white font-black text-sm">
                    <td className="px-6 py-4">RÉSULTAT NET DE L'EXERCICE</td>
                    <td className="px-6 py-4 text-right font-mono">{formatCurrency(stats.netResult)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 space-y-4">
              <div className="font-bold flex items-center gap-2 text-[10px] uppercase text-slate-500 tracking-wider">
                <TrendingUp className="size-3.5 text-indigo-500" />
                Performance Analytique
              </div>

              <div className="space-y-3">
                <MetricCard 
                  label="Marge / Production" 
                  value={production > 0 ? (stats.netResult / production) * 100 : 0} 
                  unit="%" 
                />
                <MetricCard 
                  label="Taux de Valeur Ajoutée" 
                  value={production > 0 ? (valeurAjoutee / production) * 100 : 0} 
                  unit="%" 
                />
                <MetricCard 
                  label="Poids des charges" 
                  value={production > 0 ? (stats.totalExpenses / production) * 100 : 0} 
                  unit="%" 
                  inverse
                />
              </div>
            </div>

            <div className="rounded-xl bg-[#0f172a] text-white p-5 relative overflow-hidden ring-1 ring-white/10 shadow-lg">
               <Target className="absolute -right-2 -bottom-2 size-24 opacity-5 text-indigo-500" />
               <h4 className="font-bold text-[10px] uppercase tracking-widest text-indigo-400 mb-2">Recommandation MainApp</h4>
               <p className="text-sm font-semibold leading-snug">Optimisez les charges externes pour augmenter la VA de 12%.</p>
               <div className="mt-4 flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                  AI ANALYZER ACTIVE
               </div>
            </div>
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

function SIGRow({ label, value, isSubtotal, onClick }: { label: string, value: number, isSubtotal?: boolean, onClick?: () => void }) {
  return (
    <tr 
      onClick={onClick}
      className={cn(
        "transition-colors cursor-pointer group",
        isSubtotal ? "bg-slate-50 font-bold" : "hover:bg-slate-50/50"
      )}
    >
      <td className="px-6 py-3.5 flex items-center gap-2 text-slate-600">
        {isSubtotal ? (
           <div className="flex items-center gap-2">
             <ChevronRight className="size-3 text-indigo-500 group-hover:translate-x-0.5 transition-transform" />
             {label}
           </div>
        ) : (
          <div className="flex items-center gap-2">
            <div className="w-3" />
            {label}
          </div>
        )}
      </td>
      <td className={cn(
        "px-6 py-3.5 text-right font-mono font-bold",
        value < 0 ? "text-rose-500" : "text-slate-900"
      )}>
        {formatCurrency(value)}
      </td>
    </tr>
  );
}

function MetricCard({ label, value, unit, inverse }: { label: string, value: number, unit: string, inverse?: boolean }) {
  const isHealthy = inverse ? value < 70 : value > 25;

  return (
    <div className={cn(
      "p-4 rounded-lg border border-slate-100 transition-all shadow-sm",
      isHealthy ? "bg-emerald-50/30" : "bg-rose-50/30"
    )}>
      <p className="text-[9px] font-bold uppercase text-slate-400 tracking-wider mb-1">{label}</p>
      <div className="flex justify-between items-end">
        <p className={cn(
          "text-lg font-black tracking-tight",
          isHealthy ? "text-emerald-600" : "text-rose-600"
        )}>
          {value.toFixed(1)}{unit}
        </p>
        <div className={cn(
          "w-1 h-1 rounded-full",
          isHealthy ? "bg-emerald-400 shadow-[0_0_5px_rgba(52,211,153,0.5)]" : "bg-rose-400 shadow-[0_0_5px_rgba(251,113,133,0.5)]"
        )}></div>
      </div>
    </div>
  );
}
