# Yapendik School OS — Stage 4.1 Implementation Contract v1.0
**Document ID:** `DOC-STAGE-4-1-IMPLEMENTATION-CONTRACT-v1.0`  
**Status:** `ACTIVE IMPLEMENTATION CONTRACT — EXECUTION BASELINE`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Teacher Daily Operating Loop Implementation & Wiring`  
**Parent Specifications:**  
- `DOC-STAGE-4-1-TEACHER-DAILY-OPERATING-MODEL-v1.0` (Operating Model)  
- `DOC-STAGE-4-1-INTERACTION-SPEC-v1.0` (Interaction Spec)  
- `DOC-STAGE-4-1-EXPERIENCE-ARCH-v1.0` (Experience Architecture)  
- `DOC-STAGE-4-1-COMPONENT-CONTRACT-v1.0` (Component Contract)  
- `DOC-STAGE-4-1-CONSISTENCY-REVIEW-v1.0` (Consistency Review)  
**Governance Anchor:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Architectural Principles & Boundaries

Kontrak implementasi ini menegakkan 3 hukum arsitektural utama:
1. **No Component Owns Governance:** Validasi integritas bisnis, batasan hak akses, dan proteksi periode `CLOSED` tetap berada di level PostgreSQL (Stage 3).
2. **No Component Owns Persistence:** Komponen UI tidak boleh memanggil `supabase.from('...').insert()` atau memanipulasi IndexedDB secara langsung.
3. **No Component Bypasses Application Commands:** Seluruh mutasi wajib melewati *Application Command Handlers* yang terketik aman (*type-safe*).

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      STAGE 4.1 IMPLEMENTATION DATA FLOW PIPELINE                  │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  [UI COMPONENT LEAVES (CC-01..13)]                                                │
│         │                                                                         │
│         ├── Reads ───────► [TEACHER HOME READ MODEL / QUERY SERVICE]              │
│         │                  (Consumes v_teacher_student_roster & Server Projections│
│         │                                                                         │
│         └── Emits ──────► [APPLICATION COMMAND DISPATCHER]                        │
│                                  │                                                │
│                   ┌──────────────┴──────────────┐                                 │
│                   ▼                             ▼                                 │
│           [ONLINE DISPATCH]             [OFFLINE QUEUE]                           │
│           (Direct Server Call)          (IndexedDB Buffer + UUID)                 │
│                   │                             │                                 │
│                   ▼                             ▼ (On Reconnect Sync)             │
│           [GOVERNED MUTATION ADAPTER / STAGE 3 GOVERNANCE SUBSTRATE]              │
│           (uq_daily_attendance, trg_closed_period_guard, C-11 RLS, Audit Logs)    │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Repository & File Boundary Mapping

Seluruh kode Domain 4.1 diisolasi pada jalur repositori kanonikal berikut:

```text
src/
├── types/
│   └── teacherDailyTypes.ts             # Domain Interfaces, Command DTOs, State Types
│
├── services/
│   ├── teacherHomeQueryService.ts       # Unified Read Model (Aggregate Query Engine)
│   ├── teacherDailyWorkService.ts       # Application Command Handlers & Mutators
│   └── offlineSyncQueueService.ts       # Offline Buffer, UUID Gen, Retry & Sync Engine
│
└── components/workspaces/teacher/
    ├── TeacherHomeShell.tsx             # Root Orchestrator (Context & Tab Coordinator)
    ├── ClassroomPulseBanner.tsx         # Tier 1 Pulse & Active Exception Banner
    ├── OperatingStateIndicator.tsx      # Adaptive Operating State Indicator
    ├── TodaySurface.tsx                 # Tab 1: Attendance Grid & Health Checks
    ├── LearningSurface.tsx              # Tab 2: Daily Intentional Plan & Moment Feed
    ├── StudentRosterSurface.tsx         # Tab 3: Class Roster & LPPA Summary Glance
    ├── ChildCard.tsx                    # Tactile Attendance & Status Tile
    ├── QuickCaptureFloatingButton.tsx   # [⚡ Momen Cepat] Floating Action Primitive
    ├── EvidenceCaptureSheet.tsx         # Modal Tangkap Foto/Audio/Anekdot (< 15 dtk)
    ├── ObservationFeed.tsx              # Feed Kronologis Bukti Belajar Rombel
    ├── ChildContextPivotModal.tsx       # One Child Context Deep-Dive Modal
    ├── EnrichmentTrayDrawer.tsx         # Fase 8 Laci Pengayaan Narasi & Kurasi LPPA
    ├── GuardianNoticeLedger.tsx         # Buku Penghubung Dua Arah (C-11 Protected)
    ├── DailyCompletionSummary.tsx       # End-of-Day Reconciliation Indicator
    └── OfflineSyncStateIndicator.tsx    # Connection Status & Pending Queue Pill
