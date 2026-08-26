# STAGE 4.2 FASE E — LPPA PUBLICATION & CANONICAL OUTPUT SPECIFICATION v1.0
## Yapendik School OS — TK Pilot

---

## 1. Executive Summary & Epistemological Stance

Fase E mendefinisikan lapisan **Publication, Canonical Output, and Immutable Archive** untuk Laporan Perkembangan Peserta Didik Anak Usia Dini (LPPA) pada Yapendik School OS.

### Prinsip Arsitektural Utama

> **"PDF is NOT the source of truth. PDF is an official canonical projection of an Approved & Published LPPA Record."**

Rantai Siklus Hidup LPPA:
$$\mathbf{DRAFT} \xrightarrow{\text{Guru}} \mathbf{READY\_FOR\_REVIEW} \xrightarrow{\text{Kepala Sekolah}} \mathbf{APPROVED} \xrightarrow{\text{Otorisasi Publikasi}} \mathbf{PUBLISHED} \xrightarrow{\text{Canonical Seal}} \mathbf{Print/PDF\ Projection}$$

---

## 2. Invariant Tata Kelola & Pra-Kondisi Publikasi (Publication Pre-conditions)

Sebuah dokumen LPPA hanya sah untuk dipublikasikan ke Portal Wali Murid dan dicetak sebagai dokumen resmi apabila memenuhi seluruh invarian berikut:

| Invariant ID | Nama Invariant | Deskripsi Aturan Tata Kelola |
|---|---|---|
| **PUB-INV-01** | *Strict Approval Gate* | Dokumen LPPA **harus berstatus `APPROVED`** oleh Kepala Sekolah atau Pengawas Yayasan sebelum dapat dipublikasikan. Percobaan mempublikasikan dokumen berstatus `DRAFT` atau `READY_FOR_REVIEW` akan ditolak dengan `INVALID_STATUS_TRANSITION`. |
| **PUB-INV-02** | *Active Semester Only* | Publikasi hanya dapat dilakukan pada semester yang berstatus `ACTIVE`. Semester yang telah `CLOSED` memicu proteksi `CANNOT_MUTATE_CLOSED_SEMESTER`. |
| **PUB-INV-03** | *Invariant C-11 Zero Leakage* | Payload kanonikal LPPA yang dipublikasikan **wajib 100% bebas dari catatan staf rahasia** (`is_staff_confidential = true`). |
| **PUB-INV-04** | *Cryptographic Integrity Seal* | Setiap dokumen yang diterbitkan menghasilkan `document_checksum_sha256` dari snapshot JSON kanonikal untuk menjamin dokumen tidak dimanipulasi setelah pengesahan. |
| **PUB-INV-05** | *Immutability by Construction* | Setelah status menjadi `PUBLISHED`, draf narasi dan rating dikunci secara permanen menjadi *Read-Only Archive*. Mutasi lanjutan memerlukan *Governed Revision Flow*. |
| **PUB-INV-06** | *Guardian Immediate Access* | Transisi ke `PUBLISHED` secara otomatis membuka visibilitas LPPA pada portal orang tua murid (`Role: GUARDIAN`) yang sah (terisolasi per-anak sesuai batas privasi). |

---

## 3. Canonical Published LPPA Record Data Contract

Data Transfer Object (DTO) untuk arsip kanonikal yang diterbitkan didefinisikan sebagai berikut:

```typescript
export interface CanonicalPublishedLppaRecord {
  /** Unique published archive identifier */
  published_record_id: string; // Format: lppa_pub_{school_id}_{student_id}_{semester}_{timestamp}
  
  /** Original LPPA source report ID */
  report_id: string;
  
  /** Institutional context */
  school_id: string;
  school_name: string;
  school_npsn: string;
  class_id: string;
  class_name: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';

  /** Official Publication Metadata */
  publication_metadata: {
    published_at: string; // ISO 8601
    published_by_person_id: string;
    published_by_name: string;
    published_by_role: 'HEADMASTER' | 'YAPENDIK_SUPERADMIN';
    official_report_number: string; // e.g. "042/LPPA-TK-YPD/2026"
    canonical_checksum_sha256: string;
    verification_qr_payload: string;
  };

  /** Student Demographics at publication time */
  student_snapshot: {
    student_id: string;
    full_name: string;
    nis: string;
    nisn?: string;
    gender: 'MALE' | 'FEMALE';
    birth_place_date: string;
    age_years_months: string;
    guardian_name: string;
  };

  /** 4 Kurikulum Merdeka PAUD Elements */
  curriculum_elements: {
    nilai_agama_budi_pekerti: CanonicalElementReport;
    jati_diri: CanonicalElementReport;
    literasi_steam: CanonicalElementReport;
    projek_p5: CanonicalElementReport & {
      project_title: string;
      project_description: string;
    };
  };

  /** Physical Growth & Health */
  physical_growth_snapshot: {
    height_cm: number;
    weight_kg: number;
    head_circumference_cm?: number;
    physical_notes: string;
    vision_hearing_notes: string;
  };

  /** Attendance Summary */
  attendance_snapshot: {
    hadir: number;
    sakit: number;
    izin: number;
    alpa: number;
    attendance_percentage: number;
    total_effective_days: number;
  };

  /** Homeroom Teacher & Institutional Reflections */
  homeroom_teacher_reflection: string;
  headmaster_approval_notes: string;

  /** Canonical Signatures */
  signatures: {
    teacher: {
      name: string;
      title: string;
      signed_at: string;
    };
    headmaster: {
      name: string;
      title: string;
      signed_at: string;
      digital_signature_stamp: string;
    };
  };
}

export interface CanonicalElementReport {
  element_title: string;
  rating_summary: 'BB' | 'MB' | 'BSH' | 'BSB';
  final_narrative: string;
  growth_recommendations: string;
  supporting_evidences: {
    observation_id: string;
    observed_at: string;
    milestone_rating: string;
    anecdote_snippet: string;
    photo_url?: string;
  }[];
}
```

