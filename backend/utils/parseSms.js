const crypto = require("crypto");

/**
 * Level 1 SMS Parser (Rule-based)
 * Compatible with existing sms.js route
 */
function parseSms(message) {
  const raw_message = message;

  // Amount (₹499 / Rs.499 / INR 499)
  const amountMatch = message.match(/(₹|Rs\.?|INR)\s?(\d+(\.\d+)?)/i);
  const amount = amountMatch ? Number(amountMatch[2]) : 0;

  // Transaction type
  let transaction_type = "unknown";
  if (/debited|spent|paid/i.test(message)) transaction_type = "debit";
  if (/credited|received/i.test(message)) transaction_type = "credit";

  // Merchant (basic heuristic)
  let merchant = "Unknown";
  const merchantMatch = message.match(/to\s([A-Za-z0-9\-_]+)/i);
  if (merchantMatch) merchant = merchantMatch[1];

  // Unique hash to avoid duplicates
  const hash = crypto
    .createHash("sha256")
    .update(message)
    .digest("hex");

  return {
    raw_message,
    amount,
    transaction_type,
    merchant,
    hash,
  };
}

module.exports = parseSms;
