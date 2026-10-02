# Apex HSE Enterprise — ISO 45001 Management Platform

## Overview
Apex HSE Enterprise is a production-grade Occupational Health & Safety Management System designed to meet **ISO 45001:2018**, **OSHA 1926/1910**, and **ALARP** (As Low As Reasonably Practicable) operational guidelines.

It combines executive telemetry, operational risk registries, electronic Permit to Work (e-PTW) interlocks, dynamic form templating, and controlled document versioning with tamper-evident audit trails.

## Features
- **Executive Safety Command Center**: Live lagging/leading safety KPIs (TRIR, LTIFR, Man-hours without LTI, Active Permits, Open ALARP actions).
- **5x5 ALARP Risk Matrix**: Real-time likelihood vs. severity scoring, hierarchy of controls mitigation, and dynamic residual risk tracking.
- **Controlled Document Management (ISO 45001 §7.5)**: 8-state document lifecycle, configurable multi-tier approval chains, and strict revision immutability (Rev 00 -> Rev 01 -> Rev 02).
- **Dynamic Form Builder**: Design digital HSE inspections, incident reports, and safety audits with 23 specialized field types and live preview.
- **Incidents & 5-Why Investigation**: Root cause analysis, multi-factor contributing analysis, witness statements, and automated CAPA generation.
- **Live PTW Board**: Tracks hot work, confined space, and working at height permits with atmospheric gas testing interlocks and LOTO isolation.
- **Corporate Reporting Center**: 11 standardized reports with true text-based vector PDF generation and CSV exports.
- **Organization & RBAC Governance**: Role-based access control across 6 roles, user directory, project assets, and ISO 45001 §8.2 emergency evacuation plans & muster stations.
- **Full-Spectrum Responsive Design**: Adaptive layout for Desktop, Laptop, Tablet, and Mobile with slide-out navigation drawer.
- **Bilingual Interface & RTL/LTR**: Seamless instant toggling between English (LTR) and Technical Arabic (RTL) with 160 translation keys and zero database duplication.
- **Cryptographic Audit Ledger**: Immutable WORM (Write Once, Read Many) log with SHA-256 hash chaining and tamper detection.

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

## Production Build & Vercel Deployment
To build the application for production deployment on Vercel:
```bash
npm run build
```
The project includes a production-ready `/vercel.json` file with SPA route rewrites (`/(.*)` -> `/index.html`), security response headers, and asset caching rules (`Cache-Control: public, max-age=31536000, immutable`).

## Engineering & Development
- **Lead Developer**: **AENG ALAA MOHAMMED**
- **Architecture**: Enterprise ISO 45001:2018 Management System

