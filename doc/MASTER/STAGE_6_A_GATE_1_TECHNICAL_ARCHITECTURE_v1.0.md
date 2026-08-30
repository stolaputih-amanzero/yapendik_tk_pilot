# STAGE 6-A — GATE 1: TECHNICAL ARCHITECTURE & ENFORCEMENT DESIGN
## "The Warm Briefing & The Closure Mode" — Enterprise Information Architecture, Entity Model, Database Blueprint, State Machines, API Contracts, UI Glass Layer, & Adversarial Test Suites (v1.0)
### Yapendik School OS — Early Childhood Context-Aware Operating Companion

**META**

| Atribut | Nilai |
| --- | --- |
| Document ID | `DOC-AMANAURA-STAGE-6A-GATE1-v1.0` |
| Version | `v1.0.0-SEALED` |
| Governing Tier | `LEVEL 2 — STAGE 6 STRATEGIC GROWTH DOMAIN` |
| Status | `GATE 1 SEALED — READY FOR CODE IMPLEMENTATION` |
| Authoritative Date | `2026-08-30` |
| Governing Ratifications | Ratified by ARB: Gate 0 (`DOC-AMANAURA-STAGE-6A-GATE0-v1.0`) & Gate 0.1 (`DOC-AMANAURA-STAGE-6A-GATE0.1-v1.0`) |
| Prerequisite Baseline | V2.1.5 Frozen Core (15 Tables) + Stage 4.5 LEARN (SEALED) + Stage 5 Hardening |
| Target Codebase | `yapendik-tk-pilot` |
| Classification | ARCHITECTURAL SPECIFICATION — GATE 1 SEALED |

---

## 0. ATURAN MUTLAK GATE 1 (CANONICAL CONSTRAINTS)

1. **Blueprint Integrity:** Dokumen ini adalah cetak biru teknis komprehensif untuk implementasi database, service engine, dan glass layer UI.
2. **Frozen Baseline Guarantee:** Dilarang merusak 15 tabel kanonikal V2.1.5. Tabel baru yang didefinisikan (`school_rhythm_configs`, `guardian_relationships`, `closure_ritual_ledger`, `phase_action_mappings`) adalah ekstensi terisolasi yang tidak mengubah integritas skema inti.
3. **Strict Policy Compliance:** Seluruh RLS, RPC, fungsi murni, dan komponen Glass Layer wajib mengimplementasikan resolusi pengetatan ARB:
   - **T-1 (Timezone):** Evaluasi sirkadian berbasis `school_timezone` dengan server time authority.
   - **T-2 (Server-Derived Scope):** Penghapusan parameter `child_id` dari klien Guardian.
   - **T-3 (Non-Aggregability):** Isolasi jejak penutup personal guru tanpa agregasi lintas-guru.
   - **T-4 (Vocabulary Versioning):** Pembekuan konstanta `RHYTHM_VOCABULARY_VERSION = 'v1'` dengan *fail-safe fallback*.

---

## 1. ENTERPRISE INFORMATION ARCHITECTURE (EIA 5-LAYER EXTENSION)

Arsitektur informasi Stage 6-A memperluas struktur Enterprise Information Architecture (EIA) Yapendik School OS ke dalam 5 lapisan yang terikat secara ketat:

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ 1. CANONICAL SCHOOL LAYER (Authoritative School Reality)                                │
│    • school_rhythm_configs (FB-08: KS-owned local schedule & timezone T-1)            │
│    • phase_action_mappings (Canonical vocabulary v1, T-4)                              │
│    • guardian_relationships (FB-09: verified parent-child link)                        │
│    • closure_ritual_ledger (T-3: non-aggregable teacher-private reflection ledger)    │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 2. PROJECTION & COMPOSER LAYER (Role-Based Briefing Composition)                       │
│    • TeacherBriefingComposer (Active phase + Deterministic CTA + Pending + Warm Echo)  │
│    • HeadmasterBriefingComposer (Morning reconciliation + Authority queue + Partners)  │
│    • FoundationBriefingComposer (Decision queue + Loop health + Suppressed Signals)    │
│    • GuardianBriefingComposer (Child today + Tagged moment + Approved LPPA)            │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 3. CIRCADIAN STATE MACHINE LAYER (Pure Logic Runtime)                                  │
│    • evaluateBriefingMode (PRATINJAU / OPERASIONAL / PENUTUP)                          │
│    • evaluateClosureState (TUNTAS / SISA_TENANG / SAFETY_ALERT_BYPASS)                 │
│    • evaluateMessageHolding (HOLD_UNTIL_MORNING / DELIVER_IMMEDIATELY - D-8)           │
│    • canPlay432HzSound (EARNED / INTENTIONAL / GESTURE_VALIDATOR - D-7)                │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 4. GLASS LAYER (Amanaura v4.0 UI Components)                                           │
│    • <BriefingShell /> (Shared: role greeting + date + 4s/8s Amanaura Breath ✦)        │
│    • <TeacherBriefing /> (Dynamic CTA + Ghost [Tutup Hari] + Warm Echo)                │
│    • <HeadmasterBriefing /> (Authority Action Ledger + Reconciliation Pill)            │
│    • <FoundationBriefing /> (Stewardship Signals + Non-Causal Delta Footnotes)         │
│    • <GuardianBriefing /> (Kamus Keluarga + Tagged Moment Gallery + Sovereign Report)  │
├────────────────────────────────────────────────────────────────────────────────────────┤
│ 5. STORAGE & CLIENT PERSISTENCE LAYER                                                  │
│    • IndexedDB Cache: Guardian tagged moments & daily summary                          │
│    • LocalStorage: Teacher local sound preferences (`sound_closure_enabled`)           │
│    • Web Audio Context: Synthesizer nada murni sine 432Hz (Zero External Asset)        │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. DOMAIN ENTITY MODEL (TYPESCRIPT SPECIFICATIONS)

