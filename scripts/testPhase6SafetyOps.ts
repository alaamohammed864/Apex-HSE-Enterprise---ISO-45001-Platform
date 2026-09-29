/**
 * Automated Verification Test Script for Phase 6 — Incidents, CAPA, Inspections & Audits
 * Tests all requirements:
 * 1. Incident Management (Report, 5-Why Analysis, Witnesses, Evidence, Photos, Closure)
 * 2. Corrective Actions / CAPA (Fields, Auto-Overdue Detection, Verification, Closure)
 * 3. Dynamic Checklist Builder (All 12 disciplines: PPE, Scaffold, Crane, Lifting, Fire, Vehicle, Excavation, Housekeeping, Electrical, WAH, Confined Space, Emergency)
 * 4. Audits (Plan, Scope, Criteria, Auditor, Auditee, Checklist, Findings, Final Report)
 * 5. Inter-Module Relationships:
 *    - Incident → CAPA
 *    - Audit → CAPA
 *    - Inspection → CAPA
 */

import { safetyOpsService } from '../src/services/safetyOpsService';
import {
  IncidentReportRecord,
  CapaRecord,
  InspectionChecklistTemplate,
  InspectionRecordExecution,
  AuditRecordModel,
} from '../src/types/safetyOps';

async function runPhase6Tests() {
  console.log('====================================================');
  console.log('STARTING PHASE 6 VERIFICATION: SAFETY OPERATIONS');
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
  await safetyOpsService.init();

  // ----------------------------------------------------
  // TEST 1: INCIDENT MANAGEMENT & 5-WHY ROOT CAUSE
  // ----------------------------------------------------
  console.log('\n--- TEST 1: INCIDENT MANAGEMENT & 5-WHY ROOT CAUSE ---');
  const testIncId = `INC-TEST-${Date.now().toString().slice(-4)}`;
  const incident: IncidentReportRecord = {
    id: testIncId,
    incidentNumber: testIncId,
    date: '2026-03-20',
    time: '11:30',
    location: 'Turbine Hall Unit 2',
    project: 'Ras Laffan EPC-4',
    department: 'Electrical & Instrumentation',
    person: 'Khalid Al-Ghamdi (Technician)',
    contractor: 'Siemens Energy Subcontractor',
    activity: '415V Switchgear Routine Servicing',
    incidentType: 'NEAR_MISS',
    description: 'Arc flash flashover hazard detected when testing busbar due to loose insulating shroud.',
    immediateActions: 'Panel isolated and red locked out.',
    rootCause: 'Maintenance technician used uncalibrated torque wrench; insulating shroud bracket was under-torqued.',
    fiveWhyAnalysis: [
      { level: 1, question: 'What happened?', answer: 'Shroud slipped near energized terminal.' },
      { level: 2, question: 'Why did it slip?', answer: 'Retaining bolt was under-torqued.' },
      { level: 3, question: 'Why was torque insufficient?', answer: 'Technician used standard ratchet rather than calibrated torque tool.' },
      { level: 4, question: 'Why was calibrated tool not used?', answer: 'Calibrated torque wrench locker was locked and key not transferred at shift change.' },
      { level: 5, question: 'Systemic Root Cause', answer: 'Tools control procedure lacked mandatory pre-task verification check by electrical supervisor.', isSystemicRootCause: true },
    ],
    contributingFactors: {
      humanFactors: ['Rushing to complete before shift end'],
      equipmentFactors: ['Torque tool access delayed'],
      environmentalFactors: ['Dim lighting inside cubicle'],
      proceduralFactors: ['Tool inventory verification step omitted'],
      organizationalFactors: ['Supervision handover gap'],
    },
    witnesses: [
      {
        id: 'WIT-01',
        name: 'Saad Al-Otaibi',
        role: 'Assistant Technician',
        contractorOrDept: 'Siemens Energy',
        statement: 'I saw Khalid isolate the breaker before inspecting the shroud.',
        interviewDate: '2026-03-20',
        interviewedBy: 'Eng. Farhan Al-Kuwari',
      },
    ],
    evidence: [
      {
        id: 'EVD-01',
        title: 'Switchgear Busbar Inspection Photo',
        type: 'PHOTO',
        urlOrBase64: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758',
        description: 'Shows bolt tension indicator.',
        uploadedAt: '2026-03-20T12:00:00Z',
        capturedBy: 'Farhan',
      },
    ],
    photos: [],
    correctiveActions: 'Re-torque all 24 busbar shrouds with certified calibrated wrench #TW-8841.',
    preventiveActions: 'Update Electrical Safety SOP-12 to mandate calibrated tool serial logging on PTW certificate.',
    responsiblePerson: 'Lead Electrical Authority Venkatraman',
    dueDate: '2026-04-01',
    status: 'UNDER_INVESTIGATION',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await safetyOpsService.saveIncident(incident);
  const fetchedInc = await safetyOpsService.getIncidentById(testIncId);
  assert(fetchedInc !== null, 'Incident saved and retrieved from database');
  assert(fetchedInc?.incidentNumber === testIncId, 'Incident number matches');
  assert(fetchedInc?.fiveWhyAnalysis.length === 5, '5-Why root cause analysis contains all 5 levels');
  assert(fetchedInc?.fiveWhyAnalysis[4].isSystemicRootCause === true, 'Level 5 identified as systemic root cause');
  assert(fetchedInc?.witnesses.length === 1, 'Witness statements persisted');
  assert(fetchedInc?.evidence.length === 1, 'Evidence records persisted');

  // Test Incident closure
  const closedInc = await safetyOpsService.closeIncident(
    testIncId,
    'Dr. Tariq Al-Mansoor',
    'Torque verification completed and SOP-12 updated.'
  );
  assert(closedInc?.status === 'CLOSED', 'Incident closed with formal signoff');
  assert(closedInc?.closure?.closedBy === 'Dr. Tariq Al-Mansoor', 'Closure recorded correct author');

  // ----------------------------------------------------
  // TEST 2: CORRECTIVE ACTIONS (CAPA) & AUTO-OVERDUE
  // ----------------------------------------------------
  console.log('\n--- TEST 2: CAPA MODULE & AUTOMATIC OVERDUE DETECTION ---');
  // Past date to trigger overdue auto-detection
  const overdueTargetDate = '2026-01-10';
  const testCapaOverdue: CapaRecord = {
    id: `CAPA-TEST-OD-${Date.now().toString().slice(-4)}`,
    finding: 'Fire barrier penetration seal missing on Cable Tray 4',
    source: 'AUDIT',
    sourceReferenceId: 'AUD-2026-001',
    riskLevel: 'HIGH',
    actionRequired: 'Install 2-hour rated intumescent fire stop pillow barrier',
    responsiblePerson: 'Site Fire Safety Lead',
    department: 'Civil Works',
    targetDate: overdueTargetDate,
    evidence: [],
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await safetyOpsService.saveCapa(testCapaOverdue);
  const allCapas = await safetyOpsService.getCapas();
  const fetchedOverdue = allCapas.find((c) => c.id === testCapaOverdue.id);
  assert(fetchedOverdue !== undefined, 'Overdue CAPA saved and retrieved');
  assert(
    fetchedOverdue?.status === 'OVERDUE',
    `Automated overdue identification verified (status changed to ${fetchedOverdue?.status})`
  );

  // Test CAPA Verification and Closure
  const closedCapa = await safetyOpsService.verifyAndCloseCapa(
    testCapaOverdue.id,
    'Dr. Tariq Al-Mansoor',
    'Intumescent barrier installed and inspected. 2-hr fire resistance certificate verified.',
    true
  );
  assert(closedCapa?.status === 'CLOSED', 'CAPA verified and successfully closed');
  assert(closedCapa?.closureDate !== undefined, 'CAPA closure date recorded');

  // ----------------------------------------------------
  // TEST 3: DYNAMIC CHECKLIST BUILDER & 12 DISCIPLINES
  // ----------------------------------------------------
  console.log('\n--- TEST 3: INSPECTION CHECKLIST BUILDER (12 DISCIPLINES) ---');
  const templates = await safetyOpsService.getChecklistTemplates();
  const requiredDisciplines = [
    'PPE',
    'Scaffold',
    'Crane',
    'Lifting Equipment',
    'Fire Equipment',
    'Vehicle',
    'Excavation',
    'Housekeeping',
    'Electrical',
    'Working at Height',
    'Confined Space',
    'Emergency Equipment',
  ];

  for (const disc of requiredDisciplines) {
    const tmpl = templates.find((t) => t.discipline === disc);
    assert(tmpl !== undefined, `Checklist template for discipline "${disc}" is present`);
    if (tmpl) {
      assert(tmpl.items.length >= 3, `Discipline "${disc}" has ${tmpl.items.length} checklist items`);
    }
  }

  // Test custom checklist builder save
  const customTmpl: InspectionChecklistTemplate = {
    id: `TMPL-CUSTOM-${Date.now().toString().slice(-4)}`,
    title: 'Custom Hydrostatic Pressure Testing Inspection',
    discipline: 'General Site',
    version: '1.0',
    description: 'Verification of test manifolds, whip-checks, and pressure relief valves.',
    items: [
      { id: 'HYD-01', code: 'H.1', requirement: 'Whip-checks fitted at all high-pressure hose connections.', standardReference: 'ASME B31.3', criticalItem: true },
      { id: 'HYD-02', code: 'H.2', requirement: 'Calibrated deadweight pressure gauge within valid 6-month calibration band.', standardReference: 'API 570', criticalItem: true },
      { id: 'HYD-03', code: 'H.3', requirement: 'Exclusion zone barricaded with 50m radius and red warning lights.', standardReference: 'SOP-HYD-01', criticalItem: true },
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await safetyOpsService.saveChecklistTemplate(customTmpl);
  const fetchedTmpl = await safetyOpsService.getChecklistTemplateById(customTmpl.id);
  assert(fetchedTmpl?.title === customTmpl.title, 'Custom checklist created and saved via builder');

  // ----------------------------------------------------
  // TEST 4: AUDITS (PLAN, SCOPE, CRITERIA, FINDINGS, FINAL REPORT)
  // ----------------------------------------------------
  console.log('\n--- TEST 4: AUDIT MANAGEMENT & FINAL REPORT GENERATION ---');
  const testAuditId = `AUD-TEST-${Date.now().toString().slice(-4)}`;
  const audit: AuditRecordModel = {
    id: testAuditId,
    auditNumber: testAuditId,
    auditPlan: 'Q2 Subcontractor Safety Compliance Audit',
    auditScope: 'Review of contractor lifting gear, PTW adherence, and gas testing calibration.',
    auditCriteria: 'ISO 45001:2018 §8.1.4, OSHA 1926 Subpart H, and Golden Rules',
    auditor: 'Dr. Tariq Al-Mansoor (Lead Auditor)',
    auditTeam: ['Eng. Farhan Al-Kuwari'],
    auditee: 'Subcontractor Al-Futtaim Heavy Construction PM',
    department: 'Civil & Scaffolding',
    project: 'Al-Khor Pipe Rack Route 9',
    plannedDate: '2026-03-22',
    status: 'IN_PROGRESS',
    checklist: [
      { id: 'CHK-1', clause: 'ISO 45001 §8.1.4', requirement: 'Contractor rigging certifications.', criteria: 'Third party certificates on file.', result: 'CONFORMANT' },
      { id: 'CHK-2', clause: 'ISO 45001 §8.1.2', requirement: 'Fall prevention hierarchy applied on pipe rack.', criteria: 'Static lifelines and harnesses.', result: 'NONCONFORMANT' },
    ],
    findings: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await safetyOpsService.saveAudit(audit);
  const fetchedAudit = await safetyOpsService.getAuditById(testAuditId);
  assert(fetchedAudit !== null, 'Audit plan created and saved');
  assert(fetchedAudit?.auditCriteria === audit.auditCriteria, 'Audit criteria verified');

  // Add Nonconformity finding
  const finding = await safetyOpsService.addAuditFinding(testAuditId, {
    type: 'NONCONFORMITY',
    severity: 'MAJOR_NC',
    clause: 'ISO 45001 §8.1.2',
    findingDescription: 'Static lifeline at elevation +18m had damaged swaged terminal sleeve.',
    evidence: 'Visual inspection showed corrosion and 2 broken wire strands at anchor point.',
    correctiveActionRequired: 'Replace static lifeline immediately and certify with 22.2 kN pull test.',
    responsiblePerson: 'T. Suresh (Scaffolding Supervisor)',
    targetDate: '2026-03-29',
  });

  assert(finding !== null, 'Audit nonconformity finding added to audit');
  assert(finding?.severity === 'MAJOR_NC', 'Major Nonconformity recorded');

  // Generate Final Audit Report
  const finalReport = await safetyOpsService.generateFinalReport(
    testAuditId,
    'Dr. Tariq Al-Mansoor (Lead Auditor)'
  );
  assert(finalReport?.finalReportGenerated === true, 'Final Audit Report compiled');
  assert(finalReport?.conformanceRating === 'CRITICAL_DEFICIENCIES', 'Conformance rating computed correctly for Major NC');
  assert(finalReport?.status === 'CLOSED', 'Audit status finalized to CLOSED');

  // ----------------------------------------------------
  // TEST 5: RELATIONSHIPS
  // ----------------------------------------------------
  console.log('\n--- TEST 5: INTER-MODULE RELATIONSHIPS & BRIDGES ---');

  // 1. INCIDENT → CAPA
  console.log('Testing Relationship 1: Incident → CAPA...');
  const spawnedFromIncident = await safetyOpsService.createCapaFromIncident(testIncId, {
    actionRequired: 'Replace all uncalibrated torque wrenches across site.',
  });
  assert(spawnedFromIncident.source === 'INCIDENT', 'Spawned CAPA has Source = INCIDENT');
  assert(spawnedFromIncident.sourceReferenceId === testIncId, 'Spawned CAPA references parent incident ID');
  const updatedIncAfterCapa = await safetyOpsService.getIncidentById(testIncId);
  assert(
    updatedIncAfterCapa?.spawnedCapaIds?.includes(spawnedFromIncident.id) === true,
    'Parent Incident records linked spawned CAPA ID'
  );

  // 2. AUDIT → CAPA
  console.log('Testing Relationship 2: Audit → CAPA...');
  if (finding) {
    const spawnedFromAudit = await safetyOpsService.createCapaFromAuditFinding(testAuditId, finding.id);
    assert(spawnedFromAudit.source === 'AUDIT', 'Spawned CAPA has Source = AUDIT');
    assert(spawnedFromAudit.sourceReferenceId === testAuditId, 'Spawned CAPA references parent audit ID');
    assert(spawnedFromAudit.riskLevel === 'CRITICAL', 'Major NC mapped to CRITICAL risk level in CAPA');
    const updatedAuditAfterCapa = await safetyOpsService.getAuditById(testAuditId);
    const updatedFinding = updatedAuditAfterCapa?.findings.find((f) => f.id === finding.id);
    assert(updatedFinding?.status === 'CAPA_DISPATCHED', 'Audit finding status updated to CAPA_DISPATCHED');
    assert(updatedFinding?.capaIdCreated === spawnedFromAudit.id, 'Audit finding holds reference to created CAPA ID');
  }

  // 3. INSPECTION → CAPA
  console.log('Testing Relationship 3: Inspection → CAPA...');
  const inspectionExecution: InspectionRecordExecution = {
    id: `INS-TEST-${Date.now().toString().slice(-4)}`,
    templateId: 'TMPL-INSP-PPE',
    templateTitle: 'Personal Protective Equipment Inspection',
    discipline: 'PPE',
    date: '2026-03-24',
    inspectorName: 'Eng. Farhan Al-Kuwari',
    project: 'Ras Laffan EPC-4',
    location: 'Gate 3 Access Point',
    contractor: 'CCC Consortia',
    items: [
      { itemId: 'PPE-01', requirement: 'Hard hats compliant.', status: 'PASS', comment: 'All good.' },
      { itemId: 'PPE-03', requirement: 'Safety footwear with composite toe.', status: 'FAIL', comment: 'Subcontractor workers wearing soft sneakers inside active zone.', correctiveAction: 'Stop work, remove from area, and issue ANSI-compliant boots.' },
    ],
    overallResult: 'FAIL',
    complianceScorePercent: 50,
    createdAt: new Date().toISOString(),
  };

  await safetyOpsService.saveInspectionRecord(inspectionExecution);
  const spawnedFromInspection = await safetyOpsService.createCapaFromInspection(
    inspectionExecution.id,
    'PPE-03'
  );
  assert(spawnedFromInspection.source === 'INSPECTION', 'Spawned CAPA has Source = INSPECTION');
  assert(spawnedFromInspection.sourceReferenceId === inspectionExecution.id, 'Spawned CAPA references parent inspection ID');
  const updatedInspection = await safetyOpsService.getInspectionRecordById(inspectionExecution.id);
  const failedItem = updatedInspection?.items.find((i) => i.itemId === 'PPE-03');
  assert(failedItem?.capaIdCreated === spawnedFromInspection.id, 'Inspection record item updated with created CAPA ID');

  console.log('\n====================================================');
  console.log(`PHASE 6 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase6Tests().catch((err) => {
  console.error('Fatal test execution error:', err);
  process.exit(1);
});
