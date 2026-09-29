/**
 * Safety Operations Data Types — Phase 6: Incidents, CAPA, Inspections & Audits
 * Compliant with ISO 45001:2018 (Clause 9.2 Audits, Clause 9.1.2 Evaluation, Clause 10.2 Incidents & CAPA)
 * OSHA 1926/1910 and Enterprise Safety Standards.
 */

// ==========================================
// A. INCIDENT MANAGEMENT TYPES
// ==========================================

export type IncidentType =
  | 'NEAR_MISS'
  | 'FIRST_AID'
  | 'MEDICAL_TREATMENT'
  | 'LOST_TIME_INJURY'
  | 'RESTRICTED_WORK'
  | 'ENVIRONMENTAL_SPILL'
  | 'PROPERTY_DAMAGE'
  | 'HIGH_POTENTIAL';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_INVESTIGATION'
  | 'CAPA_PENDING'
  | 'CLOSED';

export interface IncidentWitness {
  id: string;
  name: string;
  role: string;
  contractorOrDept: string;
  contactNumber?: string;
  statement: string;
  interviewDate: string;
  interviewedBy: string;
}

export interface IncidentEvidenceItem {
  id: string;
  title: string;
  type: 'PHOTO' | 'DOCUMENT' | 'AUDIO_STATEMENT' | 'SKETCH' | 'PHYSICAL_ITEM';
  urlOrBase64: string;
  description: string;
  uploadedAt: string;
  capturedBy: string;
}

export interface FiveWhyItem {
  level: number; // 1 to 5
  question: string;
  answer: string;
  isSystemicRootCause?: boolean;
}

export interface ContributingFactors {
  humanFactors: string[];
  equipmentFactors: string[];
  environmentalFactors: string[];
  proceduralFactors: string[];
  organizationalFactors: string[];
}

export interface IncidentReportRecord {
  id: string; // e.g. INC-2026-001
  incidentNumber: string; // e.g. INC-2026-001
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  project: string;
  department: string;
  person: string; // Person involved / injured / reported
  contractor: string;
  activity: string;
  incidentType: IncidentType;
  description: string;
  immediateActions: string;
  
  // Investigation & Root Cause
  rootCause: string;
  fiveWhyAnalysis: FiveWhyItem[];
  contributingFactors: ContributingFactors;
  witnesses: IncidentWitness[];
  evidence: IncidentEvidenceItem[];
  photos: IncidentEvidenceItem[];
  
  // Actions & Management
  correctiveActions: string;
  preventiveActions: string;
  responsiblePerson: string;
  dueDate: string;
  status: IncidentStatus;
  
  // Closure Details
  closure?: {
    closedDate: string;
    closedBy: string;
    closureComments: string;
    verificationSignature?: string;
  };
  
