/**
 * Comprehensive Dynamic Document Form Field Definitions & Types
 * Supports all 23 required field types:
 * Text, Textarea, Rich Text, Number, Date, Time, Dropdown, Multi-select, Checkbox,
 * Radio, Yes/No, Table, Image, Attachment, Signature, Employee, Project, Contractor,
 * Equipment, Risk, KPI, Incident, Training.
 *
 * Each field supports:
 * Field ID, Label, Description, Type, Required, Default value, Validation,
 * Options, Order, Section, Visibility, Permissions.
 */

export type FormFieldType =
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
  | 'TRAINING';

export type FieldVisibility = 'VISIBLE' | 'HIDDEN' | 'CONDITIONAL';

export type FieldPermissionLevel =
  | 'ALL'
  | 'ADMIN_ONLY'
  | 'HSE_LEAD_ONLY'
  | 'SAFETY_ENGINEER_ONLY'
  | string;

export interface FieldValidationConfig {
  regex?: string;
  min?: number;
  max?: number;
  rule?: string;
  errorMessage?: string;
  errorMessageAr?: string;
}

export interface FieldOptionItem {
  value: string;
  label: string;
  labelAr?: string;
}

export interface TableColumnConfig {
  key: string;
  label: string;
  labelAr?: string;
  type: 'text' | 'number' | 'date' | 'select';
  options?: string[];
}

export interface FormFieldConfig {
  id: string; // Field ID (unique identifier, e.g. fld_001)
  fieldKey: string; // Machine identifier
  label: string; // Label (English)
  labelAr: string; // Label (Arabic)
  description?: string; // Description / Guidance
  descriptionAr?: string;
  fieldType: FormFieldType; // Type from 23 supported types
  isRequired: boolean; // Required flag
  defaultValue?: any; // Default value
  validation?: FieldValidationConfig; // Validation rules
  options?: FieldOptionItem[]; // Options for Dropdown, Multi-select, Radio
  order: number; // Order sequence inside section
  sectionId: string; // Section ID it belongs to
  visibility: FieldVisibility; // Visibility
  permissions: FieldPermissionLevel; // Role permissions
  placeholder?: string;
  placeholderAr?: string;
  tableColumns?: TableColumnConfig[]; // For TABLE type
}

export interface FormSectionConfig {
  id: string; // Section ID
  title: string; // English Title
  titleAr: string; // Arabic Title
  description?: string; // Section guidance / scope
  descriptionAr?: string;
  order: number; // Sequence order
  isMandatory?: boolean;
  fields: FormFieldConfig[]; // Fields in this section
}

