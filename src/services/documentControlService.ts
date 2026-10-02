/**
 * Phase 9: Document Control, Approval Workflow & Revision Integrity Service
 * Strict implementation of ISO 45001:2018 Clause 7.5.3 (Control of Documented Information)
 * 
 * CORE RULES ENFORCED:
 * 1. An approved revision must NEVER be overwritten.
 * 2. If an approved/published document is edited, a new revision is created (e.g. Rev 00 -> Rev 01 -> Rev 02).
 * 3. Configurable approval chains (Prepared By -> HSE Manager -> Project Manager -> Client -> Approved).
 * 4. Audit trail integration for all lifecycle transitions.
 */

import { dbService } from './db';
import { AuditLogService } from './auditLogService';
import {
  DocumentLifecycleStatus,
  ApprovalDecision,
  ApprovalChainStepConfig,
  DEFAULT_APPROVAL_CHAIN,
  ApprovalStepExecution,
  DocumentApprovalWorkflow,
  ControlledDocumentRevision,
  DocumentCommentItem,
  DocumentComparisonResult,
  FieldDiffItem,
} from '../types/documentControl';
import { DocumentInstance } from '../types/database';

export class DocumentControlService {
  private static seedInitialDone = false;

  /**
   * Helper: Parse and compute next revision label (e.g. Rev 00 -> Rev 01, Rev 01 -> Rev 02)
   */
  public static computeNextRevisionNumber(currentRev: string): string {
    const clean = currentRev.trim();
    // Matches Rev 00, Rev 01, Rev 1, REV02, etc.
    const match = clean.match(/Rev\s*(\d+)/i) || clean.match(/REV(\d+)/i);
    if (match) {
      const nextNum = parseInt(match[1], 10) + 1;
      return `Rev ${nextNum.toString().padStart(2, '0')}`;
    }
    // Fallback if decimal format like Rev 1.0
    const decMatch = clean.match(/Rev\s*(\d+)\.(\d+)/i);
    if (decMatch) {
      const major = parseInt(decMatch[1], 10);
      const minor = parseInt(decMatch[2], 10) + 1;
      return `Rev ${major}.${minor}`;
    }
    return 'Rev 01';
  }

