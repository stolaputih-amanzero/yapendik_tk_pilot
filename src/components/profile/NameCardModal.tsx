/**
 * @file NameCardModal.tsx
 * @description CR80 "Agung" Name Card & Guardian Family Card Generator (ADR-UX-013 §4 & Addendum X)
 * 
 * Dimensions: CR80 Landscape (85.6mm × 54mm)
 * Persona Branching:
 * - Staff (Teacher/Headmaster/Superadmin): Professional Credential Card
 * - Guardian: "KARTU KELUARGA" Pickup Verification Card with Child Anchor & Guardian Metadata
 * Typography: Instrument Serif for Person/Child Name (allowlist compliant) + Plus Jakarta Sans for Metadata
 * Ornaments: Padma & Gunungan Watermark (<= 4% opacity) + Brass Corner Flourishes (15% opacity)
 * Security: QR Code contains strictly sanitized public application URL (ZERO tokens/passwords)
 * Privacy: ZERO child national identity numbers (NIK/NIS) rendered on card
 * Export: SegmentedControl [ PDF | PNG ] via jsPDF & Programmatic 300DPI Canvas
 */

import React, { useState, useRef, useEffect } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { PersonaProfile } from '../../auth/context';
import { 
  X, 
  Download, 
  Mail, 
  Phone, 
  Building2, 
  Sparkles,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  Users,
  ExternalLink
} from 'lucide-react';

// Canonical public URL for QR code on Name Card (Family & Staff variants)
export const APP_PUBLIC_URL = (import.meta as any).env?.VITE_APP_URL || 'https://tkm.amanloka.com';

interface NameCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: PersonaProfile;
}

export interface GuardianFamilyInfo {
  childName: string;
  childClass: string;
  childAvatarUrl: string | null;
  childSymbol: string;
  primaryGuardianName: string;
  primaryGuardianRelation: string;
  relatedGuardianName: string;
  relatedGuardianRelation: string;
}

/**
 * Formats a string to Title Case while preserving standard educational initials/degrees (e.g. 'R.', 'S.Pd')
 */
export function formatTitleCase(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .split(' ')
    .map(word => {
      if (!word) return '';
      // Retain uppercase for single-letter initials or dot-abbreviations (e.g. 'R.', 'R', 'S.Pd')
      if (/^[a-z]\.?$/i.test(word) || /^[a-z]+\.[a-z]+/i.test(word)) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

export function resolveGuardianFamilyInfo(profile: PersonaProfile): GuardianFamilyInfo {
  const customAvatar = (profile as any)?.childAvatarUrl || (profile as any)?.childAvatar || null;

  const isMillen = 
    profile.guardianChildrenPersonIds?.includes('per_child_millen') ||
    profile.name.toLowerCase().includes('julen') ||
    profile.id.includes('julen');

  if (isMillen) {
    return {
      childName: 'Jequaline Arabella (Millen)',
      childClass: 'Kelas TK A • Maranatha',
      childAvatarUrl: customAvatar,
      childSymbol: '🌟',
      primaryGuardianName: 'Julen Patricia',
      primaryGuardianRelation: 'Ibu Kandung',
      relatedGuardianName: 'Michael Maspaitella',
      relatedGuardianRelation: 'Ayah'
    };
  }

  const isKayla = 
    profile.guardianChildrenPersonIds?.includes('per_child_kayla') ||
    profile.name.toLowerCase().includes('mutiara') ||
    profile.id.includes('mutiara');

  if (isKayla) {
    return {
      childName: 'Kayla Gabriella Zega',
      childClass: 'Kelas TK B • Maranatha',
      childAvatarUrl: customAvatar,
      childSymbol: '🎈',
      primaryGuardianName: 'Mutiara Zega',
      primaryGuardianRelation: 'Ibu Kandung',
      relatedGuardianName: 'Bapak Zega',
      relatedGuardianRelation: 'Ayah'
    };
  }

  // Generic fallback for any other guardian persona
  return {
    childName: 'Ananda Siswa PAUD',
    childClass: 'Kelas TK A • Maranatha',
    childAvatarUrl: customAvatar,
    childSymbol: '🍀',
    primaryGuardianName: formatTitleCase(profile.name),
    primaryGuardianRelation: 'Wali Sah',
    relatedGuardianName: 'Keluarga Terdaftar',
    relatedGuardianRelation: 'Wali'
  };
}

// Helper to draw smooth rounded rectangle across all browser canvas implementations
function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

// Helper to safely load image for canvas drawing
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(e);
    img.src = src;
  });
}

