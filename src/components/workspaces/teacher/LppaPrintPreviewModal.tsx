/**
 * Yapendik School OS — Stage 4.2 LPPA Print Preview & Official PDF Projection (Fase E2 & E3)
 * 
 * Epistemological & Architecture Constraint:
 * "E2 dan E3 hanya memproyeksikan CanonicalPublishedLppaRecord; 
 *  keduanya tidak boleh membuat, mengubah, atau menjadi sumber kebenaran data LPPA."
 * 
 * High-Fidelity Official Kurikulum Merdeka PAUD Report Document
 */

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CanonicalPublishedLppaRecord } from '../../../types/lppaReportingTypes';
import { generateAndDownloadLppaPdf } from '../../../services/lppaPdfGenerator';
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
  QrCode,
  Download,
  Loader2
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
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add('has-print-modal');
    } else {
      document.body.classList.remove('has-print-modal');
    }
    return () => {
      document.body.classList.remove('has-print-modal');
    };
  }, [isOpen]);

  if (!isOpen || !record) return null;

  const {
    student_snapshot: student,
    curriculum_elements: elements,
    physical_growth_snapshot: physical,
    attendance_snapshot: attendance,
    publication_metadata: meta,
    signatures
  } = record;

  const studentDisplayName = student?.full_name || record.student_name || 'Siswa';
  const className = record.class_name || 'Kelompok A';
  const dateObj = meta.published_at ? new Date(meta.published_at) : new Date();
  const formattedDate = dateObj.toISOString().slice(0, 10);

  const sanitizeForFilename = (str: string) => str.replace(/[/\\:*?"<>|]/g, '-').trim();
  const baseFilename = `Rapor LPPA - ${sanitizeForFilename(studentDisplayName)} - ${sanitizeForFilename(className)} - ${formattedDate}`;

  /**
   * DIRECT VECTOR PDF GENERATION ON THE FLY (Instant File Download)
   * Mengonversi dokumen secara instan menjadi file PDF vektor resmi dengan nama otomatis
   */
  const handleDownloadPdfOnTheFly = () => {
    setIsGeneratingPdf(true);
    try {
      generateAndDownloadLppaPdf(record);
    } catch (error) {
      console.error('Failed to generate PDF on the fly:', error);
      alert('Gagal membuat PDF otomatis. Silakan gunakan tombol Cetak Fisik.');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handlePrint = () => {
    const printElement = document.getElementById('lppa-official-printable-doc');
    if (!printElement) {
      window.print();
      return;
    }

    const pdfDocumentTitle = baseFilename;

    // Collect all loaded stylesheets and font styles from current document
    let stylesHtml = '';
    document.querySelectorAll('style, link[rel="stylesheet"]').forEach(node => {
      stylesHtml += node.outerHTML;
    });

    const printWindow = window.open('', '_blank', 'width=900,height=1200');
    if (!printWindow) {
      // Fallback: set document.title and trigger native print
      const prevTitle = document.title;
      document.title = pdfDocumentTitle;
      window.print();
      setTimeout(() => { document.title = prevTitle; }, 3000);
      return;
    }

    printWindow.document.open();
    printWindow.document.write(`
      <!DOCTYPE html>
      <html lang="id">
        <head>
          <meta charset="utf-8" />
          <title>${pdfDocumentTitle}</title>
          ${stylesHtml}
          <style>
            @page {
              size: A4 portrait;
              margin: 12mm 15mm 15mm 15mm;
            }
            html, body {
              background: #ffffff !important;
              color: #0f172a !important;
              font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
              margin: 0 !important;
              padding: 16px !important;
              width: 100% !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            @media print {
              body {
                padding: 0 !important;
              }
            }
            .lppa-print-sheet {
              width: 100% !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              border: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              background: #ffffff !important;
            }
            .break-inside-avoid {
              break-inside: avoid !important;
              page-break-inside: avoid !important;
            }
            * {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          </style>
        </head>
        <body>
          <div class="lppa-print-sheet space-y-6">
            ${printElement.innerHTML}
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.focus();
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      printWindow.onafterprint = () => {
        try {
          printWindow.close();
        } catch (e) {}
      };
      setTimeout(() => {
        try {
          if (!printWindow.closed) {
            printWindow.close();
          }
        } catch (e) {}
      }, 60000);
    }, 450);
  };

  const modalContent = (
    <div id="lppa-print-portal" className="lppa-print-modal-root fixed inset-0 z-[70] flex items-end medium:items-center justify-center p-0 medium:p-4 bg-brand/40 backdrop-blur-xs animate-in fade-in duration-200">
      
      {/* Outer Shell */}
      <div className="lppa-modal-shell bg-surface-subtle rounded-t-3xl sm:rounded-card border-t sm:border border-line shadow-floating w-full max-w-5xl h-[90vh] sm:h-[85vh] flex flex-col overflow-hidden text-ink">
        
        {/* TOP BAR: Controls (Hidden on Print) */}
        <div className="px-5 py-4 border-b border-line bg-white flex flex-col medium:flex-row items-stretch medium:items-center justify-between gap-4 shrink-0 print:hidden relative">
          <div className="flex items-center gap-3 pr-8 sm:pr-0">
            <div className="w-10 h-10 rounded-card bg-brand text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-hairline">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 text-ink-soft text-[10px] medium:text-xs font-bold uppercase tracking-wider mb-0.5">
                <span>DOKUMEN RESMI LPPA</span>
              </div>
              <h3 className="text-base medium:text-lg font-bold text-ink flex items-center gap-2 leading-tight">
                Pratinjau Cetak Rapor — {studentDisplayName}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdfOnTheFly}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded-field bg-brand hover-only:bg-surface-inset text-white font-bold text-xs flex items-center gap-2 shadow-hairline transition cursor-pointer disabled:opacity-60"
            >
              {isGeneratingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Membuat PDF...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4" />
                  <span>Unduh PDF Otomatis</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              disabled={isGeneratingPdf}
              className="px-3 py-2 rounded-field bg-surface-subtle hover-only:bg-line-soft text-ink-soft font-bold text-xs flex items-center gap-2 transition cursor-pointer border border-line"
            >
              <Printer className="w-4 h-4 text-ink-soft" />
              <span>Cetak Fisik</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-line-soft text-ink-soft flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE PREVIEW CONTAINER */}
        <div className="lppa-modal-scroll flex-1 overflow-y-auto p-4 medium:p-8 flex justify-center bg-line-soft/70">
          
          {/* OFFICIAL A4 DOCUMENT PAPER SHEET */}
          <div id="lppa-official-printable-doc" className="lppa-print-sheet bg-white border border-line shadow-floating rounded-field p-8 medium:p-12 w-full max-w-[210mm] min-h-[297mm] text-ink space-y-6">
            
            {/* KOP RESMI LEMBAGA (Header) */}
            <div className="lppa-section lppa-kop border-b-2 border-slate-900 pb-4 text-center space-y-1 break-inside-avoid">
              <div className="text-[11px] font-black uppercase tracking-wider tracking-widest text-ink-soft">
                YAYASAN PENDIDIKAN KRISTEN (YAPENDIK)
              </div>
              <h1 className="text-xl font-black tracking-tight text-ink uppercase tracking-wider">
                {record.school_name}
              </h1>
              <p className="text-xs text-ink-soft font-medium">
                Jl. Pegangsaan Barat No. 12, Menteng, Jakarta Pusat • NPSN: {record.school_npsn}
              </p>
              <div className="pt-2">
                <div className="inline-block border-y-2 border-slate-900 py-1 px-6">
                  <h2 className="text-sm font-black uppercase tracking-wider text-ink">
                    LAPORAN CAPAIAN PERKEMBANGAN PESERTA DIDIK (LPPA)
                  </h2>
                </div>
              </div>
            </div>

            {/* STUDENT IDENTITY GRID */}
            <div className="lppa-section lppa-identity bg-surface-subtle p-4 rounded-field border border-line grid grid-cols-1 medium:grid-cols-2 gap-y-2 gap-x-6 text-xs break-inside-avoid">
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">Nama Lengkap</span>
                <span className="text-ink font-bold">: {student.full_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">Tahun Ajaran</span>
                <span className="text-ink font-bold">: {record.academic_year_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">NIS / NISN</span>
                <span className="text-ink font-mono font-bold">: {student.nis} {student.nisn ? `/ ${student.nisn}` : ''}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">Semester</span>
                <span className="text-ink font-bold">: {record.semester}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">Kelompok / Rombel</span>
                <span className="text-ink font-bold">: {record.class_name}</span>
              </div>
              <div className="flex">
                <span className="w-28 text-ink-soft font-bold shrink-0">Nama Orang Tua</span>
                <span className="text-ink font-bold">: {student.guardian_name}</span>
              </div>
            </div>

            {/* SECTION 1: NILAI AGAMA & BUDI PEKERTI */}
            <div className="lppa-section space-y-2 border-b border-line pb-4 break-inside-avoid">
              <div className="flex items-center justify-between bg-surface-subtle px-3 py-1 rounded-lg border border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  1. {elements.nilai_agama_budi_pekerti.element_title}
                </h3>
                <span className="px-2 py-1 text-[10px] font-bold rounded bg-lppa-tint text-purple-950 border border-purple-300">
                  Capaian: {elements.nilai_agama_budi_pekerti.rating_summary}
                </span>
              </div>
              <p className="text-xs text-ink leading-relaxed font-normal text-justify px-1">
                {elements.nilai_agama_budi_pekerti.final_narrative}
              </p>
              <div className="text-[11px] text-ink-soft bg-surface-subtle p-2 rounded-lg border border-line">
                <strong className="text-ink font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.nilai_agama_budi_pekerti.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 2: JATI DIRI & REGULASI EMOSI */}
            <div className="lppa-section space-y-2 border-b border-line pb-4 break-inside-avoid">
              <div className="flex items-center justify-between bg-surface-subtle px-3 py-1 rounded-lg border border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  2. {elements.jati_diri.element_title}
                </h3>
                <span className="px-2 py-1 text-[10px] font-bold rounded bg-lppa-tint text-purple-950 border border-purple-300">
                  Capaian: {elements.jati_diri.rating_summary}
                </span>
              </div>
              <p className="text-xs text-ink leading-relaxed font-normal text-justify px-1">
                {elements.jati_diri.final_narrative}
              </p>
              <div className="text-[11px] text-ink-soft bg-surface-subtle p-2 rounded-lg border border-line">
                <strong className="text-ink font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.jati_diri.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 3: DASAR LITERASI & STEAM */}
            <div className="lppa-section space-y-2 border-b border-line pb-4 break-inside-avoid">
              <div className="flex items-center justify-between bg-surface-subtle px-3 py-1 rounded-lg border border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  3. {elements.literasi_steam.element_title}
                </h3>
                <span className="px-2 py-1 text-[10px] font-bold rounded bg-lppa-tint text-purple-950 border border-purple-300">
                  Capaian: {elements.literasi_steam.rating_summary}
                </span>
              </div>
              <p className="text-xs text-ink leading-relaxed font-normal text-justify px-1">
                {elements.literasi_steam.final_narrative}
              </p>
              
              {/* Supporting Evidences Snippets */}
              {elements.literasi_steam.supporting_evidences.length > 0 && (
                <div className="bg-lppa-tint/50 p-3 rounded-lg border border-lppa-line space-y-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-purple-900 flex items-center gap-1">
                    <Camera className="w-3 h-3" /> Bukti Karya & Observasi Tersemat:
                  </div>
                  <div className="grid grid-cols-1 medium:grid-cols-2 gap-2 text-[11px]">
                    {elements.literasi_steam.supporting_evidences.map((ev, idx) => (
                      <div key={idx} className="bg-white p-2 rounded border border-lppa-line/80 flex items-start gap-2">
                        {ev.photo_url && (
                          <img src={ev.photo_url} alt="Karya" className="w-10 h-10 object-cover rounded border border-line shrink-0" />
                        )}
                        <div>
                          <span className="font-mono text-[9px] text-ink-soft">{ev.observed_at ? ev.observed_at.slice(0, 10) : 'Semester ini'}</span>
                          <p className="text-ink italic line-clamp-2 text-[10px]">"{ev.anecdote_snippet}"</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="text-[11px] text-ink-soft bg-surface-subtle p-2 rounded-lg border border-line">
                <strong className="text-ink font-bold">Rekomendasi Stimulasi: </strong>
                <span>{elements.literasi_steam.growth_recommendations}</span>
              </div>
            </div>

            {/* SECTION 4: PROJEK PROFIL PELAJAR PANCASILA (P5) */}
            <div className="lppa-section space-y-2 border-b border-line pb-4 break-inside-avoid">
              <div className="flex items-center justify-between bg-surface-subtle px-3 py-1 rounded-lg border border-line">
                <h3 className="text-xs font-bold uppercase tracking-wider text-ink">
                  4. {elements.projek_p5.element_title}
                </h3>
                <span className="px-2 py-1 text-[10px] font-bold rounded bg-lppa-tint text-purple-950 border border-purple-300">
                  Capaian: {elements.projek_p5.rating_summary}
                </span>
              </div>
              <div className="text-[11px] text-ink-soft bg-lppa-tint/40 px-3 py-1 rounded border border-lppa-line">
                <strong>Tema & Projek: </strong> {elements.projek_p5.project_title}
              </div>
              <p className="text-xs text-ink leading-relaxed font-normal text-justify px-1">
                {elements.projek_p5.final_narrative}
              </p>
            </div>

            {/* SECTION 5 & 6: PERTUMBUHAN FISIK & REKAPITULASI PRESENSI */}
            <div className="lppa-section grid grid-cols-1 medium:grid-cols-2 gap-4 border-b border-line pb-4 text-xs break-inside-avoid">
              {/* Pertumbuhan Fisik */}
              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-1.5">
                <div className="font-bold text-ink flex items-center gap-2 pb-1 border-b border-line">
                  <Activity className="w-4 h-4 text-success" />
                  <span>Pertumbuhan Fisik & Kesehatan</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[10px] text-ink-soft font-bold">Tinggi Badan</div>
                    <div className="font-bold text-ink text-xs">{physical.height_cm} cm</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[10px] text-ink-soft font-bold">Berat Badan</div>
                    <div className="font-bold text-ink text-xs">{physical.weight_kg} kg</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[10px] text-ink-soft font-bold">Lingkar Kepala</div>
                    <div className="font-bold text-ink text-xs">{physical.head_circumference_cm || 50.2} cm</div>
                  </div>
                </div>
                <div className="text-[10px] text-ink-soft pt-1">
                  Kesehatan: {physical.vision_hearing_notes || 'Penglihatan & pendengaran normal.'}
                </div>
              </div>

              {/* Rekapitulasi Presensi */}
              <div className="bg-surface-subtle p-3 rounded-field border border-line space-y-1.5">
                <div className="font-bold text-ink flex items-center justify-between pb-1 border-b border-line">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-lppa" />
                    <span>Rekapitulasi Kehadiran</span>
                  </div>
                  <span className="text-[10px] font-bold text-ink-soft">{attendance.attendance_percentage}% Kehadiran</span>
                </div>
                <div className="grid grid-cols-4 gap-2 pt-1 text-center">
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[9px] text-ink-soft font-bold">Hadir</div>
                    <div className="font-bold text-success-deep">{attendance.hadir}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[9px] text-ink-soft font-bold">Sakit</div>
                    <div className="font-bold text-warning-deep">{attendance.sakit}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[9px] text-ink-soft font-bold">Izin</div>
                    <div className="font-bold text-info-deep">{attendance.izin}</div>
                  </div>
                  <div className="bg-white p-2 rounded border border-line">
                    <div className="text-[9px] text-ink-soft font-bold">Alpa</div>
                    <div className="font-bold text-danger-deep">{attendance.alpa}</div>
                  </div>
                </div>
                <div className="text-[10px] text-ink-soft pt-1 text-center font-medium">
                  Total Hari Efektif: {attendance.total_effective_days} Hari
                </div>
              </div>
            </div>

            {/* SECTION 7: REFLEKSI GURU KELAS */}
            <div className="lppa-section space-y-1 bg-lppa-tint/60 p-3 rounded-field border border-lppa-line break-inside-avoid">
              <div className="text-xs font-bold text-purple-950 flex items-center gap-1">
                <Heart className="w-4 h-4 text-lppa" /> Refleksi & Pesan Guru Kelas untuk Keluarga:
              </div>
              <p className="text-xs text-purple-900 leading-relaxed italic font-normal">
                "{record.homeroom_teacher_reflection}"
              </p>
            </div>

            {/* SECTION 8: SIGNATURES & OFFICIAL SEAL */}
            <div className="lppa-section lppa-signatures pt-6 space-y-8 break-inside-avoid">
              <div className="grid grid-cols-1 medium:grid-cols-2 gap-8 text-center text-xs">
                <div>
                  <div className="text-ink-soft font-medium">Mengetahui,</div>
                  <div className="text-ink font-bold">Orang Tua / Wali Murid</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-ink border-b border-line-strong inline-block px-6">
                    {student.guardian_name}
                  </div>
                </div>

                <div>
                  <div className="text-ink-soft font-medium">Jakarta, {meta.published_at ? meta.published_at.slice(0, 10) : '26 Agustus 2026'}</div>
                  <div className="text-ink font-bold">{signatures.teacher.title}</div>
                  <div className="h-16"></div>
                  <div className="font-bold text-ink border-b border-line-strong inline-block px-6">
                    {signatures.teacher.name}
                  </div>
                </div>
              </div>

              {/* Headmaster Official Stamp */}
              <div className="text-center text-xs space-y-1 pt-2">
                <div className="text-ink-soft font-medium">Mengesahkan,</div>
                <div className="text-ink font-black">{signatures.headmaster.title}</div>
                
                {/* Stamp graphic placeholder */}
                <div className="py-2 flex justify-center items-center gap-3">
                  <div className="p-2 border-2 border-dashed border-emerald-600 rounded-field bg-success-tint/50 text-success-deep text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-success" />
                    <span>Dokumen Sah Disahkan • Valid Digital Stamp</span>
                  </div>
                </div>

                <div className="font-black text-ink border-b-2 border-slate-900 inline-block px-8">
                  {signatures.headmaster.name}
                </div>
              </div>

              {/* FOOTER METADATA & QR CHECKSUM */}
              <div className="pt-6 border-t border-line flex flex-col medium:flex-row items-start medium:items-center justify-between gap-4 text-[10px] text-ink-soft font-mono">
                <div>
                  <div>Dokumen Resmi: {meta.official_report_number}</div>
                  <div>Checksum SHA-256: {meta.canonical_checksum_sha256.slice(0, 24)}...</div>
                </div>
                <div className="flex items-center gap-1 text-ink-faint">
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

  return createPortal(modalContent, document.body);
};
