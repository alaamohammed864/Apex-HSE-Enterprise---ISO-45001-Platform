# Comprehensive Database Architecture & Entity Specifications

## 1. Enterprise Hierarchy & Multi-Tenancy

```
+-------------------------------------------------------------+
|                     Organization                            |
| (id, code, name, industry, country, registration_number)    |
+-------------------------------------------------------------+
                               | 1:N
                               v
+-------------------------------------------------------------+
|                       Project                               |
| (id, org_id, code, name, client_name, dates, status)       |
+-------------------------------------------------------------+
           | 1:N                                     | 1:N
           v                                         v
+-----------------------------+           +-----------------------------+
|            Site             |           |         Contractor          |
| (id, project_id, code,      |           | (id, project_id, name,      |
|  name, coordinates, status) |           |  trade, score, contacts)    |
+-----------------------------+           +-----------------------------+
```

### Table: `organizations`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g., `CCC-QATAR`)
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `registration_number`: VARCHAR(100)
- `industry`: VARCHAR(100) NOT NULL
- `country`: VARCHAR(100) NOT NULL
- `logo_url`: TEXT
- `status`: VARCHAR(20) DEFAULT 'ACTIVE'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `projects`
- `id`: UUID (Primary Key)
- `organization_id`: UUID REFERENCES `organizations`(`id`) ON DELETE CASCADE
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g., `RL-EPC-4`)
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `client_name`: VARCHAR(255) NOT NULL
- `project_director_id`: UUID REFERENCES `users`(`id`)
- `start_date`: DATE NOT NULL
- `target_completion_date`: DATE
- `status`: VARCHAR(30) DEFAULT 'ACTIVE'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `sites`
- `id`: UUID (Primary Key)
- `project_id`: UUID REFERENCES `projects`(`id`) ON DELETE CASCADE
- `code`: VARCHAR(50) UNIQUE NOT NULL
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `location`: VARCHAR(255) NOT NULL
- `latitude`: NUMERIC(10,6)
- `longitude`: NUMERIC(10,6)
- `site_manager_id`: UUID REFERENCES `employees`(`id`)
- `status`: VARCHAR(20) DEFAULT 'OPERATIONAL'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `departments`
- `id`: UUID (Primary Key)
- `organization_id`: UUID REFERENCES `organizations`(`id`) ON DELETE CASCADE
- `code`: VARCHAR(50) UNIQUE NOT NULL
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `head_of_department_id`: UUID REFERENCES `employees`(`id`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `employees`
- `id`: UUID (Primary Key)
- `employee_number`: VARCHAR(50) UNIQUE NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `full_name_ar`: VARCHAR(255)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `phone`: VARCHAR(50)
- `department_id`: UUID REFERENCES `departments`(`id`)
- `project_id`: UUID REFERENCES `projects`(`id`)
- `site_id`: UUID REFERENCES `sites`(`id`)
- `job_title`: VARCHAR(150) NOT NULL
- `job_title_ar`: VARCHAR(150)
- `hire_date`: DATE NOT NULL
- `is_safety_critical_role`: BOOLEAN DEFAULT FALSE
- `status`: VARCHAR(30) DEFAULT 'ACTIVE'
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `contractors`
- `id`: UUID (Primary Key)
- `project_id`: UUID REFERENCES `projects`(`id`)
- `vendor_code`: VARCHAR(50) UNIQUE NOT NULL
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `trade_type`: VARCHAR(50) NOT NULL
- `hse_prequalification_score`: NUMERIC(5,2)
- `contact_person`: VARCHAR(150) NOT NULL
- `contact_email`: VARCHAR(255) NOT NULL
- `contact_phone`: VARCHAR(50)
- `status`: VARCHAR(30) DEFAULT 'APPROVED'
- `valid_until`: DATE NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

---

## 2. Authentication, Users & RBAC

### Table: `users`
- `id`: UUID (Primary Key)
- `employee_id`: UUID REFERENCES `employees`(`id`)
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `role_id`: UUID REFERENCES `roles`(`id`)
- `role_type`: VARCHAR(50) NOT NULL
- `primary_operating_unit`: VARCHAR(100) NOT NULL
- `badge_number`: VARCHAR(50) UNIQUE NOT NULL
- `is_active`: BOOLEAN DEFAULT TRUE
- `last_login_at`: TIMESTAMP WITH TIME ZONE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `roles`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g., `HSE_DIRECTOR`, `LEAD_AUDITOR`)
- `name`: VARCHAR(100) NOT NULL
- `name_ar`: VARCHAR(100) NOT NULL
- `description`: TEXT
- `is_system_default`: BOOLEAN DEFAULT FALSE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `permissions`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(100) UNIQUE NOT NULL (e.g., `documents.approve`, `ptw.issue`)
- `module`: VARCHAR(50) NOT NULL
- `description`: TEXT

### Table: `role_permissions`
- `role_id`: UUID REFERENCES `roles`(`id`) ON DELETE CASCADE
- `permission_id`: UUID REFERENCES `permissions`(`id`) ON DELETE CASCADE
- PRIMARY KEY (`role_id`, `permission_id`)

