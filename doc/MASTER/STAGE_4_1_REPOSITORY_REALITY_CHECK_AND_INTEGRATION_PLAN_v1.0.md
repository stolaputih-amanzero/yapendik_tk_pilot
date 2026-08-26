# Yapendik School OS — Stage 4.1 Repository Reality Check & Integration Plan v1.0
**Document ID:** `DOC-STAGE-4-1-REALITY-CHECK-v1.0`  
**Status:** `ACTIVE AUDIT & INTEGRATION SPECIFICATION`  
**Date:** `2026-08-26`  
**Target Milestone:** `Domain 4.1 Reality Check: Architecture Contract vs Actual Codebase`  
**Parent Contract:** `DOC-STAGE-4-1-IMPLEMENTATION-CONTRACT-v1.0`  
**Governance Anchor:** `Stage 3 Frozen Baseline (DOC-STAGE-3-CLOSURE-CERT-v1.0)`

---

## 1. Executive Summary & Reality Check Verdict

Audit mendalam terhadap basis kode repositori (`src/`, `db_migrations/`, `supabase_schema.sql`, `tests/`, `package.json`) telah dilaksanakan untuk mencocokkan asumsi arsitektur Stage 4.1 dengan implementasi riil di repositori:

```text
╔════════════════════════════════════════════════════════════════════════════════════╗
║             STAGE 4.1 REPOSITORY REALITY CHECK & COMPATIBILITY VERDICT             ║
║                                                                                    ║
│  1. Database Schema & Tables (daily_attendance, observation_records) 🟢 MATCH     │
│  2. SQL Constraints (uq_daily_attendance_record, closed period guard)🟢 MATCH     │
│  3. Governed SQL Views (v_teacher_class_roster, v_student_safety)    🟢 MATCH     │
│  4. Stage 3 Mutating RPCs vs Stage 4.1 Application Commands          🟡 RESOLVED  │
│  5. In-Memory & Cloud Database Engine (database.ts & mappers)        🟢 MATCH     │
│  6. Authentication Context & Persona Resolution (context.tsx)        🟢 MATCH     │
│  7. Offline Infrastructure (Browser IndexedDB / LocalStorage Buffer) 🟡 RESOLVED  │
│  8. Test Suite Pipeline (tsx tests/run_all_tests.ts - 63/63 PASS)    🟢 MATCH     │
│                                                                                    │
│  ────────────────────────────────────────────────────────────────────────────────  │
│                                                                                    │
│  INTEGRATION STRATEGY                                🟢 ADAPT & CONSOLIDATE       │
│                                                                                    │
╚════════════════════════════════════════════════════════════════════════════════════╝
```

---

## 2. Temuan Audit Riil vs Asumsi Dokumen (Reality Mapping Matrix)

