import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Transaction, SummaryStats } from '../types';
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  User as FirebaseUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateProfile
} from 'firebase/auth';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc,
  deleteDoc,
  Timestamp,
  collection,
  query,
  where,
  onSnapshot,
  enableIndexedDbPersistence
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

// Enable Firestore persistence for offline support
if (typeof window !== 'undefined') {
  enableIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
      console.warn('Multiple tabs open, persistence can only be enabled in one tab at a time.');
    } else if (err.code === 'unimplemented') {
      console.warn('The current browser does not support all of the features required to enable persistence.');
    }
  });
}

interface UserProfile {
  firstName: string;
  lastName: string;
  establishment: string;
  parcours: string;
  photoURL?: string;
  email: string;
  verified: boolean;
}

interface User {
  uid: string;
  email: string;
  profile: UserProfile;
}

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface AccountingContextType {
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  addTransaction: (tx: Transaction) => Promise<void>;
  updateTransaction: (tx: Transaction) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  stats: SummaryStats;
  currentPeriod: string;
  setCurrentPeriod: (period: string) => void;
  user: User | null;
  isLoading: boolean;
  backupData: (password: string) => Promise<boolean>;
  restoreData: (password: string) => Promise<boolean>;
  syncProfile: (profile: UserProfile) => Promise<void>;
}

const AccountingContext = createContext<AccountingContextType | undefined>(undefined);

export function AccountingProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Period management
  const [currentPeriod, setCurrentPeriod] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  // Real-time transactions sync with Firestore
  useEffect(() => {
    if (!user) {
      setTransactions([]);
      return;
    }

    const q = query(
      collection(db, 'transactions'), 
      where('userId', '==', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const txs: Transaction[] = [];
      snapshot.forEach((doc) => {
        txs.push(doc.data() as Transaction);
      });
      // Sort by date descending
      txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(txs);
    }, (error) => {
      console.error("Firestore sync error", error);
    });

    return () => unsubscribe();
  }, [user]);

  // Auth observer
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const profileDoc = await getDoc(doc(db, 'profiles', firebaseUser.uid));
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as UserProfile;
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              profile: profileData
            });
          } else {
            // If profile doesn't exist, we might be in the middle of registration
            // or the user was created elsewhere.
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || '',
              profile: {
                firstName: firebaseUser.displayName?.split(' ')[0] || '',
                lastName: firebaseUser.displayName?.split(' ')[1] || '',
                email: firebaseUser.email || '',
                establishment: '',
                parcours: '',
                verified: false,
                photoURL: firebaseUser.photoURL || undefined
              }
            });
          }
        } catch (error) {
          console.error("Error fetching profile", error);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  const syncProfile = async (profile: UserProfile) => {
    if (!auth.currentUser) return;
    try {
      await setDoc(doc(db, 'profiles', auth.currentUser.uid), profile);
      await updateProfile(auth.currentUser, {
        displayName: `${profile.firstName} ${profile.lastName}`,
        photoURL: profile.photoURL
      });
      setUser(prev => prev ? { ...prev, profile } : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `profiles/${auth.currentUser.uid}`);
    }
  };

  const backupData = async (password: string): Promise<boolean> => {
    if (!auth.currentUser || !user) return false;
    
    try {
      // Re-authenticate to confirm password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      const backupPath = `backups/${user.uid}`;
      await setDoc(doc(db, backupPath), {
        transactions,
        userId: user.uid,
        timestamp: Timestamp.now()
      });
      return true;
    } catch (error) {
      console.error("Backup failed", error);
      return false;
    }
  };

  const restoreData = async (password: string): Promise<boolean> => {
    if (!auth.currentUser || !user) return false;

    try {
      // Re-authenticate to confirm password
      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(auth.currentUser, credential);

      const backupPath = `backups/${user.uid}`;
      const backupDoc = await getDoc(doc(db, backupPath));
      
      if (backupDoc.exists()) {
        const data = backupDoc.data();
        const restoredTxs = data.transactions || [];
        setTransactions(restoredTxs);
        localStorage.setItem(`comptazen_txs_${user.uid}`, JSON.stringify(restoredTxs));
        return true;
      }
      return false;
    } catch (error) {
      console.error("Restore failed", error);
      return false;
    }
  };

  const addTransaction = async (tx: Transaction) => {
    if (!user) return;
    try {
      const txData = { ...tx, userId: user.uid };
      await setDoc(doc(db, 'transactions', tx.id), txData);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `transactions/${tx.id}`);
    }
  };

  const updateTransaction = async (updatedTx: Transaction) => {
    if (!user) return;
    try {
      const txData = { ...updatedTx, userId: user.uid };
      await setDoc(doc(db, 'transactions', updatedTx.id), txData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `transactions/${updatedTx.id}`);
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, 'transactions', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `transactions/${id}`);
    }
  };

  const filteredTransactions = transactions.filter(tx => tx.date.startsWith(currentPeriod));

  const calculateStats = (): SummaryStats => {
    let totalAssets = 0;
    let totalLiabilities = 0;
    let totalIncome = 0;
    let totalExpenses = 0;
    
    transactions.forEach(tx => {
      const isCurrentMonth = tx.date.startsWith(currentPeriod);
      const isBeforeOrCurrent = tx.date <= currentPeriod + "-31";

      tx.lines.forEach(line => {
        if (line.accountCode.startsWith('6') && isCurrentMonth) {
          totalExpenses += line.debit;
        } else if (line.accountCode.startsWith('7') && isCurrentMonth) {
          totalIncome += line.credit;
        } else if ((line.accountCode.startsWith('2') || line.accountCode.startsWith('5') || line.accountCode.startsWith('3')) && isBeforeOrCurrent) {
          totalAssets += (line.debit - line.credit);
        } else if ((line.accountCode.startsWith('1') || line.accountCode.startsWith('4')) && isBeforeOrCurrent) {
          totalLiabilities += (line.credit - line.debit);
        }
      });
    });

    return {
      totalAssets,
      totalLiabilities,
      totalIncome,
      totalExpenses,
      netResult: totalIncome - totalExpenses,
    };
  };

  return (
    <AccountingContext.Provider value={{ 
      transactions,
      filteredTransactions,
      addTransaction, 
      updateTransaction,
      deleteTransaction,
      stats: calculateStats(),
      currentPeriod,
      setCurrentPeriod,
      user,
      isLoading,
      backupData,
      restoreData,
      syncProfile
    }}>
      {children}
    </AccountingContext.Provider>
  );
}

export function useAccounting() {
  const context = useContext(AccountingContext);
  if (!context) throw new Error('useAccounting must be used within AccountingProvider');
  return context;
}
