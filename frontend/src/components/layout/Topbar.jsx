import ThemeToggle from "../ThemeToggle";
import { useState, useRef, useEffect } from "react";
import { LogOut, UserCircle, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Topbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const userName = user.name ? user.name.split(" ")[0] : "";
  const initial = userName ? userName[0].toUpperCase() : "U";

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 shrink-0
                       bg-[#FAFAF8] border-b border-stone-200/60
                       dark:bg-[#1e293b] dark:border-white/[0.06]">
      
      {/* Greeting */}
      <p className="font-medium text-stone-700 dark:text-slate-100">
        Hi {userName} <span role="img" aria-label="wave">👋</span>
      </p>

      {/* Right section */}
      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm rounded-full
                    bg-white border border-stone-200/60 text-stone-500
                    focus-within:ring-2 focus-within:ring-indigo-500/40 focus-within:border-indigo-300
                    dark:bg-white/[0.04] dark:border-white/[0.06]
                    dark:text-slate-400 transition-all">
          <Search className="w-3.5 h-3.5" />
          <input
            type="text"
            placeholder="Search..."
            className="bg-transparent outline-none placeholder-stone-400 dark:placeholder-slate-500 text-stone-800 dark:text-slate-100 w-28 focus:w-40 transition-all"
          />
        </div>

        {/* Avatar Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="w-9 h-9 rounded-full flex items-center justify-center
                       bg-indigo-100 text-indigo-700 font-bold text-lg shadow-sm
                       dark:bg-indigo-900/50 dark:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-transform hover:scale-105">
            {initial}
          </button>
          
          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#334155] rounded-xl shadow-lg py-1 border border-stone-200/60 dark:border-white/[0.08] z-50">
              <div className="px-4 py-2 border-b border-stone-100 dark:border-white/[0.06]">
                <p className="text-sm font-medium text-stone-900 dark:text-white">{userName}</p>
                <p className="text-xs text-stone-500 dark:text-slate-400">{user.email || 'user@example.com'}</p>
              </div>
              <button 
                onClick={() => {
                  setShowDropdown(false);
                  navigate('/profile');
                }}
                className="w-full text-left px-4 py-2 text-sm text-stone-700 dark:text-slate-200 hover:bg-stone-50 dark:hover:bg-white/[0.04] flex items-center gap-2 transition-colors">
                <UserCircle className="w-4 h-4" />
                Profile
              </button>
              <button 
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 transition-colors">
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
