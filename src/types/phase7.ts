/**
 * Phase 7 Types: Training Management, KPI Management, and Permit to Work (e-PTW)
 * Fully compliant with ISO 45001:2018 (§7.2 Competence, §8.1.2 Operational Control, §9.1 Performance Evaluation)
 */

// ==========================================
// A. TRAINING MANAGEMENT TYPES
// ==========================================

export type TrainingRecordStatus = 'VALID' | 'EXPIRING' | 'EXPIRED' | 'NOT COMPLETED';

export interface TrainingCourseModel {
  id: string; // e.g. "CRS-HSE-IND"
  code: string; // e.g. "TC-01"
  title: string;
  titleAr?: string;
  category: 'MANDATORY' | 'HIGH_HAZARD' | 'EQUIPMENT' | 'EMERGENCY' | 'ENVIRONMENTAL';
  validityMonths: number; // e.g. 12, 24, 36
  passingScorePercent: number; // e.g. 80%
  description: string;
  mandatoryBeforeSiteEntry: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmployeeTrainingRecordModel {
  id: string; // e.g. "TR-2026-001"
  employeeId: string;
  employeeName: string;
  employeeBadge: string;
  contractor: string;
  department: string;
  tradeRole: string;
  courseId: string;
  courseTitle: string;
  trainingDate?: string; // YYYY-MM-DD
  expiryDate?: string; // YYYY-MM-DD
  certificateNumber?: string;
  certificateUrlOrPhoto?: string;
  trainer: string;
  trainingProvider: string;
  scoreAchievedPercent?: number;
  status: TrainingRecordStatus;
  verifiedBy?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ==========================================
// B. KPI MANAGEMENT TYPES
// ==========================================

export type KpiPeriodType = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface KpiDefinitionModel {
  id: string; // e.g. "KPI-TRIR"
  code: string; // "TRIR", "LTIFR", "NEAR_MISSES", etc.
  name: string;
  nameAr?: string;
  category: 'LAGGING' | 'LEADING';
  description: string;
  calculationFormula: string;
  targetThreshold: number;
  unit: string; // "rate", "count", "%", "hours"
  isLowerBetter: boolean; // true for TRIR/LTIFR, false for inspections/training %
}

export interface KpiDataPoint {
  periodKey: string; // e.g. "2026-01", "2026-Q1", "2026"
  periodLabel: string;
  actualValue: number;
  targetValue: number;
  manHoursWorked?: number;
  recordablesCount?: number;
  lostTimeCount?: number;
  nearMissCount?: number;
  inspectionsCompleted?: number;
  auditsCompleted?: number;
  capasClosedOnTimePercent?: number;
  trainingCompliancePercent?: number;
  permitCompliancePercent?: number;
}

export interface KpiSummaryReport {
  kpiCode: string;
  name: string;
  category: 'LAGGING' | 'LEADING';
  currentValue: number;
  targetValue: number;
  unit: string;
  onTarget: boolean;
  trend: 'UP' | 'DOWN' | 'STABLE';
  historicalPoints: KpiDataPoint[];
}

// ==========================================
// C. PERMIT TO WORK (e-PTW) TYPES
// ==========================================

export type PermitDisciplineType =
  | 'HOT_WORK'
  | 'COLD_WORK'
  | 'CONFINED_SPACE'
  | 'WORKING_AT_HEIGHT'
  | 'EXCAVATION'
  | 'LIFTING'
  | 'ELECTRICAL_ISOLATION'
  | 'LINE_BREAKING'
  | 'RADIOGRAPHY'
  | 'EQUIPMENT_VEHICLE_ENTRY';

export type PermitStatus =
  | 'DRAFT'
  | 'ISSUED'
  | 'ACTIVE'
  | 'SUSPENDED'
  | 'CLOSED'
  | 'CANCELLED'
  | 'EXPIRED';

export interface GasTestReading {
  gasName: 'Oxygen (O2)' | 'Flammable LEL' | 'Hydrogen Sulfide (H2S)' | 'Carbon Monoxide (CO)';
  unit: '%' | 'ppm';
  measuredValue: number;
  safeLimitDescription: string;
  isAcceptable: boolean;
}

export interface IsolationPoint {
  id: string;
  tagNumber: string;
  equipmentDescription: string;
  isolationType: 'ELECTRICAL_LOTO' | 'MECHANICAL_BLIND' | 'VALVE_LOCKOUT';
  lockNumber: string;
  appliedBy: string;
  verifiedBy: string;
}

export interface PermitToWorkModel {
  id: string; // e.g. "PTW-2026-042"
  permitNumber: string; // e.g. "PTW-2026-042"
  permitType: PermitDisciplineType;
  workDescription: string;
  location: string;
  contractor: string;
  workPartyCount: number;
  workPartyLead: string;
  workPartyMembers: string[]; // employee names/badges
  issuer: string; // Issuing Authority
  receiver: string; // Performing Authority

  // Cross-Module Relational Connections
  projectId: string;
  projectName: string;
  linkedRiskAssessmentId?: string; // from Phase 5
  linkedRiskAssessmentTitle?: string;
  linkedDocumentIds?: string[]; // from Phase 2 / 4 (SOP, HSE Plan)
  linkedDocumentCodes?: string[];

  // Safety Controls & PPE
  controlsSummary: string;
  mandatoryPpe: string[];
  requiresFireWatch: boolean;
  requiresStandbyPerson: boolean;

  // Isolations & Atmospheric Tests
  requiresIsolation: boolean;
  isolations: IsolationPoint[];
  requiresGasTesting: boolean;
  gasTesterName?: string;
  gasTestingDateTime?: string;
  gasReadings: GasTestReading[];
  gasTestPassed: boolean;

  // Emergency Arrangements
  emergencyArrangements: string;
  assemblyPoint: string;
  nearestFireStationOrStandby: string;

  // Timeframes & Lifecycle
  startDateTime: string; // YYYY-MM-DDTHH:mm
  expiryDateTime: string; // YYYY-MM-DDTHH:mm
  status: PermitStatus;

  // Multi-Tier Approvals & Signatures
  approvals: {
    issuingAuthoritySigned: boolean;
    issuingAuthorityName: string;
    issuingSignedAt?: string;
    performingAuthoritySigned: boolean;
    performingAuthorityName: string;
    performingSignedAt?: string;
    safetyOfficerSigned: boolean;
    safetyOfficerName: string;
    safetySignedAt?: string;
  };

  closureDetails?: {
    closedAt: string;
    closedBy: string;
    worksiteRestoredClean: boolean;
    isolationsRemoved: boolean;
    comments: string;
  };

  suspensionReason?: string;
  createdAt: string;
  updatedAt: string;
}
