/**
 * Phase 9 Automated Verification Test Suite
 * Tests:
 * 1. Document Lifecycle States:
 *    DRAFT, SUBMITTED FOR REVIEW, UNDER REVIEW, REVISION REQUIRED, APPROVED, PUBLISHED, SUPERSEDED, ARCHIVED
 * 2. Configurable Approval Chains:
 *    Prepared By -> HSE Manager -> Project Manager -> Client -> Approved
 *    Stores: User, Role, Date, Time, Decision, Comments
 * 3. CRITICAL Revision Immutability Engine:
 *    - Approved revision must NEVER be overwritten
 *    - Editing approved document spawns new revision (Rev 00 -> Rev 01 -> Rev 02)
 *    - Preserves complete revision history & SHA256 checksums
 * 4. Document Comparison & Field Diffing:
 *    - Compares snapshot payloads and detects changes
 * 5. Comments & Rejection Reasons:
 *    - Captures rejection reasons and transitions to REVISION_REQUIRED
 * 6. Global Audit Log:
 *    - Records: Create, Edit, Delete, Approve, Reject, Publish, Archive, Download, Print, Login, Permission changes
 *    - Cryptographic hash chain verification (prevHash, dataHash, blockHash, tamper detection)
 */

import { DocumentControlService } from '../src/services/documentControlService';
import { AuditLogService } from '../src/services/auditLogService';
import {
  DocumentLifecycleStatus,
  LIFECYCLE_STATUS_LABELS,
  GlobalAuditActionType,
} from '../src/types/documentControl';

