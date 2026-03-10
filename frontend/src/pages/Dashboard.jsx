import React, { useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, LineChart, Line } from 'recharts';
import { Activity, TrendingUp, Bird, MapPin, Shield, Calendar, RefreshCw, Layers, Sparkles, Globe } from 'lucide-react';
import { indianBirds, conservationStatusMap } from '../utils/indianBirds';
import api from '../utils/api';
import clsx from 'clsx';

const StatCard = ({ icon: Icon, label, value, color, delay }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-white/5 backdrop-blur-3xl p-6 rounded-[32px] border border-white/5 hover:border-blue-500/30 transition-all group relative overflow-hidden"
    >
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors" />
        <div className="flex items-center gap-4 mb-4">
            <div className={clsx("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-500 group-hover:scale-110", color)}>
                <Icon size={24} />
            </div>
            <div className="flex flex-col">
                <span className="text-[10px] text-white/30 font-black uppercase tracking-widest">{label}</span>
                <div className="text-3xl font-black text-white tracking-tighter">{value}</div>
            </div>
        </div>
    </motion.div>
);

const ChartContainer = ({ title, subtitle, children, icon: Icon }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden"
    >
        <div className="flex items-start justify-between mb-8">
            <div>
                <h2 className="text-xl font-black text-white mb-1 flex items-center gap-2 uppercase tracking-tight">
                    {Icon && <Icon className="text-blue-500" size={20} />} {title}
                </h2>
                <p className="text-[10px] text-white/20 font-black uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
        <div className="h-[300px] w-full">
            {children}
        </div>
    </motion.div>
);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.get('/api/stats')
            .then(r => setStats(r.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const conservationData = useMemo(() => {
        const c = {};
        indianBirds.forEach(b => { c[b.conservationStatus] = (c[b.conservationStatus] || 0) + 1; });
        return Object.entries(c).map(([k, v]) => ({
            name: conservationStatusMap[k]?.label || k,
            value: v,
            color: conservationStatusMap[k]?.color_hex || '#3b82f6'
        }));
    }, []);

    const habitatData = useMemo(() => {
        const c = {};
        indianBirds.forEach(b => b.habitat.forEach(h => { c[h] = (c[h] || 0) + 1; }));
        return Object.entries(c).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, v]) => ({ name: k, count: v }));
    }, []);

    const soibStats = useMemo(() => {
        // We can import it dynamically or use the catalog if enriched
        const high = indianBirds.filter(b => b.soibPriority === 'High').length;
        const declining = indianBirds.filter(b => b.longTermTrend?.includes('Decline')).length;
        return { high, declining };
    }, []);

    if (loading) return (
        <div className="min-h-screen bg-[#020817] flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020817] pt-32 pb-20 relative overflow-hidden">
            {/* Ambient Background */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full" />

            <div className="max-w-7xl mx-auto px-4 relative z-10">
                <header className="mb-12 flex flex-col md:flex-row justify-between items-end md:items-center gap-8">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl font-black text-white mb-2 tracking-tighter"
                        >
                            Insight <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Engine</span>
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-white/30 text-[10px] font-black uppercase tracking-[0.3em]"
                        >
                            Global Avifauna Intelligence Analysis • Live Telemetry
                        </motion.p>
                    </div>

                    <div className="flex gap-4">
                        <button
                            onClick={() => { setLoading(true); setTimeout(() => setLoading(false), 1500); }}
                            className="px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-[10px] font-black uppercase tracking-widest text-blue-400 hover:bg-blue-500/10 transition-all flex items-center gap-2 group"
                        >
                            <RefreshCw size={14} className="group-hover:rotate-180 transition-transform duration-700" />
                            Synchronize Neural Core
                        </button>
                    </div>
                </header>

                {/* Primary Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatCard icon={Bird} label="Catalog Span" value={indianBirds.length} color="bg-blue-500/10 text-blue-500" delay={0.1} />
                    <StatCard icon={Shield} label="SoIB High Priority" value={soibStats.high} color="bg-red-500/10 text-red-500" delay={0.2} />
                    <StatCard icon={TrendingUp} label="Declining Trend" value={soibStats.declining} color="bg-orange-500/10 text-orange-500" delay={0.3} />
                    <StatCard icon={Globe} label="Eco-Systems" value={habitatData.length} color="bg-cyan-500/10 text-cyan-500" delay={0.4} />
                </div>

                {/* Main Visualizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    <ChartContainer title="Population Density" subtitle="Species richness across habitat clusters" icon={Layers}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={habitatData}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.1)" tick={{ fill: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: '900' }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'black', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '15px' }}
                                    itemStyle={{ color: '#fff', fontWeight: 'bold' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorCount)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </ChartContainer>

                    <ChartContainer title="Conservation Index" subtitle="IUCN vulnerability distribution" icon={Shield}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={conservationData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={8}
                                    dataKey="value"
                                >
                                    {conservationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'black', border: 'none', borderRadius: '20px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>

                {/* User Specific / Trend Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <ChartContainer title="Temporal Detections" subtitle="Acoustic signal frequency over time" icon={Activity}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats?.activity_trend || habitatData}>
                                    <Bar dataKey="detections" fill="#3b82f6" radius={[10, 10, 10, 10]} barSize={20} />
                                    <XAxis dataKey="time" hide />
                                    <Tooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ display: 'none' }} />
                                </BarChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-white/5 backdrop-blur-3xl p-8 rounded-[40px] border border-white/5"
                    >
                        <h2 className="text-xl font-black text-white mb-6 uppercase flex items-center gap-2">
                            <Sparkles className="text-blue-500" size={20} /> Field Nodes
                        </h2>
                        <div className="space-y-6">
                            {stats?.top_regions.slice(0, 4).map((r, i) => (
                                <div key={i} className="group">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-white font-black text-xs uppercase tracking-widest">{r.region}</span>
                                        <span className="text-blue-500 font-black text-xs">{r.species_count}</span>
                                    </div>
                                    <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${(r.species_count / 500) * 100}%` }}
                                            transition={{ duration: 1, delay: i * 0.1 }}
                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"
                                        />
                                    </div>
                                </div>
                            )) || <p className="text-white/20 text-xs text-center italic">No regional data synchronized.</p>}
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
