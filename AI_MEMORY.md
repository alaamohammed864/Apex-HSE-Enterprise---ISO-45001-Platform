# AI Architectural Memory

## Project Context
- **Product**: Apex HSE Enterprise Management Platform
- **Core Standard**: ISO 45001:2018 (Occupational Health & Safety Management Systems), OSHA 1926/1910, ALARP, NFPA.

## Phase 2: Document Management Subsystem — Architectural Decisions
1. **Database-Driven Document Types**:
   - Grounded in 23 standardized Document Types (`INITIAL_23_DOCUMENT_TYPES` in `src/services/documentService.ts`).
   - ISO Clause mapping, standard prefix (e.g. `HSE-PLN`, `HSE-SOP`, `HSE-INC`, `HSE-AUD`), default retention periods, and structured schema definitions.
2. **Configurable Document Numbering**:
   - Implemented `DocumentManagementService.generateDocumentNumber(prefix, seq, rev)` generating standard codes like `HSE-PLN-001-REV00`, `HSE-SOP-001-REV00`, and `HSE-INC-2026-001`.
3. **Full CRUD & Lifecycle Operations**:
   - Create, edit, duplicate, archive, and print ISO 45001 watermarked dossiers with WORM hashes.

## Phase 3: Dynamic HSE Document Template Builder — Architectural Decisions
1. **Dynamic Template Builder Engine (`src/services/templateService.ts`)**:
   - Administrator can Create, Edit, Duplicate (deep cloning with `-COPY` suffix), and Archive templates.
   - Templates stored in `document_templates`, `document_sections`, and `document_fields` with automatic persistence in IndexedDB and in-memory fallback.
2. **Support for All 23 Field Types**:
   - Standard Inputs: `TEXT`, `TEXTAREA` / `LONG_TEXT`, `RICH_TEXT`, `NUMBER`, `DATE`, `TIME`.
   - Choices & Controls: `DROPDOWN`, `MULTI_SELECT`, `CHECKBOX`, `RADIO`, `YES_NO`.
   - Media & Tables: `TABLE`, `IMAGE`, `ATTACHMENT`, `SIGNATURE`.
   - HSE Domain Selectors: `EMPLOYEE`, `PROJECT`, `CONTRACTOR`, `EQUIPMENT`, `RISK`, `KPI`, `INCIDENT`, `TRAINING`.
3. **Comprehensive Field Specification (12 Properties)**:
   - Each field configures: Field ID, Label (EN/AR), Description (EN/AR), Type, Required flag, Default value, Validation rules (regex, min, max, custom error alert), Options list, Order sequence, Section assignment, Visibility ('VISIBLE', 'HIDDEN', 'CONDITIONAL'), and Role Permissions ('ALL', 'ADMIN_ONLY', 'HSE_LEAD_ONLY', 'SAFETY_ENGINEER_ONLY').
4. **Sections & Field Reordering**:
   - Sections and fields feature intuitive Move Up / Move Down buttons, drag handles, and order counters ensuring full visual clarity.
5. **Interactive Live Preview**:
   - Provides split-mode preview of the final rendered document with all sections and 23 field types in real-time.
   - Dual-language preview (English LTR and Arabic RTL).
6. **Living Document Generation & Non-Destructive Editing**:
   - Generates editable living controlled document instances (`document_instances` & `document_revisions`).
   - The document remains 100% editable inside `DynamicDocumentEditorModal` without converting into an image.
   - Validated with automated test script `scripts/testTemplateBuilder.ts`.

## Phase 4: HSE Plan, Procedures, and SOP Modules — Architectural Decisions
1. **Modular Professional Template Architecture (`src/data/templates/`)**:
   - Segregated into clean modular files rather than hardcoding in UI components:
     - `hsePlanTemplate.ts`: 33-section comprehensive master HSE execution plan complying with ISO 45001:2018 (Section 7.5.1).
     - `sopTemplate.ts`: 17-section standard operating procedure with hazard controls, equipment PPE, and approval signatures (Section 8.1.2).
     - `proceduresAndPlansTemplates.ts`: Operational procedures, Traffic Management Plan, Emergency Response Plan, Fire Plan.
     - `governanceTemplates.ts`: Corporate HSE Manual, Policy, Mobilisation Verification, and Contractor Requirements.
     - `index.ts`: Central registry exporting `ALL_PROFESSIONAL_TEMPLATES` and `DEFAULT_DYNAMIC_TEMPLATES`.
2. **Configurable & Editable Template Sections**:
   - Every section and field is an editable JSON structure loaded dynamically by `TemplateManagementService`.
   - Admin can add new custom sections (e.g. Client Specific Requirements), modify section orders, or change field validations on the fly.
3. **Non-Destructive Living Document Persistence**:
   - Creating documents from templates instantiates structured field value objects inside `DocumentRevision.contentDataJson`.
   - Data remains interactive, searchable, and re-editable via `DynamicDocumentEditorModal`.
   - No static image rasterization or destructive flattening.
4. **Automated Verification**:
   - Validated with dedicated automated test suite `scripts/testPhase4Templates.ts` with 100% pass rate.

## Phase 5: HSE Risk Management & 5x5 ALARP Engine — Architectural Decisions
1. **Configurable 5x5 Risk Matrix Architecture (`src/services/riskService.ts`, `src/types/risk.ts`)**:
   - Discrete quantitative mathematical formula: `Risk Score = Likelihood × Severity` (bounds 1 to 25).
   - Fully customizable likelihood levels 1-5 (names, Arabic names, frequency probability).
   - Fully customizable severity levels 1-5 (names, Arabic names, safety impact).
   - Administrator-configurable risk tier thresholds and custom hex color codes.
   - Interactive 5x5 grid with cell-click bidirectional filtering and Initial vs Residual toggles.
2. **Hazard Register & Hierarchy of Controls**:
   - Standalone `hazards` store categorized across 8 physical, chemical, and environmental groups.
   - Pre-seeded industrial hazard catalogue with standard reference mappings (OSHA 1926.501, ISO 45001 §6.1.2).
   - Control Measures register implementing the 5-tier Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE) with effectiveness ratings.
3. **Comprehensive Risk Assessment Entity (16 Core Fields)**:
   - Full support for Activity, Task, Hazard, Potential Consequence, Existing Controls, Likelihood, Severity, Initial Risk, Additional Controls, Responsible Person, Target Date, Residual Likelihood, Residual Severity, Residual Risk, ALARP Justification, and Status.
   - Cross-module linkage engine linking Risk Assessments to Projects, Controlled Documents, SOPs, Permits (e-PTW), Incidents, and Audits.
4. **Offline-First Persistence & Export**:
   - Direct IndexedDB persistence via `hazards`, `control_measures`, and `risk_assessments` stores with in-memory fallback.
   - Complete tabular CSV export, machine-readable JSON export, and ISO 45001 formatted printable dossier.
5. **Automated Verification**:
   - End-to-end test script `scripts/testPhase5RiskManagement.ts` passed 100% covering all CRUD, calculation, admin configuration, linking, and persistence workflows.

