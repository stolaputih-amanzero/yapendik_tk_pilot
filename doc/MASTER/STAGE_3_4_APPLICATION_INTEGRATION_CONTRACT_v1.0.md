# YAPENDIK SCHOOL OS — STAGE 3.4: APPLICATION INTEGRATION CONTRACT
## Version 1.0 — Frontend Action Protocol, Service Boundaries & Interaction Specification

---

**Organization:** Yayasan Pendidikan GPIB (Yapendik)  
**System:** Yapendik Operating System (Yapendik OS)  
**Document Type:** Application Layer Integration Contract  
**Status:** **ACTIVE CONTRACT — LOCKED BASELINE FOR UI/FRONTEND INTEGRATION**  
**Governing Authority:** Derived from YAPENDIK OPERATING SYSTEM CONSTITUTION v0.2, EIA v0.1, Stage 3 Canonical Information Model v1.0, Stage 3.1 Certified DDL Baseline, Stage 3.2 Certified RPC Baseline, and Stage 3.3 Certified Acceptance Ledger.  
**Prerequisites:** 
- Stage 3.1 Temporal Lineage & Trigger Immature Protection (🟢 CERTIFIED)
- Stage 3.2 Governed Lifecycle RPCs & Derived Functions (🟢 CERTIFIED)
- Stage 3.3 Operational Acceptance Protocol & Evidence (🟢 CERTIFIED)

**Core Architectural Tenet:**  
> *"Application Projection & Interaction Layer over a Certified Governance Core. The UI does not possess business authority; it renders verified database truth and transmits structured intent to certified governance RPCs."*

---

## 1. Architectural Philosophy & Governance Boundaries

Stage 3.4 melengkapi arsitektur tiga lapis (*Three-Tier Governance Architecture*) Yapendik OS:

