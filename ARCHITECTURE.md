# System Architecture — Apex HSE Enterprise

## High-Level Architecture Diagram

```
+---------------------------------------------------------------------------------------+
|                                    PRESENTATION LAYER                                 |
|  - Responsive Application Shell (Header, Sidebar, Content Viewport, Footer)           |
|  - Language Switcher (EN LTR / AR RTL) with Cairo & IBM Plex Sans                     |
|  - Theme Switcher (Clean Daylight vs Industrial Night Vision)                         |
|  - User Profile & RBAC Switcher Modal                                                 |
|  - Command Dashboard & Live Telemetry KPIs                                            |
|  - Dynamic HSE Template Builder (Drag/Reordering, 23 Field Types, Live Preview)       |
|  - Living Controlled Document Editor (Full Dynamic Persistence, Zero Image Flattening) |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                    APPLICATION STATE                                  |
|  - AppContext (Language, Theme, Active Nav, Toast, Notifications)                     |
|  - AuthContext (Current User, Active Role, RBAC Permission Matrix)                     |
|  - ExportService (ISO 45001 Dossier PDF Generation & CSV Exports)                    |
|  - TemplateManagementService (Template Lifecycle, Cloning, Dynamic Document Creation) |
+---------------------------------------------------------------------------------------+
                                           |
                                           v
+---------------------------------------------------------------------------------------+
|                                  DATA & DOMAIN SERVICES                               |
|  - Database Schema (Organizations, Projects, Sites, Employees, Contractors, etc.)      |
|  - IndexedDB Persistence (ApexHseEnterpriseDB v2, 39 Normalized Stores + Memory Mode)  |
|  - Seed Data Loader (Real-world industrial mega-project initial entities)              |
|  - Cryptographic WORM Audit Trail Service (SHA-256 block hashing)                     |
+---------------------------------------------------------------------------------------+
```

## Modular Layers

### 1. Presentation & Shell Architecture
- **Bi-Directional Support (RTL/LTR)**: The shell dynamically binds `dir="rtl"` or `dir="ltr"` and `lang="ar"` or `lang="en"`, flipping layout orientation, margins, and typography smoothly.
- **Theme Switching**: Seamlessly toggles daylight and dark high-contrast industrial night-vision styling.
- **Role-Based Access (RBAC)**: All sensitive actions (e.g. template archiving, document approvals, emergency stop-work orders, permit issuance) pass through `can(permission)`.

### 2. Relational & Offline Data Architecture
- **Normalized Data Models (`src/types/database.ts`)**: 39 distinct enterprise tables with primary keys, foreign key references, created/updated timestamps, and status fields.
- **IndexedDB Multi-Store Repository (`src/services/db.ts`)**: Local storage engine caching all organizations, projects, sites, documents, templates, risks, and permits to support continuous offline field safety execution on remote offshore platforms or desert facilities with seamless fallback.
- **Seeding Service (`src/data/seedDatabase.ts`)**: Seeds the system with active LNG projects, sites, ISO 45001 roles, and emergency response teams.

### 3. Dynamic HSE Document Template Builder Subsystem (Phase 3)
- **`src/types/formFieldConfig.ts`**: Complete definitions for 23 field types across standard inputs, selection lists, media, and foreign-key domain selectors.
- **`src/components/formBuilder/DynamicFormBuilder.tsx`**: Dynamic Template Builder with list, search, category filter, ISO clause tagging, section reordering, field property configuration, and live interactive document preview.
- **`src/components/formBuilder/FieldEditorModal.tsx`**: Modal for configuring all 12 properties: ID, Label EN/AR, Description EN/AR, Field Type, Required flag, Default Value, Validation (min/max/regex/error alert), Options builder, Order, Section binding, Visibility, and Permissions.
- **`src/components/formBuilder/CreateDocumentFromTemplateModal.tsx`**: Instantiates living, fully editable controlled documents directly from dynamic templates.
- **`src/components/documents/DynamicDocumentEditorModal.tsx`**: Allows non-destructive editing of living document field values and revision metadata.
- **`src/services/templateService.ts`**: Persistent template engine orchestrating CRUD, deep cloning (`duplicateTemplate`), WORM archiving, and non-destructive version updates.

### 4. Document Control & Immutable Audit Trail (Phase 9)
- **`src/services/documentControlService.ts`**: Implements 8-state document lifecycle, sequential 4-tier approval chains, and strict revision immutability (spawning Rev 00 -> Rev 01 -> Rev 02).
- **`src/services/auditLogService.ts`**: Pure SHA-256 blockchain-style cryptographic WORM ledger recording all 11 enterprise action types with independent tamper verification.
- **`src/components/documents/ApprovalWorkflowModal.tsx` & `DocumentComparisonModal.tsx`**: Visual multi-tier sign-off and side-by-side revision diff comparison.

### 5. Enterprise Security, Localization & Responsive Architecture (Phase 10)
- **`src/services/securityService.ts`**: OWASP-compliant input sanitization, directory traversal protection (`../`), MIME type and extension validation, and automatic security audit event dispatch.
- **`src/translations/index.ts`**: 160 standardized translation keys ensuring 100% bilingual parity for English (LTR) and Arabic (RTL) without database duplication.
- **`src/components/admin/OrganizationRolesModule.tsx`**: Enterprise administration, RBAC authority matrix across 6 roles, user directory, project assets, and ISO 45001 §8.2 emergency evacuation plans & muster points.
- **Responsive Layout (`App.tsx`, `Header.tsx`, `Sidebar.tsx`, `Footer.tsx`)**: Fluid support for mobile, tablet, laptop, and desktop viewports with responsive padding, slide-out sidebar drawer, and bounded dialogs.

### 6. Vercel Production Deployment Architecture & Attribution
- **Vercel SPA Routing Configuration (`vercel.json`)**:
  - Implements SPA wildcard rewrites routing all dynamic paths to `/index.html` preventing 404 errors on direct navigation or page refresh.
  - Configures immutable caching policy (`max-age=31536000, immutable`) for production static assets (`/assets/*`).
  - Sets standard HTTP security response headers (`nosniff`, `DENY` frame embedding, XSS protection, and strict referrer policy).
- **Engineering Attribution**:
  - **Lead Developer**: **AENG ALAA MOHAMMED**
  - Developer credit integrated into persistent application shell footer (`Footer.tsx`) and executive dashboard (`CommandDashboard.tsx`).


