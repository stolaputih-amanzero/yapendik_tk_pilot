/**
 * Yapendik School OS — Supabase Client Initializer & Registry
 * 
 * Features:
 * - Dynamic configuration via Environment Variables (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY)
 * - Safe fallback across Browser and Test/Node runtimes
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const SUPABASE_URL_KEY = 'yapendik_supabase_url';
const SUPABASE_ANON_KEY = 'yapendik_supabase_anon_key';

function getStorage() {
  if (typeof window !== 'undefined' && window.localStorage) {
    return window.localStorage;
  }
  if (typeof localStorage !== 'undefined') {
    return localStorage;
  }
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
  };
}

function getEnvVar(key: string): string {
  try {
    if (typeof import.meta !== 'undefined' && (import.meta as any).env && (import.meta as any).env[key]) {
      return (import.meta as any).env[key];
    }
  } catch {}
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] || '';
    }
  } catch {}
  return '';
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  statusMessage: string;
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseConfig(): SupabaseConfig {
  const storage = getStorage();
  const url = storage.getItem(SUPABASE_URL_KEY) || getEnvVar('VITE_SUPABASE_URL') || getEnvVar('NEXT_PUBLIC_SUPABASE_URL') || '';
  const anonKey = storage.getItem(SUPABASE_ANON_KEY) || getEnvVar('VITE_SUPABASE_ANON_KEY') || getEnvVar('NEXT_PUBLIC_SUPABASE_ANON_KEY') || '';
  const isConnected = Boolean(url && anonKey && url.startsWith('https://'));

  return {
    url,
    anonKey,
    isConnected,
    statusMessage: isConnected 
      ? 'Terhubung dengan Supabase Cloud Database' 
      : 'Berjalan dalam Mode Engine Lokal (Offline-Resilient / Sprint 0 Storage)'
  };
}

export function saveSupabaseConfig(url: string, anonKey: string): boolean {
  const storage = getStorage();
  try {
    if (url.trim() && anonKey.trim()) {
      storage.setItem(SUPABASE_URL_KEY, url.trim());
      storage.setItem(SUPABASE_ANON_KEY, anonKey.trim());
      supabaseInstance = createClient(url.trim(), anonKey.trim());
      return true;
    } else {
      storage.removeItem(SUPABASE_URL_KEY);
      storage.removeItem(SUPABASE_ANON_KEY);
      supabaseInstance = null;
      return false;
    }
  } catch (e) {
    console.error('Error saving Supabase configuration:', e);
    return false;
  }
}

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const config = getSupabaseConfig();
  if (config.isConnected) {
    supabaseInstance = createClient(config.url, config.anonKey);
    return supabaseInstance;
  }

  return null;
}
