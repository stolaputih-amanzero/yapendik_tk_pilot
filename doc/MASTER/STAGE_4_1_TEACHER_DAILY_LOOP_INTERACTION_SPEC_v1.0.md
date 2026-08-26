# Yapendik School OS — Stage 4.1 Teacher Daily Loop Interaction Specification v1.0
**Document ID:** `DOC-STAGE-4-1-INTERACTION-SPEC-v1.0`  
**Status:** `ACTIVE ARCHITECTURE SPECIFICATION — INTERACTION BASELINE`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Teacher Daily Operating Loop Interaction & State Machine`  
**Parent Contract:** `DOC-STAGE-4-1-TEACHER-DAILY-OPERATING-MODEL-v1.0`  
**Governance Substrate:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Interaction Design Charter & North Star

### 🌟 North-Star Interaction Principle
> **"The School OS should disappear into the teacher's day rather than becoming another task in the teacher's day."**

Spesifikasi ini **tidak dimulai dari daftar layar statis**, melainkan dari:
$$\text{Teacher Intent} \longrightarrow \text{System Context} \longrightarrow \text{Action} \longrightarrow \text{System Response} \longrightarrow \text{Next Operating State}$$

Seluruh pola interaksi mengimplementasikan 5 Invarian Alur Kerja Manusia (*Human Workflow Invariants*):
* **HWI-01:** Interaksi dengan anak > Interaksi administrasi layar.
* **HWI-02:** *Capture Once, Governed Reuse Everywhere* (Distribusi terproteksi).
* **HWI-03:** *Evidence Before Narrative* (Fakta autentik sebelum narasi LPPA).
* **HWI-04:** *One Child Context* (Konteks anak terkunci; zero dropdown berulang).
* **HWI-05:** *Capture Fast, Enrich Later* (Tangkap instan saat aktif; perinci saat tenang).

---

## 2. Context Anchoring & Default System State

Ketika Guru Kelas (Ibu Siti) atau Guru Pendamping (Ibu Maria) membuka *Teacher Home*, sistem langsung mengunci konteks tanpa satupun dialog pemilihan:

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                           TEACHER HOME DEFAULT CONTEXT                            │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  • Identity Context: Resolved dari sesi terautentikasi (cth: Ibu Siti - Guru TK A)│
│  • School Context: sch_tk_yapendik_01 (TK Yapendik 01 Menteng)                    │
│  • Academic Period: 2026/2027 Semester Ganjil (ACTIVE via Stage 3)                │
│  • Classroom Anchor: Kelompok TK A Menteng (Rombel yang ditugaskan)               │
│  • Temporal Anchor: Hari Ini (26 Agustus 2026)                                    │
│                                                                                   │
│  UX Guarantee: Zero redundant selectors for School, Year, Semester, or Class.    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Core Intent-to-Action Interaction State Machine

### 3.1 Loop Fase 2: Penyambutan & Presensi Kedatangan

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ INTENT: "Kenzo baru saja tiba di kelas bersama orang tuanya."                      │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 1. Current State: Teacher Home • Tab Hari Ini (Fase Welcome)                      │
│ 2. System Display: Grid Kartu Wajah & Nama 16 Siswa TK A.                         │
│ 3. Teacher Action:                                                                │
│    • Tap kartu "Kenzo": Status berubah jadi HADIR (Hijau zamrud).                 │
│    • (Opsional / Long-Press): Cek mood (😊 Ceria) / Suhu (36.5°C).                │
│ 4. System Response:                                                               │
│    • Taktil haptic feedback + Counter terupdate ("15/16 Hadir").                 │
│    • Idempotent batch save ke PostgreSQL (uq_daily_attendance_record).            │
│ 5. Next State: Tetap berada di grid presensi tanpa memuat ulang layar.            │
└───────────────────────────────────────────────────────────────────────────────────┘
```

#### Alur Eksepsi: "Siswa Sakit / Izin / Ada Catatan Titipan Pagi"
```text
Teacher Action:
  Tap badge status Kenzo ➔ Pilih "SAKIT" ➔ Ketuk "Catatan Pagi" ➔ Ketik: "Demam ringan tadi malam".
System Response:
  • Status kartu berubah menjadi Merah Amber ("SAKIT").
  • Catatan otomatis tersimpan dan dimunculkan pada Morning Glance Kepala Sekolah.
  • Jika orang tua menitipkan obat: Muncul badge kuning "Titipan Obat Pukul 10:00" pada kartu Kenzo.
```

---

