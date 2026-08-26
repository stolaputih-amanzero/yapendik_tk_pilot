# Yapendik School OS — Stage 4.2 LPPA Synthesis & Reporting Engine Specification v1.0
**Document ID:** `DOC-STAGE-4-2-LPPA-SPEC-v1.0`  
**Status:** `ACTIVE ARCHITECTURE CONTRACT — PHASE A DOMAIN & COMMAND SPECIFICATION`  
**Date:** `2026-08-26`  
**Target Milestone:** `Stage 4.2 Authentic LPPA Synthesis & Reporting Engine (Kurikulum Merdeka PAUD)`  
**Baseline Dependency:** `Stage 3 Frozen Baseline` & `Stage 4.1 Certified Implementation Baseline` & `DOC-UI-UX-DESIGN-FOUNDATION-v1.0`

---

## 1. Core Architectural Principle & Epistemological Stance

Stage 4.2 menetapkan batas filosofis dan teknis mutlak mengenai bagaimana sistem menyusun Laporan Perkembangan Peserta Didik Anak (LPPA):

> **"LPPA Synthesis Engine generates a proposed narrative, not the truth."**  
> *"Engine sintesis bertugas mengumpulkan, menstrukturkan, dan mengusulkan draf narasi awal berdasarkan bukti empiris yang telah dikurasi. Guru kelas tetaplah satu-satunya pengarang (sole author), kurator, dan penanggung jawab pedagogis atas kebenaran narasi perkembangan anak."*

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        LPPA AUTHENTIC SYNTHESIS ARCHITECTURE                           │
├────────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                        │
│  [CANONICAL EVIDENCE STREAM]                                                           │
│  • Observasi Harian (Stage 4.1)                                                        │
│  • Curated Portfolio Flags (`is_lppa_evidence = true`)                                 │
│  • Empirical Ratings (BB / MB / BSH / BSB)                                             │
│  • Kurikulum Merdeka PAUD Tags (STEAM, Jati Diri, NABP, P5)                            │
│  • Privacy Barrier (Invariant C-11: `is_staff_confidential` EXCLUDED)                  │
│                                 │                                                      │
│                                 ▼                                                      │
│  [LPPA SYNTHESIS ENGINE (Phase B)]                                                     │
│  • Evidence Aggregator & Pattern Identifier                                            │
│  • Grounded Narrative Proposer (Zero Hallucination • Traceable Evidence IDs)           │
│                                 │                                                      │
│                                 ▼                                                      │
│  [SYNTHESIS DRAFT (Proposal State)]                                                    │
│  • Proposed Narrative per Element                                                      │
│  • Linked Evidence Citations (Foto karya, tanggal observasi, catatan anekdot)          │
│                                 │                                                      │
│                                 ▼                                                      │
│  [TEACHER REVIEW & AUTHORING (Human Loop)]                                             │
│  • Guru mengoreksi, melengkapi konteks, dan memfinalisasi bahasa reflektif              │
│  • Status: DRAFT ──► READY_FOR_REVIEW                                                  │
│                                 │                                                      │
│                                 ▼                                                      │
│  [HEADMASTER VERIFICATION GATE]                                                        │
│  • Kepala Sekolah meninjau keselarasan bukti & narasi                                  │
│  • Status: READY_FOR_REVIEW ──► APPROVED                                               │
│                                 │                                                      │
│                                 ▼                                                      │
│  [PUBLISHED LPPA & PARENT PORTAL]                                                      │
│  • Rapor Resmi Terbit (Format Cetak PDF & Buku Jejak Digital)                          │
│  • Terkunci Permanen saat Semester Ditutup (Stage 3 Option A Guard)                    │
│                                                                                        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. 10 Canonical Constraints for LPPA Narrative

