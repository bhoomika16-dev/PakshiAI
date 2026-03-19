import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Bird, History, Globe, User, LogOut, Menu, X, Edit2, Check, XCircle, LogIn, UserPlus, Activity, Camera } from 'lucide-react';
import { motion } from 'framer-motion';
import clsx from 'clsx';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();
 
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
 
    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);
 
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
 
                {/* Mobile Toggle */}
                <div className="flex items-center gap-2 md:gap-4">
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
                </motion.div>
            )}
        </nav>
    );
};

export default Navbar;
