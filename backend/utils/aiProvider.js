/**
 * AI Provider Abstraction Layer
 * Multi-model support: Groq → Pollinations → OpenAI → Gemini
 * Runs all active providers in parallel. Whichever answers first wins, and aborts the others.
 */
import { retryFetch } from "./retryFetch.js";

const PROVIDERS = {
  POLLINATIONS: "pollinations",
  OPENAI: "openai",
  GEMINI: "gemini",
  GROQ: "groq",
  RULES: "rules"
};

/**
 * Send a prompt to the configured AI provider.
 * Runs all available APIs in parallel. First one to finish wins and aborts the rest!
 */
export async function callAI(messages, options = {}) {
  const { temperature = 0.7, maxTokens = 800, forceProvider } = options;

  const activeProviders = [];
  const globalController = new AbortController();

  // Helper helper to filter by forceProvider
  const shouldRun = (p) => !forceProvider || forceProvider === p;

  // 1. Pollinations (Always active fallback)
  if (shouldRun(PROVIDERS.POLLINATIONS) && !forceProvider) {
    activeProviders.push(
      (async (signal) => {
      const response = await retryFetch("https://text.pollinations.ai/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages,
          model: "openai",
          temperature,
          max_tokens: maxTokens
        }),
        signal
      }, { retries: 1, timeoutMs: 8000 });

      if (response.ok) {
        const text = await response.text();
        if (text && text.trim().length > 0) {
          return { reply: text.trim(), provider: PROVIDERS.POLLINATIONS };
        }
      }
      throw new Error("Pollinations failed or empty response");
    })(globalController.signal)
  );
  }

  // 2. OpenAI
  if (process.env.OPENAI_API_KEY && shouldRun(PROVIDERS.OPENAI)) {
    activeProviders.push(
      (async (signal) => {
        const response = await retryFetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({ model: "gpt-4o-mini", messages, temperature, max_tokens: maxTokens }),
          signal
        }, { retries: 1, timeoutMs: 8000 });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) {
            return { reply: text, provider: PROVIDERS.OPENAI };
          }
        }
        throw new Error("OpenAI failed");
      })(globalController.signal)
    );
  }

  // 3. Gemini
  if (process.env.GEMINI_API_KEY && shouldRun(PROVIDERS.GEMINI)) {
    activeProviders.push(
      (async (signal) => {
        const userMessages = messages.filter(m => m.role !== "system");
        const systemMsg = messages.find(m => m.role === "system")?.content || "";
        const geminiContents = userMessages.map(m => ({
          role: m.role === "assistant" ? "model" : "user",
          parts: [{ text: m.content }]
        }));

        const response = await retryFetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              system_instruction: { parts: [{ text: systemMsg }] },
              contents: geminiContents,
              generationConfig: { temperature, maxOutputTokens: maxTokens }
            }),
            signal
          },
          { retries: 1, timeoutMs: 8000 }
        );

        if (response.ok) {
          const data = await response.json();
          const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
          if (text) {
            return { reply: text, provider: PROVIDERS.GEMINI };
          }
        }
        throw new Error("Gemini failed");
      })(globalController.signal)
    );
  }

  // 4. Groq (New!)
  if (process.env.GROQ_API_KEY && shouldRun(PROVIDERS.GROQ)) {
    activeProviders.push(
      (async (signal) => {
        const response = await retryFetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.GROQ_API_KEY}`
          },
          body: JSON.stringify({
            model: "llama3-8b-8192",
            messages,
            temperature,
            max_tokens: maxTokens
          }),
          signal
        }, { retries: 1, timeoutMs: 8000 });

        if (response.ok) {
          const data = await response.json();
          const text = data.choices?.[0]?.message?.content?.trim();
          if (text) {
            return { reply: text, provider: PROVIDERS.GROQ };
          }
        }
        throw new Error("Groq failed");
      })(globalController.signal)
    );
  }

  // Race the providers! First one to resolve successfully wins.
  try {
    const winner = await Promise.any(activeProviders);
    globalController.abort(); // Terminate/Abort all other slower API requests immediately
    return winner;
  } catch (err) {
    // If all providers failed, fall back to rules
    globalController.abort();
    return { reply: null, provider: PROVIDERS.RULES };
  }
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
