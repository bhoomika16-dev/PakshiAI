import React from 'react';
import { Bird, Github, Mail, Shield, Globe, Cpu } from 'lucide-react';

const Footer = () => (
    <footer className="bg-[#020817] border-t border-white/5 py-12 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row justify-between items-center gap-12">
                <div className="flex flex-col items-center md:items-start gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-600/10 rounded-lg">
                            <Bird size={24} className="text-blue-500" />
                        </div>
                        <span className="text-2xl font-black text-white tracking-tighter">Pakshi<span className="text-blue-500">AI</span></span>
                    </div>
                    <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em] max-w-xs text-center md:text-left leading-relaxed">
                        The definitive ecological intelligence platform for the Indian subcontinent. Built for researchers, powered by acoustics.
                    </p>
                </div>

                <div className="flex flex-col items-center gap-6">
                    <div className="flex flex-wrap justify-center gap-8">
                        {[
                            { label: 'Intelligence Core v4.2', icon: <Cpu size={14} /> },
                            { label: 'Public Repo', icon: <Github size={14} /> },
                            { label: 'Privacy Protocol', icon: <Shield size={14} /> },
                        ].map(item => (
                            <div key={item.label} className="flex items-center gap-2 text-[10px] font-black text-white/20 uppercase tracking-widest hover:text-white/40 transition-colors">
                                {item.icon} {item.label}
                            </div>
                        ))}
                    </div>
                    <div className="flex gap-12 text-[9px] font-black text-blue-500/40 uppercase tracking-[0.3em]">
                        <span>50.4k Identified</span>
                        <span>12.2k Verified</span>
                        <span>Pan-India Nodes: 1,280</span>
                    </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-2">
                    <div className="flex gap-4">
                        <a href="#" className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"><Github size={18} /></a>
                        <a href="#" className="p-2 bg-white/5 rounded-lg text-white/20 hover:text-white transition-all"><Mail size={18} /></a>
                    </div>
                    <div className="text-white/10 text-[9px] font-black uppercase tracking-[0.4em] mt-2">© 2026 PAKSHIAI RESEARCH</div>
                </div>
            </div>
        </div>
    </footer>
);

export default Footer;
