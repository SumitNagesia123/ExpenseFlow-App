/**
 * Reusable utility to auto-categorize transactions based on merchant title keywords.
 */
export function autoCategorize(merchant) {
  const m = merchant.toLowerCase();
  
  if (m.includes("swiggy") || m.includes("zomato") || m.includes("starbucks") || m.includes("restaurant") || m.includes("mcdonalds") || m.includes("kfc") || m.includes("food")) {
    return "Food";
  }
  if (m.includes("grocer") || m.includes("supermarket") || m.includes("blinkit") || m.includes("instamart") || m.includes("dmart") || m.includes("reliance fresh")) {
    return "Groceries";
  }
  if (m.includes("uber") || m.includes("ola") || m.includes("fuel") || m.includes("petrol") || m.includes("shell") || m.includes("rapido") || m.includes("metro") || m.includes("transport")) {
    return "Travel";
  }
  if (m.includes("netflix") || m.includes("spotify") || m.includes("prime") || m.includes("hotstar") || m.includes("cinema") || m.includes("bookmyshow") || m.includes("entertainment")) {
    return "Entertainment";
  }
  if (m.includes("amazon") || m.includes("flipkart") || m.includes("myntra") || m.includes("zara") || m.includes("h&m") || m.includes("shopping") || m.includes("retail")) {
    return "Shopping";
  }
  if (m.includes("airtel") || m.includes("jio") || m.includes("recharge") || m.includes("electricity") || m.includes("water") || m.includes("gas") || m.includes("bill") || m.includes("utility")) {
    return "Bills";
  }
  if (m.includes("hospital") || m.includes("medical") || m.includes("pharmacy") || m.includes("apollo") || m.includes("clinic") || m.includes("health")) {
    return "Medical";
  }
  if (m.includes("school") || m.includes("udemy") || m.includes("coursera") || m.includes("college") || m.includes("tuition") || m.includes("education")) {
    return "Education";
  }
  if (m.includes("transfer") || m.includes("sent to") || m.includes("upi to") || m.includes("payment to")) {
    return "Transfers";
  }
  
  return "Miscellaneous";
}
