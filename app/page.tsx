'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Sparkles, ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
      
      {/* --- 1. BACKGROUND GLOWS (The NGL Vibe) --- */}
      {/* Top Left Pink Blob */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-pink-600 rounded-full blur-[120px] opacity-40 animate-pulse" />
      {/* Bottom Right Purple Blob */}
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-violet-700 rounded-full blur-[120px] opacity-40 animate-pulse" style={{ animationDuration: '4s' }} />

      {/* --- 2. MAIN CONTENT --- */}
      <main className="relative z-10 w-full max-w-md flex flex-col items-center text-center">
        
        {/* Floating Icon */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          className="mb-6"
        >
            <div className="w-16 h-16 bg-gradient-to-tr from-pink-500 to-orange-500 rounded-2xl rotate-12 shadow-[0_0_30px_rgba(236,72,153,0.5)] flex items-center justify-center">
                <Zap size={32} className="text-white fill-white" />
            </div>
        </motion.div>

        {/* LOGO: "whisper" */}
<div className="flex flex-col items-center mb-2">
            <motion.h1 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-6xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.5)]"
            >
              whisper
            </motion.h1>
            {/* 👇 ADDED THIS */}
<motion.span 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.5 }}
                className="text-sm font-bold font-mono text-zinc-300 tracking-[0.3em] uppercase mt-2"
            >
                by nahian
            </motion.span>
        </div>

        <motion.p 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-lg font-medium text-slate-300 mb-12 max-w-xs mx-auto"
        >
          Send anonymous messages. <br/>
          <span className="text-white font-bold">See who really knows you.</span>
        </motion.p>

        {/* --- 3. THE "NGL" BUTTON --- */}
        <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="w-full"
        >
            <Link href="/create" className="block group relative w-full">
                <div className="absolute -inset-1 bg-gradient-to-r from-pink-600 to-orange-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 animate-tilt"></div>
                <button className="relative w-full bg-black border border-white/10 hover:bg-zinc-900 text-white font-bold text-xl py-5 px-8 rounded-full transition-all flex items-center justify-center gap-3">
                    <Sparkles size={24} className="text-yellow-400 fill-yellow-400" />
                    <span>Create Your Secret</span>
                    <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform"/>
                </button>
            </Link>
        </motion.div>

        {/* Sub-text */}
        <p className="mt-6 text-sm text-white/40 font-medium">
            100% Anonymous. No login required.
        </p>
      </main>

      {/* --- 4. FOOTER --- */}
      <footer className="absolute bottom-6 w-full text-center">
        <p className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold hover:text-pink-500 transition-colors cursor-default">
            Under developed by Nahian
        </p>
      </footer>

    </div>
  );
}