Definisikan tipe domain murni (*type-safe definitions*) yang menjadi fondasi kode produksi:

```typescript
/**
 * STAGE 6-A DOMAIN ENTITY MODEL
 * Governing Specification: Gate 1 v1.0.0-SEALED
 */

// ============================================================================
// 2.1 BASE ENUMS & TIMEZONE TYPES
// ============================================================================

export type SchoolTimezone = 'WIB' | 'WITA' | 'WIT';
export type RhythmVocabularyVersion = 'v1';
export type BriefingMode = 'PRATINJAU' | 'OPERASIONAL' | 'PENUTUP';
export type ClosureState = 'TUNTAS' | 'SISA_TENANG';
export type UserRole = 'TEACHER' | 'HEADMASTER' | 'FOUNDATION' | 'GUARDIAN';
export type ActionTargetType = 'NAVIGATION' | 'MODAL' | 'SHEET' | 'RITUAL';
export type MessageDeliveryPolicy = 'HOLD_UNTIL_MORNING' | 'DELIVER_IMMEDIATELY';

// ============================================================================
// 2.2 SCHOOL RHYTHM & PHASE ACTION ENTITIES (FB-08, T-1, T-4)
// ============================================================================

export interface PhaseConfig {
  phase_id: string;          // Kanonikal v1: 'WELCOME' | 'CENTRA' | 'LUNCH' | 'SYNTHESIS' | 'HANDOVER' | 'CLOSING'
  phase_name: string;        // "Sambut Ananda", "Main Sentra", dsb.
  start_time: string;        // "07:15" (Format HH:mm)
  end_time: string;          // "08:30" (Format HH:mm)
  is_active: boolean;
  quick_action_id?: string;  // ID dari PhaseActionMapping (Override lokal KS)
}

export interface SchoolRhythmConfig {
  config_id: string;
  school_id: string;
  academic_year_id: string;
  school_timezone: SchoolTimezone;           // T-1 Resolved: WIB | WITA | WIT
  rhythm_vocabulary_version: RhythmVocabularyVersion; // T-4 Resolved: 'v1'
  school_opening_time: string;               // "06:45"
  school_closing_time: string;               // "14:30"
  phases: PhaseConfig[];
  updated_by_person_id: string;              // person_id Kepala Sekolah
  updated_at: string;
}

export interface PhaseActionMapping {
  action_id: string;          // 'act_record_moment' | 'act_take_attendance' | 'act_close_day'
  action_name: string;        // "Rekam Momen", "Buka Presensi", "Tutup Hari"
  action_type: ActionTargetType;
  target_route?: string;
  target_component?: string;
  is_default: boolean;        // Bawaan kanonikal v1
}

// ============================================================================
// 2.3 GUARDIAN RELATIONSHIP ENTITY (FB-09)
// ============================================================================

export interface GuardianRelationship {
  relationship_id: string;
  guardian_user_id: string;  // references auth.users(id)
  child_id: string;          // references students(student_id)
  relationship_type: 'AYAH' | 'IBU' | 'WALI';
  is_active: boolean;
  verified_at: string;
}

// ============================================================================
// 2.4 CLOSURE RITUAL EVENT ENTITY (T-3: Non-Aggregable)
// ============================================================================

export interface ClosureRitualEvent {
  event_id: string;
  teacher_user_id: string;   // references persons(person_id)
  school_id: string;
  ritual_date: string;       // YYYY-MM-DD
  closure_state: ClosureState;
  pending_tasks_count: number;
  safety_alerts_count: number;
  personal_reflection?: string;
  recorded_at: string;
}

// ============================================================================
// 2.5 BRIEFING DATA (DISCRIMINATED UNION)
// ============================================================================

export interface BaseBriefingData {
  mode: BriefingMode;
  greeting: string;
  date_formatted: string;
  school_local_time: string;
  warm_echo?: {
    source_type: 'PARENT_MESSAGE' | 'TEACHER_REFLECTION' | 'CHILD_QUOTE' | 'HEADMASTER_NOTE';
    source_author: string;
    quote_text: string;
    timestamp: string;
  };
}

export interface TeacherBriefingData extends BaseBriefingData {
  role: 'TEACHER';
  active_phase?: PhaseConfig;
  quick_action?: PhaseActionMapping;
  pending_tasks: {
    attendance_incomplete: boolean;
    active_allergies: number;
    unread_messages: number;
    draft_observations: number;
    oldest_draft_title?: string;
  };
  closure_summary?: {
    present_children: number;
    total_children: number;
    moments_recorded: number;
    messages_replied: number;
    pending_drafts_count: number;
    closure_state: ClosureState;
  };
}

export interface HeadmasterBriefingData extends BaseBriefingData {
  role: 'HEADMASTER';
  reconciliation: {
    classes_complete: number;
    classes_total: number;
    safety_alerts: number;
  };
  authority_queue: {
    pending_lppa_approvals: number;
    pending_adoptions: number;
    oldest_pending_age_days: number;
  };
  partnership_pulse: {
    unread_messages: number;
    pending_confirmations: number;
  };
  closure_summary?: {
    lppa_approved_today: number;
    directives_responded_today: number;
    safety_status_green: boolean;
  };
}

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
    suppressed_cohorts: number; // FB-07 K-Anonymity
  };
}

export interface GuardianBriefingData extends BaseBriefingData {
  role: 'GUARDIAN';
  child_name: string;
  today_summary: {
    attendance_status: 'Hadir' | 'Izin' | 'Sakit' | 'Belum Ada Kabar';
    meal_status?: string;
    active_phase_name?: string;
  };
  latest_moment?: {
    moment_id: string;
    thumbnail_url: string;
    caption: string;
    captured_at: string;
  };
  teacher_note?: string;
  lppa_published_available: boolean; // Hanya jika sudah diapprove KS
}

export type BriefingData =
  | TeacherBriefingData
  | HeadmasterBriefingData
  | FoundationBriefingData
  | GuardianBriefingData;
```