  // Links to spawned CAPAs
  spawnedCapaIds?: string[];
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// B. CORRECTIVE ACTION / CAPA TYPES
// ==========================================

export type CapaSource =
  | 'INCIDENT'
  | 'AUDIT'
  | 'INSPECTION'
  | 'HAZARD'
  | 'SAFETY_OBSERVATION';

export type CapaRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type CapaStatus =
  | 'OPEN'
  | 'IN PROGRESS'
  | 'OVERDUE'
  | 'PENDING VERIFICATION'
  | 'CLOSED';

export interface CapaRecord {
  id: string; // e.g. CAPA-2026-001
  finding: string;
  source: CapaSource;
  sourceReferenceId?: string; // e.g. INC-2026-042 or AUD-2026-001
  sourceTitle?: string;
  riskLevel: CapaRiskLevel;
  actionRequired: string;
  responsiblePerson: string;
  department: string;
  targetDate: string; // YYYY-MM-DD
  evidence: IncidentEvidenceItem[];
  status: CapaStatus;
  verification?: {
    verifiedBy: string;
    verificationDate: string;
    notes: string;
    isEffective: boolean;
  };
  closureDate?: string;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// C. INSPECTIONS & CHECKLIST BUILDER TYPES
// ==========================================

export type InspectionDiscipline =
  | 'PPE'
  | 'Scaffold'
  | 'Crane'
  | 'Lifting Equipment'
  | 'Fire Equipment'
  | 'Vehicle'
  | 'Excavation'
  | 'Housekeeping'
  | 'Electrical'
  | 'Working at Height'
  | 'Confined Space'
  | 'Emergency Equipment'
  | 'General Site';

export type ItemEvaluationResult = 'PASS' | 'FAIL' | 'N/A';

export interface InspectionChecklistItem {
  id: string;
  code: string;
  requirement: string;
  requirementAr?: string;
  standardReference?: string;
  criticalItem?: boolean;
}

export interface InspectionChecklistTemplate {
  id: string;
  title: string;
  discipline: InspectionDiscipline;
  version: string;
  description: string;
  items: InspectionChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface InspectionItemExecution {
  itemId: string;
  requirement: string;
  status: ItemEvaluationResult;
  comment: string;
  photo?: string;
  correctiveAction?: string;
  capaIdCreated?: string;
}

export interface InspectionRecordExecution {
  id: string; // e.g. INS-2026-101
  templateId: string;
  templateTitle: string;
  discipline: InspectionDiscipline;
  date: string;
  inspectorName: string;
  project: string;
  location: string;
  contractor: string;
  items: InspectionItemExecution[];
  overallResult: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL';
  complianceScorePercent: number; // 0 - 100
  notes?: string;
  createdAt: string;
}

// ==========================================
// D. AUDITS & FINDINGS TYPES
// ==========================================

export type AuditFindingType = 'NONCONFORMITY' | 'OBSERVATION';
export type AuditFindingSeverity = 'MAJOR_NC' | 'MINOR_NC' | 'OBSERVATION';
export type AuditStatus = 'PLANNED' | 'IN_PROGRESS' | 'REPORT_ISSUED' | 'CLOSED';

export interface AuditChecklistItem {
  id: string;
  clause: string; // e.g. "ISO 45001 §6.1.2"
  requirement: string;
  criteria: string;
  result?: 'CONFORMANT' | 'NONCONFORMANT' | 'OBSERVATION' | 'NOT_APPLICABLE';
  notes?: string;
}

export interface AuditFindingRecord {
  id: string; // e.g. FND-2026-01
  auditId: string;
  type: AuditFindingType;
  severity: AuditFindingSeverity;
  clause: string;
  findingDescription: string;
  evidence: string;
  evidenceAttachments?: IncidentEvidenceItem[];
  correctiveActionRequired: string;
  responsiblePerson: string;
  targetDate: string;
  capaIdCreated?: string;
  status: 'OPEN' | 'CAPA_DISPATCHED' | 'VERIFIED_CLOSED';
  createdAt: string;
}

export interface AuditRecordModel {
  id: string; // e.g. AUD-2026-001
  auditNumber: string;
  auditPlan: string;
  auditScope: string;
  auditCriteria: string; // e.g. ISO 45001:2018, OSHA 1926, Site Safety Governance
  auditor: string; // Lead Auditor
  auditTeam?: string[];
  auditee: string; // Auditee Name / Role / Contractor
  department: string;
  project: string;
  plannedDate: string;
  actualDate?: string;
  status: AuditStatus;
  checklist: AuditChecklistItem[];
  findings: AuditFindingRecord[];
  summaryConclusion?: string;
  conformanceRating?: 'FULL_CONFORMANCE' | 'SATISFACTORY_WITH_OBSERVATIONS' | 'ACTION_REQUIRED' | 'CRITICAL_DEFICIENCIES';
  finalReportGenerated?: boolean;
  finalReportApprovedBy?: string;
  createdAt: string;
  updatedAt: string;
}
