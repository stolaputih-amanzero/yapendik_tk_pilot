# STAGE 6-A — GATE 0: CONTRACT HARDENING & SEMANTIC CLOSURE
## "The Warm Briefing & The Closure Mode" — Domain Contract, State Machine, & Governance Specifications (v1.0)
### Yapendik School OS — Early Childhood Context-Aware Operating Companion

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-STAGE-6A-GATE0-v1.0` |
| Version | `v1.0.0-SEALED` |
| Governing Tier | `LEVEL 2 — STAGE 6 STRATEGIC GROWTH DOMAIN` |
| Status | `GATE 0 SEALED — READY FOR GATE 1 TECHNICAL DESIGN` |
| Authoritative Date | `2026-08-30` |
| Source Intent | `DOC-AMANAURA-STAGE-6A-BRIEFING-INTENT-v1.1` |
| Prerequisite Baseline | V2.1.5 Frozen Core + Stage 4.5 LEARN (SEALED) + Stage 5 Hardening |
| Target Codebase | `yapendik-tk-pilot` |
| Classification | ARCHITECTURAL CONSTITUTION — GATE 0 SEALED |

---

## 0. ATURAN MUTLAK GATE 0 (CANONICAL CONSTRAINTS)

Sesuai dengan protokol tata kelola arsitektur Yapendik School OS:
1. **Zero UI Code:** DILARANG membuat atau memodifikasi komponen presentasi (`.tsx`, `.jsx`, `.css`) pada Gate 0.
2. **Zero Schema Migration:** DILARANG mengeksekusi migrasi database SQL (`.sql`) pada Gate 0.
3. **Pure Semantic & Contract Definitions:** Gate 0 HANYA memuat definisi TypeScript Interfaces, Pure Transition Functions (tanpa efek samping), RPC Signatures, dan Spesifikasi Pengujian Adversarial.
4. **Baseline Inviolability:** Penambahan domain Briefing & Closure Mode DILARANG mengubah atau merusak 15 tabel kanonikal V2.1.5 serta baseline 348 checks PASS yang telah disegel.

```text
════════════════════════════════════════════════════════════════════════════════════════════
                     STAGE 6-A BRIEFING & CLOSURE ARCHITECTURE
════════════════════════════════════════════════════════════════════════════════════════════

   [ SIKLUS SIRKADIAN SEKOLAH ]                   [ OTORITAS & KEBIJAKAN ]
   ┌──────────────────────────┐                   ┌──────────────────────────┐
   │ PRATINJAU (Pagi Buta)    │                   │ FB-08: Rhythm Autonomy   │
   │ OPERASIONAL (Jam Fase)   │ ◄───────────────► │ FB-09: Guardian Minimize │
   │ PENUTUP (Sore/Malam)     │                   │ H-07:  Non-Surveillance  │
   └─────────────┬────────────┘                   └─────────────┬────────────┘
                 │                                              │
                 ▼                                              ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                         BRIEFING ENGINE CONTRACT                        │
   │  • Pure State Machine Evaluation (Mode, Closure, Message Holding)       │
   │  • Deterministic Single CTA & Warm Echo Resolution                      │
   │  • 432Hz Sound Doctrine (Earned / Intentional via User Gesture)         │
   └─────────────────────────────────────┬───────────────────────────────────┘
                                         │
                                         ▼
   ┌─────────────────────────────────────────────────────────────────────────┐
   │                       ROLE BRIEFING DATA CONTRACTS                      │
   │   TeacherBriefing | HeadmasterBriefing | FoundationBriefing | Guardian  │
   └─────────────────────────────────────────────────────────────────────────┘
```

---

## 1. DOMAIN ENTITIES & TYPESCRIPT INTERFACES

Semua definisi tipe domain bersifat murni (*pure types*), tanpa ketergantungan pada runtime library eksternal.

```typescript
/**
 * STAGE 6-A CANONICAL DOMAIN TYPES
 * Version: 1.0.0-SEALED
 */