---

## 3. Database-Driven Document Types & Templates (ISO 45001 §7.5)

The system supports **23 standardized, database-driven document types** with configurable numbering (e.g. `HSE-PLN-001-REV00`, `HSE-SOP-001-REV00`):

1. **Mobilisation & Site Verification** (`HSE-MOB`, Clause 8.1.1)
2. **Types of Contracts & HSE Requirements** (`HSE-CNT`, Clause 8.1.4.2)
3. **ISO 45001 Implementation** (`HSE-ISO`, Clause 4.4)
4. **HSE Process** (`HSE-PRC`, Clause 8.1)
5. **Corrective Action Plan** (`HSE-CAP`, Clause 10.2)
6. **HSE Procedures** (`HSE-GEN`, Clause 8.1.2)
7. **Standard Operating Procedures (SOP)** (`HSE-SOP`, Clause 8.1.2)
8. **Traffic Management Plan** (`HSE-TRF`, Clause 8.1.1)
9. **HSE Plan (Master Plan)** (`HSE-PLN`, Clause 7.5.1)
10. **Risk Management Plan** (`HSE-RSK`, Clause 6.1.2)
11. **HSE Training Matrix** (`HSE-TRN`, Clause 7.2)
12. **HSE Manual** (`HSE-MNL`, Clause 7.5)
13. **HSE Policy Statements** (`HSE-POL`, Clause 5.2)
14. **Permit to Work System** (`HSE-PTW`, Clause 8.1.2)
15. **Emergency Response Plan** (`HSE-ERP`, Clause 8.2)
16. **Fire Plan** (`HSE-FIR`, Clause 8.2)
17. **HSE Budget Plan** (`HSE-BGT`, Clause 7.1)
18. **Inspection Checklists** (`HSE-CHK`, Clause 9.1.1)
19. **KPIs & Performance Metrics** (`HSE-KPI`, Clause 9.1)
20. **Roles & Responsibilities** (`HSE-ROL`, Clause 5.3)
21. **Organization Chart** (`HSE-ORG`, Clause 5.3)
22. **Workplace Incident Investigation** (`HSE-INC`, Clause 10.2)
23. **HSE Audit & NCR Tracker** (`HSE-AUD`, Clause 9.2)

### Supported Dynamic Form Field Types (23 Types)
1. `TEXT` (Single line text)
2. `TEXTAREA` / `LONG_TEXT` (Multi-line text area)
3. `RICH_TEXT` (Formatted rich text)
4. `NUMBER` (Numeric values, decimals, ranges)
5. `DATE` (ISO 8601 calendar date picker)
6. `TIME` (Time picker in 24h format HH:MM)
7. `DROPDOWN` (Single selection from dynamic options)
8. `MULTI_SELECT` (Multiple choice tag select badges)
9. `CHECKBOX` (Boolean toggle checkbox)
10. `RADIO` (Single option radio group)
11. `YES_NO` (Conforming / Non-conforming binary compliance button)
12. `TABLE` (Dynamic tabular data grid with configurable columns)
13. `IMAGE` (Photo capture & upload with file preview)
14. `ATTACHMENT` (File attachment supporting PDF, DWG, XLSX, DOCX up to 50MB)
15. `SIGNATURE` (Electronic signature with SHA-256 cryptographic hash)
16. `EMPLOYEE` (Foreign Key link to Employee / Personnel directory)
17. `PROJECT` (Foreign Key link to Project master record)
18. `CONTRACTOR` (Foreign Key link to Prequalified Contractor list)
19. `EQUIPMENT` (Foreign Key link to Plant & Heavy Machinery assets)
20. `RISK` (Foreign Key link to ALARP Risk Register hazard ratings)
21. `KPI` (Foreign Key link to Safety Performance KPIs & Targets)
22. `INCIDENT` (Foreign Key link to Incident Investigation & CAPA records)
23. `TRAINING` (Foreign Key link to Training Competency Matrix & Certifications)

### Supported Field Configuration Properties (12 Properties)
Every field configured inside a template section supports:
1. `id`: Field ID (unique identifier, e.g. `fld_001`, system key)
2. `label` & `label_ar`: Dual-language labels for full RTL/Arabic support
3. `description` & `description_ar`: Help text and statutory guidance
4. `fieldType`: Exactly one of the 23 supported field types
5. `isRequired`: Boolean flag enforcing field completion
6. `defaultValue`: Initial preset value
7. `validation`: Regex pattern, min/max bounds, custom error message
8. `options`: List of `{ value, label, labelAr }` for selection types
9. `order`: Sequence number within the containing section
10. `sectionId`: Foreign Key referencing parent section
11. `visibility`: 'VISIBLE' | 'HIDDEN' | 'CONDITIONAL'
12. `permissions`: Role-based access level ('ALL', 'ADMIN_ONLY', 'HSE_LEAD_ONLY', 'SAFETY_ENGINEER_ONLY')