| Vektor Audit | Asumsi Dokumen Kontrak | Realitas Kode di Repositori | Solusi Integrasi Terverifikasi |
|:---|:---|:---|:---|
| **1. Nama Tabel Presensi** | Mengasumsikan `daily_attendance_records` atau `daily_attendance`. | Di `supabase_schema.sql` baris 235 & `rls_migration_v2_1_5_hardened.sql` baris 995: Nama tabel adalah **`daily_attendance`** dengan constraint **`uq_daily_attendance_record`**. | Mengikat `teacherDailyWorkService` dan mappers secara konsisten ke nama tabel kanonikal `daily_attendance`. |
| **2. Nama SQL Views** | Mengasumsikan `v_teacher_student_roster`. | Di `rls_migration_v2_1_5_hardened.sql` baris 1026: Nama view resmi adalah **`v_teacher_class_roster`** dan **`v_student_safety_profile`** (keduanya `security_invoker = true`). | Mengonsumsi `v_teacher_class_roster` dan `v_student_safety_profile` pada `teacherHomeQueryService`. |
| **3. Application Commands vs RPC Backend** | Menghindari asumsi bahwa 4 Application Commands sudah berupa RPC di SQL. | Stage 3 memiliki 4 Mutating RPCs untuk siklus akademik, sementara mutasi harian (presensi & observasi) diatur oleh **RLS + Database Triggers (`trg_closed_period_guard`) + Deterministic Constraints (`uq_daily_attendance_record`)**. | `teacherDailyWorkService` bertindak sebagai *Command Handler & Governed Mutation Adapter* yang memanggil Supabase client ber-RLS dengan validasi *closed period guard* & *idempotent upsert*. |
| **4. Konsolidasi UI Workspace** | Teacher Home menggabungkan 5 workspace guru yang terpecah. | Di `src/components/workspaces/` saat ini terdapat: `TeacherDailyWorkWorkspace`, `AttendanceWorkspace`, `ObservationWorkspace`, `DevelopmentWorkspace`, `CommunicationWorkspace`. | **Mengonsolidasikan kelima fitur tersebut ke dalam `TeacherHomeShell.tsx`** dengan 3 Tab Kanonikal (`Hari Ini`, `Belajar & Karya`, `Siswa & Rapor`), tanpa merusak workspace legacy selama masa transisi. |
| **5. Infrastruktur Offline** | Membutuhkan antrian offline deterministik. | `package.json` tidak menyertakan Dexie.js (hanya browser standard APIs). `src/db/database.ts` memiliki `localStorage` persistence layer dengan pub-sub. | Membangun `offlineSyncQueueService.ts` menggunakan API standar browser **IndexedDB / Web Storage API** dengan pembangkitan `crypto.randomUUID()` tanpa menambah *external heavy dependencies*. |
| **6. Model Data Domain** | Menggunakan tipe data terketik kanonikal. | `src/domain/types.ts` sudah memiliki tipe lengkap: `DailyAttendanceEntry`, `ObservationRecord`, `LearningActivity`, `GuardianNotice`, `StudentProgressReport`. | Menyelaraskan `teacherDailyTypes.ts` sebagai perpanjangan bersih dari `src/domain/types.ts` untuk DTO command & aggregate read model. |

---

## 3. Rantai Eksekusi & Data Flow Terpadu

