const fs = require('fs');
const path = require('path');

// 1. StudentJourneyTimeline.tsx
let f1 = path.resolve('src/components/workspaces/StudentJourneyTimeline.tsx');
let c1 = fs.readFileSync(f1, 'utf-8');
c1 = c1.replace(
  /<SelectSheet\s+value=\{selectedStudentId\s*\|\|\s*''\}\s+options=\{\[\{\s*value:\s*s\.id,\s*label:\s*["']\{s\.name\}\s*\(\{s\.status\}\)["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={selectedStudentId || ''}
    onChange={setSelectedStudentId}
    options={studentsList.map(s => ({ value: s.id, label: \`\${s.name} (\${s.status})\` }))}
  />`
);
fs.writeFileSync(f1, c1, 'utf-8');

// 2. CohortPromotionWorkspace.tsx
let f2 = path.resolve('src/components/workspaces/CohortPromotionWorkspace.tsx');
let c2 = fs.readFileSync(f2, 'utf-8');
c2 = c2.replace(
  /<SelectSheet\s+value=\{sourceClassId\}\s+options=\{\[\{\s*value:\s*c\.id,\s*label:\s*["']\{c\.name\}\s*\(Tingkat\s*\{c\.level\}\)["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={sourceClassId}
    onChange={setSourceClassId}
    options={classes.map(c => ({ value: c.id, label: \`\${c.name} (Tingkat \${c.level})\` }))}
  />`
);
fs.writeFileSync(f2, c2, 'utf-8');

// 3. CommunicationWorkspace.tsx
let f3 = path.resolve('src/components/workspaces/CommunicationWorkspace.tsx');
let c3 = fs.readFileSync(f3, 'utf-8');
c3 = c3.replace(
  /<SelectSheet\s+value=\{targetStudentId\}\s+options=\{\[\{\s*value:\s*s\.id,\s*label:\s*["']\{s\.person\?\.fullName\s*\|\|\s*s\.nis\}["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={targetStudentId}
    onChange={setTargetStudentId}
    placeholder="Pilih Siswa (Opsional)..."
    options={[
      { value: '', label: 'Semua Siswa di Rombel' },
      ...students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis }))
    ]}
  />`
);
fs.writeFileSync(f3, c3, 'utf-8');

// 4. DevelopmentWorkspace.tsx
let f4 = path.resolve('src/components/workspaces/DevelopmentWorkspace.tsx');
let c4 = fs.readFileSync(f4, 'utf-8');
c4 = c4.replace(
  /<SelectSheet\s+value=\{selectedStudentId\}\s+options=\{\[\{\s*value:\s*s\.id,\s*label:\s*["']\{s\.person\?\.fullName\s*\|\|\s*s\.nis\}["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={selectedStudentId}
    onChange={setSelectedStudentId}
    options={students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis }))}
  />`
);
fs.writeFileSync(f4, c4, 'utf-8');

// 5. GraduationRegistryWorkspace.tsx
let f5 = path.resolve('src/components/workspaces/GraduationRegistryWorkspace.tsx');
let c5 = fs.readFileSync(f5, 'utf-8');
c5 = c5.replace(
  /<SelectSheet\s+value=\{selectedClassId\}\s+options=\{\[\{\s*value:\s*c\.id,\s*label:\s*["']\{c\.name\}\s*\(Tingkat\s*\{c\.level\}\)["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={selectedClassId}
    onChange={setSelectedClassId}
    options={classes.map(c => ({ value: c.id, label: \`\${c.name} (Tingkat \${c.level})\` }))}
  />`
);
fs.writeFileSync(f5, c5, 'utf-8');

// 6. ObservationWorkspace.tsx
let f6 = path.resolve('src/components/workspaces/ObservationWorkspace.tsx');
let c6 = fs.readFileSync(f6, 'utf-8');
c6 = c6.replace(
  /<SelectSheet\s+value=\{formStudentId\}\s+options=\{\[\{\s*value:\s*s\.id,\s*label:\s*["']\{s\.person\?\.fullName\s*\|\|\s*s\.nis\}["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={formStudentId}
    onChange={setFormStudentId}
    placeholder="Pilih Siswa..."
    options={students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis }))}
  />`
);
fs.writeFileSync(f6, c6, 'utf-8');

// 7. SafetyIncidentModal.tsx
let f7 = path.resolve('src/components/workspaces/teacher/SafetyIncidentModal.tsx');
let c7 = fs.readFileSync(f7, 'utf-8');
c7 = c7.replace(
  /<SelectSheet\s+value=\{targetStudentId\}\s+options=\{\[\{\s*value:\s*s\.id,\s*label:\s*["']\{s\.person\?\.fullName\s*\|\|\s*s\.nis\}["']\s*\}\]\}\s*\/>/g,
  `<SelectSheet
    value={targetStudentId}
    onChange={setTargetStudentId}
    placeholder="Pilih Ananda Terkait..."
    options={[
      { value: '', label: 'Pilih Ananda Terkait...' },
      ...students.map(s => ({ value: s.id, label: s.person?.fullName || s.nis }))
    ]}
  />`
);
fs.writeFileSync(f7, c7, 'utf-8');

console.log('✅ Replaced all remaining unbound SelectSheets.');