  /**
   * Initialize and seed baseline document revisions and workflows if empty
   */
  public static async initSeedIfEmpty(): Promise<void> {
    if (this.seedInitialDone) return;
    this.seedInitialDone = true;

    try {
      const existingRevs = await dbService.getAll<ControlledDocumentRevision>('document_revisions');
      if (existingRevs && existingRevs.length > 0) return;

      const baselineDocCode = 'HSE-PLN-001';
      const baselineDocId = 'doc-hse-pln-001';

      // Seed Rev 00 (Approved & Superseded)
      const rev00: ControlledDocumentRevision = {
        id: `rev-${baselineDocCode}-REV00`,
        documentId: baselineDocId,
        documentCode: baselineDocCode,
        revisionNumber: 'Rev 00',
        status: 'SUPERSEDED',
        changeSummary: 'Initial document baseline release for project mobilization phase.',
        authorId: 'USR-001',
        authorName: 'Tariq Al-Kuwari',
        authorRole: 'Lead HSE Engineer',
        contentSnapshotJson: JSON.stringify({
          title: 'Project HSE Management Plan (Mobilization Baseline)',
          scope: 'Civil works and initial mobilization only',
          retentionYears: 10,
          mandatoryFrequencyDays: 365,
          sectionsCount: 18,
          highRiskDisciplines: ['Excavation', 'Scaffold'],
        }),
        sha256Checksum: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        effectiveDate: '2025-01-15',
        nextReviewDate: '2026-01-15',
        createdAt: '2025-01-10T08:00:00.000Z',
        approvedAt: '2025-01-14T16:00:00.000Z',
        approvedBy: 'Hamad Al-Attiyah (Executive Project Director)',
        supersededAt: '2026-01-20T10:00:00.000Z',
        isLocked: true,
      };

      // Seed Rev 01 (Approved & Published)
      const rev01: ControlledDocumentRevision = {
        id: `rev-${baselineDocCode}-REV01`,
        documentId: baselineDocId,
        documentCode: baselineDocCode,
        revisionNumber: 'Rev 01',
        status: 'PUBLISHED',
        changeSummary: 'Annual comprehensive update incorporating 10 e-PTW disciplines, 5x5 ALARP HIRA matrix, and ISO 45001:2018 §8.1 compliance.',
        authorId: 'USR-001',
        authorName: 'Tariq Al-Kuwari',
        authorRole: 'Lead HSE Engineer',
        contentSnapshotJson: JSON.stringify({
          title: 'Project HSE Management Plan (ISO 45001:2018 Certified)',
          scope: 'Full EPC-4 construction, heavy lifting, commissioning, and handover',
          retentionYears: 15,
          mandatoryFrequencyDays: 365,
          sectionsCount: 33,
          highRiskDisciplines: ['Excavation', 'Scaffold', 'Crane', 'Lifting', 'Hot Work', 'Confined Space', 'LOTO'],
        }),
        sha256Checksum: '5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8',
        effectiveDate: '2026-01-20',
        nextReviewDate: '2027-01-20',
        createdAt: '2026-01-05T09:30:00.000Z',
        approvedAt: '2026-01-19T14:30:00.000Z',
        approvedBy: 'Client Representative (QatarEnergy / Chiyoda)',
        isLocked: true,
      };

      await dbService.put('document_revisions', rev00);
      await dbService.put('document_revisions', rev01);

      // Seed Workflow for Rev 01
      const workflowRev01: DocumentApprovalWorkflow = {
        id: `wf-${baselineDocCode}-REV01`,
        documentId: baselineDocId,
        documentCode: baselineDocCode,
        revisionNumber: 'Rev 01',
        status: 'APPROVED',
        currentStepIndex: 3,
        steps: [
          {
            id: 'step-1',
            stepNumber: 1,
            roleName: 'Prepared By',
            assignedUserName: 'Tariq Al-Kuwari',
            decidedByUserName: 'Tariq Al-Kuwari',
            decidedByUserRole: 'Lead HSE Engineer',
            date: '2026-01-05',
            time: '09:30:00',
            decision: 'APPROVED',
            comments: 'Draft revised with full 33 sections and ISO 45001:2018 alignment.',
            signatureHash: 'SIG-HASH-PREP-9921',
          },
          {
            id: 'step-2',
            stepNumber: 2,
            roleName: 'HSE Manager',
            assignedUserName: 'Marcus Sterling',
            decidedByUserName: 'Marcus Sterling',
            decidedByUserRole: 'HSE Project Manager',
            date: '2026-01-09',
            time: '11:15:00',
            decision: 'APPROVED',
            comments: 'HIRA 5x5 matrix and e-PTW gas testing protocols verified technically sound.',
            signatureHash: 'SIG-HASH-HSEM-3312',
          },
          {
            id: 'step-3',
            stepNumber: 3,
            roleName: 'Project Manager',
            assignedUserName: 'Hamad Al-Attiyah',
            decidedByUserName: 'Hamad Al-Attiyah',
            decidedByUserRole: 'Executive Project Director',
            date: '2026-01-14',
            time: '16:00:00',
            decision: 'APPROVED',
            comments: 'Approved. Resource allocation and contractor safety pre-qual confirmed.',
            signatureHash: 'SIG-HASH-PM-0012',
          },
          {
            id: 'step-4',
            stepNumber: 4,
            roleName: 'Client Representative',
            assignedUserName: 'Dr. Faisal Al-Sulaiti',
            decidedByUserName: 'Dr. Faisal Al-Sulaiti',
            decidedByUserRole: 'Client Senior HSE Director',
            date: '2026-01-19',
            time: '14:30:00',
            decision: 'APPROVED',
            comments: 'Endorsed without non-conformance for EPC-4 construction phase.',
            signatureHash: 'SIG-HASH-CLIENT-7788',
          },
        ],
        createdAt: '2026-01-05T09:30:00.000Z',
        updatedAt: '2026-01-19T14:30:00.000Z',
      };

      await dbService.put('document_approvals', workflowRev01);

      // Seed Initial Comments
      const initialComment: DocumentCommentItem = {
        id: 'cmt-001',
        documentId: baselineDocId,
        documentCode: baselineDocCode,
        revisionNumber: 'Rev 01',
        userId: 'USR-CLIENT',
        userName: 'Dr. Faisal Al-Sulaiti',
        userRole: 'Client Senior HSE Director',
        commentText: 'Confirmed compliance with QP HSE-004 specification and BS EN 12811 scaffolding requirements.',
        category: 'REVIEW',
        createdAt: '2026-01-18T11:00:00.000Z',
      };
      await dbService.put('document_comments', initialComment);
    } catch (err) {
      console.warn('Failed to seed baseline document control data:', err);
    }
  }

