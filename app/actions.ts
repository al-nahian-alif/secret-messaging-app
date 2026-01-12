'use server'

import { createClient } from '../utils/supabase/server'
import { createAdminClient } from '../utils/supabase/admin'

// --- 1. ACTION: Create Secret ---
export async function createSecretAction(
  message: string, 
  questions: { 
    question: string; 
    answer: string; 
    hint?: string;        // 👈 NEW
    type: 'text' | 'select'; // 👈 NEW
    options?: string[];   // 👈 NEW
  }[]
) {
  const supabase = createAdminClient() 

  if (!message || questions.length === 0) return { error: "Missing data" }

  // Insert Secret
  const { data: secret, error: secretErr } = await supabase
    .from('secrets')
    .insert({ message })
    .select('id')
    .single()
  
  if (secretErr) {
    console.log("🔥 SUPABASE ERROR:", secretErr)
    return { error: "Failed to save secret" }
  }

  // Insert Questions
  const formatted = questions.map((q, i) => ({
    secret_id: secret.id,
    question: q.question,
    answer: q.answer.toLowerCase().trim(),
    hint: q.hint || null,           // 👈 Save Hint
    type: q.type || 'text',         // 👈 Save Type
    options: q.options || null,     // 👈 Save Options
    order_index: i
  }))

  const { error: chalErr } = await supabase.from('challenges').insert(formatted)
  
  if (chalErr) {
    console.log("🔥 CHALLENGE ERROR:", chalErr)
    return { error: "Failed to save questions" }
  }

  return { success: true, id: secret.id }
}

// --- 2. ACTION: Verify Answer ---
export async function checkAnswerAction(secretId: string, stepIndex: number, attempt: string) {
  const supabase = await createClient()
  const adminAuth = createAdminClient() 

  // Get the current challenge to verify answer
  const { data: challenge } = await supabase
    .from('challenges')
    .select('answer')
    .eq('secret_id', secretId)
    .eq('order_index', stepIndex)
    .single()

  if (!challenge) return { error: "Challenge not found" }

  if (challenge.answer !== attempt.toLowerCase().trim()) {
    return { success: false, error: "Incorrect" }
  }

  // Check for Next Question (Fetch Hint/Type/Options too!)
  const { data: nextQ } = await supabase
    .from('challenges')
    .select('question, order_index, hint, type, options') // 👈 Fetch new fields
    .eq('secret_id', secretId)
    .eq('order_index', stepIndex + 1)
    .single()

  if (nextQ) {
    return { success: true, isComplete: false, nextQuestion: nextQ }
  } else {
    // Fetch final secret
    const { data: secret } = await adminAuth
      .from('secrets').select('message').eq('id', secretId).single()
      
    if (secret?.message) {
      await adminAuth.from('secrets').delete().eq('id', secretId);
      await adminAuth.from('challenges').delete().eq('secret_id', secretId);
      return { success: true, isComplete: true, message: secret.message }
    }
    
    return { error: "Message lost to the void" }
  }
}