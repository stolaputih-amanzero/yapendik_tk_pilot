/**
 * Yapendik School OS — Stage 3.4: Cohort Lineage Service
 * 
 * Typed Application Service for Governed Student Lineage Transitions:
 * - rpc_promote_classroom_cohort (Atomic multi-student classroom progression)
 * - rpc_graduate_student_cohort (Terminal cohort completion & graduation)
 */

import { getSupabaseClient } from '../db/supabaseClient';
import { translateGovernanceError } from './governanceErrorTranslator';

export interface PromoteCohortPayload {
  schoolId: string;
  sourceClassId: string;
  targetClassId: string;
  targetAcademicYearId: string;
  studentIds: string[];
}

export interface PromoteCohortResult {
  success: boolean;
  promoted_count: number;
  target_class_id: string;
}

export interface GraduateCohortPayload {
  schoolId: string;
  classId: string;
  studentIds: string[];
}

export interface GraduateCohortResult {
  success: boolean;
  graduated_count: number;
}

export class CohortLineageService {
  /**
   * Governed Command: Promotes a classroom cohort atomically to a target classroom and academic period.
   */
  async promoteCohort(payload: PromoteCohortPayload): Promise<PromoteCohortResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured or connected.');
    }

    try {
      const { data, error } = await supabase.rpc('rpc_promote_classroom_cohort', {
        p_school_id: payload.schoolId,
        p_source_class_id: payload.sourceClassId,
        p_target_class_id: payload.targetClassId,
        p_target_academic_year_id: payload.targetAcademicYearId,
        p_student_ids: payload.studentIds
      });

      if (error) {
        throw error;
      }

      return data as PromoteCohortResult;
    } catch (err: any) {
      const translated = translateGovernanceError(err);
      const customError = new Error(translated.message);
      (customError as any).diagnostics = translated;
      throw customError;
    }
  }

  /**
   * Governed Command: Terminalizes active student placements as COMPLETED and sets institutional status to GRADUATED.
   */
  async graduateCohort(payload: GraduateCohortPayload): Promise<GraduateCohortResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured or connected.');
    }

    try {
      const { data, error } = await supabase.rpc('rpc_graduate_student_cohort', {
        p_school_id: payload.schoolId,
        p_class_id: payload.classId,
        p_student_ids: payload.studentIds
      });

      if (error) {
        throw error;
      }

      return data as GraduateCohortResult;
    } catch (err: any) {
      const translated = translateGovernanceError(err);
      const customError = new Error(translated.message);
      (customError as any).diagnostics = translated;
      throw customError;
    }
  }

  /**
   * Query: Retrieves active placed students for a specific classroom.
   */
  async getClassActiveStudents(classId: string): Promise<Array<{
    student_id: string;
    person_id: string;
    full_name: string;
    gender: string;
    nis: string;
    placement_id: string;
    entry_date: string;
  }>> {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const { data, error } = await supabase
      .from('student_placement_records')
      .select(`
        id,
        student_id,
        entry_date,
        students!inner (
          id,
          person_id,
          nis,
          status,
          persons!inner (
            id,
            full_name,
            gender
          )
        )
      `)
      .eq('class_id', classId)
      .eq('placement_status', 'ACTIVE');

    if (error || !data) return [];

    return data.map((row: any) => ({
      placement_id: row.id,
      student_id: row.student_id,
      person_id: row.students.person_id,
      full_name: row.students.persons?.full_name || 'Nama Siswa',
      gender: row.students.persons?.gender || 'UNKNOWN',
      nis: row.students.nis || '',
      entry_date: row.entry_date
    }));
  }

  /**
   * Query: Retrieves classroom capacity and current occupancy count.
   */
  async getClassCapacitySummary(classId: string, academicYearId: string): Promise<{
    capacity: number;
    placed_count: number;
    available_seats: number;
  }> {
    const supabase = getSupabaseClient();
    if (!supabase) return { capacity: 15, placed_count: 0, available_seats: 15 };

    const { data: cls } = await supabase
      .from('classes')
      .select('capacity')
      .eq('id', classId)
      .single();

    const capacity = cls?.capacity || 15;

    const { count } = await supabase
      .from('student_placement_records')
      .select('*', { count: 'exact', head: true })
      .eq('class_id', classId)
      .eq('academic_year_id', academicYearId)
      .eq('placement_status', 'ACTIVE');

    const placed_count = count || 0;
    const available_seats = Math.max(0, capacity - placed_count);

    return {
      capacity,
      placed_count,
      available_seats
    };
  }
}

export const cohortLineageService = new CohortLineageService();

