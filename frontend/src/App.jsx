import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Layout + Route guard (always eagerly loaded)
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

/* ==========================================================
   PUBLIC PAGES  –  eager load (critical rendering path)
   ========================================================== */
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/signup";

/* ==========================================================
   PROTECTED PAGES  –  lazy loaded for code-splitting
   ========================================================== */
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Expenses = lazy(() => import("./pages/Expenses"));
const Budget = lazy(() => import("./pages/Budget"));
const Analytics = lazy(() => import("./pages/Analytics"));
const AiAssistant = lazy(() => import("./pages/AiAssistant"));
const AiCoach = lazy(() => import("./pages/AiCoach"));
const RealtimeDashboard = lazy(() => import("./pages/RealtimeDashboard"));
const Goals = lazy(() => import("./pages/Goals"));
const GmailSync = lazy(() => import("./pages/GmailSync"));
const Profile = lazy(() => import("./pages/Profile"));
const Settings = lazy(() => import("./pages/Settings"));

/* ==========================================================
   ROUTE CONFIG  –  scalable, declarative route manifest
   ========================================================== */
const protectedRoutes = [
  // ── Core ────────────────────────────────────────────────
  { path: "/dashboard", element: <Dashboard /> },
  { path: "/expenses", element: <Expenses /> },
  { path: "/budget", element: <Budget /> },
  { path: "/analytics", element: <Analytics /> },

  // ── AI Intelligence ─────────────────────────────────────
  { path: "/ai-assistant", element: <AiAssistant /> },
  { path: "/ai-coach", element: <AiCoach /> },

  // ── Fintech Pipeline ────────────────────────────────────
  { path: "/realtime", element: <RealtimeDashboard /> },
  { path: "/goals", element: <Goals /> },
  { path: "/gmail-sync", element: <GmailSync /> },

  // ── Account ─────────────────────────────────────────────
  { path: "/profile", element: <Profile /> },
  { path: "/settings", element: <Settings /> },
];

/* ==========================================================
   SUSPENSE FALLBACK
   ========================================================== */
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] gap-3">
      <span className="h-5 w-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
      <span className="text-sm text-gray-400 dark:text-slate-500 font-medium">
        Loading module…
      </span>
    </div>
  );
}

/* ==========================================================
   APP
   ========================================================== */
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* ================= PUBLIC ROUTES ================= */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* ================= PROTECTED ROUTES ================= */}
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {protectedRoutes.map(({ path, element }) => (
              <Route key={path} path={path} element={element} />
            ))}
          </Route>

          {/* ================= FALLBACK ================= */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
