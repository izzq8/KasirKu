import { supabase } from "../lib/supabase"

// Database setup script
export const setupDatabase = async () => {
  console.log("🚀 Setting up database...")

  try {
    // Test connection first
    const { data: testData, error: testError } = await supabase.from("products").select("count").limit(1)

    if (testError) {
      console.error("❌ Database connection failed:", testError.message)
      return false
    }

    console.log("✅ Database connection successful")

    // Check if tables exist by trying to query them
    const tables = ["users", "products", "transactions", "transaction_items"]

    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select("count").limit(1)

        if (error) {
          console.log(`⚠️ Table '${table}' might not exist or has issues:`, error.message)
        } else {
          console.log(`✅ Table '${table}' is accessible`)
        }
      } catch (err) {
        console.log(`❌ Error checking table '${table}':`, err)
      }
    }

    return true
  } catch (error) {
    console.error("💥 Database setup failed:", error)
    return false
  }
}

// Run setup if this file is executed directly
if (require.main === module) {
  setupDatabase()
    .then((success) => {
      if (success) {
        console.log("🎉 Database setup completed successfully!")
      } else {
        console.log("❌ Database setup failed!")
        process.exit(1)
      }
    })
    .catch((error) => {
      console.error("💥 Setup script error:", error)
      process.exit(1)
    })
}
