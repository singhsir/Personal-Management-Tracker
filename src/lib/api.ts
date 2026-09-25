import { supabase, EDGE_FUNCTION_URL } from "./supabase";
import type { CategorizeResponse, InsightResponse } from "./types";

async function getAccessToken(): Promise<string> {
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session) {
    throw new Error("You must be signed in to perform this action.");
  }
  return data.session.access_token;
}

export async function categorizeTransaction(
  transactionId: string,
  description: string,
): Promise<CategorizeResponse> {
  const token = await getAccessToken();

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: "categorize",
      transaction_id: transactionId,
      description,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Categorization failed (${response.status})`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data as CategorizeResponse;
}

export async function fetchInsights(
  startDate: string,
  endDate: string,
): Promise<InsightResponse> {
  const token = await getAccessToken();

  const response = await fetch(EDGE_FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      action: "insights",
      start_date: startDate,
      end_date: endDate,
    }),
  });

  if (!response.ok) {
    const errBody = await response.json().catch(() => ({}));
    throw new Error(errBody.error || `Insights request failed (${response.status})`);
  }

  const data = await response.json();
  if (data.error) {
    throw new Error(data.error);
  }

  return data as InsightResponse;
}
