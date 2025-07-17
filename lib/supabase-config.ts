// Supabase configuration validation
export const validateSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url || !anonKey) {
    throw new Error("Missing Supabase configuration. Please check your environment variables.")
  }

  // Validate URL format
  try {
    new URL(url)
  } catch {
    throw new Error("Invalid Supabase URL format")
  }

  // Validate anon key format (should be a JWT)
  if (!anonKey.startsWith("eyJ")) {
    throw new Error("Invalid Supabase anon key format")
  }

  return { url, anonKey }
}

// Database connection test
export const testDatabaseConnection = async () => {
  try {
    const { supabase } = await import("./supabase")

    // Test basic connection
    const { data, error } = await supabase.from("products").select("count").limit(1)

    if (error) {
      throw error
    }

    return { success: true, message: "Database connection successful" }
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Database connection failed",
    }
  }
}
