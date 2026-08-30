# AMANAURA DESIGN SYSTEM v4.0 — ADDENDUM I
## "FLAT FLUID DOCTRINE" (ADR-UX-010)
### Material Expression of Crystal Sovereign: Screen is the Container, Hairline over Border, Zero Ambient Shadow

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-DS-v4.0-ADD-FF` |
| Version | `4.0-ADDENDUM-FF` (FLAT FLUID) |
| Governing Tier | LEVEL 2 — MASTER SPECIFICATION (ADDENDUM) |
| Status | `RATIFIED — PENDING IMPLEMENTATION` |
| Ratification Date | `2026-08-30` |
| Amends | v4.0-RELEASE (CRYSTAL SOVEREIGN) lapisan kontainer/border/shadow; mempertegas PART III §3.5 v3.0 (Hukum 1–4) |
| New ADR | `ADR-UX-010`: Flat Fluid Doctrine |
| Preserved Frozen | Seluruh hukum perilaku v3.0/v4.0, Stage 4.5 (348/348), MD3, ergonomi, PWA, copywriting, 6 Signatures |
| Execution Instrument | `CRYSTAL_SOVEREIGN_FLAT_FLUID_EXECUTION_PROMPT.md` |

---

## PART I: EXECUTIVE INTENT & RATIONALE

### 1.1 Temuan Audit Visual (Specimen: Beranda Kelas)
Implementasi existing menyimpang dari hukum kanonikalnya sendiri:
1. **Card-in-card (depth 2–3)** — melanggar Hukum 2 "Max Depth = 1".
2. **Kartu floating ber-margin pada COMPACT** — melanggar Hukum 1 "The Screen is the Container".
3. **Border pada hampir seluruh elemen** (tab, strip, tombol, alert) — border fatigue; hierarki visual dibaca sebagai kisi kotak, bukan alur data.

### 1.2 Definisi Flat Fluid
* **Flat:** tanpa shadow ambient, tanpa gradasi, tanpa border pada panel konten; elevasi hanya untuk elemen truly-floating.
* **Fluid:** konten mengalir edge-to-edge; grouping dicapai melalui **whitespace + hairline + tint single-depth**, bukan kotak bersarang.

### 1.3 Kedudukan terhadap v4.0
Addendum ini **tidak mengganti token**; ia governs **kontainerisasi, border, shadow, dan indikator aktif** sebagai ekspresi material Crystal Sovereign. Referensi visual disahkan Project Owner pada `2026-08-30`.

---

## PART II: THE 5 FLAT FLUID LAWS (ADR-UX-010)

| ID | Hukum | Spesifikasi Kanonikal |
| --- | --- | --- |
| **F-1** | Screen is the Container | COMPACT/MEDIUM: seksi = `<section class="px-4 md:px-5 space-y-6">` di atas canvas. 🛑 Dilarang kartu floating ber-margin. |
| **F-2** | Single-Depth Tint Panel | Bila wadah diperlukan: `bg-surface-subtle/70 rounded-2xl` **tanpa border**. Max depth = 1. 🛑 Card-in-card haram (Hukum 2). |
| **F-3** | Hairline over Border | Pemisah baris/list = `divide-y divide-line-hairline`. `border` hanya untuk outline **kontrol** (SegmentedControl, chips, Input, AdaptiveDialog). |
| **F-4** | Underline over Boxed Pill | Tab/segmen aktif = `border-b-2 border-b-brand-primary` pada bar flat `divide-x divide-line-hairline`. 🛑 Dilarang pill-dalam-pill. |
| **F-5** | Zero Ambient Shadow | `shadow-ambient` dinonaktifkan pada seksi. `shadow-floating` eksklusif allowlist: **MobileOmniBar, FAB, AdaptiveDialog, ToastHUD**. |

**Hukum Penyerta F-6 — Typography Carries Hierarchy:** Judul halaman `text-[28px] md:text-3xl font-bold tracking-tight`; eyebrow `text-xs font-semibold uppercase tracking-wider text-brand-deep`; ritme antar-seksi `space-y-8`, intra-seksi `space-y-3/4`. Ruang kosong adalah ornamen.

---

## PART III: COMPONENT RESTYLING CANON (Specimen: Beranda Kelas)

| Elemen | 🛑 Dilarang (Existing) | ✅ Kanonikal (Flat Fluid) |
| --- | --- | --- |
| TopBar | Ikon dalam kotak rounded; toggle tema boxed | Ikon telanjang `text-brand-primary`; `border-b border-line-hairline`; toggle pindah ke Profile Drawer |
| Segmented Tabs | Pill berkotak dalam wadah pill | `grid grid-cols-3 rounded-xl border border-line-hairline divide-x divide-line-hairline`; aktif: `border-b-2 border-b-brand-primary font-semibold` |
| Kartu Kelas (Kelompok A) | Outer card floating | Section header di canvas: ikon grup + judul bold + tanggal `font-mono` |
| Strip Kehadiran | Box ber-border | `bg-surface-subtle/70 rounded-2xl px-4 py-3` (tanpa border); Status Dot Capsule `● 3 Belum` **dipertahankan** |
| Bar Aksi (Pesan Ortu / Kesehatan) | Box ber-border bertumpuk | `bg-surface-subtle/70 rounded-2xl min-h-[56px] active:scale-[0.99]` |
| Perhatian Pagi (Alergi) | Kotak border oranye | Edge-to-edge `divide-y divide-line-hairline`; per baris: `AlertTriangle text-warning` + nama `font-semibold text-warning-deep` + deskripsi `text-warning-deep` — **Safety Salience wajib** |
| Ritme Kelas | Kartu floating kedua | Section flat; chip waktu outline `border-line-hairline rounded-full`; aktif `bg-brand-primary text-on-brand`; angka tetap `font-mono` |
| FAB | Lingkaran putih | `bg-brand-primary text-on-brand shadow-floating` |
| Omni-Bar | Kapsul bordered berat | `bg-surface-glass backdrop-blur-xl border-line-hairline` |
| Recent Apps Shield | `bg-surface-inset/80` | `bg-canvas/80 backdrop-blur-xl` (adaptif kedua tema) |

---

## PART IV: DUAL-THEME & ACCESSIBILITY NOTES

1. Seluruh kelas di atas adalah **token semantik**; nilai light/dark mengikuti v4.0 §3.1 (Crystal Day `#F2F2F7` / OLED Night `#000000`).
2. Hairline dark `rgba(255,255,255,.08)` adalah batas visibilitas minimum — jangan lebih redup.
3. `text-warning-deep` (light `#9A5A00` / dark `#FF9F0A`) ≥ 4.5:1 di kedua tema — teks alergi wajib memakainya.
4. Panel tint di dark otomatis menjadi permukaan elevasi-1 via token; **jangan** menambahkan border untuk "mempertegas".
5. Touch target tetap ≥ 48dp; bar aksi `min-h-[56px]` (Hukum ergonomi & Zero-CLS).