// ============================================================================
// 1.1 ENUMS & UNION TYPES
// ============================================================================

/** Mode sirkadian briefing yang aktif */
export type BriefingMode = 'PRATINJAU' | 'OPERASIONAL' | 'PENUTUP';

/** Status emosional penutup hari */
export type ClosureState = 'TUNTAS' | 'SISA_TENANG';

/** Tipe peran pengguna Yapendik School OS */
export type UserRole = 'TEACHER' | 'HEADMASTER' | 'FOUNDATION' | 'GUARDIAN';

/** Tipe aksi pasangan fase ritme */
export type ActionTargetType = 'NAVIGATION' | 'MODAL' | 'SHEET' | 'RITUAL';

/** Kebijakan penahanan pesan sirkadian (D-8) */
export type MessageDeliveryPolicy = 'HOLD_UNTIL_MORNING' | 'DELIVER_IMMEDIATELY';

/** Preferensi audio sirkadian lokal perangkat (D-7) */
export interface AudioPreference {
  sound_closure_enabled: boolean; // Default: true
  frequency_hz: 432;             // Kanonikal 432Hz
}

// ============================================================================
// 1.2 SCHOOL RHYTHM & PHASE ACTION ENTITIES (FB-08)
// ============================================================================

/** Definisi satu fase ritme di sekolah */
export interface PhaseConfig {
  phase_id: string;          // Kanonikal: 'WELCOME' | 'CENTRA' | 'LUNCH' | 'SYNTHESIS' | 'HANDOVER' | 'CLOSING'
  phase_name: string;        // "Sambut Ananda", "Main Sentra", "Makan Bekal", dsb.
  start_time: string;        // Format "HH:mm" (24 jam, misal "07:15")
  end_time: string;          // Format "HH:mm" (24 jam, misal "08:30")
  is_active: boolean;        // Apakah fase ini diaktifkan oleh sekolah
  quick_action_id?: string;  // ID aksi cepat yang dipasangkan (override lokal KS)
}

/** Konfigurasi ritme sekolah (Tingkat Sekolah — Hak Eksklusif KS) */
export interface SchoolRhythmConfig {
  config_id: string;
  school_id: string;
  academic_year_id: string;
  phases: PhaseConfig[];
  school_opening_time: string; // Misal "06:45" (Batas awal OPERASIONAL)
  school_closing_time: string; // Misal "14:30" (Batas akhir OPERASIONAL / pemicu PENUTUP)
  updated_by_person_id: string; // person_id Kepala Sekolah
  updated_at: string;
}

/** Katalog aksi kanonikal yang dapat dipasangkan ke fase */
export interface PhaseActionMapping {
  action_id: string;          // Misal "act_record_moment", "act_take_attendance", "act_close_day"
  action_name: string;        // "Rekam Momen", "Buka Presensi", "Tutup Hari"
  action_type: ActionTargetType;
  target_route?: string;      // Rute navigasi target (jika NAVIGATION)
  target_component?: string;  // Nama modal/sheet target
  is_default: boolean;        // Apakah ini bawaan kanonikal sistem
}

// ============================================================================
// 1.3 BASE BRIEFING DATA CONTRACT
// ============================================================================

export interface BaseBriefingData {
  mode: BriefingMode;
  closure_state?: ClosureState;
  greeting: string;           // "Selamat pagi, Bu Siti" / "Hari ini selesai, Bu Siti."
  date_formatted: string;     // "Senin, 30 Agustus 2026"
  warm_echo?: {
    source_type: 'PARENT_MESSAGE' | 'TEACHER_REFLECTION' | 'CHILD_QUOTE' | 'HEADMASTER_NOTE';
    source_author: string;
    quote_text: string;
    timestamp: string;
  };
}

// ============================================================================
// 1.4 ROLE-SPECIFIC BRIEFING DATA CONTRACTS
// ============================================================================

