import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://fkifwxauqdjmfjbceypa.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZraWZ3eGF1cWRqbWZqYmNleXBhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU3NTc2MjYsImV4cCI6MjA5MTMzMzYyNn0.xDUApNNkdWtyPnjWaiPSFCZtQkLJi-Oj7YXiypR56MY";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export { supabase as s };
