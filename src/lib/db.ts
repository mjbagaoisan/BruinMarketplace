import { createClient } from '@/utils/supabase/server';

// Re-export the Supabase client creation
export { createClient } from '@/utils/supabase/server';

// Optional: Add any custom database utilities here
export const db = {
  // Add any common database operations you use frequently
  // Example:
  // async getUserById(id: string) {
  //   const supabase = createClient();
  //   const { data, error } = await supabase
  //     .from('users')
  //     .select('*')
  //     .eq('id', id)
  //     .single();
  //   if (error) throw error;
  //   return data;
  // }
};