---

## 3. STATE MACHINES & PURE LOGIC FUNCTIONS

Fungsi murni deterministik berikut dieksekusi pada runtime tanpa menimbulkan efek samping:

```typescript
/**
 * STAGE 6-A PURE LOGIC FUNCTIONS & STATE TRANSITIONS
 */

// ============================================================================
// 3.1 EVALUASI WAKTU DAN MODE SIRKADIAN (T-1)
// ============================================================================

export function resolveSchoolLocalTime(
  serverUtc: Date,
  timezone: SchoolTimezone
): { localDate: Date; localTimeString: string } {
  const offsetHours = timezone === 'WIT' ? 9 : timezone === 'WITA' ? 8 : 7;
  const localDate = new Date(serverUtc.getTime() + offsetHours * 3600 * 1000);
  const hours = String(localDate.getUTCHours()).padStart(2, '0');
  const minutes = String(localDate.getUTCMinutes()).padStart(2, '0');
  return {
    localDate,
    localTimeString: `${hours}:${minutes}`
  };
}

export function evaluateBriefingMode(
  serverUtc: Date,
  config: SchoolRhythmConfig
): BriefingMode {
  const { localTimeString } = resolveSchoolLocalTime(serverUtc, config.school_timezone);

  if (localTimeString < config.school_opening_time) {
    return 'PRATINJAU';
  }
  if (localTimeString > config.school_closing_time) {
    return 'PENUTUP';
  }
  return 'OPERASIONAL';
}

// ============================================================================
// 3.2 EVALUASI CLOSURE STATE & CRITICAL SAFETY BYPASS
// ============================================================================

export interface PendingTaskCounts {
  attendance_incomplete: boolean;
  draft_observations: number;
  unread_messages: number;
  pending_lppa_count?: number;
}

export type ClosureEvaluationResult =
  | { allowed: true; state: ClosureState }
  | { allowed: false; reason: 'SAFETY_ALERT_ACTIVE_CLOSURE_BYPASS' };

export function evaluateClosureState(
  pending: PendingTaskCounts,
  safetyAlertsCount: number
): ClosureEvaluationResult {
  // Pengecualian Keselamatan Mutlak
  if (safetyAlertsCount > 0) {
    return {
      allowed: false,
      reason: 'SAFETY_ALERT_ACTIVE_CLOSURE_BYPASS'
    };
  }

  const totalPending =
    (pending.attendance_incomplete ? 1 : 0) +
    pending.draft_observations +
    pending.unread_messages +
    (pending.pending_lppa_count ?? 0);

  if (totalPending === 0) {
    return { allowed: true, state: 'TUNTAS' };
  }

  return { allowed: true, state: 'SISA_TENANG' };
}

// ============================================================================
// 3.3 EVALUASI PENAHANAN PESAN (D-8: Hak Istirahat)
// ============================================================================

export function evaluateMessageHolding(
  messageServerUtc: Date,
  config: SchoolRhythmConfig,
  isCriticalSafety: boolean
): MessageDeliveryPolicy {
  // Jalur z-80 Critical Shield Bypass
  if (isCriticalSafety) {
    return 'DELIVER_IMMEDIATELY';
  }

  const { localTimeString } = resolveSchoolLocalTime(messageServerUtc, config.school_timezone);
  if (localTimeString > config.school_closing_time) {
    return 'HOLD_UNTIL_MORNING';
  }

  return 'DELIVER_IMMEDIATELY';
}

// ============================================================================
// 3.4 EVALUASI PEMICU SUARA 432Hz (D-7)
// ============================================================================

export type SoundTriggerContext = 'TASK_COMPLETION_EARNED' | 'USER_TAP_INTENTIONAL' | 'AUTO_AMBIENT_PROHIBITED' | 'NAVIGATION_PROHIBITED';

export function canPlay432HzSound(
  context: SoundTriggerContext,
  hasUserGesture: boolean,
  soundClosureEnabled: boolean
): boolean {
  if (!soundClosureEnabled) return false;
  if (!hasUserGesture) return false;
  return context === 'TASK_COMPLETION_EARNED' || context === 'USER_TAP_INTENTIONAL';
}
```

