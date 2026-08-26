# Yapendik School OS — Stage 4.1 Teacher Daily Operating Model v1.0
**Document ID:** `DOC-STAGE-4-1-TEACHER-DAILY-OPERATING-MODEL-v1.0`  
**Status:** `ACTIVE ARCHITECTURE CONTRACT — DISCOVERY BASELINE`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Teacher Daily Operating Loop & Pedagogical Rhythm`  
**Governance Substrate:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. North Star UX Philosophy & Teacher Persona

Pendidikan Anak Usia Dini (PAUD/TK) memiliki karakteristik interaksi manusia yang sakral. Perhatian utama guru TK harus 100% tercurah pada stimulasi tumbuh kembang, eksplorasi bermain, dan keselamatan emosional-fisik anak.

### 🌟 The North-Star UX Principle
> **"The School OS should disappear into the teacher's day rather than becoming another task in the teacher's day."**  
> *(School OS harus menyatu tanpa gesekan ke dalam ritme harian guru, bukan menjadi beban tugas administratif baru.)*

```text
               GURU KELAS TK (Ibu Siti) & GURU PENDAMPING (Ibu Maria)
┌───────────────────────────────────────────────────────────────────────────────────┐
│ • Lingkungan Fisik: Ruang kelas aktif, area sentra bermain, karpet lingkaran.     │
│ • Perangkat Kerja: Smartphone / Tablet / Laptop di meja guru saat istirahat.      │
│ • Beban Mental: Menjaga 15–18 anak aktif, mendampingi eksplorasi, menata dinamika.│
│ • Tantangan Administrasi: Kelelahan mengetik ulang hal yang sama di banyak buku.  │
│ • Kebutuhan Utama: "Bantu saya mencatat fakta secara cepat tanpa melepas anak."   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. The Teacher Daily Operating Loop (8 Fase Ritme Kerja Guru)

Guru TK tidak bekerja berdasarkan modul terpisah (*Presensi*, *Observasi*, *Rapor*), melainkan mengikuti **ritme fase operasional (*Operating States*)**:

```text
FASE 1: PREPARE (Persiapan Kelas & Lingkungan Belajar)
│ • Typical Window: 06:45 — 07:15
│ • Menyiapkan area sentra main & mereviu catatan penting / titipan anak kemarin.
│
FASE 2: WELCOME (Penyambutan & Check-In Anak)
│ • Typical Window: 07:15 — 07:45
│ • Anak tiba: Sapaan hangat, cek mood/kondisi fisik (suhu, luka kecil).
│ • Presensi instan & pencatatan pesan titipan dari orang tua/penjemput.
│
FASE 3: GATHER (Lingkaran Pagi & Intensi Bermain)
│ • Typical Window: 07:45 — 08:30
│ • Berdoa, bernyanyi, memperkenalkan tema aktivitas bermain hari ini (*Intentional Plan*).
│
FASE 4: PLAY & OBSERVE (Aktivitas Bermain Terfokus & Observasi Spontan)
│ • Typical Window: 08:30 — 10:00
│ • Anak bereksplorasi di sentra balok, seni, bahan alam, atau bermain peran.
│ • Guru mendampingi dan menangkap momen bermakna (*Empirical Evidence* & hasil karya).
│
FASE 5: CARE & BREAK (Makan Bersama, Toilet Training & Istirahat)
│ • Typical Window: 10:00 — 10:30
│ • Kemandirian, kebiasaan hidup bersih, log insiden bila ada anak jatuh/tumpah.
│
FASE 6: REFLECT (Refleksi Bersama & Lingkaran Penutup)
│ • Typical Window: 10:30 — 11:00
│ • Berbagi cerita pengalaman main hari ini, apresiasi karya anak, persiapan pulang.
│
FASE 7: HANDOVER (Kepulangan Anak & Serah Terima)
│ • Typical Window: 11:00 — 11:30
│ • Penyerahan anak ke penjemput sah, update pesan penting via Buku Penghubung.
│
FASE 8: SYNTHESIZE (Sintesis Guru & Persiapan Hari Esok)
│ • Typical Window: 11:30 — 13:00 (Primary Touchpoint: ~12:30)
│ • Guru duduk santai 15 menit: memperkaya narasi observasi pagi & reviu kesiapan esok.
│ • Sistem memvalidasi: "Semua anak tercatat hari ini, 0 pekerjaan tertinggal."
```

---

## 3. Human Workflow Invariants (HWI-01 → HWI-05)

