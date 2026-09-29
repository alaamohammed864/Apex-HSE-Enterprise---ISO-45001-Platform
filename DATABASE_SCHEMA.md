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

## 5. Other Operational Entities
(Covering Hazards, Controls, Risk Assessments, Incidents, CAPA, Inspections, Training Matrix, KPIs, e-PTW, Audits, Emergency Plans, HSE Budget, Notifications, and Audit Logs as defined in Phase 1).
