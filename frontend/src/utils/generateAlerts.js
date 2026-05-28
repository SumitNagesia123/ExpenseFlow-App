export function generateAlerts({ budgets = {}, expenses = [], goals = [] }) {
  const alerts = [];

  // Budget alerts
  Object.keys(budgets).forEach((category) => {
    const spent = expenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + Number(e.amount || 0), 0);

    const limit = budgets[category];
    if (!limit) return;

    if (spent > limit) {
      alerts.push({
        type: "danger",
        message: `Overspent ${category} budget`,
      });
    } else if (spent >= limit * 0.8) {
      alerts.push({
        type: "warning",
        message: `${category} budget almost exhausted`,
      });
    }
  });

  // Goal alerts
  goals.forEach((goal) => {
    if (goal.saved >= goal.target) {
      alerts.push({
        type: "success",
        message: `🎉 Goal achieved: ${goal.name}`,
      });
    }
  });

  return alerts;
}
