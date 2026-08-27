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
  AlertTriangle, 
  CheckCircle2, 
  Users, 
  UserCheck, 
  Calendar, 
  BookOpen, 
  RefreshCw, 
  Building2, 
  Sparkles,
  AlertCircle,
  TrendingUp,
  Layers,
  Clock,
  ArrowRight
} from 'lucide-react';

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
          bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
          dot: 'bg-emerald-600',
          icon: CheckCircle2
        };
      case 'ATTENTION_REQUIRED':
        return {
          label: 'Perlu Perhatian (ATTENTION)',
          bg: 'bg-amber-50 border-amber-200 text-amber-800',
          dot: 'bg-amber-500',
          icon: AlertTriangle
        };
      case 'CRITICAL_BLOCKER':
      default:
        return {
          label: 'Kendala Kritis (CRITICAL)',
          bg: 'bg-rose-50 border-rose-200 text-rose-800',
          dot: 'bg-rose-600',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center min-h-[400px] text-slate-500 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-slate-700 mb-3" />
        <p className="text-sm font-semibold text-slate-800">Mengkalkulasi Telemetri Kesehatan Lembaga secara Real-Time...</p>
        <p className="text-xs text-slate-500 mt-1">Mengambil data agregasi dan indikator kepatuhan unit</p>
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
    <div className="space-y-6 text-slate-900 font-sans w-full" data-testid="institutional-health-dashboard">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 md:rounded-2xl px-4 py-5 md:p-6 w-full text-slate-900 md:border md:shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
              <Activity className="w-3.5 h-3.5" />
              <span>Standar Yayasan • Telemetri &amp; Mutu</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <span>Statistik &amp; Kesehatan Lembaga</span>
            </h1>
            <p className="hidden md:block text-slate-500 text-xs mt-1 max-w-2xl">
              {activeSchool?.name || 'TK Yapendik'}
              {telemetry?.academic_year_name ? ` • ${telemetry.academic_year_name} (${telemetry.semester})` : ''} • Monitoring kesehatan operasional multi-unit secara otomatis.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
            {/* Superadmin Unit Switcher */}
            {isSuperadmin && schools.length > 1 && (
              <select
                value={currentSchoolId}
                onChange={(e) => setActiveSchoolId(e.target.value)}
                className="bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900 shadow-2xs cursor-pointer"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Health Status Pill */}
            <div className={`px-3 py-1.5 rounded-full border text-xs font-bold flex items-center justify-center space-x-2 ${currentBadge.bg}`}>
              <span className={`w-2 h-2 rounded-full ${currentBadge.dot}`}></span>
              <span>{currentBadge.label}</span>
            </div>

            <button
              onClick={loadTelemetry}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-2xs cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-slate-600' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Error Feedback Banner */}
      {errorFeedback && (
        <div className="p-4 rounded-2xl border bg-rose-50 border-rose-200 text-rose-800 flex items-start space-x-3 text-xs shadow-2xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-semibold">{errorFeedback.title}</p>
            <p className="mt-0.5 text-slate-700">{errorFeedback.message}</p>
            {errorFeedback.actionSuggestion && (
              <p className="mt-2 text-amber-900 font-medium bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                Saran Tindakan: {errorFeedback.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4 Canonical Indicators Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Indicator 1: Capacity Utilization */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">1. Utilisasi Kapasitas</span>
              <Users className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {indicators.capacity_utilization_pct}%
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {metrics.total_placed_students} Siswa / {metrics.total_capacity} Daya Tampung
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                indicators.capacity_utilization_pct > 100 
                  ? 'bg-rose-500' 
                  : indicators.capacity_utilization_pct >= 80 
                  ? 'bg-emerald-600' 
                  : 'bg-slate-700'
              }`}
              style={{ width: `${Math.min(100, indicators.capacity_utilization_pct)}%` }}
            ></div>
          </div>
        </div>

        {/* Indicator 2: Staffing Compliance */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">2. Penugasan Guru Kelas</span>
              <UserCheck className="w-4 h-4 text-slate-700" />
            </div>
            <div className={`text-2xl sm:text-3xl font-black tracking-tight font-mono ${
              indicators.staffing_compliance ? 'text-emerald-700' : 'text-amber-600'
            }`}>
              {indicators.staffing_compliance ? '100% Sesuai' : 'Perlu Perhatian'}
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {metrics.unstaffed_classes === 0 
                ? 'Seluruh rombel memiliki guru kelas' 
                : `${metrics.unstaffed_classes} rombel belum ada guru kelas`}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
            <span>Status:</span>
            <span className={indicators.staffing_compliance ? 'text-emerald-700 font-bold' : 'text-amber-600 font-bold'}>
              {indicators.staffing_compliance ? 'TERPENUHI' : 'BELUM_LENGKAP'}
            </span>
          </div>
        </div>

        {/* Indicator 3: Attendance Consistency */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">3. Konsistensi Presensi</span>
              <Calendar className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {indicators.attendance_recorded_days} <span className="text-sm font-semibold text-slate-500">Hari</span>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Pencatatan Presensi Harian Terdata
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[10px] text-slate-500 font-mono">
            <span>Periode:</span>
            <span className="text-slate-800 font-bold">{telemetry?.semester || 'GANJIL'}</span>
          </div>
        </div>

        {/* Indicator 4: Curriculum Velocity & LPPA Progress */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-2xs flex flex-col justify-between space-y-3">
          <div>
            <div className="flex items-center justify-between text-slate-500 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider">4. Kecepatan Kurikulum</span>
              <BookOpen className="w-4 h-4 text-slate-700" />
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-mono">
              {indicators.curriculum_velocity_pct}%
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              {metrics.approved_lppa_count} LPPA Sah • {metrics.total_observations} Observasi
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200">
            <div 
              className="h-full rounded-full bg-slate-900 transition-all duration-500"
              style={{ width: `${Math.min(100, indicators.curriculum_velocity_pct)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Operational Exceptions & Diagnostic Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">Daftar Eksepsi &amp; Diagnostik Operasional Real-Time</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            {exceptions.length} Eksepsi Aktif
          </span>
        </div>

        {exceptions.length > 0 ? (
          <div className="space-y-2.5">
            {exceptions.map((ex, idx) => (
              <div 
                key={idx} 
                className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-start space-x-3 text-xs"
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-slate-900">{ex.code}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">DIAGNOSTIK</span>
                  </div>
                  <p className="text-slate-600 mt-1">
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
          <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-800">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <div>
              <p className="font-bold">Seluruh Parameter Operasional Berjalan Normal</p>
              <p className="text-slate-500 mt-0.5">Tidak ada eksepsi kelembagaan atau pelanggaran kapasitas yang terdeteksi saat ini.</p>
            </div>
          </div>
        )}
      </div>

      {/* Superadmin Multi-School Foundation Stewardship Grid */}
      {isSuperadmin && multiSchoolData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-slate-700" />
              <h3 className="text-sm font-bold text-slate-900">Matriks Kesehatan Multi-Unit Sekolah (Yayasan)</h3>
            </div>
            <span className="text-xs text-slate-500 font-medium">{multiSchoolData.length} Unit Sekolah Terpantau</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    item.schoolId === currentSchoolId 
                      ? 'bg-slate-50 border-slate-900 shadow-2xs' 
                      : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">{item.schoolName}</span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${b.bg}`}>
                      {itemStatus === 'HEALTHY' ? 'SEHAT' : itemStatus === 'ATTENTION_REQUIRED' ? 'PERHATIAN' : 'KRITIS'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <span>Utilisasi:</span>
                      <p className="font-bold text-slate-900 font-mono">{itemIndicators.capacity_utilization_pct}%</p>
                    </div>
                    <div>
                      <span>Kecepatan:</span>
                      <p className="font-bold text-slate-900 font-mono">{itemIndicators.curriculum_velocity_pct}%</p>
                    </div>
                    <div>
                      <span>Presensi:</span>
                      <p className="font-bold text-slate-900 font-mono">{itemIndicators.attendance_recorded_days} Hari</p>
                    </div>
                    <div>
                      <span>Eksepsi:</span>
                      <p className={`font-bold font-mono ${itemExceptions.length > 0 ? 'text-amber-600' : 'text-emerald-700'}`}>
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
