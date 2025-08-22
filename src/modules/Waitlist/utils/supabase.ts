import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface WaitlistEntry {
  id?: string
  email: string
  name?: string
  created_at?: string
}

export const addToWaitlist = async (email: string, name?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('waitlist')
      .insert([
        {
          email: email.toLowerCase().trim(),
          name: name?.trim() || null,
          created_at: new Date().toISOString()
        }
      ])
      .select()

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return { success: false, error: 'Email already registered' }
      }
      return { success: false, error: error.message }
    }
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to join waitlist' }
  }
}