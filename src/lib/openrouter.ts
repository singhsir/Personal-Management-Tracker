declare const __OPENROUTER_API_KEY__: string | undefined;

export const OPENROUTER_KEY_STORAGE = "finwise_openrouter_api_key";
export const OPENROUTER_MODEL_STORAGE = "finwise_openrouter_model";

export const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.5-flash";

export const POPULAR_MODELS = [
  { id: "google/gemini-2.5-flash", name: "Google Gemini 2.5 Flash (Fast & Reliable)" },
  { id: "openai/gpt-4o-mini", name: "OpenAI GPT-4o Mini (High Accuracy)" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3 (Advanced Reasoning)" },
  { id: "openrouter/auto", name: "OpenRouter Auto (Automatic Provider Routing)" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Meta Llama 3.3 70B" },
];

export function sanitizeKey(rawKey?: string | null): string {
  if (!rawKey || typeof rawKey !== "string") return "";
  let k = rawKey.trim();
  while ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
    k = k.slice(1, -1).trim();
  }
  if (k.toLowerCase().startsWith("bearer ")) {
    k = k.substring(7).trim();
  }
  if (k === "undefined" || k === "null" || k === "[object Object]") {
    return "";
  }
  if (k.length < 8) {
    return "";
  }
  return k;
}

export function getOpenRouterKey(): string {
  if (typeof window === "undefined") return "";

  // 1. Check local storage (user custom key)
  try {
    const stored = sanitizeKey(localStorage.getItem(OPENROUTER_KEY_STORAGE));
    if (stored) return stored;
  } catch {
    // Ignore
  }

  // 2. Check bundled build-time key from Vercel or .env
  try {
    if (typeof __OPENROUTER_API_KEY__ !== "undefined") {
      const buildKey = sanitizeKey(__OPENROUTER_API_KEY__);
      if (buildKey) return buildKey;
    }
  } catch {
    // Ignore
  }

  // 3. Check standard import.meta.env
  try {
    const envKey = sanitizeKey(import.meta.env.VITE_OPENROUTER_API_KEY);
    if (envKey) return envKey;
  } catch {
    // Ignore
  }

  return "";
}

export function hasOpenRouterKey(): boolean {
  // Always true because backend handles it automatically for all users!
  return true;
}

export function isPersonalKeyConfigured(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return !!sanitizeKey(localStorage.getItem(OPENROUTER_KEY_STORAGE));
  } catch {
    return false;
  }
}

export function saveOpenRouterKey(key: string): void {
  if (typeof window === "undefined") return;
  const clean = sanitizeKey(key);
  if (!clean) {
    localStorage.removeItem(OPENROUTER_KEY_STORAGE);
  } else {
    localStorage.setItem(OPENROUTER_KEY_STORAGE, clean);
  }
}

export function getOpenRouterModel(): string {
  if (typeof window === "undefined") return DEFAULT_OPENROUTER_MODEL;
  try {
    const stored = localStorage.getItem(OPENROUTER_MODEL_STORAGE);
    if (!stored || stored === "google/gemini-2.0-flash-001" || stored.includes("gemini-2.0-flash")) {
      localStorage.setItem(OPENROUTER_MODEL_STORAGE, DEFAULT_OPENROUTER_MODEL);
      return DEFAULT_OPENROUTER_MODEL;
    }
    return stored;
  } catch {
    return DEFAULT_OPENROUTER_MODEL;
  }
}

export function saveOpenRouterModel(model: string): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(OPENROUTER_MODEL_STORAGE, model);
  } catch {
    // Ignore
  }
}

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface FinancialContext {
  userName?: string;
  currency?: string;
  totalIncome: number;
  totalExpenses: number;
  savings: number;
  savingsRate: number;
  topCategories?: { category: string; amount: number }[];
  budgets?: { category: string; target: number; spent: number }[];
  goals?: { name: string; target: number; saved: number; date: string }[];
}

