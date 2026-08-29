/**
 * Yapendik School OS — The Glass Layer
 * CanonicalAnchor Component (H-06 Action Anchoring & Audit Trail)
 */

import React from 'react';
import { Anchor, CheckCircle2, ArrowRight, ShieldCheck } from 'lucide-react';

export interface CanonicalAnchorProps {
  actionId: string;
  status: string;
  isClosedLoop?: boolean;
  actionTitle?: string;
  createdAt?: string;
  className?: string;
}

export const CanonicalAnchor: React.FC<CanonicalAnchorProps> = ({
  actionId,
  status,
  isClosedLoop = false,
  actionTitle,
  createdAt,
  className = ''
}) => {
  const getStatusBadge = () => {
    switch (status.toUpperCase()) {
      case 'DRAFT':
        return 'bg-surface-subtle text-ink-soft border-line';
      case 'APPROVED':
        return 'bg-info-tint text-info-deep border-info-line';
      case 'DEPLOYED':
        return 'bg-lppa-tint text-lppa-deep border-lppa-line';
      case 'ADOPTED':
        return 'bg-lppa-tint text-lppa-deep border-lppa-line';
      case 'MEASURED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'COMPLETED':
        return 'bg-success-tint text-success-deep border-success-line';
      default:
        return 'bg-surface-subtle text-ink-soft border-line';
    }
  };

  const getHumanReadableStatus = (s: string) => {
    switch (s.toUpperCase()) {
      case 'DRAFT': return 'DRAF';
      case 'APPROVED': return 'DISETUJUI';
      case 'DEPLOYED': return 'DIDISTRIBUSIKAN';
      case 'ADOPTED_IN_PRACTICE': return 'DIADOPSI';
      case 'ADAPTED_LOCALLY': return 'DIMODIFIKASI LOKAL';
      case 'DEFERRED': return 'DITUNDA';
      default: return s;
    }
  };

  const formatActionId = (id: string) => {
    if (!id || !id.includes('_')) return id;
    const parts = id.split('_');
    return `#${parts.slice(-2).join('-').toUpperCase()}`;
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-2 py-1 rounded-field border bg-surface-subtle/90 text-xs whitespace-nowrap ${
        isClosedLoop ? 'border-success-line bg-success-tint/40 shadow-hairline ring-1 ring-emerald-400/30' : 'border-line'
      } ${className}`}
      data-testid="canonical-anchor-badge"
    >
      {/* Anchor Icon */}
      <Anchor className={`w-4 h-4 shrink-0 ${isClosedLoop ? 'text-success' : 'text-ink-soft'}`} />

      {/* Action ID (Formatted) */}
      <span className="font-mono font-semibold text-ink text-[11px] tracking-tight shrink-0 whitespace-nowrap" title={actionId}>
        {formatActionId(actionId)}
      </span>

      {/* Action Title (if present) */}
      {actionTitle && (
        <span className="text-ink-soft truncate max-w-[140px] hidden medium:inline shrink-0">
          • {actionTitle}
        </span>
      )}

      {/* Status Pill */}
      <span className={`px-1 py-1 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 ${getStatusBadge()}`}>
        {getHumanReadableStatus(status)}
      </span>

      {/* Closed-Loop Seal */}
      {isClosedLoop && (
        <span 
          className="inline-flex items-center gap-1 px-1 py-1 rounded-full bg-success text-on-brand text-[10px] font-bold tracking-tight shadow-hairline shrink-0"
          title="Bukti Refleksi Kualitatif Terekam (Closed-Loop Empirical Base)"
        >
          <ShieldCheck className="w-3 h-3 shrink-0" />
          <span>DAMPAK TEREKAM</span>
        </span>
      )}
    </div>
  );
};
