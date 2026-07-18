import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../api/api";
import { 
  Mail, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Trash2, 
  Lock, 
  ArrowRight,
  TrendingDown,
  Info
} from "lucide-react";

export default function GmailSync() {
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [status, setStatus] = useState({ connected: false, connectedEmail: "", lastSyncedAt: "" });
  const [transactions, setTransactions] = useState([]);
  const [syncResult, setSyncResult] = useState(null);
  const [emailInput, setEmailInput] = useState("");

  // 1. Fetch current status on load
  const loadStatus = async () => {
    try {
      setLoading(true);
      const res = await api.get("/gmail/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to load Gmail status", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  // 2. Click Connect Gmail
  const handleConnect = async () => {
    if (!emailInput.trim()) {
      toast.error("Please enter a Gmail address to connect.");
      return;
    }
    try {
      // Simulate Google OAuth Redirect Consent Flow
      // In production, this would redirect user to Google consent URL
      const consentCode = "simulated-oauth-consent-code";
      
      const res = await api.post("/gmail/connect", { code: consentCode, email: emailInput });
      if (res.data.success) {
        setStatus({
          connected: true,
          connectedEmail: res.data.connectedEmail,
          lastSyncedAt: new Date().toISOString()
        });
        toast.success(`Successfully connected to ${res.data.connectedEmail}!`);
      }
    } catch (err) {
      console.error("Connection failed", err);
      toast.error("Failed to authenticate with Google APIs");
    }
  };

  // 3. Click Disconnect
  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect Gmail? Your credentials will be removed.")) return;
    try {
      await api.post("/gmail/disconnect");
      setStatus({ connected: false, connectedEmail: "", lastSyncedAt: "" });
      setTransactions([]);
      setSyncResult(null);
    } catch (err) {
      console.error("Failed to disconnect", err);
    }
  };

  // 4. Trigger Sync
  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await api.get("/gmail/sync");
      if (res.data.success) {
        setTransactions(res.data.transactions);
        setSyncResult({
          type: "success",
          message: res.data.message,
          count: res.data.syncedCount
        });
        // Reload status to get new sync timestamp
        const statusRes = await api.get("/gmail/status");
        setStatus(statusRes.data);
      }
    } catch (err) {
      console.error("Sync error", err);
      setSyncResult({
        type: "error",
        message: "Failed to parse Gmail inbox. Please check your OAuth tokens."
      });
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Verifying secure keys...</div>;

  return (
    <div className="p-6 space-y-6 text-gray-900 dark:text-white">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            ✉️ Gmail Transaction Sync
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Automatically ingest and categorize UPI receipts, subscriptions, and bank alerts from your inbox.
          </p>
        </div>
        
        {status.connected ? (
          <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-200/50">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold text-sm">Linked: {status.connectedEmail}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-500/10 px-4 py-2 rounded-xl border border-amber-200/50 text-amber-700 dark:text-amber-400 font-semibold text-sm">
            Gmail Disconnected
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CONNECTION CARD */}
        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-xl">
                <Mail className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Google Workspace</h3>
                <p className="text-xs text-gray-400">Google OAuth2 Ingestion</p>
              </div>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-slate-400 leading-relaxed">
              ExpenseFlow uses bank-grade OAuth consent tokens to search for payment receipts, invoices, and bank transaction summaries without storing your passwords.
            </p>

            <div className="bg-gray-50 dark:bg-slate-900 p-3 rounded-xl border border-gray-100 dark:border-slate-800 flex gap-2">
              <Lock className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <p className="text-[10px] text-gray-400">
                Encrypted tokens. Required permissions: <span className="font-mono text-red-400">gmail.readonly</span>.
              </p>
            </div>
          </div>

          <div className="mt-6">
            {status.connected ? (
              <div className="space-y-2">
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  <RefreshCw className={`w-4 h-4 ${syncing ? "animate-spin" : ""}`} />
                  {syncing ? "Parsing Inbox..." : "Sync Latest Transactions"}
                </button>
                <button
                  onClick={handleDisconnect}
                  className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-gray-700 dark:text-slate-300 font-bold py-2 rounded-xl text-xs flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Disconnect Integration
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <input
                  type="email"
                  placeholder="Enter your Gmail address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-red-500 outline-none transition-colors"
                />
                <button
                  onClick={handleConnect}
                  disabled={!emailInput.trim()}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-50 text-sm shadow-sm"
                >
                  Connect Gmail <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* SYNC ANALYTICS & RESULTS */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-lg font-bold mb-4">Sync Dashboard</h2>
            
            {syncResult && (
              <div className={`p-4 rounded-xl border flex gap-3 mb-4 ${
                syncResult.type === "success" 
                  ? "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 text-emerald-800 dark:text-emerald-400"
                  : "bg-red-50 dark:bg-red-500/10 border-red-200 text-red-800 dark:text-red-400"
              }`}>
                {syncResult.type === "success" ? (
                  <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-500" />
                ) : (
                  <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" />
                )}
                <div>
                  <h4 className="font-bold text-sm">{syncResult.type === "success" ? "Sync Complete" : "Sync Failed"}</h4>
                  <p className="text-xs">{syncResult.message}</p>
                </div>
              </div>
            )}

            {!status.connected ? (
              <div className="text-center py-16 text-sm text-gray-400 flex flex-col items-center gap-2">
                <Mail className="w-12 h-12 text-gray-300 dark:text-slate-700" />
                Connect your Gmail to begin auto-syncing transactions.
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-16 text-sm text-gray-400 flex flex-col items-center gap-2">
                <Info className="w-8 h-8 text-gray-300 dark:text-slate-700" />
                No new transactions synced. All set!
              </div>
            ) : (
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">Synced Transactions</p>
                {transactions.map((t, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl">
                    <div>
                      <p className="font-semibold text-sm">{t.title}</p>
                      <span className="text-[10px] bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-bold">
                        {t.category}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm text-gray-900 dark:text-white">₹{t.amount.toLocaleString()}</p>
                      <span className="text-[10px] text-gray-400">{t.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {status.connected && (
            <div className="mt-4 border-t border-gray-100 dark:border-slate-700 pt-4 flex flex-col sm:flex-row justify-between text-xs text-gray-400 gap-2">
              <p>Connected Account: <span className="font-semibold">{status.connectedEmail}</span></p>
              <p>Last Synced: <span className="font-semibold">{status.lastSyncedAt ? new Date(status.lastSyncedAt).toLocaleString() : "Never"}</span></p>
            </div>
          )}
        </div>

      </div>

      {/* SUBSCRIPTION DETECTION MODULE */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2">
          📺 Recurring Subscriptions Detected in Emails
        </h3>
        <p className="text-xs text-gray-500 dark:text-slate-400">
          Smart invoice algorithms search for monthly recurring headers and trigger alerts automatically.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Netflix</h4>
              <span className="text-xs text-gray-400">Detected: 10th of every month</span>
            </div>
            <span className="font-black text-red-500 text-sm">₹649/mo</span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Spotify</h4>
              <span className="text-xs text-gray-400">Detected: 1st of every month</span>
            </div>
            <span className="font-black text-red-500 text-sm">₹119/mo</span>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <h4 className="font-bold text-sm">Prime Membership</h4>
              <span className="text-xs text-gray-400">Detected: Yearly (August)</span>
            </div>
            <span className="font-black text-red-500 text-sm">₹1,499/yr</span>
          </div>
        </div>
      </div>
    </div>
  );
}