async function runPhase9Tests() {
  console.log('================================================================');
  console.log('STARTING PHASE 9: DOCUMENT CONTROL, APPROVAL & AUDIT TRAIL TESTS');
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
  // TEST SUITE 1: DOCUMENT LIFECYCLE ENUM & LABELS
  // ----------------------------------------------------------------
  console.log('\n--- 1. DOCUMENT LIFECYCLE STATES (ALL 8 REQUIRED STATES) ---');
  const expectedLifecycles: DocumentLifecycleStatus[] = [
    'DRAFT',
    'SUBMITTED_FOR_REVIEW',
    'UNDER_REVIEW',
    'REVISION_REQUIRED',
    'APPROVED',
    'PUBLISHED',
    'SUPERSEDED',
    'ARCHIVED',
  ];

  for (const status of expectedLifecycles) {
    const labelObj = LIFECYCLE_STATUS_LABELS[status];
    assert(!!labelObj && !!labelObj.en && !!labelObj.ar, `Lifecycle status ${status} defined with bilingual labels: "${labelObj?.en}" / "${labelObj?.ar}"`);
  }

  // ----------------------------------------------------------------
  // TEST SUITE 2: REVISION IMMUTABILITY & SPAWNING (CRITICAL RULE)
  // ----------------------------------------------------------------
  console.log('\n--- 2. CRITICAL REVISION IMMUTABILITY ENGINE (ISO 45001 §7.5.3) ---');
  const testDocCode = 'TEST-HSE-SOP-099';
  const testDocId = 'doc-test-hse-sop-099';

  // Step A: Create Initial Revision (Rev 00)
  const initialRevResult = await DocumentControlService.editOrCreateDocumentRevision({
    documentId: testDocId,
    documentCode: testDocCode,
    title: 'Confined Space Entry and Atmospheric Monitoring SOP',
    changeSummary: 'Baseline release for plant shutdown and tank cleaning operations.',
    contentData: {
      scope: 'Tank T-104 and Nitrogen purged vessels',
      gasTesterRequired: true,
      oxygenMinThreshold: 19.5,
      oxygenMaxThreshold: 23.5,
      lelMaxThreshold: 5,
    },
    authorId: 'USR-ENG-01',
    authorName: 'Salem Al-Marri',
    authorRole: 'Safety Engineer',
  });

  const rev00 = initialRevResult.revision;
  assert(rev00.revisionNumber === 'Rev 00', `Rev 00 created with number: ${rev00.revisionNumber}`);
  assert(rev00.status === 'DRAFT', `Rev 00 initialized in state: ${rev00.status}`);

  // Step B: Submit Rev 00 for review
  await DocumentControlService.submitForReview(testDocCode, 'Rev 00', 'Salem Al-Marri', 'Safety Engineer', 'Ready for team review');
  let revs = await DocumentControlService.getRevisionsForDocument(testDocCode);
  assert(revs.find((r) => r.revisionNumber === 'Rev 00')?.status === 'SUBMITTED_FOR_REVIEW', 'Rev 00 transitioned to SUBMITTED_FOR_REVIEW');

  // Step C: Step-by-step Approval Chain (Prepared By -> HSE Manager -> Project Manager -> Client)
  console.log('\n--- 3. CONFIGURABLE APPROVAL CHAIN EXECUTION ---');

  // Step 1: Prepared By
  const appStep1 = await DocumentControlService.approveWorkflowStep({
    documentCode: testDocCode,
    revisionNumber: 'Rev 00',
    stepNumber: 1,
    actorUserId: 'USR-ENG-01',
    actorName: 'Salem Al-Marri',
    actorRole: 'Lead HSE Engineer',
    comments: 'Atmospheric limits verified against Qatar MoI and QP specs.',
  });
  assert(!appStep1.isFullyApproved, 'Step 1 (Prepared By) approved; workflow remains in progress');

  // Step 2: HSE Manager
  const appStep2 = await DocumentControlService.approveWorkflowStep({
    documentCode: testDocCode,
    revisionNumber: 'Rev 00',
    stepNumber: 2,
    actorUserId: 'USR-HSE-MGR',
    actorName: 'Dr. Tariq Al-Husseini',
    actorRole: 'HSE Manager',
    comments: 'Continuous gas monitoring and standby rescue team provision verified.',
  });
  assert(!appStep2.isFullyApproved, 'Step 2 (HSE Manager) approved');

  // Step 3: Project Manager
  const appStep3 = await DocumentControlService.approveWorkflowStep({
    documentCode: testDocCode,
    revisionNumber: 'Rev 00',
    stepNumber: 3,
    actorUserId: 'USR-PM-01',
    actorName: 'Eng. Khalid Al-Thani',
    actorRole: 'Project Manager',
    comments: 'Equipment budget and calibration kits approved.',
  });
  assert(!appStep3.isFullyApproved, 'Step 3 (Project Manager) approved');

  // Step 4: Client Representative (Final Step)
  const appStep4 = await DocumentControlService.approveWorkflowStep({
    documentCode: testDocCode,
    revisionNumber: 'Rev 00',
    stepNumber: 4,
    actorUserId: 'USR-CLIENT-01',
    actorName: 'Fatima Al-Kuwari',
    actorRole: 'Client Representative',
    comments: 'Formal client endorsement granted.',
  });
  assert(appStep4.isFullyApproved, 'Step 4 (Client) approved; workflow is fully APPROVED!');
  assert(appStep4.workflow.status === 'APPROVED', 'Workflow status is now APPROVED');

  // Verify stored approval history for step 4: User, Role, Date, Time, Decision, Comments
  const clientStep = appStep4.workflow.steps.find((s) => s.stepNumber === 4);
  assert(clientStep?.decidedByUserName === 'Fatima Al-Kuwari', `Approval history User stored: ${clientStep?.decidedByUserName}`);
  assert(clientStep?.decidedByUserRole === 'Client Representative', `Approval history Role stored: ${clientStep?.decidedByUserRole}`);
  assert(typeof clientStep?.date === 'string' && clientStep.date.length === 10, `Approval history Date stored: ${clientStep?.date}`);
  assert(typeof clientStep?.time === 'string' && clientStep.time.length === 8, `Approval history Time stored: ${clientStep?.time}`);
  assert(clientStep?.decision === 'APPROVED', `Approval history Decision stored: ${clientStep?.decision}`);
  assert(clientStep?.comments === 'Formal client endorsement granted.', `Approval history Comments stored: "${clientStep?.comments}"`);

  // Step D: Publish Approved Rev 00
  await DocumentControlService.publishDocument(testDocCode, 'Rev 00', 'Hamad Al-Attiyah', 'Executive Director');
  revs = await DocumentControlService.getRevisionsForDocument(testDocCode);
  const publishedRev00 = revs.find((r) => r.revisionNumber === 'Rev 00');
  assert(publishedRev00?.status === 'PUBLISHED', 'Rev 00 is PUBLISHED and formally ACTIVE');
  assert(publishedRev00?.isLocked === true, 'Rev 00 is LOCKED (immutable WORM)');

  const originalRev00Snapshot = publishedRev00?.contentSnapshotJson;

  // ----------------------------------------------------------------
  // TEST SUITE 3: IMMUTABILITY RULE TEST - EDITING APPROVED REVISION
  // ----------------------------------------------------------------
  console.log('\n--- 4. EDITING APPROVED REVISION -> MUST SPAWN REV 01 (NEVER OVERWRITE) ---');

  const editResult1 = await DocumentControlService.editOrCreateDocumentRevision({
    documentId: testDocId,
    documentCode: testDocCode,
    title: 'Confined Space Entry SOP (Annual Revision)',
    changeSummary: 'Added strict multi-gas wireless detector telemetry and rescue hoist mandatory requirement.',
    contentData: {
      scope: 'Tank T-104 and Nitrogen purged vessels',
      gasTesterRequired: true,
      oxygenMinThreshold: 19.5,
      oxygenMaxThreshold: 23.5,
      lelMaxThreshold: 5,
      wirelessTelemetry: true, // NEW FIELD
      rescueHoistMandatory: true, // NEW FIELD
    },
    authorId: 'USR-ENG-01',
    authorName: 'Salem Al-Marri',
    authorRole: 'Safety Engineer',
  });

  assert(editResult1.createdNewRevision === true, 'editOrCreateDocumentRevision spawned a new revision!');
  assert(editResult1.previousRevisionPreserved === true, 'Approved revision was preserved without overwrite!');
  assert(editResult1.revision.revisionNumber === 'Rev 01', `Spawned revision is Rev 01 (current: ${editResult1.revision.revisionNumber})`);
  assert(editResult1.revision.status === 'DRAFT', `Rev 01 starts in DRAFT state`);

  // Verify Rev 00 is STILL untouched and unchanged!
  revs = await DocumentControlService.getRevisionsForDocument(testDocCode);
  const rev00Check = revs.find((r) => r.revisionNumber === 'Rev 00');
  assert(rev00Check?.status === 'PUBLISHED', 'Rev 00 status remains PUBLISHED');
  assert(rev00Check?.contentSnapshotJson === originalRev00Snapshot, 'Rev 00 content snapshot is 100% IDENTICAL and UNTOUCHED');

  // Approve & Publish Rev 01 -> Rev 00 should now transition to SUPERSEDED
  await DocumentControlService.approveWorkflowStep({ documentCode: testDocCode, revisionNumber: 'Rev 01', stepNumber: 1, actorName: 'Salem Al-Marri', actorRole: 'Author' });
  await DocumentControlService.approveWorkflowStep({ documentCode: testDocCode, revisionNumber: 'Rev 01', stepNumber: 2, actorName: 'Dr. Tariq Al-Husseini', actorRole: 'HSE Mgr' });
  await DocumentControlService.approveWorkflowStep({ documentCode: testDocCode, revisionNumber: 'Rev 01', stepNumber: 3, actorName: 'Eng. Khalid Al-Thani', actorRole: 'PM' });
  await DocumentControlService.approveWorkflowStep({ documentCode: testDocCode, revisionNumber: 'Rev 01', stepNumber: 4, actorName: 'Fatima Al-Kuwari', actorRole: 'Client' });
  await DocumentControlService.publishDocument(testDocCode, 'Rev 01', 'Hamad Al-Attiyah', 'Executive Director');

  revs = await DocumentControlService.getRevisionsForDocument(testDocCode);
  const rev00Superseded = revs.find((r) => r.revisionNumber === 'Rev 00');
  const rev01Published = revs.find((r) => r.revisionNumber === 'Rev 01');
  assert(rev00Superseded?.status === 'SUPERSEDED', 'Rev 00 transitioned to SUPERSEDED');
  assert(rev01Published?.status === 'PUBLISHED', 'Rev 01 is now PUBLISHED');

  // Edit Rev 01 -> spawns Rev 02
  const editResult2 = await DocumentControlService.editOrCreateDocumentRevision({
    documentId: testDocId,
    documentCode: testDocCode,
    title: 'Confined Space Entry SOP (Emergency Update)',
    changeSummary: 'Integrated automated acoustic distress beacon requirement.',
    contentData: {
      scope: 'Tank T-104 and Nitrogen purged vessels',
      acousticBeaconRequired: true,
    },
  });
  assert(editResult2.revision.revisionNumber === 'Rev 02', `Next edit correctly spawned Rev 02: ${editResult2.revision.revisionNumber}`);

  // ----------------------------------------------------------------
  // TEST SUITE 4: DOCUMENT COMPARISON & DIFF ENGINE
  // ----------------------------------------------------------------
  console.log('\n--- 5. DOCUMENT COMPARISON ENGINE ---');
  const comparison = await DocumentControlService.compareRevisions(testDocCode, 'Rev 00', 'Rev 01');
  assert(comparison.hasChanges === true, 'Comparison detected differences between Rev 00 and Rev 01');
  assert(comparison.contentDiffs.length > 0, `Detected ${comparison.contentDiffs.length} content field comparisons`);

  const addedTelemetry = comparison.contentDiffs.find((d) => d.fieldKey === 'wirelessTelemetry');
  assert(!!addedTelemetry && addedTelemetry.changeType === 'ADDED', 'Detected added field "wirelessTelemetry" in Rev 01');

  // ----------------------------------------------------------------
  // TEST SUITE 5: REJECTION REASON & COMMENTS
  // ----------------------------------------------------------------
  console.log('\n--- 6. REJECTION REASONS & REVISION REQUIRED WORKFLOW ---');
  const rejResult = await DocumentControlService.rejectWorkflowStep({
    documentCode: testDocCode,
    revisionNumber: 'Rev 02',
    stepNumber: 2,
    actorUserId: 'USR-HSE-MGR',
    actorName: 'Dr. Tariq Al-Husseini',
    actorRole: 'HSE Operations Manager',
    rejectionReason: 'Acoustic beacon battery endurance specifications missing. Must specify ATEX Zone 0 compliance.',
  });
  assert(rejResult.status === 'REJECTED', 'Workflow transitioned to REJECTED');

  revs = await DocumentControlService.getRevisionsForDocument(testDocCode);
  const rev02Rejected = revs.find((r) => r.revisionNumber === 'Rev 02');
  assert(rev02Rejected?.status === 'REVISION_REQUIRED', 'Rev 02 lifecycle transitioned to REVISION_REQUIRED');

  const comments = await DocumentControlService.getComments(testDocCode);
  const rejectionComment = comments.find((c) => c.commentText.includes('ATEX Zone 0'));
  assert(!!rejectionComment && rejectionComment.commentText.includes('ATEX Zone 0'), `Rejection reason captured in comment ledger: "${rejectionComment?.commentText}"`);

  // ----------------------------------------------------------------
  // TEST SUITE 6: GLOBAL AUDIT LOG SUBSYSTEM
  // ----------------------------------------------------------------
  console.log('\n--- 7. GLOBAL AUDIT LOG SUBSYSTEM (ALL 11 ACTION TYPES) ---');

  const requiredAuditActions: GlobalAuditActionType[] = [
    'Create',
    'Edit',
    'Delete',
    'Approve',
    'Reject',
    'Publish',
    'Archive',
    'Download',
    'Print',
    'Login',
    'Permission changes',
  ];

  for (const action of requiredAuditActions) {
    const logged = await AuditLogService.logAction({
      action,
      entityType: 'DOCUMENT',
      entityId: `AUDIT-TEST-${action}`,
      entityTitle: `Automated Test for Action ${action}`,
      details: `Verification of audit ledger recording action: ${action}`,
      actorName: 'System Security Auditor',
      actorRole: 'Compliance Officer',
      isoClause: '7.5.3',
    });
    assert(logged.action === action, `Logged action: ${action} with Block #${logged.blockIndex}`);
  }

  // Verify all 11 action types exist in the audit ledger
  const allLogs = await AuditLogService.getAuditLogs();
  for (const action of requiredAuditActions) {
    const exists = allLogs.some((l) => l.action === action);
    assert(exists, `Audit Ledger contains verified record for action: "${action}"`);
  }

  // Cryptographic blockchain verification
  console.log('\n--- 8. CRYPTOGRAPHIC INTEGRITY PROOF (WORM TAMPER DETECTION) ---');
  const auditProof = await AuditLogService.verifyAuditChain();
  assert(auditProof.isValid === true, `Cryptographic chain isValid: ${auditProof.isValid}`);
  assert(auditProof.totalBlocks >= 11, `Total blocks chained: ${auditProof.totalBlocks}`);
  assert(typeof auditProof.rootHash === 'string' && auditProof.rootHash.length === 64, `Valid SHA-256 Root Hash: ${auditProof.rootHash}`);

  // Summary
  console.log('\n================================================================');
  console.log(`PHASE 9 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log('================================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runPhase9Tests().catch((err) => {
  console.error('Test execution failed:', err);
  process.exit(1);
});
