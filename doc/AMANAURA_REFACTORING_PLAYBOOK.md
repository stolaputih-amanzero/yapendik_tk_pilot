# Amanaura Mobile Refactoring Playbook (v1.1)
**Dokumen Standar Audit & Perbaikan Layout UI/UX untuk IDE AI**

Bagi AI Assistant: Gunakan 7 hukum (rules) di bawah ini sebagai landasan mutlak saat me-refactor komponen layar (Workspaces/Surfaces) di dalam Yapendik OS.

## 1. Hukum Edge-to-Edge List (Hancurkan Kartu Kotak)
Layar mobile Amanaura tidak menggunakan desain "Kartu di dalam Kotak" (`border rounded-xl m-4`) untuk menampilkan daftar data panjang.
- **Root List Container**: Gunakan `<div className="flex flex-col divide-y divide-slate-100 pb-[120px]">`
- **List Item**: Gunakan `<div className="py-5 px-4 md:px-6 hover:bg-slate-50/50 transition">`
- *Tujuan*: Tampilan seperti menu *Settings* di iOS, lapang dan elegan.

## 2. Anti-Padding Bleed (Ruang Napas Teks)
Teks (Judul, Paragraf) tidak boleh menabrak tepi bezel layar HP (0px).
- Kontainer utama pembungkus teks **wajib** memiliki `px-4 md:px-6`.
- Hanya garis pembatas (`border-b`) atau *background* solid yang boleh membentang 100% (*mepet* layar).

## 3. CTA Dominance (Hukum Tombol Utama)
Tombol Aksi Utama (Call to Action) seperti "Simpan", "+ Tambah", atau "+ Kirim" di layar mobile **wajib berukuran penuh (*Full-Width*)** agar mudah ditekan jempol.
- Jangan meletakkan tombol CTA bersebelahan (sejajar horizontal) dengan input/filter di layar mobile.
- Letakkan di baris baru: `<Button className="w-full md:w-auto mt-3 md:mt-0">`

## 4. Dropdown Geometri (Chevron Rata Kanan)
Pembungkus elemen filter/dropdown (`<select>` atau custom button) wajib membentang penuh di mobile.
- Wajib memiliki class: `w-full flex justify-between items-center`
- *Tujuan*: Label berada di ujung kiri, dan ikon panah/chevron (`v`) terdorong mentok ke ujung kanan agar sejajar sempurna membentuk garis vertikal.

## 5. Anti-Crush Flex (Penyelamatan Teks Tergencet)
Jangan pernah memaksa elemen Lencana (Badge) dan Judul Panjang berada dalam satu baris (`flex-row items-center`) tanpa `flex-wrap`. Ini akan menggencet teks judul menjadi kolom yang sempit.
- **Gunakan Susunan Vertikal (Stacking)**:
  ```tsx
  <div className="flex flex-col items-start gap-1.5 min-w-0 pr-4">
    <Badge>STATUS</Badge>
    <h4 className="font-bold break-words leading-snug">Judul Panjang...</h4>
  </div>
  ```

## 6. Smart Chip Symmetry (Keseimbangan Elemen Melayang)
Elemen daftar horizontal yang bisa di-scroll (*overflow-x-auto*) seperti tombol filter cepat (Smart Chips) di atas Omni-Bar harus terlihat seimbang.
- Gunakan `w-full justify-center` pada container flex, bukan `justify-start`.
- *Tujuan*: Kumpulan tombol terlihat melayang secara sentral bagaikan pulau (*floating island*).

## 7. Desktop Flex-1 Bug (Mencegah Footer Nyangkut)
Jangan gunakan `flex-1` pada tag `<main>` jika parent div menggunakan `max-h-screen overflow-y-auto`. Ini membuat `<main>` berhenti tumbuh dan menyebabkan `<footer>` dirender di tengah layar.
- **Solusi**: Gunakan `grow shrink-0` pada `<main>`. Konten yang panjang akan mendesak `<footer>` dengan benar hingga ke ujung bawah halaman.
