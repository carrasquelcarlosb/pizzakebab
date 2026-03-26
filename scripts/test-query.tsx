import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Define types for our database entities
type Category = {
  id: number;
  name: string;
};

type MenuItemWithCategory = {
  id: number;
  name: string;
  description: string;
  price: number;
  image: string;
  rating: number;
  popular: boolean;
  category_id: number;
  categories: Category[];
};

type MenuItemBasic = {
  id: number;
  name: string;
  price: number;
  rating?: number;
};

// Load environment variables from .env.local
const envPath = resolve(process.cwd(), '.env.local');
console.log('🔍 Looking for .env.local at:', envPath);

const result = dotenv.config({ path: envPath });
if (result.error) {
  console.error('❌ Error loading .env.local:', result.error);
  process.exit(1);
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log('📝 Environment variables loaded:');
console.log('URL exists:', !!supabaseUrl);
console.log('Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase credentials. Please check your .env.local file.');
  console.error('Current working directory:', process.cwd());
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Test Supabase connection
async function testConnection() {
  try {
    console.log('\n🔌 Testing Supabase connection...');
    const { data, error } = await supabase.from('menu_items').select('id').limit(1);
    
    if (error) throw error;
    
    console.log('✅ Successfully connected to Supabase!');
    return true;
  } catch (error) {
    console.error('❌ Failed to connect to Supabase:', error);
    return false;
  }
}

async function testQueries() {
  try {
    // First test the connection
    const isConnected = await testConnection();
    if (!isConnected) {
      console.error('❌ Cannot proceed with queries without a valid connection');
      process.exit(1);
    }

    console.log('\n🔍 Testing menu items queries...\n');

    // Get all menu items
    console.log('Fetching all menu items:');
    let { data: menu_items, error } = await supabase
      .from('menu_items')
      .select('*')
      .eq('id', 1);

    if (error) throw error;

    console.log('\n📋 Menu Items:');
    console.log(menu_items);

    console.log('\n✅ Query completed successfully!');
  } catch (error) {
    console.error('❌ Error testing queries:', error);
    process.exit(1);
  }
}

// Run the test queries
testQueries();

/*
To enable access to the menu_items table, you need to create an RLS policy in Supabase.
Run this SQL in the Supabase SQL editor:

-- Enable RLS
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create a policy that allows public read access to menu_items
CREATE POLICY "Allow public read access to menu_items"
ON menu_items
FOR SELECT
TO public
USING (true);

-- If you want to allow authenticated users to read menu_items
CREATE POLICY "Allow authenticated users to read menu_items"
ON menu_items
FOR SELECT
TO authenticated
USING (true);
*/ 