---

## 4. Spesifikasi Tata Letak Cetak & Visual Preview (E2 & E3 Canonical Layout)

Dokumen Cetak LPPA dirancang dengan tipografi profesional, standar estetika **UI/UX Design Foundation v1.0**, serta memenuhi format baku Rapor PAUD Kurikulum Merdeka:

```text
┌───────────────────────────────────────────────────────────────────────┐
│                      YAYASAN PENDIDIKAN KRISTEN                      │
│                  TK YAPENDIK 01 MENTENG — JAKARTA                    │
│     Jl. Pegangsaan Barat No. 12, Menteng, Jakarta Pusat • NPSN: 20104821   │
├───────────────────────────────────────────────────────────────────────┤
│ LAPORAN CAPAIAN PERKEMBANGAN PESERTA DIDIK (LPPA)                     │
│ Tahun Ajaran: 2026/2027 • Semester: GANJIL • Kelompok A (4-5 Tahun)   │
├───────────────────────────────────────────────────────────────────────┤
│ Nama Ananda  : KENZO PRATAMA SANTOSO         NIS / NISN: 20260101 / - │
│ Nama Wali    : Budi Santoso, S.T.            Fase Usia : Fondasi      │
├───────────────────────────────────────────────────────────────────────┤
│ 1. NILAI AGAMA DAN BUDI PEKERTI                               [ BSH ] │
│    [Narasi Reflektif Capaian Anak...]                                │
│    Rekomendasi Stimulasi: [Rekomendasi...]                            │
│                                                                       │
│ 2. JATI DIRI & REGULASI EMOSI                                 [ BSH ] │
│    [Narasi Reflektif Capaian Anak...]                                │
│                                                                       │
│ 3. DASAR LITERASI, MATEMATIKA, SAINS & SENI (STEAM)           [ BSB ] │
│    [Narasi Reflektif Capaian STEAM...]                                │
│    • Bukti Karya: [Foto Miniatur Balok] - "Menyusun menara 12 tingkat"│
│                                                                       │
│ 4. PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5)             [ BSB ] │
│    Projek: "Aku Sayang Bumi & Sentra Main Kontekstual"               │
│    [Narasi Keterlibatan dan Kolaborasi Projek...]                    │
├───────────────────────────────────────────────────────────────────────┤
│ PERTUMBUHAN FISIK & KESEHATAN        │ REKAPITULASI KEHADIRAN (100%)  │
│ • Tinggi Badan : 106.0 cm            │ • Hadir : 10 Hari              │
│ • Berat Badan  : 18.5 kg             │ • Sakit : 0 Hari  • Izin : 0   │
│ • Lingkar Kepala: 50.2 cm            │ • Alpa  : 0 Hari               │
├───────────────────────────────────────────────────────────────────────┤
│ REFLEKSI PENDIDIK:                                                    │
│ "Kenzo adalah ananda yang bersemangat, ceria, dan mandiri..."         │
├───────────────────────────────────────────────────────────────────────┤
│ Mengetahui,                          Jakarta, 26 Agustus 2026         │
│ Orang Tua / Wali Murid               Guru Kelas TK A                  │
│                                                                       │
│ ( Budi Santoso, S.T. )               ( Siti Rahmawati, S.Pd )         │
│                                                                       │
│                      Mengesahkan,                                     │
│                      Kepala Sekolah TK Yapendik 01                    │
│                      [ STEMPEL & DIGITAL SIGNATURE ]                  │
│                      ( Dra. Esther Nugroho, M.Pd )                    │
└───────────────────────────────────────────────────────────────────────┘
```

---

## 5. Rencana Tahapan Eksekusi Fase E

1. **E1 — Specification & Contracts** (Selesai pada dokumen ini).
2. **E2 — LPPA Print Preview & Canonical Projection Component**:
   - Komponen visual `LppaPrintPreviewModal.tsx` yang dapat diakses oleh Guru, Kepala Sekolah, dan Wali Murid.
3. **E3 — Official PDF / Print Renderer Engine**:
   - Fungsi render cetak presisi resolusi tinggi (`window.print()` berskala `@media print` dengan formatting A4 dan page-break governance).
4. **E4 — Publication Action in Headmaster Hub & Guardian View Sync**:
   - Tombol publikasi `[📢 Publikasikan ke Orang Tua]` di Headmaster Hub.
   - Portal Wali Murid (`StudentJourneyTimeline.tsx` / `LppaGuardianView.tsx`) menampilkan tab *Rapor Resmi LPPA* saat status `PUBLISHED`.
5. **E5 — Final Stage 4.2 Acceptance & Full Regression Testing**:
   - Penambahan modul pengujian Publikasi pada `tests/stage4_2_lppa_reporting.test.ts`.
   - Eksekusi master pipeline 146+ checks $\rightarrow$ 100% PASS.
   - Pembuatan artefak sertifikasi resmi Stage 4.2.
