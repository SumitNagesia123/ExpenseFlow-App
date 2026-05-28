import { useEffect, useState } from "react";
import api from "../api/api";
import { 
  Bell, 
  ShieldAlert, 
  Send, 
  Radio, 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Cpu, 
  Key, 
  CreditCard 
} from "lucide-react";

export default function RealtimeDashboard() {
  const [smsText, setSmsText] = useState("");
  const [ingesting, setIngesting] = useState(false);
  const [ingestError, setIngestError] = useState("");
  
  // Real-time Event feeds
  const [transactions, setTransactions] = useState([]);
  const [fraudAlerts, setFraudAlerts] = useState([]);
  const [systemLogs, setSystemLogs] = useState([
    { id: 1, time: new Date().toLocaleTimeString(), msg: "Real-time Event pipeline initialized." },
    { id: 2, time: new Date().toLocaleTimeString(), msg: "Subscribed to SSE stream: /api/transactions/sms/events" }
  ]);

  // Connectors State
  const [connectors, setConnectors] = useState([
    { name: "Plaid", region: "US/EU", status: "Disconnected" },
    { name: "Teller", region: "US Only", status: "Disconnected" },
    { name: "Salt Edge", region: "Global Open Banking", status: "Disconnected" },
    { name: "Yodlee", region: "Enterprise", status: "Disconnected" },
    { name: "Indian UPI Aggregator", region: "India (NPCI)", status: "Active" }
  ]);

  // Budget status
  const [autoBudget, setAutoBudget] = useState({
    limit: 10000,
    risk: "Moderate",
    recommendation: "Stabilized spending detected. Category caps optimal."
  });

  // 1. Subscribe to Live Server Event Stream
  useEffect(() => {
    // Standard EventSource for Server-Sent Events (SSE)
    const backendUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    const sseSource = new EventSource(`${backendUrl}/transactions/sms/events`);

    sseSource.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);
        const timestamp = new Date().toLocaleTimeString();

        if (payload.type === "new_transaction") {
          setTransactions(prev => [payload.data, ...prev].slice(0, 10));
          setSystemLogs(prev => [
            { id: Date.now(), time: timestamp, msg: `📥 Ingested transaction at ${payload.data.title} - ₹${payload.data.amount}` },
            ...prev
          ]);
          
          // Dynamic budget risk adjustment logic
          if (payload.data.amount > 3000) {
            setAutoBudget(prev => ({
              limit: prev.limit - 500,
              risk: "High Volatility",
              recommendation: "Large purchase detected. Automatically adjusted Travel/Shopping caps down by ₹500."
            }));
          }
        } 
        
        else if (payload.type === "fraud_alert") {
          setFraudAlerts(prev => [payload.data, ...prev]);
          setSystemLogs(prev => [
            { id: Date.now(), time: timestamp, msg: `🚨 SECURITY SHIELD: ${payload.data.message}` },
            ...prev
          ]);
        }
      } catch (err) {
        console.error("Failed to parse SSE payload", err);
      }
    };

    sseSource.onerror = () => {
      console.warn("SSE connection interrupted. Reconnecting...");
    };

    return () => {
      sseSource.close();
    };
  }, []);

  // 2. Submit custom SMS Ingestion
  const handleIngestSMS = async (e) => {
    e.preventDefault();
    if (!smsText.trim()) return;

    setIngesting(true);
    setIngestError("");
    try {
      const res = await api.post("/sms/ingest", { message: smsText });
      if (res.data.duplicate) {
        setIngestError("This SMS was already processed before.");
      } else {
        setSmsText("");
        const timestamp = new Date().toLocaleTimeString();
        setSystemLogs(prev => [{ id: Date.now(), time: timestamp, msg: `✅ ${res.data.message}` }, ...prev]);
      }
      if (res.data.fraudWarning) {
        setSystemLogs(prev => [{ id: Date.now() + 1, time: new Date().toLocaleTimeString(), msg: `🚨 FRAUD: ${res.data.fraudWarning}` }, ...prev]);
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Pipeline ingestion error — check message format.";
      setIngestError(msg);
      console.error("Ingestion failed", err);
    } finally {
      setIngesting(false);
    }
  };

  // 3. Connect a banking provider mock
  const handleConnect = (name) => {
    setConnectors(prev => prev.map(c => {
      if (c.name === name) {
        return { ...c, status: c.status === "Disconnected" ? "Connecting..." : "Disconnected" };
      }
      return c;
    }));

    setTimeout(() => {
      setConnectors(prev => prev.map(c => {
        if (c.name === name) {
          return { ...c, status: c.status === "Connecting..." ? "Connected" : c.status };
        }
        return c;
      }));
    }, 1500);
  };

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-white">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            ⚡ Real-time Fintech Pipeline
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            SMS UPI alerts parsing, banking connector architecture, and live event monitoring.
          </p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200/50">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </span>
          <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">SSE Feed Live</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* INGESTION SIMULATOR PANEL */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Send className="w-5 h-5" /> SMS UPI Ingest Simulator
          </h2>
          <p className="text-xs text-gray-500">
            Enter a standard Indian UPI debit message or bank SMS alert to ingest real-time transactions automatically.
          </p>
          <form onSubmit={handleIngestSMS} className="space-y-3">
            <textarea
              value={smsText}
              onChange={(e) => setSmsText(e.target.value)}
              placeholder="e.g. ₹450 spent at Swiggy via UPI"
              rows={3}
              className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSmsText("₹1200 debited via UPI to Swiggy")}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Food Preset
              </button>
              <button
                type="button"
                onClick={() => setSmsText("₹8500 spent at Amazon via HDFC Card")}
                className="bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 px-3 py-1.5 rounded-lg text-xs font-semibold"
              >
                Large Purchase (Fraud)
              </button>
            </div>
            <button
              type="submit"
              disabled={ingesting || !smsText.trim()}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl transition-all disabled:opacity-50 text-sm"
            >
              {ingesting ? "Parsing Pipeline..." : "Send Transaction Alert"}
            </button>
            {ingestError && (
              <p className="text-xs text-red-500 text-center">{ingestError}</p>
            )}
          </form>
        </div>

        {/* LIVE INGESTION FEED */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-[340px]">
          <h2 className="text-lg font-bold flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-3">
            <Radio className="w-5 h-5 animate-pulse" /> Live Event Stream
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-12 text-sm text-gray-400">
                Waiting for incoming transaction alerts...
              </div>
            ) : (
              transactions.map(t => (
                <div key={t.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900/50 rounded-xl border border-gray-100 dark:border-slate-700/50">
                  <div>
                    <p className="font-semibold text-sm">{t.title}</p>
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-bold">
                      {t.category}
                    </span>
                  </div>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    ₹{t.amount.toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* SECURITY & FRAUD SHIELD */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col h-[340px]">
          <h2 className="text-lg font-bold flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-3">
            <ShieldAlert className="w-5 h-5" /> Security & Fraud Shield
          </h2>
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {fraudAlerts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400 text-sm">
                <CheckCircle className="w-8 h-8 text-emerald-500 mb-2" />
                No suspicious activities detected.
              </div>
            ) : (
              fraudAlerts.map((alert, idx) => (
                <div key={idx} className="p-3 bg-rose-50 dark:bg-rose-500/10 border border-rose-200/50 dark:border-rose-500/20 rounded-xl flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-rose-700 dark:text-rose-400">{alert.message}</p>
                    <span className="text-[10px] text-gray-400">Triggered: {new Date(alert.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BANKING AGGREGATORS CONNECTOR */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-gray-500" /> Banking Connector Architecture
          </h2>
          <p className="text-xs text-gray-500">
            Simulate and connect international Open Banking frameworks and domestic UPI aggregators.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {connectors.map(c => (
              <div key={c.name} className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">{c.name}</h3>
                  <span className="text-xs text-gray-400">{c.region}</span>
                </div>
                <button
                  onClick={() => handleConnect(c.name)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    c.status === "Connected" || c.status === "Active"
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400"
                      : c.status === "Connecting..."
                      ? "bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                      : "bg-gray-200 text-gray-700 dark:bg-slate-700 dark:text-slate-300 hover:opacity-80"
                  }`}
                >
                  {c.status}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* AI AUTO BUDGET ADJUSTER */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <Cpu className="w-5 h-5 animate-pulse" /> AI Auto-Budget Adjustment
          </h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">Active Budget Limit</span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 text-sm">₹{autoBudget.limit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-indigo-50/50 dark:bg-indigo-500/5 rounded-xl">
              <span className="text-xs font-semibold text-gray-500">AI Risk Class</span>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
                autoBudget.risk === "Moderate" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"
              }`}>{autoBudget.risk}</span>
            </div>
            <div className="p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">AI Recommendation</p>
              <p className="text-xs italic text-gray-600 dark:text-slate-300">
                "{autoBudget.recommendation}"
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* SYSTEM LOG MONITOR */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
        <h2 className="text-lg font-bold flex items-center gap-2 mb-3">
          <Key className="w-5 h-5 text-yellow-500" /> Transaction Ingestion Pipeline Monitor
        </h2>
        <div className="bg-gray-950 text-emerald-400 p-4 rounded-xl font-mono text-xs h-[150px] overflow-y-auto space-y-1">
          {systemLogs.map(log => (
            <div key={log.id} className="flex gap-4">
              <span className="text-slate-600">{log.time}</span>
              <span>{log.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
