'use client'

import { Entropy } from "@/components/ui/entropy"
import { motion } from "framer-motion"

const EntropyDemoComponent = () => {
  return (
    <div className="flex flex-col items-center justify-center bg-black text-white py-12 w-full p-8 border-y border-white/5">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="flex flex-col items-center"
      >
        <Entropy size={300} className="rounded-lg shadow-[0_0_50px_rgba(255,255,255,0.05)]" />
        <div className="mt-8 text-center max-w-sm">
          <div className="space-y-4 font-mono text-[14px] leading-relaxed">
            <p className="italic text-gray-400/80 tracking-wide">
              &ldquo;Clinical entropy visualization &mdash;
              <span className="opacity-70">mapping the boundary of clinical certainty.&rdquo;</span>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export { EntropyDemoComponent as EntropyDemo }
