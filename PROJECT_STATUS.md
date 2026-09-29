# Project Status — HSE Management System

## Phase 1 — Database & Core Architecture: COMPLETE
- [x] Complete database schema (39 tables) in `src/types/database.ts` and `DATABASE_SCHEMA.md`.
- [x] IndexedDB v2 multi-store local storage engine in `src/services/db.ts` with in-memory fallback.
- [x] Application Shell with Sidebar, Header, Language switch (EN/AR), Theme switch (Day/Night), and User/RBAC profile modal.

## Phase 2 — HSE Document Management System: COMPLETE
- [x] **23 Database-Driven Document Types** defined in `src/services/documentService.ts`:
  1. Mobilisation & Site Verification (`HSE-MOB`)
  2. Types of Contracts & HSE Requirements (`HSE-CNT`)
  3. ISO 45001 Implementation (`HSE-ISO`)
  4. HSE Process (`HSE-PRC`)
  5. Corrective Action Plan (`HSE-CAP`)
  6. HSE Procedures (`HSE-GEN`)
  7. SOP (`HSE-SOP`)
  8. Traffic Management Plan (`HSE-TRF`)
  9. HSE Plan (`HSE-PLN`)
  10. Risk Management Plan (`HSE-RSK`)
  11. HSE Training Matrix (`HSE-TRN`)
  12. HSE Manual (`HSE-MNL`)
  13. HSE Policy (`HSE-POL`)
  14. Permit to Work System (`HSE-PTW`)
  15. Emergency Response Plan (`HSE-ERP`)
  16. Fire Plan (`HSE-FIR`)
  17. HSE Budget Plan (`HSE-BGT`)
  18. Inspection Checklists (`HSE-CHK`)
  19. KPIs (`HSE-KPI`)
  20. Roles & Responsibilities (`HSE-ROL`)
  21. Organization Chart (`HSE-ORG`)
  22. Workplace Incident Investigation (`HSE-INC`)
  23. HSE Audit (`HSE-AUD`)
- [x] **Configurable Document Numbering**: Formats compliant with `HSE-[TYPE]-[SEQ]-[REV]` (e.g. `HSE-PLN-001-REV00`).
- [x] **Full Document CRUD Operations**: Create, Edit, Duplicate, Archive, View & Print dossiers.
- [x] **Search, Filter & Sorting**: Multi-column sorting with search across titles, codes, and custodians.

## Phase 3 — Dynamic HSE Document Template Builder: COMPLETE
- [x] **Administrator Template Operations**:
  - **Create Template**: Modal / inline creator with Code, Title EN/AR, Category, ISO clause, and Description.
  - **Edit Template**: Visual section & field builder with live preview toggle.
  - **Duplicate Template**: Deep clone with `-COPY` suffix and fresh section/field IDs.
  - **Archive Template**: Transition to read-only `ARCHIVED` status.
- [x] **Section Management**:
  - Create sections with bilingual titles and descriptions.
  - Reorder sections with Move Up / Move Down buttons and drag handles.
  - Duplicate section and Delete section with confirmation.
- [x] **Support for All 23 Field Types**:
  1. `TEXT` (Single line text)
  2. `TEXTAREA` / `LONG_TEXT` (Multi-line text area)
  3. `RICH_TEXT` (Formatted rich text)
  4. `NUMBER` (Numeric values and bounds)
  5. `DATE` (ISO 8601 calendar date picker)
  6. `TIME` (Time picker)
  7. `DROPDOWN` (Single selection dropdown)
  8. `MULTI_SELECT` (Multiple choice tag select badges)
  9. `CHECKBOX` (Boolean checkbox)
  10. `RADIO` (Single option radio group)
  11. `YES_NO` (Conforming / Non-conforming binary toggle)
  12. `TABLE` (Dynamic tabular data grid)
  13. `IMAGE` (Photo capture & upload with preview)
  14. `ATTACHMENT` (File attachment supporting PDF, DWG, XLSX, DOCX)
  15. `SIGNATURE` (Electronic signature with SHA-256 cryptographic hash)
  16. `EMPLOYEE` (Employee / Personnel directory selector)
  17. `PROJECT` (Project asset selector)
  18. `CONTRACTOR` (Contractor / Vendor selector)
  19. `EQUIPMENT` (Plant & Heavy Machinery assets selector)
  20. `RISK` (ALARP Risk Register hazard ratings selector)
  21. `KPI` (Safety Performance KPIs & Targets selector)
  22. `INCIDENT` (Incident Investigation & CAPA records selector)
  23. `TRAINING` (Training Competency Matrix & Certifications selector)
