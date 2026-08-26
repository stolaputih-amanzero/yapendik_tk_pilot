import { db } from '../src/db/database';

console.log('TK 01 Readiness:', JSON.stringify(db.evaluateSchoolReadinessLocal('sch_tk_yapendik_01'), null, 2));
console.log('TK 02 Readiness:', JSON.stringify(db.evaluateSchoolReadinessLocal('sch_tk_yapendik_02'), null, 2));
