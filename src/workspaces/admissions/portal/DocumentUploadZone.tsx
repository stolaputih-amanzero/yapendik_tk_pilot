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
        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>Belum Diunggah</span>
        </span>
      );
    }

    switch (doc.verification_status) {
      case 'VERIFIED_VALID':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Terverifikasi Valid</span>
          </span>
        );
      case 'REJECTED_INVALID':
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>Ditolak: {doc.rejection_reason || 'Berkas Buram'}</span>
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Menunggu Verifikasi</span>
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 md:p-8 shadow-sm" data-testid="document-upload-zone">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Unggah Berkas Persyaratan PPDB</h3>
          <p className="text-xs text-slate-500">Penyimpanan Terenkripsi Resmi Yayasan Yapendik</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 flex items-center gap-1.5 shadow-2xs">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Enkripsi AES-256</span>
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {REQUIRED_DOCS.map((docDef) => {
          const uploadedDoc = documents.find(d => d.document_type === docDef.type);
          const isCurrentlyUploading = uploadingType === docDef.type;

          return (
            <div 
              key={docDef.type}
              className="p-5 rounded-xl bg-slate-50/70 border border-slate-200 hover:border-slate-300 transition-all flex flex-col justify-between shadow-2xs group"
              data-testid={`doc-card-${docDef.type}`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-slate-200/80 text-slate-800 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">{docDef.label}</span>
                      {docDef.required && (
                        <span className="text-[10px] text-rose-600 font-bold uppercase tracking-wider">*Wajib</span>
                      )}
                    </div>
                  </div>
                  {getDocStatusBadge(uploadedDoc)}
                </div>
                <p className="text-xs text-slate-600 mb-4 pl-10 leading-relaxed">{docDef.description}</p>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-200">
                {uploadedDoc ? (
                  <div className="text-xs font-medium text-slate-700 truncate max-w-[220px] flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{uploadedDoc.storage_file_path.split('/').pop()}</span>
                  </div>
                ) : (
                  <span className="text-xs text-slate-400 italic">Belum ada berkas terunggah</span>
                )}

                <button
                  type="button"
                  onClick={() => handleSimulatedUpload(docDef.type, `${docDef.type.toLowerCase()}_${applicantId}.jpg`)}
                  disabled={isCurrentlyUploading || uploadedDoc?.verification_status === 'VERIFIED_VALID'}
                  className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl transition-all flex justify-center items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed ${
                    uploadedDoc?.verification_status === 'VERIFIED_VALID'
                      ? 'bg-slate-200 text-slate-500'
                      : isCurrentlyUploading
                      ? 'bg-slate-400 text-white cursor-wait'
                      : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
                  }`}
                  data-testid={`upload-btn-${docDef.type}`}
                >
                  <Upload className="w-3.5 h-3.5" />
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
