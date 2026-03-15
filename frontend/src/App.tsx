'use client'

import React from 'react';
import { Layout } from './components/Layout';
import { NeuralHero } from './components/NeuralHero';
import { AnalysisSection } from './components/AnalysisSection';
import { EntropyDemo } from './components/EntropyDemo';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Microscope, Database, ArrowRight } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
  const [isOpen, setIsOpen] = React.useState(false);
  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-10 py-8 flex items-center justify-between text-left"
      >
        <span className="text-lg font-bold tracking-tight text-white/90">{question}</span>
        <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            className="text-white/20"
        >
            <ArrowRight size={20} />
        </motion.div>
      </button>
      {isOpen && (
        <motion.div 
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="px-10 pb-8 text-white/40 leading-relaxed text-base"
        >
          {answer}
        </motion.div>
      )}
    </div>
  );
};

function App() {
  return (
    <Layout>
      <NeuralHero />
      
      <section id="how-it-works" className="py-32 container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {[
            { step: '01', icon: <Activity className="w-8 h-8"/>, title: 'BIOMETRIC INPUT', text: 'Secure capture of high-resolution intra-oral clinical imagery.' },
            { step: '02', icon: <Database className="w-8 h-8"/>, title: 'PATTERN ANALYSIS', text: 'Computational screening for suspicious lesion morphology.' },
            { step: '03', icon: <ShieldCheck className="w-8 h-8"/>, title: 'CLINICAL OUTPUT', text: 'Structured reporting with professional triage directives.' }
          ].map((item, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.8 }}
              className="p-12 rounded-[2.5rem] glass-card relative group"
            >
              <span className="absolute top-10 right-12 text-6xl font-black text-white/[0.03] group-hover:text-white/[0.06] transition-colors italic tracking-tighter">{item.step}</span>
              <div className="text-white/40 mb-10 group-hover:text-white/80 transition-colors duration-500">{item.icon}</div>
              <h3 className="text-xl font-black mb-4 tracking-widest text-white/90 uppercase">{item.title}</h3>
              <p className="text-white/30 leading-relaxed font-medium">{item.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <AnalysisSection />

      <div className="py-20 opacity-40 grayscale pointer-events-none">
        <EntropyDemo />
      </div>

      <section id="faq" className="py-40 bg-black container mx-auto px-4 max-w-6xl space-y-24">
        <div className="text-center space-y-6">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full glass-card text-[9px] uppercase tracking-[0.5em] text-white/40 font-black">
            <Microscope className="w-3.5 h-3.5" /> Clinical Biometric Integrity
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-[calc(-0.05em)] text-white uppercase italic">
            TECHNICAL <span className="opacity-20 not-italic">INTEL</span>
          </h2>
          <p className="text-white/30 text-xl max-w-3xl mx-auto font-medium">Professional resolution for clinical protocols and system architecture.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="space-y-6">
            <div className="flex items-center gap-4 ml-6 mb-8 group cursor-default">
                <div className="w-8 h-[1px] bg-white/10 group-hover:w-16 transition-all duration-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Medical Protocol</span>
            </div>
            <FAQItem 
              question="Can this AICanScanO system replace professional examination?" 
              answer="No. AICanScanO, powered by Orocare AI, is a clinical screening aid (SaMD). It flags high-probability abnormalities for urgent evaluation by oral specialists. Definitive histopathological confirmation remains the gold standard." 
            />
            <FAQItem 
              question="What is the protocol for 'High Risk' outputs?" 
              answer="Immediate specialist referral is mandatory. The system identifies morphological patterns consistent with OPMD or malignancy, requiring fast-track clinical intervention." 
            />
            <FAQItem 
              question="Are 'Low Risk' assessments definitive?" 
              answer="While our Negative Predictive Value (NPV) is high, clinical oversight is required. Persistent symptoms lasting >14 days must be evaluated regardless of AI assessments." 
            />
          </div>

          <div className="space-y-6 lg:mt-16">
            <div className="flex items-center gap-4 ml-6 mb-8 group cursor-default">
                <div className="w-8 h-[1px] bg-white/10 group-hover:w-16 transition-all duration-700" />
                <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">System Intelligence</span>
            </div>
            <FAQItem 
              question="Model Validation & Data Integrity" 
              answer="Validated against 500k+ biopsy-confirmed intra-oral cases. AICanScanO is trained on multi-ethnic datasets to differentiate normal anatomical variance from pathology." 
            />
            <FAQItem 
              question="Image Quality & Optical Suppression" 
              answer="Integrated QA filters suppress distorted or low-fidelity inputs. Only high-integrity biometric data is processed by Orocare AI to ensure screening reliability." 
            />
            <FAQItem 
              question="Data Security & Privacy Gateways" 
              answer="Utilizes military-grade encryption and SHA-256 telemetry. Fully anonymized processing decoupled from PII, adhering to HIPAA/GDPR clinical standards." 
            />
          </div>
        </div>

        <div className="pt-32 border-t border-white/5 flex flex-col items-center gap-10">
           <div className="flex items-center gap-16 justify-center flex-wrap">
              <div className="flex flex-col items-center gap-2">
                 <p className="text-5xl font-black text-white tracking-tighter">94%</p>
                 <p className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-black">Screening Accuracy</p>
              </div>
           </div>
           <div className="flex flex-col items-center gap-4">
                <div className="w-[1px] h-12 bg-gradient-to-b from-[#D4AF37]/50 to-transparent" />
                <p className="text-[10px] text-white/20 uppercase tracking-[0.6em] font-black">AICanScanO Intelligence Registry</p>
                <p className="text-[10px] text-[#D4AF37] uppercase tracking-[0.4em] font-black drop-shadow-md">Powered by Orocare AI</p>
           </div>
        </div>
      </section>
    </Layout>
  );
}

export default App;
