import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-[#F4F2EE] dark:bg-[#0f172a] overflow-hidden transition-colors relative">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <Sidebar isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Topbar */}
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Page Content */}
        <main className="p-4 md:p-6 flex-1 overflow-y-auto
                         bg-[#F4F2EE] text-gray-900
                         dark:bg-[#0f172a] dark:text-slate-100 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
