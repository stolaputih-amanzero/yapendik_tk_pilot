# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: teacher_home_audit.spec.ts >> [AUDIT] Teacher Home: MEDIUM (768x1024) × Night Temple (dark)
- Location: tests\e2e\teacher_home_audit.spec.ts:24:5

# Error details

```
Error: expect(received).toBeLessThanOrEqual(expected)

Expected: <= 760
Received:    921.015625
```

# Page snapshot

```yaml
- generic [ref=e3]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e12]:
        - generic [ref=e13]: Yapendik OS
        - generic [ref=e14]: ✦
      - generic [ref=e15]:
        - button "Supabase On" [ref=e16] [cursor=pointer]
        - button "Beralih ke Frangipani Day (Light Mode)" [ref=e22] [cursor=pointer]
        - button "S" [ref=e30] [cursor=pointer]
    - main [ref=e34]:
      - generic [ref=e35]:
        - generic [ref=e36]:
          - generic [ref=e37]:
            - generic [ref=e38]:
              - generic [ref=e39]: Ruang Guru
              - heading "Beranda Kelas" [level=1] [ref=e44]
              - paragraph [ref=e45]: "• Wali Kelas: —"
            - generic [ref=e46]:
              - generic [ref=e47]: Terhubung
              - button "Segarkan Data" [ref=e55] [cursor=pointer]
          - tablist [ref=e63]:
            - tab "Hari Ini" [selected] [ref=e64] [cursor=pointer]
            - tab "Belajar & Karya" [ref=e68] [cursor=pointer]
            - tab "Siswa & Rapor" [ref=e72] [cursor=pointer]
        - generic [ref=e80]:
          - generic [ref=e81]:
            - generic [ref=e82]:
              - generic [ref=e83]:
                - generic [ref=e89]:
                  - heading "Kelompok A (Bintang Ceria)" [level=2] [ref=e91]
                  - paragraph [ref=e92]: Rabu, 26 Agu 2026
                - generic [ref=e93]:
                  - generic [ref=e94]:
                    - generic [ref=e95]: Kehadiran
                    - generic [ref=e96]:
                      - text: 0/3
                      - generic [ref=e97]: (0%)
                  - generic [ref=e98]: 3 Belum
              - generic [ref=e102]:
                - button "1 Pesan Ortu" [ref=e103] [cursor=pointer]
                - button "Perhatian & Kesehatan" [ref=e108] [cursor=pointer]
            - generic [ref=e114]:
              - generic [ref=e115]: "Perhatian Pagi:"
              - generic [ref=e118]:
                - button "Kenzo Pratama Santoso — Alergi debu & bulu kucing ringan" [ref=e119] [cursor=pointer]:
                  - generic [ref=e120]:
                    - strong [ref=e121]: Kenzo Pratama Santoso
                    - generic [ref=e122]: —
                    - generic [ref=e123]: Alergi debu & bulu kucing ringan
                - button "Gabriel Christian Sihombing — Alergi udang/seafood" [ref=e124] [cursor=pointer]:
                  - generic [ref=e125]:
                    - strong [ref=e126]: Gabriel Christian Sihombing
                    - generic [ref=e127]: —
                    - generic [ref=e128]: Alergi udang/seafood
          - generic [ref=e130]:
            - generic [ref=e136]:
              - generic [ref=e137]:
                - generic [ref=e138]: Ritme Kelas
                - generic [ref=e139]: 07:15
                - generic "Status Aktif" [ref=e140]
              - heading "2. Sambut Ananda— Presensi cepat, suhu, dan cek mood" [level=3] [ref=e142]:
                - text: 2. Sambut Ananda
                - generic [ref=e143]: — Presensi cepat, suhu, dan cek mood
            - generic [ref=e144]:
              - button "06:45" [ref=e145] [cursor=pointer]
              - button "07:15" [ref=e153] [cursor=pointer]
              - button "07:45" [ref=e158] [cursor=pointer]
              - button "08:30" [ref=e165] [cursor=pointer]
              - button "10:00" [ref=e169] [cursor=pointer]
              - button "10:30" [ref=e174] [cursor=pointer]
              - button "11:00" [ref=e178] [cursor=pointer]
              - button "11:30" [ref=e182] [cursor=pointer]
          - generic [ref=e196]:
            - generic [ref=e198]:
              - generic [ref=e200]:
                - heading "Presensi Harian" [level=3] [ref=e201]
                - paragraph [ref=e202]: Sentuh 1-ketuk untuk mengubah status. Rekam suhu & mood pagi.
              - generic [ref=e203]:
                - generic [ref=e204]:
                  - textbox "Cari nama ananda / NIS..." [ref=e209]
                  - generic [ref=e210]:
                    - button "Semua (3)" [ref=e211] [cursor=pointer]
                    - button "Belum Diisi 3" [ref=e212] [cursor=pointer]:
                      - text: Belum Diisi
                      - generic [ref=e213]: "3"
                    - button [ref=e215] [cursor=pointer]
                  - button [ref=e220] [cursor=pointer]
                - generic [ref=e225]:
                  - generic [ref=e226]:
                    - generic [ref=e227]:
                      - generic [ref=e228]:
                        - generic [ref=e229]:
                          - generic "Kenzo Pratama Santoso" [ref=e230]: KS
                          - generic [ref=e231]: ⛵
                        - generic [ref=e232]:
                          - heading "Kenzo Pratama Santoso" [level=4] [ref=e233]
                          - generic [ref=e234]:
                            - generic [ref=e235]: NIS TK-2026-001
                            - generic "Alergi debu & bulu kucing ringan" [ref=e236]
                      - generic [ref=e240]:
                        - button "Momen Cepat" [ref=e241] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e245] [cursor=pointer]
                    - generic [ref=e248]:
                      - button "Hadir" [ref=e249] [cursor=pointer]
                      - button "Sakit" [ref=e253] [cursor=pointer]
                      - button "Izin" [ref=e257] [cursor=pointer]
                      - button "Alpa" [ref=e262] [cursor=pointer]
                    - generic [ref=e268]:
                      - generic [ref=e269]:
                        - generic [ref=e270]: "Mood:"
                        - generic [ref=e271]:
                          - button "Ceria" [ref=e272] [cursor=pointer]
                          - button "Tenang" [ref=e276] [cursor=pointer]
                          - button "Gelisah" [ref=e279] [cursor=pointer]
                          - button "Menangis" [ref=e283] [cursor=pointer]
                      - generic [ref=e286]:
                        - spinbutton "Suhu °C" [ref=e290]
                        - button "Tambah Catatan Kondisi" [ref=e291]
                  - generic [ref=e294]:
                    - generic [ref=e295]:
                      - generic [ref=e296]:
                        - generic [ref=e297]:
                          - generic "Alina Putri Wijaya" [ref=e298]: AW
                          - generic [ref=e299]: 🦁
                        - generic [ref=e300]:
                          - heading "Alina Putri Wijaya" [level=4] [ref=e301]
                          - generic [ref=e302]: NIS TK-2026-002
                      - generic [ref=e304]:
                        - button "Momen Cepat" [ref=e305] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e309] [cursor=pointer]
                    - generic [ref=e312]:
                      - button "Hadir" [ref=e313] [cursor=pointer]
                      - button "Sakit" [ref=e317] [cursor=pointer]
                      - button "Izin" [ref=e321] [cursor=pointer]
                      - button "Alpa" [ref=e326] [cursor=pointer]
                    - generic [ref=e332]:
                      - generic [ref=e333]:
                        - generic [ref=e334]: "Mood:"
                        - generic [ref=e335]:
                          - button "Ceria" [ref=e336] [cursor=pointer]
                          - button "Tenang" [ref=e340] [cursor=pointer]
                          - button "Gelisah" [ref=e343] [cursor=pointer]
                          - button "Menangis" [ref=e347] [cursor=pointer]
                      - generic [ref=e350]:
                        - spinbutton "Suhu °C" [ref=e354]
                        - button "Tambah Catatan Kondisi" [ref=e355]
                  - generic [ref=e358]:
                    - generic [ref=e359]:
                      - generic [ref=e360]:
                        - generic [ref=e361]:
                          - generic "Gabriel Christian Sihombing" [ref=e362]: GS
                          - generic [ref=e363]: 🦁
                        - generic [ref=e364]:
                          - heading "Gabriel Christian Sihombing" [level=4] [ref=e365]
                          - generic [ref=e366]:
                            - generic [ref=e367]: NIS TK-2026-003
                            - generic "Alergi udang/seafood" [ref=e368]
                      - generic [ref=e372]:
                        - button "Momen Cepat" [ref=e373] [cursor=pointer]
                        - button "Rekam Jejak" [ref=e377] [cursor=pointer]
                    - generic [ref=e380]:
                      - button "Hadir" [ref=e381] [cursor=pointer]
                      - button "Sakit" [ref=e385] [cursor=pointer]
                      - button "Izin" [ref=e389] [cursor=pointer]
                      - button "Alpa" [ref=e394] [cursor=pointer]
                    - generic [ref=e400]:
                      - generic [ref=e401]:
                        - generic [ref=e402]: "Mood:"
                        - generic [ref=e403]:
                          - button "Ceria" [ref=e404] [cursor=pointer]
                          - button "Tenang" [ref=e408] [cursor=pointer]
                          - button "Gelisah" [ref=e411] [cursor=pointer]
                          - button "Menangis" [ref=e415] [cursor=pointer]
                      - generic [ref=e418]:
                        - spinbutton "Suhu °C" [ref=e422]
                        - button "Tambah Catatan Kondisi" [ref=e423]
            - generic [ref=e426]:
              - generic [ref=e428]:
                - heading "Status Rekonsiliasi" [level=4] [ref=e434]
                - generic [ref=e435]:
                  - generic [ref=e436]: Presensi Lengkap
                  - generic [ref=e444]:
                    - strong [ref=e445]: "0"
                    - text: Draf Momen Perlu Diperkaya
                  - generic [ref=e449]:
                    - strong [ref=e450]: "1"
                    - text: Pesan Ortu
              - generic [ref=e451]:
                - generic [ref=e452]:
                  - generic [ref=e457]:
                    - heading "Buku Penghubung" [level=3] [ref=e458]
                    - paragraph [ref=e459]: Kemitraan Guru & Orang Tua
                  - generic [ref=e460]:
                    - button "Semua Pesan" [ref=e461] [cursor=pointer]
                    - button [ref=e462] [cursor=pointer]
                - generic [ref=e465]:
                  - generic [ref=e466]:
                    - generic [ref=e467]:
                      - generic [ref=e468]:
                        - generic [ref=e469]:
                          - generic [ref=e470]: Ringkasan Harian
                          - generic [ref=e474]: "Untuk: Ananda Kenzo Pratama Santoso"
                        - heading "Catatan Harian Ananda Kenzo (24 Agustus 2026)" [level=4] [ref=e475]
                        - generic [ref=e476]:
                          - text: "Pengirim:"
                          - strong [ref=e477]: Siti Rahmawati, S.Pd
                      - generic [ref=e478]: Dikonfirmasi
                    - paragraph [ref=e483]: Selamat siang Ayah & Ibu Kenzo. Hari ini Ananda Kenzo sangat hebat dalam kegiatan eksplorasi panca indra. Kenzo mampu menjelaskan rasa manis & asin dengan kosa kata yang kaya, serta sangat berempati menolong temannya saat ada cat yang tumpah. Nafsu makan siang sangat baik (habis 1 porsi). Mohon ingatkan Kenzo minum air putih yang cukup sore ini.
                    - generic [ref=e484]:
                      - generic [ref=e485]: "Balasan:"
                      - paragraph [ref=e489]: Terima kasih banyak Bu Siti atas pendampingan penuh kasih hari ini. Di rumah Kenzo juga antusias bercerita tentang rasa jeruk dan teman-temannya di kelas.
                  - generic [ref=e490]:
                    - generic [ref=e491]:
                      - generic [ref=e492]:
                        - generic [ref=e493]: Pengumuman Kelas
                        - heading "Persiapan Kegiatan Operasi Semut & Peduli Lingkungan (Besok, 25 Agustus)" [level=4] [ref=e498]
                        - generic [ref=e499]:
                          - text: "Pengirim:"
                          - strong [ref=e500]: Siti Rahmawati, S.Pd
                      - generic [ref=e501]: Perlu Tanggapan
                    - paragraph [ref=e506]: Bapak/Ibu Orang Tua Siswa Kelompok A yang terkasih, besok anak-anak akan belajar menjaga kebersihan lingkungan dengan kegiatan memilah dedaunan kering. Mohon anak-anak mengenakan seragam kaos olahraga dan membawa botol minum bertali.
                    - button [ref=e508] [cursor=pointer]
        - button "Rekam Momen Belajar" [ref=e514] [cursor=pointer]
  - generic [ref=e518]:
    - generic [ref=e519]:
      - button "Presensi" [ref=e520] [cursor=pointer]
      - button "Observasi" [ref=e522] [cursor=pointer]
      - button "Kerja Harian" [ref=e524] [cursor=pointer]
    - button "Apa fokus Anda hari ini? Menu" [ref=e526] [cursor=pointer]:
      - generic [ref=e527]: Apa fokus Anda hari ini?
      - generic [ref=e532]: Menu
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import fs from 'fs';
  3   | import path from 'path';
  4   | 
  5   | const VIEWPORTS = [
  6   |   { name: '390x844', width: 390, height: 844, sizeClass: 'COMPACT' },
  7   |   { name: '768x1024', width: 768, height: 1024, sizeClass: 'MEDIUM' },
  8   |   { name: '1024x768', width: 1024, height: 768, sizeClass: 'EXPANDED-MID' },
  9   |   { name: '1440x900', width: 1440, height: 900, sizeClass: 'EXPANDED' },
  10  | ];
  11  | 
  12  | const THEMES = [
  13  |   { name: 'light', label: 'Frangipani Day' },
  14  |   { name: 'dark', label: 'Night Temple' },
  15  | ];
  16  | 
  17  | const outDir = path.resolve('tests', 'vrt-baseline', 'teacher-home-audit');
  18  | if (!fs.existsSync(outDir)) {
  19  |   fs.mkdirSync(outDir, { recursive: true });
  20  | }
  21  | 
  22  | for (const vp of VIEWPORTS) {
  23  |   for (const th of THEMES) {
  24  |     test(`[AUDIT] Teacher Home: ${vp.sizeClass} (${vp.name}) × ${th.label} (${th.name})`, async ({ page }) => {
  25  |       await page.setViewportSize({ width: vp.width, height: vp.height });
  26  | 
  27  |       await page.addInitScript(({ themeName }) => {
  28  |         localStorage.setItem('yapendik_theme', themeName);
  29  |       }, { themeName: th.name });
  30  | 
  31  |       await page.goto('http://localhost:3000/#beranda-guru');
  32  | 
  33  |       const simTabBtn = page.locator('button', { hasText: 'Simulasi Persona' }).first();
  34  |       if (await simTabBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
  35  |         await simTabBtn.click();
  36  |       }
  37  | 
  38  |       const personaItem = page.locator('text=Siti Rahmawati').first();
  39  |       if (await personaItem.isVisible({ timeout: 1500 }).catch(() => false)) {
  40  |         await personaItem.click();
  41  |         await page.waitForTimeout(500);
  42  |       }
  43  | 
  44  |       if (!page.url().includes('#beranda-guru')) {
  45  |         await page.goto('http://localhost:3000/#beranda-guru');
  46  |       }
  47  | 
  48  |       await page.evaluate(() => document.fonts.ready);
  49  |       await page.waitForTimeout(1000);
  50  | 
  51  |       // Universal Layout & Anti-Overlap Invariant Assertions (V-14)
  52  |       const pulseBannerCard = page.locator('.rounded-card').filter({ hasText: 'Kelompok A' }).first();
  53  |       const reconciliationCard = vp.width < 1200
  54  |         ? page.locator('.large\\:hidden').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first()
  55  |         : page.locator('.large\\:block').locator('.rounded-card').filter({ hasText: /Status Rekonsiliasi|Semua Tugas Selesai/ }).first();
  56  |       const todaySurfaceTitle = page.locator('text=Presensi Harian').first();
  57  | 
  58  |       await expect(pulseBannerCard).toBeVisible();
  59  |       await expect(reconciliationCard).toBeVisible();
  60  | 
  61  |       const boxBanner = await pulseBannerCard.boundingBox();
  62  |       const boxReconciliation = await reconciliationCard.boundingBox();
  63  |       const boxToday = await todaySurfaceTitle.boundingBox();
  64  | 
  65  |       expect(boxBanner).not.toBeNull();
  66  |       expect(boxReconciliation).not.toBeNull();
  67  | 
  68  |       if (boxBanner && boxReconciliation) {
  69  |         // Assert mathematical ZERO OVERLAP between Banner and Reconciliation card
  70  |         const isHorizontalOverlap = (boxReconciliation.x < boxBanner.x + boxBanner.width) && 
  71  |                                     (boxReconciliation.x + boxReconciliation.width > boxBanner.x);
  72  |         const isVerticalOverlap = (boxReconciliation.y < boxBanner.y + boxBanner.height) && 
  73  |                                   (boxReconciliation.y + boxReconciliation.height > boxBanner.y);
  74  |         const hasOverlap = isHorizontalOverlap && isVerticalOverlap;
  75  | 
  76  |         expect(hasOverlap).toBe(false);
  77  | 
  78  |         // Responsive behavior assertions
  79  |         if (vp.width < 1200 && boxToday) {
  80  |           // Stacked mode: rail must be rendered below Today surface
  81  |           expect(boxReconciliation.y).toBeGreaterThan(boxToday.y);
  82  |         } else if (vp.width >= 1200) {
  83  |           // 2-column mode: rail must be positioned to the right of main column
  84  |           expect(boxReconciliation.x).toBeGreaterThanOrEqual(boxBanner.x + boxBanner.width);
  85  |         }
  86  |       }
  87  | 
  88  |       // CI HARDENING: Asersi Kirim Pengumuman boundingBox
  89  |       const btnKirim = page.locator('button', { hasText: 'Kirim Pengumuman' }).first();
  90  |       if (await btnKirim.isVisible()) {
  91  |         const boxBtnKirim = await btnKirim.boundingBox();
  92  |         expect(boxBtnKirim).not.toBeNull();
  93  |         if (boxBtnKirim) {
> 94  |           expect(boxBtnKirim.x + boxBtnKirim.width).toBeLessThanOrEqual(vp.width - 8);
      |                                                     ^ Error: expect(received).toBeLessThanOrEqual(expected)
  95  |         }
  96  |       }
  97  | 
  98  |       // CI HARDENING: Asersi pil-segment × chips-RITME overlap
  99  |       const pilSegment = page.locator('button', { hasText: 'Hari Ini' }).first(); // Bagian dari SegmentedControl
  100 |       const ritmeIndicator = page.locator('.flex-1.min-w-0.flex.flex-wrap.gap-2').first(); // Kontainer chips waktu
  101 |       
  102 |       if (await pilSegment.isVisible() && await ritmeIndicator.isVisible()) {
  103 |         const boxPil = await pilSegment.boundingBox();
  104 |         const boxRitme = await ritmeIndicator.boundingBox();
  105 |         
  106 |         expect(boxPil).not.toBeNull();
  107 |         expect(boxRitme).not.toBeNull();
  108 |         
  109 |         if (boxPil && boxRitme) {
  110 |           const isHorizontalOverlap = (boxRitme.x < boxPil.x + boxPil.width) && 
  111 |                                       (boxRitme.x + boxRitme.width > boxPil.x);
  112 |           const isVerticalOverlap = (boxRitme.y < boxPil.y + boxPil.height) && 
  113 |                                     (boxRitme.y + boxRitme.height > boxPil.y);
  114 |           const hasOverlap = isHorizontalOverlap && isVerticalOverlap;
  115 |           
  116 |           expect(hasOverlap).toBe(false);
  117 |         }
  118 |       }
  119 | 
  120 |       const screenshotPath = path.join(outDir, `${vp.name}-${th.name}.png`);
  121 |       await page.screenshot({ path: screenshotPath, fullPage: false });
  122 |       expect(fs.existsSync(screenshotPath)).toBe(true);
  123 |     });
  124 |   }
  125 | }
  126 | 
```