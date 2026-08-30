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
  Search
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
      { varName: '--p-canvas', label: 'Canvas Base' },
      { varName: '--p-surface', label: 'Surface Card' },
      { varName: '--p-surface-subtle', label: 'Surface Subtle' },
      { varName: '--p-surface-inset', label: 'Surface Inset' },
    ]
  },
  {
    groupName: 'Typography & Ink',
    tokens: [
      { varName: '--p-ink', label: 'Ink Primary' },
      { varName: '--p-ink-soft', label: 'Ink Soft' },
      { varName: '--p-ink-faint', label: 'Ink Faint' },
    ]
  },
  {
    groupName: 'Lines & Hairlines',
    tokens: [
      { varName: '--p-line', label: 'Line Standard' },
      { varName: '--p-line-soft', label: 'Line Soft' },
      { varName: '--p-line-strong', label: 'Line Strong' },
    ]
  },
  {
    groupName: 'Brand & Signatures',
    tokens: [
      { varName: '--p-brand', label: 'Brand Base' },
      { varName: '--p-on-brand', label: 'On Brand Contrast' },
      { varName: '--p-brand-primary', label: 'Brand Primary' },
      { varName: '--p-brand-deep', label: 'Brand Deep' },
      { varName: '--p-brick', label: 'Brick Accent' },
    ]
  },
  {
    groupName: 'Semantics: Success & Warning',
    tokens: [
      { varName: '--p-success', label: 'Success Solid' },
      { varName: '--p-success-deep', label: 'Success Deep' },
      { varName: '--p-success-tint', label: 'Success Tint' },
      { varName: '--p-success-line', label: 'Success Line' },
      { varName: '--p-warning', label: 'Warning Solid' },
      { varName: '--p-warning-deep', label: 'Warning Deep' },
      { varName: '--p-warning-tint', label: 'Warning Tint' },
      { varName: '--p-warning-line', label: 'Warning Line' },
    ]
  },
  {
    groupName: 'Semantics: Danger, Info & LPPA',
    tokens: [
      { varName: '--p-danger', label: 'Danger Solid' },
      { varName: '--p-danger-deep', label: 'Danger Deep' },
      { varName: '--p-danger-tint', label: 'Danger Tint' },
      { varName: '--p-danger-line', label: 'Danger Line' },
      { varName: '--p-info', label: 'Info Solid' },
      { varName: '--p-info-deep', label: 'Info Deep' },
      { varName: '--p-info-tint', label: 'Info Tint' },
      { varName: '--p-info-line', label: 'Info Line' },
      { varName: '--p-lppa', label: 'LPPA Solid' },
      { varName: '--p-lppa-deep', label: 'LPPA Deep' },
      { varName: '--p-lppa-tint', label: 'LPPA Tint' },
      { varName: '--p-lppa-line', label: 'LPPA Line' },
    ]
  },
  {
    groupName: 'Jenjang Tint Tokens',
    tokens: [
      { varName: '--p-jj-kb', label: 'Jenjang KB (Sprout)' },
      { varName: '--p-jj-tka', label: 'Jenjang TK-A (Sky)' },
      { varName: '--p-jj-tkb', label: 'Jenjang TK-B (Amber)' },
      { varName: '--p-jj-sd', label: 'Jenjang SD (Moss)' },
      { varName: '--p-jj-smp', label: 'Jenjang SMP (River)' },
      { varName: '--p-jj-sma', label: 'Jenjang SMA (Wisteria)' },
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
      const currentCanvas = styles.getPropertyValue('--p-canvas').trim();
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
              <Sparkles className="w-4 h-4 text-brand-deep shrink-0" />
              <span>Sistem Desain • Spesimen Hidup</span>
            </div>
            <h1 className="text-[28px] medium:text-3xl font-bold tracking-tight text-ink leading-tight flex items-center gap-2 flex-wrap">
              <span>Spesimen Hidup Amanaura</span>
              <span className="text-xs font-mono font-bold text-warning-deep bg-warning-tint px-3 py-1 rounded-full border border-warning-line">
                v4.0 CRYSTAL SOVEREIGN
              </span>
            </h1>
            <p className="text-ink-soft text-sm max-w-2xl mt-1">
              Spesimen Hidup Verifikasi 6 State (COMPACT / MEDIUM / EXPANDED × Frangipani Day / Night Temple) &amp; Validasi Purity Token.
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
              {isDark ? 'Frangipani Day' : 'Night Temple'}
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
              {isDark ? 'NIGHT TEMPLE' : 'FRANGIPANI DAY'}
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
            <p className="text-xs text-ink-soft">Transisi Frangipani Day ke Night Temple tanpa silau.</p>
          </div>
        </div>
      </section>

      {/* §2 Tokens (R-3 divide-y) */}
      <section className="space-y-4">
        <div className="border-b border-line pb-2">
          <h2 className="text-base font-bold text-ink">Palet Token Kanonikal</h2>
          <p className="text-xs text-ink-soft">Swatch Runtime (getComputedStyle) &amp; Rasio Kontras terhadap Canvas ({canvasColor})</p>
        </div>

        <div className="space-y-6">
          {TOKEN_GROUPS.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{grp.groupName}</h3>
              <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-2.5">
                {grp.tokens.map((tok, tIdx) => {
                  const hex = runtimeValues[tok.varName] || '...';
                  const contrast = calculateContrastRatio(hex, canvasColor);
                  return (
                    <div key={tIdx} className="bg-surface-subtle border border-line-hairline rounded-xl p-3 flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg border border-line-hairline shrink-0 shadow-hairline"
                        style={{ backgroundColor: `var(${tok.varName})` }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-bold text-ink truncate">{tok.label}</div>
                        <div className="font-mono text-[10px] text-ink-soft truncate">{tok.varName}</div>
                        <div className="flex items-center justify-between text-[9px] font-mono text-ink-faint mt-0.5">
                          <span>{hex}</span>
                          <span className="text-ink font-semibold">{contrast}</span>
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
              fallback={
                <div className="p-3 bg-danger-tint border border-danger-line rounded-xl">
                  <Badge variant="danger" dot={true}>HARD-BLOCK (FB-06) Mutasi Kelas Dibatasi</Badge>
                </div>
              }
            >
              <Badge variant="success">Akses Terbuka</Badge>
            </ForbiddenActionGate>
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
