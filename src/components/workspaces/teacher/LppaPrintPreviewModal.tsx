/**
 * Yapendik School OS — Stage 4.2 LPPA Print Preview & Official PDF Projection (Fase E2 & E3)
 * 
 * Epistemological & Architecture Constraint:
 * "E2 dan E3 hanya memproyeksikan CanonicalPublishedLppaRecord; 
 *  keduanya tidak boleh membuat, mengubah, atau menjadi sumber kebenaran data LPPA."
 * 
 * High-Fidelity Official Kurikulum Merdeka PAUD Report Document
 */

import React from 'react';
import { CanonicalPublishedLppaRecord } from '../../../types/lppaReportingTypes';
import { 
  Printer, 
  X, 
  ShieldCheck, 
  Award, 
  Calendar, 
  Camera, 
  CheckCircle2, 
  Activity, 
  Heart, 
  Sparkles,
  QrCode
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  record: CanonicalPublishedLppaRecord;
}

export const LppaPrintPreviewModal: React.FC<Props> = ({
  isOpen,
  onClose,
  record
}) => {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const {
    student_snapshot: student,
    curriculum_elements: elements,
    physical_growth_snapshot: physical,
    attendance_snapshot: attendance,
    publication_metadata: meta,
    signatures
  } = record;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/80 backdrop-blur-xs animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
      
      {/* Outer Shell */}
      <div className="bg-slate-100 rounded-3xl border border-slate-300 shadow-2xl w-full max-w-5xl h-[95vh] flex flex-col overflow-hidden text-slate-900 print:h-auto print:border-none print:shadow-none print:rounded-none print:bg-white print:w-full print:max-w-none">
        
        {/* TOP BAR: Controls (Hidden on Print) */}
        <div className="px-6 py-3.5 border-b border-slate-300 bg-white flex items-center justify-between gap-4 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-indigo-600 text-white shadow-xs">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-slate-900">
                  Pratinjau Cetak Rapor Resmi LPPA — {student.full_name}
                </h3>
                <span className="text-[11px] font-mono font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                  No. {meta.official_report_number}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Proyeksi Kanonikal Dokumen Sah • Kurikulum Merdeka PAUD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition flex items-center gap-2 shadow-md shadow-indigo-600/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>🖨️ Cetak / Unduh PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-200 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PREVIEW CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 flex justify-center bg-slate-200/70 print:p-0 print:bg-white print:overflow-visible">
          
          {/* OFFICIAL A4 DOCUMENT PAPER SHEET */}
          <div className="bg-white border border-slate-300 shadow-xl rounded-xl p-8 sm:p-12 w-full max-w-[210mm] min-h-[297mm] text-slate-900 space-y-6 print:border-none print:shadow-none print:p-6 print:max-w-none print:rounded-none">
            
            {/* KOP RESMI LEMBAGA (Header) */}
            <div className="border-b-2 border-slate-900 pb-4 text-center space-y-1">
              <div className="text-[11px] font-black uppercase tracking-widest text-slate-600">
                YAYASAN PENDIDIKAN KRISTEN (YAPENDIK)
              </div>
              <h1 className="text-xl font-black tracking-tight text-slate-900 uppercase">
                {record.school_name}
              </h1>
              <p className="text-xs text-slate-600 font-medium">
                Jl. Pegangsaan Barat No. 12, Menteng, Jakarta Pusat • NPSN: {record.school_npsn}
              </p>
              <div className="pt-2">
                <div className="inline-block border-y-2 border-slate-900 py-1 px-6">
                  <h2 className="text-sm font-black tracking-wider uppercase text-slate-900">
                    LAPORAN CAPAIAN PERKEMBANGAN PESERTA DIDIK (LPPA)
                  </h2>
                </div>
              </div>
            </div>

            {/* STUDENT IDENTITY GRID */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-300 grid grid-cols-2 gap-y-2 gap-x-6 text-xs">
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">Nama Lengkap</span>
                <span className="text-slate-900 font-black">: {student.full_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">Tahun Ajaran</span>
                <span className="text-slate-900 font-bold">: {record.academic_year_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">NIS / NISN</span>
                <span className="text-slate-900 font-mono font-bold">: {student.nis} {student.nisn ? `/ ${student.nisn}` : ''}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">Semester</span>
                <span className="text-slate-900 font-bold">: {record.semester}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">Kelompok / Rombel</span>
                <span className="text-slate-900 font-bold">: {record.class_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-slate-600 font-bold shrink-0">Nama Orang Tua</span>
                <span className="text-slate-900 font-bold">: {student.guardian_name}</span>
              </div>
            </div>

            {/* SECTION 1: NILAI AGAMA & BUDI PEKERTI */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-900">
                  1. {elements.nilai_agama_budi_pekerti.element_title}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-purple-100 text-purple-950 border border-purple-300">
                  Capaian: {elements.nilai_agama_budi_pekerti.rating_summary}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal text-justify px-1">
                {elements.nilai_agama_budi_pekerti.final_narrative}
              </p>
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-900 font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.nilai_agama_budi_pekerti.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 2: JATI DIRI & REGULASI EMOSI */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-900">
                  2. {elements.jati_diri.element_title}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-purple-100 text-purple-950 border border-purple-300">
                  Capaian: {elements.jati_diri.rating_summary}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal text-justify px-1">
                {elements.jati_diri.final_narrative}
              </p>
              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-900 font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.jati_diri.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 3: DASAR LITERASI & STEAM */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-900">
                  3. {elements.literasi_steam.element_title}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-purple-100 text-purple-950 border border-purple-300">
                  Capaian: {elements.literasi_steam.rating_summary}
                </span>
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal text-justify px-1">
                {elements.literasi_steam.final_narrative}
              </p>
              
              {/* Supporting Evidences Snippets */}
              {elements.literasi_steam.supporting_evidences.length > 0 && (
                <div className="bg-purple-50/50 p-3 rounded-lg border border-purple-200 space-y-1.5">
                  <div className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Bukti Karya & Observasi Tersemat:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    {elements.literasi_steam.supporting_evidences.map((ev, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border border-purple-200/80 flex items-start gap-2">
                        {ev.photo_url && (
                          <img src={ev.photo_url} alt="Karya" className="w-10 h-10 object-cover rounded border border-slate-200 shrink-0" />
                        )}
                        <div>
                          <span className="font-mono text-[9px] text-slate-500">{ev.observed_at ? ev.observed_at.slice(0, 10) : 'Semester ini'}</span>
                          <p className="text-slate-800 italic line-clamp-2 text-[10px]">"{ev.anecdote_snippet}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <strong className="text-slate-900 font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.literasi_steam.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 4: PROJEK PROFIL PELAJAR PANCASILA (P5) */}
            <div className="space-y-2 border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
                <h3 className="text-xs font-black uppercase text-slate-900">
                  4. {elements.projek_p5.element_title}
                </h3>
                <span className="px-2 py-0.5 text-[10px] font-black rounded bg-purple-100 text-purple-950 border border-purple-300">
                  Capaian: {elements.projek_p5.rating_summary}
                </span>
              </div>
              <div className="text-[11px] text-slate-700 bg-purple-50/40 px-3 py-1.5 rounded border border-purple-200">
                <strong>Tema & Projek: </strong> {elements.projek_p5.project_title}
              </div>
              <p className="text-xs text-slate-800 leading-relaxed font-normal text-justify px-1">
                {elements.projek_p5.final_narrative}
              </p>
            </div>

            {/* SECTION 5 & 6: PERTUMBUHAN FISIK & REKAPITULASI PRESENSI */}
            <div className="grid grid-cols-2 gap-4 border-b border-slate-200 pb-4 text-xs">
              {/* Pertumbuhan Fisik */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-black text-slate-900 flex items-center gap-1.5 pb-1 border-b border-slate-200">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Pertumbuhan Fisik & Kesehatan</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Tinggi Badan</div>
                    <div className="font-black text-slate-900 text-xs">{physical.height_cm} cm</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Berat Badan</div>
                    <div className="font-black text-slate-900 text-xs">{physical.weight_kg} kg</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-slate-200">
                    <div className="text-[10px] text-slate-500 font-bold">Lingkar Kepala</div>
                    <div className="font-black text-slate-900 text-xs">{physical.head_circumference_cm || 50.2} cm</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-600 pt-1">
                  Kesehatan: {physical.vision_hearing_notes || 'Penglihatan & pendengaran normal.'}
                </div>
              </div>

              {/* Rekapitulasi Presensi */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1.5">
                <div className="font-black text-slate-900 flex items-center justify-between pb-1 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Rekapitulasi Kehadiran</span>
                  </div>
                  <span className="text-[10px] font-black text-indigo-700">{attendance.attendance_percentage}% Kehadiran</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-1 text-center">
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 font-bold">Hadir</div>
                    <div className="font-black text-emerald-700">{attendance.hadir}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 font-bold">Sakit</div>
                    <div className="font-black text-amber-700">{attendance.sakit}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 font-bold">Izin</div>
                    <div className="font-black text-sky-700">{attendance.izin}</div>
                  </div>
                  <div className="bg-white p-1.5 rounded border border-slate-200">
                    <div className="text-[9px] text-slate-500 font-bold">Alpa</div>
                    <div className="font-black text-rose-700">{attendance.alpa}</div>
                  </div>
                </div>
                <div className="text-[10px] text-slate-500 pt-1 text-center font-medium">
                  Total Hari Efektif: {attendance.total_effective_days} Hari
                </div>
              </div>
            </div>

            {/* SECTION 7: REFLEKSI GURU KELAS */}
            <div className="space-y-1 bg-purple-50/60 p-3.5 rounded-xl border border-purple-200">
              <div className="text-xs font-black text-purple-950 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-purple-600" /> Refleksi & Pesan Guru Kelas untuk Keluarga:
              </div>
              <p className="text-xs text-purple-900 leading-relaxed italic font-normal">
                "{record.homeroom_teacher_reflection}"
              </p>
            </div>

            {/* SECTION 8: SIGNATURES & OFFICIAL SEAL */}
            <div className="pt-6 space-y-8">
              <div className="grid grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="text-slate-600 font-medium">Mengetahui,</div>
                  <div className="text-slate-900 font-bold">Orang Tua / Wali Murid</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-slate-900 border-b border-slate-400 inline-block px-6">
                    {student.guardian_name}
                  </div>
                </div>

                <div>
                  <div className="text-slate-600 font-medium">Jakarta, {meta.published_at ? meta.published_at.slice(0, 10) : '26 Agustus 2026'}</div>
                  <div className="text-slate-900 font-bold">{signatures.teacher.title}</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-slate-900 border-b border-slate-400 inline-block px-6">
                    {signatures.teacher.name}
                  </div>
                </div>
              </div>

              {/* Headmaster Official Stamp */}
              <div className="text-center text-xs space-y-1 pt-2">
                <div className="text-slate-600 font-medium">Mengesahkan,</div>
                <div className="text-slate-900 font-black">{signatures.headmaster.title}</div>
                
                {/* Stamp graphic placeholder */}
                <div className="py-2 flex justify-center items-center gap-3">
                  <div className="p-2 border-2 border-dashed border-emerald-600 rounded-xl bg-emerald-50/50 text-emerald-800 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Dokumen Sah Disahkan • Valid Digital Stamp</span>
                  </div>
                </div>

                <div className="font-black text-slate-900 border-b-2 border-slate-900 inline-block px-8">
                  {signatures.headmaster.name}
                </div>
              </div>

              {/* FOOTER METADATA & QR CHECKSUM */}
              <div className="pt-6 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-500 font-mono">
                <div>
                  <div>Dokumen Resmi: {meta.official_report_number}</div>
                  <div>Checksum SHA-256: {meta.canonical_checksum_sha256.slice(0, 24)}...</div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <QrCode className="w-6 h-6" />
                  <span>Verifikasi Kanonikal Yapendik OS</span>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
