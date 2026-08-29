/**
 * Amanaura Design System v3.0 (PADMA MODERN)
 * Living Contract & Architectural Specimen Workspace
 * 
 * "Dokumen = Render = Test pada Matriks 6 State"
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
  Check, 
  Info, 
  AlertTriangle, 
  ShieldCheck, 
  Layers, 
  Maximize2,
  RefreshCw,
  Search,
  Eye,
  Lock
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
      { varName: '--p-brass', label: 'Brass Signature' },
      { varName: '--p-brass-soft', label: 'Brass Soft' },
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
    groupName: 'Jenjang Nusantara',
    tokens: [
      { varName: '--p-jj-tk', label: 'Jenjang TK (Clay)' },
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
    <div className="space-y-10 max-w-7xl mx-auto w-full pb-24 text-ink select-none px-4 medium:px-6">
      
      {/* §0 Header Kontrak */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-4">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4 border-b border-line-soft pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold font-display tracking-tight text-ink flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-brass animate-amanaura-breath" />
                <span>Header Kontrak</span>
              </h1>
              <Badge variant="warning" dot={true}>v3.0-RELEASE</Badge>
              <Badge variant="neutral">PADMA MODERN</Badge>
            </div>
            <p className="text-xs text-ink-soft font-medium">
              Spesimen Hidup Verifikasi 6 State (COMPACT / MEDIUM / EXPANDED × Frangipani Day / Night Temple)
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={toggleTheme} leftIcon={isDark ? <Sun className="w-4 h-4 text-brass" /> : <Moon className="w-4 h-4 text-brass" />}>
              {isDark ? 'Frangipani Day' : 'Night Temple'}
            </Button>
          </div>
        </div>

        {/* Live Context Telemetry Capsule */}
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-3">
          <div className="bg-surface-subtle p-3 rounded-field border border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              {sizeClass === 'COMPACT' && <Smartphone className="w-4 h-4 text-brass" />}
              {sizeClass === 'MEDIUM' && <Tablet className="w-4 h-4 text-brass" />}
              {sizeClass === 'EXPANDED' && <Monitor className="w-4 h-4 text-brass" />}
              <span className="text-xs font-semibold text-ink-soft">Ukuran Layar (MD3)</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded border border-line-soft whitespace-nowrap">
              {`${sizeClass} (${windowWidth}px)`}
            </span>
          </div>

          <div className="bg-surface-subtle p-3 rounded-field border border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <SunMoon className="w-4 h-4 text-brass shrink-0" />
              <span className="text-xs font-semibold text-ink-soft">Tema Aktif</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded border border-line-soft whitespace-nowrap">
              {isDark ? 'NIGHT TEMPLE' : 'FRANGIPANI DAY'}
            </span>
          </div>

          <div className="bg-surface-subtle p-3 rounded-field border border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-brass shrink-0" />
              <span className="text-xs font-semibold text-ink-soft">Modalitas Input</span>
            </div>
            <span className="font-mono text-xs font-bold text-ink px-2 py-1 bg-surface rounded border border-line-soft whitespace-nowrap">
              {modality}
            </span>
          </div>
        </div>
      </section>

      {/* §1 Signatures */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Signatures</span>
          </h2>
          <p className="text-xs text-ink-soft">6 Tanda Tangan Karakteristik Padma Modern</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 large:grid-cols-3 gap-4">
          {/* Signature 1: Breath */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">1. Amanaura Breath</span>
              <Sparkles className="w-4 h-4 text-brass animate-amanaura-breath" />
            </div>
            <p className="text-xs text-ink-soft">Denyut ritmis 4 detik penanda kesiapan bernyawa.</p>
          </div>

          {/* Signature 2: Luminescent Edge */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">2. Luminescent Edge</span>
              <span className="w-3 h-3 rounded-full bg-brass shadow-luminescent" />
            </div>
            <p className="text-xs text-ink-soft">Cincin fokus berpendar kuningan anti-cincin biru browser.</p>
          </div>

          {/* Signature 3: Spring Motion */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">3. Spring Motion</span>
              <Button variant="secondary" size="sm" onClick={() => setIsDialogOpen(true)}>
                Buka Dialog
              </Button>
            </div>
            <p className="text-xs text-ink-soft">Fisika pegas tanpa lonjakan visual layout shift.</p>
          </div>

          {/* Signature 4: Status Dot Capsule */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">4. Dot Capsule</span>
              <div className="flex gap-1">
                <Badge variant="success" dot={true}>Hadir</Badge>
                <Badge variant="danger" dot={true}>Alpa</Badge>
              </div>
            </div>
            <p className="text-xs text-ink-soft">Tipografi JetBrains Mono dengan titik status taktil.</p>
          </div>

          {/* Signature 5: Deterministic Pastel */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">5. Pastel & Simbol</span>
              <div className="flex items-center -space-x-2">
                <AvatarChild name="Kenzo Pratama" id="child_01" size="sm" />
                <AvatarChild name="Gabriel Christian" id="child_02" size="sm" />
                <AvatarChild name="Siti Rahmawati" id="child_03" size="sm" />
              </div>
            </div>
            <p className="text-xs text-ink-soft">Palet pastel hangat terhitung deterministik per NIK.</p>
          </div>

          {/* Signature 6: Circadian */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">6. Circadian Light</span>
              <Badge variant="lppa">Siang & Malam</Badge>
            </div>
            <p className="text-xs text-ink-soft">Transisi Frangipani Day ke Night Temple tanpa silau.</p>
          </div>
        </div>
      </section>

      {/* §2 Tokens */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3 flex flex-col medium:flex-row medium:items-center justify-between gap-2">
          <div>
            <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
              <span>Tokens</span>
            </h2>
            <p className="text-xs text-ink-soft">Swatch Runtime (getComputedStyle) & Rasio Kontras terhadap Canvas ({canvasColor})</p>
          </div>
        </div>

        {/* Grid Swatches */}
        <div className="space-y-6">
          {TOKEN_GROUPS.map((grp, gIdx) => (
            <div key={gIdx} className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">{grp.groupName}</h3>
              <div className="grid grid-cols-2 medium:grid-cols-3 large:grid-cols-4 gap-3">
                {grp.tokens.map((tok, tIdx) => {
                  const hex = runtimeValues[tok.varName] || '...';
                  const contrast = calculateContrastRatio(hex, canvasColor);
                  return (
                    <div key={tIdx} className="bg-surface-subtle border border-line rounded-field p-2 flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg border border-line shrink-0 shadow-hairline"
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

        {/* Typography, Radius & Shadows Specimens */}
        <div className="border-t border-line-soft pt-6 grid grid-cols-1 medium:grid-cols-3 gap-6">
          {/* Typography Specimen */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">Tipografi Padma</h3>
            <div className="bg-surface-subtle border border-line rounded-field p-3 space-y-2">
              <div className="font-display font-extrabold text-xl text-ink">Plus Jakarta Sans 800</div>
              <div className="font-display font-bold text-sm text-ink">Judul Seksi 700</div>
              <div className="font-sans text-xs text-ink-soft">Teks bacaan instruksional santun dan proporsional.</div>
              <div className="font-mono text-xs font-bold text-brass">JetBrains Mono 07:15 • 36.5°C</div>
            </div>
          </div>

          {/* Radius Specimen */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">Radius Dinamis</h3>
            <div className="bg-surface-subtle border border-line rounded-field p-3 space-y-2.5">
              <div className="p-2 bg-surface rounded-card border border-line text-xs font-semibold text-center">
                rounded-card (12px)
              </div>
              <div className="p-2 bg-surface rounded-field border border-line text-xs font-semibold text-center">
                rounded-field (8px)
              </div>
              <div className="p-2 bg-surface rounded-pill border border-line text-xs font-semibold text-center">
                rounded-pill (9999px)
              </div>
            </div>
          </div>

          {/* Shadows Specimen */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">Elevasi Kertas</h3>
            <div className="bg-surface-subtle border border-line rounded-field p-3 space-y-2.5">
              <div className="p-2 bg-surface rounded-field shadow-hairline border border-line text-xs text-center">
                shadow-hairline
              </div>
              <div className="p-2 bg-surface rounded-field shadow-ambient border border-line text-xs text-center">
                shadow-ambient
              </div>
              <div className="p-2 bg-surface rounded-field shadow-luminescent border border-line text-xs text-center font-bold text-brass">
                shadow-luminescent
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §3 Layout Laws */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Layout Laws</span>
          </h2>
          <p className="text-xs text-ink-soft">Hukum 1 (Edge-to-Edge), Hukum 3 (3-Zona), dan Nested Radius</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 gap-6">
          {/* Edge-to-Edge & 3-Zona Card */}
          <div className="bg-surface border border-line rounded-card shadow-hairline divide-y divide-line-soft overflow-hidden">
            <div className="p-4 bg-surface-subtle flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Zona 1: Header Terkunci</span>
              <Badge variant="success">Hadir 100%</Badge>
            </div>
            <div className="p-4 space-y-2 bg-surface">
              <span className="text-xs font-semibold text-ink-soft block">Zona 2: Isi Data Edge-to-Edge</span>
              <ListItem 
                avatar={<AvatarChild name="Kenzo Pratama" id="k1" size="sm" />}
                title="Kenzo Pratama Santoso"
                subtitle="NIS: 2026001 • Hadir (Suhu 36.4°C)"
                badge={<Badge variant="success">BSB</Badge>}
              />
              <ListItem 
                avatar={<AvatarChild name="Gabriel Christian" id="g1" size="sm" />}
                title="Gabriel Christian Sihombing"
                subtitle="NIS: 2026002 • Hadir (Suhu 36.6°C)"
                badge={<Badge variant="warning">Alergi</Badge>}
              />
            </div>
            <div className="p-3 bg-surface-subtle/60 flex items-center justify-between text-xs text-ink-soft">
              <span>Zona 3: Ringkasan & Aksi</span>
              <span className="font-mono text-[11px]">2 Siswa Terdata</span>
            </div>
          </div>

          {/* Nested Radius Demonstration */}
          <div className="p-4 bg-surface-subtle border border-line rounded-card space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-ink">Nested Radius Law</span>
              <span className="text-[10px] font-mono text-ink-faint">R_dalam = R_luar - Padding</span>
            </div>
            <p className="text-xs text-ink-soft">Kontainer luar ber-radius 12px (rounded-card) membungkus elemen dalam ber-radius 8px (rounded-field).</p>
            <div className="p-3 bg-surface border border-line rounded-field space-y-2">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-brass" />
                <span className="text-xs font-bold text-ink">Elemen Terdalam</span>
              </div>
              <p className="text-[11px] text-ink-soft">Kelengkungan sudut mengalir selaras tanpa distorsi optik.</p>
            </div>
          </div>
        </div>
      </section>

      {/* §4 Components */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Components</span>
          </h2>
          <p className="text-xs text-ink-soft">Matriks Primitif Kanonikal Amanaura v3.0</p>
        </div>

        {/* Buttons Matrix */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-ink-soft">The 5 Button Laws & Varian</h3>
          <div className="flex flex-wrap gap-3 items-center">
            <Button variant="primary" size="md">Primary</Button>
            <Button variant="primary" size="md" isLoading={true}>Loading</Button>
            <Button variant="secondary" size="md">Secondary</Button>
            <Button variant="ghost" size="md">Ghost Action</Button>
            <Button variant="danger" size="md">Danger</Button>
            <Button variant="primary" size="md" disabled={true}>Disabled</Button>
            <Button variant="icon" size="icon" aria-label="Refresh Data">
              <RefreshCw className="w-4 h-4 text-brass" />
            </Button>
          </div>
        </div>

        {/* Inputs & Selection Controls */}
        <div className="grid grid-cols-1 medium:grid-cols-3 gap-4 pt-2">
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
              <ProgressBar value={75} variant="brass" showLabel={true} />
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
        <div className="pt-2 flex items-center justify-between border-t border-line-soft">
          <span className="text-xs text-ink-soft">ToastHUD Feedback Capsule</span>
          <Button variant="secondary" size="sm" onClick={() => setIsToastVisible(true)}>
            Picu Notifikasi Toast
          </Button>
        </div>
      </section>

      {/* §5 Interaksi */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Interaksi</span>
          </h2>
          <p className="text-xs text-ink-soft">Tab Geser dengan Shader Mask & Standar Touch Target 48dp</p>
        </div>

        <div className="space-y-4">
          {/* Edge Fade Horizontal Tabs */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-ink-soft">Tab Overflow dengan Edge-Fade Mask</span>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1 [mask-image:linear-gradient(to_right,transparent_0,black_16px,black_calc(100%-16px),transparent_100%)]">
              {['Presensi Harian', 'Jurnal Belajar', 'Foto Karya', 'LPPA Portofolio', 'Kemitraan Ortu', 'Siklus Akademik', 'Evaluasi Sekolah'].map((tab, idx) => (
                <div key={idx} className="shrink-0 px-4 py-2 bg-surface-subtle border border-line rounded-full text-xs font-semibold text-ink whitespace-nowrap">
                  {tab}
                </div>
              ))}
            </div>
          </div>

          {/* Touch Target 48dp Minimum */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-ink block">Standar Area Sentuh 48dp</span>
              <span className="text-[11px] text-ink-soft">Ikon w-5 terbungkus dalam wadah min-h-[48px] touch-target-min.</span>
            </div>
            <div className="min-h-[48px] min-w-[48px] touch-target-min flex items-center justify-center bg-surface border border-line rounded-field shadow-hairline">
              <Sparkles className="w-5 h-5 text-brass" />
            </div>
          </div>
        </div>
      </section>

      {/* §6 Copywriting */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Copywriting</span>
          </h2>
          <p className="text-xs text-ink-soft">Kamus Pendidik Santun & Larangan Jargon Mekanis (§6.2)</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
          <div className="bg-surface-subtle border border-line rounded-field p-4 space-y-2">
            <span className="text-xs font-bold text-ink block">Batas Panjang Frasa</span>
            <div className="space-y-1 text-xs text-ink-soft">
              <div className="flex justify-between border-b border-line-soft py-1">
                <span>Judul Halaman / Kartu:</span>
                <span className="font-bold text-ink">Maksimal 2 Kata</span>
              </div>
              <div className="flex justify-between border-b border-line-soft py-1">
                <span>Tombol Aksi (CTA):</span>
                <span className="font-bold text-ink">Maksimal 3 Kata</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Keterangan Status:</span>
                <span className="font-bold text-ink">1 Baris Ringkas</span>
              </div>
            </div>
          </div>

          <div className="bg-surface-subtle border border-line rounded-field p-4 space-y-2">
            <span className="text-xs font-bold text-ink block">Kamus Anti-Jargon</span>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-ink-soft">
                <span className="line-through text-danger-deep">Submit Evidence</span>
                <span className="text-success-deep font-semibold">Simpan Dokumentasi</span>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <span className="line-through text-danger-deep">Sync LPPA Snapshot</span>
                <span className="text-success-deep font-semibold">Terbitkan LPPA</span>
              </div>
              <div className="flex items-center justify-between text-ink-soft">
                <span className="line-through text-danger-deep">Prompt Kemitraan</span>
                <span className="text-success-deep font-semibold">Saran untuk Orang Tua</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* §7 MD3 */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>MD3</span>
          </h2>
          <p className="text-xs text-ink-soft">Sistem Window Size Classes Material Design 3</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-3 gap-3">
          <div className={`p-4 rounded-field border transition-all ${sizeClass === 'COMPACT' ? 'bg-surface border-brass ring-1 ring-brass' : 'bg-surface-subtle border-line'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink">COMPACT</span>
              <span className="text-[10px] font-mono text-ink-faint">&lt; 600px</span>
            </div>
            <p className="text-xs text-ink-soft">Edge-to-edge layout, bottom navigation bar, single column focus.</p>
          </div>

          <div className={`p-4 rounded-field border transition-all ${sizeClass === 'MEDIUM' ? 'bg-surface border-brass ring-1 ring-brass' : 'bg-surface-subtle border-line'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink">MEDIUM</span>
              <span className="text-[10px] font-mono text-ink-faint">600–839px</span>
            </div>
            <p className="text-xs text-ink-soft">Collapsible mini-rail, adaptive single/dual column split.</p>
          </div>

          <div className={`p-4 rounded-field border transition-all ${sizeClass === 'EXPANDED' ? 'bg-surface border-brass ring-1 ring-brass' : 'bg-surface-subtle border-line'}`}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-ink">EXPANDED</span>
              <span className="text-[10px] font-mono text-ink-faint">≥ 840px</span>
            </div>
            <p className="text-xs text-ink-soft">Sidebar navigasi penuh, multi-column master-detail, max-w-7xl.</p>
          </div>
        </div>
      </section>

      {/* §8 Offline */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Offline</span>
          </h2>
          <p className="text-xs text-ink-soft">Status Konektivitas & Mutasi Antrean Latar Belakang</p>
        </div>

        <div className="bg-surface-subtle border border-line p-4 rounded-field flex flex-col medium:flex-row medium:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Badge variant={isOnline ? 'success' : 'danger'} dot={true}>
              {isOnline ? 'Terhubung' : 'Terputus'}
            </Badge>
            <span className="text-xs text-ink font-semibold">
              {isOnline ? 'Sinkronisasi Otomatis Aktif' : 'Modus Luring Beroperasi'}
            </span>
          </div>

          <div className="flex items-center gap-3 font-mono text-xs text-ink-soft">
            <span>Antrean Mutasi: 0</span>
            <span>•</span>
            <span>Terakhir Sinkron: {lastSyncAt || 'Baru saja'}</span>
          </div>
        </div>
      </section>

      {/* §9 Glass Layer */}
      <section className="bg-surface border border-line rounded-card p-6 shadow-hairline space-y-6">
        <div className="border-b border-line-soft pb-3">
          <h2 className="text-lg font-bold font-display text-ink flex items-center gap-2">
            <span>Glass Layer</span>
          </h2>
          <p className="text-xs text-ink-soft">Perisai Privasi, Dinamika Non-Kausal & Audit Jangkar Kanonikal</p>
        </div>

        <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
          {/* PrivacyShield N=3 vs N=12 */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-3">
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
              <div className="border-t border-line-soft pt-2">
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

          {/* NonCausalDelta */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-3">
            <span className="text-xs font-bold text-ink block">NonCausalDelta (H-02 Non-Causal Semantics)</span>
            <NonCausalDelta 
              baselineValue={60}
              outcomeValue={85}
              delta={25}
              qualitativeReflection="Peningkatan stimulasi motorik halus teramati di sentra balok."
            />
          </div>

          {/* CanonicalAnchor */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-3">
            <span className="text-xs font-bold text-ink block">CanonicalAnchor (H-06 Audit Trail)</span>
            <CanonicalAnchor 
              actionId="act_2026_demo_001"
              status="COMPLETED"
              isClosedLoop={true}
              actionTitle="Audit Kepatuhan Kurikulum"
              createdAt="29 Agu 2026, 14:00"
            />
          </div>

          {/* ForbiddenActionGate */}
          <div className="bg-surface-subtle border border-line p-4 rounded-field space-y-3">
            <span className="text-xs font-bold text-ink block">ForbiddenActionGate (FB-06 Hard Block)</span>
            <ForbiddenActionGate 
              actionType="CLASSROOM_MUTATION"
              fallback={
                <div className="p-3 bg-danger-tint border border-danger-line rounded-lg">
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
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button variant="primary" onClick={() => setIsDialogOpen(false)}>Tutup</Button>
          </div>
        }
      >
        <div className="space-y-3 text-xs text-ink-soft py-2">
          <p>Dialog ini mempertahankan elevasi luminescent dan transisi pegas tanpa lonjakan visual.</p>
          <div className="p-3 bg-surface-subtle border border-line rounded-field font-mono text-[11px] text-ink">
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
