/**
 * Yapendik School OS — Stage 3.4: Academic Lifecycle Service
 * 
 * Typed Application Service for Governed Academic Term Lifecycles:
 * - rpc_close_academic_semester (100% LPPA reconciliation & immutable freeze)
 * - rpc_initialize_next_semester (Governed successor term initialization & activation)
 */

import { getSupabaseClient } from '../db/supabaseClient';
import { translateGovernanceError } from './governanceErrorTranslator';

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

export interface InitializeSemesterResult {
  success: boolean;
  academic_year_id: string;
  status: 'ACTIVE';
}

export class AcademicLifecycleService {
  /**
   * Governed Command: Closes an active academic semester after verifying 100% LPPA completion.
   */
  async closeSemester(schoolId: string, academicYearId: string): Promise<CloseSemesterResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured or connected.');
    }

    try {
      const { data, error } = await supabase.rpc('rpc_close_academic_semester', {
        p_school_id: schoolId,
        p_academic_year_id: academicYearId
      });

      if (error) {
        throw error;
      }

      return data as CloseSemesterResult;
    } catch (err: any) {
      const translated = translateGovernanceError(err);
      const customError = new Error(translated.message);
      (customError as any).diagnostics = translated;
      throw customError;
    }
  }

  /**
   * Governed Command: Initializes and activates the successor academic period.
   */
  async initializeNextSemester(payload: InitializeSemesterPayload): Promise<InitializeSemesterResult> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      throw new Error('Supabase client is not configured or connected.');
    }

    try {
      const { data, error } = await supabase.rpc('rpc_initialize_next_semester', {
        p_school_id: payload.schoolId,
        p_name: payload.name,
        p_semester: payload.semester,
        p_start_date: payload.startDate,
        p_end_date: payload.endDate
      });

      if (error) {
        throw error;
      }

      return data as InitializeSemesterResult;
    } catch (err: any) {
      const translated = translateGovernanceError(err);
      const customError = new Error(translated.message);
      (customError as any).diagnostics = translated;
      throw customError;
    }
  }

  /**
   * Query: Retrieves LPPA reconciliation readiness metrics prior to closing a term.
   */
  async getSemesterReconciliationStatus(schoolId: string, academicYearId: string): Promise<{
    enrolled_count: number;
    approved_lppa_count: number;
    draft_lppa_count: number;
    is_ready_for_closure: boolean;
  }> {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return {
        enrolled_count: 0,
        approved_lppa_count: 0,
        draft_lppa_count: 0,
        is_ready_for_closure: false
      };
    }

    // Query active placements in this semester
    const { data: placements } = await supabase
      .from('student_placement_records')
      .select('student_id')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId)
      .eq('placement_status', 'ACTIVE');

    const enrolled_count = placements ? placements.length : 0;

    // Query progress reports
    const { data: reports } = await supabase
      .from('student_progress_reports')
      .select('student_id, status')
      .eq('school_id', schoolId)
      .eq('academic_year_id', academicYearId);

    const approved_lppa_count = (reports || []).filter(r => r.status === 'APPROVED' || r.status === 'PUBLISHED').length;
    const draft_lppa_count = (reports || []).filter(r => r.status !== 'APPROVED' && r.status !== 'PUBLISHED').length;

    const is_ready_for_closure = enrolled_count > 0 && approved_lppa_count >= enrolled_count && draft_lppa_count === 0;

    return {
      enrolled_count,
      approved_lppa_count,
      draft_lppa_count,
      is_ready_for_closure
    };
  }
}

export const academicLifecycleService = new AcademicLifecycleService();
