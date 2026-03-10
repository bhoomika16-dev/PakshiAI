import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Volume2, MapPin, Feather, Activity, Globe, Info, ExternalLink, BookOpen, Radio, Layers, Clock, ShieldCheck, Share2, Play, Pause } from 'lucide-react';
import { indianBirds, conservationStatusMap } from '../utils/indianBirds';
import clsx from 'clsx';

const FALLBACK = "https://cdn.pixabay.com/photo/2017/02/07/16/47/kingfisher-2046453_640.jpg";
const SPECTROGRAM_MOCK = "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=1000";

const SpeciesDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bird, setBird] = useState(null);
    const [activeTab, setActiveTab] = useState('taxonomy');
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef(null);

    useEffect(() => {
        const found = indianBirds.find(b => b.id === parseInt(id));
        if (found) {
            setBird(found);
            window.scrollTo(0, 0);
        } else {
            navigate('/catalog');
        }
    }, [id, navigate]);

    if (!bird) return null;

    const st = conservationStatusMap[bird.conservationStatus] || { label: "Unknown", bg: "bg-gray-500/20", text: "text-gray-400", border: "border-gray-500/30" };

    // Suggested related species (same family)
    const related = indianBirds
        .filter(b => b.family === bird.family && b.id !== bird.id)
        .slice(0, 3);

    const toggleAudio = () => {
        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            setIsPlaying(true);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Audio play failed:", error);
                    setIsPlaying(false);
                });
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0a101f] text-white pt-24 pb-20 relative overflow-hidden">
            {/* Background Elements */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 right-0 w-[60%] h-[60%] bg-blue-600/5 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[60%] h-[60%] bg-indigo-600/5 blur-[120px] rounded-full -translate-x-1/2 translate-y-1/2" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/catalog')}
                    className="flex items-center gap-2 text-blue-400 hover:text-white transition-colors mb-8 group"
                >
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10 group-hover:border-blue-500/50 transition-all">
                        <ChevronLeft size={20} />
                    </div>
                    <span className="text-xs font-black uppercase tracking-[0.2em]">Return to Matrix</span>
                </button>

                {/* Hero Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
                    {/* Visual Asset */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-7"
                    >
                        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl group">
                            <img
                                src={bird.image || FALLBACK}
                                alt={bird.commonName}
                                loading="lazy"
                                className="w-full aspect-[4/3] object-cover transition-transform duration-[10s] group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0a101f] via-transparent to-transparent opacity-60" />

                            {/* Visual Overlay Labels */}
                            <div className="absolute bottom-10 left-10 p-8 backdrop-blur-3xl bg-black/40 border border-white/10 rounded-3xl max-w-lg">
                                <div className="flex items-center gap-3 mb-4">
                                    <span className={clsx("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border", st.bg, st.text, st.border)}>
                                        Conservation: {bird.conservationStatus !== "N/A" ? bird.conservationStatus : "Active Study"}
                                    </span>
                                    <span className="bg-blue-600/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">
                                        {bird.migration}
                                    </span>
                                </div>
                                <h1 className="text-5xl font-black mb-2 tracking-tighter leading-none">{bird.commonName}</h1>
                                <p className="text-blue-300/60 italic font-serif text-xl">{bird.scientificName}</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Quick Stats Panel */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="lg:col-span-5 flex flex-col gap-6"
                    >
                        <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 h-full flex flex-col">
                            <div className="flex items-center justify-between mb-8">
                                <h2 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em]">Ecological Fingerprint</h2>
                                <Share2 size={18} className="text-white/20 hover:text-white cursor-pointer transition-colors" />
                            </div>

                            <div className="space-y-6 flex-1">
                                {[
                                    { label: "Family Hierarchy", val: bird.family || "N/A", icon: <Layers size={18} className="text-blue-500" /> },
                                    { label: "Taxonomic Order", val: bird.order || "N/A", icon: <Feather size={18} className="text-cyan-500" /> },
                                    { label: "Population Trend", val: bird.longTermTrend || "Stable", icon: <Activity size={18} className="text-emerald-500" /> },
                                    { label: "Vocal Frequency", val: bird.frequencyRange || "0.5-5 kHz", icon: <Radio size={18} className="text-purple-500" /> },
                                ].map((item, idx) => (
                                    <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                                        <div className="p-3 bg-black/40 rounded-xl">
                                            {item.icon}
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-white/30 uppercase font-black tracking-widest leading-none mb-1">{item.label}</p>
                                            <p className="text-white font-bold">{item.val}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Acoustic Integration */}
                            <div className="mt-8 pt-8 border-t border-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="text-[10px] text-white/20 uppercase font-black tracking-widest">Audio Intelligence Active</span>
                                    <Clock size={14} className="text-blue-500/40" />
                                </div>
                                <button
                                    onClick={toggleAudio}
                                    className="w-full flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-500 text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
                                >
                                    {isPlaying ? <Pause size={20} /> : <Play size={20} fill="currentColor" />}
                                    {isPlaying ? "Decoding Audio..." : "Initialize Vocals"}
                                </button>
                                <audio
                                    ref={audioRef}
                                    preload="none"
                                    src={`${import.meta.env.VITE_API_BASE_URL || ""}/api/proxy/audio?url=${encodeURIComponent(bird.soundUrl)}`}
                                    onEnded={() => setIsPlaying(false)}
                                    onError={() => {
                                        console.error("Audio playback error");
                                        setIsPlaying(false);
                                    }}
                                    className="hidden"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Secondary Info Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-20">
                    {/* Description & Research */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-600/20 rounded-2xl text-blue-500">
                                    <Info size={24} />
                                </div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tight">Species Intelligence Report</h2>
                            </div>
                            <p className="text-blue-100/60 text-lg leading-relaxed mb-8 font-medium">
                                {bird.description}
                            </p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Acoustic Characteristics</h4>
                                    <ul className="space-y-4">
                                        <li className="flex justify-between text-sm">
                                            <span className="text-white/40">Signal Clarity</span>
                                            <span className="text-white font-bold">{bird.soundProfile?.clarity || "Researching"}</span>
                                        </li>
                                        <li className="flex justify-between text-sm">
                                            <span className="text-white/40">Pattern Type</span>
                                            <span className="text-white font-bold truncate ml-4 italic">{bird.soundProfile?.callPattern || "Active Study"}</span>
                                        </li>
                                    </ul>
                                </div>
                                <div className="p-6 bg-black/20 rounded-3xl border border-white/5">
                                    <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Habitat Dynamics</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {bird.habitat?.map(h => (
                                            <span key={h} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-[10px] font-bold rounded-xl uppercase tracking-wider">{h}</span>
                                        )) || <span className="text-white/20 italic">No habitat data available</span>}
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Spectrogram / Fingerprint */}
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Activity size={16} /> Digital Acoustic Fingerprint (Spectrogram)
                            </h3>
                            <div className="relative rounded-3xl overflow-hidden border border-white/5 bg-[#050b18] p-4 group">
                                <div className="h-48 w-full relative flex items-end gap-[2px]">
                                    {[...Array(60)].map((_, i) => (
                                        <motion.div
                                            key={i}
                                            initial={{ height: "10%" }}
                                            animate={{
                                                height: [
                                                    `${20 + Math.random() * 60}%`,
                                                    `${10 + Math.random() * 40}%`,
                                                    `${30 + Math.random() * 50}%`
                                                ]
                                            }}
                                            transition={{
                                                duration: 1.5 + Math.random(),
                                                repeat: Infinity,
                                                ease: "easeInOut"
                                            }}
                                            className="flex-1 bg-gradient-to-t from-blue-600 via-cyan-400 to-blue-400 opacity-40 group-hover:opacity-80 transition-opacity"
                                        />
                                    ))}
                                    <div className="absolute inset-x-0 bottom-0 h-full bg-gradient-to-t from-[#0a101f]/80 to-transparent pointer-events-none" />
                                </div>
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="px-6 py-3 bg-black/40 backdrop-blur-xl border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest text-blue-400 animate-pulse">
                                        Neural Frequency Analysis Matrix
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Research Gallery */}
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-10">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <Globe size={16} /> Visual Taxonomy Gallery
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="aspect-square rounded-2xl overflow-hidden border border-white/10 hover:border-blue-500/50 transition-all group relative cursor-pointer">
                                        <img
                                            src={`${bird.image}?sig=${i}`}
                                            alt={`Gallery ${i}`}
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/10 transition-colors" />
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Geography & Sidebar */}
                    <div className="space-y-8">
                        <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
                            <h3 className="text-xs font-black text-blue-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <MapPin size={16} /> Distribution
                            </h3>
                            <div className="space-y-4">
                                {bird.regions?.map(r => (
                                    <div key={r} className="flex items-center gap-3 p-4 rounded-2xl bg-black/20 border border-white/5">
                                        <Globe size={16} className="text-blue-400" />
                                        <span className="text-sm font-bold text-white/80">{r}</span>
                                    </div>
                                )) || <p className="text-white/20 italic p-4 text-center">No regional data mapped</p>}
                                <p className="text-[10px] text-white/20 italic leading-relaxed px-2">
                                    Data sources: eBird India Regional Database & SoIB 2023 Digital Atlas.
                                </p>
                            </div>
                        </section>

                        <section className="bg-blue-600/10 backdrop-blur-xl border border-blue-500/20 rounded-[2.5rem] p-8">
                            <h3 className="text-xs font-black text-blue-400 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <Link size={16} /> Research Node
                            </h3>
                            <div className="grid grid-cols-1 gap-4">
                                <a
                                    href={`https://ebird.org/species/${bird.commonName.toLowerCase().replace(/[\s-]+/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                    <span className="text-sm font-bold">eBird Profile</span>
                                    <ExternalLink size={16} className="text-blue-500 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                </a>
                                <a
                                    href={`https://doi.org/${bird.researchDOI}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group"
                                >
                                    <span className="text-sm font-bold">Scientific DOI</span>
                                    <BookOpen size={16} className="text-blue-500" />
                                </a>
                            </div>
                        </section>

                        {/* Related Species */}
                        {related.length > 0 && (
                            <section className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-8">
                                <h3 className="text-xs font-black text-white/30 uppercase tracking-[0.3em] mb-6">
                                    Cognate Taxonomies
                                </h3>
                                <div className="space-y-4">
                                    {related.map(r => (
                                        <Link
                                            key={r.id}
                                            to={`/catalog/${r.id}`}
                                            className="flex items-center gap-3 p-3 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all group"
                                        >
                                            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-lg border border-white/10">
                                                <img src={r.image || FALLBACK} loading="lazy" className="w-full h-full object-cover" alt={r.commonName} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-white uppercase truncate group-hover:text-blue-400 transition-colors">{r.commonName}</p>
                                                <p className="text-[10px] text-white/20 italic truncate">{r.scientificName}</p>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                </div>

                {/* Footer CTA */}
                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[3rem] p-16 text-center shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/5 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                    <ShieldCheck size={60} className="mx-auto text-white/20 mb-6" />
                    <h2 className="text-4xl font-black text-white mb-4 tracking-tighter">Verified Avifauna Signal</h2>
                    <p className="text-white/60 text-lg mb-8 max-w-2xl mx-auto">
                        This digital dossier is synchronized with the global avian taxonomy. All acoustic and visual markers are validated by the PakshiAI neural core.
                    </p>
                    <button
                        onClick={() => navigate('/catalog')}
                        className="px-10 py-4 bg-white text-blue-600 rounded-full font-black uppercase tracking-[0.2em] shadow-xl hover:scale-105 transition-all text-sm"
                    >
                        Catalogue Discovery
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SpeciesDetail;
