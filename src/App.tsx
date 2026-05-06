import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AccountingProvider, useAccounting } from './services/store';
import Dashboard from './pages/Dashboard';
import Operations from './pages/Operations';
import IncomeStatement from './pages/IncomeStatement';
import BalanceSheet from './pages/BalanceSheet';
import Profile from './pages/Profile';
import Backup from './pages/Backup';
import Restore from './pages/Restore';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAccounting();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="size-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/profile" replace />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AccountingProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/operations" element={<ProtectedRoute><Operations /></ProtectedRoute>} />
          <Route path="/reports/income" element={<ProtectedRoute><IncomeStatement /></ProtectedRoute>} />
          <Route path="/reports/balance" element={<ProtectedRoute><BalanceSheet /></ProtectedRoute>} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/backup" element={<ProtectedRoute><Backup /></ProtectedRoute>} />
          <Route path="/restore" element={<ProtectedRoute><Restore /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AccountingProvider>
  );
}
