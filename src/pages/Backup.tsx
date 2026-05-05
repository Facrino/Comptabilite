import React, { useState } from 'react';
import { 
  CloudUpload, 
  Database, 
  ShieldCheck, 
  Sparkles,
  CheckCircle2,
  Clock,
  History
} from 'lucide-react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';

export default function Backup() {
  const { backupData, transactions, stats, user } = useAccounting();
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [lastBackup, setLastBackup] = useState<string | null>(null);

  const handleBackup = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsBackingUp(true);
    setError('');
    
    try {
      const success = await backupData(password);
      if (success) {
        setLastBackup(new Date().toLocaleString('fr-FR'));
        setShowPasswordPrompt(false);
        setPassword('');
      } else {
        setError('Mot de passe incorrect');
      }
    } catch (err) {
      setError('Erreur lors de la sauvegarde');
    } finally {
      setIsBackingUp(false);
    }
  };

  if (!user) {
    return (
      <Layout title="Sauvegarde">
        <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto border border-dashed border-slate-200">
            <ShieldCheck className="size-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compte requis</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Veuillez vous connecter pour accéder aux services de sauvegarde cloud.</p>
          <a href="/profile" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">S'authentifier</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Sauvegarde">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Hero Section */}
        <div className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white">
          <div className="absolute top-0 right-0 p-8 opacity-10 blur-xl">
             <Database className="size-64" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-[10px] font-black uppercase tracking-widest">
              <ShieldCheck className="size-3" />
              Sécurisation Cloud
            </div>
            
            <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-tight max-w-xl">
              Sauvegardez vos données comptables en un clic.
            </h1>
            
            <p className="text-slate-400 text-lg max-w-lg leading-relaxed">
              Vos opérations journalières, votre compte de résultat et votre bilan seront stockés en toute sécurité dans notre base de données.
            </p>

            <div className="pt-4">
              {!showPasswordPrompt ? (
                <button 
                  onClick={() => setShowPasswordPrompt(true)}
                  className="px-10 py-4 rounded-2xl text-base font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl active:scale-[0.98] w-full sm:w-auto bg-gradient-to-br from-indigo-500 to-indigo-700 text-white shadow-indigo-500/20 hover:shadow-indigo-500/40"
                >
                  <CloudUpload className="size-5" />
                  Préparer la Sauvegarde
                </button>
              ) : (
                <form onSubmit={handleBackup} className="max-w-sm space-y-4 animate-in slide-in-from-top-4">
                  <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 p-4 space-y-3">
                    <label className="text-[10px] font-black uppercase text-indigo-300 tracking-widest block">Confirmer avec votre mot de passe</label>
                    <input 
                      type="password"
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Votre mot de passe..."
                      className="w-full h-12 bg-white/10 border border-white/20 rounded-xl px-4 text-sm text-white placeholder:text-white/30 focus:ring-4 focus:ring-indigo-500/30 outline-none transition-all"
                    />
                    {error && <p className="text-xs text-rose-400 font-bold">{error}</p>}
                    <div className="flex gap-2">
                       <button 
                        onClick={() => {
                          setShowPasswordPrompt(false);
                          setError('');
                        }}
                        type="button"
                        className="flex-1 h-12 bg-white/5 hover:bg-white/10 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        disabled={isBackingUp}
                        className="flex-[2] h-12 bg-white text-indigo-900 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
                      >
                        {isBackingUp ? (
                          <div className="size-4 border-2 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                        ) : 'Confirmer'}
                      </button>
                    </div>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <Sparkles className="size-4 text-amber-500" />
              Résumé des données à envoyer
            </h3>
            
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
              <DataLine label="Écritures comptables" value={`${transactions.length} lignes`} />
              <DataLine label="Total du Bilan" value={formatCurrency(stats.totalAssets)} />
              <DataLine label="Résultat Net" value={formatCurrency(stats.netResult)} />
              <div className="pt-4 h-px bg-slate-100" />
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="text-slate-400 uppercase">Intégrité des données</span>
                <span className="text-emerald-500 flex items-center gap-1">
                  100% Vérifié <CheckCircle2 className="size-3" />
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-sm font-black uppercase text-slate-400 tracking-wider flex items-center gap-2">
              <History className="size-4 text-indigo-500" />
              Dernière synchronisation
            </h3>

            <div className="bg-indigo-50/30 rounded-2xl border border-indigo-100 p-6 flex flex-col items-center justify-center text-center gap-4 border-dashed min-h-[200px]">
              {lastBackup ? (
                <>
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="size-6" />
                  </div>
                  <div>
                    <p className="font-black text-slate-800 tracking-tight">Réussi !</p>
                    <p className="text-xs text-slate-500 mt-1">Le {lastBackup}</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-white text-slate-300 rounded-full flex items-center justify-center border-2 border-dashed border-slate-200">
                    <Clock className="size-6" />
                  </div>
                  <p className="text-xs text-slate-400 font-medium max-w-[180px]">
                    Aucune sauvegarde récente trouvée sur ce compte.
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

function DataLine({ label, value }: { label: string, value: string }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="font-medium text-slate-500">{label}</span>
      <span className="font-bold text-slate-800">{value}</span>
    </div>
  );
}
