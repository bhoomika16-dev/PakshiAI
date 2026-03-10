import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bird, Mail, Lock, AlertTriangle, ArrowRight, Loader } from 'lucide-react';

const LoginPage = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Simulate Auth - Hardcoded for demo/dev purposes
        setTimeout(() => {
            if (email === "demo@pakshiai.com" && password === "pakshi123") {
                const userData = {
                    id: 1,
                    name: "Field Researcher",
                    email: email,
                    role: "Explorer"
                };
                localStorage.setItem('pakshiai_user', JSON.stringify(userData));
                // ENSURE HISTORY IS NULL FOR FIRST LOGIN (If no previous history exists)
                if (!localStorage.getItem('pakshiai_history')) {
                    localStorage.setItem('pakshiai_history', JSON.stringify([]));
                }
                window.location.href = '/';
            } else {
                setError("Invalid credentials. Try demo@pakshiai.com / pakshi123");
                setLoading(false);
            }
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#0a101f]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
                            <Bird className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Secure Hub</h2>
                        <p className="text-blue-300/40 text-sm font-bold uppercase tracking-widest">Acoustic Research Access</p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em] ml-2">Researcher Email</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                                    placeholder="your@institute.edu"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-blue-500/50 uppercase tracking-[0.2em] ml-2">Authorization Key</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-hover:text-blue-500 transition-colors" size={20} />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500/50 focus:bg-white/10 transition-all font-medium"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-2 text-red-400 bg-red-500/5 border border-red-500/20 p-4 rounded-2xl text-xs font-bold shadow-lg">
                                <AlertTriangle size={16} /> {error}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 group"
                        >
                            {loading ? <Loader className="animate-spin" size={20} /> : <>Initialize Access <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></>}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <p className="text-white/20 text-xs font-bold uppercase tracking-widest">
                            New to the field? <a href="/signup" className="text-blue-500 hover:underline border-b border-transparent hover:border-blue-500">Apply for Access</a>
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default LoginPage;
