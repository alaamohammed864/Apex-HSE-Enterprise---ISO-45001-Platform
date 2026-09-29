# Apex HSE Enterprise — ISO 45001 Management Platform

## Overview
Apex HSE Enterprise is a production-grade Occupational Health & Safety Management System designed to meet **ISO 45001:2018**, **OSHA 1926/1910**, and **ALARP** (As Low As Reasonably Practicable) operational guidelines.

It combines executive telemetry, operational risk registries, electronic Permit to Work (e-PTW) interlocks, dynamic form templating, and controlled document versioning with tamper-evident audit trails.

## Features
- **Executive Safety Command Center**: Live lagging/leading safety KPIs (TRIFR, LTIR, Man-hours without LTI, Active Permits, Open ALARP actions).
- **5x5 ALARP Risk Matrix**: Real-time likelihood vs. severity scoring, hierarchy of controls mitigation, and dynamic residual risk tracking.
- **Controlled Document Management (ISO 45001 §7.5)**: Document lifecycle, revision numbering (`Rev 0.1` -> `Rev 1.0`), review/approval workflows, electronic signatures, and bilingual rendering.
- **Dynamic Form Builder**: Design digital HSE inspections, incident reports, and safety audits with JSON Schema validation and conditional logic.
- **Live PTW Board**: Tracks hot work, confined space, and working at height permits with atmospheric gas sensors and Scafftag validations.
- **Bilingual Interface**: Seamless instant toggling between English (LTR) and Technical Arabic (RTL).
- **Cryptographic Audit Ledger**: Immutable WORM (Write Once, Read Many) log with hash chaining.

## Architecture
- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons, Motion.
- **Data Persistence**: IndexedDB offline-first local database + Express REST API backend architecture ready for PostgreSQL.
- **Security & RBAC**: Granular permissions per role (HSE Director, Lead Auditor, Safety Engineer, Site Supervisor).

## Setup & Running
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000`.
