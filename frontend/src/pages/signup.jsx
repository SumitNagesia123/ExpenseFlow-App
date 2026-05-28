import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";

const Signup = () => {
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await api.post("/auth/signup", form);

            alert("Signup successful");

            navigate("/login");
        } catch (err) {
            console.error(err);

            alert(
                err?.response?.data?.message ||
                err?.response?.data?.error ||
                "Signup failed"
            );
        }
    };

    return (
        <div className="min-h-screen bg-[#0F131B] flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center text-indigo-500">
                    <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                        <div className="w-4 h-4 bg-white rounded-sm" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
                    Create your account
                </h2>
                <p className="mt-2 text-center text-sm text-slate-400">
                    Join ExpenseFlow and spend smarter.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#1A1F2C] py-8 px-4 sm:rounded-2xl sm:px-10 border border-white/[0.08] backdrop-blur-xl">
                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label className="block text-sm font-medium text-slate-300">Full Name</label>
                            <div className="mt-1">
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    value={form.name}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Email address</label>
                            <div className="mt-1">
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300">Password</label>
                            <div className="mt-1">
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    value={form.password}
                                    onChange={handleChange}
                                    className="appearance-none block w-full px-4 py-3 bg-white/[0.04] border border-white/[0.08] rounded-xl placeholder-slate-500 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent sm:text-sm transition-colors"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-[0_0_20px_rgba(124,58,237,0.3)] text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1F2C] focus:ring-indigo-500 transition-all hover:-translate-y-0.5"
                            >
                                Sign up
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/[0.08]" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-[#1A1F2C] text-slate-400">
                                    Already have an account?
                                </span>
                            </div>
                        </div>

                        <div className="mt-6">
                            <a
                                href="/login"
                                className="w-full flex justify-center py-3 px-4 border border-white/[0.08] rounded-xl text-sm font-medium text-slate-200 bg-white/[0.04] hover:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#1A1F2C] focus:ring-indigo-500 transition-colors"
                            >
                                Sign in instead
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Signup;