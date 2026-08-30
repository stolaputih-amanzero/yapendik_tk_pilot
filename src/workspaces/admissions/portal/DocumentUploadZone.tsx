import React, { useState } from 'react';
import { AdmissionsDocument, DocumentType } from '../../../types/admissionsTypes';
import { admissionsService } from '../../../services/admissionsService';
import { ShieldCheck, Upload, CheckCircle2, Clock, AlertCircle, FileText, Paperclip } from 'lucide-react';

interface DocumentUploadZoneProps {
  applicantId: string;
  documents: AdmissionsDocument[];
  onUploadSuccess?: (newDoc: AdmissionsDocument) => void;
}

const REQUIRED_DOCS: { type: DocumentType; label: string; description: string; required: boolean }[] = [
  {
    type: 'KARTU_KELUARGA',
    label: 'Kartu Keluarga (KK)',
    description: 'Format PDF atau JPG/PNG (Maks. 5MB). Memuat NIK anak & orang tua.',
    required: true
  },
  {
    type: 'AKTA_KELAHIRAN',
    label: 'Akta Kelahiran Anak',
    description: 'Format PDF atau JPG/PNG (Maks. 5MB). Diterbitkan Disdukcapil.',
    required: true
  },
  {
    type: 'BUKU_IMUNISASI',
    label: 'Buku Kesehatan / Imunisasi',
    description: 'Halaman riwayat imunisasi dasar lengkap balita.',
    required: true
  },
  {
    type: 'FOTO_CALON_SISWA',
    label: 'Pas Foto Calon Siswa (3x4)',
    description: 'Foto berwarna terbaru dengan latar belakang polos.',
    required: false
  }
];

export const DocumentUploadZone: React.FC<DocumentUploadZoneProps> = ({
  applicantId,
  documents,
  onUploadSuccess
}) => {
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);

  const handleSimulatedUpload = async (docType: DocumentType, fileName: string) => {
    setUploadingType(docType);
    try {
      const newDoc = await admissionsService.uploadDocument(
        applicantId,
        docType,
        fileName,
        1024 * 1024 * 2, // 2MB
        'image/jpeg'
      );
      if (onUploadSuccess) onUploadSuccess(newDoc);
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploadingType(null);
    }
  };

  const getDocStatusBadge = (doc?: AdmissionsDocument) => {
    if (!doc) {
      return (
        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-surface-subtle text-ink-soft border border-line flex items-center gap-1">
          <Clock className="w-3 h-3 text-ink-faint" />
          <span>Belum Diunggah</span>
        </span>
      );
    }

    switch (doc.verification_status) {
      case 'VERIFIED_VALID':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-success-tint text-success-deep border border-success-line flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <span>Terverifikasi Valid</span>
          </span>
        );
      case 'REJECTED_INVALID':
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-danger-tint text-danger-deep border border-danger-line flex items-center gap-1">
            <AlertCircle className="w-4 h-4 text-danger" />
            <span>Ditolak: {doc.rejection_reason || 'Berkas Buram'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-bold rounded-full bg-warning-tint text-warning-deep border border-warning-line flex items-center gap-1">
            <Clock className="w-4 h-4 text-brand-primary" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-surface border border-line rounded-card p-4 medium:p-6 medium:p-8 shadow-hairline" data-testid="document-upload-zone">
      <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-3 mb-6 pb-4 border-b border-line-soft">
        <div>
          <h3 className="text-base medium:text-lg font-bold text-ink tracking-tight">Unggah Berkas Persyaratan PPDB</h3>
          <p className="text-xs text-ink-soft">Penyimpanan Terenkripsi Resmi Yayasan Yapendik</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-surface-subtle text-ink-soft rounded-full border border-line flex items-center gap-2 shadow-hairline">
            <ShieldCheck className="w-4 h-4 text-success" />
            <span>Enkripsi AES-256</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 medium:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map((docDef) => {
          const uploadedDoc = documents.find(d => d.document_type === docDef.type);
          const isCurrentlyUploading = uploadingType === docDef.type;

          return (
            <div 
              key={docDef.type}
              className="p-4 rounded-field bg-surface-subtle/70 border border-line hover-only:border-line transition-all flex flex-col justify-between shadow-hairline group"
              data-testid={`doc-card-${docDef.type}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-field bg-line-soft/80 text-ink flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-ink block">{docDef.label}</span>
                      {docDef.required && (
                        <span className="text-[10px] text-danger-deep font-bold uppercase tracking-wider">*Wajib</span>
                      )}
                    </div>
                  </div>
                  {getDocStatusBadge(uploadedDoc)}
                </div>
                <p className="text-xs text-ink-soft mb-4 pl-10 leading-relaxed">{docDef.description}</p>
              </div>

              <div className="flex flex-col medium:flex-row medium:items-center justify-between gap-2 pt-3 border-t border-line">
                {uploadedDoc ? (
                  <div className="text-xs font-medium text-ink-soft truncate max-w-[220px] flex items-center gap-2">
                    <Paperclip className="w-4 h-4 text-ink-soft shrink-0" />
                    <span className="truncate">{uploadedDoc.storage_file_path.split('/').pop()}</span>
                  </div>
                ) : (
                  <span className="text-xs text-ink-faint italic">Belum ada berkas terunggah</span>
                )}

                <button
                  type="button"
                  onClick={() => handleSimulatedUpload(docDef.type, `${docDef.type.toLowerCase()}_${applicantId}.jpg`)}
                  disabled={isCurrentlyUploading || uploadedDoc?.verification_status === 'VERIFIED_VALID'}
                  className={`w-full medium:w-auto px-4 py-2 text-xs font-bold rounded-field transition-all flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed ${
                    uploadedDoc?.verification_status === 'VERIFIED_VALID'
                      ? 'bg-line-soft text-ink-soft'
                      : isCurrentlyUploading
                      ? 'bg-line-strong text-ink cursor-wait'
                      : 'bg-brand hover-only:opacity-90 text-on-brand shadow-hairline'
                  }`}
                  data-testid={`upload-btn-${docDef.type}`}
                >
                  <Upload className="w-4 h-4" />
                  <span>{isCurrentlyUploading ? 'Mengunggah...' : uploadedDoc ? 'Ganti Berkas' : 'Unggah Berkas'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
