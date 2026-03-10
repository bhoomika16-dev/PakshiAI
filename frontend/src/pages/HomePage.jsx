import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import AudioInput from '../components/ui/AudioInput';
import { Bird, Headphones, Globe, Database, ArrowRight, Sparkles, Shield, Zap, Globe2, Music, MapPin } from 'lucide-react';
import clsx from 'clsx';

const HomePage = () => {
    const [activeTab, setActiveTab] = useState('record');
    const containerRef = useRef(null);

    return (
        <div className="min-h-screen bg-[#020817] overflow-x-hidden selection:bg-blue-500/30">
            {/* Ultra-Premium Background Layer */}
            <div className="fixed inset-0 z-0">
                {/* Cinematic Background Video */}
                <div className="absolute inset-0 opacity-20 filter grayscale-[0.5] contrast-125">
                    <video
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="w-full h-full object-cover"
                        src="https://player.vimeo.com/external/494252666.hd.mp4?s=2d51dc3d6303b7497d394b29339e3ec016c68a4e&profile_id=172"
                    />
                </div>
                <div className="absolute inset-0 bg-[#020817]/60 backdrop-blur-[2px]" />

                <div className="absolute top-0 left-1/4 w-[800px] h-[800px] bg-blue-600/10 blur-[150px] rounded-full mix-blend-screen animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-indigo-600/10 blur-[150px] rounded-full mix-blend-screen" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none" />

                {/* Animated Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
            </div>

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-4 z-10">
                <motion.div
                    className="max-w-7xl mx-auto text-center flex flex-col items-center"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/5 backdrop-blur-md border border-blue-500/20 text-blue-400 text-xs font-black uppercase tracking-[0.3em] mb-12 shadow-[0_0_20px_rgba(59,130,246,0.1)]"
                    >
                        <Sparkles size={14} className="animate-pulse" />
                        Next-Gen Acoustic Intelligence
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-6xl md:text-8xl font-black text-white mb-8 tracking-tighter leading-[0.9] md:px-20"
                    >
                        Decode the <span className="bg-gradient-to-b from-white via-white to-blue-500 bg-clip-text text-transparent italic">Language</span> of the Skies
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-2xl mx-auto text-xl text-blue-200/40 mb-16 leading-relaxed font-medium"
                    >
                        PakshiAI transforms raw acoustic signals into precise biological data.
                        Experience the most advanced bird identification system built for the Indian subcontinent.
                    </motion.p>

                    {/* Interactive Analysis Hub */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, type: "spring", damping: 20 }}
                        className="w-full max-w-4xl relative"
                    >
                        {/* 3D Glass Card Container */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-cyan-400 to-indigo-600 rounded-[40px] blur-2xl opacity-20 animate-gradient-xy" />

                        <div className="relative bg-[#0a101f]/80 backdrop-blur-3xl border border-white/10 rounded-[38px] overflow-hidden shadow-2xl shadow-blue-500/10">
                            {/* Tab Navigation */}
                            <div className="flex p-2 bg-white/5 border-b border-white/5 justify-center gap-4">
                                {[
                                    { id: 'record', label: 'Listen Live', icon: <Headphones size={18} /> },
                                    { id: 'upload', label: 'Field Upload', icon: <Music size={18} /> }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={clsx(
                                            "flex items-center gap-2 px-8 py-4 rounded-2xl transition-all duration-500 text-sm font-bold uppercase tracking-widest relative overflow-hidden group",
                                            activeTab === tab.id ? "text-white" : "text-white/30 hover:text-white/60"
                                        )}
                                    >
                                        {activeTab === tab.id && (
                                            <motion.div layoutId="activeTab" className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 shadow-lg shadow-blue-500/40" />
                                        )}
                                        <span className="relative z-10 flex items-center gap-2">
                                            {tab.icon} {tab.label}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="p-10">
                                <AudioInput />
                                <div className="mt-8 flex items-center justify-center gap-6 text-[10px] text-white/20 font-black uppercase tracking-widest border-t border-white/5 pt-8">
                                    <span className="flex items-center gap-2"><Shield size={12} className="text-blue-500" /> AES-256 Encrypted</span>
                                    <span className="flex items-center gap-2"><Zap size={12} className="text-blue-500" /> Sub-100ms Inference</span>
                                    <span className="flex items-center gap-2"><Globe2 size={12} className="text-blue-500" /> Pan-India Dataset</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            </section>

            {/* Global Field Feed Section */}
            <section className="py-20 relative z-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-blue-500/5 backdrop-blur-3xl rounded-[40px] border border-blue-500/10 p-8 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
                            <div>
                                <h2 className="text-2xl font-black text-white flex items-center gap-3 uppercase tracking-tight">
                                    <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
                                    Live Field Metadata
                                </h2>
                                <p className="text-[10px] text-white/20 font-black uppercase tracking-[0.3em] mt-1">Real-time Pan-India Acoustic Streams</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                    <div className="text-[8px] text-blue-400 font-black uppercase mb-1">Active Nodes</div>
                                    <div className="text-xl font-bold text-white">1,280</div>
                                </div>
                                <div className="bg-white/5 px-6 py-3 rounded-2xl border border-white/5">
                                    <div className="text-[8px] text-cyan-400 font-black uppercase mb-1">Detections/Hr</div>
                                    <div className="text-xl font-bold text-white">24,512</div>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[
                                { bird: "Indian Peafowl", loc: "Western Ghats, KA", time: "2s ago", confidence: "98.2%" },
                                { bird: "Asian Koel", loc: "Central Ridge, DL", time: "14s ago", confidence: "94.5%" },
                                { bird: "Common Myna", loc: "Indore Urban, MP", time: "31s ago", confidence: "89.1%" },
                                { bird: "Purple Sunbird", loc: "Nilgiri Hills, TN", time: "45s ago", confidence: "96.7%" }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="bg-white/5 p-5 rounded-3xl border border-white/5 hover:border-blue-500/30 transition-all group"
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="w-8 h-8 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Bird size={16} />
                                        </div>
                                        <span className="text-[8px] font-black text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">{item.confidence}</span>
                                    </div>
                                    <h4 className="text-sm font-black text-white mb-1 group-hover:text-blue-400 transition-colors">{item.bird}</h4>
                                    <div className="flex items-center justify-between text-[9px] text-white/20 font-bold uppercase">
                                        <span className="flex items-center gap-1"><MapPin size={8} /> {item.loc}</span>
                                        <span>{item.time}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Matrix */}
            <section className="py-32 relative z-10 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-[0.2em]">Platform Core</h2>
                        <div className="w-20 h-1 bg-blue-600 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Bird size={32} />,
                                title: "Adaptive Species Mapping",
                                desc: "Proprietary species database covering 1500+ Indian migratory and resident patterns.",
                                border: "group-hover:border-blue-500/50"
                            },
                            {
                                icon: <Globe size={32} />,
                                title: "Geo-Spatial Filtering",
                                desc: "AI models weighted by local biodiversity hotspots, seasons, and real-time habitat acoustics.",
                                border: "group-hover:border-cyan-500/50"
                            },
                            {
                                icon: <ArrowRight size={32} />,
                                title: "Standardized Diagnostics",
                                desc: "Generate professional ecological reports with high-fidelity spectrograms and DOI citations.",
                                border: "group-hover:border-indigo-500/50"
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                whileHover={{ y: -10 }}
                                className={clsx(
                                    "p-10 rounded-[32px] bg-white/5 backdrop-blur-md border border-white/10 transition-all duration-500 group relative overflow-hidden",
                                    feature.border
                                )}
                            >
                                <div className="absolute -right-8 -top-8 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
                                <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 shadow-xl shadow-blue-500/10">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold text-white mb-4 leading-tight">{feature.title}</h3>
                                <p className="text-white/40 leading-relaxed font-medium">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-40 relative z-10 overflow-hidden">
                <div className="max-w-5xl mx-auto px-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-[48px] p-20 text-center relative group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/asfalt-dark.png')] opacity-20 pointer-events-none" />
                    <motion.div
                        whileInView={{ scale: [0.9, 1], opacity: [0, 1] }}
                        className="relative z-10"
                    >
                        <h2 className="text-5xl font-black text-white mb-8">Ready to explore the wilderness?</h2>
                        <p className="text-blue-100/60 text-xl mb-12 max-w-xl mx-auto font-medium">Join 50,000+ ecologists and birdwatchers today.</p>
                        <a href="/catalog" className="inline-flex items-center gap-3 px-10 py-5 bg-white text-blue-900 rounded-2xl font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-white/10">
                            Species Catalog <ArrowRight size={20} />
                        </a>
                    </motion.div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