- [x] **12 Supported Field Configuration Properties**:
  - Field ID, Label (EN/AR), Description (EN/AR), Type, Required, Default value, Validation (min/max/regex/error message), Options builder, Order, Section binding, Visibility, and Permissions.
- [x] **Template Live Preview**: Real-time rendering of all sections and 23 field types in production view, with dual language support (EN / AR).
- [x] **Living Document Generation & Editing**:
  - Create living controlled document from template (`CreateDocumentFromTemplateModal.tsx`).
  - Edit living document content without converting into an image (`DynamicDocumentEditorModal.tsx`).
  - Full persistence to IndexedDB `document_instances` and `document_revisions`.
- [x] **Automated Verification**: End-to-end test script `scripts/testTemplateBuilder.ts` executed with 100% pass rate.
- [x] **Project Control Files Synchronized**: `DATABASE_SCHEMA.md`, `ARCHITECTURE.md`, `AI_MEMORY.md`, `PROJECT_STATUS.md`, `NEXT_TASK.md`, `CHANGELOG.md`.

## Phase 4 — HSE Plan, Procedures and SOP Modules: COMPLETE
- [x] **Reused Existing Dynamic Template Builder & Document Engine**:
  - Leveraged `TemplateManagementService`, `DynamicFieldRenderer`, `DynamicFormBuilder`, and `DynamicDocumentEditorModal` without rebuilding or hardcoding UI components.
  - All documents remain live, fully structured, and editable (no image conversion).
- [x] **10 Professional HSE Templates Implemented & Persisted**:
  1. **Site Master HSE Plan (`TMPL-HSE-PLN`)**:
     - Comprehensive 33-section structure covering the complete lifecycle:
       1. Document Control
       2. Project Information
       3. Scope
       4. HSE Policy
       5. HSE Objectives
       6. Legal Requirements
       7. Standards
       8. Roles & Responsibilities
       9. Organization
       10. Risk Management
       11. Hazard Identification
       12. Risk Assessment
       13. Permit to Work
       14. Emergency Response
       15. Fire Safety
       16. Environmental Management
       17. Traffic Management
       18. Lifting
       19. Working at Height
       20. Confined Space
       21. Electrical Safety
       22. Excavation
       23. Chemical Safety
       24. PPE
       25. Training
       26. Inspections
       27. Audits
       28. Incident Reporting
       29. Corrective Actions
       30. KPIs
       31. Communication
       32. Document Control & Retention
       33. Appendices & Certified Annexes
  2. **Standard Operating Procedure (SOP) (`TMPL-HSE-SOP`)**:
     - Strict 17-section standard operating sequence:
       1. Purpose
       2. Scope
       3. Definitions
       4. Responsibilities
       5. Competency
       6. PPE
       7. Equipment
       8. Hazards
       9. Risk Controls
       10. Procedure Steps
       11. Emergency Actions
       12. Environmental Requirements
       13. Records
       14. References
       15. Attachments
       16. Revision History
       17. Approval & Cryptographic Signature
  3. **HSE Operational Procedure (`TMPL-HSE-PRC`)**: Operational controls, permit hierarchy, and execution supervision.
  4. **Corporate HSE Management System Manual (`TMPL-HSE-MNL`)**: High-level governance, ISO 45001 context, and plan-do-check-act model.
  5. **Executive HSE & Sustainability Policy (`TMPL-HSE-POL`)**: Corporate commitments, worker rights to stop unsafe work, and executive endorsements.
  6. **Site Logistics & Traffic Management Plan (`TMPL-HSE-TRF`)**: Site routing, vehicle-pedestrian segregation, speed limits, and traffic marshals.
  7. **Site Emergency Response Plan (ERP) (`TMPL-HSE-ERP`)**: Emergency scenarios, incident command chain, evacuation muster zones, and drill schedules.
  8. **Site Fire Prevention & Fire Safety Master Plan (`TMPL-HSE-FIR`)**: Fire risk profiling, active/passive fire systems, hot work permits, and inspections.
  9. **Contractor Mobilisation & Site Verification Dossier (`TMPL-HSE-MOB`)**: Readiness gate audits, machinery certifications, and permit to mobilize.
  10. **Contract & HSE Requirements Specification (`TMPL-HSE-CNT`)**: Contractor covenants, mandatory staffing ratios, penalty matrix, and insurance mandates.
