/**
 * Amanaura Design System v4.0 (CRYSTAL SOVEREIGN)
 * Living Contract & Architectural Specimen Workspace
 * 
 * "Dokumen = Render = Test pada Matriks 6 State"
 * Canvas-Native Flat Architecture (Hukum F-7 / A-4).
 */

import React, { useState, useEffect, useMemo } from 'react';
import { 
  Sparkles, 
  Sun, 
  Moon, 
  SunMoon,
  MousePointer,
  Smartphone, 
  Tablet, 
  Monitor, 
  ShieldCheck, 
  Layers, 
  RefreshCw,
  Search,
  Mail,
  Phone
} from 'lucide-react';
import { 
  Button, 
  Badge, 
  Input, 
  ProgressBar, 
  ListItem, 
  SegmentedControl, 
  SelectSheet, 
  SearchableCombobox, 
  AdaptiveDialog, 
  AutoResizeTextarea, 
  Skeleton, 
  ToastHUD, 
  AvatarChild 
} from '../ui';
import { 
  PrivacyShield, 
  NonCausalDelta, 
  CanonicalAnchor, 
  ForbiddenActionGate 
} from '../glass';
import { useTheme } from '../../hooks/useTheme';
import { useInputModality } from '../../hooks/useInputModality';
import { useOfflineStatus } from '../../hooks/useOfflineStatus';

