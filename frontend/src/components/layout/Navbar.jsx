import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bird, History, Globe, User, LogOut, Menu, X, Edit2, Check, XCircle, LogIn, UserPlus, Activity, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const saved = localStorage.getItem('pakshiai_user');
        if (saved) {
            const parsed = JSON.parse(saved);
            setUser(parsed);
            setNewName(parsed.name);
        }

        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    const updateProfile = () => {
        if (!newName.trim()) return;
        const updated = { ...user, name: newName };
        localStorage.setItem('pakshiai_user', JSON.stringify(updated));
        setUser(updated);
        setIsEditing(false);
    };

    const navLinks = [
        { path: '/', label: 'Acoustic Hub', icon: <Bird size={18} /> },
        { path: '/visual-id', label: 'Visual ID', icon: <Camera size={18} /> },
        { path: '/catalog', label: 'Species Catalog', icon: <Globe size={18} /> },
        { path: '/species-index', label: 'Species Index', icon: <Activity size={18} /> },
        { path: '/dashboard', label: 'Insights Engine', icon: <Activity size={18} /> },
        { path: '/history', label: 'Field Logs', icon: <History size={18} /> },
    ];

    return (
        <nav className={clsx(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-500 px-4 md:px-8 py-4",
            (scrolled || isMenuOpen) ? "bg-[#0a101f]/90 backdrop-blur-2xl border-b border-white/5 py-3" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link to="/" className="group flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-500">
                        <Bird className="text-white w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-xl font-black text-white tracking-tighter leading-none">Pakshi<span className="text-blue-500">AI</span></span>
                        <span className="text-[10px] font-black text-blue-300/30 uppercase tracking-widest mt-1">Intelligence</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden lg:flex items-center bg-white/5 backdrop-blur-md rounded-2xl border border-white/5 p-1">
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                                location.pathname === link.path ? "text-white" : "text-white/30 hover:text-white/60"
                            )}
                        >
                            {location.pathname === link.path && (
                                <motion.div layoutId="nav-active" className="absolute inset-0 bg-white/10 shadow-inner" />
                            )}
                            <span className="relative z-10 flex items-center gap-2">
                                {link.icon} {link.label}
                            </span>
                        </Link>
                    ))}
                </div>

                {/* User Actions & Mobile Toggle */}
                <div className="flex items-center gap-2 md:gap-4">
                    {user ? (
                        <div className="flex items-center gap-3 md:pl-4 md:border-l border-white/10">
                            {isEditing ? (
                                <div className="hidden sm:flex items-center gap-1 bg-white/5 border border-blue-500/30 rounded-xl p-1 animate-fade-in">
                                    <input
                                        value={newName}
                                        onChange={e => setNewName(e.target.value)}
                                        className="bg-transparent text-sm text-white px-3 focus:outline-none w-32 font-bold"
                                        autoFocus
                                        onKeyDown={e => e.key === 'Enter' && updateProfile()}
                                    />
                                    <button onClick={updateProfile} className="p-1.5 text-green-400 hover:bg-green-400/10 rounded-lg"><Check size={16} /></button>
                                    <button onClick={() => { setIsEditing(false); setNewName(user.name); }} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg"><XCircle size={16} /></button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-3 text-white/60 hover:text-white transition-all group"
                                >
                                    <div className="hidden sm:flex flex-col items-end">
                                        <span className="text-[10px] font-black uppercase text-blue-500/50 leading-none mb-0.5 tracking-widest">Active Researcher</span>
                                        <span className="text-sm font-black tracking-tight text-white/90">{user.name}</span>
                                    </div>
                                    <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-600/20 to-blue-900/40 border border-blue-500/30 flex items-center justify-center group-hover:border-blue-500/60 transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                                        <User size={18} className="text-blue-400 group-hover:scale-110 transition-transform" />
                                    </div>
                                </button>
                            )}

                            <button
                                onClick={() => { localStorage.removeItem('pakshiai_user'); window.location.href = '/'; }}
                                className="hidden md:block p-2.5 text-white/20 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all border border-transparent hover:border-red-500/10"
                                title="Safe Logout"
                            >
                                <LogOut size={20} />
                            </button>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center gap-2">
                            <Link to="/login" className="px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white/40 hover:text-white transition-all">Sign In</Link>
                            <Link to="/signup" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95">Register</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button 
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2.5 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all"
                    >
                        {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMenuOpen && (
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:hidden mt-4 bg-[#0a101f] border border-white/5 rounded-3xl p-4 shadow-2xl space-y-2 overflow-hidden"
                >
                    {navLinks.map((link) => (
                        <Link
                            key={link.path}
                            to={link.path}
                            className={clsx(
                                "flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all",
                                location.pathname === link.path ? "bg-blue-600 text-white" : "text-white/40 hover:bg-white/5 hover:text-white"
                            )}
                        >
                            {link.icon} {link.label}
                        </Link>
                    ))}
                    {!user && (
                        <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/5 mt-4">
                            <Link to="/login" className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-white/5 text-xs font-black uppercase tracking-widest text-white">Login</Link>
                            <Link to="/signup" className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl bg-blue-600 text-xs font-black uppercase tracking-widest text-white">Join</Link>
                        </div>
                    )}
                    {user && (
                        <button 
                            onClick={() => { localStorage.removeItem('pakshiai_user'); window.location.href = '/'; }}
                            className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-red-400 bg-red-500/5 mt-4"
                        >
                            <LogOut size={18} /> Sign Out Systems
                        </button>
                    )}
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