### 3.2 Loop Fase 4: Observasi Cepat di Sela Bermain (*Fast Capture*)

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ INTENT: "Kenzo berhasil merangkai jembatan balok simetris yang kokoh."           │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 1. Current State: Guru mendampingi sentra main (Ponsel di saku).                  │
│ 2. Teacher Action (⏱️ Target: < 15 detik):                                       │
│    • Buka Teacher Home ➔ Ketuk tombol mengambang (+) "Momen Cepat".               │
│    • Kamera aktif ➔ Ambil foto jembatan balok Kenzo.                              │
│    • Pilih nama: "Kenzo" (atau multi-pilih bila bermain bersama Budi).            │
│    • Tap Dimensi: [STEAM & Balok] • [Kemandirian].                                │
│    • Ketuk "Simpan Cepat" (Tanpa wajib mengetik paragraf panjang sekarang).      │
│ 3. System Response:                                                               │
│    • Foto & metadata tersimpan sebagai Draf Observasi Kanonikal.                  │
│    • Notifikasi mikro: "Momen Kenzo tersimpan. Siap diperkaya saat istirahat."    │
│ 4. Next State: Layar langsung kembali siap mendampingi anak (HWI-01 & HWI-05).    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.3 Loop Fase 7: Kepulangan & Pembagian Terkelola ke Orang Tua (*Governed Share*)

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ INTENT: "Guru ingin membagikan foto karya Kenzo ke Pak Budi saat kepulangan."     │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 1. Current State: Teacher Home • Tab Hari Ini / Feed Karya (Fase Handover).       │
│ 2. Teacher Action:                                                                │
│    • Ketuk kartu momen balok Kenzo tadi pagi.                                     │
│    • Geser tombol toggle: [Bagikan ke Orang Tua: ON].                             │
│    • (Opsional): Tambah pesan singkat: "Kenzo sangat bangga dengan karyanya!"     │
│    • Ketuk "Kirim ke Buku Penghubung".                                            │
│ 3. System Response:                                                               │
│    • Metadata `is_shared_with_guardian` diset TRUE pada database.                 │
│    • Event ditransmisikan ke portal Orang Tua Pak Budi secara terlindungi (C-11). │
│ 4. Next State: Kartu observasi mendapat badge hijau "Dibagikan ke Keluarga".      │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

### 3.4 Loop Fase 8: Sintesis Siang & Pengayaan Narasi Pedagogis

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│ INTENT: "Guru duduk santai di meja kelas pukul 12:30 untuk merapikan catatan."    │
├───────────────────────────────────────────────────────────────────────────────────┤
│ 1. Current State: Teacher Home • Tab Belajar & Karya (Fase Synthesize).           │
│ 2. System Display: Menampilkan daftar "4 Momen Cepat yang Perlu Diperkaya".       │
│ 3. Teacher Action:                                                                │
│    • Klik observasi balok Kenzo.                                                  │
│    • Perkaya narasi: "Ananda mampu menganalisis keseimbangan beban dan menyusun   │
│      12 balok kayu simetris secara mandiri tanpa terjatuh."                       │
│    • Tandai centang: [Jadikan Bukti Portofolio Rapor LPPA: YA].                   │
│    • Klik "Selesai & Arsipkan Bukti".                                             │
│ 4. System Response:                                                               │
│    • Observasi berstatus MATURE/COMPLETE.                                         │
│    • Otomatis tertaut ke Portofolio Semester Kenzo sebagai eviden resmi LPPA.     │
│ 5. Next State: Daftar tugas harian guru menjadi: "Semua Momen Hari Ini Tuntas."   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. One Child Context Navigation Model

Bila guru ingin meninjau tumbuh kembang **seorang anak secara mendalam**, alur interaksi tidak membuang konteks kelas:

```text
                             [DAFTAR KELAS TK A]
                                     │
                 ┌───────────────────┴───────────────────┐
                 ▼                                       ▼
        [Kartu Siswa: Kenzo]                    [Kartu Siswa: Alana]
                 │
                 ▼ (Tap Kartu)
    ┌─────────────────────────────────────────────────────────────┐
    │              ONE CHILD CONTEXT: KENZO (NIS: 2026001)        │
    │  • Status Kehadiran Semester Ini: 42/42 Hari (100%)         │
    │  • Linimasa Portofolio Karya: 8 Foto Karya Terverifikasi    │
    │  • Catatan Anekdot Terakhir: "Menolong teman berbagi krayon"│
    │  • Buku Penghubung Terakhir: "Pesan obat alergi terbaca"    │
    │  • Status Draf Rapor LPPA: 3/3 Dimensi Memiliki Eviden      │
    └─────────────────────────────────────────────────────────────┘
                 │
                 ▼ (Tindakan Cepat)
    [+ Tambah Observasi Kenzo]  [+ Tulis Catatan Ortu]  [Reviu Draf LPPA]
```