---

## PART V: CI & AUDIT UPDATES

| Rule | Penegakan |
| --- | --- |
| `R-NESTED` (BARU) | 0 pola panel `bg-surface* + rounded* + border border-line` di luar allowlist kontrol |
| `R-SHADOW` (BARU) | `shadow-floating`/`shadow-ambient` hanya pada file allowlist (OmniBar, FAB, AdaptiveDialog, ToastHUD) |
| `R-ORNAMENT`, `R-BRASS`, `R-SPECIMEN`, `pnpm audit:tokens` | Tetap aktif tanpa perubahan |
| VRT | Re-baseline **3 breakpoint × 2 modality × 2 tema = 12 snapshot/halaman** utama |
| Stage 4.5 Gate | `pnpm test` **348/348 wajib tetap PASS** + Suites 24-25 (Adversarial DOM PII) re-run |

---

## PART VI: FROZEN (NON-EXHAUSTIVE RECITAL)

6 Amanaura Signatures (ekspresi rekali-brasi v4.0), JetBrains Mono untuk data, Threshold Rule (§4.2), 12 Refactoring Laws, MD3 size classes, Kamus Pendidik, logika `<PrivacyShield />`/`<NonCausalDelta />`/`<CanonicalAnchor />`/`<ForbiddenActionGate />`, hook `useTheme.ts`, dan seluruh UI/UX-Only Protocol v3.0 §9.3.

---

## PART VII: SPRINT PLAN (FLAT FLUID SWEEP)

| Sprint | Scope |
| --- | --- |
| F-1 | Shell flatten: TopBar, SegmentedControl underline, OmniBar, FAB |
| F-2 | Dekonstruksi kartu → seksi canvas + tint panel single-depth |
| F-3 | List & alert → `divide-y` + safety salience alergi |
| F-4 | Page sweep + hapus alias deprecated (`brass`) + arsip motif |
| F-5 | CI rules baru + VRT re-baseline + pensegelan |

---

## APPENDIX A: CHANGELOG

**v4.0-ADDENDUM-FF (2026-08-30) — FLAT FLUID DOCTRINE:** ADR-UX-010 ratified. Lima hukum F-1…F-5 + F-6 disahkan; kontainerisasi existing (card-in-card, border fatigue, boxed pill) dinyatakan deviasi dan wajib direfaktor via Sprint F-1…F-5. Token v4.0 tidak berubah; addendum ini governs materialitas kontainer, border, shadow, dan indikator aktif.

╔═══════════════════════════════════════════════════════════════╗
║ AMANAURA v4.0 ADDENDUM I — FLAT FLUID DOCTRINE • ADR-UX-010      ║
║ RATIFIED PENDING IMPLEMENTATION • TOKENS v4.0 PRESERVED         ║
║ STAGE 4.5 FROZEN (348/348) • BEHAVIORAL LAWS v3.0 INTACT         ║
╚═══════════════════════════════════════════════════════════════╝
