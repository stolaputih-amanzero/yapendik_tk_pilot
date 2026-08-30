# AMANAURA DESIGN SYSTEM v4.0-RELEASE
## "CRYSTAL SOVEREIGN" — The Clear, Precise, and Trusted Operating Experience
### Transition & Change Documentation: PADMA MODERN → CRYSTAL SOVEREIGN

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-DS-v4.0-RELEASE` |
| Version | `4.0-RELEASE` (CRYSTAL SOVEREIGN) |
| Governing Tier | LEVEL 2 — MASTER SPECIFICATION & GLOBAL PRODUCT STANDARD |
| Status | `RATIFIED — PENDING IMPLEMENTATION` (eksekusi via Gemini IDE Prompt) |
| Ratification Date | `2026-08-30` |
| Supersedes | `ADR-UX-005` (Padma Modern Visual Language) — **lapisan visual/token saja** |
| Preserved Unchanged | `ADR-UX-001` (MD3), `ADR-UX-002` (Samsung Tab), `ADR-UX-003` (Roadmap), `ADR-UX-006` (Code-as-SSOT), serta seluruh hukum perilaku PART III–XI v3.0 |
| New ADRs | `ADR-UX-007` (Crystal Sovereign Visual Language), `ADR-UX-008` (System Font Stack & Zero-Webfont), `ADR-UX-009` (Liquid Glass & Zero-Ornament Doctrine) |
| Target Scope | Visual layer Yapendik School OS; logika bisnis, RLS, RPC, dan Stage 4.5 **FROZEN** |
| Source Documents | `AMANAURA_DESIGN_SYSTEM_v3.0_RELEASE.md`, `STAGE_4_5_FINAL_CLOSURE_AND_ARCHITECTURE_CERTIFICATION_v1.0.md`, `CRYSTAL_SOVEREIGN_EXECUTION_PROMPT.md` |

---

## PART I: EXECUTIVE SUMMARY & RATIONALE

### 1.1 Mengapa Berubah (Problem Statement)

1. **Dissonansi Identitas Visual.** Palet *warm-stone/brass* (Frangipani Day `#F7F4ED` / Brass `#B8860B`) menciptakan kesan "arsip tradisional organik", bertolak belakang dengan posisi produk sebagai **SaaS Premium** presisi tinggi.
2. **Tabrakan Palet Brand.** Logo Yapendik GPIB memiliki inti warna **Royal Blue** dan **Vibrant Yellow**. Dipadukan dengan brass/emas tua, timbul benturan tonal; dipadukan dengan neutral cool gray, kedua warna logo *pop-out* secara harmonis.
3. **Arah Platform.** Ekosistem target (Samsung Galaxy Tab, DeX, Chrome Android) adalah lingkungan modern; bahasa visual Apple HIG (system colors, liquid glass, hairline) memberikan kesan *native-grade precision* tanpa mengorbankan fondasi ergonomi MD3 yang sudah disegel.

### 1.2 Matriks Perubahan vs Beku (Change Boundary Matrix)

| Domain | Status v4.0 | Keterangan |
| --- | --- | --- |
| Design Tokens (warna, radius, shadow, font) | 🔁 **BERUBAH** | Token swap nilai; nama utility `--color-*` tetap |
| 6 Amanaura Signatures | 🔁 **REKALIBRASI** | Ekspresi visual baru; konstanta fisika tetap |
| Motif Nusantara (Poleng/Padma/Gunungan) | 🗑️ **DIARSIPKAN** | Digantikan Zero-Ornament Doctrine |
| MD3 Window Size Classes & Device Matrix | 🔒 FROZEN | PART VII v3.0 tetap kanonikal |
| 12 Refactoring Laws & Audit Protocol | 🔒 FROZEN (contoh kelas direvisi ke token semantik) | PART IX |
| Komponen Primitif & Hukum Komponen | 🔒 FROZEN logika; 🔁 restyling nilai | PART IV |
| PWA, Offline, Service Worker | 🔒 FROZEN | PART VIII (kecuali `theme_color` manifest) |
| Copywriting Doctrine & Kamus Pendidik | 🔒 FROZEN | PART VI |
| Stage 4.5 (FB-01…FB-07, H-01…H-06, Glass Layer) | 🔒 **ABSOLUTELY FROZEN** | 348/348 checks wajib tetap PASS |

### 1.3 Filosofi & Tagline Baru