/** Briefing Data Khusus Guru (Ritme Mesin) */
export interface TeacherBriefingData extends BaseBriefingData {
  role: 'TEACHER';
  active_phase?: PhaseConfig;
  quick_action?: PhaseActionMapping;
  pending_tasks: {
    attendance_incomplete: boolean;
    active_allergies_count: number;
    unread_messages_count: number;
    draft_observations_count: number;
    oldest_draft_title?: string;
  };
  closure_summary?: {
    present_children: number;
    total_children: number;
    moments_recorded: number;
    messages_replied: number;
    pending_drafts_count: number;
  };
}

/** Briefing Data Khusus Kepala Sekolah (Otoritas Mesin) */
export interface HeadmasterBriefingData extends BaseBriefingData {
  role: 'HEADMASTER';
  reconciliation: {
    classes_complete: number;
    classes_total: number;
    active_safety_alerts: number;
  };
  authority_queue: {
    pending_lppa_approvals: number;
    pending_adoptions: number;
    oldest_pending_age_days: number;
    urgent_teacher_escalations: number;
  };
  partnership_pulse: {
    unread_guardian_messages: number;
    pending_confirmations: number;
  };
  closure_summary?: {
    lppa_approved_today: number;
    directives_responded_today: number;
    all_classes_reconciled: boolean;
  };
}

/** Briefing Data Khusus Yayasan (Siklus Mesin) */
export interface FoundationBriefingData extends BaseBriefingData {
  role: 'FOUNDATION';
  cycle_view: 'DAILY_SIGNAL' | 'WEEKLY_REVIEW' | 'WEEKLY_PREVIEW';
  decision_queue: {
    insights_awaiting_decision: number;
    oldest_insight_age_days: number;
  };
  loop_health: {
    actions_awaiting_adoption: number;
    outcomes_not_recorded: number;
  };
  equity_signals: {
    new_patterns_detected: number;
    suppressed_cohorts_count: number; // FB-07 K-Anonymity compliance
  };
}

/** Briefing Data Khusus Guardian (Ikatan Mesin) */
export interface GuardianBriefingData extends BaseBriefingData {
  role: 'GUARDIAN';
  child_id: string;
  child_name: string;
  today_summary: {
    attendance_status: 'HADIR' | 'IZIN' | 'SAKIT' | 'BELUM_PRESENSI';
    meal_status?: string;
    active_phase_name?: string;
  };
  latest_moment?: {
    moment_id: string;
    thumbnail_url: string;
    caption: string;
    captured_at: string;
  };
  teacher_personal_note?: string;
  lppa_published_available: boolean; // Hanya jika sudah diapprove KS
}

/** Discriminated Union untuk BriefingData */
export type BriefingData =
  | TeacherBriefingData
  | HeadmasterBriefingData
  | FoundationBriefingData
  | GuardianBriefingData;
```

---

## 2. STATE MACHINES & PURE LOGIC CONTRACTS

Aturan transisi status briefing dan sirkadian diekspresikan sebagai fungsi deterministik murni (*pure functions*). Tidak ada efek samping, panggilan IO, atau mutasi state tersembunyi.

```typescript
/**
 * STAGE 6-A STATE MACHINE & PURE TRANSITION CONTRACTS
 */

// ============================================================================
// 2.1 EVALUASI BRIEFING MODE SIRKADIAN
// ============================================================================

export interface ScheduleWindow {
  opening_time: string; // "06:45"
  closing_time: string; // "14:30"
}

/**
 * Mengevaluasi mode briefing berdasarkan waktu lokal dan jadwal sekolah.
 * 
 * Aturan:
 * 1. currentTime < opening_time -> 'PRATINJAU' (Pagi buta / persiapan)
 * 2. opening_time <= currentTime <= closing_time -> 'OPERASIONAL' (Jam sekolah aktif)
 * 3. currentTime > closing_time -> 'PENUTUP' (Sore / malam istirahat)
 * 
 * @param currentTime Format "HH:mm" (24 jam)
 * @param schedule ScheduleWindow dari SchoolRhythmConfig
 */
