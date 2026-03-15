'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen relative flex flex-col bg-black text-white selection:bg-white selection:text-black">
      {/* Full Screen Animated Border Glow (from Search Component aesthetics) */}
      <div className="fixed inset-0 pointer-events-none z-[999] p-[4px] opacity-100" style={{
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude'
      }}>
        <div className="absolute top-1/2 left-1/2 w-[250vw] h-[250vh] -translate-x-1/2 -translate-y-1/2 animate-[spin_8s_linear_infinite] bg-[conic-gradient(#000,#402fb5_5%,#000_38%,#000_50%,#cf30aa_60%,#000_87%)]" />
        <div className="absolute top-1/2 left-1/2 w-[250vw] h-[250vh] -translate-x-1/2 -translate-y-1/2 animate-[spin_12s_linear_infinite_reverse] bg-[conic-gradient(transparent,#18116a_15%,transparent_35%,transparent_50%,#6e1b60_65%,transparent_85%)] blur-[8px]" />
      </div>

      {/* Permanent Smarter Glue Border */}
      <div className="glue-ambient" aria-hidden="true" />
      
      {/* Ambient Depth Layer */}
      <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] rounded-full bg-white/[0.03] blur-[150px]" />
        <div className="absolute bottom-[-10%] left-[-20%] w-[600px] h-[600px] rounded-full bg-white/[0.02] blur-[120px]" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-[100] border-b border-white/5 bg-black/40 backdrop-blur-3xl">
        <div className="container mx-auto px-6 h-24 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-6"
          >
            <div 
                className="flex items-center gap-3 group cursor-pointer" 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            >
              <span className="text-3xl font-black tracking-tighter text-white uppercase italic">AICanScanO</span>
              <div className="h-5 w-[1px] bg-white/20 rotate-[20deg]" />
              <div className="flex flex-col">
                <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/50 leading-none mb-1">Powered by</span>
                <span className="text-[10px] uppercase font-black tracking-[0.3em] text-[#D4AF37] leading-none drop-shadow-md">Orocare AI</span>
              </div>
            </div>
            
            <div className="hidden lg:flex items-center gap-3 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10">
              <div className="w-1 h-1 rounded-full bg-white/40 animate-pulse" />
              <span className="text-[10px] uppercase font-black text-white/40 tracking-[0.3em]">Protocol Active</span>
            </div>
          </motion.div>

          <nav className="hidden md:flex items-center gap-12">
            {['Protocol', 'Intelligence', 'FAQ'].map((item) => (
                <a 
                    key={item} 
                    href={`#${item.toLowerCase().replace(' ', '-')}`} 
                    className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 hover:text-white transition-all duration-500 hover:tracking-[0.6em]"
                >
                    {item}
                </a>
            ))}
             <button 
                onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}
                className="px-8 py-3 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-[0.4em] text-white hover:bg-white hover:text-black transition-all duration-500"
             >
                Initialize
             </button>
          </nav>
        </div>
      </header>

      <main className="flex-grow">
        {children}
      </main>

      <footer className="border-t border-white/5 bg-black py-24 pb-32">
        <div className="container mx-auto px-6">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-20">
            <div className="flex flex-col gap-8 max-w-md">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-black tracking-tighter text-white italic">AICanScanO</span>
                
                <div className="relative group flex items-center justify-center isolation-auto">
                    {/* Glowing animated conic gradient border background */}
                    <div className="absolute -inset-[2px] rounded-full blur-[4px] bg-[conic-gradient(from_0deg,#d4af37,transparent_30%,transparent_70%,#d4af37)] animate-[spin_4s_linear_infinite] opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
                    {/* Black core inner pill matching the background */}
                    <div className="relative px-5 py-2 rounded-full bg-black flex items-center justify-center">
                        <span className="text-[10px] uppercase tracking-[0.4em] font-black text-[#D4AF37] drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]">
                            Powered by Orocare AI
                        </span>
                    </div>
                </div>
              </div>
              <p className="text-sm text-white/20 leading-relaxed font-semibold tracking-wide uppercase">
                High-fidelity clinical screening protocol for early oral cancer detection. Distributed clinical registry driving global health intelligence.
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-x-24 gap-y-12">
                <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 block">Navigation</span>
                    <div className="flex flex-col gap-4">
                        <a href="#how-it-works" className="text-xs font-bold text-white/30 hover:text-white transition-colors">Protocol</a>
                        <a href="#upload" className="text-xs font-bold text-white/30 hover:text-white transition-colors">Intelligence</a>
                        <a href="#faq" className="text-xs font-bold text-white/30 hover:text-white transition-colors">FAQ</a>
                    </div>
                </div>
                <div className="space-y-6">
                    <span className="text-[10px] font-black uppercase tracking-[0.6em] text-white/10 block">Disclosure</span>
                    <div className="flex flex-col gap-4">
                        <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors uppercase">Privacy</a>
                        <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors uppercase">Ethics</a>
                        <a href="#" className="text-xs font-bold text-white/30 hover:text-white transition-colors uppercase">Medical</a>
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-24 pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
            <p className="text-[10px] text-white/10 uppercase tracking-[0.5em] font-black">
              © 2026 Orocare AI · Distributed Clinical Registry System
            </p>
            <div className="flex items-center gap-4 group">
               <Shield className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors" />
               <span className="text-[10px] uppercase tracking-[0.4em] text-white/10 group-hover:text-white/30 font-black">Credential Verified</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