* **Tagline v4.0:** *"The Clear, Precise, and Trusted Operating Experience."* (Pengalaman Operasional yang Jernih, Presisi, dan Terpercaya).
* **Nilai inti tetap:** *"The OS Disappears into the Day"* — kini diterjemahkan melalui tiga prinsip Apple HIG:
  1. **Deference:** UI mundur ke belakang; tanpa ornamen; logo Yapendik adalah satu-satunya emblem.
  2. **Clarity:** Keterbacaan tinggi, hairline 1px, tipografi system-grade.
  3. **Depth:** Lapisan *liquid frosted glass* memisahkan navigasi dari konten.

---

## PART II: ARCHITECTURAL DECISION RECORDS

### ADR-UX-007 — Crystal Sovereign Visual Language
**Status: RATIFIED.** Mengadopsi palet Apple System Colors yang diselaraskan dengan logo Yapendik: Primary `#007AFF` (Light) / `#0A84FF` (Dark), Accent `#FFCC00` / `#FFD60A`, Canvas `#F2F2F7` / `#000000` (OLED). Menggantikan ADR-UX-005 pada lapisan nilai token saja.

### ADR-UX-008 — System Font Stack & Zero-Webfont
**Status: RATIFIED.** Tipografi sans beralih ke `-apple-system, BlinkMacSystemFont, "SF Pro Text", "Inter", sans-serif`. Webfont `@fontsource/plus-jakarta-sans` **dihapus** (performa PWA + kesan native). `JetBrains Mono` **tetap** untuk NIK/NIS/waktu/metrik (presisi data tidak berubah).

### ADR-UX-009 — Liquid Glass & Zero-Ornament Doctrine
**Status: RATIFIED.** (1) Material navigasi/modal = *Liquid Frosted Glass*: `backdrop-blur(20px) saturate(180%)` di atas `--glass-bg`. (2) **Zero Ornaments:** seluruh motif Poleng/Padma/Gunungan dihapus dari komponen, login, empty state, dan sertifikat; batas antar-lapisan murni hairline `--separator-hairline`.

---

## PART III: DESIGN TOKENS v4.0 (CANONICAL)

### 3.1 Runtime Tokens (`src/index.css`) — SSOT

