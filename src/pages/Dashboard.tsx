import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PlusCircle, 
  User, 
  Calendar as CalendarIcon, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  ArrowUpRight,
  BarChart2
} from 'lucide-react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { formatCurrency, cn } from '@/src/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { PeriodSelector } from '@/src/components/PeriodSelector';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { transactions, filteredTransactions, stats } = useAccounting();
  const currentMonth = format(new Date(), 'MMMM yyyy', { locale: fr });

  const chartData = [
    { name: 'Produits', value: stats.totalIncome, color: '#22c55e' },
    { name: 'Charges', value: stats.totalExpenses, color: '#ef4444' },
    { name: 'Résultat', value: Math.max(0, stats.netResult), color: '#1d4ed8' },
  ];

  return (
    <Layout title="Tableau de Bord Financier">
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
             <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200">
               <TrendingUp className="text-indigo-600 size-6" />
             </div>
             <div>
               <h1 className="text-lg font-black text-slate-900 tracking-tight leading-none">Analyse Financière</h1>
               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Status: Système Actif</p>
             </div>
          </div>
          <PeriodSelector />
        </div>
        {transactions.length === 0 ? (
          <div className="bg-white p-12 rounded-xl border border-slate-200 shadow-sm text-center">
            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
              <PlusCircle className="size-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">Prêt à commencer ?</h3>
            <p className="text-slate-500 text-sm mt-1 mb-6">Aucune opération n'a encore été enregistrée.</p>
            <Link 
              to="/operations"
              className="px-6 py-2.5 bg-indigo-600 text-white text-sm font-semibold rounded hover:bg-indigo-700 transition-colors shadow-sm"
            >
              + Ajouter une écriture
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <KPIChip 
                label="Produits (Recettes)" 
                value={stats.totalIncome} 
                icon={TrendingUp} 
                color="indigo"
              />
              <KPIChip 
                label="Charges (Dépenses)" 
                value={stats.totalExpenses} 
                icon={TrendingDown} 
                color="slate"
              />
              <KPIChip 
                label="Résultat Net" 
                value={stats.netResult} 
                icon={Wallet} 
                color="indigo-bold"
                subtitle="Calculé sur la période"
              />
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Ratio de Solvabilité</p>
                <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
                  <div className="bg-indigo-500 h-full" style={{ width: '78%' }}></div>
                </div>
                <p className="text-xs text-slate-600 font-bold mt-2">78% <span className="font-normal text-slate-400 ml-1">Healthy Range</span></p>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-6">
              <section className="col-span-12 lg:col-span-7 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Dernières Opérations</h3>
                  <Link to="/operations" className="text-xs text-indigo-600 font-bold hover:underline">Tout voir</Link>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                      <tr>
                        <th className="px-4 py-2 font-bold text-[10px] uppercase tracking-wider">Date</th>
                        <th className="px-4 py-2 font-bold text-[10px] uppercase tracking-wider">Libellé</th>
                        <th className="px-4 py-2 font-bold text-[10px] uppercase tracking-wider text-right">Montant</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {filteredTransactions.slice(0, 5).map(tx => (
                        <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-4 py-3 text-xs text-slate-400 font-mono">{format(new Date(tx.date), 'yyyy-MM-dd')}</td>
                          <td className="px-4 py-3 font-medium text-slate-700">{tx.label}</td>
                          <td className="px-4 py-3 text-right font-bold text-slate-900">{formatCurrency(tx.lines.reduce((s, l) => s + (l.debit || 0), 0))}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              <section className="col-span-12 lg:col-span-5 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                <div className="p-4 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider flex items-center gap-2">
                    <BarChart2 className="size-4 text-indigo-500" />
                    Performance Analytique
                  </h3>
                </div>
                <div className="p-6 h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="2 2" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" hide />
                      <YAxis hide />
                      <Tooltip 
                        cursor={{ fill: 'transparent' }}
                        contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0/0.1)', fontSize: '10px' }}
                        labelStyle={{ display: 'none' }}
                      />
                      <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={32}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </section>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

function KPIChip({ label, value, icon: Icon, color, subtitle }: { label: string, value: number, icon: any, color: string, subtitle?: string }) {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
      <h2 className={cn(
        "text-2xl font-black tracking-tight",
        color === 'indigo-bold' ? "text-indigo-600" : "text-slate-900",
        color === 'indigo' && "underline decoration-indigo-200 underline-offset-4"
      )}>
        {formatCurrency(value)}
      </h2>
      <p className={cn("text-[10px] font-bold mt-2", color === 'slate' ? "text-slate-400" : "text-emerald-600")}>
        {subtitle || (value >= 0 ? "+0.0% vs prov." : "Ecriture active")}
      </p>
    </div>
  );
}