1. **Evidence First**: Setiap kalimat capaian perkembangan harus berakar pada minimal 1 rekaman observasi otentik yang telah dikurasi.
2. **Child-Centered**: Narasi berfokus pada dinamika pertumbuhan dan pemahaman anak, bukan sekadar inventaris aktivitas kelas yang diikutinya.
3. **Progress Over Labeling**: Menggambarkan proses, daya juang, keunikan, dan area yang sedang mekar (*emerging growth*), bukan memberi label kaku/stigma pada anak.
4. **Specific Over Generic**: Menolak template hampa (*e.g.* *"Ananda berkembang sangat baik di kelas"*). Wajib menyebutkan contoh nyata (*e.g.* *"Ananda Kenzo mampu merancang jembatan balok dengan 12 balok berpasangan secara mandiri"*).
5. **Teacher Remains the Author**: AI/Engine hanya asisten penyusun proposal draf; guru memegang kontrol penuh atas teks akhir.
6. **No Fabrication (Zero Hallucination)**: Engine dilarang keras mengarang kesimpulan capaian di luar koridor data bukti yang tersedia.
7. **Privacy by Construction (Invariant C-11)**: Catatan internal staf/guru berlabel `is_staff_confidential = true` **HARAM** masuk atau dijadikan sumber ekstraksi narasi rapor.
8. **Developmental Continuity**: Narasi menggambarkan lintasan perkembangan anak sepanjang semester, bukan sekadar cuplikan hari kemarin.
9. **Human, Dignified & Warm**: Bahasa menggunakan nada apresiatif, mendidik, hangat, dan mencerminkan kasih Kristiani dalam tradisi Yapendik.
10. **Traceable**: Setiap bagian narasi memiliki tautan balik (*backlink*) ke ID rekaman bukti foto/karya anak aslinya.

---

## 3. Kurikulum Merdeka PAUD Core Elements & Reporting Structure

Struktur Rapor LPPA PAUD Yapendik mencakup 4 Elemen Capaian Pembelajaran Utama + 1 Elemen Projek P5 + Rekam Kesehatan Fisik:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STRUKTUR RESMI RAPOR LPPA PAUD YAPENDIK                         │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Nilai Agama & Budi Pekerti  │ • Mengenal Tuhan melalui ciptaan-Nya & ibadah harian  │
│    (NABP)                      │ • Sikap santun, kasih sayang, dan toleransi sesama    │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Jati Diri                   │ • Regulasi emosi, kemandirian, dan interaksi sosial   │
│    (JATIDIRI)                  │ • Motorik kasar, motorik halus, dan kebersihan diri   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Dasar Literasi, Matematika, │ • Minat buku, fonemik, pra-menulis, dan komunikasi    │
│    Sains, Teknologi, Rekayasa, │ • Eksplorasi sains, konsep bilangan, pola spasial     │
│    dan Seni (STEAM)            │ • Konstruksi balok, karya seni rupa, gerak & musik    │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 4. Projek Penguatan Profil     │ • Dokumentasi tema projek kontekstual semester        │
│    Pelajar Pancasila (P5)      │ • Dimensi: Gotong Royong, Kreatif, Bernalar Kritis    │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 5. Pertumbuhan Fisik & Medis   │ • Tinggi Badan (cm), Berat Badan (kg), Lingkar Kepala │
│                                │ • Ringkasan presensi (Hadir, Sakit, Izin, Alpa)       │
│                                │ • Catatan kesehatan mata, telinga, gigi, dan imunisasi│
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 6. Refleksi & Pesan Guru       │ • Pesan peneguhan dari Guru Kelas untuk Orang Tua     │
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 4. Phase A — Domain Types & Data Contracts

Spesifikasi antarmuka tipe data kanonikal untuk `src/types/lppaReportingTypes.ts`:

```typescript
export type LppaElementKey = 
  | 'NILAI_AGAMA_BUDI_PEKERTI'
  | 'JATI_DIRI'
  | 'LITERASI_STEAM'
  | 'PROJEK_P5';

export type LppaReportStatus = 
  | 'DRAFT'
  | 'READY_FOR_REVIEW'
  | 'APPROVED'
  | 'PUBLISHED';

export interface LppaElementNarrativeDraft {
  element_key: LppaElementKey;
  element_title: string;
  rating_summary: 'BSB' | 'BSH' | 'MB' | 'BB';
  proposed_narrative: string;
  teacher_final_narrative: string;
  observed_strengths: string[];
  growth_recommendations: string;
  supporting_evidence_ids: string[];
  supporting_evidence_count: number;
}

export interface LppaPhysicalGrowth {
  height_cm: number;
  weight_kg: number;
  head_circumference_cm?: number;
  physical_notes?: string;
  vision_hearing_notes?: string;
}

export interface LppaAttendanceSummary {
  hadir_count: number;
  sakit_count: number;
  izin_count: number;
  alpa_count: number;
  total_days: number;
  attendance_percentage: number;
}

export interface LppaReportDocument {
  id: string;
  school_id: string;
  class_id: string;
  student_id: string;
  student_name: string;
  student_nis: string;
  student_nisn?: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  
  // Elemen Capaian
  elements: Record<LppaElementKey, LppaElementNarrativeDraft>;
  
  // P5 Projek Narasi Khusus
  p5_project_title?: string;
  p5_project_description?: string;
  
  // Rekam Fisik & Kehadiran
  physical_growth: LppaPhysicalGrowth;
  attendance_summary: LppaAttendanceSummary;
  
  // Refleksi Pendidik
  homeroom_teacher_reflection: string;
  
  // Metadata Penilaian & Persetujuan
  created_by_person_id: string;
  created_by_name: string;
  updated_at: string;
  submitted_for_review_at?: string;
  approved_by_person_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  published_at?: string;
  
  status: LppaReportStatus;
}
```

