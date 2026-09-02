/**
 * Yapendik School OS — Stage 6 Gate 5: Health Alert Badge & Privacy Sanitizer
 * Tier-3 Medical Data Protection (FB-01 & ARB Directive #2)
 * Ensures sanitized preview without exposing raw clinical data in list/toast.
 * Zero Emoji Clutter (Hukum 11 / Lucide icons only).
 */

import React from 'react';
import { ShieldAlert, Clock } from 'lucide-react';

interface Props {
  createdAt: string;
  isSanitizedPreview?: boolean;
  childName?: string;
}

export const getSanitizedHealthAlertPreview = (childName: string = 'Ananda'): string => {
  return `Pemberitahuan kondisi kesehatan Ananda ${childName} — buka aplikasi untuk detail.`;
};

export const HealthAlertBadge: React.FC<Props> = ({
  createdAt,
  isSanitizedPreview = false,
  childName = 'Ananda'
}) => {
  const createdTime = new Date(createdAt).getTime();
  const now = Date.now();
  const hoursRemaining = Math.max(0, Math.round(24 - (now - createdTime) / (1000 * 60 * 60)));

  return (
    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-danger-tint text-danger-deep border border-danger-line text-xs font-semibold">
      <ShieldAlert className="w-3.5 h-3.5 text-danger shrink-0" />
      <span>Peringatan Kesehatan</span>
      <span className="text-[10px] opacity-80 font-mono flex items-center gap-0.5 ml-1">
        <Clock className="w-2.5 h-2.5" />
        {hoursRemaining > 0 ? `Aktif ${hoursRemaining}j` : 'Kadaluarsa'}
      </span>
    </div>
  );
};
