import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, StopCircle, Upload, Play, Pause, AlertTriangle, Loader, CheckCircle, MapPin, Scissors, RefreshCw, Activity, Cpu, Zap, Music } from 'lucide-react';
import clsx from 'clsx';
import { uploadAudio } from '../../utils/api';
import AnalysisResult from './AnalysisResult';
import { habitatTypes } from '../../utils/indianBirds';

const AudioInput = () => {
    const [recording, setRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [uploadError, setUploadError] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const mediaRecorderRef = useRef(null);
    const [audioUrl, setAudioUrl] = useState(null);
    const audioPlayerRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const fileInputRef = useRef(null);
    const [duration, setDuration] = useState(0);
    const [result, setResult] = useState(null);

    const [startTime, setStartTime] = useState(0);
    const [endTime, setEndTime] = useState(0);

    const [contextData, setContextData] = useState({
        latitude: '',
        longitude: '',
        habitat: ''
    });

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            const chunks = [];
            mediaRecorderRef.current.ondataavailable = (e) => chunks.push(e.data);
            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/wav' });
                handleAudioFile(blob);
            };
            mediaRecorderRef.current.start();
            setRecording(true);
            setUploadError(null);
        } catch (err) {
            setUploadError("Microphone access denied or unavailable.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && recording) {
            mediaRecorderRef.current.stop();
            setRecording(false);
        }
    };

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3', 'audio/x-m4a', 'audio/ogg', 'audio/webm'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.wav')) {
                setUploadError("Unsupported file format. Please upload WAV, MP3, or OGG.");
                return;
            }
            if (file.size > 20 * 1024 * 1024) {
                setUploadError("File size exceeds 20MB technical limit.");
                return;
            }
            handleAudioFile(file);
        }
    };

    const handleAudioFile = (blob) => {
        setUploadError(null);
        if (audioUrl) URL.revokeObjectURL(audioUrl);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        setAudioBlob(blob);
        setResult(null);
    };

    const togglePlay = () => {
        if (audioPlayerRef.current) {
            if (isPlaying) {
                audioPlayerRef.current.pause();
            } else {
                if (audioPlayerRef.current.currentTime < startTime || audioPlayerRef.current.currentTime > endTime) {
                    audioPlayerRef.current.currentTime = startTime;
                }
                audioPlayerRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        if (audioPlayerRef.current) {
            const handleEnded = () => setIsPlaying(false);
            const handleLoaded = () => {
                const d = audioPlayerRef.current.duration;
                setDuration(d);
                setStartTime(0);
                setEndTime(d);
            };
            const handleTimeUpdate = () => {
                if (audioPlayerRef.current.currentTime >= endTime && isPlaying) {
                    audioPlayerRef.current.pause();
                    setIsPlaying(false);
                    audioPlayerRef.current.currentTime = startTime;
                }
            };
            audioPlayerRef.current.addEventListener('ended', handleEnded);
            audioPlayerRef.current.addEventListener('loadedmetadata', handleLoaded);
            audioPlayerRef.current.addEventListener('timeupdate', handleTimeUpdate);
            return () => {
                if (audioPlayerRef.current) {
                    audioPlayerRef.current.removeEventListener('ended', handleEnded);
                    audioPlayerRef.current.removeEventListener('loadedmetadata', handleLoaded);
                    audioPlayerRef.current.removeEventListener('timeupdate', handleTimeUpdate);
                }
            }
        }
    }, [audioUrl, endTime, isPlaying, startTime]);

    const handleSubmit = async () => {
        if (!audioBlob) return;
        setIsProcessing(true);
        setUploadError(null);
        try {
            let fileToUpload = audioBlob;
            if (!(audioBlob instanceof File)) {
                fileToUpload = new File([audioBlob], "recording.wav", { type: 'audio/wav' });
            }
            const enhancedContext = { ...contextData, segment_start: startTime, segment_end: endTime };
            const data = await uploadAudio(fileToUpload, enhancedContext);
            setResult(data);
        } catch (err) {
            setUploadError("Neural analysis failed. " + (err.response?.data?.detail || err.message));
        } finally {
            setIsProcessing(false);
        }
    };

    const getLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setContextData(prev => ({ ...prev, latitude: position.coords.latitude, longitude: position.coords.longitude }));
                },
                (err) => setUploadError("GPS Telemetry error: " + err.message)
            );
        }
    };


    return (
        <div className="w-full relative group">
            <AnimatePresence mode="wait">
                {!audioUrl ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="flex flex-col md:flex-row items-center justify-center gap-12"
                    >
                        <div className="flex flex-col items-center gap-4">
                            <button
                                onClick={recording ? stopRecording : startRecording}
                                className={clsx(
                                    "relative w-32 h-32 rounded-full transition-all duration-500 flex items-center justify-center group",
                                    recording ? "bg-red-500 shadow-2xl shadow-red-500/50 scale-110" : "bg-white/5 hover:bg-white/10 border border-white/10"
                                )}
                            >
                                {recording ? (
                                    <StopCircle size={48} className="text-white" />
                                ) : (
                                    <Mic size={48} className="text-blue-500 group-hover:scale-110 transition-transform" />
                                )}
                                {recording && (
                                    <motion.div
                                        animate={{ scale: [1, 1.2, 1] }}
                                        transition={{ repeat: Infinity, duration: 2 }}
                                        className="absolute -inset-4 border-2 border-red-500/30 rounded-full"
                                    />
                                )}
                            </button>
                            <span className={clsx("text-[10px] font-black uppercase tracking-widest", recording ? "text-red-400" : "text-white/20")}>
                                {recording ? "Live Recording..." : "Pulse Recording"}
                            </span>
                        </div>

                        <div className="hidden md:block w-px h-24 bg-white/5" />

                        <div className="flex flex-col items-center gap-4">
                            <input 
                                id="audio-file-upload"
                                name="audio-file"
                                type="file" 
                                accept="audio/*" 
                                className="hidden" 
                                ref={fileInputRef} 
                                onChange={handleFileUpload} 
                            />
                            <button
                                id="upload-trigger"
                                onClick={() => fileInputRef.current.click()}
                                aria-label="Upload bird audio file"
                                className="w-32 h-32 rounded-[32px] bg-white/5 border border-white/5 hover:border-blue-500/50 flex flex-col items-center justify-center gap-3 transition-all group"
                            >
                                <Music size={40} className="text-white/20 group-hover:text-blue-500 group-hover:scale-110 transition-all" />
                            </button>
                            <span className="text-[10px] text-white/20 font-black uppercase tracking-widest">Repository Upload</span>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-8"
                    >
                        {/* Audio Player Glass */}
                        <div className="bg-white/5 backdrop-blur-3xl rounded-[40px] p-8 border border-white/10 shadow-2xl">
                            <div className="flex items-center gap-6 mb-8">
                                <button onClick={togglePlay} className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-xl shadow-blue-600/20 hover:scale-105 active:scale-95 transition-all">
                                    {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                                </button>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center mb-3">
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Sample Monitor</span>
                                        <span className="text-xs font-mono text-white/40">{startTime.toFixed(1)}s — {endTime.toFixed(1)}s</span>
                                    </div>
                                    <div className="relative h-2 flex items-center group">
                                        <div className="absolute w-full h-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className="absolute h-full bg-blue-500/30"
                                                style={{ left: `${(startTime / duration) * 100}%`, width: `${((endTime - startTime) / duration) * 100}%` }}
                                            />
                                        </div>
                                        <input
                                            type="range" min="0" max={duration} step="0.1" value={startTime}
                                            onChange={(e) => setStartTime(Math.min(parseFloat(e.target.value), endTime - 1))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <input
                                            type="range" min="0" max={duration} step="0.1" value={endTime}
                                            onChange={(e) => setEndTime(Math.max(parseFloat(e.target.value), startTime + 1))}
                                            className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                                        />
                                        <div className="absolute h-4 w-4 bg-white rounded-full shadow-xl pointer-events-none border-2 border-blue-600" style={{ left: `calc(${(startTime / duration) * 100}% - 8px)` }} />
                                        <div className="absolute h-4 w-4 bg-white rounded-full shadow-xl pointer-events-none border-2 border-blue-600" style={{ left: `calc(${(endTime / duration) * 100}% - 8px)` }} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                    <label htmlFor="habitat-select" className="text-[10px] font-black text-white/20 uppercase mb-3 block tracking-widest">Habitat Logic</label>
                                    <select
                                        id="habitat-select"
                                        name="habitat"
                                        value={contextData.habitat}
                                        onChange={(e) => setContextData({ ...contextData, habitat: e.target.value })}
                                        className="w-full bg-transparent text-sm text-white focus:outline-none font-bold cursor-pointer"
                                    >
                                        <option value="" className="bg-[#0a101f]">Auto-Detect Environment</option>
                                        {habitatTypes.map(h => <option key={h} value={h.toLowerCase()} className="bg-[#0a101f]">{h}</option>)}
                                    </select>
                                </div>
                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 group hover:border-blue-500/30 transition-all">
                                    <label className="text-[10px] font-black text-white/20 uppercase mb-3 block tracking-widest">Telemetry GPS</label>
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-bold text-white/40 truncate mr-2">
                                            {contextData.latitude ? `${contextData.latitude.toFixed(4)}, ${contextData.longitude.toFixed(4)}` : "Location Pending"}
                                        </span>
                                        <button onClick={getLocation} className="p-2 bg-blue-600/10 text-blue-500 rounded-xl hover:bg-blue-600 hover:text-white transition-all">
                                            <MapPin size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <button
                                onClick={() => { setAudioUrl(null); setAudioBlob(null); }}
                                className="px-8 py-5 text-white/20 hover:text-white font-black uppercase text-xs tracking-widest transition-all"
                            >
                                Reset Analysis
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isProcessing}
                                className="flex-1 px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 disabled:bg-blue-600/40 flex items-center justify-center gap-3 active:scale-95"
                            >
                                {isProcessing ? <><Loader className="animate-spin" size={20} /> Parsing Acoustics</> : <><CheckCircle size={20} /> Initialize ML Core</>}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {uploadError && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-100/60 text-xs font-bold ring-shake">
                    <AlertTriangle size={16} className="text-red-500" /> {uploadError}
                </motion.div>
            )}

            {result && <AnalysisResult result={result} onClose={() => setResult(null)} />}
            <audio ref={audioPlayerRef} src={audioUrl} className="hidden" />
        </div>
    );
};

export default AudioInput;