### Table: `document_templates`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g. `TMPL-HSE-PLN`)
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255)
- `category`: VARCHAR(50) NOT NULL ('PLANS', 'PROCEDURES', 'FORMS', 'RECORDS', 'POLICIES')
- `iso_clause`: VARCHAR(20) NOT NULL (e.g. `7.5.1`, `8.1.2`, `10.2`)
- `schema_json`: JSONB NOT NULL (complete serialized structure of sections & fields)
- `description`: TEXT
- `description_ar`: TEXT
- `version`: VARCHAR(20) NOT NULL (e.g. `1.0`, `2.1`)
- `status`: VARCHAR(20) NOT NULL ('DRAFT', 'PUBLISHED', 'ARCHIVED')
- `is_active`: BOOLEAN DEFAULT TRUE
- `created_by`: VARCHAR(100) NOT NULL
- `updated_by`: VARCHAR(100) NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `document_sections`
- `id`: UUID (Primary Key)
- `template_id`: UUID REFERENCES `document_templates`(`id`) ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255)
- `description`: TEXT
- `description_ar`: TEXT
- `sequence_order`: INT NOT NULL
- `is_mandatory`: BOOLEAN DEFAULT TRUE

### Table: `document_fields`
- `id`: UUID (Primary Key)
- `section_id`: UUID REFERENCES `document_sections`(`id`) ON DELETE CASCADE
- `field_key`: VARCHAR(100) NOT NULL
- `label`: VARCHAR(255) NOT NULL
- `label_ar`: VARCHAR(255)
- `description`: TEXT
- `description_ar`: TEXT
- `field_type`: VARCHAR(50) NOT NULL (one of the 23 types)
- `is_required`: BOOLEAN DEFAULT FALSE
- `default_value`: TEXT
- `validation_rule`: TEXT
- `validation_json`: JSONB
- `options_json`: JSONB (key-value options for dropdown, multi-select, radio)
- `sequence_order`: INT NOT NULL
- `visibility`: VARCHAR(20) DEFAULT 'VISIBLE'
- `permissions`: VARCHAR(50) DEFAULT 'ALL'

