/**
 * Yapendik School OS — Stage 6 Gate 5: Notice Status Receipt (H-01 Payload Lifecycle)
 * Asymmetric visual status indicator for teacher-guardian communication:
 * SENT -> DELIVERED -> READ -> ACKNOWLEDGED -> REPLIED
 * Zero Emoji Clutter (Hukum 11 / Lucide icons only).
 */

import React from 'react';
import { Check, CheckCheck, CheckCircle2, Reply, Clock } from 'lucide-react';

export type NoticeLifecycleStatus = 'SENT' | 'DELIVERED' | 'READ' | 'ACKNOWLEDGED' | 'REPLIED';

interface Props {
  status: NoticeLifecycleStatus;
  timestamp?: string;
  acknowledgedByName?: string;
  isGuardianView?: boolean;
}

export const NoticeStatusReceipt: React.FC<Props> = ({
  status,
  timestamp,
  acknowledgedByName,
  isGuardianView = false
}) => {
  const formattedTime = timestamp 
    ? new Date(timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    : undefined;

  switch (status) {
    case 'REPLIED':
      return (
        <span 
          className="inline-flex items-center gap-1 text-[11px] font-medium text-accent-valor bg-accent-valor/10 px-2 py-0.5 rounded-md border border-accent-valor/20"
          title={`Dibalas oleh ${acknowledgedByName || 'Wali'} ${formattedTime ? `pada ${formattedTime}` : ''}`}
        >
          <Reply className="w-3 h-3 text-accent-valor" />
          <span>Ada Balasan {formattedTime && `• ${formattedTime}`}</span>
        </span>
      );

    case 'ACKNOWLEDGED':
      return (
        <span 
          className="inline-flex items-center gap-1 text-[11px] font-medium text-success-deep bg-success-tint px-2 py-0.5 rounded-md border border-success-line"
          title={`Dikonfirmasi oleh ${acknowledgedByName || 'Wali'} ${formattedTime ? `pada ${formattedTime}` : ''}`}
        >
          <CheckCircle2 className="w-3 h-3 text-success" />
          <span>Dikonfirmasi {formattedTime && `• ${formattedTime}`}</span>
        </span>
      );

    case 'READ':
      return (
        <span 
          className="inline-flex items-center gap-1 text-[11px] font-medium text-brand bg-brand/10 px-2 py-0.5 rounded-md border border-brand/20"
          title={`Sudah dibaca ${formattedTime ? `pada ${formattedTime}` : ''}`}
        >
          <CheckCheck className="w-3 h-3 text-brand" />
          <span>Terbaca {formattedTime && `• ${formattedTime}`}</span>
        </span>
      );

    case 'DELIVERED':
      return (
        <span 
          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-soft bg-surface-subtle px-2 py-0.5 rounded-md border border-line"
          title="Pesan telah diterima di gawai penerima"
        >
          <CheckCheck className="w-3 h-3 text-ink-soft" />
          <span>Diterima</span>
        </span>
      );

    case 'SENT':
    default:
      return (
        <span 
          className="inline-flex items-center gap-1 text-[11px] font-medium text-ink-faint bg-surface-subtle px-2 py-0.5 rounded-md border border-line-soft"
          title="Pesan terkirim ke server"
        >
          <Check className="w-3 h-3 text-ink-faint" />
          <span>Terkirim</span>
        </span>
      );
  }
};
