/**
 * Phase 9: Document Control, Approval Workflow & Global Audit Trail Types
 * Strict compliance with ISO 45001:2018 Clause 7.5 (Documented Information),
 * Clause 7.5.2 (Creating and Updating), and Clause 7.5.3 (Control of Documented Information).
 */

export type DocumentLifecycleStatus =
  | 'DRAFT'
  | 'SUBMITTED_FOR_REVIEW'
  | 'UNDER_REVIEW'
  | 'REVISION_REQUIRED'
  | 'APPROVED'
  | 'PUBLISHED'
  | 'SUPERSEDED'
  | 'ARCHIVED';

export const LIFECYCLE_STATUS_LABELS: Record<DocumentLifecycleStatus, { en: string; ar: string; color: string; badgeBg: string }> = {
  DRAFT: {
    en: 'Draft',
    ar: 'مسودة قيد الإعداد',
    color: '#475569',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
  },
  SUBMITTED_FOR_REVIEW: {
    en: 'Submitted for Review',
    ar: 'مقدم للمراجعة الفنية',
    color: '#0284c7',
    badgeBg: 'bg-sky-100 text-sky-800 border-sky-300',
  },
  UNDER_REVIEW: {
    en: 'Under Review',
    ar: 'قيد التدقيق والاعتماد',
    color: '#d97706',
    badgeBg: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  REVISION_REQUIRED: {
    en: 'Revision Required',
    ar: 'مطلوب تعديلات وإعادة تقديم',
    color: '#dc2626',
    badgeBg: 'bg-red-100 text-red-800 border-red-300',
  },
  APPROVED: {
    en: 'Approved',
    ar: 'معتمد رسمياً',
    color: '#059669',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  },
  PUBLISHED: {
    en: 'Published & Active',
    ar: 'منشور وساري المفعول',
    color: '#006c4a',
    badgeBg: 'bg-[#dcfce7] text-[#006c4a] border-emerald-400 font-bold',
  },
  SUPERSEDED: {
    en: 'Superseded (Historic)',
    ar: 'ملغي وحلت محله مراجعة أحدث',
    color: '#64748b',
    badgeBg: 'bg-gray-100 text-gray-700 border-gray-300',
  },
  ARCHIVED: {
    en: 'Archived',
    ar: 'مؤرشف بسجل الحفظ الدائم',
    color: '#4b5563',
    badgeBg: 'bg-zinc-200 text-zinc-800 border-zinc-400',
  },
};

export type ApprovalDecision = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVISION_REQUIRED';

export interface ApprovalChainStepConfig {
  stepNumber: number;
  roleName: string; // e.g. 'Prepared By', 'HSE Manager', 'Project Manager', 'Client'
  roleNameAr?: string;
  allowedRoleTypes: string[];
  isMandatory: boolean;
  canReject: boolean;
  description?: string;
}

export const DEFAULT_APPROVAL_CHAIN: ApprovalChainStepConfig[] = [
  {
    stepNumber: 1,
    roleName: 'Prepared By',
    roleNameAr: 'إعداد بواسطة',
    allowedRoleTypes: ['SAFETY_ENGINEER', 'INSPECTOR', 'HSE_DIRECTOR'],
    isMandatory: true,
    canReject: false,
    description: 'Document author verifies technical content and completeness.',
  },
  {
    stepNumber: 2,
    roleName: 'HSE Manager',
    roleNameAr: 'مدير السلامة والصحة المهنية',
    allowedRoleTypes: ['HSE_DIRECTOR', 'LEAD_AUDITOR'],
    isMandatory: true,
    canReject: true,
    description: 'HSE leadership verifies regulatory & ISO 45001 alignment.',
  },
  {
    stepNumber: 3,
    roleName: 'Project Manager',
    roleNameAr: 'مدير المشروع',
    allowedRoleTypes: ['PROJECT_MANAGER', 'HSE_DIRECTOR'],
    isMandatory: true,
    canReject: true,
    description: 'Operational leadership endorses site feasibility and resources.',
  },
  {
    stepNumber: 4,
    roleName: 'Client Representative',
    roleNameAr: 'ممثل المالك / العميل',
    allowedRoleTypes: ['CONTRACTOR_REP', 'HSE_DIRECTOR'],
    isMandatory: true,
    canReject: true,
    description: 'Final external client authority approval and sign-off.',
  },
];

export interface ApprovalStepExecution {
  id: string;
  stepNumber: number;
  roleName: string;
  roleNameAr?: string;
  assignedUserId?: string;
  assignedUserName?: string;
  decidedByUserId?: string;
  decidedByUserName?: string;
  decidedByUserRole?: string;
  date?: string; // YYYY-MM-DD
  time?: string; // HH:mm:ss
  decision: ApprovalDecision;
  comments?: string;
  rejectionReason?: string; // Mandatory when decision is REJECTED or REVISION_REQUIRED
  signatureHash?: string;
}

export interface DocumentApprovalWorkflow {
  id: string;
  documentId: string;
  documentCode: string;
  revisionNumber: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'APPROVED' | 'REJECTED';
  currentStepIndex: number;
  steps: ApprovalStepExecution[];
  createdAt: string;
  updatedAt: string;
}

export interface ControlledDocumentRevision {
  id: string; // e.g. rev-HSE-PLN-001-REV01
  documentId: string;
  documentCode: string;
  revisionNumber: string; // e.g. 'Rev 00', 'Rev 01', 'Rev 02'
  status: DocumentLifecycleStatus;
  changeSummary: string;
  changeSummaryAr?: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  contentSnapshotJson: string; // Stringified content structure & fields
  sha256Checksum: string;
  effectiveDate: string;
  nextReviewDate: string;
  createdAt: string;
  approvedAt?: string;
  approvedBy?: string;
  supersededAt?: string;
  isLocked: boolean; // Immutable WORM lock when APPROVED or PUBLISHED
}

export interface DocumentCommentItem {
  id: string;
  documentId: string;
  documentCode: string;
  revisionNumber?: string;
  userId: string;
  userName: string;
  userRole: string;
  commentText: string;
  category: 'GENERAL' | 'REVIEW' | 'REVISION_NOTE' | 'TECHNICAL';
  createdAt: string;
}

export type GlobalAuditActionType =
  | 'Create'
  | 'Edit'
  | 'Delete'
  | 'Approve'
  | 'Reject'
  | 'Publish'
  | 'Archive'
  | 'Download'
  | 'Print'
  | 'Login'
  | 'Permission changes';

export interface GlobalAuditLogRecord {
  id: string;
  blockIndex: number;
  timestamp: string; // ISO string
  actorUserId: string;
  actorName: string;
  actorRole: string;
  action: GlobalAuditActionType;
  entityType: 'DOCUMENT' | 'REVISION' | 'APPROVAL' | 'RISK' | 'PTW' | 'INCIDENT' | 'INSPECTION' | 'AUDIT' | 'USER' | 'PERMISSION' | 'AUTH';
  entityId: string;
  entityTitle: string;
  isoClause?: string;
  details: string;
  prevHash: string;
  dataHash: string;
  blockHash: string;
  metadata?: Record<string, unknown>;
}

export interface FieldDiffItem {
  fieldKey: string;
  label: string;
  oldValue: any;
  newValue: any;
  changeType: 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
}

export interface DocumentComparisonResult {
  docCode: string;
  revA: string;
  revB: string;
  metadataDiffs: FieldDiffItem[];
  contentDiffs: FieldDiffItem[];
  hasChanges: boolean;
  addedCount: number;
  modifiedCount: number;
  removedCount: number;
}
