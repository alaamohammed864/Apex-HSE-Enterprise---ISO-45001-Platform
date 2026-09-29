/**
 * Safety Operations Service — Phase 6: Incidents, CAPA, Inspections & Audits
 * Implements full persistence, relationships, 5-Why analysis, automated overdue detection,
 * and cross-module bridges (Incident → CAPA, Audit → CAPA, Inspection → CAPA).
 */

import { indexedDbService } from './db';
import {
  IncidentReportRecord,
  CapaRecord,
  InspectionChecklistTemplate,
  InspectionRecordExecution,
  AuditRecordModel,
  AuditFindingRecord,
  InspectionDiscipline,
} from '../types/safetyOps';

// ==========================================
// SEED CHECKLIST TEMPLATES (12 DISCIPLINES)
// ==========================================

export const DEFAULT_INSPECTION_TEMPLATES: InspectionChecklistTemplate[] = [
  {
    id: 'TMPL-INSP-PPE',
    title: 'Personal Protective Equipment (PPE) Compliance Inspection',
    discipline: 'PPE',
    version: '2.1',
    description: 'Daily and weekly field assessment of mandatory site PPE standards (ISO 45001 §8.1.2 / OSHA 1926.100).',
    createdAt: '2026-01-15T08:00:00Z',
    updatedAt: '2026-03-01T10:00:00Z',
    items: [
      { id: 'PPE-01', code: 'PPE.1', requirement: 'Hard hats compliant with ANSI Z89.1 / EN 397 worn with chinstraps fastened.', standardReference: 'OSHA 1926.100', criticalItem: true },
      { id: 'PPE-02', code: 'PPE.2', requirement: 'High-visibility safety vests (Class 3 reflective) clean and fully zipped.', standardReference: 'EN ISO 20471', criticalItem: false },
      { id: 'PPE-03', code: 'PPE.3', requirement: 'Safety footwear with composite/steel toe cap and puncture-resistant midsole.', standardReference: 'ASTM F2413 / EN ISO 20345', criticalItem: true },
      { id: 'PPE-04', code: 'PPE.4', requirement: 'Eye and face protection (UV-tinted safety glasses / full face shields) free of scratches.', standardReference: 'ANSI Z87.1', criticalItem: false },
      { id: 'PPE-05', code: 'PPE.5', requirement: 'Hearing protection provided and worn in high-noise zones (>85 dBA).', standardReference: 'OSHA 1910.95', criticalItem: false },
      { id: 'PPE-06', code: 'PPE.6', requirement: 'Specialized task gloves (impact-resistant, cut-level 5, or chemical-resistant) worn.', standardReference: 'EN 388', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-SCAFFOLD',
    title: 'Scaffold Daily & Handover Safety Inspection',
    discipline: 'Scaffold',
    version: '3.0',
    description: 'Weekly statutory inspection and post-weather modification inspection for scaffolding structures.',
    createdAt: '2026-01-18T08:00:00Z',
    updatedAt: '2026-03-10T11:00:00Z',
    items: [
      { id: 'SCF-01', code: 'SCF.1', requirement: 'Scafftag issued and clearly visible at all access ladders (Green: Safe, Red: Do Not Use).', standardReference: 'BS EN 12811 / OSHA 1926.451', criticalItem: true },
      { id: 'SCF-02', code: 'SCF.2', requirement: 'Base plates and timber sole pads placed on sound, level, and compacted ground.', standardReference: 'TG20:21', criticalItem: true },
      { id: 'SCF-03', code: 'SCF.3', requirement: 'Double guardrails (top rail 950mm-1150mm, mid rail 470mm) and toe-boards (min 150mm) intact.', standardReference: 'OSHA 1926.451(g)', criticalItem: true },
      { id: 'SCF-04', code: 'SCF.4', requirement: 'Working platforms fully boarded with no gaps >25mm and boards secured with toe-clamps.', standardReference: 'BS EN 12811-1', criticalItem: false },
      { id: 'SCF-05', code: 'SCF.5', requirement: 'Ties, rakers, and facade bracing securely anchored to permanent structure.', standardReference: 'TG20:21', criticalItem: true },
      { id: 'SCF-06', code: 'SCF.6', requirement: 'Ladder access internal to scaffold, securely lashed, and extending 1.05m above landing.', standardReference: 'OSHA 1926.1053', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-CRANE',
    title: 'Mobile & Crawler Crane Pre-Use Safety Inspection',
    discipline: 'Crane',
    version: '1.8',
    description: 'Comprehensive daily inspection for mobile, crawler, and rough-terrain cranes.',
    createdAt: '2026-02-01T08:00:00Z',
    updatedAt: '2026-03-05T09:30:00Z',
    items: [
      { id: 'CRN-01', code: 'CRN.1', requirement: 'Valid 3rd Party Lifting Inspection Certificate & Operator Competency Card displayed in cab.', standardReference: 'ASME B30.5 / LOLER 1998', criticalItem: true },
      { id: 'CRN-02', code: 'CRN.2', requirement: 'Automatic Safe Load Indicator (SLI / LMI) and anti-two-block limit switch fully functional.', standardReference: 'BS 7121', criticalItem: true },
      { id: 'CRN-03', code: 'CRN.3', requirement: 'Outriggers fully extended with certified crane mats on ground bearing capacity test area.', standardReference: 'CIRIA C703', criticalItem: true },
      { id: 'CRN-04', code: 'CRN.4', requirement: 'Wire ropes free of kinks, bird-caging, broken strands, and drum spools smoothly.', standardReference: 'ISO 4309', criticalItem: true },
      { id: 'CRN-05', code: 'CRN.5', requirement: 'Boom angle indicator, cabin fire extinguisher, and swing horn / beacon operational.', standardReference: 'OSHA 1926.1412', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-LIFTING',
    title: 'Lifting Equipment & Rigging Gear Pre-Lift Checklist',
    discipline: 'Lifting Equipment',
    version: '2.0',
    description: 'Slings, shackles, spreader beams, and chain blocks visual inspection.',
    createdAt: '2026-01-20T08:00:00Z',
    updatedAt: '2026-02-15T14:00:00Z',
    items: [
      { id: 'LFT-01', code: 'LFT.1', requirement: 'All slings and wire rope chokers marked with current colored quarterly inspection tag.', standardReference: 'LOLER Reg 9', criticalItem: true },
      { id: 'LFT-02', code: 'LFT.2', requirement: 'Shackles have Safe Working Load (SWL) clearly stamped with safety split pin inserted.', standardReference: 'ASME B30.26', criticalItem: true },
      { id: 'LFT-03', code: 'LFT.3', requirement: 'Webbing slings free of cuts, tears, chemical burns, and UV degradation.', standardReference: 'EN 1492-1', criticalItem: true },
      { id: 'LFT-04', code: 'LFT.4', requirement: 'Crane hook safety catch spring-loaded and closes positively.', standardReference: 'BS EN 1677', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-FIRE',
    title: 'Fire Equipment & Extinguisher Weekly Site Checklist',
    discipline: 'Fire Equipment',
    version: '2.4',
    description: 'Site fire points, dry risers, hydrants, hose reels, and portable fire extinguishers.',
    createdAt: '2026-01-10T08:00:00Z',
    updatedAt: '2026-02-28T16:00:00Z',
    items: [
      { id: 'FIR-01', code: 'FIR.1', requirement: 'Fire extinguishers unobstructed, mounted at correct height (1.0m - 1.5m), and signposted.', standardReference: 'NFPA 10', criticalItem: true },
      { id: 'FIR-02', code: 'FIR.2', requirement: 'Pressure gauge needle in the green zone, tamper seal and safety pin intact.', standardReference: 'BS 5306-3', criticalItem: true },
      { id: 'FIR-03', code: 'FIR.3', requirement: 'Fire blankets and sandbox with scoop clean and ready at hot work stations.', standardReference: 'NFPA 51B', criticalItem: false },
      { id: 'FIR-04', code: 'FIR.4', requirement: 'Fire access lanes and assembly points completely clear of parked vehicles or materials.', standardReference: 'NFPA 241', criticalItem: true },
    ],
  },
  {
    id: 'TMPL-INSP-VEHICLE',
    title: 'Site Vehicle & Heavy Equipment Pre-Start Checklist',
    discipline: 'Vehicle',
    version: '1.5',
    description: 'Dump trucks, telehandlers, excavators, and site logistics vehicles.',
    createdAt: '2026-01-22T08:00:00Z',
    updatedAt: '2026-03-02T09:00:00Z',
    items: [
      { id: 'VEH-01', code: 'VEH.1', requirement: 'Audible reverse alarm and amber flashing strobe beacon working properly.', standardReference: 'OSHA 1926.601', criticalItem: true },
      { id: 'VEH-02', code: 'VEH.2', requirement: 'Braking systems (service brake and emergency parking brake) tested and holding load.', standardReference: 'ISO 3450', criticalItem: true },
      { id: 'VEH-03', code: 'VEH.3', requirement: 'Seatbelts fitted, in good condition, and mandatory for operator and all passengers.', standardReference: 'ISO 6683', criticalItem: true },
      { id: 'VEH-04', code: 'VEH.4', requirement: 'Tires at correct pressure with no severe cuts, bulges, or exposed canvas/cords.', standardReference: 'Fleet Safety SOP-12', criticalItem: false },
      { id: 'VEH-05', code: 'VEH.5', requirement: 'Fluids checked (engine oil, coolant, hydraulic fluid) with no active leaks on ground.', standardReference: 'Environmental Spill Plan', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-EXCAVATION',
    title: 'Excavation & Trenching Daily Competent Person Inspection',
    discipline: 'Excavation',
    version: '2.0',
    description: 'Pre-entry trench safety inspection for depth >1.2m (OSHA 1926 Subpart P).',
    createdAt: '2026-02-05T08:00:00Z',
    updatedAt: '2026-03-12T10:00:00Z',
    items: [
      { id: 'EXC-01', code: 'EXC.1', requirement: 'Excavation permit signed by Competent Geotech Person with underground utilities scanned.', standardReference: 'OSHA 1926.651', criticalItem: true },
      { id: 'EXC-02', code: 'EXC.2', requirement: 'Protective system in place: Sloping (1:1), stepping, trench box, or hydraulic shoring.', standardReference: 'OSHA 1926.652', criticalItem: true },
      { id: 'EXC-03', code: 'EXC.3', requirement: 'Spoil piles and heavy plant kept at least 1.0m back from edge of trench.', standardReference: 'BS 6031', criticalItem: true },
      { id: 'EXC-04', code: 'EXC.4', requirement: 'Safe access/egress ladders positioned every 7.5m along trench length.', standardReference: 'OSHA 1926.651(c)', criticalItem: false },
      { id: 'EXC-05', code: 'EXC.5', requirement: 'Atmospheric gas testing performed if trench depth >1.2m in hydrocarbon/gas processing area.', standardReference: 'NFPA 326', criticalItem: true },
    ],
  },
  {
    id: 'TMPL-INSP-HOUSEKEEPING',
    title: 'Site Housekeeping & Environmental Order Checklist',
    discipline: 'Housekeeping',
    version: '1.2',
    description: 'General workspace order, trip hazard prevention, and segregated waste bins.',
    createdAt: '2026-01-12T08:00:00Z',
    updatedAt: '2026-02-20T11:00:00Z',
    items: [
      { id: 'HSK-01', code: 'HSK.1', requirement: 'Walkways, corridors, and emergency exit routes completely clear of debris and cables.', standardReference: 'OSHA 1926.25', criticalItem: true },
      { id: 'HSK-02', code: 'HSK.2', requirement: 'Segregated waste bins (general, scrap metal, hazardous/chemical, food) labeled and emptied.', standardReference: 'ISO 14001', criticalItem: false },
      { id: 'HSK-03', code: 'HSK.3', requirement: 'Protruding nails removed or bent flat in formwork scrap timber.', standardReference: 'OSHA 1926.250', criticalItem: false },
      { id: 'HSK-04', code: 'HSK.4', requirement: 'Chemical storage containers tightly sealed and positioned in drip trays.', standardReference: 'COSHH / EPA', criticalItem: true },
    ],
  },
  {
    id: 'TMPL-INSP-ELECTRICAL',
    title: 'Temporary Electrical Installation & DB Panel Safety Audit',
    discipline: 'Electrical',
    version: '2.5',
    description: 'Site distribution boards, RCDs/ELCBs, trailing cables, and grounding rods.',
    createdAt: '2026-01-14T08:00:00Z',
    updatedAt: '2026-03-08T15:00:00Z',
    items: [
      { id: 'ELE-01', code: 'ELE.1', requirement: 'All temporary power outlets protected by 30mA Residual Current Devices (RCD / GFCI).', standardReference: 'BS 7671 / OSHA 1926.404', criticalItem: true },
      { id: 'ELE-02', code: 'ELE.2', requirement: 'Distribution panels weatherproof (min IP55 rating), locked, and clearly labeled with danger signs.', standardReference: 'IEC 60529', criticalItem: true },
      { id: 'ELE-03', code: 'ELE.3', requirement: 'Power cables elevated on insulated S-hooks or crossover ramps across vehicle roadways.', standardReference: 'NFPA 70', criticalItem: false },
      { id: 'ELE-04', code: 'ELE.4', requirement: 'Earthing and bonding pit resistance verified to be below 5 Ohms.', standardReference: 'IEEE 142', criticalItem: true },
      { id: 'ELE-05', code: 'ELE.5', requirement: 'Portable power tools PAT-tested with current quarterly inspection band.', standardReference: 'IEE Code of Practice', criticalItem: false },
    ],
  },
  {
    id: 'TMPL-INSP-WORKING-HEIGHT',
    title: 'Working at Height Fall Protection & MEWP Inspection',
    discipline: 'Working at Height',
    version: '2.2',
    description: 'Full-body harnesses, lanyards, static lifelines, and mobile elevating work platforms.',
    createdAt: '2026-01-16T08:00:00Z',
    updatedAt: '2026-03-04T12:00:00Z',
    items: [
      { id: 'WAH-01', code: 'WAH.1', requirement: 'Full body harnesses inspected for frayed webbing, distorted D-rings, and valid calibration tag.', standardReference: 'EN 361 / ANSI Z359.11', criticalItem: true },
      { id: 'WAH-02', code: 'WAH.2', requirement: 'Shock-absorbing twin lanyards (or inertia self-retracting lifelines) anchored 100% of the time.', standardReference: 'OSHA 1926.502(d)', criticalItem: true },
      { id: 'WAH-03', code: 'WAH.3', requirement: 'Designated anchor points rated for min 5,000 lbs (22.2 kN) per attached worker.', standardReference: 'ANSI Z359.18', criticalItem: true },
      { id: 'WAH-04', code: 'WAH.4', requirement: 'MEWP / Scissor lift daily pre-use logbook filled, emergency lowering control verified.', standardReference: 'ISO 16368', criticalItem: true },
    ],
  },
  {
    id: 'TMPL-INSP-CONFINED-SPACE',
    title: 'Confined Space Entry Pre-Entry Safety Checklist',
    discipline: 'Confined Space',
    version: '3.1',
    description: 'Atmospheric gas testing, mechanical forced ventilation, standby entrant rescue tripod.',
    createdAt: '2026-01-25T08:00:00Z',
    updatedAt: '2026-03-14T09:00:00Z',
    items: [
      { id: 'CSP-01', code: 'CSP.1', requirement: 'Continuous multi-gas monitoring (O2: 19.5%-23.5%, LEL: 0%, H2S: 0 ppm, CO: 0 ppm) recorded on permit.', standardReference: 'OSHA 1910.146 / NFPA 350', criticalItem: true },
      { id: 'CSP-02', code: 'CSP.2', requirement: 'Dedicated trained Hole Watcher / Standby Sentry stationed at entry point with entrant log.', standardReference: 'ISO 45001 §8.1', criticalItem: true },
      { id: 'CSP-03', code: 'CSP.3', requirement: 'Mechanical forced air extraction or blowing blower running continuously.', standardReference: 'API RP 2015', criticalItem: true },
      { id: 'CSP-04', code: 'CSP.4', requirement: 'Emergency rescue retrieval tripod, winch, and harness rigged over vertical manway.', standardReference: 'OSHA 1910.146(k)', criticalItem: true },
    ],
  },
  {
    id: 'TMPL-INSP-EMERGENCY',
    title: 'Emergency Response & First Aid Readiness Audit',
    discipline: 'Emergency Equipment',
    version: '1.9',
    description: 'Eyewash stations, deluge safety showers, spill kits, and emergency alarm call points.',
    createdAt: '2026-01-28T08:00:00Z',
    updatedAt: '2026-03-06T10:00:00Z',
    items: [
      { id: 'EME-01', code: 'EME.1', requirement: 'Emergency eye wash and safety showers deliver tepid flushing water within 10 seconds of hazard.', standardReference: 'ANSI Z358.1', criticalItem: true },
      { id: 'EME-02', code: 'EME.2', requirement: 'Hydrocarbon / chemical spill containment kit stocked with absorbent booms, pads, and bags.', standardReference: 'MARPOL / EPA', criticalItem: false },
      { id: 'EME-03', code: 'EME.3', requirement: 'First Aid post stocked with trauma kit, automated external defibrillator (AED), and burn dressing.', standardReference: 'OSHA 1910.151', criticalItem: true },
      { id: 'EME-04', code: 'EME.4', requirement: 'Emergency siren and plant public address (PA) speakers tested and audible across sector.', standardReference: 'NFPA 72', criticalItem: false },
    ],
  },
];

// ==========================================
// SEED INCIDENT RECORDS
// ==========================================

export const DEFAULT_INCIDENT_RECORDS: IncidentReportRecord[] = [
  {
    id: 'INC-2026-042',
    incidentNumber: 'INC-2026-042',
    date: '2026-03-12',
    time: '14:25',
    location: 'Process Train Unit 3 - Secondary Containment Berm B',
    project: 'Ras Laffan EPC-4 Liquefaction Expansion',
    department: 'Commissioning & Mechanical Completion',
    person: 'Mahmoud Al-Zahrani (Pipe Fitter Lead)',
    contractor: 'CCC Mechanical & Piping Consortium',
    activity: 'Lube Oil Transfer System Nitrogen Line Purging',
    incidentType: 'ENVIRONMENTAL_SPILL',
    description: 'During scheduled morning nitrogen purge of lube oil header, the 4-inch secondary containment drain valve was discovered open, allowing approx 45 liters of synthetic hydraulic fluid to escape onto aggregate bed before operator shutdown.',
    immediateActions: 'Manual isolation valve was shut immediately within 90 seconds. Absorbent chemical booms deployed around drainage trench. Area quarantined and shift supervisor notified.',
    rootCause: 'Subcontractor onboarding skipped formal secondary containment isolation competency module; handover log omitted physical valve lock verification.',
    fiveWhyAnalysis: [
      { level: 1, question: 'What directly caused the event?', answer: 'Secondary containment drain valve was left unlocked in open position during lube oil transfer.' },
      { level: 2, question: 'Why was the valve unlocked?', answer: 'Operator failed to apply LOTO padlock following routine morning line purge.' },
      { level: 3, question: 'Why was this not caught at shift change?', answer: 'Shift handover sheet lacked explicit containment valve physical verification checkbox.' },
      { level: 4, question: 'Why was the handover sheet incomplete?', answer: 'Subcontractor procedure was not harmonized with EPC-4 Golden Rules revision 04.' },
      { level: 5, question: 'What is the systemic root cause?', answer: 'Pre-commissioning contractor onboarding skipped formal secondary containment isolation competency module.', isSystemicRootCause: true },
    ],
    contributingFactors: {
      humanFactors: ['Distraction during shift change', 'Lack of positive mechanical confirmation'],
      equipmentFactors: ['Valve handle was not fitted with permanently welded lockout hasp'],
      environmentalFactors: ['High ambient wind masked minor fluid dripping sound'],
      proceduralFactors: ['Handover checklist rev 03 did not mandate valve status physical verification'],
      organizationalFactors: ['Subcontractor training records not audited prior to permit authorization'],
    },
    witnesses: [
      { id: 'WIT-01', name: 'Karim Bensalah', role: 'Commissioning Field Operator', contractorOrDept: 'CCC Mechanical', contactNumber: '+974 5512 8841', statement: 'I noticed the oil sheen around the gravel trench at 14:24 and immediately shouted to Mahmoud to isolate the supply valve.', interviewDate: '2026-03-12', interviewedBy: 'Eng. Farhan Al-Kuwari' },
      { id: 'WIT-02', name: 'Subramanian Raman', role: 'HSE Field Officer', contractorOrDept: 'Apex HSE Oversight', contactNumber: '+974 5599 1234', statement: 'Confirmed that the LOTO lock was absent on valve V-401B upon arrival at scene.', interviewDate: '2026-03-12', interviewedBy: 'Dr. Tariq Al-Mansoor' },
    ],
    evidence: [
      { id: 'EVD-01', title: 'Containment Valve Open Photo', type: 'PHOTO', urlOrBase64: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60', description: 'Shows valve V-401B in vertical open position without security padlock.', uploadedAt: '2026-03-12T15:00:00Z', capturedBy: 'HSE Officer Raman' },
      { id: 'EVD-02', title: 'Shift Handover Log Page 4', type: 'DOCUMENT', urlOrBase64: 'ShiftHandover_Log_12Mar.pdf', description: 'Copy of signed shift log lacking valve status verification signature.', uploadedAt: '2026-03-12T16:00:00Z', capturedBy: 'Lead Investigator' },
    ],
    photos: [
      { id: 'PHT-01', title: 'Hydrocarbon Berm Sheen', type: 'PHOTO', urlOrBase64: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=60', description: 'Spill extent inside secondary containment berm before absorbent deployment.', uploadedAt: '2026-03-12T14:40:00Z', capturedBy: 'Mahmoud Al-Zahrani' },
    ],
    correctiveActions: 'Retrofit tamper-evident padlock hasp to valve V-401B and update Shift Handover Checklist SOP-04 with mandatory verification item.',
    preventiveActions: 'Audit 100% of subcontractor pre-commissioning technician records and conduct mandatory refresher on Golden Rule #4 (Isolation).',
    responsiblePerson: 'Eng. Salem Al-Hajri (Lead Commissioning Mgr)',
    dueDate: '2026-03-25',
    status: 'CAPA_PENDING',
    spawnedCapaIds: ['CAPA-2026-019'],
    createdAt: '2026-03-12T14:35:00Z',
    updatedAt: '2026-03-13T10:15:00Z',
  },
  {
    id: 'INC-2026-043',
    incidentNumber: 'INC-2026-043',
    date: '2026-03-18',
    time: '09:15',
    location: 'Pipe Rack Route 9 - Elevation +18.0m Pier 4',
    project: 'Al-Khor Pipe Rack Route 9',
    department: 'Civil & Structural Steel',
    person: 'Rajesh Kumar (Scaffolder)',
    contractor: 'Al-Futtaim Heavy Construction',
    activity: 'Dismantling Cantilever Scaffold Bay',
    incidentType: 'NEAR_MISS',
    description: 'A 1.5m steel scaffold tube slipped from worker hand while passing down to level +14.0m and landed on safety netting below. No workers were beneath the drop zone due to active red exclusion barricade.',
    immediateActions: 'Work suspended immediately. Tool box talk held with crew on 100% positive tethering of loose equipment above 2m.',
    rootCause: 'Lack of tool tethers and absence of gin wheel mechanical lowering system for tubes exceeding 1.2m length.',
    fiveWhyAnalysis: [
      { level: 1, question: 'What happened?', answer: 'Scaffold tube fell 4 meters into safety netting.' },
      { level: 2, question: 'Why did the tube slip?', answer: 'Worker attempted to pass tube by hand over handrail rather than using lowering line.' },
      { level: 3, question: 'Why was no lowering line used?', answer: 'Gin wheel pulley had been relocated to pier 6 and was unavailable.' },
      { level: 4, question: 'Why was work continuing without equipment?', answer: 'Pressure to clear platform for piping crew before afternoon shift.' },
      { level: 5, question: 'Systemic Root Cause', answer: 'Work continued without verified Job Safety Analysis (JSA) step compliance and stop-work authority was not invoked.', isSystemicRootCause: true },
    ],
    contributingFactors: {
      humanFactors: ['Rushing to meet schedule deadline', 'Fatigue at end of morning rotation'],
      equipmentFactors: ['Gin wheel was not staged at elevation +18m'],
      environmentalFactors: ['High heat index (38°C) causing slippery gloves'],
      proceduralFactors: ['Scaffolding dismantling procedure lacked explicit prohibition on passing tubes by hand over 2m'],
      organizationalFactors: ['Supervision ratio inadequate during concurrent pier activities'],
    },
    witnesses: [
      { id: 'WIT-03', name: 'T. Suresh', role: 'Scaffold Supervisor', contractorOrDept: 'Al-Futtaim Heavy', statement: 'Barricades functioned as planned and stopped anyone entering beneath.', interviewDate: '2026-03-18', interviewedBy: 'Eng. Farhan Al-Kuwari' },
    ],
    evidence: [],
    photos: [],
    correctiveActions: 'Issue safety alert on dropped object prevention and install secondary gin wheels on all piers above 10m.',
    preventiveActions: 'Incorporate tethered tool requirement into working at height procedure WAH-SOP-01.',
    responsiblePerson: 'T. Suresh (Scaffold Lead)',
    dueDate: '2026-03-28',
    status: 'CLOSED',
    closure: {
      closedDate: '2026-03-24',
      closedBy: 'Dr. Tariq Al-Mansoor (HSE Director)',
      closureComments: 'All scaffolding bays fitted with verified gin wheels. Tool tethering mandatory. Case closed successfully.',
    },
    createdAt: '2026-03-18T09:30:00Z',
    updatedAt: '2026-03-24T16:00:00Z',
  },
];

// ==========================================
// SEED CAPA RECORDS
// ==========================================

export const DEFAULT_CAPA_RECORDS: CapaRecord[] = [
  {
    id: 'CAPA-2026-019',
    finding: 'Secondary containment drain valve V-401B left unlocked and without mechanical LOTO device, resulting in hydraulic fluid release.',
    source: 'INCIDENT',
    sourceReferenceId: 'INC-2026-042',
    sourceTitle: 'Secondary Containment Berm Drain Valve Left Open',
    riskLevel: 'HIGH',
    actionRequired: 'Install permanent lockout hasp on valve V-401B, update Shift Handover Log SOP-04 with mandatory verification checkbox, and retrain commissioning crew.',
    responsiblePerson: 'Eng. Salem Al-Hajri',
    department: 'Commissioning & Operations',
    targetDate: '2026-03-25', // Overdue relative to late March
    evidence: [],
    status: 'OPEN',
    createdAt: '2026-03-13T10:00:00Z',
    updatedAt: '2026-03-13T10:00:00Z',
  },
  {
    id: 'CAPA-2026-015',
    finding: 'ISO 45001 §8.1.3: Contractor CCC rigging slings in zone 4 found without Q1 color-coded inspection band.',
    source: 'AUDIT',
    sourceReferenceId: 'AUD-2026-001',
    sourceTitle: 'Annual ISO 45001 Internal Management System Audit',
    riskLevel: 'MEDIUM',
    actionRequired: 'Quarantine all unverified slings, conduct 100% inspection with 3rd-party certified inspector, and apply current green band.',
    responsiblePerson: 'Farhan Al-Kuwari',
    department: 'Rigging & Lifting Operations',
    targetDate: '2026-04-10',
    evidence: [],
    status: 'IN PROGRESS',
    createdAt: '2026-03-10T14:00:00Z',
    updatedAt: '2026-03-18T11:00:00Z',
  },
  {
    id: 'CAPA-2026-012',
    finding: 'Trench excavation deeper than 1.5m at Pier 2 lacked certified hydraulic shoring box while workers were preparing pipe bed.',
    source: 'INSPECTION',
    sourceReferenceId: 'INS-2026-088',
    sourceTitle: 'Excavation & Trenching Daily Competent Person Inspection',
    riskLevel: 'CRITICAL',
    actionRequired: 'Stop work immediately, evacuate trench, install aluminum trench box, and certify by Geotech Engineer before re-entry.',
    responsiblePerson: 'Mustafa Idris, PE',
    department: 'Civil Geotech Lead',
    targetDate: '2026-03-05',
    evidence: [],
    status: 'PENDING VERIFICATION',
    verification: {
      verifiedBy: 'Dr. Tariq Al-Mansoor',
      verificationDate: '2026-03-06',
      notes: 'Trench box installed and tested. Awaiting final soil compaction certificate.',
      isEffective: true,
    },
    createdAt: '2026-03-04T08:00:00Z',
    updatedAt: '2026-03-06T15:00:00Z',
  },
  {
    id: 'CAPA-2026-008',
    finding: 'Portable eyewash station #E-09 at chemical dosing skid was dry and overdue for monthly saline fluid replenishment.',
    source: 'INSPECTION',
    sourceReferenceId: 'INS-2026-044',
    sourceTitle: 'Emergency Response & First Aid Readiness Audit',
    riskLevel: 'HIGH',
    actionRequired: 'Flush station, install sealed sterile saline reservoir, and log inspection tag.',
    responsiblePerson: 'Safety Officer Raman',
    department: 'Site HSE Services',
    targetDate: '2026-02-15',
    evidence: [],
    status: 'CLOSED',
    closureDate: '2026-02-14',
    verifiedBy: 'Dr. Tariq Al-Mansoor',
    createdAt: '2026-02-10T09:00:00Z',
    updatedAt: '2026-02-14T17:00:00Z',
  },
];

// ==========================================
// SEED AUDIT RECORDS
// ==========================================

export const DEFAULT_AUDIT_RECORDS: AuditRecordModel[] = [
  {
    id: 'AUD-2026-001',
    auditNumber: 'AUD-2026-001',
    auditPlan: 'Annual ISO 45001 & OSHA Operational Compliance Audit Q1-2026',
    auditScope: 'Comprehensive examination of operational controls, PTW enforcement, contractor management, and incident reporting across Ras Laffan EPC-4 Package.',
    auditCriteria: 'ISO 45001:2018 Clauses 4-10, OSHA 1926 Safety Regulations, and Golden Life Saving Rules.',
    auditor: 'Dr. Tariq Al-Mansoor (Lead Auditor ISO 45001 IRCA #88412)',
    auditTeam: ['Eng. Farhan Al-Kuwari (Co-Auditor)', 'Subramanian Raman (Observer)'],
    auditee: 'Eng. Salem Al-Hajri (Commissioning Director) & Subcontractor PMs',
    department: 'Operations & Site Projects',
    project: 'Ras Laffan EPC-4 Liquefaction Expansion',
    plannedDate: '2026-03-01',
    actualDate: '2026-03-05',
    status: 'REPORTED' as any,
    conformanceRating: 'SATISFACTORY_WITH_OBSERVATIONS',
    summaryConclusion: 'Overall safety management system demonstrates strong executive commitment with 92% compliance. Two minor non-conformances identified regarding contractor equipment tag tracking and secondary isolation records.',
    checklist: [
      { id: 'CHK-01', clause: 'ISO 45001 §5.2', requirement: 'HSE Policy communicated to site workers and subcontractors.', criteria: 'Display on noticeboards and verified during worker random interviews.', result: 'CONFORMANT', notes: 'Policy displayed in English, Arabic, and Hindi.' },
      { id: 'CHK-02', clause: 'ISO 45001 §6.1.2', requirement: 'Hazard identification and ALARP assessment current for all active works.', criteria: 'Risk assessments rev 03 approved prior to work start.', result: 'CONFORMANT', notes: '28 active RAs verified on ALARP matrix.' },
      { id: 'CHK-03', clause: 'ISO 45001 §8.1.2', requirement: 'Eliminating hazards and hierarchy of controls implemented.', criteria: 'Physical barriers and engineered isolation applied.', result: 'NONCONFORMANT', notes: 'Minor NC: 1 secondary containment valve lacked LOTO hasp.' },
      { id: 'CHK-04', clause: 'ISO 45001 §8.1.4', requirement: 'Contractor safety prequalification and equipment verification.', criteria: 'Rigging gear tagged with Q1 color code.', result: 'NONCONFORMANT', notes: 'Minor NC: CCC subcontractor rigging gear lacked Q1 band.' },
      { id: 'CHK-05', clause: 'ISO 45001 §9.2', requirement: 'Internal audits conducted according to planned schedule.', criteria: 'Annual audit program approved by HSE Director.', result: 'CONFORMANT', notes: 'Audits tracked in central database.' },
    ],
    findings: [
      {
        id: 'FND-2026-01',
        auditId: 'AUD-2026-001',
        type: 'NONCONFORMITY',
        severity: 'MINOR_NC',
        clause: 'ISO 45001 §8.1.4',
        findingDescription: 'Subcontractor CCC rigging slings observed on Pier 4 without Q1 color-coded inspection band.',
        evidence: 'Inspection of 12 web slings in Rigging Box #4 revealed 3 items missing inspection tag.',
        correctiveActionRequired: 'Quarantine unverified slings, inspect 100% of rigging inventory, and update lifting passport.',
        responsiblePerson: 'Farhan Al-Kuwari',
        targetDate: '2026-04-10',
        capaIdCreated: 'CAPA-2026-015',
        status: 'CAPA_DISPATCHED',
        createdAt: '2026-03-05T16:00:00Z',
      },
      {
        id: 'FND-2026-02',
        auditId: 'AUD-2026-001',
        type: 'OBSERVATION',
        severity: 'OBSERVATION',
        clause: 'ISO 45001 §7.3',
        findingDescription: 'Shift handover communication between night and day shifts could be enhanced by digital tablet verification.',
        evidence: 'Handover logs occasionally signed after work commences rather than prior to permit handover.',
        correctiveActionRequired: 'Implement electronic signature requirement on tablet before PTW re-authorization.',
        responsiblePerson: 'Eng. Salem Al-Hajri',
        targetDate: '2026-04-15',
        status: 'OPEN',
        createdAt: '2026-03-05T16:30:00Z',
      },
    ],
    finalReportGenerated: true,
    finalReportApprovedBy: 'Dr. Tariq Al-Mansoor (Lead Auditor)',
    createdAt: '2026-02-20T10:00:00Z',
    updatedAt: '2026-03-06T12:00:00Z',
  },
];

// ==========================================
// SEED INSPECTION EXECUTION RECORDS
// ==========================================

export const DEFAULT_INSPECTION_RECORDS: InspectionRecordExecution[] = [
  {
    id: 'INS-2026-101',
    templateId: 'TMPL-INSP-SCAFFOLD',
    templateTitle: 'Scaffold Daily & Handover Safety Inspection',
    discipline: 'Scaffold',
    date: '2026-03-24',
    inspectorName: 'T. Suresh (Scaffolding Inspector)',
    project: 'Ras Laffan EPC-4 Liquefaction Expansion',
    location: 'Process Unit 3 - Pipe Rack Column B-12',
    contractor: 'Al-Futtaim Heavy Construction',
    items: [
      { itemId: 'SCF-01', requirement: 'Scafftag issued and clearly visible (Green: Safe, Red: Do Not Use).', status: 'PASS', comment: 'Green Tag #GT-8841 issued and signed.' },
      { itemId: 'SCF-02', requirement: 'Base plates and timber sole pads placed on sound, level ground.', status: 'PASS', comment: 'Sole pads on compacted asphalt.' },
      { itemId: 'SCF-03', requirement: 'Double guardrails and toe-boards intact.', status: 'PASS', comment: 'Top rail 1050mm, mid rail 500mm, toe board 150mm.' },
      { itemId: 'SCF-04', requirement: 'Working platforms fully boarded with no gaps >25mm.', status: 'PASS', comment: 'Fully boarded, no trip hazards.' },
      { itemId: 'SCF-05', requirement: 'Ties, rakers, and facade bracing securely anchored.', status: 'PASS', comment: 'Through-ties anchored at 4m intervals.' },
      { itemId: 'SCF-06', requirement: 'Ladder access internal to scaffold, securely lashed.', status: 'PASS', comment: 'Classified safe for work.' },
    ],
    overallResult: 'PASS',
    complianceScorePercent: 100,
    notes: 'Platform in pristine condition for welding crew.',
    createdAt: '2026-03-24T08:30:00Z',
  },
  {
    id: 'INS-2026-088',
    templateId: 'TMPL-INSP-EXCAVATION',
    templateTitle: 'Excavation & Trenching Daily Competent Person Inspection',
    discipline: 'Excavation',
    date: '2026-03-04',
    inspectorName: 'Mustafa Idris, PE (Geotech Lead)',
    project: 'Al-Khor Pipe Rack Route 9',
    location: 'Pier 2 Main Trench Crossing',
    contractor: 'CCC Civils',
    items: [
      { itemId: 'EXC-01', requirement: 'Excavation permit signed with underground utilities scanned.', status: 'PASS', comment: 'Ground radar scan verified.' },
      { itemId: 'EXC-02', requirement: 'Protective system in place (sloping, stepping, trench box).', status: 'FAIL', comment: 'Depth is 1.8m, vertical wall without trench box.', correctiveAction: 'Stop work and install certified aluminum trench box.', capaIdCreated: 'CAPA-2026-012' },
      { itemId: 'EXC-03', requirement: 'Spoil piles kept min 1.0m back from edge.', status: 'PASS', comment: 'Spoil is 1.5m away.' },
      { itemId: 'EXC-04', requirement: 'Safe access/egress ladders positioned every 7.5m.', status: 'PASS', comment: 'Ladder at east and west ends.' },
      { itemId: 'EXC-05', requirement: 'Atmospheric gas testing performed.', status: 'PASS', comment: 'Gas levels normal (O2 20.9%, H2S 0ppm).' },
    ],
    overallResult: 'FAIL',
    complianceScorePercent: 80,
    notes: 'Stop work issued on trench entry until trench box installed.',
    createdAt: '2026-03-04T07:45:00Z',
  },
];

// ==========================================
// SERVICE IMPLEMENTATION
// ==========================================

class SafetyOpsService {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. Seed inspection checklist templates if empty
      const existingTemplates = await indexedDbService.getAll<InspectionChecklistTemplate>('inspection_templates');
      if (!existingTemplates || existingTemplates.length === 0) {
        for (const tmpl of DEFAULT_INSPECTION_TEMPLATES) {
          await indexedDbService.put('inspection_templates', tmpl);
        }
      }

      // 2. Seed incident records if empty
      const existingIncidents = await indexedDbService.getAll<IncidentReportRecord>('incident_records');
      if (!existingIncidents || existingIncidents.length === 0) {
        for (const inc of DEFAULT_INCIDENT_RECORDS) {
          await indexedDbService.put('incident_records', inc);
        }
      }

      // 3. Seed CAPA records if empty
      const existingCapas = await indexedDbService.getAll<CapaRecord>('corrective_actions');
      if (!existingCapas || existingCapas.length === 0) {
        for (const capa of DEFAULT_CAPA_RECORDS) {
          await indexedDbService.put('corrective_actions', capa);
        }
      }

      // 4. Seed Audit records if empty
      const existingAudits = await indexedDbService.getAll<AuditRecordModel>('audit_records');
      if (!existingAudits || existingAudits.length === 0) {
        for (const aud of DEFAULT_AUDIT_RECORDS) {
          await indexedDbService.put('audit_records', aud);
        }
      }

      // 5. Seed Inspection records if empty
      const existingInspections = await indexedDbService.getAll<InspectionRecordExecution>('inspection_records');
      if (!existingInspections || existingInspections.length === 0) {
        for (const ins of DEFAULT_INSPECTION_RECORDS) {
          await indexedDbService.put('inspection_records', ins);
        }
      }

      this.initialized = true;
    } catch (err) {
      console.warn('SafetyOpsService initialization warning:', err);
      this.initialized = true;
    }
  }

  // ==========================================
  // A. INCIDENT MANAGEMENT
  // ==========================================

  public async getIncidents(): Promise<IncidentReportRecord[]> {
    await this.init();
    const records = await indexedDbService.getAll<IncidentReportRecord>('incident_records');
    return records.sort((a, b) => new Date(b.date + 'T' + (b.time || '00:00')).getTime() - new Date(a.date + 'T' + (a.time || '00:00')).getTime());
  }

  public async getIncidentById(id: string): Promise<IncidentReportRecord | null> {
    await this.init();
    return indexedDbService.get<IncidentReportRecord>('incident_records', id);
  }

  public async saveIncident(record: IncidentReportRecord): Promise<IncidentReportRecord> {
    await this.init();
    const now = new Date().toISOString();
    const updated: IncidentReportRecord = {
      ...record,
      updatedAt: now,
      createdAt: record.createdAt || now,
    };
    await indexedDbService.put('incident_records', updated);
    return updated;
  }

  public async deleteIncident(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('incident_records', id);
    return true;
  }

  public async updateIncident5Why(
    id: string,
    whys: { level: number; question: string; answer: string; isSystemicRootCause?: boolean }[],
    rootCause: string
  ): Promise<IncidentReportRecord | null> {
    await this.init();
    const incident = await this.getIncidentById(id);
    if (!incident) return null;
    incident.fiveWhyAnalysis = whys;
    incident.rootCause = rootCause;
    incident.status = 'UNDER_INVESTIGATION';
    return this.saveIncident(incident);
  }

  public async closeIncident(
    id: string,
    closedBy: string,
    closureComments: string,
    signature?: string
  ): Promise<IncidentReportRecord | null> {
    await this.init();
    const incident = await this.getIncidentById(id);
    if (!incident) return null;
    incident.status = 'CLOSED';
    incident.closure = {
      closedDate: new Date().toISOString().split('T')[0],
      closedBy,
      closureComments,
      verificationSignature: signature,
    };
    return this.saveIncident(incident);
  }

  // ==========================================
  // B. CORRECTIVE ACTIONS / CAPA (WITH AUTO OVERDUE)
  // ==========================================

  public async getCapas(): Promise<CapaRecord[]> {
    await this.init();
    const records = await indexedDbService.getAll<CapaRecord>('corrective_actions');
    const today = new Date().toISOString().split('T')[0];

    // Compute automatic OVERDUE status for any action whose targetDate < today and status is not CLOSED
    const enriched = records.map((capa) => {
      if (capa.status !== 'CLOSED' && capa.targetDate && capa.targetDate < today) {
        return { ...capa, status: 'OVERDUE' as const };
      }
      return capa;
    });

    return enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getCapaById(id: string): Promise<CapaRecord | null> {
    await this.init();
    const capa = await indexedDbService.get<CapaRecord>('corrective_actions', id);
    if (!capa) return null;
    const today = new Date().toISOString().split('T')[0];
    if (capa.status !== 'CLOSED' && capa.targetDate && capa.targetDate < today) {
      return { ...capa, status: 'OVERDUE' };
    }
    return capa;
  }

  public async saveCapa(record: CapaRecord): Promise<CapaRecord> {
    await this.init();
    const now = new Date().toISOString();
    const today = now.split('T')[0];
    let computedStatus = record.status;
    if (record.status !== 'CLOSED' && record.targetDate && record.targetDate < today) {
      computedStatus = 'OVERDUE';
    }

    const updated: CapaRecord = {
      ...record,
      status: computedStatus,
      updatedAt: now,
      createdAt: record.createdAt || now,
    };
    await indexedDbService.put('corrective_actions', updated);
    return updated;
  }

  public async verifyAndCloseCapa(
    id: string,
    verifiedBy: string,
    notes: string,
    isEffective: boolean
  ): Promise<CapaRecord | null> {
    await this.init();
    const capa = await this.getCapaById(id);
    if (!capa) return null;
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    capa.status = isEffective ? 'CLOSED' : 'IN PROGRESS';
    capa.closureDate = isEffective ? today : undefined;
    capa.verifiedBy = verifiedBy;
    capa.verification = {
      verifiedBy,
      verificationDate: today,
      notes,
      isEffective,
    };
    capa.updatedAt = now;
    await indexedDbService.put('corrective_actions', capa);
    return capa;
  }

  public async deleteCapa(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('corrective_actions', id);
    return true;
  }

  // Inter-Module Spawning 1: Incident → CAPA
  public async createCapaFromIncident(
    incidentId: string,
    override?: Partial<CapaRecord>
  ): Promise<CapaRecord> {
    await this.init();
    const incident = await this.getIncidentById(incidentId);
    if (!incident) {
      throw new Error(`Incident with ID ${incidentId} not found.`);
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const capaId = `CAPA-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newCapa: CapaRecord = {
      id: capaId,
      finding: override?.finding || `Root cause identified in incident ${incident.incidentNumber}: ${incident.rootCause || incident.description}`,
      source: 'INCIDENT',
      sourceReferenceId: incident.incidentNumber,
      sourceTitle: `${incident.incidentType} - ${incident.activity || incident.location}`,
      riskLevel: override?.riskLevel || (incident.incidentType === 'LOST_TIME_INJURY' || incident.incidentType === 'ENVIRONMENTAL_SPILL' ? 'HIGH' : 'MEDIUM'),
      actionRequired: override?.actionRequired || incident.correctiveActions || 'Implement corrective and preventive hierarchy of control measures.',
      responsiblePerson: override?.responsiblePerson || incident.responsiblePerson || 'HSE Field Engineer',
      department: override?.department || incident.department || 'Safety Operations',
      targetDate: override?.targetDate || incident.dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      evidence: override?.evidence || incident.evidence || [],
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    await this.saveCapa(newCapa);

    // Link back to incident
    const spawned = incident.spawnedCapaIds || [];
    if (!spawned.includes(capaId)) {
      incident.spawnedCapaIds = [...spawned, capaId];
      incident.status = 'CAPA_PENDING';
      await this.saveIncident(incident);
    }

    return newCapa;
  }

  // Inter-Module Spawning 2: Audit Finding → CAPA
  public async createCapaFromAuditFinding(
    auditId: string,
    findingId: string,
    override?: Partial<CapaRecord>
  ): Promise<CapaRecord> {
    await this.init();
    const audit = await this.getAuditById(auditId);
    if (!audit) {
      throw new Error(`Audit with ID ${auditId} not found.`);
    }

    const finding = audit.findings.find((f) => f.id === findingId);
    if (!finding) {
      throw new Error(`Audit finding with ID ${findingId} not found in audit ${auditId}.`);
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const capaId = `CAPA-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    let riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'MEDIUM';
    if (finding.severity === 'MAJOR_NC') riskLevel = 'CRITICAL';
    else if (finding.severity === 'MINOR_NC') riskLevel = 'HIGH';
    else riskLevel = 'LOW';

    const newCapa: CapaRecord = {
      id: capaId,
      finding: override?.finding || `Audit ${audit.auditNumber} Finding (${finding.clause}): ${finding.findingDescription}`,
      source: 'AUDIT',
      sourceReferenceId: audit.auditNumber,
      sourceTitle: `${audit.auditPlan} [${finding.clause}]`,
      riskLevel: override?.riskLevel || riskLevel,
      actionRequired: override?.actionRequired || finding.correctiveActionRequired || 'Rectify non-conformance and align practice with ISO/OSHA standard requirement.',
      responsiblePerson: override?.responsiblePerson || finding.responsiblePerson || audit.auditee,
      department: override?.department || audit.department || 'Operations',
      targetDate: override?.targetDate || finding.targetDate || new Date(Date.now() + 21 * 86400000).toISOString().split('T')[0],
      evidence: override?.evidence || finding.evidenceAttachments || [],
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    await this.saveCapa(newCapa);

    // Update finding status and link
    finding.capaIdCreated = capaId;
    finding.status = 'CAPA_DISPATCHED';
    await this.saveAudit(audit);

    return newCapa;
  }

  // Inter-Module Spawning 3: Inspection Failed Item → CAPA
  public async createCapaFromInspection(
    inspectionId: string,
    itemId: string,
    override?: Partial<CapaRecord>
  ): Promise<CapaRecord> {
    await this.init();
    const inspection = await this.getInspectionRecordById(inspectionId);
    if (!inspection) {
      throw new Error(`Inspection record with ID ${inspectionId} not found.`);
    }

    const item = inspection.items.find((i) => i.itemId === itemId);
    if (!item) {
      throw new Error(`Inspection item with ID ${itemId} not found in inspection ${inspectionId}.`);
    }

    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const capaId = `CAPA-${new Date().getFullYear()}-${randomSuffix}`;
    const now = new Date().toISOString();

    const newCapa: CapaRecord = {
      id: capaId,
      finding: override?.finding || `Failed Item during ${inspection.templateTitle}: "${item.requirement}". Comment: ${item.comment || 'Non-compliance observed'}`,
      source: 'INSPECTION',
      sourceReferenceId: inspection.id,
      sourceTitle: `${inspection.discipline} Inspection (${inspection.location})`,
      riskLevel: override?.riskLevel || 'HIGH',
      actionRequired: override?.actionRequired || item.correctiveAction || 'Immediate rectification of failed inspection criterion before operation continues.',
      responsiblePerson: override?.responsiblePerson || inspection.contractor || 'Site Construction Lead',
      department: override?.department || inspection.discipline,
      targetDate: override?.targetDate || new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      evidence: item.photo ? [{ id: 'EVD-INSP', title: 'Inspection Photo', type: 'PHOTO', urlOrBase64: item.photo, description: 'Field capture of failed item', uploadedAt: now, capturedBy: inspection.inspectorName }] : [],
      status: 'OPEN',
      createdAt: now,
      updatedAt: now,
    };

    await this.saveCapa(newCapa);

    // Update inspection record item with spawned CAPA id
    item.capaIdCreated = capaId;
    await indexedDbService.put('inspection_records', inspection);

    return newCapa;
  }

  // ==========================================
  // C. DYNAMIC CHECKLIST BUILDER & INSPECTIONS
  // ==========================================

  public async getChecklistTemplates(): Promise<InspectionChecklistTemplate[]> {
    await this.init();
    return indexedDbService.getAll<InspectionChecklistTemplate>('inspection_templates');
  }

  public async getChecklistTemplateById(id: string): Promise<InspectionChecklistTemplate | null> {
    await this.init();
    return indexedDbService.get<InspectionChecklistTemplate>('inspection_templates', id);
  }

  public async saveChecklistTemplate(template: InspectionChecklistTemplate): Promise<InspectionChecklistTemplate> {
    await this.init();
    const now = new Date().toISOString();
    const updated: InspectionChecklistTemplate = {
      ...template,
      updatedAt: now,
      createdAt: template.createdAt || now,
    };
    await indexedDbService.put('inspection_templates', updated);
    return updated;
  }

  public async deleteChecklistTemplate(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('inspection_templates', id);
    return true;
  }

  public async getInspectionRecords(): Promise<InspectionRecordExecution[]> {
    await this.init();
    const records = await indexedDbService.getAll<InspectionRecordExecution>('inspection_records');
    return records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  public async getInspectionRecordById(id: string): Promise<InspectionRecordExecution | null> {
    await this.init();
    return indexedDbService.get<InspectionRecordExecution>('inspection_records', id);
  }

  public async saveInspectionRecord(record: InspectionRecordExecution): Promise<InspectionRecordExecution> {
    await this.init();
    await indexedDbService.put('inspection_records', record);
    return record;
  }

  public async deleteInspectionRecord(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('inspection_records', id);
    return true;
  }

  // ==========================================
  // D. AUDITS, FINDINGS & FINAL REPORTS
  // ==========================================

  public async getAudits(): Promise<AuditRecordModel[]> {
    await this.init();
    const records = await indexedDbService.getAll<AuditRecordModel>('audit_records');
    return records.sort((a, b) => new Date(b.plannedDate).getTime() - new Date(a.plannedDate).getTime());
  }

  public async getAuditById(id: string): Promise<AuditRecordModel | null> {
    await this.init();
    return indexedDbService.get<AuditRecordModel>('audit_records', id);
  }

  public async saveAudit(audit: AuditRecordModel): Promise<AuditRecordModel> {
    await this.init();
    const now = new Date().toISOString();
    const updated: AuditRecordModel = {
      ...audit,
      updatedAt: now,
      createdAt: audit.createdAt || now,
    };
    await indexedDbService.put('audit_records', updated);
    return updated;
  }

  public async deleteAudit(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('audit_records', id);
    return true;
  }

  public async addAuditFinding(
    auditId: string,
    finding: Omit<AuditFindingRecord, 'id' | 'auditId' | 'createdAt' | 'status'> & {
      status?: AuditFindingRecord['status'];
    }
  ): Promise<AuditFindingRecord | null> {
    await this.init();
    const audit = await this.getAuditById(auditId);
    if (!audit) return null;

    const findingId = `FND-${new Date().getFullYear()}-${Math.floor(10 + Math.random() * 90)}`;
    const newFinding: AuditFindingRecord = {
      ...finding,
      id: findingId,
      auditId,
      createdAt: new Date().toISOString(),
      status: finding.status || 'OPEN',
    };

    audit.findings = [...(audit.findings || []), newFinding];
    await this.saveAudit(audit);
    return newFinding;
  }

  public async generateFinalReport(
    auditId: string,
    approvedBy: string
  ): Promise<AuditRecordModel | null> {
    await this.init();
    const audit = await this.getAuditById(auditId);
    if (!audit) return null;

    const nonconformities = (audit.findings || []).filter((f) => f.type === 'NONCONFORMITY');
    let rating: AuditRecordModel['conformanceRating'] = 'FULL_CONFORMANCE';
    if (nonconformities.some((f) => f.severity === 'MAJOR_NC')) {
      rating = 'CRITICAL_DEFICIENCIES';
    } else if (nonconformities.length > 0) {
      rating = 'ACTION_REQUIRED';
    } else if ((audit.findings || []).length > 0) {
      rating = 'SATISFACTORY_WITH_OBSERVATIONS';
    }

    audit.conformanceRating = rating;
    audit.finalReportGenerated = true;
    audit.finalReportApprovedBy = approvedBy;
    audit.status = 'CLOSED';
    audit.actualDate = audit.actualDate || new Date().toISOString().split('T')[0];

    return this.saveAudit(audit);
  }
}

export const safetyOpsService = new SafetyOpsService();
