# Changelog — HSE Management System

All notable changes to this project will be documented in this file.

## [1.9.0] - 2026-09-29 — Phase 8: Dashboard, Reporting & Vector PDF Generation
### Added
- **Real Database-Driven HSE Command Dashboard (`src/components/dashboard/CommandDashboard.tsx`)**:
  - Direct integration with multi-store IndexedDB pipeline via `ReportingService.getDashboardMetrics()`.
  - 15 core surveillance indicators: Projects, Controlled Documents, Pending Approvals, Open Actions, Overdue Actions, Incidents, Near Misses, Inspections, Audits, Training Compliance, Expired Training, Active PTWs, Expired PTWs, Risk Statistics, and KPI Statistics.
  - Interactive SVG Charts: Monthly TRIR/LTIFR trajectory with target threshold line, and high-hazard work permit volume breakdown.
- **Corporate Reporting Center (`src/components/reports/ReportingCenterModule.tsx`)**:
  - Full catalogue of 11 standardized reports covering governance, site operations, incident investigations, inspections, audits, and compliance.
  - Filterable by report category, keyword, and document number.
  - Live interactive data table preview and dual export capabilities (PDF & CSV).
- **Text-Based Vector PDF Generation Engine (`src/services/reportingService.ts`)**:
  - Implemented crisp vector PDF generation via `jsPDF` and `jspdf-autotable` (no screenshot rasterization).
  - Corporate Title Block: vector logo emblem, company name ("4M ENGINEERING CLOUD — HSE ENTERPRISE"), project title, document number, revision, date, and "APPROVED & CONTROLLED" status badge.
  - Tri-Party Approval Blocks: Prepared By, Reviewed By, Approved By with date stamps.
  - Dynamic page numbering ("Page X of Y") across multi-page documents.
  - Formatted printable dossiers tested for: HSE Plan, 5x5 ALARP Risk Assessment, Incident 5-Why Investigation, Multi-Discipline Inspection, and ISO 45001 Compliance Audit.
- **Tabular CSV / Excel Export**:
  - Structured UTF-8 BOM CSV exports for all 11 reports with escaped strings and complete audit metadata.
- **Automated Verification Test Suite (`scripts/testPhase8ReportingAndPdfs.ts`)**:
  - 45 automated unit and integration tests executing with 100% pass rate.

## [1.8.0] - 2026-09-29 — Phase 7: Training, KPI & Permit to Work
### Added
- **Training Management Module (`src/components/training/TrainingManagementModule.tsx`)**:
  - Training Courses Catalogue covering 13 standard industrial safety curricula (HSE Induction, First Aid, Fire Fighting, Working at Height, Confined Space, Lifting & Rigging, Scaffold Safety, PTW, Emergency Response, Defensive Driving, Manual Handling, Chemical Safety, Electrical Safety).
  - Employee Training Records Tracking (Employee, Course, Training Date, Expiry Date, Certificate, Trainer, Training Provider, Score, Status).
  - Dynamic Competency Matrix: Worker vs Course grid with real-time status badges (`VALID`, `EXPIRING`, `EXPIRED`, `NOT COMPLETED`), digital certificate viewer/download modal, and renewal triggers.
  - Automatic Expiry Tracking with 30-day proactive alert threshold.
- **Configurable KPI Management & Trend Reports (`src/components/kpis/KpiManagementModule.tsx`)**:
  - 12 Configurable Leading & Lagging HSE Indicators (TRIR, LTIFR, Near Misses, Recordable Incidents, Lost Time Injuries, First Aid Cases, Safety Observations, Inspections, Audits, CAPA Closure, Training Completion, Permit Compliance).
  - Multi-Period Analytics: Monthly, Quarterly, and Yearly reporting.
  - Interactive SVG Trend Charts with benchmark target threshold indicator lines, actual vs target comparisons, and executive board reporting export.
