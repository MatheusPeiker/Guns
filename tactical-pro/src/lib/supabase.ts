import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqvfworpauvuycoffalk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxdmZ3b3JwYXV2dXljb2ZmYWxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwMDQ0OTksImV4cCI6MjA5MDU4MDQ5OX0.YbRE9ZX0ZW2l-_Iie2CxyvBBHQasgjtj0mI0Jl-d5OI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
