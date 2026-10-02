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

## Phase 6: Incidents, CAPA, Inspections & Audits — Architectural Decisions
1. **Unified Safety Operations Service (`src/services/safetyOpsService.ts`)**:
   - Encapsulates multi-store persistence across `incident_records`, `corrective_actions`, `inspection_templates`, `inspection_records`, and `audit_records`.
   - Single source of truth for all operational safety workflows, automatic overdue calculations, and cross-module bridges.
2. **Incident Investigation & 5-Why Methodology (ISO 45001 §10.2)**:
   - Full 18-field incident reporting model with classification, time/location, activity, and involved persons.
   - Interactive 5-Why causal tree with 5 progressive levels identifying physical causes through to systemic organizational root causes.
   - Formal multi-causal contributing factors analysis (Human, Equipment, Environmental, Procedural, Organizational).
   - Witness interview logs, evidence/photo upload gallery, and digital sign-off closure workflow.
3. **Automated CAPA Engine with Overdue Detection**:
   - Real-time evaluation of `targetDate < today` to dynamically compute `OVERDUE` status for open/in-progress actions.
   - Full CAPA lifecycle: OPEN → IN PROGRESS → PENDING VERIFICATION → CLOSED, with formal verification signoff (Verified By, notes, effectiveness confirmation).
   - CSV export capability for stakeholder audits and board reporting.
4. **Dynamic Checklist Builder (12 Disciplines)**:
   - Pre-configured standard checklists for: PPE, Scaffold, Crane, Lifting Equipment, Fire Equipment, Vehicle, Excavation, Housekeeping, Electrical, Working at Height, Confined Space, Emergency Equipment.
   - Customizable checklist builder: create new checklists, modify requirements, standard references, and critical items.
   - Field runner supporting live item evaluations: PASS, FAIL, N/A, COMMENT, PHOTO capture, and CORRECTIVE ACTION.
5. **Cross-Module Relational Bridges**:
   - **Incident → CAPA**: 1-click dispatch generates CAPA record with Source = 'INCIDENT' and bidirectional ID reference.
   - **Audit → CAPA**: 1-click dispatch on audit findings generates CAPA record with Source = 'AUDIT' and updates finding status to 'CAPA_DISPATCHED'.
   - **Inspection → CAPA**: 1-click dispatch on failed inspection checkpoint generates CAPA record with Source = 'INSPECTION' and links back to the inspection item.
6. **Automated Verification**:
   - Validated with dedicated automated test suite `scripts/testPhase6SafetyOps.ts` (55 passing assertions, 0 failures).

## Phase 7: Training, KPI & Permit to Work — Architectural Decisions
1. **Dedicated Phase 7 Service (`src/services/phase7Service.ts`)**:
   - Encapsulates multi-store persistence across `training_courses`, `training_records`, `kpi_definitions`, `kpi_records`, and `permit_to_work` IndexedDB stores.
   - Initialized with realistic enterprise datasets: 13 training courses, realistic employee competence matrix, 12 ISO/OSHA KPI definitions with historical monthly/quarterly/yearly trends, and 10 high-hazard e-PTW disciplines.
2. **Competency Passport & Expiry Tracking (ISO 45001 §7.2)**:
   - Dynamic calculation of training validity status:
     - `VALID`: Valid date in future > 30 days.
     - `EXPIRING`: Valid date expiring within 30 days.
     - `EXPIRED`: Expiry date prior to current date.
     - `NOT COMPLETED`: Course never taken or missing records.
   - Interactive Competency Matrix: Worker rows vs Course columns with quick certificate inspection modal and renewal triggers.
3. **Executive KPI Management Engine (ISO 45001 §9.1)**:
   - 12 Configurable Leading & Lagging Indicators (TRIR, LTIFR, Near Misses, Recordables, Lost Time Injuries, First Aid, Observations, Inspections, Audits, CAPA closure, Training %, PTW Compliance %).
   - Flexible reporting intervals: Monthly, Quarterly, and Yearly with automatic aggregation and trend line rendering.
   - Target configuration per KPI with isLowerBetter threshold awareness (green for on-target, red alert for off-target).
