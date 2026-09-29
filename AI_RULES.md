# AI Engineering Rules — HSE Enterprise & Engineering System

1. **Production-First Mindset**: All modules must be backed by concrete data structures, real schema validation, working CRUD operations, and persistent state transitions (via indexedDB/REST/Postgres architecture).
2. **Never Overwrite or Delete Functionality**: Do not downgrade features to static mockups. Preserve existing capabilities (Bilingual EN/AR, ISO 45001 workflows, 5x5 ALARP Risk Matrix, PTW board, Dynamic Form Builder, WORM Ledger).
3. **Bilingual RTL/LTR by Design**: Every UI text, field, and table must respect language direction (`dir="rtl"` vs `dir="ltr"`), using proper technical Arabic (السلامة والصحة المهنية والبيئة) and standard English.
4. **Strict Type Safety**: TypeScript strict mode across all services, repositories, and UI components. No `any` escapes for business-critical entities.
5. **Role-Based Access Control (RBAC)**: Permissions check (`can(user, 'action', 'resource')`) must govern view, create, edit, approve, and sign-off capabilities.
6. **Immutable Audit Trail & Version Control**: Any update to a controlled document, risk assessment, or permit creates a traceable version revision and audit log with timestamp, author, and hash verification.
7. **Modularity & Scalability**: Avoid monolithic components. Decouple business logic into services, repositories, and custom hooks.