---

## 5. Phase A — Application Command Contracts

Empat perintah mutasi formal Stage 4.2 (`src/types/lppaReportingTypes.ts`):

```typescript
// Command 1: Menghasilkan Draf Usulan Sintesis LPPA (Auto-Synthesis from Evidence)
export interface SynthesizeLppaDraftCommand {
  school_id: string;
  class_id: string;
  student_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  requested_by_person_id: string;
  requested_by_name: string;
  role: string;
}

// Command 2: Guru Menyimpan Draf Rapor & Revisi Narasi Guru
export interface SaveLppaReportDraftCommand {
  report_id?: string;
  school_id: string;
  class_id: string;
  student_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  elements: Record<LppaElementKey, {
    teacher_final_narrative: string;
    rating_summary: 'BSB' | 'BSH' | 'MB' | 'BB';
    growth_recommendations: string;
    supporting_evidence_ids: string[];
  }>;
  p5_project_title?: string;
  p5_project_description?: string;
  physical_growth: LppaPhysicalGrowth;
  homeroom_teacher_reflection: string;
  saved_by_person_id: string;
  saved_by_name: string;
  role: string;
}

// Command 3: Guru Mengunci & Mengajukan Rapor ke Kepala Sekolah
export interface SubmitLppaForReviewCommand {
  report_id: string;
  school_id: string;
  submitted_by_person_id: string;
  submitted_by_name: string;
  role: string;
}

// Command 4: Kepala Sekolah Mengesahkan Rapor (Approval Gate)
export interface ApproveLppaReportCommand {
  report_id: string;
  school_id: string;
  approved_by_person_id: string;
  approved_by_name: string;
  role: string; // WAJIB 'HEADMASTER' atau 'YAPENDIK_SUPERADMIN'
}

// Command 5: Publikasikan Rapor ke Portal Wali Murid
export interface PublishLppaReportCommand {
  report_id: string;
  school_id: string;
  published_by_person_id: string;
  published_by_name: string;
  role: string;
}
```

---

## 6. Stage 3 Governance & Immutability Integration

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        STAGE 3 GOVERNANCE COMPLIANCE RULES                             │
├────────────────────────────────┬───────────────────────────────────────────────────────┤
│ 1. Option A Semester Lock      │ Eksekusi `rpc_close_academic_semester` MEMVALIDASI    │
│                                │ bahwa 100% siswa aktif telah memiliki rapor bertatus  │
│                                │ `APPROVED` atau `PUBLISHED`.                          │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 2. Closed Semester Guard       │ Semua Command mutasi LPPA (Save/Submit/Approve) WAJIB │
│                                │ melempar `CANNOT_MUTATE_CLOSED_SEMESTER` jika semester│
│                                │ aktif berstatus `is_closed = true`.                   │
├────────────────────────────────┼───────────────────────────────────────────────────────┤
│ 3. Headmaster Authorization    │ `ApproveLppaReportCommand` diverifikasi oleh Security │
│                                │ Evaluator: role WAJIB `HEADMASTER` di unit sekolah ybs│
└────────────────────────────────┴───────────────────────────────────────────────────────┘
```

---

## 7. Fase Eksekusi Selanjutnya

1. **Fase A (Saat Ini)**: Menerbitkan tipe DTO `lppaReportingTypes.ts` dan mock data pendukung di database engine.
2. **Fase B**: Mengimplementasikan `lppaReportingService.ts` yang memuat algoritma *Grounded Narrative Synthesis* dan integrasi audit log Stage 3.
3. **Fase C**: Mengimplementasikan Studio Sintesis LPPA di UI Teacher Home (`src/components/workspaces/teacher/LppaSynthesisStudio.tsx`) mengadopsi Design Foundation v1.0.
4. **Fase D**: Mengimplementasikan Headmaster Approval Hub & Preview Cetak PDF.
5. **Fase E**: Menulis test suite komprehensif `tests/stage4_2_lppa_reporting.test.ts`.
