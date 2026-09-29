# Changelog — HSE Management System

All notable changes to this project will be documented in this file.

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
