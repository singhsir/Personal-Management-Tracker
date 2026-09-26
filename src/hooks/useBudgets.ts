import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import type { Budget, NewBudget } from "@/lib/types";

export const USER_BUDGETS_KEY = "finwise_user_budgets";

export const getSavedUserBudgets = (): Budget[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_BUDGETS_KEY);
    return raw ? (JSON.parse(raw) as Budget[]) : [];
  } catch {
    return [];
  }
};

export const saveUserBudgets = (budgets: Budget[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_BUDGETS_KEY, JSON.stringify(budgets));
  } catch (e) {
    console.error("Error saving budgets to localStorage:", e);
  }
};

export function useBudgets(targetMonth?: string) {
  const [budgets, setBudgets] = useState<Budget[]>(() => {
    const local = getSavedUserBudgets();
    if (!targetMonth) return local;
    return local.filter((b) => b.month === targetMonth);
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBudgets = useCallback(async () => {
    const local = getSavedUserBudgets().filter((b) => !targetMonth || b.month === targetMonth);

    let supabaseBudgets: Budget[] = [];
    try {
      let query = supabase.from("budgets").select("*");
      if (targetMonth) query = query.eq("month", targetMonth);
      
      const fetchPromise = query.order("category", { ascending: true });
      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 2500),
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && "data" in res && res.data) {
        supabaseBudgets = res.data as Budget[];
      }
    } catch {
      // Fallback to local
    }

    const map = new Map<string, Budget>();
    for (const b of [...supabaseBudgets, ...local]) {
      map.set(`${b.category}-${b.month}`, b);
    }

    const merged = Array.from(map.values()).sort((a, b) => a.category.localeCompare(b.category));
    setBudgets(merged);
    setLoading(false);
  }, [targetMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const addBudget = async (newBudget: NewBudget): Promise<Budget | null> => {
    setError(null);
    let savedBudget: Budget | null = null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;

      if (currentUserId) {
        const { data, error: err } = await supabase
          .from("budgets")
          .upsert(
            {
              category: newBudget.category,
              month: newBudget.month,
              amount: newBudget.amount,
              user_id: currentUserId,
            },
            { onConflict: "user_id,category,month" },
          )
          .select()
          .single();

        if (!err && data) {
          savedBudget = data as Budget;
        }
      }
    } catch {
      // Fall back to local storage
    }

    if (!savedBudget) {
      savedBudget = {
        id: `budget-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: "local-user",
        category: newBudget.category,
        month: newBudget.month,
        amount: Number(newBudget.amount),
        created_at: new Date().toISOString(),
      };
    }

    const local = getSavedUserBudgets();
    const updated = [
      savedBudget,
      ...local.filter((b) => !(b.category === newBudget.category && b.month === newBudget.month)),
    ];
    saveUserBudgets(updated);

    setBudgets((prev) => {
      const filtered = prev.filter((b) => b.category !== newBudget.category);
      return [...filtered, savedBudget!].sort((a, b) => a.category.localeCompare(b.category));
    });

    return savedBudget;
  };

  const updateBudget = async (id: string, updates: Partial<NewBudget>): Promise<boolean> => {
    if (!id.startsWith("budget-")) {
      try {
        await supabase.from("budgets").update(updates).eq("id", id);
      } catch (err) {
        console.error("Error updating in Supabase:", err);
      }
    }

    const local = getSavedUserBudgets();
    const updated = local.map((b) => (b.id === id ? { ...b, ...updates } : b));
    saveUserBudgets(updated);

    setBudgets((prev) => prev.map((b) => (b.id === id ? { ...b, ...updates } : b)));
    return true;
  };

  const deleteBudget = async (id: string): Promise<boolean> => {
    if (!id.startsWith("budget-")) {
      try {
        await supabase.from("budgets").delete().eq("id", id);
      } catch (err) {
        console.error("Error deleting from supabase:", err);
      }
    }

    const local = getSavedUserBudgets();
    const updated = local.filter((b) => b.id !== id);
    saveUserBudgets(updated);

    setBudgets((prev) => prev.filter((b) => b.id !== id));
    return true;
  };

  return {
    budgets,
    loading,
    error,
    addBudget,
    updateBudget,
    deleteBudget,
    fetchBudgets,
  };
}