### Table: `document_instances`
- `id`: UUID (Primary Key)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g., `HSE-PLN-001-REV00`)
- `template_id`: UUID REFERENCES `document_templates`(`id`)
- `project_id`: UUID REFERENCES `projects`(`id`)
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255) NOT NULL
- `category`: VARCHAR(50) NOT NULL
- `iso_clause`: VARCHAR(20) NOT NULL
- `current_revision_id`: UUID
- `current_revision_number`: VARCHAR(20) NOT NULL
- `status`: VARCHAR(30) NOT NULL ('DRAFT', 'UNDER_REVIEW', 'APPROVED', 'PUBLISHED', 'ARCHIVED')
- `retention_years`: INT DEFAULT 10
- `is_worm_locked`: BOOLEAN DEFAULT FALSE
- `created_by`: UUID REFERENCES `users`(`id`)
- `updated_by`: UUID REFERENCES `users`(`id`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `document_revisions`
- `id`: UUID (Primary Key)
- `document_id`: UUID REFERENCES `document_instances`(`id`) ON DELETE CASCADE
- `revision_number`: VARCHAR(20) NOT NULL (e.g. `Rev 0.1`, `Rev 1.0`, `Rev 1.1`)
- `change_summary`: TEXT NOT NULL
- `change_summary_ar`: TEXT
- `content_data_json`: JSONB NOT NULL
- `sha256_checksum`: VARCHAR(64) NOT NULL
- `status`: VARCHAR(30) NOT NULL
- `author_id`: UUID REFERENCES `users`(`id`)
- `effective_date`: DATE NOT NULL
- `next_review_date`: DATE NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `document_approvals`
- `id`: UUID (Primary Key)
- `revision_id`: UUID REFERENCES `document_revisions`(`id`) ON DELETE CASCADE
- `step_number`: INT NOT NULL
- `stage_name`: VARCHAR(100) NOT NULL
- `approver_id`: UUID REFERENCES `users`(`id`)
- `status`: VARCHAR(30) NOT NULL
- `decision_date`: TIMESTAMP WITH TIME ZONE
- `comments`: TEXT
- `digital_signature_hash`: VARCHAR(128)

---

## 4. Professional Template Specifications (Phase 4)

### 10 Mandatory Standard Templates Registered in `ALL_PROFESSIONAL_TEMPLATES`:
1. **`TMPL-HSE-PLN` — Site Master HSE Plan (Category: `PLANS`, ISO Clause: `7.5.1`)**:
   - 33 Sections:
     1. Document Control (`sec-pln-01-doc-control`)
     2. Project Information (`sec-pln-02-proj-info`)
     3. Scope (`sec-pln-03-scope`)
     4. HSE Policy (`sec-pln-04-hse-policy`)
     5. HSE Objectives (`sec-pln-05-hse-objectives`)
     6. Legal Requirements (`sec-pln-06-legal-reqs`)
     7. Standards (`sec-pln-07-standards`)
     8. Roles & Responsibilities (`sec-pln-08-roles-resp`)
     9. Organization (`sec-pln-09-organization`)
     10. Risk Management (`sec-pln-10-risk-mgmt`)
     11. Hazard Identification (`sec-pln-11-hazard-id`)
     12. Risk Assessment (`sec-pln-12-risk-assessment`)
     13. Permit to Work (`sec-pln-13-ptw`)
     14. Emergency Response (`sec-pln-14-emergency-resp`)
     15. Fire Safety (`sec-pln-15-fire-safety`)
     16. Environmental Management (`sec-pln-16-env-mgmt`)
     17. Traffic Management (`sec-pln-17-traffic-mgmt`)
     18. Lifting (`sec-pln-18-lifting`)
     19. Working at Height (`sec-pln-19-working-at-height`)
     20. Confined Space (`sec-pln-20-confined-space`)
     21. Electrical Safety (`sec-pln-21-electrical-safety`)
     22. Excavation (`sec-pln-22-excavation`)
     23. Chemical Safety (`sec-pln-23-chemical-safety`)
     24. PPE (`sec-pln-24-ppe`)
     25. Training (`sec-pln-25-training`)
     26. Inspections (`sec-pln-26-inspections`)
     27. Audits (`sec-pln-27-audits`)
     28. Incident Reporting (`sec-pln-28-incident-reporting`)
     29. Corrective Actions (`sec-pln-29-corrective-actions`)
     30. KPIs (`sec-pln-30-kpis`)
     31. Communication (`sec-pln-31-communication`)
     32. Document Control & Retention (`sec-pln-32-doc-control-retention`)
     33. Appendices (`sec-pln-33-appendices`)

2. **`TMPL-HSE-SOP` — Standard Operating Procedure (Category: `PROCEDURES`, ISO Clause: `8.1.2`)**:
   - 17 Standard Sections:
     1. Purpose (`sec-sop-01-purpose`)
     2. Scope (`sec-sop-02-scope`)
     3. Definitions (`sec-sop-03-definitions`)
     4. Responsibilities (`sec-sop-04-responsibilities`)
     5. Competency (`sec-sop-05-competency`)
     6. PPE (`sec-sop-06-ppe`)
     7. Equipment (`sec-sop-07-equipment`)
     8. Hazards (`sec-sop-08-hazards`)
     9. Risk Controls (`sec-sop-09-risk-controls`)
     10. Procedure Steps (`sec-sop-10-procedure-steps`)
     11. Emergency Actions (`sec-sop-11-emergency-actions`)
     12. Environmental Requirements (`sec-sop-12-environmental-reqs`)
     13. Records (`sec-sop-13-records`)
     14. References (`sec-sop-14-references`)
     15. Attachments (`sec-sop-15-attachments`)
     16. Revision History (`sec-sop-16-revision-history`)
     17. Approval (`sec-sop-17-approval`)

3. **`TMPL-HSE-PRC` — HSE Operational Procedure (Category: `PROCEDURES`, ISO Clause: `8.1`)**
4. **`TMPL-HSE-MNL` — Corporate HSE Management System Manual (Category: `PLANS`, ISO Clause: `4.4`)**
5. **`TMPL-HSE-POL` — Executive HSE Policy Statement (Category: `POLICIES`, ISO Clause: `5.2`)**
6. **`TMPL-HSE-TRF` — Site Traffic Management & Logistics Plan (Category: `PLANS`, ISO Clause: `8.1`)**
7. **`TMPL-HSE-ERP` — Site Emergency Response Plan (ERP) (Category: `PLANS`, ISO Clause: `8.2`)**
8. **`TMPL-HSE-FIR` — Site Fire Prevention & Fire Safety Master Plan (Category: `PLANS`, ISO Clause: `8.2`)**
9. **`TMPL-HSE-MOB` — Contractor Mobilisation & Site Verification Dossier (Category: `FORMS`, ISO Clause: `8.1.4`)**
10. **`TMPL-HSE-CNT` — Contract & HSE Requirements Specification (Category: `POLICIES`, ISO Clause: `8.1.4`)**

---

## 5. Risk Management & ALARP Schema (Phase 5)

### Table: `hazards`
- `id`: VARCHAR(50) (Primary Key, e.g. `HAZ-001`, `HAZ-622`)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g. `HAZ-PHYS-01`, `HAZ-CHEM-03`)
- `category`: VARCHAR(50) NOT NULL ('PHYSICAL', 'CHEMICAL', 'BIOLOGICAL', 'ERGONOMIC', 'PSYCHOSOCIAL', 'ELECTRICAL', 'MECHANICAL', 'ENVIRONMENTAL')
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255)
- `description`: TEXT NOT NULL
- `potential_consequences`: JSONB NOT NULL (Array of string consequence descriptions)
- `standard_reference`: VARCHAR(150) (e.g. `OSHA 1926.501 / ISO 45001 §8.1.2`)
- `status`: VARCHAR(20) DEFAULT 'ACTIVE' ('ACTIVE', 'ARCHIVED')
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `control_measures`
- `id`: VARCHAR(50) (Primary Key, e.g. `CTRL-001`, `CTRL-ENG-01`)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g. `CTRL-ENG-01`, `CTRL-PPE-05`)
- `hierarchy_level`: VARCHAR(30) NOT NULL ('ELIMINATION', 'SUBSTITUTION', 'ENGINEERING', 'ADMINISTRATIVE', 'PPE')
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255)
- `description`: TEXT NOT NULL
- `verification_method`: TEXT NOT NULL
- `typical_effectiveness`: INT NOT NULL (Percentage 0-100%)
- `status`: VARCHAR(20) DEFAULT 'ACTIVE' ('ACTIVE', 'ARCHIVED')
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `risk_assessments`
- `id`: VARCHAR(50) (Primary Key, e.g. `RA-2026-042`)
- `rev`: VARCHAR(20) DEFAULT 'REV-01'
- `activity`: VARCHAR(255) NOT NULL
- `task`: TEXT NOT NULL
- `hazard`: TEXT NOT NULL
- `hazard_id`: VARCHAR(50) REFERENCES `hazards`(`id`)
- `potential_consequence`: TEXT NOT NULL
- `existing_controls`: TEXT NOT NULL
- `likelihood`: INT NOT NULL (1 to 5)
- `severity`: INT NOT NULL (1 to 5)
- `initial_risk_score`: INT NOT NULL (likelihood × severity, 1-25)
- `initial_risk_tier`: VARCHAR(30) NOT NULL ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')
- `additional_controls`: TEXT NOT NULL
- `responsible_person`: VARCHAR(150) NOT NULL
- `target_date`: DATE NOT NULL
- `residual_likelihood`: INT NOT NULL (1 to 5)
- `residual_severity`: INT NOT NULL (1 to 5)
- `residual_risk_score`: INT NOT NULL (residual_likelihood × residual_severity, 1-25)
- `residual_risk_tier`: VARCHAR(30) NOT NULL ('LOW', 'MEDIUM', 'HIGH', 'EXTREME')
- `alarp_justification`: TEXT NOT NULL
- `status`: VARCHAR(30) DEFAULT 'IN_REVIEW' ('DRAFT', 'IN_REVIEW', 'CONTROLLED', 'ACTION_REQUIRED', 'ARCHIVED')
- `hierarchy_of_controls`: JSONB NOT NULL (`{ elimination: boolean, substitution: boolean, engineering: boolean, administrative: boolean, ppe: boolean }`)
- `linked_project_id`: VARCHAR(50) REFERENCES `projects`(`id`)
- `linked_project_name`: VARCHAR(255)
- `linked_document_id`: VARCHAR(50) REFERENCES `document_instances`(`id`)
- `linked_document_code`: VARCHAR(50)
- `linked_sop_id`: VARCHAR(50) REFERENCES `document_instances`(`id`)
- `linked_sop_code`: VARCHAR(50)
- `linked_permit_id`: VARCHAR(50) REFERENCES `permits_to_work`(`id`)
- `linked_permit_number`: VARCHAR(50)
- `linked_incident_id`: VARCHAR(50) REFERENCES `incident_records`(`id`)
- `linked_incident_ref`: VARCHAR(50)
- `linked_audit_id`: VARCHAR(50) REFERENCES `audit_findings`(`id`)
- `linked_audit_ref`: VARCHAR(50)
- `discipline`: VARCHAR(50)
- `discipline_label`: VARCHAR(100)
- `zone`: VARCHAR(100)
- `reviewer_name`: VARCHAR(100)
- `reviewer_role`: VARCHAR(100)
- `signoff_date`: DATE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Config Entity: `risk_matrix_config`
- `id`: VARCHAR(50) ('DEFAULT_5X5_MATRIX')
- `name`: VARCHAR(255)
- `name_ar`: VARCHAR(255)
- `likelihood_levels`: Array of 5 objects (`level`, `code`, `name`, `nameAr`, `description`, `frequency`)
- `severity_levels`: Array of 5 objects (`level`, `code`, `name`, `nameAr`, `description`, `safetyImpact`)
- `risk_tiers`: Array of 4 objects (`id`, `name`, `nameAr`, `minScore`, `maxScore`, `color`, `textColor`, `bgClass`, `borderClass`, `textClass`, `actionRequired`, `actionRequiredAr`)
- `updated_at`: TIMESTAMP WITH TIME ZONE
- `updated_by`: VARCHAR(100)

