/**
 * Yapendik School OS — Supabase Cloud Database Configuration
 * Governed: Restricted to Superadmin / Build Configuration
 */

import React, { useState } from 'react';
import { getSupabaseConfig, saveSupabaseConfig } from '../../db/supabaseClient';
import { db } from '../../db/database';
import { useSecurityContext } from '../../auth/context';
import { Database, CheckCircle2, Shield, X, Sparkles, AlertCircle, Lock } from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const { securityContext } = useSecurityContext();
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const isSuperAdmin = securityContext?.role === 'YAPENDIK_SUPERADMIN' || import.meta.env.DEV;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin) {
      alert('Perubahan konfigurasi database cloud hanya dapat dilakukan oleh Yayasan / Superadmin.');
      return;
    }

    const success = saveSupabaseConfig(url, anonKey);
    if (success) {
      db.syncFromSupabase();
      setMessage({ text: 'Koneksi Supabase berhasil disimpan dan diaktifkan. Data sedang disinkronkan.', type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    } else {
      setMessage({ text: 'Konfigurasi dibersihkan. Sistem kembali ke mode Local Storage Engine.', type: 'success' });
      setTimeout(() => {
        setMessage(null);
        onClose();
      }, 1500);
    }
  };

  return (
    <div className="fixed inset-0 bg-brand/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-surface rounded-field shadow-floating border border-line max-w-lg w-full p-6 text-xs relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-faint hover-only:text-ink-soft p-1"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5 mb-2">
          <Database className="w-5 h-5 text-success" />
          <h2 className="text-base font-bold text-ink">
            Integrasi Cloud Database (Supabase / Postgres)
          </h2>
        </div>

        <p className="text-ink-soft mb-4 leading-relaxed">
          Amanaura OS dirancang dengan arsitektur <i>Online-First</i> dan repositori adaptif terisolasi.
        </p>

        {/* Current status banner */}
        <div className={`p-3 rounded-lg border mb-4 flex items-start space-x-2.5 ${
          currentConfig.isConnected 
            ? 'bg-success-tint border-success-line text-success-deep' 
            : 'bg-surface-subtle border-line text-ink-soft'
        }`}>
          {currentConfig.isConnected ? (
            <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" />
          ) : (
            <Database className="w-4 h-4 text-ink-soft shrink-0 mt-0.5" />
          )}
          <div>
            <div className="font-bold">Status: {currentConfig.statusMessage}</div>
            <div className="text-[11px] text-ink-soft mt-0.5">
              {currentConfig.isConnected 
                ? 'Semua operasi CRUD langsung terhubung ke tabel Supabase ber-RLS V2.1.5.' 
                : 'Penyimpanan lokal terpartisi aktif.'}
            </div>
          </div>
        </div>

        {!isSuperAdmin && (
          <div className="mb-4 p-3 bg-warning-tint border border-warning-line rounded-lg text-warning-deep flex items-start space-x-2">
            <Lock className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
            <span>Konfigurasi routing database cloud dikunci oleh tata kelola institusi. Hanya Superadmin Yayasan yang dapat memodifikasi endpoint.</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5">
          <div>
            <label className="block font-semibold text-ink-soft mb-1">Supabase Project URL</label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              disabled={!isSuperAdmin}
              onChange={e => setUrl(e.target.value)}
              className="w-full border border-line rounded px-2 py-1 outline-none font-mono text-xs focus:ring-1 focus:ring-brand-primary disabled:bg-surface-subtle disabled:text-ink-soft whitespace-nowrap"
            />
          </div>

          <div>
            <label className="block font-semibold text-ink-soft mb-1">Supabase Anon Key</label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              disabled={!isSuperAdmin}
              onChange={e => setAnonKey(e.target.value)}
              className="w-full border border-line rounded px-2 py-1 outline-none font-mono text-xs focus:ring-1 focus:ring-brand-primary disabled:bg-surface-subtle disabled:text-ink-soft whitespace-nowrap"
            />
          </div>

          {message && (
            <div className="p-2 rounded text-xs bg-success-tint text-success-deep border border-success-line font-semibold">
              {message.text}
            </div>
          )}

          <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 pt-4 border-t border-line-soft">
            {isSuperAdmin ? (
              <button
                type="button"
                onClick={() => {
                  setUrl('');
                  setAnonKey('');
                  saveSupabaseConfig('', '');
                }}
                className="w-full medium:w-auto text-ink-soft hover-only:text-danger font-medium text-center py-2 medium:py-0"
              >
                Reset ke Mode Standar
              </button>
            ) : <div />}

            <div className="flex flex-col medium:flex-row medium:items-center gap-2 w-full medium:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="w-full medium:w-auto px-3 py-2 medium:py-1 rounded border border-line text-ink-soft font-medium text-center"
              >
                Tutup
              </button>
              {isSuperAdmin && (
                <button
                  type="submit"
                  className="w-full medium:w-auto px-4 py-2 medium:py-1 rounded bg-brand text-on-brand font-semibold hover-only:opacity-90 text-center"
                >
                  Simpan Konfigurasi
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
