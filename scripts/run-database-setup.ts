import { supabase } from "@/lib/supabase"

export async function runDatabaseSetup() {
  const results = []

  try {
    // Read and execute SQL files
    const sqlFiles = ["/scripts/01-create-tables.sql", "/scripts/02-setup-rls.sql", "/scripts/03-seed-sample-data.sql"]

    for (const file of sqlFiles) {
      try {
        const response = await fetch(file)
        const sql = await response.text()

        // Split SQL into individual statements
        const statements = sql
          .split(";")
          .map((s) => s.trim())
          .filter((s) => s.length > 0 && !s.startsWith("--"))

        for (const statement of statements) {
          if (statement.trim()) {
            const { error } = await supabase.rpc("exec_sql", { sql_query: statement })
            if (error) {
              console.error(`Error executing statement from ${file}:`, error)
              results.push({ file, success: false, error: error.message })
            }
          }
        }

        results.push({ file, success: true })
      } catch (error: any) {
        console.error(`Error processing ${file}:`, error)
        results.push({ file, success: false, error: error.message })
      }
    }

    return { success: true, results }
  } catch (error: any) {
    console.error("Database setup error:", error)
    return { success: false, error: error.message, results }
  }
}
