import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import useAsyncStorage from '../hooks/useAsyncStorage';
import sample from '../data/sampleData';
import { newTransaction } from '../services/expenseService';
import type {
  ChatMessage,
  CustomCategory,
  DeletedTransaction,
  Transaction,
  TxDraft,
  TxType,
} from '../types';

export interface ExpenseContextValue {
  transactions: Transaction[];
  customCategories: CustomCategory[];
  /** Recycle bin: newest deletion first. */
  trash: DeletedTransaction[];
  currency: string;
  setCurrency: (next: string) => void;
  chat: ChatMessage[];
  setChat: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  add: (data: TxDraft & { type: TxType }) => void;
  update: (id: string, data: TxDraft) => void;
  /** Moves a transaction to the trash, where it can be restored. */
  remove: (id: string) => void;
  /** Puts a trashed transaction back, keeping its original id. */
  restore: (id: string) => void;
  /** Deletes one trashed transaction for good. */
  destroy: (id: string) => void;
  /** Empties the recycle bin. */
  emptyTrash: () => void;
  addCategory: (cat: CustomCategory) => void;
  removeCategory: (cat: CustomCategory) => void;
  reset: () => void;
  /** False until AsyncStorage has been read; render a splash/loader first. */
  ready: boolean;
}

export const ExpenseContext = createContext<ExpenseContextValue | null>(null);

export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions, txReady] = useAsyncStorage<Transaction[]>('et_tx', sample);
  const [customCategories, setCustom, catReady] = useAsyncStorage<CustomCategory[]>('et_cats', []);
  const [currency, setCurrency, curReady] = useAsyncStorage<string>('et_cur', 'USD');
  const [trash, setTrash, trashReady] = useAsyncStorage<DeletedTransaction[]>('et_trash', []);
  // Assistant history is session-only, as before.
  const [chat, setChat] = useState<ChatMessage[]>([]);

  const value = useMemo<ExpenseContextValue>(
    () => ({
      transactions,
      customCategories,
      trash,
      currency,
      setCurrency,
      chat,
      setChat,
      add: (data) => setTransactions((list) => [...list, newTransaction(data)]),
      update: (id, data) =>
        setTransactions((list) =>
          list.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...data,
                  amount: Number(data.amount),
                  note: data.note.trim() || undefined,
                  updatedAt: new Date().toISOString(),
                }
              : t,
          ),
        ),
      remove: (id) => {
        const gone = transactions.find((t) => t.id === id);
        if (!gone) return;
        setTransactions((list) => list.filter((t) => t.id !== id));
        setTrash((list) => [
          { transaction: gone, deletedAt: new Date().toISOString() },
          ...list.filter((d) => d.transaction.id !== id),
        ]);
      },
      restore: (id) => {
        const entry = trash.find((d) => d.transaction.id === id);
        if (!entry) return;
        setTrash((list) => list.filter((d) => d.transaction.id !== id));
        // Guard against an id that is somehow live again.
        setTransactions((list) =>
          list.some((t) => t.id === id) ? list : [...list, entry.transaction],
        );
      },
      destroy: (id) => setTrash((list) => list.filter((d) => d.transaction.id !== id)),
      emptyTrash: () => setTrash([]),
      addCategory: (cat) =>
        setCustom((list) =>
          list.some((x) => x.name === cat.name && x.type === cat.type) ? list : [...list, cat],
        ),
      removeCategory: (cat) =>
        setCustom((list) => list.filter((x) => !(x.name === cat.name && x.type === cat.type))),
      reset: () => setTransactions(sample.map((t) => ({ ...t }))),
      ready: txReady && catReady && curReady && trashReady,
    }),
    [
      transactions,
      customCategories,
      trash,
      currency,
      chat,
      txReady,
      catReady,
      curReady,
      trashReady,
    ],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

export const useExpenseContext = (): ExpenseContextValue => {
  const ctx = useContext(ExpenseContext);
  if (!ctx) throw new Error('useExpenseContext must be used inside <ExpenseProvider>');
  return ctx;
};