- [x] **Configurable & Editable Sections & Fields**:
  - Full support for adding, removing, modifying, and reordering sections and fields within each template.
- [x] **Automated Verification**:
  - `scripts/testPhase4Templates.ts` executed with 100% pass rate:
    - 10 templates verified.
    - HSE Plan 33 sections validated.
    - SOP 17 sections validated.
    - Dynamic section configuration tested and persisted.
    - Document creation from HSE Plan and SOP verified.
    - In-place editing and multi-field value updates verified.
    - 100% data persistence verified across reload cycles.

## Phase 5 — HSE Risk Management & 5x5 ALARP Engine: COMPLETE
- [x] **Hazard Register Module (`src/components/risk/HazardRegisterView.tsx`)**:
  - Pre-seeded catalogue across 8 physical and chemical categories.
  - Complete CRUD: Create, Edit, View, Duplicate, Archive.
  - Search, Category Filter, and standard compliance references (OSHA 1926 / ISO 45001 §6.1.2).
- [x] **Control Measures & Hierarchy of Controls (`src/components/risk/ControlMeasuresView.tsx`)**:
  - Strict alignment with 5 levels: Elimination, Substitution, Engineering, Administrative, PPE.
  - Verification methods, effectiveness percentages (10-100%), and active status.
  - Create, Edit, Archive, and filter by hierarchy level.
- [x] **Complete Risk Assessment Records (`src/types/risk.ts`, `src/services/riskService.ts`)**:
  - All 16 mandatory fields implemented and validated:
    1. Activity
    2. Task
    3. Hazard
    4. Potential Consequence
    5. Existing Controls
    6. Likelihood (1-5)
    7. Severity (1-5)
    8. Initial Risk (Likelihood × Severity, badge, tier)
    9. Additional Controls (Hierarchy checklist + description)
    10. Responsible Person
    11. Target Date
    12. Residual Likelihood (1-5)
    13. Residual Severity (1-5)
    14. Residual Risk (Residual Likelihood × Residual Severity, tier, % reduction)
    15. ALARP Justification
    16. Status (DRAFT, IN_REVIEW, CONTROLLED, ACTION_REQUIRED, ARCHIVED)
- [x] **Configurable 5x5 Risk Matrix (`src/components/risk/RiskMatrixInteractiveGrid.tsx`, `MatrixConfigModal.tsx`)**:
  - Real-time score calculation (Likelihood × Severity = 1 to 25).
  - Admin modal allowing full configuration of:
    - Likelihood levels (names EN/AR, frequency description for 1 to 5)
    - Severity levels (names EN/AR, safety impact description for 1 to 5)
    - Risk levels & thresholds (min/max bounds for Low, Medium, High, Extreme)
    - Risk colors (custom hex codes and color pickers)
  - Interactive grid filtering: clicking any matrix cell filters the table by exact probability × impact coordinates.
  - Toggle between Initial Inherent Risk view and Residual ALARP Risk view with live count badges.
- [x] **Cross-Module Linkage Engine (`src/services/linkableEntitiesService.ts`)**:
  - Direct relational links from Risk Assessments to:
    - Projects
    - Controlled Documents
    - SOPs
    - Permits to Work (e-PTW)
    - Workplace Incidents
    - HSE Audits & NCR Findings
