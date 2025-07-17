import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runMigration() {
  try {
    console.log('🚀 Running weight column migration...')
    
    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(process.cwd(), 'scripts', '04-add-weight-column.sql'),
      'utf8'
    )
    
    // Execute the migration
    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL })
    
    if (error) {
      console.error('❌ Migration failed:', error)
      return
    }
    
    console.log('✅ Migration completed successfully!')
    console.log('📦 Weight column has been added to products table')
    console.log('📦 Product_weight column has been added to transaction_items table')
    
  } catch (error) {
    console.error('❌ Error running migration:', error)
  }
}

// Alternative: Run individual SQL commands
async function runMigrationManual() {
  try {
    console.log('🚀 Running weight column migration manually...')
    
    // Add weight column to products table
    console.log('Adding weight column to products table...')
    const { error: productsError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight TEXT;' 
      })
    
    if (productsError) {
      console.error('❌ Error adding weight column to products:', productsError)
    } else {
      console.log('✅ Weight column added to products table')
    }
    
    // Add product_weight column to transaction_items table
    console.log('Adding product_weight column to transaction_items table...')
    const { error: transactionItemsError } = await supabase
      .rpc('exec_sql', { 
        sql: 'ALTER TABLE public.transaction_items ADD COLUMN IF NOT EXISTS product_weight TEXT;' 
      })
    
    if (transactionItemsError) {
      console.error('❌ Error adding product_weight column to transaction_items:', transactionItemsError)
    } else {
      console.log('✅ Product_weight column added to transaction_items table')
    }
    
    // Add comments
    console.log('Adding column comments...')
    const { error: commentError } = await supabase
      .rpc('exec_sql', { 
        sql: `
          COMMENT ON COLUMN public.products.weight IS 'Berat/ukuran produk (contoh: "250g", "1kg", "500ml", "L", "XL")';
          COMMENT ON COLUMN public.transaction_items.product_weight IS 'Berat/ukuran produk saat transaksi';
        ` 
      })
    
    if (commentError) {
      console.error('❌ Error adding comments:', commentError)
    } else {
      console.log('✅ Column comments added')
    }
    
    console.log('✅ Manual migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Error running manual migration:', error)
  }
}

// Run the migration
if (require.main === module) {
  runMigrationManual()
}
