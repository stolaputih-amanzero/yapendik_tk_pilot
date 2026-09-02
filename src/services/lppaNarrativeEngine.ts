/**
 * YAPENDIK SCHOOL OS — STAGE 6 GATE 6
 * LPPA Narrative Engine & Anti-Jargon Enforcer (Hukum 12 & H-07)
 * 
 * Epistemological Principle:
 * "LPPA narrative is a warm, appreciative qualitative synthesis of a child's unique journey, 
 *  not a clinical deficit diagnosis or comparative ranking."
 */

import { LppaElementKey } from '../types/lppaReportingTypes';
import { MilestoneRating } from '../domain/types';

export const FORBIDDEN_JARGON_PATTERNS = [
  { pattern: /\bIQ\b/i, name: 'IQ (Indeks Inteligensia)' },
  { pattern: /\branking\b/i, name: 'Ranking / Peringkat' },
  { pattern: /\bperingkat\b/i, name: 'Peringkat' },
  { pattern: /\bjuara\b/i, name: 'Juara Kelas' },
  { pattern: /\bpercentile\b/i, name: 'Percentile' },
  { pattern: /\bpersentil\b/i, name: 'Persentil' },
  { pattern: /\bskor\b/i, name: 'Skor / Nilai Angka' },
  { pattern: /\bdefisit\b/i, name: 'Defisit Klinis' },
  { pattern: /\blambat\b/i, name: 'Label Negatif (Lambat)' },
  { pattern: /\btertinggal\b/i, name: 'Label Komparatif (Tertinggal)' }
];

export const NARRATIVE_TEMPLATES: Record<LppaElementKey, Record<MilestoneRating, string>> = {
  NILAI_AGAMA_BUDI_PEKERTI: {
    BB: 'Ananda {name} masih dalam tahap pembiasaan untuk mengenal rutinitas doa bersama dan sikap saling menyapa dengan teman. Guru terus mendampingi dengan keteladanan penuh kasih.',
    MB: 'Ananda {name} mulai menunjukkan ketertarikan meniru sikap doa sebelum berkegiatan dan mulai terbiasa merespons salam dari pendidik dan kawan sebaya.',
    BSH: 'Ananda {name} telah berkembang sesuai harapan dalam mempraktikkan doa harian secara tertib, menyayangi ciptaan Tuhan, serta menghargai teman dengan santun.',
    BSB: 'Ananda {name} menunjukkan penghayatan budi pekerti yang sangat baik. Ananda secara mandiri memimpin doa di kelas, senang membantu teman, dan menjadi teladan kerukunan.'
  },
  JATI_DIRI: {
    BB: 'Ananda {name} masih membutuhkan rasa aman dan pendampingan bertahap dari guru saat transisi kedatangan dan pengelolaan perasaan di kelas sentra.',
    MB: 'Ananda {name} mulai mampu mengenali perasaan dirinya dan berusaha mengekspresikan keinginannya secara lisan dengan bimbingan hangat dari guru.',
    BSH: 'Ananda {name} telah berkembang sesuai harapan dalam kemandirian mengurus keperluan pribadi, aktif bergerak, serta mampu berinteraksi rukun bersama kawan.',
    BSB: 'Ananda {name} menunjukkan kematangan emosi dan fisik yang sangat baik. Ananda percaya diri mencoba tantangan baru, tangkas, dan mampu memimpin kelompok bermain.'
  },
  LITERASI_STEAM: {
    BB: 'Ananda {name} masih diajak untuk lebih banyak mengeksplorasi ragam bahan main sensori, gambar cerita, dan balok bangun dengan panduan guru.',
    MB: 'Ananda {name} mulai tertarik mendengarkan dongeng, senang bertanya mengenai bentuk balok, dan mulai berani mencampur warna pada kegiatan karya seni.',
    BSH: 'Ananda {name} telah berkembang sesuai harapan dalam rasa ingin tahu ilmiah, mengidentifikasi pola balok, menceritakan kembali kisah buku, serta berkreasi bebas.',
    BSB: 'Ananda {name} memiliki nalar kritis dan daya cipta STEAM yang sangat baik. Ananda antusias merancang konstruksi balok rumit dan fasih mengomunikasikan idenya.'
  },
  PROJEK_P5: {
    BB: 'Ananda {name} masih dalam proses beradaptasi untuk berpartisipasi dalam dinamika projek kolaboratif kelompok kecil bersama teman.',
    MB: 'Ananda {name} mulai terbiasa ikut serta mengumpulkan bahan alam dan mendengarkan instruksi projek bertema cinta lingkungan.',
    BSH: 'Ananda {name} telah berkembang sesuai harapan dalam bergotong royong, menjaga kebersihan sentra, dan menyelesaikan tahapan projek profil pelajar Pancasila.',
    BSB: 'Ananda {name} menunjukkan jiwa kepemimpinan Pancasila yang sangat baik, berinisiatif merawat tanaman sekolah, dan mengajak kawan bekerja sama dengan riang.'
  }
};

/**
 * Validates qualitative narrative to guarantee 100% compliance with H-07 Non-Surveillance
 * and Hukum 12 Anti-Jargon Doctrine.
 */
export function validateNarrative(text: string): { valid: boolean; violations: string[] } {
  if (!text) return { valid: true, violations: [] };

  const violations: string[] = [];
  for (const item of FORBIDDEN_JARGON_PATTERNS) {
    if (item.pattern.test(text)) {
      violations.push(item.name);
    }
  }

  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Generates an appreciative, personalized narrative draft based on child's name, element, and rating.
 */
export function generateAppreciativeNarrative(params: {
  studentName: string;
  elementKey: LppaElementKey;
  rating: MilestoneRating;
  customAnecdote?: string;
}): string {
  const { studentName, elementKey, rating, customAnecdote } = params;
  const template = NARRATIVE_TEMPLATES[elementKey]?.[rating] || NARRATIVE_TEMPLATES.LITERASI_STEAM.BSH;
  
  const baseNarrative = template.replace(/{name}/g, studentName);
  
  if (customAnecdote && customAnecdote.trim()) {
    return `${baseNarrative} Hal ini tampak nyata ketika ananda ${customAnecdote.trim()}`;
  }
  
  return baseNarrative;
}
