# Next Concrete Development Tasks

## Completed Phases
- **Phase 1**: Database & Core Architecture (39 Tables, Multi-Store IndexedDB, RBAC).
- **Phase 2**: Document Management System (23 Document Types, Document Numbering, Revision Lifecycle, WORM Locking).
- **Phase 3**: Dynamic HSE Document Template Builder (23 Field Types, 12 Field Properties, Sections, Live Preview, Living Document Generation).
- **Phase 4**: HSE Plan, Procedures, and SOP Modules (10 Standard Professional Templates, 33-Section HSE Plan, 17-Section SOP, Full Dynamic Configurability & Persistence).

## Phase 5: Operational Safety Modules (HIRA / ALARP Risk Engine & Incident CAPA)
1. **Hazard Identification & 5x5 ALARP Risk Engine**:
   - Persist hazards and barrier controls to IndexedDB stores (`hazards`, `control_measures`, `risk_assessments`).
   - Dynamic real-time calculation of Initial Risk vs Residual Risk based on Hierarchy of Controls (Elimination, Substitution, Engineering, Administrative, PPE).
   - ALARP justification sign-off workflow with electronic signature verification and ISO 45001 Clause 6.1.2 audit trail.
2. **Workplace Incident Investigation & 5-Why Root Cause**:
   - Standardized incident reporting and 5-Why causal tree investigation workflows.
   - Corrective & Preventive Action (CAPA) tracking with due dates, assignees, and close-out sign-offs (Clause 10.2).
3. **Electronic Permit to Work (e-PTW) System**:
   - High-hazard work permits (Hot Work, Confined Space, Working at Height, LOTO).
   - Atmospheric gas testing interlocks and isolation certificates.

