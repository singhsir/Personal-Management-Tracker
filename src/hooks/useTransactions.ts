import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Transaction, NewTransaction } from "@/lib/types";

const DEFAULT_DEMO_TRANSACTIONS: Transaction[] = [
  {
    id: "tx-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-24",
    description: "Dinner at Barbeque Nation",
    amount: 1850,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Dining",
    ai_confidence: 0.98,
    ai_categorized: true,
    created_at: "2026-09-24T20:30:00Z",
    updated_at: "2026-09-24T20:30:00Z",
  },
  {
    id: "tx-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-23",
    description: "Uber Ride",
    amount: 420,
    transaction_type: "expense",
    category: "Transportation",
    subcategory: "Ride Sharing",
    ai_confidence: 0.96,
    ai_categorized: true,
    created_at: "2026-09-23T09:15:00Z",
    updated_at: "2026-09-23T09:15:00Z",
  },
  {
    id: "tx-3",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-20",
    description: "Netflix Subscription",
    amount: 649,
    transaction_type: "expense",
    category: "Entertainment",
    subcategory: "Streaming",
    ai_confidence: 0.99,
    ai_categorized: true,
    created_at: "2026-09-20T10:00:00Z",
    updated_at: "2026-09-20T10:00:00Z",
  },
  {
    id: "tx-4",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-18",
    description: "Weekend Cinema & Snacks",
    amount: 1501,
    transaction_type: "expense",
    category: "Entertainment",
    subcategory: "Movies",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-09-18T19:00:00Z",
    updated_at: "2026-09-18T19:00:00Z",
  },
  {
    id: "tx-5",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-15",
    description: "Groceries & Supermarket",
    amount: 8400,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Groceries",
    ai_confidence: 0.97,
    ai_categorized: true,
    created_at: "2026-09-15T11:00:00Z",
    updated_at: "2026-09-15T11:00:00Z",
  },
  {
    id: "tx-6",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-14",
    description: "Miscellaneous Household Essentials",
    amount: 3329,
    transaction_type: "expense",
    category: "Other",
    subcategory: "Household",
    ai_confidence: 0.91,
    ai_categorized: true,
    created_at: "2026-09-14T14:30:00Z",
    updated_at: "2026-09-14T14:30:00Z",
  },
  {
    id: "tx-7",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-12",
    description: "Apparel & Shoes",
    amount: 2500,
    transaction_type: "expense",
    category: "Shopping",
    subcategory: "Clothing",
    ai_confidence: 0.94,
    ai_categorized: true,
    created_at: "2026-09-12T16:00:00Z",
    updated_at: "2026-09-12T16:00:00Z",
  },
  {
    id: "tx-8",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-10",
    description: "Fuel & Metro Card Recharge",
    amount: 3000,
    transaction_type: "expense",
    category: "Transportation",
    subcategory: "Fuel",
    ai_confidence: 0.96,
    ai_categorized: true,
    created_at: "2026-09-10T08:30:00Z",
    updated_at: "2026-09-10T08:30:00Z",
  },
  {
    id: "tx-9",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-05",
    description: "Apartment Maintenance & Utilities",
    amount: 7000,
    transaction_type: "expense",
    category: "Housing",
    subcategory: "Rent & Maintenance",
    ai_confidence: 0.99,
    ai_categorized: true,
    created_at: "2026-09-05T10:00:00Z",
    updated_at: "2026-09-05T10:00:00Z",
  },
  {
    id: "tx-10",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-09-01",
    description: "Monthly Salary",
    amount: 85000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-09-01T09:00:00Z",
    updated_at: "2026-09-01T09:00:00Z",
  },
  // Aug 2026
  {
    id: "tx-aug-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-08-01",
    description: "Monthly Salary",
    amount: 78000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-08-01T09:00:00Z",
    updated_at: "2026-08-01T09:00:00Z",
  },
  {
    id: "tx-aug-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-08-15",
    description: "August Expenses",
    amount: 27200,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Living",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-08-15T09:00:00Z",
    updated_at: "2026-08-15T09:00:00Z",
  },
  // Jul 2026
  {
    id: "tx-jul-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-07-01",
    description: "Monthly Salary",
    amount: 75000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-07-01T09:00:00Z",
    updated_at: "2026-07-01T09:00:00Z",
  },
  {
    id: "tx-jul-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-07-15",
    description: "July Expenses",
    amount: 26000,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Living",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-07-15T09:00:00Z",
    updated_at: "2026-07-15T09:00:00Z",
  },
  // Jun 2026
  {
    id: "tx-jun-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-06-01",
    description: "Monthly Salary",
    amount: 71000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-06-01T09:00:00Z",
    updated_at: "2026-06-01T09:00:00Z",
  },
  {
    id: "tx-jun-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-06-15",
    description: "June Expenses",
    amount: 24000,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Living",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-06-15T09:00:00Z",
    updated_at: "2026-06-15T09:00:00Z",
  },
  // May 2026
  {
    id: "tx-may-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-05-01",
    description: "Monthly Salary",
    amount: 68000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-05-01T09:00:00Z",
    updated_at: "2026-05-01T09:00:00Z",
  },
  {
    id: "tx-may-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-05-15",
    description: "May Expenses",
    amount: 23500,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Living",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-05-15T09:00:00Z",
    updated_at: "2026-05-15T09:00:00Z",
  },
  // Apr 2026
  {
    id: "tx-apr-1",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-04-01",
    description: "Monthly Salary",
    amount: 62000,
    transaction_type: "income",
    category: "Salary",
    subcategory: "Full-time",
    ai_confidence: 1.0,
    ai_categorized: false,
    created_at: "2026-04-01T09:00:00Z",
    updated_at: "2026-04-01T09:00:00Z",
  },
  {
    id: "tx-apr-2",
    user_id: "demo-jaggan-2026",
    transaction_date: "2026-04-15",
    description: "April Expenses",
    amount: 21000,
    transaction_type: "expense",
    category: "Food",
    subcategory: "Living",
    ai_confidence: 0.95,
    ai_categorized: true,
    created_at: "2026-04-15T09:00:00Z",
    updated_at: "2026-04-15T09:00:00Z",
  },
];

