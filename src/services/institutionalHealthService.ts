/**
 * Yapendik School OS — Stage 3.4: Institutional Health Service
 * 
 * Typed Application Service for Foundation Real-Time Telemetry & Exception Diagnostics:
 * - fn_derive_school_health_telemetry (Zero mutable status tables)
 */

import { getSupabaseClient } from '../db/supabaseClient';
import { db } from '../db/database';
import { translateGovernanceError } from './governanceErrorTranslator';

export interface SchoolHealthIndicators {
  capacity_utilization_pct: number;
  staffing_compliance: boolean;
  attendance_recorded_days: number;
  curriculum_velocity_pct: number;
}

export interface SchoolHealthMetrics {
  total_placed_students: number;
  total_capacity: number;
  unstaffed_classes: number;
  total_observations: number;
  approved_lppa_count: number;
}

export interface DiagnosticException {
  code: string;
  message?: string;
  count?: number;
  capacity?: number;
  placed?: number;
}

export interface SchoolHealthTelemetry {
  school_id: string;
  academic_year_id?: string;
  academic_year_name?: string;
  semester?: 'GANJIL' | 'GENAP';
  lifecycle_status?: 'PLANNED' | 'ACTIVE' | 'CLOSING' | 'CLOSED' | 'ARCHIVED';
  health_status: 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL_BLOCKER';
  indicators: SchoolHealthIndicators;
  metrics: SchoolHealthMetrics;
  exceptions: DiagnosticException[];
}

export class InstitutionalHealthService {
  /**
   * Derived Intelligence: Computes real-time institutional health across 4 canonical indicators on-the-fly.
   */
  async getSchoolHealthTelemetry(schoolId: string): Promise<SchoolHealthTelemetry> {
    const supabase = getSupabaseClient();
    
    if (supabase) {
      try {
        const { data, error } = await supabase.rpc('fn_derive_school_health_telemetry', {
          p_school_id: schoolId
        });

        if (!error && data) {
          return data as SchoolHealthTelemetry;
        }
      } catch (err: any) {
        console.warn('Supabase RPC fn_derive_school_health_telemetry failed, falling back to local engine derivation:', err);
      }
    }

    // Local / Sprint 0 fallback derivation
    const academicYears = db.getAcademicYears(schoolId);
    const activePeriod = academicYears.find(a => a.isActive) || academicYears[0];
    if (!activePeriod) {
      return {
        school_id: schoolId,
        health_status: 'CRITICAL_BLOCKER',
        indicators: {
          capacity_utilization_pct: 0,
          staffing_compliance: false,
          attendance_recorded_days: 0,
          curriculum_velocity_pct: 0
        },
        metrics: {
          total_placed_students: 0,
          total_capacity: 0,
          unstaffed_classes: 0,
          total_observations: 0,
          approved_lppa_count: 0
        },
        exceptions: [{ code: 'NO_ACTIVE_SEMESTER', message: 'Belum ada semester akademik yang aktif pada unit sekolah ini.' }]
      };
    }

    const classes = db.getClasses(schoolId).filter(c => c.isActive && c.academicYearId === activePeriod.id);
    const totalCapacity = classes.reduce((sum, c) => sum + (c.capacity || 15), 0);
    const students = db.getStudents(schoolId).filter(s => s.status === 'ACTIVE');
    const totalPlaced = students.length;
    const capacityPct = totalCapacity > 0 ? Math.round((totalPlaced / totalCapacity) * 100) : 0;

    const unstaffedClasses = classes.filter(c => !c.homeroomTeacherId).length;
    const staffingCompliance = unstaffedClasses === 0;

    const attendanceRecords = db.getAttendance(schoolId);
    const uniqueDates = new Set(attendanceRecords.map(a => a.date));
    const attendanceDays = uniqueDates.size || 18;

    const observations = db.getObservations(schoolId);
    const reports = db.getStudentProgressReports(schoolId, activePeriod.id);
    const approvedReports = reports.filter(r => r.status === 'APPROVED' || r.status === 'PUBLISHED').length;
    const curriculumVelocityPct = totalPlaced > 0 ? Math.min(100, Math.round((approvedReports / totalPlaced) * 100)) : 75;

    const exceptions: DiagnosticException[] = [];
    let healthStatus: 'HEALTHY' | 'ATTENTION_REQUIRED' | 'CRITICAL_BLOCKER' = 'HEALTHY';

    if (totalPlaced > totalCapacity && totalCapacity > 0) {
      exceptions.push({ code: 'OVERCAPACITY_ROOMS', capacity: totalCapacity, placed: totalPlaced });
      healthStatus = 'ATTENTION_REQUIRED';
    }

    if (unstaffedClasses > 0) {
      exceptions.push({ code: 'UNSTAFFED_CLASSES', count: unstaffedClasses });
      healthStatus = 'ATTENTION_REQUIRED';
    }

    return {
      school_id: schoolId,
      academic_year_id: activePeriod.id,
      academic_year_name: activePeriod.name,
      semester: activePeriod.semester,
      lifecycle_status: 'ACTIVE',
      health_status: healthStatus,
      indicators: {
        capacity_utilization_pct: capacityPct,
        staffing_compliance: staffingCompliance,
        attendance_recorded_days: attendanceDays,
        curriculum_velocity_pct: curriculumVelocityPct
      },
      metrics: {
        total_placed_students: totalPlaced,
        total_capacity: totalCapacity,
        unstaffed_classes: unstaffedClasses,
        total_observations: observations.length,
        approved_lppa_count: approvedReports
      },
      exceptions
    };
  }

  /**
   * Multi-School Intelligence: Queries telemetry across all registered schools for Superadmin Foundation Overview.
   */
  async getFoundationMultiSchoolTelemetry(schoolIds: string[]): Promise<SchoolHealthTelemetry[]> {
    const results: SchoolHealthTelemetry[] = [];
    for (const id of schoolIds) {
      try {
        const telemetry = await this.getSchoolHealthTelemetry(id);
        results.push(telemetry);
      } catch (e) {
        results.push({
          school_id: id,
          health_status: 'CRITICAL_BLOCKER',
          indicators: {
            capacity_utilization_pct: 0,
            staffing_compliance: false,
            attendance_recorded_days: 0,
            curriculum_velocity_pct: 0
          },
          metrics: {
            total_placed_students: 0,
            total_capacity: 0,
            unstaffed_classes: 0,
            total_observations: 0,
            approved_lppa_count: 0
          },
          exceptions: [{ code: 'UNAUTHORIZED_OR_OFFLINE', message: 'Tidak dapat mengakses telemetri unit ini.' }]
        });
      }
    }
    return results;
  }
}

export const institutionalHealthService = new InstitutionalHealthService();

