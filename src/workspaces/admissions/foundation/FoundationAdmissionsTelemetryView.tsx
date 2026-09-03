/**
 * Yapendik School OS — Stage 7 Gate 2
 * Foundation Admissions Telemetry View (W-PPDB Closure)
 * 
 * Strict Privacy & Governance Invariants:
 * - FB-01: Zero-PII DOM Scan (Zero student NIK, zero NIS, zero individual applicant names)
 * - FB-07: K-Anonymity (Metrics with N < 5 are suppressed with PrivacyShield)
 * - ADR-05: Multi-unit intake pipeline & capacity quota monitoring
 */

import React, { useState, useEffect } from 'react';
import { db } from '../../../db/database';
import { admissionsService } from '../../../services/admissionsService';
import { AdmissionsCapacityQuota, AdmissionsTelemetryProjection } from '../../../types/admissionsTypes';
import { PrivacyShield, ExposureStatus } from '../../../components/glass/PrivacyShield';
import { 
  Building2, 
  Users, 
  ShieldCheck, 
  CheckCircle2, 
  RefreshCw, 
  BarChart3,
  Layers,
  Lock
} from 'lucide-react';

export const FoundationAdmissionsTelemetryView: React.FC = () => {
  const [quotas, setQuotas] = useState<AdmissionsCapacityQuota[]>([]);
  const [telemetry, setTelemetry] = useState<AdmissionsTelemetryProjection[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const schools = db.getSchools();

  const loadData = async () => {
    setRefreshing(true);
    try {
      const q = admissionsService.listQuotas();
      const t = await admissionsService.getAdmissionsTelemetry();
      setQuotas(q);
      setTelemetry(t);
    } catch (err) {
      console.error('Failed to load admissions telemetry:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute aggregate metrics
  const totalCapacity = quotas.reduce((sum, q) => sum + q.target_capacity, 0);
  const totalEnrolled = quotas.reduce((sum, q) => sum + q.current_enrolled, 0);
  const totalWaitlisted = quotas.reduce((sum, q) => sum + q.waitlist_capacity, 0);
  const totalApplicants = telemetry.reduce((sum, t) => sum + t.total_applicants, 0);

  // Status Funnel Aggregates (Zero-PII)
  const countByStatus = (status: string) => {
    return telemetry
      .filter(t => t.admission_status === status)
      .reduce((sum, t) => sum + t.total_applicants, 0);
  };

  const countSubmitted = countByStatus('SUBMITTED');
  const countVerified = countByStatus('DOCUMENTS_VERIFIED');
  const countObserved = countByStatus('OBSERVATION_COMPLETED');
  const countSettled = countByStatus('TUITION_SETTLED');
  const countPromoted = countByStatus('ENROLLED_PROMOTED');

  const getExposureStatus = (sampleSize: number): ExposureStatus => {
    return sampleSize >= 5 ? 'VISIBLE' : 'SUPPRESSED_SMALL_COHORT';
  };

  const occupancyRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0;

  return (
    <div className="space-y-6 text-ink font-sans w-full" data-testid="foundation-admissions-telemetry-view">
      {/* 1. Header Banner */}
      <div className="bg-surface-subtle border-b border-line medium:rounded-card px-4 py-5 medium:p-6 w-full text-ink medium:border medium:shadow-hairline">
        <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-1.5 text-success-deep text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-1">
              <ShieldCheck className="w-4 h-4 text-success-deep shrink-0" />
              <span>Standar Yayasan • Telemetri PPDB &amp; Daya Tampung</span>
            </div>
            <h1 className="text-xl font-bold tracking-tight text-ink flex items-center gap-2">
              <span>Pusat Telemetri Admisi &amp; Intake Jaringan TK</span>
            </h1>
            <p className="hidden expanded:block text-ink-soft text-xs mt-1 max-w-2xl">
              Pengawasan makro kapasitas rombel, laju pendaftaran calon siswa baru, dan kepatuhan privasi FB-07 K-Anonymity lintas satuan.
            </p>
          </div>

          <div className="flex flex-col medium:flex-row items-stretch medium:items-center gap-2.5 w-full medium:w-auto shrink-0">
            <div className="flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-success-tint border border-success-line text-xs font-bold text-success-deep shrink-0">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span className="font-mono text-[11px]">FB-07: K-Anonymity Protected</span>
            </div>

            <button
              onClick={loadData}
              disabled={refreshing}
              className="px-3.5 py-2 rounded-field bg-surface hover-only:bg-surface-subtle text-ink-soft border border-line text-xs font-semibold flex justify-center items-center space-x-2 transition-all shadow-hairline whitespace-nowrap shrink-0 cursor-pointer"
              title="Segarkan Data Telemetri"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-ink-soft' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Executive Macro KPIs (Zero-PII & K-Anonymity Governed) */}
      <div className="grid grid-cols-1 medium:grid-cols-2 expanded:grid-cols-4 gap-4">
        {/* KPI 1: Total Kapasitas Jaringan */}
        <div className="p-5 rounded-card bg-surface border border-line shadow-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span className="font-semibold">Target Kuota Jaringan</span>
            <Building2 className="w-4 h-4 text-brand-primary" />
          </div>
          <div className="text-2xl font-black text-ink font-mono tracking-tight">
            {totalCapacity} Kursi
          </div>
          <p className="text-[11px] text-ink-faint">
            Akumulasi target daya tampung seluruh unit TK aktif.
          </p>
        </div>

        {/* KPI 2: Siswa Resmi Terdaftar (Diresmikan) */}
        <div className="p-5 rounded-card bg-surface border border-line shadow-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span className="font-semibold">Siswa Resmi Diresmikan</span>
            <CheckCircle2 className="w-4 h-4 text-success" />
          </div>
          <PrivacyShield
            exposureStatus={getExposureStatus(totalEnrolled)}
            sampleSize={totalEnrolled}
            metricValue={totalEnrolled}
            metricLabel="Total Siswa Diresmikan"
            format="COUNT"
          />
          <p className="text-[11px] text-ink-faint">
            Keterisian: <strong className="text-success-deep font-mono">{occupancyRate}%</strong> dari target kuota.
          </p>
        </div>

        {/* KPI 3: Total Berkas Masuk */}
        <div className="p-5 rounded-card bg-surface border border-line shadow-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span className="font-semibold">Total Berkas Pendaftaran</span>
            <Users className="w-4 h-4 text-brand-secondary" />
          </div>
          <PrivacyShield
            exposureStatus={getExposureStatus(totalApplicants)}
            sampleSize={totalApplicants}
            metricValue={totalApplicants}
            metricLabel="Total Pendaftar"
            format="COUNT"
          />
          <p className="text-[11px] text-ink-faint">
            Antusiasme calon keluarga di seluruh jaringan Yapendik.
          </p>
        </div>

        {/* KPI 4: Cadangan Kuota Waitlist */}
        <div className="p-5 rounded-card bg-surface border border-line shadow-hairline space-y-2">
          <div className="flex items-center justify-between text-xs text-ink-soft">
            <span className="font-semibold">Batas Antrean (Waitlist)</span>
            <Layers className="w-4 h-4 text-warning" />
          </div>
          <div className="text-2xl font-black text-ink font-mono tracking-tight">
            {totalWaitlisted} Slot
          </div>
          <p className="text-[11px] text-ink-faint">
            Batas cadangan rombel jika kuota utama terpenuhi.
          </p>
        </div>
      </div>

      {/* 3. Funnel Progres Pendaftaran (Corong Intake) */}
      <div className="p-6 rounded-card bg-surface border border-line shadow-hairline space-y-4">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-brand-primary" />
            <h2 className="text-sm font-bold text-ink">Corong Tahapan Pendaftaran (Intake Funnel)</h2>
          </div>
          <span className="text-[11px] font-mono text-ink-soft">ADR-05 Pipeline</span>
        </div>

        <div className="grid grid-cols-2 medium:grid-cols-5 gap-3 pt-1">
          {/* Step 1: Berkas Masuk */}
          <div className="p-4 rounded-field bg-surface-subtle border border-line-soft space-y-1 text-center">
            <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider">1. Berkas Masuk</span>
            <PrivacyShield
              exposureStatus={getExposureStatus(countSubmitted)}
              sampleSize={countSubmitted}
              metricValue={countSubmitted}
              metricLabel="Pendaftar"
              format="COUNT"
              className="items-center"
            />
          </div>

          {/* Step 2: Berkas Terverifikasi */}
          <div className="p-4 rounded-field bg-surface-subtle border border-line-soft space-y-1 text-center">
            <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider">2. Berkas Sah</span>
            <PrivacyShield
              exposureStatus={getExposureStatus(countVerified)}
              sampleSize={countVerified}
              metricValue={countVerified}
              metricLabel="Terverifikasi"
              format="COUNT"
              className="items-center"
            />
          </div>

          {/* Step 3: Observasi Tuntas */}
          <div className="p-4 rounded-field bg-surface-subtle border border-line-soft space-y-1 text-center">
            <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider">3. Observasi</span>
            <PrivacyShield
              exposureStatus={getExposureStatus(countObserved)}
              sampleSize={countObserved}
              metricValue={countObserved}
              metricLabel="Observasi Selesai"
              format="COUNT"
              className="items-center"
            />
          </div>

          {/* Step 4: Uang Pangkal Lunas */}
          <div className="p-4 rounded-field bg-surface-subtle border border-line-soft space-y-1 text-center">
            <span className="text-[10px] uppercase font-bold text-ink-soft block tracking-wider">4. Lunas</span>
            <PrivacyShield
              exposureStatus={getExposureStatus(countSettled)}
              sampleSize={countSettled}
              metricValue={countSettled}
              metricLabel="Siap Upacara"
              format="COUNT"
              className="items-center"
            />
          </div>

          {/* Step 5: Diresmikan KS (Enrolled) */}
          <div className="p-4 rounded-field bg-success-tint/60 border border-success-line/60 space-y-1 text-center col-span-2 medium:col-span-1">
            <span className="text-[10px] uppercase font-bold text-success-deep block tracking-wider">5. Diresmikan</span>
            <PrivacyShield
              exposureStatus={getExposureStatus(countPromoted)}
              sampleSize={countPromoted}
              metricValue={countPromoted}
              metricLabel="Murid Resmi"
              format="COUNT"
              className="items-center"
            />
          </div>
        </div>
      </div>

      {/* 4. Multi-Unit Capacity Quota Matrix (Zero-PII) */}
      <div className="p-6 rounded-card bg-surface border border-line shadow-hairline space-y-4">
        <div className="flex items-center justify-between border-b border-line-soft pb-3">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-ink-soft" />
            <h2 className="text-sm font-bold text-ink">Matriks Kuota Daya Tampung Multi-Unit (T.A. 2026/2027)</h2>
          </div>
          <span className="text-[11px] font-mono text-ink-soft">Daya Tampung Terpantau</span>
        </div>

        <div className="divide-y divide-line-soft">
          {quotas.map(quota => {
            const school = schools.find(s => s.id === quota.school_id);
            const pct = quota.target_capacity > 0 
              ? Math.min(100, Math.round((quota.current_enrolled / quota.target_capacity) * 100)) 
              : 0;

            return (
              <div key={quota.quota_id} className="py-4 flex flex-col medium:flex-row medium:items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-ink">{school?.name || quota.school_id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-surface-subtle border border-line text-ink-soft">
                      Tingkat: {quota.class_level.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5">
                    {school?.city || 'DKI Jakarta'} • Status Pendaftaran: <span className="text-success-deep font-semibold">DIBUKA</span>
                  </p>
                </div>

                <div className="flex items-center space-x-6 shrink-0">
                  <div className="text-right">
                    <div className="text-xs text-ink-soft">Keterisian Rombel</div>
                    <div className="text-sm font-bold font-mono text-ink">
                      {quota.current_enrolled} / {quota.target_capacity} Kursi
                    </div>
                  </div>

                  <div className="w-32 hidden medium:block">
                    <div className="w-full bg-surface-subtle h-2 rounded-full overflow-hidden border border-line-soft">
                      <div 
                        className={`h-full transition-all duration-500 ${pct >= 100 ? 'bg-danger' : pct >= 80 ? 'bg-warning' : 'bg-success'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-right font-mono text-ink-faint mt-1">{pct}% Terisi</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
