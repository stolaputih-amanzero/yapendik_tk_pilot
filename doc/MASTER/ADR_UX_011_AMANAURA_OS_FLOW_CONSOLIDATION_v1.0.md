# ADR-UX-011: AMANAURA OS × FLOW CONSOLIDATION CHARTER
## The Canonical Tri-Layer Master Specification: Platform Identity, Visual Soul, Adaptive Chrome, and Weight Discipline

**METADATA**

| Atribut | Nilai |
| --- | --- |
| Document ID | `ADR-UX-011-AMANAURA-OS-FLOW-v1.0` |
| Version | `1.0-RATIFIED` |
| Governing Tier | `LEVEL 2 — MASTER SPECIFICATION & GLOBAL PRODUCT STANDARD` |
| Status | **CANONICAL LIVING MASTER SPECIFICATION (AMANAURA OS ERA)** |
| Ratification Date | `2026-08-30` |
| Supersedes | `ADR-UX-005 (Padma Modern)`, `ADR-UX-006 (Tokens SSOT)`, `ADR-UX-007 (Yapendik Sync)`, `ADR-UX-008 (Crystal Sovereign)`, `ADR-UX-009 (Zero Webfont)`, `ADR-UX-010 (Flat Fluid Addendum I & II)`, `Amanaura v3.0-RELEASE` (parsial — bagian visual) |
| Preserved Pillars | 12 Refactoring Laws, 6 Signatures, MD3/DeX/modality, Kamus Pendidik/Keluarga, Threshold Rule, z-scales 40–80, VRT Protocol, Stage 4.5 & 6-A Frozen Baselines |
| Authoritative Standard | Derived from `YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2` & `FLOW DESIGN MANIFESTO` |
| Target Scope | Global Architecture Standard untuk Amanaura OS dan seluruh ekosistem produk multi-tenant masa depan |

---

# DAFTAR ISI

