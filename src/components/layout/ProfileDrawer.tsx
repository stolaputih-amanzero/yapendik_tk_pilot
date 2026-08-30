/**
 * Amanaura OS × FLOW — Mobile Profile Drawer
 * Architectural Specification: ADR-UX-011 §4.2
 * 
 * Central command and context drawer on Compact & Medium viewports.
 * Houses user identity, tenant switcher, theme preferences, 432Hz audio gate,
 * sync status, PWA install guide, and session exit.
 */

import React from 'react';
import { 
  X, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Download, 
  LogOut, 
  Building2, 
  Sparkles,
  Wifi,
  WifiOff
} from 'lucide-react';
import { useSecurityContext } from '../../auth/context';
import { useTheme } from '../../hooks/useTheme';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';
import { useInstallPrompt } from '../../hooks/useInstallPrompt';
import { WorkspaceTab } from './TopBar';

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab?: (tab: WorkspaceTab) => void;
}

export const ProfileDrawer: React.FC<ProfileDrawerProps> = ({
  isOpen,
  onClose,
  onSelectTab
}) => {
  const { currentPersona, signOut } = useSecurityContext();
  const { isDark, toggleTheme } = useTheme();
  const { isOnline } = useOfflineStatus();
  const { isInstallable, isInstalled, isIOS, promptInstall } = useInstallPrompt();
  const [showIOSGuide, setShowIOSGuide] = React.useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = React.useState<boolean>(() => {
    if (typeof localStorage !== 'undefined') {
      const val = localStorage.getItem('amanaura_audio_enabled');
      return val === null ? true : val === 'true';
    }
    return true;
  });

  const handleToggleAudio = () => {
    setIsAudioEnabled(prev => {
      const next = !prev;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('amanaura_audio_enabled', String(next));
      }
      return next;
    });
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-end justify-center bg-surface-inset/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      data-testid="profile-drawer-backdrop"
    >
      <div 
        className="w-full max-w-lg max-h-[90dvh] bg-surface text-ink rounded-t-3xl border-t border-line-hairline shadow-floating flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
        data-testid="profile-drawer"
      >
        {/* Header Ribbon & Close Button */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-line-hairline shrink-0">
          <div className="flex items-center space-x-2">
            <span className="font-serif font-bold text-base text-ink tracking-tight">
              Amanaura OS
            </span>
            <span className="text-accent-valor text-xs" aria-hidden="true">✦</span>
            <span className="text-xs text-ink-soft">• Profil &amp; Pengaturan</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup Pengaturan"
            className="p-2 rounded-full hover-only:bg-surface-subtle text-ink-soft hover-only:text-ink transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Drawer Body */}
        <div className="p-6 space-y-6 overflow-y-auto grow no-scrollbar">
          {/* User Identity Card */}
          <div className="p-4 rounded-2xl bg-surface-subtle border border-line-hairline flex items-center space-x-4">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-full bg-brand-primary text-on-brand flex items-center justify-center text-lg font-bold shadow-soft">
                {currentPersona?.name.charAt(0) || 'U'}
              </div>
              <span 
                className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-surface flex items-center justify-center"
                title="Status Aktif Sirkadian"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-accent-valor" />
              </span>
            </div>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-base text-ink truncate">
                {currentPersona?.name || 'Pengguna Amanaura'}
              </div>
              <div className="text-xs text-ink-soft truncate mt-0.5">
                {currentPersona?.role || 'AUTH'} • {currentPersona?.schoolName || 'Satuan Pendidikan'}
              </div>
              <div className="inline-flex items-center space-x-1.5 mt-2 px-2 py-1 rounded-full bg-surface text-[11px] font-mono text-ink-soft border border-line-hairline">
                <Building2 className="w-3 h-3 text-brand-primary" />
                <span className="truncate">{currentPersona?.schoolName?.split(' ')[0] || 'Unit TK'}</span>
              </div>
            </div>
          </div>

          {/* Quick Preferences: Theme & 432Hz Sound */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft block">
              Preferensi Pengalaman
            </span>
            <div className="grid grid-cols-2 gap-3">
              {/* Theme Toggle Button */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-3 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle transition-colors flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                aria-label={isDark ? "Ubah ke Mode Terang" : "Ubah ke Mode Gelap"}
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  {isDark ? (
                    <Moon className="w-5 h-5 text-accent-valor shrink-0" />
                  ) : (
                    <Sun className="w-5 h-5 text-accent-valor shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink">Tema Visual</div>
                    <div className="text-[11px] text-ink-soft truncate">
                      {isDark ? 'Midnight Sanctuary' : 'Ivory Canvas'}
                    </div>
                  </div>
                </div>
              </button>

              {/* 432Hz Audio Gate Toggle */}
              <button
                type="button"
                onClick={handleToggleAudio}
                className="p-3 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle transition-colors flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                aria-label="Toggle Suara Harmonis 432Hz"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  {isAudioEnabled ? (
                    <Volume2 className="w-5 h-5 text-brand-primary shrink-0" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-ink-faint shrink-0" />
                  )}
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink">Denting 432Hz</div>
                    <div className="text-[11px] text-ink-soft truncate">
                      {isAudioEnabled ? 'Harmonis Aktif' : 'Senyap'}
                    </div>
                  </div>
                </div>
              </button>
            </div>

            {/* Living Contract (Amanaura Design System) */}
            {onSelectTab && (
              <button
                type="button"
                onClick={() => {
                  onSelectTab('PERCONTOHAN');
                  onClose();
                }}
                className="w-full p-3 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle transition-colors flex items-center justify-between text-left cursor-pointer min-h-[48px]"
                aria-label="Buka Living Contract (Amanaura Design System)"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Sparkles className="w-5 h-5 text-accent-valor shrink-0" />
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-ink flex items-center space-x-1.5">
                      <span>Living Contract</span>
                      <span className="text-[10px] font-mono text-accent-valor font-bold">✦ ADS</span>
                    </div>
                    <div className="text-[11px] text-ink-soft truncate">
                      Eksplorasi Desain Sistem &amp; Arsitektur Komponen
                    </div>
                  </div>
                </div>
              </button>
            )}
          </div>

          {/* Living Shell & Connectivity Info */}
          <div className="p-3 rounded-xl bg-surface-subtle border border-line-hairline flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2.5">
              {isOnline ? (
                <Wifi className="w-4 h-4 text-success" />
              ) : (
                <WifiOff className="w-4 h-4 text-warning" />
              )}
              <div>
                <span className="font-semibold text-ink">
                  {isOnline ? 'Terhubung ke Cloud' : 'Mode Offline Lokal'}
                </span>
                <p className="text-[10px] text-ink-faint">
                  Amanaura OS v1.0 • FLOW Soul Engine
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-1 rounded-full bg-surface border border-line-hairline text-ink-soft">
              SHA: 2026-B
            </span>
          </div>

          {/* PWA & Sign Out Actions */}
          <div className="space-y-2 pt-2 border-t border-line-hairline">
            {!isInstalled && (
              <>
                {isIOS ? (
                  <button
                    type="button"
                    onClick={() => setShowIOSGuide(prev => !prev)}
                    className="w-full py-3 px-4 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle text-ink font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[48px]"
                  >
                    <Download className="w-4 h-4 text-brand-primary" />
                    <span>Pasang di iOS (Panduan Layar Utama)</span>
                  </button>
                ) : isInstallable ? (
                  <button
                    type="button"
                    onClick={() => promptInstall()}
                    className="w-full py-3 px-4 rounded-xl bg-brand-primary text-on-brand hover-only:opacity-95 font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[48px] shadow-soft"
                  >
                    <Download className="w-4 h-4" />
                    <span>Pasang Aplikasi Amanaura OS</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      alert('Amanaura OS siap dipasang. Gunakan menu "Tambahkan ke Layar Utama" pada peramban Anda.');
                    }}
                    className="w-full py-3 px-4 rounded-xl bg-surface border border-line-hairline hover-only:bg-surface-subtle text-ink font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[48px]"
                  >
                    <Download className="w-4 h-4 text-brand-primary" />
                    <span>Panduan Pasang Aplikasi (PWA)</span>
                  </button>
                )}

                {showIOSGuide && (
                  <div className="p-3 rounded-xl bg-surface border border-line-hairline text-xs text-ink space-y-1.5 animate-in fade-in" data-testid="ios-install-guide">
                    <div className="font-semibold flex items-center space-x-1.5 text-brand-primary">
                      <span>Cara Memasang di iPhone / iPad:</span>
                    </div>
                    <ol className="list-decimal list-inside space-y-1 text-ink-soft text-[11px]">
                      <li>Ketuk tombol <strong>Bagikan (Share ⇪)</strong> pada bar peramban Safari.</li>
                      <li>Gulir ke bawah dan pilih <strong>"Tambahkan ke Layar Utama" (Add to Home Screen)</strong>.</li>
                      <li>Ketuk <strong>"Tambah"</strong> di pojok kanan atas.</li>
                    </ol>
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={() => {
                signOut();
                onClose();
              }}
              className="w-full py-3 px-4 rounded-xl bg-danger-tint border border-danger-line text-danger hover-only:bg-danger-tint/80 font-medium text-xs flex items-center justify-center space-x-2 transition-colors cursor-pointer min-h-[48px]"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Sesi</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
