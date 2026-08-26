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
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'APPROVED':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DEPLOYED':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'ADOPTED':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'MEASURED':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-300';
      default:
        return 'bg-slate-100 text-slate-600 border-slate-200';
    }
  };

  return (
    <div 
      className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-lg border bg-slate-50/90 text-xs ${
        isClosedLoop ? 'border-emerald-300 bg-emerald-50/40 shadow-xs ring-1 ring-emerald-400/30' : 'border-slate-200'
      } ${className}`}
      data-testid="canonical-anchor-badge"
    >
      {/* Anchor Icon */}
      <Anchor className={`w-3.5 h-3.5 shrink-0 ${isClosedLoop ? 'text-emerald-600' : 'text-slate-500'}`} />

      {/* Action ID (Monospace) */}
      <span className="font-mono font-semibold text-slate-800 text-[11px] tracking-tight">
        {actionId}
      </span>

      {/* Action Title (if present) */}
      {actionTitle && (
        <span className="text-slate-600 truncate max-w-[140px] hidden sm:inline">
          • {actionTitle}
        </span>
      )}

      {/* Status Pill */}
      <span className={`px-1.5 py-0.5 rounded text-[10px] font-semibold tracking-wider font-mono uppercase border ${getStatusBadge()}`}>
        {status}
      </span>

      {/* Closed-Loop Seal */}
      {isClosedLoop && (
        <span 
          className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold tracking-tight shadow-xs animate-pulse"
          data-testid="closed-loop-seal"
          title="Inisiatif telah menyelesaikan siklus tertutup penuh (Closed-Loop Invariant Gate 0.1)."
        >
          <CheckCircle2 className="w-2.5 h-2.5" />
          <span>CLOSED-LOOP</span>
        </span>
      )}
    </div>
  );
};