export const DEMO_CLEARED_KEY = "finwise_demo_data_cleared";
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

export const isDemoTransaction = (tx: Transaction): boolean => {
  if (tx.id.startsWith("tx-user-")) return false;
  return (
    tx.user_id === "demo-jaggan-2026" ||
    (tx.id.startsWith("tx-") && !tx.id.startsWith("tx-user-")) ||
    tx.id.startsWith("demo-") ||
    tx.subcategory === "Demo"
  );
};

export function useTransactions() {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const isCleared = typeof window !== "undefined" && localStorage.getItem(DEMO_CLEARED_KEY) === "true";
    const localTxs = getSavedUserTransactions();
    if (isCleared) {
      return localTxs;
    }
    return [...localTxs, ...DEFAULT_DEMO_TRANSACTIONS];
  });
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    try {
      const isCleared = typeof window !== "undefined" && localStorage.getItem(DEMO_CLEARED_KEY) === "true";
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
        // Ignore Supabase connection or RLS errors in local/demo mode
      }

      const seen = new Set<string>();
      const combinedUserTxs: Transaction[] = [];

      for (const t of [...localTxs, ...supabaseTxs]) {
        if (!seen.has(t.id) && !isDemoTransaction(t)) {
          seen.add(t.id);
          combinedUserTxs.push(t);
        }
      }

      if (isCleared) {
        setTransactions(combinedUserTxs);
      } else {
        setTransactions([...combinedUserTxs, ...DEFAULT_DEMO_TRANSACTIONS]);
      }
    } catch {
      const isCleared = typeof window !== "undefined" && localStorage.getItem(DEMO_CLEARED_KEY) === "true";
      const localTxs = getSavedUserTransactions();
      setTransactions(isCleared ? localTxs : [...localTxs, ...DEFAULT_DEMO_TRANSACTIONS]);
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
    if (!id.startsWith("tx-user-") && !id.startsWith("tx-")) {
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
    if (!id.startsWith("tx-user-") && !id.startsWith("tx-")) {
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
    const realIds = ids.filter((id) => !id.startsWith("tx-user-") && !id.startsWith("tx-"));

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

    setTransactions((prev) => {
      const remaining = prev.filter((t) => !idsSet.has(t.id));
      const remainingDemo = remaining.filter(isDemoTransaction);
      if (remainingDemo.length === 0 && typeof window !== "undefined") {
        localStorage.setItem(DEMO_CLEARED_KEY, "true");
      }
      return remaining;
    });

    return true;
  };

  const clearAllDemoData = async (): Promise<boolean> => {
    if (typeof window !== "undefined") {
      localStorage.setItem(DEMO_CLEARED_KEY, "true");
    }

    try {
      await supabase
        .from("transactions")
        .delete()
        .or("user_id.eq.demo-jaggan-2026,subcategory.eq.Demo");
    } catch (err) {
      console.error("Supabase clear demo error:", err);
    }

    setTransactions((prev) => prev.filter((t) => !isDemoTransaction(t)));
    return true;
  };

  const loadDemoData = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(DEMO_CLEARED_KEY);
    }
    const localTxs = getSavedUserTransactions();
    setTransactions([...localTxs, ...DEFAULT_DEMO_TRANSACTIONS]);
  };

  const updateTransactionCategory = (id: string, category: string, subcategory: string | null, confidence: number) => {
    const local = getSavedUserTransactions();
    const updatedLocal = local.map((t) =>
      t.id === id ? { ...t, category, subcategory, ai_confidence: confidence, ai_categorized: true } : t,
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

  const demoTransactions = transactions.filter(isDemoTransaction);
  const hasDemoData = demoTransactions.length > 0;

  return {
    transactions,
    loading,
    error,
    hasDemoData,
    demoTransactions,
    fetchTransactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    deleteMultipleTransactions,
    clearAllDemoData,
    loadDemoData,
    updateTransactionCategory,
  };
}
