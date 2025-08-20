import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please check your .env.local file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log('Starting database seeding...');
  
  try {
    // 1. Insert categories
    console.log('Inserting categories...');
    const categories = [
      { name: 'Pizza' },
      { name: 'Kebab' },
      { name: 'Drinks' },
      { name: 'Desserts' },
    ];
    const { data: catData, error: catError } = await supabase.from('categories').insert(categories).select();
    if (catError) throw catError;
    console.log('✅ Categories inserted successfully');

    // 2. Insert menu_items
    console.log('Inserting menu items...');
    const menuItems = [
      {
        name: 'Margherita Pizza',
        description: 'Classic pizza with tomato sauce, mozzarella, and basil.',
        price: 9.99,
        image: 'https://example.com/margherita.jpg',
        category_id: catData[0].id,
        rating: 4.5,
        popular: true,
      },
      {
        name: 'Chicken Kebab',
        description: 'Grilled chicken kebab with fresh vegetables.',
        price: 7.99,
        image: 'https://example.com/chicken-kebab.jpg',
        category_id: catData[1].id,
        rating: 4.7,
        popular: true,
      },
      {
        name: 'Cola',
        description: 'Refreshing soft drink.',
        price: 1.99,
        image: 'https://example.com/cola.jpg',
        category_id: catData[2].id,
        rating: 4.0,
        popular: false,
      },
      {
        name: 'Baklava',
        description: 'Sweet dessert pastry.',
        price: 3.49,
        image: 'https://example.com/baklava.jpg',
        category_id: catData[3].id,
        rating: 4.8,
        popular: false,
      },
    ];
    const { data: menuData, error: menuError } = await supabase.from('menu_items').insert(menuItems).select();
    if (menuError) throw menuError;
    console.log('✅ Menu items inserted successfully');

    // 3. Insert orders
    console.log('Inserting orders...');
    const orders = [
      {
        user_id: 1,
        total_price: 19.97,
        status: 'pending',
        created_at: new Date().toISOString(),
      },
      {
        user_id: 2,
        total_price: 11.48,
        status: 'completed',
        created_at: new Date(Date.now() - 86400000).toISOString(),
      },
    ];
    const { data: orderData, error: orderError } = await supabase.from('orders').insert(orders).select();
    if (orderError) throw orderError;
    console.log('✅ Orders inserted successfully');

    // 4. Insert order_items
    console.log('Inserting order items...');
    const orderItems = [
      {
        order_id: orderData[0].id,
        item_id: menuData[0].id,
        quantity: 2,
        price: 19.98,
      },
      {
        order_id: orderData[0].id,
        item_id: menuData[2].id,
        quantity: 1,
        price: 1.99,
      },
      {
        order_id: orderData[1].id,
        item_id: menuData[1].id,
        quantity: 1,
        price: 7.99,
      },
      {
        order_id: orderData[1].id,
        item_id: menuData[3].id,
        quantity: 1,
        price: 3.49,
      },
    ];
    const { data: orderItemsData, error: orderItemsError } = await supabase.from('order_items').insert(orderItems);
    if (orderItemsError) throw orderItemsError;
    console.log('✅ Order items inserted successfully');

    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run the seed function
seed(); 