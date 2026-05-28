import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import {
  Brain, TrendingUp, ShieldAlert, FileText, Target,
  MessageSquare, CheckCircle, AlertTriangle, Zap, Star,
  ChevronRight, Send, Loader
} from "lucide-react";

// ── Sub-component: Profile Card ──────────────────────────────────────────────
function ProfileCard({ profile }) {
  if (!profile) return null;
  const scoreColor = profile.overallScore >= 75 ? "text-emerald-500" : profile.overallScore >= 50 ? "text-amber-500" : "text-rose-500";
  const scoreBg = profile.overallScore >= 75 ? "from-emerald-500" : profile.overallScore >= 50 ? "from-amber-500" : "from-rose-500";
  const circumference = 2 * Math.PI * 40;
  const strokeDash = circumference - (profile.overallScore / 100) * circumference;

  return (
    <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-900 rounded-2xl p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-3xl opacity-10 -mr-12 -mt-12" />
      <h2 className="text-sm font-bold text-indigo-300 uppercase tracking-widest mb-4">Financial Digital Twin</h2>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg className="w-28 h-28 -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#1e293b" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none" stroke="url(#grad)" strokeWidth="10"
              strokeDasharray={circumference} strokeDashoffset={strokeDash} strokeLinecap="round" />
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-black ${scoreColor}`}>{profile.overallScore}</span>
            <span className="text-[10px] text-slate-400">/ 100</span>
          </div>
        </div>
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-2xl font-bold">{profile.personalityEmoji} {profile.personality}</p>
            <p className="text-sm text-indigo-300">{profile.riskProfile}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[
              { label: "Budget", val: profile.budgetScore },
              { label: "Subs", val: profile.subscriptionScore },
              { label: "Trend", val: profile.trendScore },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-2 text-center">
                <p className="text-lg font-black text-white">{item.val}</p>
                <p className="text-[10px] text-slate-400">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-slate-400 text-xs">This Month</p>
          <p className="font-bold text-white">₹{profile.thisMonth?.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 rounded-xl p-3">
          <p className="text-slate-400 text-xs">Remaining</p>
          <p className={`font-bold ${profile.remaining < 0 ? "text-rose-400" : "text-emerald-400"}`}>
            ₹{Math.abs(profile.remaining)?.toLocaleString()} {profile.remaining < 0 ? "over" : "left"}
          </p>
        </div>
      </div>
    </div>
  );
}

// ── Sub-component: Quick Wins ────────────────────────────────────────────────
function QuickWins({ wins }) {
  if (!wins?.length) return null;
  const styles = {
    danger: "bg-rose-50 dark:bg-rose-500/10 border-rose-200 dark:border-rose-500/30 text-rose-700 dark:text-rose-400",
    warning: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/30 text-amber-700 dark:text-amber-400",
    info: "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-400",
  };
  const icons = { danger: AlertTriangle, warning: TrendingUp, info: Zap };

  return (
    <div className="space-y-3">
      {wins.map((w, i) => {
        const Icon = icons[w.type] || Zap;
        return (
          <div key={i} className={`flex gap-3 p-4 rounded-xl border ${styles[w.type]}`}>
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">{w.title}</p>
              <p className="text-xs opacity-80 mt-0.5">{w.body}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Sub-component: Fraud Panel ───────────────────────────────────────────────
function FraudPanel({ fraud }) {
  if (!fraud) return null;
  const riskColor = fraud.riskLevel === "High" ? "text-rose-500 bg-rose-50 dark:bg-rose-500/10" :
    fraud.riskLevel === "Medium" ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10" :
    "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10";

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-lg flex items-center gap-2"><ShieldAlert className="w-5 h-5 text-rose-500" /> Fraud Prediction Engine</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full ${riskColor}`}>{fraud.riskLevel} Risk</span>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex-1 bg-gray-100 dark:bg-slate-700 rounded-full h-3">
          <div className={`h-3 rounded-full transition-all ${fraud.riskLevel === "High" ? "bg-rose-500" : fraud.riskLevel === "Medium" ? "bg-amber-500" : "bg-emerald-500"}`}
            style={{ width: `${fraud.fraudScore}%` }} />
        </div>
        <span className="text-2xl font-black">{fraud.fraudScore}</span>
      </div>
      {fraud.anomalousTransactions?.length > 0 && (
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Anomalous Transactions</p>
          {fraud.anomalousTransactions.slice(0, 3).map((t, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50 dark:border-slate-700/50 text-sm">
              <span className="text-gray-700 dark:text-slate-300">{t.title}</span>
              <span className="font-bold text-rose-500">₹{Number(t.amount).toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
      {fraud.anomalousTransactions?.length === 0 && (
        <div className="flex items-center gap-2 text-emerald-600 text-sm">
          <CheckCircle className="w-4 h-4" /> No anomalous transactions detected.
        </div>
      )}
    </div>
  );
}

// ── Sub-component: Goal Planner ──────────────────────────────────────────────
function GoalPlanner() {
  const [form, setForm] = useState({ goalName: "", targetAmount: "", targetMonths: "12" });
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.goalName || !form.targetAmount) return;
    setLoading(true); setError(""); setPlan(null);
    try {
      const res = await api.post("/ai-coach/goals/ai-plan", {
        goalName: form.goalName,
        targetAmount: Number(form.targetAmount),
        targetMonths: Number(form.targetMonths)
      });
      setPlan(res.data);
    } catch (err) {
      setError("Failed to generate plan. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2"><Target className="w-5 h-5 text-indigo-500" /> Smart Goal Planner</h3>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input placeholder="Goal (e.g. New Laptop)" value={form.goalName}
          onChange={e => setForm(p => ({ ...p, goalName: e.target.value }))}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <input type="number" placeholder="Target Amount (₹)" value={form.targetAmount}
          onChange={e => setForm(p => ({ ...p, targetAmount: e.target.value }))}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500" />
        <select value={form.targetMonths} onChange={e => setForm(p => ({ ...p, targetMonths: e.target.value }))}
          className="bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500">
          {[3, 6, 9, 12, 18, 24].map(m => <option key={m} value={m}>{m} months</option>)}
        </select>
        <button type="submit" disabled={loading || !form.goalName || !form.targetAmount}
          className="sm:col-span-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 rounded-xl text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {loading ? <><Loader className="w-4 h-4 animate-spin" /> Generating Plan...</> : <><Star className="w-4 h-4" /> Generate AI Savings Plan</>}
        </button>
      </form>
      {error && <p className="text-xs text-rose-500">{error}</p>}
      {plan && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Monthly Needed</p>
              <p className="font-black text-indigo-600 dark:text-indigo-400">₹{plan.monthlyRequired?.toLocaleString()}</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${plan.achievable ? "bg-emerald-50 dark:bg-emerald-500/10" : "bg-rose-50 dark:bg-rose-500/10"}`}>
              <p className="text-xs text-gray-500">Achievable?</p>
              <p className={`font-black text-sm ${plan.achievable ? "text-emerald-600" : "text-rose-600"}`}>{plan.achievable ? "✅ Yes" : "⚠️ Stretch"}</p>
            </div>
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Current Capacity</p>
              <p className="font-black text-sm">₹{plan.currentSavingsCapacity?.toLocaleString()}</p>
            </div>
          </div>
          {plan.plan && (
            <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 text-xs text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-52 overflow-y-auto">
              {plan.plan}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component: NL Query Box ──────────────────────────────────────────────
function NLQueryBox() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState("");
  const suggestions = [
    "How much did I spend on food?",
    "What are my recurring subscriptions?",
    "Which category increased the most?",
    "Am I on track with my budget?"
  ];

  const ask = async (q) => {
    const text = q || question;
    if (!text.trim()) return;
    setQuestion(text); setLoading(true); setAnswer("");
    try {
      const res = await api.post("/ai-coach/query", { question: text });
      setAnswer(res.data.answer);
    } catch {
      setAnswer("Unable to process query. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
      <h3 className="font-bold text-lg flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-500" /> Ask Your Finances</h3>
      <div className="flex flex-wrap gap-2">
        {suggestions.map(s => (
          <button key={s} onClick={() => ask(s)}
            className="text-xs bg-gray-100 dark:bg-slate-700 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 px-3 py-1.5 rounded-full transition-colors">
            {s}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={question} onChange={e => setQuestion(e.target.value)}
          onKeyDown={e => e.key === "Enter" && ask()}
          placeholder="Ask anything about your finances..."
          className="flex-1 bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500" />
        <button onClick={() => ask()} disabled={loading || !question.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl px-4 py-2 disabled:opacity-50 transition-all">
          {loading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
        </button>
      </div>
      {answer && (
        <div className="bg-purple-50 dark:bg-purple-500/10 border border-purple-100 dark:border-purple-500/20 rounded-xl p-4 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function AiCoach() {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [fraud, setFraud] = useState(null);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const [profileRes, recsRes, fraudRes] = await Promise.all([
          api.get("/ai-coach/profile"),
          api.get("/ai-coach/recommendations"),
          api.get("/ai-coach/fraud-prediction"),
        ]);
        setProfile(profileRes.data);
        setRecommendations(recsRes.data);
        setFraud(fraudRes.data);
      } catch (err) {
        console.error("Failed to load AI Coach data", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleGenerateReport = async () => {
    setReportLoading(true);
    try {
      const res = await api.get("/ai-coach/report");
      setReport(res.data);
      setActiveTab("report");
    } catch (err) {
      console.error("Report generation failed", err);
    } finally {
      setReportLoading(false);
    }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: Brain },
    { key: "recommendations", label: "Recommendations", icon: Zap },
    { key: "goals", label: "Goal Planner", icon: Target },
    { key: "query", label: "Ask AI", icon: MessageSquare },
    { key: "report", label: "AI Report", icon: FileText },
  ];

  if (loading) {
    return (
      <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader className="w-10 h-10 text-indigo-500 animate-spin" />
        <p className="text-gray-500 dark:text-slate-400 text-sm">Initializing Autonomous AI Financial OS...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">🧠 AI Financial Coach</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">Autonomous intelligence • Behavioral analytics • Proactive guidance</p>
        </div>
        <button onClick={handleGenerateReport} disabled={reportLoading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all disabled:opacity-50 shadow-sm">
          {reportLoading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
          {reportLoading ? "Generating..." : "Generate AI Report"}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-slate-800 p-1 rounded-xl w-fit overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${
                activeTab === tab.key
                  ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm"
                  : "text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-300"
              }`}>
              <Icon className="w-4 h-4" /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProfileCard profile={profile} />
          <FraudPanel fraud={fraud} />
        </div>
      )}

      {activeTab === "recommendations" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-500" /> Instant Alerts</h3>
            <QuickWins wins={recommendations?.quickWins} />
            {!recommendations?.quickWins?.length && (
              <div className="flex items-center gap-2 text-emerald-600 text-sm py-4">
                <CheckCircle className="w-5 h-5" /> No critical alerts — your finances look healthy!
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
            <h3 className="font-bold text-lg flex items-center gap-2"><Brain className="w-5 h-5 text-indigo-500" /> AI Recommendations</h3>
            {recommendations?.aiRecommendations ? (
              <div className="text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                {recommendations.aiRecommendations}
              </div>
            ) : (
              <p className="text-sm text-gray-400">Add transactions to unlock AI recommendations.</p>
            )}
          </div>
        </div>
      )}

      {activeTab === "goals" && (
        <GoalPlanner />
      )}

      {activeTab === "query" && (
        <NLQueryBox />
      )}

      {activeTab === "report" && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg flex items-center gap-2"><FileText className="w-5 h-5 text-indigo-500" /> Monthly AI Intelligence Report</h3>
            {report && (
              <span className="text-xs text-gray-400">
                Generated: {new Date(report.generatedAt).toLocaleString("en-IN")}
              </span>
            )}
          </div>
          {!report ? (
            <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-3">
              <FileText className="w-12 h-12 text-gray-300 dark:text-slate-700" />
              <p className="text-sm">Click "Generate AI Report" to create your personalized financial intelligence report.</p>
              <button onClick={handleGenerateReport} disabled={reportLoading}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-sm">
                {reportLoading ? <Loader className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                Generate Now
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Health Score</p>
                  <p className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{report.healthScore}</p>
                </div>
                <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">Month</p>
                  <p className="text-lg font-black">{report.month}/{report.year}</p>
                </div>
                <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500">AI Provider</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 capitalize">{report.provider}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-slate-900 rounded-xl p-6 text-sm text-gray-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto font-mono">
                {report.report}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