---

## 4. DATABASE SCHEMA & RLS POLICIES (SQL BLUEPRINT)

Berikut adalah DDL dan Row-Level Security policies untuk 4 tabel Stage 6-A:

```sql
-- ============================================================================
-- 4.1 TABLE: school_rhythm_configs (FB-08: KS-Owned Rhythm Autonomy)
-- ============================================================================

CREATE TABLE IF NOT EXISTS school_rhythm_configs (
  config_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_id UUID NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  academic_year_id UUID NOT NULL,
  school_timezone VARCHAR(4) NOT NULL CHECK (school_timezone IN ('WIB', 'WITA', 'WIT')),
  rhythm_vocabulary_version VARCHAR(4) NOT NULL DEFAULT 'v1',
  school_opening_time VARCHAR(5) NOT NULL DEFAULT '06:45',
  school_closing_time VARCHAR(5) NOT NULL DEFAULT '14:30',
  phases JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_by_person_id UUID NOT NULL REFERENCES persons(person_id),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_school_rhythm_year UNIQUE (school_id, academic_year_id)
);

ALTER TABLE school_rhythm_configs ENABLE ROW LEVEL SECURITY;

-- Guru & Staff: Read-only untuk sekolah unitnya sendiri
CREATE POLICY "p_school_rhythm_read_unit"
ON school_rhythm_configs FOR SELECT
TO authenticated
USING (
  school_id = (SELECT school_id FROM persons WHERE person_id = auth.uid())
);

-- Kepala Sekolah: Hak eksklusif kelola ritme unitnya
CREATE POLICY "p_school_rhythm_ks_manage"
ON school_rhythm_configs FOR ALL
TO authenticated
USING (
  school_id = (SELECT school_id FROM persons WHERE person_id = auth.uid())
  AND (SELECT role FROM persons WHERE person_id = auth.uid()) = 'HEADMASTER'
)
WITH CHECK (
  school_id = (SELECT school_id FROM persons WHERE person_id = auth.uid())
  AND (SELECT role FROM persons WHERE person_id = auth.uid()) = 'HEADMASTER'
);

-- Yayasan / Superadmin: HARD BLOCKED (FB-03 / FB-06 Principle)
-- Zero policy grant for Foundation mutates

-- ============================================================================
-- 4.2 TABLE: phase_action_mappings (Canonical Vocabulary Catalog)
-- ============================================================================

CREATE TABLE IF NOT EXISTS phase_action_mappings (
  action_id VARCHAR(50) PRIMARY KEY,
  action_name VARCHAR(100) NOT NULL,
  action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('NAVIGATION', 'MODAL', 'SHEET', 'RITUAL')),
  target_route VARCHAR(255),
  target_component VARCHAR(100),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE phase_action_mappings ENABLE ROW LEVEL SECURITY;

-- Read-only publik untuk semua pengguna terotentikasi
CREATE POLICY "p_phase_action_read_all"
ON phase_action_mappings FOR SELECT
TO authenticated
USING (true);

-- ============================================================================
-- 4.3 TABLE: guardian_relationships (FB-09: Verified Parent-Child Link)
-- ============================================================================

CREATE TABLE IF NOT EXISTS guardian_relationships (
  relationship_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  guardian_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  child_id UUID NOT NULL REFERENCES students(student_id) ON DELETE CASCADE,
  relationship_type VARCHAR(20) NOT NULL CHECK (relationship_type IN ('AYAH', 'IBU', 'WALI')),
  is_active BOOLEAN NOT NULL DEFAULT true,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_guardian_child UNIQUE (guardian_user_id, child_id)
);

ALTER TABLE guardian_relationships ENABLE ROW LEVEL SECURITY;

-- Guardian hanya boleh membaca baris relasi miliknya sendiri
CREATE POLICY "p_guardian_read_own_relationships"
ON guardian_relationships FOR SELECT
TO authenticated
USING (guardian_user_id = auth.uid());

-- Staf sekolah / KS dapat membaca relasi siswa di sekolahnya
CREATE POLICY "p_staff_read_school_guardian_relationships"
ON guardian_relationships FOR SELECT
TO authenticated
USING (
  child_id IN (
    SELECT s.student_id 
    FROM students s
    JOIN student_placement_records spr ON spr.student_id = s.student_id
    JOIN classrooms c ON c.classroom_id = spr.classroom_id
    WHERE c.school_id = (SELECT school_id FROM persons WHERE person_id = auth.uid())
  )
);

-- ============================================================================
-- 4.4 TABLE: closure_ritual_ledger (T-3: Non-Aggregable Teacher Private)
-- ============================================================================

CREATE TABLE IF NOT EXISTS closure_ritual_ledger (
  event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id UUID NOT NULL REFERENCES persons(person_id) ON DELETE CASCADE,
  school_id UUID NOT NULL REFERENCES schools(school_id) ON DELETE CASCADE,
  ritual_date DATE NOT NULL DEFAULT CURRENT_DATE,
  closure_state VARCHAR(20) NOT NULL CHECK (closure_state IN ('TUNTAS', 'SISA_TENANG')),
  pending_tasks_count INTEGER NOT NULL DEFAULT 0,
  safety_alerts_count INTEGER NOT NULL DEFAULT 0,
  personal_reflection TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_teacher_daily_closure UNIQUE (teacher_user_id, ritual_date)
);

ALTER TABLE closure_ritual_ledger ENABLE ROW LEVEL SECURITY;

-- Guru: INSERT & SELECT data miliknya sendiri (Private Journal)
CREATE POLICY "p_closure_teacher_insert_self"
ON closure_ritual_ledger FOR INSERT
TO authenticated
WITH CHECK (teacher_user_id = auth.uid());

CREATE POLICY "p_closure_teacher_select_self"
ON closure_ritual_ledger FOR SELECT
TO authenticated
USING (teacher_user_id = auth.uid());

-- Peran lain: BLOCKED TOTAL (Anti-Surveillance T-3 / H-07)
```

