import React from 'react';
import { Sidebar } from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  title: string;
}

export function Layout({ children, title }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="md:ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center px-8 justify-between shadow-sm">
          <div className="flex items-center gap-4">
            <h2 className="text-xl font-bold text-slate-800 tracking-tight">{title}</h2>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden sm:inline-flex text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200 tracking-wider">
              DB Connector: Connected
            </span>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-hidden">
          <div className="h-full animate-in fade-in slide-in-from-bottom-2 duration-500">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
