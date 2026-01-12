'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Key, Send, Sparkles, HelpCircle, List, Type, X, ChevronLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { createSecretAction } from '../actions'; 

type QuestionItem = {
  id: string;
  question: string;
  answer: string;
  hint: string;
  type: 'text' | 'select';
  options: string[];
};

export default function CreateSecretPage() {
  const [secret, setSecret] = useState('');
  const [questions, setQuestions] = useState<QuestionItem[]>([
    { id: '1', question: '', answer: '', hint: '', type: 'text', options: [] }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdId, setCreatedId] = useState<string | null>(null);

  // --- Helpers ---
  const updateQuestion = <K extends keyof QuestionItem>(id: string, field: K, value: QuestionItem[K]) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const addOption = (qId: string) => {
    const q = questions.find(q => q.id === qId);
    if (q) updateQuestion(qId, 'options', [...q.options, '']);
  };

  const updateOption = (qId: string, idx: number, val: string) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    const newOpts = [...q.options];
    newOpts[idx] = val;
    updateQuestion(qId, 'options', newOpts);
  };

  const removeOption = (qId: string, idx: number) => {
    const q = questions.find(q => q.id === qId);
    if (!q) return;
    updateQuestion(qId, 'options', q.options.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const isValid = questions.every(q => {
        if(q.type === 'select') return q.options.includes(q.answer);
        return true;
    });

    if(!isValid) {
        alert("For dropdowns, the Answer must match one of the options exactly!");
        setIsSubmitting(false);
        return;
    }

    const result = await createSecretAction(secret, questions);
    if (result.success && result.id) {
      setCreatedId(result.id);
    } else {
      alert("Something went wrong. Try again.");
    }
    setIsSubmitting(false);
  };

  // --- SUCCESS VIEW (Neon Card) ---
  if (createdId) {
     const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/verify/${createdId}`;
     return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Blobs */}
            <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-green-500 rounded-full blur-[120px] opacity-20" />
            
            <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md w-full text-center relative z-10 shadow-2xl"
            >
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
                    <Sparkles size={32} />
                </div>
                
                <h2 className="text-3xl font-black text-white mb-2 tracking-tight">It is Ready!</h2>
                <p className="text-zinc-400 mb-8 font-medium">Your secret is locked and loaded.</p>
                
                <div className="bg-black border border-zinc-800 rounded-xl p-4 mb-6 flex items-center gap-3">
                    <div className="flex-1 overflow-hidden">
                        <p className="text-zinc-500 text-xs uppercase font-bold tracking-wider mb-1">Share Link</p>
                        <code className="text-green-400 text-sm truncate block">{shareLink}</code>
                    </div>
                </div>

                <button 
                    onClick={() => { navigator.clipboard.writeText(shareLink); alert("Copied to clipboard!"); }} 
                    className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-bold rounded-xl transition-all active:scale-95"
                >
                    Copy Link
                </button>
                
                <Link href="/" className="block mt-6 text-zinc-500 hover:text-white text-sm font-bold">
                    Create Another
                </Link>
            </motion.div>
        </div>
     )
  }

  // --- FORM VIEW ---
  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-pink-500 selection:text-white pb-20">
      
      {/* Background Ambience */}
      <div className="fixed top-[-20%] left-[-10%] w-[600px] h-[600px] bg-pink-600 rounded-full blur-[150px] opacity-20 pointer-events-none" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-700 rounded-full blur-[150px] opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 px-6 py-8 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="w-10 h-10 bg-zinc-900 rounded-full flex items-center justify-center hover:bg-zinc-800 transition-colors">
            <ChevronLeft size={20} className="text-white" />
        </Link>
        <div className="flex items-center gap-2">
            <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-orange-500">
                whisper
            </span>
        </div>
        <div className="w-10" /> {/* Spacer */}
      </div>
      
      <div className="relative z-10 max-w-2xl mx-auto px-4">
        
        {/* Title */}
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter mb-2">
                Create Secret
            </h1>
            <p className="text-zinc-400 font-medium">Write a message. Set the trap.</p>
        </motion.div>

        {/* 1. THE SECRET */}
        <div className="bg-zinc-900/80 backdrop-blur-md border border-white/5 rounded-3xl p-6 mb-8 shadow-xl">
            <label className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-pink-500 mb-4">
                <Zap size={14} /> The Secret Message
            </label>
            <textarea
              value={secret}
              onChange={(e) => setSecret(e.target.value)}
              placeholder="Type your secret here..."
              className="w-full h-32 bg-black border border-zinc-800 rounded-2xl p-5 text-xl font-medium text-white placeholder:text-zinc-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none resize-none transition-all"
            />
        </div>

        {/* 2. THE QUESTIONS */}
        <div className="space-y-6">
          {questions.map((q, index) => (
            <motion.div 
                key={q.id} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-zinc-900/80 backdrop-blur-md border border-white/5 p-6 rounded-3xl relative overflow-hidden"
            >
                {/* Card Header */}
                <div className="flex justify-between items-center mb-6">
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-zinc-800 text-sm font-bold text-zinc-300">
                        {index + 1}
                    </span>
                    {questions.length > 1 && (
                        <button onClick={() => setQuestions(questions.filter(qi => qi.id !== q.id))} className="text-zinc-500 hover:text-red-500 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    )}
                </div>

                {/* Question Input */}
                <div className="mb-6">
                    <input
                        value={q.question}
                        onChange={(e) => updateQuestion(q.id, 'question', e.target.value)}
                        placeholder="e.g. Where did we first meet?"
                        className="w-full bg-transparent border-b-2 border-zinc-800 py-2 text-lg font-bold text-white placeholder:text-zinc-600 focus:border-purple-500 outline-none transition-colors"
                    />
                </div>

                {/* Type Toggle */}
                <div className="flex bg-black p-1 rounded-xl mb-6 w-fit">
                    <button 
                        onClick={() => updateQuestion(q.id, 'type', 'text')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${q.type === 'text' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <Type size={14} /> Text
                    </button>
                    <button 
                        onClick={() => updateQuestion(q.id, 'type', 'select')}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${q.type === 'select' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-300'}`}
                    >
                        <List size={14} /> Options
                    </button>
                </div>

                {/* Dynamic Inputs */}
                <div className="bg-black/50 rounded-2xl p-4 border border-zinc-800/50">
                    {q.type === 'text' ? (
                        <div className="flex items-center gap-3">
                            <Key size={18} className="text-zinc-500" />
                            <input
                                value={q.answer}
                                onChange={(e) => updateQuestion(q.id, 'answer', e.target.value)}
                                placeholder="The correct answer..."
                                className="flex-1 bg-transparent py-2 font-medium text-green-400 placeholder:text-zinc-700 outline-none"
                            />
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {q.options.map((opt, i) => (
                                <div key={i} className="flex gap-2">
                                    <input 
                                        value={opt}
                                        onChange={(e) => updateOption(q.id, i, e.target.value)}
                                        className={`flex-1 bg-zinc-900 border rounded-xl px-4 py-3 text-sm font-medium outline-none transition-all ${q.answer === opt && opt !== '' ? 'border-green-500/50 text-green-400' : 'border-zinc-800 text-white focus:border-zinc-600'}`}
                                        placeholder={`Option ${i+1}`}
                                    />
                                    <button 
                                        onClick={() => updateQuestion(q.id, 'answer', opt)}
                                        className={`px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors ${q.answer === opt && opt !== '' ? 'bg-green-500 text-black' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700'}`}
                                    >
                                        {q.answer === opt && opt !== '' ? 'Correct' : 'Set'}
                                    </button>
                                    <button onClick={() => removeOption(q.id, i)} className="w-10 flex items-center justify-center bg-zinc-900 rounded-xl text-zinc-600 hover:text-red-500 border border-zinc-800">
                                        <X size={16}/>
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => addOption(q.id)} className="text-xs font-bold text-purple-500 hover:text-purple-400 flex items-center gap-1 py-2">
                                <Plus size={14} /> ADD OPTION
                            </button>
                        </div>
                    )}
                </div>

                {/* Hint */}
                <div className="flex items-center gap-3 mt-4 pt-4 border-t border-zinc-800/50">
                    <HelpCircle size={16} className="text-zinc-600" />
                    <input
                        value={q.hint}
                        onChange={(e) => updateQuestion(q.id, 'hint', e.target.value)}
                        placeholder="Add a hint (optional)..."
                        className="flex-1 bg-transparent text-sm font-medium text-zinc-400 placeholder:text-zinc-700 outline-none"
                    />
                </div>
            </motion.div>
          ))}
        </div>

        {/* Actions */}
        <div className="mt-8 space-y-4">
            <button 
                onClick={() => setQuestions([...questions, { id: Date.now().toString(), question: '', answer: '', hint: '', type: 'text', options: [] }])} 
                className="w-full py-4 border-2 border-dashed border-zinc-800 rounded-2xl text-zinc-500 font-bold hover:border-zinc-600 hover:text-zinc-300 transition-all flex items-center justify-center gap-2"
            >
                <Plus size={20} /> Add Another Question
            </button>

            <button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !secret}
                className="w-full py-5 bg-gradient-to-r from-pink-600 to-orange-600 hover:from-pink-500 hover:to-orange-500 text-white text-xl font-black rounded-full shadow-[0_0_40px_rgba(236,72,153,0.3)] hover:shadow-[0_0_60px_rgba(236,72,153,0.5)] transition-all disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            >
                {isSubmitting ? (
                    <span className="animate-pulse">Creating...</span>
                ) : (
                    <>
                        <span>Create Link</span>
                        <Send size={20} className="fill-white" />
                    </>
                )}
            </button>
        </div>
        
        {/* Footer Padding */}
        {/* Footer Signature */}
        <div className="mt-12 text-center pb-8">
            <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-700 font-bold hover:text-pink-500 transition-colors cursor-default">
                Under developed by Nahian
            </p>
        </div>
      </div>
    </div>
  );
}