import React, { useState } from 'react';
import { 
  School, 
  GraduationCap, 
  LogOut,
  Mail,
  Lock,
  ShieldCheck,
  Eye,
  EyeOff,
  UserPlus,
  LogIn,
  Camera,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Layout } from '@/src/components/Layout';
import { useAccounting, auth, db } from '@/src/services/store';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/src/lib/utils';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
} from 'firebase/auth';
import { 
  doc, 
  setDoc, 
  getDoc, 
  deleteDoc, 
  Timestamp 
} from 'firebase/firestore';
import { RotateCcw } from 'lucide-react';

export default function Profile() {
  const { user, isLoading, syncProfile } = useAccounting();
  const [mode, setMode] = useState<'login' | 'register' | 'verify'>('login');
  
  if (isLoading) {
    return (
      <Layout title="Mon compte">
        <div className="flex items-center justify-center py-20">
          <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  // If user is logged in but not verified, force verification
  if (user && !user.profile.verified && mode !== 'verify') {
    return (
      <Layout title="Vérification">
        <VerificationStep 
          user={user}
          onSuccess={async () => {
            await syncProfile({ ...user.profile, verified: true });
          }}
          onCancel={async () => {
             await signOut(auth);
          }}
        />
      </Layout>
    );
  }

  if (!user) {
    if (mode === 'verify') {
      return (
        <Layout title="Vérification">
           <div className="flex items-center justify-center py-20">
            <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
          </div>
        </Layout>
      );
    }
    return (
      <Layout title="Mon compte">
        <AuthFlow 
          mode={mode} 
          setMode={setMode} 
          onRegisterSuccess={() => {
            setMode('verify');
          }}
          syncProfile={syncProfile}
        />
      </Layout>
    );
  }

  return (
    <Layout title="Mon compte">
      <UserProfileView user={user} onLogout={() => signOut(auth)} />
    </Layout>
  );
}

function AuthFlow({ mode, setMode, onRegisterSuccess, syncProfile }: { 
  mode: 'login' | 'register', 
  setMode: (m: 'login' | 'register') => void,
  onRegisterSuccess: () => void,
  syncProfile: (p: any) => Promise<void>
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    establishment: '',
    parcours: '',
    acceptTerms: false
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas');
        }
        if (!formData.acceptTerms) {
          throw new Error('Vous devez accepter les conditions');
        }
        
        // 1. Create user
        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        const uid = userCredential.user.uid;

        // 2. Generate 4-digit code
        const generatedCode = Math.floor(1000 + Math.random() * 9000).toString();
        
        // 3. Store the code in Firestore
        // In a real production app, a Cloud Function would send this email
        await setDoc(doc(db, 'verificationCodes', uid), {
          code: generatedCode,
          userId: uid,
          createdAt: Timestamp.now()
        });

        // 4. Create local profile (verified: false)
        await syncProfile({
          firstName: formData.firstName,
          lastName: formData.lastName,
          establishment: formData.establishment,
          parcours: formData.parcours,
          email: formData.email,
          verified: false,
          photoURL: `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=6366f1&color=fff`
        });

        console.log("CODE DE VERIFICATION ENVOYÉ : ", generatedCode);
        onRegisterSuccess();
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') setError('Cet email est déjà utilisé');
      else if (err.code === 'auth/invalid-credential') setError('Identifiants incorrects');
      else if (err.code === 'auth/weak-password') setError('Mot de passe trop faible');
      else if (err.code === 'auth/operation-not-allowed') setError('L\'inscription par email n\'est pas activée.');
      else setError(err.message || 'Une erreur est survenue');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl shadow-indigo-100/50 p-8 md:p-10">
        <div className="text-center space-y-3 mb-10">
          <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-indigo-100">
            {mode === 'login' ? <LogIn className="size-8" /> : <UserPlus className="size-8" />}
          </div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight">
            {mode === 'login' ? 'Bon retour !' : 'Créer un compte'}
          </h2>
          <p className="text-slate-500 text-sm font-medium">
            {mode === 'login' 
              ? 'Connectez-vous pour accéder à vos données cloud.' 
              : 'Rejoignez-nous pour sécuriser votre comptabilité.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-4">
              <InputGroup 
                label="Prénom" 
                placeholder="Jean"
                value={formData.firstName}
                onChange={v => setFormData({...formData, firstName: v})}
                required
              />
              <InputGroup 
                label="Nom" 
                placeholder="Dupont"
                value={formData.lastName}
                onChange={v => setFormData({...formData, lastName: v})}
                required
              />
            </div>
          )}

          <InputGroup 
            label="Adresse email" 
            placeholder="jean.dupont@email.com"
            type="email"
            icon={<Mail className="size-4" />}
            value={formData.email}
            onChange={v => setFormData({...formData, email: v})}
            required
          />

          {mode === 'register' && (
            <>
              <InputGroup 
                label="Établissement" 
                placeholder="Ex: ISCAM"
                icon={<School className="size-4" />}
                value={formData.establishment}
                onChange={v => setFormData({...formData, establishment: v})}
                required
              />
              <InputGroup 
                label="Parcours" 
                placeholder="Ex: Master II"
                icon={<GraduationCap className="size-4" />}
                value={formData.parcours}
                onChange={v => setFormData({...formData, parcours: v})}
                required
              />
            </>
          )}

          <div className="relative">
            <InputGroup 
              label="Mot de passe" 
              placeholder="••••••••"
              type={showPassword ? 'text' : 'password'}
              icon={<Lock className="size-4" />}
              value={formData.password}
              onChange={v => setFormData({...formData, password: v})}
              required
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 bottom-3 text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>

          {mode === 'register' && (
            <InputGroup 
              label="Confirmer le mot de passe" 
              placeholder="••••••••"
              type="password"
              icon={<ShieldCheck className="size-4" />}
              value={formData.confirmPassword}
              onChange={v => setFormData({...formData, confirmPassword: v})}
              required
            />
          )}

          {mode === 'register' && (
            <label className="flex items-start gap-3 cursor-pointer group mt-4">
              <div className="relative pt-0.5">
                <input 
                  type="checkbox" 
                  className="peer sr-only"
                  checked={formData.acceptTerms}
                  onChange={e => setFormData({...formData, acceptTerms: e.target.checked})}
                />
                <div className="size-5 border-2 border-slate-200 rounded-lg group-hover:border-indigo-300 transition-all peer-checked:bg-indigo-600 peer-checked:border-indigo-600"></div>
                <CheckCircle2 className="size-3.5 text-white absolute top-1 left-1 opacity-0 peer-checked:opacity-100 transition-opacity" />
              </div>
              <span className="text-xs text-slate-500 font-medium">
                J'accepte les <span className="text-indigo-600 font-bold hover:underline">conditions d'utilisation</span>
              </span>
            </label>
          )}

          <AnimatePresence>
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold rounded-xl flex items-center gap-2"
              >
                <AlertCircle className="size-4" />
                {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 disabled:bg-slate-400"
          >
            {isSubmitting ? (
              <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                {mode === 'login' ? <LogIn className="size-5" /> : <UserPlus className="size-5" />}
                {mode === 'login' ? 'Se connecter' : 'Créer un compte'}
              </>
            )}
          </button>
        </form>

        <div className="mt-8 pt-8 border-t border-slate-100 text-center">
          <p className="text-sm text-slate-500 font-medium">
            {mode === 'login' ? "Nouveau sur ComptaZen ?" : "Déjà un compte ?"}
            <button 
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
              className="ml-2 text-indigo-600 font-black hover:underline tracking-tight"
            >
              {mode === 'login' ? 'Créer un compte' : 'Se connecter'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function InputGroup({ label, placeholder, type = 'text', icon, value, onChange, required }: {
  label: string,
  placeholder: string,
  type?: string,
  icon?: React.ReactNode,
  value: string,
  onChange: (v: string) => void,
  required?: boolean
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest px-1">
        {label}
      </label>
      <div className="relative group">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors">
            {icon}
          </div>
        )}
        <input 
          type={type}
          value={value}
          required={required}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={cn(
            "w-full h-12 bg-slate-50 border border-slate-200 rounded-xl px-4 text-sm font-medium outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all",
            icon && "pl-11"
          )}
        />
      </div>
    </div>
  );
}


function VerificationStep({ user, onSuccess, onCancel }: { user: any, onSuccess: () => void, onCancel: () => void }) {
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);

  const inputs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1);
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('Veuillez entrer le code à 4 chiffres');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      // 1. Get the real code from Firestore
      const docRef = doc(db, 'verificationCodes', user.uid);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error("Délai de vérification expiré ou session invalide.");
      }

      const storedData = docSnap.data();
      
      // 2. Compare
      if (fullCode === storedData.code) {
        // 3. Delete the code and proceed
        await deleteDoc(docRef);
        onSuccess();
      } else {
        throw new Error('Code incorrect. Veuillez vérifier vos emails.');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    setIsResending(true);
    setError('');
    try {
      const newCode = Math.floor(1000 + Math.random() * 9000).toString();
      await setDoc(doc(db, 'verificationCodes', user.uid), {
        code: newCode,
        userId: user.uid,
        createdAt: Timestamp.now()
      });
      // In production, this would trigger an email
      console.log("NOUVEAU CODE ENVOYÉ : ", newCode);
      setError("Un nouveau code a été envoyé !");
      setTimeout(() => setError(''), 3000);
    } catch (err) {
      setError("Erreur lors du renvoi.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl p-8 md:p-10 text-center">
        <div className="w-20 h-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-indigo-100 shadow-inner">
          <Mail className="size-10" />
        </div>

        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-4">Vérifiez vos emails</h2>
        
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 mb-8">
          <p className="text-slate-600 text-sm font-medium leading-relaxed">
            Entrez le <strong>code à 4 chiffres</strong> envoyé à l'adresse :<br/>
            <span className="text-indigo-600 font-bold block mt-1">{user.email}</span>
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputs.current[i] = el}
              type="text"
              inputMode="numeric"
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className="size-16 bg-slate-50 border-2 border-slate-200 rounded-2xl text-center text-2xl font-black text-slate-800 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
            />
          ))}
        </div>

        {error && (
          <div className={cn(
            "p-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 mb-6",
            error.includes("envoyé") ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-rose-50 text-rose-600 border border-rose-100"
          )}>
            <AlertCircle className="size-4" />
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            onClick={handleVerify}
            disabled={isVerifying}
            className="w-full h-14 bg-indigo-600 text-white rounded-2xl text-base font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
          >
            {isVerifying ? (
              <div className="size-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : 'Vérifier mon compte'}
          </button>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={handleResend}
              disabled={isResending}
              className="text-indigo-600 font-bold text-sm hover:underline disabled:text-slate-400 flex items-center justify-center gap-2"
            >
              <RotateCcw className={cn("size-4", isResending && "animate-spin")} />
              {isResending ? 'Envoi...' : 'Renvoyer le code par email'}
            </button>

            <button 
              onClick={onCancel}
              className="text-slate-400 font-bold text-xs hover:text-rose-500 transition-colors uppercase tracking-widest mt-4"
            >
              Annuler et retourner
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserProfileView({ user, onLogout }: { user: any, onLogout: () => void }) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-indigo-600 h-32 md:h-48 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 pointer-events-none">
             <div className="absolute -top-24 -left-24 w-96 h-96 bg-white rounded-full mix-blend-overlay blur-3xl"></div>
             <div className="absolute -top-24 -right-24 w-96 h-96 bg-indigo-400 rounded-full mix-blend-overlay blur-3xl"></div>
          </div>
        </div>
        
        <div className="px-8 pb-8">
          <div className="relative -mt-16 md:-mt-24 mb-6 flex flex-col md:flex-row items-end gap-6">
            <div className="relative group">
              <img 
                src={user.profile.photoURL} 
                className="w-32 h-32 md:w-48 md:h-48 rounded-[3rem] border-8 border-white shadow-xl object-cover" 
                alt="Profile" 
              />
              <button className="absolute bottom-2 right-2 bg-white p-3 rounded-2xl shadow-lg border border-slate-100 text-indigo-600 hover:scale-110 transition-transform">
                <Camera className="size-5" />
              </button>
            </div>
            
            <div className="flex-1 pb-4">
              <div className="flex items-center gap-2 text-indigo-600 font-black text-xs uppercase tracking-widest mb-1">
                <ShieldCheck className="size-4" /> Compte Vérifié
              </div>
              <h1 className="text-4xl font-black text-slate-800 tracking-tight">
                {user.profile.firstName} {user.profile.lastName}
              </h1>
              <p className="text-slate-500 font-medium flex items-center gap-2">
                <Mail className="size-4 opacity-40" /> {user.email}
              </p>
            </div>

            <div className="flex gap-3 pb-4">
              <button 
                onClick={onLogout}
                className="h-12 px-6 rounded-2xl border border-slate-200 text-slate-600 font-bold flex items-center gap-2 hover:bg-slate-50 transition-all text-sm"
              >
                <LogOut className="size-4" /> Déconnexion
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-slate-100">
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <School className="size-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Établissement</p>
                    <p className="text-lg font-black text-slate-800">{user.profile.establishment}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 border border-slate-100">
                    <GraduationCap className="size-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Parcours</p>
                    <p className="text-lg font-black text-slate-800">{user.profile.parcours}</p>
                  </div>
                </div>
             </div>

             <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100 space-y-4">
                <h4 className="font-black text-slate-800 text-sm uppercase tracking-wide flex items-center gap-2">
                  <ShieldCheck className="size-4 text-emerald-500" />
                  Sécurité du compte
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Votre compte est synchronisé avec notre base de données cloud. Pour toute opération sensible (restauration, suppression), votre mot de passe sera requis.
                </p>
                <button className="text-indigo-600 font-bold text-xs hover:underline">Modifier le mot de passe</button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
