import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search, SortAsc, SortDesc, TrendingDown, TrendingUp,
    Minus, ChevronUp, ChevronDown, Shield, AlertTriangle,
    Activity, Globe, Leaf, Zap, Info, ExternalLink, Bird
} from 'lucide-react';
import clsx from 'clsx';
import soibDataRaw from '../utils/soib_essentials.json';

// ─── Helpers ───────────────────────────────────────────────────────────────

const getTrendMeta = (trend) => {
    if (!trend) return { label: 'Unknown', color: 'text-white/20', bg: 'bg-white/5', icon: <Minus size={12} /> };
    if (trend.includes('Strong Decline')) return { label: 'Strong Decline', color: 'text-red-400', bg: 'bg-red-500/10', icon: <TrendingDown size={12} /> };
    if (trend.includes('Moderate Decline')) return { label: 'Moderate Decline', color: 'text-orange-400', bg: 'bg-orange-500/10', icon: <ChevronDown size={12} /> };
    if (trend.includes('Strong Increase')) return { label: 'Strong Increase', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: <TrendingUp size={12} /> };
    if (trend.includes('Moderate Increase')) return { label: 'Moderate Increase', color: 'text-green-400', bg: 'bg-green-500/10', icon: <ChevronUp size={12} /> };
    if (trend.includes('Stable')) return { label: 'Stable', color: 'text-blue-400', bg: 'bg-blue-500/10', icon: <Minus size={12} /> };
    if (trend.includes('Data Deficient')) return { label: 'Data Deficient', color: 'text-white/30', bg: 'bg-white/5', icon: <Info size={12} /> };
    return { label: trend, color: 'text-white/30', bg: 'bg-white/5', icon: <Minus size={12} /> };
};

