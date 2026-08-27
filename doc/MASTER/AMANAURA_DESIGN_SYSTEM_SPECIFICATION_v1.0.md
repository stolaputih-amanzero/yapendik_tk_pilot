# AMANAURA DESIGN SYSTEM SPECIFICATION v1.0
## The Warm, Tactile, and Dignified Operating Experience
**Document ID:** `DOC-AMANAURA-DESIGN-SYSTEM-SPEC-v1.0`  
**Governing Tier:** `LEVEL 2 — MASTER SPECIFICATION & GLOBAL PRODUCT STANDARD`  
**Authoritative Standard:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2  
**Target Scope:** Global Architecture Standard for *Yapendik School OS* and Future Product Ecosystems  
**Status:** **🟢 CANONICAL LIVING MASTER SPECIFICATION (PERMANENT GOVERNANCE)**  
**Date Established:** `2026-08-27`  

---

## 1. Executive Summary & Design Manifesto

### 1.1 Etimologi & Identitas Filosofis
**AMANAURA** lahir dari perpaduan dua nilai fundamental:
* **AMAN (الأمان / Keamanan & Amanah)**: Perlindungan, ketenangan batin, rasa percaya, dan penjagaan etis tanpa rasa takut atau panik.
* **AURA (Pancaran Kehadiran & Jiwa)**: Kehangatan materialitas, pencahayaan alami, ritme biologis, dan keanggunan visual yang membedakan produk biasa dari mahakarya berjiwa (*Living Software*).

### 1.2 Tagline Resmi
> **"The Warm, Tactile, and Dignified Operating Experience."**  
> *(Pengalaman Operasional yang Hangat, Taktil, dan Bermartabat).*

### 1.3 Nilai Inti: *“The OS Disappears into the Day”*
Amanaura menolak antarmuka yang bising, penuh warna pelangi yang menyilaukan, atau pop-up agresif. Sistem operasi ini dirancang untuk **menghilang ke dalam hari kerja**, memberikan rasa tenang (*Calm & Dignified*) bagi pendidik, pimpinan, dan keluarga, sambil menyajikan ketepatan data tingkat tinggi.

---

## 2. The 6 Amanaura Signatures (Ciri Khas & Tanda Tangan Visual)