```text
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                                 TIER 1: INTERACTION                                   │
│            UI Components, Workspaces, Wizards, Timelines, Action Triggers             │
│            (Sends user intent, renders optimistic feedback, enforces UX validation)   │
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ Invokes typed action methods
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                             TIER 2: APPLICATION SERVICES                              │
│   AcademicLifecycleService • CohortLineageService • HealthService • TrajectoryService │
│   (Formats RPC payload, translates DB exceptions, manages reactive query invalidation)│
└──────────────────────────────────────────┬────────────────────────────────────────────┘
                                           │ Direct Supabase RPC invocation
                                           ▼
┌───────────────────────────────────────────────────────────────────────────────────────┐
│                              TIER 3: GOVERNANCE ENGINE                                │
│       PostgreSQL RLS • Triggers • SECURITY DEFINER RPCs • Immutable Audit Trail       │
│       (Sole source of authoritative validation, ACID state mutation, and lineage)     │
└───────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.1 Non-Negotiable Contract Invariants
1. **Zero Shadow Domain Logic in Frontend:**  
   Frontend **tidak boleh** melakukan evaluasi independen untuk menentukan apakah semester boleh ditutup atau apakah penempatan siswa boleh dimutasi. Validasi di frontend bersifat informatif untuk memandu pengguna (*UX Guidance*), sedangkan keputusan hakiki selalu dibuat di PostgreSQL RPC.
2. **Direct DML Prohibited:**  
   Komponen UI dilarang melakukan operasi `supabase.from('student_placement_records').insert()` atau `.update()` secara langsung. Seluruh mutasi siklus siswa wajib melalui RPC `rpc_promote_classroom_cohort` atau `rpc_graduate_student_cohort`.
3. **Reactive Query Invalidation Over Manual Cache Mutation:**  
   Setelah eksekusi RPC sukses, frontend memicu *query cache invalidation* (via React Query/SWR pattern atau invalidate handler) untuk menarik *canonical truth* terbaru dari database, bukan memanipulasi state lokal secara manual yang berisiko tidak sinkron (*divergent state*).
4. **No Mutable Dashboard Status Tables:**  
   Dashboard kesehatan sekolah mengambil data langsung dari `fn_derive_school_health_telemetry()` secara on-the-fly. Tidak ada tabel status `school_health_status` yang disimpan di database.

---

## 2. Intent-to-RPC Action Mapping Matrix

Setiap aksi pengguna dipetakan secara ketat ke metode Application Service, target RPC, skema parameter, batas otorisasi, status sukses, dan penanganan kesalahan:

```text
┌────────────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                 INTENT-TO-RPC ACTION MAPPING LEDGER                                    │
└────────────────────────────────────────────────────────────────────────────────────────────────────────┘
```

| User Intent | Application Service Method | Target RPC Function | Required Parameters | Authorized Context | Success State & Cache Invalidation | Error Code & Localized UX Feedback |
|---|---|---|---|---|---|---|
| **Tutup Semester Aktif** | `academicLifecycleService.closeSemester(schoolId, academicYearId)` | `rpc_close_academic_semester` | `p_school_id: string`, `p_academic_year_id: string` | Superadmin Yayasan / Kepala Sekolah Unit Sah | `status = 'CLOSED'`, invalidate `academic_years`, `school_telemetry` | `PRECONDITION_FAILED`: "Gagal menutup semester: Masih ada siswa tanpa rapor LPPA atau rapor berstatus DRAFT."<br>`UNAUTHORIZED`: "Akses ditolak: Anda tidak berwenang menutup semester unit ini." |
| **Buka Semester Baru (Rollover)** | `academicLifecycleService.initializeNextSemester(schoolId, data)` | `rpc_initialize_next_semester` | `p_school_id: string`, `p_name: string`, `p_semester: 'GANJIL'\|'GENAP'`, `p_start_date: string`, `p_end_date: string` | Superadmin Yayasan / Kepala Sekolah Unit Sah | `status = 'ACTIVE'`, invalidate `academic_years`, `classes`, `school_telemetry` | `ACTIVE_PERIOD_EXISTS`: "Tidak dapat membuka semester baru: Semester sebelumnya belum ditutup."<br>`INVALID_DATE_RANGE`: "Rentang tanggal tidak valid." |
| **Promosikan Rombel (Kenaikan Kelas)** | `cohortLineageService.promoteCohort(schoolId, payload)` | `rpc_promote_classroom_cohort` | `p_school_id: string`, `p_source_class_id: string`, `p_target_class_id: string`, `p_target_academic_year_id: string`, `p_student_ids: string[]` | Kepala Sekolah Unit Sah / Superadmin | Invalidate `student_placement_records`, `classes`, `students`, `school_telemetry` | `CAPACITY_EXCEEDED`: "Kapasitas kelas tujuan tidak mencukupi."<br>`STUDENT_NOT_ACTIVE_IN_SOURCE`: "Siswa tidak terdaftar aktif di kelas asal."<br>`SOURCE_SEMESTER_NOT_CLOSED`: "Semester asal harus ditutup terlebih dahulu." |
| **Luluskan Rombel (Kelulusan TK B)** | `cohortLineageService.graduateCohort(schoolId, payload)` | `rpc_graduate_student_cohort` | `p_school_id: string`, `p_class_id: string`, `p_student_ids: string[]` | Kepala Sekolah Unit Sah / Superadmin | `student.status = 'GRADUATED'`, Invalidate `students`, `student_placement_records`, `school_telemetry` | `STUDENT_NOT_ACTIVE_IN_CLASS`: "Siswa tidak memiliki penempatan aktif di kelas ini."<br>`UNAUTHORIZED`: "Akses ditolak." |
| **Pantau Kesehatan Sekolah** | `institutionalHealthService.getSchoolTelemetry(schoolId)` | `fn_derive_school_health_telemetry` | `p_school_id: string` | Superadmin Yayasan / Staf Sekolah Terdaftar | Mengembalikan 4 indikator kanonikal & daftar eksepsi diagnostik | `CRITICAL_BLOCKER`: "Belum ada semester aktif." |
| **Buka Kurva Rekam Jejak Anak** | `studentTrajectoryService.getStudentTrajectory(studentId)` | `fn_get_student_longitudinal_trajectory` | `p_student_id: string` | Orang Tua Sah / Guru Unit / Kepala Sekolah / Superadmin | Mengembalikan array linimasa `placement_lineage` & histori `lppa_history` | `UNAUTHORIZED`: "Akses ditolak: Anda tidak memiliki wewenang melihat rekam jejak siswa ini." |

---

## 3. Application Service Layer Contracts (TypeScript Interfaces)

Layer servis bertindak sebagai *typed adapter* antara UI TypeScript dan Supabase PostgreSQL Client.

### 3.1 `AcademicLifecycleService`
```typescript
export interface CloseSemesterResult {
  success: boolean;
  academic_year_id: string;
  status: 'CLOSED';
  enrolled_reconciled_count: number;
}

export interface InitializeSemesterPayload {
  schoolId: string;
  name: string;
  semester: 'GANJIL' | 'GENAP';
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
}

export interface AcademicLifecycleService {
  closeSemester(schoolId: string, academicYearId: string): Promise<CloseSemesterResult>;
  initializeNextSemester(payload: InitializeSemesterPayload): Promise<{ success: boolean; academic_year_id: string; status: 'ACTIVE' }>;
}
```

### 3.2 `CohortLineageService`
```typescript
export interface PromoteCohortPayload {
  schoolId: string;
  sourceClassId: string;
  targetClassId: string;
  targetAcademicYearId: string;
  studentIds: string[];
}

