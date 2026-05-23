import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://oahuksfywrpeynmielrd.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9haHVrc2Z5d3JwZXlubWllbHJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjAyODMsImV4cCI6MjA5NDYzNjI4M30.pRdsgSdm46UIvlbhgUAPfzhtpTPHaX3sWv230TIuifo';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
