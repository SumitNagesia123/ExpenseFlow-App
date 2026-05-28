/**
 * AI Provider Abstraction Layer
 * Multi-model support: Pollinations (keyless) → OpenAI → Gemini → Fallback rules engine
 */

const PROVIDERS = {
  POLLINATIONS: "pollinations",
  OPENAI: "openai",
  GEMINI: "gemini",
  RULES: "rules"
};

/**
 * Send a prompt to the configured AI provider.
 * messages: Array of { role: "system"|"user"|"assistant", content: string }
 */
export async function callAI(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 800 } = options;

  // Try Pollinations (always available, no key required)
  try {
    const response = await fetch("https://text.pollinations.ai/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: AbortSignal.timeout(12000),
      body: JSON.stringify({
        messages,
        model: "openai",
        temperature,
        max_tokens: maxTokens
      })
    });

    if (response.ok) {
      const text = await response.text();
      return { reply: text.trim(), provider: PROVIDERS.POLLINATIONS };
    }
  } catch (err) {
    console.warn("[AIProvider] Pollinations failed:", err.message);
  }

  // Try OpenAI if key is configured
  if (process.env.OPENAI_API_KEY) {
    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
        },
        signal: AbortSignal.timeout(15000),
        body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature, max_tokens: maxTokens })
      });

      if (response.ok) {
        const data = await response.json();
        return { reply: data.choices[0].message.content.trim(), provider: PROVIDERS.OPENAI };
      }
    } catch (err) {
      console.warn("[AIProvider] OpenAI failed:", err.message);
    }
  }

  // Try Gemini if key is configured
  if (process.env.GEMINI_API_KEY) {
    try {
      const userMessages = messages.filter(m => m.role !== "system");
      const systemMsg = messages.find(m => m.role === "system")?.content || "";
      const geminiContents = userMessages.map(m => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }]
      }));

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(15000),
          body: JSON.stringify({
            system_instruction: { parts: [{ text: systemMsg }] },
            contents: geminiContents,
            generationConfig: { temperature, maxOutputTokens: maxTokens }
          })
        }
      );

      if (response.ok) {
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return { reply: text.trim(), provider: PROVIDERS.GEMINI };
      }
    } catch (err) {
      console.warn("[AIProvider] Gemini failed:", err.message);
    }
  }

  // Final fallback — rules engine
  return { reply: null, provider: PROVIDERS.RULES };
}

/**
 * Build a standardized financial system prompt with live SQL context injected.
 */
export function buildSystemPrompt(role, sqlContext) {
  const personas = {
    coach: `You are "FinanceIQ", an elite AI financial coach and behavioral finance expert for ExpenseFlow.
You analyze real financial data and provide sharp, proactive, personalized insights that help users build genuine financial discipline.
Be direct, encouraging, and laser-focused on actionable recommendations. Use bullet points and emojis for clarity.`,
    
    analyst: `You are "DataIQ", an elite AI financial analyst for ExpenseFlow.
You specialize in deep data analysis, pattern recognition, and generating clear financial intelligence reports.
Always back your statements with real numbers from the provided data. Be concise and executive-level in tone.`,
    
    assistant: `You are "Copilot AI", an advanced, friendly, and highly professional personal finance operating system assistant for ExpenseFlow.
Your primary role is to help the user manage their money, explain spending patterns, track budgets, and offer actionable financial advice.
Be extremely helpful, polite, and encouraging. Use elegant emojis where appropriate.`
  };

  return `${personas[role] || personas.assistant}

LIVE FINANCIAL CONTEXT (from database):
${sqlContext}

RULES:
1. Base all financial facts strictly on the data provided.
2. For off-topic questions, answer smartly while maintaining a premium financial advisor persona.
3. Keep answers concise, clear, and split into bullet points when listing items.
4. Always provide 1-2 actionable next steps at the end of your response.`;
}