export async function testOpenRouterKey(key: string): Promise<{ success: boolean; message: string }> {
  const cleanKey = sanitizeKey(key);
  if (!cleanKey) {
    return { success: false, message: "Please enter a valid OpenRouter API key (e.g. sk-or-v1-...)." };
  }

  const modelsToTry = [
    getOpenRouterModel(),
    "google/gemini-2.5-flash",
    "openai/gpt-4o-mini",
    "openrouter/auto",
  ];

  let lastError = "Unable to connect to OpenRouter.";

  for (const model of modelsToTry) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${cleanKey}`,
          "HTTP-Referer": window.location.origin,
          "X-Title": "FinWise AI Finance Tracker",
        },
        body: JSON.stringify({
          model,
          messages: [{ role: "user", content: "Reply with the single word: Connected" }],
          max_tokens: 15,
        }),
      });

      if (response.ok) {
        saveOpenRouterModel(model);
        saveOpenRouterKey(cleanKey);
        return {
          success: true,
          message: `Connected successfully with ${model.split("/")[1]}!`,
        };
      }

      const errData = await response.json().catch(() => ({}));
      lastError = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      if (response.status === 401 || lastError.toLowerCase().includes("auth") || lastError.toLowerCase().includes("key")) {
        return { success: false, message: "Invalid API key. Please check your OpenRouter key and try again." };
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : "Network error";
    }
  }

  return { success: false, message: lastError };
}

export async function askAIMoneyCompanion(
  userQuery: string,
  history: ChatMessage[],
  context: FinancialContext,
): Promise<string> {
  const rawKey = getOpenRouterKey();
  const clientKey = sanitizeKey(rawKey);

  // 1. First, call the backend /api/companion endpoint
  // This automatically uses the backend OpenRouter key for all users!
  try {
    const res = await fetch("/api/companion", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(clientKey ? { Authorization: `Bearer ${clientKey}` } : {}),
      },
      body: JSON.stringify({
        message: userQuery,
        history,
        context,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.reply) {
        return data.reply;
      }
    }
  } catch {
    // If backend request fails (offline dev or static mode), proceed to direct client fallback
  }

  // 2. Direct client-side call if user configured a personal key
  if (clientKey) {
    const primaryModel = getOpenRouterModel();
    const curr = context.currency || "INR";

    const systemPrompt = `You are Ananya, a friendly, smart, and knowledgeable Indian financial companion in FinWise AI.
You are helping ${context.userName || "the user"} manage their money wisely.
Tone: Warm, encouraging, polite, and practical. Greet the user with "Namaste" when appropriate.
Give clear, actionable money tips referencing their real financial figures.

Here is the user's real financial snapshot:
- Currency: ${curr}
- Total Income: ${curr} ${context.totalIncome.toLocaleString()}
- Total Expenses: ${curr} ${context.totalExpenses.toLocaleString()}
- Net Savings: ${curr} ${context.savings.toLocaleString()} (Savings Rate: ${context.savingsRate.toFixed(1)}%)
${
  context.topCategories && context.topCategories.length > 0
    ? `- Top Spending Categories: ${context.topCategories.map((c) => `${c.category} (${curr} ${c.amount.toLocaleString()})`).join(", ")}`
    : "- No expense categories recorded yet."
}
${
  context.budgets && context.budgets.length > 0
    ? `- Active Budgets: ${context.budgets.map((b) => `${b.category} (Spent: ${curr} ${b.spent.toLocaleString()} / Limit: ${curr} ${b.target.toLocaleString()})`).join("; ")}`
    : "- No monthly budgets set yet."
}
${
  context.goals && context.goals.length > 0
    ? `- Financial Goals: ${context.goals.map((g) => `${g.name} (Saved: ${curr} ${g.saved.toLocaleString()} of ${curr} ${g.target.toLocaleString()}, Target Date: ${g.date})`).join("; ")}`
    : "- No savings goals set yet."
}

GUIDELINES:
1. Provide actionable, concise, motivating, and specific financial advice.
2. Use bullet points and bold formatting for numbers and key takeaways.
3. Reference their actual data above where relevant.
4. Keep responses well-structured and under 180 words.`;

    const messagesPayload: ChatMessage[] = [
      { role: "system", content: systemPrompt },
      ...history.slice(-6),
      { role: "user", content: userQuery },
    ];

    const candidateModels = Array.from(
      new Set([primaryModel, "google/gemini-2.5-flash", "openai/gpt-4o-mini", "openrouter/auto"])
    );

    for (const model of candidateModels) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${clientKey}`,
            "HTTP-Referer": window.location.origin,
            "X-Title": "FinWise AI Finance Tracker",
          },
          body: JSON.stringify({
            model,
            messages: messagesPayload,
            max_tokens: 600,
            temperature: 0.7,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content;
          if (reply) {
            return reply;
          }
        }
      } catch {
        // Fall back
      }
    }
  }

  // 3. Smart local advisor fallback so the assistant always answers
  return generateClientFallbackReply(userQuery, context);
}