- **Electronic Permit to Work / e-PTW Module (`src/components/ptw/PtwManagementModule.tsx`)**:
  - 10 High-Hazard Work Permit Disciplines (Hot Work, Cold Work, Confined Space, Working at Height, Excavation, Lifting, Electrical Isolation, Line Breaking, Radiography, Equipment/Vehicle Entry).
  - Complete Operational Permit Dossier Fields (Permit Number, Work Description, Location, Contractor, Work Party, Issuer, Receiver, Controls, Mandatory PPE, LOTO Energy Isolations, Multi-Gas Atmospheric Tests, Emergency Arrangements, Start/Expiry, Multi-Tier Digital Approvals).
  - Full Lifecycle Management: `DRAFT`, `ISSUED`, `ACTIVE`, `SUSPENDED`, `CLOSED`, `CANCELLED`, `EXPIRED`.
  - Closeout verification ensuring worksite is clean and energy isolations normalized.
  - Bidirectional Relational Links to Projects, Contractors, Risk Assessments (Phase 5), Employees, and Controlled Documents (Phase 2/4).
- **Automated Verification Test Suite (`scripts/testPhase7PermitsKpiTraining.ts`)**:
  - 60 automated unit and integration tests executing with 100% pass rate.

## [1.7.0] - 2026-09-29 — Phase 6: Incidents, CAPA, Inspections & Audits
### Added
- **Incident Management Module (`src/components/incidents/IncidentManagementModule.tsx`)**:
  - Full incident reporting and investigation dossier (Incident Number, Date, Time, Location, Project, Department, Person, Contractor, Activity, Incident Type, Description, Immediate Actions).
  - Interactive 5-Why Root Cause Analysis tool with 5-level causality tree and systemic defect identification.
  - Multi-causal Contributing Factors analysis (Human, Equipment, Environmental, Procedural, Organizational).
  - Witness testimonies management (Name, Role, Contractor, Contact, Statement, Interview Date, Interviewer).
  - Evidence and photo upload gallery with captions, timestamps, and upload metadata.
  - Corrective & Preventive Action definition with direct 1-click dispatch to CAPA.
  - Formal Incident Closure workflow with sign-off date, author, and verification comments.
- **Corrective Action / CAPA Module (`src/components/capa/CapaManagementModule.tsx`)**:
  - Central CAPA register (Finding, Source, Risk Level, Action Required, Responsible Person, Department, Target Date, Evidence, Status, Verification, Closure Date, Verified By).
  - Automatic Overdue Detection: actions where `targetDate < today` and status != `CLOSED` are automatically classified as `OVERDUE` with live alerting banner.
  - Verification & Closeout workflow: verification notes, effectiveness confirmation, and closure timestamp.
  - Export CAPA Register to CSV with all fields and audit links.
- **Dynamic Checklist Builder & Inspections Module (`src/components/inspections/InspectionsManagementModule.tsx`)**:
  - Dynamic Checklist Builder supporting all 12 required disciplines:
    1. PPE
    2. Scaffold
    3. Crane
    4. Lifting Equipment
    5. Fire Equipment
    6. Vehicle
    7. Excavation
    8. Housekeeping
    9. Electrical
    10. Working at Height
    11. Confined Space
    12. Emergency Equipment
  - Field Inspection Runner with evaluation per item: PASS, FAIL, N/A, COMMENT, PHOTO capture, and CORRECTIVE ACTION.
  - Live compliance scoring calculation (% score and overall result: PASS, CONDITIONAL PASS, FAIL).
  - Inspection → CAPA Direct Dispatch: 1-click button on failed items automatically spawns a linked CAPA record in the central register.
  - Historical inspection execution logs and printable report viewer.
- **Audits & Non-Conformances Module (`src/components/audits/AuditsManagementModule.tsx`)**:
  - Complete Audit Lifecycle: Audit Plan, Audit Scope, Audit Criteria (ISO 45001, OSHA, Site Rules), Lead Auditor & Team, Auditee, Department, Project, Planned Date.
  - Standard Clause Audit Checklist evaluation (Conformant, Nonconformant, Observation, N/A).
  - Findings Registry: Major Nonconformity, Minor Nonconformity, and Observations with evidence notes and corrective action requirements.
  - Audit → CAPA Direct Dispatch: 1-click button on findings automatically creates a linked CAPA record and sets status to `CAPA_DISPATCHED`.
  - Formal ISO 45001 Final Audit Report Generator: executive summary, automatic Conformance Rating calculation, and auditor digital sign-off.
