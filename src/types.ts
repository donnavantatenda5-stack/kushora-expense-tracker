export type TxType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  /** YYYY-MM-DD, stored local, never shifted by timezones. */
  date: string;
  note?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CustomCategory {
  name: string;
  type: TxType;
}

/**
 * A transaction that was deleted. Kept whole rather than as a partial record so
 * it can be restored exactly as it was.
 */
export interface DeletedTransaction {
  transaction: Transaction;
  /** ISO timestamp of when it was moved to the trash. */
  deletedAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  note?: string;
  /** Set when the assistant could not answer, so the turn can be retried. */
  bad?: boolean;
  question?: string;
  base?: ChatMessage[];
}

export interface Totals {
  income: number;
  expense: number;
  balance: number;
}

export interface CategoryTotal {
  name: string;
  value: number;
}

export interface Filters {
  q: string;
  cat: string;
  type: string;
}

/** Shape of the add/edit form before validation turns it into a Transaction. */
export interface TxDraft {
  type: TxType;
  amount: string;
  category: string;
  date: string;
  note: string;
}

export type TxErrors = Partial<Record<'amount' | 'category' | 'date', string>>;

export interface SelectOption {
  value: string;
  label: string;
}

export const EMPTY_FILTERS: Filters = { q: '', cat: '', type: '' };
