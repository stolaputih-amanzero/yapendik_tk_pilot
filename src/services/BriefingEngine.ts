/**
 * YAPENDIK SCHOOL OS — STAGE 6-A BRIEFING ENGINE
 * The Warm Briefing & The Closure Mode Service Layer
 * Governing Specification: Gate 1 (DOC-AMANAURA-STAGE-6A-GATE1-v1.0)
 */

import { getSupabaseClient } from '../db/supabaseClient';
import { db } from '../db/database';
import {
  BriefingData,
  BriefingMode,
  ClosureState,
  PhaseActionMapping,
  PhaseConfig,
  SchoolRhythmConfig,
  TeacherBriefingData,
  HeadmasterBriefingData,
  FoundationBriefingData,
  GuardianBriefingData,
  UserRole
} from '../types/briefingTypes';
import {
  evaluateBriefingMode,
  evaluateClosureState,
  findActivePhase,
  resolveSchoolLocalTime
} from './briefing/StateMachines';

// ============================================================================
// CANONICAL DEFAULT CONFIGURATION (T-4 Fail-Safe Fallback)
// ============================================================================

export const CANONICAL_DEFAULT_PHASES: PhaseConfig[] = [
  {
    phase_id: 'WELCOME',
    phase_name: 'Sambut Ananda',
    start_time: '06:45',
    end_time: '07:30',
    is_active: true,
    quick_action_id: 'act_take_attendance'
  },
  {
    phase_id: 'CENTRA',
    phase_name: 'Main Sentra',
    start_time: '07:30',
    end_time: '10:30',
    is_active: true,
    quick_action_id: 'act_record_moment'
  },
  {
    phase_id: 'LUNCH',
    phase_name: 'Makan Bekal',
    start_time: '10:30',
    end_time: '11:15',
    is_active: true,
    quick_action_id: 'act_record_moment'
  },
  {
    phase_id: 'SYNTHESIS',
    phase_name: 'Sintesis & Refleksi',
    start_time: '11:15',
    end_time: '12:00',
    is_active: true,
    quick_action_id: 'act_review_lppa'
  },
  {
    phase_id: 'HANDOVER',
    phase_name: 'Serah Terima Ananda',
    start_time: '12:00',
    end_time: '12:45',
    is_active: true,
    quick_action_id: 'act_send_message'
  },
  {
    phase_id: 'CLOSING',
    phase_name: 'Tutup Hari',
    start_time: '12:45',
    end_time: '14:30',
    is_active: true,
    quick_action_id: 'act_close_day'
  }
];

export const CANONICAL_DEFAULT_RHYTHM: SchoolRhythmConfig = {
  config_id: 'canonical_default_config',
  school_id: 'sch_tk_yapendik_01',
  academic_year_id: 'ay_2026_2027',
  school_timezone: 'WIB',
  rhythm_vocabulary_version: 'v1',
  school_opening_time: '06:45',
  school_closing_time: '14:30',
  phases: CANONICAL_DEFAULT_PHASES,
  updated_by_person_id: 'per_headmaster_esther',
  updated_at: new Date().toISOString()
};

export class BriefingEngineService {
  private localRhythmStore: Map<string, SchoolRhythmConfig> = new Map();

  constructor() {
    this.localRhythmStore.set(CANONICAL_DEFAULT_RHYTHM.school_id, { ...CANONICAL_DEFAULT_RHYTHM });
  }

  /**
   * Mengambil konfigurasi ritme sekolah (dengan fail-safe default v1, T-4).
   */
  public async getSchoolRhythmConfig(schoolId: string): Promise<SchoolRhythmConfig> {
    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('school_rhythm_configs')
        .select('*')
        .eq('school_id', schoolId)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        return this.localRhythmStore.get(schoolId) || {
          ...CANONICAL_DEFAULT_RHYTHM,
          school_id: schoolId
        };
      }

