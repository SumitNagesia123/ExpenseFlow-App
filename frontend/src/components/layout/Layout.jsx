import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout() {
  return (
    <div className="flex h-screen w-full bg-[#F4F2EE] dark:bg-[#0f172a] overflow-hidden transition-colors">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar />

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-y-auto
                         bg-[#F4F2EE] text-gray-900
                         dark:bg-[#0f172a] dark:text-slate-100 transition-colors">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