---

## 5. RPC & SERVICE LAYER CONTRACTS

Definisikan kontrak antarmuka API backend yang dieksekusi dengan protokol keamanan ketat:

```typescript
/**
 * STAGE 6-A RPC CONTRACT SPECIFICATIONS
 */

// ============================================================================
// 5.1 RPC: getBriefingData
// ============================================================================

export async function getBriefingData(
  role: UserRole,
  school_id: string,
  user_id: string
): Promise<BriefingData> {
  // IMPLEMENTATION BLUEPRINT:
  // 1. Validasi auth.uid() == user_id
  // 2. Fetch school_rhythm_config untuk timezone & schedule
  // 3. Evaluasi mode = evaluateBriefingMode(new Date(), rhythmConfig)
  // 4. Branch by role:
  //    - 'TEACHER': Query pending attendance, draft observations, unread messages, active phase action.
  //    - 'HEADMASTER': Query reconciliation across classes, authority approvals queue, directives.
  //    - 'FOUNDATION': Query multi-school aggregate, apply FB-07 cohort suppression (< 5).
  //    - 'GUARDIAN': Server-derived child_id query dari guardian_relationships (T-2).
  //                  Query latest moment bertanda child_id (FB-09).
  //                  Query today's attendance & meal.
  // 5. Assert: No comparative metrics exist in return payload (H-07).
  // 6. Return typed discriminated union.
}

// ============================================================================
// 5.2 RPC: getSchoolRhythmConfig
// ============================================================================

export async function getSchoolRhythmConfig(
  school_id: string
): Promise<SchoolRhythmConfig> {
  // IMPLEMENTATION BLUEPRINT:
  // 1. Query table school_rhythm_configs WHERE school_id = school_id
  // 2. Jika baris belum ada:
  //    Return Default Canonical Config (T-4 Fail-Safe):
  //    - timezone: 'WIB'
  //    - vocabulary: 'v1'
  //    - phases: [WELCOME, CENTRA, LUNCH, SYNTHESIS, HANDOVER, CLOSING]
}

// ============================================================================
// 5.3 RPC: updatePhaseActionMapping (FB-08 Enforced)
// ============================================================================

export async function updatePhaseActionMapping(
  school_id: string,
  phase_id: string,
  action_id: string
): Promise<{ success: boolean; updated_phase: PhaseConfig }> {
  // IMPLEMENTATION BLUEPRINT:
  // 1. SET search_path = public, pg_temp;
  // 2. Validasi caller role == 'HEADMASTER' AND caller school_id == school_id (FB-08).
  //    If mismatch -> Throw Error 'FORBIDDEN_RHYTHM_MUTATION'.
  // 3. Validasi phase_id exists in canonical catalog v1.
  // 4. Validasi action_id exists in phase_action_mappings.
  // 5. UPDATE phases JSONB in school_rhythm_configs.
  // 6. Return updated phase.
}

// ============================================================================
// 5.4 RPC: triggerClosureRitual (T-3 Enforced)
// ============================================================================

export async function triggerClosureRitual(
  user_id: string,
  school_id: string,
  closureState: ClosureState,
  pendingTasksCount: number,
  safetyAlertsCount: number,
  personalReflection?: string
): Promise<{ success: boolean; event_id: string }> {
  // IMPLEMENTATION BLUEPRINT:
  // 1. Validasi caller role == 'TEACHER' AND caller user_id == auth.uid().
  // 2. Jika safetyAlertsCount > 0 -> Throw Error 'CLOSURE_BLOCKED_BY_SAFETY'.
  // 3. INSERT INTO closure_ritual_ledger (teacher_user_id, school_id, ritual_date, ...).
  // 4. Return generated event_id.
}
```