---

## 6. Phase 6 Operational Schema: Incidents, CAPA, Inspections & Audits

### Table: `incident_records` (ISO 45001 §10.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `INC-2026-042`)
- `incident_number`: VARCHAR(50) UNIQUE NOT NULL
- `date`: DATE NOT NULL (YYYY-MM-DD)
- `time`: VARCHAR(10) (HH:mm)
- `location`: VARCHAR(255) NOT NULL
- `project`: VARCHAR(255) NOT NULL
- `department`: VARCHAR(100) NOT NULL
- `person`: VARCHAR(100) NOT NULL (Involved person / injured)
- `contractor`: VARCHAR(100) NOT NULL
- `activity`: VARCHAR(255) NOT NULL
- `incident_type`: VARCHAR(50) NOT NULL ('NEAR_MISS', 'FIRST_AID', 'MEDICAL_TREATMENT', 'LOST_TIME_INJURY', 'RESTRICTED_WORK', 'ENVIRONMENTAL_SPILL', 'PROPERTY_DAMAGE', 'HIGH_POTENTIAL')
- `description`: TEXT NOT NULL
- `immediate_actions`: TEXT NOT NULL
- `root_cause`: TEXT NOT NULL
- `five_why_analysis`: JSONB (`[{ level: 1..5, question: string, answer: string, isSystemicRootCause: boolean }]`)
- `contributing_factors`: JSONB (`{ humanFactors: string[], equipmentFactors: string[], environmentalFactors: string[], proceduralFactors: string[], organizationalFactors: string[] }`)
- `witnesses`: JSONB (`[{ id, name, role, contractorOrDept, contactNumber, statement, interviewDate, interviewedBy }]`)
- `evidence`: JSONB (`[{ id, title, type: 'PHOTO'|'DOCUMENT'|..., urlOrBase64, description, uploadedAt, capturedBy }]`)
- `photos`: JSONB
- `corrective_actions`: TEXT
- `preventive_actions`: TEXT
- `responsible_person`: VARCHAR(100)
- `due_date`: DATE
- `status`: VARCHAR(30) ('REPORTED', 'UNDER_INVESTIGATION', 'CAPA_PENDING', 'CLOSED')
- `closure`: JSONB (`{ closedDate: string, closedBy: string, closureComments: string, verificationSignature?: string }`)
- `spawned_capa_ids`: JSONB (`string[]`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `corrective_actions` / CAPA (ISO 45001 §10.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `CAPA-2026-019`)
- `finding`: TEXT NOT NULL
- `source`: VARCHAR(50) NOT NULL ('INCIDENT', 'AUDIT', 'INSPECTION', 'HAZARD', 'SAFETY_OBSERVATION')
- `source_reference_id`: VARCHAR(50) (e.g. `INC-2026-042`, `AUD-2026-001`, `INS-2026-088`)
- `source_title`: VARCHAR(255)
- `risk_level`: VARCHAR(20) NOT NULL ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')
- `action_required`: TEXT NOT NULL
- `responsible_person`: VARCHAR(100) NOT NULL
- `department`: VARCHAR(100) NOT NULL
- `target_date`: DATE NOT NULL (Auto-overdue evaluated if past today and status != CLOSED)
- `evidence`: JSONB (`IncidentEvidenceItem[]`)
- `status`: VARCHAR(30) NOT NULL ('OPEN', 'IN PROGRESS', 'OVERDUE', 'PENDING VERIFICATION', 'CLOSED')
- `verification`: JSONB (`{ verifiedBy: string, verificationDate: string, notes: string, isEffective: boolean }`)
- `closure_date`: DATE
- `verified_by`: VARCHAR(100)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `inspection_templates` (12 Standard Disciplines)
- `id`: VARCHAR(50) (Primary Key, e.g. `TMPL-INSP-SCAFFOLD`, `TMPL-INSP-PPE`)
- `title`: VARCHAR(255) NOT NULL
- `discipline`: VARCHAR(50) NOT NULL ('PPE', 'Scaffold', 'Crane', 'Lifting Equipment', 'Fire Equipment', 'Vehicle', 'Excavation', 'Housekeeping', 'Electrical', 'Working at Height', 'Confined Space', 'Emergency Equipment')
- `version`: VARCHAR(20) NOT NULL
- `description`: TEXT
- `items`: JSONB (`[{ id, code, requirement, requirementAr, standardReference, criticalItem }]`)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `inspection_records`
- `id`: VARCHAR(50) (Primary Key, e.g. `INS-2026-101`)
- `template_id`: VARCHAR(50) REFERENCES `inspection_templates`(`id`)
- `template_title`: VARCHAR(255)
- `discipline`: VARCHAR(50)
- `date`: DATE NOT NULL
- `inspector_name`: VARCHAR(100) NOT NULL
- `project`: VARCHAR(255)
- `location`: VARCHAR(255)
- `contractor`: VARCHAR(100)
- `items`: JSONB (`[{ itemId, requirement, status: 'PASS'|'FAIL'|'N/A', comment, photo, correctiveAction, capaIdCreated }]`)
- `overall_result`: VARCHAR(30) ('PASS', 'CONDITIONAL_PASS', 'FAIL')
- `compliance_score_percent`: INTEGER (0-100)
- `notes`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `audit_records` (ISO 45001 §9.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `AUD-2026-001`)
- `audit_number`: VARCHAR(50) UNIQUE NOT NULL
- `audit_plan`: VARCHAR(255) NOT NULL
- `audit_scope`: TEXT NOT NULL
- `audit_criteria`: VARCHAR(255) NOT NULL
- `auditor`: VARCHAR(100) NOT NULL (Lead Auditor)
- `audit_team`: JSONB (`string[]`)
- `auditee`: VARCHAR(100) NOT NULL
- `department`: VARCHAR(100) NOT NULL
- `project`: VARCHAR(255) NOT NULL
- `planned_date`: DATE NOT NULL
- `actual_date`: DATE
- `status`: VARCHAR(30) ('PLANNED', 'IN_PROGRESS', 'REPORT_ISSUED', 'CLOSED')
- `checklist`: JSONB (`[{ id, clause, requirement, criteria, result: 'CONFORMANT'|'NONCONFORMANT'|..., notes }]`)
- `findings`: JSONB (`[{ id, auditId, type: 'NONCONFORMITY'|'OBSERVATION', severity: 'MAJOR_NC'|'MINOR_NC'|'OBSERVATION', clause, findingDescription, evidence, correctiveActionRequired, responsiblePerson, targetDate, capaIdCreated, status }]`)
- `summary_conclusion`: TEXT
- `conformance_rating`: VARCHAR(50) ('FULL_CONFORMANCE', 'SATISFACTORY_WITH_OBSERVATIONS', 'ACTION_REQUIRED', 'CRITICAL_DEFICIENCIES')
- `final_report_generated`: BOOLEAN DEFAULT FALSE
- `final_report_approved_by`: VARCHAR(100)
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

## 7. Phase 7 Operational Schema: Training, KPIs & Permit to Work (e-PTW)

### Table: `training_courses` (ISO 45001 §7.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `CRS-HSE-IND`)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g. `TC-01`)
- `title`: VARCHAR(255) NOT NULL
- `title_ar`: VARCHAR(255)
- `category`: VARCHAR(50) NOT NULL ('MANDATORY', 'HIGH_HAZARD', 'EQUIPMENT', 'EMERGENCY', 'ENVIRONMENTAL')
- `validity_months`: INTEGER NOT NULL (e.g. 12, 24, 36)
- `passing_score_percent`: INTEGER NOT NULL DEFAULT 80
- `description`: TEXT
- `mandatory_before_site_entry`: BOOLEAN DEFAULT FALSE
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `training_records` (ISO 45001 §7.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `TR-2026-001`)
- `employee_id`: VARCHAR(50) NOT NULL
- `employee_name`: VARCHAR(100) NOT NULL
- `employee_badge`: VARCHAR(50) NOT NULL
- `contractor`: VARCHAR(150) NOT NULL
- `department`: VARCHAR(100) NOT NULL
- `trade_role`: VARCHAR(100) NOT NULL
- `course_id`: VARCHAR(50) REFERENCES `training_courses`(id)
- `course_title`: VARCHAR(255) NOT NULL
- `training_date`: DATE
- `expiry_date`: DATE
- `certificate_number`: VARCHAR(100)
- `certificate_url_or_photo`: TEXT
- `trainer`: VARCHAR(100) NOT NULL
- `training_provider`: VARCHAR(150) NOT NULL
- `score_achieved_percent`: INTEGER
- `status`: VARCHAR(30) NOT NULL ('VALID', 'EXPIRING', 'EXPIRED', 'NOT COMPLETED')
- `verified_by`: VARCHAR(100)
- `notes`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `kpi_definitions` (ISO 45001 §9.1)
- `id`: VARCHAR(50) (Primary Key, e.g. `KPI-TRIR`)
- `code`: VARCHAR(50) UNIQUE NOT NULL (e.g. 'TRIR', 'LTIFR', 'NEAR_MISSES')
- `name`: VARCHAR(255) NOT NULL
- `name_ar`: VARCHAR(255)
- `category`: VARCHAR(30) NOT NULL ('LAGGING', 'LEADING')
- `description`: TEXT NOT NULL
- `calculation_formula`: TEXT NOT NULL
- `target_threshold`: DECIMAL(10, 4) NOT NULL
- `unit`: VARCHAR(50) NOT NULL ('rate', 'count', '%', 'hours')
- `is_lower_better`: BOOLEAN NOT NULL

### Table: `kpi_records` (ISO 45001 §9.1)
- `id`: VARCHAR(50) (Primary Key)
- `period_type`: VARCHAR(20) NOT NULL ('MONTHLY', 'QUARTERLY', 'YEARLY')
- `period_key`: VARCHAR(50) NOT NULL (e.g. '2026-01', '2026-Q1', '2026')
- `period_label`: VARCHAR(100) NOT NULL
- `metrics_payload`: JSONB NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `permit_to_work` (ISO 45001 §8.1.2)
- `id`: VARCHAR(50) (Primary Key, e.g. `PTW-2026-042`)
- `permit_number`: VARCHAR(50) UNIQUE NOT NULL
- `permit_type`: VARCHAR(50) NOT NULL ('HOT_WORK', 'COLD_WORK', 'CONFINED_SPACE', 'WORKING_AT_HEIGHT', 'EXCAVATION', 'LIFTING', 'ELECTRICAL_ISOLATION', 'LINE_BREAKING', 'RADIOGRAPHY', 'EQUIPMENT_VEHICLE_ENTRY')
- `work_description`: TEXT NOT NULL
- `location`: VARCHAR(255) NOT NULL
- `contractor`: VARCHAR(150) NOT NULL
- `work_party_count`: INTEGER NOT NULL
- `work_party_lead`: VARCHAR(100) NOT NULL
- `work_party_members`: JSONB (`string[]`)
- `issuer`: VARCHAR(100) NOT NULL
- `receiver`: VARCHAR(100) NOT NULL
- `project_id`: VARCHAR(50) NOT NULL
- `project_name`: VARCHAR(255) NOT NULL
- `linked_risk_assessment_id`: VARCHAR(50) REFERENCES `risk_assessments`(id)
- `linked_risk_assessment_title`: VARCHAR(255)
- `linked_document_ids`: JSONB (`string[]`)
- `linked_document_codes`: JSONB (`string[]`)
- `controls_summary`: TEXT NOT NULL
- `mandatory_ppe`: JSONB (`string[]`)
- `requires_fire_watch`: BOOLEAN DEFAULT FALSE
- `requires_standby_person`: BOOLEAN DEFAULT FALSE
- `requires_isolation`: BOOLEAN DEFAULT FALSE
- `isolations`: JSONB (`[{ id, tagNumber, equipmentDescription, isolationType, lockNumber, appliedBy, verifiedBy }]`)
- `requires_gas_testing`: BOOLEAN DEFAULT FALSE
- `gas_tester_name`: VARCHAR(100)
- `gas_testing_date_time`: TIMESTAMP WITH TIME ZONE
- `gas_readings`: JSONB (`[{ gasName, unit, measuredValue, safeLimitDescription, isAcceptable }]`)
- `gas_test_passed`: BOOLEAN DEFAULT FALSE
- `emergency_arrangements`: TEXT NOT NULL
- `assembly_point`: VARCHAR(100) NOT NULL
- `nearest_fire_station_or_standby`: VARCHAR(150) NOT NULL
- `start_date_time`: TIMESTAMP WITH TIME ZONE NOT NULL
- `expiry_date_time`: TIMESTAMP WITH TIME ZONE NOT NULL
- `status`: VARCHAR(30) NOT NULL ('DRAFT', 'ISSUED', 'ACTIVE', 'SUSPENDED', 'CLOSED', 'CANCELLED', 'EXPIRED')
- `approvals`: JSONB (`{ issuingAuthoritySigned, issuingAuthorityName, issuingSignedAt, performingAuthoritySigned, performingAuthorityName, performingSignedAt, safetyOfficerSigned, safetyOfficerName, safetySignedAt }`)
- `closure_details`: JSONB (`{ closedAt, closedBy, worksiteRestoredClean, isolationsRemoved, comments }`)
- `suspension_reason`: TEXT
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

---

## 9. Security, RBAC & Emergency Preparedness (Phase 10)

### Table: `system_users`
- `id`: VARCHAR(50) PRIMARY KEY (e.g. `usr-001`)
- `name`: VARCHAR(150) NOT NULL
- `name_ar`: VARCHAR(150) NOT NULL
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `role`: VARCHAR(30) NOT NULL ('HSE_DIRECTOR', 'LEAD_AUDITOR', 'SAFETY_ENGINEER', 'SITE_SUPERVISOR', 'INSPECTOR', 'CLIENT_REP')
- `role_title_en`: VARCHAR(150) NOT NULL
- `role_title_ar`: VARCHAR(150) NOT NULL
- `badge_number`: VARCHAR(50) UNIQUE NOT NULL
- `operating_unit`: VARCHAR(150) NOT NULL
- `permissions`: JSONB (`string[]`)
- `status`: VARCHAR(20) DEFAULT 'ACTIVE' ('ACTIVE', 'SUSPENDED')
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `emergency_muster_points`
- `id`: VARCHAR(50) PRIMARY KEY (e.g. `MP-01`)
- `name_en`: VARCHAR(150) NOT NULL
- `name_ar`: VARCHAR(150) NOT NULL
- `zone`: VARCHAR(150) NOT NULL
- `capacity`: INTEGER NOT NULL
- `warden`: VARCHAR(100) NOT NULL
- `warden_radio`: VARCHAR(100) NOT NULL
- `status`: VARCHAR(30) DEFAULT 'CLEAR' ('CLEAR', 'ACTIVE_MUSTERING', 'EVACUATING')
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()
- `updated_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()

### Table: `emergency_drill_records`
- `id`: VARCHAR(50) PRIMARY KEY (e.g. `DRILL-2026-03`)
- `drill_type`: VARCHAR(50) NOT NULL ('EVACUATION', 'FIRE', 'GAS_LEAK', 'CONFINED_SPACE_RESCUE')
- `site_id`: VARCHAR(50) NOT NULL
- `evacuation_time_seconds`: INTEGER NOT NULL
- `personnel_accounted_for`: INTEGER NOT NULL
- `total_headcount`: INTEGER NOT NULL
- `lead_observer`: VARCHAR(100) NOT NULL
- `deficiencies_noted`: TEXT
- `iso_conformance_rating`: VARCHAR(20) NOT NULL
- `created_at`: TIMESTAMP WITH TIME ZONE DEFAULT NOW()