Setiap produk yang dibangun dengan *Amanaura Design System* wajib memancarkan 6 tanda tangan khas ini:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              THE 6 AMANAURA SIGNATURES                                 │
├─────────────────────────┬──────────────────────────────────────────────────────────────┤
│ 1. The Amanaura Breath  │ Piktogram mikro (✦) di TopBar/OmniBar yang berdenyut siklikal│
│    (Detak Hidup Mikro)  │ 4 detik sekali (ritme napas manusia tenang / resting pulse), │
│                         │ menandakan sistem aktif, sehat, dan melindungi data.         │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 2. The Luminescent Edge │ Pendaran cahaya mikro hangat (rgba(245,158,11,0.18)) pada    │
│    (Border Cahaya Hangat│ elemen aktif/fokus. Menggantikan focus ring biru tebal kaku. │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 3. Amanaura Spring      │ Satu konstanta fisika pegas matematis universal di seluruh   │
│    (Fisika Gerak Mewah) │ animasi: { stiffness: 380, damping: 32, mass: 0.8 }.         │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 4. Status Dot Capsule   │ Seluruh status disajikan dalam kapsul mikro: titik warna     │
│    (Kapsul Titik Mikro) │ luminesen (●) + teks font mono JetBrains Mono 11px.          │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 5. Deterministic Pastel │ Setiap entitas (siswa/unit) tanpa foto otomatis mendapatkan  │
│    & Symbol Engine      │ palet warna pastel matematis unik + simbol ceria (🌟, 🦁, ⛵)│
│                         │ demi melindungi privasi wajah anak (Rule 9).                 │
├─────────────────────────┼──────────────────────────────────────────────────────────────┤
│ 6. Circadian Daylight   │ Temperatur warna UI beradaptasi halus mengikuti ritme hari:  │
│    (Suhu Cahaya Alami)  │ • Pagi (07:00): Crisp Daylight White + Warm Amber            │
│                         │ • Siang (11:00): High-Contrast Focus Slate                   │
│                         │ • Sore/Malam: Warm Glow ramah keluarga (Buku Penghubung)     │
└─────────────────────────┴──────────────────────────────────────────────────────────────┘
```

---

## 3. Design Tokens Architecture (Tailwind v4 `@theme`)

### 3.1 Hukum Palet Warna 60 - 30 - 10
* **60% Base / Canvas (Permukaan)**:
  * `--color-canvas`: `#F8FAFC` (Slate-50 lembut, sejuk untuk mata).
  * `--color-surface`: `#FFFFFF` (Putih murni untuk kartu & list).
  * `--color-surface-subtle`: `#F1F5F9` (Slate-100 untuk input & header seksi).
* **30% Struktur & Tipografi**:
  * `--color-text-primary`: `#0F172A` (Slate-900 kontras tinggi $\ge 15:1$).
  * `--color-text-secondary`: `#475569` (Slate-600 untuk subjudul).
  * `--color-text-muted`: `#94A3B8` (Slate-400 untuk divider/placeholder).
  * `--color-border-subtle`: `#E2E8F0` (Slate-200 garis pemisah 1px).
* **10% Sinyal Semantik Murni (DILARANG UNTUK DEKORASI BIASA)**:
  * `--color-signal-success`: `#16A34A` (Hijau: Hadir / Selesai / Terverifikasi).
  * `--color-signal-warning`: `#D97706` (Kuning: Perhatian / Belum / Alergi).
  * `--color-signal-danger`: `#E11D48` (Merah: Alpa / Bahaya / Error).
  * `--color-signal-info`: `#0284C7` (Biru: Izin / Informasi Kurikulum).
  * `--color-signal-lppa`: `#7E22CE` (Ungu: Bukti Kurasi Rapor).

### 3.2 Dualitas Tipografi
* **Header & Display**: Sans-Serif Berbobot Ekstrem (`Inter Black` / `Plus Jakarta Sans 900`) dengan *tight letter-spacing* (`tracking-tight`).
* **Data, Kode & Angka**: Monospace Presisi (`JetBrains Mono Bold`) untuk NIS, NIK, Jam, Tanggal, Suhu °C, dan Metrik.

### 3.3 Multi-Layer Ambient Shadow (Bayangan Kertas Alami)
```css
--shadow-ambient: 0 1px 2px rgba(15, 23, 42, 0.04), 0 4px 12px rgba(15, 23, 42, 0.03);
--shadow-floating: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 12px 24px -4px rgba(15, 23, 42, 0.08);
--shadow-luminescent: 0 0 0 1.5px #0F172A, 0 0 20px -4px rgba(245, 158, 11, 0.18);
```

---

## 4. Global Navigation Shell & Responsive Choreography

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        AMANAURA NAVIGATION TOPOLOGY                                    │
│                                                                                        │
│  DESKTOP (≥ 1024px)                        MOBILE (< 1024px)                           │
│  ┌───────────────────────────────┐         ┌───────────────────────────────┐           │
│  │ [TopBar: Brand + School + User│         │ [TopBar: Logo + Avatar(✦)]    │           │
│  ├───────────┬───────────────────┤         ├───────────────────────────────┤           │
│  │ [Sidebar] │ [Workspace Area]  │         │ [Workspace Area Edge-to-Edge] │           │
│  │ (w-64 or  │ (p-6 Centered)    │         │ (p-0 w-full bg-white)         │           │
│  │  w-18     │                   │         │                               │           │
│  │  Slide)   │                   │         │   [ 📝 Presensi ] [ ✨ Obs ]  │ <- Chips  │
│  │           │                   │         │ [ 🔍 Apa fokus Anda?   MENU ] │ <- Omni   │
│  └───────────┴───────────────────┘         └───────────────────────────────┘           │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 Headbar (TopBar) — The Minimalist Horizon
* **Mobile (< 1024px)**:
  * **Kiri**: Logo `Building2` + `"Yapendik OS"`.
  * **Kanan**: Avatar Bulat Tunggal ber-badge `✦` (*Amanaura Breath*).
  * 🛑 **Dilarang**: Menampilkan nama panjang, gelar, NPSN, tahun ajaran, dan status database mentah di layar ponsel.
* **Desktop (≥ 1024px)**:
  * Logo + Nama Brand + Dropdown Unit Sekolah + Nama & Role Pengguna + Status DB.

### 4.2 Desktop Sidebar: The Collapsible Slide
* Lebar normal: `w-64 bg-white border-r border-slate-200`.
* Tombol *Collapse* (`«`) mengecilkan sidebar menjadi `w-18` (hanya ikon monokrom) dengan animasi geser `AmanauraSpring`.

### 4.3 Mobile Centered Omni-Bar Dock
* **Smart Chips Carousel**: Rata Tengah (`flex justify-center gap-2`), menampilkan 2–3 jalan pintas tugas tercepat.
* **Omni-Bar Capsule**: Kapsul melayang `bg-white/95 backdrop-blur-xl border border-slate-200/80 shadow-floating` bertuliskan *"Apa fokus Anda hari ini?"*.
* **App Library Drawer**: Mengetuk Omni-Bar membuka laci layar penuh setinggi `85vh` dari bawah dengan animasi *spring slide-up* dan gestur *pull-down to dismiss*.

---

## 5. The Container & Sectioning Doctrine

### 🛑 Hukum 1: "The Screen is the Container" (Mobile Edge-to-Edge)
* Pada layar ponsel, **DILARANG** membuat kartu mengambang ber-margin (`m-4 p-4 rounded-2xl`).
* Latar belakang layar adalah kontainernya (`w-full bg-white`). Data mengalir bebas dari tepi kiri ke kanan dan hanya dipisahkan garis bawah tipis 1px (`border-b border-slate-100`).

### 🛑 Hukum 2: "Max Depth = 1" (Haram Kotak Bersarang)
* Dilarang struktur: `Card > Card > Card`.
* Pemisahan sub-data dilakukan menggunakan tipografi, spasi (`gap-4`), atau garis `divide-y`, bukan kotak bertumpuk.

### 📐 Hukum 3: The 3-Zone Card Anatomy & `divide-y`
Jika sebuah kontainer desktop memiliki beberapa seksi:
1. **Zona 1 (Header)**: `px-5 py-4 border-b border-slate-100` (Judul tebal + status badge).
2. **Zona 2 (Body)**: `p-5 space-y-4` (Konten & data utama).
3. **Zona 3 (Footer)**: `px-5 py-3 bg-slate-50/80 border-t border-slate-100` (Keterangan penutup / tombol ghost).
* **Gunakan `divide-y divide-slate-100`** pada kontainer utama untuk membagi seksi secara presisi 1px edge-to-edge.

### 🛡️ Hukum 4: Workspace Tab Padding Parity (Unifikasi Kontainer Tab)
* Seluruh tab sub-halaman dalam satu workspace (seperti *Inbox* dan *Riwayat*) **wajib menggunakan wrapper padding yang identik**: `px-4 sm:px-5 md:px-0`.
* Dilarang keras mencampur tata letak *fluid edge-to-edge* di satu tab dengan *rigid boxed card padding* di tab sebelahnya.

### 📏 Rumus Lengkungan Sudut (The Nested Radius Law)
$$\text{Radius Dalam} = \text{Radius Luar} - \text{Padding}$$
* Jika kotak luar `rounded-2xl` (16px) dengan `p-4` (16px), elemen dalam **wajib `rounded-lg` (8px)** atau `rounded-none`.

---

## 6. The 5 Button Laws & Hardware Debounce

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
* **Anti-Jiggle Hardware Debounce**: Seluruh tombol secara otomatis mengunci klik ganda selama **300ms** dan menampilkan indikator loading mikro tanpa mengubah lebar fisik tombol (*Zero Width Jiggle*).

---

## 7. Dropdown & Selection Taxonomy (The Threshold Rule)

* **$\le 4$ Pilihan**: 🛑 **HARAM DROPDOWN**. Wajib `<SegmentedControl>` (Pil horizontal 1-Tap).
* **5 s.d 15 Pilihan**: Wajib `<SelectSheet>` (Bottom Sheet picker di Mobile, popover di Desktop).
* **$> 15$ Pilihan**: Wajib `<SearchableCombobox>` (Dropdown dengan kolom pencarian instan 150ms debounce).
* **Menu Tambahan**: Wajib `<ActionMenu>` (Tombol 3-titik `⋮`).

---

## 8. The Copywriting Doctrine (Batas Kata & Kosakata Baku)

1. **Judul Halaman / Seksi**: **Maksimal 2 Kata** (Max 16 Karakter).
   * *Contoh*: `"Beranda Kelas"`, `"Meja PPDB"`, `"Statistik Unit"`, `"Adopsi Kebijakan"`.
2. **Sub-Judul**: **Maksimal 10 Kata** (1 Kalimat Manfaat) dan **disembunyikan di layar HP** (`hidden md:block`).
3. **Teks Tombol**: **Maksimal 2-3 Kata** (Kata Kerja Aktif).
4. **Kamus Kata Kerja Baku**:
   * Simpan • Batal • Hapus • Ubah • Tambah [Objek] • Unduh [Format] • Masuk • Kirim • Rekomendasikan • Tetapkan.
5. **Data Panjang Dinamis**: Wajib dilindungi dengan utility `truncate` (1 baris) atau `line-clamp-2` (2 baris).
6. **Standar Kelembagaan TK & Kamus Pedagogis Anti-Jargon**:
   * **Standar Nomenklatur Lembaga**: Seluruh unit wajib menggunakan istilah **`TK`** (*Kurikulum Merdeka TK*, *TK Yapendik*), dilarang melakukan generalisasi kata `PAUD`.
   * **Pembersihan Jargon Developer ke Bahasa Pendidik**:
     * `Fast Capture` $\rightarrow$ **`Rekam Momen Belajar`**
     * `(One Child)` $\rightarrow$ **`Buka Rekam Jejak`**
     * `(Otoritas Mutlak)` $\rightarrow$ **`Catatan & Arahan Guru Kelas`**
     * `Non-Authoritative Proposal` $\rightarrow$ **`Rekomendasi Rencana Stimulasi Bermain`**
     * `Scaffolding Strategy` $\rightarrow$ **`Pendampingan Guru (Scaffolding)`**
     * `Prompt Kemitraan Rumah` $\rightarrow$ **`Saran untuk Orang Tua di Rumah`**
     * *Dilarang keras*: Menampilkan durasi mekanis (`<15 dtk`) atau ID mentah database (`lppa_pub_baseline_...`, `PROPOSED`) di antarmuka guru.

---

## 9. Horizontal & Vertical Navigation Patterns

### 9.1 Horizontal Overflow Tabs
1. **Ambient Edge Fade Shader**: Gradasi pudar di tepi kanan (`mask-image`) sebagai sinyal intuitif bahwa tab dapat digeser.
2. **Micro-Morphing Dots**: Titik indikator di bawah tab yang berubah menjadi pil lonjong (`w-4 h-1 bg-slate-900`) mengikuti tab aktif.
3. **Auto-Center Snap**: Mengetuk tab otomatis menggeser tab tersebut ke tengah layar (`inline: 'center'`).

### 9.2 Vertical Pagination
1. **Soft Load More Pill**: Tombol kapsul lembut di bawah daftar (`[ ↓ Tampilkan 10 Siswa Lainnya • 17/45 ]`) menggantikan penomoran halaman kuno `[1] [2] [3]`.
2. **Timeline Stepper**: Garis vertikal 2px dengan titik status (`● Selesai`, `● Sedang Aktif`, `○ Menunggu`).
3. **Floating Position HUD**: Pil mengambang semi-transparan `[ 25 / 150 Data ]` saat scrolling cepat.

---

## 10. The Navigation & Back Doctrine

1. **Posisi Tunggal**: Tombol Back selalu berupa lingkaran kecil di kiri atas (`ArrowLeft` `w-8 h-8 rounded-full bg-slate-100`).
2. **Hierarchical Determinism**: Back selalu kembali ke halaman induk data (*Parent Page*), bukan riwayat acak browser `history.back()`.
3. **Auto-Draft Shield**: Setiap ketikan form otomatis tersimpan di `localStorage`. Jika pengguna keluar tanpa sengaja, data ketikan tetap utuh saat kembali.
4. **Mobile Gestures**: Menutup laci/form cukup dengan menggeser jempol ke bawah (*Swipe Down to Dismiss*).

---

## 11. Advanced Media, Charts & Hover Ergonomics

1. **`<FocusCanvas>`**: Grafik padat (Heatmap/Statistik) memiliki tombol `Maximize2` untuk mekar menjadi kanvas layar penuh yang mendukung *pan & snap-to-touch tooltip*.
2. **`<Lightbox>`**: Foto karya seni anak terkunci pada rasio `aspect-4/3` atau `aspect-square`, dapat disentuh untuk *Pinch-to-Zoom* layar penuh.
3. **Hover Isolation (`@media (hover: hover)`)**:
   * Efek `:hover` hanya aktif pada perangkat kursor mouse.
   * Pada layar sentuh ponsel, interaksi beralih murni ke **`:active` (Tactile Compression `scale(0.98)`)** untuk melenyapkan *bug sticky hover*.
4. **Sticky Freeze First Column**: Tabel data multi-kolom di mobile mengunci kolom Nama Siswa di sisi kiri (`sticky left-0 shadow-sm`), sementara kolom nilai lainnya dapat digeser bebas ke kanan.

---

## 12. Filter & Query Architecture (The 3 Tiers)

1. **Tier 1 (Inline Quick Chips)**: 2–5 kategori, tanpa tombol "Terapkan", menyaring instan 0ms.
2. **Tier 2 (Search Omni-Filter)**: Input teks debounced 150ms dengan tombol `[ ✕ ]` reset instan.
3. **Tier 3 (Multi-Attribute Sheet)**: Filter kompleks dengan pemicu `[ ⚡ Filter (2) ]`, membuka Bottom Sheet dengan tombol `[ Terapkan ]` dan `[ Reset ]`.
4. **Perisai Transparansi**: Selalu menampilkan badge chip filter aktif `[ TK A ✕ ]` dan pesan *Empty State* yang menyediakan tombol pemulihan `[ 🔄 Reset Filter ]`.

---

## 13. Instant Information & Progressive Guidance

1. **The 3-Second Micro-Summary**: Header ringkasan instan di atas daftar (`👥 17 Murid • 🟢 15 Hadir • ⚠️ 1 Alergi`).
2. **Polite Dismissible Coachmarks**: Kartu petunjuk pengguna baru dengan tombol `[ Mengerti ✕ ]` yang hilang selamanya setelah ditutup.
3. **1-Tap Term Explainer (`ⓘ`)**: Ikon mikro di samping istilah teknis yang memunculkan popover/sheet penjelasan 1 kalimat.
4. **Interactive Onboarding Empty States**: Layar data kosong otomatis berubah menjadi checklist 3 langkah awal.

---

## 14. Modals, Sheets & Dialog Architecture

### 14.1 The Golden Envelope Standard (Dimensi Kanonikal)
* **Desktop (≥ 1024px)**: Menggunakan ukuran kanonikal terkunci `w-full max-w-5xl h-[85vh]` dengan `backdrop-blur-xs` dan listener tombol `ESC`.
* **Mobile (< 1024px)**: Otomatis berubah menjadi **Bottom Sheet Drawer** `w-full h-[90vh] rounded-t-3xl border-t border-slate-200`.
* **Zero Layout Shift**: Tinggi modal terkunci stabil saat berpindah sub-tab untuk mengeliminasi lonjakan visual (*layout jiggle*).

### 14.2 Pinned Action Anchor (Tombol Tutup Terkunci)
* Tombol Tutup (`✕`) **wajib dikunci di pojok kanan atas** (`shrink-0 ml-2`) dengan z-index terproteksi, sehingga tidak pernah turun ke bawah atau menabrak teks judul pada layar sempit.

### 14.3 The 2-Tier Header & Matching-Pill Context Ribbon
Struktur tajuk modal wajib dipisahkan menjadi 2 tingkat teratur:
* **Tier 1 (Header Identitas Utama)**:
  * Ikon Avatar + *Eyebrow* tema (tanpa duplikasi ikon) + Judul Utama + Kapsul Nama Siswa + Kapsul NIS + Tombol `✕` Pinned.
* **Tier 2 (Dedicated Context Ribbon)**:
  * Pita pembatas terdedikasi (`bg-slate-50/60 border-b border-slate-100 py-2.5 px-4 sm:px-5`) memuat **dua kapsul serasi (*matching pills*)**:
    * Kapsul Kiri: `[ 📅 TA 2026/2027 • GANJIL • Kurikulum Merdeka TK ]`
    * Kapsul Kanan: `[ 📄 Draf Guru (Proposal) ]` / `[ 🏅 Kesiapan LPPA 100% ]`
  * Responsif: Terjustifikasi (*space-between*) di Desktop dan bertingkat rapi (*stacked*) di Ponsel.

### 14.4 Mobile Anti-Stack Fatigue & Segmented Fluid Bar
* Di layar ponsel (`< md`), navigasi multi-dimensi/elemen wajib otomatis bertransformasi dari sidebar vertikal desktop menjadi **tab horizontal geser (*horizontal scrollable fluid pill bar*)** (`overflow-x-auto scrollbar-hide shrink-0`).

### 14.5 Susunan Tombol Aksi
* **Desktop**: Rata Kanan (`[ Batal (Soft) ] [ Simpan (Solid) ]`).
* **Mobile**: Grid 2x2 atau tombol Aksi Utama Full-Width di atas tombol Batal teks ghost.
* **Dialog Bahaya**: Fokus default keyboard otomatis diarahkan ke tombol **Batal** demi keamanan data.

---

## 15. The 6 Invisible Masteries (Micro-Engineering Perfection)

1. **Anti-Jiggle Debounce**: Perlindungan dobel-klik 300ms tanpa perubahan lebar layout.
2. **Zero Cumulative Layout Shift (Zero-CLS)**: Dimensi minimum terkunci (`min-h-[48px]`), layar tidak pernah melompat 1px pun saat data selesai dimuat.
3. **Silent Ghost Recovery**: Listener `document.visibilityState` yang secara otomatis menyegarkan sesi Supabase saat HP dibuka kembali setelah berjam-jam tanpa memutus ketikan form.
4. **Senior Eye Elasticity**: Penataan tipografi menggunakan unit relatif `rem/em` yang otomatis mekar harmonis jika font HP diatur "Ekstra Besar" oleh guru senior.
5. **Silent Exponential Retry**: Percobaan ulang koneksi otomatis di latar belakang (1s, 2s, 4s) saat sinyal Wi-Fi terputus sesaat tanpa memunculkan layar error merah.
6. **Emotional Affirmation & 432Hz Sound**: Ucapan penutup hari yang menenangkan dan denting akustik harmonis 432Hz saat seluruh tugas kelas tuntas.

---

## 16. Canonical Z-Index Stacking Hierarchy

```css
--z-workspace: 0;
--z-topbar: 40;
--z-omnibar: 50;
--z-drawer-modal: 60;
--z-toast-hud: 70;
--z-critical-shield: 80;
```

---

## 17. Index Pustaka Komponen Primitif (`src/components/ui/`)

Pustaka komponen tunggal yang akan dibangun untuk mewadahi seluruh hukum di atas:

```text
src/components/ui/
├── Button.tsx                 # The 5 Button Laws + Hardware Debounce
├── Badge.tsx                  # Status Dot Capsule (●) & Monospace Data
├── ListItem.tsx               # Universal Edge-to-Edge Row (Mobile-First)
├── SegmentedControl.tsx       # Pill Toggle 1-Tap (Hukum Dropdown ≤ 4)
├── AdaptiveDialog.tsx         # Bunglon: Bottom Sheet di HP, Modal di Desktop
├── AutoResizeTextarea.tsx     # Form observasi fluid tanpa scrollbar ganda
├── PedagogicalRatingPill.tsx  # Selektor 1-Tap PAUD (BB / MB / BSH / BSB)
├── Skeleton.tsx               # Balok memuat berdenyut halus (Anti-Spinner)
├── ToastHUD.tsx               # Notifikasi mengambang + Tombol 5-Second Undo
├── AvatarChild.tsx            # Deterministic Pastel & Symbol Privacy Engine
├── FocusCanvas.tsx            # Pembungkus Grafik & Peta Layar Penuh (Maximize2)
├── Lightbox.tsx               # Penampil Foto Karya Seni Anak dengan Pinch-Zoom
└── TermExplainer.tsx          # Ikon ⓘ penjelas istilah kontekstual
```

---

## 18. Sertifikasi & Status Otoritatif

> **Pernyataan Sertifikasi Arsitektur:**  
> **AMANAURA DESIGN SYSTEM v1.0** resmi disahkan sebagai **Standar Desain Global Permanen** untuk *Yapendik School OS* dan seluruh portofolio perangkat lunak turunan. Seluruh rekayasa antarmuka pengguna pada modul yang ada saat ini maupun di masa depan wajib patuh pada hukum, token, dan filosofi yang termaktub dalam dokumen ini.