  /**
   * Retrieve all revisions for a given document code
   */
  public static async getRevisionsForDocument(documentCode: string): Promise<ControlledDocumentRevision[]> {
    await this.initSeedIfEmpty();
    const all = await dbService.getAll<ControlledDocumentRevision>('document_revisions');
    const filtered = all.filter((r) => r.documentCode === documentCode);
    // Sort chronologically (latest first)
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filtered;
  }

  /**
   * CRITICAL REQUIREMENT: Save or Edit Document with Revision Integrity Protection
   * If the current document version is APPROVED or PUBLISHED:
   * It creates a NEW revision (e.g. Rev 00 -> Rev 01 -> Rev 02) and NEVER overwrites the approved revision.
   */
  public static async editOrCreateDocumentRevision(params: {
    documentId: string;
    documentCode: string;
    title: string;
    changeSummary: string;
    contentData: Record<string, any>;
    authorId?: string;
    authorName?: string;
    authorRole?: string;
    effectiveDate?: string;
    nextReviewDate?: string;
  }): Promise<{
    revision: ControlledDocumentRevision;
    createdNewRevision: boolean;
    previousRevisionPreserved: boolean;
  }> {
    await this.initSeedIfEmpty();

    const existingRevs = await this.getRevisionsForDocument(params.documentCode);
    const latestRev = existingRevs.length > 0 ? existingRevs[0] : null;

    const authorId = params.authorId || 'USR-001';
    const authorName = params.authorName || 'Lead HSE Engineer';
    const authorRole = params.authorRole || 'HSE Department';
    const today = new Date().toISOString().split('T')[0];
    const nextYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Check if latest revision is immutable (APPROVED or PUBLISHED or SUPERSEDED)
    const isImmutable = latestRev && (latestRev.status === 'APPROVED' || latestRev.status === 'PUBLISHED' || latestRev.status === 'SUPERSEDED' || latestRev.isLocked);

    if (isImmutable || !latestRev) {
      // SPAWN NEW REVISION! (e.g. Rev 00 -> Rev 01, or Rev 01 -> Rev 02)
      const nextRevNumber = latestRev ? this.computeNextRevisionNumber(latestRev.revisionNumber) : 'Rev 00';
      const newRevId = `rev-${params.documentCode}-${nextRevNumber.replace(/\s+/g, '')}-${Date.now()}`;

      const contentJson = JSON.stringify({
        ...params.contentData,
        title: params.title,
        documentCode: params.documentCode,
        revisionNumber: nextRevNumber,
        lastEditedAt: new Date().toISOString(),
      });

      const newRevision: ControlledDocumentRevision = {
        id: newRevId,
        documentId: params.documentId,
        documentCode: params.documentCode,
        revisionNumber: nextRevNumber,
        status: 'DRAFT', // New revision starts as DRAFT
        changeSummary: params.changeSummary || `Revision created based on previous ${latestRev?.revisionNumber || 'baseline'}.`,
        authorId,
        authorName,
        authorRole,
        contentSnapshotJson: contentJson,
        sha256Checksum: `chk-${Date.now().toString(16)}`,
        effectiveDate: params.effectiveDate || today,
        nextReviewDate: params.nextReviewDate || nextYear,
        createdAt: new Date().toISOString(),
        isLocked: false,
      };

      await dbService.put('document_revisions', newRevision);

      // Create Fresh Approval Workflow for new revision
      await this.createApprovalWorkflow(params.documentId, params.documentCode, nextRevNumber);

      // Log in Global Audit Log
      await AuditLogService.logAction({
        action: 'Create',
        entityType: 'REVISION',
        entityId: newRevId,
        entityTitle: `${params.documentCode} (${nextRevNumber})`,
        details: `Created new working revision ${nextRevNumber} derived from ${latestRev?.revisionNumber || 'root'}. Previous approved revision remained locked and untouched.`,
        actorUserId: authorId,
        actorName: authorName,
        actorRole: authorRole,
        isoClause: '7.5.2',
      });

      return {
        revision: newRevision,
        createdNewRevision: true,
        previousRevisionPreserved: Boolean(latestRev),
      };
    } else {
      // Update DRAFT revision in place
      const updatedJson = JSON.stringify({
        ...JSON.parse(latestRev.contentSnapshotJson || '{}'),
        ...params.contentData,
        title: params.title,
        lastEditedAt: new Date().toISOString(),
      });

      latestRev.contentSnapshotJson = updatedJson;
      latestRev.changeSummary = params.changeSummary || latestRev.changeSummary;
      latestRev.authorName = authorName;
      latestRev.authorRole = authorRole;

      await dbService.put('document_revisions', latestRev);

      await AuditLogService.logAction({
        action: 'Edit',
        entityType: 'REVISION',
        entityId: latestRev.id,
        entityTitle: `${params.documentCode} (${latestRev.revisionNumber})`,
        details: `Updated active draft revision ${latestRev.revisionNumber}.`,
        actorUserId: authorId,
        actorName: authorName,
        actorRole: authorRole,
        isoClause: '7.5.2',
      });

      return {
        revision: latestRev,
        createdNewRevision: false,
        previousRevisionPreserved: false,
      };
    }
  }

