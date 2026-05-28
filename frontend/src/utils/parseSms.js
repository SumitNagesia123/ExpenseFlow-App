const crypto = require("crypto");

function parseSms(message) {
  const lower = message.toLowerCase();

  const amountMatch = message.match(/₹\s?([\d,]+(\.\d+)?)/);
  const amount = amountMatch
    ? Number(amountMatch[1].replace(/,/g, ""))
    : null;

  const transaction_type = lower.includes("debit")
    ? "debit"
    : lower.includes("credit")
    ? "credit"
    : null;

  let merchant = "Unknown";
  const toMatch = message.match(/to\s([A-Za-z0-9\s]+)/i);
  if (toMatch) merchant = toMatch[1].trim();

  const hash = crypto
    .createHash("sha256")
    .update(message)
    .digest("hex");

  return {
    raw_message: message,
    amount,
    transaction_type,
    merchant,
    hash,
  };
}

module.exports = parseSms;