export interface GraduateCohortPayload {
  schoolId: string;
  classId: string;
  studentIds: string[];
}

export interface CohortLineageService {
  promoteCohort(payload: PromoteCohortPayload): Promise<{ success: boolean; promoted_count: number; target_class_id: string }>;
  graduateCohort(payload: GraduateCohortPayload): Promise<{ success: boolean; graduated_count: number }>;
}
```

### 3.3 `InstitutionalHealthService`
```typescript
export interface SchoolHealthTelemetry {
  school_id: string;
  academic_year_id?: string;
  academic_year_name?: string;
  semester?: 'GANJIL' | 'GENAP';
  lifecycle_status?: 'PLANNED' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'ARCHIVED';
  health_status: 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL_BLOCKER';
  indicators: {
    capacity_utilization_pct: number;
    staffing_compliance: boolean;
    attendance_recorded_days: number;
    curriculum_velocity_pct: number;
  };
  metrics: {
    total_placed_students: number;
    total_capacity: number;
    unstaffed_classes: number;
    total_observations: number;
    approved_lppa_count: number;
  };
  exceptions: Array<{
    code: string;
    message?: string;
    count?: number;
    capacity?: number;
    placed?: number;
  }>;
}

export interface InstitutionalHealthService {
  getSchoolHealthTelemetry(schoolId: string): Promise<SchoolHealthTelemetry>;
}
```

### 3.4 `StudentTrajectoryService`
```typescript
export interface PlacementLineageItem {
  placement_id: string;
  academic_year_id: string;
  academic_year_name: string;
  semester: 'GANJIL' | 'GENAP';
  class_id: string;
  class_name: string;
  entry_date: string;
  exit_date: string | null;
  placement_status: 'ACTIVE' | 'PROMOTED' | 'TRANSFERRED' | 'COMPLETED';
  promotion_remarks: string | null;
}

export interface LppaHistoryItem {
  report_id: string;
  academic_year_id: string;
  semester: 'GANJIL' | 'GENAP';
  status: 'DRAFT' | 'READY_FOR_REVIEW' | 'APPROVED' | 'PUBLISHED';
  headmaster_approval_date: string | null;
  homeroom_feedback: string | null;
}

export interface StudentLongitudinalTrajectory {
  student_id: string;
  school_id: string;
  nis: string;
  current_status: 'PROSPECTIVE' | 'ENROLLED' | 'ACTIVE' | 'ON_LEAVE' | 'GRADUATED' | 'TRANSFERRED_OUT' | 'DROPPED_OUT';
  current_class_id: string | null;
  placement_lineage: PlacementLineageItem[];
  lppa_history: LppaHistoryItem[];
}

export interface StudentTrajectoryService {
  getStudentLongitudinalTrajectory(studentId: string): Promise<StudentLongitudinalTrajectory>;
}
```

---

## 4. UI State-Machine Interaction Matrix

Antarmuka pengguna merefleksikan status siklus akademik secara otomatis:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        UI STATE-DRIVEN WORKSPACE CAPABILITIES                          │
├───────────────────┬─────────────┬─────────────┬─────────────┬─────────────┬────────────┤
│ Capability Area   │ PLANNED     │ ACTIVE      │ CLOSING     │ CLOSED      │ ARCHIVED   │
├───────────────────┼─────────────┼─────────────┼─────────────┼─────────────┼────────────┤
│ Input Presensi    │ ❌ Disabled │ 🟢 Editable │ 🟢 Editable │ 🔒 Locked   │ 🔒 Locked  │
│ Input Observasi   │ ❌ Disabled │ 🟢 Editable │ 🟢 Editable │ 🔒 Locked   │ 🔒 Locked  │
│ Penyusunan LPPA   │ ❌ Disabled │ 🟢 Editable │ 🟢 Editable │ 🔒 Locked   │ 🔒 Locked  │
│ Review/Approve HM │ ❌ Disabled │ 🟢 Allowed  │ 🟢 Priority │ 🔒 Locked   │ 🔒 Locked  │
│ Tutup Semester    │ ❌ Disabled │ 🟢 Allowed  │ 🟢 Primary  │ ❌ Disabled │ ❌ Disabled│
│ Promosi Cohort    │ ❌ Disabled │ ❌ Disabled │ 🟡 Optional │ 🟢 Primary  │ 🔒 History │
│ Inisialisasi Baru │ ❌ Disabled │ ❌ Disabled │ ❌ Disabled │ 🟢 Allowed  │ 🟢 Allowed │
└───────────────────┴─────────────┴─────────────┴─────────────┴─────────────┴────────────┘
```

