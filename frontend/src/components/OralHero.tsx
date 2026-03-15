import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Shield, Activity, Zap, ArrowRight, BrainCircuit } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const NeuralHero: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];

    const resize = () => {
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      speed: number;
      char: string;
      opacity: number;

      constructor() {
        if (!canvasRef.current) {
          this.x = 0;
          this.y = 0;
        } else {
          this.x = Math.random() * canvasRef.current.width;
          this.y = Math.random() * canvasRef.current.height;
        }
        this.speed = 1 + Math.random() * 2;
        this.char = Math.random() > 0.5 ? '0' : '1';
        this.opacity = Math.random() * 0.5;
      }

      update() {
        if (!canvasRef.current) return;
        this.y += this.speed;
        if (this.y > canvasRef.current.height) {
          this.y = -20;
          this.x = Math.random() * canvasRef.current.width;
        }
      }

      draw() {
        ctx!.fillStyle = `rgba(0, 240, 255, ${this.opacity})`;
        ctx!.font = '10px monospace';
        ctx!.fillText(this.char, this.x, this.y);
      }
    }

    const init = () => {
      particles = Array.from({ length: 150 }, () => new Particle());
    };

    const animate = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      particles.forEach(p => {
        p.update();
        p.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    init();
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-black pt-20">
      <canvas ref={canvasRef} className="absolute inset-0 opacity-40 pointer-events-none" />
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
            <BrainCircuit className="w-4 h-4" />
            Orocare AI • Neural Analysis System 2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none">
            PRECISION <span className="text-primary italic">ORAL</span> SCANNING<br />
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"> POWERED BY AI</span>
          </h1>

          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            AICanScanO streamlines early detection through advanced biometric pattern recognition. 
            Real-time neural processing with <span className="text-primary font-bold">94% screening accuracy</span> for intra-oral lesions.
          </p>

          <div className="flex flex-wrap justify-center gap-6 pt-4">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Shield className="w-5 h-5 text-secondary" />
              Clinical Grade
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Activity className="w-5 h-5 text-primary" />
              Real-time Processing
            </div>
            <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
              <Zap className="w-5 h-5 text-accent" />
              Instant Results
            </div>
          </div>

          <div className="pt-8">
            <Button size="lg" className="rounded-full px-12 py-8 text-xl font-bold uppercase tracking-widest bg-primary text-black group hover:scale-105 transition-all shadow-[0_0_50px_rgba(0,240,255,0.3)]" onClick={() => document.getElementById('upload')?.scrollIntoView({ behavior: 'smooth' })}>
              Start Neural Scan
              <ArrowRight className="ml-2 group-hover:translate-x-2 transition-transform" />
            </Button>
          </div>
        </motion.div>
      </div>
      
      {/* Decorative pulse */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_30px_rgba(0,240,255,0.5)]" />
    </section>
  );
};