- [x] **Export & Print Capabilities (`src/services/exportService.ts`, `src/components/risk/RiskDossierPrintModal.tsx`)**:
  - Export Complete Risk Register to CSV with all fields and links.
  - Export structured JSON for external data integration.
  - In-app ISO 45001 Printable Dossier with title block, risk matrix evaluation table, and signature blocks.
- [x] **Database Persistence**:
  - All hazards, control measures, risk assessments, and matrix configs persisted in IndexedDB multi-store database.
- [x] **Automated Verification**:
  - `scripts/testPhase5RiskManagement.ts` executed with 100% pass rate.

---

## Phase 6: Incidents, CAPA, Inspections & Audits (COMPLETED)
- [x] **Module A: Incident Management (`src/components/incidents/IncidentManagementModule.tsx`, `src/services/safetyOpsService.ts`)**:
  - Complete incident reporting and investigation dossier (Incident Number, Date, Time, Location, Project, Department, Person, Contractor, Activity, Incident Type, Description, Immediate Actions).
  - Interactive 5-Why Root Cause Analysis tool with 5-level causality tree and systemic defect identification.
  - Multi-causal Contributing Factors analysis (Human, Equipment, Environmental, Procedural, Organizational).
  - Witness testimonies management (Name, Role, Contractor, Contact, Statement, Interview Date, Interviewer).
  - Evidence and photo upload gallery with captions, timestamps, and upload metadata.
  - Corrective & Preventive Action definition with direct 1-click dispatch to CAPA.
  - Formal Incident Closure workflow with sign-off date, author, and verification comments.
- [x] **Module B: Corrective Action / CAPA (`src/components/capa/CapaManagementModule.tsx`)**:
  - Central CAPA register (Finding, Source, Risk Level, Action Required, Responsible Person, Department, Target Date, Evidence, Status, Verification, Closure Date, Verified By).
  - Automatic Overdue Detection: actions where `targetDate < today` and status != `CLOSED` are automatically classified as `OVERDUE` with live alerting banner.
  - Verification & Closeout workflow: verification notes, effectiveness confirmation, and closure timestamp.
  - Export CAPA Register to CSV with all fields and audit links.
- [x] **Module C: Dynamic Checklist Builder & Inspections (`src/components/inspections/InspectionsManagementModule.tsx`)**:
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
- [x] **Module D: Audits & Non-Conformances (`src/components/audits/AuditsManagementModule.tsx`)**:
  - Complete Audit Lifecycle: Audit Plan, Audit Scope, Audit Criteria (ISO 45001, OSHA, Site Rules), Lead Auditor & Team, Auditee, Department, Project, Planned Date.
  - Standard Clause Audit Checklist evaluation (Conformant, Nonconformant, Observation, N/A).
  - Findings Registry: Major Nonconformity, Minor Nonconformity, and Observations with evidence notes and corrective action requirements.
  - Audit → CAPA Direct Dispatch: 1-click button on findings automatically creates a linked CAPA record and sets status to `CAPA_DISPATCHED`.
  - Formal ISO 45001 Final Audit Report Generator: executive summary, automatic Conformance Rating calculation, and auditor digital sign-off.
- [x] **Cross-Module Relationship Testing & Verification (`scripts/testPhase6SafetyOps.ts`)**:
  - 55 automated tests executed with 100% pass rate:
    - Incident → CAPA bridge verified.
    - Audit → CAPA bridge verified.
    - Inspection → CAPA bridge verified.
    - Automatic overdue identification verified.
    - All 12 inspection checklist disciplines verified.

---