      return {
        config_id: data.config_id,
        school_id: data.school_id,
        academic_year_id: data.academic_year_id,
        school_timezone: data.school_timezone,
        rhythm_vocabulary_version: data.rhythm_vocabulary_version || 'v1',
        school_opening_time: data.school_opening_time || '06:45',
        school_closing_time: data.school_closing_time || '14:30',
        phases: Array.isArray(data.phases) ? data.phases : CANONICAL_DEFAULT_PHASES,
        updated_by_person_id: data.updated_by_person_id,
        updated_at: data.updated_at
      };
    } catch {
      return this.localRhythmStore.get(schoolId) || {
        ...CANONICAL_DEFAULT_RHYTHM,
        school_id: schoolId
      };
    }
  }

  /**
   * Mengambil paket data briefing terkomposisi untuk peran pengguna aktif.
   */
  public async getBriefingDataForUser(
    role: UserRole,
    schoolId: string,
    userId?: string
  ): Promise<BriefingData> {
    const config = await this.getSchoolRhythmConfig(schoolId);
    const now = new Date();
    const mode = evaluateBriefingMode(now, config);
    const { localTimeString } = resolveSchoolLocalTime(now, config.school_timezone);

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('rpc_get_briefing_data', {
        p_role: role,
        p_school_id: schoolId
      });

      if (!error && data) {
        this.assertNonSurveillance(data);
        return data as BriefingData;
      }
    } catch (err: any) {
      if (err?.message?.includes('SURVEILLANCE_METRIC_REJECTED')) {
        throw err;
      }
      // Fallback to local composer on network/offline
    }

    // Local Composer Fallback
    return this.composeLocalBriefing(role, schoolId, mode, localTimeString, config, userId);
  }

  /**
   * Memperbarui pasangan fase-ke-aksi (FB-08 KS Only).
   */
  public async updatePhaseActionMapping(
    schoolId: string,
    phaseId: string,
    actionId: string,
    callerContext?: { role: string; schoolId: string; personId: string }
  ): Promise<{ success: boolean; phase_id: string; action_id: string }> {
    // Validasi Otoritas FB-08
    if (callerContext) {
      if (callerContext.role !== 'HEADMASTER') {
        throw new Error(`FORBIDDEN_RHYTHM_MUTATION: Hanya Kepala Sekolah yang berhak mengubah konfigurasi ritme.`);
      }
      if (callerContext.schoolId !== schoolId) {
        throw new Error(`FORBIDDEN_RHYTHM_MUTATION: Kepala Sekolah tidak berhak mengubah ritme unit lain.`);
      }
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('rpc_update_phase_action_mapping', {
        p_school_id: schoolId,
        p_phase_id: phaseId,
        p_action_id: actionId
      });

      if (error) {
        if (error.message.includes('FORBIDDEN_RHYTHM_MUTATION')) {
          throw new Error('FORBIDDEN_RHYTHM_MUTATION: Mutasi ritme ditolak oleh kebijakan keamanan.');
        }
      }
    } catch (err: any) {
      if (err.message.includes('FORBIDDEN_RHYTHM_MUTATION')) {
        throw err;
      }
    }

    // Update Local Store
    const current = await this.getSchoolRhythmConfig(schoolId);
    const updatedPhases = current.phases.map(p =>
      p.phase_id === phaseId ? { ...p, quick_action_id: actionId } : p
    );
    const updatedConfig: SchoolRhythmConfig = {
      ...current,
      phases: updatedPhases,
      updated_at: new Date().toISOString()
    };
    this.localRhythmStore.set(schoolId, updatedConfig);

    return {
      success: true,
      phase_id: phaseId,
      action_id: actionId
    };
  }

  /**
   * Menjalankan ritual Tutup Hari (T-3 Teacher Private).
   */
  public async triggerClosureRitual(
    closureState: ClosureState,
    pendingCount: number,
    safetyAlertsCount: number,
    reflection?: string,
    callerContext?: { role: string; personId: string }
  ): Promise<{ success: boolean; event_id: string; closure_state: ClosureState }> {
    // Validasi Keselamatan Mutlak
    if (safetyAlertsCount > 0) {
      throw new Error(`CLOSURE_BLOCKED_BY_SAFETY: Penutup hari tidak dapat dijalankan saat ada alert keselamatan aktif.`);
    }

    if (callerContext && callerContext.role !== 'TEACHER' && callerContext.role !== 'STAFF') {
      throw new Error(`UNAUTHORIZED: Ritual penutup hari adalah hak eksklusif pendidik.`);
    }

    try {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase.rpc('rpc_trigger_closure_ritual', {
        p_closure_state: closureState,
        p_pending: pendingCount,
        p_safety: safetyAlertsCount,
        p_reflection: reflection || null
      });

      if (error) {
        if (error.message.includes('CLOSURE_BLOCKED_BY_SAFETY')) {
          throw new Error('CLOSURE_BLOCKED_BY_SAFETY: Penutup hari diblokir oleh alert keselamatan aktif.');
        }
      }
    } catch (err: any) {
      if (err.message.includes('CLOSURE_BLOCKED_BY_SAFETY') || err.message.includes('UNAUTHORIZED')) {
        throw err;
      }
    }

    return {
      success: true,
      event_id: `evt_closure_${Date.now()}`,
      closure_state: closureState
    };
  }

  // ============================================================================
  // INTERNAL COMPOSER & SANITIZERS
  // ============================================================================

  private composeLocalBriefing(
    role: UserRole,
    schoolId: string,
    mode: BriefingMode,
    localTimeString: string,
    config: SchoolRhythmConfig,
    userId?: string
  ): BriefingData {
    const activePhase = findActivePhase(localTimeString, config.phases);
    const dateFormatted = new Date().toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    if (role === 'TEACHER') {
      const person = userId ? db.getPersonById(userId) : null;
      const isDiana = Boolean(
        userId && (
          userId === 'user_teacher_diana_tk2' ||
          userId === 'per_teacher_diana' ||
          userId.toLowerCase().includes('diana')
        )
      );
      const isSiti = Boolean(
        userId && (
          userId === 'user_teacher_siti' ||
          userId === 'per_teacher_siti' ||
          userId.toLowerCase().includes('siti')
        )
      );
      let teacherSalutation = 'Bu Erna';
      if (isDiana) {
        teacherSalutation = 'Bu Diana';
      } else if (isSiti) {
        teacherSalutation = 'Bu Siti';
      } else if (person?.preferredName) {
        teacherSalutation = person.preferredName;
      } else if (person?.fullName) {
        teacherSalutation = 'Bu ' + person.fullName.split(' ')[0];
      }

      const teacherData: TeacherBriefingData = {
        role: 'TEACHER',
        mode,
        greeting: mode === 'PENUTUP' ? `Hari ini selesai, ${teacherSalutation}.` : `Selamat pagi, ${teacherSalutation}`,
        date_formatted: dateFormatted,
        school_local_time: localTimeString,
        active_phase: activePhase,
        quick_action: activePhase?.quick_action_id
          ? {
              action_id: activePhase.quick_action_id,
              action_name: 'Rekam Momen Sentra',
              action_type: 'MODAL',
              target_component: 'RecordMomentModal',
              is_default: true
            }
          : undefined,
        pending_tasks: {
          attendance_incomplete: false,
          active_allergies: 0,
          unread_messages: 1,
          draft_observations: 2,
          oldest_draft_title: 'Observasi Sentra Balok'
        },
        closure_summary: {
          present_children: 15,
          total_children: 15,
          moments_recorded: 3,
          messages_replied: 2,
          pending_drafts_count: 2,
          closure_state: 'SISA_TENANG'
        },
        warm_echo: {
          source_type: 'PARENT_MESSAGE',
          source_author: (isDiana || isSiti) ? 'Bunda Kenzo' : 'Mama Millen',
          quote_text: (isDiana || isSiti) 
            ? 'Terima kasih Bu Guru, Kenzo sangat ceria bercerita tentang balok hari ini.'
            : 'Terima kasih Bu Guru, Millen sangat ceria dan antusias bercerita tentang sentra bermain hari ini.',
          timestamp: '11:45'
        }
      };
      this.assertNonSurveillance(teacherData);
      return teacherData;
    }

    if (role === 'HEADMASTER') {
      const person = userId ? db.getPersonById(userId) : null;
      const isEsther = Boolean(
        userId && (
          userId === 'user_headmaster_esther' ||
          userId === 'per_headmaster_esther' ||
          userId.toLowerCase().includes('esther')
        )
      );
      let ksSalutation = 'Ibu Sheryl';
      if (isEsther) {
        ksSalutation = 'Ibu Esther';
      } else if (person?.preferredName) {
        ksSalutation = person.preferredName;
      } else if (person?.fullName) {
        ksSalutation = 'Ibu ' + person.fullName.split(' ')[0];
      }

      const ksData: HeadmasterBriefingData = {
        role: 'HEADMASTER',
        mode,
        greeting: mode === 'PENUTUP' ? `Hari ini selesai, ${ksSalutation}.` : `Selamat pagi, ${ksSalutation}`,
        date_formatted: dateFormatted,
        school_local_time: localTimeString,
        reconciliation: {
          classes_complete: 2,
          classes_total: 2,
          safety_alerts: 0
        },
        authority_queue: {
          pending_lppa_approvals: 2,
          pending_adoptions: 1,
          oldest_pending_age_days: 1
        },
        partnership_pulse: {
          unread_messages: 0,
          pending_confirmations: 0
        },
        closure_summary: {
          lppa_approved_today: 2,
          directives_responded_today: 1,
          safety_status_green: true
        },
        warm_echo: {
          source_type: 'TEACHER_REFLECTION',
          source_author: isEsther ? 'Bu Siti Nurhaliza' : 'Bu Erna Boykela',
          quote_text: 'Sentra bermain peran berjalan sangat kondusif, anak-anak saling berbagi peran.',
          timestamp: '12:15'
        }
      };
      this.assertNonSurveillance(ksData);
      return ksData;
    }

    if (role === 'FOUNDATION') {
      const person = userId ? db.getPersonById(userId) : null;
      const isAndreas = Boolean(
        userId && (
          userId === 'user_superadmin_yapendik' ||
          userId === 'per_superadmin_andreas' ||
          userId.toLowerCase().includes('andreas')
        )
      );
      let foundationSalutation = 'Ibu Shirley';
      if (isAndreas) {
        foundationSalutation = 'Pak Andreas';
      } else if (person?.preferredName) {
        foundationSalutation = person.preferredName;
      } else if (person?.fullName) {
        foundationSalutation = 'Ibu ' + person.fullName.split(' ')[0];
      }

      const foundationData: FoundationBriefingData = {
        role: 'FOUNDATION',
        mode,
        greeting: mode === 'PENUTUP' ? `Siklus minggu ini selesai, ${foundationSalutation}.` : `Selamat pagi, ${foundationSalutation}`,
        date_formatted: dateFormatted,
        school_local_time: localTimeString,
        cycle_view: 'WEEKLY_REVIEW',
        decision_queue: {
          insights_awaiting_decision: 2,
          oldest_insight_age_days: 3
        },
        loop_health: {
          actions_awaiting_adoption: 1,
          outcomes_not_recorded: 0
        },
        equity_signals: {
          new_patterns_detected: 1,
          suppressed_cohorts: 1
        },
        warm_echo: {
          source_type: 'HEADMASTER_NOTE',
          source_author: isAndreas ? 'Kepala Sekolah TK Menteng' : 'Kepala Sekolah TK Maranatha',
          quote_text: 'Bantuan material loose-parts telah aktif digunakan dalam 4 siklus bermain.',
          timestamp: 'Kemarin'
        }
      };
      this.assertNonSurveillance(foundationData);
      return foundationData;
    }

    // Guardian
    const person = userId ? db.getPersonById(userId) : null;
    const rels = userId ? db.getGuardianRelationships().filter(r => r.guardianPersonId === userId) : [];
    let childPerson = rels.length > 0 ? db.getPersonById(rels[0].studentPersonId) : null;

    if (!childPerson && userId) {
      const stu = db.getStudentById(userId) || db.getStudents().find(s => s.personId === userId);
      if (stu) {
        childPerson = db.getPersonById(stu.personId);
      }
    }

    const isBudi = Boolean(
      userId && (
        userId === 'user_parent_budi' || 
        userId === 'per_parent_budi' || 
        userId.toLowerCase().includes('budi') ||
        childPerson?.preferredName?.toLowerCase().includes('kenzo')
      )
    );

    const isKayla = Boolean(
      userId && (
        userId === 'user_guard_mutiara' || 
        userId === 'per_guard_mutiara_zega' || 
        userId.toLowerCase().includes('mutiara') ||
        userId.toLowerCase().includes('kayla') ||
        childPerson?.preferredName?.toLowerCase().includes('kayla')
      )
    );

    const childName = childPerson?.preferredName || (isKayla ? 'Kayla' : (isBudi ? 'Kenzo' : 'Millen'));
    let salutation = person?.preferredName || (isKayla ? 'Ibu Mutiara' : (isBudi ? 'Ayah Kenzo' : 'Ibu Julen'));
    if (!salutation && person?.fullName) {
      salutation = (person.gender === 'MALE' ? 'Pak ' : 'Ibu ') + person.fullName.split(' ')[0];
    }

    const guardianData: GuardianBriefingData = {
      role: 'GUARDIAN',
      mode,
      greeting: mode === 'PENUTUP' ? `Hari ini selesai, ${salutation}.` : `Selamat pagi, ${salutation}`,
      date_formatted: dateFormatted,
      school_local_time: localTimeString,
      child_name: childName,
      today_summary: {
        attendance_status: 'Hadir',
        meal_status: 'Makan siang habis',
        active_phase_name: activePhase?.phase_name || 'Main Sentra'
      },
      latest_moment: {
        moment_id: `mom_${childName.toLowerCase()}_01`,
        thumbnail_url: '/assets/moments/moment_sample.jpg',
        caption: isKayla 
          ? 'Bermain puzzle eksplorasi warna dan bentuk bersama teman di Kelompok B.'
          : (isBudi 
            ? 'Bermain balok membangun menara bersama teman di Kelompok A.'
            : `Bermain dan belajar dengan antusias bersama teman di TK Maranatha.`),
        captured_at: '09:30'
      },
      teacher_note: `${childName} sangat ceria, tekun, dan aktif berinteraksi bersama teman dan guru hari ini.`,
      lppa_published_available: true
    };
    this.assertNonSurveillance(guardianData);
    return guardianData;
  }

  /**
   * Memvalidasi bahwa tidak ada metrik pengawasan/komparatif dalam data briefing (H-07).
   */
  public assertNonSurveillance(data: any): void {
    if (!data || typeof data !== 'object') return;

    const forbiddenKeys = [
      'rank',
      'ranking',
      'teacher_ranking',
      'student_ranking',
      'percentile',
      'completion_percentile',
      'speed_metric',
      'leaderboard',
      'teacher_comparison'
    ];

    for (const key of Object.keys(data)) {
      if (forbiddenKeys.includes(key.toLowerCase())) {
        throw new Error(`SURVEILLANCE_METRIC_REJECTED: Dilarang menyisipkan metrik komparatif "${key}" ke dalam briefing.`);
      }
      if (typeof data[key] === 'object' && data[key] !== null) {
        this.assertNonSurveillance(data[key]);
      }
    }
  }
}

export const briefingEngine = new BriefingEngineService();
