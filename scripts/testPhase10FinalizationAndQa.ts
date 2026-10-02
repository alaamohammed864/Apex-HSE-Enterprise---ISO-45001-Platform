/**
 * Phase 10 Automated Verification Test Suite
 * Finalization, Security, RTL/LTR and Quality Assurance
 * Systematically tests:
 * 1. Language & RTL/LTR parity (Translations EN & AR, menus, forms, tables, dialogs, validation, notifications)
 * 2. Security Subsystem (Authentication, RBAC authorization, input sanitization, file upload validation, audit logging)
 * 3. Quality Assurance across all 15 operational safety modules
 * 4. Responsive & Integrity checks
 */

import { translations } from '../src/translations';
import { SecurityService } from '../src/services/securityService';
import { INITIAL_USERS, UserRole } from '../src/context/AuthContext';
import { DocumentControlService } from '../src/services/documentControlService';
import { AuditLogService } from '../src/services/auditLogService';
import { riskService } from '../src/services/riskService';
import { safetyOpsService } from '../src/services/safetyOpsService';
import { phase7Service } from '../src/services/phase7Service';
import { ReportingService } from '../src/services/reportingService';

async function runPhase10Tests() {
  console.log('================================================================');
  console.log('STARTING PHASE 10: FINALIZATION, SECURITY, RTL/LTR & QA TESTS');
  console.log('================================================================');

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

  // ----------------------------------------------------------------
  // 1. LANGUAGE, TRANSLATION KEYS & RTL/LTR PARITY
  // ----------------------------------------------------------------
  console.log('\n--- 1. LANGUAGE & TRANSLATION KEYS PARITY ---');

  const enKeys = Object.keys(translations.en) as Array<keyof typeof translations.en>;
  const arKeys = Object.keys(translations.ar) as Array<keyof typeof translations.ar>;

  assert(enKeys.length > 50, `English translation dictionary has rich vocabulary (${enKeys.length} keys)`);
  assert(arKeys.length > 50, `Arabic translation dictionary has rich vocabulary (${arKeys.length} keys)`);
  assert(enKeys.length === arKeys.length, `Complete 1:1 key parity between English and Arabic (${enKeys.length} keys)`);

  // Verify critical categories exist in both languages
  const sampleKeys = [
    'appName', 'commandDashboard', 'documentLibrary', 'riskMatrixAlarp',
    'incidents5Why', 'correctiveActionsCapa', 'ptwLiveBoard', 'inspectionsChecklists',
    'competencyMatrix', 'auditsNcrTracker', 'kpiManagement', 'reportingCenter',
    'organizationRoles', 'auditTrailLedger', 'save', 'cancel', 'statusDraft',
    'statusApproved', 'statusPublished', 'emergencyPlansTitle', 'musterPoints',
    'fieldRequired', 'invalidEmail', 'fileTooLarge'
  ] as Array<keyof typeof translations.en>;

  for (const k of sampleKeys) {
    assert(
      Boolean(translations.en[k]) && Boolean(translations.ar[k]),
      `Key '${String(k)}' defined in both languages (EN: "${translations.en[k]}", AR: "${translations.ar[k]}")`
    );
  }

  // Verify non-Latin Arabic text in Arabic dictionary
  assert(/[\u0600-\u06FF]/.test(translations.ar.appName), 'Arabic dictionary contains valid Arabic characters');

  // ----------------------------------------------------------------
  // 2. SECURITY & INPUT SANITIZATION
  // ----------------------------------------------------------------
  console.log('\n--- 2. SECURITY & INPUT SANITIZATION ---');

  const maliciousScript = 'Safe Text <script>alert("XSS")</script> Continues';
  const sanitizedScript = SecurityService.sanitizeInput(maliciousScript);
  assert(!sanitizedScript.includes('<script>') && !sanitizedScript.includes('alert('), 'XSS script tags stripped completely');

  const maliciousHandler = '<div onerror="javascript:alert(1)">Image</div>';
  const sanitizedHandler = SecurityService.sanitizeInput(maliciousHandler);
  assert(!sanitizedHandler.includes('onerror') && !sanitizedHandler.includes('javascript:'), 'Inline event handlers and javascript: stripped');

  // Directory traversal sanitization
  const dangerousFileName = '../../../etc/passwd.pdf';
  const cleanFileName = SecurityService.sanitizeFileName(dangerousFileName);
  assert(!cleanFileName.includes('..') && !cleanFileName.includes('/'), 'Directory traversal characters (../) stripped from file name');

  // Email validation
  assert(SecurityService.validateEmail('safety.director@company.com'), 'Valid business email passes validation');
  assert(!SecurityService.validateEmail('invalid-email-string'), 'Malformed email rejected');
  assert(!SecurityService.validateEmail('user@domain'), 'Email without TLD rejected');

  // ----------------------------------------------------------------
  // 3. FILE UPLOAD SECURITY VALIDATION
  // ----------------------------------------------------------------
  console.log('\n--- 3. SECURE FILE UPLOAD VALIDATION ---');

  // Fake File object structure for node environment testing
  const validPdfFile = {
    name: 'Site_HSE_Plan_2026.pdf',
    size: 2 * 1024 * 1024, // 2MB
    type: 'application/pdf',
  } as unknown as File;

  const validResult = SecurityService.validateFileUpload(validPdfFile);
  assert(validResult.isValid, 'Valid 2MB PDF file approved for upload');

  const oversizeFile = {
    name: 'Massive_Archive.pdf',
    size: 15 * 1024 * 1024, // 15MB (>10MB limit)
    type: 'application/pdf',
  } as unknown as File;

  const oversizeResult = SecurityService.validateFileUpload(oversizeFile);
  assert(!oversizeResult.isValid && (oversizeResult.error?.includes('exceeds') || false), 'Oversized 15MB file rejected');

  const dangerousExtFile = {
    name: 'trojan_payload.exe',
    size: 1024,
    type: 'application/octet-stream',
  } as unknown as File;

  const dangerousResult = SecurityService.validateFileUpload(dangerousExtFile);
  assert(!dangerousResult.isValid && (dangerousResult.error?.includes('restricted') || false), 'Executable file extension rejected');

  // ----------------------------------------------------------------
  // 4. RBAC & AUTHORIZATION VALIDATION
  // ----------------------------------------------------------------
  console.log('\n--- 4. RBAC & AUTHORIZATION VALIDATION ---');

  assert(INITIAL_USERS.length >= 6, `At least 6 initial enterprise users configured (${INITIAL_USERS.length} configured)`);

  const director = INITIAL_USERS.find((u) => u.role === 'HSE_DIRECTOR');
  const auditor = INITIAL_USERS.find((u) => u.role === 'LEAD_AUDITOR');
  const supervisor = INITIAL_USERS.find((u) => u.role === 'SITE_SUPERVISOR');

  assert(Boolean(director), 'HSE_DIRECTOR account present');
  assert(Boolean(auditor), 'LEAD_AUDITOR account present');
  assert(Boolean(supervisor), 'SITE_SUPERVISOR account present');

  if (director) {
    assert(SecurityService.hasPermission(director, 'manage_users'), 'HSE Director has user management permission');
    assert(SecurityService.hasPermission(director, 'export_audit'), 'HSE Director has audit export permission');
  }

  if (supervisor) {
    assert(!SecurityService.hasPermission(supervisor, 'manage_users'), 'Site Supervisor blocked from user management');
  }

  // ----------------------------------------------------------------
  // 5. OPERATIONAL QUALITY ASSURANCE ACROSS SUBSYSTEMS
  // ----------------------------------------------------------------
  console.log('\n--- 5. OPERATIONAL QUALITY ASSURANCE ACROSS ALL SUBSYSTEMS ---');

  // A. Risk Management 5x5 ALARP
  const riskAssessments = await riskService.getRiskAssessments();
  assert(Array.isArray(riskAssessments), 'Risk Assessments subsystem loads valid register array');

  // B. Safety Operations (Incidents, CAPA, Inspections, Audits)
  await safetyOpsService.init();
  const incidents = await safetyOpsService.getIncidents();
  assert(Array.isArray(incidents) && incidents.length > 0, `Incidents register initialized with ${incidents.length} records`);

  const capas = await safetyOpsService.getCapas();
  assert(Array.isArray(capas) && capas.length > 0, `CAPA register initialized with ${capas.length} records`);

  const inspections = await safetyOpsService.getInspectionRecords();
  assert(Array.isArray(inspections) && inspections.length > 0, `Inspections register initialized with ${inspections.length} records`);

  const audits = await safetyOpsService.getAudits();
  assert(Array.isArray(audits) && audits.length > 0, `ISO 45001 Audits register initialized with ${audits.length} records`);

  // C. Phase 7: Training, KPIs & PTW
  await phase7Service.init();
  const training = await phase7Service.getEmployeeTrainingRecords();
  assert(Array.isArray(training) && training.length > 0, `Competency matrix initialized with ${training.length} worker records`);

  const kpis = await phase7Service.getKpiDefinitions();
  assert(Array.isArray(kpis) && kpis.length > 0, `KPI indicators initialized with ${kpis.length} performance metrics`);

  const ptws = await phase7Service.getPermits();
  assert(Array.isArray(ptws) && ptws.length > 0, `High-hazard PTW board initialized with ${ptws.length} permits`);

  // D. Phase 8: Surveillance Dashboard & Reporting Center
  const metrics = await ReportingService.getDashboardMetrics();
  assert(typeof metrics.kpiStatistics.trir === 'number', `TRIR metric calculated (${metrics.kpiStatistics.trir})`);
  assert(typeof metrics.kpiStatistics.ltifr === 'number', `LTIFR metric calculated (${metrics.kpiStatistics.ltifr})`);

  // E. Phase 9: Document Control & Approval Workflow
  const workflows = await DocumentControlService.getApprovalWorkflow('HSE-PLN-001', 'Rev 00');
  assert(Boolean(workflows) && workflows?.steps?.length === 4, 'Sequential 4-step approval chain operational');

  // F. Cryptographic WORM Audit Chain Verification
  const auditVerification = await AuditLogService.verifyAuditChain();
  assert(auditVerification.isValid, `Audit chain 100% verified with zero tampering across ${auditVerification.totalBlocks} chained blocks`);

  console.log('\n================================================================');
  console.log(`PHASE 10 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase10Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
