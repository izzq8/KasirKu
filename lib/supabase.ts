import { createClient, type SupabaseClient } from "@supabase/supabase-js"

/* -------------------------------------------------------------------------- */
/*                               Configuration                                 */
/* -------------------------------------------------------------------------- */

// For Next.js compatibility, we'll use the provided values directly
// In production, these should come from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validate configuration
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("Supabase configuration missing. Please check your environment variables.")
}

/* -------------------------------------------------------------------------- */
/*                               Client set-up                                */
/* -------------------------------------------------------------------------- */

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})

/**
 * Safe helper to check if Supabase is available
 */
export const isSupabaseAvailable = (): boolean => {
  return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * Safe helper to get Supabase client with error handling
 */
export const getSupabaseClient = (): SupabaseClient => {
  return supabase
}

/* -------------------------------------------------------------------------- */
/*                              Helper – Site URL                             */
/* -------------------------------------------------------------------------- */

export const getSiteUrl = () => {
  if (typeof window !== "undefined") {
    return window.location.origin
  }

  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return process.env.NODE_ENV === "production" ? "https://your-domain.com" : "http://localhost:3000"
}

/* -------------------------------------------------------------------------- */
/*                                Type aliases                                */
/* -------------------------------------------------------------------------- */

export type Product = {
  id: string
  name: string
  description?: string
  weight?: string // Berat/ukuran produk (contoh: "250g", "1kg", "500ml", "L", "XL")
  price: number
  stock: number
  category?: string
  barcode?: string
  image_url?: string
  is_active?: boolean
  user_id: string
  created_at: string
  updated_at: string
}

export type Transaction = {
  id: string
  transaction_number: string
  total_amount: number
  payment_method: string
  payment_amount?: number
  change_amount: number
  status: string
  notes?: string
  cashier_id?: string
  created_at: string
}

export type TransactionItem = {
  id: string
  transaction_id: string
  product_id: string
  product_name: string
  quantity: number
  unit_price: number
  total_price: number
  created_at: string
}

export type User = {
  id: string
  email: string
  full_name?: string
  username?: string
  role?: string
  created_at: string
}

/* -------------------------------------------------------------------------- */
/*                              Utility functions                             */
/* -------------------------------------------------------------------------- */

const generateUsername = (email: string) => {
  const base = email
    .split("@")[0]
    .replace(/[^a-zA-Z0-9]/g, "")
    .toLowerCase()
  return `${base}${Date.now().toString().slice(-4)}`
}

export const ensureUserExists = async (authUser: any) => {
  try {
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("*")
      .eq("id", authUser.id)
      .single()

    if (checkError && checkError.code !== "PGRST116") throw checkError
    if (existingUser) return existingUser

    const newUser = {
      id: authUser.id,
      email: authUser.email,
      full_name: authUser.user_metadata?.full_name ?? null,
      username: generateUsername(authUser.email),
      role: "user",
    }

    const { data, error } = await supabase.from("users").insert([newUser]).select().single()

    if (error) throw error
    return data
  } catch (error) {
    console.error("Error ensuring user exists:", error)
    return null
  }
}

/* --------------------------------- Auth ---------------------------------- */

export const signUp = async (email: string, password: string, fullName?: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  })

  return { user: data.user, error }
}

export const signIn = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  return { user: data.user, error }
}

export const signOut = async () => {
  const { error } = await supabase.auth.signOut()
  return { error }
}

export const getCurrentUser = async () => {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()
  return { user, error }
}

export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession()
    return { session: data.session, error }
  } catch (error) {
    return { session: null, error: { message: "Failed to get session" } }
  }
}
