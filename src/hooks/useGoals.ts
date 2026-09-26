import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  target_date: string;
  category: string;
  color?: string;
  created_at: string;
  updated_at?: string;
}

export type NewGoal = Omit<Goal, "id" | "user_id" | "created_at" | "updated_at">;

export const USER_GOALS_KEY = "finwise_user_goals";

export const getSavedUserGoals = (): Goal[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(USER_GOALS_KEY);
    return raw ? (JSON.parse(raw) as Goal[]) : [];
  } catch {
    return [];
  }
};

export const saveUserGoals = (goals: Goal[]) => {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(USER_GOALS_KEY, JSON.stringify(goals));
  } catch (e) {
    console.error("Error saving goals to localStorage:", e);
  }
};

export function useGoals() {
  const [goals, setGoals] = useState<Goal[]>(() => getSavedUserGoals());
  const [loading, setLoading] = useState(false);

  const fetchGoals = useCallback(async () => {
    const local = getSavedUserGoals();

    let supabaseGoals: Goal[] = [];
    try {
      const fetchPromise = supabase.from("goals").select("*").order("target_date", { ascending: true });
      const timeoutPromise = new Promise<{ data: null; error: Error }>((resolve) =>
        setTimeout(() => resolve({ data: null, error: new Error("Timeout") }), 2500),
      );

      const res = await Promise.race([fetchPromise, timeoutPromise]);
      if (res && "data" in res && res.data) {
        supabaseGoals = res.data as Goal[];
      }
    } catch {
      // Fallback to local storage
    }

    const map = new Map<string, Goal>();
    for (const g of [...supabaseGoals, ...local]) {
      map.set(g.id, g);
    }

    const merged = Array.from(map.values()).sort((a, b) => a.target_date.localeCompare(b.target_date));
    setGoals(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const addGoal = async (newGoal: NewGoal): Promise<Goal> => {
    let savedGoal: Goal | null = null;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const currentUserId = sessionData.session?.user?.id;

      if (currentUserId) {
        const { data, error: err } = await supabase
          .from("goals")
          .insert({
            ...newGoal,
            user_id: currentUserId,
          })
          .select()
          .single();

        if (!err && data) {
          savedGoal = data as Goal;
        }
      }
    } catch {
      // Fallback
    }

    if (!savedGoal) {
      savedGoal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        user_id: "local-user",
        name: newGoal.name,
        target_amount: Number(newGoal.target_amount),
        current_amount: Number(newGoal.current_amount) || 0,
        target_date: newGoal.target_date,
        category: newGoal.category,
        color: newGoal.color,
        created_at: new Date().toISOString(),
      };
    }

    const local = getSavedUserGoals();
    const updated = [savedGoal, ...local];
    saveUserGoals(updated);
    setGoals(updated);

    return savedGoal;
  };

  const updateGoal = async (id: string, updates: Partial<NewGoal>): Promise<boolean> => {
    if (!id.startsWith("goal-")) {
      try {
        await supabase.from("goals").update(updates).eq("id", id);
      } catch (err) {
        console.error("Supabase update goal error:", err);
      }
    }

    const local = getSavedUserGoals();
    const updated = local.map((g) => (g.id === id ? { ...g, ...updates, updated_at: new Date().toISOString() } : g));
    saveUserGoals(updated);
    setGoals(updated);

    return true;
  };

  const addContribution = async (id: string, amount: number): Promise<boolean> => {
    const goal = goals.find((g) => g.id === id);
    if (!goal) return false;

    const newAmount = Math.max(0, Number(goal.current_amount) + Number(amount));
    return updateGoal(id, { current_amount: newAmount });
  };

  const deleteGoal = async (id: string): Promise<boolean> => {
    if (!id.startsWith("goal-")) {
      try {
        await supabase.from("goals").delete().eq("id", id);
      } catch (err) {
        console.error("Supabase delete goal error:", err);
      }
    }

    const local = getSavedUserGoals();
    const updated = local.filter((g) => g.id !== id);
    saveUserGoals(updated);
    setGoals(updated);

    return true;
  };

  return {
    goals,
    loading,
    addGoal,
    updateGoal,
    addContribution,
    deleteGoal,
    fetchGoals,
  };
}
