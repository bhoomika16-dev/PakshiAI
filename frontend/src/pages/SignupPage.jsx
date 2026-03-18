import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bird, Mail, Lock, User, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import api from '../utils/api';

const SignupPage = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleSignup = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('email', email);
        formData.append('password', password);

        try {
            const response = await api.post('/api/auth/signup', formData);
            
            if (response.data.status === 'success') {
                localStorage.setItem('pakshiai_user', JSON.stringify(response.data.user));
                localStorage.setItem('pakshiai_history', JSON.stringify([]));
                setLoading(false);
                setSuccess(true);
                setTimeout(() => {
                    window.location.href = '/';
                }, 1000);
            }
        } catch (err) {
            console.error("Signup error:", err);
            setLoading(false);
            alert(err.response?.data?.detail || "Registration failed. This email might already be in use.");
        }
    };

    return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center px-4 relative overflow-hidden">
            <div className="absolute top-1/4 -right-20 w-80 h-80 bg-cyan-600/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-1/4 -left-20 w-80 h-80 bg-blue-600/10 blur-[100px] rounded-full" />

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-[#0a101f]/80 backdrop-blur-3xl border border-white/5 rounded-[40px] p-10 shadow-2xl">
                    <div className="text-center mb-10">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-600/20">
                            <Bird className="text-white w-8 h-8" />
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase mb-2">Create Profile</h2>
                        <p className="text-blue-300/40 text-sm font-bold uppercase tracking-widest">Join the Global Repository</p>
                    </div>

                    {!success ? (
                        <form onSubmit={handleSignup} className="space-y-4">
                            <div className="space-y-2">
                                <label htmlFor="signup-name" className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        id="signup-name"
                                        name="name"
                                        type="text"
                                        placeholder="Enter your name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        required
                                        autoComplete="name"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="signup-email" className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        id="signup-email"
                                        name="email"
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        required
                                        autoComplete="email"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="signup-password" className="text-xs font-black uppercase tracking-widest text-white/30 ml-1">Create Password</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        id="signup-password"
                                        name="password"
                                        type="password"
                                        placeholder="Enter secure password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all font-bold"
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-white text-blue-900 font-black uppercase tracking-[0.2em] py-5 rounded-2xl shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader className="animate-spin" size={20} /> : <>Create Account <ArrowRight size={20} /></>}
                            </button>
                        </form>
                    ) : (
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="bg-green-500/10 border border-green-500/20 p-10 rounded-[32px] text-center"
                        >
                            <CheckCircle size={64} className="text-green-500 mx-auto mb-6" />
                            <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Access Granted</h3>
                            <p className="text-green-400 font-bold uppercase text-[10px] tracking-[0.2em]">Profile Initialized with Null History</p>
                        </motion.div>
                    )}

                    {!success && (
                        <div className="mt-8 text-center text-white/20 text-xs font-bold uppercase tracking-widest">
                            Already have a profile? <a href="/login" className="text-blue-500 hover:underline">Sign In</a>
                        </div>
                    )}
                </div>
            </motion.div>
        </div>
    );
};

export default SignupPage;
