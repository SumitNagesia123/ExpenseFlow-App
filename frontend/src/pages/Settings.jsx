import { useState, useEffect } from "react";
import { Save, Edit2, DollarSign, Wallet, Palette } from "lucide-react";

export default function Settings() {
  const [isEditing, setIsEditing] = useState(false);
  
  const [currency, setCurrency] = useState("INR");
  const [budget, setBudget] = useState("10000");
  const [themePref, setThemePref] = useState("system");

  useEffect(() => {
    const savedSettings = JSON.parse(localStorage.getItem("userSettings") || "{}");
    if (savedSettings.currency) setCurrency(savedSettings.currency);
    if (savedSettings.budget) setBudget(savedSettings.budget);
    if (savedSettings.themePref) setThemePref(savedSettings.themePref);
  }, []);

  const handleSave = () => {
    const newSettings = { currency, budget, themePref };
    localStorage.setItem("userSettings", JSON.stringify(newSettings));
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your app preferences and configurations
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] text-stone-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-stone-200/60 dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Settings
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/60 dark:border-white/[0.06] transition-colors space-y-8">
        
        {/* Currency Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-white/[0.06]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Display Currency</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">The currency used across your dashboard</p>
            </div>
          </div>
          <div className="sm:w-48">
            {isEditing ? (
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-stone-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="INR">Indian Rupee (₹)</option>
                <option value="USD">US Dollar ($)</option>
                <option value="EUR">Euro (€)</option>
                <option value="GBP">British Pound (£)</option>
              </select>
            ) : (
              <div className="px-4 py-2.5 rounded-xl border border-transparent bg-stone-50 dark:bg-white/[0.03] text-stone-900 dark:text-white text-sm font-medium">
                {currency === "INR" ? "Indian Rupee (₹)" : currency === "USD" ? "US Dollar ($)" : currency}
              </div>
            )}
          </div>
        </div>

        {/* Budget Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-stone-100 dark:border-white/[0.06]">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Monthly Budget Target</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Default global budget limit</p>
            </div>
          </div>
          <div className="sm:w-48">
            {isEditing ? (
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                <input
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-stone-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="10000"
                />
              </div>
            ) : (
              <div className="px-4 py-2.5 rounded-xl border border-transparent bg-stone-50 dark:bg-white/[0.03] text-stone-900 dark:text-white text-sm font-medium">
                ₹{Number(budget).toLocaleString()}
              </div>
            )}
          </div>
        </div>

        {/* Theme Setting */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0">
              <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Appearance</h3>
              <p className="text-sm text-gray-500 dark:text-slate-400">Choose your interface theme preference</p>
            </div>
          </div>
          <div className="sm:w-48">
            {isEditing ? (
              <select
                value={themePref}
                onChange={(e) => setThemePref(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-stone-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="system">System Default</option>
                <option value="light">Light Mode</option>
                <option value="dark">Dark Mode</option>
              </select>
            ) : (
              <div className="px-4 py-2.5 rounded-xl border border-transparent bg-stone-50 dark:bg-white/[0.03] text-stone-900 dark:text-white text-sm font-medium capitalize">
                {themePref}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
