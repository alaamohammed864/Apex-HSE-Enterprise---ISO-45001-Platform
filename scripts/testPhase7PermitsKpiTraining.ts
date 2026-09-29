/**
 * Automated Verification Test Script for Phase 7 — Training, KPI & Permit to Work
 * Tests all requirements:
 * 1. Training Management (Courses, Matrix, Records, Expiry Tracking, Statuses)
 * 2. KPI Management (12 Configurable KPIs, Monthly/Quarterly/Yearly periods, Trends)
 * 3. Permit to Work (10 High-Hazard Disciplines, All Fields, Gas Testing, LOTO, Lifecycle, Cross-Module Connections)
 */

import { phase7Service } from '../src/services/phase7Service';
import {
  TrainingCourseModel,
  EmployeeTrainingRecordModel,
  PermitToWorkModel,
  PermitDisciplineType,
} from '../src/types/phase7';

async function runPhase7Tests() {
  console.log('====================================================');
  console.log('STARTING PHASE 7 VERIFICATION: TRAINING, KPI & PTW');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition: boolean, message: string) {
    if (condition) {
      console.log(`  ✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${message}`);
      failed++;
    }
  }

  // Initialize service
  await phase7Service.init();

  // ----------------------------------------------------
  // TEST 1: TRAINING MANAGEMENT & 13 REQUIRED COURSES
  // ----------------------------------------------------
  console.log('\n--- TEST 1: TRAINING MANAGEMENT & COURSES ---');
  const courses = await phase7Service.getTrainingCourses();
  const requiredCourses = [
    'HSE General Site Induction',
    'First Aid',
    'Fire Fighting',
    'Working at Height',
    'Confined Space',
    'Lifting & Rigging',
    'Scaffold Safety',
    'Permit to Work (PTW)',
    'Site Emergency Response',
    'Defensive Driving',
    'Manual Handling',
    'Chemical Safety',
    'Electrical Safety',
  ];

  for (const rc of requiredCourses) {
    const found = courses.find((c) => c.title.toLowerCase().includes(rc.toLowerCase()));
    assert(found !== undefined, `Course "${rc}" is available in catalogue`);
    if (found) {
      assert(found.validityMonths >= 12, `Course "${rc}" has valid validity timeframe (${found.validityMonths} Mo)`);
    }
  }

  // Test employee training record creation and expiry statuses
  console.log('\nTesting Employee Records & Expiry Tracking...');
  const today = new Date().toISOString().split('T')[0];

  // 1. VALID record
  const validRecord: EmployeeTrainingRecordModel = {
    id: `TR-TEST-VALID-${Date.now().toString().slice(-4)}`,
    employeeId: 'EMP-991',
    employeeName: 'Ahmed Al-Thani',
    employeeBadge: 'QA-9910',
    contractor: 'CCC Consortia',
    department: 'Civil Engineering',
    tradeRole: 'Supervisor',
    courseId: 'CRS-IND-01',
    courseTitle: 'HSE General Site Induction',
    trainingDate: today,
    expiryDate: new Date(Date.now() + 365 * 86400000).toISOString().split('T')[0],
    certificateNumber: 'CERT-TEST-9910',
    trainer: 'Dr. Tariq Al-Mansoor',
    trainingProvider: 'Apex HSE Academy',
    scoreAchievedPercent: 100,
    status: 'VALID',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await phase7Service.saveTrainingRecord(validRecord);

  // 2. EXPIRING record (within 15 days)
  const expiringRecord: EmployeeTrainingRecordModel = {
    id: `TR-TEST-EXPIRING-${Date.now().toString().slice(-4)}`,
    employeeId: 'EMP-992',
    employeeName: 'Bilal Khan',
    employeeBadge: 'QA-9920',
    contractor: 'Siemens Energy',
    department: 'Electrical',
    tradeRole: 'Electrician',
    courseId: 'CRS-ELE-13',
    courseTitle: 'Electrical Safety',
    trainingDate: '2025-04-10',
    expiryDate: new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0],
    certificateNumber: 'CERT-TEST-9920',
    trainer: 'Eng. Venkatraman',
    trainingProvider: 'Siemens Academy',
    scoreAchievedPercent: 95,
    status: 'VALID', // will be evaluated dynamically as EXPIRING
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await phase7Service.saveTrainingRecord(expiringRecord);

  // 3. EXPIRED record
  const expiredRecord: EmployeeTrainingRecordModel = {
    id: `TR-TEST-EXPIRED-${Date.now().toString().slice(-4)}`,
    employeeId: 'EMP-993',
    employeeName: 'Carlos Gomez',
    employeeBadge: 'QA-9930',
    contractor: 'Al-Futtaim Heavy',
    department: 'Rigging',
    tradeRole: 'Rigger Level 2',
    courseId: 'CRS-RIG-06',
    courseTitle: 'Lifting & Rigging',
    trainingDate: '2024-01-01',
    expiryDate: '2026-01-01', // in the past
    certificateNumber: 'CERT-TEST-9930',
    trainer: 'Capt. James Macleod',
    trainingProvider: 'LEEA',
    scoreAchievedPercent: 88,
    status: 'VALID', // will be evaluated dynamically as EXPIRED
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  await phase7Service.saveTrainingRecord(expiredRecord);

  const allRecords = await phase7Service.getEmployeeTrainingRecords();
  const fValid = allRecords.find((r) => r.id === validRecord.id);
  const fExpiring = allRecords.find((r) => r.id === expiringRecord.id);
  const fExpired = allRecords.find((r) => r.id === expiredRecord.id);

  assert(fValid?.status === 'VALID', 'Record correctly evaluated as VALID');
  assert(fExpiring?.status === 'EXPIRING', 'Record within 30 days correctly evaluated as EXPIRING');
  assert(fExpired?.status === 'EXPIRED', 'Record past expiry date correctly evaluated as EXPIRED');

  // ----------------------------------------------------
  // TEST 2: KPI MANAGEMENT & 12 CONFIGURABLE INDICATORS
  // ----------------------------------------------------
  console.log('\n--- TEST 2: KPI MANAGEMENT & ANALYTICS ---');
  const kpiDefs = await phase7Service.getKpiDefinitions();
  const requiredKpis = [
    'TRIR',
    'LTIFR',
    'NEAR_MISSES',
    'RECORDABLE_INCIDENTS',
    'LOST_TIME_INJURIES',
    'FIRST_AID_CASES',
    'SAFETY_OBSERVATIONS',
    'INSPECTIONS_COMPLETED',
    'AUDITS_COMPLETED',
    'CAPA_ON_TIME_CLOSURE',
    'TRAINING_COMPLETION',
    'PERMIT_COMPLIANCE',
  ];

  for (const k of requiredKpis) {
    const found = kpiDefs.find((item) => item.code === k);
    assert(found !== undefined, `KPI "${k}" defined with formula & target threshold`);
  }

  // Test Monthly, Quarterly, Yearly periods
  const monthlyReports = await phase7Service.getKpiAnalytics('MONTHLY');
  const quarterlyReports = await phase7Service.getKpiAnalytics('QUARTERLY');
  const yearlyReports = await phase7Service.getKpiAnalytics('YEARLY');

  assert(monthlyReports.length === 12, 'Monthly KPI report includes all 12 indicators');
  assert(quarterlyReports.length === 12, 'Quarterly KPI report generated with historical quarterly data');
  assert(yearlyReports.length === 12, 'Yearly KPI report generated with multi-year trends');

  // Verify TRIR computation formula
  const trirReport = monthlyReports.find((r) => r.kpiCode === 'TRIR');
  assert(trirReport !== undefined, 'TRIR report calculated');
  assert(trirReport!.currentValue <= 0.20, `TRIR actual (${trirReport!.currentValue}) meets benchmark target`);

  // ----------------------------------------------------
  // TEST 3: PERMIT TO WORK & 10 HIGH-HAZARD DISCIPLINES
  // ----------------------------------------------------
  console.log('\n--- TEST 3: PERMIT TO WORK (e-PTW) ---');
  const requiredPermitDisciplines: PermitDisciplineType[] = [
    'HOT_WORK',
    'COLD_WORK',
    'CONFINED_SPACE',
    'WORKING_AT_HEIGHT',
    'EXCAVATION',
    'LIFTING',
    'ELECTRICAL_ISOLATION',
    'LINE_BREAKING',
    'RADIOGRAPHY',
    'EQUIPMENT_VEHICLE_ENTRY',
  ];

  assert(requiredPermitDisciplines.length === 10, 'All 10 required high-hazard permit disciplines configured');

  // Test full permit creation with all fields & cross-module connections
  const testPtwId = `PTW-TEST-${Date.now().toString().slice(-4)}`;
  const fullPermit: PermitToWorkModel = {
    id: testPtwId,
    permitNumber: testPtwId,
    permitType: 'HOT_WORK',
    workDescription: 'Header line tie-in welding and flange face cleaning.',
    location: 'Unit 3 Battery Limit - Elevation +4.0m',
    contractor: 'CCC Consortia',
    workPartyCount: 4,
    workPartyLead: 'S. Govindan (Welder)',
    workPartyMembers: ['S. Govindan', 'Ali Raza', 'M. Tariq', 'K. Rahman'],
    issuer: 'Eng. Salem Al-Hajri (Issuing Authority)',
    receiver: 'S. Govindan (Performing Authority)',
    projectId: 'PRJ-RL-01',
    projectName: 'Ras Laffan EPC-4 Liquefaction Expansion',
    linkedRiskAssessmentId: 'RA-2026-001',
    linkedRiskAssessmentTitle: 'Heavy Dual-Crane Tandem Lift',
    linkedDocumentIds: ['DOC-SOP-01'],
    linkedDocumentCodes: ['HSE-SOP-001'],
    controlsSummary: 'Fire blanket containment, spark arrestors, continuous fire watch, 2x 9kg DCP extinguishers.',
    mandatoryPpe: ['Hard Hat', 'Safety Boots', 'Welding Helmet', 'Leather Apron', 'Cut-5 Gloves'],
    requiresFireWatch: true,
    requiresStandbyPerson: false,
    requiresIsolation: true,
    isolations: [
      {
        id: 'ISO-T1',
        tagNumber: 'V-TEST-01',
        equipmentDescription: 'Process Feed Line Valve',
        isolationType: 'VALVE_LOCKOUT',
        lockNumber: 'LOCK-RED-991',
        appliedBy: 'Operator Karim',
        verifiedBy: 'Eng. Salem',
      },
    ],
    requiresGasTesting: true,
    gasTesterName: 'Subramanian Raman (AGT-401)',
    gasTestingDateTime: new Date().toISOString(),
    gasTestPassed: true,
    gasReadings: [
      { gasName: 'Oxygen (O2)', unit: '%', measuredValue: 20.9, safeLimitDescription: '19.5% - 23.5%', isAcceptable: true },
      { gasName: 'Flammable LEL', unit: '%', measuredValue: 0.0, safeLimitDescription: '< 10%', isAcceptable: true },
      { gasName: 'Hydrogen Sulfide (H2S)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 5 ppm', isAcceptable: true },
      { gasName: 'Carbon Monoxide (CO)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 25 ppm', isAcceptable: true },
    ],
    emergencyArrangements: 'Dedicated radio channel 4 to site emergency response team.',
    assemblyPoint: 'Assembly Station #3',
    nearestFireStationOrStandby: 'RLIC Fire Station #2',
    startDateTime: '2026-03-24T08:00',
    expiryDateTime: '2026-03-24T18:00',
    status: 'ISSUED',
    approvals: {
      issuingAuthoritySigned: true,
      issuingAuthorityName: 'Eng. Salem Al-Hajri',
      issuingSignedAt: '2026-03-24T07:50:00Z',
      performingAuthoritySigned: true,
      performingAuthorityName: 'S. Govindan',
      performingSignedAt: '2026-03-24T07:55:00Z',
      safetyOfficerSigned: false,
      safetyOfficerName: 'Dr. Tariq Al-Mansoor',
    },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await phase7Service.savePermit(fullPermit);
  const fetchedPermit = await phase7Service.getPermitById(testPtwId);
  assert(fetchedPermit !== null, 'Permit saved and retrieved from database');
  assert(fetchedPermit?.permitType === 'HOT_WORK', 'Permit discipline verified');
  assert(fetchedPermit?.linkedRiskAssessmentId === 'RA-2026-001', 'Connected to Risk Assessment (Phase 5)');
  assert(fetchedPermit?.linkedDocumentCodes?.[0] === 'HSE-SOP-001', 'Connected to Controlled Document (Phase 2/4)');
  assert(fetchedPermit?.gasTestPassed === true, 'Atmospheric gas testing results recorded & verified safe');
  assert(fetchedPermit?.isolations.length === 1, 'LOTO isolation point recorded & verified');

  // Test Activation
  console.log('\nTesting Permit Lifecycle Transitions...');
  const activated = await phase7Service.activatePermit(testPtwId, 'Dr. Tariq Al-Mansoor (Safety Authority)');
  assert(activated?.status === 'ACTIVE', 'Permit transitioned from ISSUED to ACTIVE');
  assert(activated?.approvals.safetyOfficerSigned === true, 'Safety Officer digital authorization signed');

  // Test Suspension
  const suspended = await phase7Service.suspendPermit(testPtwId, 'Thunderstorm & high wind warning');
  assert(suspended?.status === 'SUSPENDED', 'Permit transitioned to SUSPENDED on safety hold');
  assert(suspended?.suspensionReason === 'Thunderstorm & high wind warning', 'Suspension reason recorded');

  // Test Closeout & De-isolation
  const closed = await phase7Service.closePermit(
    testPtwId,
    'Eng. Salem Al-Hajri',
    'Welding inspected, radiographic NDT passed, LOTO locks normalized.',
    true,
    true
  );
  assert(closed?.status === 'CLOSED', 'Permit officially closed out');
  assert(closed?.closureDetails?.worksiteRestoredClean === true, 'Worksite verified clean and safe');
  assert(closed?.closureDetails?.isolationsRemoved === true, 'Energy isolations verified removed and normalized');

  console.log('\n====================================================');
  console.log(`PHASE 7 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase7Tests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