4. **Electronic Permit to Work / e-PTW (ISO 45001 §8.1.2)**:
   - Covers 10 high-hazard disciplines (Hot Work, Cold Work, Confined Space, Working at Height, Excavation, Lifting, Electrical Isolation, Line Breaking, Radiography, Equipment/Vehicle Entry).
   - Relational linkage engine connects each permit directly to Projects, Contractors, Phase 5 Risk Assessments, Employees, and Phase 2/4 Controlled Documents.
   - Atmospheric Gas Testing Interlock: O2, LEL, H2S, CO reading verification against safe thresholds.
   - LOTO Energy Isolation Points: Multiple tag/lock registrations with verification signoffs.
   - Digital Multi-Tier Signatures: Issuing Authority, Performing Authority, and Safety Officer with date/time stamps.
   - Safe Closeout Verification: Worksite restored clean and energy isolations normalized before official closeout.
5. **Automated Verification**:
   - Validated with dedicated automated test script `scripts/testPhase7PermitsKpiTraining.ts` (60 passing assertions, 0 failures).

## Phase 8: Dashboard, Reporting & Vector PDF Generation — Architectural Decisions
1. **Central Reporting Service (`src/services/reportingService.ts`)**:
   - Single point of aggregation for multi-store telemetry, pulling asynchronously from `document_instances`, `incident_records`, `corrective_actions`, `inspection_records`, `audit_records`, `training_records`, and `permit_to_work`.
   - Computes 15 live dashboard surveillance indicators with resilient fallback logic.
2. **True Vector Text-Based PDF Engine (`jsPDF` + `jspdf-autotable`)**:
   - Rejected HTML screenshot rasterization in favor of crisp, searchable, selectable, and fully scalable vector PDF rendering.
   - Built a reusable corporate page template with:
     - ISO compliant Title Block with vector emblem and company metadata.
     - Document numbering, revision status, and publication date.
     - Tri-party sign-off blocks (Prepared By, Reviewed By, Approved By).
     - Dynamic pagination ("Page X of Y") evaluated across arbitrary multi-page documents.
     - Corporate security classification footer.
3. **Specialized PDF Generators**:
   - Tailored formatting for the 5 key compliance dossiers:
     - HSE Plan (executive summary, 9 core components, stop-work authority statement).
     - 5x5 ALARP Risk Register (landscape layout, baseline controls, residual score, ALARP criteria).
     - Incident Investigation Report (metadata, narrative box, 5-Why root cause tree, linked CAPAs).
     - Multi-Discipline Inspection Report (standard clauses, pass/fail color-coding, field notes).
     - ISO 45001 Compliance Audit Final Report (scope, criteria, findings register, conformance rating).
4. **Live Database Command Dashboard (`src/components/dashboard/CommandDashboard.tsx`)**:
   - 15 live metric tiles connected to database state.
   - Dual SVG interactive charts for Monthly TRIR/LTIFR and High-Hazard Permit distribution.
5. **Automated Verification**:
   - Dedicated test suite `scripts/testPhase8ReportingAndPdfs.ts` verified metrics, catalogue, and generated valid `%PDF-` blobs (45 assertions, 0 failures).

## Phase 9: Document Control, Approval Workflow & Immutable Audit Trail — Architectural Decisions
1. **8-State Document Lifecycle Engine (`src/types/documentControl.ts`, `src/services/documentControlService.ts`)**:
   - Strict adherence to ISO 45001:2018 Clause 7.5.3.
   - States: `DRAFT` -> `SUBMITTED_FOR_REVIEW` -> `UNDER_REVIEW` -> `REVISION_REQUIRED` -> `APPROVED` -> `PUBLISHED` -> `SUPERSEDED` -> `ARCHIVED`.
   - Transitions strictly guard document editing: only DRAFT or REVISION_REQUIRED can have current revision content updated in-place.
2. **Configurable Multi-Tier Approval Chain**:
   - Sequential chain pipeline: `Prepared By` -> `HSE Manager` -> `Project Manager` -> `Client` -> `Approved`.
   - Stores complete decision record for every step: `decidedByUserId`, `decidedByUserName`, `decidedByUserRole`, `date`, `time`, `decision`, `comments`, and mandatory `rejectionReason`.
3. **CRITICAL Revision Immutability Engine**:
   - Non-negotiable safety requirement: An approved revision must **NEVER** be overwritten.
   - When an approved or published document is edited, `editOrCreateDocumentRevision` automatically spawns the next revision (`Rev 00` -> `Rev 01` -> `Rev 02`) in `DRAFT` status.
   - The predecessor revision remains 100% frozen in WORM storage with original snapshot, SHA-256 hash, and author metadata intact.
   - Upon publication of the new revision, older revisions automatically transition to `SUPERSEDED`.
