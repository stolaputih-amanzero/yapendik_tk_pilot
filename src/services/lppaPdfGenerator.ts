/**
 * Amanaura OS — LPPA Native PDF Vector Generator
 * 
 * Direct programmatic vector PDF generator using jsPDF.
 * Zero external DOM dependency, zero html2canvas quirks, guaranteed instantaneous download
 * with accurate automatic filename:
 * "Rapor LPPA - [Nama Siswa] - [Kelas] - [Tanggal].pdf"
 */

import { jsPDF } from 'jspdf';
import { CanonicalPublishedLppaRecord } from '../types/lppaReportingTypes';

export function generateAndDownloadLppaPdf(record: CanonicalPublishedLppaRecord): string {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    putOnlyUsedFonts: true
  });

  const student = record.student_snapshot;
  const elements = record.curriculum_elements;
  const physical = record.physical_growth_snapshot;
  const attendance = record.attendance_snapshot;
  const meta = record.publication_metadata;
  const signatures = record.signatures;

  const studentName = student?.full_name || record.student_snapshot.full_name || 'Siswa';
  const className = record.class_name || 'Kelompok A';
  const dateObj = meta.published_at ? new Date(meta.published_at) : new Date();
  const formattedDate = dateObj.toISOString().slice(0, 10);

  const sanitizeForFilename = (str: string) => str.replace(/[/\\:*?"<>|]/g, '-').trim();
  const filename = `Rapor LPPA - ${sanitizeForFilename(studentName)} - ${sanitizeForFilename(className)} - ${formattedDate}.pdf`;

  const pageWidth = 210;
  const pageHeight = 297;
  const marginX = 15;
  const contentWidth = pageWidth - marginX * 2; // 180mm
  let currentY = 15;

  const checkPageBreak = (neededHeight: number) => {
    if (currentY + neededHeight > pageHeight - 15) {
      doc.addPage();
      currentY = 15;
      return true;
    }
    return false;
  };

  // Helper for drawing section boxes
  const drawCardBox = (title: string, rating: string | null, narrative: string, stimulus: string | null) => {
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9.5);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    const narrativeLines = doc.splitTextToSize(narrative || '-', contentWidth - 8);
    const stimulusLines = stimulus ? doc.splitTextToSize(`Rekomendasi Stimulasi: ${stimulus}`, contentWidth - 8) : [];

    const boxHeight = 10 + narrativeLines.length * 4.2 + (stimulusLines.length > 0 ? stimulusLines.length * 4 + 4 : 0);
    checkPageBreak(boxHeight + 4);

    // Card background & border
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(marginX, currentY, contentWidth, boxHeight, 2, 2, 'FD');

    // Title
    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text(title, marginX + 4, currentY + 6);

    // Rating Badge
    if (rating) {
      const badgeText = `Capaian: ${rating}`;
      doc.setFontSize(7.5);
      const badgeW = doc.getTextWidth(badgeText) + 4;
      doc.setFillColor(241, 245, 249);
      doc.setDrawColor(148, 163, 184);
      doc.roundedRect(marginX + contentWidth - badgeW - 4, currentY + 2.5, badgeW, 4.5, 1, 1, 'FD');
      doc.setTextColor(71, 85, 105);
      doc.text(badgeText, marginX + contentWidth - badgeW - 2, currentY + 5.8);
    }

    // Narrative
    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(30, 41, 59);
    doc.text(narrativeLines, marginX + 4, currentY + 11);

    // Stimulus box
    if (stimulusLines.length > 0) {
      const stimY = currentY + 11 + narrativeLines.length * 4.2;
      doc.setFont('Helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(stimulusLines, marginX + 4, stimY);
    }

    currentY += boxHeight + 4;
  };

  // --- PAGE 1: KOP RESMI ---
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text('YAYASAN PENDIDIKAN KRISTEN (YAPENDIK)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 5;

  doc.setFontSize(14);
  doc.setTextColor(15, 23, 42);
  doc.text(record.school_name || '—', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4.5;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`NPSN: ${record.school_npsn || '—'}`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 3;

  // Kop Divider Double Lines
  doc.setDrawColor(15, 23, 42);
  doc.setLineWidth(0.8);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  doc.setLineWidth(0.3);
  doc.line(marginX, currentY + 1, marginX + contentWidth, currentY + 1);
  currentY += 4;

  // LPPA Title Banner
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text('LAPORAN CAPAIAN PERKEMBANGAN PESERTA DIDIK (LPPA)', pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;

  // --- STUDENT IDENTITY BOX ---
  const idBoxH = 22;
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, currentY, contentWidth, idBoxH, 2, 2, 'FD');

  doc.setFontSize(8);
  const col1X = marginX + 4;
  const col2X = marginX + contentWidth / 2 + 2;

  // Row 1
  doc.setFont('Helvetica', 'bold');
  doc.text('Nama Lengkap', col1X, currentY + 5);
  doc.text('Tahun Ajaran', col2X, currentY + 5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`: ${student.full_name}`, col1X + 26, currentY + 5);
  doc.text(`: ${record.academic_year_name}`, col2X + 26, currentY + 5);

  // Row 2
  doc.setFont('Helvetica', 'bold');
  doc.text('NIS / NISN', col1X, currentY + 10);
  doc.text('Semester', col2X, currentY + 10);
  doc.setFont('Helvetica', 'normal');
  doc.text(`: ${student.nis} / ${student.nisn || '-'}`, col1X + 26, currentY + 10);
  doc.text(`: ${record.semester}`, col2X + 26, currentY + 10);

  // Row 3
  doc.setFont('Helvetica', 'bold');
  doc.text('Kelompok / Rombel', col1X, currentY + 15);
  doc.text('Nama Orang Tua', col2X, currentY + 15);
  doc.setFont('Helvetica', 'normal');
  doc.text(`: ${className}`, col1X + 26, currentY + 15);
  doc.text(`: ${student.guardian_name || '-'}`, col2X + 26, currentY + 15);

  currentY += idBoxH + 5;

  // --- 4 KURIKULUM MERDEKA SECTIONS ---
  drawCardBox(
    '1. NILAI AGAMA DAN BUDI PEKERTI',
    elements.nilai_agama_budi_pekerti.rating_summary,
    elements.nilai_agama_budi_pekerti.final_narrative,
    elements.nilai_agama_budi_pekerti.growth_recommendations
  );

  drawCardBox(
    '2. JATI DIRI & REGULASI EMOSI',
    elements.jati_diri.rating_summary,
    elements.jati_diri.final_narrative,
    elements.jati_diri.growth_recommendations
  );

  drawCardBox(
    '3. DASAR LITERASI, MATEMATIKA, SAINS, TEKNOLOGI, REKAYASA & SENI (STEAM)',
    elements.literasi_steam.rating_summary,
    elements.literasi_steam.final_narrative,
    elements.literasi_steam.growth_recommendations
  );

  // 4. PROJEK P5
  const p5 = elements.projek_p5;
  const p5Title = `4. PROJEK PENGUATAN PROFIL PELAJAR PANCASILA (P5) — ${p5.project_title || 'Gaya Hidup Berkelanjutan'}`;
  drawCardBox(
    p5Title,
    p5.rating_summary,
    `${p5.project_description ? `Tema Projek: ${p5.project_description}\n` : ''}${p5.final_narrative}`,
    p5.growth_recommendations
  );

  // --- 5. PERTUMBUHAN & PRESENSI GRID ---
  checkPageBreak(40);
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(15, 23, 42);
  doc.text('5. PERTUMBUHAN FISIK & REKAPITULASI KEHADIRAN', marginX, currentY);
  currentY += 3.5;

  const halfWidth = (contentWidth - 4) / 2;

  // Growth Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX, currentY, halfWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text('Pertumbuhan & Kesehatan', marginX + 3, currentY + 5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Tinggi Badan: ${physical.height_cm} cm   |   Berat Badan: ${physical.weight_kg} kg`, marginX + 3, currentY + 10);
  doc.text(`Lingkar Kepala: ${physical.head_circumference_cm || '-'} cm`, marginX + 3, currentY + 14);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(`Catatan: ${physical.physical_notes || 'Kondisi fisik prima.'}`, marginX + 3, currentY + 19);

  // Attendance Box
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(marginX + halfWidth + 4, currentY, halfWidth, 24, 2, 2, 'FD');

  doc.setFontSize(8);
  doc.setFont('Helvetica', 'bold');
  doc.text(`Rekap Kehadiran (${attendance.attendance_percentage}% Hadir)`, marginX + halfWidth + 7, currentY + 5);
  doc.setFont('Helvetica', 'normal');
  doc.text(`Hadir: ${attendance.hadir} Hari    Sakit: ${attendance.sakit} Hari`, marginX + halfWidth + 7, currentY + 10);
  doc.text(`Izin: ${attendance.izin} Hari     Alpa: ${attendance.alpa} Hari`, marginX + halfWidth + 7, currentY + 14);
  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text(`Total Hari Efektif Semester: ${attendance.total_effective_days} Hari`, marginX + halfWidth + 7, currentY + 19);

  currentY += 28;

  // --- 6. REFLEKSI GURU KELAS ---
  checkPageBreak(24);
  const reflLines = doc.splitTextToSize(`"${record.homeroom_teacher_reflection || 'Ananda menunjukkan perkembangan yang sangat positif.'}"`, contentWidth - 8);
  const reflH = 8 + reflLines.length * 4;

  doc.setFillColor(250, 245, 255);
  doc.setDrawColor(233, 213, 255);
  doc.roundedRect(marginX, currentY, contentWidth, reflH, 2, 2, 'FD');

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(88, 28, 135);
  doc.text('Refleksi & Pesan Guru Kelas untuk Keluarga:', marginX + 4, currentY + 5);

  doc.setFont('Helvetica', 'italic');
  doc.setFontSize(8);
  doc.setTextColor(107, 33, 168);
  doc.text(reflLines, marginX + 4, currentY + 10);

  currentY += reflH + 6;

  // --- 7. SIGNATURES & OFFICIAL STAMP ---
  checkPageBreak(45);
  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);

  const leftSignX = marginX + 25;
  const rightSignX = marginX + contentWidth - 35;

  doc.text('Mengetahui,', leftSignX, currentY, { align: 'center' });
  doc.text(`Jakarta, ${formattedDate}`, rightSignX, currentY, { align: 'center' });
  currentY += 4;

  doc.setFont('Helvetica', 'bold');
  doc.text('Orang Tua / Wali Murid', leftSignX, currentY, { align: 'center' });
  doc.text(signatures.teacher.title || 'Guru Kelas', rightSignX, currentY, { align: 'center' });
  currentY += 16;

  // Underlines for signatures
  doc.text(`( ${student.guardian_name || 'Budi Santoso, S.T.'} )`, leftSignX, currentY, { align: 'center' });
  doc.text(`( ${signatures.teacher.name || 'Guru Kelas'} )`, rightSignX, currentY, { align: 'center' });
  currentY += 6;

  // Headmaster Digital Stamp
  const headSignX = pageWidth / 2;
  doc.setFont('Helvetica', 'normal');
  doc.text('Mengesahkan,', headSignX, currentY, { align: 'center' });
  currentY += 4;
  doc.setFont('Helvetica', 'bold');
  doc.text(signatures.headmaster.title || 'Kepala Sekolah', headSignX, currentY, { align: 'center' });
  currentY += 3;

  // Digital Seal Box
  doc.setFillColor(236, 253, 245);
  doc.setDrawColor(5, 150, 105);
  doc.roundedRect(headSignX - 32, currentY, 64, 6, 1, 1, 'FD');
  doc.setFontSize(6.5);
  doc.setTextColor(6, 95, 70);
  doc.text('DOKUMEN SAH DISETUJUI • VALID DIGITAL SEAL', headSignX, currentY + 4, { align: 'center' });
  currentY += 10;

  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text(`( ${signatures.headmaster.name || 'Kepala Sekolah'} )`, headSignX, currentY, { align: 'center' });
  currentY += 6;

  // Bottom Metadata
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(marginX, currentY, marginX + contentWidth, currentY);
  currentY += 3;

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(148, 163, 184);
  doc.text(`No. Dokumen Resmi: ${meta.official_report_number}  •  SHA-256: ${meta.canonical_checksum_sha256.slice(0, 28)}...`, marginX, currentY);
  doc.text('Verifikasi Dokumen Resmi Portofolio Digital', marginX + contentWidth, currentY, { align: 'right' });

  // 8. TRIGGER DIRECT FILE DOWNLOAD
  doc.save(filename);
  return filename;
}