/**
 * Programmatic High-Resolution CR80 Canvas Renderer (1712 × 1080px ~ 300-600 DPI)
 * Supports both Staff Professional Card and Guardian Family Card (Addendum X).
 */
async function renderNameCardCanvas(profile: PersonaProfile, qrDataUrl: string): Promise<HTMLCanvasElement> {
  const canvas = document.createElement('canvas');
  canvas.width = 1712;
  canvas.height = 1080;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D context unavailable');

  const isGuardian = profile.role === 'GUARDIAN';
  const familyInfo = isGuardian ? resolveGuardianFamilyInfo(profile) : null;

  // Enable high-quality image smoothing
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Card Background & Outer Border
  ctx.fillStyle = '#fbf9f5';
  drawRoundedRect(ctx, 16, 16, 1680, 1048, 56);
  ctx.fill();

  ctx.strokeStyle = '#e7e5e4';
  ctx.lineWidth = 4;
  ctx.stroke();

  // 2. Padma & Gunungan Watermark (Opacity <= 4%)
  ctx.save();
  ctx.globalAlpha = 0.035;
  ctx.fillStyle = '#4338ca';
  try {
    const path = new Path2D('M100 10 C85 45 40 70 40 120 C40 160 70 190 100 190 C130 190 160 160 160 120 C160 70 115 45 100 10 Z M100 45 C110 75 140 95 140 125 C140 150 120 170 100 170 C80 170 60 150 60 125 C60 95 90 75 100 45 Z');
    ctx.translate(856 - 270, 540 - 270);
    ctx.scale(2.7, 2.7);
    ctx.fill(path);
  } catch (e) {
    ctx.beginPath();
    ctx.arc(856, 540, 240, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // 3. Brass Corner Flourishes (15% Opacity)
  ctx.save();
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.22)';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';

  // Top-Left Flourish
  ctx.beginPath();
  ctx.moveTo(50, 110);
  ctx.arcTo(50, 50, 110, 50, 30);
  ctx.lineTo(130, 50);
  ctx.moveTo(50, 50);
  ctx.lineTo(80, 80);
  ctx.stroke();

  // Top-Right Flourish
  ctx.beginPath();
  ctx.moveTo(1662, 110);
  ctx.arcTo(1662, 50, 1602, 50, 30);
  ctx.lineTo(1582, 50);
  ctx.moveTo(1662, 50);
  ctx.lineTo(1632, 80);
  ctx.stroke();

  // Bottom-Left Flourish
  ctx.beginPath();
  ctx.moveTo(50, 970);
  ctx.arcTo(50, 1030, 110, 1030, 30);
  ctx.lineTo(130, 1030);
  ctx.moveTo(50, 1030);
  ctx.lineTo(80, 1000);
  ctx.stroke();

  // Bottom-Right Flourish
  ctx.beginPath();
  ctx.moveTo(1662, 970);
  ctx.arcTo(1662, 1030, 1602, 1030, 30);
  ctx.lineTo(1582, 1030);
  ctx.moveTo(1662, 1030);
  ctx.lineTo(1632, 1000);
  ctx.stroke();
  ctx.restore();

  if (isGuardian && familyInfo) {
    // ═══════════════════════════════════════════════════════════════════════
    // GUARDIAN FAMILY CARD VARIANT (ADR-UX-013 Addendum X)
    // ═══════════════════════════════════════════════════════════════════════

    // Header Bar: "✦ AMANAURA OS" + "KARTU KELUARGA"
    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 26px "Geist Mono", "JetBrains Mono", Menlo, monospace';
    ctx.textAlign = 'left';
    ctx.fillText('✦ AMANAURA OS', 80, 85);

    // Eyebrow Badge (Right)
    const badgeW = 280;
    const badgeH = 44;
    const badgeX = 1632 - badgeW;
    const badgeY = 55;
    ctx.fillStyle = '#fef3c7';
    drawRoundedRect(ctx, badgeX, badgeY, badgeW, badgeH, 22);
    ctx.fill();
    ctx.strokeStyle = '#fde68a';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#b45309';
    ctx.font = 'bold 22px "Geist Mono", "JetBrains Mono", Menlo, monospace';
    ctx.textAlign = 'center';
    ctx.fillText('KARTU KELUARGA', badgeX + badgeW / 2, badgeY + 30);

    // Header Hairline
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(80, 120);
    ctx.lineTo(1632, 120);
    ctx.stroke();

    // Visual Anchor: Child Avatar Squircle (Photo with fallback to Pastel + Initial)
    const anchorX = 80;
    const anchorY = 160;
    const anchorSize = 190;
    let childPhotoRendered = false;

    if (familyInfo.childAvatarUrl) {
      try {
        const childImg = await loadImage(familyInfo.childAvatarUrl);
        ctx.save();
        drawRoundedRect(ctx, anchorX, anchorY, anchorSize, anchorSize, 36);
        ctx.clip();
        ctx.drawImage(childImg, anchorX, anchorY, anchorSize, anchorSize);
        ctx.restore();

        ctx.strokeStyle = '#fde68a';
        ctx.lineWidth = 4;
        drawRoundedRect(ctx, anchorX, anchorY, anchorSize, anchorSize, 36);
        ctx.stroke();
        childPhotoRendered = true;
      } catch (e) {
        childPhotoRendered = false;
      }
    }

    if (!childPhotoRendered) {
      ctx.fillStyle = '#fef3c7';
      drawRoundedRect(ctx, anchorX, anchorY, anchorSize, anchorSize, 36);
      ctx.fill();
      ctx.strokeStyle = '#fde68a';
      ctx.lineWidth = 4;
      ctx.stroke();

      // Child Initial in Serif
      ctx.fillStyle = '#92400e';
      ctx.font = 'bold 88px "Instrument Serif", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(familyInfo.childName.charAt(0), anchorX + anchorSize / 2, anchorY + anchorSize / 2 - 6);

      // Child Symbol
      ctx.font = '40px sans-serif';
      ctx.fillText(familyInfo.childSymbol, anchorX + anchorSize - 28, anchorY + anchorSize - 24);
    }

    // Child Identity & Class (Anchor in Instrument Serif)
    const textStartX = 310;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';

    ctx.fillStyle = '#0f172a';
    ctx.font = 'normal 68px "Instrument Serif", Playfair Display, Georgia, serif';
    ctx.fillText(familyInfo.childName, textStartX, 230);

    ctx.fillStyle = '#64748b';
    ctx.font = '600 34px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(familyInfo.childClass, textStartX, 285);

    // Middle Divider Line
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(textStartX, 325);
    ctx.lineTo(1632, 325);
    ctx.stroke();

    // Guardian Information Block
    ctx.fillStyle = '#64748b';
    ctx.font = '500 30px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText('Orang Tua / Wali: ', textStartX, 380);

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 34px "Plus Jakarta Sans", "Inter", sans-serif';
    const guardianLabelW = ctx.measureText('Orang Tua / Wali: ').width;
    ctx.fillText(familyInfo.primaryGuardianName, textStartX + guardianLabelW - 10, 380);

    ctx.fillStyle = '#64748b';
    ctx.font = '500 30px "Plus Jakarta Sans", "Inter", sans-serif';
    const guardianNameW = ctx.measureText(familyInfo.primaryGuardianName).width;
    ctx.fillText(` (${familyInfo.primaryGuardianRelation})`, textStartX + guardianLabelW + guardianNameW - 5, 380);

    // Related Guardian
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 28px "Geist Mono", "JetBrains Mono", Menlo, monospace';
    ctx.fillText(`Terkait: ${familyInfo.relatedGuardianName} (${familyInfo.relatedGuardianRelation})`, textStartX, 435);

    // Dividing Hairline (Lower)
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 720);
    ctx.lineTo(1632, 720);
    ctx.stroke();

    // Contact Metadata (Bottom-Left)
    const contactX = 90;
    ctx.fillStyle = '#475569';
    ctx.font = '500 34px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(`✉  ${profile.email || 'julen.patricia@gmail.com'}`, contactX, 810);

    ctx.font = '600 34px "Geist Mono", "JetBrains Mono", Menlo, monospace';
    ctx.fillText(`☎  ${profile.phone || '+6281218641305'}`, contactX, 875);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 28px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText('Amanaura OS ✦ • Tahun Ajaran 2026/2027', contactX, 945);

  } else {
    // ═══════════════════════════════════════════════════════════════════════
    // STAFF PROFESSIONAL CARD VARIANT
    // ═══════════════════════════════════════════════════════════════════════

    // Avatar Drawing
    const avatarX = 180;
    const avatarY = 220;
    const avatarR = 100;

    if (profile.avatarUrl) {
      try {
        const avatarImg = await loadImage(profile.avatarUrl);
        ctx.save();
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, avatarX - avatarR, avatarY - avatarR, avatarR * 2, avatarR * 2);
        ctx.restore();

        ctx.strokeStyle = '#d6d3d1';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
        ctx.stroke();
      } catch (e) {
        drawStaffAvatarInitials();
      }
    } else {
      drawStaffAvatarInitials();
    }

    function drawStaffAvatarInitials() {
      const initials = profile.name
        ? profile.name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map(p => p[0])
            .join('')
            .toUpperCase()
        : 'U';

      ctx.save();
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#d6d3d1';
      ctx.lineWidth = 4;
      ctx.stroke();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 72px "Instrument Serif", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(initials, avatarX, avatarY + 4);
      ctx.restore();
    }

    // Name & Educational Identity
    const textStartX = 320;

    // Person Name (Instrument Serif 22pt allowlist in Title Case)
    const staffDisplayName = formatTitleCase(profile.name);
    ctx.fillStyle = '#0f172a';
    ctx.font = 'normal 72px "Instrument Serif", Playfair Display, Georgia, serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillText(staffDisplayName, textStartX, 185);

    // Role Title (Plus Jakarta Sans)
    ctx.fillStyle = '#64748b';
    ctx.font = '600 36px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(profile.roleTitle || profile.role, textStartX, 245);

    // School Unit (Plus Jakarta Sans)
    ctx.fillStyle = '#94a3b8';
    ctx.font = '500 32px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(profile.schoolName || 'TK YAPENDIK GPIB Cabang Maranatha', textStartX, 298);

    // Dividing Hairline
    ctx.strokeStyle = '#e7e5e4';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(80, 720);
    ctx.lineTo(1632, 720);
    ctx.stroke();

    // Contact Metadata (Bottom-Left)
    const contactX = 90;
    ctx.fillStyle = '#475569';
    ctx.font = '500 34px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText(`✉  ${profile.email || 'yapendikmaranathajkt@gmail.com'}`, contactX, 810);

    ctx.font = '600 34px "Geist Mono", "JetBrains Mono", Menlo, monospace';
    ctx.fillText(`☎  ${profile.phone || '+6281218641392'}`, contactX, 875);

    ctx.fillStyle = '#94a3b8';
    ctx.font = 'italic 28px "Plus Jakarta Sans", "Inter", sans-serif';
    ctx.fillText('Amanaura OS ✦ • Tahun Ajaran 2026/2027', contactX, 945);
  }

  // 8. Verified QR Code (Bottom-Right, common to both variants)
  if (qrDataUrl) {
    try {
      const qrImg = await loadImage(qrDataUrl);
      const qrX = 1380;
      const qrY = 750;
      const qrSize = 210;

      // QR white backing card
      ctx.fillStyle = '#ffffff';
      drawRoundedRect(ctx, qrX, qrY, qrSize, qrSize, 24);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Draw QR image
      ctx.drawImage(qrImg, qrX + 12, qrY + 12, qrSize - 24, qrSize - 24);

      // Verified Caption
      ctx.fillStyle = '#94a3b8';
      ctx.font = 'bold 22px "Geist Mono", "JetBrains Mono", Menlo, monospace';
      ctx.textAlign = 'center';
      ctx.fillText('TERVERIFIKASI', qrX + qrSize / 2, qrY + qrSize + 32);
    } catch (e) {
      console.warn('QR drawing failed', e);
    }
  }

  return canvas;
}

