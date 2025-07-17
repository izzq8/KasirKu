#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDashboardMetrics() {
  console.log('📊 Testing Dashboard Metrics from Database...\n')
  
  try {
    // Test: Get all transactions (for dashboard metrics)
    console.log('1️⃣ Fetching ALL transactions for metrics...')
    const { data: allTransactions, error: allTxError } = await supabase
      .from('transactions')
      .select(`
        *,
        transaction_items (
          id,
          product_name,
          quantity,
          price,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })
    
    if (allTxError) {
      console.log(`❌ All transactions error: ${allTxError.message}`)
    } else {
      console.log(`✅ All transactions: ${allTransactions?.length || 0} records`)
      
      // Calculate today's metrics
      const today = new Date().toDateString()
      const todayTransactions = (allTransactions || []).filter((t) => 
        new Date(t.created_at).toDateString() === today
      )
      
      const todayRevenue = todayTransactions.reduce((sum, t) => sum + (t.total_amount || 0), 0)
      const todayItemsSold = todayTransactions.reduce((sum, t) => {
        return sum + (t.transaction_items || []).reduce((itemSum: number, item: any) => 
          itemSum + (item.quantity || 0), 0
        )
      }, 0)
      
      console.log(`   📈 Today's Revenue: Rp ${todayRevenue.toLocaleString('id-ID')}`)
      console.log(`   📦 Today's Items Sold: ${todayItemsSold}`)
      console.log(`   🧾 Today's Transactions: ${todayTransactions.length}`)
    }

    // Test: Get user-specific transactions
    console.log('\n2️⃣ Fetching user-specific transactions...')
    const { data: users } = await supabase
      .from('users')
      .select('id, email')
      .limit(1)
    
    if (users && users.length > 0) {
      const testUserId = users[0].id
      console.log(`   Using test user: ${users[0].email}`)
      
      const { data: userTransactions, error: userTxError } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', testUserId)
        .order('created_at', { ascending: false })
        .limit(10)
      
      if (userTxError) {
        console.log(`❌ User transactions error: ${userTxError.message}`)
      } else {
        console.log(`✅ User transactions: ${userTransactions?.length || 0} records`)
      }
    }

    // Test: Get products
    console.log('\n3️⃣ Fetching products...')
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, name, stock, price')
      .limit(10)
    
    if (prodError) {
      console.log(`❌ Products error: ${prodError.message}`)
    } else {
      console.log(`✅ Products: ${products?.length || 0} records`)
      
      if (products && products.length > 0) {
        console.log('   Sample products:')
        products.slice(0, 3).forEach(p => {
          console.log(`   - ${p.name}: Rp ${p.price?.toLocaleString('id-ID')} (Stock: ${p.stock})`)
        })
      }
    }

    console.log('\n✅ Dashboard metrics test completed!')
    
  } catch (error) {
    console.log(`💥 Test failed with error: ${error}`)
  }
}

testDashboardMetrics()
