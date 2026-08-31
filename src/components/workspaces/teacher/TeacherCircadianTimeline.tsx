/**
 * Amanaura OS × FLOW — Jadwal Kegiatan Harian PAUD (Teacher Circadian Timeline)
 * Architectural Specification: ADR-UX-010 Flat Fluid & ADR-UX-011 §6.1
 * 
 * Standar Resmi Kurikulum Merdeka PAUD Kemendikbudristek:
 * - 8 Fase Alami Hari Sekolah PAUD
 * - Mobile-First Vertical Column Flow (Bebas pemenggalan 3-dot & anti-squeezing)
 * - Live Time Detection & Amanaura Pulse State
 * - Crisp Micro-Action Buttons (min-h-[44px] touch target)
 */

import React from 'react';
import { 
  Sun, 
  Sparkles, 
  Users, 
  Puzzle, 
  Utensils, 
  BookOpen, 
  HeartHandshake, 
  BrainCircuit,
  ArrowRight,
  Check
} from 'lucide-react';
import { WorkspaceTab } from '../../layout/TopBar';

interface TimelineItem {
  id: string;
  timeSlot: string;
  startHour: number;
  startMinute: number;
  endHour: number;
  endMinute: number;
  title: string;
  description: string;
  icon: React.ElementType;
  actionLabel: string;
  targetTab: WorkspaceTab;
  badgeText?: string;
}

const PAUD_TIMELINE_SCHEDULE: TimelineItem[] = [
  {
    id: 'fase_1',
    timeSlot: '06:45 – 07:15',
    startHour: 6,
    startMinute: 45,
    endHour: 7,
    endMinute: 15,
    title: '1. Persiapan Lingkungan Main',
    description: 'Menyiapkan area sentra, alat peraga edukatif, dan memeriksa catatan titipan kemarin.',
    icon: Sun,
    actionLabel: 'Rencana Main',
    targetTab: 'DAILY_WORK',
  },
  {
    id: 'fase_2',
    timeSlot: '07:15 – 07:45',
    startHour: 7,
    startMinute: 15,
    endHour: 7,
    endMinute: 45,
    title: '2. Penyambutan & Presensi Pagi',
    description: 'Sapa hangat di pintu kelas (5S), cek suhu tubuh, mood anak, dan catatan kesehatan.',
    icon: Sparkles,
    actionLabel: 'Presensi Pagi',
    targetTab: 'ATTENDANCE',
  },
  {
    id: 'fase_3',
    timeSlot: '07:45 – 08:30',
    startHour: 7,
    startMinute: 45,
    endHour: 8,
    endMinute: 30,
    title: '3. Lingkaran Pagi',
    description: 'Doa pembuka bersama, bernyanyi, dan apersepsi tema modul ajar hari ini.',
    icon: Users,
    actionLabel: 'Panduan Pagi',
    targetTab: 'DAILY_WORK',
  },
  {
    id: 'fase_4',
    timeSlot: '08:30 – 10:00',
    startHour: 8,
    startMinute: 30,
    endHour: 10,
    endMinute: 0,
    title: '4. Kegiatan Inti Sentra & Bermain',
    description: 'Anak bereksplorasi di sentra balok, seni, dan bahan alam; guru mendampingi dan merekam momen.',
    icon: Puzzle,
    actionLabel: 'Rekam Momen',
    targetTab: 'OBSERVATIONS',
  },
  {
    id: 'fase_5',
    timeSlot: '10:00 – 10:30',
    startHour: 10,
    startMinute: 0,
    endHour: 10,
    endMinute: 30,
    title: '5. Makan Bersama & Istirahat',
    description: 'Pembiasaan cuci tangan bersabun, menikmati bekal sehat bersama, dan toilet training.',
    icon: Utensils,
    actionLabel: 'Catatan Sehat',
    targetTab: 'ATTENDANCE',
  },
  {
    id: 'fase_6',
    timeSlot: '10:30 – 11:00',
    startHour: 10,
    startMinute: 30,
    endHour: 11,
    endMinute: 0,
    title: '6. Refleksi Penutup',
    description: 'Anak menceritakan pengalaman dan hasil karyanya, apresiasi guru, dan doa penutup.',
    icon: BookOpen,
    actionLabel: 'Refleksi Main',
    targetTab: 'DAILY_WORK',
  },
  {
    id: 'fase_7',
    timeSlot: '11:00 – 11:30',
    startHour: 11,
    startMinute: 0,
    endHour: 11,
    endMinute: 30,
    title: '7. Penjemputan & Kepulangan',
    description: 'Serah terima anak ke orang tua/penjemput dan pengiriman catatan buku penghubung.',
    icon: HeartHandshake,
    actionLabel: 'Buku Penghubung',
    targetTab: 'COMMUNICATION',
  },
  {
    id: 'fase_8',
    timeSlot: '11:30 – 13:00',
    startHour: 11,
    startMinute: 30,
    endHour: 13,
    endMinute: 0,
    title: '8. Catatan Asesmen & Rapor LPPA',
    description: 'Guru merangkum bukti pengamatan harian dan memperkaya narasi draf Rapor LPPA.',
    icon: BrainCircuit,
    actionLabel: 'Rapor LPPA',
    targetTab: 'DEVELOPMENT',
  },
];

