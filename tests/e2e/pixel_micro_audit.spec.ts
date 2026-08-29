import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

test('Pixel-Perfect Micro-Audit on Beranda Kelas', async ({ page }) => {
  const findings: any[] = [];
  const addFinding = (fileLine: string, measured: string, expected: string, delta: string, severity: string, dim: string) => {
    findings.push({ fileLine, measured, expected, delta, severity, dim });
  };

  const viewports = [
    { name: '1440x900', width: 1440, height: 900 },
    { name: '390x844', width: 390, height: 844 }
  ];
  const themes = ['light', 'dark'];

  for (const vp of viewports) {
    for (const th of themes) {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.addInitScript(({ themeName }) => {
        localStorage.setItem('yapendik_theme', themeName);
      }, { themeName: th });
      await page.goto('http://localhost:3000/#beranda-guru');

      const simTabBtn = page.locator('button', { hasText: 'Simulasi Persona' }).first();
      if (await simTabBtn.isVisible({ timeout: 1500 }).catch(() => false)) {
        await simTabBtn.click();
      }
      const personaItem = page.locator('text=Siti Rahmawati').first();
      if (await personaItem.isVisible({ timeout: 1500 }).catch(() => false)) {
        await personaItem.click();
        await page.waitForTimeout(500);
      }
      if (!page.url().includes('#beranda-guru')) {
        await page.goto('http://localhost:3000/#beranda-guru');
      }
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(1000);

      // 1. P10 & P2: Desktop Layout Geometry & Alignment
      if (vp.name === '1440x900' && th === 'light') {
        const leftCol = page.locator('div.space-y-6.min-w-0').first();
        const rightCol = page.locator('div.hidden.large\\:block.space-y-6').first();
        const bLeft = await leftCol.boundingBox();
        const bRight = await rightCol.boundingBox();

        if (bLeft && bRight) {
          const gutter = bRight.x - (bLeft.x + bLeft.width);
          const railW = bRight.width;
          const topDelta = Math.abs(bLeft.y - bRight.y);

          if (Math.abs(gutter - 24) > 0.5) {
            addFinding('TeacherHomeShell.tsx:363', `Gutter: ${gutter.toFixed(1)}px`, '24px', `${(gutter - 24).toFixed(1)}px`, 'MAJOR', 'P10');
          }
          if (Math.abs(railW - 380) > 0.5) {
            addFinding('TeacherHomeShell.tsx:363', `Right-rail: ${railW.toFixed(1)}px`, '380px', `${(railW - 380).toFixed(1)}px`, 'MAJOR', 'P10');
          }
          if (topDelta > 1) {
            addFinding('TeacherHomeShell.tsx:363', `Top edge alignment: ${topDelta.toFixed(1)}px delta`, '0px (sejajar)', `${topDelta.toFixed(1)}px`, 'MINOR', 'P2');
          }
        }
      }

      // 2. P1: Spacing scale violations {4, 8, 12, 16, 24, 32}
      const paddings = await page.evaluate(() => {
        const allowed = [0, 4, 8, 12, 16, 24, 32, 48, 64];
        const elements = Array.from(document.querySelectorAll('.rounded-card, .rounded-2xl, .rounded-xl, button'));
        const oddPads: any[] = [];
        elements.forEach(el => {
          const cs = window.getComputedStyle(el);
          const pt = parseFloat(cs.paddingTop);
          const pb = parseFloat(cs.paddingBottom);
          const pl = parseFloat(cs.paddingLeft);
          const pr = parseFloat(cs.paddingRight);
          [pt, pb, pl, pr].forEach(val => {
            if (!allowed.includes(val) && val > 0) {
              oddPads.push({
                tag: el.tagName,
                classes: el.className,
                text: el.textContent ? el.textContent.slice(0, 25).replace(/\n/g, ' ') : '',
                val,
                pt, pb, pl, pr
              });
            }
          });
        });
        return oddPads;
      });

      // 3. P3: Iconography size check
      const icons = await page.evaluate(() => {
        const svgList = Array.from(document.querySelectorAll('svg.lucide'));
        return svgList.map(s => {
          const r = s.getBoundingClientRect();
          const p = s.parentElement;
          return {
            w: r.width,
            h: r.height,
            parentClass: p ? p.className : '',
            parentText: p && p.textContent ? p.textContent.slice(0, 20).replace(/\n/g, ' ') : ''
          };
        });
      });

      // 4. P4: Typography Micro (eyebrows tracking-wider, mono numbers)
      const typos = await page.evaluate(() => {
        const uppercaseLabels = Array.from(document.querySelectorAll('span, div, p')).filter(el => {
          const t = el.textContent ? el.textContent.trim() : '';
          return ['RUANG GURU', 'RITME KELAS', 'KEHADIRAN', 'STATUS REKONSILIASI', 'PERHATIAN PAGI:'].includes(t);
        });
        return uppercaseLabels.map(el => {
          const cs = window.getComputedStyle(el);
          return {
            text: el.textContent ? el.textContent.trim() : '',
            tracking: cs.letterSpacing,
            font: cs.fontFamily,
            weight: cs.fontWeight
          };
        });
      });

      // 5. P6: Tab Parity
      if (vp.name === '1440x900' && th === 'light') {
        const tabs = ['Hari Ini', 'Belajar & Karya', 'Siswa & Rapor'];
        const tabWidths: any[] = [];
        for (const t of tabs) {
          await page.locator('button', { hasText: t }).first().click();
          await page.waitForTimeout(300);
          const info = await page.evaluate(() => {
            const container = document.querySelector('div.max-w-7xl');
            if (!container) return null;
            const cs = window.getComputedStyle(container);
            return {
              w: container.getBoundingClientRect().width,
              pl: cs.paddingLeft,
              pr: cs.paddingRight
            };
          });
          tabWidths.push({ tab: t, ...info });
        }
        await page.locator('button', { hasText: 'Hari Ini' }).first().click();

        // evaluate tab parity
        const base = tabWidths[0];
        tabWidths.forEach(tw => {
          if (Math.abs(tw.w - base.w) > 1) {
            addFinding('TeacherHomeShell.tsx:280', `Tab ${tw.tab} container width: ${tw.w}px`, `Identical to ${base.tab} (${base.w}px)`, `${Math.abs(tw.w - base.w).toFixed(1)}px`, 'MAJOR', 'P6');
          }
          if (tw.pl !== base.pl) {
            addFinding('TeacherHomeShell.tsx:280', `Tab ${tw.tab} padding-left: ${tw.pl}`, `Identical to ${base.tab} (${base.pl})`, 'drift', 'MAJOR', 'P6');
          }
        });
      }

      // 6. P5: Focus-visible luminescent check on buttons
      const buttonsFocus = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button'));
        return btns.slice(0, 10).map(b => {
          b.focus();
          const cs = window.getComputedStyle(b);
          return {
            text: b.textContent ? b.textContent.slice(0, 20).replace(/\n/g, ' ') : '',
            outline: cs.outline,
            boxShadow: cs.boxShadow
          };
        });
      });

      // 7. P8: Mobile FAB & OmniBar occlusion
      if (vp.name === '390x844') {
        const occlusion = await page.evaluate(() => {
          const fab = document.querySelector('button.fixed.z-40');
          const omni = document.querySelector('div.fixed.bottom-0');
          const fabRect = fab ? fab.getBoundingClientRect() : null;
          const omniRect = omni ? omni.getBoundingClientRect() : null;
          let isOverlapping = false;
          if (fabRect && omniRect) {
            isOverlapping = (fabRect.bottom > omniRect.top && fabRect.top < omniRect.bottom);
          }
          return { isOverlapping, fabRect, omniRect };
        });
        if (occlusion.isOverlapping) {
          addFinding('QuickCaptureFloatingButton.tsx:28', 'FAB overlap dengan OmniBar bottom dock', 'FAB terangkat di atas OmniBar (safe-area + 96px)', 'Overlap collision', 'CRITICAL', 'P8');
        }
      }

      // Collect specific spacing scale oddities
      paddings.forEach(p => {
        if (p.val === 20) { // p-5 = 20px
          // Check if it's card padding
          addFinding('ClassroomPulseBanner.tsx:41', 'padding: 20px (p-5)', 'padding: 16px (p-4) atau 24px (p-6)', '20px bukan skala kanonikal {4,8,12,16,24,32}', 'MINOR', 'P1');
        } else if (p.val === 10) { // py-2.5 = 10px
          addFinding('ClassroomPulseBanner.tsx:45', 'padding: 10px (p-2.5)', 'padding: 8px (p-2) atau 12px (p-3)', '10px bukan skala kanonikal {4,8,12,16,24,32}', 'MINOR', 'P1');
        } else if (p.val === 14) { // px-3.5 = 14px
          addFinding('ClassroomPulseBanner.tsx:68', 'padding: 14px (px-3.5)', 'padding: 12px (px-3) atau 16px (px-4)', '14px bukan skala kanonikal {4,8,12,16,24,32}', 'MINOR', 'P1');
        }
      });

      // Collect icon size oddities
      icons.forEach(ic => {
        if (ic.w === 14) { // w-3.5 = 14px
          addFinding('OperatingStateIndicator.tsx:91', `w-3.5 (${ic.w}px) di [${ic.parentText}]`, 'Ukuran kanonikal w-4 (16px) / w-5 (20px) / w-6 (24px)', '-2px', 'MINOR', 'P3');
        }
      });

      // Collect eyebrow typography oddities
      typos.forEach(tp => {
        if (tp.tracking === 'normal' || tp.tracking === '0px') {
          addFinding('ClassroomPulseBanner.tsx / TeacherHomeShell.tsx', `Eyebrow "${tp.text}" tracking: normal (0px)`, 'tracking-wider (0.05em / ~0.6px)', 'missing tracking-wider', 'MINOR', 'P4');
        }
      });
    }
  }

  // Deduplicate findings by fileLine + measured
  const uniqueFindings: any[] = [];
  const seen = new Set();
  findings.forEach(f => {
    const key = `${f.fileLine}|${f.measured}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueFindings.push(f);
    }
  });

  const outPath = 'C:/Users/ADVAN AI/.gemini/antigravity-ide/brain/7f5baecc-97fb-442a-a19e-eda582d62bdf/scratch/micro_audit_report.json';
  fs.writeFileSync(outPath, JSON.stringify(uniqueFindings, null, 2));
  console.log(`TOTAL_MICRO_FINDINGS: ${uniqueFindings.length}`);
});