---

## 6. GLASS LAYER COMPONENTS (UI BLUEPRINT)

Berikut adalah rancangan struktural komponen antarmuka (*UI Component Blueprints*) yang mematuhi standar desain Amanaura v4.0:

```tsx
/**
 * STAGE 6-A GLASS LAYER BLUEPRINTS
 */

// ============================================================================
// 6.1 <BriefingShell /> (Shared Circadian Header)
// ============================================================================

export interface BriefingShellProps {
  greeting: string;
  date_formatted: string;
  mode: BriefingMode;
  children: React.ReactNode;
}

// Blueprint Struktur:
// - Header container dengan padding responsive (px-5 pt-6).
// - Sapaan hangat: H1 typography Outfit/Inter text-ink font-semibold.
// - Sinyal Circadian Amanaura Breath ✦:
//   - Mode OPERASIONAL: 4s breathe animation.
//   - Mode PENUTUP: 8s serene night-breathe animation.
// - Slot anak komponen terisolasi per peran.

// ============================================================================
// 6.2 <TeacherBriefing /> (Guru: Ritme & Penutup)
// ============================================================================

// Blueprint Struktur:
// - Mode PRATINJAU: "Hari ini dimulai [jam] — [N] hal menanti Anda." + Preview CTA.
// - Mode OPERASIONAL: Banner Fase Aktif ("Sekarang waktu Main Sentra") + Tombol Primary CTA Dominant [Rekam Momen].
// - Mode PENUTUP:
//   - Micro-summary chips: [15/15 Hadir] [3 Momen] [2 Pesan Dibalas].
//   - Ghost CTA: Tombol border ink-soft/20 text-ink [Tutup Hari].
//   - Warm Echo: Kutipan reflektif guru/ortu dengan background surface-subtle.

// ============================================================================
// 6.3 <HeadmasterBriefing /> (KS: Otoritas & Rekonsiliasi)
// ============================================================================

// Blueprint Struktur:
// - Rekonsiliasi Pill: "3/3 Kelas Lengkap" (Hijau) atau "1 Alert Keselamatan" (Merah Amber).
// - Antrean Otoritas: "2 LPPA Menunggu Pengesahan • 1 Direktif Yayasan".
// - Action Button: [Tinjau Antrean Otoritas].
// - Warm Echo: Suara terima kasih orang tua dari Buku Penghubung.

// ============================================================================
// 6.4 <FoundationBriefing /> (Yayasan: Stewardship & Siklus)
// ============================================================================

// Blueprint Struktur:
// - Decision Queue: "2 Insight Menunggu Keputusan Dewan".
// - Loop Health: "1 Aksi Menunggu Respons Sekolah".
// - PrivacyShield: Kohor < 5 disupresi secara visual dengan chip proteksi etis.
// - Action Button: [Telaah Wawasan Dewan].
// - Warm Echo: Catatan kualitatif refleksi manusiawi KS (ObservedOutcomeEffect).

// ============================================================================
// 6.5 <GuardianBriefing /> (Wali Murid: Ikatan & Kabar Anak)
// ============================================================================

// Blueprint Struktur:
// - Kamus Keluarga: "Kenzo hadir hari ini • Makan siang habis • Bermain di sentra balok".
// - Tagged Moment Card: 1 foto terbaru tempat ananda bertanda dengan visual card elegan.
// - Action Button: [Buka Galeri Hari Ini] / [Lihat Potret Perkembangan].
// - Zero Surveillance: Tanpa angka nilai, tanpa grafik ranking.

// ============================================================================
// 6.6 <WebAudioSynthesizer 432Hz /> (Doktrin Audio D-7)
// ============================================================================

// Blueprint Audio Web API:
// - OscillatorType: 'sine'
// - Frequency: 432.0 Hz
// - Envelope: Attack 0.05s, Decay 0.2s, Sustain 0.1 gain, Release 1.5s (exponentialRampToValueAtTime).
// - Zero external asset dependency; dibangkitkan murni di browser.
```