- **Safety Operations Service (`src/services/safetyOpsService.ts`)**:
  - Encapsulates multi-store persistence across `incident_records`, `corrective_actions`, `inspection_templates`, `inspection_records`, and `audit_records`.
  - Provides inter-module spawning methods (`createCapaFromIncident`, `createCapaFromAuditFinding`, `createCapaFromInspection`).
- **Automated Verification**:
  - Executed `scripts/testPhase6SafetyOps.ts` with 55 passing assertions and 0 failures.
- **Documentation Updated**:
  - Updated `PROJECT_STATUS.md`, `DATABASE_SCHEMA.md`, `AI_MEMORY.md`, `NEXT_TASK.md`, and `CHANGELOG.md`.

## [1.6.0] - 2026-09-29 — Phase 5: HSE Risk Management & 5x5 ALARP Engine
### Added
- **Complete Operational Risk Management Module (`src/components/risk/`)**:
  - `RiskManagementModule.tsx`: Unified interface featuring Risk Register, Hazard Register, Control Measures, and 5x5 Matrix Configuration tabs.
  - `RiskMatrixInteractiveGrid.tsx`: Dynamic 5x5 matrix showing score coordinates (1 to 25), cell distribution counters, and bidirectional cell-click filtering between Initial Inherent Risk and Residual ALARP Risk.
  - `HazardRegisterView.tsx`: Standalone Hazard catalogue supporting category filtering (8 categories), search, and full CRUD (Create, Edit, Duplicate, Archive).
  - `ControlMeasuresView.tsx`: Hierarchy of Controls register (Elimination, Substitution, Engineering, Administrative, PPE) with effectiveness tracking and verification methods.
  - `RiskAssessmentEditorModal.tsx`: Comprehensive modal for creating, editing, viewing, and duplicating risk assessments with all 16 required fields.
  - `MatrixConfigModal.tsx`: Administrator configuration modal for Likelihood levels (1-5), Severity levels (1-5), Risk Tiers, Thresholds, and custom colors.
  - `RiskDossierPrintModal.tsx`: ISO 45001 compliant printable dossier with assessment details, barrier evaluation, and sign-off blocks.
- **Risk Assessment Entity & All 16 Mandatory Fields (`src/types/risk.ts`, `src/services/riskService.ts`)**:
  - Activity, Task, Hazard, Potential Consequence, Existing Controls, Likelihood (1-5), Severity (1-5), Initial Risk Score & Tier, Additional Controls, Responsible Person, Target Date, Residual Likelihood (1-5), Residual Severity (1-5), Residual Risk Score & Tier, ALARP Justification, and Status.
- **Configurable 5x5 Risk Matrix Calculation**:
  - Formula: `Risk Score = Likelihood × Severity` (bounds 1 to 25).
  - Real-time quantitative risk reduction percentage calculation.
  - Multi-store persistence to IndexedDB (`hazards`, `control_measures`, `risk_assessments`) with zero reliance on static mock data.
- **Cross-Module Linkage Engine (`src/services/linkableEntitiesService.ts`)**:
  - Seamless foreign key reference linking to Projects, Controlled Documents, SOPs, Permits to Work (e-PTW), Workplace Incidents, and Audit Findings.
- **Export & Reporting Service Expansion (`src/services/exportService.ts`)**:
  - `exportCompleteRiskRegisterToCsv`: Structured CSV export covering all 16 fields and cross-module linkages.
  - `exportRiskRegisterToJson`: Complete JSON payload export for external API integration.
- **Automated Verification**:
  - Executed `scripts/testPhase5RiskManagement.ts` with 100% pass rate.
