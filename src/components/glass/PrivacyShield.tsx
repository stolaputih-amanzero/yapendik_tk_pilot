/**
 * Yapendik School OS — The Glass Layer
 * PrivacyShield Component (FB-07 K-Anonymity & Anti-Differencing)
 */

import React from 'react';
import { Shield, ShieldAlert, Lock, Info } from 'lucide-react';

export type ExposureStatus = 
  | 'VISIBLE' 
  | 'SUPPRESSED_SMALL_COHORT' 
  | 'SUPPRESSED_DIFFERENCING_RISK';

export interface PrivacyShieldProps {
  exposureStatus: ExposureStatus;
  sampleSize: number;
  metricValue?: number;
  metricLabel: string;
  format?: 'PERCENTAGE' | 'COUNT' | 'AVERAGE';
  className?: string;
}

export const PrivacyShield: React.FC<PrivacyShieldProps> = ({
  exposureStatus,
  sampleSize,
  metricValue,
  metricLabel,
  format = 'PERCENTAGE',
  className = ''
}) => {
  const formatValue = (val?: number) => {
    if (val === undefined || val === null) return '—';
    if (format === 'PERCENTAGE') return `${val.toFixed(1)}%`;
    if (format === 'AVERAGE') return val.toFixed(2);
    return val.toString();
  };

  // 1. VISIBLE: Render metric value normally
  if (exposureStatus === 'VISIBLE') {
    return (
      <div className={`inline-flex flex-col ${className}`} data-testid="privacy-shield-visible">
        <span className="text-xs text-ink-soft font-medium">{metricLabel}</span>
        <span className="text-lg font-bold text-ink font-mono">
          {formatValue(metricValue)}
        </span>
        <span className="text-[10px] text-ink-faint font-mono whitespace-nowrap">{`N = ${sampleSize}`}</span>
      </div>
    );
  }

  // 2. SUPPRESSED_SMALL_COHORT (Kmin < 5)
  if (exposureStatus === 'SUPPRESSED_SMALL_COHORT') {
    return (
      <div 
        className={`inline-flex flex-col bg-surface-subtle/80 border border-line/90 rounded-lg p-2 backdrop-blur-xs select-none ${className}`}
        data-testid="privacy-shield-suppressed-cohort"
        title={`Data dilindungi untuk menjaga privasi anak pada kelompok observasi kecil (N = ${sampleSize} < 5).`}
      >
        <span className="text-[11px] text-ink-soft font-medium flex items-center gap-1">
          <Lock className="w-3 h-3 text-brass shrink-0" />
          <span>{metricLabel}</span>
        </span>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="px-1 py-1 rounded bg-warning-tint border border-warning-line text-warning-deep text-[11px] font-semibold tracking-tight font-mono whitespace-nowrap">
            Tersupresi (N &lt; 5)
          </span>
        </div>
        <span className="text-[10px] text-ink-faint mt-1 flex items-center gap-0.5">
          <Info className="w-2.5 h-2.5" /> {`K-Anonymity (N = ${sampleSize})`}
        </span>
      </div>
    );
  }

  // 3. SUPPRESSED_DIFFERENCING_RISK
  return (
    <div 
      className={`inline-flex flex-col bg-warning-tint/70 border border-warning-line/90 rounded-lg p-2 backdrop-blur-xs select-none ${className}`}
      data-testid="privacy-shield-suppressed-differencing"
      title="Selisih data populasi berisiko membuka identitas individu (Anti-Differencing FB-07)."
    >
      <span className="text-[11px] text-warning-deep font-medium flex items-center gap-1">
        <ShieldAlert className="w-3 h-3 text-brass shrink-0" />
        <span>{metricLabel}</span>
      </span>
      <div className="flex items-center gap-2 mt-0.5">
        <span className="px-1 py-1 rounded bg-warning-tint border border-warning-line text-warning-deep text-[11px] font-bold tracking-tight font-mono whitespace-nowrap">
          Risiko Diferensiasi
        </span>
      </div>
      <span className="text-[10px] text-warning-deep mt-1 flex items-center gap-0.5">
        <Shield className="w-2.5 h-2.5" /> Proteksi Rekonstruksi PII
      </span>
    </div>
  );
};
