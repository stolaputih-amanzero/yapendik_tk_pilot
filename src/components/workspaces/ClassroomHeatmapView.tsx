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
      <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-xs text-slate-500 font-bold">
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
    <div className="px-4 md:px-6 py-6 space-y-6 animate-in fade-in duration-200">
      
      {/* HEADER CARD */}
      <div className="bg-white border-y md:border md:border-slate-200 md:rounded-3xl p-4 md:p-6 md:shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-6 -mx-4 md:mx-0">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/20">
            <BarChart3 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-black text-slate-900">
                Peta Kesiapan & Kontinuitas Perkembangan Rombel
              </h3>
              <span className="px-2.5 py-0.5 text-xs font-black rounded-lg bg-indigo-100 text-indigo-900 border border-indigo-200">
                {heatmap.class_name}
              </span>
            </div>
            <p className="text-xs text-slate-600 font-medium mt-1">
              {heatmap.academic_year_id} • Semester {heatmap.semester} • Supervisi Akademik Kepala Sekolah & Yayasan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-slate-50 px-4 py-2.5 rounded-2xl border border-slate-200 text-center">
            <div className="text-[10px] font-bold text-slate-500">Total Siswa</div>
            <div className="text-sm font-black text-slate-900">{heatmap.total_students_count} Anak</div>
          </div>

          <div className="bg-emerald-50 px-4 py-2.5 rounded-2xl border border-emerald-200 text-center">
            <div className="text-[10px] font-bold text-emerald-700">Rencana Aktif</div>
            <div className="text-sm font-black text-emerald-950">{heatmap.active_plans_count} Rencana</div>
          </div>
        </div>
      </div>

      {/* 4 ELEMENTS DISTRIBUTION GRID */}
      <div className="flex flex-col md:grid md:grid-cols-2 divide-y divide-slate-100 md:divide-none gap-0 md:gap-4 -mx-4 md:mx-0">
        {elementKeys.map(k => {
          const item = heatmap.element_distribution[k];
          if (!item) return null;

          const total = item.mb_count + item.bsh_count + item.bsb_count || 1;
          const mbPct = Math.round((item.mb_count / total) * 100);
          const bshPct = Math.round((item.bsh_count / total) * 100);
          const bsbPct = Math.round((item.bsb_count / total) * 100);

          return (
            <div key={k} className="bg-white p-4 md:p-5 md:rounded-3xl md:border md:border-slate-200 md:shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-xs font-black text-slate-900 uppercase">
                  {item.element_title}
                </h4>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {total} Siswa Terpetakan
                </span>
              </div>

              {/* Multi-tier Progress Distribution Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-[11px] font-black">
                  <span className="text-amber-800">MB: {item.mb_count} ({mbPct}%)</span>
                  <span className="text-purple-800">BSH: {item.bsh_count} ({bshPct}%)</span>
                  <span className="text-emerald-800">BSB: {item.bsb_count} ({bsbPct}%)</span>
                </div>
                
                <div className="w-full h-3 rounded-full bg-slate-100 flex overflow-hidden border border-slate-200">
                  <div style={{ width: `${mbPct}%` }} className="bg-amber-400 h-full" title={`Mulai Berkembang: ${mbPct}%`} />
                  <div style={{ width: `${bshPct}%` }} className="bg-purple-500 h-full" title={`Berkembang Sesuai Harapan: ${bshPct}%`} />
                  <div style={{ width: `${bsbPct}%` }} className="bg-emerald-500 h-full" title={`Berkembang Sangat Baik: ${bsbPct}%`} />
                </div>
              </div>

              {/* Priority Play Centers & Themes */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-700 flex items-center gap-1">
                  <Lightbulb className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Prioritas Sentra Bermain Rombel:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {item.priority_stimulation_centers.map((cnt: string, idx: number) => (
                    <span key={idx} className="px-2 py-0.5 text-[10px] font-black rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200">
                      {cnt.replace('SENTRA_', '')}
                    </span>
                  ))}
                </div>

                <div className="text-[11px] text-slate-600 pt-1">
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
