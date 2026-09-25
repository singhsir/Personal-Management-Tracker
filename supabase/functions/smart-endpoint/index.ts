import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const CATEGORIES = [
  "Housing",
  "Food",
  "Transportation",
  "Shopping",
  "Utilities",
  "Healthcare",
  "Entertainment",
  "Education",
  "Travel",
  "Subscriptions",
  "Personal Care",
  "Other",
] as const;

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const openrouterKey = Deno.env.get("OPENROUTER_API_KEY");

    // Client with the user's token for RLS-scoped queries
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Service client for updating transactions (bypasses RLS)
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const action = body.action;

    if (action === "categorize") {
      return await handleCategorize(userClient, adminClient, body, openrouterKey);
    } else if (action === "insights") {
      return await handleInsights(userClient, body, openrouterKey);
    } else {
      return new Response(
        JSON.stringify({ error: "Unknown action" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});

async function callOpenRouter(
  openrouterKey: string | undefined,
  systemPrompt: string,
  userPrompt: string,
): Promise<string> {
  if (!openrouterKey) {
    throw new Error("AI service is not configured");
  }

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${openrouterKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.0-flash-001",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`AI service error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("AI service returned empty response");
  }
  return content;
}

async function handleCategorize(
  userClient: ReturnType<typeof createClient>,
  adminClient: ReturnType<typeof createClient>,
  body: { transaction_id?: string; description?: string },
  openrouterKey: string | undefined,
) {
  const { transaction_id, description } = body;
  if (!transaction_id || !description) {
    return new Response(
      JSON.stringify({ error: "transaction_id and description are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const systemPrompt = `You are a financial transaction categorization assistant. Given a transaction description, return a JSON object with exactly two fields:
- "category": one of ${CATEGORIES.join(", ")}
- "subcategory": a short, specific subcategory (1-3 words)

Return ONLY valid JSON, no markdown, no explanation.`;

  const userPrompt = `Categorize this transaction: "${description}"`;

  let category = "Other";
  let subcategory: string | null = null;
  let confidence = 0.5;

  try {
    const content = await callOpenRouter(openrouterKey, systemPrompt, userPrompt);
    const cleaned = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (parsed.category && CATEGORIES.includes(parsed.category)) {
      category = parsed.category;
    }
    if (parsed.subcategory) {
      subcategory = String(parsed.subcategory).substring(0, 100);
    }
    confidence = 0.85;
  } catch (err) {
    console.error("Categorization AI error:", err.message);
    // Fall back to keyword-based categorization
    category = keywordCategorize(description);
    subcategory = null;
    confidence = 0.4;
  }

  // Update the transaction with the category
  const { error: updateError } = await adminClient
    .from("transactions")
    .update({
      category,
      subcategory,
      ai_confidence: confidence,
      ai_categorized: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", transaction_id);

  if (updateError) {
    return new Response(
      JSON.stringify({ error: "Failed to update transaction category" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  return new Response(
    JSON.stringify({
      category,
      subcategory,
      ai_confidence: confidence,
      ai_categorized: true,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
}

function keywordCategorize(description: string): string {
  const desc = description.toLowerCase();
  const rules: Record<string, string[]> = {
    Housing: ["rent", "mortgage", "hoa", "property tax", "home repair"],
    Food: ["dinner", "lunch", "breakfast", "restaurant", "groceries", "grocery", "food", "cafe", "coffee", "barbeque", "pizza", "zomato", "swiggy", "doordash", "uber eats"],
    Transportation: ["uber", "lyft", "gas", "fuel", "petrol", "taxi", "bus", "train", "metro", "parking", "ola", "rapido"],
    Shopping: ["amazon", "flipkart", "mall", "clothes", "shoes", "electronics", "furniture"],
    Utilities: ["electricity", "water", "gas bill", "internet", "phone", "broadband", "wifi", "utility"],
    Healthcare: ["doctor", "pharmacy", "medicine", "hospital", "dental", "health", "clinic"],
    Entertainment: ["movie", "netflix", "spotify", "concert", "game", "theatre", "theater"],
    Education: ["course", "book", "tuition", "school", "college", "udemy", "coursera"],
    Travel: ["flight", "hotel", "vacation", "trip", "airbnb", "booking"],
    Subscriptions: ["subscription", "monthly", "annual", "adobe", "microsoft", "google one"],
    "Personal Care": ["salon", "barber", "gym", "fitness", "spa", "haircut"],
  };

  for (const [cat, keywords] of Object.entries(rules)) {
    if (keywords.some((kw) => desc.includes(kw))) {
      return cat;
    }
  }
  return "Other";
}

async function handleInsights(
  userClient: ReturnType<typeof createClient>,
  body: { start_date?: string; end_date?: string },
  openrouterKey: string | undefined,
) {
  const { start_date, end_date } = body;
  if (!start_date || !end_date) {
    return new Response(
      JSON.stringify({ error: "start_date and end_date are required" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Fetch transactions for the selected period
  const { data: transactions, error: txError } = await userClient
    .from("transactions")
    .select("description, amount, transaction_type, category, subcategory, transaction_date")
    .gte("transaction_date", start_date)
    .lte("transaction_date", end_date)
    .order("transaction_date", { ascending: false });

  if (txError) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch transactions" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  if (!transactions || transactions.length === 0) {
    return new Response(
      JSON.stringify({
        headline: "No transactions in this period",
        summary: "Add some transactions for the selected date range to receive AI insights.",
        observations: [],
        areas_to_review: [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Aggregate data
  const income = transactions
    .filter((t) => t.transaction_type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const expenses = transactions
    .filter((t) => t.transaction_type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const categoryTotals: Record<string, number> = {};
  for (const t of transactions.filter((t) => t.transaction_type === "expense")) {
    const cat = t.category || "Uncategorized";
    categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(t.amount);
  }

  const topCategories = Object.entries(categoryTotals)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 8);

  const savings = income - expenses;
  const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0";

  const systemPrompt = `You are a financial insights assistant. Analyze spending data and provide observations. 
IMPORTANT: Do NOT give financial advice or make judgments. Do NOT use words like "healthy", "unhealthy", "good", "bad", "needs improvement", or "could be improved". 
Use factual, neutral language such as "Your savings rate is 66.4% this period." or "Dining represents 30% of your expenses." 
Use "Consider reviewing...", "Your spending shows...", "You may want to explore..." for areas_to_review.
Return a JSON object with exactly these fields:
- "headline": a short factual observation (1 sentence)
- "summary": a 2-3 sentence factual summary of the period's spending
- "observations": an array of 3-5 bullet-point factual observations (each a string)
- "areas_to_review": an array of 2-4 bullet-point suggestions using non-advisory language (each a string)

Return ONLY valid JSON, no markdown.`;

  const userData = {
    period: `${start_date} to ${end_date}`,
    total_income: income,
    total_expenses: expenses,
    savings,
    savings_rate: `${savingsRate}%`,
    transaction_count: transactions.length,
    top_spending_categories: topCategories.map(([cat, amt]) => ({ category: cat, amount: amt })),
  };

  const userPrompt = `Analyze this spending data and provide insights:\n${JSON.stringify(userData, null, 2)}`;

  try {
    const content = await callOpenRouter(openrouterKey, systemPrompt, userPrompt);
    const cleaned = content.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return new Response(
      JSON.stringify({
        headline: parsed.headline || "Spending analysis complete",
        summary: parsed.summary || "",
        observations: Array.isArray(parsed.observations) ? parsed.observations : [],
        areas_to_review: Array.isArray(parsed.areas_to_review) ? parsed.areas_to_review : [],
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("Insights AI error:", err.message);

    // Generate deterministic insights as fallback
    const fallback = generateFallbackInsights(income, expenses, savings, Number(savingsRate), topCategories);
    return new Response(
      JSON.stringify(fallback),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
}

function generateFallbackInsights(
  income: number,
  expenses: number,
  savings: number,
  savingsRate: number,
  topCategories: [string, number][],
): { headline: string; summary: string; observations: string[]; areas_to_review: string[] } {
  const observations: string[] = [];
  const areasToReview: string[] = [];

  if (topCategories.length > 0) {
    const [topCat, topAmt] = topCategories[0];
    const pct = expenses > 0 ? ((topAmt / expenses) * 100).toFixed(0) : "0";
    observations.push(`${topCat} is your largest spending category at ${pct}% of total expenses.`);
  }

  if (savingsRate > 0) {
    observations.push(`Your savings rate is ${savingsRate.toFixed(1)}% this period.`);
  } else if (savings < 0) {
    observations.push(`Your expenses exceed your income by ${Math.abs(savings).toLocaleString()} this period.`);
  } else {
    observations.push(`Your income and expenses are balanced this period.`);
  }

  if (topCategories.length > 1) {
    observations.push(`Your top 3 categories account for a significant portion of spending.`);
  }

  for (const [cat] of topCategories.slice(0, 2)) {
    areasToReview.push(`Consider reviewing your ${cat} spending.`);
  }

  if (savingsRate < 10) {
    areasToReview.push("You may want to explore your discretionary spending categories.");
  }

  const headline = topCategories.length > 0
    ? `${topCategories[0][0]} leads your spending this period.`
    : "Your spending is spread across multiple categories.";

  const summary = `You spent ${expenses.toLocaleString()} against income of ${income.toLocaleString()}, for a savings rate of ${savingsRate.toFixed(1)}%.`;

  return {
    headline,
    summary,
    observations,
    areas_to_review: areasToReview,
  };
}
