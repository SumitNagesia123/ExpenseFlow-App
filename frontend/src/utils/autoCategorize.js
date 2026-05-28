const CATEGORY_RULES = [
  { keywords: ["swiggy", "zomato", "restaurant", "food"], category: "Food" },
  { keywords: ["uber", "ola", "cab", "taxi"], category: "Travel" },
  { keywords: ["netflix", "spotify", "prime"], category: "Bills" },
  { keywords: ["amazon", "flipkart", "shopping"], category: "Shopping" },
  { keywords: ["fuel", "petrol", "diesel"], category: "Fuel" },
  { keywords: ["hospital", "doctor", "medical"], category: "Medical" },
  { keywords: ["electricity", "water", "gas"], category: "Bills" },
];

export function autoCategorize(title = "") {
  const lowerTitle = title.toLowerCase();

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some(k => lowerTitle.includes(k))) {
      return rule.category;
    }
  }

  return "Uncategorized";
}
