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

  // 1. Check local storage
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
    // Auto-upgrade from outdated or unavailable model IDs
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
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content?.trim() || "Connected";
        saveOpenRouterModel(model);
        saveOpenRouterKey(cleanKey);
        return {
          success: true,
          message: `Connected successfully with ${model.split("/")[1]}!`,
        };
      }

      const errData = await response.json().catch(() => ({}));
      lastError = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;

      // If it's an authentication error, don't keep trying models
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
  const key = sanitizeKey(rawKey);

  if (!key) {
    throw new Error("Missing OpenRouter API key. Please click 'Set Key' above to paste your OpenRouter key.");
  }

  const primaryModel = getOpenRouterModel();
  const curr = context.currency || "INR";

  const systemPrompt = `You are FinWise AI Money Companion, a friendly, ultra-knowledgeable personal financial advisor.
You are helping ${context.userName || "the user"} manage their money wisely.

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
4. Keep responses well-structured and under 180 words unless the user asks for deep analysis.
5. Maintain an encouraging, positive tone.`;

  const messagesPayload: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: userQuery },
  ];

  const candidateModels = Array.from(
    new Set([
      primaryModel,
      "google/gemini-2.5-flash",
      "openai/gpt-4o-mini",
      "deepseek/deepseek-chat",
      "openrouter/auto",
    ]),
  );

  let lastError = "Failed to communicate with AI provider.";

  for (const model of candidateModels) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`,
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
          if (model !== primaryModel) {
            saveOpenRouterModel(model);
          }
          return reply;
        }
      }

      const errData = await response.json().catch(() => ({}));
      const msg = errData.error?.message || `HTTP ${response.status}`;
      lastError = msg;

      // Handle auth header issues directly
      if (response.status === 401 || msg.toLowerCase().includes("auth") || msg.toLowerCase().includes("key")) {
        throw new Error("Invalid or missing OpenRouter API key. Please click 'Set Key' above to update your key.");
      }

      // If it's not a model endpoint issue, don't loop endlessly
      if (!msg.toLowerCase().includes("no endpoints") && !msg.toLowerCase().includes("not found")) {
        throw new Error(msg);
      }
    } catch (err: any) {
      if (err.message && (err.message.includes("API key") || !err.message.toLowerCase().includes("no endpoints"))) {
        throw err;
      }
      lastError = err.message || lastError;
    }
  }

  throw new Error(lastError);
}