Prinsip operasional yang mengikat seluruh desain interaksi Stage 4:

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                     STAGE 4 HUMAN WORKFLOW INVARIANTS (HWI)                           │
├───────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                       │
│  [HWI-01] TEACHER INTERACTION MUST BE CHILD-FIRST                                     │
│           Interaksi dengan anak > Interaksi administrasi layar. Guru tidak            │
│           boleh dipaksa menatap layar smartphone saat anak sedang membutuhkan.       │
│                                                                                       │
│  [HWI-02] CAPTURE ONCE, GOVERNED REUSE EVERYWHERE                                     │
│           Informasi ditangkap 1 kali sebagai bukti kanonikal. Distribusinya           │
│           (ke Portofolio, Orang Tua, atau LPPA) wajib melewati batas tata kelola      │
│           (governed decision & privacy boundary), BUKAN broadcast otomatis.          │
│                                                                                       │
│  [HWI-03] EVIDENCE BEFORE NARRATIVE (AUTHENTIC EVIDENCE FIRST)                        │
│           Sumber kebenaran adalah fakta & karya nyata anak. Narasi LPPA adalah        │
│           sintesis dari bukti yang telah terkumpul, bukan karangan fiktif/generatif. │
│                                                                                       │
│  [HWI-04] ONE CHILD CONTEXT (CONTEXT ANCHORING)                                       │
│           Saat guru memilih ananda Kenzo, seluruh layar terkunci pada konteks Kenzo.  │
│           Guru tidak perlu memilih ulang Sekolah ➔ TA ➔ Semester ➔ Kelas.            │
│                                                                                       │
│  [HWI-05] CAPTURE FAST, ENRICH LATER (PROGRESSIVE CAPTURE)                            │
│           Tangkap bukti minimal saat mendampingi anak (anak + foto + tag cepat);      │
│           perkaya narasi pedagogis saat jam istirahat/sintesis tanpa takut data hilang.│
│                                                                                       │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Ontological Evidence Model (Hubungan Event ➔ Observasi ➔ LPPA)

Untuk menjaga autentisitas data, hubungan ontologis ditetapkan secara tegas:

```text
                     REAL-WORLD CHILD EVENT
           (Anak bermain balok, menggambar, berbagi makanan)
                               │
                               ▼
                       CAPTURE INSTANT
                               │
                               ▼
                      CANONICAL OBSERVATION
        ┌──────────────────────┼──────────────────────┐
        ▼                      ▼                      ▼
 [Pedagogical Narrative]  [Child Context]   [Curriculum Dimension]
 (Catatan apa yang terjadi) (Ananda Kenzo)    (Jati Diri / STEAM)
                               │
                               ▼
                   CANONICAL EVIDENCE ATTACHMENT
                (Foto karya, audio celoteh, catatan teks)
                               │
            ┌──────────────────┴──────────────────┐
            ▼                                     ▼
   [GOVERNED PORTFOLIO]                [GOVERNED PARENT SHARE]
(Koleksi bukti karya terpilih)       (Hanya bila disetujui guru: C-11)
            │                                     │
            └──────────────────┬──────────────────┘
                               │
                               ▼
                     [LPPA SYNTHESIS LAYER]
        (Sintesis holistik akhir semester berakar pada bukti autentik)
                               │
                               ▼
                    [HEADMASTER APPROVAL]
```

### Penegasan Hubungan:
* **Foto $\neq$ Observasi:** Foto adalah *Evidence Attachment*. Observasi adalah interpretasi pedagogis guru terhadap momen tersebut.
* **RPPH $\neq$ Observasi:** RPPH adalah *Intentional Plan* (rencana rancangan pengalaman main guru), sedangkan Observasi adalah *Empirical Fact* (apa yang benar-benar dieksplorasi dan dilakukan anak). Keduanya berdialog, namun **bukan hubungan deterministik kaku**.
* **LPPA $\neq$ Data Baru:** LPPA adalah **Synthesis Layer** dari kumpulan observasi dan portofolio satu semester.

---

## 5. Moments of Interaction (Micro-Touchpoints)

Sepanjang hari, guru hanya menyentuh School OS pada **4 momen spesifik**:

```text
MOMEN 1: PENYAMBUTAN (Fase 2 | ~07:15) ⏱️ Target Desain: < 60 detik
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Guru membuka ponsel ➔ Muncul rombel aktifnya (TK A) ➔ Tap status kehadiran       │
│ • 14 Hadir (Hijau) • 1 Izin (Kuning) • 1 Sakit (Merah)                            │
│ • Cepat, taktil, dengan opsi catatan kondisi pagi ("Kenzo agak pilek").           │
└───────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
MOMEN 2: MOMEN EMAS BERMAIN (Fase 4 | ~09:15) ⏱️ Target Desain: < 30 detik
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Kenzo menyusun jembatan balok seimbang ➔ Jepret foto                              │
│ • Minimum Capture: Pilih Kenzo + Foto + Tag Dimensi "STEAM/Balok"                 │
│ • Simpan Cepat (Enrichment narasi dapat dilakukan saat Fase 8 Sintesis).          │
└───────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
MOMEN 3: KEPULANGAN & HANDOVER (Fase 7 | ~11:15) ⏱️ Target Desain: < 2 menit
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Guru memilih catatan foto karya Kenzo ➔ Tandai: "Bagikan ke Orang Tua"            │
│ • Pak Budi menerima update: "Kenzo sangat fokus bermain balok hari ini!"          │
│ • Pesan titipan obat/makanan terkonfirmasi dibaca oleh penjemput.                 │
└───────────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      ▼
MOMEN 4: SINTESIS SIANG (Fase 8 | ~12:30) ⏱️ Target Desain: 10–15 menit
┌───────────────────────────────────────────────────────────────────────────────────┐
│ Guru membuka laptop/tablet di meja ➔ Ringkasan Hari Ini:                          │
│ • 100% Presensi tervalidasi • 4 Observasi terdata • 1 Pengumuman terkirim.        │
│ • Memperkaya deskripsi narasi observasi pagi; data siap mengalir ke LPPA.         │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 6. Governed Distribution & Privacy Boundary (C-11 Enforcement)

Sesuai penyempurnaan **HWI-02 (*Capture Once, Governed Reuse*)**, data observasi tidak disiarkan secara serampangan:

```text
CANONICAL OBSERVATION CAPTURED
               │
               ▼
   [GOVERNANCE & VISIBILITY GATE]
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
   [STAFF]  [PORTFOLIO] [PARENT]
      │        │          │
      │        │          └── Only if is_shared_with_guardian = true
      │        │              (Protected by C-11 & Foreign Guardian Barrier)
      │        │
      │        └── Curated for Child's Developmental Portfolio
      │
      └── Staff-only notes (is_staff_confidential = true) 
          strictly hidden from parents & unauthorized callers.
