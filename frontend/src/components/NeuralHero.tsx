'use client'

import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, ChevronDown, Activity, Sparkles } from 'lucide-react';

export const NeuralHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    const chars = '01';
    const fontSize = 12;
    const columns = Math.ceil(canvas.width / fontSize);
    const drops: number[] = new Array(columns).fill(1).map(() => Math.random() * -100);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#ffffff08'; // Extremely subtle neutral data rain
      ctx.font = `${fontSize}px "Inter"`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        if (drops[i] * fontSize > canvas.height && Math.random() > 0.98) {
          drops[i] = 0;
        }
        drops[i] += 0.5;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black pb-20">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-40"
      />
      
      <div className="container mx-auto px-4 z-10 pt-32">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-5xl mx-auto text-center space-y-12"
        >
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full glass-card text-[10px] font-black uppercase tracking-[0.4em] text-white/60"
          >
             <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" /> 
             <span>AICanScanO • <span className="text-[#D4AF37] drop-shadow-md">Powered by Orocare AI</span></span>
          </motion.div>

          <div className="space-y-6">
            <h1 className="text-7xl md:text-9xl font-black tracking-tighter text-white leading-[0.85] uppercase">
              AICanScanO<br/><span className="text-white/20 italic font-light lowercase">intelligence</span>
            </h1>
            <p className="text-3xl md:text-4xl font-light tracking-tight text-white/40 max-w-3xl mx-auto">
              Early detection protocols for oral malignancy through high-fidelity biometric analysis.
            </p>
          </div>

          <p className="text-base md:text-lg text-white/30 max-w-2xl mx-auto leading-relaxed font-medium tracking-wide">
            Utilizing sub-pixel feature extraction and oral scan clinical mapping to deliver a 94% screening accuracy standard in clinical environments.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-8 pt-10">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-16 py-6 rounded-full bg-white text-black font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:shadow-white/10"
            >
              Initialize Scan
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-16 py-6 rounded-full bg-transparent border border-white/10 text-white font-black text-xs uppercase tracking-[0.3em] transition-all"
            >
              Protocol Info
            </motion.button>
          </div>
        </motion.div>
      </div>

      <motion.div 
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-16 left-1/2 -translate-x-1/2 text-white/10 cursor-pointer hidden md:block"
        onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <ChevronDown size={32} />
      </motion.div>
      
      <div className="glue-ambient" />
    </section>
  );
};
