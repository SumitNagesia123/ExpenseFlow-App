import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  CreditCard,
  PieChart,
  Wallet,
  User,
  Settings,
  LogOut,
  Bot,
  Zap,
  Brain,
  Target,
  Mail,
} from "lucide-react";

/* ==========================================================
   NAVIGATION CONFIG  –  single source of truth
   ========================================================== */

const mainNavItems = [
  // ── Core ────────────────────────────────────────────────
  { to: "/dashboard", label: "Dashboard", icon: Home },
  { to: "/expenses", label: "Expenses", icon: CreditCard },
  { to: "/budget", label: "Budget", icon: Wallet },
  { to: "/analytics", label: "Analytics", icon: PieChart },

  // ── AI Intelligence ─────────────────────────────────────
  { to: "/ai-assistant", label: "AI Assistant", icon: Bot, section: "AI Intelligence" },
  { to: "/ai-coach", label: "AI Coach", icon: Brain },

  // ── Fintech Pipeline ────────────────────────────────────
  { to: "/realtime", label: "Realtime Pipeline", icon: Zap, section: "Fintech" },
  { to: "/goals", label: "Goals", icon: Target },
  { to: "/gmail-sync", label: "Gmail Sync", icon: Mail },
];

const bottomNavItems = [
  { to: "/profile", label: "Profile", icon: User },
  { to: "/settings", label: "Settings", icon: Settings },
];

/* ==========================================================
   SIDEBAR COMPONENT
   ========================================================== */

export default function Sidebar({ isMobileMenuOpen, setIsMobileMenuOpen }) {
  const navigate = useNavigate();
  const location = useLocation();

  /* ── Dynamic link styling with premium transitions ───── */
  const linkClass = ({ isActive }) =>
    [
      "group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium",
      "transition-all duration-200 ease-out",
      isActive
        ? "bg-indigo-600/10 text-indigo-700 dark:bg-indigo-500/10 dark:text-indigo-400"
        : "text-stone-500 hover:bg-stone-100 hover:text-stone-800 dark:text-slate-400 dark:hover:bg-white/[0.04] dark:hover:text-slate-200",
    ].join(" ");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  /* ── Section header renderer ─────────────────────────── */
  const SectionLabel = ({ label }) => (
    <p className="px-4 pt-5 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-stone-400 dark:text-slate-600 select-none">
      {label}
    </p>
  );

  /* ── Navigation item renderer ────────────────────────── */
  const NavItem = ({ to, label, icon: Icon }) => (
    <NavLink 
      to={to} 
      className={linkClass}
      onClick={() => setIsMobileMenuOpen && setIsMobileMenuOpen(false)}
    >
      <Icon className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
      <span className="truncate">{label}</span>
      {/* Active indicator dot */}
      {location.pathname === to && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
      )}
    </NavLink>
  );

  return (
    <aside className={`
      fixed inset-y-0 left-0 z-50 w-64 h-full
      bg-[#FAFAF8] dark:bg-[#1e293b] border-r border-stone-200/60 dark:border-white/[0.06] 
      flex flex-col transition-transform duration-300 ease-in-out
      md:relative md:translate-x-0
      ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
    `}>
      {/* ── LOGO ────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-xl font-bold text-stone-800 dark:text-white tracking-tight">
          Expense
          <span className="text-indigo-600 dark:text-indigo-400">Flow</span>
        </h1>
        <p className="text-[10px] font-medium text-stone-400 dark:text-slate-600 mt-0.5 tracking-wide">
          AI Financial OS
        </p>
      </div>

      {/* ── MAIN NAVIGATION ─────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 space-y-0.5 scrollbar-thin">
        {mainNavItems.map((item, idx) => (
          <div key={item.to}>
            {item.section && <SectionLabel label={item.section} />}
            {/* Add subtle divider before first section item when it's not the first overall item */}
            {item.section && idx > 0 && (
              <div className="mx-4 mb-1" />
            )}
            <NavItem {...item} />
          </div>
        ))}
      </nav>

      {/* ── DIVIDER ─────────────────────────────────────── */}
      <div className="mx-5 border-t border-stone-200/60 dark:border-white/[0.06] my-2" />

      {/* ── ACCOUNT / SETTINGS ──────────────────────────── */}
      <div className="px-3 pb-4 space-y-0.5">
        {bottomNavItems.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}

        <button
          onClick={handleLogout}
          className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all duration-200 ease-out w-full"
        >
          <LogOut className="w-[18px] h-[18px] shrink-0 transition-transform duration-200 group-hover:scale-110" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}