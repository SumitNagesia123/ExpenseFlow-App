import { useState, useEffect } from "react";
import { User, Mail, Save, Edit2 } from "lucide-react";

export default function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState("User");
  const [email, setEmail] = useState("user@example.com");

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (user.name) setName(user.name);
    if (user.email) setEmail(user.email);
  }, []);

  const handleSave = () => {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...user, name, email };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setIsEditing(false);
    // Note: To fully propagate to the Topbar without Context, a reload would be needed, 
    // but for UX we just save it to local storage.
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-1">
            Manage your personal information
          </p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1e293b] text-stone-700 dark:text-slate-200 text-sm font-medium rounded-xl border border-stone-200/60 dark:border-white/[0.08] hover:bg-stone-50 dark:hover:bg-white/[0.04] transition-colors shadow-sm"
          >
            <Edit2 className="w-4 h-4" />
            Edit Profile
          </button>
        ) : (
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        )}
      </div>

      <div className="bg-white dark:bg-[#1e293b] p-6 sm:p-8 rounded-2xl shadow-sm border border-stone-200/60 dark:border-white/[0.06] transition-colors">
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-stone-100 dark:border-white/[0.06]">
          <div className="w-20 h-20 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-2xl font-bold shadow-inner">
            {name ? name[0].toUpperCase() : "U"}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{name}</h2>
            <p className="text-gray-500 dark:text-slate-400">{email}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <User className="w-4 h-4 text-gray-400" />
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-stone-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="John Doe"
                />
              ) : (
                <div className="px-4 py-2.5 rounded-xl border border-transparent bg-stone-50 dark:bg-white/[0.03] text-stone-900 dark:text-white">
                  {name}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-slate-300 flex items-center gap-2">
                <Mail className="w-4 h-4 text-gray-400" />
                Email Address
              </label>
              {isEditing ? (
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-stone-200/60 dark:border-white/[0.08] bg-white dark:bg-white/[0.04] text-stone-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all outline-none"
                  placeholder="john@example.com"
                />
              ) : (
                <div className="px-4 py-2.5 rounded-xl border border-transparent bg-stone-50 dark:bg-white/[0.03] text-stone-900 dark:text-white">
                  {email}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