// Helper for Relative Luminance & WCAG Contrast Calculation
function parseColorToRgb(colorStr: string): [number, number, number] | null {
  if (!colorStr) return null;
  const s = colorStr.trim();
  if (s.startsWith('#')) {
    let hex = s.substring(1);
    if (hex.length === 3) {
      hex = hex.split('').map(c => c + c).join('');
    }
    if (hex.length === 6) {
      const num = parseInt(hex, 16);
      return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
    }
  }
  const rgbMatch = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
  if (rgbMatch) {
    return [parseInt(rgbMatch[1], 10), parseInt(rgbMatch[2], 10), parseInt(rgbMatch[3], 10)];
  }
  const oklchMatch = s.match(/oklch\(\s*([\d.]+)/i);
  if (oklchMatch) {
    const l = parseFloat(oklchMatch[1]);
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  return null;
}

function getLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(val => {
    const c = val / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function calculateContrastRatio(colorA: string, colorB: string): string {
  const rgbA = parseColorToRgb(colorA);
  const rgbB = parseColorToRgb(colorB);
  if (!rgbA || !rgbB) return '—';
  const lumA = getLuminance(rgbA);
  const lumB = getLuminance(rgbB);
  const l1 = Math.max(lumA, lumB);
  const l2 = Math.min(lumA, lumB);
  const ratio = (l1 + 0.05) / (l2 + 0.05);
  return `${ratio.toFixed(2)}:1`;
}

interface TokenGroup {
  groupName: string;
  tokens: { varName: string; label: string }[];
}

const TOKEN_GROUPS: TokenGroup[] = [
  {
    groupName: 'Canvas & Surface',
    tokens: [
      { varName: '--canvas', label: 'Canvas Base' },
      { varName: '--surface', label: 'Surface Card' },
      { varName: '--surface-subtle', label: 'Surface Subtle' },
      { varName: '--surface-glass', label: 'Surface Glass' },
      { varName: '--surface-inset', label: 'Surface Inset' },
    ]
  },
  {
    groupName: 'Typography & Ink',
    tokens: [
      { varName: '--ink', label: 'Ink Primary' },
      { varName: '--ink-soft', label: 'Ink Soft' },
      { varName: '--ink-faint', label: 'Ink Faint' },
    ]
  },
  {
    groupName: 'Lines & Hairlines',
    tokens: [
      { varName: '--line', label: 'Line Standard' },
      { varName: '--line-hairline', label: 'Line Hairline' },
      { varName: '--line-soft', label: 'Line Soft' },
      { varName: '--line-strong', label: 'Line Strong' },
    ]
  },
  {
    groupName: 'Brand & Signatures',
    tokens: [
      { varName: '--brand', label: 'Brand Base' },
      { varName: '--brand-deep', label: 'Brand Deep' },
      { varName: '--brand-tint', label: 'Brand Tint' },
      { varName: '--brand-accent', label: 'Brand Accent (Gold)' },
      { varName: '--accent-valor', label: 'Accent Valor (Gold)' },
      { varName: '--valor-deep', label: 'Valor Deep (Bronze Contrast)' },
      { varName: '--on-brand', label: 'On Brand Contrast' },
      { varName: '--on-accent', label: 'On Accent Contrast' },
    ]
  },
  {
    groupName: 'Semantics: Success & Warning',
    tokens: [
      { varName: '--success', label: 'Success Solid' },
      { varName: '--success-deep', label: 'Success Deep' },
      { varName: '--success-tint', label: 'Success Tint' },
      { varName: '--success-line', label: 'Success Line' },
      { varName: '--warning', label: 'Warning Solid' },
      { varName: '--warning-deep', label: 'Warning Deep' },
      { varName: '--warning-tint', label: 'Warning Tint' },
      { varName: '--warning-line', label: 'Warning Line' },
    ]
  },
  {
    groupName: 'Semantics: Danger, Info & LPPA',
    tokens: [
      { varName: '--danger', label: 'Danger Solid' },
      { varName: '--danger-deep', label: 'Danger Deep' },
      { varName: '--danger-tint', label: 'Danger Tint' },
      { varName: '--danger-line', label: 'Danger Line' },
      { varName: '--info', label: 'Info Solid' },
      { varName: '--info-deep', label: 'Info Deep' },
      { varName: '--info-tint', label: 'Info Tint' },
      { varName: '--info-line', label: 'Info Line' },
      { varName: '--lppa', label: 'LPPA Solid' },
      { varName: '--lppa-deep', label: 'LPPA Deep' },
      { varName: '--lppa-tint', label: 'LPPA Tint' },
      { varName: '--lppa-line', label: 'LPPA Line' },
    ]
  },
  {
    groupName: 'Jenjang Color Tokens',
    tokens: [
      { varName: '--jj-tk', label: 'Jenjang TK (Amber)' },
      { varName: '--jj-sd', label: 'Jenjang SD (Moss)' },
      { varName: '--jj-smp', label: 'Jenjang SMP (River)' },
      { varName: '--jj-sma', label: 'Jenjang SMA (Wisteria)' },
    ]
  }
];

export const LivingContractWorkspace: React.FC = () => {
  const { theme, isDark, toggleTheme } = useTheme();
  const { modality, isCoarse, canHover } = useInputModality();
  const { isOnline, pendingMutations, lastSyncAt } = useOfflineStatus();

  // Dynamic Window Size Class Detection (MD3)
  const [windowWidth, setWindowWidth] = useState<number>(() => {
    return typeof window !== 'undefined' ? window.innerWidth : 1440;
  });

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const sizeClass = useMemo(() => {
    if (windowWidth < 600) return 'COMPACT';
    if (windowWidth < 840) return 'MEDIUM';
    return 'EXPANDED';
  }, [windowWidth]);

  // Read Runtime Computed CSS Values
  const [runtimeValues, setRuntimeValues] = useState<Record<string, string>>({});
  const [canvasColor, setCanvasColor] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const styles = getComputedStyle(document.documentElement);
      const computed: Record<string, string> = {};
      TOKEN_GROUPS.forEach(grp => {
        grp.tokens.forEach(tok => {
          computed[tok.varName] = styles.getPropertyValue(tok.varName).trim();
        });
      });
      const currentCanvas = styles.getPropertyValue('--canvas').trim();
      setCanvasColor(currentCanvas);
      setRuntimeValues(computed);
    }
  }, [theme]);

  // UI Interactive Demo States
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isToastVisible, setIsToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('Perubahan berhasil diverifikasi');
  const [segmentedValue, setSegmentedValue] = useState<string>('hari_ini');
  const [selectSheetValue, setSelectSheetValue] = useState<string>('tk_a');
  const [comboboxValue, setComboboxValue] = useState<string>('kenzo');
  const [narrativeInput, setNarrativeInput] = useState<string>('Ananda menunjukkan fokus tinggi saat merangkai balok geometri.');

  return (
    <div className="w-full max-w-6xl mx-auto px-4 medium:px-6 pt-6 pb-[160px] space-y-10 animate-in fade-in duration-200 text-ink">
      
      {/* 1. HERO CANVAS (R-1 Hero Canvas) */}
      <header className="space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-1.5 text-brand-deep text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4 text-brand-primary shrink-0" />
              <span>Sistem Desain • Spesimen Hidup</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Spesimen Hidup Amanaura</span>
              <span className="text-xs font-mono font-bold text-accent-valor bg-brand-tint px-3 py-1 rounded-full border border-line-hairline">
                v5.0 AMANAURA FLOW
              </span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              Verifikasi 6 State (COMPACT / MEDIUM / EXPANDED × Ivory Canvas / Midnight Sanctuary) &amp; Validasi Purity Token.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={toggleTheme} 
              className="rounded-xl text-xs font-bold"
              leftIcon={isDark ? <Sun className="w-4 h-4 text-brand-primary" /> : <Moon className="w-4 h-4 text-brand-primary" />}
            >
              {isDark ? 'Ivory Canvas' : 'Midnight Sanctuary'}
            </Button>
          </div>
        </div>

        {/* Live Context Telemetry Capsule Flat (R-2 Flat Pills) */}
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-3 pt-2">
          <div className="bg-surface-subtle p-3 rounded-xl border border-line-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sizeClass === 'COMPACT' && <Smartphone className="w-4 h-4 text-brand-primary" />}
              {sizeClass === 'MEDIUM' && <Tablet className="w-4 h-4 text-brand-primary" />}
              {sizeClass === 'EXPANDED' && <Monitor className="w-4 h-4 text-brand-primary" />}
              <span className="text-xs font-semibold text-ink-soft">Ukuran Layar (MD3)</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded-lg border border-line-hairline whitespace-nowrap">
              {`${sizeClass} (${windowWidth}px)`}
            </span>
          </div>

          <div className="bg-surface-subtle p-3 rounded-xl border border-line-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-xs font-semibold text-ink-soft">Tema Aktif</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded-lg border border-line-hairline whitespace-nowrap">
              {isDark ? 'MIDNIGHT SANCTUARY' : 'IVORY CANVAS'}
            </span>
          </div>

          <div className="bg-surface-subtle p-3 rounded-xl border border-line-hairline flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-brand-primary shrink-0" />
              <span className="text-xs font-semibold text-ink-soft">Modalitas Input</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded-lg border border-line-hairline whitespace-nowrap">
              {modality}
            </span>
          </div>
        </div>
      </header>

      {/* §1 Signatures (R-3 divide-y) */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink flex items-center gap-2">
            <span>6 Tanda Tangan Arsitektural Amanaura</span>
          </h2>
          <p className="text-xs text-ink-soft">Prinsip karakteristik desain bernyawa tanpa dekorasi buatan.</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 large:grid-cols-3 gap-3">
          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">1. Amanaura Breath</span>
              <Sparkles className="w-4 h-4 text-brand-primary animate-amanaura-breath" />
            </div>
            <p className="text-xs text-ink-soft">Denyut ritmis 4 detik penanda kesiapan bernyawa.</p>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">2. Luminescent Edge</span>
              <span className="w-3 h-3 rounded-full bg-brand-primary hover-only:shadow-luminescent focus-visible:shadow-luminescent" />
            </div>
            <p className="text-xs text-ink-soft">Cincin fokus berpendar kuningan anti-cincin biru browser.</p>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">3. Spring Motion</span>
              <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(true)} className="rounded-xl text-xs">
                Buka Dialog
              </Button>
            </div>
            <p className="text-xs text-ink-soft">Fisika pegas tanpa lonjakan visual layout shift.</p>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">4. Dot Capsule</span>
              <div className="flex gap-1">
                <Badge variant="success" dot={true}>Hadir</Badge>
                <Badge variant="danger" dot={true}>Alpa</Badge>
              </div>
            </div>
            <p className="text-xs text-ink-soft">Tipografi JetBrains Mono dengan titik status taktil.</p>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">5. Pastel &amp; Simbol</span>
              <div className="flex items-center -space-x-2">
                <AvatarChild name="Kenzo Pratama" id="child_01" size="sm" />
                <AvatarChild name="Gabriel Christian" id="child_02" size="sm" />
                <AvatarChild name="Siti Rahmawati" id="child_03" size="sm" />
              </div>
            </div>
            <p className="text-xs text-ink-soft">Palet pastel hangat terhitung deterministik per NIK.</p>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">6. Circadian Light</span>
              <Badge variant="lppa">Siang &amp; Malam</Badge>
            </div>
            <p className="text-xs text-ink-soft">Transisi Ivory Canvas ke Midnight Sanctuary tanpa silau.</p>
          </div>
        </div>
      </section>

      {/* §2 Tokens (R-3 divide-y) */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Palet Token Kanonikal</h2>
          <p className="text-xs text-ink-soft">Swatch Runtime (getComputedStyle) &amp; Rasio Kontras terhadap Canvas ({canvasColor || 'oklch'})</p>
        </div>

        <div className="space-y-6">
          {TOKEN_GROUPS.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{grp.groupName}</h3>
              <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-2.5">
                {grp.tokens.map((tok, tIdx) => {
                  const rawVal = runtimeValues[tok.varName];
                  const isUndefined = !rawVal || rawVal.trim() === '';
                  const contrast = calculateContrastRatio(rawVal || '', canvasColor);
                  return (
                    <div 
                      key={tIdx} 
                      className={`rounded-xl p-3 flex items-center gap-3 border transition-colors ${
                        isUndefined 
                          ? 'bg-danger-tint/30 border-danger-line' 
                          : 'bg-surface-subtle border-line-hairline'
                      }`}
                    >
                      <div 
                        className={`w-8 h-8 rounded-lg shrink-0 shadow-hairline border flex items-center justify-center ${
                          isUndefined ? 'bg-danger border-danger-deep' : 'border-line-hairline'
                        }`}
                        style={isUndefined ? undefined : { backgroundColor: `var(${tok.varName})` }}
                      >
                        {isUndefined && <span className="text-[8px] font-mono font-bold text-on-brand">ERR</span>}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">{tok.label}</div>
                        <div className="font-mono text-[10px] text-ink-soft truncate">{tok.varName}</div>
                        <div className="flex items-center justify-between text-[9px] font-mono mt-0.5">
                          <span className={isUndefined ? 'text-danger-deep font-bold' : 'text-ink-faint truncate max-w-[110px]'}>
                            {isUndefined ? 'UNDEFINED' : rawVal}
                          </span>
                          <span className={`font-semibold shrink-0 ml-1 ${isUndefined ? 'text-danger-deep' : 'text-ink'}`}>
                            {isUndefined ? '—' : contrast}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* §3 Components Matrix */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Matriks Primitif Komponen</h2>
          <p className="text-xs text-ink-soft">Uji coba interaktif tombol, kontrol pemilih, teks area, dan skeleton.</p>
        </div>

        {/* Buttons Matrix */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">The 5 Button Laws &amp; Varian</h3>
          <div className="flex flex-wrap gap-2 items-center">
            <Button variant="primary" size="md" className="rounded-xl">Primary</Button>
            <Button variant="primary" size="md" isLoading={true} className="rounded-xl">Loading</Button>
            <Button variant="secondary" size="md" className="rounded-xl">Secondary</Button>
            <Button variant="ghost" size="md" className="rounded-xl">Ghost Action</Button>
            <Button variant="danger" size="md" className="rounded-xl">Danger</Button>
            <Button variant="primary" size="md" disabled={true} className="rounded-xl">Disabled</Button>
            <Button variant="icon" size="icon" aria-label="Refresh Data" className="rounded-xl">
              <RefreshCw className="w-4 h-4 text-brand-primary" />
            </Button>
          </div>
        </div>

        {/* Inputs & Selection Controls */}
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-3 pt-2">
          <Input 
            label="Nama Lengkap Siswa" 
            placeholder="Ketik nama siswa..." 
            defaultValue="Kenzo Pratama Santoso"
            leftIcon={<Search className="w-4 h-4" />}
          />

          <SelectSheet 
            label="Kelompok Belajar (5–15 Opsi)"
            value={selectSheetValue}
            onChange={setSelectSheetValue}
            options={[
              { value: 'tk_a', label: 'Kelompok A (Bintang Ceria)', sublabel: 'Usia 4–5 Tahun' },
              { value: 'tk_b', label: 'Kelompok B (Mentari Pagi)', sublabel: 'Usia 5–6 Tahun' },
              { value: 'kb', label: 'Kelompok Bermain (Tunas Kasih)', sublabel: 'Usia 3–4 Tahun' },
            ]}
          />

          <SearchableCombobox 
            label="Pencarian Siswa (>15 Opsi)"
            value={comboboxValue}
            onChange={setComboboxValue}
            options={[
              { value: 'kenzo', label: 'Kenzo Pratama Santoso', sublabel: 'NIS: 2026001' },
              { value: 'gabriel', label: 'Gabriel Christian Sihombing', sublabel: 'NIS: 2026002' },
              { value: 'siti', label: 'Siti Nur Aisyah', sublabel: 'NIS: 2026003' },
              { value: 'budi', label: 'Budi Hartono', sublabel: 'NIS: 2026004' },
            ]}
          />
        </div>

        {/* SegmentedControl, Textarea, ProgressBars & Skeletons */}
        <div className="grid grid-cols-1 medium:grid-cols-2 gap-6 pt-2">
          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-ink-soft">SegmentedControl (≤4 Pilihan)</span>
              <SegmentedControl 
                value={segmentedValue}
                onChange={setSegmentedValue}
                options={[
                  { id: 'hari_ini', label: 'Hari Ini' },
                  { id: 'karya', label: 'Belajar & Karya' },
                  { id: 'rapor', label: 'Siswa & Rapor' },
                ]}
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-soft">Progress Bar (6 Varian Semantik)</span>
              <ProgressBar value={75} variant="brand" showLabel={true} />
              <ProgressBar value={90} variant="success" />
              <ProgressBar value={45} variant="warning" />
              <ProgressBar value={20} variant="danger" />
              <ProgressBar value={60} variant="info" />
              <ProgressBar value={85} variant="lppa" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-ink-soft">AutoResizeTextarea</span>
              <AutoResizeTextarea 
                value={narrativeInput}
                onChange={(e) => setNarrativeInput(e.target.value)}
                minRows={3}
                placeholder="Tuliskan narasi observasi fluid..."
              />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-ink-soft">Skeleton (Anti-Spinner)</span>
              <div className="space-y-1.5">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="rect" height="32px" />
              </div>
            </div>
          </div>
        </div>

        {/* Trigger Toast Feedback */}
        <div className="pt-2 flex items-center justify-between border-t border-line">
          <span className="text-xs text-ink-soft">ToastHUD Feedback Capsule</span>
          <Button variant="secondary" size="sm" onClick={() => setIsToastVisible(true)} className="rounded-xl text-xs">
            Picu Notifikasi Toast
          </Button>
        </div>
      </section>

      {/* §4 Glass Layer Contracts */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Spesimen Glass Layer &amp; Tata Kelola Etis</h2>
          <p className="text-xs text-ink-soft">Perisai Privasi, Dinamika Non-Kausal &amp; Audit Jangkar Kanonikal</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-ink block">PrivacyShield (FB-07 Anti-Differencing)</span>
            <div className="space-y-3">
              <div>
                <span className="text-[10px] text-ink-faint uppercase tracking-wider font-bold block mb-1">Sampel N &lt; 5 (Suppressed)</span>
                <PrivacyShield 
                  exposureStatus="SUPPRESSED_SMALL_COHORT"
                  sampleSize={3}
                  metricLabel="Rasio Kemandirian"
                />
              </div>
              <div className="border-t border-line-hairline pt-2">
                <span className="text-[10px] text-ink-faint uppercase tracking-wider font-bold block mb-1">Sampel N ≥ 5 (Visible)</span>
                <PrivacyShield 
                  exposureStatus="VISIBLE"
                  sampleSize={12}
                  metricValue={88.5}
                  metricLabel="Kesiapan Transisi SD"
                />
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-ink block">NonCausalDelta (H-02 Non-Causal Semantics)</span>
            <NonCausalDelta 
              baselineValue={60}
              outcomeValue={85}
              delta={25}
              qualitativeReflection="Peningkatan stimulasi motorik halus teramati di sentra balok."
            />
          </div>

          <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-ink block">CanonicalAnchor (H-06 Audit Trail)</span>
            <CanonicalAnchor 
              actionId="act_2026_demo_001"
              status="COMPLETED"
              isClosedLoop={true}
              actionTitle="Audit Kepatuhan Kurikulum"
              createdAt="29 Agu 2026, 14:00"
            />
          </div>
        <div className="bg-surface-subtle border border-line-hairline p-4 rounded-xl space-y-3">
            <span className="text-xs font-bold text-ink block">ForbiddenActionGate (FB-06 Hard Block)</span>
            <ForbiddenActionGate 
              actionType="CLASSROOM_MUTATION"
              userRole="TEACHER"
            >
              <div className="text-xs text-ink-soft">
                Gerbang blok mutasi lintas-sekolah aktif (FB-06).
              </div>
            </ForbiddenActionGate>
          </div>
        </div>
      </section>

      {/* §5 FLOW Typography & Colored Shadows Showcase */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Sistem Tipografi &amp; Colored Shadows (FLOW Soul)</h2>
          <p className="text-xs text-ink-soft">Geist Sans, Instrument Serif (Strict Allowlist), Geist Mono &amp; Navy-tinted Elevation</p>
        </div>

        {/* Typography Showcase */}
        <div className="p-4 rounded-xl bg-surface-subtle border border-line-hairline space-y-4">
          <div>
            <span className="text-[10px] text-brand-deep font-bold uppercase tracking-wider block mb-1">
              Display &amp; Seremonial (Instrument Serif)
            </span>
            <h3 className="font-serif text-3xl text-ink leading-tight">
              Selamat Pagi, Pendidik Peradaban
            </h3>
            <p className="text-xs italic font-serif text-ink-soft mt-1">
              "Setiap anak adalah bintang yang bertumbuh menurut orbit kemampuannya masing-masing."
            </p>
          </div>

          <div className="border-t border-line-hairline pt-3">
            <span className="text-[10px] text-brand-deep font-bold uppercase tracking-wider block mb-1">
              UI &amp; Body Text (Geist Sans)
            </span>
            <p className="text-sm font-sans text-ink leading-relaxed">
              Geist Sans menghadirkan keterbacaan modern yang sangat jernih dan taktil untuk alur kerja harian guru dan kepala sekolah.
            </p>
          </div>

          <div className="border-t border-line-hairline pt-3">
            <span className="text-[10px] text-brand-deep font-bold uppercase tracking-wider block mb-1">
              Data &amp; Angka Presisi (Geist Mono — tabular-nums)
            </span>
            <div className="flex flex-wrap gap-4 text-xs font-mono tabular-nums text-ink">
              <span className="p-2 rounded-lg bg-surface border border-line-hairline">NISN: 0012984921</span>
              <span className="p-2 rounded-lg bg-surface border border-line-hairline">Jam Lokal: 08:30:15 WIB</span>
              <span className="p-2 rounded-lg bg-surface border border-line-hairline">Ref: REF-YPK-2026-08</span>
            </div>
          </div>
        </div>

        {/* Colored Shadows Demo */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
            Navy-Tinted Colored Elevation (FLOW Floating Allowlist)
          </span>
          <div className="grid grid-cols-1 medium:grid-cols-3 gap-4 pt-1">
            <div className="bg-surface p-5 shadow-soft rounded-xl border border-line-hairline space-y-1">
              <span className="text-xs font-bold text-ink block">Shadow Soft</span>
              <p className="text-xs text-ink-soft">Elevasi halus untuk kartu pratinjau dan floating item.</p>
            </div>
            <div className="bg-surface p-5 shadow-medium rounded-xl border border-line-hairline space-y-1">
              <span className="text-xs font-bold text-ink block">Shadow Medium</span>
              <p className="text-xs text-ink-soft">Elevasi menengah untuk dropdown, popover, dan tooltips.</p>
            </div>
            <div className="bg-surface p-5 shadow-floating rounded-xl border border-line-hairline space-y-1">
              <span className="text-xs font-bold text-ink block">Shadow Floating</span>
              <p className="text-xs text-ink-soft">Elevasi tinggi untuk Mobile Omni-Bar, FAB, dan modal dialog.</p>
            </div>
          </div>
        </div>
      </section>

      {/* §6 CR80 Name Card & Digital Credential Specimen (ADR-UX-013) */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Spesimen Kartu Nama Digital CR80 (ADR-UX-013)</h2>
          <p className="text-xs text-ink-soft">Standar Kartu CR80 (85.6×54mm), Padma Watermark, Instrument Serif &amp; QR Verifikasi</p>
        </div>

        <div className="p-6 rounded-2xl bg-surface-subtle border border-line-hairline grid grid-cols-1 medium:grid-cols-2 gap-6 items-center justify-items-center">
          {/* 1. Static CR80 Staff Card Preview */}
          <div className="space-y-2 w-full max-w-[428px]">
            <div className="text-[11px] font-mono font-semibold text-ink-soft uppercase tracking-wider">
              Varian 1: Kartu Profesi Staf &amp; Guru
            </div>
            <div className="relative w-full aspect-[856/540] rounded-2xl bg-surface text-ink border border-line shadow-md p-5 flex flex-col justify-between overflow-hidden select-none">
              {/* Padma Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-brand-primary fill-current" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="w-64 h-64">
                  <path d="M100 10 C85 45 40 70 40 120 C40 160 70 190 100 190 C130 190 160 160 160 120 C160 70 115 45 100 10 Z M100 45 C110 75 140 95 140 125 C140 150 120 170 100 170 C80 170 60 150 60 125 C60 95 90 75 100 45 Z" />
                </svg>
              </div>

              {/* Corner flourishes */}
              <div className="absolute top-2 left-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12C2 6.477 6.477 2 12 2M2 2L6 6" /></svg>
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12C22 6.477 17.523 2 12 2M22 2L18 6" /></svg>
              </div>
              <div className="absolute bottom-2 left-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12C2 17.523 6.477 22 12 22M2 22L6 18" /></svg>
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12C22 17.523 17.523 22 12 22M22 22L18 18" /></svg>
              </div>

              <div className="relative z-10 flex items-start space-x-3.5">
                <div className="w-14 h-14 rounded-full bg-brand text-on-brand flex items-center justify-center text-lg font-bold shrink-0 border border-line-hairline shadow-xs">
                  EB
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="font-serif text-[21px] leading-tight text-ink font-normal tracking-tight truncate">
                    Erna Boykela R
                  </h1>
                  <div className="text-[11px] font-sans font-medium text-ink-soft leading-tight mt-0.5 truncate">
                    Guru Kelas / Wali Kelompok A (TK A)
                  </div>
                  <div className="text-[10px] font-sans text-ink-faint leading-tight mt-0.5 truncate">
                    TK YAPENDIK GPIB Cabang Maranatha
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between pt-1 border-t border-line-hairline mt-2">
                <div className="space-y-1 text-[10px] font-sans text-ink-soft max-w-[62%]">
                  <div className="truncate flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-ink-faint shrink-0" />
                    <span>yapendikmaranathajkt@gmail.com</span>
                  </div>
                  <div className="truncate font-mono flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-ink-faint shrink-0" />
                    <span>+6281218641392</span>
                  </div>
                  <div className="text-[9px] text-ink-faint italic pt-0.5">
                    Amanaura OS ✦ • Tahun Ajaran 2026/2027
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-md bg-surface-subtle border border-line-hairline flex items-center justify-center font-mono text-[8px] text-ink-soft">
                    QR CODE
                  </div>
                  <span className="text-[7.5px] font-mono text-ink-faint mt-0.5">TERVERIFIKASI</span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Static CR80 Guardian Family Card Preview (Addendum X) */}
          <div className="space-y-2 w-full max-w-[428px]">
            <div className="text-[11px] font-mono font-semibold text-accent-valor uppercase tracking-wider">
              Varian 2: Kartu Keluarga Wali &amp; Antar-Jemput
            </div>
            <div className="relative w-full aspect-[856/540] rounded-2xl bg-surface text-ink border border-line shadow-md p-5 flex flex-col justify-between overflow-hidden select-none">
              {/* Padma Watermark */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-5 text-brand-primary fill-current" aria-hidden="true">
                <svg viewBox="0 0 200 200" className="w-64 h-64">
                  <path d="M100 10 C85 45 40 70 40 120 C40 160 70 190 100 190 C130 190 160 160 160 120 C160 70 115 45 100 10 Z M100 45 C110 75 140 95 140 125 C140 150 120 170 100 170 C80 170 60 150 60 125 C60 95 90 75 100 45 Z" />
                </svg>
              </div>

              {/* Corner flourishes */}
              <div className="absolute top-2 left-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12C2 6.477 6.477 2 12 2M2 2L6 6" /></svg>
              </div>
              <div className="absolute top-2 right-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12C22 6.477 17.523 2 12 2M22 2L18 6" /></svg>
              </div>
              <div className="absolute bottom-2 left-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 12C2 17.523 6.477 22 12 22M2 22L6 18" /></svg>
              </div>
              <div className="absolute bottom-2 right-2 w-6 h-6 text-accent-valor/20 pointer-events-none">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M22 12C22 17.523 17.523 22 12 22M22 22L18 18" /></svg>
              </div>

              {/* Top Eyebrow */}
              <div className="relative z-10 flex items-center justify-between border-b border-line-hairline pb-1 -mt-1">
                <span className="text-[9px] font-mono font-bold text-accent-valor tracking-wider uppercase">
                  ✦ AMANAURA OS
                </span>
                <span className="text-[8.5px] font-mono font-bold text-accent-valor bg-surface-subtle px-2 py-0.5 rounded-full uppercase tracking-wider border border-line-hairline">
                  KARTU KELUARGA
                </span>
              </div>

              <div className="relative z-10 flex items-start space-x-3.5 pt-1 flex-1">
                {/* Visual Anchor: Child Avatar */}
                <div className="relative w-13 h-13 rounded-2xl bg-surface-subtle border border-line-hairline text-ink flex items-center justify-center text-lg font-bold shrink-0 shadow-xs">
                  <span className="font-serif text-xl">J</span>
                  <span className="absolute -bottom-1 -right-1 text-xs">🌟</span>
                </div>

                <div className="min-w-0 flex-1">
                  <h1 className="font-serif text-[19px] leading-tight text-ink font-normal tracking-tight truncate">
                    Jequaline Arabella (Millen)
                  </h1>
                  <div className="text-[10px] font-sans font-semibold text-ink-soft leading-tight mt-0.5 truncate">
                    Kelas TK A • Maranatha
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-line-hairline space-y-0.5">
                    <div className="text-[10.5px] font-sans text-ink leading-tight truncate">
                      <span className="text-ink-soft">Orang Tua/Wali: </span>
                      <span className="font-bold">Julen Patricia</span>
                      <span className="text-[10px] text-ink-soft"> (Ibu Kandung)</span>
                    </div>
                    <div className="text-[9px] font-mono text-ink-soft leading-tight truncate">
                      <span className="text-ink-faint">Terkait: </span>
                      <span>Michael Maspaitella (Ayah)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex items-end justify-between pt-1 border-t border-line-hairline mt-1">
                <div className="space-y-0.5 text-[9.5px] font-sans text-ink-soft max-w-[62%]">
                  <div className="truncate flex items-center space-x-1">
                    <Mail className="w-3 h-3 text-ink-faint shrink-0" />
                    <span className="font-mono">julen.patricia@gmail.com</span>
                  </div>
                  <div className="truncate font-mono flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-ink-faint shrink-0" />
                    <span>+6281218641305</span>
                  </div>
                  <div className="text-[8.5px] text-ink-faint italic pt-0.5">
                    Amanaura OS ✦ • Tahun Ajaran 2026/2027
                  </div>
                </div>
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-12 h-12 rounded-md bg-surface-subtle border border-line-hairline flex items-center justify-center font-mono text-[8px] text-ink-soft">
                    QR CODE
                  </div>
                  <span className="text-[7.5px] font-mono text-ink-faint mt-0.5">TERVERIFIKASI</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Dynamic Dialog Modal Instance */}
      <AdaptiveDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)}
        title="Spesimen Dialog Bunglon"
        description="Bunglon responsif: Bottom Sheet di Mobile & Modal di Desktop."
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Batal</Button>
            <Button variant="primary" onClick={() => setIsDialogOpen(false)} className="rounded-xl">Tutup</Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-ink-soft py-2">
          <p>Dialog ini mempertahankan elevasi luminescent dan transisi pegas tanpa lonjakan visual.</p>
          <div className="p-3 bg-surface-subtle border border-line-hairline rounded-xl font-mono text-[11px] text-ink">
            AdaptiveDialog: maxWidth=&quot;md&quot; • AmanauraSpring
          </div>
        </div>
      </AdaptiveDialog>

      {/* Floating Toast HUD */}
      {isToastVisible && (
        <ToastHUD 
          message={toastMessage}
          type="success"
          onClose={() => setIsToastVisible(false)}
          undoAction={{
            label: 'Urungkan',
            onUndo: () => {
              setToastMessage('Aksi berhasil diurungkan');
              setTimeout(() => setIsToastVisible(false), 2000);
            }
          }}
        />
      )}
    </div>
  );
};
