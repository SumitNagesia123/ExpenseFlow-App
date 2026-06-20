/**
 * ============================================================
 *  ExpenseFlow — Resilient HTTP Fetcher (retryFetch)
 * ============================================================
 *  Features:
 *  - Automatic retries with exponential back-off
 *  - Per-request timeout via AbortSignal
 *  - Circuit breaker per host (stops hammering a dead service)
 *  - Zero external dependencies — uses native Node.js fetch
 * ============================================================
 */

// ─── Circuit Breaker State (per host) ────────────────────────────────────────
const circuitBreakers = {};   // { hostname: { failures, openUntil } }
const CB_THRESHOLD = 5;       // open circuit after N consecutive failures
const CB_RESET_MS  = 30_000;  // try again after 30 s

function getHost(url) {
  try { return new URL(url).hostname; } catch { return url; }
}

function isCircuitOpen(host) {
  const cb = circuitBreakers[host];
  if (!cb) return false;
  if (cb.openUntil && Date.now() < cb.openUntil) return true;
  if (cb.openUntil && Date.now() >= cb.openUntil) {
    // half-open: allow one test request through
    delete circuitBreakers[host];
    return false;
  }
  return false;
}

function recordFailure(host) {
  if (!circuitBreakers[host]) circuitBreakers[host] = { failures: 0 };
  circuitBreakers[host].failures++;
  if (circuitBreakers[host].failures >= CB_THRESHOLD) {
    circuitBreakers[host].openUntil = Date.now() + CB_RESET_MS;
    console.warn(`[retryFetch] ⚡ Circuit OPEN for ${host} — pausing for ${CB_RESET_MS / 1000}s`);
  }
}

function recordSuccess(host) {
  delete circuitBreakers[host];
}

// ─── Sleep helper ─────────────────────────────────────────────────────────────
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// ─── Main retryFetch ──────────────────────────────────────────────────────────
/**
 * @param {string} url
 * @param {RequestInit} options   — standard fetch options
 * @param {object} retryOptions
 *   @param {number} retries      max retry attempts (default 3)
 *   @param {number} timeoutMs    per-attempt timeout in ms (default 12000)
 *   @param {number} baseDelayMs  initial back-off delay in ms (default 500)
 */
export async function retryFetch(url, options = {}, retryOptions = {}) {
  const {
    retries    = 3,
    timeoutMs  = 12_000,
    baseDelayMs = 500
  } = retryOptions;

  const host = getHost(url);

  if (isCircuitOpen(host)) {
    throw new Error(`[retryFetch] Circuit breaker OPEN for ${host} — request skipped`);
  }

  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timer);

      if (response.ok) {
        recordSuccess(host);
        return response;
      }

      // Non-2xx — treat as retryable server error
      const errText = await response.text().catch(() => "");
      throw new Error(`HTTP ${response.status}: ${errText.slice(0, 200)}`);

    } catch (err) {
      clearTimeout(timer);
      lastError = err;

      const isAbort    = err.name === "AbortError";
      const isLastTry  = attempt === retries;

      if (isLastTry) {
        recordFailure(host);
        break;
      }

      const delay = baseDelayMs * Math.pow(2, attempt); // 500ms, 1s, 2s …
      console.warn(`[retryFetch] ⚠️  Attempt ${attempt + 1}/${retries + 1} failed for ${host}${isAbort ? " (timeout)" : ""}. Retrying in ${delay}ms…`);
      await sleep(delay);
    }
  }

  throw lastError;
}