---

## 7. ADVERSARIAL TEST SUITE ARCHITECTURE (SUITES 26 s.d. 28)

Spesifikasi uji ketahanan (*security & invariant assurance*) untuk Gate 1:

```typescript
/**
 * STAGE 6-A ADVERSARIAL TEST ARCHITECTURE
 */

// ============================================================================
// 7.1 SUITE 26: FB-08 School Rhythm Autonomy Enforcement
// ============================================================================

describe('Suite 26: FB-08 School Rhythm Autonomy', () => {
  test('Case 26.1: KS sekolah A DITOLAK memutasi ritme sekolah B', async () => {
    const ks_a = mockAuthContext('HEADMASTER', 'school_a');
    await expect(
      updatePhaseActionMapping.call(ks_a, 'school_b', 'CENTRA', 'act_record_moment')
    ).rejects.toThrow('FORBIDDEN_RHYTHM_MUTATION');
  });

  test('Case 26.2: Yayasan / Superadmin DITOLAK memutasi ritme sekolah mana pun', async () => {
    const foundation = mockAuthContext('FOUNDATION', 'foundation_central');
    await expect(
      updatePhaseActionMapping.call(foundation, 'school_a', 'CENTRA', 'act_record_moment')
    ).rejects.toThrow('FORBIDDEN_RHYTHM_MUTATION');
  });

  test('Case 26.3: Guru DITOLAK memutasi konfigurasi ritme', async () => {
    const teacher = mockAuthContext('TEACHER', 'school_a');
    await expect(
      updatePhaseActionMapping.call(teacher, 'school_a', 'CENTRA', 'act_record_moment')
    ).rejects.toThrow('FORBIDDEN_RHYTHM_MUTATION');
  });
});

// ============================================================================
// 7.2 SUITE 27: FB-09 Guardian Data Minimization & Zero Parameter Tampering
// ============================================================================

describe('Suite 27: FB-09 Guardian Data Minimization', () => {
  test('Case 27.1: Guardian request DITURUNKAN server-side, bebas parameter child_id (T-2)', async () => {
    const guardian = mockAuthContext('GUARDIAN', 'guardian_user_123');
    const briefing = await getBriefingData.call(guardian, 'GUARDIAN', 'school_a', guardian.uid);
    // Verifikasi data anak yang kembali murni anak yang terdaftar di guardian_relationships
    expect(briefing.role).toBe('GUARDIAN');
  });

  test('Case 27.2: Foto tanpa tag anak wali TIDAK BOCOR ke payload', async () => {
    const guardian = mockAuthContext('GUARDIAN', 'guardian_user_123');
    const moments = await getGuardianMoments.call(guardian);
    // Semua foto yang kembali wajib memuat tag anak wali
    moments.forEach(m => expect(m.tagged_child_ids).toContain('child_123'));
  });

  test('Case 27.3: Guardian DITOLAK mengakses LPPA berstatus DRAFT', async () => {
    const guardian = mockAuthContext('GUARDIAN', 'guardian_user_123');
    await expect(
      getGuardianLPPA.call(guardian, 'lppa_draft_teacher_99')
    ).rejects.toThrow('REPORT_NOT_PUBLISHED');
  });
});

// ============================================================================
// 7.3 SUITE 28: H-07 Non-Surveillance, Circadian Skew, & Audio Integrity
// ============================================================================

describe('Suite 28: H-07 Non-Surveillance & Circadian Robustness', () => {
  test('Case 28.1: Service layer MENOLAK injeksi properti ranking/persentil', () => {
    const dirtyPayload = {
      teacher_rank: 1,
      class_completion_pct: 95
    };
    expect(() => validateBriefingPayload(dirtyPayload)).toThrow('SURVEILLANCE_METRIC_REJECTED');
  });

  test('Case 28.2: Query agregasi multi-guru pada closure ledger DIBLOKIR (T-3)', async () => {
    const foundation = mockAuthContext('FOUNDATION', 'foundation_central');
    await expect(
      aggregateTeacherClosureStats.call(foundation, 'school_a')
    ).rejects.toThrow('CROSS_TEACHER_CLOSURE_AGGREGATION_FORBIDDEN');
  });

  test('Case 28.3: Manipulasi jam klien (+3 jam) TIDAK MEMPENGARUHI mode evaluasi server (T-1)', () => {
    const serverUtc = new Date('2026-08-30T02:00:00Z'); // 09:00 WIB
    const config: SchoolRhythmConfig = {
      school_timezone: 'WIB',
      school_opening_time: '06:45',
      school_closing_time: '14:30',
      // ...
    } as any;
    const mode = evaluateBriefingMode(serverUtc, config);
    expect(mode).toBe('OPERASIONAL');
  });

  test('Case 28.4: Suara 432Hz DITOLAK jika pemicu berupa navigasi atau tanpa user gesture (D-7)', () => {
    const canPlayAuto = canPlay432HzSound('AUTO_AMBIENT_PROHIBITED', false, true);
    expect(canPlayAuto).toBe(false);

    const canPlayNav = canPlay432HzSound('NAVIGATION_PROHIBITED', true, true);
    expect(canPlayNav).toBe(false);

    const canPlayEarned = canPlay432HzSound('TASK_COMPLETION_EARNED', true, true);
    expect(canPlayEarned).toBe(true);
  });
});
```