- **Documentation Updated**:
  - Updated `PROJECT_STATUS.md`, `DATABASE_SCHEMA.md`, `AI_MEMORY.md`, `NEXT_TASK.md`, and `CHANGELOG.md`.

## [1.5.0] - 2026-09-28 — Phase 4: HSE Plan, Procedures, and SOP Modules

### Added
- **10 Mandatory Professional HSE Templates (`src/data/templates/`)**:
  - `TMPL-HSE-PLN`: Site Master HSE Plan featuring all 33 standardized ISO 45001:2018 sections (Document Control, Project Information, Scope, HSE Policy, HSE Objectives, Legal Requirements, Standards, Roles & Responsibilities, Organization, Risk Management, Hazard Identification, Risk Assessment, Permit to Work, Emergency Response, Fire Safety, Environmental Management, Traffic Management, Lifting, Working at Height, Confined Space, Electrical Safety, Excavation, Chemical Safety, PPE, Training, Inspections, Audits, Incident Reporting, Corrective Actions, KPIs, Communication, Document Control & Retention, Appendices).
  - `TMPL-HSE-SOP`: Standard Operating Procedure (SOP) with all 17 standard operational sections (Purpose, Scope, Definitions, Responsibilities, Competency, PPE, Equipment, Hazards, Risk Controls, Procedure Steps, Emergency Actions, Environmental Requirements, Records, References, Attachments, Revision History, Approval).
  - `TMPL-HSE-PRC`: HSE Operational Procedure.
  - `TMPL-HSE-MNL`: Corporate HSE Management System Manual.
  - `TMPL-HSE-POL`: Executive HSE Policy Statement.
  - `TMPL-HSE-TRF`: Site Logistics & Traffic Management Plan.
  - `TMPL-HSE-ERP`: Site Emergency Response Plan (ERP).
  - `TMPL-HSE-FIR`: Project Fire Safety & Prevention Plan.
  - `TMPL-HSE-MOB`: Site Mobilisation & HSE Verification Checklist.
  - `TMPL-HSE-CNT`: Contractor Mandatory HSE Specifications & Requirements.
- **Dynamic Template Reusability & Integration**:
  - Reused existing Dynamic Template Builder and Document Engine without hardcoding sections into UI components.
  - Sections and fields remain 100% editable and configurable in real-time.
  - Documents generated from templates remain live and editable via `DynamicDocumentEditorModal`.
  - Auto-seeding and merging of missing default templates on application initialization in `TemplateManagementService.init()`.
- **Navigation Integration**:
  - Enhanced `DynamicFormBuilder` with category filtering and template pre-selection.
  - Wired `formal-hse-plan-generator` navigation route directly to the template builder with `PLANS` and `TMPL-HSE-PLN` pre-selected.
- **Automated Verification**:
  - Created and executed `scripts/testPhase4Templates.ts` validating all 10 templates, 33 HSE Plan sections, 17 SOP sections, dynamic configuration, document creation, multi-field edits, saving, and persistence (100% pass rate).
- **Documentation Updated**:
  - Updated `PROJECT_STATUS.md`, `AI_MEMORY.md`, `DATABASE_SCHEMA.md`, `NEXT_TASK.md`, and `CHANGELOG.md`.

## [1.4.0] - 2026-09-28 — Phase 3: Dynamic HSE Document Template Builder
### Added
- **Dynamic Template Builder Engine (`src/services/templateService.ts`)**:
  - Full CRUD operations: Create Template, Edit Template, Duplicate Template (deep cloning with `-COPY` suffix and fresh IDs), and Archive Template.
  - Multi-store persistence to IndexedDB (`document_templates`, `document_sections`, `document_fields`, `document_instances`, `document_revisions`) with robust in-memory fallback.
