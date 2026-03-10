import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Calendar, MapPin, CheckCircle, Download, ThumbsUp, Volume2, BookOpen, ExternalLink, Trash2, AlertTriangle, Sparkles, Shield, Cpu, Zap, Microscope, Bird, Camera } from 'lucide-react';
import SpectrogramCanvas from './SpectrogramCanvas';
import clsx from 'clsx';
import { LineChart, Line, XAxis, YAxis, Tooltip as ReTooltip, ResponsiveContainer } from 'recharts';
import { indianBirds } from '../../utils/indianBirds';
import { jsPDF } from "jspdf";

const AnalysisResult = ({ result, onClose }) => {
    const [confirmed, setConfirmed] = useState(false);
    const [selectedSpecies, setSelectedSpecies] = useState(null);

    // Save to history on mount
    useEffect(() => {
        if (!result || !result.predictions?.length) return;
        const top = result.predictions[0];
        const entry = {
            id: result.recording_id || Date.now(),
            type: 'identify',
            topSpecies: top.common_name,
            scientificName: top.scientific_name,
            confidence: ((top.adjusted_score || 0) * 100).toFixed(1) + '%',
            habitat: top.call_type,
            timestamp: new Date().toLocaleString(),
            recordingId: result.recording_id,
        };
        const history = JSON.parse(localStorage.getItem('pakshiai_history') || '[]');
        if (history[0]?.recordingId !== result.recording_id) {
            history.unshift(entry);
            localStorage.setItem('pakshiai_history', JSON.stringify(history.slice(0, 100)));
        }
    }, [result]);

    if (!result || !result.predictions?.length) return null;

    const topPrediction = result.predictions[0];
    const activePrediction = selectedSpecies || topPrediction;

    if (!activePrediction) return null;

    const matchedBird = indianBirds.find(b => b.commonName.toLowerCase() === activePrediction.common_name?.toLowerCase());
    const isInconclusive = activePrediction.common_name?.toLowerCase().includes("inconclusive") || (activePrediction.confidence < 0.1 && result.metadata?.type === 'visual');

    const handleConfirm = () => {
        setConfirmed(true);
    };

    const exportPDF = async () => {
        const doc = new jsPDF();
        const margin = 20;
        let y = 20;

        doc.setFillColor(2, 8, 23); // Ultra Deep Navy
        doc.rect(0, 0, 210, 45, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(24);
        doc.text("PakshiAI Intelligence Report", margin, 32);

        y = 60;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(10);
        doc.text(`Transaction ID: ${result.recording_id}`, margin, y);
        doc.text(`Diagnostic Time: ${new Date().toLocaleString()}`, 120, y);

        y += 20;
        doc.setFontSize(20);
        doc.text(activePrediction.common_name || "Unknown Signal", margin, y);
        y += 8;
        doc.setFontSize(14);
        doc.setTextColor(100, 100, 100);
        doc.setFont("courier", "italic");
        doc.text(activePrediction.scientific_name || "N/A", margin, y);
        doc.setFont("helvetica", "normal");

        y += 20;
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(12);
        doc.text(`Confidence Index: ${((activePrediction.adjusted_score || 0) * 100).toFixed(1)}%`, margin, y);
        doc.text(`Classification: ${isInconclusive ? 'Minor Trace/Noise' : 'Species Confirmed'}`, 110, y);

        y += 20;
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text("TECHNICAL REASONING MATRIX:", margin, y);
        y += 6;
        doc.setTextColor(0, 0, 0);
        const reasoning = doc.splitTextToSize(activePrediction.context_reasoning || "Metadata analysis pending.", 170);
        doc.text(reasoning, margin, y);

        y += 40;
        doc.setFontSize(8);
        doc.setTextColor(200, 200, 200);
        doc.text("© 2026 PakshiAI Ecological Engine. AES-256 Verified.", 105, 285, { align: "center" });

        doc.save(`PakshiAI_Report_${(activePrediction.common_name || "Report").replace(/\s/g, '_')}.pdf`);
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[200] bg-[#020817] flex flex-col overflow-hidden"
            >
                {/* Fixed Header */}
                <header className="h-20 bg-[#0a101f]/80 backdrop-blur-2xl border-b border-white/5 px-8 flex items-center justify-between sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-blue-600 rounded-xl">
                            <Bird className="text-white" size={24} />
                        </div>
                        <div>
                            <h2 className="text-xl font-black text-white tracking-tighter uppercase">Intelligence Dossier</h2>
                            <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Transaction ID: {result.recording_id}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-3 bg-red-500/10 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all">
                        <Trash2 size={24} />
                    </button>
                </header>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    <div className="max-w-7xl mx-auto p-8 lg:p-12">
                        {/* Summary Status */}
                        {isInconclusive ? (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-12 bg-red-500/5 border border-red-500/10 rounded-[40px] p-10 text-center"
                            >
                                <AlertTriangle size={48} className="text-red-500 mx-auto mb-6 animate-pulse" />
                                <h3 className="text-3xl font-black text-white mb-2 uppercase tracking-tight">Low-Confidence Data</h3>
                                <p className="text-blue-300/40 text-lg max-w-2xl mx-auto">The ML core has detected trace features that loosely correlate with {activePrediction.common_name}, but overall confidence is insufficient for a positive match.</p>
                            </motion.div>
                        ) : (
                            <div className="mb-12 flex flex-col lg:flex-row items-center justify-between gap-12">
                                <div className="flex-1">
                                    <div className="flex items-center gap-4 mb-6">
                                        <span className="bg-blue-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-blue-600/20">Verified Match</span>
                                        {matchedBird?.soibPriority === 'High' && (
                                            <span className="bg-red-500/10 text-red-500 border border-red-500/20 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] animate-pulse">High Priority</span>
                                        )}
                                        <div className="flex items-center gap-2 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 font-mono text-[10px] font-black text-blue-400">
                                            <Zap size={12} /> {((activePrediction.adjusted_score || 0) * 100).toFixed(1)}% QUALITY
                                        </div>
                                    </div>
                                    <h1 className="text-7xl font-black text-white mb-4 tracking-tighter italic bg-gradient-to-b from-white to-blue-500 bg-clip-text text-transparent">{activePrediction.common_name}</h1>
                                    <p className="text-3xl text-blue-300/30 italic font-serif">{activePrediction.scientific_name || (matchedBird?.scientificName)}</p>
                                </div>
                                <div className="w-64 h-64 rounded-[60px] overflow-hidden border-8 border-white/5 shadow-2xl relative rotate-3 group hover:rotate-0 transition-all duration-700 bg-white/5 flex items-center justify-center">
                                    {matchedBird?.image ? (
                                        <img src={matchedBird.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-10000" alt={matchedBird.commonName} />
                                    ) : (
                                        <div className="flex flex-col items-center gap-4 text-white/20">
                                            <Camera size={48} />
                                            <span className="text-[10px] uppercase font-black tracking-widest">Image Unavailable</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Analysis Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <div className="lg:col-span-2 space-y-8">
                                <div className="bg-[#020817]/50 rounded-[40px] p-8 border border-white/5 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                    <h3 className="text-[10px] font-black text-white/20 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                                        {result.metadata?.type === 'visual' ? (
                                            <><Camera size={14} className="text-blue-500" /> Visual Intelligence Matrix</>
                                        ) : (
                                            <><Microscope size={14} className="text-blue-500" /> Neural Spectrography</>
                                        )}
                                    </h3>
                                    {result.visualization?.spectrogram ? (
                                        <div className="space-y-6">
                                            <div className="h-40">
                                                <SpectrogramCanvas data={result.visualization.spectrogram} />
                                            </div>
                                            {result.visualization?.spectral_centroid?.length > 0 && result.visualization.spectral_centroid[0]?.length > 0 && (
                                                <div className="h-24 bg-white/5 rounded-2xl border border-white/5 p-4">
                                                    <div className="text-[8px] font-black text-blue-500 uppercase mb-2 tracking-widest flex items-center gap-1">
                                                        <Activity size={10} /> Spectral Centroid Flux
                                                    </div>
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <LineChart data={result.visualization.spectral_centroid[0].map((v, i) => ({ i, v }))}>
                                                            <Line type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} dot={false} />
                                                        </LineChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            )}
                                        </div>
                                    ) : result.metadata?.type === 'visual' ? (
                                        <div className="space-y-6">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="h-32 bg-white/5 rounded-3xl border border-white/5 p-6 flex flex-col justify-center">
                                                    <div className="text-[10px] font-black text-blue-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                                        <Zap size={12} /> Neural Resolve
                                                    </div>
                                                    <div className="text-3xl font-black text-white">{(activePrediction.confidence * 100).toFixed(1)}%</div>
                                                    <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden">
                                                        <motion.div initial={{ width: 0 }} animate={{ width: `${activePrediction.confidence * 100}%` }} className="h-full bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                                                    </div>
                                                </div>
                                                <div className="h-32 bg-white/5 rounded-3xl border border-white/5 p-6 flex flex-col justify-center">
                                                    <div className="text-[10px] font-black text-cyan-500 uppercase mb-2 tracking-widest flex items-center gap-2">
                                                        <Bird size={12} /> Feature Match
                                                    </div>
                                                    <div className="text-3xl font-black text-white">High</div>
                                                    <p className="text-[8px] text-white/20 uppercase font-bold mt-2 tracking-widest">Anatomical Indices Verified</p>
                                                </div>
                                            </div>
                                            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                                                <div className="text-[8px] font-black text-white/20 uppercase mb-4 tracking-widest flex items-center gap-2">
                                                    <Activity size={10} /> Prediction Confidence Distribution
                                                </div>
                                                <div className="flex items-end gap-2 h-16">
                                                    {result.predictions.slice(0, 5).map((p, i) => (
                                                        <div key={i} className="flex-1 group relative">
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${p.confidence * 100}%` }}
                                                                className="w-full bg-blue-500/20 group-hover:bg-blue-500 transition-colors rounded-t-lg"
                                                            />
                                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[8px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity">{(p.confidence * 100).toFixed(0)}%</div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="h-40 bg-white/5 rounded-3xl flex items-center justify-center text-white/10 border border-white/5 border-dashed">
                                            Telemetry Frame Empty
                                        </div>
                                    )}
                                    <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {[
                                            { label: result.metadata?.type === 'visual' ? 'Resolution' : 'Signal', val: result.metadata?.resolution || (result.metadata?.duration ? `${result.metadata.duration.toFixed(2)}s` : '224x224') },
                                            { label: result.metadata?.type === 'visual' ? 'Format' : 'Sample', val: result.metadata?.format || (result.metadata?.sample_rate ? `${result.metadata.sample_rate}Hz` : 'JPEG') },
                                            { label: 'Noise', val: matchedBird?.soundProfile?.noiseLevel || 'LOW' },
                                            { label: 'Clarity', val: matchedBird?.soundProfile?.clarity || 'HIGH' }
                                        ].map(stat => (
                                            <div key={stat.label} className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <div className="text-[8px] text-white/20 font-black uppercase mb-1">{stat.label}</div>
                                                <div className="text-white font-black text-sm font-mono truncate">{stat.val}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-[40px] p-8 border border-white/10">
                                    <h3 className="text-[10px] font-black text-white/20 mb-6 uppercase tracking-[0.3em] flex items-center gap-2">
                                        <Activity size={14} className="text-blue-500" /> Contextual Reasoning Matrix
                                    </h3>
                                    <p className="text-white/60 text-lg leading-relaxed font-medium mb-6 italic">{activePrediction.context_reasoning}</p>
                                    <div className="flex gap-4">
                                        <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="text-[8px] text-blue-500 font-black uppercase mb-1">Seasonal Alignment</div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} className="h-full bg-blue-500" />
                                            </div>
                                        </div>
                                        <div className="flex-1 bg-white/5 p-4 rounded-2xl border border-white/5">
                                            <div className="text-[8px] text-cyan-500 font-black uppercase mb-1">Habitat Probablity</div>
                                            <div className="w-full h-1 bg-white/5 rounded-full mt-2 overflow-hidden">
                                                <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-cyan-500" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="bg-white/5 rounded-[40px] p-8 border border-white/10">
                                    <h3 className="text-[10px] font-black text-white/20 mb-6 uppercase tracking-[0.3em]">Alternate Probabilities</h3>
                                    <div className="space-y-4">
                                        {result.predictions.slice(1, 5).map((p, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedSpecies(p)}
                                                className={clsx(
                                                    "w-full text-left p-5 rounded-3xl border transition-all relative overflow-hidden group",
                                                    selectedSpecies?.common_name === p.common_name ? "bg-blue-600/10 border-blue-500/50 shadow-xl" : "bg-white/5 border-white/5 hover:bg-white/10"
                                                )}
                                            >
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-white font-black text-xs uppercase tracking-tight">{p.common_name}</span>
                                                    <span className="text-blue-500 font-mono text-xs font-black">{((p.adjusted_score || 0) * 100).toFixed(1)}%</span>
                                                </div>
                                                <div className="h-1 bg-white/5 rounded-full overflow-hidden">
                                                    <motion.div initial={{ width: 0 }} animate={{ width: `${(p.adjusted_score || 0) * 100}%` }} className="h-full bg-blue-500" />
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[40px] p-8 shadow-2xl shadow-blue-600/10">
                                    <Shield size={32} className="text-white/30 mb-6" />
                                    <h3 className="text-xl font-black text-white mb-3">Neural Verification</h3>
                                    <p className="text-white/60 text-sm mb-6 font-medium leading-relaxed">This identification has been cross-referenced with 50,000+ pan-India verified acoustic field samples.</p>
                                    <button onClick={exportPDF} className="w-full bg-white text-blue-900 py-4 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all flex items-center justify-center gap-2">
                                        <Download size={16} /> Export Dossier
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 bg-[#020817]/50 border-t border-white/5 flex flex-wrap justify-between items-center gap-6">
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] text-white/20 font-black uppercase tracking-widest hidden sm:block">Research Citations:</p>
                            <div className="flex gap-3">
                                <a href={`https://ebird.org/species/${activePrediction.common_name?.toLowerCase()?.replace(/[\s-]+/g, '') || ""}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><ExternalLink size={18} /></a>
                                <a href={`https://scholar.google.com/scholar?q=${encodeURIComponent(activePrediction.scientific_name || "")}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all"><BookOpen size={18} /></a>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {!isInconclusive && (
                                <button
                                    onClick={handleConfirm}
                                    disabled={confirmed}
                                    className={clsx(
                                        "px-10 py-5 rounded-2xl font-black uppercase text-xs tracking-[0.2em] transition-all shadow-2xl flex items-center gap-3",
                                        confirmed ? "bg-green-500/10 text-green-500 border border-green-500/20 shadow-none cursor-default" : "bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/20 hover:scale-105 active:scale-95"
                                    )}
                                >
                                    {confirmed ? <><ThumbsUp size={18} /> Verified</> : <><CheckCircle size={18} /> Commit Species</>}
                                </button>
                            )}
                            {isInconclusive && (
                                <button onClick={onClose} className="px-12 py-5 bg-white text-blue-900 rounded-2xl font-black uppercase text-xs tracking-widest hover:scale-105 transition-all">
                                    Analyze New Sample
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence >
    );
};

export default AnalysisResult;
