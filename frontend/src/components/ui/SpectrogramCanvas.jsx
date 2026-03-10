import React, { useEffect, useRef } from 'react';

const SpectrogramCanvas = ({ data }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas || !data || data.length === 0) return;

        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;

        // Sync with Ultra-Premium theme
        ctx.fillStyle = '#020817';
        ctx.fillRect(0, 0, width, height);

        const nMels = data.length;
        const nTime = data[0].length;

        if (nTime === 0) return;

        const cellWidth = width / nTime;
        const cellHeight = height / nMels;

        data.forEach((melRow, melIndex) => {
            melRow.forEach((value, timeIndex) => {
                // dB Normalization (-80 to 0 typical range)
                let intensity = (value + 80) / 80;
                intensity = Math.max(0, Math.min(1, intensity));

                // Plasma-inspired Bio-Colormap: Blue -> Indigo -> Cyan -> White
                let r, g, b;

                if (intensity < 0.3) {
                    r = 0; g = 10; b = Math.floor(100 + 400 * intensity);
                } else if (intensity < 0.7) {
                    const f = (intensity - 0.3) / 0.4;
                    r = Math.floor(59 * f);
                    g = Math.floor(130 * f);
                    b = 255;
                } else {
                    const f = (intensity - 0.7) / 0.3;
                    r = Math.floor(59 + 196 * f);
                    g = Math.floor(130 + 125 * f);
                    b = 255;
                }

                ctx.fillStyle = `rgb(${r},${g},${b})`;

                const y = height - (melIndex + 1) * cellHeight;
                ctx.fillRect(timeIndex * cellWidth, y, cellWidth + 0.3, cellHeight + 0.3);
            });
        });

    }, [data]);

    return (
        <div className="relative group">
            <div className="absolute -inset-1 bg-blue-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <canvas
                ref={canvasRef}
                width={1000}
                height={250}
                className="w-full h-44 bg-[#020817] rounded-2xl border border-white/5 shadow-2xl relative z-10"
            />
        </div>
    );
};

export default SpectrogramCanvas;