## Phase 7: Training, KPI & Permit to Work (COMPLETED)
- [x] **Module A: Training Management (`src/components/training/TrainingManagementModule.tsx`, `src/services/phase7Service.ts`)**:
  - Training Courses Catalogue covering 13 standard industrial safety curricula:
    1. HSE Induction
    2. First Aid
    3. Fire Fighting
    4. Working at Height
    5. Confined Space
    6. Lifting & Rigging
    7. Scaffold Safety
    8. PTW
    9. Emergency Response
    10. Defensive Driving
    11. Manual Handling
    12. Chemical Safety
    13. Electrical Safety
  - Employee Training Records Tracking: Employee, Course, Training Date, Expiry Date, Certificate, Trainer, Training Provider, Score, and Status (`VALID`, `EXPIRING`, `EXPIRED`, `NOT COMPLETED`).
  - Interactive Competency Matrix: Worker vs Course grid with color-coded status badges, real-time renewal reminders, and instant digital certificate viewer/download modal.
  - Automated Expiry Tracking & Compliance Score calculation.
- [x] **Module B: Configurable KPI Management & Trend Reports (`src/components/kpis/KpiManagementModule.tsx`)**:
  - 12 Configurable Leading & Lagging HSE Indicators:
    1. TRIR (Total Recordable Incident Rate)
    2. LTIFR (Lost Time Injury Frequency Rate)
    3. Near Misses
    4. Recordable Incidents
    5. Lost Time Injuries
    6. First Aid Cases
    7. Safety Observations
    8. Inspections Completed
    9. Audits Completed
    10. CAPA On-Time Closure Rate
    11. Training Completion Rate
    12. Permit Compliance Rate
  - Multi-Period Analytics: Monthly, Quarterly, and Yearly reporting.
  - Interactive SVG Trend Charts with benchmark target threshold indicator lines, actual vs target comparisons, and executive board reporting export.
- [x] **Module C: Electronic Permit to Work / e-PTW (`src/components/ptw/PtwManagementModule.tsx`)**:
  - 10 High-Hazard Work Permit Disciplines:
    1. Hot Work
    2. Cold Work
    3. Confined Space Entry
    4. Working at Height
    5. Excavation
    6. Lifting
    7. Electrical Isolation
    8. Line Breaking
    9. Radiography
    10. Equipment/Vehicle Entry
  - Complete Operational Permit Dossier Fields:
    - Permit Number
    - Work Description
    - Location
    - Contractor
    - Work Party (Headcount, Lead, Members)
    - Issuer & Receiver
    - Safety Controls & Mandatory PPE
    - Lockout / Tagout (LOTO) Energy Isolation Points (Tag number, equipment, lock number, applied by, verified by)
    - Atmospheric Multi-Gas Testing (O2, LEL, H2S, CO) with acceptance validation
    - Emergency Arrangements (Assembly point, standby, fire station)
    - Start & Expiry Date/Time
    - Multi-Tier Digital Approvals & Signatures (Issuing Authority, Performing Authority, Safety Officer)
    - Lifecycle Statuses: `DRAFT`, `ISSUED`, `ACTIVE`, `SUSPENDED`, `CLOSED`, `CANCELLED`, `EXPIRED`
    - Closeout & normalization protocol (worksite restored clean, isolations removed, final sign-off)
  - Full Relational Connectivity to:
    - Projects
    - Contractors
    - Risk Assessments (from Phase 5)
    - Employees
    - Controlled Documents (SOPs, HSE Plans from Phase 2/4)
- [x] **Verification Testing & Integrity (`scripts/testPhase7PermitsKpiTraining.ts`)**:
  - 60 automated unit and integration tests executed with 100% pass rate:
    - Course catalogue integrity verified.
    - Expiry status calculation verified.
    - All 12 KPIs and formulas verified across Monthly, Quarterly, and Yearly modes.
    - e-PTW creation, cross-module links, gas testing, LOTO isolations, and lifecycle transitions verified.

---