---

## 5. Error Code & User Diagnostics Translation Protocol

Setiap error dari PostgreSQL dipetakan ke pesan antarmuka yang ramah pengguna dengan panduan tindakan korektif (*Actionable Feedback*):

```typescript
export function translateGovernanceError(error: any): { title: string; message: string; actionSuggestion?: string } {
  const errMsg = error?.message || '';

  if (errMsg.includes('PRECONDITION_FAILED')) {
    return {
      title: 'Prasyarat Penutupan Belum Terpenuhi',
      message: 'Seluruh siswa aktif harus memiliki laporan LPPA yang telah disetujui (APPROVED/PUBLISHED) oleh Kepala Sekolah.',
      actionSuggestion: 'Buka Menu Rapor LPPA dan pastikan semua rapor kelas telah disetujui.'
    };
  }

  if (errMsg.includes('CAPACITY_EXCEEDED')) {
    return {
      title: 'Kapasitas Kelas Melebihi Batas',
      message: 'Jumlah siswa yang dipromosikan melebihi daya tampung ruang kelas tujuan yang tersisa.',
      actionSuggestion: 'Kurangi jumlah siswa yang dipilih atau sesuaikan kapasitas kelas tujuan.'
    };
  }

  if (errMsg.includes('ACTIVE_PERIOD_EXISTS')) {
    return {
      title: 'Semester Aktif Masih Berjalan',
      message: 'Tidak dapat membuka semester baru karena masih terdapat semester aktif pada unit sekolah ini.',
      actionSuggestion: 'Tutup semester aktif terlebih dahulu sebelum membuka semester baru.'
    };
  }

  if (errMsg.includes('UNAUTHORIZED')) {
    return {
      title: 'Otorisasi Ditolak',
      message: 'Anda tidak memiliki hak wewenang tata kelola untuk mengeksekusi tindakan pada unit sekolah ini.',
      actionSuggestion: 'Hubungi administrator atau pastikan peran akun Anda sesuai.'
    };
  }

  if (errMsg.includes('CANNOT_MUTATE_CLOSED_SEMESTER')) {
    return {
      title: 'Data Terkunci Permanen',
      message: 'Semester ini telah resmi ditutup. Seluruh data presensi, observasi, dan rapor berstatus read-only (arsip).',
      actionSuggestion: 'Gunakan semester aktif untuk pencatatan operasional harian.'
    };
  }

  return {
    title: 'Operasi Gagal',
    message: errMsg || 'Terjadi kesalahan sistem internal. Silakan coba beberapa saat lagi.'
  };
}
```

---

## 6. Target UX Workspaces in Stage 3.4

Pengembangan Stage 3.4 akan mewujudkan 5 antarmuka utama yang berinteraksi langsung dengan RPC dan telemetry:

1. 🏛️ **Academic Lifecycle & Semester Rollover Workspace (`AcademicLifecycleWorkspace`):**  
   - Menampilkan status term aktif, rekapitulasi ketuntasan LPPA, tombol rekonsiliasi, wizard penutupan semester, dan inisialisasi semester baru.
2. 👥 **Cohort Promotion & Classroom Assignment Workspace (`CohortPromotionWorkspace`):**  
   - Visualisasi rombel asal (TK A) $\rightarrow$ rombel tujuan (TK B), indikator kapasitas tersisa dinamis, *multi-select student picker*, dan tombol promosi atomik.
3. 🎓 **Year-End Graduation Registry Workspace (`GraduationRegistryWorkspace`):**  
   - Daftar calon lulusan TK B, verifikasi portofolio anak, dan eksekusi kelulusan resmi.
4. 📊 **Foundation Institutional Health Monitor (`InstitutionalHealthDashboard`):**  
   - Panel monitoring kesehatan multi-unit yayasan dengan 4 indikator kanonikal dan daftar eksepsi operasional dinamis (*Zero Stale Table*).
5. 🌟 **Longitudinal Child Developmental Journey View (`StudentJourneyTimeline`):**  
   - Linimasa kronologis perkembangan anak dari awal masuk, kenaikan rombel, riwayat rapor LPPA, hingga kelulusan, dengan pembatasan privasi keluarga terverifikasi.

---

*Status: **APPLICATION INTEGRATION CONTRACT LOCKED — CLEARED FOR STAGE 3.4 FRONTEND & SERVICE IMPLEMENTATION**.*