/**
 * Canonical single-gateway file download trigger
 */
export function triggerDownload(blob: Blob, filename: string): string {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.target = '_blank';
  a.rel = 'noopener noreferrer';
  document.body.appendChild(a);
  a.click();
  a.remove();
  return url;
}

/**
 * Human-readable slug generator for download filenames
 */
export function formatSlug(str: string): string {
  if (!str) return 'User';
  return str
    .replace(/[^a-zA-Z0-9\s_-]/g, '')
    .trim()
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join('-');
}

export const NameCardModal: React.FC<NameCardModalProps> = ({
  isOpen,
  onClose,
  profile
}) => {
  const [format, setFormat] = useState<'PDF' | 'PNG'>('PDF');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [downloadFilename, setDownloadFilename] = useState<string>('');
  const [childImgFailed, setChildImgFailed] = useState<boolean>(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const isGuardian = profile.role === 'GUARDIAN';
  const familyInfo = isGuardian ? resolveGuardianFamilyInfo(profile) : null;

  useEffect(() => {
    if (!isOpen) return;

    // Canonical public URL sanitized (strictly https://, zero credentials/tokens)
    const cleanUrl = APP_PUBLIC_URL.split('?')[0].split('#')[0];

    QRCode.toDataURL(cleanUrl, {
      width: 240,
      margin: 1,
      color: {
        dark: '#1e293b',
        light: '#ffffff'
      }
    })
      .then(url => setQrDataUrl(url))
      .catch(err => console.error('Failed to generate QR Code', err));
  }, [isOpen]);

  if (!isOpen) return null;

  const initials = profile.name
    ? profile.name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map(p => p[0])
        .join('')
        .toUpperCase()
    : 'U';

  const handleDownload = async () => {
    setIsGenerating(true);
    setStatusMessage(null);

    const baseSlug = isGuardian && familyInfo
      ? `KartuKeluarga_${formatSlug(familyInfo.childName)}`
      : `KartuNama_${formatSlug(profile.name)}`;

    const filename = format === 'PNG' 
      ? `${baseSlug}_Digital.png` 
      : `${baseSlug}_CR80.pdf`;

    try {
      // Direct high-DPI programmatic canvas generation (Zero html2canvas quirks, guaranteed instant)
      const canvas = await renderNameCardCanvas(profile, qrDataUrl);

      if (format === 'PNG') {
        canvas.toBlob((b) => {
          if (!b) {
            setStatusMessage('Gagal menyiapkan berkas gambar PNG.');
            setIsGenerating(false);
            return;
          }
          const finalBlob = new Blob([b], { type: 'image/png' });
          const url = triggerDownload(finalBlob, filename);
          setDownloadUrl(url);
          setDownloadFilename(filename);
          setStatusMessage(`${filename} berhasil diunduh.`);
          setIsGenerating(false);
        }, 'image/png');
      } else {
        // PDF Export: CR80 format in Landscape (85.6 mm × 54 mm)
        const imgData = canvas.toDataURL('image/jpeg', 0.98);

        const pdf = new jsPDF({
          orientation: 'landscape',
          unit: 'mm',
          format: [85.6, 54]
        });

        pdf.addImage(imgData, 'JPEG', 0, 0, 85.6, 54);
        const pdfBlob = pdf.output('blob');
        const finalBlob = new Blob([pdfBlob], { type: 'application/pdf' });
        const url = triggerDownload(finalBlob, filename);
        setDownloadUrl(url);
        setDownloadFilename(filename);
        setStatusMessage(`${filename} berhasil diunduh.`);
        setIsGenerating(false);
      }
    } catch (err: any) {
      console.error('Error generating card', err);
      setStatusMessage('Gagal membuat berkas kartu nama. Silakan coba lagi.');
      setIsGenerating(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-60 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="name-card-modal-title"
      data-testid="name-card-modal"
    >
      <div className="relative w-full max-w-xl bg-surface rounded-3xl border border-line-soft shadow-modal p-6 overflow-hidden flex flex-col space-y-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-accent-valor" />
            <h2 id="name-card-modal-title" className="text-base font-bold text-ink">
              {isGuardian ? 'Unduh Kartu Keluarga Digital' : 'Unduh Kartu Nama Digital'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-surface-subtle hover-only:bg-surface border border-line-hairline flex items-center justify-center text-ink-soft hover-only:text-ink cursor-pointer transition-colors"
            aria-label="Tutup Dialog Kartu Nama"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Format Selector: SegmentedControl [ PDF | PNG ] */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs font-semibold text-ink-soft">Pilih Format:</span>
          <div className="inline-flex p-1 rounded-xl bg-surface-subtle border border-line-hairline text-xs font-medium" role="radiogroup" aria-label="Format Berkas">
            <button
              type="button"
              onClick={() => setFormat('PDF')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                format === 'PDF'
                  ? 'bg-brand-primary text-on-brand font-bold shadow-xs'
                  : 'text-ink-soft hover-only:text-ink'
              }`}
              role="radio"
              aria-checked={format === 'PDF'}
              data-testid="format-pdf-toggle"
            >
              <FileText className="w-4 h-4" />
              <span>PDF</span>
            </button>
            <button
              type="button"
              onClick={() => setFormat('PNG')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                format === 'PNG'
                  ? 'bg-brand-primary text-on-brand font-bold shadow-xs'
                  : 'text-ink-soft hover-only:text-ink'
              }`}
              role="radio"
              aria-checked={format === 'PNG'}
              data-testid="format-png-toggle"
            >
              <ImageIcon className="w-4 h-4" />
              <span>PNG</span>
            </button>
          </div>
        </div>

        {/* CR80 Card Preview Area (Aspect ratio: 85.6 / 54 ≈ 1.585) */}
        <div className="w-full flex justify-center py-2">
          <div 
            ref={cardRef}
            data-testid="cr80-name-card-preview"
            className="relative w-full max-w-[428px] aspect-[856/540] rounded-2xl bg-[#fbf9f5] text-[#1c1917] border border-[#e7e5e4] shadow-md p-5 flex flex-col justify-between overflow-hidden select-none"
            style={{
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05)'
            }}
          >
            {/* Padma & Gunungan Watermark (opacity <= 4%) */}
            <div 
              className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.035]"
              aria-hidden="true"
            >
              <svg viewBox="0 0 200 200" className="w-64 h-64 text-[#4338ca] fill-current">
                <path d="M100 10 C85 45 40 70 40 120 C40 160 70 190 100 190 C130 190 160 160 160 120 C160 70 115 45 100 10 Z M100 45 C110 75 140 95 140 125 C140 150 120 170 100 170 C80 170 60 150 60 125 C60 95 90 75 100 45 Z" />
              </svg>
            </div>

            {/* Corner Flourishes in Brass (15% opacity) */}
            <div className="absolute top-2 left-2 w-6 h-6 text-[#d97706]/20 pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12C2 6.477 6.477 2 12 2M2 2L6 6" />
              </svg>
            </div>
            <div className="absolute top-2 right-2 w-6 h-6 text-[#d97706]/20 pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12C22 6.477 17.523 2 12 2M22 2L18 6" />
              </svg>
            </div>
            <div className="absolute bottom-2 left-2 w-6 h-6 text-[#d97706]/20 pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12C2 17.523 6.477 22 12 22M2 22L6 18" />
              </svg>
            </div>
            <div className="absolute bottom-2 right-2 w-6 h-6 text-[#d97706]/20 pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 12C22 17.523 17.523 22 12 22M22 22L18 18" />
              </svg>
            </div>

            {/* ══════════════ GUARDIAN FAMILY CARD VARIANT ══════════════ */}
            {isGuardian && familyInfo ? (
              <>
                {/* Top Eyebrow Bar */}
                <div className="relative z-10 flex items-center justify-between border-b border-[#e7e5e4]/80 pb-1 -mt-1">
                  <span className="text-[9px] font-mono font-bold text-[#b45309] tracking-wider uppercase">
                    ✦ AMANAURA OS
                  </span>
                  <span className="text-[8.5px] font-mono font-bold text-[#b45309] bg-[#fef3c7] px-2 py-0.5 rounded-full uppercase tracking-wider border border-[#fde68a]">
                    KARTU KELUARGA
                  </span>
                </div>

                {/* Main Identity: Child Visual Anchor + Instrument Serif Name + Guardian Block */}
                <div className="relative z-10 flex items-start space-x-3.5 pt-1 flex-1">
                  {/* Visual Anchor: Child Avatar (Photo with graceful fallback to Pastel + Initial) */}
                  <div className="relative w-13 h-13 rounded-2xl bg-amber-100/90 border border-amber-300 text-amber-900 flex items-center justify-center text-lg font-bold shrink-0 shadow-xs overflow-hidden">
                    {familyInfo.childAvatarUrl && !childImgFailed ? (
                      <img 
                        src={familyInfo.childAvatarUrl} 
                        alt={familyInfo.childName}
                        className="w-full h-full object-cover"
                        onError={() => setChildImgFailed(true)}
                        data-testid="family-card-child-photo"
                      />
                    ) : (
                      <>
                        <span className="font-serif text-xl">{familyInfo.childName.charAt(0)}</span>
                        <span className="absolute -bottom-1 -right-1 text-xs" aria-hidden="true">{familyInfo.childSymbol}</span>
                      </>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    {/* Child Name (Anchor in Instrument Serif) */}
                    <h1 className="font-serif text-[19px] leading-tight text-[#0f172a] font-normal tracking-tight truncate" data-testid="family-card-child-name">
                      {familyInfo.childName}
                    </h1>
                    <div className="text-[10px] font-sans font-semibold text-[#64748b] leading-tight mt-0.5 truncate">
                      {familyInfo.childClass}
                    </div>

                    {/* Guardian Information Block */}
                    <div className="pt-1.5 mt-1 border-t border-[#e7e5e4]/80 space-y-0.5">
                      <div className="text-[10.5px] font-sans text-[#334155] leading-tight truncate">
                        <span className="text-[#64748b]">Orang Tua/Wali: </span>
                        <span className="font-bold text-[#0f172a]">{familyInfo.primaryGuardianName}</span>
                        <span className="text-[10px] text-[#64748b]"> ({familyInfo.primaryGuardianRelation})</span>
                      </div>
                      <div className="text-[9px] font-mono text-[#64748b] leading-tight truncate">
                        <span className="text-[#94a3b8]">Terkait: </span>
                        <span>{familyInfo.relatedGuardianName} ({familyInfo.relatedGuardianRelation})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Zone: Contacts + Verified QR Code + Brand Line */}
                <div className="relative z-10 flex items-end justify-between pt-1 border-t border-[#e7e5e4]/80 mt-1">
                  <div className="space-y-0.5 text-[9.5px] font-sans text-[#475569] max-w-[62%]">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3 h-3 text-[#64748b] shrink-0" />
                      <span className="truncate font-mono">{profile.email || 'julen.patricia@gmail.com'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3 h-3 text-[#64748b] shrink-0" />
                      <span className="truncate font-mono">{profile.phone || '+6281218641305'}</span>
                    </div>
                    <div className="text-[8.5px] text-[#94a3b8] italic pt-0.5">
                      Amanaura OS ✦ • Tahun Ajaran 2026/2027
                    </div>
                  </div>

                  {/* Verified QR Code */}
                  <div className="flex flex-col items-center shrink-0">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code Aplikasi" 
                        className="w-13 h-13 rounded-lg bg-[#ffffff] p-1 border border-[#e2e8f0] shadow-xs"
                        data-testid="name-card-qr"
                      />
                    ) : (
                      <div className="w-13 h-13 rounded-lg bg-[#ffffff] border border-[#e2e8f0] animate-pulse" />
                    )}
                    <span className="text-[7px] font-mono text-[#94a3b8] mt-0.5 tracking-wider">TERVERIFIKASI</span>
                  </div>
                </div>
              </>
            ) : (
              /* ══════════════ STAFF PROFESSIONAL CARD VARIANT ══════════════ */
              <>
                {/* Top Identity Zone: Avatar + Name (Instrument Serif) + Role */}
                <div className="relative z-10 flex items-start space-x-3.5">
                  {profile.avatarUrl ? (
                    <img 
                      src={profile.avatarUrl} 
                      alt={profile.name} 
                      className="w-14 h-14 rounded-full object-cover border border-[#d6d3d1] shrink-0 shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-[#1e293b] text-[#f8fafc] flex items-center justify-center text-lg font-bold shrink-0 border border-[#d6d3d1] shadow-xs">
                      {initials}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    {/* Person Name in Instrument Serif (22pt / allowlist compliant in Title Case) */}
                    <h1 className="font-serif text-[21px] leading-tight text-[#0f172a] font-normal tracking-tight truncate" data-testid="staff-card-name">
                      {formatTitleCase(profile.name)}
                    </h1>
                    <div className="text-[11px] font-sans font-medium text-[#64748b] leading-tight mt-0.5 truncate">
                      {profile.roleTitle || profile.role}
                    </div>
                    <div className="text-[10px] font-sans text-[#94a3b8] leading-tight mt-0.5 truncate flex items-center space-x-1">
                      <Building2 className="w-3 h-3 text-[#d97706] shrink-0" />
                      <span>{profile.schoolName || 'TK Yapendik Maranatha'}</span>
                    </div>
                  </div>
                </div>

                {/* Middle & Bottom Zone: Contacts + Verified QR Code + Brand Line */}
                <div className="relative z-10 flex items-end justify-between pt-1 border-t border-[#e7e5e4]/80 mt-2">
                  <div className="space-y-1 text-[10px] font-sans text-[#475569] max-w-[62%]">
                    <div className="flex items-center space-x-1.5 truncate">
                      <Mail className="w-3 h-3 text-[#64748b] shrink-0" />
                      <span className="truncate">{profile.email || 'yapendikmaranathajkt@gmail.com'}</span>
                    </div>
                    <div className="flex items-center space-x-1.5 truncate">
                      <Phone className="w-3 h-3 text-[#64748b] shrink-0" />
                      <span className="truncate font-mono">{profile.phone || '+6281218641392'}</span>
                    </div>
                    <div className="text-[9px] text-[#94a3b8] italic pt-1">
                      Amanaura OS ✦ • Tahun Ajaran 2026/2027
                    </div>
                  </div>

                  {/* Verified QR Code */}
                  <div className="flex flex-col items-center shrink-0">
                    {qrDataUrl ? (
                      <img 
                        src={qrDataUrl} 
                        alt="QR Code Aplikasi" 
                        className="w-14 h-14 rounded-lg bg-[#ffffff] p-1 border border-[#e2e8f0] shadow-xs"
                        data-testid="name-card-qr"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-lg bg-[#ffffff] border border-[#e2e8f0] animate-pulse" />
                    )}
                    <span className="text-[7.5px] font-mono text-[#94a3b8] mt-0.5 tracking-wider">TERVERIFIKASI</span>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>

        {/* Status Feedback */}
        {statusMessage && (
          <div className="flex items-center space-x-2 text-xs text-brand-primary bg-brand-tint border border-brand-line/40 rounded-xl px-3.5 py-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span className="font-semibold">{statusMessage}</span>
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end space-x-3 pt-2 border-t border-line-hairline">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-ink-soft hover-only:text-ink hover-only:bg-surface-subtle transition-colors cursor-pointer"
          >
            Tutup
          </button>
          <button
            type="button"
            onClick={handleDownload}
            disabled={isGenerating}
            className="px-4 py-2 rounded-xl text-xs font-bold text-on-brand bg-brand-primary hover-only:opacity-95 transition-all shadow-soft flex items-center space-x-2 cursor-pointer disabled:opacity-50"
            data-testid="btn-download-namecard"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Membuat Berkas...' : `Unduh ${format}`}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
