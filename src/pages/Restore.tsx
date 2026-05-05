import React, { useState } from 'react';
import { 
  CloudDownload, 
  RotateCcw,
  AlertCircle,
  FileSearch,
  CheckCircle2,
  DatabaseZap
} from 'lucide-react';
import { Layout } from '@/src/components/Layout';
import { useAccounting } from '@/src/services/store';
import { motion, AnimatePresence } from 'motion/react';
import { formatCurrency, cn } from '@/src/lib/utils';

export default function Restore() {
  const { restoreData, transactions, user } = useAccounting();
  const [isRestoring, setIsRestoring] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleRestore = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!password) {
      setError('Veuillez entrer votre mot de passe');
      return;
    }

    setIsRestoring(true);
    setError('');

    try {
      const successResult = await restoreData(password);
      if (successResult) {
        setSuccess(true);
        setShowPasswordPrompt(false);
        setPassword('');
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError('Mot de passe incorrect ou aucune sauvegarde trouvée');
      }
    } catch (err) {
      setError('Erreur lors de la récupération');
    } finally {
      setIsRestoring(false);
    }
  };

  if (!user) {
    return (
      <Layout title="Restauration">
        <div className="max-w-4xl mx-auto py-20 text-center space-y-4">
          <div className="w-16 h-16 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mx-auto border border-dashed border-slate-200">
            <RotateCcw className="size-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Compte requis</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">Veuillez vous connecter pour accéder aux services de restauration cloud.</p>
          <a href="/profile" className="inline-block px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold text-sm uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">S'authentifier</a>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Restauration">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Warning View */}
        <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100 flex gap-4 items-start">
          <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
            <AlertCircle className="size-5" />
          </div>
          <div className="space-y-1">
            <h4 className="font-black text-amber-900 text-sm uppercase tracking-wide">Attention : Remplacement des données</h4>
            <p className="text-sm text-amber-700 leading-relaxed">
              La restauration remplacera toutes vos données actuelles (opérations, profil, rapports) par la version sauvegardée dans notre base de données. 
              Assurez-vous d'avoir sauvegardé votre travail actuel si nécessaire.
            </p>
          </div>
        </div>

        {/* Restore Card */}
        <div className="bg-white rounded-[2.5rem] p-10 border border-slate-200 shadow-xl shadow-slate-200/40 relative overflow-hidden">
          <div className="absolute -bottom-10 -right-10 opacity-[0.03]">
             <CloudDownload className="size-80" />
          </div>

          <div className="relative z-10 flex flex-col items-center text-center space-y-8">
            <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100">
              <RotateCcw className={cn("size-10", isRestoring && "animate-spin")} />
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-black text-slate-800 tracking-tight">Récupérer mes sauvegardes</h2>
              <p className="text-slate-500 max-w-md mx-auto leading-relaxed">
                Appuyez sur le bouton ci-dessous pour restaurer votre opération journalière, votre compte de résultat et votre bilan depuis nos serveurs.
              </p>
            </div>

            <div className="flex flex-col gap-4 w-full max-w-sm">
              {!showPasswordPrompt ? (
                <button 
                  onClick={() => setShowPasswordPrompt(true)}
                  className="h-16 rounded-2xl text-lg font-black uppercase tracking-[0.2em] shadow-lg transition-all active:scale-[0.98] flex items-center justify-center gap-3 bg-slate-900 text-white hover:bg-black shadow-slate-200/60"
                >
                  Restaurer les données
                </button>
              ) : (
                <form onSubmit={handleRestore} className="space-y-4 animate-in slide-in-from-top-4">
                  <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 space-y-3">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest block text-left">Confirmer avec votre mot de passe</label>
                    <input 
                      type="password"
                      autoFocus
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Votre mot de passe..."
                      className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
                    />
                    {error && <p className="text-xs text-rose-600 font-bold text-left">{error}</p>}
                    <div className="flex gap-2">
                       <button 
                        onClick={() => {
                          setShowPasswordPrompt(false);
                          setError('');
                        }}
                        type="button"
                        className="flex-1 h-12 bg-white border border-slate-200 text-slate-600 text-xs font-black uppercase tracking-widest rounded-xl hover:bg-slate-50 transition-all"
                      >
                        Annuler
                      </button>
                      <button 
                        type="submit"
                        disabled={isRestoring}
                        className="flex-[2] h-12 bg-indigo-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                      >
                        {isRestoring ? (
                          <div className="size-4 border-2 border-indigo-100 border-t-white rounded-full animate-spin"></div>
                        ) : 'Confirmer'}
                      </button>
                    </div>
                  </div>
                </form>
              )}

              <AnimatePresence>
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-center gap-2 text-emerald-600 font-bold text-sm"
                  >
                    <CheckCircle2 className="size-4" />
                    Données restaurées avec succès !
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <FeatureCard 
            icon={<FileSearch className="size-5" />}
            title="Intégrité Meta"
            desc="Vérification auto des liens bilantiels."
          />
          <FeatureCard 
            icon={<RotateCcw className="size-5" />}
            title="Auto-Sync"
            desc="Restauration en temps réel sans rechargement."
          />
          <FeatureCard 
            icon={<DatabaseZap className="size-5" />}
            title="Zéro Perte"
            desc="Vos données sont chiffrées en base."
          />
        </div>
      </div>
    </Layout>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200/60 group hover:bg-white hover:border-indigo-200 transition-all">
      <div className="w-10 h-10 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-indigo-600 group-hover:border-indigo-100 shadow-sm transition-all mb-4">
        {icon}
      </div>
      <h5 className="font-black text-slate-800 text-xs uppercase tracking-wider mb-1">{title}</h5>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  );
}
