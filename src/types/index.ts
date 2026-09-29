export type Language = 'en' | 'ar';

export type OperatingUnit = 'Ras Laffan EPC-4' | 'Mesaieed Refinery Unit 3' | 'Al-Khor Pipe Rack Route 9';

export * from './risk';

export type NavigationPath =
  | 'command-dashboard'
  | 'controlled-document-library'
  | 'dynamic-form-builder'
  | 'formal-hse-plan-generator'
  | 'bilingual-document-viewer'
  | 'risk-assessments-alarp'
  | 'incident-investigations'
  | 'permit-to-work'
  | 'inspections-checklists'
  | 'training-competency-matrix'
  | 'hse-audits-non-conformances'
  | 'organization-roles'
  | 'system-audit-trail';

export interface RiskAssessment {
  id: string;
  rev?: string;
  activity: string;
  task?: string;
  hazard?: string;
  hazardId?: string;
  hazardDescription?: string;
  potentialConsequence?: string;
  existingControls?: string;
  discipline?: 'HEAVY_LIFTING' | 'CIVIL' | 'PIPING' | 'RADIOGRAPHY' | 'ELECTRICAL' | 'SCAFFOLDING' | string;
  disciplineLabel?: string;
  zone?: string;
  initialLikelihood: number;
  initialSeverity: number;
  initialScore: number;
  initialRiskScore?: number;
  initialTier: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';
  initialRiskTier?: 'EXTREME' | 'HIGH' | 'MEDIUM' | 'LOW';
  baselineControls?: string[];
  controlsApplied?: { tierNumber: number; tierName: string; label: string; badgeColor: string }[];
  additionalControls?: string;
  additionalMitigation?: string;
  alarpJustification: string;
  responsiblePerson?: string;
  targetDate?: string;
  residualLikelihood: number;
  residualSeverity: number;
  residualScore: number;
  residualRiskScore?: number;
  residualTier: 'Acceptable' | 'Tolerable' | 'Unacceptable' | 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  residualRiskTier?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
  deltaReduction?: number;
  reviewer?: string;
  reviewerName?: string;
  reviewerRole?: string;
  status: 'CONTROLLED' | 'IN_REVIEW' | 'OPEN' | 'DRAFT' | 'ACTION_REQUIRED' | 'ARCHIVED';
  signoffDate?: string;
  appliedHierarchy: {
    elimination: boolean;
    substitution: boolean;
    engineering: boolean;
    administrative: boolean;
    ppe: boolean;
  };
  hierarchyOfControls?: {
    elimination: boolean;
    substitution: boolean;
    engineering: boolean;
    administrative: boolean;
    ppe: boolean;
  };
  linkedProjectId?: string;
  linkedProjectName?: string;
  linkedDocumentId?: string;
  linkedDocumentCode?: string;
  linkedSopId?: string;
  linkedSopCode?: string;
  linkedPermitId?: string;
  linkedPermitNumber?: string;
  linkedIncidentId?: string;
  linkedIncidentRef?: string;
  linkedAuditId?: string;
  linkedAuditRef?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}


export interface ControlledDocument {
  code: string;
  clause: string;
  title: string;
  titleAr?: string;
  categoryNumber: number;
  categoryName: string;
  isBilingual: boolean;
  currentRevision: string;
  totalRevisionsCount: number;
  custodian: string;
  custodianDept: string;
  signoffStatus: 'APPROVED' | 'ACTIVE_SIGNATURES' | 'PENDING_CLIENT' | 'BOARD_SIGNED' | 'DRAFT';
  signoffStatusLabel: string;
  signoffDetail: string;
  effectiveDate: string;
  nextReviewDate: string;
  isExpiringSoon?: boolean;
  securityClassification: string;
  mandatoryFrequencyDays: number;
  revisions: {
    revId: string;
    label: string;
    date: string;
    description: string;
    signer?: string;
    isCurrent?: boolean;
  }[];
  referencedComplianceArtifacts: {
    code: string;
    title: string;
    typeBadge: string;
    icon: string;
  }[];
}

export interface PermitToWork {
  id: string;
  type: string;
  typeIcon: string;
  location: string;
  locationDetail: string;
  holder: string;
  holderOrg: string;
  gasStatus: 'PASS' | 'RE-TEST' | 'PENDING';
  gasReadings: string;
  gasTime?: string;
  validityTime: string;
  timeLeft: string;
  authChain: string;
  status: 'ACTIVE' | 'EXPIRED' | 'SUSPENDED';
}

export interface FormTemplate {
  templateId: string;
  title: string;
  revision: string;
  clauseAlignment: string;
  lastCommitted: string;
  sectionsCount: number;
  interactiveFieldsCount: number;
  capaRulesCount: number;
  uid: string;
}

export interface AuditBlock {
  blockId: string;
  timestamp: string;
  action: string;
  actor: string;
  isoClause: string;
  hash: string;
}

export interface HseAlert {
  id: string;
  title: string;
  description: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  timestamp: string;
  read: boolean;
}