```css
/* ═══ AMANAURA v4.0 — CRYSTAL SOVEREIGN (Runtime Variables) ═══ */
:root { /* CRYSTAL DAY (System Light) */
  --system-bg:#F2F2F7; --secondary-bg:#FFFFFF; --tertiary-bg:#E5E5EA;
  --glass-bg:rgba(255,255,255,0.75); --inset-bg:#000000;
  --label-primary:#000000; --label-secondary:#3C3C43; --label-tertiary:#8E8E93;
  --separator:rgba(60,60,67,0.12); --separator-hairline:rgba(0,0,0,0.05);
  --separator-soft:rgba(0,0,0,0.03); --separator-strong:rgba(60,60,67,0.29);
  --brand-blue:#007AFF; --brand-blue-deep:#0055D4; --brand-blue-tint:rgba(0,122,255,0.10);
  --brand-yellow:#FFCC00; --brand-yellow-deep:#8A6D00;
  --on-brand:#FFFFFF; --on-accent:#000000;
  --success:#34C759; --success-deep:#248A3D; --success-tint:#EAF7EC; --success-line:#C4E8CB;
  --warning:#FF9500; --warning-deep:#9A5A00; --warning-tint:#FFF5E6; --warning-line:#FFD9A6;
  --danger:#FF3B30;  --danger-deep:#C4302B;  --danger-tint:#FFECEB;  --danger-line:#FFC7C3;
  --info:#5856D6;    --info-deep:#4644B8;    --info-tint:#F0F0FC;    --info-line:#D6D5F5;
  --lppa:#AF52DE;    --lppa-deep:#8A3FA8;    --lppa-tint:#F8F0FC;    --lppa-line:#EBD3F2;
  --jj-tk:#FF9500; --jj-sd:#34C759; --jj-smp:#007AFF; --jj-sma:#5856D6;
}
.dark { /* OLED NIGHT (System Dark) */
  --system-bg:#000000; --secondary-bg:#1C1C1E; --tertiary-bg:#2C2C2E;
  --glass-bg:rgba(28,28,30,0.75); --inset-bg:#FFFFFF;
  --label-primary:#FFFFFF; --label-secondary:#EBEBF5; --label-tertiary:#8E8E93;
  --separator:rgba(235,235,245,0.15); --separator-hairline:rgba(255,255,255,0.08);
  --separator-soft:rgba(255,255,255,0.04); --separator-strong:rgba(235,235,245,0.30);
  --brand-blue:#0A84FF; --brand-blue-deep:#64B5FF; --brand-blue-tint:rgba(10,132,255,0.16);
  --brand-yellow:#FFD60A; --brand-yellow-deep:#FFD60A;
  --on-brand:#FFFFFF; --on-accent:#000000;
  --success:#30D158; --success-deep:#30D158; --success-tint:#12291A; --success-line:#2E5B3A;
  --warning:#FF9F0A; --warning-deep:#FF9F0A; --warning-tint:#2E2415; --warning-line:#5B4423;
  --danger:#FF453A;  --danger-deep:#FF453A;  --danger-tint:#2E1B19;  --danger-line:#5B322E;
  --info:#5E5CE6;    --info-deep:#8A89F0;    --info-tint:#1E1E33;    --info-line:#3A396B;
  --lppa:#BF5AF2;    --lppa-deep:#D08AF7;    --lppa-tint:#2A1B30;    --lppa-line:#4E3560;
  --jj-tk:#FF9F0A; --jj-sd:#30D158; --jj-smp:#0A84FF; --jj-sma:#5E5CE6;
}
/* ═══ Alias Layer (Tailwind v4 @theme inline) — nama utility TIDAK berubah ═══ */
@theme inline {
  --color-canvas:var(--system-bg); --color-surface:var(--secondary-bg);
  --color-surface-subtle:var(--tertiary-bg); --color-surface-glass:var(--glass-bg);
  --color-surface-inset:var(--inset-bg);
  --color-ink:var(--label-primary); --color-ink-soft:var(--label-secondary); --color-ink-faint:var(--label-tertiary);
  --color-line:var(--separator); --color-line-hairline:var(--separator-hairline);
  --color-line-soft:var(--separator-soft); --color-line-strong:var(--separator-strong);
  --color-brand:var(--brand-blue); --color-brand-primary:var(--brand-blue);
  --color-brand-deep:var(--brand-blue-deep); --color-brand-tint:var(--brand-blue-tint);
  --color-brand-accent:var(--brand-yellow); --color-on-brand:var(--on-brand); --color-on-accent:var(--on-accent);
  --color-brass:var(--brand-blue);          /* DEPRECATED ALIAS — hapus pasca-Sprint C-4 */
  --color-brass-soft:var(--brand-blue-deep);/* DEPRECATED ALIAS */
  --color-success:var(--success); --color-success-deep:var(--success-deep);
  --color-success-tint:var(--success-tint); --color-success-line:var(--success-line);
  --color-warning:var(--warning); --color-warning-deep:var(--warning-deep);
  --color-warning-tint:var(--warning-tint); --color-warning-line:var(--warning-line);
  --color-danger:var(--danger); --color-danger-deep:var(--danger-deep);
  --color-danger-tint:var(--danger-tint); --color-danger-line:var(--danger-line);
  --color-info:var(--info); --color-info-deep:var(--info-deep);
  --color-info-tint:var(--info-tint); --color-info-line:var(--info-line);
  --color-lppa:var(--lppa); --color-lppa-deep:var(--lppa-deep);
  --color-lppa-tint:var(--lppa-tint); --color-lppa-line:var(--lppa-line);
  --color-jj-tk:var(--jj-tk); --color-jj-sd:var(--jj-sd); --color-jj-smp:var(--jj-smp); --color-jj-sma:var(--jj-sma);
  --font-sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","Inter",sans-serif;
  --font-mono:"JetBrains Mono",SFMono-Regular,Menlo,monospace;
  --radius-card:18px; --radius-field:12px; --radius-control:8px; --radius-pill:9999px;
  --shadow-hairline:0 1px 0 rgba(0,0,0,.04);
  --shadow-ambient:0 1px 2px rgba(0,0,0,.04),0 4px 12px rgba(0,0,0,.05);
  --shadow-floating:0 4px 6px -1px rgba(0,0,0,.06),0 16px 32px -8px rgba(0,0,0,.12);
  --shadow-luminescent:0 0 0 1.5px var(--label-primary),0 0 20px -4px rgba(0,122,255,.35);
  --breakpoint-compact:0px; --breakpoint-medium:600px; --breakpoint-expanded:840px;
  --breakpoint-large:1200px; --breakpoint-extra-large:1600px;
}
```

