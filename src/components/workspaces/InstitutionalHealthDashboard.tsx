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
  }, [currentSchoolId, isSuperadmin]);

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'HEALTHY':
        return {
          label: 'Sistem Sehat (HEALTHY)',
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400',
          dot: 'bg-emerald-400',
          icon: CheckCircle2
        };
      case 'ATTENTION_REQUIRED':
        return {
          label: 'Perlu Perhatian (ATTENTION)',
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          dot: 'bg-amber-400',
          icon: AlertTriangle
        };
      case 'CRITICAL_BLOCKER':
      default:
        return {
          label: 'Kendala Kritis (CRITICAL)',
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          dot: 'bg-rose-400',
          icon: AlertCircle
        };
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-slate-400 font-sans">
        <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
        <p className="text-sm font-medium">Mengkalkulasi Telemetri Kesehatan Lembaga secara Real-Time...</p>
        <p className="text-xs text-slate-600 mt-1 font-mono">Invoking PostgreSQL Derived Function fn_derive_school_health_telemetry()</p>
      </div>
    );
  }

  const currentBadge = getStatusBadge(telemetry?.health_status);
  const StatusIcon = currentBadge.icon;

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
    <div className="w-full space-y-6 text-slate-900 font-sans" data-testid="institutional-health-dashboard">
      {/* Header Banner */}
      <div className="bg-slate-50 border-b border-slate-200 lg:rounded-2xl px-4 py-5 md:p-6 relative overflow-hidden lg:border lg:shadow-sm w-full">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 relative z-10">
          <div className="flex items-start justify-between gap-4 w-full md:w-auto">
            <div>
              <div className="flex items-center space-x-1.5 text-emerald-600 text-[10px] sm:text-xs font-bold tracking-wider uppercase mb-1">
                <Activity className="w-3.5 h-3.5" />
                <span>Statistik & Telemetri Unit</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Statistik Kesehatan Unit
              </h1>
              <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
                {activeSchool?.name || 'TK Yapendik'}
                {telemetry?.academic_year_name ? ` • ${telemetry.academic_year_name} (${telemetry.semester})` : ''}
              </p>
            </div>
            <button
              onClick={loadTelemetry}
              disabled={refreshing}
              className="flex md:hidden items-center justify-center p-2 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
            </button>
          </div>

          <div className="flex flex-col md:flex-row items-stretch md:items-start gap-3 mt-4 md:mt-0 w-full md:w-auto">
            {/* Superadmin Unit Switcher */}
            {isSuperadmin && schools.length > 1 && (
              <select
                value={currentSchoolId}
                onChange={(e) => setActiveSchoolId(e.target.value)}
                className="w-full md:w-auto flex justify-between items-center bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                {schools.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}

            {/* Health Status Pill */}
            <div className={`px-3.5 py-2 md:py-1.5 rounded-full border text-xs font-bold flex items-center justify-center space-x-2 ${currentBadge.bg} w-full md:w-auto`}>
              <span className={`w-2 h-2 rounded-full ${currentBadge.dot} animate-pulse`}></span>
              <span>{currentBadge.label}</span>
            </div>

            <button
              onClick={loadTelemetry}
              disabled={refreshing}
              className="hidden md:flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium transition-colors shadow-xs shrink-0 cursor-pointer"
              title="Segarkan Data"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-emerald-600' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="px-4 lg:px-0 space-y-6">
        {/* Error Feedback if any */}
      {errorFeedback && (
        <div className="p-4 rounded-xl border bg-rose-950/40 border-rose-500/40 text-rose-300 flex items-start space-x-3 text-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" />
          <div className="flex-1">
            <p className="font-semibold">{errorFeedback.title}</p>
            <p className="mt-0.5 opacity-90">{errorFeedback.message}</p>
            {errorFeedback.actionSuggestion && (
              <p className="mt-2 text-amber-300 font-medium bg-amber-950/40 p-2 rounded-lg border border-amber-500/20">
                💡 Rekomendasi: {errorFeedback.actionSuggestion}
              </p>
            )}
          </div>
        </div>
      )}

      {/* 4 Canonical Indicators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Indicator 1: Capacity Utilization */}
        {/* Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">1. Utilisasi Kapasitas</span>
              <Users className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicators.capacity_utilization_pct}%
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {metrics.total_placed_students} Siswa Terdaftar / {metrics.total_capacity} Daya Tampung
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                indicators.capacity_utilization_pct > 100 
                  ? 'bg-rose-500' 
                  : indicators.capacity_utilization_pct >= 80 
                  ? 'bg-emerald-500' 
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(100, indicators.capacity_utilization_pct)}%` }}
            ></div>
          </div>
        </div>

        {/* Indicator 2: Staffing Compliance */}
        {/* Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">2. Kepatuhan Penugasan Guru</span>
              <UserCheck className="w-4 h-4 text-emerald-400" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${
              indicators.staffing_compliance ? 'text-emerald-400' : 'text-amber-400'
            }`}>
              {indicators.staffing_compliance ? '100% Sesuai' : 'Perlu Perhatian'}
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {metrics.unstaffed_classes === 0 
                ? 'Seluruh rombel memiliki wali kelas' 
                : `${metrics.unstaffed_classes} Rombel belum memiliki wali kelas`}
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span>Status:</span>
            <span className={indicators.staffing_compliance ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
              {indicators.staffing_compliance ? 'COMPLIANT' : 'NON_COMPLIANT'}
            </span>
          </div>
        </div>

        {/* Indicator 3: Attendance Consistency */}
        {/* Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">3. Konsistensi Presensi</span>
              <Calendar className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicators.attendance_recorded_days} <span className="text-lg font-normal text-slate-400">Hari</span>
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Pencatatan Presensi Harian Terdata
            </p>
          </div>

          <div className="flex items-center space-x-2 text-[11px] text-slate-500 font-mono">
            <span>Periode:</span>
            <span className="text-slate-300 font-semibold">{telemetry?.semester || 'GANJIL'}</span>
          </div>
        </div>

        {/* Indicator 4: Curriculum Velocity & LPPA Progress */}
        {/* Indicator */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
          <div>
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider">4. Kecepatan Kurikulum</span>
              <BookOpen className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-3xl font-black text-slate-900 tracking-tight">
              {indicators.curriculum_velocity_pct}%
            </div>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              {metrics.approved_lppa_count} Rapor Disetujui • {metrics.total_observations} Observasi
            </p>
          </div>

          <div className="w-full bg-slate-100 rounded-full h-2 p-0.5 border border-slate-200">
            <div 
              className="h-full rounded-full bg-purple-500 transition-all duration-500"
              style={{ width: `${Math.min(100, indicators.curriculum_velocity_pct)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Operational Exceptions & Diagnostic Ledger */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Daftar Eksepsi & Diagnostik Operasional Real-Time</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">
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
                <AlertTriangle className="w-4 h-4 flex-shrink-0 text-amber-500 mt-0.5" />
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono font-bold text-amber-600">{ex.code}</span>
                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-mono">SYSTEM EXCEPTION</span>
                  </div>
                  <p className="text-slate-600 mt-1">
                    {ex.message || (
                      ex.code === 'OVERCAPACITY_ROOMS' 
                        ? `Kapasitas ruang kelas terlampaui (${ex.placed} siswa aktif pada kapasitas ${ex.capacity}).`
                        : ex.code === 'UNSTAFFED_CLASSES'
                        ? `Terdapat ${ex.count} ruang kelas aktif yang belum memiliki penugasan guru wali kelas.`
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
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl flex items-center space-x-3 text-xs text-emerald-600">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Seluruh Parameter Operasional Berjalan Normal</p>
              <p className="text-slate-500 mt-0.5">Tidak ada eksepsi kelembagaan atau pelanggaran kapasitas yang terdeteksi saat ini.</p>
            </div>
          </div>
        )}
      </div>

      {/* Superadmin Multi-School Foundation Stewardship Grid */}
      {isSuperadmin && multiSchoolData.length > 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-base font-bold text-slate-900">Matriks Kesehatan Multi-Unit Sekolah (Yayasan)</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">{multiSchoolData.length} Unit Sekolah Terpantau</span>
          </div>

          <div className="flex flex-col md:grid md:grid-cols-2 lg:grid-cols-3 divide-y divide-slate-100 md:divide-none gap-0 md:gap-4 -mx-6 md:mx-0">
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
                  className={`p-4 md:rounded-xl md:border transition-all cursor-pointer ${
                    item.schoolId === currentSchoolId 
                      ? 'bg-slate-50 md:border-emerald-500/50 md:shadow-sm' 
                      : 'bg-white md:border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-xs">{item.schoolName}</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${b.bg}`}>
                      {itemStatus}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 mt-3 pt-3 border-t border-slate-100">
                    <div>
                      <span>Utilisasi:</span>
                      <p className="font-bold text-slate-200">{itemIndicators.capacity_utilization_pct}%</p>
                    </div>
                    <div>
                      <span>Kecepatan:</span>
                      <p className="font-bold text-purple-400">{itemIndicators.curriculum_velocity_pct}%</p>
                    </div>
                    <div>
                      <span>Presensi:</span>
                      <p className="font-bold text-amber-400">{itemIndicators.attendance_recorded_days} Hari</p>
                    </div>
                    <div>
                      <span>Eksepsi:</span>
                      <p className={`font-bold ${itemExceptions.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
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
    </div>
  );
};
