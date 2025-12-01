import { createClient } from '@supabase/supabase-js';
import { StockItem } from '../types';

/* 
  ===========================================
  SUPABASE SQL SETUP
  ===========================================
  Run the following SQL in your Supabase SQL Editor to create the table and permissions:

  create table if not exists stock_items (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    product_name text not null,
    volume text,
    percentage integer,
    barcode text,
    quantity integer default 1,
    cost numeric,
    image text
  );

  -- IMPORTANT: Enable Row Level Security
  alter table stock_items enable row level security;

  -- Create a policy to allow anonymous access (Select, Insert, Update, Delete)
  -- Since this is a public demo app, we allow all operations for anon users.
  create policy "Enable access for all users" 
  on stock_items 
  for all 
  using (true) 
  with check (true);
*/

const SUPABASE_URL = 'https://aymevloylspymvkywenu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF5bWV2bG95bHNweW12a3l3ZW51Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ1MzEyOTgsImV4cCI6MjA4MDEwNzI5OH0.0MU-LOBmgQOkKf-3GQ1k0V5haZtoA8tv4M0oybtSoCg';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const stockService = {
  // Fetch all stock items
  async getAllItems(): Promise<StockItem[]> {
    const { data, error } = await supabase
      .from('stock_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      // Throw error so the UI can catch it and show the setup instructions
      console.error('Error fetching stock:', error.message || error);
      throw error;
    }

    if (!data) {
        return [];
    }

    // Map DB columns to our Typescript interface
    return data.map(item => ({
      id: item.id,
      productName: item.product_name,
      volume: item.volume,
      percentage: item.percentage,
      timestamp: new Date(item.created_at).getTime(),
      barcode: item.barcode,
      image: item.image,
      quantity: item.quantity || 1,
      cost: Number(item.cost) || 0
    }));
  },

  // Add new item
  async addItem(item: Omit<StockItem, 'id' | 'timestamp'>): Promise<StockItem | null> {
    const { data, error } = await supabase
      .from('stock_items')
      .insert([{
        product_name: item.productName,
        volume: item.volume,
        percentage: item.percentage,
        barcode: item.barcode,
        image: item.image,
        quantity: item.quantity,
        cost: item.cost
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding stock item:', error.message || error);
      throw error;
    }

    return {
      id: data.id,
      productName: data.product_name,
      volume: data.volume,
      percentage: data.percentage,
      timestamp: new Date(data.created_at).getTime(),
      barcode: data.barcode,
      image: data.image,
      quantity: data.quantity,
      cost: Number(data.cost)
    };
  },

  // Update item
  async updateItem(id: string, updates: Partial<StockItem>): Promise<void> {
    // Map TS keys to DB column names if necessary
    const dbUpdates: any = {};
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.cost !== undefined) dbUpdates.cost = updates.cost;
    // Add other fields if editable

    const { error } = await supabase
      .from('stock_items')
      .update(dbUpdates)
      .eq('id', id);

    if (error) {
      console.error('Error updating item:', error.message || error);
      throw error;
    }
  },

  // Delete item
  async deleteItem(id: string): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting item:', error.message || error);
      throw error;
    }
  },

  // Clear all
  async clearAll(): Promise<void> {
    const { error } = await supabase
      .from('stock_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete where UUID is not nil (effectively all)
    
    if (error) {
      console.error('Error clearing stock:', error.message || error);
      throw error;
    }
  }
};