- **Support for All 23 Field Types (`src/types/formFieldConfig.ts` & `src/components/documents/DynamicFieldRenderer.tsx`)**:
  - Standard Inputs: `TEXT`, `TEXTAREA` / `LONG_TEXT`, `RICH_TEXT`, `NUMBER`, `DATE`, `TIME`.
  - Choices & Controls: `DROPDOWN`, `MULTI_SELECT`, `CHECKBOX`, `RADIO`, `YES_NO`.
  - Media & Tables: `TABLE`, `IMAGE`, `ATTACHMENT`, `SIGNATURE`.
  - HSE Domain Selectors: `EMPLOYEE`, `PROJECT`, `CONTRACTOR`, `EQUIPMENT`, `RISK`, `KPI`, `INCIDENT`, `TRAINING`.
- **Comprehensive 12 Field Configuration Properties (`FieldEditorModal.tsx`)**:
  - Field ID, Label (EN/AR), Description/Guidance (EN/AR), Type, Required flag, Default value, Validation rules (min, max, regex pattern, custom error alert), Dynamic options builder, Order sequence, Section binding, Visibility ('VISIBLE', 'HIDDEN', 'CONDITIONAL'), and Role Permissions ('ALL', 'ADMIN_ONLY', 'HSE_LEAD_ONLY', 'SAFETY_ENGINEER_ONLY').
- **Interactive Section & Field Management (`DynamicFormBuilder.tsx`)**:
  - Create sections, reorder sections with Move Up / Move Down buttons and drag handles.
  - Reorder fields inside sections, duplicate fields, delete fields, and edit configuration in visual modal.
- **Template Live Preview**:
  - Split-screen / live preview tab showing the rendered document with ISO 45001 headers and all 23 field types in real-time.
  - Dual-language support (English LTR and Arabic RTL).
- **Living Document Generator & Non-Destructive Editor**:
  - `CreateDocumentFromTemplateModal.tsx`: Instantiates living controlled documents directly from dynamic templates.
  - `DynamicDocumentEditorModal.tsx`: Provides non-destructive editing of living document field values and revision metadata without converting documents into static images.
  - Integrated into `DocumentLibrary.tsx` with dedicated "Edit Living Document" action button.
- **Automated Verification Test**:
  - Added `scripts/testTemplateBuilder.ts` testing the complete lifecycle: Create template -> Add sections -> Add fields -> Save template -> Create document -> Edit document -> Save document -> Reload document -> Verify data persistence (100% pass rate).
- **Project Control Files Synchronized**:
  - Updated `DATABASE_SCHEMA.md`, `ARCHITECTURE.md`, `AI_MEMORY.md`, `PROJECT_STATUS.md`, `NEXT_TASK.md`, and `CHANGELOG.md`.

## [1.3.0] - 2026-09-28 — Phase 2: HSE Document Management System
### Added
- 23 Database-Driven Document Types (`src/services/documentService.ts`) with ISO 45001 clause mapping, code prefixes, descriptions, and retention periods.
- Configurable Document Numbering Service (`DocumentManagementService.generateDocumentNumber`) generating standard strings such as `HSE-PLN-001-REV00`, `HSE-SOP-001-REV00`, and `HSE-INC-2026-001`.
- Dynamic Field Types Architecture (`src/types/formFieldConfig.ts` & `src/components/documents/DynamicFieldRenderer.tsx`).
- Full Document CRUD Operations in `CreateEditDocumentModal.tsx`, `DocumentLibrary.tsx`, and `AppContext.tsx`.

## [1.2.0] - 2026-09-28 — Phase 1: Database & Core Architecture
### Added
- Complete relational database model covering 39 tables in `src/types/database.ts` and `DATABASE_SCHEMA.md`.
- IndexedDB v2 multi-store local storage engine in `src/services/db.ts`.
- Core application shell with Language switch (EN/AR), Theme switch (Day/Night), and RBAC modal.

## [1.1.0] - 2026-09-28
### Added
- Project-control documentation files and initial ExportService.

## [1.0.0] - 2026-09-28
### Added
- Initial ISO 45001 Executive Safety Command Center, 5x5 ALARP Matrix, and PTW Live Board.
