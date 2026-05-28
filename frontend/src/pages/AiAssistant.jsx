import { useEffect, useState } from "react";
import api from "../api/api";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

export default function AiAssistant() {
  const [loading, setLoading] = useState(true);
  const [predictions, setPredictions] = useState(null);
  const [savings, setSavings] = useState(null);

  const [chatMessage, setChatMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { role: "ai", text: "Hi! I am your ExpenseFlow AI Assistant. How can I help you optimize your finances today?" }
  ]);
  const [chatting, setChatting] = useState(false);

  useEffect(() => {
    const loadAiData = async () => {
      try {
        setLoading(true);
        const [predRes, savRes] = await Promise.all([
          api.get("/predictions/spending"),
          api.get("/predictions/savings")
        ]);

        setPredictions(predRes.data);
        setSavings(savRes.data);
      } catch (err) {
        console.error("Failed to load AI predictions", err);
      } finally {
        setLoading(false);
      }
    };
    loadAiData();
  }, []);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const userText = chatMessage;
    setChatMessage("");
    setChatHistory(prev => [...prev, { role: "user", text: userText }]);
    setChatting(true);

    try {
      const res = await api.post("/assistant/chat", { 
        message: userText,
        history: chatHistory
      });
      setChatHistory(prev => [...prev, { role: "ai", text: res.data.reply }]);
    } catch (err) {
      setChatHistory(prev => [...prev, { role: "ai", text: "Sorry, I am having trouble connecting to my servers right now." }]);
    } finally {
      setChatting(false);
    }
  };

  if (loading) return <div className="p-6 text-gray-400">Loading AI Engines...</div>;

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            🤖 AI Financial Assistant
          </h1>
          <p className="text-sm text-gray-500 dark:text-slate-400">
            Predictive forecasting & personalized financial intelligence.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PREDICTIONS & SAVINGS */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-indigo-900 to-slate-900 p-6 rounded-2xl text-white shadow-sm relative overflow-hidden">
               <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-indigo-500 rounded-full blur-3xl opacity-30"></div>
               <h3 className="text-indigo-200 text-sm font-semibold mb-1">Predicted Next Month Spend</h3>
               <p className="text-4xl font-bold">₹{(predictions?.predictedTotal || 0).toLocaleString()}</p>
               <p className="text-sm text-indigo-300 mt-2">Based on your 3-month moving average.</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
               <h3 className="text-gray-500 dark:text-slate-400 text-sm font-semibold mb-1">Achievable Savings</h3>
               <p className="text-4xl font-bold text-green-600 dark:text-green-400">
                 ₹{(savings?.achievablePotential || 0).toLocaleString()}
               </p>
               <p className="text-sm text-gray-500 dark:text-slate-400 mt-2">
                 Runway: <span className={savings?.projectedRunway === "Positive" ? "text-green-500" : "text-red-500"}>{savings?.projectedRunway}</span>
               </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Predicted Category Spend</h3>
            <div className="space-y-4">
              {(predictions?.predictedCategories || []).slice(0, 5).map(cat => (
                <div key={cat.category} className="flex justify-between items-center border-b border-gray-50 dark:border-slate-700/50 pb-2">
                  <span className="text-gray-700 dark:text-slate-300 font-medium">{cat.category}</span>
                  <span className="text-gray-900 dark:text-white font-bold">₹{cat.predicted.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI CHATBOT UI */}
        <div className="bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-2xl flex flex-col shadow-sm h-[500px]">
          <div className="p-4 border-b border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50 rounded-t-2xl">
            <h2 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <span className="text-xl">✨</span> Ask Copilot
            </h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatHistory.map((chat, idx) => (
              <div key={idx} className={`flex ${chat.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
                  chat.role === "user" 
                    ? "bg-indigo-600 text-white rounded-br-none" 
                    : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-bl-none"
                }`}>
                  {chat.text}
                </div>
              </div>
            ))}
            {chatting && (
              <div className="flex justify-start">
                <div className="bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-slate-200 rounded-2xl rounded-bl-none px-4 py-2 text-sm flex gap-1">
                  <span className="animate-bounce">.</span><span className="animate-bounce delay-75">.</span><span className="animate-bounce delay-150">.</span>
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-100 dark:border-slate-700 flex gap-2 bg-white dark:bg-slate-800 rounded-b-2xl">
            <input 
              type="text" 
              value={chatMessage}
              onChange={(e) => setChatMessage(e.target.value)}
              placeholder="Ask about your spending..." 
              className="flex-1 bg-gray-50 dark:bg-slate-700 text-gray-900 dark:text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button 
              type="submit" 
              disabled={chatting || !chatMessage.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl px-4 py-2 font-medium transition-colors disabled:opacity-50"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