function generateClientFallbackReply(query: string, ctx: FinancialContext): string {
  const q = query.toLowerCase();
  const curr = ctx.currency || "INR";
  const income = Number(ctx.totalIncome || 0);
  const expenses = Number(ctx.totalExpenses || 0);
  const savings = Number(ctx.savings || 0);
  const rate = Number(ctx.savingsRate || 0);
  const topCats = ctx.topCategories || [];

  if (q.includes("saving") || q.includes("boost") || q.includes("rate")) {
    if (income === 0) {
      return `To boost your savings rate, start by recording your monthly income and recurring expenses in the **Transactions** tab. Aim for the **50/30/20 rule**: 50% for essentials, 30% for lifestyle, and **20% directly into savings**!`;
    }
    return `Here is how you can boost your savings rate from your current **${rate.toFixed(1)}%**:

• **Automate Payday Savings**: Direct at least 15%–20% of your **${curr} ${income.toLocaleString()}** income into investments immediately on payday.
• **Trim Top Outflows**: ${
      topCats.length > 0
        ? `Your highest expense category is **${topCats[0].category}** (${curr} ${topCats[0].amount.toLocaleString()}). A 10% reduction unlocks **${curr} ${Math.round(topCats[0].amount * 0.1).toLocaleString()}** in extra monthly savings!`
        : `Monitor non-essential discretionary expenses to stop daily micro-leaks.`
    }
• **Set Strict Category Caps**: Head to the **Budgets** tab to set hard spending limits for dining and retail.`;
  }

  if (q.includes("category") || q.includes("expense") || q.includes("spending")) {
    if (topCats.length === 0) {
      return `No expense categories recorded yet for this period. Add expenses in the Transactions page to see an exact breakdown!`;
    }
    const catList = topCats
      .slice(0, 3)
      .map((c) => `• **${c.category}**: ${curr} ${c.amount.toLocaleString()} (${expenses > 0 ? ((c.amount / expenses) * 100).toFixed(1) : 0}%)`)
      .join("\n");

    return `Here is your spending breakdown for this month:

${catList}

**Advice**: Focus on optimizing **${topCats[0].category}** first for maximum impact on your monthly balance.`;
  }

  if (q.includes("goal")) {
    const goals = ctx.goals || [];
    if (goals.length === 0) {
      return `You haven't added any savings goals yet. Go to the **Goals** tab to set targets for an emergency fund, travel, or vehicle!`;
    }
    const g = goals[0];
    const pct = g.target > 0 ? ((g.saved / g.target) * 100).toFixed(0) : "0";
    return `You're tracking **${goals.length} active goal(s)**! For **${g.name}**, you have saved **${curr} ${g.saved.toLocaleString()}** of **${curr} ${g.target.toLocaleString()}** (${pct}% achieved). Allocating part of your net monthly savings of **${curr} ${savings.toLocaleString()}** will keep you ahead of your timeline!`;
  }

  if (q.includes("budget") || q.includes("tip")) {
    return `**Golden Budget Rule**:
1. **50% Needs**: Essential rent, utilities, groceries.
2. **30% Wants**: Dining, subscriptions, hobbies.
3. **20% Savings**: Emergency fund & investments.

With your current net savings of **${curr} ${savings.toLocaleString()}**, you have a solid foundation!`;
  }

  return `Namaste ${ctx.userName || "friend"}! I'm Ananya, your FinWise AI companion:
• **Total Income**: ${curr} ${income.toLocaleString()}
• **Total Expenses**: ${curr} ${expenses.toLocaleString()}
• **Net Savings**: ${curr} ${savings.toLocaleString()} (${rate.toFixed(1)}% savings rate)

Ask me anything about boosting your savings, budgeting rules, or achieving your financial targets! ✨`;
}