```

---

## 3. Component $\rightarrow$ Command / Query Matrix

| ID | Komponen | Query yang Dikonsumsi | Command yang Dipanggil |
|:---|:---|:---|:---|
| **CC-01** | `TeacherHomeShell` | `getTeacherHomeAggregateQuery()` | — |
| **CC-02** | `ClassroomPulseBanner` | `getClassroomPulseQuery()` | — |
| **CC-03** | `OperatingStateIndicator` | `activeOperatingState` (Local State) | `setOperatingState(state)` |
| **CC-04** | `AttendanceGrid` & `ChildCard` | `getTodayAttendanceQuery()` | `recordDailyAttendanceBatchCommand` |
| **CC-05** | `GuardianNoticeLedger` | `getGuardianNoticesQuery()` | `acknowledgeGuardianNoticeCommand` |
| **CC-06** | `QuickCaptureFloatingButton` | — | `openEvidenceCaptureSheet()` |
| **CC-07** | `EvidenceCaptureSheet` | `getQuickTagsQuery()` | `captureQuickObservationCommand` |
| **CC-08** | `ObservationFeed` | `getTodayObservationsQuery()` | — |
| **CC-09** | `ChildContextPivotModal` | `getChildContextDeepQuery(studentId)` | `captureQuickObservationCommand` |
| **CC-10** | `EnrichmentTrayDrawer` | `getEnrichmentQueueQuery()` | `enrichObservationNarrativeCommand` |
| **CC-11** | `GovernedShareControl` | — | `setObservationShareState()` |
| **CC-12** | `DailyCompletionSummary` | `getDailyCompletionStatusQuery()` | — |
| **CC-13** | `OfflineSyncStateIndicator` | `getOfflineQueueStatusQuery()` | `triggerImmediateSyncCommand()` |

---

## 4. Query Contracts (Unified Read Model)

Untuk mencegah masalah *N+1 query* dan menjaga *Zero Leak*, seluruh data *Teacher Home* disediakan melalui adapter terpadu:

```typescript
export interface TeacherHomeAggregatePayload {
  context: {
    school_id: string;
    school_name: string;
    class_id: string;
    class_name: string;
    academic_year: string;
    semester: 'SEMESTER_1' | 'SEMESTER_2';
    is_semester_closed: boolean;
    date: string; // YYYY-MM-DD
    teacher: {
      person_id: string;
      name: string;
      role: 'HOMEROOM' | 'CO_TEACHER';
    };
  };
  pulse: {
    total_students: number;
    present_count: number;
    sick_count: number;
    permit_count: number;
    absent_count: number;
    unaccounted_count: number;
    health_alerts: Array<{
      student_id: string;
      student_name: string;
      alert_type: 'ALLERGY' | 'FEVER' | 'MEDICATION';
      note: string;
    }>;
    unread_guardian_notes: number;
  };
  roster: Array<{
    student_id: string;
    nis: string;
    name: string;
    photo_url?: string;
    gender: 'MALE' | 'FEMALE';
    today_status?: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    today_temperature?: number;
    today_mood?: 'HAPPY' | 'CALM' | 'ANXIOUS' | 'TIRED';
    today_arrival_note?: string;
    evidence_count_semester: number;
    lppa_ready_percentage: number;
  }>;
  recent_observations: Array<{
    id: string;
    recorded_at: string;
    recorded_by_name: string;
    recorded_by_initials: string;
    student_ids: string[];
    student_names: string[];
    media_url?: string;
    media_type?: 'IMAGE' | 'AUDIO';
    narrative?: string;
    quick_tags: string[];
    status: 'QUICK_DRAFT' | 'MATURE_EVIDENCE';
    is_lppa_evidence: boolean;
    is_shared_with_guardian: boolean;
    is_staff_confidential: boolean;
  }>;
  guardian_notices: Array<{
    id: string;
    student_id: string;
    student_name: string;
    guardian_name: string;
    title: string;
    message: string;
    urgent: boolean;
    is_acknowledged: boolean;
    sent_at: string;
  }>;
}
```

---

## 5. Command Contracts & Invariant Validation Guards

```typescript
// 1. PRESENSI HARIAN BATCH
export interface RecordDailyAttendanceBatchCommand {
  school_id: string;
  class_id: string;
  attendance_date: string;
  entries: Array<{
    student_id: string;
    status: 'PRESENT' | 'SICK' | 'PERMIT' | 'ABSENT';
    temperature_celsius?: number;
    arrival_mood?: 'HAPPY' | 'CALM' | 'ANXIOUS' | 'TIRED';
    notes?: string;
  }>;
}