export function evaluateBriefingMode(
  currentTime: string,
  schedule: ScheduleWindow
): BriefingMode {
  if (!currentTime || !schedule.opening_time || !schedule.closing_time) {
    // Fail-safe default: konservatif operasional
    return 'OPERASIONAL';
  }

  if (currentTime < schedule.opening_time) {
    return 'PRATINJAU';
  }

  if (currentTime > schedule.closing_time) {
    return 'PENUTUP';
  }

  return 'OPERASIONAL';
}

// ============================================================================
// 2.2 EVALUASI STATUS CLOSURE MODE & SAFETY SUPPRESSION
// ============================================================================

export interface PendingTaskPredicate {
  has_unsubmitted_attendance: boolean;
  draft_observations_count: number;
  pending_lppa_count: number;
  unread_urgent_tasks_count: number;
}

/**
 * Mengevaluasi wajah emosional Closure Mode.
 * 
 * ATURAN MUTLAK KESELAMATAN:
 * - Jika safetyAlertsCount > 0, status penutup seren/tenang DIBATALKAN.
 *   Sistem menolak mode closure dan mewajibkan eskalasi keselamatan.
 * 
 * ATURAN PENUTUP:
 * - Jika total pending == 0 -> 'TUNTAS' (Afirmasi penuh + 432Hz earned)
 * - Jika total pending > 0 -> 'SISA_TENANG' (Nada tenang tanpa warna danger, D-8)
 */
export function evaluateClosureState(
  pending: PendingTaskPredicate,
  safetyAlertsCount: number
): { is_closure_allowed: boolean; state?: ClosureState; reason?: string } {
  // Pengecualian Keselamatan Mutlak (z-80 critical shield bypass)
  if (safetyAlertsCount > 0) {
    return {
      is_closure_allowed: false,
      reason: 'SAFETY_ALERT_ACTIVE_CLOSURE_BYPASS'
    };
  }

  const totalPending =
    (pending.has_unsubmitted_attendance ? 1 : 0) +
    pending.draft_observations_count +
    pending.pending_lppa_count +
    pending.unread_urgent_tasks_count;

  if (totalPending === 0) {
    return {
      is_closure_allowed: true,
      state: 'TUNTAS'
    };
  }

  return {
    is_closure_allowed: true,
    state: 'SISA_TENANG'
  };
}

// ============================================================================
// 2.3 EVALUASI PENAHANAN PESAN SIRKADIAN (HAK UNTUK ISTIRAHAT — D-8)
// ============================================================================

/**
 * Mengevaluasi apakah pesan yang masuk setelah jam sekolah ditahan sampai pagi.
 * 
 * Doktrin D-8:
 * - Pesan non-keselamatan setelah jam sekolah -> 'HOLD_UNTIL_MORNING'
 * - Pesan darurat keselamatan -> 'DELIVER_IMMEDIATELY' (Bypass mutlak)
 * - Pesan selama jam sekolah -> 'DELIVER_IMMEDIATELY'
 * 
 * @param messageTimestamp Waktu pesan masuk "HH:mm"
 * @param schoolClosingTime Waktu tutup sekolah "HH:mm"
 * @param isCriticalSafety Flag keselamatan darurat (misal: cedera berat, alergi anafilaksis)
 */
export function evaluateMessageHolding(
  messageTimestamp: string,
  schoolClosingTime: string,
  isCriticalSafety: boolean
): MessageDeliveryPolicy {
  // Keselamatan kritis tidak pernah ditahan
  if (isCriticalSafety) {
    return 'DELIVER_IMMEDIATELY';
  }

  // Jika pesan masuk setelah jam tutup sekolah, tahan sampai pagi
  if (messageTimestamp > schoolClosingTime) {
    return 'HOLD_UNTIL_MORNING';
  }

  return 'DELIVER_IMMEDIATELY';
}

// ============================================================================
// 2.4 DOKTRIN SUARA 432Hz: EARNED & INTENTIONAL VALIDATOR (D-7)
// ============================================================================

