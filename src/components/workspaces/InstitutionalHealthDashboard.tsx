/**
 * Yapendik School OS — Stage 3.4-D: Institutional Health Dashboard
 * 
 * Governed Real-Time Telemetry & Foundation Exception Monitor:
 * - Direct Pure Projection over fn_derive_school_health_telemetry()
 * - Zero mutable dashboard status tables
 * - 4 Canonical Indicators: Capacity, Staffing, Attendance, Curriculum Velocity
 * - Real-Time Diagnostic Exceptions Engine
 * - Foundation Multi-Unit Stewardship Grid (Superadmin)
 */

import React, { useState, useEffect } from 'react';
import { useSecurityContext } from '../../auth/context';
import { db } from '../../db/database';
import { 
  institutionalHealthService, 
  SchoolHealthTelemetry,
  SchoolHealthIndicators,
  SchoolHealthMetrics,
  DiagnosticException
} from '../../services/institutionalHealthService';
import { translateGovernanceError, TranslatedGovernanceError } from '../../services/governanceErrorTranslator';
import { 
  Activity, 
  ShieldCheck, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Building2, 
  Users, 
  UserCheck, 
  GraduationCap, 
  Calendar, 
  AlertCircle,
  TrendingUp,
  Award,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { ProgressBar, SelectSheet } from '../ui';

export const InstitutionalHealthDashboard: React.FC = () => {
  const { securityContext, activeSchoolId, setActiveSchoolId } = useSecurityContext();
  const isSuperadmin = securityContext?.role === 'YAPENDIK_SUPERADMIN';
  const currentSchoolId = securityContext?.activeSchoolId || 'sch_tk_yapendik_01';

  const [telemetry, setTelemetry] = useState<SchoolHealthTelemetry | null>(null);
  const [multiSchoolData, setMultiSchoolData] = useState<Array<{ schoolId: string; schoolName: string; telemetry: SchoolHealthTelemetry }>>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorFeedback, setErrorFeedback] = useState<TranslatedGovernanceError | null>(null);

  const schools = db.getSchools();
  const activeSchool = securityContext ? db.getSchoolById(currentSchoolId) : null;

  const loadTelemetry = async () => {
    setRefreshing(true);
    setErrorFeedback(null);
    try {
      // 1. Fetch single active school telemetry
      const tel = await institutionalHealthService.getSchoolHealthTelemetry(currentSchoolId);
      setTelemetry(tel);

      // 2. If Superadmin, fetch multi-school summary
      if (isSuperadmin && schools.length > 0) {
        const schoolIds = schools.map(s => s.id);
        const multi = await institutionalHealthService.getFoundationMultiSchoolTelemetry(schoolIds);
        const combined = schools.map((s, idx) => ({
          schoolId: s.id,
          schoolName: s.name,
          telemetry: multi[idx] || tel
        }));
        setMultiSchoolData(combined);
      }
    } catch (err: any) {
      const diag = (err as any).diagnostics || translateGovernanceError(err);
      setErrorFeedback(diag);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadTelemetry();
  }, [currentSchoolId, isSuperadmin]);  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return {
          label: 'Sistem Sehat (HEALTHY)',
          bg: 'bg-success-tint border-success-line text-success-deep',
          dot: 'bg-success',
          icon: CheckCircle2
        };
      case 'ATTENTION_REQUIRED':
        return {
          label: 'Perlu Perhatian (ATTENTION)',
          bg: 'bg-warning-tint border-warning-line text-warning-deep',
          dot: 'bg-warning',
          icon: AlertTriangle
        };
      case 'CRITICAL_BLOCKER':
      default:
        return {
          label: 'Kendala Kritis (CRITICAL)',
          bg: 'bg-danger-tint border-danger-line text-danger-deep',
          dot: 'bg-danger',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-ink-soft font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-ink-soft mb-3" />
        <p className="text-sm font-semibold text-ink">Mengkalkulasi Telemetri Kesehatan Lembaga secara Real-Time...</p>
        <p className="text-xs text-ink-soft mt-1">Mengambil data agregasi dan indikator kepatuhan unit</p>
      </div>
    );
  }

  const currentBadge = getStatusBadge(telemetry?.health_status);

  const indicators: SchoolHealthIndicators = telemetry?.indicators || {
    capacity_utilization_pct: 0,
    curriculum_velocity_pct: 0,
    attendance_recorded_days: 0,
    staffing_compliance: false
  };

  const metrics: SchoolHealthMetrics = telemetry?.metrics || {
    total_placed_students: 0,
    total_capacity: 0,
    unstaffed_classes: 0,
    total_observations: 0,
    approved_lppa_count: 0
  };

  const exceptions: DiagnosticException[] = telemetry?.exceptions || [];

  return (
    <div className="space-y-6 text-ink font-sans w-full" data-testid="institutional-health-dashboard">
      {/* Header Banner */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" />
              <span>Standar Yayasan • Telemetri &amp; Mutu</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Statistik &amp; Kesehatan Lembaga</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              {activeSchool?.name || 'TK Yapendik'}
              {telemetry?.academic_year_name ? ` • ${telemetry.academic_year_name} (${telemetry.semester})` : ''} • Monitoring kesehatan operasional multi-unit secara otomatis.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2 w-full medium:w-auto">
            {/* Superadmin Unit Switcher */}
            {isSuperadmin && schools.length > 1 && (
              <SelectSheet value={currentSchoolId}   options={schools.map(s => ({ value: s.id, label: s.name }))} />
            )}

            {/* Health Status Pill */}
            <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center justify-center space-x-2 ${currentBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${currentBadge.dot}`}></span>
              <span>{currentBadge.label}</span>
            </div>

            <button
              onClick={loadTelemetry}
              disabled={refreshing}
              className="px-3 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-hairline cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-ink-soft' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Feedback Banner */}
      {errorFeedback && (
        <div className="p-4 rounded-card border bg-danger-tint border-danger-line text-danger-deep flex items-start space-x-3 text-xs shadow-hairline">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-danger" />
          <div className="flex-1">
            <p className="font-semibold">{errorFeedback.title}</p>
            <p className="mt-0.5 text-ink-soft">{errorFeedback.message}</p>
            {errorFeedback.actionSuggestion && (
              <p className="mt-2 text-warning-deep font-medium bg-warning-tint p-2 rounded-field border border-warning-line">
                Saran Tindakan: {errorFeedback.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4 Canonical Indicators Grid */}
      <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-4 gap-5">
        {/* Indicator 1: Capacity Utilization */}
        <div className="bg-surface border border-line rounded-card p-4 shadow-hairline flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-ink-soft mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">1. Utilisasi Kapasitas</span>
              <Users className="w-4 h-4 text-ink-soft" />
            </div>
            <div className="text-2xl medium:text-3xl font-black text-ink tracking-tight font-mono">
              {indicators.capacity_utilization_pct}%
            </div>
            <p className="text-xs text-ink-soft mt-1 font-medium">
              {metrics.total_placed_students} Siswa / {metrics.total_capacity} Daya Tampung
            </p>
          </div>

          <ProgressBar
            value={indicators.capacity_utilization_pct}
            variant={indicators.capacity_utilization_pct > 100 ? 'danger' : indicators.capacity_utilization_pct >= 80 ? 'success' : 'brass'}
            trackClassName="h-2"
          />
        </div>

        {/* Indicator 2: Staffing Compliance */}
        <div className="bg-surface border border-line rounded-card p-4 shadow-hairline flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-ink-soft mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">2. Penugasan Guru Kelas</span>
              <UserCheck className="w-4 h-4 text-ink-soft" />
            </div>
            <div className={`text-2xl medium:text-3xl font-black tracking-tight font-mono ${
              indicators.staffing_compliance ? 'text-success-deep' : 'text-brass'
            }`}>
              {indicators.staffing_compliance ? '100% Sesuai' : 'Perlu Perhatian'}
            </div>
            <p className="text-xs text-ink-soft mt-1 font-medium">
              {metrics.unstaffed_classes === 0 
                ? 'Seluruh rombel memiliki guru kelas' 
                : `${metrics.unstaffed_classes} rombel belum ada guru kelas`}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-ink-soft font-mono whitespace-nowrap">
            <span>Status:</span>
            <span className={indicators.staffing_compliance ? 'text-success-deep font-bold' : 'text-brass font-bold'}>
              {indicators.staffing_compliance ? 'TERPENUHI' : 'BELUM_LENGKAP'}
            </span>
          </div>
        </div>

        {/* Indicator 3: Attendance Consistency */}
        <div className="bg-surface border border-line rounded-card p-4 shadow-hairline flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-ink-soft mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">3. Konsistensi Presensi</span>
              <Calendar className="w-4 h-4 text-ink-soft" />
            </div>
            <div className="text-2xl medium:text-3xl font-black text-ink tracking-tight font-mono">
              {indicators.attendance_recorded_days} <span className="text-sm font-semibold text-ink-soft">Hari</span>
            </div>
            <p className="text-xs text-ink-soft mt-1 font-medium">
              Pencatatan Presensi Harian Terdata
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-ink-soft font-mono whitespace-nowrap">
            <span>Periode:</span>
            <span className="text-ink font-bold">{telemetry?.semester || 'GANJIL'}</span>
          </div>
        </div>

        {/* Indicator 4: Curriculum Velocity & LPPA Progress */}
        <div className="bg-surface border border-line rounded-card p-4 shadow-hairline flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-ink-soft mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">4. Kecepatan Kurikulum</span>
              <Activity className="w-4 h-4 text-ink-soft" />
            </div>
            <div className="text-2xl medium:text-3xl font-black text-ink tracking-tight font-mono">
              {indicators.curriculum_velocity_pct}%
            </div>
            <p className="text-xs text-ink-soft mt-1 font-medium">
              {metrics.approved_lppa_count} LPPA Sah • {metrics.total_observations} Observasi
            </p>
          </div>

          <ProgressBar
            value={indicators.curriculum_velocity_pct}
            variant="brass"
            trackClassName="h-2"
          />
        </div>
      </div>

      {/* Operational Exceptions & Diagnostic Ledger */}
      <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-ink-soft" />
            <h3 className="text-sm font-bold text-ink">Daftar Eksepsi &amp; Diagnostik Operasional Real-Time</h3>
          </div>
          <span className="text-xs text-ink-soft font-medium">
            {exceptions.length} Eksepsi Aktif
          </span>
        </div>

        {exceptions.length > 0 ? (
          <div className="space-y-2.5">
            {exceptions.map((ex, idx) => (
              <div 
                key={idx} 
                className="p-3 bg-surface-subtle border border-line rounded-field flex items-start space-x-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-brass mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-ink">{ex.code}</span>
                    <span className="text-[10px] bg-line-soft text-ink-soft px-1 py-1 rounded font-mono font-semibold whitespace-nowrap">DIAGNOSTIK</span>
                  </div>
                  <p className="text-ink-soft mt-1">
                    {ex.message || (
                      ex.code === 'OVERCAPACITY_ROOMS' 
                        ? `Kapasitas ruang kelas terlampaui (${ex.placed} siswa aktif pada kapasitas ${ex.capacity}).`
                        : ex.code === 'UNSTAFFED_CLASSES'
                        ? `Terdapat ${ex.count} ruang kelas aktif yang belum memiliki penugasan guru kelas.`
                        : ex.code === 'PENDING_LPPA_AT_CLOSING'
                        ? `Terdapat ${ex.count} rapor LPPA siswa yang belum disetujui menjelang penutupan semester.`
                        : `Eksepsi terdeteksi pada parameter: ${JSON.stringify(ex)}`
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 bg-surface-subtle border border-line rounded-field flex items-center space-x-3 text-xs text-success-deep">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-success" />
            <div>
              <p className="font-bold">Seluruh Parameter Operasional Berjalan Normal</p>
              <p className="text-ink-soft mt-0.5">Tidak ada eksepsi kelembagaan atau pelanggaran kapasitas yang terdeteksi saat ini.</p>
            </div>
          </div>
        )}
      </div>

      {/* Superadmin Multi-School Foundation Stewardship Grid */}
      {isSuperadmin && multiSchoolData.length > 0 && (
        <div className="bg-surface border border-line rounded-card p-4 medium:p-6 shadow-hairline space-y-4">
          <div className="flex items-center justify-between border-b border-line-soft pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-ink-soft" />
              <h3 className="text-sm font-bold text-ink">Matriks Kesehatan Multi-Unit Sekolah (Yayasan)</h3>
            </div>
            <span className="text-xs text-ink-soft font-medium">{multiSchoolData.length} Unit Sekolah Terpantau</span>
          </div>

          <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-3 gap-4">
            {multiSchoolData.map((item) => {
              const itemStatus = item.telemetry?.health_status || 'CRITICAL_BLOCKER';
              const b = getStatusBadge(itemStatus);
              const itemIndicators: SchoolHealthIndicators = item.telemetry?.indicators || {
                capacity_utilization_pct: 0,
                curriculum_velocity_pct: 0,
                attendance_recorded_days: 0,
                staffing_compliance: false
              };
              const itemExceptions: DiagnosticException[] = item.telemetry?.exceptions || [];

              return (
                <div 
                  key={item.schoolId}
                  onClick={() => setActiveSchoolId(item.schoolId)}
                  className={`p-4 rounded-card border transition-all cursor-pointer ${
                    item.schoolId === currentSchoolId 
                      ? 'bg-surface-subtle border-brand shadow-hairline' 
                      : 'bg-surface border-line hover-only:border-line shadow-hairline'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-ink text-xs">{item.schoolName}</span>
                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${b.bg}`}>
                      {itemStatus === 'HEALTHY' ? 'SEHAT' : itemStatus === 'ATTENTION_REQUIRED' ? 'PERHATIAN' : 'KRITIS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-ink-soft mt-3 pt-3 border-t border-line-soft">
                    <div>
                      <span>Utilisasi:</span>
                      <p className="font-bold text-ink font-mono">{itemIndicators.capacity_utilization_pct}%</p>
                    </div>
                    <div>
                      <span>Kecepatan:</span>
                      <p className="font-bold text-ink font-mono">{itemIndicators.curriculum_velocity_pct}%</p>
                    </div>
                    <div>
                      <span>Presensi:</span>
                      <p className="font-bold text-ink font-mono">{itemIndicators.attendance_recorded_days} Hari</p>
                    </div>
                    <div>
                      <span>Eksepsi:</span>
                      <p className={`font-bold font-mono ${itemExceptions.length > 0 ? 'text-brass' : 'text-success-deep'}`}>
                        {itemExceptions.length} Masalah
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