// 2. CAPTURE OBSERVASI CEPAT (< 15 DTK)
export interface CaptureQuickObservationCommand {
  id?: string; // Optional client-generated UUID v4 (Auto-generated if absent)
  school_id: string;
  class_id: string;
  target_student_ids: string[];
  media_url?: string;
  media_type?: 'IMAGE' | 'AUDIO';
  quick_tags: string[];
  initial_note?: string;
  recorded_by_person_id: string;
}

// 3. PENGAYAAN NARASI PEDAGOGIS & LPPA
export interface EnrichObservationNarrativeCommand {
  observation_id: string;
  pedagogical_narrative: string;
  curriculum_dimensions: string[];
  is_lppa_evidence: boolean;
  is_shared_with_guardian: boolean;
  is_staff_confidential: boolean;
}

// 4. KONFIRMASI BUKU PENGHUBUNG
export interface AcknowledgeGuardianNoticeCommand {
  notice_id: string;
  acknowledged_by_person_id: string;
  teacher_reply_text?: string;
}
```

### Invariant Validation Guard (Aturan Wajib pada Handler):
1. **Semester Closed Guard:** Jika `is_semester_closed === true`, tolak seluruh mutasi dengan error `CANNOT_MUTATE_CLOSED_SEMESTER`.
2. **C-11 Mutual Exclusivity Guard:** Jika `is_staff_confidential === true` dan `is_shared_with_guardian === true`, handler melempar error `VALIDATION_FAILED: Staff confidential items cannot be shared with guardians`.
3. **Deterministic PK Guard:** Untuk observasi baru, jika `id` tidak disertakan, handler membangkitkan `crypto.randomUUID()`.

---

## 6. Offline Infrastructure Contract & Sync Engine

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                       OFFLINE QUEUE & SYNC PROTOCOL                               │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  1. Penyimpanan Lokal: IndexedDB ObjectStore 'yapendik_teacher_offline_queue'      │
│  2. Format Antrian:                                                               │
│     {                                                                             │
│       queue_id: string,                                                           │
│       command_type: 'RECORD_ATTENDANCE' | 'CAPTURE_OBSERVATION' | 'ENRICH_OBS',  │
│       payload: any,                                                               │
│       created_at: ISO8601,                                                        │
│       retry_count: number,                                                        │
│       status: 'PENDING' | 'SYNCING' | 'FAILED'                                    │
│     }                                                                             │
│  3. Rekonsiliasi Otomatis (Auto-Drain):                                           │
│     • Dipicu saat window.addEventListener('online') atau manual retry.            │
│     • Eksekusi FIFO (First-In, First-Out).                                        │
│     • Idempotent insert: 'ON CONFLICT (id) DO UPDATE' / 'DO NOTHING'.             │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. State Ownership Architecture

* **Server State (TanStack Query / Supabase Cache):**  
  Data agregat kelas, daftar rekap kehadiran, feed observasi. Di-invalidasi secara presisi saat perintah mutasi berhasil.
* **UI Focus State (Zustand / Local State):**  
  Tab aktif (`TODAY` | `LEARNING` | `STUDENT`), `operatingState`, modal pivot aktif (`selectedChildForPivot`), drawer laci pengayaan terbuka/tutup.
* **Transient Form State:**  
  Draf foto yang sedang diambil pada kamera, teks narasi yang sedang diketik pada `EnrichmentTrayDrawer` (dengan auto-save 500ms ke local storage).
* **Offline Buffer State:**  
  Daftar perintah tertunda pada `offlineSyncQueueService`.

---

## 8. Verification Matrix (Automated Test Gates)

Setiap kriteria penerimaan dari Component Contract diikat ke berkas pengujian otomatis:

```text
TEST SUITE: tests/stage4_1_teacher_daily.test.ts
├── MODULE 1: Teacher Home Read Model & Aggregate Projection
│   ├── [ ] PASS: Loads active class context without redundant selectors
│   ├── [ ] PASS: Aggregates attendance pulse and health alerts correctly
│   └── [ ] PASS: Filters staff confidential notes from guardian perspective (C-11)
│
├── MODULE 2: Attendance Batch Command & Deterministic Merge
│   ├── [ ] PASS: Records 16 students in single batch command
│   ├── [ ] PASS: Enforces idempotent merge without duplicate rows
│   └── [ ] PASS: Blocks attendance mutation when semester is CLOSED
│
├── MODULE 3: Quick Capture Primitive & Client UUID
│   ├── [ ] PASS: Generates valid UUID v4 on client-side capture
│   ├── [ ] PASS: Sets initial status to QUICK_DRAFT with staff confidentiality
│   └── [ ] PASS: Fast capture completes in < 15s payload budget
│
├── MODULE 4: Progressive Enrichment & C-11 Guard
│   ├── [ ] PASS: Enriches draft into MATURE_EVIDENCE
│   ├── [ ] PASS: Blocks simultaneous confidential + guardian share flags
│   └── [ ] PASS: Curation sets is_lppa_evidence flag correctly
│
└── MODULE 5: Offline Buffer & Queue Drain Engine
    ├── [ ] PASS: Buffers commands locally when offline
    └── [ ] PASS: Drains queue deterministically upon online reconnect