const getPriorityMeta = (p) => {
    if (p === 'High') return { ring: 'border-red-500/40', dot: 'bg-red-500', text: 'text-red-400', badge: 'bg-red-500/10 border-red-500/20 text-red-400' };
    if (p === 'Moderate') return { ring: 'border-orange-500/40', dot: 'bg-orange-500', text: 'text-orange-400', badge: 'bg-orange-500/10 border-orange-500/20 text-orange-400' };
    return { ring: 'border-blue-500/20', dot: 'bg-blue-500/50', text: 'text-blue-400/60', badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400' };
};

const getIUCNMeta = (iucn) => {
    if (!iucn) return { color: 'text-white/20' };
    if (iucn === 'Critically Endangered') return { color: 'text-red-500' };
    if (iucn === 'Endangered') return { color: 'text-orange-500' };
    if (iucn === 'Vulnerable') return { color: 'text-yellow-400' };
    if (iucn === 'Near Threatened') return { color: 'text-amber-400' };
    return { color: 'text-green-400/60' };
};

// ─── Stat Card ──────────────────────────────────────────────────────────────

const StatCard = ({ label, val, sub, Icon, colorClass, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}
        className="relative bg-white/5 backdrop-blur-xl border border-white/8 rounded-3xl p-6 overflow-hidden group hover:border-white/12 transition-all"
    >
        <div className={clsx("absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-10 transition-opacity group-hover:opacity-20", colorClass)} />
        <div className="relative">
            <div className={clsx("inline-flex p-2 rounded-xl mb-4 bg-white/5 border border-white/10", colorClass.replace('bg-', 'text-').split(' ')[0])}>
                <Icon size={18} />
            </div>
            <div className="text-4xl font-black text-white tracking-tighter">{val}</div>
            <div className="text-[11px] font-black text-white/20 uppercase tracking-[0.25em] mt-1">{label}</div>
            {sub && <div className="text-[10px] text-white/15 mt-1">{sub}</div>}
        </div>
    </motion.div>
);

// ─── Trend Bar ──────────────────────────────────────────────────────────────

const TrendBar = ({ label, data, color, total }) => {
    const pct = total > 0 ? Math.round((data / total) * 100) : 0;
    return (
        <div className="flex items-center gap-3">
            <div className="w-36 text-[10px] text-white/30 font-bold uppercase tracking-widest truncate">{label}</div>
            <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className={clsx("h-full rounded-full", color)}
                />
            </div>
            <div className="text-[11px] font-black text-white/30 w-12 text-right">{data}</div>
        </div>
    );
};

// ─── Main Page ───────────────────────────────────────────────────────────────

const SOIBPage = () => {
    const [search, setSearch] = useState('');
    const [priorityFilter, setPriority] = useState('All');
    const [trendFilter, setTrend] = useState('All');
    const [iucnFilter, setIUCN] = useState('All');
    const [sortKey, setSortKey] = useState('name');
    const [sortDir, setSortDir] = useState('asc');
    const [expanded, setExpanded] = useState(null);

    const data = useMemo(() => soibDataRaw || [], []);

    const stats = useMemo(() => ({
        total: data.length,
        highPriority: data.filter(d => d.priority === 'High').length,
        moderate: data.filter(d => d.priority === 'Moderate').length,
        strongDecline: data.filter(d => (d.longTrend || '').includes('Strong Decline')).length,
        declining: data.filter(d => (d.longTrend || '').includes('Decline')).length,
        stable: data.filter(d => (d.longTrend || '') === 'Stable').length,
        increasing: data.filter(d => (d.longTrend || '').includes('Increase')).length,
        endemic: data.filter(d => d.endemic === 'Yes').length,
        threatened: data.filter(d => ['Vulnerable', 'Endangered', 'Critically Endangered'].includes(d.iucn)).length,
    }), [data]);

    const filtered = useMemo(() => {
        return data.filter(item => {
            const q = search.toLowerCase();
            const matchSearch = !search || (item.name || '').toLowerCase().includes(q) || (item.scientific || '').toLowerCase().includes(q);
            const matchPriority = priorityFilter === 'All' || item.priority === priorityFilter;
            const matchTrend = trendFilter === 'All' || (item.longTrend || '').includes(trendFilter);
            const matchIUCN = iucnFilter === 'All' || item.iucn === iucnFilter;
            return matchSearch && matchPriority && matchTrend && matchIUCN;
        }).sort((a, b) => {
            const av = (a[sortKey] || '').toLowerCase();
            const bv = (b[sortKey] || '').toLowerCase();
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }, [data, search, priorityFilter, trendFilter, iucnFilter, sortKey, sortDir]);

    const toggleSort = (key) => {
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const SortIcon = ({ col }) => {
        if (sortKey !== col) return <SortAsc size={12} className="text-white/15" />;
        return sortDir === 'asc' ? <SortAsc size={12} className="text-blue-400" /> : <SortDesc size={12} className="text-blue-400" />;
    };

    const Th = ({ k, children }) => (
        <th
            onClick={() => toggleSort(k)}
            className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.25em] text-white/25 cursor-pointer hover:text-white/60 transition-colors select-none group"
        >
            <div className="flex items-center gap-1.5">{children}<SortIcon col={k} /></div>
        </th>
    );

    return (
        <div className="min-h-screen pt-28 pb-20 px-4 md:px-8 bg-[#020916]" style={{ backgroundImage: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(37,99,235,0.08) 0%, transparent 70%)' }}>
            <div className="max-w-7xl mx-auto">

                {/* ── Header ── */}
                <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="mb-14">
                    <div className="flex items-center gap-2 text-blue-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">
                        <Shield size={13} /> State of India's Birds · SoIB 2023
                    </div>
                    <h1 className="text-6xl md:text-7xl font-black text-white tracking-tighter leading-none mb-4">
                        Species <span className="bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">Index</span>
                    </h1>
                    <p className="text-blue-300/30 text-lg max-w-2xl">
                        Long-term population trends and conservation priorities for <span className="text-white">{stats.total} documented species</span> across the Indian subcontinent.
                    </p>
                </motion.div>

                {/* ── Stats Row ── */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
                    <StatCard label="High Priority" val={stats.highPriority} sub="Require urgent action" Icon={AlertTriangle} colorClass="bg-red-500" delay={0.05} />
                    <StatCard label="Strong Decline" val={stats.strongDecline} sub="Severe long-term loss" Icon={TrendingDown} colorClass="bg-orange-500" delay={0.10} />
                    <StatCard label="IUCN Threatened" val={stats.threatened} sub="VU / EN / CR categories" Icon={Shield} colorClass="bg-yellow-500" delay={0.15} />
                    <StatCard label="Total Tracked" val={stats.total} sub="All India birds" Icon={Bird} colorClass="bg-blue-500" delay={0.20} />
                </div>

                {/* ── Trend Overview Bars ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className="bg-white/5 border border-white/8 rounded-3xl p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-10"
                >
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-5">Long-Term Population Trends</div>
                        <div className="space-y-3.5">
                            <TrendBar label="Strong Decline" data={data.filter(d => (d.longTrend || '').includes('Strong Decline')).length} color="bg-red-500" total={stats.total} />
                            <TrendBar label="Moderate Decline" data={data.filter(d => (d.longTrend || '').includes('Moderate Decline')).length} color="bg-orange-500" total={stats.total} />
                            <TrendBar label="Stable" data={data.filter(d => (d.longTrend || '') === 'Stable').length} color="bg-blue-500" total={stats.total} />
                            <TrendBar label="Moderate Increase" data={data.filter(d => (d.longTrend || '').includes('Moderate Increase')).length} color="bg-green-400" total={stats.total} />
                            <TrendBar label="Strong Increase" data={data.filter(d => (d.longTrend || '').includes('Strong Increase')).length} color="bg-emerald-400" total={stats.total} />
                            <TrendBar label="Data Deficient" data={data.filter(d => (d.longTrend || '').includes('Data Deficient')).length} color="bg-white/20" total={stats.total} />
                        </div>
                    </div>
                    <div>
                        <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-5">Priority Breakdown</div>
                        <div className="space-y-3.5">
                            <TrendBar label="High Priority" data={stats.highPriority} color="bg-red-500" total={stats.total} />
                            <TrendBar label="Moderate Priority" data={stats.moderate} color="bg-orange-500" total={stats.total} />
                            <TrendBar label="Low Priority" data={data.filter(d => d.priority === 'Low').length} color="bg-blue-500" total={stats.total} />
                        </div>

                        <div className="mt-8">
                            <div className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4">Current Trend vs Long-Term</div>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: 'Increasing Now', val: data.filter(d => (d.currentTrend || '').includes('Increase')).length, color: 'text-emerald-400' },
                                    { label: 'Declining Now', val: data.filter(d => (d.currentTrend || '').includes('Decline')).length, color: 'text-red-400' },
                                    { label: 'Stable Now', val: data.filter(d => (d.currentTrend || '') === 'Stable').length, color: 'text-blue-400' },
                                    { label: 'Uncertain', val: data.filter(d => (d.currentTrend || '').includes('Uncertain')).length, color: 'text-white/20' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-white/5 rounded-2xl p-4 border border-white/5">
                                        <div className={clsx("text-2xl font-black", s.color)}>{s.val}</div>
                                        <div className="text-[9px] text-white/20 font-black uppercase tracking-widest mt-0.5">{s.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ── Filters ── */}
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/8 rounded-3xl p-6 mb-6 grid grid-cols-1 md:grid-cols-4 gap-4"
                >
                    <div className="md:col-span-2 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={17} />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search species or scientific name..."
                            className="w-full bg-white/5 border border-white/8 focus:border-blue-500/40 rounded-2xl py-4 pl-12 pr-5 text-white text-sm focus:outline-none transition-all placeholder-white/15"
                        />
                    </div>
                    {[
                        { value: priorityFilter, onChange: setPriority, opts: ['All Priorities', 'High', 'Moderate', 'Low'], icon: <AlertTriangle size={14} /> },
                        { value: trendFilter, onChange: setTrend, opts: ['All Trends', 'Decline', 'Increase', 'Stable', 'Data Deficient'], icon: <Activity size={14} /> },
                        { value: iucnFilter, onChange: setIUCN, opts: ['All IUCN', 'Critically Endangered', 'Endangered', 'Vulnerable', 'Near Threatened', 'Least Concern'], icon: <Shield size={14} /> },
                    ].map((f, i) => (
                        <div key={i} className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20">{f.icon}</span>
                            <select
                                value={f.value}
                                onChange={e => f.onChange(e.target.value)}
                                className="w-full bg-white/5 border border-white/8 focus:border-blue-500/40 rounded-2xl py-4 pl-11 pr-5 text-white text-sm focus:outline-none transition-all appearance-none cursor-pointer"
                            >
                                {f.opts.map(o => <option key={o} value={o.startsWith('All') ? 'All' : o} className="bg-[#020916]">{o}</option>)}
                            </select>
                        </div>
                    ))}
                </motion.div>

                <div className="text-[10px] font-black text-white/15 uppercase tracking-[0.25em] mb-4 pl-1">
                    {filtered.length} species · Sorted by {sortKey} ({sortDir})
                </div>

                {/* ── Table ── */}
                <motion.div
                    initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="bg-white/5 border border-white/8 rounded-3xl overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-white/8 bg-white/3">
                                    <Th k="name">Species</Th>
                                    <Th k="priority">Priority</Th>
                                    <Th k="longTrend">Long-Term Trend</Th>
                                    <Th k="currentTrend">Current Trend</Th>
                                    <Th k="iucn">IUCN Status</Th>
                                    <th className="px-6 py-5 text-left text-[9px] font-black uppercase tracking-[0.25em] text-white/25">Link</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                <AnimatePresence mode="popLayout">
                                    {filtered.slice(0, 200).map((item, idx) => {
                                        const ltMeta = getTrendMeta(item.longTrend);
                                        const ctMeta = getTrendMeta(item.currentTrend);
                                        const pMeta = getPriorityMeta(item.priority);
                                        const iMeta = getIUCNMeta(item.iucn);
                                        const isExp = expanded === item.scientific;

                                        return (
                                            <React.Fragment key={item.scientific}>
                                                <motion.tr
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ delay: Math.min(idx * 0.008, 0.3) }}
                                                    onClick={() => setExpanded(isExp ? null : item.scientific)}
                                                    className="hover:bg-white/5 transition-all cursor-pointer group"
                                                >
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={clsx("w-2 h-2 rounded-full flex-shrink-0", pMeta.dot)} />
                                                            <div>
                                                                <div className="text-white font-bold text-sm group-hover:text-blue-400 transition-colors leading-tight">{item.name}</div>
                                                                <div className="text-[10px] text-white/25 italic font-mono">{item.scientific}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx("px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border", pMeta.badge)}>
                                                            {item.priority || 'N/A'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={clsx("flex items-center gap-1.5 text-[11px] font-semibold", ltMeta.color)}>
                                                            {ltMeta.icon}{ltMeta.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className={clsx("flex items-center gap-1.5 text-[11px] font-semibold", ctMeta.color)}>
                                                            {ctMeta.icon}{ctMeta.label}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={clsx("text-[11px] font-bold", iMeta.color)}>{item.iucn || '—'}</span>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <a
                                                            href={`https://ebird.org/species/${encodeURIComponent(item.name.toLowerCase().replace(/[\s-]+/g, ''))}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            onClick={e => e.stopPropagation()}
                                                            className="p-2 bg-white/5 hover:bg-blue-500/20 rounded-lg text-white/20 hover:text-blue-400 transition-all inline-flex"
                                                        >
                                                            <ExternalLink size={13} />
                                                        </a>
                                                    </td>
                                                </motion.tr>
                                                {isExp && (
                                                    <tr className="bg-blue-600/5 border-b border-white/5">
                                                        <td colSpan={6} className="px-8 py-5">
                                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-[11px]">
                                                                <div>
                                                                    <div className="text-white/20 font-black uppercase tracking-widest mb-1">Endemic</div>
                                                                    <div className="text-white font-bold">{item.endemic || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-white/20 font-black uppercase tracking-widest mb-1">Dietary Guild</div>
                                                                    <div className="text-white font-bold">{item.diet || 'N/A'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-white/20 font-black uppercase tracking-widest mb-1">Long-Term Trend</div>
                                                                    <div className={clsx("font-bold", ltMeta.color)}>{item.longTrend || '—'}</div>
                                                                </div>
                                                                <div>
                                                                    <div className="text-white/20 font-black uppercase tracking-widest mb-1">Current Trend</div>
                                                                    <div className={clsx("font-bold", ctMeta.color)}>{item.currentTrend || '—'}</div>
                                                                </div>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </React.Fragment>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>

                        {filtered.length === 0 && (
                            <div className="py-24 text-center text-white/20 font-medium italic">No species found matching your filters.</div>
                        )}
                        {filtered.length > 200 && (
                            <div className="py-6 text-center border-t border-white/5">
                                <p className="text-[10px] text-white/15 font-black uppercase tracking-widest">Showing 200 of {filtered.length} · Refine filters to narrow results</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* ── Footer ── */}
                <div className="mt-10 flex flex-wrap items-center gap-8 text-[9px] font-black uppercase tracking-[0.25em] text-white/10">
                    <div className="flex items-center gap-2"><Globe size={12} />Global Avian Monitoring Protocol</div>
                    <div className="flex items-center gap-2"><Bird size={12} />{stats.total} Species Tracked</div>
                    <div className="flex items-center gap-2"><TrendingDown size={12} />{stats.declining} Show Long-Term Decline</div>
                    <div className="flex items-center gap-2"><Leaf size={12} />SoIB 2023 · eBird India</div>
                </div>
            </div>
        </div>
    );
};

export default SOIBPage;
