# YAPENDIK INSTITUTIONAL LEARNING & MULTI-SCHOOL GOVERNANCE
## Architecture & Operating Loop Specification (v1.0)
### Yapendik School OS — TK Pilot & Multi-Unit Foundation

---

## 1. Executive Purpose: Apa Arti "LEARN" Bagi Yapendik?

Dalam Yapendik School OS, **LEARN** bukan sekadar dashboard analitik, katalog KPI, atau modul pelaporan hierarkis.

> **Definisi Arsitektural**:  
> **LEARN** adalah **lapisan pembelajaran institusional dan tata kelola multi-sekolah** yang memungkinkan Yayasan memahami realitas empiris sekolah-sekolah di bawah naungannya, merumuskan dukungan sumber daya yang berkeadilan, dan menerbitkan panduan strategis tanpa pernah mereduksi kedaulatan pedagogis guru atau otonomi kepemimpinan Kepala Sekolah.

```text
                               YAPENDIK 5-TIER OPERATING MODEL
                               
    ┌─────────────────────────────────────────────────────────────────────────────┐
    │ 5. LEARN       │ Institutional Learning & Multi-School Governance Loop       │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ 4. ASSURE      │ School Safety & Operational Assurance Loop                 │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ 3. CONTINUE    │ Child Developmental Continuity Across Semesters            │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ 2. TRUST       │ Canonical Institutional Record & LPPA Synthesis            │
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ 1. CAPTURE     │ Teacher Daily Operating Memory (Hari Ini / Belajar / Siswa)│
    ├─────────────────────────────────────────────────────────────────────────────┤
    │ 0. GOVERNANCE  │ Identity • Context • Semester State Machine • Audit Ledgers │
    └─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Lima Invarian Arsitektural Yayasan (The 5 Foundation Invariants)

| Kode Invarian | Nama Invarian | Definisi & Penegakan Teknis |
|---|---|---|
| **FB-01** | *Zero Individual Exposure* | Batas privasi ditegakkan pada **layer proyeksi data (projection boundary)** sebelum konteks Yayasan. Yayasan tidak memiliki rute, query, atau schema untuk membaca nama anak, rekam medis privat, atau catatan personal guru. |
| **FB-02** | *Derived Telemetry Only* | Seluruh telemetri multi-sekolah dihitung secara dinamis (*on-the-fly derived calculations*). Dilarang membuat tabel status KPI statis/mutable yang rentan dimanipulasi (*anti-gaming*). |
| **FB-03** | *Autonomous Unit Leadership* | Yayasan berperan sebagai lapisan kepengawasan (*stewardship*) dan penyedia dukungan; keputusan operasional dan pedagogis harian tetap menjadi hak mutlak Kepala Sekolah dan Guru. |
| **FB-04** | *No Cross-School Ranking or Shaming* | Telemetri multi-sekolah dirancang murni untuk prinsip **Equity & Support** (pemerataan mutu dan identifikasi kebutuhan dukungan), bukan untuk memeringkat atau menghukum sekolah. |
| **FB-05** | *Institutional Learning Must Close the Loop* | Wawasan institusional tidak boleh berhenti sebagai grafik dashboard. Setiap wawasan wajib memiliki jalur: $\text{INSIGHT} \rightarrow \text{HUMAN DECISION} \rightarrow \text{SUPPORT / DIRECTIVE} \rightarrow \text{SCHOOL RESPONSE} \rightarrow \text{FEEDBACK}$. |

---

## 3. Institutional Objects: Apa yang Boleh Dipelajari Yayasan?

Yayasan mempelajari **pola sistemik**, bukan peristiwa perorangan:

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│ 1. PATRON PERKEMBANGAN KURIKULUM (Curriculum & Pedagogical Patterns)        │
│    • Distribusi domain perkembangan (Agama, Jati Diri, Literasi/STEAM, P5)  │
│    • Sentra bermain yang paling efektif memantik keterlibatan anak           │
│    • Kebutuhan penguatan kapasitas guru pada domain tertentu                │
├─────────────────────────────────────────────────────────────────────────────┤
│ 2. PATRON KESELAMATAN & OPERASIONAL (Safety & Operational Patterns)         │
│    • Tren musiman sinyal kesehatan (misal: lonjakan demam cuaca pancaroba)   │
│    • Efektivitas SOP pertolongan pertama (P3K) dan rekonsiliasi kepulangan  │
│    • Identifikasi kerentanan sarana fisik (lokasi rawan benturan/terpeleset)│
├─────────────────────────────────────────────────────────────────────────────┤
│ 3. INTEGRITAS TATA KELOLA AKADEMIK (Academic Governance Integrity)          │
│    • Kepatuhan siklus semester & verifikasi LPPA tepat waktu (Option A Gate)│
│    • Keseimbangan rasio pendampingan guru terhadap rombel                   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Rantai Aliran Pengetahuan (Knowledge Flow & The Closed Loop)

Aliran pengetahuan bergerak secara bertahap dari fakta kelas hingga umpan balik perubahan:

```text
                 1. SCHOOL REALITY (Fakta Operasional Kelas)
                               │
                               ▼
                 2. DERIVED INSTITUTIONAL PROJECTION (Proyeksi Agregat)
                               │
                               ▼
                 3. SYSTEM PATTERN / SIGNAL (Deteksi Anomali Sistemik)
                               │
                               ▼
                 4. HUMAN INTERPRETATION (Telaah Pimpinan Yayasan)
                               │
                               ▼
                 5. GOVERNANCE DECISION (Keputusan Strategis)
                               │
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
   6A. SUPPORT ALLOCATION              6B. INSTITUTIONAL DIRECTIVE
       (Bantuan Dana / Pelatihan)          (Panduan SOP / Kurikulum)
             │                                   │
             └─────────────────┬─────────────────┘
                               ▼
                 7. CONTEXTUAL SCHOOL ADOPTION (Penerapan Sekolah)
                               │
                               ▼
                 8. OBSERVED PRACTICE EFFECT (Dampak Teramati di Kelas)
                               │
                               └──────────► LOOP TERTUTUP (KEMBALI KE 1)
