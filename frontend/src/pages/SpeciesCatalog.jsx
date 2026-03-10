import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, ChevronDown, Feather, Volume2, Play, Pause, Activity, Globe, Info, ExternalLink } from 'lucide-react';
import { indianBirds, habitatTypes, regionsList, conservationStatusMap } from '../utils/indianBirds';
import clsx from 'clsx';

const FALLBACK = "https://cdn.pixabay.com/photo/2017/02/07/16/47/kingfisher-2046453_640.jpg";

// --- Components ---

const SpeciesCard = ({ bird }) => {
    const navigate = useNavigate();
    const [playing, setPlaying] = useState(false);
    const audioRef = useRef(null);
    const statusInfo = conservationStatusMap[bird.conservationStatus] || conservationStatusMap["N/A"] || { label: "N/A", color: "gray" };

    const toggleAudio = (e) => {
        e.stopPropagation();
        if (playing) {
            audioRef.current.pause();
            setPlaying(false);
        } else {
            setPlaying(true);
            const playPromise = audioRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error("Audio play failed:", error);
                    setPlaying(false);
                });
            }
        }
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ y: -8, scale: 1.02 }}
            onClick={() => navigate(`/catalog/${bird.id}`)}
            className="group relative cursor-pointer bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-blue-500/30"
        >
            {/* Image Container */}
            <div className="relative h-56 overflow-hidden">
                <img
                    src={bird.image || FALLBACK}
                    alt={bird.commonName}
                    loading="lazy"
                    onError={e => { e.target.onerror = null; e.target.src = FALLBACK; }}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-transparent to-transparent opacity-80" />

                {/* Audio Button */}
                <button
                    onClick={toggleAudio}
                    className="absolute bottom-4 right-4 p-3 bg-blue-600/90 backdrop-blur-md rounded-full text-white shadow-xl hover:bg-blue-500 transition-all z-10 scale-0 group-hover:scale-100 duration-300"
                >
                    {playing ? <Pause size={18} /> : <Play size={18} fill="currentColor" />}
                </button>
                <audio
                    ref={audioRef}
                    preload="none"
                    src={``${import.meta.env.VITE_API_BASE_URL || ""}/api/proxy/audio?url=${encodeURIComponent(bird.soundUrl)}`}
                    onEnded={() => setPlaying(false)}
                    onError={() => setPlaying(false)}
                    className="hidden"
                />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-2">
                    <span className={clsx(
                        "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-xl bg-black/40 text-white"
                    )}>
                        {bird.conservationStatus !== "N/A" ? bird.conservationStatus : "Researching"}
                    </span>
                    {(bird.soibPriority === 'High' || bird.soibPriority === 'Moderate') && (
                        <span className={clsx(
                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10 backdrop-blur-xl self-start",
                            bird.soibPriority === 'High' ? "bg-red-500/40 text-red-100" : "bg-orange-500/40 text-orange-100"
                        )}>
                            {bird.soibPriority} Priority
                        </span>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                <div className="mb-4">
                    <h3 className="text-xl font-black text-white leading-none mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{bird.commonName}</h3>
                    <p className="text-blue-300/40 text-xs italic font-serif italic">{bird.scientificName}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                    {bird.habitat.slice(0, 2).map((h) => (
                        <span key={h} className="text-[10px] font-bold text-blue-300/60 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                            {h}
                        </span>
                    ))}
                    <span className="ml-auto text-blue-500 animate-pulse">
                        <Activity size={14} />
                    </span>
                </div>
            </div>

            {/* Glow Effect */}
            <div className="absolute inset-0 bg-blue-500/0 group-hover:bg-blue-500/5 transition-colors pointer-events-none" />
        </motion.div>
    );
};

const SkeletonCard = () => (
    <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[2rem] overflow-hidden animate-pulse h-[360px]">
        <div className="h-56 bg-white/5" />
        <div className="p-6">
            <div className="h-6 w-3/4 bg-white/5 rounded-lg mb-2" />
            <div className="h-4 w-1/2 bg-white/5 rounded-lg mb-4" />
            <div className="flex gap-2">
                <div className="h-6 w-16 bg-white/5 rounded-lg" />
                <div className="h-6 w-16 bg-white/5 rounded-lg" />
            </div>
        </div>
    </div>
);

// --- Page Component ---

const SpeciesCatalog = () => {
    const [search, setSearch] = useState('');
    const [fHabitat, setFHabitat] = useState('');
    const [fRegion, setFRegion] = useState('');
    const [fPriority, setFPriority] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setLoading(false), 1200);
        return () => clearTimeout(timer);
    }, []);

    const filtered = useMemo(() => {
        return indianBirds.filter(b => {
            const matchesSearch = !search ||
                (b.commonName || '').toLowerCase().includes(search.toLowerCase()) ||
                (b.scientificName || '').toLowerCase().includes(search.toLowerCase()) ||
                (b.family || '').toLowerCase().includes(search.toLowerCase());

            const matchesHabitat = !fHabitat || (b.habitat || []).includes(fHabitat);
            const matchesRegion = !fRegion || (b.regions || []).some(r => r.includes(fRegion));
            const matchesPriority = !fPriority || b.soibPriority === fPriority;

            return matchesSearch && matchesHabitat && matchesRegion && matchesPriority;
        });
    }, [search, fHabitat, fRegion, fPriority]);

    const activeFilterCount = [fHabitat, fRegion, fPriority].filter(Boolean).length;

    return (
        <div className="min-h-screen bg-[#0a101f] pt-24 pb-20 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[150px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-600/10 blur-[150px] rounded-full" />
            </div>

            <div className="max-w-7xl mx-auto px-6 relative z-10">
                {/* Header */}
                <header className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div>
                            <div className="flex items-center gap-2 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em] mb-3">
                                <Globe size={14} /> Global Taxonomy Standard
                            </div>
                            <h1 className="text-6xl font-black text-white tracking-tighter leading-none mb-4">
                                Species <span className="text-blue-500">Catalog</span>
                            </h1>
                            <p className="text-blue-300/40 text-lg font-medium">
                                Comprehensive database of <span className="text-white">{indianBirds.length} documented species</span> across the Indian subcontinent.
                            </p>
                        </div>
                    </motion.div>
                </header>

                {/* Filters & Search */}
                <div className="mb-12 space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-blue-500 shadow-xl" />
                            <input
                                type="text"
                                placeholder="Search by common name, scientific name, or family..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[1.5rem] pl-16 pr-6 py-6 text-xl text-white placeholder-white/10 focus:outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className={clsx(
                                "flex items-center gap-3 px-8 py-6 rounded-[1.5rem] border text-sm font-black uppercase tracking-widest transition-all backdrop-blur-2xl",
                                showFilters ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-white/5 border-white/10 text-white/40 hover:text-white hover:border-white/20'
                            )}
                        >
                            <Filter size={18} />
                            Filter Intelligence
                            {activeFilterCount > 0 && <span className="bg-white text-blue-600 text-[10px] px-2 py-0.5 rounded-full">{activeFilterCount}</span>}
                        </button>
                    </div>

                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="bg-white/5 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Habitat Matrix</label>
                                        <select
                                            value={fHabitat}
                                            onChange={e => setFHabitat(e.target.value)}
                                            className="w-full bg-[#0a101f] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">All Ecological Zones</option>
                                            {habitatTypes.filter(h => h !== "All").map(h => <option key={h} value={h}>{h}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Geographic Range</label>
                                        <select
                                            value={fRegion}
                                            onChange={e => setFRegion(e.target.value)}
                                            className="w-full bg-[#0a101f] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">All Regions</option>
                                            {regionsList.filter(r => r !== "All").map(r => <option key={r} value={r}>{r}</option>)}
                                        </select>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-2">Priority Status</label>
                                        <select
                                            value={fPriority}
                                            onChange={e => setFPriority(e.target.value)}
                                            className="w-full bg-[#0a101f] border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">All Priority Levels</option>
                                            <option value="High">High Priority</option>
                                            <option value="Moderate">Moderate Priority</option>
                                            <option value="Low">Low Priority</option>
                                        </select>
                                    </div>
                                    <div className="md:col-span-3 flex justify-between items-center pt-4 border-t border-white/5">
                                        <p className="text-[10px] text-white/20 uppercase font-black tracking-widest">Deep Filter Engine Active</p>
                                        <button
                                            onClick={() => { setSearch(''); setFHabitat(''); setFRegion(''); setFPriority(''); }}
                                            className="text-xs text-red-400 font-black uppercase tracking-widest hover:text-red-300 transition-colors"
                                        >
                                            Reset Matrices
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between mb-8">
                            <div className="text-[10px] font-black text-white/20 uppercase tracking-[0.3em]">
                                Documented Signals: <span className="text-blue-500">{filtered.length} Results</span>
                            </div>
                        </div>

                        <motion.div
                            layout
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                        >
                            <AnimatePresence>
                                {filtered.map(bird => (
                                    <SpeciesCard key={bird.id} bird={bird} />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {filtered.length === 0 && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-center py-40 bg-white/5 rounded-[4rem] border border-dashed border-white/10"
                            >
                                <Feather size={64} className="mx-auto text-blue-500/20 mb-6" />
                                <h3 className="text-3xl font-black text-white mb-2">Signal Not Found</h3>
                                <p className="text-blue-300/20 text-lg">Your search parameters did not match any documented species in our taxonomy matrix.</p>
                                <button
                                    onClick={() => { setSearch(''); setFHabitat(''); setFRegion(''); }}
                                    className="mt-8 px-8 py-3 bg-white/5 border border-white/10 rounded-full text-white text-xs font-black uppercase tracking-[0.2em] hover:bg-white/10 transition-all"
                                >
                                    Clear Matrix Search
                                </button>
                            </motion.div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SpeciesCatalog;
