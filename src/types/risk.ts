/**
 * Risk Management, Hazard Identification & ALARP System Types
 * Compliant with ISO 45001:2018 Clause 6.1.2 & OSHA 1926 Safety Standards
 */

export type HazardCategory =
  | 'PHYSICAL'
  | 'CHEMICAL'
  | 'BIOLOGICAL'
  | 'ERGONOMIC'
  | 'PSYCHOSOCIAL'
  | 'ELECTRICAL'
  | 'MECHANICAL'
  | 'ENVIRONMENTAL';

export type HierarchyControlLevel =
  | 'ELIMINATION'
  | 'SUBSTITUTION'
  | 'ENGINEERING'
  | 'ADMINISTRATIVE'
  | 'PPE';

export type RiskStatus =
  | 'DRAFT'
  | 'IN_REVIEW'
  | 'CONTROLLED'
  | 'ACTION_REQUIRED'
  | 'ARCHIVED';

export type RiskTierId = 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';

export interface HazardItem {
  id: string; // e.g. HAZ-001
  code: string; // e.g. HAZ-FALL-01
  category: HazardCategory;
  title: string;
  titleAr?: string;
  description: string;
  potentialConsequences: string[];
  standardReference?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface ControlMeasureItem {
  id: string; // e.g. CTRL-001
  code: string; // e.g. CTRL-ENG-01
  hierarchyLevel: HierarchyControlLevel;
  title: string;
  titleAr?: string;
  description: string;
  verificationMethod: string;
  typicalEffectiveness: number; // percentage (0-100)
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

export interface LikelihoodLevelConfig {
  level: number; // 1 to 5
  code: string; // e.g. 'L1', 'L2'
  name: string; // e.g. 'Rare', 'Unlikely', 'Possible', 'Likely', 'Almost Certain'
  nameAr: string; // e.g. 'نادر جداً', 'غير محتمل', 'محتمل', 'مرجح', 'شبه مؤكد'
  description: string;
  frequency: string;
}

export interface SeverityLevelConfig {
  level: number; // 1 to 5
  code: string; // e.g. 'S1', 'S2'
  name: string; // e.g. 'Insignificant', 'Minor', 'Moderate', 'Major', 'Catastrophic'
  nameAr: string; // e.g. 'طفيف جداً', 'بسيط', 'متوسط', 'جوهري / بليغ', 'كارثي'
  description: string;
  safetyImpact: string;
}

export interface RiskTierConfig {
  id: RiskTierId;
  name: string;
  nameAr: string;
  minScore: number;
  maxScore: number;
  color: string; // Hex color code
  textColor: string;
  bgClass: string;
  borderClass: string;
  textClass: string;
  actionRequired: string;
  actionRequiredAr: string;
}

export interface RiskMatrixConfig {
  id: string;
  name: string;
  nameAr: string;
  likelihoodLevels: LikelihoodLevelConfig[];
  severityLevels: SeverityLevelConfig[];
  riskTiers: RiskTierConfig[];
  updatedAt: string;
  updatedBy: string;
}

export interface RiskAssessmentRecord {
  id: string; // e.g. RA-2026-042
  rev?: string; // e.g. REV-01
  activity: string; // Activity name
  task: string; // Specific task description
  hazard: string; // Hazard summary / title
  hazardId?: string; // Link to Hazard register
  potentialConsequence: string; // Consequence description
  existingControls: string; // Existing controls in place
  likelihood: number; // 1-5
  severity: number; // 1-5
  initialRiskScore: number; // Likelihood × Severity (1-25)
  initialRiskTier: RiskTierId; // e.g. EXTREME, HIGH, MEDIUM, LOW
  additionalControls: string; // Additional mitigation measures
  responsiblePerson: string; // Person assigned
  targetDate: string; // ISO date string YYYY-MM-DD
  residualLikelihood: number; // 1-5
  residualSeverity: number; // 1-5
  residualRiskScore: number; // Residual Likelihood × Residual Severity (1-25)
  residualRiskTier: RiskTierId; // e.g. LOW, MEDIUM, HIGH, EXTREME
  alarpJustification: string; // ALARP justification text
  status: RiskStatus; // Status of assessment

  // Hierarchy of controls checklist
  hierarchyOfControls: {
    elimination: boolean;
    substitution: boolean;
    engineering: boolean;
    administrative: boolean;
    ppe: boolean;
  };

  // Cross-module Links
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

  // Additional operational metadata
  discipline?: string;
  disciplineLabel?: string;
  zone?: string;
  reviewerName?: string;
  reviewerRole?: string;
  signoffDate?: string;
  isArchived?: boolean;
  createdAt: string;
  updatedAt: string;
}
