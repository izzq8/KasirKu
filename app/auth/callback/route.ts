import { type NextRequest, NextResponse } from "next/server"
import { getSupabaseClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  if (code) {
    const supabase = getSupabaseClient()
    if (supabase) {
      try {
        await supabase.auth.exchangeCodeForSession(code)
      } catch (error) {
        console.error("Error exchanging code for session:", error)
      }
    }
  }

  // URL to redirect to after sign in process completes
  return NextResponse.redirect(requestUrl.origin)
}
