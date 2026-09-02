/**
 * Yapendik School OS — Stage 4.1 Teacher Daily Work Command Handler & Application Service
 * Enforces:
 * - Stage 3 Closed Period Protection (CANNOT_MUTATE_CLOSED_SEMESTER)
 * - Stage 4 C-11 Mutual Exclusivity Guard (is_staff_confidential vs is_shared_with_guardian)
 * - Client-Side Deterministic UUID v4 for Offline Observation Capture
 * - Transparent Local Queue Enqueueing when Offline
 */

import { db } from '../db/database';
import { getSupabaseClient } from '../db/supabaseClient';
import { offlineSyncQueueService } from './offlineSyncQueueService';
import {
  RecordDailyAttendanceBatchCommand,
  CaptureQuickObservationCommand,
  EnrichObservationNarrativeCommand,
  AcknowledgeGuardianNoticeCommand
} from '../types/teacherDailyTypes';
import { DailyAttendanceEntry, ObservationRecord, DevelopmentDomain, MilestoneRating } from '../domain/types';

export class TeacherDailyWorkService {
  constructor() {
    // Register auto-drain replay handler
    if (typeof window !== 'undefined') {
      offlineSyncQueueService.autoDrainQueue(async (item) => {
        switch (item.command_type) {
          case 'RECORD_ATTENDANCE':
            await this.recordDailyAttendanceBatch(item.payload as RecordDailyAttendanceBatchCommand, true);
            return true;
          case 'CAPTURE_OBSERVATION':
            await this.captureQuickObservation(item.payload as CaptureQuickObservationCommand, true);
            return true;
          case 'ENRICH_OBSERVATION':
            await this.enrichObservationNarrative(item.payload as EnrichObservationNarrativeCommand, true);
            return true;
          case 'ACK_NOTICE':
            await this.acknowledgeGuardianNotice(item.payload as AcknowledgeGuardianNoticeCommand, true);
            return true;
          default:
            return false;
        }
      });
    }
  }

  /**
   * Validates whether the target school and semester are open for mutation
   */
  private validateSemesterOpen(schoolId: string) {
    const academicYears = db.getAcademicYears(schoolId);
    const activeAy = academicYears.find(ay => ay.isActive);
    if (!activeAy) {
      throw new Error('CANNOT_MUTATE_CLOSED_SEMESTER: Tidak ada tahun ajaran/semester aktif untuk sekolah ini.');
    }
  }

  /**
   * Command 1: Record Daily Attendance in Batch (Idempotent Deterministic Save)
   */
  public async recordDailyAttendanceBatch(
    command: RecordDailyAttendanceBatchCommand,
    isReplay = false
  ): Promise<{ success: boolean; recorded_count: number }> {
    this.validateSemesterOpen(command.school_id);

    if (typeof navigator !== 'undefined' && !navigator.onLine && !isReplay) {
      offlineSyncQueueService.enqueue('RECORD_ATTENDANCE', command);
    }

    const domainEntries: Omit<DailyAttendanceEntry, 'id' | 'recordedAt'>[] = command.entries.map(e => ({
      schoolId: command.school_id,
      classId: command.class_id,
      studentId: e.student_id,
      date: command.attendance_date,
      status: e.status,
      notes: e.notes,
      recordedByPersonId: command.recorded_by_person_id,
      temperatureCelsius: e.temperature_celsius,
      arrivalMood: e.arrival_mood
    }));

    db.saveAttendanceBatch(
      domainEntries,
      command.recorded_by_name,
      command.recorded_by_person_id,
      command.role
    );

    return { success: true, recorded_count: command.entries.length };
  }

