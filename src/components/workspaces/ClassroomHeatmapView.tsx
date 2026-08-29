/**
 * Yapendik School OS — Stage 4.3 Classroom Developmental Heatmap (Fase 4.3-C)
 * 
 * Epistemological Principles:
 * 1. "Aggregate Classroom Distribution for Headmaster & Supervisors."
 * 2. "Strictly Non-Competitive: Progress Over Labeling (NO individual rank / leaderboard)."
 * 3. "Identifies collective play center priorities & common growth themes."
 */

import React, { useState, useEffect } from 'react';
import { childContinuityService } from '../../services/childContinuityService';
import { ClassroomDevelopmentalHeatmap } from '../../types/childContinuityTypes';
import { LppaElementKey } from '../../types/lppaReportingTypes';
import { 
  BarChart3, 
  Layers, 
  TrendingUp, 
  Sparkles, 
  ShieldCheck, 
  CheckCircle2, 
  Lightbulb, 
  Building2,
  Users
} from 'lucide-react';

interface Props {
  schoolId: string;
  classId: string;
}

export const ClassroomHeatmapView: React.FC<Props> = ({ schoolId, classId }) => {
  const [heatmap, setHeatmap] = useState<ClassroomDevelopmentalHeatmap | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHeatmap = async () => {
      setLoading(true);
      try {
        const data = await childContinuityService.getClassroomDevelopmentalHeatmap(classId, schoolId);
        setHeatmap(data);
      } catch (err) {
        console.error('Failed to load heatmap:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHeatmap();
  }, [schoolId, classId]);

  if (loading) {
    return (
      <div className="bg-surface rounded-3xl border border-line p-8 text-center text-xs text-ink-soft font-bold">
        Memproyeksikan peta kesiapan perkembangan rombel...
      </div>
    );
  }

  if (!heatmap) return null;

  const elementKeys: LppaElementKey[] = [
    'NILAI_AGAMA_BUDI_PEKERTI',
    'JATI_DIRI',
    'LITERASI_STEAM',
    'PROJEK_P5'
  ];

  return (
    <div className="px-4 medium:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER CARD */}
      <div className="bg-surface border-y medium:border medium:border-line medium:rounded-3xl p-4 medium:p-6 medium:shadow-hairline flex flex-col expanded:flex-row expanded:items-center justify-between gap-6 -mx-4 expanded:mx-0">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-card bg-indigo-600 text-on-brand shadow-ambient shadow-indigo-600/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-ink">
                Peta Kesiapan & Kontinuitas Perkembangan Rombel
              </h3>
              <span className="px-2 py-1 text-xs font-black rounded-lg bg-indigo-100 text-lppa-deep border border-lppa-line">
                {heatmap.class_name}
              </span>
            </div>
            <p className="text-xs text-ink-soft font-medium mt-1">
              {heatmap.academic_year_id} • Semester {heatmap.semester} • Supervisi Akademik Kepala Sekolah & Yayasan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-surface-subtle px-4 py-2 rounded-card border border-line text-center">
            <div className="text-[10px] font-bold text-ink-soft">Total Siswa</div>
            <div className="text-sm font-black text-ink">{heatmap.total_students_count} Anak</div>
          </div>

          <div className="bg-success-tint px-4 py-2 rounded-card border border-success-line text-center">
            <div className="text-[10px] font-bold text-success-deep">Rencana Aktif</div>
            <div className="text-sm font-black text-success-deep">{heatmap.active_plans_count} Rencana</div>
          </div>
        </div>
      </div>

      {/* 4 ELEMENTS DISTRIBUTION GRID */}
      <div className="flex flex-col expanded:grid medium:grid-cols-2 divide-y divide-line-soft expanded:divide-none gap-0 medium:gap-4 -mx-4 expanded:mx-0">
        {elementKeys.map(k => {
          const item = heatmap.element_distribution[k];
          if (!item) return null;

          const total = item.mb_count + item.bsh_count + item.bsb_count || 1;
          const mbPct = Math.round((item.mb_count / total) * 100);
          const bshPct = Math.round((item.bsh_count / total) * 100);
          const bsbPct = Math.round((item.bsb_count / total) * 100);

          return (
            <div key={k} className="bg-surface p-4 medium:p-4 medium:rounded-3xl medium:border medium:border-line medium:shadow-hairline space-y-4">
              <div className="flex items-center justify-between border-b border-line-soft pb-3">
                <h4 className="text-xs font-black text-ink uppercase tracking-wider">
                  {item.element_title}
                </h4>
                <span className="text-[10px] font-bold text-ink-soft bg-surface-subtle px-2 py-1 rounded">
                  {total} Siswa Terpetakan
                </span>
              </div>

              {/* Multi-tier Progress Distribution Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black">
                  <span className="text-warning-deep">MB: {item.mb_count} ({mbPct}%)</span>
                  <span className="text-lppa-deep">BSH: {item.bsh_count} ({bshPct}%)</span>
                  <span className="text-success-deep">BSB: {item.bsb_count} ({bsbPct}%)</span>
                </div>
                
                <div className="w-full h-3 rounded-full bg-surface-subtle flex overflow-hidden border border-line">
                  <div style={{ width: `${mbPct}%` }} className="bg-warning h-full transition-[width] duration-300" title={`Mulai Berkembang: ${mbPct}%`} />
                  <div style={{ width: `${bshPct}%` }} className="bg-lppa h-full transition-[width] duration-300" title={`Berkembang Sesuai Harapan: ${bshPct}%`} />
                  <div style={{ width: `${bsbPct}%` }} className="bg-success h-full transition-[width] duration-300" title={`Berkembang Sangat Baik: ${bsbPct}%`} />
                </div>
              </div>

              {/* Priority Play Centers & Themes */}
              <div className="bg-surface-subtle p-3 rounded-card border border-line space-y-2 text-xs">
                <div className="text-[11px] font-bold text-ink-soft flex items-center gap-1">
                  <Lightbulb className="w-4 h-4 text-lppa" />
                  <span>Prioritas Sentra Bermain Rombel:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {item.priority_stimulation_centers.map((cnt: string, idx: number) => (
                    <span key={idx} className="px-2 py-1 text-[10px] font-black rounded-lg bg-lppa-tint text-lppa-deep border border-lppa-line">
                      {cnt.replace('SENTRA_', '')}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-ink-soft pt-1">
                  <strong>Tema Pertumbuhan: </strong> {item.common_growth_themes.join(', ')}
                </div>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