4. **Document Comparison & Diff Engine (`DocumentComparisonModal.tsx`)**:
   - Side-by-side and unified comparison of two document revisions.
   - Analyzes metadata deltas (status, author, effective date, review schedule) and content field deltas (added, modified, removed).
5. **Threaded Comments & Rejection Feedback**:
   - Integrated threaded comments ledger (`document_comments` IndexedDB store).
   - Rejection at any approval step mandates a clear reason, transitions workflow to `REJECTED`, and document revision to `REVISION_REQUIRED`.
6. **Global Cryptographic Audit Log Subsystem (WORM & Blockchain Chained)**:
   - Full recording of all 11 required enterprise actions:
     `Create`, `Edit`, `Delete`, `Approve`, `Reject`, `Publish`, `Archive`, `Download`, `Print`, `Login`, `Permission changes`.
   - Implements cryptographic block chaining: `prevHash` + `dataHash` -> `blockHash` with pure SHA-256.
   - Audit verification engine (`AuditLogService.verifyAuditChain`) checks sequential block IDs, previous hash linkages, and data integrity with tamper detection.
   - Dedicated subsystem view (`GlobalAuditLogModule.tsx`) accessible via navigation and modal (`AuditLedgerModal.tsx`) with search, filters, and JSON/CSV export.
7. **Automated Verification**:
   - Validated with automated test script `scripts/testPhase9DocumentControl.ts` (64 assertions, 100% pass rate).

## Phase 10: Finalization, Security, RTL/LTR and Quality Assurance — Architectural Decisions
1. **Comprehensive Dual-Language (EN/AR) & RTL/LTR System**:
   - 160 typed translation keys in `src/translations/index.ts` covering Menus, Forms, Tables, Dialogs, Reports, Validation, Notifications, and Documents with exact 1:1 key parity.
   - Dynamic document root binding: `document.documentElement.lang` ('en' | 'ar') and `document.documentElement.dir` ('ltr' | 'rtl').
   - High-legibility Arabic typography paired via Cairo and IBM Plex Sans fonts without database duplication.
2. **Responsive Multi-Viewport Architecture**:
   - Resolved mobile viewport collapse on small devices (< lg) in `App.tsx`, `Header.tsx`, and `Footer.tsx` (using responsive padding `lg:pl-72 pl-0` / `lg:pr-72 pr-0`).
   - Integrated mobile sidebar drawer with hamburger menu toggle button, backdrop blur overlay, and auto-close on path selection.
   - Constrained all modal dialogs with max height boundaries (`max-h-[90vh]`), flex headers/footers, and scrollable body containers.
3. **Security Subsystem & Input/Upload Sanitization (`src/services/securityService.ts`)**:
   - Input sanitization removing malicious XSS vectors (`<script>`, inline `on*` event handlers, `javascript:` protocols).
   - Filename sanitization preventing path traversal (`../`) and illegal filesystem characters.
   - Secure file upload validator enforcing strict MIME type checking, extension whitelisting (`.pdf`, `.docx`, `.xlsx`, `.png`, `.jpg`, `.webp`), and 10MB file size ceiling.
   - Fine-grained RBAC permission evaluation (`SecurityService.hasPermission`).
   - Automated cryptographic WORM audit trail triggers on all security and authentication events (`SecurityService.logSecurityEvent`).
4. **Organization, Roles & Emergency Preparedness Subsystem (`src/components/admin/OrganizationRolesModule.tsx`)**:
   - Enterprise user management covering 6 distinct operational roles: `HSE_DIRECTOR`, `LEAD_AUDITOR`, `SAFETY_ENGINEER`, `SITE_SUPERVISOR`, `INSPECTOR`, `CLIENT_REP`.
   - Interactive RBAC authority matrix detailing permissions across document approvals, ALARP sign-offs, PTW issuance, stop-work orders, and audit exports.
   - Project assets management directory for industrial site facilities.
   - ISO 45001 §8.2 Emergency Response & Evacuation module: 4 designated muster points, emergency contacts directory, and scheduled evacuation drill simulator with WORM audit logging.
5. **Quality Assurance & Verification**:
   - Validated with dedicated automated test suite `scripts/testPhase10FinalizationAndQa.ts` (56 passing assertions, 0 failures) testing translation parity, input sanitization, file upload security, RBAC checks, and cross-module integrity.




