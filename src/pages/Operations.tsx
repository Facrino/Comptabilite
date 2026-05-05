import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Calendar as CalendarIcon, 
  FileSpreadsheet, 
  Sparkles,
  Settings2,
  CheckCircle2,
  XCircle,
  X,
  PlusCircle,
  Calculator,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { formatCurrency, cn } from '@/src/lib/utils';
import { Transaction, JournalEntryLine } from '@/src/types';
import { format } from 'date-fns';
import { PeriodSelector } from '@/src/components/PeriodSelector';

export default function Operations() {
  const { transactions, filteredTransactions, addTransaction, updateTransaction, deleteTransaction, currentPeriod } = useAccounting();
  
  const [editingTxId, setEditingTxId] = useState<string | null>(null);
  const [label, setLabel] = useState('');
  // Use currentPeriod to set initial date
  const [date, setDate] = useState(() => {
    const now = new Date();
    const periodMonth = currentPeriod.split('-')[1];
    const periodYear = currentPeriod.split('-')[0];
    // If today is in the current period, use today, otherwise use 1st of period
    const today = format(now, 'yyyy-MM');
    if (today === currentPeriod) {
       return format(now, 'yyyy-MM-dd');
    }
    return `${periodYear}-${periodMonth}-01`;
  });
  const [lines, setLines] = useState<JournalEntryLine[]>([
    { id: '1', accountCode: '', accountLabel: 'Débit', debit: 0, credit: 0 },
    { id: '2', accountCode: '', accountLabel: 'Crédit', debit: 0, credit: 0 },
  ]);

  const [showAdjustments, setShowAdjustments] = useState(false);

  const totalDebit = lines.reduce((sum, line) => sum + (line.debit || 0), 0);
  const totalCredit = lines.reduce((sum, line) => sum + (line.credit || 0), 0);
  const imbalance = Math.abs(totalDebit - totalCredit);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const resetForm = () => {
    setEditingTxId(null);
    setLabel('');
    setLines([
      { id: '1', accountCode: '', accountLabel: 'Débit', debit: 0, credit: 0 },
      { id: '2', accountCode: '', accountLabel: 'Crédit', debit: 0, credit: 0 },
    ]);
  };

  const startEdit = (tx: Transaction) => {
    setEditingTxId(tx.id);
    setLabel(tx.label);
    setDate(tx.date);
    setLines(tx.lines.map(l => ({ ...l })));
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const addAdjustment = (newLine: JournalEntryLine) => {
    setLines([...lines, { ...newLine, id: Math.random().toString(36).substr(2, 9) }]);
    setShowAdjustments(false);
  };

  const addLine = () => {
    setLines([...lines, { 
      id: Math.random().toString(36).substr(2, 9), 
      accountCode: '', 
      accountLabel: '', 
      debit: 0, 
      credit: 0 
    }]);
  };

  const removeLine = (id: string) => {
    if (lines.length <= 2) return;
    setLines(lines.filter(l => l.id !== id));
  };

  const updateLine = (id: string, field: keyof JournalEntryLine, value: any) => {
    setLines(lines.map(l => l.id === id ? { ...l, [field]: value } : l));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isBalanced || !label) return;

    if (editingTxId) {
      const updatedTx: Transaction = {
        id: editingTxId,
        date,
        label,
        lines: lines.filter(l => l.debit > 0 || l.credit > 0),
      };
      updateTransaction(updatedTx);
    } else {
      const newTx: Transaction = {
        id: Math.random().toString(36).substr(2, 9),
        date,
        label,
        lines: lines.filter(l => l.debit > 0 || l.credit > 0),
      };
      addTransaction(newTx);
    }
    
    resetForm();
  };

  return (
    <Layout title="Journal des Opérations">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-200">
              <FileSpreadsheet className="text-white size-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Journal Général</h2>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">ENREGISTREMENTS • {filteredTransactions.length} PIÈCES</p>
            </div>
          </div>
          <PeriodSelector />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          <div className="xl:col-span-4">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  {editingTxId ? (
                    <Settings2 className="size-4 text-amber-500 animate-pulse" />
                  ) : (
                    <Plus className="size-4 text-indigo-500" />
                  )}
                  {editingTxId ? "Modifier l'Écriture" : "Nouvelle Écriture"}
                </h3>
                <div className="flex gap-2">
                   {editingTxId && (
                     <button 
                       onClick={resetForm}
                       className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all text-[10px] font-black uppercase tracking-wider border border-slate-200"
                     >
                       Annuler
                     </button>
                   )}
                   <button 
                     onClick={() => setShowAdjustments(true)}
                     className="px-4 py-2 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center gap-2 text-[10px] font-black uppercase tracking-wider shadow-md active:scale-[0.98] border border-white/10"
                   >
                     <Sparkles className="size-3.5 fill-white/20" />
                     Ajustements
                   </button>
                </div>
              </div>

              <AnimatePresence>
                {showAdjustments && (
                  <AdjustmentDialog 
                    onClose={() => setShowAdjustments(false)}
                    onSelect={addAdjustment}
                    currentLines={lines}
                  />
                )}
              </AnimatePresence>
              <div className="p-5">
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block px-1">Libellé de l'opération</label>
                        <input 
                          className={cn(
                            "flex h-11 w-full rounded-xl border px-4 py-2 text-sm ring-offset-white placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm",
                            editingTxId ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"
                          )}
                          placeholder="Ex: Vente Produits Finis"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold uppercase text-slate-500 mb-1.5 block px-1">Date Transaction</label>
                        <div className="relative">
                          <input 
                            type="date"
                            className={cn(
                              "flex h-11 w-full rounded-xl border px-4 py-2 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium shadow-sm",
                              editingTxId ? "border-amber-200 bg-amber-50/30" : "border-slate-200 bg-white"
                            )}
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold uppercase text-slate-500">Détails des Comptes</label>
                      </div>
                      <div className="max-h-[320px] overflow-y-auto pr-1 space-y-3 custom-scrollbar">
                        {lines.map((line) => (
                          <div key={line.id} className={cn(
                            "p-3 rounded-lg border space-y-3 transition-colors",
                            editingTxId ? "bg-amber-50/20 border-amber-100" : "bg-slate-50 border-slate-200"
                          )}>
                            <div className="grid grid-cols-12 gap-2">
                              <div className="col-span-4">
                                <input 
                                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 font-mono shadow-sm transition-all"
                                  placeholder="Code"
                                  value={line.accountCode}
                                  onChange={(e) => updateLine(line.id, 'accountCode', e.target.value)}
                                />
                              </div>
                              <div className="col-span-8">
                                <input 
                                  className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all font-medium"
                                  placeholder="Libellé du compte"
                                  value={line.accountLabel}
                                  onChange={(e) => updateLine(line.id, 'accountLabel', e.target.value)}
                                />
                              </div>
                              <div className="col-span-5">
                                  <input 
                                    type="number"
                                    className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] font-mono text-right focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 shadow-sm transition-all"
                                    placeholder="Débit"
                                    value={line.debit || ''}
                                    onChange={(e) => updateLine(line.id, 'debit', parseFloat(e.target.value) || 0)}
                                  />
                              </div>
                              <div className="col-span-5">
                                  <input 
                                    type="number"
                                    className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1 text-[10px] font-mono text-right focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 shadow-sm transition-all"
                                    placeholder="Crédit"
                                    value={line.credit || ''}
                                    onChange={(e) => updateLine(line.id, 'credit', parseFloat(e.target.value) || 0)}
                                  />
                              </div>
                              <div className="col-span-2 flex items-center justify-end">
                                <button 
                                  type="button"
                                  className="p-1.5 rounded hover:bg-rose-50 text-rose-500 disabled:opacity-30"
                                  onClick={() => removeLine(line.id)}
                                  disabled={lines.length <= 2}
                                >
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button 
                        type="button" 
                        onClick={addLine}
                        className="flex items-center justify-center gap-2 py-2 px-4 rounded-md text-[10px] font-bold uppercase tracking-wider border border-dashed border-slate-300 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 hover:border-indigo-300 w-full transition-all"
                      >
                        <Plus className="size-3" />
                        Ajouter une ligne
                      </button>
                    </div>
                  </div>

                  <div className="p-4 bg-slate-900 rounded-xl text-white space-y-2">
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Total Débit</span>
                      <span className="text-emerald-400 font-bold">{formatCurrency(totalDebit)}</span>
                    </div>
                    <div className="flex justify-between text-[11px] font-mono">
                      <span className="text-slate-400">Total Crédit</span>
                      <span className="text-indigo-400 font-bold">{formatCurrency(totalCredit)}</span>
                    </div>
                    <div className={cn(
                      "mt-2 py-2 px-3 rounded text-[10px] font-bold uppercase tracking-widest text-center border ring-1 ring-inset",
                      isBalanced 
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 ring-emerald-500/10" 
                        : "bg-rose-500/10 text-rose-400 border-rose-500/20 ring-rose-500/10"
                    )}>
                      {isBalanced ? "ÉQUILIBRE VALIDÉ" : `ÉCART: ${formatCurrency(imbalance)}`}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    disabled={!isBalanced || !label}
                    className={cn(
                      "w-full h-12 rounded-md text-sm font-bold uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed shadow-sm transition-all active:scale-[0.98]",
                      editingTxId ? "bg-amber-600 hover:bg-amber-700 text-white" : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    )}
                  >
                    {editingTxId ? "Mettre à jour" : "Valider l'écriture"}
                  </button>
                </form>
              </div>
            </div>
          </div>

          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col flex-1">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                  <FileSpreadsheet className="size-4 text-indigo-500" />
                  Livre Journal
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-600">
                  {transactions.length} Entrées
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100 uppercase text-[10px] font-bold tracking-wider">
                    <tr>
                      <th className="px-6 py-3 text-left">Date / ID</th>
                      <th className="px-6 py-3 text-left">Libellé de la pièce</th>
                      <th className="px-6 py-3 text-right">Montant</th>
                      <th className="px-6 py-3 w-16"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-24 text-center text-slate-400 italic text-xs">
                          Aucune écriture pour cette période.
                        </td>
                      </tr>
                    ) : (
                      filteredTransactions.map((tx) => (
                        <TransactionRow 
                          key={tx.id} 
                          tx={tx} 
                          amount={tx.lines.reduce((s, l) => s + (l.debit || 0), 0)} 
                          onDelete={() => deleteTransaction(tx.id)}
                          onEdit={() => startEdit(tx)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              <div className="mt-auto border-t border-slate-100 p-3 bg-slate-900 flex justify-between text-[10px] text-slate-400 font-mono tracking-tighter">
                <span>SYSTEM: MAINAPP.JAVA</span>
                <span>CHECKSUM: 4A7B-92CD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function AdjustmentDialog({ 
  onClose, 
  onSelect, 
  currentLines 
}: { 
  onClose: () => void, 
  onSelect: (newLine: JournalEntryLine) => void,
  currentLines: JournalEntryLine[]
}) {
  const [sourceLineId, setSourceLineId] = useState(currentLines[0]?.id || '');
  const [targetAccountCode, setTargetAccountCode] = useState('');
  const [targetAccountLabel, setTargetAccountLabel] = useState('');
  const [calcMode, setCalcMode] = useState<'percent' | 'manual'>('percent');
  const [calcValue, setCalcValue] = useState(20);
  const [manualAmount, setManualAmount] = useState(0);
  const [targetType, setTargetType] = useState<'debit' | 'credit'>('debit');

  const sourceLine = currentLines.find(l => l.id === sourceLineId);
  const baseAmount = sourceLine ? (sourceLine.debit || sourceLine.credit || 0) : 0;
  
  const finalAmount = calcMode === 'percent' 
    ? (baseAmount * calcValue) / 100 
    : manualAmount;

  const handleApply = () => {
    onSelect({
      id: '',
      accountCode: targetAccountCode,
      accountLabel: targetAccountLabel,
      debit: targetType === 'debit' ? finalAmount : 0,
      credit: targetType === 'credit' ? finalAmount : 0,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col"
      >
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-100 p-2 rounded-lg text-indigo-600">
              <Calculator className="size-4" />
            </div>
            <h3 className="font-bold text-slate-800 tracking-tight">Outil d'Ajustement</h3>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X className="size-4 text-slate-400" />
          </button>
        </div>

        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh] custom-scrollbar">
          {/* Mode Selector */}
          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Méthode de calcul</label>
             <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                <button
                  onClick={() => setCalcMode('percent')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    calcMode === 'percent' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Calcul par %
                </button>
                <button
                  onClick={() => setCalcMode('manual')}
                  className={cn(
                    "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                    calcMode === 'manual' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                  )}
                >
                  Montant Direct
                </button>
             </div>
          </div>

          <AnimatePresence mode="wait">
            {calcMode === 'percent' ? (
              <motion.div 
                key="percent-mode"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Ligne de base (Source)</label>
                  <select
                    value={sourceLineId}
                    onChange={(e) => setSourceLineId(e.target.value)}
                    className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all appearance-none cursor-pointer"
                  >
                    {currentLines.map((l, i) => (
                      <option key={l.id} value={l.id}>
                        Ligne {i + 1}: {l.accountLabel || 'Sans nom'} ({formatCurrency(l.debit || l.credit || 0)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Pourcentage (%)</label>
                  <div className="relative">
                    <input 
                      type="number"
                      value={calcValue || ''}
                      onChange={(e) => setCalcValue(parseFloat(e.target.value) || 0)}
                      className="w-full h-12 bg-white border border-indigo-100 rounded-xl px-4 text-lg font-mono font-bold text-indigo-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm"
                      placeholder="20"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 text-indigo-300 font-black">%</div>
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="manual-mode"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="space-y-2"
              >
                <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Montant de l'ajustement</label>
                <div className="relative">
                  <input 
                    type="number"
                    value={manualAmount || ''}
                    onChange={(e) => setManualAmount(parseFloat(e.target.value) || 0)}
                    className="w-full h-12 bg-white border border-emerald-100 rounded-xl px-4 text-lg font-mono font-bold text-emerald-600 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all shadow-sm"
                    placeholder="0.00"
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-300 font-bold">Ar</div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="h-px bg-slate-100 my-2" />

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Code Compte</label>
              <input 
                value={targetAccountCode}
                onChange={(e) => setTargetAccountCode(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-mono focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: 445"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Libellé Compte</label>
              <input 
                value={targetAccountLabel}
                onChange={(e) => setTargetAccountLabel(e.target.value)}
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all"
                placeholder="Ex: TVA"
              />
            </div>
          </div>

          <div className="space-y-3">
             <label className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Imputation</label>
             <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                {(['debit', 'credit'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setTargetType(type)}
                    className={cn(
                      "flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
                      targetType === type ? "bg-white text-indigo-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    )}
                  >
                    {type === 'debit' ? 'Au Débit' : 'Au Crédit'}
                  </button>
                ))}
             </div>
          </div>

          <div className="p-4 bg-slate-900 rounded-2xl flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Résultat Final</span>
            <span className="text-xl font-mono font-black text-emerald-400">{formatCurrency(finalAmount)}</span>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-white transition-all shadow-sm"
          >
            Annuler
          </button>
          <button 
            onClick={handleApply}
            disabled={!targetAccountCode || !targetAccountLabel || finalAmount === 0}
            className="flex-1 py-3 rounded-xl bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 active:scale-[0.98]"
          >
            Ajouter l'Ajustement
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface TransactionRowProps {
  key?: string | number;
  tx: Transaction;
  amount: number;
  onDelete: () => void;
  onEdit: () => void;
}

function TransactionRow({ tx, amount, onDelete, onEdit }: TransactionRowProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <tr 
        className={cn(
          "group transition-all hover:bg-slate-50/80 cursor-pointer",
          isExpanded && "bg-indigo-50/30"
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-slate-400">{format(new Date(tx.date), 'yyyy-MM-dd')}</span>
            <span className="text-[9px] text-slate-300 truncate w-16">#{tx.id}</span>
          </div>
        </td>
        <td className="px-6 py-4">
          <span className="text-sm font-semibold text-slate-700">{tx.label}</span>
        </td>
        <td className="px-6 py-4 text-right">
          <span className="text-sm font-black text-indigo-600 font-mono">{formatCurrency(amount)}</span>
        </td>
        <td className="px-6 py-4 text-right overflow-hidden">
          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 rounded-lg hover:bg-indigo-50 text-indigo-600 transition-all"
              title="Modifier"
            >
              <Settings2 className="size-4" />
            </button>
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1.5 rounded-lg hover:bg-rose-50 text-rose-500 transition-all"
              title="Supprimer"
            >
              <Trash2 className="size-4" />
            </button>
          </div>
        </td>
      </tr>
      {isExpanded && (
        <tr>
          <td colSpan={4} className="px-8 pb-6 pt-0">
            <div className="bg-white rounded-lg border border-indigo-100 shadow-inner overflow-hidden max-w-2xl">
              <table className="w-full text-[11px]">
                <thead className="bg-indigo-50/50 border-b border-indigo-100">
                  <tr className="text-indigo-400 font-bold uppercase tracking-widest text-[9px]">
                    <th className="px-4 py-2 text-left">Compte</th>
                    <th className="px-4 py-2 text-left">Intitulé</th>
                    <th className="px-4 py-2 text-right">Débit</th>
                    <th className="px-4 py-2 text-right">Crédit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-indigo-50/50">
                  {tx.lines.map((line, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-2 font-mono font-bold text-indigo-600">{line.accountCode}</td>
                      <td className="px-4 py-2 text-slate-500">{line.accountLabel}</td>
                      <td className="px-4 py-2 text-right font-mono text-emerald-600">{line.debit > 0 ? formatCurrency(line.debit) : '—'}</td>
                      <td className="px-4 py-2 text-right font-mono text-indigo-500">{line.credit > 0 ? formatCurrency(line.credit) : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

