export default function Navbar() {
  return (
    <nav className="w-full bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg dark:text-white">
          <span className="text-indigo-600 dark:text-indigo-500">▢</span>
          ExpenseFlow
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-gray-600 dark:text-slate-400">
          <a href="#features" className="hover:text-black dark:hover:text-white transition-colors">Features</a>
          <a href="#how" className="hover:text-black dark:hover:text-white transition-colors">How It Works</a>
          <a href="#pricing" className="hover:text-black dark:hover:text-white transition-colors">Pricing</a>
        </div>

        <button className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
          View Demo
        </button>
      </div>
    </nav>
  );
}