---

## 5. Multi-Teacher Concurrent Collaboration Matrix

Dalam satu rombel TK A yang dikelola bersama oleh **Guru Wali (Ibu Siti)** dan **Guru Pendamping (Ibu Maria)**:

```text
┌──────────────────────────────────────┬──────────────────────────────────────────┐
│ Skenario Kolaborasi                  │ Perilaku Interaksi & Respon Sistem       │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│ **Presensi Bersamaan di Pagi Hari**  │ Ibu Siti menyapa anak di pintu; Ibu Maria│
│                                      │ mengecek di meja. Keduanya mengetuk Hadir│
│                                      │ ➔ Database idempotent merge (Zero Lock). │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│ **Observasi Bergantian**             │ Ibu Siti mengambil foto karya seni;      │
│                                      │ Ibu Maria mencatat celoteh anak di sentra│
│                                      │ peran ➔ Keduanya muncul di feed kelas    │
│                                      │ dengan badge inisial pencatat (ST / MR). │
├──────────────────────────────────────┼──────────────────────────────────────────┤
│ **Penyusunan Rapor LPPA**            │ Ibu Siti dan Ibu Maria saling melengkapi │
│                                      │ catatan refleksi sebelum draf dikirim ke │
│                                      │ Kepala Sekolah via rpc_submit_report.    │
└──────────────────────────────────────┴──────────────────────────────────────────┘
```

---

## 6. Exception States & Graceful Fallbacks

| Kondisi Eksepsi | Deteksi Sistem | Respon & Tindakan Guru |
|:---|:---|:---|
| **Koneksi Internet Terputus (Offline)** | Jaringan Wi-Fi/Seluler drop saat guru mencatat. | Sistem beralih ke *Local IndexedDB Buffer* secara transparan. Indikator pojok: "Tersimpan Lokal (Sinkronisasi Otomatis saat Online)". |
| **Siswa Belum Presensi Pukul 08:30** | Jam menunjukkan 08:30, ada 1 anak belum ditandai. | Kartu anak berkedip lembut dengan tombol cepat: [Tandai Hadir Terlambat] / [Konfirmasi Izin ke Ortu]. |
| **Semester Telah CLOSED (Stage 3 Gate)**| Periode akademik telah ditutup secara resmi. | Input presensi & observasi harian dikunci (read-only) dengan banner informatif: *"Semester Ganjil telah selesai dan diarsipkan."* |
| **Akses Catatan Rahasia oleh Orang Tua**| Akun wali murid membuka portal keluarga. | PostgreSQL server-side filter otomatis menyaring seluruh observasi berstatus `is_staff_confidential = true` (Zero Leak). |

---

## 7. Consumption of Stage 3 Governance API

Spesifikasi interaksi ini mengonsumsi komponen tata kelola Stage 3 yang telah terkunci:

```text
INTERACTION LAYER (STAGE 4.1)          STAGE 3 FROZEN GOVERNANCE CORE
┌─────────────────────────────┐        ┌─────────────────────────────┐
│ 1. Presensi Harian          │ ─────> │ uq_daily_attendance_record  │
│ 2. Cek Mutasi Tutup Buku    │ ─────> │ trg_closed_period_guard     │
│ 3. Observasi & Catatan Staf │ ─────> │ observation_records (RLS)   │
│ 4. Pengiriman Draf LPPA     │ ─────> │ rpc_submit_report_for_review│
│ 5. Rekam Jejak Multi-Tahun  │ ─────> │ fn_get_student_trajectory() │
│ 6. Audit Trail Aktivitas    │ ─────> │ audit_logs trigger & engine │
└─────────────────────────────┘        └─────────────────────────────┘
```

---

## 8. Summary & Next Step

Dokumen ini mengunci perilaku interaksi guru pada Domain 4.1.

### 📋 Checklist Verifikasi Desain Interaksi
* [x] Alur kerja berbasis 8 Fase Ritme Hari (Bukan daftar layar statis).
* [x] Implementasi 5 Human Workflow Invariants (HWI-01 s.d. HWI-05).
* [x] Minimum Interaction Presensi (< 60 detik per kelas).
* [x] Progressive Capture Observasi (Cepat saat main, perkaya saat santai).
* [x] One Child Context Anchoring.
* [x] Governed Parent Sharing (C-11).
* [x] Kolaborasi Dua Guru Tanpa Konflik Data.
* [x] Kepatuhan Penuh pada Frozen Governance Core Stage 3.

---

**Certified by:**  
*Yapendik School OS Interaction Architecture Board*  
`2026-08-26 • Jakarta, Indonesia`
