import { Link } from "react-router-dom";
import { 
  BarChart3, ShieldCheck, TrendingUp, Search, 
  Database, Server, LayoutDashboard,
  Star, Quote, CheckCircle2 
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#0F131B] text-slate-100 font-sans selection:bg-[#7C3AED]/30">
      {/* ================= HEADER ================= */}
      <header className="sticky top-0 z-50 bg-[#0F131B]/80 backdrop-blur-md border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-white">
            <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center text-white">
              <TrendingUp className="w-5 h-5" />
            </div>
            ExpenseFlow
          </div>
          <nav className="hidden md:flex gap-8 text-[15px] font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-[15px] font-medium text-slate-400 hover:text-white transition-colors hidden sm:block">
              Sign in
            </Link>
            <Link to="/signup" className="bg-[#7C3AED] text-white px-5 py-2.5 rounded-full text-[15px] font-medium hover:bg-[#6D28D9] transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative pt-24 pb-32 overflow-hidden bg-[#0F131B]">
        {/* Subtle glow effect behind hero */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[500px] bg-[#7C3AED]/10 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/[0.04] border border-white/[0.08] mb-8 backdrop-blur-sm">
            <div className="flex -space-x-2">
              <img src="https://i.pravatar.cc/100?img=1" className="w-6 h-6 rounded-full border-2 border-[#0F131B]" alt="user" />
              <img src="https://i.pravatar.cc/100?img=2" className="w-6 h-6 rounded-full border-2 border-[#0F131B]" alt="user" />
              <img src="https://i.pravatar.cc/100?img=3" className="w-6 h-6 rounded-full border-2 border-[#0F131B]" alt="user" />
            </div>
            <span className="text-[13px] font-medium text-slate-300">Trusted by 500+ users ⭐</span>
          </div>

          <h1 className="text-[48px] md:text-[64px] font-extrabold leading-[1.1] tracking-tight text-white mb-6 drop-shadow-sm">
            The smarter way to track <br className="hidden md:block"/> expenses and spend wisely.
          </h1>
          <p className="text-lg text-[#94A3B8] mb-10 max-w-2xl mx-auto leading-relaxed">
            Connect your UPI data, visualize spending patterns, and stay in control of your finances — powered by real MySQL data and Node.js backend.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/signup" className="w-full sm:w-auto bg-[#7C3AED] text-white px-8 py-3.5 rounded-full text-base font-semibold hover:bg-[#6D28D9] transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]">
              Get Started Free
            </Link>
            <a href="#how-it-works" className="w-full sm:w-auto bg-white/[0.04] text-white border border-white/[0.08] px-8 py-3.5 rounded-full text-base font-semibold hover:bg-white/[0.08] hover:border-white/[0.12] transition-all">
              See How It Works
            </a>
          </div>
        </div>

        {/* Hero Mockup Overlapping next section */}
        <div className="max-w-5xl mx-auto px-6 mt-16 relative z-10 -mb-48">
          <div className="bg-[#1A1F2C]/70 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl p-4 sm:p-6 overflow-hidden relative">
             <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none"></div>
            {/* Mockup Top Header */}
            <div className="flex items-center justify-between mb-6 border-b border-white/[0.06] pb-4 relative z-10">
              <div>
                <p className="text-[13px] font-medium text-[#94A3B8]">Total Spent (This Month)</p>
                <h3 className="text-3xl font-bold text-white tabular-nums mt-1">₹1,28,673.97</h3>
              </div>
              <div className="hidden sm:flex gap-2">
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">Food: 14%</span>
                <span className="px-3 py-1 bg-[#7C3AED]/10 text-[#7C3AED] text-[11px] font-bold uppercase tracking-wider rounded-full border border-[#7C3AED]/20">Bills: 42%</span>
              </div>
            </div>
            {/* Mockup Body */}
            <div className="grid md:grid-cols-3 gap-6 relative z-10">
              <div className="md:col-span-2 bg-[#0F131B]/50 rounded-xl border border-white/[0.04] h-48 flex items-end justify-between p-4 px-6 relative overflow-hidden">
                {/* Fake Area Chart */}
                <svg className="absolute bottom-0 left-0 w-full h-32" preserveAspectRatio="none" viewBox="0 0 100 100">
                   <path d="M0,100 C20,80 40,90 60,40 C80,10 90,30 100,20 L100,100 Z" fill="url(#grad1)" />
                   <defs>
                     <linearGradient id="grad1" x1="0%" y1="0%" x2="0%" y2="100%">
                       <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                       <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.0" />
                     </linearGradient>
                   </defs>
                   <path d="M0,100 C20,80 40,90 60,40 C80,10 90,30 100,20" fill="none" stroke="#7C3AED" strokeWidth="2" />
                </svg>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-[#1A1F2C] rounded-xl border border-white/[0.04] shadow-sm hover:border-white/[0.08] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-lg border border-white/[0.04]">🛍️</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-slate-200">Amazon</p>
                    <p className="text-[11px] text-[#94A3B8]">Shopping</p>
                  </div>
                  <span className="text-[13px] font-bold text-white tabular-nums">−₹4,200</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1A1F2C] rounded-xl border border-white/[0.04] shadow-sm hover:border-white/[0.08] transition-colors">
                   <div className="w-10 h-10 rounded-full bg-white/[0.04] flex items-center justify-center text-lg border border-white/[0.04]">🍔</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-slate-200">Zomato</p>
                    <p className="text-[11px] text-[#94A3B8]">Food</p>
                  </div>
                  <span className="text-[13px] font-bold text-white tabular-nums">−₹850</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-[#1A1F2C] rounded-xl border border-white/[0.04] shadow-sm hover:border-white/[0.08] transition-colors">
                   <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-lg border border-emerald-500/20">💸</div>
                  <div className="flex-1">
                    <p className="text-[13px] font-semibold text-slate-200">Salary</p>
                    <p className="text-[11px] text-[#94A3B8]">Income</p>
                  </div>
                  <span className="text-[13px] font-bold text-emerald-400 tabular-nums">+₹85,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= VALUE PROP STRIP ================= */}
      <section className="bg-[#0A0D14] pt-64 pb-24 border-b border-white/[0.04] relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(124,58,237,0.05)_0%,transparent_70%)] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-3 gap-16 relative z-10">
          <div className="lg:col-span-1">
            <span className="text-[13px] font-bold tracking-wider uppercase text-[#7C3AED] mb-3 block">Why choose ExpenseFlow?</span>
            <h2 className="text-[32px] font-bold text-white leading-tight">
              Why users switch to ExpenseFlow for their finances.
            </h2>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-8">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A1F2C] border border-white/[0.08] flex items-center justify-center">
                <Search className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <h3 className="text-[18px] font-semibold text-slate-200">Clarity, always</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Track every UPI transaction instantly. Know exactly where your money goes without the guesswork.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A1F2C] border border-white/[0.08] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <h3 className="text-[18px] font-semibold text-slate-200">Secure by default</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Your data stays local and private. Built on a secure MySQL backend, we prioritize your data privacy.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A1F2C] border border-white/[0.08] flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <h3 className="text-[18px] font-semibold text-slate-200">Close the month faster</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Automated category insights save hours. Ditch the spreadsheets and let our engines do the heavy lifting.</p>
            </div>
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#1A1F2C] border border-white/[0.08] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[#7C3AED]" />
              </div>
              <h3 className="text-[18px] font-semibold text-slate-200">Built for scale</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">From personal use to team deployments. The Node.js and Express architecture is designed for performance.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section className="bg-[#0F131B] py-16 border-b border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/[0.04]">
            <div className="py-4">
              <p className="text-[40px] font-extrabold text-white mb-2 tabular-nums">₹1.2L+</p>
              <p className="text-[15px] text-[#94A3B8] font-medium">Tracked this month</p>
            </div>
            <div className="py-4">
              <p className="text-[40px] font-extrabold text-white mb-2 tabular-nums">7</p>
              <p className="text-[15px] text-[#94A3B8] font-medium">Categories Auto-tagged</p>
            </div>
            <div className="py-4">
              <p className="text-[40px] font-extrabold text-white mb-2 tabular-nums">1,692</p>
              <p className="text-[15px] text-[#94A3B8] font-medium">Transactions Processed</p>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/[0.04] text-center">
            <p className="text-[13px] font-semibold uppercase tracking-widest text-[#94A3B8] mb-6">Powered By</p>
            <div className="flex flex-wrap justify-center items-center gap-10 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <span className="text-xl font-bold font-mono text-slate-300">MySQL</span>
              <span className="text-xl font-bold font-mono text-slate-300">Node.js</span>
              <span className="text-xl font-bold font-mono text-slate-300">Express</span>
              <span className="text-xl font-bold font-mono text-slate-300">Paytm UPI Dataset</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= TESTIMONIAL ================= */}
      <section className="bg-[#0A0D14] py-24 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[600px] h-[300px] bg-[#7C3AED]/5 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 relative z-10">
          <div className="bg-[#1A1F2C] rounded-2xl shadow-2xl border border-white/[0.08] p-10 md:p-14 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-[#7C3AED]"></div>
            <Quote className="w-10 h-10 text-white/[0.05] absolute top-8 left-8" />
            <h3 className="text-2xl md:text-3xl font-medium text-white leading-relaxed mb-8 relative z-10">
              "Since I started using ExpenseFlow, I've noticed a significant improvement in how organized I am at managing my finances."
            </h3>
            <div className="flex flex-col items-center">
              <img src="https://i.pravatar.cc/150?img=11" alt="Sumit R." className="w-12 h-12 rounded-full mb-3 shadow-md border border-white/10" />
              <p className="text-[15px] font-bold text-white">Sumit R.</p>
              <p className="text-[13px] text-[#94A3B8]">Developer & Creator, ExpenseFlow</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SOCIAL PROOF ================= */}
      <section className="bg-[#0F131B] py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] font-bold text-center text-white mb-12">Trusted by developers who move fast.</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Alex Mercer", role: "Software Engineer", img: "15", quote: "An incredible platform. It completely transformed how I handle my personal ledger. The UI is just chef's kiss." },
              { name: "Sarah Jenkins", role: "Product Manager", img: "23", quote: "I love how fast and intuitive ExpenseFlow is. Getting insights into my monthly spending has never been easier." },
              { name: "David Chen", role: "Freelance Designer", img: "32", quote: "Finally a finance app that looks as good as it works. The dark mode in the dashboard is beautifully executed." }
            ].map((user, i) => (
              <div key={i} className="bg-[#1A1F2C] border border-white/[0.06] rounded-2xl p-6 shadow-sm hover:border-white/[0.15] transition-colors">
                <div className="flex gap-1 mb-4">
                  {[1,2,3,4,5].map(star => <Star key={star} className="w-4 h-4 fill-[#7C3AED] text-[#7C3AED]" />)}
                </div>
                <p className="text-[15px] text-slate-300 leading-relaxed mb-6">
                  "{user.quote}"
                </p>
                <div className="flex items-center gap-3">
                   <img src={`https://i.pravatar.cc/100?img=${user.img}`} alt={user.name} className="w-10 h-10 rounded-full border border-white/10" />
                   <div>
                     <p className="text-[14px] font-bold text-white">{user.name}</p>
                     <p className="text-[12px] text-[#94A3B8]">{user.role}</p>
                   </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURES ================= */}
      <section id="features" className="bg-[#0A0D14] py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[13px] font-bold tracking-wider uppercase text-[#7C3AED] mb-3 block">Features</span>
            <h2 className="text-[32px] font-bold text-white leading-tight">Everything you need to manage your expenses in one place.</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#1A1F2C] p-8 rounded-2xl border border-white/[0.06] shadow-sm hover:border-white/[0.15] transition-colors group">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED]/10 group-hover:border-[#7C3AED]/20 transition-colors">
                <Database className="w-6 h-6 text-slate-300 group-hover:text-[#7C3AED] transition-colors" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">Data Ingestion</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Secure API endpoints handle incoming UPI transactions seamlessly from CSVs or direct payloads.</p>
            </div>
            <div className="bg-[#1A1F2C] p-8 rounded-2xl border border-white/[0.06] shadow-sm hover:border-white/[0.15] transition-colors group">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED]/10 group-hover:border-[#7C3AED]/20 transition-colors">
                <Server className="w-6 h-6 text-slate-300 group-hover:text-[#7C3AED] transition-colors" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">Processing & Storage</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Powered by a robust MySQL database and Node+Express backend for a real-time, reliable ledger.</p>
            </div>
            <div className="bg-[#1A1F2C] p-8 rounded-2xl border border-white/[0.06] shadow-sm hover:border-white/[0.15] transition-colors group">
              <div className="w-12 h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#7C3AED]/10 group-hover:border-[#7C3AED]/20 transition-colors">
                <LayoutDashboard className="w-6 h-6 text-slate-300 group-hover:text-[#7C3AED] transition-colors" />
              </div>
              <h3 className="text-[18px] font-semibold text-white mb-3">Insights & Dashboard</h3>
              <p className="text-[15px] text-[#94A3B8] leading-relaxed">Beautiful category charts, dynamic budget limits, and actionable spending trend analytics.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section id="how-it-works" className="bg-[#0F131B] py-24 border-t border-white/[0.04]">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-[32px] font-bold text-center text-white mb-16">How It Works — 3 simple steps.</h2>
          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Dashed line connecting steps (hidden on mobile) */}
            <div className="hidden md:block absolute top-6 left-[16.66%] right-[16.66%] h-0.5 border-t-2 border-dashed border-white/10 z-0"></div>

            {[
              { step: 1, title: "Connect Your Data", desc: "Sync your Paytm UPI CSV or use the REST API." },
              { step: 2, title: "Auto-Process & Store", desc: "Node.js parses the data and stores it into MySQL." },
              { step: 3, title: "Visualize & Decide", desc: "Your dashboard updates with live charts and insights." },
            ].map(item => (
              <div key={item.step} className="relative z-10 flex flex-col items-center text-center bg-[#0F131B] px-4">
                <div className="w-12 h-12 bg-[#1A1F2C] border border-white/10 text-white rounded-full flex items-center justify-center text-xl font-bold mb-6 ring-8 ring-[#0F131B] shadow-sm">
                  <span className="bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent">{item.step}</span>
                </div>
                <h3 className="text-[18px] font-semibold text-white mb-3">{item.title}</h3>
                <p className="text-[15px] text-[#94A3B8] max-w-[260px] leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= PRICING ================= */}
      <section id="pricing" className="bg-[#0A0D14] py-24 border-t border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-[32px] font-bold text-center text-white mb-16">Simple, Transparent Pricing.</h2>
          <div className="grid md:grid-cols-2 gap-8">
            {/* Free Card */}
            <div className="bg-[#1A1F2C] rounded-2xl border border-white/[0.08] p-8 shadow-sm">
              <h3 className="text-[18px] font-semibold text-white mb-2">Free</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[40px] font-extrabold text-white tabular-nums">₹0</span>
                <span className="text-[15px] text-[#94A3B8]">/month</span>
              </div>
              <p className="text-[15px] text-[#94A3B8] mb-8 h-12">Perfect for individuals wanting to test the portfolio demo.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Full analytics access
                </li>
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Paytm UPI dataset
                </li>
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Dashboard & Reports
                </li>
              </ul>
              <Link to="/signup" className="block w-full py-3.5 rounded-full text-center text-[15px] font-semibold text-white bg-white/[0.04] border border-white/[0.08] hover:bg-white/[0.08] transition-colors">
                Get Started Free
              </Link>
            </div>

            {/* Pro Card */}
            <div className="bg-[#1A1F2C] rounded-2xl border-2 border-[#7C3AED] p-8 shadow-[0_0_30px_rgba(124,58,237,0.15)] relative">
              <span className="absolute -top-3.5 right-8 bg-[#7C3AED] text-white text-[12px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">Coming Soon</span>
              <h3 className="text-[18px] font-semibold text-white mb-2">Pro Conceptual</h3>
              <div className="flex items-baseline gap-1 mb-6">
                <span className="text-[40px] font-extrabold text-white tabular-nums">₹499</span>
                <span className="text-[15px] text-[#94A3B8]">/month</span>
              </div>
              <p className="text-[15px] text-[#94A3B8] mb-8 h-12">Roadmap features designed for advanced financial tracking.</p>
              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Automated ML tracking
                </li>
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Smart alerts & insights
                </li>
                <li className="flex items-center gap-3 text-[15px] text-slate-300">
                  <CheckCircle2 className="w-5 h-5 text-[#7C3AED]" /> Team collaboration
                </li>
              </ul>
              <button disabled className="block w-full py-3.5 rounded-full text-center text-[15px] font-semibold text-white bg-[#7C3AED] opacity-50 cursor-not-allowed">
                Roadmap Preview
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= PROJECT STATUS BANNER ================= */}
      <section className="bg-[#7C3AED]/10 py-12 border-t border-[#7C3AED]/20">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-[15px] text-[#7C3AED] font-medium flex flex-col md:flex-row items-center justify-center gap-2">
            ExpenseFlow is a portfolio project built with real financial data.
            <span className="hidden md:inline text-[#7C3AED]/50">•</span>
            MySQL + Node.js + Express + Paytm UPI Dataset
          </p>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="bg-[#0A0D14] py-16 text-white border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 text-xl font-bold text-white mb-4">
              <div className="w-8 h-8 rounded-lg bg-[#7C3AED] flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              ExpenseFlow
            </div>
            <p className="text-[14px] text-[#94A3B8] leading-relaxed">
              The smarter way to track expenses and spend wisely.
            </p>
          </div>
          
          <div>
            <h4 className="text-[15px] font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-3 text-[14px] text-[#94A3B8]">
              <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold mb-4 text-white">Legal</h4>
            <ul className="space-y-3 text-[14px] text-[#94A3B8]">
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-[15px] font-semibold mb-4 text-white">Built With</h4>
            <ul className="space-y-3 text-[14px] text-[#94A3B8]">
              <li>MySQL</li>
              <li>Node.js</li>
              <li>Express</li>
              <li>Paytm UPI</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 pt-8 border-t border-white/[0.04] text-center text-[13px] text-[#94A3B8]">
          © 2025 ExpenseFlow. Portfolio Project.
        </div>
      </footer>
    </div>
  );
}