export interface DynamicDocumentTemplateConfig {
  id: string; // Primary Key
  code: string; // e.g. TMPL-HSE-PLN-01
  title: string;
  titleAr: string;
  category: 'PLANS' | 'PROCEDURES' | 'FORMS' | 'RECORDS' | 'POLICIES';
  isoClause: string;
  description: string;
  descriptionAr?: string;
  version: string;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  sections: FormSectionConfig[];
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Standard Seed Equipment, Risks, KPIs, Incidents, and Training for rich selectors
 */
export const SEED_EQUIPMENT_LIST = [
  { id: 'EQ-CRANE-01', code: 'CRN-750T', name: 'Liebherr LR-1750 Crawler Crane 750T', tag: 'HEAVY_LIFT', certValidUntil: '2026-12-31', status: 'CERTIFIED' },
  { id: 'EQ-DOZER-02', code: 'DZR-CAT-D8', name: 'Caterpillar D8T Track-Type Bulldozer', tag: 'EARTHMOVING', certValidUntil: '2026-11-15', status: 'CERTIFIED' },
  { id: 'EQ-PUMP-03', code: 'PMP-50M', name: 'Sany 50m Boom Mobile Concrete Pump', tag: 'CONCRETE', certValidUntil: '2026-10-30', status: 'CERTIFIED' },
  { id: 'EQ-COMP-04', code: 'CMP-XAS', name: 'Atlas Copco XAS 186 Diesel Air Compressor', tag: 'UTILITIES', certValidUntil: '2027-01-20', status: 'CERTIFIED' },
  { id: 'EQ-WELD-05', code: 'WLD-BB500', name: 'Miller Big Blue 500X Multi-Arc Welder', tag: 'ELECTRICAL', certValidUntil: '2026-09-30', status: 'INSPECTION_DUE' },
];

export const SEED_RISK_REGISTER_LIST = [
  { id: 'RSK-01', code: 'RSK-LIFT-01', hazard: 'Tandem Heavy Lifting over Cryogenic Piping', rating: 'HIGH (16)', alarpStatus: 'ALARP Demonstrated' },
  { id: 'RSK-02', code: 'RSK-CONF-02', hazard: 'Nitrogen Inerting & Asphyxiation in LNG Tank', rating: 'CRITICAL (20)', alarpStatus: 'Under Engineering Interlock' },
  { id: 'RSK-03', code: 'RSK-EXCV-03', hazard: 'Deep Excavation (>3m) Trench Wall Collapse', rating: 'HIGH (15)', alarpStatus: 'Shored & Certified' },
  { id: 'RSK-04', code: 'RSK-ELEC-04', hazard: 'Substation 33kV Live Busbar Accidental Flashover', rating: 'CRITICAL (25)', alarpStatus: 'LOTO Lockout Verified' },
  { id: 'RSK-05', code: 'RSK-RAD-05', hazard: 'Gamma Radiography Source Exposure during NDT', rating: 'MEDIUM (12)', alarpStatus: '100m Barricade Enforced' },
];

export const SEED_KPI_LIST = [
  { id: 'KPI-01', code: 'TRIFR', name: 'Total Recordable Incident Frequency Rate', target: '< 0.15', frequency: 'Monthly' },
  { id: 'KPI-02', code: 'LTIR', name: 'Lost Time Incident Rate', target: '0.00', frequency: 'Monthly' },
  { id: 'KPI-03', code: 'LOTO-AUD', name: 'LOTO Electrical Isolation Compliance Rate', target: '100%', frequency: 'Weekly' },
  { id: 'KPI-04', code: 'TBT-ATT', name: 'Daily Toolbox Talk Attendance Rate', target: '> 98%', frequency: 'Daily' },
  { id: 'KPI-05', code: 'CAPA-CLS', name: 'CAPA Non-Conformance Close-Out within 14 Days', target: '> 95%', frequency: 'Monthly' },
];

export const SEED_INCIDENT_LIST = [
  { id: 'INC-2026-001', code: 'INC-2026-001', title: 'Dropped Scaffold Tube from Pipe Rack Elev. +24m', severity: 'HIGH_POTENTIAL', date: '2026-02-14' },
  { id: 'INC-2026-002', code: 'INC-2026-002', title: 'Hydraulic Hose Rupture on Boom Lift during Cladding', severity: 'MINOR_SPILL', date: '2026-03-02' },
  { id: 'INC-2026-003', code: 'INC-2026-003', title: 'Excavation Gas Warning: Low Oxygen Level (18.4%) Alarm', severity: 'NEAR_MISS', date: '2026-03-18' },
];

export const SEED_TRAINING_LIST = [
  { id: 'TRN-01', code: 'TRN-WAH', title: 'Working at Height & Fall Arrest Rescue Certification', validYears: 2, mandatoryFor: 'Scaffolders & Riggers' },
  { id: 'TRN-02', code: 'TRN-CSE', title: 'Confined Space Entry & Multi-Gas Atmospheric Testing', validYears: 1, mandatoryFor: 'Standby & Entry Team' },
  { id: 'TRN-03', code: 'TRN-LOTO', title: 'Lockout/Tagout (LOTO) Authorized Person Certification', validYears: 2, mandatoryFor: 'Electricians & Mechanics' },
  { id: 'TRN-04', code: 'TRN-H2S', title: 'OPITO Certified H2S & Emergency Breathing Apparatus', validYears: 2, mandatoryFor: 'All Plant Personnel' },
  { id: 'TRN-05', code: 'TRN-RIG', title: 'LEEA Appointed Person Lifting Operations', validYears: 3, mandatoryFor: 'Rigging Supervisors' },
];

/**
 * Standard dynamic templates with all 23 field types covered across categories
 * Including the 10 professional templates:
 * 1. HSE Plan (33 sections)
 * 2. HSE Procedure
 * 3. SOP (17 sections)
 * 4. HSE Manual
 * 5. HSE Policy
 * 6. Traffic Management Plan
 * 7. Emergency Response Plan
 * 8. Fire Plan
 * 9. Mobilisation & Site Verification
 * 10. Contract & HSE Requirements
 */
export { DEFAULT_DYNAMIC_TEMPLATES, ALL_PROFESSIONAL_TEMPLATES } from '../data/templates';