```

---

## 7. Executive Morning Glance (Supervisi Kepala Sekolah Tanpa Clutter)

Kepala Sekolah (Ibu Esther) tidak membutuhkan 27 diagram chart KPI yang rumit di pagi hari. Prinsipnya: **"Surface exceptions, not everything."**

```text
EXECUTIVE MORNING GLANCE (Pukul 08:30 WIB)
┌───────────────────────────────────────────────────────────────────────────────────┐
│ 🏫 TK Yapendik 01 Menteng • Semester Ganjil 2026/2027                             │
├───────────────────────────────────────────────────────────────────────────────────┤
│ • Presensi Siswa: 31 / 32 Hadir (1 Sakit: Kenzo - TK A)                           │
│ • Kesiapan Guru: 2/2 Rombel Aktif Didampingi Pendidik                             │
│ • Perhatian Khusus Hari Ini: 1 Siswa TK A alergi udang (Catatan Orang Tua)       │
│ • Status LPPA Akhir Semester: 32/32 Draf Disetujui (100% Siap Tutup Semester)    │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Unified Teacher Home Architecture (Menghindari Fragmentasi 8 Workspace)

Daripada memecah guru ke dalam 8 tombol workspace terpisah, antarmuka guru disatukan ke dalam **Teacher Home (*Today / Current Class Context*)**:

```text
                             TEACHER HOME
                  (Konteks: Kelas TK A • Hari Ini)
                                  │
      ┌───────────────────────────┼───────────────────────────┐
      ▼                           ▼                           ▼
[TAB 1: HARI INI]          [TAB 2: BELAJAR & KARYA]     [TAB 3: SISWA & RAPOR]
• Presensi Cepat           • Jurnal Rencana Main (RPPH) • Roster Siswa Rombel
• Cek Mood & Kedatangan    • Feed Observasi & Foto      • Portofolio per Anak
• Buku Penghubung Harian   • Kurasi Portofolio          • Draf Sintesis LPPA
```

---

## 9. Hubungan dengan Stage 3 Governance API

Stage 4.1 sepenuhnya mengonsumsi **Stage 3 Frozen Baseline API**:

```text
STAGE 3 GOVERNANCE API (FROZEN)

4 Governed Mutating RPCs:
├── rpc_close_academic_semester (Dipanggil saat rekonsiliasi LPPA 100% selesai)
├── rpc_initialize_next_semester (Membuka semester penerus)
├── rpc_promote_classroom_cohort (Promosi rombel siswa antar-tahun)
└── rpc_graduate_student_cohort (Kelulusan siswa kelompok B)

2 Governed Derived / Query Functions:
├── fn_derive_school_health_telemetry (Evaluasi kesehatan lembaga on-the-fly)
└── fn_get_student_longitudinal_trajectory (Linimasa multi-tahun & batas privasi C-11)
```

---

## 10. Summary & Stage 4.1 Operating Review Gate

| Elemen Keputusan | Status Baseline |
|:---|:---:|
| **Teacher Daily Operating Loop (8 Fase)** | 🟢 APPROVED |
| **5 Human Workflow Invariants (HWI-01 s.d. HWI-05)** | 🟢 APPROVED |
| **Ontological Evidence Model (Event ➔ Observation ➔ Evidence ➔ Portfolio ➔ LPPA)** | 🟢 APPROVED |
| **Governed Reuse & Privacy Barrier (C-11)** | 🟢 APPROVED |
| **North-Star UX Philosophy ("OS Disappears into the Day")** | 🟢 APPROVED |
| **Unified Teacher Home Navigation Concept** | 🟢 APPROVED |

---

**Drafted and Governed by:**  
*Yapendik School OS Pedagogical Architecture Board*  
`2026-08-26 • Jakarta, Indonesia`
