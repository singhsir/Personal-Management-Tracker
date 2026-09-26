// Vercel Serverless Function: /api/companion
// Handles AI Money Companion chat for all users via backend OpenRouter key

export default async function handler(req: any, res: any) {
  // CORS headers
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
    const { message, history = [], context = {} } = body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required." });
    }

    // Determine API Key:
    // 1. Client custom key (from Authorization header if user provided one)
    // 2. Server OPENROUTER_API_KEY / VITE_OPENROUTER_API_KEY
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
    const userName = context.userName || "User";

    // If an API key is available, call OpenRouter
    if (apiKey) {
      const systemPrompt = `You are FinWise AI Money Companion, a friendly, ultra-knowledgeable personal financial advisor.
You are helping ${userName} manage their money wisely.

Here is the user's real financial snapshot:
- Currency: ${curr}
- Total Income: ${curr} ${(context.totalIncome || 0).toLocaleString()}
- Total Expenses: ${curr} ${(context.totalExpenses || 0).toLocaleString()}
- Net Savings: ${curr} ${(context.savings || 0).toLocaleString()} (Savings Rate: ${(context.savingsRate || 0).toFixed(1)}%)
${
  context.topCategories && context.topCategories.length > 0
    ? `- Top Spending Categories: ${context.topCategories.map((c: any) => `${c.category} (${curr} ${(c.amount || 0).toLocaleString()})`).join(", ")}`
    : "- No expense categories recorded yet."
}
${
  context.budgets && context.budgets.length > 0
    ? `- Active Budgets: ${context.budgets.map((b: any) => `${b.category} (Spent: ${curr} ${(b.spent || 0).toLocaleString()} / Limit: ${curr} ${(b.target || 0).toLocaleString()})`).join("; ")}`
    : "- No monthly budgets set yet."
}
${
  context.goals && context.goals.length > 0
    ? `- Financial Goals: ${context.goals.map((g: any) => `${g.name} (Saved: ${curr} ${(g.saved || 0).toLocaleString()} of ${curr} ${(g.target || 0).toLocaleString()}, Target Date: ${g.date})`).join("; ")}`
    : "- No savings goals set yet."
}

GUIDELINES:
1. Provide actionable, concise, motivating, and specific financial advice.
2. Use bullet points and bold formatting for numbers and key takeaways.
3. Reference their actual data above where relevant.
4. Keep responses well-structured and under 180 words unless the user asks for deep analysis.
5. Maintain an encouraging, positive tone.`;

      const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-6),
        { role: "user", content: message },
      ];

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
              messages,
              max_tokens: 600,
              temperature: 0.7,
            }),
          });

          if (aiRes.ok) {
            const data = await aiRes.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              return res.status(200).json({ reply, model });
            }
          }
        } catch {
          // Try next fallback model
        }
      }
    }

    // Smart fallback if OpenRouter is unreachable or key is not configured on server
    const fallbackReply = generateSmartFallbackReply(message, context);
    return res.status(200).json({
      reply: fallbackReply,
      model: "finwise-smart-agent",
    });
  } catch (error: any) {
    return res.status(500).json({
      error: error.message || "Failed to process AI companion inquiry.",
    });
  }
}

function generateSmartFallbackReply(query: string, ctx: any): string {
  const q = query.toLowerCase();
  const curr = ctx.currency || "INR";
  const income = Number(ctx.totalIncome || 0);
  const expenses = Number(ctx.totalExpenses || 0);
  const savings = Number(ctx.savings || 0);
  const rate = Number(ctx.savingsRate || 0);
  const topCats = ctx.topCategories || [];

  if (q.includes("saving") || q.includes("boost") || q.includes("rate")) {
    if (income === 0) {
      return `To boost your savings rate, start by recording your monthly income and recurring expenses in the **Transactions** tab. A healthy benchmark to aim for is the **50/30/20 rule**: 50% for needs, 30% for wants, and **20% for savings & debt freedom**!`;
    }
    return `Here is how you can boost your savings rate from your current **${rate.toFixed(1)}%**:

• **Automate Payday Savings**: Transfer at least 10%–20% of your **${curr} ${income.toLocaleString()}** income into a separate high-yield account immediately on payday.
• **Trim Top Outflows**: ${
      topCats.length > 0
        ? `Your highest expense category is **${topCats[0].category}** (${curr} ${topCats[0].amount.toLocaleString()}). Reducing this by just 10% will unlock **${curr} ${Math.round(topCats[0].amount * 0.1).toLocaleString()}** in extra monthly savings!`
        : `Track variable spending like dining out and impulse subscriptions to curb micro-leaks.`
    }
• **Set Category Limits**: Set strict limits in the **Budgets** tab to keep discretionary spending under control.`;
  }

  if (q.includes("category") || q.includes("expense") || q.includes("spending")) {
    if (topCats.length === 0) {
      return `You haven't logged any expense categories yet for this period. Add transactions to see a clear breakdown of where your money goes!`;
    }
    const catList = topCats
      .slice(0, 3)
      .map((c: any) => `• **${c.category}**: ${curr} ${c.amount.toLocaleString()} (${expenses > 0 ? ((c.amount / expenses) * 100).toFixed(1) : 0}%)`)
      .join("\n");

    return `Here is your spending breakdown for this month:

${catList}

**Key takeaway**: Focus on optimizing your largest spending category (**${topCats[0].category}**) first for the fastest financial wins.`;
  }

  if (q.includes("goal")) {
    const goals = ctx.goals || [];
    if (goals.length === 0) {
      return `You don't have any active savings goals yet. Head over to the **Goals** page to set target amounts for emergency funds, travel, or investments!`;
    }
    const g = goals[0];
    const pct = g.target > 0 ? ((g.saved / g.target) * 100).toFixed(0) : "0";
    return `You're tracking **${goals.length} active goal(s)**! For **${g.name}**, you have saved **${curr} ${g.saved.toLocaleString()}** of **${curr} ${g.target.toLocaleString()}** (${pct}% complete). Keep allocating your monthly net savings of **${curr} ${savings.toLocaleString()}** to stay on track for your target date!`;
  }

  if (q.includes("budget") || q.includes("tip")) {
    return `**FinWise Monthly Budgeting Rule**:
1. **Needs (50%)**: Housing, utilities, groceries, and essential transport.
2. **Wants (30%)**: Dining, entertainment, and shopping.
3. **Savings & Investing (20%)**: Emergency cushion and future wealth.

With your current net savings of **${curr} ${savings.toLocaleString()}**, you're well-positioned to meet this month's financial targets!`;
  }

  return `Hello ${ctx.userName || "there"}! I've reviewed your account:
• **Total Income**: ${curr} ${income.toLocaleString()}
• **Total Expenses**: ${curr} ${expenses.toLocaleString()}
• **Net Savings**: ${curr} ${savings.toLocaleString()} (${rate.toFixed(1)}% savings rate)

Ask me anything about boosting savings, managing top expense categories, setting budgets, or reaching your goals!`;
}