- [1. EXECUTIVE INTENT: THE TRI-LAYER ARCHITECTURE](#1-executive-intent-the-tri-layer-architecture)
- [2. IDENTITY & BRAND SUPERSESSION](#2-identity--brand-supersession)
  - [2.1 Nomenklatur Multi-Tenant](#21-nomenklatur-multi-tenant)
  - [2.2 Manifestasi Identitas Lintas Viewport](#22-manifestasi-identitas-lintas-viewport)
  - [2.3 Web App Manifest (PWA)](#23-web-app-manifest-pwa)
- [3. FLOW VISUAL SOUL ADOPTION & "REBIND, DON'T RENAME" DOCTRINE](#3-flow-visual-soul-adoption--rebind-dont-rename-doctrine)
  - [3.1 Doktrin Migrasi "Rebind, Don't Rename"](#31-doktrin-migrasi-rebind-dont-rename)
  - [3.2 Color Architecture (oklch-based)](#32-color-architecture-oklch-based)
  - [3.3 Typography System (Heritage Meets Hyper-Modern)](#33-typography-system-heritage-meets-hyper-modern)
  - [3.4 Elevation: Colored Shadows](#34-elevation-colored-shadows)
  - [3.5 Preservasi Motif Kultural Nusantara](#35-preservasi-motif-kultural-nusantara)
- [4. ADAPTIVE CHROME DOCTRINE](#4-adaptive-chrome-doctrine)
  - [4.1 TopBar: Context Bar, Not Brand Bar](#41-topbar-context-bar-not-brand-bar)
  - [4.2 Mobile Profile Drawer](#42-mobile-profile-drawer)
  - [4.3 Desktop Sidebar](#43-desktop-sidebar)
  - [4.4 Lantai Ergonomi & Touch Target](#44-lantai-ergonomi--touch-target)
- [5. THE LIVING SHELL](#5-the-living-shell)
  - [5.1 Amanaura Breath ✦: Life & Connection Indicator (D-10)](#51-amanaura-breath--life--connection-indicator-d-10)
  - [5.2 Trinitas Refresh (D-11)](#52-trinitas-refresh-d-11)
  - [5.3 Installable di Seluruh Viewport](#53-installable-di-seluruh-viewport)
- [6. FLAT FLUID ADDENDUM III: SECTION LEGIBILITY](#6-flat-fluid-addendum-iii-section-legibility)
  - [6.1 Tangga Legibilitas Flat Fluid (Lv 1 s.d. Lv 7)](#61-tangga-legibilitas-flat-fluid-lv-1-sd-lv-7)
  - [6.2 Doktrin Legibilitas (R-0 s.d. R-7 Verbatim)](#62-doktrin-legibilitas-r-0-sd-r-7-verbatim)
- [7. WEIGHT DISCIPLINE LAWS (R-8 & R-9)](#7-weight-discipline-laws-r-8--r-9)
  - [7.1 Hukum R-8: Navigation is Text, Not Objects](#71-hukum-r-8-navigation-is-text-not-objects)
  - [7.2 Hukum R-9: Icons are Glyphs, Not Objects](#72-hukum-r-9-icons-are-glyphs-not-objects)
  - [7.3 Allowlist Pengecualian & Rem-Based Icon Scaling](#73-allowlist-pengecualian--rem-based-icon-scaling)
- [8. ADR SUPERSESSION MATRIX](#8-adr-supersession-matrix)
- [9. IMPLEMENTATION ROADMAP (RE-SKIN SPRINTS A s.d. D)](#9-implementation-roadmap-re-skin-sprints-a-sd-d)
- [10. OFFICIAL CERTIFICATION & SEALING BLOCK](#10-official-certification--sealing-block)

---

# 1. EXECUTIVE INTENT: THE TRI-LAYER ARCHITECTURE

Piagam ini menetapkan unifikasi arsitektural antara sistem operasi institusional pendidikan dan bahasa desain modern. Struktur produk disusun dalam **3 Lapis Tak Terpisahkan**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ LAPIS 1 — SOUL (AMANAURA FLOW)   • Meta-Sistem, Netral Produk           │
│  - Filosofi "Invisible Structure • Timeless & Endless"                  │
│  - Satu fisika gerak universal: Amanaura Spring { 380, 32, 0.8 }        │
│  - Disiplin angka (Mono = Operasional, Serif = Seremonial, Tabular Nums)│
│  - Colored shadows eksklusif floating; hairline untuk konten statis     │
│  - Fluid clamp() spacing • Breath ✦ sebagai tanda hidup & koneksi       │
│  - Aturan 80/20: Warm Gold khusus aksen nilai dan momen tertinggi      │
├─────────────────────────────────────────────────────────────────────────┤
│ LAPIS 2 — SKIN (TOKEN PRODUK)    • Milik Masing-Masing Tenant           │
│  - Amanaura OS (Tenant Pendidikan/Yapendik): Deep Navy + Warm Gold      │
│  - FlowProject (Tenant Gereja/Komunitas): Deep Navy + Warm Gold         │
│  - Future Tenants: Skin dapat disesuaikan, Soul tetap identik          │
├─────────────────────────────────────────────────────────────────────────┤
│ LAPIS 3 — SPINE (GOVERNANCE)     • Saraf Bersama & Sistem Penegakan     │
│  - Stage Gates • 12 Refactoring Laws • Invarian (FB, H, T, D series)    │
│  - MD3 / DeX / Modality • Adversarial CI Suites • Kamus Pendidik/Keluarga│
│  - 6 Signatures Amanaura • VRT Baseline • Token Purity CI Guards        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 2. IDENTITY & BRAND SUPERSESSION

## 2.1 Nomenklatur Multi-Tenant

Untuk menjamin kedaulatan platform jangka panjang, pemisahan entitas didefinisikan secara tegas:
- **`Amanaura OS`**: Nama resmi produk, platform, dan sistem operasi.
- **`Yapendik`**: Nama *tenant* / unit penggunaan (misal: *TK Yapendik Menteng*, *TK Yapendik Cempaka*). Yapendik bukan lagi nama platform software.
- **`FLOW`**: Jiwa visual (*visual soul*), filosofi spasial, dan estetika antarmuka.
- **`Amanaura`**: Sistem saraf tata kelola (*governance spine*), gerbang sirkadian, dan doktrin etika.

## 2.2 Manifestasi Identitas Lintas Viewport

| Lokasi / Viewport | Yang Ditampilkan (Kanonikal) | Yang DILARANG (Anti-Pattern) |
|---|---|---|
| **TopBar COMPACT (Mobile)** | `[ Judul Halaman Aktif ]` + `[ Avatar User ✦ ]` | Logo brand panjang, nama aplikasi, metadata tenant berat |
| **TopBar MEDIUM (Tablet)** | `[ Judul Halaman Aktif ]` + `[ Avatar User ✦ ]` | Logo brand duplikatif, badge institusi ganda |
| **TopBar EXPANDED (Desktop)** | `[ Judul Halaman Aktif ]` + `[ Tenant Chip Kecil ]` + `[ Avatar User ✦ ]` | Logo banner penuh di atas canvas |
| **Sidebar EXPANDED (Desktop)** | `Amanaura OS ✦` (Brand Mark) + Tenant Switcher + Navigasi Flat | — |
| **Profile Drawer Mobile** | Identitas User, Tenant Aktif, Switcher Unit, Tema, Suara 432Hz, Sync Status, Logout | Header statis yang memakan viewport |
| **Splash Screen (Cold Open)** | `Amanaura OS ✦` (Mark + Breath denyut emas di atas Midnight Sanctuary) | Screenshot konten usang, foto siswa, data PII |
| **Recent Apps Thumbnail** | `PrivacyShield` frosted overlay (FB-01) | Tampilan live dokumen/data siswa |

## 2.3 Web App Manifest (PWA)

```json
{
  "name": "Amanaura OS",
  "short_name": "Amanaura",
  "description": "The Warm, Tactile, and Dignified Operating Experience.",
  "start_url": "/",
  "display": "standalone",
  "orientation": "any",
  "theme_color": "oklch(0.25 0.06 260)",
  "background_color": "oklch(0.15 0.02 260)",
  "icons": [
    {
      "src": "/icons/amanaura-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/amanaura-512.png",
      "sizes": "512x512",
      "type": "image/png"
    },
    {
      "src": "/icons/amanaura-maskable.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ]
}
```

---

# 3. FLOW VISUAL SOUL ADOPTION & "REBIND, DON'T RENAME" DOCTRINE

## 3.1 Doktrin Migrasi "Rebind, Don't Rename"

Untuk memastikan migrasi visual tidak memicu regresi pada **403/403 checks** Master Test Suite atau merombak ribuan baris kelas utilitas semantik, berlaku doktrin mutlak:

> **HUKUM MIGRASI:** Seluruh nama token utilitas semantik (`text-ink`, `bg-surface`, `bg-surface-subtle`, `border-line`, `text-brand-primary`, dll.) **TIDAK BOLEH DIUBAH NAMANYA**. Pengembang wajib mengikat ulang (*rebind*) nilai variabel CSS di `@theme` ke format ruang warna modern `oklch()`. Utilitas baru (`accent-valor`, `shadow-soft/medium/float`, `font-serif`) ditambahkan secara aditif.

## 3.2 Color Architecture (oklch-based)

### Light Mode (The Ivory Canvas)
```css
:root {
  /* Surface & Canvas (Ivory Rhythm) */
  --canvas: oklch(0.985 0.005 90);           /* Warm Ivory */
  --surface: oklch(1 0 0);                    /* Pure White */
  --surface-subtle: oklch(0.96 0.005 90);
  --surface-glass: oklch(0.985 0.005 90 / 0.85);
  --surface-inset: oklch(0.2 0.02 260);       /* Charcoal Navy */
  
  --ink: oklch(0.2 0.02 260);                 /* Charcoal Navy */
  --ink-soft: oklch(0.5 0.02 260);            /* Slate Navy */
  --ink-faint: oklch(0.7 0.01 260);
  
  --line: oklch(0.92 0.005 90);
  --line-hairline: oklch(0.94 0.003 90);
  --line-soft: oklch(0.95 0.003 90);
  --line-strong: oklch(0.85 0.01 90);
  
  --brand: oklch(0.25 0.06 260);              /* Deep Navy */
  --brand-deep: oklch(0.18 0.05 260);
  --brand-tint: oklch(0.25 0.06 260 / 0.10);
  --brand-accent: oklch(0.75 0.14 85);        /* Warm Gold (accent-valor) */
  --accent-valor: oklch(0.75 0.14 85);
  --on-brand: oklch(0.985 0.005 90);          /* Warm Ivory */
  --on-accent: oklch(0.15 0.02 260);
  
  /* Semantic signals */
  --success: oklch(0.55 0.15 145);            /* Moss */
  --success-deep: oklch(0.45 0.12 145);
  --success-tint: oklch(0.95 0.02 145);
  --success-line: oklch(0.85 0.05 145);
  
  --warning: oklch(0.65 0.15 60);             /* Clay */
  --warning-deep: oklch(0.55 0.12 60);
  --warning-tint: oklch(0.95 0.03 60);
  --warning-line: oklch(0.85 0.06 60);
  
  --danger: oklch(0.55 0.18 25);              /* Rust */
  --danger-deep: oklch(0.45 0.15 25);
  --danger-tint: oklch(0.95 0.04 25);
  --danger-line: oklch(0.85 0.07 25);
  
  --info: oklch(0.55 0.12 240);               /* River */
  --info-deep: oklch(0.45 0.1 240);
  --info-tint: oklch(0.95 0.02 240);
  --info-line: oklch(0.85 0.05 240);
  
  --lppa: oklch(0.55 0.14 300);               /* Wisteria */
  --lppa-deep: oklch(0.45 0.12 300);
  --lppa-tint: oklch(0.95 0.03 300);
  --lppa-line: oklch(0.85 0.06 300);
  
  /* Jenjang warna */
  --jj-tk: oklch(0.65 0.15 50);
  --jj-sd: oklch(0.55 0.15 145);
  --jj-smp: oklch(0.55 0.12 240);
  --jj-sma: oklch(0.55 0.14 300);
}
```

### Dark Mode (The Midnight Sanctuary — Diaktifkan via Class `.dark`)
```css
.dark {
  /* Surface & Canvas (OLED-Calibrated Midnight) */
  --canvas: oklch(0.15 0.02 260);             /* Deep Midnight */
  --surface: oklch(0.20 0.02 260);            /* Elevated Night */
  --surface-subtle: oklch(0.25 0.02 260);
  --surface-glass: oklch(0.18 0.025 260 / 0.85);
  --surface-inset: oklch(0.95 0.005 90);      /* Warm Ivory */
  
  --ink: oklch(0.95 0.005 90);
  --ink-soft: oklch(0.65 0.02 260);
  --ink-faint: oklch(0.45 0.01 260);
  
  --line: oklch(0.25 0.02 260);
  --line-hairline: oklch(0.22 0.015 260);
  --line-soft: oklch(0.20 0.02 260);
  --line-strong: oklch(0.35 0.02 260);
  
  --brand: oklch(0.75 0.1 260);               /* Luminous Navy */
  --brand-deep: oklch(0.85 0.08 260);
  --brand-tint: oklch(0.75 0.1 260 / 0.16);
  --brand-accent: oklch(0.80 0.15 85);        /* Bright Gold */
  --accent-valor: oklch(0.80 0.15 85);
  --on-brand: oklch(0.15 0.02 260);           /* Deep Midnight */
  --on-accent: oklch(0.15 0.02 260);
  
  --success: oklch(0.75 0.12 145);
  --success-deep: oklch(0.85 0.1 145);
  --success-tint: oklch(0.25 0.03 145);
  --success-line: oklch(0.35 0.05 145);
  
  --warning: oklch(0.80 0.12 60);
  --warning-deep: oklch(0.90 0.1 60);
  --warning-tint: oklch(0.30 0.04 60);
  --warning-line: oklch(0.40 0.06 60);
  
  --danger: oklch(0.75 0.15 25);
  --danger-deep: oklch(0.85 0.12 25);
  --danger-tint: oklch(0.30 0.05 25);
  --danger-line: oklch(0.40 0.07 25);
  
  --info: oklch(0.75 0.1 240);
  --info-deep: oklch(0.85 0.08 240);
  --info-tint: oklch(0.25 0.03 240);
  --info-line: oklch(0.35 0.05 240);
  
  --lppa: oklch(0.75 0.12 300);
  --lppa-deep: oklch(0.85 0.1 300);
  --lppa-tint: oklch(0.30 0.04 300);
  --lppa-line: oklch(0.40 0.06 300);
  
  --jj-tk: oklch(0.80 0.12 50);
  --jj-sd: oklch(0.75 0.12 145);
  --jj-smp: oklch(0.75 0.1 240);
  --jj-sma: oklch(0.75 0.12 300);
  
  --shadow-luminescent: 0 0 0 1.5px var(--ink), 0 0 16px -6px oklch(0.75 0.1 260 / 0.28);
}
```

### Semantic Signals (oklch Conversion)
- **Success (Moss):** `oklch(0.62 0.14 145)` (Light) / `oklch(0.72 0.13 145)` (Dark)
- **Warning (Clay):** `oklch(0.68 0.15 55)` (Light) / `oklch(0.78 0.14 55)` (Dark)
- **Danger (Rust):** `oklch(0.55 0.18 25)` (Light) / `oklch(0.65 0.17 25)` (Dark)
- **Info (River):** `oklch(0.58 0.12 230)` (Light) / `oklch(0.70 0.11 230)` (Dark)
- **LPPA (Wisteria):** `oklch(0.60 0.14 300)` (Light) / `oklch(0.74 0.13 300)` (Dark)

---

## 3.3 Typography System (Heritage Meets Hyper-Modern)

| Layer Tipografi | Font Family Kanonikal | Fallback Stack | Kasus Penggunaan Utama |
|---|---|---|---|
| **UI & Body** | `Geist Sans` | `Inter, -apple-system, system-ui, sans-serif` | Navigasi, tombol, label formulir, teks paragraf, chips |
| **Data & Kode** | `Geist Mono` | `JetBrains Mono, Menlo, monospace` | NISN, NIK, jam lokal, ID transaksi, REF-code, angka kuantitatif |
| **Display & Seremonial** | `Instrument Serif` | `Playfair Display, Georgia, serif` | Sapaan Warm Briefing, kutipan Warm Echo, judul LPPA, sertifikat, layar Tutup Hari, angka finansial Yayasan |

### Aturan Emas Tipografi:
1. **`tabular-nums` Mutlak:** Seluruh angka di tabel, jam, presensi, dan chip wajib menggunakan `font-variant-numeric: tabular-nums` (atau utilitas `tabular-nums`).
2. **Fluid Typography:** Menggunakan skala `clamp()` adaptif (*Senior Eye Elasticity preserved*).
3. **Strict Allowlist Instrument Serif:** Penggunaan font serif dibatasi secara ketat hanya pada 6 konteks seremonial resmi di atas. Dilarang keras menggunakan serif pada tombol aksi, header tabel, formulir input, atau grid data operasional.
4. **Strategi Pemuatan Font (*Zero FOIT*):** Font dimuat secara lokal via bundle `@fontsource` dengan deklarasi CSS `font-display: swap` untuk menjamin rendering teks instan pada koneksi lambat.

---

## 3.4 Elevation: Colored Shadows

Sesuai doktrin FLOW, bayangan netral hitam/abu-abu digantikan oleh bayangan ber-rona Navy (*Navy-tinted ambient luminance*):

```css
/* Colored Shadows (Khusus Floating Elements) */
--shadow-soft: 
  0 4px 24px -4px oklch(0.25 0.06 260 / 0.08), 
  0 2px 8px -2px oklch(0.25 0.06 260 / 0.04);

--shadow-medium: 
  0 8px 32px -8px oklch(0.25 0.06 260 / 0.12), 
  0 4px 12px -4px oklch(0.25 0.06 260 / 0.08);

--shadow-float: 
  0 16px 48px -12px oklch(0.25 0.06 260 / 0.18), 
  0 8px 24px -8px oklch(0.25 0.06 260 / 0.12);
```

### Allowlist Elevasi (Reinterpretasi Hukum F-5):
- **Konten Statis Kanvas:** Wajib flat tanpa shadow; pemisahan dicapai melalui hairlines atau tone bands.
- **`shadow-soft`**: Kartu floating interaktif (misal: pratinjau momen saat di-hover/tap).
- **`shadow-medium`**: Dropdown menu, popover, tooltips.
- **`shadow-float`**: MobileOmniBar, Floating Action Button (FAB), Modal Dialog, ToastHUD.

---

## 3.5 Preservasi Motif Kultural Nusantara

Sebagai penegasan identitas peradaban, motif kultural Nusantara (*Poleng, Padma, Gunungan*) **tetap hidup** sebagai tanda tangan budaya tingkat tinggi (*High Cultural Signature*):
- Diterapkan secara halus sebagai watermarking SVG dengan opasitas sangat rendah ($\le 4\%$) pada kanvas hero atau sertifikat kelulusan.
- Tidak boleh mengganggu keterbacaan teks atau kontras warna WCAG AAA.

---

# 4. ADAPTIVE CHROME DOCTRINE

## 4.1 TopBar: Context Bar, Not Brand Bar

TopBar bertransformasi menjadi *Context Bar* yang fungsional, bersih, dan menghormati fokus kerja pengguna:

```
COMPACT (Mobile):
┌───────────────────────────────────────────────────────────┐
│ [ Judul Halaman Aktif ]                     [ Avatar ✦ ] │
└───────────────────────────────────────────────────────────┘
```
- **Sisi Kiri:** Judul halaman yang sedang aktif (diambil secara otomatis dari route registry).
- **Sisi Kanan:** Tombol Profil (Avatar pengguna dengan presence marker Amanaura Breath `✦`).
- **Larangan Mutlak:** Dilarang meletakkan logo brand besar, nama aplikasi panjang, atau dropdown tenant berat di TopBar mobile.

## 4.2 Mobile Profile Drawer

Pusat kendali dan metadata yang dipindahkan dari TopBar mobile ke drawer bawah (*Bottom Sheet Drawer*):
- Identitas Pengguna (Nama, Foto/Avatar, Peran Aktif).
- Tenant Aktif (misal: *TK Yapendik Menteng*).
- Switcher Unit Pendidikan / Lembaga.
- Pengaturan Tema (Sistem / Terang / Gelap).
- Toggle Denting Harmonis 432Hz (D-7).
- Status Sinkronisasi & Versi Amanaura OS.
- Panduan Pemasangan Aplikasi (PWA Install Guide).
- Tombol Keluar (*Sign Out*).

## 4.3 Desktop Sidebar

Sidebar pada layar lebar (*Expanded Desktop / DeX*) menjadi rumah resmi identitas brand:
- Logo resmi `Amanaura OS ✦`.
- Selector Tenant / Unit Pendidikan.
- Navigasi Flat (Hukum R-8).
- Profil mini pengguna di bagian bawah.

## 4.4 Lantai Ergonomi & Touch Target

Mengikuti aturan terketat (*Stricter Rule Wins*):
- **Interaksi Sentuh (Mobile/Tablet Touch):** Lantai minimum **$48\text{dp} \times 48\text{dp}$** (menjamin kemudahan penggunaan bagi pendidik senior).
- **Interaksi Mouse / Stylus:** Minimum $32\text{dp} \times 32\text{dp}$.

---

# 5. THE LIVING SHELL

## 5.1 Amanaura Breath ✦: Life & Connection Indicator (D-10)

Tanda tangan visual Amanaura Breath (`✦`) kini memikul semantik ganda: **Tanda Kehidupan Sirkadian** dan **Indikator Konektivitas**:

```
┌───────────────────────────────────────────────────────────────────────────┐
│ 1. ONLINE (Terhubung Normal)                                              │
│    Warna: Emas (oklch accent-valor) • Denyut: 4 detik (Resting Pulse)    │
│    Makna: Sistem hidup, tersinkronisasi, dan terhubung ke server.         │
├───────────────────────────────────────────────────────────────────────────┤
│ 2. OFFLINE (Antrean Mutasi Kosong)                                        │
│    Warna: Abu-Emas Redup • Denyut: 8 detik Melambat ("Menahan Napas")     │
│    Makna: Sistem hidup, data tersimpan aman di perangkat lokal.           │
├───────────────────────────────────────────────────────────────────────────┤
│ 3. OFFLINE (Ada Antrean Mutasi Tertunda)                                  │
│    Wajah Breath: Sama dengan status #2                                    │
│    Pendamping: Status Dot Capsule [ ● N Menunggu Sinkronisasi ]           │
│    Makna: Terdapat perubahan data offline yang siap dikirim saat online.  │
├───────────────────────────────────────────────────────────────────────────┤
│ 4. REKONSILIASI (Sedang Menyamakan Data)                                  │
│    Warna: Kilau Emas Lembut Sesaat (Glint Animation), lalu kembali normal│
│    Makna: Proses jabat tangan latar belakang selesai tanpa mengganggu UI. │
└───────────────────────────────────────────────────────────────────────────┘
```

### Kewajiban Aksesibilitas:
Elemen Breath **wajib** dilengkapi atribut `aria-label` dan `title` yang deskriptif (misal: `aria-label="Status: Terhubung ke Server"` atau `aria-label="Status: Mode Offline — Data Aman di Perangkat"`). Keterangan status tidak boleh hanya bergantung pada warna visual.

---

## 5.2 Trinitas Refresh (D-11)

Sistem mengadopsi prinsip *Inherent Refresh* — antarmuka disegarkan secara organik tanpa tombol refresh yang mencolok:

1. **Event-Driven Refresh (Otomatis Utama):**
   - Terpicu saat event `online` (Background Sync).
   - Terpicu saat event `visibilitychange` (pengguna kembali membuka tab aplikasi).
   - Terpicu saat transisi fase sirkadian (misal: pergantian jam sentra).
2. **Soft Interval Refresh (Otomatis Berkala):**
   - Polling halus setiap $\pm 90\text{–}120$ detik hanya saat aplikasi berada di latar depan (*foreground*) dan dalam mode `OPERASIONAL`.
   - Nonaktif penuh saat mode `PENUTUP` (menghormati *Right to Rest* D-8) dan saat tab tersembunyi.
3. **User-Initiated Refresh (Gestur Pengguna):**
   - **Mobile:** Gestur *pull-to-refresh* kustom (`overscroll-behavior-y: contain`).
   - **Desktop:** Tombol *icon-only ghost* sekunder di header kanvas workspace (bukan di TopBar).
4. **Umpan Balik Visual:** Kilau lembut pada glyph Breath `✦` disertai teks mikro *"Diperbarui pukul hh:mm"*. Dilarang menggunakan *full-page loading spinner* yang memblokir interaksi.

---

## 5.3 Installable di Seluruh Viewport

- PWA Smart Chip `[ ⬇️ Pasang Aplikasi ]` pada Mobile Omni-Bar (Compact).
- Panduan pemasangan di Profile Drawer (Expanded).
- Dialog panduan adaptif untuk pengguna iOS/iPadOS (*Bagikan $\rightarrow$ Tambah ke Layar Utama*).
- Otomatis menyembunyikan ajakan pasang saat aplikasi telah berjalan dalam mode `display-mode: standalone`.

---

## 5.4 Doktrin Fisika Tunggal (Single Physics Doctrine)

Sesuai Hukum M-5 (*Unified Motion Physics*), sistem melarang kehadiran dua model kurva fisika yang bersaing di runtime:
- **Single Source of Motion Truth:** Konstanta **Amanaura Spring** `{ stiffness: 380, damping: 32, mass: 0.8 }` adalah satu-satunya kurva dinamika gerak kanonikal pada transisi modal dialog, lembar geser (*sheet*), dan umpan balik taktil.
- **Harmonisasi Bezier FLOW:** Kurva FLOW `--ease-spring` dipetakan secara konseptual ke parameter pegas Amanaura Spring di atas; kurva bezier CSS ad-hoc (`ease-bounce`, `--ease-spring`, dsb.) dilarang keras di kelas utilitas komponen hidup (`R-PHYSICS`).

---

# 6. FLAT FLUID ADDENDUM III: SECTION LEGIBILITY

## 6.1 Tangga Legibilitas Flat Fluid (Lv 1 s.d. Lv 7)

Tangga Legibilitas adalah hierarki kanonikal untuk memisahkan seksi konten tanpa menggunakan kotak bersarang (*anti-boxiness*):

| Level | Instrumen Pemisah | Sintaks CSS Kanonikal | Biaya Visual | Kasus Penggunaan Ideal |
|---|---|---|---|---|
| **Lv 1** | **Micro-Gap** | `space-y-2` / `space-y-3` / `gap-2` | Sangat Rendah | Pemisah antar-elemen di dalam satu komponen kohesif |
| **Lv 2** | **Hairline Divider** | `divide-y divide-line-hairline` | Rendah | Pemisah baris data linear berurutan (misal: daftar siswa) |
| **Lv 3** | **Eyebrow + Macro-Gap** | `space-y-6` + `text-xs font-bold uppercase tracking-wider` | Sedang | Pemisah antar-kelompok data dalam satu modul |
| **Lv 4** | **Tone Band Full-Bleed** | `bg-surface-subtle` bleed edge-to-edge | Menengah | Membedakan area kerja utama dengan area rangkuman |
| **Lv 5** | **Sticky Section Header** | `sticky top-0 bg-canvas/80 backdrop-blur-xs h-10` | Terarah | Menjaga konteks seksi panjang ($> \pm 1.5$ viewport) |
| **Lv 6** | **Promosi Tab / Swipe** | `SegmentedControl` flat / horizontal swipe | Fungsional | Kategori setara $> 4$ (Threshold Rule) pada layar mobile |
| **Lv 7** | **Progressive Collapse** | Accordion disclosure (`min-h-[48px]`) | Bersyarat | Formulir administratif sekunder atau riwayat lampau |

---

## 6.2 Doktrin Legibilitas (R-0 s.d. R-7 Verbatim)

- **`R-0` (Information Architecture First):** Maksimal 3–4 kategori data utama yang terlihat secara bersamaan pada satu layar *Compact Mobile*.
- **`R-1` (Single Strong Signal):** Hanya diizinkan satu sinyal kuat (Lv 4–7) per kategori data; pemisahan di dalam kategori wajib menggunakan sinyal halus (Lv 1–3).
- **`R-2` (No Boundary Stacking):** Dilarang menumpuk dua sinyal kuat pada batas seksi yang sama (misal: *Tone band* tidak boleh diberi *hairline* tebal sekaligus).
- **`R-3` (Length-Gated Sticky):** Header seksi hanya boleh dijadikan *sticky* apabila panjang kontennya melebihi $\pm 1.5$ tinggi viewport.
- **`R-4` (Horizontal Promotion on Compact):** Kategori data setara (*peer categories*) tidak boleh ditumpuk vertikal berlebihan di layar mobile $\rightarrow$ wajib dipromosikan menjadi Tab / Horizontal Swipe jika $> 4$ entri (*Threshold Rule*).
- **`R-5` (Full-Bleed Banding):** Perubahan latar belakang tone band wajib menyentuh tepi layar (*edge-to-edge full-bleed*), bukan kartu berkotak yang mengambang dengan margin.
- **`R-6` (Strict Chrome Budget):** Anggaran tinggi sticky header $\le 40\text{px}$, baris collapse $= 48\text{px}$, full-bleed banding $= 0\text{px}$ margin.
- **`R-7` (Quiet Dark Calibration):** Pada Dark Mode OLED, kontras latar belakang antar-seksi dijaga sangat tenang dan sunyi (`oklch(0.15 ...)` vs `oklch(0.18 ...)`, maksimal variasi 2 nada).

---

# 7. WEIGHT DISCIPLINE LAWS (R-8 & R-9)

## 7.1 Hukum R-8: Navigation is Text, Not Objects

1. **Navigasi Flat:** Baris tautan navigasi pada saat diam (*rest state*) tidak boleh memiliki latar belakang kotak berwarna (*zero boxed container*).
2. **Indikator Aktif:** Tautan navigasi aktif ditandai secara elegan dengan **garis aksen kiri $2\text{px}$** (`border-l-2 border-brand-primary`) dan bobot teks `font-semibold text-ink`.
3. **Area Sentuh Ergonomis:** Meskipun berwujud flat, area interaksi (*hit-area*) wajib memenuhi standar **$48\text{dp}$**. Flat bukan berarti kecil.

---

## 7.2 Hukum R-9: Icons are Glyphs, Not Objects

Ikon adalah glif penjelas teks, bukan objek dekoratif berbingkai. Setiap ikon yang diletakkan di antarmuka wajib lolos salah satu dari **3 Uji Kanonikal**:

1. **Semantic-Only Test:** Ikon membawa status fungsional penting (misal: status dot koneksi, segitiga alert keselamatan, glif Breath `✦`).
2. **Space-Only Test:** Ikon menggantikan teks pada ruang terbatas (misal: icon rail collapsed dengan atribut `aria-label` wajib).
3. **Signature Test:** Ikon merupakan tanda tangan sistem resmi (*Amanaura Breath*, *AvatarChild*).

### Larangan Mutlak Wadah Ikon:
Dilarang membungkus satu ikon Lucide yang berdiri sendiri dengan kontainer lingkaran (`rounded-full`) atau kotak berlatar belakang (`bg-surface-subtle rounded-xl`), kecuali yang telah diizinkan dalam allowlist.

### Aturan CI Guard:
Skrip `scripts/amanaura-audit.mjs` diperluas dengan aturan **`R-ICON-FLAT`** untuk memindai dan menggagalkan build jika ditemukan kontainer pembungkus ikon tunggal di luar allowlist.

---

## 7.3 Allowlist Pengecualian & Rem-Based Icon Scaling

### Allowlist Kontainer Berizin:
- **`Avatar`**: Foto profil pengguna atau inisial.
- **`FAB (Floating Action Button)`**: Tombol tindakan utama mengambang.
- **`Brand Mark`**: Logo resmi Amanaura OS di sidebar desktop.

### Elemen Data & Signature yang Tetap Dilindungi:
- **`Status Dot Capsule`**: Kapsul data pembawa angka antrean sinkronisasi (`[ ● 3 Belum ]`).
- **`✦ Badge pada Avatar`**: Tanda presence dan status koneksi sirkadian.
- **`AvatarChild`**: Glif representasi entitas anak.

### Rem-Based Scaling:
Seluruh dimensi ikon menggunakan satuan rem berbasis skala kanonikal (misal: `w-[1.125rem] h-[1.125rem]` untuk $18\text{px}$) agar ikut membesar secara proporsional saat pengguna mengaktifkan fitur pembesaran teks aksesibilitas (*Senior Eye Elasticity*).

---

# 8. ADR SUPERSESSION MATRIX

Matriks dua kolom yang menegaskan pembagian tegas antara dokumen yang disupersede dan pilar-pilar abadi yang tetap dipertahankan:

```
┌────────────────────────────────────────┬────────────────────────────────────────┐
│ 🔴 DOKUMEN YANG DISUPERSEDE            │ 🟢 PILAR-PILAR ABADI YANG TETAP HIDUP  │
├────────────────────────────────────────┼────────────────────────────────────────┤
│ • ADR-UX-005 (Padma Modern):           │ • 12 Refactoring Laws Amanaura         │
│   Palet warm-stone/brass digantikan    │   (Kecuali klausul warna lama)         │
│   oleh FLOW oklch Deep Navy & Gold.    │                                        │
│                                        │ • 6 Amanaura Signatures:               │
│ • ADR-UX-006 (Tokens SSOT):            │   Terkalibrasi ke jiwa visual FLOW     │
│   Nilai hex/rgb diikat ulang ke oklch. │   (Breath, Sound 432Hz, Warm Echo, dll)│
│                                        │                                        │
│ • ADR-UX-007 (Yapendik Sync):          │ • Seluruh Invarian Stage 4.5 & 6-A:    │
│   Brand resmi menjadi Amanaura OS.     │   FB-01 s.d. FB-09, H-01 s.d. H-07,    │
│                                        │   T-1 s.d. T-4, D-7 s.d. D-11 (BEKU).  │
│ • ADR-UX-008 (Crystal Sovereign):      │                                        │
│   Palet biru/kuning lama disupersede.  │ • Kamus Pendidik & Kamus Keluarga:     │
│                                        │   Termasuk pasangan D-9                │
│ • ADR-UX-009 (Zero Webfont):           │   (Sambut Ananda ↔ Tutup Hari).        │
│   Diadopsi Geist Sans & Instrument     │                                        │
│   Serif (via @fontsource lokal).       │ • MD3 / DeX / Modality Architecture    │
│                                        │                                        │
│ • ADR-UX-010 (Flat Fluid Add. I & II): │ • Preservasi Motif Nusantara (≤ 4%)    │
│   Diperluas menjadi Addendum III       │                                        │
│   (Tangga Legibilitas R-0 s.d. R-7).   │ • z-scale Kanonikal (40 s.d. 80)       │
│                                        │                                        │
│ • Amanaura v3.0-RELEASE (Parsial):     │ • Protokol VRT Baseline & Testing Suite│
│   Lapisan visual lama disupersede.     │   (21 Suites / 403 Checks PASS).       │
└────────────────────────────────────────┴────────────────────────────────────────┘
```

---

# 9. IMPLEMENTATION ROADMAP (RE-SKIN SPRINTS A s.d. D)

Proses transformasi visual akan dijalankan dalam 4 Sprint Berurutan:

```
┌─────────────────────────────────────────────────────────────────────────┐
│ SPRINT A: FOUNDATION RE-SKIN & TOKEN REBINDING (1 Sprint)               │
│  1. Rebind tokens @theme di src/index.css ke nilai oklch FLOW.          │
│  2. Integrasi font lokal Geist Sans, Geist Mono, & Instrument Serif.    │
│  3. Implementasi Navy-tinted Colored Shadows (shadow-soft/medium/float).│
│  4. Pembaruan skrip CI: scripts/doc-code-sync.mjs (ADR-UX-011 SSOT),    │
│     scripts/token-purity.mjs (regex oklch), & scripts/useTheme.ts.      │
│  5. Adaptasi halaman /percontohan (Living Contract specimen).           │
│  6. Freeze VRT baseline komparasi (mencegah false positive).            │
├─────────────────────────────────────────────────────────────────────────┤
│ SPRINT B: ADAPTIVE CHROME & NAVIGATION (1 Sprint)                       │
│  1. Refactoring TopBar menjadi Context Bar murni (Compact/Medium/Exp).  │
│  2. Konstruksi Mobile Profile Drawer & integrasi tenant switcher.       │
│  3. Refactoring Desktop Sidebar (Brand Amanaura OS ✦ + Flat Nav).       │
│  4. Sinkronisasi route registry untuk judul halaman dinamis.            │
├─────────────────────────────────────────────────────────────────────────┤
│ SPRINT C: THE LIVING SHELL & ERGONOMICS (1 Sprint)                      │
│  1. Implementasi 4 status koneksi Amanaura Breath ✦ + a11y label.       │
│  2. Implementasi Trinitas Refresh (Event-driven + Interval + Pull/Ghost)│
│  3. Implementasi PWA Manifest & Adaptive Install Guides.                │
├─────────────────────────────────────────────────────────────────────────┤
│ SPRINT D: WEIGHT DISCIPLINE & VRT FINAL CERTIFICATION (1 Sprint)        │
│  1. Penegakan Hukum R-8 (Text Navigation) & R-9 (Glyph Icons).          │
│  2. Integrasi aturan R-ICON-FLAT di scripts/amanaura-audit.mjs.         │
│  3. Unfreeze dan perekaman ulang 80+ baseline visual snapshots (VRT).   │
│  4. Sertifikasi akhir dan peresmian Amanaura OS v1.0 Production.        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

# 10. OFFICIAL CERTIFICATION & SEALING BLOCK

```
╔═══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║                  ✨ AMANAURA OS × FLOW CONSOLIDATION CHARTER ✨            ║
║                                                                           ║
║  ADR-UX-011     : IDENTITY, VISUAL SOUL, AND CHROME DOCTRINE              ║
║  STATUS         : 🟢 RATIFIED, SEALED, AND CANONICAL                      ║
║  SUPERSEDES     : ADR-UX-005, ADR-UX-006, ADR-UX-007, ADR-UX-008,          ║
║                   ADR-UX-009, ADR-UX-010, Amanaura v3.0-RELEASE (parsial)   ║
║  TRI-LAYER      : SOUL (FLOW) + SKIN (AMANAURA OS) + SPINE (GOVERNANCE)   ║
║  IDENTITY       : AMANAURA OS (Platform) • YAPENDIK (Tenant)              ║
║  VISUAL SOUL    : DEEP NAVY + WARM GOLD + GEIST + INSTRUMENT SERIF        ║
║  CHROME         : CONTEXT BAR + PROFILE DRAWER + DESKTOP SIDEBAR          ║
║  LIVING SHELL   : 4-STATE BREATH ✦ + TRINITAS REFRESH + INSTALLABLE       ║
║  LAWS ADDED     : R-0…R-7 (Section Legibility) • R-8 & R-9 (Weight Disp)  ║
║                                                                           ║
║  RATIFIED BY    : Senior Architecture Reviewer (ARB) & Project Owner      ║
║  DATE OF SEAL   : 2026-08-30                                              ║
║  HASH SIGNATURE : SHA256:adr_ux_011_amanaura_os_flow_sealed_20260830      ║
║                                                                           ║
╚═══════════════════════════════════════════════════════════════════════════╝
```

---
*Dokumen ini adalah Piagam Konstitusi Visual dan Tata Kelola Kanonikal resmi Amanaura OS.* 🏛️✨
