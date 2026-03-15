'use client'

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ShieldAlert, Activity, Shield, Microscope, Sparkles, AlertCircle, Database, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

type RiskLevel = 'low' | 'moderate' | 'high';

interface AnalysisResult {
  clinical_assessment: {
    risk_level: RiskLevel;
    primary_findings: string;
    differential_diagnosis: string[];
    anatomical_location: string;
    precautionary_measures: string[];
    clinical_next_steps: string[];
  };
  ml_confidence_metrics: {
    overall_confidence: number;
    class_probabilities: {
      probability_normal_variant: number;
      probability_benign_lesion: number;
      probability_opmd: number;
      probability_frank_malignancy: number;
    };
    image_quality_auc_impact: string;
    false_positive_risk_index: string;
  };
  deployment_and_routing: {
    recommended_triage_action: string;
    target_time_to_referral: string;
    clinical_justification: string;
    specialist_type: string;
  };
  estimated_performance_metrics: {
    note: string;
    estimated_npv_for_this_case: string;
    model_version: string;
    dataset_diversity_score: string;
  };
  disclaimer: string;
  is_mock_fallback?: boolean;
}

export const AnalysisSection: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid input format. Provide clinical-grade intra-oral documentation (JPEG/PNG).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Telemetric payload exceeds 10MB threshold.');
      return;
    }
    setSelectedFile(file);
    setError(null);
    setResult(null);
    
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await fetch('http://localhost:3000/analyze', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Intelligence gateway timeout. Check clinical connectivity.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'System fault during biometric pattern extraction.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setResult(null);
    setError(null);
  };

  return (
    <section id="upload" className="py-40 bg-black relative">
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/5 to-transparent" />
      
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto space-y-24"
        >
          <div className="text-center space-y-8">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full glass-card text-[10px] uppercase tracking-[0.4em] text-white/60 font-black">
               <Shield className="w-3.5 h-3.5 text-white/40" /> 
               <span>CLINICAL DIAGNOSTIC GATEWAY</span>
            </div>
            <h2 className="text-6xl md:text-8xl font-black tracking-tighter text-white uppercase italic">
              AICanScanO <span className="opacity-20 not-italic">SCAN</span> ANALYTICS
            </h2>
            <p className="text-white/30 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
              Securely transmit intra-oral visual data for autonomous feature extraction and clinical risk stratification.
            </p>
          </div>

          {!result && !isAnalyzing && (
            <motion.div 
              layout
              className={cn(
                "relative group rounded-[3rem] transition-all duration-700 overflow-hidden glass-card",
                selectedFile ? "p-4" : "p-32"
              )}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
            >
              <AnimatePresence mode="wait">
                {!previewUrl ? (
                  <motion.div 
                    key="upload-prompt"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center text-center space-y-12 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="relative group/icon">
                      <div className="w-32 h-32 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center group-hover/icon:bg-white/[0.08] transition-all duration-700">
                        <Upload className="w-12 h-12 text-white/20 group-hover/icon:text-white transition-all duration-700" />
                      </div>
                      <div className="absolute -inset-8 bg-white/5 rounded-full blur-[60px] opacity-0 group-hover/icon:opacity-100 transition-all duration-700" />
                    </div>
                    <div className="space-y-4">
                      <p className="text-3xl font-black text-white uppercase tracking-tighter italic">Engage Intelligence System</p>
                      <p className="text-[10px] text-white/20 font-black tracking-[0.5em] uppercase">AICanScanO IMAGING / DICOM / CLINICAL • MAX 10MB</p>
                    </div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      hidden 
                      accept="image/*" 
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} 
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key="preview"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative group/preview"
                  >
                    <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 max-w-4xl mx-auto bg-black/40 shadow-2xl backdrop-blur-3xl">
                      <img src={previewUrl} alt="Preview" className="w-full h-auto max-h-[700px] object-contain opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex items-end p-12">
                         <div className="flex items-center gap-4">
                            <Sparkles className="w-6 h-6 text-white/60 animate-pulse" />
                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white/60">INTEGRITY VERIFIED • PAYLOAD INITIALIZED</p>
                         </div>
                      </div>
                    </div>
                    
                    <motion.button 
                      whileHover={{ rotate: 90, scale: 1.1 }}
                      onClick={reset}
                      className="absolute top-10 right-10 p-4 bg-black/60 border border-white/10 rounded-full text-white/40 hover:text-white transition-all z-20"
                    >
                      <X size={24} />
                    </motion.button>
                    
                    <div className="p-20 flex justify-center">
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleAnalyze} 
                        className="px-20 py-8 rounded-full bg-white text-black font-black text-xs uppercase tracking-[0.4em] transition-all shadow-[0_40px_80px_rgba(255,255,255,0.1)]"
                      >
                        Initiate Clinical Analysis
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {isAnalyzing && (
            <div className="flex flex-col items-center justify-center py-48 space-y-16">
              <div className="relative">
                 <div className="w-24 h-24 border-2 border-white/5 border-t-white/40 rounded-full animate-spin" />
                 <div className="absolute inset-0 bg-white/5 blur-3xl animate-pulse" />
              </div>
              <div className="text-center space-y-6">
                <h3 className="text-4xl font-black uppercase tracking-tighter text-white italic">Processing Biometrics...</h3>
                <div className="flex flex-col items-center gap-4">
                   <div className="w-80 h-[1px] bg-white/5 relative overflow-hidden">
                      <motion.div 
                        initial={{ left: "-100%" }}
                        animate={{ left: "100%" }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="absolute h-full w-1/2 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      />
                   </div>
                   <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.5em]">Extracting lesion morphology / oral scan stratification active</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 rounded-[2.5rem] glass-card border-white/10 flex flex-col md:flex-row items-center gap-10 text-white/80 max-w-3xl mx-auto"
            >
              <AlertCircle className="w-12 h-12 text-white/20" />
              <div className="space-y-2 text-center md:text-left">
                <p className="font-black text-xl uppercase tracking-widest italic">Gateway Exception</p>
                <p className="text-sm opacity-40 leading-relaxed font-bold tracking-wide">{error}</p>
              </div>
              <button className="md:ml-auto px-10 py-4 rounded-full border border-white/10 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-white/5 transition-all" onClick={reset}>Resume Protocol</button>
            </motion.div>
          )}

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-16"
              >
                {/* Result Control Center */}
                {result.is_mock_fallback && (
                  <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-6 rounded-2xl bg-red-950/40 border border-red-500/50 flex items-center justify-center gap-4 text-red-200"
                  >
                    <AlertTriangle className="w-6 h-6 text-red-400 animate-pulse" />
                    <div className="font-semibold text-sm">
                       <span className="font-black uppercase tracking-widest text-red-400">Warning: Simulated Response — </span>
                       No GEMINI_API_KEY detected on the server! Please add your API key in Render's Environment Variables to enable real AI tumor analysis. (Currently showing random mock data).
                    </div>
                  </motion.div>
                )}
                
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                  <div className={cn(
                    "lg:col-span-1 p-12 rounded-[3.5rem] border flex flex-col items-center justify-center text-center space-y-8 relative overflow-hidden glass-card",
                    result.clinical_assessment.risk_level === 'high' ? "border-white/20" : "border-white/5"
                  )}>
                    <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Risk Stratification</span>
                    <h3 className={cn(
                      "text-6xl font-black uppercase tracking-[calc(-0.05em)] italic",
                      result.clinical_assessment.risk_level === 'high' ? "text-white" : "text-white/60"
                    )}>
                      {result.clinical_assessment.risk_level}
                    </h3>
                    <div className="flex items-center gap-3 px-5 py-2 rounded-full bg-white/[0.03] border border-white/10">
                       <ShieldAlert className="w-4 h-4 text-white/20" />
                       <span className="text-[9px] uppercase font-black text-white/40 tracking-[0.3em]">Protocol Active</span>
                    </div>
                  </div>

                  <div className="lg:col-span-3 p-16 rounded-[3.5rem] glass-card space-y-12 relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-white/5 pb-10">
                       <div className="space-y-4 text-left">
                         <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Biometric Assessment</span>
                         <h4 className="text-3xl font-black text-white uppercase tracking-tighter italic">Full Morphology Intel</h4>
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg bg-white/[0.03] border border-white/10 mt-2">
                             <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#D4AF37]">Location: {result.clinical_assessment.anatomical_location}</span>
                         </div>
                       </div>
                       <div className="text-left md:text-right">
                          <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.4em] mb-2 font-bold tracking-widest">Confidence Value</p>
                          <p className="text-6xl font-black text-white tracking-tighter">{(result.ml_confidence_metrics.overall_confidence * 100).toFixed(1)}%</p>
                       </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                       <div className="space-y-6">
                          <div className="flex items-center gap-3">
                             <Microscope className="w-5 h-5 text-white/20" />
                             <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/40">Automated Observations</span>
                          </div>
                          <p className="text-xl leading-relaxed text-white/80 italic font-medium">"{result.clinical_assessment.primary_findings}"</p>
                       </div>
                       <div className="space-y-8">
                          <div className="space-y-4">
                            <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Differential Diagnosis Vector</span>
                            <div className="flex flex-wrap gap-3">
                               {result.clinical_assessment.differential_diagnosis?.map((d: string, i: number) => (
                                 <span key={i} className="px-6 py-2 rounded-full bg-white/[0.03] border border-white/10 text-[10px] font-black text-white/60 lowercase tracking-widest italic uppercase">
                                   {d}
                                 </span>
                               ))}
                             </div>
                           </div>
                           
                           <div className="space-y-4 pt-4 border-t border-white/5">
                             <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Precautionary Measures</span>
                             <ul className="space-y-2 text-sm text-white/60 font-medium list-disc list-inside">
                               {result.clinical_assessment.precautionary_measures?.map((m: string, i: number) => (
                                 <li key={i}>{m}</li>
                               ))}
                             </ul>
                           </div>
                           
                           <div className="space-y-4 pt-4 border-t border-white/5">
                             <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Immediate Next Steps</span>
                             <ul className="space-y-2 text-sm text-[#D4AF37]/90 font-medium list-none">
                               {result.clinical_assessment.clinical_next_steps?.map((step: string, i: number) => (
                                 <li key={i} className="flex items-center gap-2">
                                     <div className="w-1 h-1 rounded-full bg-[#D4AF37]" />
                                     {step}
                                 </li>
                               ))}
                             </ul>
                           </div>
                       </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 p-12 rounded-[3.5rem] glass-card space-y-12">
                    <div className="flex items-center gap-4">
                       <Database className="w-5 h-5 text-white/20" />
                       <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Probability Vectors</span>
                    </div>
                    <div className="space-y-10">
                      {Object.entries(result.ml_confidence_metrics.class_probabilities).map(([key, value]) => (
                        <div key={key} className="space-y-4">
                          <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase text-white/20 tracking-[0.4em]">{(key.replace(/probability_/g, '').replace(/_/g, ' ')) }</span>
                            <span className="text-2xl font-black text-white italic tracking-tighter">{(value * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-[2px] w-full bg-white/5 relative overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${value * 100}%` }}
                              transition={{ duration: 2, ease: [0.16, 1, 0.3, 1] }}
                              className={cn(
                                "absolute h-full",
                                key.includes('malignancy') && value > 0.3 ? "bg-white" : "bg-white/40"
                              )} 
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-10">
                     <div className="p-12 rounded-[3.5rem] glass-card space-y-12">
                        <div className="space-y-2">
                           <span className="text-[10px] font-black uppercase tracking-[0.4em] text-white/20">Clinical Intelligence Directive</span>
                           <h4 className="text-2xl font-black text-white uppercase tracking-tighter italic">Triage Recommendation</h4>
                        </div>
                        <div className="p-10 rounded-3xl bg-white/[0.03] border border-white/10 flex flex-col items-center text-center space-y-6">
                           <ShieldAlert className="w-10 h-10 text-white/20" />
                           <p className="text-3xl font-black text-white tracking-tighter uppercase leading-none underline decoration-white/10 underline-offset-[12px] decoration-1">
                              {result.deployment_and_routing.recommended_triage_action}
                           </p>
                        </div>
                        <div className="grid grid-cols-2 gap-8 border-t border-white/5 pt-10">
                           <div className="space-y-2">
                              <p className="text-[9px] uppercase font-black text-white/20 tracking-[0.4em]">Target Window</p>
                              <p className="text-xl font-black text-white uppercase tracking-tight italic">{result.deployment_and_routing.target_time_to_referral}</p>
                           </div>
                           <div className="space-y-2">
                              <p className="text-[9px] uppercase font-black text-white/20 tracking-[0.4em]">Expert Mapping</p>
                              <p className="text-xl font-black text-white uppercase tracking-tight italic">{result.deployment_and_routing.specialist_type || "Oral Pathologist"}</p>
                           </div>
                        </div>
                     </div>

                     <div className="p-12 rounded-[3.5rem] glass-card space-y-10 flex flex-col border-white/5 bg-transparent">
                        <div className="space-y-6 flex-grow">
                           <span className="text-[10px] font-black uppercase tracking-[0.5em] text-white/20">Technical Justification</span>
                           <p className="text-base font-medium leading-relaxed text-white/40 italic p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                              "{result.deployment_and_routing.clinical_justification}"
                           </p>
                        </div>
                        <div className="space-y-6 border-t border-white/5 pt-10">
                           <div className="flex items-center gap-3">
                              <Activity className="w-5 h-5 text-white/10" />
                              <span className="text-[10px] uppercase font-black tracking-[0.4em] text-white/20">Clinical Analytics Delta</span>
                           </div>
                           <div className="grid grid-cols-2 gap-6">
                              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                 <p className="text-[8px] uppercase text-white/10 font-black tracking-[0.4em] mb-2">Screening AUC</p>
                                 <p className="text-xl font-black text-white tracking-widest uppercase">Active</p>
                              </div>
                              <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
                                 <p className="text-[8px] uppercase text-white/10 font-black tracking-[0.4em] mb-2">Security Hash</p>
                                 <p className="text-xl font-black text-white tracking-widest uppercase italic truncate">Verified</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="p-12 rounded-[3.5rem] glass-card flex flex-col md:flex-row items-center gap-12 relative overflow-hidden text-center md:text-left">
                   <div className="w-20 h-20 rounded-3xl bg-white/[0.03] border border-white/5 flex items-center justify-center flex-shrink-0">
                      <Shield className="w-10 h-10 text-white/10" />
                   </div>
                   <div className="space-y-6 flex-grow">
                      <h5 className="text-xl font-black text-white uppercase tracking-[0.3em] italic">Intelligence System Disclosure</h5>
                      <p className="text-sm text-white/30 leading-relaxed max-w-5xl font-medium tracking-wide">
                         Autonomous screening synthesis generated via high-fidelity biometric pattern recognition. Protocol designed to augment clinical oversight. Diagnosis requires histopathological confirmation. {result.disclaimer}
                      </p>
                      <div className="pt-6 flex flex-wrap justify-center md:justify-start gap-8 text-[10px] font-black text-white/10 uppercase tracking-[0.5em]">
                         <span>PROTOCOL: CLINICAL-v4.2</span>
                         <span>TELEMETRY: ENCRYPTED-RSA</span>
                         <span>TS: {new Date().toISOString()}</span>
                      </div>
                   </div>
                </div>

                <div className="flex justify-center flex-col items-center gap-10 pt-16">
                  <div className="h-[2px] w-32 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                  <motion.button 
                    whileHover={{ scale: 1.05, backgroundColor: "rgba(255,255,255,0.05)" }}
                    className="px-20 py-8 rounded-full border border-white/10 text-white/40 hover:text-white uppercase tracking-[0.4em] font-black text-[10px] italic transition-all" 
                    onClick={reset}
                  >
                    Clear Clinical Manifest
                  </motion.button>
                  <p className="text-[10px] text-white/10 uppercase tracking-[0.8em] font-black">AICanScanO INTELLIGENCE SYSTEM</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </section>
  );
};
