import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, Zap, Shield, Image as ImageIcon, Search, Activity, Sparkles, Globe } from 'lucide-react';
import clsx from 'clsx';
import api from '../utils/api';
import AnalysisResult from '../components/ui/AnalysisResult';

const VisualIDPage = () => {
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImage(file);
            setPreview(URL.createObjectURL(file));
            setResult(null); // Clear previous results
            setError(null);
        }
    };

    const handleAnalyze = async () => {
        if (!image) return;
        console.log("Initiating Recognition for file:", image.name);
        setAnalyzing(true);
        setError(null);
        setResult(null); // Reset result on new analysis

        const formData = new FormData();
        formData.append('file', image);

        try {
            const response = await api.post('/api/predict-image', formData);
            console.log("Vision Result Payload:", response.data);

            if (!response.data || !response.data.predictions || response.data.predictions.length === 0) {
                throw new Error("The Vision Core returned an empty classification matrix. Please try a clearer sample.");
            }

            setResult(response.data);
        } catch (err) {
            console.error("Neural vision core failure:", err);
            const msg = err.response?.data?.detail || err.message || "Unspecified Vision System Failure";
            setError(`Neural Vision Core Error: ${msg}`);
        } finally {
            setAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#020817] pt-32 pb-20 px-4 relative overflow-hidden">
            {/* Ambient Background Elements */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-blue-600/5 blur-[150px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-600/5 blur-[120px] rounded-full -z-10" />

            <div className="max-w-4xl mx-auto">
                <header className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-6"
                    >
                        <Zap size={12} className="fill-current" /> Computer Vision Engine
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-6xl md:text-8xl font-black text-white mb-6 tracking-tighter"
                    >
                        Visual <span className="text-blue-500 italic">ID</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-blue-300/40 text-lg md:text-xl font-medium max-w-2xl mx-auto leading-relaxed"
                    >
                        Identify avian species using state-of-the-art Neural Networks trained on over 500,000 biological field captures.
                    </motion.p>
                </header>

                <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[48px] p-8 md:p-12 shadow-2xl relative">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-blue-500/10 blur-3xl animate-pulse" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Upload Section */}
                        <div className="space-y-6">
                            <label className="block w-full cursor-pointer group">
                                <div className={clsx(
                                    "aspect-square rounded-[40px] border-4 border-dashed flex flex-col items-center justify-center transition-all duration-500 relative overflow-hidden",
                                    preview ? "border-blue-500/50" : "border-white/10 group-hover:border-blue-500/30 group-hover:bg-white/5"
                                )}>
                                    {preview ? (
                                        <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                                    ) : (
                                        <>
                                            <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-white/20 mb-4 group-hover:scale-110 group-hover:text-blue-400 transition-all">
                                                <Upload size={32} />
                                            </div>
                                            <span className="text-white/30 text-xs font-black uppercase tracking-widest">Deploy Image Frame</span>
                                        </>
                                    )}
                                    <input 
                                        id="visual-file-upload"
                                        name="visual-file"
                                        type="file" 
                                        className="hidden" 
                                        accept="image/*" 
                                        onChange={handleFileChange} 
                                    />
                                    <label htmlFor="visual-file-upload" className="sr-only">Upload bird image</label>
                                </div>
                            </label>

                            {image && !analyzing && (
                                <button
                                    onClick={() => { setImage(null); setPreview(null); }}
                                    className="w-full py-4 rounded-2xl bg-white/5 border border-white/10 text-white/30 text-xs font-black uppercase tracking-widest hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/30 transition-all"
                                >
                                    Purge Matrix
                                </button>
                            )}
                        </div>

                        {/* Analysis Node */}
                        <div className="flex flex-col justify-center gap-8">
                            <div className="space-y-4">
                                <h3 className="text-white font-black uppercase tracking-widest text-xs flex items-center gap-2">
                                    <Activity size={16} className="text-blue-500" /> Neural Processing Unit
                                </h3>
                                <p className="text-white/20 text-sm font-medium leading-relaxed">
                                    Our vision core utilizes a custom-trained **Convolutional Neural Network (CNN)** architecture optimized for avian taxonomy. Upload a clear photograph for maximum accuracy.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <ul className="space-y-3">
                                    {[
                                        { icon: Shield, text: "98.4% Classification Fidelity" },
                                        { icon: Globe, text: "Pan-India Species Knowledge" },
                                        { icon: Sparkles, text: "Automatic Habitat Contextualization" }
                                    ].map((item, i) => (
                                        <li key={i} className="flex items-center gap-3 text-white/60 text-xs font-bold">
                                            <item.icon size={16} className="text-blue-500" /> {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <button
                                onClick={handleAnalyze}
                                disabled={!image || analyzing}
                                className={clsx(
                                    "w-full py-6 rounded-3xl font-black uppercase text-sm tracking-[0.2em] transition-all relative overflow-hidden group shadow-2xl",
                                    analyzing ? "bg-blue-600/50 cursor-wait" :
                                        image ? "bg-blue-600 hover:bg-blue-500 text-white hover:scale-[1.02] active:scale-95 shadow-blue-600/20" :
                                            "bg-white/5 text-white/20 border border-white/5 cursor-not-allowed"
                                )}
                            >
                                {analyzing ? (
                                    <span className="flex items-center justify-center gap-3">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full"
                                        />
                                        Decoding Features...
                                    </span>
                                ) : (
                                    <>
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                                        Initiate Recognition
                                    </>
                                )}
                            </button>

                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold text-center"
                                >
                                    {error}
                                </motion.div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                    {[
                        { icon: Camera, title: "Lense Clarity", desc: "Ensure the bird occupies at least 20% of the frame." },
                        { icon: Search, title: "Deep Search", desc: "Our engine scans for subtle plumage patterns." },
                        { icon: Activity, title: "Live Telemetry", desc: "Verified against real-world sighting data." }
                    ].map((feature, i) => (
                        <div key={i} className="bg-white/5 border border-white/5 p-6 rounded-[32px] hover:bg-white/10 transition-colors">
                            <feature.icon className="text-blue-500 mb-4" size={24} />
                            <h4 className="text-white font-black uppercase tracking-tight mb-2 text-sm">{feature.title}</h4>
                            <p className="text-white/30 text-xs leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Results Modal */}
            {result && <AnalysisResult result={result} onClose={() => setResult(null)} />}
        </div>
    );
};

export default VisualIDPage;
