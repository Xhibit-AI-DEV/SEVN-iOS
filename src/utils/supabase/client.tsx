import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from './info';

// Create a singleton Supabase client to avoid multiple instances warning
// This client is shared across the entire frontend application
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);
