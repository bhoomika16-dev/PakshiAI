import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, Clock, MapPin, Bird, FileAudio, Search, Trash, Download, ExternalLink, Activity, Database, AlertCircle } from 'lucide-react';
import clsx from 'clsx';

const HistoryPage = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Simulate fetching
        setTimeout(() => {
            const saved = JSON.parse(localStorage.getItem('pakshiai_history') || '[]');
            setHistory(saved);
            setLoading(false);
        }, 800);
    }, []);

    const clearAll = () => {
        if (window.confirm("Initialize complete log clearance? This action is irreversible.")) {
            localStorage.setItem('pakshiai_history', JSON.stringify([]));
            setHistory([]);
        }
    };

    const removeItem = (id) => {
        const updated = history.filter(item => item.id !== id);
        localStorage.setItem('pakshiai_history', JSON.stringify(updated));
        setHistory(updated);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#020817] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
                    <span className="text-blue-300/40 text-xs font-black uppercase tracking-[0.2em]">Synchronizing Logs</span>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#020817] pt-32 pb-20 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full" />

            <div className="max-w-5xl mx-auto px-4 relative z-10">
                <header className="flex flex-col md:flex-row justify-between items-end md:items-center mb-12 gap-6">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl font-black text-white mb-2 tracking-tighter"
                        >
                            Field <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Repository</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-blue-300/40 text-sm font-bold uppercase tracking-widest"
                        >
                            {history.length} encrypted biological logs recovered
                        </motion.p>
                    </div>
                    {history.length > 0 && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            onClick={clearAll}
                            className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-red-500/5 text-red-400 border border-red-500/20 hover:bg-red-500/10 text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-red-500/5"
                        >
                            <Trash2 size={14} /> Wipe All Logs
                        </motion.button>
                    )}
                </header>

                <AnimatePresence mode="popLayout">
                    {history.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 bg-white/5 backdrop-blur-3xl rounded-[48px] border border-white/10 shadow-2xl relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)]" />
                            <div className="relative z-10">
                                <div className="w-24 h-24 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-8 animate-pulse">
                                    <Database size={40} className="text-blue-500/40" />
                                </div>
                                <h3 className="text-2xl font-black text-white mb-2 uppercase tracking-tight">Null State Detected</h3>
                                <p className="text-blue-300/40 max-w-sm mx-auto font-medium text-lg leading-relaxed">No field logs found for this researcher profile. Begin your first acoustic analysis to populate this repository.</p>
                                <a href="/" className="mt-10 inline-flex items-center gap-3 px-8 py-4 bg-blue-600 text-white rounded-2xl font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-blue-600/20">
                                    Initialize Tracker <Activity size={18} />
                                </a>
                            </div>
                        </motion.div>
                    ) : (
                        <div className="grid gap-6">
                            {history.map((item, i) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ delay: i * 0.05 }}
                                    className="bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 p-6 flex flex-col md:flex-row items-center gap-6 group hover:border-blue-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-blue-500/10"
                                >
                                    <div className={clsx(
                                        "w-20 h-20 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110",
                                        item.type === 'explore' ? 'bg-cyan-500/10 text-cyan-400 shadow-xl shadow-cyan-500/5' : 'bg-blue-500/10 text-blue-400 shadow-xl shadow-blue-500/5'
                                    )}>
                                        {item.type === 'explore' ? <Search size={32} /> : <Bird size={32} />}
                                    </div>

                                    <div className="flex-1 text-center md:text-left min-w-0">
                                        <div className="flex flex-col md:flex-row items-center gap-3 mb-2">
                                            <h3 className="text-2xl font-black text-white truncate tracking-tight">{item.topSpecies}</h3>
                                            <span className={clsx(
                                                "text-[9px] px-2.5 py-1 rounded-full uppercase font-black tracking-widest border",
                                                item.type === 'explore' ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                            )}>
                                                {item.type === 'explore' ? 'Field Observation' : 'Acoustic Diagnosis'}
                                            </span>
                                        </div>
                                        <p className="text-blue-300/40 text-sm italic font-serif truncate mb-4">{item.scientificName}</p>

                                        <div className="flex flex-wrap justify-center md:justify-start items-center gap-6 text-[10px] text-white/20 font-black uppercase tracking-[0.15em]">
                                            <span className="flex items-center gap-2"><Clock size={12} className="text-blue-500/50" /> {item.timestamp}</span>
                                            {item.habitat && <span className="flex items-center gap-2"><MapPin size={12} className="text-blue-500/50" /> {item.habitat}</span>}
                                            {item.confidence && <span className="flex items-center gap-2 bg-blue-500/10 text-blue-400 px-2 py-0.5 rounded border border-blue-500/20">Confidence: {item.confidence}</span>}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-4 text-white/10 hover:text-red-400 hover:bg-red-500/10 rounded-2xl transition-all border border-transparent hover:border-red-500/20"
                                            title="Permanently Delete Entry"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default HistoryPage;