```text
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      STAGE 4.1 VERIFIED ARCHITECTURAL DATA FLOW                   │
├───────────────────────────────────────────────────────────────────────────────────┤
│                                                                                   │
│  [Unified TeacherHome UI (TeacherHomeShell.tsx)]                                  │
│         │                                                                         │
│         ├── (1) Reads Read Model ──► [teacherHomeQueryService.ts]                 │
│         │                            • Reads v_teacher_class_roster               │
│         │                            • Reads v_student_safety_profile             │
│         │                            • Merges today's attendance & pulse          │
│         │                                                                         │
│         └── (2) Emits Command ────► [teacherDailyWorkService.ts]                  │
│                                            │                                      │
│                             ┌──────────────┴──────────────┐                       │
│                             ▼ (Online)                    ▼ (Offline)             │
│                    [Supabase Client / RLS]      [offlineSyncQueueService.ts]      │
│                    • daily_attendance upsert    • IndexedDB Queue                 │
│                    • observation_records insert • Client UUID v4                  │
│                    • guardian_notices ack       • Reconnect auto-replay           │
│                             │                             │                       │
│                             └──────────────┬──────────────┘                       │
│                                            ▼                                      │
│                    [PostgreSQL Governance Invariants (Stage 3)]                   │
│                    • uq_daily_attendance_record (Idempotent merge)                │
│                    • trg_closed_period_guard (Blocks mutasi CLOSED semester)      │
│                    • C-11 RLS Isolation (Staff confidential vs Parent share)      │
│                    • rpc_log_client_event (Immutable Audit Trail)                 │
│                                                                                   │
└───────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Implementation Plan Terperinci (Fase A $\rightarrow$ D)

### Fase A: Service & Command Layer
1. **`src/types/teacherDailyTypes.ts`**:
   - DTO: `RecordDailyAttendanceBatchCommand`, `CaptureQuickObservationCommand`, `EnrichObservationNarrativeCommand`, `AcknowledgeGuardianNoticeCommand`.
   - Read Model: `TeacherHomeAggregatePayload`, `ChildContextDeepPayload`, `EnrichmentQueueItem`.
   - Guard Types: Enums untuk mood kedatangan, tag Kurikulum Merdeka PAUD, status bukti (`QUICK_DRAFT`, `MATURE_EVIDENCE`).
2. **`src/services/offlineSyncQueueService.ts`**:
   - Manajemen antrian lokal IndexedDB (`yapendik_offline_queue`).
   - Pembangkitan UUID v4 sisi klien (`crypto.randomUUID()`).
   - Event listener `window.addEventListener('online')` untuk *auto-replay*.
3. **`src/services/teacherHomeQueryService.ts`**:
   - Agregasi data rombel aktif, denyut kehadiran kelas (*Pulse*), rekap eksepsi kesehatan anak (*Allergies/Fever*), feed momen hari ini, dan daftar pengayaan (*Enrichment Queue*).
   - Mode ganda: Supabase Cloud query dengan fallback mulus ke `db` in-memory.
4. **`src/services/teacherDailyWorkService.ts`**:
   - Command Handlers dengan validasi:
     - `Invariant Closed Period`: Menolak mutasi pada semester `CLOSED`.
     - `Invariant C-11`: Memaksa *mutual exclusivity* antara `is_staff_confidential` dan `is_shared_with_guardian`.
     - Integrasi pencatatan audit log via `rpc_log_client_event`.

### Fase B: Presentational Leaf Components
5. **`src/components/workspaces/teacher/ClassroomPulseBanner.tsx`**:
   - Rasio kehadiran seketika, badge eksepsi alergi/obat, peringatan anak belum check-in.
6. **`src/components/workspaces/teacher/OperatingStateIndicator.tsx`**:
   - Indikator ritme harian adaptif (`PREPARE` s.d. `SYNTHESIZE`).
7. **`src/components/workspaces/teacher/ChildCard.tsx` & `AttendanceGrid.tsx`**:
   - Grid presensi sentuh cepat 1-ketuk, menu cepat input suhu & mood.
8. **`src/components/workspaces/teacher/QuickCaptureFloatingButton.tsx`**:
   - Tombol primitif mengambang `[⚡ Momen Cepat]`.
9. **`src/components/workspaces/teacher/EvidenceCaptureSheet.tsx`**:
   - Modal tangkap foto/audio/catatan cepat ($< 15$ dtk) dengan *Progressive Capture*.
10. **`src/components/workspaces/teacher/ObservationFeed.tsx`**:
    - Feed linimasa bukti belajar kelas dengan lencana inisial guru pencatat.
11. **`src/components/workspaces/teacher/ChildContextPivotModal.tsx`**:
    - Modal *One Child Context Pivot* (Rekam jejak, portofolio, dan rapor satu anak).
12. **`src/components/workspaces/teacher/EnrichmentTrayDrawer.tsx`**:
    - Laci pengayaan refleksi narasi & kurasi bukti LPPA Fase 8.
13. **`src/components/workspaces/teacher/GuardianNoticeLedger.tsx`**:
    - Komunikasi dua arah Buku Penghubung terlindungi C-11.
14. **`src/components/workspaces/teacher/OfflineSyncStateIndicator.tsx`**:
    - Indikator pil koneksi & jumlah antrian offline tertunda.

### Fase C: Shell Orchestrator & Integrasi Navigasi
15. **`src/components/workspaces/teacher/TodaySurface.tsx`**: Tab 1 (Presensi, Mood, Pesan Ortu).
16. **`src/components/workspaces/teacher/LearningSurface.tsx`**: Tab 2 (RPPH & Feed Bukti Karya).
17. **`src/components/workspaces/teacher/StudentRosterSurface.tsx`**: Tab 3 (Roster Rombel & LPPA).
18. **`src/components/workspaces/teacher/TeacherHomeShell.tsx`**: Shell orkestrator terpadu.
19. **Pendaftaran di `src/components/layout/TopBar.tsx` & `src/App.tsx`**:
    - Menambahkan tab utama `TEACHER_HOME` ("🏠 Ruang Guru") pada navigasi guru.

### Fase D: Pengujian Otomatis & Verifikasi Build
20. **`tests/stage4_1_teacher_daily.test.ts`**:
    - Menjalankan 20+ checks otomatis untuk validasi read model, batch command, C-11 mutual exclusivity, offline UUID, dan proteksi semester closed.
21. **Master Test & Build Verification**:
    - `pnpm test`: Memastikan seluruh test suite (Runtime 20/20, SQL 8/8, Stage 3.4 35/35, Stage 4.1 20/20) PASS 100%.
    - `pnpm build`: Memastikan bundel produksi terkompilasi bersih tanpa error.

---

**Certified by:**  
*Yapendik School OS Integration Governance Board*  
`2026-08-26 • Jakarta, Indonesia`
