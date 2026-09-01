# AMANAURA DESIGN SYSTEM v3.0-RELEASE
## "PADMA MODERN" — The Warm, Tactile, and Dignified Operating Experience

### META
* **Document ID:** `DOC-AMANAURA-DS-v3.0-RELEASE`
* **Version:** `3.0-RELEASE`
* **Governing Tier:** `LEVEL 2 — MASTER SPECIFICATION & GLOBAL PRODUCT STANDARD`
* **Status:** `CANONICAL LIVING MASTER SPECIFICATION (PADMA MODERN ERA)`
* **Consolidation Date:** `2026-08-29`
* **Authoritative Standard:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2
* **Target Scope:** Global Architecture Standard for *Yapendik School OS* and Future Product Ecosystems
* **Architectural Decisions Ratified:**
  * `ADR-UX-001`: MD3 Window Size Classes Adoption (Compact / Medium / Expanded)
  * `ADR-UX-002`: Samsung Galaxy Tab + DeX Primary Target Ecosystem
  * `ADR-UX-003`: Comprehensive 12-Step Implementation Roadmap
  * `ADR-UX-005`: Adoption of "Padma Modern" Visual Language (Nusantara Refined, Light/Dark Dual Theme, TK-SMA Scalable)
* **Source Documents:**
  1. `AMANAURA_DESIGN_SYSTEM_SPECIFICATION_v1.0 (2026-08-27)` (`doc/MASTER/AMANAURA_DESIGN_SYSTEM_SPECIFICATION_v1.0.md`)
  2. `AMANAURA_REFACTORING_PLAYBOOK v1.1` (`doc/AMANAURA_REFACTORING_PLAYBOOK.md`)
  3. `ADR-UX-005: Padma Modern Visual Language Specification (2026-08-29)`

---