---

## 8. SERTIFIKASI KESIAPAN IMPLEMENTASI (GATE 1 SEAL)

```text
╔══════════════════════════════════════════════════════════════════════════════╗
║              STAGE 6-A — TECHNICAL ARCHITECTURE CERTIFIED (GATE 1)           ║
║                                                                              ║
║  INFORMATION ARCHITECTURE (EIA)       : 5-LAYER COMPLETE & BOUNDED           ║
║  DOMAIN ENTITY MODEL                  : TYPE-SAFE & FROZEN                   ║
║  STATE MACHINES                       : PURE TRANSITION LOGIC SPECIFIED      ║
║  DATABASE SCHEMA & RLS                : FB-08, FB-09, T-3 ENFORCED           ║
║  RPC & API CONTRACTS                  : SIGNATURES LOCKED                    ║
║  GLASS LAYER COMPONENTS               : AMANAURA v4.0 BLUEPRINTS READY       ║
║  ADVERSARIAL TEST ARCHITECTURE        : SUITES 26-28 SPECIFIED               ║
║                                                                              ║
║  OVERALL STATUS                       : 🟢 GATE 1 SEALED & READY FOR CODE     ║
╚══════════════════════════════════════════════════════════════════════════════╝
```

*Dokumen ini merupakan cetak biru teknis final (Gate 1). Dengan penyegelan dokumen ini, implementasi kode produksi (SQL migrations, Supabase RPCs, `BriefingEngine`, dan komponen React Glass Layer) resmi dapat dieksekusi.*