export type SoundTriggerContext = 'TASK_COMPLETION_EARNED' | 'USER_TAP_INTENTIONAL' | 'AUTO_AMBIENT_PROHIBITED';

/**
 * Memvalidasi apakah Web Audio 432Hz diizinkan berbunyi.
 * 
 * Doktrin D-7:
 * - Hanya boleh berbunyi pada 'TASK_COMPLETION_EARNED' atau 'USER_TAP_INTENTIONAL'.
 * - DILARANG pada auto-ambient / saat navigasi / saat app open.
 * - WAJIB memiliki user gesture context (patuh Web Audio policy).
 */
export function canPlay432HzSound(
  context: SoundTriggerContext,
  hasUserGesture: boolean,
  pref: AudioPreference
): boolean {
  if (!pref.sound_closure_enabled) {
    return false;
  }

  if (context === 'AUTO_AMBIENT_PROHIBITED') {
    return false;
  }

  // Web Audio User Gesture Requirement
  if (!hasUserGesture) {
    return false;
  }

  return context === 'TASK_COMPLETION_EARNED' || context === 'USER_TAP_INTENTIONAL';
}
```

---

## 3. API & RPC SIGNATURES (APPLICATION CONTRACTS)

Berikut adalah kontrak antarmuka layanan (*Service RPC Signatures*) yang akan direalisasikan pada Gate 1.

```typescript
/**
 * STAGE 6-A RPC & SERVICE LAYER SIGNATURES
 */

// ============================================================================
// 3.1 RPC: getBriefingData
// ============================================================================

export interface GetBriefingDataRequest {
  school_id: string;
  role: UserRole;
  user_id: string;
  client_local_time: string; // Format "HH:mm", misal "08:15"
  child_id?: string;         // Diwajibkan jika role === 'GUARDIAN'
}

export interface GetBriefingDataResponse {
  success: boolean;
  data?: BriefingData;
  error_code?:
    | 'UNAUTHORIZED_ROLE'
    | 'GUARDIAN_CHILD_NOT_LINKED'
    | 'SCHOOL_NOT_FOUND'
    | 'SURVEILLANCE_METRIC_REJECTED';
}

/**
 * Mengambil paket briefing terkomposisi sesuai peran, waktu sirkadian, dan filter privasi.
 */
export type RpcGetBriefingData = (
  req: GetBriefingDataRequest
) => Promise<GetBriefingDataResponse>;

// ============================================================================
// 3.2 RPC: getSchoolRhythmConfig
// ============================================================================

export interface GetSchoolRhythmConfigRequest {
  school_id: string;
}

export interface GetSchoolRhythmConfigResponse {
  success: boolean;
  config?: SchoolRhythmConfig;
  error_code?: 'CONFIG_NOT_FOUND' | 'DATABASE_ERROR';
}

/**
 * Mengambil konfigurasi ritme sekolah aktif. Jika belum ada, mengembalikan bawaan kanonikal.
 */
export type RpcGetSchoolRhythmConfig = (
  req: GetSchoolRhythmConfigRequest
) => Promise<GetSchoolRhythmConfigResponse>;

// ============================================================================
// 3.3 RPC: updatePhaseActionMapping (FB-08 ENFORCED)
// ============================================================================

export interface UpdatePhaseActionMappingRequest {
  school_id: string;
  phase_id: string;
  action_id: string;          // ID dari katalog aksi atau 'NONE'
  auth_user_id: string;       // User pengeksekusi
  auth_user_role: UserRole;   // Role pengeksekusi
  auth_user_school_id: string;// Unit asal pengeksekusi
}

export interface UpdatePhaseActionMappingResponse {
  success: boolean;
  updated_phase?: PhaseConfig;
  error_code?:
    | 'FORBIDDEN_RHYTHM_MUTATION' // FB-08 violation
    | 'INVALID_PHASE_ID'
    | 'INVALID_ACTION_ID';
}