## TABLE OF CONTENTS
* [PART I: PHILOSOPHY & IDENTITY](#part-i-philosophy--identity)
* [PART II: DESIGN TOKENS ARCHITECTURE](#part-ii-design-tokens-architecture)
* [PART III: LAYOUT & NAVIGATION SYSTEM](#part-iii-layout--navigation-system)
* [PART IV: COMPONENT LIBRARY & LAWS](#part-iv-component-library--laws)
* [PART V: INTERACTION & MOTION DESIGN](#part-v-interaction--motion-design)
* [PART VI: CONTENT & COPYWRITING DOCTRINE](#part-vi-content--copywriting-doctrine)
* [PART VII: TABLET ANDROID EXTENSION (MD3 & SAMSUNG GALAXY TAB)](#part-vii-tablet-android-extension-md3--samsung-galaxy-tab)
* [PART VIII: PWA ARCHITECTURE](#part-viii-pwa-architecture)
* [PART IX: REFACTORING RULES & AUDIT PROTOCOL](#part-ix-refactoring-rules--audit-protocol)
* [PART X: GOVERNANCE & CHANGE MANAGEMENT](#part-x-governance--change-management)
* [PART XI: IMPLEMENTATION ROADMAP](#part-xi-implementation-roadmap)
* [SERTIFIKASI & STATUS OTORITATIF](#sertifikasi--status-otoritatif)
* [APPENDIX A: CHANGELOG](#appendix-a-changelog)

---

## PART I: PHILOSOPHY & IDENTITY

### 1.1 Etimologi & Identitas Filosofis
**AMANAURA** lahir dari perpaduan dua nilai fundamental:
* **AMAN (الأمان / Keamanan & Amanah)**: Perlindungan, ketenangan batin, rasa percaya, dan penjagaan etis tanpa rasa takut atau panik.
* **AURA (Pancaran Kehadiran & Jiwa)**: Kehangatan materialitas, pencahayaan alami, ritme biologis, dan keanggunan visual yang membedakan produk biasa dari mahakarya berjiwa (*Living Software*).

### 1.2 Tagline Resmi
> **"The Warm, Tactile, and Dignified Operating Experience."**  
> *(Pengalaman Operasional yang Hangat, Taktil, dan Bermartabat).*

### 1.3 Nilai Inti: *“The OS Disappears into the Day”*
Amanaura menolak antarmuka yang bising, penuh warna pelangi yang menyilaukan, atau pop-up agresif. Sistem operasi ini dirancang untuk **menghilang ke dalam hari kerja**, memberikan rasa tenang (*Calm & Dignified*) bagi pendidik, pimpinan, dan keluarga, sambil menyajikan ketepatan data tingkat tinggi berlandaskan filosofi *Tri Hita Karana* (harmoni manusia–alam–sistem).

### 1.4 The 6 Amanaura Signatures (Ciri Khas & Tanda Tangan Visual)
Setiap produk yang dibangun dengan *Amanaura Design System* wajib memancarkan 6 tanda tangan khas ini:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 6 AMANAURA SIGNATURES (v3.0)                          │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ 1. The Amanaura Breath  │ Piktogram mikro (✦) di TopBar/Sidebar yang berdenyut siklikal│
│    (Detak Hidup Mikro)  │ 4 detik sekali (`animate-amanaura-breath`) berwarna brass,   │
│                         │ menandakan sistem aktif, sehat, dan melindungi data.         │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 2. The Luminescent Edge │ Pendaran cahaya mikro ink-ring + brass-glow hangat           │
│    (Border Cahaya Hangat│ (--shadow-luminescent: 0 0 0 1.5px ink, 0 0 20px -4px brass).│
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 3. Amanaura Spring      │ Satu konstanta fisika pegas matematis universal di seluruh   │
│    (Fisika Gerak Mewah) │ animasi: { stiffness: 380, damping: 32, mass: 0.8 }.         │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 4. Status Dot Capsule   │ Seluruh status disajikan dalam kapsul mikro: titik warna     │
│    (Kapsul Titik Mikro) │ solid (moss/clay/rust/river/wisteria) + mono JetBrains Mono. │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 5. Deterministic Pastel │ Setiap entitas anak tanpa foto otomatis mendapatkan tema     │
│    & Symbol Engine      │ pastel matematis hangat (warning/success/info/danger-tint)   │
│                         │ + simbol ceria (🌟, 🦁, ⛵) demi privasi wajah anak (Rule 9).│
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 6. Circadian Daylight   │ Dual-Theme natural beradaptasi ritme hari & pencahayaan:     │
│    (Suhu Cahaya Alami)  │ • Siang/Terang: "Frangipani Day" (Warm Stone #F7F4ED)        │
│                         │ • Malam/Teduh: "Night Temple" (Deep Charcoal #16130F)        │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

*(Lihat implementasi terkait pada [PART II: DESIGN TOKENS ARCHITECTURE](#part-ii-design-tokens-architecture) dan [PART V: INTERACTION & MOTION DESIGN](#part-v-interaction--motion-design)).*

---

## PART II: DESIGN TOKENS ARCHITECTURE

### 2.1 Padma Modern Color Architecture (Light & Dark)
Sistem warna kini menggunakan arsitektur *dual-theme* (**Frangipani Day** & **Night Temple**) dengan basis semantik *warm-stone* dan aksen *brass*, berlandaskan filosofi Nusantara *Tri Hita Karana*.

#### Hukum Rasio 60 - 30 - 10:
* **60% Base / Canvas & Surface**:
  * Light: Canvas `#F7F4ED`, Surface `#FFFFFF`, Surface-Subtle `#F0ECE1`.
  * Dark: Canvas `#16130F`, Surface `#211E1A`, Surface-Subtle `#2C2722`.
* **30% Struktur & Tipografi**:
  * Light: Ink `#211E1A`, Ink-Soft `#6E655F`, Ink-Faint `#A89F91`, Line `#E5DFD3`.
  * Dark: Ink `#EDE8DF`, Ink-Soft `#A89F91`, Ink-Faint `#6E655F`, Line `#38332B`.
* **10% Brass & Sinyal Semantik Murni (DILARANG UNTUK DEKORASI BIASA)**:
  * Brand/Aksen: Brass `#B8860B` / `#D4AF37` (Amanaura signature).
  * Success / Moss: `#2E7D32` / `#4CAF50` (Presensi hadir, verifikasi sah).
  * Warning / Clay: `#C05621` / `#ED8936` (Perhatian, alergi, draf).
  * Danger / Rust: `#C53030` / `#F56565` (Alpa, insiden, pembatalan).
  * Info / River: `#2B6CB0` / `#4299E1` (Informasi kurikulum, pengumuman).
  * LPPA / Wisteria: `#6B46C1` / `#9F7AEA` (Kurasi bukti rapor & portofolio).

#### Implementasi Runtime Tokens (`src/index.css`):
```css
/* ═══ RUNTIME THEME VARIABLES (switch via .dark) ═══ */
:root {
  --p-canvas:#F7F4ED; --p-surface:#FDFCF9; --p-surface-subtle:#EFE9DC; --p-surface-inset:#211E1A;
  --p-ink:#211E1A; --p-ink-soft:#5C554A; --p-ink-faint:#9B9284;
  --p-line:#E6DECD; --p-line-soft:#EEE8DA; --p-line-strong:#CFC5AE;
  --p-brand:#211E1A; --p-on-brand:#F7F4ED; --p-brass:#A8874C; --p-brass-soft:#C9B183; --p-brick:#9C4A3C;
  --p-success:#4B7656; --p-success-deep:#3B5C44; --p-success-tint:#EBF0EA; --p-success-line:#C9D6C6;
  --p-warning:#8F6420; --p-warning-deep:#8A5A1D; --p-warning-tint:#F4EBDD; --p-warning-line:#E0CBA8;
  --p-danger:#A03B33;  --p-danger-deep:#7E2D26;  --p-danger-tint:#F4E7E4;  --p-danger-line:#DFBDB7;
  --p-info:#3E6E8E;    --p-info-deep:#2E5470;    --p-info-tint:#E8EEF2;    --p-info-line:#C2D3DD;
  --p-lppa:#7A4E7E;    --p-lppa-deep:#5C3A60;    --p-lppa-tint:#F0E9F0;    --p-lppa-line:#D8C6D9;
  --p-jj-tk:#C96F4A; --p-jj-sd:#4E7A5A; --p-jj-smp:#3E6E8E; --p-jj-sma:#7A4E7E;
}
.dark { /* NIGHT TEMPLE */
  --p-canvas:#16130F; --p-surface:#201C16; --p-surface-subtle:#2A241C; --p-surface-inset:#F7F4ED;
  --p-ink:#F2EBDD; --p-ink-soft:#CFC5B4; --p-ink-faint:#8F867A;
  --p-line:#3A3227; --p-line-soft:#2E2820; --p-line-strong:#55493A;
  --p-brand:#C9A45C; --p-on-brand:#16130F; --p-brass:#C9A45C; --p-brass-soft:#8A6F3F; --p-brick:#C97C6B;
  --p-success:#8FB79B; --p-success-deep:#B7D2B4; --p-success-tint:#232B22; --p-success-line:#3B4A3A;
  --p-warning:#D9A85F; --p-warning-deep:#E7C088; --p-warning-tint:#2E2618; --p-warning-line:#4A3D24;
  --p-danger:#D08578;  --p-danger-deep:#E3AC9F;  --p-danger-tint:#2E1F1C;  --p-danger-line:#4A312C;
  --p-info:#8FB4CC;    --p-info-deep:#B4CFE0;    --p-info-tint:#1F2830;    --p-info-line:#314351;
  --p-lppa:#B795BB;    --p-lppa-deep:#D2B8D4;    --p-lppa-tint:#291F2A;    --p-lppa-line:#433345;
  --p-jj-tk:#E0906B; --p-jj-sd:#8FB79B; --p-jj-smp:#8FB4CC; --p-jj-sma:#B795BB;
}

/* ═══ AMANAURA v3.0 — PADMA MODERN (Tailwind v4) ═══ */
@theme inline {
  --color-canvas:var(--p-canvas); --color-surface:var(--p-surface);
  --color-surface-subtle:var(--p-surface-subtle); --color-surface-inset:var(--p-surface-inset);
  --color-ink:var(--p-ink); --color-ink-soft:var(--p-ink-soft); --color-ink-faint:var(--p-ink-faint);
  --color-line:var(--p-line); --color-line-soft:var(--p-line-soft); --color-line-strong:var(--p-line-strong);
  --color-brand:var(--p-brand); --color-on-brand:var(--p-on-brand);
  --color-brass:var(--p-brass); --color-brass-soft:var(--p-brass-soft); --color-brick:var(--p-brick);
  --color-success:var(--p-success); --color-success-deep:var(--p-success-deep);
  --color-success-tint:var(--p-success-tint); --color-success-line:var(--p-success-line);
  --color-warning:var(--p-warning); --color-warning-deep:var(--p-warning-deep);
  --color-warning-tint:var(--p-warning-tint); --color-warning-line:var(--p-warning-line);
  --color-danger:var(--p-danger); --color-danger-deep:var(--p-danger-deep);
  --color-danger-tint:var(--p-danger-tint); --color-danger-line:var(--p-danger-line);
  --color-info:var(--p-info); --color-info-deep:var(--p-info-deep);
  --color-info-tint:var(--p-info-tint); --color-info-line:var(--p-info-line);
  --color-lppa:var(--p-lppa); --color-lppa-deep:var(--p-lppa-deep);
  --color-lppa-tint:var(--p-lppa-tint); --color-lppa-line:var(--p-lppa-line);
  --color-jj-tk:var(--p-jj-tk); --color-jj-sd:var(--p-jj-sd); --color-jj-smp:var(--p-jj-smp); --color-jj-sma:var(--p-jj-sma);

  /* Tipografi: kelahiran Indonesia + mono presisi */
  --font-display:"Plus Jakarta Sans","Inter",system-ui,sans-serif;
  --font-sans:"Plus Jakarta Sans","Inter",system-ui,sans-serif;
  --font-mono:"JetBrains Mono",ui-monospace,monospace;

  /* Elevasi: hairline, bukan bayangan tebal (anti-heavy) */
  --shadow-hairline:0 1px 0 rgba(33,30,26,.05);
  --shadow-ambient:0 1px 2px rgba(33,30,26,.04),0 4px 12px rgba(33,30,26,.03);
  --shadow-floating:0 4px 6px -1px rgba(33,30,26,.05),0 16px 32px -8px rgba(33,30,26,.10);
  --shadow-luminescent:0 0 0 1.5px var(--p-ink),0 0 20px -4px rgba(168,135,76,.28);

  /* Radius tightened */
  --radius-card:12px; --radius-field:8px; --radius-pill:9999px;

  /* MD3 Window Size Class Breakpoints */
  --breakpoint-compact: 0px;
  --breakpoint-medium: 600px;
  --breakpoint-expanded: 840px;
  --breakpoint-large: 1200px;
  --breakpoint-extra-large: 1600px;
}
```

> **Catatan Arsitektural**: Implementasi runtime menggunakan prefix `--p-*`
> untuk nilai runtime, yang di-alias ke `--color-*` via Tailwind v4
> `@theme inline`. Dokumen ini mencerminkan implementasi aktual sebagai
> Single Source of Truth.

### 2.2 Dualitas Tipografi & Motif Nusantara
* **Header & Display**: `Plus Jakarta Sans` (Kelahiran Indonesia — proporsional, geometris, modern, hangat).
* **Data, Kode & Angka**: `JetBrains Mono` (Presisi monospaced untuk NIS, NIK, Jam, Tanggal, Suhu °C, dan Metrik).
* **Motif Kultural Nusantara (Disiplin Anti-Heavy: $\le 4\%$ Opacity)**:
  * **Saput Poleng (`.motif-poleng`)**: Micro-check hitam-putih taktil untuk indikator item aktif sidebar, drag handle pada `AdaptiveDialog`, dan grab bar pada `MobileOmniBar`.
  * **Padma & Gunungan**: Watermark line-art anggun untuk layar login, empty states, dan sertifikat resmi.

### 2.3 Multi-Layer Ambient Shadow (Bayangan Kertas Alami)
```css
--shadow-ambient: 0 2px 8px rgba(33, 30, 26, 0.06), 0 1px 2px rgba(33, 30, 26, 0.04);
--shadow-floating: 0 8px 24px rgba(33, 30, 26, 0.10), 0 2px 6px rgba(33, 30, 26, 0.04);
--shadow-luminescent: 0 0 0 1.5px #211E1A, 0 0 20px -4px rgba(184, 134, 11, 0.25);
```

### 2.4 Canonical Z-Index Stacking Hierarchy
```css
--z-workspace: 0;
--z-topbar: 40;
--z-omnibar: 50;
--z-drawer-modal: 60;
--z-toast-hud: 70;
--z-critical-shield: 80;
```

---

## PART III: LAYOUT & NAVIGATION SYSTEM

### 3.1 Global Navigation Shell & MD3 Responsive Choreography

```text
┌──────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                              AMANAURA v3.0 MD3 NAVIGATION TOPOLOGY (ADR-UX-012)                          │
│                                                                                                          │
│  COMPACT (< 600px)             MEDIUM (600px - 839px)            EXPANDED (≥ 840px)                      │
│  ┌───────────────────────┐     ┌───────────────────────┐         ┌───────────────────────────────┐       │
│  │ [TopBar: Logo + User] │     │ [TopBar: Brand + User]│         │ [TopBar: Brand + School + User]│      │
│  ├───────────────────────┤     ├──────┬────────────────┤         ├───────────┬───────────────────┤       │
│  │                       │     │[Mini]│                │         │ [Sidebar] │ [Workspace Area]  │       │
│  │ [Hub-and-Spoke        │     │[Rail]│ [Workspace]    │         │ (w-64 or  │ (p-6 Centered)    │       │
│  │  Beranda Linimasa]    │     │[w-72]│ [max-w-lg]     │         │  w-18     │                   │       │
│  │                       │     │[Icons]│                │         │  Slide)   │                   │       │
│  │             [✦ FAB]   │     │      │                │         │           │                   │       │
│  │        [ ⌃ Chevron ]  │     └──────┴────────────────┘         └───────────┴───────────────────┘       │
│  └───────────────────────┘     (Navigation Rail 72px)            (Full Collapsible Sidebar)              │
└──────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```
*(Catatan: Topologi ini disempurnakan oleh ADR-UX-012 menggantikan model Omni-Bar dock mengambang pada COMPACT).*

### 3.2 Headbar (TopBar) — The Minimalist Horizon
* **COMPACT (`< 600px`)**:
  * **Kiri**: Logo `Building2` + `"Yapendik OS"`.
  * **Kanan**: Avatar Bulat Tunggal ber-badge `✦` (*Amanaura Breath*) + Indikator Offline Status.
  * 🛑 **Dilarang**: Menampilkan metadata berat (nama panjang, gelar, NPSN, tahun ajaran, dan status database mentah) di layar ponsel.
* **MEDIUM (`600px – 839px`)**:
  * Logo + Nama Brand + Avatar Pengguna. Dropdown Unit Sekolah disembunyikan di dalam Avatar/Profile Drawer untuk menghemat ruang horizontal.
* **EXPANDED (`≥ 840px`)**:
  * Logo + Nama Brand + Dropdown Unit Sekolah + Nama & Role Pengguna + Status DB.

### 3.3 Sidebar & Mini-Rail: The Adaptive Slide
* **EXPANDED (Full Sidebar)**:
  * Lebar normal `w-64 bg-surface border-r border-line`.
  * Tombol Collapse (`«`) mengecilkan sidebar menjadi `w-18` (hanya ikon monokrom) dengan animasi geser `AmanauraSpring`.
  * *(Cross-Reference: Lihat [PART IX: REFACTORING RULES & AUDIT PROTOCOL - Law 10](#part-ix-refactoring-rules--audit-protocol)).*
* **MEDIUM (Mini-Rail / Navigation Rail)**:
  * Sidebar otomatis bertransformasi menjadi **Mini-Rail** (`w-[72px]`) yang berlabuh di sisi kiri layar.
  * Hanya menampilkan ikon + tooltip melayang saat di-hover (jika modality `MOUSE`/`STYLUS`) atau saat tap-and-hold (jika modality `TOUCH`).
* **COMPACT (`< 600px`)**:
  * Sidebar lenyap dari viewport. Navigasi utama berpusat pada **Beranda Hub (Hub-and-Spoke)** dan menu sekunder diakses via **Slide-Up Bottom Chevron** (ADR-UX-012).

### 3.4 Mobile Slide-Up Chevron & Menu Navigasi (Hub-and-Spoke — ADR-UX-012)
* **COMPACT (`< 600px`)**:
  * **Hub-and-Spoke Invariant (G-1)**: Beranda adalah pusat komando utama. Alur harian mengalir kontekstual di Zona 2 (Linimasa Ritme Kelas). Akses ke spoke (Rencana Main, Presensi, Gema Hangat) dilakukan langsung 1-tap in-page.
  * **Gema Hangat Canonical Doctrine (WarmEchoCarousel)**: Gema Hangat pada Beranda Pendidik wajib dirender menggunakan komponen kanonikal `WarmEchoCarousel` (commit `f1f18fd`) yang selalu tampil terbuka penuh (*always open & prominently legible*) di seluruh fase sirkadian. Dilarang keras melipat atau menyembunyikan kutipan apresiasi orang tua.
  * **Horizon Handle (G-3)**: Hairline 1px (`line-soft`) melintasi layar yang terputus ±24px di tengah untuk ikon Lucide `ChevronUp` (`w-5 h-5`, `text-ink-faint`) tanpa teks label. Strip sentuh full-width `bottom-0` dengan tinggi `calc(env(safe-area-inset-bottom,0px)+48px)` (`min-h-[48px]`), `aria-label="Buka Menu Navigasi"`, tap & swipe-up gesture.
  * **Curated "MENU NAVIGASI" Sheet (G-2, G-4, G-5)**: Disentuh/swipe-up membuka sheet 4×2 squircle flat tiles dengan counter badge *brass* riil, search field di puncak sheet, dan animasi *Amanaura Spring* `{380,32,0.8}` (`max-h-[90dvh]`).
  * **Purnabakti FAB / Law of Single Primary Presence (G-6)**: FAB duplikat (*QuickCaptureFloatingButton*) dipurnabaktikan secara penuh dari seluruh tata letak guru. Aksi rekam momen tetap hidup via inline CTA linimasa sirkadian dan tile "Momen Belajar" di sheet navigasi.
* **MEDIUM (`600px – 839px`)**:
  * Menggunakan **Navigation Rail (`72px`)** di sisi kiri layar.
* **EXPANDED (`≥ 840px`)**:
  * Menggunakan **Full Collapsible Sidebar (`256px`)** dan TopBar global search.

### 3.5 The Container & Sectioning Doctrine

#### 🛑 Hukum 1: "The Screen is the Container" (Mobile Edge-to-Edge)
* Pada layar ponsel, **DILARANG** membuat kartu mengambang ber-margin (`m-4 p-4 rounded-2xl`).
* Latar belakang layar adalah kontainernya (`w-full bg-white`). Data mengalir bebas dari tepi kiri ke kanan dan hanya dipisahkan garis bawah tipis 1px (`border-b border-slate-100`).
* *(Cross-Reference: Lihat [PART IX: Law 1 & 2](#part-ix-refactoring-rules--audit-protocol)).*

#### 🛑 Hukum 2: "Max Depth = 1" (Haram Kotak Bersarang)
* Dilarang struktur: `Card > Card > Card`.
* Pemisahan sub-data dilakukan menggunakan tipografi, spasi (`gap-4`), atau garis `divide-y`, bukan kotak bertumpuk.

#### 📐 Hukum 3: The 3-Zone Card Anatomy & `divide-y`
Jika sebuah kontainer desktop memiliki beberapa seksi:
1. **Zona 1 (Header)**: `px-5 py-4 border-b border-slate-100` (Judul tebal + status badge).
2. **Zona 2 (Body)**: `p-5 space-y-4` (Konten & data utama).
3. **Zona 3 (Footer)**: `px-5 py-3 bg-slate-50/80 border-t border-slate-100` (Keterangan penutup / tombol ghost).
* **Gunakan `divide-y divide-slate-100`** pada kontainer utama untuk membagi seksi secara presisi 1px edge-to-edge.

#### 🛡️ Hukum 4: Workspace Tab Padding Parity (Unifikasi Kontainer Tab)
* Seluruh tab sub-halaman dalam satu workspace (seperti *Inbox* dan *Riwayat*) **wajib menggunakan wrapper padding yang identik**: `px-4 sm:px-5 md:px-0`.
* Dilarang keras mencampur tata letak *fluid edge-to-edge* di satu tab dengan *rigid boxed card padding* di tab sebelahnya.
* *(Cross-Reference: Lihat [PART IX: Law 10](#part-ix-refactoring-rules--audit-protocol)).*

#### 📏 Rumus Lengkungan Sudut (The Nested Radius Law)
$$\text{Radius Dalam} = \text{Radius Luar} - \text{Padding}$$
* Jika kotak luar `rounded-2xl` (16px) dengan `p-4` (16px), elemen dalam **wajib `rounded-lg` (8px)** atau `rounded-none`.

#### 📐 Grid Blowout Law (Anti-Overlap Invariant §3.5 Addendum)
* Kolom fraksional pada CSS Grid (`1fr`) memiliki default `min-width: auto`, yang memicu pembesaran tak terbatas (*grid blowout*) dan tabrakan antar-kolom jika konten internalnya melebar.
* **Kewajiban**: Seluruh grid kolom fraksional **wajib** menggunakan `minmax(0, 1fr)` (misal `large:grid-cols-[minmax(0,1fr)_380px]`). Pola kaku `/grid-cols-\[1fr/` dilarang keras dan ditegakkan permanen oleh CI Rule `R-GRID`.
* Elemen anak di dalam kolom utama wajib memiliki `min-w-0` dan grid container wajib memiliki `items-start`.

### 3.6 Radius & Bullet Doctrine (Disiplin Lengkungan & Titik Informasi)
* **Hierarki Lengkungan Sudut (Kanonikal 4-Tier)**:
  * **Kartu & Seksi (`rounded-card` / 16px)**: Wadah terluar kartu utama, panel dashboard, dan modal container.
  * **Tombol, Input, & Trigger (`rounded-field` / 12px)**: Elemen interaktif sentuhan, form input, searchable combobox, trigger sheet, dan CTA.
  * **Tile Dalam, Icon Box, & Item Segmented (`rounded-control` / 8px)**: Kotak ikon dekoratif, tile internal, dan selector mood/sub-opsi.
  * **Kapsul, Badge, Chip, FAB, & Omni-Bar (`rounded-pill` / 9999px)**: Label status, chip kehadiran, indikator jaringan offline, dan floating action button.
  * 🛑 **Dilarang**: Penggunaan arbitrary border radius `rounded-[..px]`. Ditegakkan permanen oleh CI Rule `R-RADIUS`.
* **Bullet & Dot Hygiene**:
  * Titik standalone dekoratif **dihapus** atau digantikan oleh status dot di dalam `<Badge>` atau indikator semantik yang memiliki makna operasional terukur.
  * Karakter pemisah `•` teks **hanya diizinkan untuk micro-summary satu baris** (mis. metadata kelas dan wali kelas).

### 3.7 Stacking & Responsive Action Doctrine (Restrukturisasi Aksi Beranda)
* **Klasifikasi Layout Responsif per Breakpoint**:
  * **COMPACT (`< 600px`)**:
    * Mengalir vertikal murni (*3-Tier Flow*): `[Ikon + Identitas Judul + Tanggal]` → `[Chip Kehadiran Full-Width]` → `[Aksi Grid 1-Kolom Full-Width]`.
    * Tombol aksi menggunakan lebar penuh (`w-full`), label utuh tanpa kompresi kata.
  * **MEDIUM (`600px – 839px`)**:
    * Tata letak berimbang (*2-Tier Balanced*): Baris 1 `[Identitas | Chip Kehadiran Kanan]`; Baris 2 `[Aksi Flex-Wrap Auto-Width]` dengan `gap-2`.
    * Tombol berukuran auto (`w-auto`), `Perhatian & Kesehatan` utuh tanpa truncate.
  * **EXPANDED / LARGE (`≥ 840px`)**:
    * Sebaris penuh (*Single Row Full Flow*): Kiri `[Identitas]` dan Kanan `[Chip Kehadiran + Tombol Aksi Lengkap]`.
* **Aturan Anti-Truncate Tombol Interaktif**:
  * 🛑 **Dilarang**: Memotong teks label aksi pada tombol dengan utility `truncate` atau `...`. Jika ruang viewport terbatas, teks wajib tetap utuh dan kontainer membungkus (*wrap*) ke baris berikutnya. Ditegakkan permanen oleh CI Rule `R-NO-TRUNCATE-BUTTON`.
* **Kartu Ritme Kelas (`OperatingStateIndicator`)**:
  * **Baris 1**: `[Icon Box]` + `[Eyebrow RITME KELAS + Badge Jam + Status Dot]`.
  * **Baris 2**: Judul & Deskripsi penuh `min-w-0 flex-1` dengan `line-clamp-2` (anti kata terbelah per baris).
  * **Baris 3**: Timeline chips waktu `flex flex-wrap` di Compact/Medium, berdampingan (*side-by-side*) di Large.

---

## PART IV: COMPONENT LIBRARY & LAWS

### 4.1 The 5 Button Laws & Hardware Debounce

```text
┌──────────────────┬─────────────────────────────────┬───────────────────────────────────────────┐
│ TIPE TOMBOL      │ STYLING AMANAURA                │ ATURAN PENGGUNAAN MUTLAK                  │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
│ 1. PRIMARY       │ bg-slate-900 text-white         │ • MAKSIMAL 1 PER LAYAR / FORM             │
│                  │ font-bold shadow-sm             │ • Aksi puncak penyelesaian alur kerja.    │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
│ 2. SECONDARY     │ bg-slate-100 text-slate-800     │ • Aksi alternatif (Batal, Filter, Unduh). │
│                  │ border border-slate-200         │                                           │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
│ 3. GHOST         │ bg-transparent text-slate-600   │ • STANDAR WAJIB DI DALAM LIST / BARIS DATA│
│                  │ hover:bg-slate-100              │ • Aksi per-murid (Ubah, Detail, Catat).   │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
│ 4. DANGER        │ bg-rose-50 text-rose-700        │ • Khusus aksi destruktif permanen         │
│                  │ border border-rose-200          │   (Hapus Siswa, Batalkan Semester).       │
├──────────────────┼─────────────────────────────────┼───────────────────────────────────────────┤
│ 5. ICON-ONLY     │ w-9 h-9 rounded-xl flex items-  │ • Aksi utilitas tanpa teks:               │
│                  │ center justify-center text-slate│   Tutup (✕), Cari (🔍), Refresh (🔄).     │
└──────────────────┴─────────────────────────────────┴───────────────────────────────────────────┘
```

* **Law 6: The Clean Single-Icon Action Rule (Zero Emoji Clutter)**:
  * Tombol aksi Amanaura hanya mengizinkan **tepat 1 ikon SVG Lucide** di sisi kiri label teks (proporsi `w-4 h-4` atau `w-3.5 h-3.5`).
  * **Dilarang keras menyematkan emoji Unicode** (seperti ⚡, ✅, 🏆, 🌱) di dalam string teks tombol.
  * *(Cross-Reference: Lihat [PART IX: Law 11](#part-ix-refactoring-rules--audit-protocol)).*
* **CTA Dominance di Mobile**: Tombol CTA utama wajib berukuran penuh (*Full-Width*) di layar mobile: `<Button className="w-full md:w-auto mt-3 md:mt-0">`.
  * *(Cross-Reference: Lihat [PART IX: Law 3](#part-ix-refactoring-rules--audit-protocol)).*
* **Anti-Jiggle Hardware Debounce**: Seluruh tombol secara otomatis mengunci klik ganda selama **300ms** dan menampilkan indikator loading mikro tanpa mengubah lebar fisik tombol (*Zero Width Jiggle*).
* **Modality-Aware Touch Targets**: 
  * Modality `TOUCH`: Minimum `48x48dp` (Material Design 3 standard).
  * Modality `STYLUS` / `MOUSE`: Minimum `32x32dp` diperbolehkan karena presisi kursor/pen.
  * *(Cross-Reference: Lihat [PART VII: 7.4 Input Modality Detection & S-Pen Ergonomics](#74-input-modality-detection--s-pen-ergonomics) & [7.8 Touch Targets & Samsung Ergonomics](#78-touch-targets--samsung-ergonomics)).*
* **Ergonomic Sizing & Touch Targets**: 
  * Seluruh tombol (kecuali `ICON-ONLY` yang menggunakan `w-9 h-9` / 36px khusus untuk modality Stylus/Mouse di area padat) wajib mematuhi aturan *Touch Target* minimum 48dp pada [PART VII: 7.8 Touch Targets & Samsung Ergonomics](#78-touch-targets--samsung-ergonomics).
  * Gunakan `min-h-[48px]` pada kontainer tombol untuk memastikan area sentuh yang aman.

### 4.2 Dropdown & Selection Taxonomy (The Threshold Rule)
* **$\le 4$ Pilihan**: 🛑 **HARAM DROPDOWN**. Wajib `<SegmentedControl>` (Pil horizontal 1-Tap).
* **5 s.d 15 Pilihan**: Wajib `<SelectSheet>` (Bottom Sheet picker di Mobile, popover di Desktop).
* **$> 15$ Pilihan**: Wajib `<SearchableCombobox>` (Dropdown dengan kolom pencarian instan 150ms debounce).
* **Menu Tambahan**: Wajib `<ActionMenu>` (Tombol 3-titik `⋮`).
* **Dropdown Geometri (Chevron Rata Kanan)**: Pembungkus select di mobile wajib `w-full flex justify-between items-center`.
  * *(Cross-Reference: Lihat [PART IX: Law 4](#part-ix-refactoring-rules--audit-protocol)).*

### 4.3 Modals, Sheets & Dialog Architecture

#### 4.3.1 The Golden Envelope Standard (Dimensi Kanonikal)
* **EXPANDED / LARGE (Desktop / Tablet Landscape)**: Menggunakan ukuran kanonikal terkunci `w-full max-w-5xl h-[85vh]` dengan `backdrop-blur-xs` dan listener tombol `ESC`.
* **COMPACT / MEDIUM (Mobile / Tablet Portrait)**: Otomatis berubah menjadi **Bottom Sheet Drawer** `w-full max-h-[90dvh] rounded-t-3xl border-t border-slate-200`. Penggunaan `dvh` (Dynamic Viewport Height) wajib diterapkan untuk mencegah sheet tertutup keyboard virtual Android.
* **Zero Layout Shift**: Tinggi modal terkunci stabil saat berpindah sub-tab untuk mengeliminasi lonjakan visual (*layout jiggle*).
* *(Cross-Reference: Lihat [PART VII: 7.9 Adaptive Modals, Sheets & Dialogs](#79-adaptive-modals-sheets--dialogs) & [PART IX: Law 8](#part-ix-refactoring-rules--audit-protocol)).*

#### 4.3.2 Pinned Action Anchor (Tombol Tutup Terkunci)
* Tombol Tutup (`✕`) **wajib dikunci di pojok kanan atas** (`shrink-0 ml-2`) dengan z-index terproteksi, sehingga tidak pernah turun ke bawah atau menabrak teks judul pada layar sempit.
* *(Cross-Reference: Lihat [PART IX: Law 8](#part-ix-refactoring-rules--audit-protocol)).*

#### 4.3.3 The 2-Tier Header & Matching-Pill Context Ribbon
Struktur tajuk modal wajib dipisahkan menjadi 2 tingkat teratur:
* **Tier 1 (Header Identitas Utama)**:
  * Ikon Avatar + *Eyebrow* tema (tanpa duplikasi ikon) + Judul Utama + Kapsul Nama Siswa + Kapsul NIS + Tombol `✕` Pinned.
* **Tier 2 (Dedicated Context Ribbon)**:
  * Pita pembatas terdedikasi (`bg-slate-50/60 border-b border-slate-100 py-2.5 px-4 sm:px-5`) memuat **dua kapsul serasi (*matching pills*)**:
    * Kapsul Kiri: `[ 📅 TA 2026/2027 • GANJIL • Kurikulum Merdeka TK ]`
    * Kapsul Kanan: `[ 📄 Draf Guru (Proposal) ]` / `[ 🏅 Kesiapan LPPA 100% ]`
  * Responsif: Terjustifikasi (*space-between*) di Desktop dan bertingkat rapi (*stacked*) di Ponsel.
* *(Cross-Reference: Lihat [PART IX: Law 9](#part-ix-refactoring-rules--audit-protocol)).*

#### 4.3.4 Mobile Anti-Stack Fatigue & Segmented Fluid Bar
* Di layar ponsel (`< md`), navigasi multi-dimensi/elemen wajib otomatis bertransformasi dari sidebar vertikal desktop menjadi **tab horizontal geser (*horizontal scrollable fluid pill bar*)** (`overflow-x-auto scrollbar-hide shrink-0`).
* *(Cross-Reference: Lihat [PART IX: Law 10](#part-ix-refactoring-rules--audit-protocol)).*

#### 4.3.5 Susunan Tombol Aksi
* **Desktop**: Rata Kanan (`[ Batal (Soft) ] [ Simpan (Solid) ]`).
* **Mobile**: Grid 2x2 atau tombol Aksi Utama Full-Width di atas tombol Batal teks ghost.
* **Dialog Bahaya**: Fokus default keyboard otomatis diarahkan ke tombol **Batal** demi keamanan data.

### 4.4 Index Pustaka Komponen Primitif (`src/components/ui/`)
Pustaka komponen tunggal yang dibangun untuk mewadahi seluruh hukum arsitektur Amanaura:

```text
src/components/ui/
 ├── Button.tsx              # The 5 Button Laws + Hardware Debounce
 ├── Badge.tsx               # Status Dot Capsule (●) & Monospace Data
 ├── Input.tsx               # Tactile forwardRef input + focus-within luminescent
 ├── ProgressBar.tsx         # Semantic progress indicator
 ├── ListItem.tsx            # Universal Edge-to-Edge Row
 ├── SegmentedControl.tsx    # Pill Toggle 1-Tap (≤4 pilihan)
 ├── SelectSheet.tsx         # Adaptive Bottom Sheet (5–15 pilihan)
 ├── SearchableCombobox.tsx  # Filterable combobox (>15 pilihan)
 ├── AdaptiveDialog.tsx      # Bunglon: Bottom Sheet ↔ Center Modal
 ├── AutoResizeTextarea.tsx  # Form observasi fluid
 ├── Skeleton.tsx            # Balok memuat berdenyut halus (Anti-Spinner) ← BARU
 ├── ToastHUD.tsx            # Notifikasi mengambang + 5-Second Undo
 ├── AvatarChild.tsx         # Deterministic Pastel & Symbol Privacy
 └── WarmEchoCarousel.tsx    # Gema Hangat: karusel kutipan ber-consent + Heart Reaction (Suite 31 M2/M4)

src/hooks/
 ├── useTheme.ts             # Theme switcher (Frangipani Day ↔ Night Temple)
 ├── useInputModality.ts     # Deteksi modality input (Touch/Stylus/Mouse/KB) ← BARU
 └── useOfflineStatus.ts     # Deteksi status koneksi & queue length ← BARU
```

#### DEFERRED — Living Contract v2
> Komponen & hook berikut didokumentasikan dalam Amanaura v3.0-RELEASE
> namun **DITANGGUHKAN (DEFERRED)** ke implementasi masa depan karena
> tidak dibutuhkan oleh Halaman Percontohan v1:
>
> **Primitives:**
> - `PedagogicalRatingPill.tsx` (BB/MB/BSH/BSB 1-Tap PAUD)
> - `FocusCanvas.tsx` (Grafik peta layar penuh)
> - `Lightbox.tsx` (Foto karya seni + Pinch-Zoom)
> - `TermExplainer.tsx` (Ikon ⓘ penjelas istilah)
> - `SplitPaneWorkspace.tsx` (Master-Detail layout engine)
>
> **Hooks:**
> - `useInstallPrompt.ts` (PWA beforeinstallprompt capture)
>
> **Services:**
> - `offlineQueue.ts` (IndexedDB Mutation Queue I/O)
>
> Status: Akan dibangun saat fitur PWA & interaksi lanjutan diaktifkan.

### 4.5 The Warm Echo Carousel Doctrine (Gema Hangat)
Definisi: Karusel kutipan refleksi orang tua/pendidik yang memanusiakan briefing — kehangatan yang disegel tipografis, bukan metrik.

Anatomi Kanonikal:
1. Grand Quote Mark   : glyph “ Instrument Serif, accent-valor, aria-hidden, kiri-atas.
2. Quote Body         : font-serif italic, line-clamp-3, tap untuk mekar (Zero-CLS).
3. Author Avatar Pill : inisial 2-huruf, pastel deterministik (Signature #5).
4. Attribution Row    : nama (font-semibold) • "Kelas TK X" (ink-faint) •
                        kanan: Heart Reaction + Topic Tag — ikon Lucide Heart
                        bertoken, BUKAN emoji (Law 11).
5. Navigation Chevrons: ghost ‹ › (Lucide), hit-area ≥48dp, swipe pada TOUCH,
                        Auto-Center Snap; lenyap bila echo ≤ 1.
6. Luminous Heart Pop : reaksi personal satu-ketukan, fisika Amanaura Spring;
                        tanpa agregat/leaderboard (H-07).

Hukum:
- No-Autoplay: rotasi hanya manual (Calm & Dignified).
- Universal Availability: dirender pada PRATINJAU, OPERASIONAL, PENUTUP.
- Privacy: kutipan ber-consent orang tua; zero PII anak (FB-01).
- Empty State: "Belum ada gema hangat hari ini." + onboarding sopan.

---

## PART V: INTERACTION & MOTION DESIGN

### 5.1 Horizontal & Vertical Navigation Patterns

#### 5.1.1 Horizontal Overflow Tabs
1. **Ambient Edge Fade Shader**: Gradasi pudar di tepi kanan (`mask-image`) sebagai sinyal intuitif bahwa tab dapat digeser.
2. **Micro-Morphing Dots**: Titik indikator di bawah tab yang berubah menjadi pil lonjong (`w-4 h-1 bg-slate-900`) mengikuti tab aktif.
3. **Auto-Center Snap**: Mengetuk tab otomatis menggeser tab tersebut ke tengah layar (`inline: 'center'`).

#### 5.1.2 Vertical Pagination
1. **Soft Load More Pill**: Tombol kapsul lembut di bawah daftar (`[ ↓ Tampilkan 10 Siswa Lainnya • 17/45 ]`) menggantikan penomoran halaman kuno `[1] [2] [3]`.
2. **Timeline Stepper**: Garis vertikal 2px dengan titik status (`● Selesai`, `● Sedang Aktif`, `○ Menunggu`).
3. **Floating Position HUD**: Pil mengambang semi-transparan `[ 25 / 150 Data ]` saat scrolling cepat.

### 5.2 The Navigation & Back Doctrine
1. **Posisi Tunggal**: Tombol Back selalu berupa lingkaran kecil di kiri atas (`ArrowLeft` `w-8 h-8 rounded-full bg-slate-100`).
2. **Hierarchical Determinism**: Back selalu kembali ke halaman induk data (*Parent Page*), bukan riwayat acak browser `history.back()`.
3. **Auto-Draft Shield**: Setiap ketikan form otomatis tersimpan di `localStorage`. Jika pengguna keluar tanpa sengaja, data ketikan tetap utuh saat kembali.
4. **Mobile Gestures & OS Conflict Resolution**: 
   * Menutup laci/form dapat dilakukan dengan menggeser jempol ke bawah (*Swipe Down to Dismiss*).
   * Untuk navigasi *Back*, sistem menghormati gestur bawaan Android (*Edge Swipe*). Komponen UI carousel/drawer wajib menghormati **24dp Edge Exclusion Zone** agar tidak membajak gestur *Back* OS (lihat [PART VII: 7.10.1](#7101-native-android-gesture-conflict-resolution)).

### 5.3 Advanced Media, Charts & Hover Ergonomics
1. **`<FocusCanvas>`**: Grafik padat (Heatmap/Statistik) memiliki tombol `Maximize2` untuk mekar menjadi kanvas layar penuh yang mendukung *pan & snap-to-touch tooltip*.
2. **`<Lightbox>`**: Foto karya seni anak terkunci pada rasio `aspect-4/3` atau `aspect-square`, dapat disentuh untuk *Pinch-to-Zoom* layar penuh.
3. **Hover Isolation & Modality Awareness**:
   * Efek `:hover` **HANYA AKTIF** jika `@media (hover: hover)` dan modality adalah `MOUSE` atau `STYLUS`.
   * Pada modality `TOUCH` (jari), interaksi beralih murni ke **`:active` (Tactile Compression `scale(0.98)`)** untuk melenyapkan *bug sticky hover*.
   * Pada modality `KEYBOARD`, interaksi bergantung pada **`:focus` (Luminescent Edge)**.
   * *(Cross-Reference: Lihat [PART VII: 7.4 Input Modality Detection & S-Pen Ergonomics](#74-input-modality-detection--s-pen-ergonomics)).*
4. **Sticky Freeze First Column**: Tabel data multi-kolom di mobile mengunci kolom Nama Siswa di sisi kiri (`sticky left-0 shadow-sm`), sementara kolom nilai lainnya dapat digeser bebas ke kanan.

### 5.4 The 7 Invisible Masteries (Micro-Engineering Perfection)
1. **Anti-Jiggle Debounce**: Perlindungan dobel-klik 300ms tanpa perubahan lebar layout.
2. **Zero Cumulative Layout Shift (Zero-CLS)**: Dimensi minimum terkunci (`min-h-[48px]`), layar tidak pernah melompat 1px pun saat data selesai dimuat.
3. **Silent Ghost Recovery**: Listener `document.visibilityState` yang secara otomatis menyegarkan sesi Supabase saat HP dibuka kembali setelah berjam-jam tanpa memutus ketikan form.
4. **Senior Eye Elasticity**: Penataan tipografi menggunakan unit relatif `rem/em` yang otomatis mekar harmonis jika font HP diatur "Ekstra Besar" oleh guru senior.
5. **Silent Exponential Retry & Background Sync**: Percobaan ulang koneksi dan sinkronisasi *Mutation Queue* otomatis di latar belakang (1s, 2s, 4s) oleh Service Worker saat sinyal Wi-Fi terputus sesaat, tanpa memunculkan layar error merah atau memutus ketikan form.
6. **Emotional Affirmation & 432Hz Sound**: Ucapan penutup hari yang menenangkan dan denting akustik harmonis 432Hz saat seluruh tugas kelas tuntas.
7. **Dynamic Viewport Harmony (`dvh`)**: Penggunaan unit `dvh` (Dynamic Viewport Height) alih-alih `vh` statis untuk mengeliminasi *layout jump* saat keyboard Android muncul, atau saat aplikasi berada dalam mode Split-Screen/Multi-Window.

---

## PART VI: CONTENT & COPYWRITING DOCTRINE

### 6.1 Batas Kata & Kosakata Baku (Word Limits & Vocabulary)
1. **Judul Halaman / Seksi**: **Maksimal 2 Kata** (Max 16 Karakter).
   * *Contoh*: `"Beranda Kelas"`, `"Meja PPDB"`, `"Statistik Unit"`, `"Adopsi Kebijakan"`.
2. **Sub-Judul**: **Maksimal 10 Kata** (1 Kalimat Manfaat) dan **disembunyikan di layar HP** (`hidden md:block`).
3. **Teks Tombol**: **Maksimal 2-3 Kata** (Kata Kerja Aktif).
4. **Kamus Kata Kerja Baku**:
   * Simpan • Batal • Hapus • Ubah • Tambah [Objek] • Unduh [Format] • Masuk • Kirim • Rekomendasikan • Tetapkan.
5. **Data Panjang Dinamis**: Wajib dilindungi dengan utility `truncate` (1 baris) atau `line-clamp-2` (2 baris).
6. **Anti-Crush Flex**: Hindari `flex-row` kaku pada judul panjang + badge; gunakan susunan vertikal `flex flex-col items-start gap-1.5 min-w-0 pr-4`.
   * *(Cross-Reference: Lihat [PART IX: Law 5](#part-ix-refactoring-rules--audit-protocol)).*

### 6.2 Standar Kelembagaan TK & Kamus Pedagogis Anti-Jargon
* **Standar Nomenklatur Lembaga**: Seluruh unit wajib menggunakan istilah **`TK`** (*Kurikulum Merdeka TK*, *TK Yapendik*), dilarang melakukan generalisasi kata `PAUD`.
* **Pembersihan Jargon Developer ke Bahasa Pendidik**:
  * `Fast Capture` $\rightarrow$ **`Rekam Momen Belajar`**
  * `(One Child)` $\rightarrow$ **`Buka Rekam Jejak`**
  * `(Otoritas Mutlak)` $\rightarrow$ **`Catatan & Arahan Guru Kelas`**
  * `Non-Authoritative Proposal` $\rightarrow$ **`Rekomendasi Rencana Stimulasi Bermain`**
  * `Scaffolding Strategy` $\rightarrow$ **`Pendampingan Guru (Scaffolding)`**
  * `Prompt Kemitraan Rumah` $\rightarrow$ **`Saran untuk Orang Tua di Rumah`**
  * *Dilarang keras*: Menampilkan durasi mekanis (`<15 dtk`) atau ID mentah database (`lppa_pub_baseline_...`, `PROPOSED`) di antarmuka guru.
* *(Cross-Reference: Lihat [PART IX: Law 12](#part-ix-refactoring-rules--audit-protocol)).*

### 6.3 Filter & Query Architecture (The 3 Tiers)
1. **Tier 1 (Inline Quick Chips)**: 2–5 kategori, tanpa tombol "Terapkan", menyaring instan 0ms.
2. **Tier 2 (Search Omni-Filter)**: Input teks debounced 150ms dengan tombol `[ ✕ ]` reset instan.
3. **Tier 3 (Multi-Attribute Sheet)**: Filter kompleks dengan pemicu `[ ⚡ Filter (2) ]`, membuka Bottom Sheet dengan tombol `[ Terapkan ]` dan `[ Reset ]`.
4. **Perisai Transparansi**: Selalu menampilkan badge chip filter aktif `[ TK A ✕ ]` dan pesan *Empty State* yang menyediakan tombol pemulihan `[ 🔄 Reset Filter ]`.
5. **Smart Chip Symmetry**: Pilihan chip geser wajib menggunakan container `w-full justify-center` agar melayang seimbang bagaikan *floating island*.
   * *(Cross-Reference: Lihat [PART IX: Law 6](#part-ix-refactoring-rules--audit-protocol)).*

### 6.4 Instant Information & Progressive Guidance
1. **The 3-Second Micro-Summary**: Header ringkasan instan di atas daftar (`👥 17 Murid • 🟢 15 Hadir • ⚠️ 1 Alergi`).
2. **Polite Dismissible Coachmarks**: Kartu petunjuk pengguna baru dengan tombol `[ Mengerti ✕ ]` yang hilang selamanya setelah ditutup.
3. **1-Tap Term Explainer (`ⓘ`)**: Ikon mikro di samping istilah teknis yang memunculkan popover/sheet penjelasan 1 kalimat.
4. **Interactive Onboarding Empty States**: Layar data kosong otomatis berubah menjadi checklist 3 langkah awal.
5. **Gema Hangat → §4.5**: Kutipan refleksi & afirmasi harian ber-consent (lihat [PART IV §4.5 The Warm Echo Carousel Doctrine](#45-the-warm-echo-carousel-doctrine-gema-hangat)).

---

## PART VII: TABLET ANDROID EXTENSION (MD3 & SAMSUNG GALAXY TAB)

### 7.1 MD3 Window Size Classes Breakpoint System

#### Architectural Decision Record
* **ADR-UX-001**: Evolusi dari binary breakpoint (`< 1024px` / `≥ 1024px`) ke **Material Design 3 (MD3) Window Size Classes**.
* **Status**: **RATIFIED** (Disahkan oleh Project Owner pada `2026-08-28`).
* **Dampak**: Menata ulang seluruh perilaku responsif tata letak Amanaura menjadi tiga kelas dinamis.

#### MD3 Window Size Classes Definition
Amanaura v2.0 mengadopsi Material Design 3 Window Size Classes sebagai sistem breakpoint kanonikal:

| Size Class | CSS Pixels (dp) | Typical Devices | Layout Strategy |
|:---|:---|:---|:---|
| **COMPACT** | `< 600px` | Phone portrait, Tab A9 portrait | Edge-to-edge, bottom nav, single column |
| **MEDIUM** | `600px – 839px` | Tablet portrait (Tab S9, A9+), foldable | Adaptive single/dual column, collapsible rail |
| **EXPANDED** | `≥ 840px` | Tablet landscape (Tab S9+), desktop, DeX | Sidebar + workspace, multi-column, master-detail |

#### Tailwind CSS Integration (Tailwind v4 `@theme`)
```css
/* AMANAURA v2.0 — MD3 Aligned Breakpoints */
@theme {
  --breakpoint-compact:  0px;      /* 0 – 599px   */
  --breakpoint-medium:   600px;    /* 600 – 839px */
  --breakpoint-expanded: 840px;    /* 840px+      */
  --breakpoint-large:    1200px;   /* DeX external */
  --breakpoint-xl:       1600px;   /* Multi-monitor */
}
```

#### Migration dari Binary Breakpoint ke MD3
| Amanaura v1.0 Rule | v1.0 Breakpoint | v2.0 MD3 Equivalent |
|:---|:---|:---|
| Edge-to-Edge List | `< 1024px` | COMPACT + MEDIUM |
| Full-width CTA | `< 1024px` | COMPACT + MEDIUM |
| Bottom Sheet Modal | `< 1024px` | COMPACT + MEDIUM |
| Desktop Sidebar | `≥ 1024px` | EXPANDED |
| Center Modal (max-w-5xl) | `≥ 1024px` | EXPANDED |
| Hover Effects | `@media (hover: hover)` | Tidak berubah (input-based, bukan size-based) |

#### Layout Behavior per Size Class

**1. COMPACT (`< 600px`)**
* Navigation: Bottom Smart Chips + Omni-Bar
* Content: Edge-to-edge, single column
* CTA: Full-width
* Modal: Bottom Sheet (90vh)
* List: `divide-y`, no cards
* Padding: `px-4`

**2. MEDIUM (`600px – 839px`)**
* Navigation: Collapsible mini-rail (`w-[72px]`) atau bottom nav
* Content: Edge-to-edge dengan `max-w-lg mx-auto` untuk kenyamanan membaca
* CTA: Full-width dengan `max-w-md mx-auto`
* Modal: Bottom Sheet (85vh) atau center modal (`max-w-2xl`)
* List: `divide-y`, opsional 2-column grid untuk data cards
* Padding: `px-5`

**3. EXPANDED (`≥ 840px`)**
* Navigation: Full sidebar (`w-64`) collapsible
* Content: Contained workspace (`max-w-7xl mx-auto`)
* CTA: Auto-width, right-aligned
* Modal: Center modal (`max-w-5xl h-[85vh]`)
* List: Table view atau multi-column grid
* Padding: `px-6`
* Master-Detail: Supported (lihat [Section 7.6 Master-Detail & Split-Pane Workspace Patterns](#76-master-detail--split-pane-workspace-patterns))

**4. LARGE (`≥ 1200px`) — DeX External Monitor**
* Navigation: Full sidebar + opsional secondary panel
* Content: Multi-column workspace
* Master-Detail: Three-pane supported
* Windowing: DeX freeform windows

---

### 7.2 Samsung Galaxy Tab Device Matrix

#### Target Device Specifications

| Device | Screen | Physical Res | CSS Viewport (P) | CSS Viewport (L) | MD3 (P) | MD3 (L) | DeX | S-Pen |
|:---|:---|:---|:---|:---|:---:|:---:|:---:|:---:|
| **Tab A9** | 8.7" | 1340×800 | ~533×800 | ~800×533 | COMPACT | MEDIUM | ❌ | ❌ |
| **Tab A9+** | 11" | 1920×1200 | ~600×960 | ~960×600 | MEDIUM | EXPANDED | ❌ | ❌ |
| **Tab S9 FE** | 10.9" | 2304×1440 | ~720×1152 | ~1152×720 | MEDIUM | EXPANDED | ✅ | ✅ |
| **Tab S9** | 11" | 2560×1600 | ~800×1280 | ~1280×800 | MEDIUM | EXPANDED | ✅ | ✅ |
| **Tab S9+** | 12.4" | 2800×1752 | ~875×1400 | ~1400×875 | EXPANDED | EXPANDED | ✅ | ✅ |
| **Tab S9 Ultra** | 14.6" | 2960×1848 | ~924×1480 | ~1480×924 | EXPANDED | EXPANDED | ✅ | ✅ |
| **Tab S10+** | 12.4" | 2800×1752 | ~875×1400 | ~1400×875 | EXPANDED | EXPANDED | ✅ | ✅ |
| **Tab S10 Ultra** | 14.6" | 2960×1848 | ~924×1480 | ~1480×924 | EXPANDED | EXPANDED | ✅ | ✅ |

> ⚠️ **Catatan:** CSS viewport dihitung berdasarkan `devicePixelRatio` tipikal (~2.0 untuk S series, ~1.5–2.0 untuk A series). Nilai aktual bervariasi per perangkat dan browser.

#### Samsung DeX Mode Behavior
Saat mode Samsung DeX aktif pada Galaxy Tab:

1. **Windowing System**:
   * Aplikasi berjalan dalam resizable window bebas.
   * Window size class dapat berubah secara **DINAMIS** saat pengguna meresize ukuran jendela.
   * Tata letak wajib bertransisi secara mulus (*graceful*) tanpa kehilangan state.
2. **Persistent Taskbar**:
   * Taskbar sistem berada di sisi bawah layar, mengurangi tinggi efektif viewport ~48-56px.
   * Kompensasi dilakukan dengan `env(safe-area-inset-bottom)`.
3. **Input Modality Switch**:
   * Modality beralih dari sentuhan murni (*touch*) ke kursor presisi mouse/trackpad dan keyboard fisik.
   * Efek hover menjadi aktif dan navigasi keyboard terstruktur menjadi wajib.
4. **External Monitor Environment**:
   * Resolusi eksternal dapat mencapai 1920px+ (Full HD / 4K).
   * Breakpoint `LARGE` (`≥ 1200px`) aktif dengan tata letak multi-panel.

#### Target Browser & PWA Host Environment

Google Chrome for Android adalah browser referensi primer untuk pengembangan dan pengujian PWA Yapendik OS:
* **Primary Reference**: **Google Chrome for Android** (Standard Chromium Web Platform).
* **Emulation & Testing**: Chrome DevTools Device Emulation (dengan preset dimensi Samsung Galaxy Tab matrix).
* **PWA Support**: Dukungan penuh Web App Manifest, Service Worker caching, and standard Web APK / PWA install prompts.
* **Gesture Navigation**: Penanganan native Android OS Gesture Navigation (Edge swipe back/forward) tanpa benturan dengan gestur UI drawer.
* **Samsung Internet Compatibility**: Perilaku rendering dan viewport 100% konsisten berkat engine Chromium bersama.
* **DeX Windowing**: PWA berjalan sebagai jendela mandiri (*standalone window frame*) berkinerja tinggi di dalam Samsung DeX.

---

### 7.3 Breakpoint Transition & State Preservation

#### Golden Rule: State Preservation Across Size Class Changes
Saat viewport berubah yang memicu transisi size class (misal: `MEDIUM` $\rightarrow$ `EXPANDED` saat memutar tablet dari portrait ke landscape, atau saat resize window di DeX):

1. **SCROLL POSITION**: Wajib dipelihara (*Preserve*). Dilarang mereset posisi scroll ke puncak layar (0px).
2. **FORM DATA**: Wajib dipelihara (*Preserve*). Dilarang membersihkan atau mengosongkan draf ketikan input form.
3. **OPEN/CLOSED STATES**: Wajib dipelihara (*Preserve*). Modal yang terbuka tetap terbuka (namun bertransformasi wujud: Bottom Sheet $\leftrightarrow$ Center Modal).
4. **NAVIGATION STATE**: Wajib dipelihara (*Preserve*). Tab aktif dan status sidebar tetap utuh.
5. **ANIMATION**: Lewati animasi transisi (*Skip transition animation*) saat pergantian breakpoint demi mengeliminasi *layout shift jiggle*.

#### Resize Handling Implementation Pattern
```typescript
// Debounced resize handler (150ms per Amanaura debounce philosophy)
const DEBOUNCE_MS = 150;

// Size class detection
type SizeClass = 'COMPACT' | 'MEDIUM' | 'EXPANDED';

function getSizeClass(width: number): SizeClass {
  if (width < 600) return 'COMPACT';
  if (width < 840) return 'MEDIUM';
  return 'EXPANDED';
}

// Transition handler
function handleSizeClassChange(
  from: SizeClass, 
  to: SizeClass
): void {
  // 1. Preserve all state
  preserveScrollPosition();
  preserveFormState();
  preserveNavigationState();
  
  // 2. Transform layout components
  transformComponents(from, to);
  
  // 3. Skip animation (instant layout switch)
}
```

#### DeX Window Resize
Di lingkungan Samsung DeX, jendela aplikasi dapat diubah ukurannya secara bebas oleh pengguna:
* Gunakan `ResizeObserver` pada kontainer utama.
* Terapkan debounce 150ms untuk mencegah re-render berlebihan.
* Pertahankan seluruh state formulir dan navigasi selama proses resize.
* Dilarang menampilkan spinner loading di tengah interaksi resize window.

---

### 7.4 Input Modality Detection & S-Pen Ergonomics

#### The Modality Paradigm
Tablet Android (khususnya Samsung Galaxy Tab) adalah perangkat *hybrid*. 
Satu perangkat fisik dapat menerima input dari 4 modality berbeda secara bergantian:
1. **TOUCH**: Jari tangan (Coarse pointer, no hover).
2. **STYLUS**: S-Pen (Fine pointer, hover capable, pressure sensitive).
3. **MOUSE**: Bluetooth mouse / Trackpad / DeX mouse (Fine pointer, hover capable).
4. **KEYBOARD**: Keyboard case / DeX keyboard (No pointer, focus-based navigation).

Amanaura v2.0 **TIDAK** menggunakan breakpoint layar untuk menentukan interaksi. 
Amanaura menggunakan **Input Modality Detection** untuk menentukan *behavior* komponen.

#### CSS Media Queries for Modality
```css
/* Touch-first (Coarse) */
@media (pointer: coarse) {
  /* Touch targets min 48x48dp, active states, no hover */
}

/* Mouse / Stylus (Fine) */
@media (pointer: fine) {
  /* Hover states, smaller touch targets allowed, cursor pointers */
}

/* Hover capability */
@media (hover: hover) {
  /* :hover effects enabled */
}
@media (hover: none) {
  /* :hover effects disabled, rely on :active and :focus */
}
```

#### React Hook Specification: `useInputModality()`
```typescript
type InputModality = 'TOUCH' | 'STYLUS' | 'MOUSE' | 'KEYBOARD';

// Hook untuk mendeteksi modality secara real-time
function useInputModality(): InputModality {
  // 1. Base detection via CSS Media Queries
  // 2. Override via PointerEvent.pointerType ('touch', 'pen', 'mouse')
  // 3. Override via KeyboardEvent (Tab, Arrow keys)
  // Returns the currently active modality
}
```

#### Samsung S-Pen Specific Ergonomics
1. **Hover Preview**: Saat S-Pen melayang di atas elemen (`pointerType === 'pen'` + `hover`), tampilkan *tooltip* atau *preview* (misal: preview foto siswa, preview detail observasi).
2. **Palm Rejection**: Browser menangani ini secara native. Amanaura wajib **TIDAK** menggunakan `touch-action: none` secara global yang dapat merusak palm rejection.
3. **Precision Targets**: Saat modality = `STYLUS`, touch target minimum bisa diperkecil dari 48dp menjadi 32dp karena presisi S-Pen.
4. **Air Command (Future)**: Placeholder untuk integrasi S-Pen button (saat ini belum didukung web API secara luas, catat sebagai *Progressive Enhancement*).

#### DeX Keyboard Navigation
Saat di Samsung DeX dengan keyboard fisik:
1. **Focus Management**: Setiap elemen interaktif wajib memiliki *focus state* yang jelas menggunakan **Amanaura Signature #2: The Luminescent Edge** (`box-shadow: 0 0 0 1.5px #0F172A, 0 0 20px -4px rgba(245, 158, 11, 0.18)`).
2. **Logical Tab Order**: Urutan `tabIndex` wajib mengikuti alur baca natural (kiri-kanan, atas-bawah).
3. **Keyboard Shortcuts**:
   - `Esc`: Menutup Modal / Bottom Sheet / Drawer.
   - `Enter`: Submit Form / Trigger Primary CTA.
   - `Arrow Keys`: Navigasi di dalam Dropdown / Segmented Control.

---

### 7.5 Adaptive Navigation Shell Choreography

#### The Navigation Transformation Matrix
Saat terjadi transisi *Size Class* (misal: memutar tablet dari Portrait `MEDIUM` ke Landscape `EXPANDED`), Navigation Shell wajib bertransformasi mengikuti matriks ini tanpa kehilangan state (mengacu pada [Section 7.3 State Preservation](#73-breakpoint-transition--state-preservation)):

| From \ To | COMPACT | MEDIUM | EXPANDED |
|:---|:---|:---|:---|
| **COMPACT** | - | Omni-Bar $\rightarrow$ Mini-Rail (Fade & Slide Left) | Omni-Bar $\rightarrow$ Full Sidebar (Expand) |
| **MEDIUM** | Mini-Rail $\rightarrow$ Omni-Bar (Slide Down) | - | Mini-Rail $\rightarrow$ Full Sidebar (Width expand `72px` $\rightarrow$ `256px`) |
| **EXPANDED** | Full Sidebar $\rightarrow$ Omni-Bar (Collapse & Slide) | Full Sidebar $\rightarrow$ Mini-Rail (Width collapse `256px` $\rightarrow$ `72px`) | - |

#### Mini-Rail (`w-[72px]`) Ergonomics for Tablet Portrait
1. **Touch Modality**: Tap pada ikon Mini-Rail langsung menavigasi atau membuka *Tooltip Popover* kecil di sisi kanan ikon selama 2 detik.
2. **Stylus/Mouse Modality**: Hover pada ikon menampilkan *Tooltip* yang persisten selama kursor berada di atasnya.
3. **Active State**: Ikon yang aktif ditandai dengan **Signature #2: Luminescent Edge** di sisi kiri rail (garis vertikal 3px `bg-amber-500`).

#### DeX Windowing Navigation Rules
Di lingkungan Samsung DeX, aplikasi bisa di-resize dari ukuran `COMPACT` hingga `LARGE` secara dinamis:
1. **Fluid Transition**: Gunakan CSS `transition-[width] duration-300` dengan fisika `AmanauraSpring` untuk animasi Sidebar $\leftrightarrow$ Mini-Rail.
2. **Threshold Hysteresis**: Untuk mencegah *flickering* (berkedip) saat user menggeser border window di batas `839px` $\leftrightarrow$ `840px`, tambahkan *hysteresis buffer* 20px pada JavaScript resize observer sebelum memicu transformasi layout.

---

### 7.6 Master-Detail & Split-Pane Workspace Patterns

#### The Split-Pane Paradigm
Pada size class `EXPANDED` ($\ge 840\text{px}$) dan `LARGE` ($\ge 1200\text{px}$), Amanaura v2.0 mengadopsi pola **Master-Detail Split-Pane** untuk alur kerja yang memerlukan inspeksi data beruntun (misal: Guru meninjau daftar siswa satu per satu untuk observasi kelas, atau Kepala Sekolah meninjau inbox adopsi kebijakan).

Pola ini menghilangkan kelelahan navigasi (*navigation fatigue*) akibat siklus *click $\rightarrow$ back $\rightarrow$ click* yang berulang.

#### Anatomy of a Split-Pane Workspace
```text
┌────────────────────────────────────────────────────────────────────────┐
│ [TopBar: Brand + School + User Profile]                                │
├──────────────┬─────────────────────────────────────────────────────────┤
│              │                                                         │
│   MASTER     │                     DETAIL VIEW                         │
│   LIST       │                                                         │
│  (w-1/3 or   │  [Tier 1: Header Identitas & Pinned Action Anchor]      │
│   w-[320px]) │  [Tier 2: Matching-Pill Context Ribbon]                 │
│              │                                                         │
│ • Siswa A    │  [Zona 2: Body / Konten Utama / Form Observasi]         │
│ • Siswa B  <--│                                                         │
│ • Siswa C    │                                                         │
│              │                                                         │
│              │  [Zona 3: Footer / CTA Dominance]                       │
├──────────────┴─────────────────────────────────────────────────────────┤
```

#### Layout Rules & Proportions
1. **Master Pane (Kiri)**:
   * Lebar default: `w-1/3` atau *fixed* `w-[320px]` dengan *min-width* `280px`.
   * Berisi *Edge-to-Edge List* (Hukum 1) dengan *Sticky Freeze First Column* jika diperlukan.
   * Item yang sedang aktif dipilih ditandai dengan background `bg-slate-100` dan **Signature #2: Luminescent Edge** di sisi kiri item.
2. **Detail Pane (Kanan)**:
   * Mengisi sisa ruang (`flex-1`).
   * Menggunakan *Contained Workspace* (Hukum 3: 3-Zone Card Anatomy) dengan padding `p-6`.
   * Scrollable secara independen dari Master Pane (`overflow-y-auto`).
3. **Resizable Divider (Opsional untuk DeX / LARGE)**:
   * Pada breakpoint `LARGE` ($\ge 1200\text{px}$), pembatas antara Master dan Detail dapat digeser (*drag-to-resize*) dengan *snap points* pada 25%, 33%, dan 50%.

#### Responsive Fallback (COMPACT & MEDIUM)
Split-Pane **TIDAK AKTIF** pada size class `COMPACT` dan `MEDIUM`. Sistem wajib melakukan *graceful degradation*:
* **MEDIUM (Tablet Portrait)**: Master List ditampilkan penuh. Saat item di-tap, Detail View muncul sebagai **Bottom Sheet (85vh)** atau *push navigation* tergantung hierarki data.
* **COMPACT (Phone)**: Master List ditampilkan penuh. Saat item di-tap, Detail View melakukan *push navigation* (Hierarchical Determinism) ke halaman baru.

#### The "Empty State" Detail Pane
Saat tidak ada item yang dipilih di Master List (misal: baru pertama kali membuka halaman di Desktop/DeX):
* Detail Pane menampilkan **Interactive Onboarding Empty State** (lihat [Part VI §6.4 Instant Information & Progressive Guidance](#64-instant-information--progressive-guidance)).
* Visual: Ilustrasi minimalis + teks *"Pilih salah satu [Siswa/Dokumen] dari daftar di samping untuk melihat detailnya."*
* 🛑 **DILARANG** memaksa seleksi item pertama secara otomatis (*auto-select first item*) tanpa interaksi sadar pengguna, guna mencegah perubahan/aksi tidak sengaja pada formulir sensitif.

#### State Preservation Across Breakpoints
Mengacu pada [Section 7.3 State Preservation](#73-breakpoint-transition--state-preservation):
* Jika pengguna memilih "Siswa B" di `EXPANDED` (Split-Pane), lalu memutar tablet ke Portrait (`MEDIUM`), "Siswa B" **TETAP TERPILIH** dan Detail View-nya otomatis bertransformasi menjadi Bottom Sheet yang terbuka.
* Jika pengguna menutup Bottom Sheet di Portrait, lalu memutar kembali ke Landscape (`EXPANDED`), Detail Pane kembali ke *Empty State* (seleksi dibatalkan untuk mencegah ketidakselarasan visual).

---

### 7.7 Orientation, Multi-Window & DeX Handling

#### 7.7.1 Orientation Change Handling
Secara default, Amanaura v2.0 mendukung orientasi dinamis (`orientation: any`) mengikuti sensor perangkat. Namun, terdapat pengecualian kontekstual:
1. **Task-Specific Locks**: Saat pengguna berada di dalam alur kerja yang memerlukan fokus visual atau kamera (misal: `<Lightbox>` untuk meninjau foto karya seni anak, atau `<CameraCapture>` untuk observasi), sistem wajib mengunci orientasi (*orientation lock*) atau memaksa layout Landscape menggunakan CSS `@media (orientation: landscape)` untuk memaksimalkan ruang kerja.
2. **Rotation State Preservation**: Mengacu pada [Section 7.3 State Preservation](#73-breakpoint-transition--state-preservation), rotasi dari Portrait (`MEDIUM`) ke Landscape (`EXPANDED`) tidak boleh mereset scroll position, form input, atau state modal.

#### 7.7.2 Android Multi-Window & Split-Screen
Pengguna Android sering menggunakan mode Split-Screen (misal: Yapendik OS di atas, WhatsApp di bawah).
1. **Dynamic Viewport Height (`dvh`)**: 🛑 **DILARANG KERAS** menggunakan `h-screen` atau `100vh` statis untuk kontainer utama. Android OS sering mengubah tinggi viewport secara agresif saat Split-Screen atau saat keyboard virtual muncul. Wajib menggunakan unit CSS modern `h-dvh` (Dynamic Viewport Height) atau `min-h-dvh` untuk mencegah konten terpotong atau melompat.
2. **No Unmount/Remount**: Komponen tidak boleh di-*unmount* dan di-*remount* hanya karena viewport menyusut. Gunakan CSS Media Queries dan Flexbox/Grid adaptif untuk mengatur ulang tata letak secara instan.
3. **Graceful Degradation**: Jika Split-Screen membuat lebar jendela menyusut di bawah `600px` (COMPACT), UI wajib bertransisi mulus ke tata letak mobile (Omni-Bar & Bottom Nav) tanpa kehilangan konteks data yang sedang dibuka.

#### 7.7.3 Samsung DeX Advanced Handling
Lingkungan DeX memperkenalkan kompleksitas windowing desktop:
1. **Freeform Window Resizing**: Jendela DeX dapat diubah ukurannya secara bebas. Gunakan `ResizeObserver` dengan *debounce* 150ms (seperti pada [Section 7.3](#73-breakpoint-transition--state-preservation)) untuk mencegah *layout thrashing* (rendering berlebihan yang memboroskan baterai).
2. **External Monitor Hot-Plug**: Saat tablet dicolokkan ke monitor eksternal, viewport dapat melompat dari `1280px` ke `1920px+` secara instan. Sistem harus siap merender layout `LARGE` (Multi-panel / Three-pane) tanpa memuat ulang data dari server (manfaatkan cache client-side yang ada).

#### 7.7.4 Safe Area Insets & Display Cutouts
Tablet modern memiliki *punch-hole camera* dan *gesture navigation bar* yang memakan area layar:
1. **TopBar Compensation**: TopBar wajib menghormati area kamera dengan padding dinamis: `padding-top: env(safe-area-inset-top)`.
2. **Bottom Navigation & Omni-Bar Compensation**: Elemen di bawah layar wajib menghormati gesture bar Android atau taskbar DeX: `padding-bottom: env(safe-area-inset-bottom)`.
3. **Landscape Cutouts**: Saat tablet diputar ke Landscape, *punch-hole camera* mungkin berada di sisi kiri atau kanan. Konten teks penting **DILARANG** diletakkan di sudut mati (*dead corners*) tanpa padding `env(safe-area-inset-left)` atau `env(safe-area-inset-right)`.

---

### 7.8 Touch Targets & Samsung Ergonomics

#### 7.8.1 The 48dp Material Standard & Modality Exceptions
Ukuran target sentuh bukanlah tentang ukuran visual ikon, melainkan **area hit-box** yang dapat direspons oleh sistem:
1. **Modality `TOUCH` (Jari)**: Minimum **`48x48dp`** (Material Design 3 standard). Ini adalah hukum mutlak untuk mencegah *fat-finger errors*.
   * Implementasi Tailwind: Gunakan utilitas `min-h-[48px]` dan `min-w-[48px]` pada kontainer elemen interaktif (meskipun ikon SVG di dalamnya hanya `w-5 h-5`).
2. **Modality `STYLUS` / `MOUSE`**: Minimum **`32x32dp`** diperbolehkan karena presisi kursor/S-Pen (mengacu pada [Section 7.4](#74-input-modality-detection--s-pen-ergonomics)).
3. **Pengecualian Kepadatan Tinggi**: Pada tabel data yang sangat padat (misal: Grid Nilai Rapor), target sentuh bisa dikompresi hingga `40x40dp` asalkan memiliki *spacing* yang cukup.

#### 7.8.2 Thumb Zone & Grip Ergonomics
Tablet dipegang dengan cara yang berbeda dari ponsel, mempengaruhi jangkauan jempol (*Thumb Zone*):
1. **Tablet Portrait (`MEDIUM`)**: 
   * Tablet dipegang dengan dua tangan di sisi kiri dan kanan. Jempol menjangkau sisi kiri-kanan bawah.
   * **Zona Emas (Golden Zone)**: *Primary CTA*, *Smart Chips*, dan *Omni-Bar* wajib diletakkan di zona bawah (Bottom 30% layar).
   * **Zona Merah (Red Zone)**: Hindari menempatkan aksi kritis (seperti tombol *Approve* atau *Delete*) di pojok kanan atas, karena memaksa pengguna untuk melepaskan pegangan atau meregangkan tangan secara tidak nyaman.
2. **Tablet Landscape (`EXPANDED`)**: 
   * Tablet diletakkan di meja dengan *keyboard case*, atau dipegang mendatar.
   * **Zona Emas**: *Sidebar* (kiri) dan *Workspace Actions* (kanan atas/bawah) sangat ergonomis.
   * **Zona Merah**: Area tengah layar yang lebar sulit dijangkau dengan sentuhan jari tanpa melepaskan posisi tangan dari keyboard/tepi tablet. Gunakan *Master-Detail Split-Pane* ([Section 7.6](#76-master-detail--split-pane-workspace-patterns)) untuk mendekatkan aksi ke sisi kiri/kanan.

#### 7.8.3 Touch Target Spacing & Density
* Jarak minimum antar elemen interaktif yang bersebelahan (misal: ikon aksi *Edit* dan *Delete* di dalam List Item) wajib **8px** (`gap-2` atau `space-x-2`) untuk mencegah sentuhan tidak sengaja.
* Jika ruang horizontal terbatas (misal di layar `COMPACT`), **DILARANG** memaksakan 3 ikon aksi berjajar. Gunakan *Action Menu* (Tombol 3-titik `⋮` / `<ActionMenu>`) untuk mengelompokkan aksi sekunder, menyisakan ruang untuk 1 *Primary Action* yang lebar.

#### 7.8.4 List Item Ergonomics (Hukum 1 Alignment)
Mengacu pada Hukum 1 (Edge-to-Edge List) dan Zero-CLS:
* Setiap baris data (`<ListItem>`) yang dapat diketuk (misal: memilih siswa untuk membuka detail) atau memiliki aksi di dalamnya **WAJIB** memiliki tinggi minimum **`min-h-[56px]`** (atau padding vertikal `py-4`).
* Tinggi 56px memberikan ruang napas yang cukup untuk teks 2 baris (`line-clamp-2`) sekaligus memenuhi standar area sentuh 48dp secara vertikal.

---

### 7.9 Adaptive Modals, Sheets & Dialogs

#### 7.9.1 The "Chameleon" Component: `<AdaptiveDialog>`
Amanaura menggunakan satu komponen primitif tunggal (`<AdaptiveDialog>`) yang secara otomatis bermutasi wujud berdasarkan *Size Class* dan *Input Modality*:
1. **COMPACT & MEDIUM (Portrait / Phone / Small Tablet)**: Berwujud **Bottom Sheet Drawer** (`h-[90vh]` atau `max-h-[90dvh]` maksimal, `rounded-t-3xl`).
2. **EXPANDED & LARGE (Landscape / Desktop / DeX)**: Berwujud **Center Modal** (`max-w-5xl h-[85vh]`, `rounded-2xl`, dengan `backdrop-blur-xs`).

#### 7.9.2 Bottom Sheet Ergonomics & Gestures
Pada wujud Bottom Sheet (COMPACT/MEDIUM):
1. **The Drag Handle**: Wajib menampilkan indikator visual berupa kapsul abu-abu tipis (`w-12 h-1.5 bg-slate-300 rounded-full mx-auto mt-2 mb-4`) di puncak sheet untuk mengafordansi *swipe-to-dismiss*.
2. **Swipe-Down to Dismiss**: Pengguna dapat menutup sheet dengan menggesek ke bawah. Jika sheet berisi form yang belum disimpan (*dirty state*), sistem wajib memicu *Auto-Draft Shield* (`localStorage`) dan menampilkan *ToastHUD* `"Draf tersimpan"`, alih-alih memunculkan dialog konfirmasi yang mengganggu.
3. **Keyboard Avoidance**: Saat keyboard virtual Android muncul, Bottom Sheet **TIDAK BOLEH** tertutup atau mendorong viewport secara liar. Gunakan `h-dvh` dinamis dan `scroll-mt` pada field input yang sedang fokus agar input tetap terlihat di atas keyboard.

#### 7.9.3 Focus Trapping & DeX Keyboard Accessibility
Pada wujud Center Modal (EXPANDED/LARGE) atau saat modality adalah `KEYBOARD` / `MOUSE`:
1. **Focus Trap**: Fokus keyboard (`Tab` / `Shift+Tab`) wajib terperangkap (*trapped*) di dalam siklus elemen interaktif Modal. Fokus tidak boleh bocor ke elemen di belakang *backdrop*.
2. **Initial Focus**: Saat modal terbuka, fokus default wajib diarahkan ke elemen pertama yang logis (misal: Input pertama, atau Tombol Batal jika itu adalah *Danger Dialog*).
3. **Esc Key Listener**: Menekan tombol `Esc` pada keyboard fisik (DeX/Bluetooth) wajib menutup modal, tunduk pada aturan *dirty state* yang sama dengan *swipe-down*.

#### 7.9.4 Stage 4.5 Glass Layer Integration
Modal di Yapendik OS sering kali memuat komponen sensitif Stage 4.5 (seperti `<PrivacyShield />` untuk data agregat, atau `<CanonicalAnchor />` untuk `action_id`):
1. **Matching-Pill Ribbon (Law 9) Preservation**: Pita konteks kapsul ganda di Tier 2 Header Modal (`bg-slate-50/60`) wajib mempertahankan rasio dan *padding*-nya. Pada COMPACT, kapsul ditumpuk vertikal (`flex-col gap-2`). Pada EXPANDED, kapsul disejajarkan (`flex-row justify-between`).
2. **Zero PII Leakage on Render**: Transisi wujud dari Bottom Sheet ke Center Modal saat rotasi perangkat **TIDAK BOLEH** memicu *re-fetch* data atau *re-mount* yang menyebabkan *flash of unmasked PII* (kedipan data mentah sebelum `<PrivacyShield />` merender *frosted badge*). State masking wajib dipertahankan di level *context/provider*, bukan di level UI render.

---

### 7.10 Gesture, S-Pen & DeX Interaction Patterns

#### 7.10.1 Native Android Gesture Conflict Resolution
Android OS menggunakan gestur tepi (*edge swipes*) untuk navigasi sistem (Back/Forward). Ini sering bentrok dengan gestur UI aplikasi (seperti membuka Drawer atau menggeser Carousel):
1. **The 24dp Edge Exclusion Zone**: Elemen UI yang dapat digeser secara horizontal (seperti *Smart Chips Carousel* atau *Horizontal Tabs*) **DILARANG** memanjang hingga menyentuh 24dp paling tepi dari layar kiri/kanan. Wajib ada *padding* atau *margin* agar area tepi tetap menjadi "zona tangkap" untuk gestur *Back* bawaan OS.
2. **Drawer Swipe Affordance**: Menggesek drawer dari tepi layar (*edge-swipe to open*) sangat rentan bentrok. Amanaura lebih mengutamakan *Tap* pada tombol Menu/Omni-Bar atau *Drag Handle* fisik yang terlihat untuk membuka laci, alih-alih mengandalkan gestur tepi yang tersembunyi.
3. **Swipe-to-Dismiss vs. OS Back**: Jika pengguna melakukan *swipe-down* pada Bottom Sheet, itu menutup Sheet. Jika pengguna melakukan *swipe-from-edge* (Back), itu juga menutup Sheet. Keduanya harus memicu *Auto-Draft Shield* yang sama (lihat [Section 7.9.2](#792-bottom-sheet-ergonomics--gestures)).

#### 7.10.2 S-Pen Precision Interactions
Samsung S-Pen mengubah tablet menjadi kanvas presisi. Amanaura memanfaatkan ini tanpa merusak *palm rejection*:
1. **Hover States (Pen-Pointer)**: Komponen seperti `<ListItem>` atau `<Button>` akan menampilkan **Signature #2: Luminescent Edge** saat S-Pen melayang di atasnya (`pointerType === 'pen'` + `:hover`). Ini memberikan umpan balik visual sebelum pengguna menyentuh layar.
2. **Precision Selection**: Pada tabel data yang padat (misal: *Jadwal Pelajaran* atau *Grid Nilai*), S-Pen mengizinkan *hit-box* yang lebih kecil (32dp) dan memfasilitasi seleksi teks presisi tanpa memicu *magnifier loupe* (kaca pembesar teks) yang mengganggu.
3. **Signature & Annotation Pads**: Untuk komponen `<SignaturePad />` atau kanvas anotasi foto observasi (`<Lightbox>`), sistem wajib mendeteksi `pressure` (tekanan) dari S-Pen untuk memvariasikan ketebalan garis (*stroke-width*), memberikan pengalaman menulis natural yang bermartabat.

#### 7.10.3 DeX Mouse & Trackpad Paradigms
Di lingkungan DeX, Amanaura wajib berperilaku seperti aplikasi desktop *native*, bukan sekadar web yang diperbesar:
1. **Right-Click Context Menus**: Menekan klik kanan (atau *tap-and-hold* pada touch) pada baris data (`<ListItem>`) atau kartu **WAJIB** memicu `<ActionMenu>` (Context Menu) tepat di posisi kursor. Ini menggantikan keharusan pengguna untuk mencari tombol "Titik Tiga" (⋮) secara visual.
2. **Drag-and-Drop (DnD) Choreography**: Pada breakpoint `LARGE` (DeX), fitur *Drag-and-Drop* diaktifkan untuk alur kerja spasial (misal: memindahkan kartu siswa ke kelompok berbeda, atau menjadwalkan observasi di kalender).
   * **Visual Affordance**: Saat item di-*drag*, item asli menjadi semi-transparan (`opacity-50`), dan *Drop Zone* yang valid akan menyala dengan batas putus-putus hangat (`border-dashed border-amber-500 bg-amber-50/50`).
   * **Cancel Action**: Menekan `Esc` saat sedang men-*drag* item akan membatalkan aksi dan mengembalikan item ke posisi semula dengan animasi `AmanauraSpring`.
3. **Scroll Wheel Behavior**: *Scroll wheel* pada mouse DeX harus menggulir kontainer yang sedang di-*hover* oleh kursor (misal: menggulir Master List di Split-Pane tanpa perlu mengkliknya terlebih dahulu), bukan menggulir halaman latar belakang.

---

## PART VIII: PWA ARCHITECTURE

### 8.1 PWA Manifest, Install UX & Samsung Internet Integration

#### 8.1.1 Web App Manifest Configuration (`manifest.json`)
Yapendik OS wajib dikemas sebagai PWA *standalone* agar terasa seperti aplikasi native di tablet Android:
```json
{
  "name": "Yapendik School OS",
  "short_name": "Yapendik",
  "description": "The Warm, Tactile, and Dignified Operating Experience for Early Childhood Education.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "background_color": "#F8FAFC",
  "theme_color": "#0F172A",
  "icons": [
    { "src": "/icons/icon-192x192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "/icons/icon-512x512.png", "sizes": "512x512", "type": "image/png" },
    { "src": "/icons/icon-maskable-512x512.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable" }
  ],
  "shortcuts": [
    {
      "name": "Presensi Hari Ini",
      "short_name": "Presensi",
      "description": "Pencatatan kehadiran harian siswa kelas",
      "url": "/attendance",
      "icons": [{ "src": "/icons/shortcuts/attendance.png", "sizes": "96x96" }]
    },
    {
      "name": "Rekam Momen Belajar",
      "short_name": "Observasi",
      "description": "Fast Capture dokumentasi kegiatan dan karya siswa",
      "url": "/observations/new",
      "icons": [{ "src": "/icons/shortcuts/observation.png", "sizes": "96x96" }]
    },
    {
      "name": "Kotak Kebijakan",
      "short_name": "Inbox",
      "description": "Persetujuan dan adopsi kebijakan unit sekolah",
      "url": "/school/adoption/inbox",
      "icons": [{ "src": "/icons/shortcuts/inbox.png", "sizes": "96x96" }]
    }
  ]
}
```

#### 8.1.2 Custom Install Promotion Choreography (Soft Install)
Amanaura menolak *pop-up* agresif yang menutupi konten. Kita mencegat event `beforeinstallprompt` dari browser dan menampilkan UI instalasi yang sopan:
1. **The Install Smart Chip**: Alih-alih *banner* penuh, tampilkan *Smart Chip* yang elegan di deretan *Omni-Bar* atau *Smart Chips Carousel* (lihat [Section 3.4](#34-mobile-centered-omni-bar-dock--smart-chips)): `[ ⬇️ Pasang Aplikasi ]`.
2. **ToastHUD Fallback**: Jika pengguna menolak instalasi pertama, jangan tanyakan lagi selama 30 hari. Gunakan *ToastHUD* (Signature #4) di pojok bawah: *"Yapendik OS dapat diakses offline. [ Pasang Nanti ] [ Pasang Sekarang ]"*.
3. **Samsung Internet Compatibility**: Di browser Samsung Internet, PWA install prompt seringkali muncul di menu bawah (hamburger menu). UI *Soft Install* kita harus tetap berfungsi dan tidak bentrok dengan UI native Samsung.

#### 8.1.3 App Shortcuts (Long-Press Quick Actions)
Saat pengguna menekan lama (*long-press*) ikon Yapendik OS di *Home Screen* Android, sistem wajib menampilkan 3 jalan pintas kontekstual (App Shortcuts):
1. **📝 Presensi Hari Ini**: Langsung membuka halaman `/attendance` (Target: Guru Kelas).
2. **✨ Rekam Momen Belajar**: Langsung membuka *Fast Capture Modal* (`/observations/new`) (Target: Guru Kelas).
3. **📥 Kotak Kebijakan**: Langsung membuka *Headmaster Adoption Hub* (`/school/adoption/inbox`) (Target: Kepala Sekolah).  
*Catatan: Ikon shortcuts wajib menggunakan aset SVG Lucide yang senada dengan desain sistem, bukan emoji.*

#### 8.1.4 Privacy-First Splash Screen & Recent Apps Shield
Menghormati Invarian Stage 4.5 (FB-01: Zero Individual Exposure):
1. **Splash Screen**: Saat aplikasi diluncurkan dari Home Screen, OS Android akan merender *Splash Screen* berdasarkan `background_color` dan `icon` di manifest. **DILARANG KERAS** menyuntikkan HTML/CSS yang memuat data *cached* (seperti nama siswa atau foto) ke dalam *shell* awal. Splash screen hanya boleh menampilkan Logo Yapendik dan *Amanaura Breath* (✦) yang berdenyut.
2. **Android Recent Apps Switcher**: Saat pengguna membuka *multitasking view* (Recent Apps), *thumbnail* aplikasi tidak boleh membocorkan PII (Data Pribadi Anak). Komponen `<PrivacyShield />` (Glass Layer) harus secara proaktif mendeteksi `visibilityState === 'hidden'` atau `blur` pada window dan merender *frosted glass overlay* (blur + `bg-slate-900/80`) sebelum OS sempat mengambil *screenshot* untuk Recent Apps.

### 8.2 Offline Capabilities & Service Worker Caching Strategy

Yapendik OS dirancang untuk lingkungan sekolah dengan konektivitas Wi-Fi yang fluktuatif. Arsitektur PWA wajib mengadopsi paradigma *Offline-First* yang tenang dan deterministik, tanpa pernah menampilkan layar error merah yang memicu kepanikan (*Calm & Dignified*).

#### 8.2.1 Service Worker Caching Strategies
Service Worker (SW) mengelola aset dan data menggunakan strategi yang berbeda berdasarkan tipe konten:
1. **App Shell (HTML, CSS, JS, Fonts)**: **Cache-First**. Aset statis UI di-cache saat instalasi PWA. Aplikasi wajib langsung merender *Skeleton* atau UI dasar meskipun perangkat benar-benar offline.
2. **Images (AvatarChild, Artwork Lightbox)**: **Stale-While-Revalidate**. Tampilkan gambar dari cache (jika ada) secara instan, lalu perbarui di latar belakang. Gunakan batas ukuran cache (misal: max 200MB) dengan strategi *LRU (Least Recently Used)*.
3. **API Data (Rosters, Schedules, Insights)**: **Network-First with Offline Fallback**. Coba ambil dari jaringan. Jika gagal (timeout/offline), SW merender data dari *IndexedDB Offline Store*. Jika tidak ada di IndexedDB, tampilkan *Interactive Onboarding Empty State* atau *Skeleton*, 🛑 **DILARANG** menampilkan `500 Server Error` atau `Network Failed` merah.

#### 8.2.2 Deterministic Offline Data Store (IndexedDB)
Data yang diperlukan untuk operasi harian disimpan secara lokal menggunakan IndexedDB (melalui pustaka seperti `idb` atau `Dexie.js`):
1. **Ephemeral Session Data**: Daftar siswa aktif, jadwal hari ini, dan draf observasi yang belum di-submit.
2. **Stage 4.5 Privacy Compliance (FB-01)**: 🛑 **DILARANG KERAS** menyimpan *Child Protection Dossiers* (Tier 4) atau data medis sensitif di IndexedDB dalam bentuk *plain-text*. Data sensitif hanya boleh ada di memori sesi (RAM) dan wajib dihapus saat `visibilityState === 'hidden'` atau tab ditutup.
3. **Read-Only Projections**: Data analitik Yayasan (LEARN domain) tidak di-cache secara offline. Jika offline, tab *Foundation Console* atau *Headmaster Adoption Hub* menampilkan *Empty State* dengan pesan: *"Memerlukan koneksi aman untuk memuat data kelembagaan."*

#### 8.2.3 Offline Mutation Queue & Optimistic UI
Saat pengguna melakukan aksi mutasi (misal: Mengklik "Simpan Presensi" atau "Kirim Observasi") dalam kondisi offline:
1. **Optimistic UI**: UI langsung memperbarui state lokal (menampilkan status *Hadir* atau *Terkirim*) dan menampilkan **Status Dot Capsule (Kuning/Warning)**: `[ ● Menunggu Sinkronisasi ]`.
2. **Queueing**: Payload mutasi (RPC call) disimpan ke dalam *IndexedDB Mutation Queue* dengan stempel waktu (*timestamp*) dan ID unik (*idempotency key*).
3. **No Blocking**: Pengguna dapat melanjutkan pekerjaan berikutnya. Antrian mutasi diproses secara berurutan (*FIFO*) di latar belakang.

#### 8.2.4 Background Sync & Reconciliation
Mengacu pada *Invisible Mastery #5: Silent Exponential Retry & Background Sync*:
1. **Event Listener**: SW mendengarkan event `sync` (Background Sync API) atau perubahan `navigator.onLine`.
2. **Reconciliation**: Saat koneksi pulih, SW memproses *Mutation Queue*. Jika server menolak mutasi (misal: konflik data atau validasi gagal), SW tidak boleh diam-diam menghapus data. SW wajib memicu **ToastHUD** dengan tombol **5-Second Undo**: *"Gagal menyimpan Presensi: Konflik Data. [ Tinjau ]"*.
3. **Exponential Backoff**: Jika server tidak merespons (5xx error), SW menjadwalkan ulang percobaan sinkronisasi dengan jeda eksponensial (1s, 2s, 4s, 8s) tanpa memboroskan baterai.

---

## PART IX: REFACTORING RULES & AUDIT PROTOCOL

Dokumen Standar Audit & Perbaikan Layout UI/UX untuk IDE AI dan Pengembang.

### 9.1 The 12 Refactoring Laws

```text
┌────┬─────────────────────────────┬─────────────────────────────────────────────────────────────┐
│ NO │ HUKUM REFACTORING           │ DESKRIPSI TEKNIS & SOLUSI                                   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 1  │ Edge-to-Edge List           │ Root container: divide-y divide-slate-100 pb-[120px].       │
│    │ (Hancurkan Kartu Kotak)     │ Item: py-5 px-4 md:px-6 hover:bg-slate-50/50 transition.    │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 2  │ Anti-Padding Bleed          │ Teks dilarang menabrak bezel (0px). Kontainer wajib         │
│    │ (Ruang Napas Teks)          │ px-4 md:px-6. Hanya border/bg solid yang boleh mepet.       │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 3  │ CTA Dominance               │ Tombol aksi utama mobile wajib full-width (w-full md:w-auto)│
│    │ (Hukum Tombol Utama)        │ diletakkan pada baris baru mt-3 md:mt-0.                    │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 4  │ Dropdown Geometri           │ Select mobile wajib w-full flex justify-between items-center│
│    │ (Chevron Rata Kanan)        │ agar panah chevron (v) terdorong mentok ke ujung kanan.     │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 5  │ Anti-Crush Flex             │ Hindari flex-row tanpa wrap pada judul panjang + badge.     │
│    │ (Penyelamatan Teks)         │ Gunakan susunan vertikal: flex flex-col items-start gap-1.5.│
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 6  │ Smart Chip Symmetry         │ Kumpulan chip geser wajib w-full justify-center             │
│    │ (Keseimbangan Melayang)     │ agar melayang sentral sebagai floating island.              │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 7  │ Desktop Flex-1 Bug          │ Dilarang flex-1 pada <main> jika parent max-h-screen        │
│    │ (Mencegah Footer Nyangkut)  │ overflow-y-auto. Solusi: gunakan grow shrink-0.             │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 8  │ Amplop Modal Kanonikal      │ Desktop: max-w-5xl h-[85vh]. Mobile: h-[90vh] rounded-t-3xl.│
│    │ & Pinned Action Anchor      │ Tombol close (✕) wajib terkunci di pojok kanan atas.        │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 9  │ Pita Konteks Kapsul Ganda   │ Pisahkan Header Identitas & Dedicated Ribbon bg-slate-50/60 │
│    │ (Matching-Pill Ribbon)      │ memuat Kapsul Kurikulum & Kapsul Status/Metrik.             │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 10 │ Anti-Kelelahan Gulir Mobile │ Ubah sidebar desktop jadi horizontal scrollable pill bar.   │
│    │ & Workspace Tab Parity      │ Wrapper padding tab wajib identik (px-4 sm:px-5 md:px-0).   │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 11 │ Kaidah Tombol Ikon Tunggal  │ Maksimal 1 ikon Lucide di kiri label (w-4 h-4).             │
│    │ & Nol Emoji Clutter         │ Dilarang keras menyematkan emoji Unicode (⚡, ✅, 🏆).       │
├────┼─────────────────────────────┼─────────────────────────────────────────────────────────────┤
│ 12 │ Standar Nomenklatur TK      │ Wajib menggunakan istilah "TK" (bukan PAUD).               │
│    │ & Kamus Anti-Jargon         │ Bersihkan jargon developer ke bahasa pendidik yang ramah.   │
└────┴─────────────────────────────┴─────────────────────────────────────────────────────────────┘
```

### 9.2 Pre-Change Safety Checklist

#### A. Scope Verification (WAJIB SEBELUM KODING)
* [ ] **Perubahan HANYA menyentuh file `.tsx` / `.css` (JSX & styling)**?
* [ ] **Tidak ada perubahan pada logika state** (`useState`, `useEffect`, `useReducer`, `useMemo`)?
* [ ] **Tidak ada perubahan pada props / interface TypeScript** yang mempengaruhi komponen pemanggil/anak?
* [ ] **Tidak ada perubahan pada API / RPC calls atau query Supabase**?
* [ ] **Tidak ada perubahan pada RLS policies atau autentikasi**?
* [ ] **Tidak ada perubahan pada conditional rendering berdasarkan role / persona**?
* [ ] **Tidak ada perubahan pada logika routing atau route guards**?
* [ ] **Perubahan bersifat deterministik dan dapat di-revert tanpa efek samping**?

#### B. Visual & Architectural Compliance (WAJIB)
* [ ] **Audit Responsif pada Breakpoint Kanonikal**: Uji tampilan pada `Mobile (< 1024px)` dan `Desktop (≥ 1024px)` *(Catatan: Mulai Step 2, dievolusikan ke MD3: COMPACT, MEDIUM, EXPANDED)*.
* [ ] **Verifikasi Z-Index**: Mematuhi hierarki tumpukan [PART II: Z-Index Stacking Hierarchy](#24-canonical-z-index-stacking-hierarchy).
* [ ] **Verifikasi Padding Parity**: Seluruh tab sub-halaman workspace memiliki wrapper `px-4 sm:px-5 md:px-0` (Law 10).
* [ ] **Verifikasi Touch Targets**: Touch target $\ge 48\text{dp} \times 48\text{dp}$ pada seluruh tombol dan aksi interaktif untuk modality `TOUCH` ($\ge 32\text{dp}$ untuk `STYLUS`/`MOUSE`).
* [ ] **Verifikasi Input Modality**: Komponen tidak memiliki *hardcoded* `:hover` yang merusak pengalaman touch. Menggunakan `useInputModality` atau CSS `@media (hover: hover)`.

### 9.3 UI/UX Only Protocol

#### 🛑 DILARANG KERAS (Strictly Prohibited):
1. **State Logic**: Modifikasi logika `useState`, `useReducer`, `useEffect`, atau konteks bisnis `SecurityContext`.
2. **API / Database**: Modifikasi pemanggilan RPC, query Supabase, atau payload contracts.
3. **RLS Policies**: Mutasi RLS policies (Stage 4.5 sealed: FB-01 s.d. FB-07 invariants) — **ABSOLUTELY FORBIDDEN**.
4. **Auth / Authorization**: Perubahan token, session, role checking, atau credential flow.
5. **Routing Logic**: Perubahan flow navigasi, dynamic route guards, atau redirect invariants.
6. **Form Validation**: Pengubahan fungsi validator, schema error checking, atau logika submit.
7. **TypeScript Props / Interface**: Perubahan contract type/interface yang mengubah relasi antar-komponen.
8. **Test Assertions**: Modifikasi contract tests, runtime security tests, atau adversarial test suites.
9. **Supabase RPC Signatures**: Modifikasi nama fungsi atau parameter RPC backend.

---

## PART X: GOVERNANCE & CHANGE MANAGEMENT

### 10.1 Frozen State Declaration
Aplikasi *Yapendik School OS* saat ini berada dalam status **FROZEN (STABILISASI & AUDIT UI/UX)**. 
* **Aturan Utama**: Hanya perbaikan antarmuka pengguna (tata letak, styling, keterbacaan, ergonomi tablet/mobile) yang diizinkan.
* **Larangan Keras**: Dilarang melakukan refactoring arsitektur database, perubahan skema SQL, mutasi trigger, atau perubahan fungsi RPC backend.

### 10.1.1 Stage 4.5 Compliance Reference
Perubahan UI/UX wajib menghormati Stage 4.5 Final Closure Certification:
* **348/348 automated checks PASS** (100% Zero Regression).
* **FB-01 s.d. FB-07 invariants ENFORCED** (DB, Service, UI).
* **H-01 s.d. H-06 hardenings GUARANTEED** (fail-closed RLS, immutable audit anchors, placement lineage).
* **ADR-01 s.d. ADR-04 infrastructure SEALED** (idempotent migrations, zero-downtime, edge caching, cryptographic tamper detection).

**Komponen The Glass Layer yang TIDAK BOLEH diubah logika bisnisnya:**
* `<PrivacyShield />` (K-Anonymity Frosted Badge)
* `<NonCausalDelta />` (Observed Association Footnote)
* `<CanonicalAnchor />` (Immutable action_id display)
* `<ForbiddenActionGate />` (Hard Mutation Blocker)

*Referensi Dokumen:* `STAGE_4_5_FINAL_CLOSURE_AND_ARCHITECTURE_CERTIFICATION_v1.0.md`

### 10.2 UI/UX Change Scope Definition

```text
┌──────────────────────────────────────────────────────────┬──────────────────────────────────────────────────────────┐
│              PERUBAHAN YANG DIIZINKAN (ALLOWED)          │            PERUBAHAN YANG DILARANG (STRICTLY PROHIBITED) │
├──────────────────────────────────────────────────────────┼──────────────────────────────────────────────────────────┤
│ • Penyesuaian class Tailwind (padding, margin, gap)      │ • Penambahan / modifikasi kolom database atau skema SQL  │
│ • Penggantian elemen kaku dengan komponen primitif UI    │ • Perubahan permission RLS / Security Definer RPC        │
│ • Penyesuaian responsif (MD3 size classes, touch targets)│ • Perubahan payload API atau signature service typescript│
│ • Perbaikan keterbacaan copywriting & pembersihan emoji  │ • Modifikasi logika auth / token / session management    │
│ • Optimasi tata letak collapsible sidebar & modal sheet  │ • Penghapusan testing suite fungsional atau contract     │
└──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────┘
```

### 10.3 Review & Approval Workflow
Setiap perubahan antarmuka harus melalui 4 gerbang verifikasi:
1. **Pre-Audit Analysis**: Meninjau kepatuhan komponen terhadap 12 Hukum Refactoring ([PART IX](#part-ix-refactoring-rules--audit-protocol)).
2. **Component Refactor**: Menerapkan token Amanaura dan komponen standar dari `src/components/ui/`.
3. **Automated & Visual Verification**: Menjalankan browser test dan test suite (`pnpm test`) untuk memastikan nol regresi logika.
4. **Master Sign-off**: Pencatatan riwayat perubahan ke dalam log konsolidasi.

### 10.4 Version Control Strategy
* `v1.0`: Master Design System Specification (Baseline).
* `v1.1`: Refactoring Playbook (12 Laws).
* `v2.0.1-DRAFT`: Consolidated Master Specification + MD3 Breakpoints & Samsung Device Matrix.
* `v2.0.2-DRAFT`: Consolidated Master Specification + Resolved Link Formatting.
* `v2.0.3-DRAFT`: Consolidated Master Specification + Input Modality Detection & S-Pen Ergonomics.
* `v2.0.4-DRAFT`: Consolidated Master Specification + Adaptive Navigation Shell.
* `v2.0.5-DRAFT`: Consolidated Master Specification + Master-Detail & Split-Pane Patterns.
* `v2.0.6-DRAFT`: Consolidated Master Specification + Orientation, Multi-Window & DeX Handling.
* `v2.0.7-DRAFT`: Consolidated Master Specification + Touch Targets & Samsung Ergonomics.
* `v2.0.8-DRAFT`: Consolidated Master Specification + Adaptive Modals, Sheets & Dialogs.
* `v2.0.9-DRAFT`: Consolidated Master Specification + Gesture, S-Pen & DeX Interaction Patterns.
* `v2.0.10-DRAFT`: Consolidated Master Specification + PWA Manifest, Install UX & Samsung Internet.
* `v2.0.11-DRAFT`: Consolidated Master Specification + Offline Architecture & Service Worker.
* `v2.0-RELEASE`: Final certified consolidated specification setelah implementasi 12 langkah selesai (Current).

### 10.5 v2.0 Final Audit & Visual Regression Testing Protocol

Sebelum Amanaura v2.0 disegel sebagai standar kanonikal permanen, seluruh kodebase UI/UX wajib melewati 4 gerbang audit otomatis dan manual:

#### 10.5.1 Visual Regression Testing (VRT)
* **Tooling**: Playwright / Chromatic / Percy.
* **Scope**: Setiap komponen di `src/components/ui/` dan halaman workspace utama wajib di-screenshot pada 3 breakpoint MD3 (`COMPACT`, `MEDIUM`, `EXPANDED`) dan 2 Modality (`TOUCH`, `MOUSE/STYLUS`).
* **Baseline**: Snapshot v1.0 digunakan sebagai baseline. Regresi visual yang melanggar 12 Hukum Refactoring (misal: munculnya kartu ber-margin di mobile, atau hilangnya `divide-y`) akan memblokir *merge request*.

#### 10.5.2 Accessibility (a11y) & Modality Audit
* **Focus States**: Verifikasi bahwa **Signature #2: The Luminescent Edge** hadir pada seluruh elemen interaktif saat navigasi keyboard (`Tab`).
* **Touch Targets**: Audit otomatis (misal: axe-core) untuk memastikan tidak ada area sentuh di bawah 48dp (Touch) atau 32dp (Stylus/Mouse).
* **Color Contrast**: Memastikan rasio kontras $\ge 15:1$ untuk teks primer dan $\ge 4.5:1$ untuk teks sekunder/sinyal semantik.

#### 10.5.3 PWA & Offline Resilience Audit
* **Lighthouse PWA Score**: Wajib mencapai $\ge 95$ pada kategori PWA dan Best Practices.
* **Offline Stress Test**: Mematikan jaringan (Airplane Mode) dan memverifikasi bahwa *Optimistic UI* dan *Status Dot Capsule (Kuning)* muncul dengan benar, serta *Mutation Queue* (IndexedDB) merekam aksi tanpa *crash*.
* **Recent Apps Shield**: Verifikasi manual bahwa `<PrivacyShield />` memicu *frosted overlay* saat aplikasi di-minimize atau masuk ke Recent Apps Switcher (FB-01).

#### 10.5.4 Stage 4.5 Glass Layer Adversarial Audit
* Memastikan bahwa seluruh adaptasi responsif v2.0 (seperti *Split-Pane* atau *Bottom Sheet*) **TIDAK** secara tidak sengaja membocorkan PII atau menghilangkan komponen *Glass Layer* (`<PrivacyShield />`, `<NonCausalDelta />`, `<CanonicalAnchor />`, `<ForbiddenActionGate />`).
* Menjalankan ulang *Adversarial DOM PII Scanning* (Suites 24 & 25 dari Stage 4.5) untuk membuktikan 0 NIK, 0 NIS, dan 0 Foto Anak bocor di DOM Yayasan.

### 10.6 Token Purity & Automated Enforcement (CI Gate)
Untuk menjamin tidak ada regresi warna mentah (raw hardcoded colors/neutrals) yang mencemari *Night Temple* atau *Frangipani Day*, sistem memberlakukan pemeriksaan otomatis wajib:
* **Script Pemeriksa**: `scripts/token-purity.mjs`
* **Perintah CI**: `pnpm audit:tokens`
* **Aturan Mutlak**: Scan seluruh file di `src/**/*.{tsx,ts,css}` terhadap regex terlarang (`/bg-white/`, `/bg-(slate|gray|zinc)-\d+/`, `/text-(slate|gray|zinc)-\d+/`, `/border-(slate|gray|zinc)-\d+/`, `/text-(red|amber|emerald|rose|green)-\d{2,3}/`).
* **Status**: Wajib **PASS (0 violations)** pada setiap build dan PR merge.

### 10.7 Deep Structural Audit Protocol (10-Dimension Enforcement)
Untuk menjamin integritas struktural, ergonomi layar sentuh, dan kepatuhan absolut terhadap Material Design 3 (MD3):
* **Script Pemeriksa**: `scripts/amanaura-audit.mjs`
* **Perintah CI**: `pnpm audit:amanaura`
* **Pilar Penegakan (10 Dimensi)**:
  1. **Zero Legacy Breakpoints**: Larangan penggunaan `sm:`, `md:`, `lg:`, `xl:`; wajib menggunakan ukuran jendela MD3 (`compact:`, `medium:`, `expanded:`, `large:`, `extra-large:`).
  2. **Zero Unshielded Hover**: Seluruh status interaksi hover wajib terisolasi via `hover-only:` (`@media (hover: hover)`) untuk mencegah *sticky hover bug* pada perangkat layar sentuh & stylus Android.
  3. **Zero Legacy Viewport**: Larangan penggunaan `h-screen` / `min-h-screen`; wajib menggunakan unit viewport dinamis `h-[100dvh]` / `min-h-[100dvh]` (PART V §5.4 #7 & PART VII §7.7.2).
  4. **Zero Emoji in JSX (Hukum 11)**: Seluruh string teks dan status mood anak wajib menggunakan ikon Lucide bertoken (bukan karakter emoji Unicode mentah).
  5. **Threshold Rule Enforcement (§4.2)**: Larangan penggunaan tag mentah `<select>`; wajib mengadopsi `<SegmentedControl>` ($\le 4$), `<SelectSheet>` ($5-15$), atau `<SearchableCombobox>` ($> 15$).
  6. **Canonical Z-Index Scale**: Wajib mematuhi hierarki kanonikal `z-40`, `z-50`, `z-60`, `z-70`, `z-80`.
  7. **Zero Raw Neutrals in JSX**: Larangan penggunaan `text-white`, `text-black`, `bg-black` di luar allowlist cetak; wajib menggunakan token semantik `text-on-brand`, `text-ink`, `bg-surface-inset`.
  8. **Zero Untranslated English Eyebrows/Labels**: Wajib mematuhi Kamus Pendidik (§6.2).
  9. **Touch Target Boundaries ($\ge 44\text{px}$ / $48\text{dp}$)**: Seluruh elemen interaktif dan ikon-tombol wajib memiliki area sentuh minimum $\ge 44\text{px}$.
  10. **Zero Overlay Collisions**: FAB, Omni-Bar, dan ToastHUD memiliki safe-area offset dan tidak menimpa aksi primer/CTA.
* **Status**: Wajib **PASS (0 violations)** pada seluruh pipeline CI.

---

## PART XI: IMPLEMENTATION ROADMAP (FINAL — RATIFIED)

### 12-Step Amanaura v2.0 Implementation Plan

| Step | Title | Phase | Status |
|:---|:---|:---|:---|
| **1** | Document Consolidation (Spec + Playbook) | A: Foundation | 🟢 COMPLETED / RATIFIED |
| **2** | MD3 Window Size Classes & Samsung Device Matrix | A: Foundation | 🟢 COMPLETED / RATIFIED |
| **3** | Input Modality Detection (Touch/Stylus/KB/Mouse) | A: Foundation | 🟢 COMPLETED / RATIFIED |
| **4** | Adaptive Navigation Shell (per size class) | B: Layout | 🟢 COMPLETED / RATIFIED |
| **5** | Master-Detail & Split-Pane Patterns | B: Layout | 🟢 COMPLETED / RATIFIED |
| **6** | Orientation, Multi-Window & DeX Handling | B: Layout | 🟢 COMPLETED / RATIFIED |
| **7** | Touch Targets & Samsung Ergonomics | C: Components | 🟢 COMPLETED / RATIFIED |
| **8** | Adaptive Modals, Sheets & Dialogs | C: Components | 🟢 COMPLETED / RATIFIED |
| **9** | Gesture, S-Pen & DeX Interaction Patterns | C: Components | 🟢 COMPLETED / RATIFIED |
| **10** | PWA Manifest, Install UX & Samsung Internet | D: PWA | 🟢 COMPLETED / RATIFIED |
| **11** | Offline Architecture & Service Worker | D: PWA | 🟢 COMPLETED / RATIFIED |
| **12** | Final Audit, E2E Testing & v2.0 Certification | D: PWA | 🟢 COMPLETED / RATIFIED |

> 🏆 **Pencapaian Milestone:**  
> **PHASE A (Foundation & Architecture — Steps 1–3)**: ✅ **100% COMPLETE & RATIFIED**.  
> **PHASE B (Layout & Navigation — Steps 4–6)**: ✅ **100% COMPLETE & RATIFIED**. Seluruh fondasi navigasi, split-pane workspace, dan ketahanan multitasking Android telah terkunci.  
> **PHASE C (Components & Interaction — Steps 7–9)**: ✅ **100% COMPLETE & RATIFIED**. Seluruh adaptasi komponen mikro, dialog bunglon, dan interaksi S-Pen/DeX tuntas.  
> **PHASE D (PWA & Certification — Steps 10–12)**: ✅ **100% COMPLETE & RATIFIED**. Seluruh arsitektur PWA, Service Worker offline sync, dan audit kepatuhan final telah disegel secara kanonikal.

### Phase Descriptions

* **PHASE A: Foundation & Architecture (Steps 1–3)**:
  Membangun fondasi breakpoint MD3, device matrix, dan input modality detection. Tidak ada perubahan visual destruktif pada tahap ini — fokus pada perumusan arsitektur dan sistem deteksi.
* **PHASE B: Layout & Navigation (Steps 4–6)**:
  Menerapkan breakpoint MD3 ke navigation shell adaptif, workspace layout master-detail, serta penanganan orientasi, multi-window split-screen, dan Samsung DeX.
* **PHASE C: Components & Interaction (Steps 7–9)**:
  Adaptasi komponen individual untuk ergonomi tablet: touch targets $48\text{dp}$, adaptive modals & sheets, interaksi gestur, S-Pen hover, dan navigasi DeX.
* **PHASE D: PWA & Certification (Steps 10–12)**:
  Arsitektur PWA untuk tablet Android, offline mutation queue, Service Worker sync, serta audit kepatuhan final dan sertifikasi rilis Amanaura v2.0.

---

## SERTIFIKASI & STATUS OTORITATIF

> **📜 PROKLAMASI RILIS KANONIKAL: AMANAURA v3.0-RELEASE**  
> 
> Dengan selesainya *Sprint 1 s.d. Sprint 6*, dokumen **AMANAURA DESIGN SYSTEM v3.0-RELEASE (PADMA MODERN)** secara resmi menjadi **STANDAR DESAIN GLOBAL PERMANEN & KANONIKAL** untuk *Yapendik School OS*.
>
> Seluruh rekayasa antarmuka pengguna, arsitektur PWA, dan adaptasi Tablet Android/DeX di masa kini dan masa depan **WAJIB** tunduk pada hukum visual, token sistem Padma Modern, dan protokol audit CI `pnpm audit:tokens` & `pnpm audit:amanaura` yang termaktub di dalam v3.0-RELEASE.
>  
> * **Status Resmi:** `v3.0-RELEASE` (CANONICAL LIVING MASTER SPECIFICATION)
> * **Roadmap 12-Step + Sprints 1–6:** 🟢 **100% COMPLETE & SEALED**
> * **Kepatuhan Stage 4.5 & Glass Layer:** 17/17 Integration Suites PASS, FB-01 s.d. FB-07 ENFORCED, H-01 s.d. H-06 GUARANTEED.
>
> **Disahkan oleh:** Senior Architecture Reviewer (ARB) & Project Owner  
> **Tanggal Pensegelan:** `2026-08-29`  
> **Baseline Hash:** `CANONICAL-AMANAURA-V3.0-RELEASE-PADMA-MODERN-20260829`

---

## APPENDIX A: CHANGELOG

* **v3.0.5-PATCH (2026-08-29) — Radius/Bullet & Stacking Doctrine (Fase B Certified)**:
  * Restrukturisasi Stacking 3-Tier: `ClassroomPulseBanner` (Compact: 1-col grid, Medium: 2-tier wrap, Expanded: 1 row) & `OperatingStateIndicator` (3-row flow).
  * Doktrin Anti-Truncate Tombol: seluruh tombol interaktif wajib render teks penuh ("Perhatian & Kesehatan"), truncate dilarang.
  * Normalisasi Radius 4-Tier Kanonikal (§3.6): `rounded-card` (16px), `rounded-field` (12px), `rounded-control` (8px), `rounded-pill` (9999px) di seluruh 10 file skop Beranda Kelas & UI primitives.
  * Bullet Hygiene: penghapusan titik standalone dekoratif, standardisasi dot badge semantik & em-dash.
  * CI Hardening: penambahan rule `R-RADIUS` (`rounded-[\d+px]`) dan `R-NO-TRUNCATE-BUTTON` pada `scripts/amanaura-audit.mjs`.
* **v3.0.4-PATCH (2026-08-29) — Real Page #1 Certified (Beranda Kelas)**:
  * 40/40 temuan audit FASE A (8 CRITICAL / 14 MAJOR / 18 MINOR) resolved 100%.
  * V-14 Zero-Overlap Invariant: `minmax(0,1fr)` + `items-start` + flex-wrap;
    asersi anti-overlap matematis permanen pada 8 state
    (390/768/1024/1440 × Frangipani Day/Night Temple).
  * Grid Blowout Law dikodifikasi (§3.5 addendum) + rule CI `R-GRID`.
  * Teacher Home contract test diperluas 6 → 8 state; VRT baseline diperbarui.
  * W-04 watch-item: label COMPACT "Perhatian & Kesehatan" (ditinjau VRT berikut).
* **v3.0.3-PATCH (2026-08-29) — Living Contract Ratified**:
  * Halaman Percontohan `/percontohan` (`LivingContractWorkspace.tsx`) disahkan
    sebagai executable constitution Amanaura v3.0.
  * Playwright contract tests 6 state + 6 VRT baseline (`tests/vrt-baseline/`).
  * `scripts/doc-code-sync.mjs` (`pnpm audit:sync`) mengunci 39×2 token
    antara dokumen dan `src/index.css` (SSOT permanen).
  * Rule `R-SPECIMEN` pada `amanaura-audit.mjs` menjaga kemurnian halaman.
  * V-13 Resolved: badge sidebar memakai chip ter-inversi kanonikal
    (`bg-surface-inset text-on-brand`).
  * W-02 Resolved: label Omni-Bar "Living Contract" (≤ 3 kata).
  * W-03 Watch-item: penempatan pil demo MEDIUM (peninjauan VRT berikutnya).
* **v3.0.2-PATCH (2026-08-29) — Living Contract Foundation**:
  * **ADR-UX-006 Ratified**: Kode sebagai SSOT untuk nilai & nama token.
  * **Primitive Baru**: `Skeleton.tsx` ditambahkan ke pustaka kanonikal.
  * **Hooks Baru**: `useInputModality.ts` dan `useOfflineStatus.ts`.
  * **5 primitives & 1 hook ditangguhkan jujur sebagai DEFERRED** (tidak dibutuhkan Halaman Percontohan v1).
  * **§2.1 disinkronkan ke prefix `--p-*` aktual kode + alias `--color-*`**.
  * **§4.4 diinventarisasi ulang menjadi 13 primitives + 3 hooks yang benar-benar ada di codebase**.
  * **Deep Contrast & Token Purity (V-06)**: Kanonisasi token `--color-on-brand` (`#F7F4ED` di Light, `#16130F` di Dark) dan 100% eliminasi `text-white`, `text-black`, `bg-black`.
  * **Kamus Pendidik & Copywriting (V-07)**: Terjemahan menyeluruh string antarmuka bahasa Inggris ke Bahasa Indonesia pedagogis (Buku Penghubung, Ringkasan Harian, Presensi).
  * **Mono Badge & Ergonomics (V-08, V-09)**: Penegakan `whitespace-nowrap` pada seluruh teks/badge `font-mono` (NIS/NIK/jam) dan touch hit-area $\ge 44\text{px}$ pada ikon interaktif.
  * **FAB Repositioning & Safe-Area (V-10)**: Reposisi tombol mengambang Momen Cepat (FAB ✦) dengan offset dinamis safe-area (`bottom-[calc(env(safe-area-inset-bottom,0px)+96px)]`), mencegah tabrakan dengan Omni-Bar dan tombol aksi.
  * **Fluid Card Grid (V-11)**: Konversi kontainer kartu anak ke auto-fit minmax (`grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(260px,1fr))]`).
  * **Selected-State Hardening (V-12)**: Penegakan `ring-1 ring-inset ring-current font-bold` pada status terpilih.
  * **Dual CI Enforcement**: Perluasan `scripts/amanaura-audit.mjs` (`pnpm audit:amanaura`) untuk pencegahan regresi struktural permanen.
  * **Right-Rail Anti-Crush (F-08 / Hukum 5)**: Restrukturisasi 3 baris vertikal header kartu `GuardianNoticeLedger` dengan aksi `grid-cols-2` (`whitespace-nowrap`), mencegah benturan layout pada rel kanan 380px.
  * **Sprint 7 Fluid Containment & State Clarity**: Penerapan containment `max-w-7xl mx-auto w-full` pada layout EXPANDED, kontrol fit-content `w-full expanded:w-fit`, active-state clarity dengan aksen `border-b-2 border-b-brass` pada `SegmentedControl`, dan struktur 2-kolom `large:grid-cols-[1fr_380px]` pada `TeacherHomeShell`.
  * **W-01 Watch-Item Normalization**: Pencatatan normalisasi primitif antarmuka dan audit kepatuhan konsistensi visual.
* **v3.0.1-PATCH (2026-08-29)**:
  * **Token Purity CI Guard**: Implementasi `scripts/token-purity.mjs` dan skrip `pnpm audit:tokens` untuk mencegah regresi warna mentah secara permanen.
  * **Code Sweep (V-01 s.d. V-05 Resolved)**: 100% pembersihan `bg-white`, raw slate, dan text color tak ter-invert di seluruh `src/**/*.tsx`.
  * **Night Temple Contrast Hardening**: Penegakan token `text-{danger|warning|success|info|lppa}-deep` untuk keterbacaan sempurna di tema gelap.
  * **Doc Hygiene Sweep**: Penyelarasan penuh dokumen spesifikasi dengan implementasi kode aktual.
* **v3.0-RELEASE (2026-08-29)**:
  * **ADR-UX-005 Ratified**: Adopsi Visual Language "Padma Modern" (Nusantara Refined).
  * **Token Overhaul**: Migrasi total dari Slate/Indigo ke Frangipani Day & Night Temple (warm-stone + brass).
  * **Typography Rescue**: Integrasi `@fontsource/plus-jakarta-sans` & `jetbrains-mono`.
  * **Threshold Rule Enforcement**: Eliminasi native `<select>`, migrasi ke SelectSheet/SegmentedControl/Combobox.
  * **Primitive Completion**: Penambahan Input, ProgressBar, SelectSheet, SearchableCombobox.
  * **Nusantara Soul**: Integrasi motif Poleng & Padma (≤4% opacity).
  * **MD3 & Hover Isolation**: Aktivasi breakpoint MD3 (compact/medium/expanded) dan `hover-only:` custom variant.
* **v1.0 (2026-08-27)**:
  * Pembentukan awal *Amanaura Design System Specification v1.0*.
  * Penetapan etimologi, 6 Amanaura Signatures, token warna 60-30-10, dualitas tipografi, topologi navigasi desktop vs mobile, dan pustaka komponen primitif `src/components/ui/`.
* **v1.1 (2026-08-27)**:
  * Pembentukan *Amanaura Mobile Refactoring Playbook v1.1*.
  * Kodifikasi 12 Hukum Refactoring antarmuka untuk panduan perbaikan komponen dan audit layout.
* **v2.0.0-DRAFT (2026-08-28)**:
  * **Konsolidasi Awal**: Penyatuan dokumen *Specification v1.0* dan *Refactoring Playbook v1.1* ke dalam struktur 11 bagian terpadu.
* **v2.0.1-DRAFT (2026-08-28)**:
  * **Step 1 Revisions**:
    * **Fix C-1**: Mengoreksi kebingungan breakpoint Tailwind (`< lg` untuk 1024px, bukan `< md`).
    * **Fix C-2**: Mengembalikan audit breakpoint binary kanonikal (`< 1024px` vs `≥ 1024px`) pada baseline v1.0.
    * **Fix C-3**: Menghapus seluruh referensi iPad dan mengalibrasi profil resolusi tablet khusus Android.
    * **Fix C-4**: Memulihkan klausul resmi *Sertifikasi & Status Otoritatif* dari Spec v1.0 dengan referensi Stage 4.5.
    * **Fix C-5**: Memperbaiki link Table of Contents dan cross-references yang terpecah.
    * **Fix H-1 & H-2**: Menghapus penambahan toggle yang belum diotorisasi pada Headbar dan mengembalikan judul *Desktop Sidebar*.
    * **Fix H-3**: Melengkapi *UI/UX Only Protocol* dengan larangan mutlak mutasi RLS (Stage 4.5 sealed), Auth, Routing, Props TypeScript, dan Test assertions.
    * **Fix H-4**: Menggabungkan *Pre-Change Safety Checklist* menjadi 2 seksi terstruktur (*Scope Verification* & *Visual Compliance*).
    * **Fix M-1**: Menambahkan referensi kepatuhan eksplisit terhadap *Stage 4.5 Final Closure Certification* (348/348 tests PASS).
    * **Fix M-2**: Mengembalikan terminologi *Rumus Lengkungan Sudut* (*Nested Radius Law*).
  * **Step 2 Deliverables (MD3 & Samsung Galaxy Tab Extension)**:
    * **ADR-UX-001 Ratified**: Adopsi Material Design 3 Window Size Classes (`COMPACT < 600px`, `MEDIUM 600–839px`, `EXPANDED ≥ 840px`, `LARGE ≥ 1200px`) menggantikan sistem breakpoint biner kaku.
    * **ADR-UX-002 Ratified**: Penetapan matriks perangkat target Samsung Galaxy Tab series (Tab A9, A9+, S9 FE, S9, S9+, S9 Ultra, S10+, S10 Ultra) lengkap dengan spesifikasi DeX Mode dan Samsung Internet PWA Host.
    * **ADR-UX-003 Ratified**: Penetapan roadmap implementasi komprehensif 12 langkah (Phase A s.d. Phase D).
    * **Section 7.1**: Mendefinisikan sistem breakpoint MD3, integrasi Tailwind v4 `@theme`, tabel migrasi dari v1.0, dan layout behavior per size class.
    * **Section 7.2**: Mendefinisikan device matrix Samsung Galaxy Tab, spesifikasi perilaku Samsung DeX windowing/taskbar, dan host browser Chrome for Android & Samsung Internet.
    * **Section 7.3**: Menetapkan aturan transisi breakpoint & *State Preservation* (scroll, form data, open modals, navigation state) saat rotasi atau resize DeX window.
* **v2.0.2-DRAFT (2026-08-28)**:
  * **Fix C-5**: Resolved all broken TOC and cross-reference links where "&" characters caused link text to split into two separate links. All navigation links now render as single clickable elements.
* **v2.0.3-DRAFT (2026-08-28)**:
  * **Step 3 Deliverables (Input Modality & S-Pen Ergonomics)**:
    * **Section 7.4**: Mendefinisikan sistem deteksi Input Modality (Touch, Stylus, Mouse, Keyboard) menggunakan CSS Media Queries (`pointer: coarse/fine`, `hover: hover/none`) dan `useInputModality()` hook.
    * **S-Pen Ergonomics**: Menetapkan aturan Hover Preview, Palm Rejection (tanpa global `touch-action: none`), dan precision targets ($32\text{dp}$) untuk Samsung S-Pen.
    * **DeX Keyboard Navigation**: Menetapkan aturan Focus Management (**Signature #2: The Luminescent Edge**), alur baca Tab Order natural, dan Keyboard Shortcuts (`Esc`, `Enter`, `Arrows`).
    * **Part V Update**: Mengintegrasikan Modality Awareness ke dalam Hover Isolation doctrine (§5.3).
    * **Part IV Update**: Menambahkan aturan Modality-Aware Touch Targets ($48\text{dp}$ untuk Touch, $32\text{dp}$ untuk Stylus/Mouse) pada §4.1.
    * **Part IX Checklist Update**: Menambahkan item verifikasi Input Modality pada Pre-Change Safety Checklist (§9.2).
* **v2.0.4-DRAFT (2026-08-28)**:
  * **Step 4 Deliverables (Adaptive Navigation Shell)**:
    * **Part III Update**: Mengganti topologi navigasi biner v1.0 dengan topologi 3-Tier MD3 (COMPACT, MEDIUM, EXPANDED).
    * **Section 3.2, 3.3, 3.4**: Mendefinisikan perilaku Headbar, Sidebar/Mini-Rail (`w-[72px]`), dan Omni-Bar per Size Class.
    * **Section 7.5**: Menetapkan *Navigation Transformation Matrix* untuk transisi antar size class, ergonomi Mini-Rail (`w-[72px]`), dan *DeX Windowing Hysteresis Buffer* (20px) untuk mencegah flickering.
* **v2.0.5-DRAFT (2026-08-28)**:
  * **Step 5 Deliverables (Master-Detail & Split-Pane Patterns)**:
    * **Section 7.6**: Mendefinisikan arsitektur *Split-Pane Workspace* untuk size class `EXPANDED` dan `LARGE`.
    * **Anatomy & Proportions**: Menetapkan aturan Master Pane (`w-1/3` / `w-[320px]`), Detail Pane (`flex-1`), dan *Active State* menggunakan Luminescent Edge.
    * **Responsive Fallback**: Menetapkan degradasi mulus ke Bottom Sheet 85vh (MEDIUM) dan Push Navigation (COMPACT).
    * **Empty State & State Preservation**: Menetapkan aturan *Empty State* (tanpa auto-select) dan preservasi seleksi item saat rotasi perangkat.
    * **Part IV Update**: Menambahkan komponen primitif `SplitPaneWorkspace.tsx` ke dalam pustaka UI.
* **v2.0.6-DRAFT (2026-08-28)**:
  * **Step 6 Deliverables (Orientation, Multi-Window & DeX Handling)**:
    * **Section 7.7**: Mendefinisikan penanganan orientasi (termasuk *task-specific locks* untuk kamera/lightbox), Android Split-Screen, dan DeX *hot-plug*.
    * **Dynamic Viewport (`dvh`)**: Menetapkan larangan keras penggunaan `100vh` statis demi mencegah *layout jump* di lingkungan Android Multi-Window.
    * **Safe Area Insets**: Menetapkan aturan `env(safe-area-inset-*)` untuk menghormati *punch-hole camera* dan *gesture navigation bar*.
    * **Part V Update**: Menambahkan *Dynamic Viewport Harmony* sebagai *Invisible Mastery* ke-7 (§5.4).
    * **Phase B Closure**: Menandai selesainya seluruh fondasi Layout & Navigation (Steps 4–6).
* **v2.0.7-DRAFT (2026-08-28)**:
  * **Step 7 Deliverables (Touch Targets & Samsung Ergonomics)**:
    * **Section 7.8**: Mendefinisikan standar *Touch Target* 48dp (Touch) vs 32dp (Stylus/Mouse), *Thumb Zone Ergonomics* (Golden & Red Zones) untuk Tablet Portrait/Landscape, dan *Touch Target Spacing* minimum 8px.
    * **List Item Ergonomics**: Menetapkan tinggi minimum `min-h-[56px]` untuk baris data interaktif guna menyelaraskan Hukum 1 (Edge-to-Edge) dengan kenyamanan sentuhan dan Zero-CLS.
    * **Part IV Update**: Menambahkan rujukan ergonomi dan `min-h-[48px]` pada *The 5 Button Laws* (§4.1).
    * **Phase C Activation**: Menandai dimulainya fase adaptasi komponen individual (Steps 7–9).
* **v2.0.8-DRAFT (2026-08-28)**:
  * **Step 8 Deliverables (Adaptive Modals, Sheets & Dialogs)**:
    * **Section 7.9**: Mendefinisikan perilaku komponen bunglon `<AdaptiveDialog>`, gestur *Swipe-Down to Dismiss* dengan *Auto-Draft Shield*, dan penanganan *Keyboard Avoidance* menggunakan `dvh`.
    * **Focus Trapping & DeX**: Menetapkan aturan *Focus Trap* dan *Esc Key Listener* untuk aksesibilitas keyboard di lingkungan DeX.
    * **Glass Layer Integration**: Menetapkan aturan preservasi *Matching-Pill Ribbon* (Law 9) dan jaminan *Zero PII Leakage on Render* saat transisi wujud modal.
    * **Part IV Update**: Memperbarui *Golden Envelope Standard* (§4.3.1) untuk mewajibkan `max-h-[90dvh]` pada Bottom Sheet guna mencegah tumpang tindih dengan keyboard virtual Android.
* **v2.0.9-DRAFT (2026-08-28)**:
  * **Step 9 Deliverables (Gesture, S-Pen & DeX Interaction Patterns)**:
    * **Section 7.10**: Mendefinisikan resolusi konflik gestur native Android (24dp Edge Exclusion Zone), interaksi presisi S-Pen (Hover States, Pressure Sensitivity), dan paradigma desktop DeX (Right-Click Context Menu, Drag-and-Drop Choreography).
    * **Part V Update**: Memperbarui doktrin *Navigation & Back* (§5.2) untuk menghormati zona tepi OS Android (*24dp Edge Exclusion Zone*).
    * **Phase C Closure**: Menandai selesainya seluruh adaptasi komponen mikro, ergonomi sentuhan, dan interaksi presisi (Steps 7–9). Bersiap memasuki Phase D (PWA Architecture).
* **v2.0.10-DRAFT (2026-08-28)**:
  * **Step 10 Deliverables (PWA Manifest, Install UX & Samsung Internet)**:
    * **Section 8.1**: Mendefinisikan konfigurasi `manifest.json` (standalone, theme_color), *Soft Install Choreography* (mencegah pop-up agresif), dan *App Shortcuts* (Long-Press Quick Actions).
    * **Privacy-First Splash & Recent Apps Shield**: Menetapkan aturan *Splash Screen* bebas PII dan kewajiban `<PrivacyShield />` untuk merender *frosted overlay* saat aplikasi masuk ke Android Recent Apps Switcher (Menegakkan FB-01).
    * **Part IV Update**: Menambahkan hook `useInstallPrompt.ts` ke pustaka UI (§4.4).
    * **Phase D Activation**: Menandai dimulainya fase arsitektur PWA dan sertifikasi final (Steps 10–12).
* **v2.0.11-DRAFT (2026-08-28)**:
  * **Step 11 Deliverables (Offline Architecture & Service Worker)**:
    * **Section 8.2**: Mendefinisikan strategi caching SW (Cache-First, Stale-While-Revalidate, Network-First), arsitektur *IndexedDB Offline Store*, dan *Offline Mutation Queue* dengan *Optimistic UI*.
    * **Stage 4.5 Privacy (FB-01)**: Menetapkan larangan keras menyimpan *Child Dossiers* (Tier 4) di IndexedDB dan kewajiban *Network-Only* untuk data analitik Yayasan (LEARN domain).
    * **Background Sync**: Mendefinisikan rekonsiliasi data saat online kembali, integrasi dengan *ToastHUD* untuk konflik, dan *Exponential Backoff*.
    * **Part IV & V Update**: Menambahkan hook `useOfflineStatus.ts`, service `offlineQueue.ts` (§4.4), dan memperbarui *Invisible Mastery #5* (§5.4) untuk merujuk pada logika SW.
* **v2.0-RELEASE (2026-08-28)**:
  * **Step 12 Deliverables (Final Audit, E2E Testing & Certification)**:
    * **Section 10.5**: Mendefinisikan protokol *Visual Regression Testing (VRT)*, *Accessibility & Modality Audit*, *PWA Offline Stress Test*, dan *Stage 4.5 Glass Layer Adversarial Audit*.
    * **Canonical Sealing**: Dokumen secara resmi disegel sebagai `v2.0-RELEASE`, menggantikan v1.0 dan v1.1 sebagai *Single Source of Truth* permanen.
    * **Roadmap Closure**: Menandai selesainya seluruh 12 langkah (Phase A s.d. D). Yapendik School OS kini memiliki standar UI/UX kelas enterprise yang tahan banting untuk ekosistem Tablet Android & DeX.
* **v3.0.6-PATCH (2026-09-01)**:
  * **ADR-UX-012 Ratification (Slide-Up Chevron Navigation & Hub-and-Spoke)**:
    * **Section 3.1 & 3.4 Update**: Menggantikan Mobile Omni-Bar capsule dan Smart Chips carousel dengan Discrete Bottom Chevron Handle (Lucide ChevronUp, min-h-[48px], aria-label) dan "MENU NAVIGASI" slide-up sheet (Amanaura Spring {380,32,0.8}, search field di puncak, 4×2 squircle flat tiles).
    * **FAB Repositioning**: Amandemen offset kanonikal FAB ke bottom-[calc(env(safe-area-inset-bottom,0px)+20px)] right-4 (G-6), menjamin zero collision terhadap handle tengah.
    * **PWA Soft Install Relocation**: Merelokasi install smart chip secara permanen ke Profile Drawer dan panduan iOS TopBar (G-8, §8.1.2).
    * **CI Guard Calibration**: Kalibrasi Zero Overlay Collisions dan penambahan validasi chevron touch floor min-h-[48px] & larangan raw glyph ⌃ (G-9).
* **v3.0.10-PATCH (2026-09-01)**:
  * **Warm Echo Carousel Canonization & Component Index Sync Guard**:
    * **Section 4.4 & 4.5 Update**: Warm Echo Carousel ratified; §4.4+§4.5 added; R-INDEX-SYNC guard active.
    * **Section 6.4 Cross-Reference**: Menambahkan rujukan silang Gema Hangat → §4.5 pada *Instant Information & Progressive Guidance*.
    * **Surface 4 CI Guard**: `scripts/doc-code-sync.mjs` mengunci sinkronisasi §4.4 terhadap seluruh primitif UI dan workspace ratifikasi (`R-INDEX-SYNC`).
  * **Magnetic Horizon Handle v2 (ADR-UX-012 Addendum IV)**:
    * **Magnetic Swipe Affordance**: Horizon Handle ditingkatkan dengan split hairline notch, radial soft golden glow, micro-lift animation (`animate-horizon-lift`), dan 1-time swipe coachmark tanpa menambah teks permanen.
* **v3.0.11-PATCH (2026-09-01)**:
  * **Horizon Handle v3 — Dawn Aura Affordance (ADR-UX-012 Addendum V)**:
    * **The Dawn Aura Ergonomics**: Horizon Handle ditingkatkan dengan golden chevron (`text-accent-valor`), kolam pendaran fajar 4× (`w-24 h-10 blur-lg bg-accent-valor/18 dark:bg-accent-valor/25`), hairline gradient menyala ke pusat (`via-line-soft to-accent-valor/40`), pernapasan sinkron 3.2s (`animate-horizon-breathe`), dan first-visit bloom 900ms (`animate-horizon-bloom`).
    * **CI Guard Hardening**: Memperluas aturan `R-HORIZON-MAGNETIC` pada `scripts/amanaura-audit.mjs` untuk memvalidasi keberadaan golden chevron dan glow pool serta melarang penggunaan `text-ink-faint` pada chevron.
* **v3.0.12-PATCH (2026-09-01)**:
  * **Horizon Handle v3.1 — Ivory Calibration Micro-Patch (ADR-UX-012 Addendum V)**:
    * **New Color Token `--valor-deep`**: Menambahkan token perunggu dalam `--valor-deep: oklch(0.55 0.12 75)` di Ivory Canvas (kontras 3:1 WCAG non-teks) dan alias bright gold `oklch(0.80 0.15 85)` di Midnight Sanctuary.
    * **Ivory Horizon Affordance**: Mengkalibrasi chevron light ke `text-valor-deep`, gradien hairline light ke `via-line-strong to-valor-deep/60`, meningkatkan glow ke `bg-accent-valor/28`, menghapus chip putih (paritas penuh kanvas), dan menambahkan pita *sunrise tint*.
    * **4-Surface Sync & CI Guard**: `scripts/doc-code-sync.mjs` mengunci 44 Light dan 45 Dark tokens, dan `R-HORIZON-MAGNETIC` mendukung pasangan tema `text-valor-deep` / `text-accent-valor`.
* **v3.0.13-PATCH (2026-09-01)**:
  * **Horizon Handle v4 — The Peeking Horizon (ADR-UX-012 Addendum VI)**:
    * **The Peeking Notch Ergonomics**: Horizon Handle ditingkatkan dengan notch navy (`w-20 h-9 rounded-t-2xl bg-brand dark:bg-surface-subtle`) yang menempel (*flush*) di tepi bawah sebagai pratinjau bibir sheet navigasi.
    * **Universal Golden Chevron**: Chevron emas `text-accent-valor` (`strokeWidth={2.5}`) terbaca dengan kontras mutlak 8:1 di atas navy (Light) dan 5:1 di atas elevated night (Dark).
    * **Warm Sky Gradient Canopy**: Kanopi fajar `h-14 bg-gradient-to-t` membentang di atas garis horizon menggantikan blur pool.
    * **CI Guard Hardening**: Memperbarui aturan `R-HORIZON-MAGNETIC` pada `scripts/amanaura-audit.mjs` untuk mengunci struktur notch dan melarang bayangan melayang (`shadow-floating`).
* **v3.0.14-PATCH (2026-09-01)**:
  * **Sheet & Profile Hygiene — 3-Col Wrap & Role-Aware Curation (ADR-UX-012 Addendum VII)**:
    * **No Search in COMPACT Sheet**: Mengamandemen Guardrail G-2 untuk mencegah oklusi keyboard virtual pada navigasi mobile.
    * **3-Column Grid with Full Label Wrap**: Mengganti 4x2 grid dengan `grid-cols-3 gap-3` dan `break-words` tanpa truncate/ellipsis (contoh: "Buku Penghubung" melipat 2 baris).
    * **Role-Aware Curation**: Menghapus baris Living Contract, Uji Otorisasi TESTS, dan Cloud Sync SHA dari chrome guru di MobileOmniBar dan ProfileDrawer (akses langsung via URL tetap aktif).
* **v3.0.15-PATCH (2026-09-01)**:
  * **Single-Surface Launcher Consolidation (ADR-UX-012 Addendum VIII)**:
    * **3×3 Perfect Grid (8 Primitives + Profil Tile)**: Tile Profil melengkapi grid menjadi 3×3 simetris, membuka ProfileDrawer sebagai kartu identitas murni.
    * **Action-Oriented Utility Footer**: Menyematkan toggle inline Tema Visual `[Ivory | Midnight]` (SegmentedControl), Panduan Pasang PWA/iOS, dan Keluar dari Sesi (danger tint di paling bawah).
    * **Single Control Point 432Hz Audio Gate**: Kontrol denting 432Hz dipusatkan secara eksklusif pada kartu ritual beranda pendidik.
* **v3.0.16-PATCH (2026-09-01)**:
  * **Profile Hub v2, CR80 Digital Name Card & Supabase User Management (ADR-UX-013)**:
    * **Avatar & Profile Management**: Upload foto dengan Canvas 512px downscale, integrasi bucket `staff-avatars` dan dialog edit nama & masked phone (+62).
    * **CR80 "Agung" Digital Name Card**: Kartu nama digital 85.6×54mm (landscape) dengan Instrument Serif, watermark Padma & Gunungan (≤4%), ornamen sudut brass (15%), dan QR Code terverifikasi tanpa kebocoran kredensial.
    * **Security & Biometric Preferences**: Ganti kata sandi mandiri, passkey soft-toggle (#DW-02), doktrin email immutability, dan penghapusan panduan install statis (#DW-01).
* **v3.0.17-PATCH (2026-09-01)**:
  * **Persona-Aware Name Card — Guardian Family Card & Desktop Sidebar Utilities (ADR-UX-013 Addendum X)**:
    * **Kartu Keluarga (Pickup Verification Card)**: Percabangan otomatis pada NameCardModal saat persona GUARDIAN aktif: foto/AvatarChild anak sebagai visual anchor, nama anak dalam Instrument Serif, kelas, blok orang tua/wali primer & terkait, dan kontak wali.
    * **Privacy Shield**: Pagar privasi mutlak dengan proteksi zero NIK/NIS anak pada permukaan kartu fisik/digital.
    * **Desktop Sidebar Chrome Completeness**: Menyematkan kontrol Tema Visual `[Ivory | Midnight]` dan Keluar dari Sesi pada bottom utility sidebar desktop, serta mereformasi aksi penutup Profile Hub menjadi *Selesai & Simpan Profil*.