  /**
   * Command 2: Capture Quick Observation in Real-Time (< 15 seconds)
   * Multi-Student Atomic Batch Ingestion compliant with FB-01 & Stage 4.5 Frozen State
   */
  public async captureQuickObservation(
    command: CaptureQuickObservationCommand,
    isReplay = false
  ): Promise<{ success: boolean; observation_id: string; recorded_count: number }> {
    this.validateSemesterOpen(command.school_id);

    if (!command.target_student_ids || command.target_student_ids.length === 0) {
      throw new Error('VALIDATION_FAILED: Minimal 1 ananda harus dipilih untuk rekam observasi.');
    }

    // Single shared capture ID for the group activity moment
    const captureId = command.id || `cap_${offlineSyncQueueService.generateUUID()}`;

    // Privacy-Preserving Offline Queue (Safe Option B: No plain-text image persisted to storage)
    if (typeof navigator !== 'undefined' && !navigator.onLine && !isReplay) {
      offlineSyncQueueService.enqueue('CAPTURE_OBSERVATION', { 
        ...command, 
        media_url: undefined, // Strip plain-text image data from persistent offline store
        id: captureId 
      });
    }

    const domain: DevelopmentDomain = command.domain || 'KOGNITIF';
    const milestone: MilestoneRating = command.milestone_rating || 'BSH';
    const nowIso = new Date().toISOString();

    // Create 1 deterministic ObservationRecord per selected child
    const batchRecords: ObservationRecord[] = command.target_student_ids.map(studentId => ({
      id: `obs_${captureId}_${studentId}`,
      schoolId: command.school_id,
      classId: command.class_id,
      studentId,
      observerPersonId: command.recorded_by_person_id,
      observedAt: nowIso,
      domain,
      anecdoteDescription: command.initial_note || 'Momen cepat bermain di sentra.',
      milestoneRating: milestone,
      indicatorsObserved: command.quick_tags || [],
      photoEvidenceUrl: command.media_url,
      isConfidentialToStaff: true, // Default safe draft
      sharedWithGuardian: false,
      createdAt: nowIso
    }));

    // Atomically save batch to database engine
    db.saveObservationBatch(
      batchRecords,
      command.recorded_by_name,
      command.recorded_by_person_id,
      command.role
    );

    return { 
      success: true, 
      observation_id: batchRecords[0].id,
      recorded_count: batchRecords.length 
    };
  }

  /**
   * Command 3: Enrich Pedagogical Narrative & LPPA Curation (Phase 8 Synthesis)
   */
  public async enrichObservationNarrative(
    command: EnrichObservationNarrativeCommand,
    isReplay = false
  ): Promise<{ success: boolean }> {
    this.validateSemesterOpen(command.school_id);

    // Invariant C-11 Guard: Mutual Exclusivity between Confidential and Parent Sharing
    if (command.is_staff_confidential && command.is_shared_with_guardian) {
      throw new Error('VALIDATION_FAILED: Staff confidential items cannot be shared with guardians.');
    }

    if (typeof navigator !== 'undefined' && !navigator.onLine && !isReplay) {
      offlineSyncQueueService.enqueue('ENRICH_OBSERVATION', command);
    }

    const obsList = db.getObservations(command.school_id);
    const existing = obsList.find(o => o.id === command.observation_id);

    if (!existing) {
      throw new Error(`OBSERVATION_NOT_FOUND: Observasi '${command.observation_id}' tidak ditemukan.`);
    }

    const updated: ObservationRecord = {
      ...existing,
      anecdoteDescription: command.pedagogical_narrative,
      domain: command.domain,
      milestoneRating: command.milestone_rating,
      indicatorsObserved: command.indicators_observed,
      isConfidentialToStaff: command.is_staff_confidential,
      sharedWithGuardian: command.is_shared_with_guardian
    };

    // Update in database engine
    db.updateObservation(updated);

    // Sync to Supabase Cloud if connected
    const supabase = getSupabaseClient();
    if (supabase) {
      supabase.from('observation_records')
        .update({
          anecdote_description: updated.anecdoteDescription,
          domain: updated.domain,
          milestone_rating: updated.milestoneRating,
          indicators_observed: updated.indicatorsObserved,
          is_confidential_to_staff: updated.isConfidentialToStaff,
          shared_with_guardian: updated.sharedWithGuardian
        })
        .eq('id', updated.id)
        .then(({ error }) => {
          if (error) console.error('Supabase error enriching observation:', error);
        });
    }

    db.recordAudit({
      schoolId: command.school_id,
      userId: command.enriched_by_person_id,
      personName: command.enriched_by_name,
      role: command.role as any,
      action: 'ENRICH_OBSERVATION',
      resource: 'STUDENT_OBSERVATION',
      resourceId: updated.id,
      details: `Memperkaya narasi pedagogis observasi (LPPA Eviden: ${command.is_lppa_evidence ? 'YA' : 'TIDAK'}, Ortu: ${command.is_shared_with_guardian ? 'DIBAGIKAN' : 'PRIVAT'})`
    });

    return { success: true };
  }

  /**
   * Command 4: Acknowledge Guardian Notice
   */
  public async acknowledgeGuardianNotice(
    command: AcknowledgeGuardianNoticeCommand,
    isReplay = false
  ): Promise<{ success: boolean }> {
    if (typeof navigator !== 'undefined' && !navigator.onLine && !isReplay) {
      offlineSyncQueueService.enqueue('ACK_NOTICE', command);
    }

    db.acknowledgeNotice(
      command.notice_id,
      command.acknowledged_by_person_id,
      command.teacher_reply_text
    );

    return { success: true };
  }
}

export const teacherDailyWorkService = new TeacherDailyWorkService();