**Catatan Arsitektural:**
1. **Nama utility stabil.** Kelas di codebase (`bg-canvas`, `text-ink-soft`, `bg-surface-inset`, `text-success-deep`, dst.) tetap berfungsi; hanya **nilai** yang bertukar. Ini adalah strategi *token swap zero-churn*.
2. **Mekanisme tema tetap `.dark` class** (hook `useTheme.ts` FROZEN). Inisialisasi awal mengikuti `prefers-color-scheme`; toggle in-app tetap tersedia.
3. **Alias deprecated** `brass`/`brass-soft` dipasang sementara agar build tidak pecah selama sweep; wajib lenyap pada Sprint C-4 (CI rule `R-BRASS`).

### 3.2 Hukum Rasio 60-30-10 (v4.0)

* **60% Canvas/Surface:** neutral cool gray & putih murni / hitam OLED.
* **30% Struktur:** label hierarchy + hairline separator.
* **10% Brand & Semantik:** biru `#007AFF` (aksi), kuning `#FFCC00` (aksen/highlight saja), sinyal semantik Apple. **Kuning dilarang menjadi warna teks pada latar terang** (kontras ≈1.6:1); kuning hanya sebagai *fill* dengan teks `--on-accent` (#000), atau teks pada latar gelap.

### 3.3 Nested Radius Law (Revisi)

Rumus tetap: *Radius Dalam = Radius Luar − Padding*. Dengan `--radius-card:18px` dan padding `p-4` (16px), elemen dalam wajib `rounded-control` (8px) atau `rounded-none`.

---

## PART IV: THE 6 AMANAURA SIGNATURES — v4.0 RECALIBRATION

| # | Signature | Ekspresi v3.0 (Padma) | Ekspresi v4.0 (Crystal) |
| --- | --- | --- | --- |
| 1 | Amanaura Breath | ✦ denyut 4s berwarna brass | ✦ denyut 4s berwarna `brand-primary` (light) / `brand-accent` hanya pada segel Closed-Loop |
| 2 | Luminescent Edge | ink-ring + brass-glow | ink-ring + **blue-glow** `rgba(0,122,255,.35)` (fokus keyboard/S-Pen) |
| 3 | Amanaura Spring | stiffness 380, damping 32, mass 0.8 | **TIDAK BERUBAH** |
| 4 | Status Dot Capsule | moss/clay/rust/river/wisteria | Apple semantic: `#34C759 / #FF9500 / #FF3B30 / #5856D6` + mono |
| 5 | Deterministic Pastel & Symbol | pastel hangat + simbol | pastel **cool tint** (token `*-tint`) + simbol **Lucide** deterministik (`Star, Sailboat, Sparkles, Heart, Shapes`) — zero emoji |
| 6 | Circadian Daylight | Frangipani Day / Night Temple | **Crystal Day** `#F2F2F7` / **OLED Night** `#000000` |

---

## PART V: MATERIALITY & COMPONENT RESTYLING LAWS

### 5.1 Liquid Glass Specification
TopBar, Sidebar, Mini-Rail, Omni-Bar, dan backdrop `AdaptiveDialog` wajib: `bg-surface-glass backdrop-blur-xl` + `border-line-hairline`. Dark: glass otomatis via token (`rgba(28,28,30,.75)`).

### 5.2 The 5 Button Laws — Nilai v4.0
| Tipe | Styling v4.0 |
| --- | --- |
| PRIMARY | `bg-brand-primary text-on-brand font-semibold` (maks 1/layar — hukum tetap) |
| SECONDARY | `bg-surface-subtle text-ink border border-line` |
| GHOST | `bg-transparent text-ink-soft hover-only:bg-surface-subtle` |
| DANGER | `bg-danger-tint text-danger-deep border border-danger-line` |
| ICON-ONLY | `w-9 h-9 rounded-control text-ink-soft` |

Hukum 6 (single Lucide icon, zero emoji), CTA Dominance, Anti-Jiggle Debounce 300ms, dan touch-target 48dp/32dp **TIDAK BERUBAH**.

### 5.3 Active & Selected States
* Sidebar aktif: `bg-brand-tint text-brand-deep font-semibold` (light) / `text-brand-blue` (dark).
* SegmentedControl aktif: aksen `border-b-2 border-b-brand-primary` (menggantikan `border-b-brass`).
* Selected row: `ring-1 ring-inset ring-current font-bold` (tetap).

### 5.4 Recent Apps Shield & Splash (Revisi Token)
Overlay privasi FB-01 kini `bg-canvas/80 backdrop-blur-xl` (menggantikan `bg-slate-900/80`), menghasilkan frosted abu-abu sejuk di Light Mode dan frosted hitam murni di Dark Mode tanpa menyilaukan. Splash tetap hanya Logo Yapendik + ✦.

### 5.5 PWA Manifest
`background_color: #F2F2F7`, `theme_color: #007AFF`.

---

## PART VI: MIGRATION PLAYBOOK (CLASS-LEVEL MAPPING)

| Kelas Lama (Padma) | Kelas Baru (Crystal) |
| --- | --- |
| `bg-brass` / `bg-brand` (ink) | `bg-brand-primary` |
| `text-brass` | `text-brand-deep` (light-safe) |
| `border-brass` / `border-b-brass` | `border-brand-primary` / `border-b-brand-primary` |
| `bg-canvas` (nilai lama) | tetap `bg-canvas` (nilai baru otomatis) |
| `rounded-xl` pada kartu | `rounded-card` (18px) |
| `shadow-ambient` (warm) | tetap nama, nilai cool otomatis |
| `.motif-poleng`, watermark padma/gunungan | **HAPUS** (Zero-Ornament) |
| `bg-white/95` (Omni-Bar) | `bg-surface-glass backdrop-blur-xl` |
| `text-white`/`text-black`/`bg-black` | `text-on-brand` / `text-ink` / `bg-surface-inset` (tetap dilarang raw) |

**Sprint Plan:** C-1 Token Swap (`index.css`) → C-2 Primitives (Button/Badge/Input/Skeleton) → C-3 Shell Glass (TopBar/Sidebar/OmniBar/AdaptiveDialog) → C-4 Page Sweep + hapus alias deprecated + motif → C-5 CI/VRT/doc-sync + re-run Stage 4.5 suites.

**UI/UX-Only Protocol ditegaskan ulang:** dilarang menyentuh `useState/useEffect`, RPC Supabase, RLS, routing, props TypeScript, dan test assertions. Komponen `<PrivacyShield />`, `<NonCausalDelta />`, `<CanonicalAnchor />`, `<ForbiddenActionGate />` hanya boleh tersentuh pada kelas styling, **tidak pada logika**.

---

## PART VII: GOVERNANCE, CI & AUDIT UPDATES

1. **`pnpm audit:tokens`:** regex raw-color lama tetap aktif; **ditambah** larangan raw hex (`bg-\[#`, `text-\[#`) dan larangan import `plus-jakarta`.
2. **`pnpm audit:amanaura`:** rule baru `R-ORNAMENT` (0 kemunculan `motif-poleng|padma|gunungan`) dan `R-BRASS` (0 kemunculan `brass` pasca-C-4); 10 dimensi lama tetap.
3. **`pnpm audit:sync`:** manifest token doc↔css diregenerasi ke set v4.0 (count mengikuti output SSOT script).
4. **VRT Re-baseline:** snapshot baru per komponen/halaman utama pada 3 breakpoint × 2 modality × **2 tema** (12 baseline/halaman).
5. **Stage 4.5 Regression Gate:** seluruh 14 suites (348 checks) + Suites 24-25 (Adversarial DOM PII) wajib PASS identik pasca-migrasi sebelum v4.0 disegel permanen.

---

## PART VIII: CHANGELOG & CERTIFICATION

**v4.0-RELEASE (2026-08-30) — CRYSTAL SOVEREIGN:**
ADR-UX-007/008/009 ratified. Token overhaul dari warm-stone/brass ke Apple System Colors tersinkron logo Yapendik (Blue `#007AFF`/`#0A84FF`, Yellow `#FFCC00`/`#FFD60A`). System font stack menggantikan Plus Jakarta Sans (Zero-Webfont). Liquid Frosted Glass menjadi material navigasi/modal. Zero-Ornament Doctrine mengarsipkan Poleng/Padma/Gunungan. Radius card 12px→18px (iOS squircle). Deep/tint/line variants direkalibrasi cool + hardening kontras (label-secondary light `#3C3C43`; `brand-blue-deep #0055D4` untuk teks kecil). Seluruh hukum perilaku MD3, ergonomi, PWA, copywriting, dan Stage 4.5 FROZEN tanpa perubahan.

╔══════════════════════════════════════════════════════════════════╗
║ AMANAURA v4.0 — CRYSTAL SOVEREIGN • RATIFIED PENDING IMPLEMENTATION ║
║ VISUAL LAYER SSOT • BEHAVIORAL LAWS v3.0 PRESERVED • STAGE 4.5 FROZEN ║
║ 348/348 REGRESSION GATE WAJIB UTUH • BASELINE: v3.0-RELEASE-PADMA ║
╚══════════════════════════════════════════════════════════════════╝
