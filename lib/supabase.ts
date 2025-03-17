import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';

// Supabase configuration with actual credentials
const supabaseUrl = 'https://uwmlagvsivxqocklxbbo.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3bWxhZ3ZzaXZ4cW9ja2x4YmJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYyNzMwMjYsImV4cCI6MjA1MTg0OTAyNn0.ylTM28oYPVjotPmEn9TSZGPy4EQW2pbWgNLRqWYduLc';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

// Initialize database schema if needed
export const initializeDatabase = async () => {
  try {
    console.log('Checking if database tables exist...');
    
    // Check if profiles table has settings column
    const { data: profileColumns, error: profileColumnsError } = await supabase
      .from('profiles')
      .select('settings')
      .limit(1);
    
    if (profileColumnsError) {
      console.error('Error checking profiles table:', profileColumnsError);
      
      // If the settings column doesn't exist, try to add it
      if (profileColumnsError.code === '42703') { // undefined_column
        console.log('Settings column does not exist, attempting to add it...');
        
        try {
          // Try to add settings column to profiles table using RPC
          const { error: alterError } = await supabase.rpc('execute_sql', {
            sql: `
              ALTER TABLE profiles 
              ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{"language": "fr", "theme": "light", "currency": "XOF"}'
            `
          });
          
          if (alterError) {
            console.error('Error adding settings column:', alterError);
          } else {
            console.log('Settings column added successfully');
          }
        } catch (error) {
          console.error('Exception adding settings column:', error);
        }
      }
    } else {
      console.log('Profiles table with settings column exists');
    }
    
    // Check if ticket_transfers table exists
    const { error: checkTransfersError } = await supabase
      .from('ticket_transfers')
      .select('id')
      .limit(1);
    
    // If table doesn't exist, create it
    if (checkTransfersError) {
      console.log('Checking ticket_transfers table result:', checkTransfersError.message);
      
      if (checkTransfersError.code === '42P01') {
        console.log('Creating ticket_transfers table...');
        
        try {
          // Try to create the table using SQL directly
          const { error: createError } = await supabase.rpc('execute_sql', {
            sql: `
              CREATE TABLE IF NOT EXISTS ticket_transfers (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                ticket_id UUID NOT NULL,
                sender_id UUID NOT NULL,
                recipient_email TEXT NOT NULL,
                recipient_id UUID,
                status TEXT NOT NULL,
                created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMPTZ,
                expires_at TIMESTAMPTZ,
                accepted_at TIMESTAMPTZ,
                rejected_at TIMESTAMPTZ
              );
            `
          });
          
          if (createError) {
            console.error('Error creating ticket_transfers table:', createError);
            
            // If RPC fails, try another approach - create a minimal version of the table
            const { error: fallbackError } = await supabase.rpc('execute_sql', {
              sql: `
                CREATE TABLE IF NOT EXISTS ticket_transfers (
                  id TEXT PRIMARY KEY,
                  ticket_id TEXT NOT NULL,
                  sender_id TEXT NOT NULL,
                  recipient_email TEXT NOT NULL,
                  status TEXT NOT NULL,
                  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                  expires_at TIMESTAMPTZ
                );
              `
            });
            
            if (fallbackError) {
              console.error('Fallback error creating ticket_transfers table:', fallbackError);
            }
          }
        } catch (error) {
          console.error('Exception creating ticket_transfers table:', error);
        }
      }
    } else {
      console.log('ticket_transfers table exists');
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

// Call initialization on import (will only run once)
initializeDatabase().catch(console.error);

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): string => {
  console.error('Supabase error details:', error);
  
  // Handle different error formats
  if (typeof error === 'string') {
    return error;
  }
  
  if (error?.message) {
    // Check for specific error messages
    if (error.message.includes('JSON object requested, multiple (or no) rows returned')) {
      return 'Erreur de profil utilisateur. Veuillez réessayer.';
    }
    return error.message;
  }
  
  if (error?.error_description) {
    return error.error_description;
  }
  
  if (error?.details) {
    return error.details;
  }
  
  if (error?.data?.message) {
    return error.data.message;
  }
  
  if (error?.error) {
    return typeof error.error === 'string' ? error.error : JSON.stringify(error.error);
  }
  
  // Check for PostgreSQL error codes
  if (error?.code) {
    switch (error.code) {
      case '23505': // unique_violation
        return 'Cet email est déjà utilisé.';
      case 'PGRST116': // No rows returned
        return 'Profil non trouvé.';
      case '42703': // undefined_column
        return 'Colonne non trouvée. Mise à jour de la structure de données en cours.';
      case '42501': // RLS policy violation
        return 'Erreur de permission. Veuillez vous connecter à nouveau.';
      case '42P01': // undefined_table
        return 'Table non trouvée. L\'application est en cours de maintenance.';
      default:
        return `Erreur de base de données (${error.code}).`;
    }
  }
  
  return 'Une erreur s\'est produite. Veuillez réessayer.';
};