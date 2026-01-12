'use client';

import { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { createClient } from '../../../utils/supabase/client';
import { checkAnswerAction } from '../../../app/actions';
import { Lock, Unlock, ChevronRight, Volume2, VolumeX, Flame, Lightbulb, Ghost, EyeOff } from 'lucide-react';
import Link from 'next/link';

// NO EXTERNAL LIBRARIES NEEDED

function getSupabase() { return createClient(); }

export default function VerifyPage({ params }: { params: Promise<{ id: string }> }) {
  // ✅ FIX 1: Unwrap params properly for Next.js 15
  const { id } = use(params);

  // Data State
  const [step, setStep] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  
  // Question State
  const [question, setQuestion] = useState<string>('');
  const [hint, setHint] = useState<string | null>(null);
  const [type, setType] = useState<'text' | 'select'>('text');
  const [options, setOptions] = useState<string[]>([]);
  
  // UI State
  const [answer, setAnswer] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [shake, setShake] = useState(false);
  const [finalSecret, setFinalSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [isBurning, setIsBurning] = useState(false);
  const [isGone, setIsGone] = useState(false);
  
  // 🎵 AUDIO STATE (Start Muted to allow Autoplay)
  const [isMuted, setIsMuted] = useState(true);
  
  // 🛡️ SECURITY STATE
  const [isBlurring, setIsBlurring] = useState(false);

  // 1. Load Data
  useEffect(() => {
    const loadData = async () => {
      const supabase = getSupabase();
      
      const countPromise = supabase.from('challenges').select('*', { count: 'exact', head: true }).eq('secret_id', id);
      const [countRes] = await Promise.all([countPromise]);
      
      if (countRes.count === 0 || countRes.count === null) {
        setIsGone(true);
        setLoading(false);
        return; 
      }

      setTotalQuestions(countRes.count);

      const { data } = await supabase
        .from('challenges')
        .select('question, hint, type, options')
        .eq('secret_id', id)
        .eq('order_index', 0)
        .single();

      if (data) {
        setQuestion(data.question);
        setHint(data.hint);
        setType(data.type as 'text' | 'select');
        setOptions(data.options as string[] || []);
      }
      setLoading(false);
    };
    if (id) loadData();
  }, [id]);

  // 🛡️ 2. THE "ANTI-SCREENSHOT" TRAP
  useEffect(() => {
    if (finalSecret) {
        const triggerProtection = () => {
            setIsBlurring(true);
            setTimeout(() => setIsBlurring(false), 2000); 
        };

        const handleFocus = () => setIsBlurring(false);
        
        window.addEventListener('blur', triggerProtection);
        window.addEventListener('focus', handleFocus);

        const handleVisibility = () => { if (document.hidden) triggerProtection(); };
        document.addEventListener('visibilitychange', handleVisibility);

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && ['c', 'C', 's', 'S'].includes(e.key)) {
                e.preventDefault();
                alert("Copying is disabled.");
            }
            if (e.key === 'PrintScreen') {
                triggerProtection();
            }
        };

        document.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('blur', triggerProtection);
            window.removeEventListener('focus', handleFocus);
            document.removeEventListener('visibilitychange', handleVisibility);
            document.removeEventListener('keydown', handleKeyDown);
        }
    }
  }, [finalSecret]);


  const handleVerify = async () => {
    if (!answer.trim()) return;

    setIsUnlocking(true);
    const res = await checkAnswerAction(id, step, answer);
    setIsUnlocking(false);
    
    if (!res.success) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    } else {
      setAnswer('');
      setShowHint(false);
      
      if (res.isComplete) {
        setFinalSecret(res.message || "");
        // Optional: Auto-unmute when revealed? (Browsers might block this, safer to keep muted first)
        // setIsMuted(false); 
      } else if (res.nextQuestion) {
        setStep(step + 1);
        setQuestion(res.nextQuestion.question);
        setHint(res.nextQuestion.hint);
        setType(res.nextQuestion.type as 'text' | 'select');
        setOptions(res.nextQuestion.options as string[] || []);
      }
    }
  };

  const progressPercentage = totalQuestions > 0 ? ((step + 1) / totalQuestions) * 100 : 0;

  if (loading) return (
    <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-zinc-800 border-t-pink-500 rounded-full animate-spin"></div>
    </div>
  );

  if (isGone) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black p-4 text-center relative overflow-hidden">
          <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-red-600 rounded-full blur-[150px] opacity-20" />
          <Ghost size={64} className="text-zinc-700 mb-6" />
          <h1 className="text-4xl font-black text-white mb-2 tracking-tighter uppercase">Signal Lost</h1>
          <p className="text-zinc-500 font-medium mb-8">This secret has been purged from the system.</p>
          <Link href="/" className="px-8 py-3 bg-zinc-900 border border-zinc-800 rounded-full text-white font-bold hover:bg-zinc-800 transition-all">
            Create Your Own
          </Link>
           <div className="absolute bottom-6 w-full text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-800 font-bold cursor-default">Under developed by Nahian</p>
        </div>
      </div>
    );
  }

  return (
    <div 
        onContextMenu={(e) => e.preventDefault()}
        onCopy={(e) => { e.preventDefault(); alert("Copying disabled"); }}
        className="min-h-screen flex items-center justify-center bg-black p-4 relative overflow-hidden font-sans selection:bg-none select-none touch-none"
    >
      
      {/* 🎵 NATIVE IFRAME PLAYER */}
      {finalSecret && (
        <div className="hidden">
           {/* ✅ FIX 2: Dynamic URL based on isMuted state 
              - We append &mute=1 or &mute=0
              - We append &autoplay=1
              - We use 'key' to force reload when mute state changes
           */}
           <iframe
                key={isMuted ? "muted" : "unmuted"}
                src={`https://www.youtube.com/embed/5qap5aO4i9A?autoplay=1&mute=${isMuted ? 1 : 0}&loop=1&playlist=5qap5aO4i9A&controls=0&start=0`}
                width="0"
                height="0"
                allow="autoplay; encrypted-media"
           />
        </div>
      )}

      <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-900 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-900 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      {/* 🛡️ BLUR SHIELD */}
      <AnimatePresence>
        {isBlurring && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black/95 backdrop-blur-3xl flex flex-col items-center justify-center text-center p-8"
            >
                <EyeOff size={48} className="text-red-500 mb-4 animate-pulse" />
                <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-2">Security Breach</h2>
                <p className="text-zinc-500">Screenshot attempt detected.</p>
            </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        
        {finalSecret ? (
            <AnimatePresence>
            {!isBurning && (
              <motion.div 
                key="vault"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ opacity: 0, scale: 1.1, filter: "brightness(2) blur(20px)", transition: { duration: 1 } }}
                className="relative max-w-lg w-full bg-zinc-900/90 backdrop-blur-xl border border-white/10 p-8 md:p-12 rounded-3xl shadow-2xl"
              >
                 <div className="absolute inset-0 rounded-3xl border border-pink-500/20 pointer-events-none" />

                 <div className="relative z-10">
                    <div className="flex justify-between items-start mb-8 pb-4 border-b border-white/5">
                        <div className="flex items-center gap-2">
                            <Unlock size={16} className="text-green-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-green-400">Decrypted</span>
                        </div>
                        {/* 🎵 MUTE BUTTON */}
                        <button 
                            onClick={() => setIsMuted(!isMuted)} 
                            className="text-zinc-500 hover:text-white transition-colors"
                        >
                            {isMuted ? <VolumeX size={18}/> : <Volume2 size={18}/>}
                        </button>
                    </div>

                    <div className="text-center py-6 px-4 select-none">
                        <p className="text-lg md:text-xl font-bold leading-relaxed text-transparent bg-clip-text bg-gradient-to-br from-white to-zinc-300 whitespace-pre-wrap select-none">
                            &quot;{finalSecret}&quot;
                        </p>
                    </div>

                    <div className="mt-12">
                        <button 
                            onClick={() => setIsBurning(true)}
                            className="w-full py-4 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-500 font-bold rounded-xl transition-all flex items-center justify-center gap-2 group"
                        >
                            <Flame size={18} className="group-hover:animate-bounce"/> 
                            PURGE DATA
                        </button>
                        <p className="text-center text-zinc-600 text-[10px] uppercase font-bold tracking-widest mt-4">
                            Warning: Action is irreversible
                        </p>
                    </div>
                 </div>
              </motion.div>
            )}
            </AnimatePresence>
        ) : (
          <motion.div 
            key="question"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0, x: shake ? [0, -10, 10, -10, 0] : 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full max-w-md relative"
          >
            <div className="text-center mb-8">
                <span className="font-bold text-2xl tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">whisper</span>
            </div>

            <div className="bg-zinc-900/80 backdrop-blur-md border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                <div className="h-1.5 bg-black w-full">
                    <motion.div 
                        className="h-full bg-gradient-to-r from-pink-500 to-orange-500 box-shadow-[0_0_10px_rgba(236,72,153,0.5)]"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPercentage}%` }}
                    />
                </div>

                <div className="p-8">
                    <div className="flex justify-between items-center mb-6">
                        <span className="text-xs font-bold uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <Lock size={12} /> Security Check
                        </span>
                        <span className="bg-black border border-zinc-800 px-3 py-1 rounded-full text-xs font-mono text-zinc-400">
                            {step + 1} / {totalQuestions}
                        </span>
                    </div>

                    <h2 className="text-2xl text-white font-black leading-tight mb-8">
                        {question}
                    </h2>

                    <div className="space-y-6">
                        {type === 'text' ? (
                            <input 
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                                className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-lg font-bold text-white placeholder:text-zinc-700 focus:border-pink-500 outline-none transition-all"
                                placeholder="Enter password..."
                                autoFocus
                                onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                            />
                        ) : (
                            <div className="relative">
                                <select 
                                    value={answer}
                                    onChange={(e) => setAnswer(e.target.value)}
                                    className="w-full bg-black border border-zinc-800 rounded-xl px-5 py-4 text-white font-bold outline-none focus:border-pink-500 appearance-none cursor-pointer"
                                >
                                    <option value="" disabled>Select an option...</option>
                                    {options.map((opt, i) => (
                                        <option key={i} value={opt}>{opt}</option>
                                    ))}
                                </select>
                                <div className="absolute right-5 top-5 pointer-events-none text-zinc-500">▼</div>
                            </div>
                        )}

                        {hint && (
                            <div>
                                <button 
                                    onClick={() => setShowHint(!showHint)}
                                    className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-2 transition-colors mb-2"
                                >
                                    <Lightbulb size={14} className={showHint ? "text-yellow-400" : ""} /> 
                                    {showHint ? "Hide Hint" : "Show Hint"}
                                </button>
                                <AnimatePresence>
                                    {showHint && (
                                        <motion.div 
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="bg-zinc-800/50 rounded-lg p-3 border-l-2 border-yellow-500">
                                                <p className="text-sm text-zinc-300 italic">
                                                    &quot;{hint}&quot;
                                                </p>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}

                        <button 
                            onClick={handleVerify} 
                            disabled={isUnlocking}
                            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-black text-lg rounded-xl transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.2)] active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isUnlocking ? (
                                <span className="animate-pulse">Verifying...</span>
                            ) : (
                                <>
                                    <span>Unlock</span>
                                    <ChevronRight size={20} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

        <div className="absolute bottom-6 w-full text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-800 font-bold hover:text-pink-500 transition-colors cursor-default">
                Under developed by Nahian
            </p>
        </div>
    </div>
  );
}