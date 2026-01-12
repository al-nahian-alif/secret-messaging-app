'use client';

import React from 'react';
import Link from 'next/link';
import { motion, type Easing } from 'framer-motion';
import { Sparkles, Scroll, Key, Wand2 } from 'lucide-react';

// Animation variants for the "Magic Reveal" effect
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.3,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] as Easing }
  },
};

const floatingVariant = {
  animate: {
    y: [0, -15, 0],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as Easing
    }
  }
};

export default function LandingPage() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#0a0a12] text-amber-50">
      
      {/* --- BACKGROUND LAYERS --- */}
      
      {/* 1. The Dark Nebula Background */}
      <div 
        className="absolute inset-0 z-0 opacity-40"
        style={{
          backgroundImage: 'url("https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=2070&auto=format&fit=crop")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'screen'
        }}
      />

      {/* 2. Magic Dust / Fireflies Overlay */}
      <MagicDust />

      {/* --- MAIN CONTENT --- */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl flex flex-col items-center"
        >
          {/* Icon Header */}
          <motion.div variants={itemVariants} className="mb-6">
            <motion.div variants={floatingVariant} animate="animate">
              <Scroll className="w-16 h-16 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" />
            </motion.div>
          </motion.div>

          {/* Main Headline - Harry Potter Style Font */}
          <motion.h1 
            variants={itemVariants}
            className="font-serif text-5xl md:text-7xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-b from-amber-200 to-amber-600 drop-shadow-sm mb-6"
            style={{ fontFamily: 'var(--font-cinzel), serif' }}
          >
            I Solemnly Swear<br />
            <span className="text-3xl md:text-5xl text-slate-400 font-normal mt-2 block">
              Your Secrets Are Safe
            </span>
          </motion.h1>

          {/* Subtext */}
          <motion.p 
            variants={itemVariants}
            className="text-lg md:text-xl text-slate-300 max-w-2xl mb-12 font-light leading-relaxed"
          >
            Lock your messages behind a series of riddles. 
            Only those with the keys to your mind may enter and reveal the truth.
          </motion.p>

          {/* Buttons Area */}
          <motion.div 
            variants={itemVariants}
            className="flex flex-col md:flex-row gap-6 items-center"
          >
            {/* Primary Button: "Cast a Secret" */}
            <Link href="/create">
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 0 25px rgba(217, 119, 6, 0.6)" }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-8 py-4 bg-[#1a1a2e] border-2 border-amber-500 rounded-lg overflow-hidden transition-all duration-300"
              >
                {/* Glow effect behind button */}
                <div className="absolute inset-0 w-full h-full bg-amber-500/10 group-hover:bg-amber-500/20 transition-all" />
                
                <div className="flex items-center gap-3 relative z-10">
                  <Wand2 className="w-5 h-5 text-amber-400 group-hover:rotate-12 transition-transform" />
                  <span className="font-serif text-xl text-amber-100 tracking-widest uppercase" style={{ fontFamily: 'var(--font-cinzel)' }}>
                    Cast a Secret
                  </span>
                </div>
              </motion.button>
            </Link>

            {/* Secondary Button: Demo/How it works */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 text-slate-400 hover:text-amber-200 transition-colors px-6 py-4"
            >
              <Key className="w-4 h-4" />
              <span className="uppercase tracking-widest text-sm font-semibold">How it works</span>
            </motion.button>
          </motion.div>

        </motion.div>
      </div>
      
      {/* Decorative Bottom Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a12] to-transparent z-10 pointer-events-none" />
    </main>
  );
}

// --- SUBCOMPONENT: Magic Dust / Stars ---
function MagicDust() {
  // We'll generate randomized particle and sparkle data on mount (in an effect)
  // to avoid calling impure functions during render.
  const [particles, setParticles] = React.useState<Array<{opacity:number; scale:number; x:number; y:number; floatY:number; duration:number; width:number; height:number}>>([]);
  const [sparkles, setSparkles] = React.useState<Array<{x:string; y:string; delay:number; size:number}>>([]);

  React.useEffect(() => {
    const p = Array.from({ length: 20 }).map(() => ({
      opacity: Math.random() * 0.5 + 0.2,
      scale: Math.random() * 0.5 + 0.5,
      x: typeof window !== 'undefined' ? Math.random() * window.innerWidth : 0,
      y: typeof window !== 'undefined' ? Math.random() * window.innerHeight : 0,
      floatY: Math.random() * -100,
      duration: Math.random() * 10 + 10,
      width: Math.random() * 3 + 1,
      height: Math.random() * 3 + 1,
    }));

    const s = [1, 2, 3].map((_, i) => ({
      x: `${Math.random() * 100}%`,
      y: `${Math.random() * 100}%`,
      delay: i * 2,
      size: Math.random() * 20 + 10,
    }));

    setParticles(p);
    setSparkles(s);
  }, []);

  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
      {particles.map((p, i) => (
        <motion.div
          key={i}
          className="absolute bg-amber-200 rounded-full"
          initial={{
            opacity: p.opacity,
            scale: p.scale,
            x: p.x,
            y: p.y,
          }}
          animate={{
            y: [null, p.floatY], // Float up
            opacity: [null, 0], // Fade out
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: [0, 0, 1, 1] as Easing,
          }}
          style={{
            width: p.width + 'px',
            height: p.height + 'px',
            boxShadow: '0 0 10px rgba(251, 191, 36, 0.8)'
          }}
        />
      ))}

      {sparkles.map((s, i) => (
        <motion.div
          key={`sparkle-${i}`}
          className="absolute text-amber-500 opacity-30"
          initial={{
            x: s.x,
            y: s.y,
          }}
          animate={{
            opacity: [0.2, 0.8, 0.2],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            delay: s.delay,
          }}
        >
          <Sparkles size={s.size} />
        </motion.div>
      ))}
    </div>
  );
}