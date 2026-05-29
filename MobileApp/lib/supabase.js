import { Platform } from 'react-native'

let supabase

if (Platform.OS !== 'web') {
  const { createClient } = require('@supabase/supabase-js')
  const AsyncStorage = require('@react-native-async-storage/async-storage').default
  require('react-native-url-polyfill/auto')

  const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY

  supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  })
} else {
  supabase = null
}

export { supabase }