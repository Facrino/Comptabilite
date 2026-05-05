export type AccountType = 'actif' | 'passif' | 'charge' | 'produit';

export interface Account {
  code: string;
  label: string;
  type: AccountType;
}

export interface JournalEntryLine {
  id: string;
  accountCode: string;
  accountLabel: string;
  debit: number;
  credit: number;
}

export interface Transaction {
  id: string;
  date: string;
  label: string;
  lines: JournalEntryLine[];
}

export interface SummaryStats {
  totalAssets: number;
  totalLiabilities: number;
  totalIncome: number;
  totalExpenses: number;
  netResult: number;
}