```

---

## 9. Implementation Sequence (Langkah Eksekusi Bertahap)

```text
FASE A: FOUNDATION & CONTRACTS (Servis & Tipe)
└── 1. src/types/teacherDailyTypes.ts
└── 2. src/services/offlineSyncQueueService.ts
└── 3. src/services/teacherHomeQueryService.ts
└── 4. src/services/teacherDailyWorkService.ts

FASE B: PRESENTATIONAL COMPONENTS (Komponen Daun)
└── 5. ClassroomPulseBanner.tsx & OperatingStateIndicator.tsx
└── 6. ChildCard.tsx & AttendanceGrid.tsx
└── 7. QuickCaptureFloatingButton.tsx & EvidenceCaptureSheet.tsx
└── 8. ObservationFeed.tsx & GuardianNoticeLedger.tsx
└── 9. ChildContextPivotModal.tsx & EnrichmentTrayDrawer.tsx

FASE C: COMPOSITION & NAVIGATION (Teacher Home Shell)
└── 10. TodaySurface.tsx, LearningSurface.tsx, StudentRosterSurface.tsx
└── 11. TeacherHomeShell.tsx
└── 12. Pendaftaran rute di TopBar.tsx & App.tsx

FASE D: VERIFIKASI MENYELURUH (Automated & Build)
└── 13. tests/stage4_1_teacher_daily.test.ts (20+ Automated Checks)
└── 14. pnpm test & pnpm build verification
```

---

**Approved and Bound by:**  
*Yapendik School OS Implementation Governance Board*  
`2026-08-26 • Jakarta, Indonesia`
