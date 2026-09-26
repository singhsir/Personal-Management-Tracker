export const OPENROUTER_KEY_STORAGE = "finwise_openrouter_api_key";
export const OPENROUTER_MODEL_STORAGE = "finwise_openrouter_model";

export const DEFAULT_OPENROUTER_MODEL = "google/gemini-2.0-flash-001";

export const POPULAR_MODELS = [
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash (Fast & Smart)" },
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini (OpenAI)" },
  { id: "anthropic/claude-3.5-haiku", name: "Claude 3.5 Haiku (Anthropic)" },
  { id: "meta-llama/llama-3.3-70b-instruct", name: "Llama 3.3 70B (Meta)" },
  { id: "deepseek/deepseek-chat", name: "DeepSeek V3" },
];

export function getOpenRouterKey(): string {
  if (typeof window === "undefined") return "";
  const stored = localStorage.getItem(OPENROUTER_KEY_STORAGE);
  if (stored && stored.trim()) return stored.trim();
  const envKey = import.meta.env.VITE_OPENROUTER_API_KEY;
  if (envKey && envKey.trim()) return envKey.trim();
  return "";
}

export function saveOpenRouterKey(key: string): void {
  if (typeof window === "undefined") return;
  if (!key.trim()) {
    localStorage.removeItem(OPENROUTER_KEY_STORAGE);
  } else {
    localStorage.setItem(OPENROUTER_KEY_STORAGE, key.trim());
  }
}

export function getOpenRouterModel(): string {
  if (typeof window === "undefined") return DEFAULT_OPENROUTER_MODEL;
  return localStorage.getItem(OPENROUTER_MODEL_STORAGE) || DEFAULT_OPENROUTER_MODEL;
}

export function saveOpenRouterModel(model: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(OPENROUTER_MODEL_STORAGE, model);
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
  const cleanKey = key.trim();
  if (!cleanKey) {
    return { success: false, message: "Please provide an API key." };
  }

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
        model: getOpenRouterModel(),
        messages: [{ role: "user", content: "Reply with the single word: Connected" }],
        max_tokens: 10,
      }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      const errMsg = errData.error?.message || `HTTP ${response.status}: ${response.statusText}`;
      return { success: false, message: errMsg };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || "Connected";
    return { success: true, message: `Key verified successfully! Model replied: "${reply}"` };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : "Network error verifying key.",
    };
  }
}

export async function askAIMoneyCompanion(
  userQuery: string,
  history: ChatMessage[],
  context: FinancialContext,
): Promise<string> {
  const key = getOpenRouterKey();
  if (!key) {
    throw new Error("No OpenRouter API key configured. Please enter your OpenRouter key in Settings or click Configure Key.");
  }

  const model = getOpenRouterModel();
  const curr = context.currency || "INR";

  const systemPrompt = `You are FinWise AI Money Companion, a friendly, ultra-knowledgeable, and encouraging personal financial advisor.
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
5. Maintain a supportive, empathetic tone.`;

  const messagesPayload: ChatMessage[] = [
    { role: "system", content: systemPrompt },
    ...history.slice(-6),
    { role: "user", content: userQuery },
  ];

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

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error?.message || `OpenRouter API error (${response.status})`);
  }

  const data = await response.json();
  const reply = data.choices?.[0]?.message?.content;
  if (!reply) {
    throw new Error("No response received from AI model.");
  }

  return reply;
}