interface Props {
  onNavigateTab: (tab: WorkspaceTab) => void;
  onOpenQuickCapture?: () => void;
  attendanceCount?: { present: number; total: number };
}

export const TeacherCircadianTimeline: React.FC<Props> = ({
  onNavigateTab,
  onOpenQuickCapture,
  attendanceCount
}) => {
  const [simulationMode, setSimulationMode] = React.useState<boolean>(false);
  const [selectedPhaseId, setSelectedPhaseId] = React.useState<string>('fase_4');
  const [now, setNow] = React.useState<Date>(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  // Active PAUD hours: 06:45 (405 min) to 13:00 (780 min)
  const isBeforeSchool = currentMinutes < 6 * 60 + 45;
  const isAfterSchool = currentMinutes >= 13 * 60;
  const isOutsideSchoolHours = isBeforeSchool || isAfterSchool;

  const getPhaseStatus = (item: TimelineItem): 'ACTIVE' | 'PAST' | 'UPCOMING' => {
    // If simulation/preview mode is active for live testing
    if (simulationMode) {
      if (item.id === selectedPhaseId) return 'ACTIVE';
      const targetIndex = PAUD_TIMELINE_SCHEDULE.findIndex(p => p.id === selectedPhaseId);
      const currentIndex = PAUD_TIMELINE_SCHEDULE.findIndex(p => p.id === item.id);
      return currentIndex < targetIndex ? 'PAST' : 'UPCOMING';
    }

    const startMins = item.startHour * 60 + item.startMinute;
    const endMins = item.endHour * 60 + item.endMinute;

    if (currentMinutes >= startMins && currentMinutes < endMins) {
      return 'ACTIVE';
    }
    if (currentMinutes >= endMins) {
      return 'PAST';
    }
    return 'UPCOMING';
  };

  const handleAction = (item: TimelineItem) => {
    if (item.targetTab === 'OBSERVATIONS' && onOpenQuickCapture) {
      onOpenQuickCapture();
    } else {
      onNavigateTab(item.targetTab);
    }
  };

  const currentTimeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;

  return (
    <section className="space-y-4">
      {/* Circadian Rest Notification: Outside Active School Hours */}
      {!simulationMode && isOutsideSchoolHours && (
        <div className="p-4 rounded-2xl bg-surface border border-accent-valor/30 shadow-xs flex items-start gap-3.5 animate-in fade-in duration-300">
          <div className="p-2 rounded-xl bg-accent-valor/10 text-brand-deep shrink-0 mt-0.5">
            {isBeforeSchool ? <Sun className="w-4 h-4 text-accent-valor" /> : <Sparkles className="w-4 h-4 text-accent-valor" />}
          </div>
          <div className="space-y-1 grow min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-xs font-bold text-ink truncate">
                {isBeforeSchool ? 'Persiapan Hari Baru' : 'Waktu Istirahat'}
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-subtle border border-line-hairline text-[11px] font-mono font-medium text-ink-soft shrink-0">
                {currentTimeStr} WIB
              </span>
            </div>
            <p className="text-xs text-ink-soft leading-relaxed pt-0.5">
              {isBeforeSchool 
                ? 'Kegiatan sekolah akan dimulai pukul 06:45 WIB. Selamat mempersiapkan ruang main dengan tenang.' 
                : 'Seluruh rangkaian kegiatan belajar hari ini telah selesai (13:00 WIB). Selamat beristirahat dan memulihkan energi untuk anak-anak esok hari ✦'}
            </p>
          </div>
        </div>
      )}

      {/* Vertical Continuous Timeline (Edge-to-Edge Continuous Stream) */}
      <div className="relative pl-1 sm:pl-2 space-y-4 pt-1">
        {PAUD_TIMELINE_SCHEDULE.map((item, index) => {
          const status = getPhaseStatus(item);
          const Icon = item.icon;
          const isLast = index === PAUD_TIMELINE_SCHEDULE.length - 1;

          return (
            <div key={item.id} className="relative flex items-start gap-3 sm:gap-4 group">
              {/* Sisi Kiri: Waktu, Garis Vertikal, & Penanda Dot */}
              <div className="flex flex-col items-center shrink-0 w-14 sm:w-16 pt-1">
                {/* Waktu Jam (Mono Font Stacked) */}
                <span className={`font-mono text-[11px] leading-none text-center ${
                  status === 'ACTIVE' ? 'font-bold text-accent-valor' : 'font-medium text-ink-soft'
                }`}>
                  {item.timeSlot.split(' – ')[0]}
                </span>
                <span className="font-mono text-[10px] text-ink-faint leading-tight text-center">
                  {item.timeSlot.split(' – ')[1]}
                </span>

                {/* Status Dot */}
                <div className="my-2 relative flex items-center justify-center">
                  {status === 'ACTIVE' && (
                    <>
                      <span className="absolute w-5 h-5 rounded-full bg-accent-valor/30 animate-ping" />
                      <div className="w-3.5 h-3.5 rounded-full bg-accent-valor border-2 border-surface shadow-xs z-10 flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-surface" />
                      </div>
                    </>
                  )}

                  {status === 'PAST' && (
                    <div className="w-3 h-3 rounded-full bg-success text-on-brand flex items-center justify-center z-10">
                      <Check className="w-2 h-2 stroke-[3]" />
                    </div>
                  )}

                  {status === 'UPCOMING' && (
                    <div className="w-2.5 h-2.5 rounded-full border border-line-hairline bg-surface z-10" />
                  )}
                </div>

                {/* Connecting Vertical Line */}
                {!isLast && (
                  <div className={`w-[2px] grow min-h-[48px] ${
                    status === 'PAST' ? 'bg-success-line' : 'bg-line-hairline'
                  }`} />
                )}
              </div>

              {/* Sisi Kanan: Kartu Kegiatan Mobile-First dengan Amanaura Golden Breath pada Fase Aktif */}
              <div 
                onClick={() => {
                  if (simulationMode) setSelectedPhaseId(item.id);
                }}
                className={`flex-1 rounded-2xl border p-4 transition-all duration-300 ${
                  status === 'ACTIVE'
                    ? 'bg-surface animate-gold-breath shadow-medium'
                    : 'bg-surface border-line-hairline hover-only:border-line'
                } ${simulationMode ? 'cursor-pointer' : ''}`}
              >
                {/* Mobile-First Column Flow (Title & Description) */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 ${
                        status === 'ACTIVE' ? 'text-accent-valor' : 'text-ink-soft'
                      }`} />
                      <h4 className="font-bold text-ink text-xs sm:text-sm leading-snug">
                        {item.title}
                      </h4>
                    </div>

                    {status === 'ACTIVE' && (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-accent-valor/15 text-brand-deep text-[10px] font-bold shrink-0 border border-accent-valor/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-accent-valor animate-pulse" />
                        <span>Sedang Berjalan</span>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-ink-soft leading-relaxed pt-0.5">
                    {item.description}
                  </p>

                  {/* Contextual Metric Hint (e.g. Presensi) */}
                  {item.id === 'fase_2' && attendanceCount && (
                    <div className="pt-1 text-[11px] font-mono text-ink-soft">
                      Status Terkini: <b className="text-ink">{attendanceCount.present}</b> dari {attendanceCount.total} anak telah hadir.
                    </div>
                  )}
                </div>

                {/* Action CTA Button (Separate bottom row, crisp label, 44dp floor) */}
                <div className="pt-3 mt-2 border-t border-line-hairline flex items-center justify-end">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAction(item);
                    }}
                    className={`w-full sm:w-auto min-h-[44px] px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] ${
                      status === 'ACTIVE'
                        ? 'bg-accent-valor text-surface shadow-xs hover-only:opacity-95'
                        : 'bg-surface border border-line-hairline text-ink hover-only:bg-surface-subtle'
                    }`}
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
