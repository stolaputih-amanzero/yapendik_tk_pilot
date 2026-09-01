/**
 * Amanaura OS — PasskeyManager Component (ADR-05 / #DW-02)
 * Manages registered FIDO2 / WebAuthn biometric credentials on the user's account
 */

import React, { useEffect, useState } from 'react';
import { Fingerprint, Trash2, ShieldCheck, Smartphone, Laptop, Plus, Loader2 } from 'lucide-react';
import { AdaptiveDialog } from '../ui/AdaptiveDialog';
import { Button } from '../ui/Button';
import { getSupabaseClient } from '../../db/supabaseClient';
import { registerPasskey } from '../../services/webauthn';

export interface PasskeyItem {
  credential_id: string;
  device_type: string;
  friendly_name: string;
  created_at: string;
  last_used_at: string | null;
}

interface PasskeyManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onPasskeyCountChange?: (count: number) => void;
}

export const PasskeyManager: React.FC<PasskeyManagerProps> = ({
  isOpen,
  onClose,
  onPasskeyCountChange,
}) => {
  const [passkeys, setPasskeys] = useState<PasskeyItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRegistering, setIsRegistering] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const supabase = getSupabaseClient();

  useEffect(() => {
    if (isOpen) {
      loadPasskeys();
    }
  }, [isOpen]);

  const showFeedback = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 4000);
  };

  const loadPasskeys = async () => {
    setIsLoading(true);
    try {
      if (!supabase) {
        // Simulation mode from localStorage
        if (typeof localStorage !== 'undefined') {
          const stored = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
          setPasskeys(stored);
          onPasskeyCountChange?.(stored.length);
        }
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('rpc_list_user_passkeys');
      if (error) {
        throw error;
      }

      const items = (data as PasskeyItem[]) || [];
      setPasskeys(items);
      onPasskeyCountChange?.(items.length);
    } catch (err: any) {
      console.warn('Failed to load passkeys from database:', err);
      // Fallback mock
      if (typeof localStorage !== 'undefined') {
        const stored = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
        setPasskeys(stored);
        onPasskeyCountChange?.(stored.length);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (credentialId: string) => {
    setDeletingId(credentialId);
    try {
      if (!supabase) {
        // Simulation mode delete
        if (typeof localStorage !== 'undefined') {
          const stored: PasskeyItem[] = JSON.parse(localStorage.getItem('yapendik_mock_passkeys') || '[]');
          const updated = stored.filter(p => p.credential_id !== credentialId);
          localStorage.setItem('yapendik_mock_passkeys', JSON.stringify(updated));
          setPasskeys(updated);
          onPasskeyCountChange?.(updated.length);
        }
        showFeedback('success', 'Passkey berhasil dihapus');
        return;
      }

      const { error } = await supabase.rpc('rpc_delete_user_passkey', {
        target_credential_id: credentialId,
      });

      if (error) {
        throw error;
      }

      const next = passkeys.filter(p => p.credential_id !== credentialId);
      setPasskeys(next);
      onPasskeyCountChange?.(next.length);
      showFeedback('success', 'Passkey berhasil dihapus dari akun');
    } catch (err: any) {
      console.error('Delete passkey error:', err);
      showFeedback('error', err.message || 'Gagal menghapus passkey');
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddNewPasskey = async () => {
    setIsRegistering(true);
    try {
      const res = await registerPasskey(supabase);
      if (res.success) {
        showFeedback('success', res.message || 'Passkey baru berhasil ditambahkan');
        await loadPasskeys();
      } else if (!res.cancelled) {
        showFeedback('error', res.error || 'Gagal mendaftarkan passkey');
      }
    } finally {
      setIsRegistering(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AdaptiveDialog
      isOpen={isOpen}
      onClose={onClose}
      title={
        <div className="flex items-center space-x-2 text-ink">
          <Fingerprint className="w-5 h-5 text-brand-primary" />
          <span className="font-bold text-base">Kelola Kredensial Biometrik / Passkey</span>
        </div>
      }
      description="Daftar perangkat aman yang memiliki akses masuk satu ketukan (Touch ID / Face ID / Windows Hello) ke akun Anda."
      footer={
        <div className="flex items-center justify-between w-full pt-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleAddNewPasskey}
            isLoading={isRegistering}
            leftIcon={<Plus className="w-4 h-4" />}
            data-testid="btn-add-another-passkey"
          >
            Daftarkan Perangkat Baru
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
            data-testid="btn-close-passkey-manager"
          >
            Selesai
          </Button>
        </div>
      }
    >
      <div className="space-y-4 py-2">
        {/* Feedback Alert */}
        {message && (
          <div 
            className={`p-3 rounded-xl text-xs font-medium flex items-center space-x-2 ${
              message.type === 'success' 
                ? 'bg-success-tint text-success border border-success-line' 
                : 'bg-danger-tint text-danger-deep border border-danger-line'
            }`}
            role="status"
          >
            <span>{message.text}</span>
          </div>
        )}

        {/* List of Passkeys */}
        {isLoading ? (
          <div className="space-y-2 py-4">
            <div className="h-16 rounded-xl bg-surface-subtle animate-pulse" />
            <div className="h-16 rounded-xl bg-surface-subtle animate-pulse" />
          </div>
        ) : passkeys.length === 0 ? (
          <div className="text-center py-8 px-4 rounded-2xl bg-surface-subtle/50 border border-line-hairline space-y-3">
            <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center mx-auto">
              <Fingerprint className="w-6 h-6 opacity-60" />
            </div>
            <div className="space-y-1">
              <div className="text-xs font-bold text-ink">Belum Ada Passkey Terdaftar</div>
              <p className="text-[11px] text-ink-soft max-w-xs mx-auto">
                Daftarkan sensor biometrik perangkat ini untuk masuk secara instan tanpa memasukkan kata sandi.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleAddNewPasskey}
              isLoading={isRegistering}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Daftarkan Sekarang
            </Button>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
            {passkeys.map((item) => (
              <div
                key={item.credential_id}
                className="p-3.5 rounded-2xl bg-surface-subtle border border-line-hairline flex items-center justify-between hover-only:border-line transition-all group"
                data-testid={`passkey-item-${item.credential_id}`}
              >
                <div className="flex items-center space-x-3 min-w-0 flex-1">
                  <div className="w-10 h-10 rounded-xl bg-surface border border-line flex items-center justify-center text-brand-primary shrink-0 shadow-xs">
                    {item.device_type === 'platform' ? (
                      <Smartphone className="w-5 h-5 text-brand-primary" />
                    ) : (
                      <Laptop className="w-5 h-5 text-accent-valor" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center space-x-1.5 truncate">
                      <span className="text-xs font-bold text-ink truncate">{item.friendly_name}</span>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-brand-primary/10 text-brand-primary shrink-0 font-semibold">
                        {item.device_type === 'platform' ? 'Biometrik' : 'Security Key'}
                      </span>
                    </div>
                    <div className="text-[10.5px] text-ink-soft flex items-center space-x-2 mt-0.5">
                      <span>Didaftarkan: {new Date(item.created_at).toLocaleDateString('id-ID')}</span>
                      {item.last_used_at && (
                        <span>• Terakhir: {new Date(item.last_used_at).toLocaleDateString('id-ID')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  type="button"
                  onClick={() => handleDelete(item.credential_id)}
                  disabled={deletingId === item.credential_id}
                  className="p-2 rounded-xl text-ink-faint hover-only:text-danger hover-only:bg-danger-tint transition-colors cursor-pointer ml-2 disabled:opacity-50"
                  aria-label={`Hapus ${item.friendly_name}`}
                  title="Hapus Passkey"
                  data-testid={`btn-delete-passkey-${item.credential_id}`}
                >
                  {deletingId === item.credential_id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-danger" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Privacy & Security Footnote */}
        <div className="p-3 rounded-xl bg-surface border border-line-hairline flex items-start space-x-2.5 text-[11px] text-ink-soft">
          <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0 mt-0.5" />
          <span className="leading-tight">
            Kunci privat disimpan aman di chip keamanan perangkat Anda (*Secure Enclave / TPM*) dan tidak pernah dikirimkan ke server.
          </span>
        </div>
      </div>
    </AdaptiveDialog>
  );
};
