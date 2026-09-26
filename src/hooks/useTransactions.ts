import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Transaction, NewTransaction } from "@/lib/types";

export const USER_TRANSACTIONS_KEY = "finwise_user_transactions";

export const getSavedUserTransactions = (): Transaction[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_TRANSACTIONS_KEY);
    return raw ? (JSON.parse(raw) as Transaction[]) : [];
  } catch {
    return [];
  }
};

export const saveUserTransactions = (txs: Transaction[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_TRANSACTIONS_KEY, JSON.stringify(txs));
  } catch (e) {
    console.error("Error saving user transactions to localStorage:", e);
  }
};

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    return getSavedUserTransactions();
  });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const localTxs = getSavedUserTransactions();
      let supabaseTxs: Transaction[] = [];

      try {
        const { data, error: err } = await supabase
          .from("transactions")
          .select("*")
          .order("transaction_date", { ascending: false })
          .order("created_at", { ascending: false });

        if (!err && data) {
          supabaseTxs = data as Transaction[];
        }
      } catch {
        // Fall back to local storage
      }

      const seen = new Set<string>();
      const combinedUserTxs: Transaction[] = [];

      for (const t of [...localTxs, ...supabaseTxs]) {
        if (!seen.has(t.id)) {
          seen.add(t.id);
          combinedUserTxs.push(t);
        }
      }

      setTransactions(combinedUserTxs);
    } catch {
      setTransactions(getSavedUserTransactions());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const addTransaction = async (tx: NewTransaction): Promise<Transaction | null> => {
    let savedTx: Transaction | null = null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;

      if (currentUserId) {
        const { data, error: err } = await supabase
          .from("transactions")
          .insert({
            ...tx,
            user_id: currentUserId,
          })
          .select()
          .single();

        if (!err && data) {
          savedTx = data as Transaction;
        }
      }
    } catch {
      // Fallback to local storage
    }

    if (!savedTx) {
      savedTx = {
        id: `tx-user-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: "local-user",
        transaction_date: tx.transaction_date,
        description: tx.description,
        amount: Number(tx.amount),
        transaction_type: tx.transaction_type,
        category: tx.category || null,
        subcategory: null,
        ai_confidence: null,
        ai_categorized: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const existingLocal = getSavedUserTransactions();
      saveUserTransactions([savedTx, ...existingLocal]);
    }

    setTransactions((prev) => [savedTx!, ...prev]);
    return savedTx;
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<NewTransaction>,
  ): Promise<boolean> => {
    if (!id.startsWith("tx-user-")) {
      try {
        await supabase.from("transactions").update(updates).eq("id", id);
      } catch (err) {
        console.error("Error updating in Supabase:", err);
      }
    }

    const local = getSavedUserTransactions();
    const updatedLocal = local.map((t) => (t.id === id ? { ...t, ...updates } : t));
    saveUserTransactions(updatedLocal);

    setTransactions((prev) =>
      prev.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    );
    return true;
  };

  const deleteTransaction = async (id: string): Promise<boolean> => {
    if (!id.startsWith("tx-user-")) {
      try {
        await supabase.from("transactions").delete().eq("id", id);
      } catch (err) {
        console.error("Error deleting from Supabase:", err);
      }
    }

    const local = getSavedUserTransactions();
    const filteredLocal = local.filter((t) => t.id !== id);
    saveUserTransactions(filteredLocal);

    setTransactions((prev) => prev.filter((t) => t.id !== id));
    return true;
  };

  const deleteMultipleTransactions = async (ids: string[]): Promise<boolean> => {
    const idsSet = new Set(ids);
    const realIds = ids.filter((id) => !id.startsWith("tx-user-"));

    if (realIds.length > 0) {
      try {
        await supabase.from("transactions").delete().in("id", realIds);
      } catch (err) {
        console.error("Error deleting from supabase:", err);
      }
    }

    const local = getSavedUserTransactions();
    const filteredLocal = local.filter((t) => !idsSet.has(t.id));
    saveUserTransactions(filteredLocal);

    setTransactions((prev) => prev.filter((t) => !idsSet.has(t.id)));
    return true;
  };

  const updateTransactionCategory = (
    id: string,
    category: string,
    subcategory: string | null,
    confidence: number,
  ) => {
    const local = getSavedUserTransactions();
    const updatedLocal = local.map((t) =>
      t.id === id
        ? { ...t, category, subcategory, ai_confidence: confidence, ai_categorized: true }
        : t,
    );
    saveUserTransactions(updatedLocal);

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id
          ? { ...t, category, subcategory, ai_confidence: confidence, ai_categorized: true }
          : t,
      ),
    );
  };

  return {
    transactions,
    loading,
    error,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    updateTransactionCategory,
  };
}