## Phase 8: Dashboard, Reporting & Document Generation (COMPLETED)
- [x] **Real HSE Dashboard Using Database Data (`src/components/dashboard/CommandDashboard.tsx`, `src/services/reportingService.ts`)**:
  - Aggregates live data directly from IndexedDB / database across all modules.
  - Implements all 15 requested dashboard metrics:
    1. **Projects**: Number of active surveillance facilities with locations and coverage.
    2. **Documents**: Total controlled documents (SOPs, Plans, Manuals) in database.
    3. **Pending Approvals**: Documents under review and permits pending authorization.
    4. **Open Actions**: Active corrective actions in progress.
    5. **Overdue Actions**: High-priority alert banner for actions exceeding target due date.
    6. **Incidents**: Total recorded workplace incidents.
    7. **Near Misses**: Proactive near miss safety hazard observations.
    8. **Inspections**: Inspections completed and percentage pass rate.
    9. **Audits**: Formal audits completed and total open findings count.
    10. **Training Compliance**: Overall workforce competency compliance percentage.
    11. **Expired Training**: Expired worker certificates requiring renewal.
    12. **Active PTWs**: Authorized high-hazard permits currently active on site.
    13. **Expired PTWs**: Expired permits requiring closeout normalization.
    14. **Risk Statistics**: Risk register breakdown (Extreme, High, Medium, Low, ALARP).
    15. **KPI Statistics**: TRIR, LTIFR, and overall on-target percentage.
  - **Interactive Charts**:
    - Monthly TRIR & LTIFR Safety Performance Trajectory chart with corporate benchmark line.
    - High-Hazard Work Permits volume breakdown by discipline (Hot Work, Confined Space, Height, Lifting, LOTO).
- [x] **Corporate Reporting Center (`src/components/reports/ReportingCenterModule.tsx`)**:
  - Full catalogue of 11 standardized reports:
    1. *HSE Monthly Report* (`RPT-HSE-MON-2026-03`)
    2. *HSE Weekly Report* (`RPT-HSE-WK-2026-W13`)
    3. *Incident Report* (`RPT-INC-INV-2026-042`)
    4. *Inspection Report* (`RPT-INS-CHK-2026-088`)
    5. *Audit Report* (`RPT-AUD-ISO-2026-012`)
    6. *Training Report* (`RPT-TRN-MAT-2026-004`)
    7. *KPI Report* (`RPT-KPI-EXE-2026-Q1`)
    8. *Corrective Action Report* (`RPT-CAPA-REG-2026-05`)
    9. *Risk Register* (`RPT-RSK-REG-2026-01`)
    10. *PTW Report* (`RPT-PTW-SUM-2026-019`)
    11. *Document Status Report* (`RPT-DOC-CTR-2026-01`)
- [x] **Professional Vector PDF Generation Engine (`src/services/reportingService.ts`)**:
  - Pure text-based vector PDF generation via `jsPDF` and `jspdf-autotable` (no HTML screenshot hacks).
  - Consistent corporate Title Block & Header:
    - Company Logo Emblem (vector drawn)
    - Company Name: "4M ENGINEERING CLOUD — HSE ENTERPRISE"
    - Project Name
    - Document Title
    - Document Number
    - Revision (e.g., Rev 01)
    - Date
    - Prepared By, Reviewed By, Approved By
    - Page Number ("Page X of Y" via dynamic page hooks)
  - Security classification footer ("CONFIDENTIAL & CONTROLLED COPY").
  - Formatted printable dossiers tested for:
    - **HSE Plan**: 33-section executive plan with scope, leadership, emergency response, and approval signatures.
    - **Risk Assessment**: 5x5 ALARP register with initial risk, controls, residual risk, and ALARP justification.
    - **Incident Report**: Investigation dossier with 5-Why root cause tree, contributing factors, witness testimonies, and CAPA links.
    - **Inspection Report**: 12-discipline checklist with Pass/Fail/NA, scoring, and field notes.
    - **Audit Report**: ISO 45001 audit findings, nonconformities (major/minor), and conformance rating.
- [x] **Tabular CSV / Excel Export**:
  - Full CSV export support for all 11 reports with UTF-8 BOM, escaped values, and detailed audit columns.
- [x] **Automated Verification Testing (`scripts/testPhase8ReportingAndPdfs.ts`)**:
  - 45 automated unit and integration tests executed with 100% pass rate:
    - 15 dashboard metrics verification against database.
    - 11 catalogue reports verification.
    - Vector PDF generation tested for HSE Plan, Risk Assessment, Incident Report, Inspection Report, Audit Report, and Monthly Report.
    - Validation of non-empty blobs and `%PDF-` vector magic headers.