/**
 * Memperbarui pasangan fase->aksi untuk satu sekolah.
 * WAJIB menegakkan FB-08: Hanya KS dari school_id bersangkutan yang diizinkan.
 */
export type RpcUpdatePhaseActionMapping = (
  req: UpdatePhaseActionMappingRequest
) => Promise<UpdatePhaseActionMappingResponse>;

// ============================================================================
// 3.4 RPC: triggerClosureRitual (D-9)
// ============================================================================

export interface TriggerClosureRitualRequest {
  school_id: string;
  user_id: string;
  role: UserRole;
  client_timestamp: string; // ISO string
}

export interface TriggerClosureRitualResponse {
  success: boolean;
  closure_state: ClosureState;
  recorded_at: string;
  error_code?: 'CLOSURE_BLOCKED_BY_SAFETY' | 'UNAUTHORIZED';
}

/**
 * Mencatat peristiwa eksekusi ritual "Tutup Hari" untuk analitik adopsi dan peredaan beban mental guru.
 */
export type RpcTriggerClosureRitual = (
  req: TriggerClosureRitualRequest
) => Promise<TriggerClosureRitualResponse>;
```

---

## 4. INVARIANTS & ADVERSARIAL ASSERTIONS

Tiga invarian arsitektur baru ditegakkan secara formal. Setiap invarian memiliki kondisi kegagalan (*assertion error*) yang wajib diuji dalam test suite Gate 1.

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        MATRIKS 3 INVARIAN BARU STAGE 6-A                               │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ FB-08 : School Rhythm Autonomy (Kedaulatan Ritme Unit)                                 │
│ FB-09 : Guardian Data Minimization (Minimasi Data & Proteksi Foto)                     │
│ H-07  : Briefing Non-Surveillance & Non-Guilt (Bebas Surveilans & Bebas Rasa Bersalah) │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

### 4.1 FB-08: School Rhythm Autonomy (Kedaulatan Ritme Unit)
* **Pernyataan Invarian:** Kepala Sekolah memiliki hak mutlak mengonfigurasi jadwal fase dan pasangan fase→aksi untuk sekolahnya. Yayasan, Superadmin, atau Guru DIBLOKIR dari memutasi konfigurasi sekolah lain.
* **RLS & Service Rule:**
  $$\text{MUTATE}(school\_rhythm\_config) \iff \text{auth.role} = \text{'HEADMASTER'} \land \text{auth.school\_id} = target.school\_id$$
* **Adversarial Test Scenario:**
  1. Login sebagai `FOUNDATION_OFFICER` atau `HEADMASTER_SCHOOL_B`.
  2. Panggil RPC `updatePhaseActionMapping` dengan target `school_id = 'school_a'`.
  3. **Expected Assertion:** Eksekusi digagalkan seketika, mengembalikan kode error `FORBIDDEN_RHYTHM_MUTATION`.

### 4.2 FB-09: Guardian Data Minimization (Minimasi Data Wali)
* **Pernyataan Invarian:** Akun Guardian hanya diizinkan mengakses ringkasan harian, catatan guru, dan foto dokumentasi momen yang secara eksplisit menautkan `child_id` anaknya sendiri.
* **RLS & Service Rule:**
  $$\text{ACCESS}(moment) \iff \exists link \in guardian\_relationships : link.guardian\_id = auth.uid() \land link.child\_id \in moment.tagged\_child\_ids$$
* **Adversarial Test Scenario:**
  1. Login sebagai `GUARDIAN_A` (orang tua dari `Child_1`).
  2. Panggil `getBriefingData` dengan meminta `child_id = 'Child_2'` (anak orang lain).
  3. **Expected Assertion:** Query ditolak pada layer validasi RLS/service, mengembalikan `GUARDIAN_DATA_LEAK_BLOCKED` (`GUARDIAN_CHILD_NOT_LINKED`), dan foto tanpa tag `Child_1` tidak pernah dimasukkan ke payload.

### 4.3 H-07: Briefing Non-Surveillance & Non-Guilt (Bebas Surveilans & Bebas Rasa Bersalah)
* **Pernyataan Invarian:**
  1. Briefing DILARANG menyajikan data perbandingan antar-guru, antar-kelas, atau antar-anak (tanpa `rank`, `percentile`, `speed_metric`).
  2. Mode PENUTUP DILARANG menggunakan warna `danger` atau kalimat penugasan kerja baru untuk tugas yang belum selesai (diframing sebagai *Sisa Tenang*).
* **Adversarial Test Scenario:**
  1. Jalankan unit test `validateBriefingPayload` dengan payload yang disuntikkan properti terlarang (misal: `{ teacher_ranking: 1, completion_percentile: 85 }`).
  2. **Expected Assertion:** Service layer validator mendeteksi properti ilegal dan melempar error `SURVEILLANCE_METRIC_REJECTED`.

---

## 5. DECISION LOG ALIGNMENT

| Decision ID | Doktrin Semantik | Realisasi Gate 0 Contract |
| --- | --- | --- |
| **D-1** | Otonomi pasangan fase→aksi lokal (terkekang) | `PhaseActionMapping` & `SchoolRhythmConfig` |
| **D-2** | Kedalaman otonomi = KS saja | Otorisasi `updatePhaseActionMapping` dibatasi `HEADMASTER` |
| **D-3** | Briefing sebagai Workspace Header | Type `BriefingData` didesain untuk mount di top workspace |
| **D-4** | Guardian workspace ringkas 3 tab | `GuardianBriefingData` memuat ringkasan harian + 1 momen hangat |
| **D-5** | Foto Guardian hanya yang bertanda | Invarian `FB-09` memvalidasi relasi `guardian_child_link` |
| **D-6** | Laporan Guardian = ringkasan + LPPA disahkan | `lppa_published_available` hanya true jika disahkan KS |
| **D-7** | Suara 432Hz default ON dengan toggle; earned/intentional | `canPlay432HzSound` murni memerlukan gesture & event sah |
| **D-8** | Penahanan pesan non-keselamatan sampai pagi | `evaluateMessageHolding` menahan pesan non-safety |
| **D-9** | `Tutup Hari` masuk Kamus Ritual | Tipe `ActionTargetType = 'RITUAL'` & RPC `triggerClosureRitual` |

---

## 6. SERTIFIKASI KESIAPAN GATE 0 (IMPLEMENTATION READINESS DECLARATION)

### Declaration of Contract Hardening

Dengan ini dinyatakan bahwa:
1. **Semantik Domain:** Entitas `SchoolRhythmConfig`, `PhaseActionMapping`, `BriefingMode`, `ClosureState`, dan 4 varian `BriefingData` telah didefinisikan secara lengkap, murni, dan bebas ambiguitas.
2. **State Machine Transisi:** Fungsi evaluasi mode sirkadian, evaluasi penutup hari dengan pengaman keselamatan, penahanan pesan malam hari, dan doktrin audio 432Hz telah dikunci sebagai *pure functions*.
3. **Batas Otoritas:** Invarian **FB-08**, **FB-09**, dan **H-07** telah dilengkapi dengan assertion error yang dapat diuji secara mekanis (*machine-testable*).
4. **Prinsip Zero Pollution:** Tidak ada skema tabel kanonikal V2.1.5 yang dilanggar atau dimodifikasi tanpa protokol tata kelola.

```text
════════════════════════════════════════════════════════════════════════════════════════════
                        GATE 0 CERTIFICATION SEAL
════════════════════════════════════════════════════════════════════════════════════════════
  Status              : SEALED & HARDENED
  Specification File  : doc/MASTER/STAGE_6_A_GATE_0_CONTRACT_HARDENING_v1.0.md
  Target Next Gate    : GATE 0.1 / GATE 1 (Technical Architecture & Enforcement Design)
  Architecture Signoff: Senior Architecture Reviewer (ARB) & System Steward
════════════════════════════════════════════════════════════════════════════════════════════
```
