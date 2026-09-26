// Vercel Serverless Function: /api/insights
// Generates AI Financial Insights for all users via backend OpenRouter key or intelligent financial analyzer

export default async function handler(req: any, res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
    const { startDate, endDate, context = {}, transactions = [] } = body;

    const authHeader = req.headers["authorization"] || req.headers["Authorization"];
    let clientKey = "";
    if (authHeader && typeof authHeader === "string") {
      let k = authHeader.replace(/^Bearer\s+/i, "").trim();
      while ((k.startsWith('"') && k.endsWith('"')) || (k.startsWith("'") && k.endsWith("'"))) {
        k = k.slice(1, -1).trim();
      }
      if (k && k !== "undefined" && k !== "null" && k.length > 8) {
        clientKey = k;
      }
    }

    const serverKey = (
      process.env.OPENROUTER_API_KEY ||
      process.env.VITE_OPENROUTER_API_KEY ||
      ""
    ).trim();

    const apiKey = clientKey || serverKey;
    const curr = context.currency || "INR";

    // 1. Try OpenRouter AI LLM if key is present
    if (apiKey) {
      const prompt = `You are a professional financial planner. Analyze this user's monthly spending data:
- Date Range: ${startDate} to ${endDate}
- Currency: ${curr}
- Total Income: ${curr} ${(context.totalIncome || 0).toLocaleString()}
- Total Expenses: ${curr} ${(context.totalExpenses || 0).toLocaleString()}
- Net Savings: ${curr} ${(context.savings || 0).toLocaleString()} (Savings Rate: ${(context.savingsRate || 0).toFixed(1)}%)
- Top Categories: ${JSON.stringify(context.topCategories || [])}
- Active Budgets: ${JSON.stringify(context.budgets || [])}
- Recent Transactions Sample: ${JSON.stringify((transactions || []).slice(0, 15).map((t: any) => ({ desc: t.description, amt: t.amount, type: t.transaction_type, cat: t.category })))}

Respond with a JSON object matching this exact schema:
{
  "headline": "A short, engaging 1-sentence headline capturing their financial month",
  "summary": "2-3 sentences summarizing their income vs spending and overall health",
  "observations": [
    "Specific observation 1 about top spending or trends",
    "Specific observation 2 about cashflow or savings rate",
    "Specific observation 3 about budget adherence"
  ],
  "areas_to_review": [
    "Actionable recommendation 1 for saving money or optimizing expenses",
    "Actionable recommendation 2 for goals or budgets"
  ]
}
Return ONLY valid JSON. No markdown ticks, no preamble.`;

      const candidateModels = [
        "google/gemini-2.5-flash",
        "openai/gpt-4o-mini",
        "openrouter/auto",
      ];

      for (const model of candidateModels) {
        try {
          const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${apiKey}`,
              "HTTP-Referer": "https://personal-management-tracker.vercel.app",
              "X-Title": "FinWise AI Finance Tracker",
            },
            body: JSON.stringify({
              model,
              messages: [{ role: "user", content: prompt }],
              temperature: 0.4,
              max_tokens: 600,
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const text = data.choices?.[0]?.message?.content?.trim() || "";
            const jsonText = text.replace(/^```json/i, "").replace(/^```/i, "").replace(/```$/, "").trim();
            const parsed = JSON.parse(jsonText);
            if (parsed.headline && parsed.summary) {
              return res.status(200).json(parsed);
            }
          }
        } catch {
          // Fall back to next model
        }
      }
    }

    // 2. High-quality algorithmic financial intelligence analyzer
    const computedInsight = analyzeFinancialData(context, transactions, curr);
    return res.status(200).json(computedInsight);
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to generate financial insights.",
    });
  }
}

function analyzeFinancialData(ctx: any, txs: any[], curr: string) {
  const income = Number(ctx.totalIncome || 0);
  const expenses = Number(ctx.totalExpenses || 0);
  const savings = Number(ctx.savings || 0);
  const savingsRate = Number(ctx.savingsRate || 0);
  const topCats: Array<{ category: string; amount: number }> = ctx.topCategories || [];

  if (income === 0 && expenses === 0) {
    return {
      headline: "Welcome to AI Financial Insights",
      summary: "You haven't recorded any income or expenses for this period yet. Add your transactions to unlock AI-powered observations.",
      observations: [
        "Your financial tracking is set to INR by default.",
        "Add recurring income in the Transactions page to establish baseline cashflow.",
        "Categorize expenses to identify spending patterns automatically."
      ],
      areas_to_review: [
        "Record this month's primary income and recurring bills.",
        "Create target spending limits in the Budgets section."
      ]
    };
  }

  let headline = "";
  if (savingsRate >= 50) {
    headline = "Phenomenal savings discipline! You're saving over half your earnings.";
  } else if (savingsRate >= 20) {
    headline = "Strong financial health with a healthy savings rate above the 20% benchmark.";
  } else if (savingsRate > 0) {
    headline = "Positive cashflow maintained, with opportunities to boost monthly savings.";
  } else {
    headline = "Expenses currently outpace income — time to tighten non-essential outflows.";
  }

  const summary = `You earned ${curr} ${income.toLocaleString()} and spent ${curr} ${expenses.toLocaleString()} this period, achieving a net savings of ${curr} ${savings.toLocaleString()} (${savingsRate.toFixed(1)}% savings rate).`;

  const observations: string[] = [];
  if (topCats.length > 0) {
    const top = topCats[0];
    const topPct = expenses > 0 ? ((top.amount / expenses) * 100).toFixed(1) : "0";
    observations.push(
      `Your largest spending driver is ${top.category}, totaling ${curr} ${top.amount.toLocaleString()} (${topPct}% of all expenses).`
    );
  }

  if (topCats.length > 1) {
    const second = topCats[1];
    observations.push(
      `Secondary spending goes to ${second.category} (${curr} ${second.amount.toLocaleString()}).`
    );
  }

  observations.push(
    savingsRate >= 20
      ? `Your savings rate of ${savingsRate.toFixed(1)}% exceeds the recommended 20% personal finance benchmark.`
      : `Your savings rate is ${savingsRate.toFixed(1)}%. Increasing this towards the 20% target will accelerate financial stability.`
  );

  const areasToReview: string[] = [];
  if (topCats.length > 0) {
    const top = topCats[0];
    areasToReview.push(
      `Evaluate ${top.category} for potential optimization. Even a 5-10% trim saves ${curr} ${Math.round(top.amount * 0.08).toLocaleString()} monthly.`
    );
  }

  areasToReview.push(
    "Check your active category limits in the Budgets tab to prevent end-of-month overspending."
  );

  return {
    headline,
    summary,
    observations,
    areas_to_review: areasToReview,
  };
}
