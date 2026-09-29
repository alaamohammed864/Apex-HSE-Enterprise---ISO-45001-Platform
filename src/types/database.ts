/**
 * Comprehensive Enterprise Database Models & Interfaces for HSE Management System
 * Conforms to ISO 45001:2018, OSHA, and enterprise relational database standards.
 */

// ==========================================
// 1. ORGANIZATIONAL HIERARCHY & ENTITIES
// ==========================================

export interface Organization {
  id: string; // UUID Primary Key
  name: string;
  nameAr?: string;
  code: string; // e.g. CCC-QATAR
  registrationNumber?: string;
  industry: string;
  country: string;
  logoUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string; // UUID Primary Key
  organizationId: string; // FK -> Organization.id
  code: string; // e.g. QAT-LNG-EPC4
  name: string;
  nameAr?: string;
  clientName: string;
  projectDirectorId?: string; // FK -> User.id
  startDate: string;
  targetCompletionDate?: string;
  status: 'MOBILIZATION' | 'ACTIVE' | 'COMMISSIONING' | 'HANDOVER' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface Site {
  id: string; // UUID Primary Key
  projectId: string; // FK -> Project.id
  code: string; // e.g. SITE-RL-01
  name: string;
  nameAr?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  siteManagerId?: string; // FK -> Employee.id
  status: 'OPERATIONAL' | 'SHUTDOWN' | 'DEMOBILIZED';
  createdAt: string;
  updatedAt: string;
}

export interface Department {
  id: string; // UUID Primary Key
  organizationId: string; // FK -> Organization.id
  code: string; // e.g. HSE-DEPT, QAQC-DEPT, MECH-DEPT
  name: string;
  nameAr?: string;
  headOfDepartmentId?: string; // FK -> Employee.id
  createdAt: string;
  updatedAt: string;
}

export interface Employee {
  id: string; // UUID Primary Key
  employeeNumber: string; // e.g. EMP-9921
  firstName: string;
  lastName: string;
  fullNameAr?: string;
  email: string;
  phone?: string;
  departmentId: string; // FK -> Department.id
  projectId?: string; // FK -> Project.id
  siteId?: string; // FK -> Site.id
  jobTitle: string;
  jobTitleAr?: string;
  hireDate: string;
  isSafetyCriticalRole: boolean;
  status: 'ACTIVE' | 'ON_LEAVE' | 'RESIGNED' | 'TERMINATED';
  createdAt: string;
  updatedAt: string;
}

export interface Contractor {
  id: string; // UUID Primary Key
  name: string;
  nameAr?: string;
  vendorCode: string;
  tradeType: 'SCAFFOLDING' | 'RIGGING' | 'CIVIL' | 'ELECTRICAL' | 'PAINTING_BLASTING' | 'LOGISTICS';
  projectId: string; // FK -> Project.id
  hsePrequalificationScore: number; // e.g. 94%
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
  status: 'APPROVED' | 'PROBATION' | 'SUSPENDED';
  validUntil: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 2. USERS, ROLES & PERMISSIONS (RBAC)
// ==========================================

export type SystemRoleType =
  | 'HSE_DIRECTOR'
  | 'LEAD_AUDITOR'
  | 'SAFETY_ENGINEER'
  | 'SITE_SUPERVISOR'
  | 'INSPECTOR'
  | 'PROJECT_MANAGER'
  | 'CONTRACTOR_REP';

export interface UserEntity {
  id: string; // UUID Primary Key
  email: string;
  employeeId?: string; // FK -> Employee.id
  name: string;
  nameAr?: string;
  roleId: string; // FK -> Role.id
  roleType: SystemRoleType;
  primaryOperatingUnit: string;
  badgeNumber: string;
  lastLoginAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string; // UUID Primary Key
  code: string; // e.g. HSE_DIRECTOR
  name: string;
  nameAr: string;
  description: string;
  isSystemDefault: boolean;
  createdAt: string;
}

export interface Permission {
  id: string; // UUID Primary Key
  code: string; // e.g. documents.approve, risks.signoff, ptw.issue
  module: 'DOCUMENTS' | 'RISKS' | 'INCIDENTS' | 'INSPECTIONS' | 'TRAINING' | 'KPIS' | 'PERMITS' | 'AUDITS' | 'SETTINGS';
  description: string;
}

// ==========================================
// 3. CONTROLLED DOCUMENTS & TEMPLATES
// ==========================================

export interface DocumentTemplate {
  id: string; // UUID Primary Key
  code: string; // e.g. TMPL-SOP-01
  title: string;
  titleAr?: string;
  category: 'PLANS' | 'PROCEDURES' | 'FORMS' | 'RECORDS' | 'POLICIES' | 'PLAN' | 'PROCEDURE' | 'CHECKLIST' | 'FORM' | 'POLICY';
  isoClause: string; // e.g. 7.5, 8.1.2
  schemaJson?: string; // serialized JSON Schema
  description?: string;
  descriptionAr?: string;
  version: string;
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  isActive: boolean;
  createdBy: string; // FK -> User.id
  updatedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentSection {
  id: string; // UUID Primary Key
  templateId: string; // FK -> DocumentTemplate.id
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  sequenceOrder: number;
  isMandatory: boolean;
}

export interface DocumentField {
  id: string; // UUID Primary Key
  sectionId: string; // FK -> DocumentSection.id
  fieldKey: string;
  label: string;
  labelAr?: string;
  description?: string;
  descriptionAr?: string;
  fieldType:
    | 'TEXT'
    | 'TEXTAREA'
    | 'LONG_TEXT'
    | 'RICH_TEXT'
    | 'NUMBER'
    | 'DATE'
    | 'TIME'
    | 'DROPDOWN'
    | 'MULTI_SELECT'
    | 'CHECKBOX'
    | 'RADIO'
    | 'YES_NO'
    | 'TABLE'
    | 'IMAGE'
    | 'ATTACHMENT'
    | 'SIGNATURE'
    | 'EMPLOYEE'
    | 'PROJECT'
    | 'CONTRACTOR'
    | 'EQUIPMENT'
    | 'RISK'
    | 'KPI'
    | 'INCIDENT'
    | 'TRAINING'
    | 'SELECT'
    | 'GAS_TEST_MATRIX'
    | 'GPS_COORDINATES';
  optionsJson?: string;
  isRequired: boolean;
  defaultValue?: any;
  validationRule?: string;
  validationJson?: string;
  sequenceOrder: number;
  visibility?: 'VISIBLE' | 'HIDDEN' | 'CONDITIONAL';
  permissions?: string;
}

export interface DocumentInstance {
  id: string; // UUID Primary Key
  code: string; // e.g. HSE-PLN-001
  templateId?: string; // FK -> DocumentTemplate.id
  projectId: string; // FK -> Project.id
  title: string;
  titleAr: string;
  category: 'PLANS' | 'PROCEDURES' | 'FORMS' | 'RECORDS' | 'POLICIES';
  isoClause: string;
  currentRevisionId: string; // FK -> DocumentRevision.id
  currentRevisionNumber: string; // e.g. Rev 4.2
  status: 'DRAFT' | 'UNDER_REVIEW' | 'PENDING_APPROVAL' | 'APPROVED' | 'PUBLISHED' | 'ARCHIVED';
  retentionYears: number;
  isWormLocked: boolean;
  createdBy: string; // FK -> User.id
  updatedBy: string; // FK -> User.id
  createdAt: string;
  updatedAt: string;
}

export interface DocumentRevision {
  id: string; // UUID Primary Key
  documentId: string; // FK -> DocumentInstance.id
  revisionNumber: string; // e.g. Rev 4.2
  changeSummary: string;
  changeSummaryAr?: string;
  contentDataJson: string;
  sha256Checksum: string;
  status: 'DRAFT' | 'REVIEWED' | 'APPROVED' | 'SUPERSEDED';
  authorId: string; // FK -> User.id
  effectiveDate: string;
  nextReviewDate: string;
  createdAt: string;
}

export interface DocumentApproval {
  id: string; // UUID Primary Key
  revisionId: string; // FK -> DocumentRevision.id
  stepNumber: number;
  stageName: 'TECHNICAL_REVIEW' | 'HSE_DIRECTOR_APPROVAL' | 'CLIENT_SIGN_OFF';
  approverId: string; // FK -> User.id
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  decisionDate?: string;
  comments?: string;
  digitalSignatureHash?: string;
}

export interface DocumentAttachment {
  id: string;
  documentId: string; // FK -> DocumentInstance.id
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  fileUrl: string;
  uploadedBy: string; // FK -> User.id
  uploadedAt: string;
}

export interface DocumentComment {
  id: string;
  documentId: string; // FK -> DocumentInstance.id
  revisionId?: string;
  userId: string; // FK -> User.id
  commentText: string;
  createdAt: string;
}

// ==========================================
// 4. RISKS & ALARP OPERATIONAL SAFETY
// ==========================================

export interface Hazard {
  id: string; // UUID Primary Key
  code: string; // e.g. HAZ-FALL-01
  category: 'PHYSICAL' | 'CHEMICAL' | 'BIOLOGICAL' | 'ERGONOMIC' | 'PSYCHOSOCIAL' | 'ELECTRICAL' | 'MECHANICAL';
  title: string;
  titleAr?: string;
  description: string;
  standardReference?: string;
}

export interface ControlMeasure {
  id: string; // UUID Primary Key
  code: string; // e.g. CTRL-ENG-44
  hierarchyLevel: 'ELIMINATION' | 'SUBSTITUTION' | 'ENGINEERING' | 'ADMINISTRATIVE' | 'PPE';
  title: string;
  titleAr?: string;
  description: string;
  verificationMethod: string;
}

export interface RiskAssessmentEntity {
  id: string; // Primary Key e.g. RA-2026-042
  projectId: string; // FK -> Project.id
  siteId?: string; // FK -> Site.id
  activity: string;
  activityAr?: string;
  hazardId?: string; // FK -> Hazard.id
  hazardDescription: string;
  discipline: 'HEAVY_LIFTING' | 'CIVIL' | 'PIPING' | 'RADIOGRAPHY' | 'ELECTRICAL' | 'SCAFFOLDING';
  zone: string;
  initialLikelihood: number; // 1-5
  initialSeverity: number; // 1-5
  initialScore: number; // 1-25
  initialTier: 'EXTREME' | 'HIGH' | 'LOW';
  baselineControlsJson: string[];
  appliedControlsJson: { tierNumber: number; tierName: string; label: string; badgeColor: string }[];
  additionalMitigation: string;
  alarpJustification: string;
  residualLikelihood: number; // 1-5
  residualSeverity: number; // 1-5
  residualScore: number; // 1-25
  residualTier: 'Acceptable' | 'Tolerable' | 'Unacceptable';
  deltaReduction: number;
  reviewerId?: string; // FK -> User.id
  reviewerName: string;
  reviewerRole: string;
  status: 'CONTROLLED' | 'IN_REVIEW' | 'OPEN';
  signoffDate?: string;
  isAlarpCompliant: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 5. INCIDENTS, INVESTIGATIONS & CAPA
// ==========================================

export interface IncidentRecord {
  id: string; // e.g. INC-2026-088
  projectId: string; // FK -> Project.id
  siteId: string; // FK -> Site.id
  referenceCode: string;
  incidentDateTime: string;
  reportedDateTime: string;
  classification: 'NEAR_MISS' | 'FIRST_AID' | 'MEDICAL_TREATMENT' | 'RESTRICTED_WORK' | 'LOST_TIME_INJURY' | 'FATALITY' | 'ENVIRONMENTAL_SPILL';
  title: string;
  description: string;
  exactLocation: string;
  reportedById: string; // FK -> User.id
  supervisorId: string; // FK -> Employee.id
  isReportableToRegulator: boolean;
  status: 'REPORTED' | 'UNDER_INVESTIGATION' | 'CAPA_PENDING' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

export interface IncidentInvestigation {
  id: string;
  incidentId: string; // FK -> IncidentRecord.id
  leadInvestigatorId: string; // FK -> User.id
  investigationMethodology: '5_WHY' | 'FISHBONE_ISHIKAWA' | 'TAPROOT' | 'FAULT_TREE';
  rootCauseSummary: string;
  fiveWhysJson: { step: number; whyQuestion: string; answeredReason: string }[];
  immediateCauses: string[];
  underlyingSystemCauses: string[];
  targetCompletionDate: string;
  completedAt?: string;
  signoffApprovedBy?: string;
}

export interface CorrectiveAction {
  id: string; // e.g. CAPA-2026-104
  incidentId?: string; // FK -> IncidentRecord.id
  auditFindingId?: string;
  actionTitle: string;
  description: string;
  assignedToId: string; // FK -> Employee.id
  dueDate: string;
  completionDate?: string;
  hierarchyType: 'ELIMINATION' | 'ENGINEERING' | 'ADMINISTRATIVE' | 'PPE';
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'VERIFIED_CLOSED';
  verifiedById?: string; // FK -> User.id
  verificationComments?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 6. INSPECTIONS & CHECKLISTS
// ==========================================

export interface InspectionTemplate {
  id: string;
  code: string; // e.g. INSP-SCAFF-WEEKLY
  title: string;
  titleAr?: string;
  discipline: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'PRE_USE';
  checklistItemsJson: { id: string; itemText: string; criticalFail: boolean }[];
  isActive: boolean;
}

export interface InspectionRecord {
  id: string; // e.g. INS-2026-302
  templateId: string; // FK -> InspectionTemplate.id
  projectId: string; // FK -> Project.id
  siteId: string;
  inspectorId: string; // FK -> User.id
  inspectionDate: string;
  overallScorePercent: number; // e.g. 96%
  result: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL_STOP_WORK';
  findingsCount: number;
  scafftagIssued?: 'GREEN_PASS' | 'YELLOW_WARNING' | 'RED_DANGER';
  inspectorSignatureUrl?: string;
  createdAt: string;
}

// ==========================================
// 7. TRAINING, COMPETENCY & MATRIX
// ==========================================

export interface TrainingCourse {
  id: string;
  courseCode: string; // e.g. HSE-TC-CONFINED-01
  title: string;
  titleAr?: string;
  category: 'REGULATORY' | 'COMPANY_MANDATORY' | 'EQUIPMENT_SPECIFIC';
  validityMonths: number; // e.g. 24 months
  passingScorePercent: number;
  deliveryMethod: 'CLASSROOM' | 'PRACTICAL_FIELD' | 'E_LEARNING';
  createdAt: string;
}

export interface TrainingRecord {
  id: string;
  courseId: string; // FK -> TrainingCourse.id
  employeeId: string; // FK -> Employee.id
  completionDate: string;
  expirationDate: string;
  certificateNumber: string;
  scoreAchieved: number;
  trainerName: string;
  isVerified: boolean;
  createdAt: string;
}

export interface TrainingMatrixRequirement {
  id: string;
  jobTitle: string;
  courseId: string; // FK -> TrainingCourse.id
  isMandatoryBeforeSiteEntry: boolean;
}

// ==========================================
// 8. KPIS & SAFETY PERFORMANCE
// ==========================================

export interface KPIDefinition {
  id: string;
  code: string; // e.g. TRIFR, LTIR, MAN_HOURS, NEAR_MISS_RATE
  name: string;
  nameAr?: string;
  category: 'LAGGING' | 'LEADING';
  calculationFormula: string;
  targetThreshold: number;
  unit: string;
}

export interface KPIRecord {
  id: string;
  kpiCode: string;
  projectId: string; // FK -> Project.id
  reportingYear: number;
  reportingMonth: number;
  actualValue: number;
  targetValue: number;
  manHoursWorked: number;
  calculatedAt: string;
}

// ==========================================
// 9. PERMIT TO WORK (e-PTW)
// ==========================================

export interface PermitType {
  id: string;
  code: string; // HOT_WORK, CONFINED_SPACE, WORK_AT_HEIGHT, ELECTRICAL_ISOLATION
  name: string;
  nameAr?: string;
  colorBadge: string;
  requiresGasTesting: boolean;
  requiresRescueTeam: boolean;
}

export interface PermitRecord {
  id: string; // e.g. PTW-2026-1108
  permitTypeCode: string;
  projectId: string; // FK -> Project.id
  siteId: string;
  location: string;
  locationDetail: string;
  performingAuthority: string;
  holderOrg: string;
  issuingAuthorityId: string; // FK -> User.id
  validFrom: string;
  validUntil: string;
  gasStatus: 'PASS' | 'RE-TEST' | 'PENDING';
  gasReadingsSummary?: string;
  oxygenLevel?: number; // 19.5 - 23.5%
  lelLevel?: number; // < 10%
  h2sPpm?: number; // < 5 ppm
  scafftagStatus?: 'GREEN_PASS' | 'RED_DANGER' | 'YELLOW_INSPECTION';
  emergencyStopActive: boolean;
  status: 'ACTIVE' | 'PENDING_APPROVAL' | 'SUSPENDED' | 'EXPIRED' | 'CLOSED';
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// 10. AUDITS, FINDINGS & NON-CONFORMANCES
// ==========================================

export interface AuditTemplate {
  id: string;
  code: string; // e.g. AUD-ISO45001-INTERNAL
  standard: 'ISO 45001:2018' | 'OSHA 1926' | 'COMPANY_SAFETY_RULEBOOK';
  title: string;
  clauseChecklistJson: { clause: string; title: string; criteria: string }[];
}

export interface AuditRecord {
  id: string; // e.g. AUD-2026-004
  templateId: string;
  projectId: string;
  leadAuditorId: string; // FK -> User.id
  auditDate: string;
  scope: string;
  overallRating: 'CONFORMANT' | 'MINOR_NC' | 'MAJOR_NC';
  totalFindings: number;
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'REPORT_ISSUED' | 'CLOSED';
  createdAt: string;
}

export interface AuditFinding {
  id: string;
  auditId: string; // FK -> AuditRecord.id
  isoClause: string; // e.g. 8.1.2
  severity: 'OBSERVATION' | 'MINOR_NC' | 'MAJOR_NC';
  findingDescription: string;
  evidenceNotes: string;
  correctiveActionId?: string; // FK -> CorrectiveAction.id
  status: 'OPEN' | 'CORRECTIVE_ACTION_SUBMITTED' | 'CLOSED';
}

// ==========================================
// 11. EMERGENCY PLANS & CONTACTS
// ==========================================

export interface EmergencyPlan {
  id: string;
  projectId: string;
  title: string;
  titleAr?: string;
  scenario: 'FIRE_EXPLOSION' | 'TOXIC_GAS_RELEASE' | 'STRUCTURAL_COLLAPSE' | 'MEDICAL_MASS_CASUALTY' | 'SEVERE_WEATHER';
  assemblyPoint: string;
  primaryResponseTeam: string;
  documentRefCode: string;
  lastDrillDate?: string;
  nextDrillDueDate: string;
}

export interface EmergencyContact {
  id: string;
  projectId: string;
  roleName: 'INCIDENT_COMMANDER' | 'SITE_MEDIC' | 'LOCAL_CIVIL_DEFENSE' | 'POLICE' | 'ENVIRONMENTAL_HOTLINE';
  contactPerson: string;
  phonePrimary: string;
  phoneSecondary?: string;
  isAvailable24_7: boolean;
}

// ==========================================
// 12. HSE BUDGET
// ==========================================

export interface HSEBudgetItem {
  id: string;
  projectId: string;
  fiscalYear: number;
  category: 'PPE' | 'TRAINING' | 'GAS_DETECTION' | 'MEDICAL_CLINIC' | 'AUDITS_CERTIFICATIONS' | 'ENVIRONMENTAL_TESTING';
  allocatedAmountUsd: number;
  spentAmountUsd: number;
  varianceUsd: number;
  status: 'ON_TRACK' | 'OVER_BUDGET' | 'UNDER_UTILIZED';
}

// ==========================================
// 13. NOTIFICATIONS & WORM AUDIT LOGS
// ==========================================

export interface NotificationEntity {
  id: string;
  recipientUserId: string; // FK -> User.id
  title: string;
  titleAr?: string;
  body: string;
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  linkedEntityModule: string;
  linkedEntityId: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuditLogEntity {
  id: number; // BigSerial auto-increment
  blockIndex: number;
  timestamp: string;
  actorUserId?: string; // FK -> User.id
  actorName: string;
  actorRole: string;
  action: string;
  entityType: string;
  entityId: string;
  isoClause?: string;
  prevHash: string;
  dataHash: string;
  blockHash: string;
  payloadJson: Record<string, unknown>;
}