```

---

## 5. Matriks Hirarki Otoritas (Hierarchy of Authority)

Prinsip dasar: **Semakin ke atas semakin banyak agregasi; semakin ke bawah semakin banyak otoritas kontekstual.**

```text
TINGKAT          PERAN                   OTORITAS & BATASAN
─────────────────────────────────────────────────────────────────────────────
YAYASAN          Stewardship &           • Menetapkan arah strategis & visi kurikulum
(Pusat)          System Support          • Mengalokasikan sumber daya & pelatihan
                                         • Menerbitkan direktif panduan institusional
                                         ❌ Dilarang membatalkan asesmen guru / memutasi nilai

KEPALA SEKOLAH   School Governance &     • Menyesuaikan direktif Yayasan ke konteks lokal
(Satuan)         Operational Leadership  • Mengesahkan LPPA & mengelola siklus semester
                                         • Memimpin penanganan insiden & serah terima murid
                                         ❌ Dilarang mengubah catatan bukti empiris guru

GURU             Authoritative           • Otoritas mutlak asesmen formatif harian
(Kelas)          Pedagogical Decision    • Merancang stimulasi bermain anak
                                         • Mencatat bukti karya & narasi capaian anak
```

---

## 6. Model Dukungan Institusional (Support, Not Surveillance)

Ketika sistem mendeteksi pola kelemahan sistemik di sebuah sekolah (misal: capaian STEAM rendah di suatu unit):
- **Sistem Tradisional (Surveillance)**: Memberikan skor merah, menurunkan ranking sekolah, dan menerbitkan surat peringatan.
- **Yapendik School OS (Support)**: Mengidentifikasi kebutuhan intervensi $\rightarrow$ Yayasan mengirimkan fasilitator sentra balok & bahan loose-parts tambahan $\rightarrow$ Guru mengikuti lokakarya $\rightarrow$ Dampak diukur pada siklus berikutnya melalui peningkatan ragam stimulasi karya.

---

## 7. Model Direktif Kebijakan (Directives Without Micromanagement)

1. **Penerbitan Direktif**: Yayasan menerbitkan *Institutional Governance Directive* (misal: "Protokol Pencegahan Dehidrasi & Pemantauan Suhu Cuaca Ekstrem").
2. **Penerimaan Kontekstual**: Kepala Sekolah menerima direktif di ruang kendali akademiknya, menyetujui penerapan, dan menyesuaikannya dengan fasilitas yang ada.
3. **Umpan Balik Kepatuhan**: Kepatuhan tercermin secara otomatis dari penurunan sinyal pengecualian di sekolah tersebut tanpa perlu membuat laporan manual terpisah.

---

## 8. Kondisi Penutupan Siklus (Closure Condition)

Siklus **LEARN** dinyatakan **benar-benar tertutup (Closed Loop)** hanya jika memenuhi 4 kriteria:
1. **Pattern Detected**: Sistem mendeteksi kebutuhan atau keberhasilan pola agregat.
2. **Action Taken**: Yayasan menerbitkan dukungan sumber daya atau direktif kebijakan.
3. **School Adopted**: Kepala Sekolah mengonfirmasi adopsi direktif dalam konteks sekolahnya.
4. **Effect Measured**: Data operasional siklus berikutnya merefleksikan perubahan positif secara alami.

---

*Disahkan sebagai Dokumen Kerangka Arsitektur Tata Kelola & Pembelajaran Multi-Sekolah Yapendik School OS.*