  /**
   * Create or reset an Approval Workflow for a revision
   */
  public static async createApprovalWorkflow(
    documentId: string,
    documentCode: string,
    revisionNumber: string,
    customChain?: ApprovalChainStepConfig[]
  ): Promise<DocumentApprovalWorkflow> {
    const chain = customChain || DEFAULT_APPROVAL_CHAIN;

    const steps: ApprovalStepExecution[] = chain.map((cfg) => ({
      id: `step-${cfg.stepNumber}-${Date.now()}`,
      stepNumber: cfg.stepNumber,
      roleName: cfg.roleName,
      roleNameAr: cfg.roleNameAr,
      decision: 'PENDING',
    }));

    const workflow: DocumentApprovalWorkflow = {
      id: `wf-${documentCode}-${revisionNumber.replace(/\s+/g, '')}`,
      documentId,
      documentCode,
      revisionNumber,
      status: 'PENDING',
      currentStepIndex: 0,
      steps,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await dbService.put('document_approvals', workflow);
    return workflow;
  }

  /**
   * Retrieve active Approval Workflow for document revision
   */
  public static async getApprovalWorkflow(documentCode: string, revisionNumber: string): Promise<DocumentApprovalWorkflow | null> {
    await this.initSeedIfEmpty();
    const all = await dbService.getAll<DocumentApprovalWorkflow>('document_approvals');
    const match = all.find((wf) => wf.documentCode === documentCode && wf.revisionNumber === revisionNumber);
    if (match) return match;

    // Auto-create if not found
    return await this.createApprovalWorkflow(`doc-${documentCode.toLowerCase()}`, documentCode, revisionNumber);
  }

  /**
   * Submit document for review (Transition: DRAFT -> SUBMITTED_FOR_REVIEW / UNDER_REVIEW)
   */
  public static async submitForReview(
    documentCode: string,
    revisionNumber: string,
    actorName = 'Lead HSE Engineer',
    actorRole = 'HSE Department',
    comments?: string
  ): Promise<void> {
    const revisions = await this.getRevisionsForDocument(documentCode);
    const targetRev = revisions.find((r) => r.revisionNumber === revisionNumber);
    if (!targetRev) throw new Error(`Revision ${revisionNumber} not found for ${documentCode}`);

    targetRev.status = 'SUBMITTED_FOR_REVIEW';
    await dbService.put('document_revisions', targetRev);

    const wf = await this.getApprovalWorkflow(documentCode, revisionNumber);
    if (wf) {
      wf.status = 'IN_PROGRESS';
      wf.updatedAt = new Date().toISOString();
      await dbService.put('document_approvals', wf);
    }

    if (comments) {
      await this.addComment(documentCode, revisionNumber, actorName, actorRole, comments, 'REVIEW');
    }

    await AuditLogService.logAction({
      action: 'Edit',
      entityType: 'DOCUMENT',
      entityId: targetRev.id,
      entityTitle: `${documentCode} (${revisionNumber})`,
      details: `Document submitted for formal multi-tier review cycle. Comments: ${comments || 'None'}`,
      actorName,
      actorRole,
      isoClause: '7.5.3',
    });
  }

  /**
   * Record approval decision for current step
   */
  public static async approveWorkflowStep(params: {
    documentCode: string;
    revisionNumber: string;
    stepNumber: number;
    actorUserId?: string;
    actorName: string;
    actorRole: string;
    comments?: string;
  }): Promise<{ workflow: DocumentApprovalWorkflow; isFullyApproved: boolean }> {
    const wf = await this.getApprovalWorkflow(params.documentCode, params.revisionNumber);
    if (!wf) throw new Error('Workflow not found');

    const stepIndex = wf.steps.findIndex((s) => s.stepNumber === params.stepNumber);
    if (stepIndex === -1) throw new Error(`Step ${params.stepNumber} not found in approval chain`);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    wf.steps[stepIndex] = {
      ...wf.steps[stepIndex],
      decision: 'APPROVED',
      decidedByUserId: params.actorUserId || 'USR-ACTOR',
      decidedByUserName: params.actorName,
      decidedByUserRole: params.actorRole,
      date: dateStr,
      time: timeStr,
      comments: params.comments || 'Endorsed without non-conformance.',
      signatureHash: `SIG-${Date.now().toString(16).toUpperCase()}`,
    };

    // Check if this was the last step
    const isLastStep = stepIndex === wf.steps.length - 1;
    let isFullyApproved = false;

    if (isLastStep) {
      wf.status = 'APPROVED';
      isFullyApproved = true;

      // Update Revision Status to APPROVED and lock it (WORM)
      const revisions = await this.getRevisionsForDocument(params.documentCode);
      const targetRev = revisions.find((r) => r.revisionNumber === params.revisionNumber);
      if (targetRev) {
        targetRev.status = 'APPROVED';
        targetRev.isLocked = true;
        targetRev.approvedAt = now.toISOString();
        targetRev.approvedBy = `${params.actorName} (${params.actorRole})`;
        await dbService.put('document_revisions', targetRev);
      }
    } else {
      wf.currentStepIndex = stepIndex + 1;
      wf.status = 'IN_PROGRESS';

      // Mark document revision as UNDER_REVIEW
      const revisions = await this.getRevisionsForDocument(params.documentCode);
      const targetRev = revisions.find((r) => r.revisionNumber === params.revisionNumber);
      if (targetRev && targetRev.status !== 'UNDER_REVIEW') {
        targetRev.status = 'UNDER_REVIEW';
        await dbService.put('document_revisions', targetRev);
      }
    }

    wf.updatedAt = now.toISOString();
    await dbService.put('document_approvals', wf);

    // Record in Global Audit Log
    await AuditLogService.logAction({
      action: 'Approve',
      entityType: 'APPROVAL',
      entityId: wf.id,
      entityTitle: `${params.documentCode} (${params.revisionNumber}) - Step ${params.stepNumber}`,
      details: `Step ${params.stepNumber} (${wf.steps[stepIndex].roleName}) approved by ${params.actorName}. Comments: ${params.comments || 'Approved'}. Entire workflow ${isFullyApproved ? 'COMPLETE (APPROVED)' : 'advanced to next step'}.`,
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      isoClause: '7.5.3',
    });

    return { workflow: wf, isFullyApproved };
  }

  /**
   * Reject or Request Revision (Transition: -> REVISION_REQUIRED)
   * Mandatory rejection reason must be recorded.
   */
  public static async rejectWorkflowStep(params: {
    documentCode: string;
    revisionNumber: string;
    stepNumber: number;
    actorUserId?: string;
    actorName: string;
    actorRole: string;
    rejectionReason: string;
    comments?: string;
  }): Promise<DocumentApprovalWorkflow> {
    if (!params.rejectionReason || params.rejectionReason.trim().length === 0) {
      throw new Error('A specific rejection reason is mandatory under ISO 45001 Clause 7.5.2');
    }

    const wf = await this.getApprovalWorkflow(params.documentCode, params.revisionNumber);
    if (!wf) throw new Error('Workflow not found');

    const stepIndex = wf.steps.findIndex((s) => s.stepNumber === params.stepNumber);
    if (stepIndex === -1) throw new Error(`Step ${params.stepNumber} not found in chain`);

    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const timeStr = now.toTimeString().split(' ')[0];

    wf.steps[stepIndex] = {
      ...wf.steps[stepIndex],
      decision: 'REVISION_REQUIRED',
      decidedByUserId: params.actorUserId || 'USR-ACTOR',
      decidedByUserName: params.actorName,
      decidedByUserRole: params.actorRole,
      date: dateStr,
      time: timeStr,
      rejectionReason: params.rejectionReason,
      comments: params.comments || params.rejectionReason,
    };

    wf.status = 'REJECTED';
    wf.updatedAt = now.toISOString();
    await dbService.put('document_approvals', wf);

    // Transition revision status to REVISION_REQUIRED
    const revisions = await this.getRevisionsForDocument(params.documentCode);
    const targetRev = revisions.find((r) => r.revisionNumber === params.revisionNumber);
    if (targetRev) {
      targetRev.status = 'REVISION_REQUIRED';
      await dbService.put('document_revisions', targetRev);
    }

    // Add note to comment stream
    await this.addComment(
      params.documentCode,
      params.revisionNumber,
      params.actorName,
      params.actorRole,
      `[REVISION REQUIRED at Step ${params.stepNumber}]: ${params.rejectionReason}`,
      'REVISION_NOTE'
    );

    // Record in Global Audit Log
    await AuditLogService.logAction({
      action: 'Reject',
      entityType: 'APPROVAL',
      entityId: wf.id,
      entityTitle: `${params.documentCode} (${params.revisionNumber}) - Step ${params.stepNumber}`,
      details: `Step ${params.stepNumber} rejected by ${params.actorName}. Reason: ${params.rejectionReason}. Status updated to REVISION REQUIRED.`,
      actorUserId: params.actorUserId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      isoClause: '7.5.2',
    });

    return wf;
  }

  /**
   * Publish Document (Transition: APPROVED -> PUBLISHED)
   * Automatically supersedes former revision of the same document.
   */
  public static async publishDocument(
    documentCode: string,
    revisionNumber: string,
    actorName = 'Executive Project Director',
    actorRole = 'Project Executive'
  ): Promise<void> {
    const revisions = await this.getRevisionsForDocument(documentCode);
    const targetRev = revisions.find((r) => r.revisionNumber === revisionNumber);
    if (!targetRev) throw new Error(`Revision ${revisionNumber} not found for ${documentCode}`);

    targetRev.status = 'PUBLISHED';
    targetRev.isLocked = true;
    await dbService.put('document_revisions', targetRev);

    // Mark all older revisions as SUPERSEDED
    const olderRevisions = revisions.filter((r) => r.revisionNumber !== revisionNumber && r.status !== 'ARCHIVED');
    for (const oldRev of olderRevisions) {
      oldRev.status = 'SUPERSEDED';
      oldRev.supersededAt = new Date().toISOString();
      await dbService.put('document_revisions', oldRev);
    }

    // Record in Global Audit Log
    await AuditLogService.logAction({
      action: 'Publish',
      entityType: 'DOCUMENT',
      entityId: targetRev.id,
      entityTitle: `${documentCode} (${revisionNumber})`,
      details: `Document formally published to active register. ${olderRevisions.length} previous revision(s) marked as SUPERSEDED.`,
      actorName,
      actorRole,
      isoClause: '7.5.3',
    });
  }

  /**
   * Archive Document (Transition: -> ARCHIVED)
   */
  public static async archiveDocument(
    documentCode: string,
    actorName = 'Lead HSE Engineer',
    actorRole = 'Document Controller'
  ): Promise<void> {
    const revisions = await this.getRevisionsForDocument(documentCode);
    for (const rev of revisions) {
      rev.status = 'ARCHIVED';
      await dbService.put('document_revisions', rev);
    }

    await AuditLogService.logAction({
      action: 'Archive',
      entityType: 'DOCUMENT',
      entityId: documentCode,
      entityTitle: documentCode,
      details: `Moved all revisions of document ${documentCode} to historical WORM archive.`,
      actorName,
      actorRole,
      isoClause: '7.5.3',
    });
  }

  /**
   * Document Comparison (Diff Engine):
   * Compare two revisions side-by-side with structured field & metadata delta analysis.
   */
  public static async compareRevisions(
    documentCode: string,
    revANumber: string,
    revBNumber: string
  ): Promise<DocumentComparisonResult> {
    const revisions = await this.getRevisionsForDocument(documentCode);
    const revA = revisions.find((r) => r.revisionNumber === revANumber);
    const revB = revisions.find((r) => r.revisionNumber === revBNumber);

    if (!revA || !revB) {
      throw new Error(`Revisions ${revANumber} or ${revBNumber} could not be found for document ${documentCode}`);
    }

    let objA: Record<string, any> = {};
    let objB: Record<string, any> = {};

    try {
      objA = JSON.parse(revA.contentSnapshotJson || '{}');
    } catch {
      objA = {};
    }

    try {
      objB = JSON.parse(revB.contentSnapshotJson || '{}');
    } catch {
      objB = {};
    }

    const metadataDiffs: FieldDiffItem[] = [
      {
        fieldKey: 'status',
        label: 'Lifecycle Status',
        oldValue: revA.status,
        newValue: revB.status,
        changeType: revA.status === revB.status ? 'UNCHANGED' : 'MODIFIED',
      },
      {
        fieldKey: 'authorName',
        label: 'Author / Originator',
        oldValue: revA.authorName,
        newValue: revB.authorName,
        changeType: revA.authorName === revB.authorName ? 'UNCHANGED' : 'MODIFIED',
      },
      {
        fieldKey: 'effectiveDate',
        label: 'Effective Date',
        oldValue: revA.effectiveDate,
        newValue: revB.effectiveDate,
        changeType: revA.effectiveDate === revB.effectiveDate ? 'UNCHANGED' : 'MODIFIED',
      },
      {
        fieldKey: 'nextReviewDate',
        label: 'Next Review Due Date',
        oldValue: revA.nextReviewDate,
        newValue: revB.nextReviewDate,
        changeType: revA.nextReviewDate === revB.nextReviewDate ? 'UNCHANGED' : 'MODIFIED',
      },
      {
        fieldKey: 'changeSummary',
        label: 'Revision Change Summary',
        oldValue: revA.changeSummary,
        newValue: revB.changeSummary,
        changeType: revA.changeSummary === revB.changeSummary ? 'UNCHANGED' : 'MODIFIED',
      },
    ];

    const contentDiffs: FieldDiffItem[] = [];
    const allKeys = Array.from(new Set([...Object.keys(objA), ...Object.keys(objB)]));

    for (const key of allKeys) {
      const valA = objA[key];
      const valB = objB[key];

      const stringA = typeof valA === 'object' ? JSON.stringify(valA) : String(valA ?? '');
      const stringB = typeof valB === 'object' ? JSON.stringify(valB) : String(valB ?? '');

      let changeType: FieldDiffItem['changeType'] = 'UNCHANGED';
      if (valA === undefined && valB !== undefined) {
        changeType = 'ADDED';
      } else if (valA !== undefined && valB === undefined) {
        changeType = 'REMOVED';
      } else if (stringA !== stringB) {
        changeType = 'MODIFIED';
      }

      contentDiffs.push({
        fieldKey: key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase()),
        oldValue: valA ?? '(None)',
        newValue: valB ?? '(None)',
        changeType,
      });
    }

    const addedCount = contentDiffs.filter((d) => d.changeType === 'ADDED').length;
    const modifiedCount = contentDiffs.filter((d) => d.changeType === 'MODIFIED').length;
    const removedCount = contentDiffs.filter((d) => d.changeType === 'REMOVED').length;
    const hasChanges = addedCount > 0 || modifiedCount > 0 || removedCount > 0;

    return {
      docCode: documentCode,
      revA: revANumber,
      revB: revBNumber,
      metadataDiffs,
      contentDiffs,
      hasChanges,
      addedCount,
      modifiedCount,
      removedCount,
    };
  }

  /**
   * Threaded Comments Subsystem
   */
  public static async addComment(
    documentCode: string,
    revisionNumber: string | undefined,
    userName: string,
    userRole: string,
    commentText: string,
    category: DocumentCommentItem['category'] = 'GENERAL'
  ): Promise<DocumentCommentItem> {
    const comment: DocumentCommentItem = {
      id: `cmt-${Date.now()}`,
      documentId: `doc-${documentCode.toLowerCase()}`,
      documentCode,
      revisionNumber,
      userId: 'USR-CURRENT',
      userName,
      userRole,
      commentText,
      category,
      createdAt: new Date().toISOString(),
    };

    await dbService.put('document_comments', comment);
    return comment;
  }

  public static async getComments(documentCode: string): Promise<DocumentCommentItem[]> {
    await this.initSeedIfEmpty();
    const all = await dbService.getAll<DocumentCommentItem>('document_comments');
    const filtered = all.filter((c) => c.documentCode === documentCode);
    filtered.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return filtered;
  }
}
