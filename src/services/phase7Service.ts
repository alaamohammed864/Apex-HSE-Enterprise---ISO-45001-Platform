/**
 * Phase 7 Service: Training Management, KPI Engine, and Permit to Work (e-PTW)
 * Persists data to IndexedDB stores:
 * - training_courses, training_records
 * - kpis, kpi_records
 * - permit_types, permits_to_work
 */

import { indexedDbService } from './db';
import {
  TrainingCourseModel,
  EmployeeTrainingRecordModel,
  TrainingRecordStatus,
  KpiDefinitionModel,
  KpiPeriodType,
  KpiDataPoint,
  KpiSummaryReport,
  PermitToWorkModel,
  PermitDisciplineType,
  PermitStatus,
  GasTestReading,
} from '../types/phase7';

// ==========================================
// SEED: 13 TRAINING COURSES
// ==========================================

export const DEFAULT_TRAINING_COURSES: TrainingCourseModel[] = [
  {
    id: 'CRS-IND-01',
    code: 'TC-01',
    title: 'HSE General Site Induction & Golden Rules',
    titleAr: 'التهيئة العامة للسلامة والقواعد الذهبية',
    category: 'MANDATORY',
    validityMonths: 12,
    passingScorePercent: 100,
    description: 'Mandatory site orientation, emergency alarms, evacuation routes, and Life Saving Rules.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-FA-02',
    code: 'TC-02',
    title: 'First Aid & CPR / AED Emergency Certification',
    titleAr: 'الإسعافات الأولية والإنعاش القلبي',
    category: 'EMERGENCY',
    validityMonths: 24,
    passingScorePercent: 85,
    description: 'Practical emergency trauma response, severe bleed control, fracture splinting, and automated defibrillator use.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-FF-03',
    code: 'TC-03',
    title: 'Fire Fighting & Basic Extinguisher Practical',
    titleAr: 'مكافحة الحرائق واستخدام الطفايات الميداني',
    category: 'EMERGENCY',
    validityMonths: 24,
    passingScorePercent: 80,
    description: 'Live fire suppression simulation, classes of fire, dry chemical / CO2 extinguisher operation, and fire blanket use.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-WAH-04',
    code: 'TC-04',
    title: 'Working at Height & Fall Arrest Competency',
    titleAr: 'العمل على ارتفاعات ومعدات منع السقوط',
    category: 'HIGH_HAZARD',
    validityMonths: 24,
    passingScorePercent: 90,
    description: 'Full body harness inspection, 100% tie-off, static lifelines, shock absorbers, and suspension trauma rescue.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-CSP-05',
    code: 'TC-05',
    title: 'Confined Space Entry, Standby & Escape BA',
    titleAr: 'دخول الأماكن المغلقة وأجهزة التنفس للطوارئ',
    category: 'HIGH_HAZARD',
    validityMonths: 12,
    passingScorePercent: 90,
    description: 'Atmospheric testing requirements, entrant responsibilities, hole-watcher logkeeping, and 15-minute EEBD escape sets.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-RIG-06',
    code: 'TC-06',
    title: 'Lifting & Rigging Appointed Person Competency',
    titleAr: 'عمليات الرفع والتصبين وشخص التوجيه المؤهل',
    category: 'EQUIPMENT',
    validityMonths: 24,
    passingScorePercent: 85,
    description: 'Sling capacity calculation, center of gravity determination, tag line control, and crane hand signaling.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-SCF-07',
    code: 'TC-07',
    title: 'Scaffold Safety, Erection & Inspection',
    titleAr: 'سلامة وتركيب وفحص السقالات',
    category: 'EQUIPMENT',
    validityMonths: 24,
    passingScorePercent: 85,
    description: 'TG20:21 standards, tube and fitting assembly, Scafftag inspection, and load class ratings.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-PTW-08',
    code: 'TC-08',
    title: 'Permit to Work (PTW) Issuer & Receiver Authority',
    titleAr: 'نظام تصاريح العمل (المُصدر والمستلم المعتمد)',
    category: 'MANDATORY',
    validityMonths: 24,
    passingScorePercent: 90,
    description: 'Life saving rule authorization, simultaneous operations (SIMOPS), gas testing verification, and permit handback.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-ERP-09',
    code: 'TC-09',
    title: 'Site Emergency Response & Evacuation Warden',
    titleAr: 'الاستجابة لحالات الطوارئ ومسؤولي الإخلاء',
    category: 'EMERGENCY',
    validityMonths: 12,
    passingScorePercent: 80,
    description: 'Muster point roll calls, toxic gas alarm procedures, wind direction monitoring, and civil defense coordination.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-DRV-10',
    code: 'TC-10',
    title: 'Defensive Driving & Heavy Plant Site Logistics',
    titleAr: 'القيادة الوقائية والآليات الثقيلة داخل الموقع',
    category: 'MANDATORY',
    validityMonths: 36,
    passingScorePercent: 85,
    description: 'Site speed limits (20 km/h), vehicle pre-trip checks, blind spot mirrors, and reverse parking rules.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-MNH-11',
    code: 'TC-11',
    title: 'Manual Handling & Ergonomic Injury Prevention',
    titleAr: 'المناولة اليدوية والوقاية من الإصابات المريحة',
    category: 'MANDATORY',
    validityMonths: 24,
    passingScorePercent: 80,
    description: 'Kinetic lifting techniques, individual lifting limit (25 kg), mechanical aids, and back injury ergonomics.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-CHM-12',
    code: 'TC-12',
    title: 'Chemical Safety, Hazmat COSHH & Spill Control',
    titleAr: 'السلامة الكيميائية والمواد الخطرة واحتواء الانسكابات',
    category: 'HIGH_HAZARD',
    validityMonths: 12,
    passingScorePercent: 85,
    description: 'GHS pictograms, Safety Data Sheet (SDS) interpretation, chemical-resistant PPE, and secondary containment.',
    mandatoryBeforeSiteEntry: false,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
  {
    id: 'CRS-ELE-13',
    code: 'TC-13',
    title: 'Electrical Safety, Arc Flash & LOTO Isolation',
    titleAr: 'السلامة الكهربائية والوميض القوسي وعزل الطاقة LOTO',
    category: 'HIGH_HAZARD',
    validityMonths: 12,
    passingScorePercent: 95,
    description: 'NFPA 70E arc flash boundaries, temporary distribution box safety, 30mA RCD testing, and multi-padlock isolation.',
    mandatoryBeforeSiteEntry: true,
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-01-01T08:00:00Z',
  },
];

// ==========================================
// SEED: EMPLOYEE TRAINING RECORDS
// ==========================================

export const DEFAULT_TRAINING_RECORDS: EmployeeTrainingRecordModel[] = [
  {
    id: 'TR-2026-001',
    employeeId: 'EMP-101',
    employeeName: 'Farhan Al-Kuwari',
    employeeBadge: 'QA-8812',
    contractor: 'CCC Consortium',
    department: 'Lifting & Rigging Operations',
    tradeRole: 'Rigging Appointed Person',
    courseId: 'CRS-IND-01',
    courseTitle: 'HSE General Site Induction & Golden Rules',
    trainingDate: '2026-01-10',
    expiryDate: '2027-01-10',
    certificateNumber: 'CERT-IND-8812',
    trainer: 'Dr. Tariq Al-Mansoor',
    trainingProvider: 'Apex HSE Academy',
    scoreAchievedPercent: 100,
    status: 'VALID',
    createdAt: '2026-01-10T10:00:00Z',
    updatedAt: '2026-01-10T10:00:00Z',
  },
  {
    id: 'TR-2026-002',
    employeeId: 'EMP-101',
    employeeName: 'Farhan Al-Kuwari',
    employeeBadge: 'QA-8812',
    contractor: 'CCC Consortium',
    department: 'Lifting & Rigging Operations',
    tradeRole: 'Rigging Appointed Person',
    courseId: 'CRS-RIG-06',
    courseTitle: 'Lifting & Rigging Appointed Person Competency',
    trainingDate: '2025-05-15',
    expiryDate: '2027-05-15',
    certificateNumber: 'CERT-RIG-4019',
    trainer: 'Capt. James Macleod',
    trainingProvider: 'LEEA Middle East',
    scoreAchievedPercent: 96,
    status: 'VALID',
    createdAt: '2025-05-15T11:00:00Z',
    updatedAt: '2025-05-15T11:00:00Z',
  },
  {
    id: 'TR-2026-003',
    employeeId: 'EMP-102',
    employeeName: 'Mahmoud Al-Zahrani',
    employeeBadge: 'QA-7740',
    contractor: 'CCC Piping',
    department: 'Mechanical Completion',
    tradeRole: 'Pipe Fitter Lead',
    courseId: 'CRS-CSP-05',
    courseTitle: 'Confined Space Entry, Standby & Escape BA',
    trainingDate: '2025-04-10',
    expiryDate: '2026-04-10', // Expiring within 30 days of late March
    certificateNumber: 'CERT-CSP-7740',
    trainer: 'Eng. Salem Al-Hajri',
    trainingProvider: 'Qatar Safety Training Centre',
    scoreAchievedPercent: 92,
    status: 'EXPIRING',
    createdAt: '2025-04-10T09:00:00Z',
    updatedAt: '2026-03-20T08:00:00Z',
  },
  {
    id: 'TR-2026-004',
    employeeId: 'EMP-103',
    employeeName: 'Rajesh Kumar',
    employeeBadge: 'QA-6621',
    contractor: 'Al-Futtaim Heavy',
    department: 'Civil & Scaffolding',
    tradeRole: 'Scaffolder Lead',
    courseId: 'CRS-WAH-04',
    courseTitle: 'Working at Height & Fall Arrest Competency',
    trainingDate: '2024-02-15',
    expiryDate: '2026-02-15', // Already Expired
    certificateNumber: 'CERT-WAH-6621',
    trainer: 'T. Suresh',
    trainingProvider: 'PASMA Approved Centre',
    scoreAchievedPercent: 88,
    status: 'EXPIRED',
    createdAt: '2024-02-15T10:00:00Z',
    updatedAt: '2026-02-16T08:00:00Z',
  },
  {
    id: 'TR-2026-005',
    employeeId: 'EMP-104',
    employeeName: 'K. Venkatraman',
    employeeBadge: 'QA-6612',
    contractor: 'Siemens Energy',
    department: 'HV Substation Engineering',
    tradeRole: 'HV Electrical Authority',
    courseId: 'CRS-ELE-13',
    courseTitle: 'Electrical Safety, Arc Flash & LOTO Isolation',
    trainingDate: '2025-08-20',
    expiryDate: '2026-08-20',
    certificateNumber: 'CERT-ELE-6612',
    trainer: 'Eng. Venkatraman',
    trainingProvider: 'Siemens Power Academy',
    scoreAchievedPercent: 98,
    status: 'VALID',
    createdAt: '2025-08-20T10:00:00Z',
    updatedAt: '2025-08-20T10:00:00Z',
  },
  {
    id: 'TR-2026-006',
    employeeId: 'EMP-104',
    employeeName: 'K. Venkatraman',
    employeeBadge: 'QA-6612',
    contractor: 'Siemens Energy',
    department: 'HV Substation Engineering',
    tradeRole: 'HV Electrical Authority',
    courseId: 'CRS-PTW-08',
    courseTitle: 'Permit to Work (PTW) Issuer & Receiver Authority',
    trainingDate: '2025-09-01',
    expiryDate: '2027-09-01',
    certificateNumber: 'CERT-PTW-6612',
    trainer: 'Dr. Tariq Al-Mansoor',
    trainingProvider: 'Apex HSE Academy',
    scoreAchievedPercent: 94,
    status: 'VALID',
    createdAt: '2025-09-01T10:00:00Z',
    updatedAt: '2025-09-01T10:00:00Z',
  },
];

// ==========================================
// SEED: 12 CONFIGURABLE HSE KPIS
// ==========================================

export const DEFAULT_KPI_DEFINITIONS: KpiDefinitionModel[] = [
  {
    id: 'KPI-TRIR',
    code: 'TRIR',
    name: 'Total Recordable Incident Rate (TRIR)',
    nameAr: 'معدل الحوادث القابلة للتسجيل',
    category: 'LAGGING',
    description: '(Total Recordable Incidents × 200,000) / Total Man-Hours Worked. Industry benchmark <= 0.20.',
    calculationFormula: '(Recordables * 200000) / ManHours',
    targetThreshold: 0.20,
    unit: 'rate',
    isLowerBetter: true,
  },
  {
    id: 'KPI-LTIFR',
    code: 'LTIFR',
    name: 'Lost Time Injury Frequency Rate (LTIFR)',
    nameAr: 'معدل تكرار إصابات الوقت الضائع',
    category: 'LAGGING',
    description: '(Lost Time Injuries × 1,000,000) / Total Man-Hours Worked. World class target <= 0.05.',
    calculationFormula: '(LTI * 1000000) / ManHours',
    targetThreshold: 0.05,
    unit: 'rate',
    isLowerBetter: true,
  },
  {
    id: 'KPI-NEAR-MISS',
    code: 'NEAR_MISSES',
    name: 'Proactive Near Miss Reporting Count',
    nameAr: 'عدد بلاغات وشيك الوقوع الاستباقية',
    category: 'LEADING',
    description: 'Volume of near misses reported indicating an open safety reporting culture.',
    calculationFormula: 'Count(NearMisses)',
    targetThreshold: 45,
    unit: 'count',
    isLowerBetter: false,
  },
  {
    id: 'KPI-REC-INC',
    code: 'RECORDABLE_INCIDENTS',
    name: 'Total Recordable Incidents',
    nameAr: 'إجمالي الحوادث المسجلة',
    category: 'LAGGING',
    description: 'Sum of Fatalities, LTIs, Restricted Work, and Medical Treatment Cases.',
    calculationFormula: 'Count(RecordableIncidents)',
    targetThreshold: 0,
    unit: 'count',
    isLowerBetter: true,
  },
  {
    id: 'KPI-LTI',
    code: 'LOST_TIME_INJURIES',
    name: 'Lost Time Injuries (LTI)',
    nameAr: 'إصابات الوقت الضائع',
    category: 'LAGGING',
    description: 'Injuries causing loss of one or more subsequent working shifts.',
    calculationFormula: 'Count(LTI)',
    targetThreshold: 0,
    unit: 'count',
    isLowerBetter: true,
  },
  {
    id: 'KPI-FIRST-AID',
    code: 'FIRST_AID_CASES',
    name: 'First Aid Cases Treated on Site',
    nameAr: 'حالات الإسعاف الأولي الميدانية',
    category: 'LAGGING',
    description: 'Minor treatments handled at site clinics not escalating to medical treatment.',
    calculationFormula: 'Count(FirstAid)',
    targetThreshold: 4,
    unit: 'count',
    isLowerBetter: true,
  },
  {
    id: 'KPI-OBS',
    code: 'SAFETY_OBSERVATIONS',
    name: 'Safety Observations (SOR / STOP Cards)',
    nameAr: 'بطاقات الملاحظات الميدانية الاستباقية',
    category: 'LEADING',
    description: 'Behavioral safety observations logged by frontline supervisors and engineers.',
    calculationFormula: 'Count(Observations)',
    targetThreshold: 150,
    unit: 'count',
    isLowerBetter: false,
  },
  {
    id: 'KPI-INSP',
    code: 'INSPECTIONS_COMPLETED',
    name: 'Safety Inspections Completed',
    nameAr: 'عمليات التفتيش المكتملة',
    category: 'LEADING',
    description: 'Scheduled inspections performed across equipment, PPE, scaffolding, and excavations.',
    calculationFormula: 'Count(Inspections)',
    targetThreshold: 25,
    unit: 'count',
    isLowerBetter: false,
  },
  {
    id: 'KPI-AUDITS',
    code: 'AUDITS_COMPLETED',
    name: 'HSE Audits & Governance Reviews',
    nameAr: 'عمليات التدقيق والامتثال',
    category: 'LEADING',
    description: 'Formal ISO 45001 internal and contractor management audits performed.',
    calculationFormula: 'Count(Audits)',
    targetThreshold: 2,
    unit: 'count',
    isLowerBetter: false,
  },
  {
    id: 'KPI-CAPA',
    code: 'CAPA_ON_TIME_CLOSURE',
    name: 'Corrective Action (CAPA) On-Time Closure %',
    nameAr: 'نسبة إغلاق الإجراءات التصحيحية في موعدها',
    category: 'LEADING',
    description: 'Percentage of CAPAs verified and closed on or before target date.',
    calculationFormula: '(ClosedOnTime / TotalDue) * 100',
    targetThreshold: 95,
    unit: '%',
    isLowerBetter: false,
  },
  {
    id: 'KPI-TRAIN',
    code: 'TRAINING_COMPLETION',
    name: 'Workforce Training & Competency Compliance %',
    nameAr: 'نسبة امتثال التدريب وتأهيل القوى العاملة',
    category: 'LEADING',
    description: 'Active personnel holding 100% valid required training passport certifications.',
    calculationFormula: '(ValidWorkers / TotalActiveWorkers) * 100',
    targetThreshold: 92,
    unit: '%',
    isLowerBetter: false,
  },
  {
    id: 'KPI-PTW',
    code: 'PERMIT_COMPLIANCE',
    name: 'e-PTW Golden Rules Audit Compliance %',
    nameAr: 'نسبة الامتثال لتصاريح العمل الإلكترونية',
    category: 'LEADING',
    description: 'High-risk tasks operating under verified valid PTW, gas testing, and isolation.',
    calculationFormula: '(CompliantPermits / AuditedPermits) * 100',
    targetThreshold: 98,
    unit: '%',
    isLowerBetter: false,
  },
];

// Historical monthly trend data for KPIs
export const DEFAULT_KPI_HISTORICAL_SERIES: KpiDataPoint[] = [
  { periodKey: '2025-10', periodLabel: 'Oct 2025', actualValue: 0.19, targetValue: 0.20, manHoursWorked: 480000, recordablesCount: 1, lostTimeCount: 0, nearMissCount: 38, inspectionsCompleted: 22, auditsCompleted: 2, capasClosedOnTimePercent: 91, trainingCompliancePercent: 88, permitCompliancePercent: 96 },
  { periodKey: '2025-11', periodLabel: 'Nov 2025', actualValue: 0.18, targetValue: 0.20, manHoursWorked: 510000, recordablesCount: 1, lostTimeCount: 0, nearMissCount: 42, inspectionsCompleted: 24, auditsCompleted: 2, capasClosedOnTimePercent: 93, trainingCompliancePercent: 90, permitCompliancePercent: 97 },
  { periodKey: '2025-12', periodLabel: 'Dec 2025', actualValue: 0.16, targetValue: 0.20, manHoursWorked: 530000, recordablesCount: 1, lostTimeCount: 0, nearMissCount: 47, inspectionsCompleted: 26, auditsCompleted: 3, capasClosedOnTimePercent: 94, trainingCompliancePercent: 91, permitCompliancePercent: 98 },
  { periodKey: '2026-01', periodLabel: 'Jan 2026', actualValue: 0.15, targetValue: 0.20, manHoursWorked: 560000, recordablesCount: 1, lostTimeCount: 0, nearMissCount: 52, inspectionsCompleted: 27, auditsCompleted: 2, capasClosedOnTimePercent: 96, trainingCompliancePercent: 93, permitCompliancePercent: 98 },
  { periodKey: '2026-02', periodLabel: 'Feb 2026', actualValue: 0.14, targetValue: 0.20, manHoursWorked: 580000, recordablesCount: 0, lostTimeCount: 0, nearMissCount: 56, inspectionsCompleted: 28, auditsCompleted: 3, capasClosedOnTimePercent: 97, trainingCompliancePercent: 94, permitCompliancePercent: 99 },
  { periodKey: '2026-03', periodLabel: 'Mar 2026', actualValue: 0.12, targetValue: 0.20, manHoursWorked: 610000, recordablesCount: 1, lostTimeCount: 0, nearMissCount: 58, inspectionsCompleted: 30, auditsCompleted: 3, capasClosedOnTimePercent: 98, trainingCompliancePercent: 95, permitCompliancePercent: 99 },
];

// ==========================================
// SEED: PERMITS TO WORK (10 DISCIPLINES)
// ==========================================

export const DEFAULT_PERMITS: PermitToWorkModel[] = [
  {
    id: 'PTW-2026-1108',
    permitNumber: 'PTW-2026-1108',
    permitType: 'HOT_WORK',
    workDescription: 'TIG & MMA Welding on 12-inch 316L Stainless Steel Condensate Header Line at Elevation +6.5m.',
    location: 'Process Train Unit 3 - Piperack Bay 14',
    contractor: 'CCC Mechanical & Piping Consortium',
    workPartyCount: 5,
    workPartyLead: 'Mahmoud Al-Zahrani (Pipe Fitter Lead)',
    workPartyMembers: ['Mahmoud Al-Zahrani', 'S. Govindan (Welder)', 'Ali Raza (Grinder)', 'K. Rahman (Fire Watch)', 'J. Morales'],
    issuer: 'Eng. Salem Al-Hajri (Issuing Authority)',
    receiver: 'Mahmoud Al-Zahrani (Performing Authority)',
    projectId: 'PRJ-RL-01',
    projectName: 'Ras Laffan EPC-4 Liquefaction Expansion',
    linkedRiskAssessmentId: 'RA-2026-001',
    linkedRiskAssessmentTitle: 'Heavy Dual-Crane Tandem Lift',
    linkedDocumentIds: ['DOC-SOP-01'],
    linkedDocumentCodes: ['HSE-SOP-001'],
    controlsSummary: 'Fire blanket containment enclosure, 2x 9kg dry chemical extinguishers within 3m, spark shields, non-combustible habitat enclosure.',
    mandatoryPpe: ['Hard Hat', 'Safety Boots', 'Leather Welding Jacket', 'Auto-Darkening Welding Hood', 'Cut-5 Gloves', 'Safety Glasses'],
    requiresFireWatch: true,
    requiresStandbyPerson: false,
    requiresIsolation: true,
    isolations: [
      { id: 'ISO-01', tagNumber: 'V-401B', equipmentDescription: 'Condensate Header Manual Gate Valve', isolationType: 'VALVE_LOCKOUT', lockNumber: 'LOTO-RED-8812', appliedBy: 'Operator Karim', verifiedBy: 'Eng. Salem' },
    ],
    requiresGasTesting: true,
    gasTesterName: 'Subramanian Raman (Authorized Gas Tester #AGT-401)',
    gasTestingDateTime: '2026-03-24T07:45:00Z',
    gasTestPassed: true,
    gasReadings: [
      { gasName: 'Oxygen (O2)', unit: '%', measuredValue: 20.9, safeLimitDescription: '19.5% - 23.5%', isAcceptable: true },
      { gasName: 'Flammable LEL', unit: '%', measuredValue: 0.0, safeLimitDescription: '< 10% LEL', isAcceptable: true },
      { gasName: 'Hydrogen Sulfide (H2S)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 5 ppm', isAcceptable: true },
      { gasName: 'Carbon Monoxide (CO)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 25 ppm', isAcceptable: true },
    ],
    emergencyArrangements: 'Direct radio channel 4 to Site Emergency Operations Centre. Continuous fire watch during and 60 minutes after work.',
    assemblyPoint: 'Primary Assembly Station #3 (North Substation Gate)',
    nearestFireStationOrStandby: 'RLIC Fire Station #2 (Response time 3 mins)',
    startDateTime: '2026-03-24T08:00',
    expiryDateTime: '2026-03-24T18:00',
    status: 'ACTIVE',
    approvals: {
      issuingAuthoritySigned: true,
      issuingAuthorityName: 'Eng. Salem Al-Hajri',
      issuingSignedAt: '2026-03-24T07:50:00Z',
      performingAuthoritySigned: true,
      performingAuthorityName: 'Mahmoud Al-Zahrani',
      performingSignedAt: '2026-03-24T07:55:00Z',
      safetyOfficerSigned: true,
      safetyOfficerName: 'Dr. Tariq Al-Mansoor',
      safetySignedAt: '2026-03-24T08:00:00Z',
    },
    createdAt: '2026-03-24T07:30:00Z',
    updatedAt: '2026-03-24T08:00:00Z',
  },
  {
    id: 'PTW-2026-1109',
    permitNumber: 'PTW-2026-1109',
    permitType: 'CONFINED_SPACE',
    workDescription: 'Internal vessel cleaning and refractory thickness ultrasonic testing inside Amine Contactor Column V-201.',
    location: 'Acid Gas Removal Unit - Column V-201 Manway #2',
    contractor: 'CCC Consortium',
    workPartyCount: 4,
    workPartyLead: 'Saad Al-Otaibi',
    workPartyMembers: ['Saad Al-Otaibi', 'M. Rahman', 'D. Silva', 'R. Kumar (Sentry)'],
    issuer: 'Eng. Salem Al-Hajri',
    receiver: 'Saad Al-Otaibi',
    projectId: 'PRJ-RL-01',
    projectName: 'Ras Laffan EPC-4 Liquefaction Expansion',
    controlsSummary: 'Forced mechanical ventilation blower 2500 CFM, dedicated hole watcher with entrant log, 4-gas multi-detector worn at chest level, rescue tripod and winch deployed.',
    mandatoryPpe: ['Full Body Harness', 'Hard Hat with Chinstrap', 'Rubber Chemical Boots', 'Nitrile Chemical Gauntlets', 'Half-Mask Cartridge Respirator'],
    requiresFireWatch: false,
    requiresStandbyPerson: true,
    requiresIsolation: true,
    isolations: [
      { id: 'ISO-02', tagNumber: 'SP-201', equipmentDescription: 'Acid Gas Supply Spool Piece Blinded', isolationType: 'MECHANICAL_BLIND', lockNumber: 'BLIND-B-14', appliedBy: 'Technician Khalid', verifiedBy: 'Eng. Salem' },
    ],
    requiresGasTesting: true,
    gasTesterName: 'Subramanian Raman (AGT-401)',
    gasTestingDateTime: '2026-03-24T08:15:00Z',
    gasTestPassed: true,
    gasReadings: [
      { gasName: 'Oxygen (O2)', unit: '%', measuredValue: 20.8, safeLimitDescription: '19.5% - 23.5%', isAcceptable: true },
      { gasName: 'Flammable LEL', unit: '%', measuredValue: 0.0, safeLimitDescription: '< 10%', isAcceptable: true },
      { gasName: 'Hydrogen Sulfide (H2S)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 5 ppm', isAcceptable: true },
      { gasName: 'Carbon Monoxide (CO)', unit: 'ppm', measuredValue: 0.0, safeLimitDescription: '< 25 ppm', isAcceptable: true },
    ],
    emergencyArrangements: 'Dedicated rescue retrieval winch over manway with 15-minute emergency escape packs.',
    assemblyPoint: 'Muster Point #3',
    nearestFireStationOrStandby: 'Site Confined Space Rescue Team Standby',
    startDateTime: '2026-03-24T08:30',
    expiryDateTime: '2026-03-24T16:30',
    status: 'ACTIVE',
    approvals: {
      issuingAuthoritySigned: true,
      issuingAuthorityName: 'Eng. Salem Al-Hajri',
      issuingSignedAt: '2026-03-24T08:20:00Z',
      performingAuthoritySigned: true,
      performingAuthorityName: 'Saad Al-Otaibi',
      performingSignedAt: '2026-03-24T08:25:00Z',
      safetyOfficerSigned: true,
      safetyOfficerName: 'Dr. Tariq Al-Mansoor',
      safetySignedAt: '2026-03-24T08:30:00Z',
    },
    createdAt: '2026-03-24T08:00:00Z',
    updatedAt: '2026-03-24T08:30:00Z',
  },
  {
    id: 'PTW-2026-1110',
    permitNumber: 'PTW-2026-1110',
    permitType: 'WORKING_AT_HEIGHT',
    workDescription: 'Installation of high-level cable tray supports on Flare Stack Derrick at Elevation +42m.',
    location: 'Flare K.O. Drum & Derrick Structure #1',
    contractor: 'Al-Futtaim Heavy Construction',
    workPartyCount: 3,
    workPartyLead: 'Rajesh Kumar',
    workPartyMembers: ['Rajesh Kumar', 'T. Suresh', 'B. Patel'],
    issuer: 'Eng. Farhan Al-Kuwari',
    receiver: 'Rajesh Kumar',
    projectId: 'PRJ-RL-01',
    projectName: 'Ras Laffan EPC-4 Liquefaction Expansion',
    controlsSummary: '100% dual lanyard tie-off, certified anchor points, tool lanyards on all wrenches and drill drivers, red exclusion zone barricaded beneath.',
    mandatoryPpe: ['Full Body Harness with Shock Absorber', 'Hard Hat with Chinstrap', 'Safety Glasses', 'Safety Boots', 'Anti-Drop Tool Wrist Tethers'],
    requiresFireWatch: false,
    requiresStandbyPerson: true,
    requiresIsolation: false,
    isolations: [],
    requiresGasTesting: false,
    gasTestPassed: true,
    gasReadings: [],
    emergencyArrangements: 'High angle rope rescue kit staged at base of derrick.',
    assemblyPoint: 'Assembly Station #1',
    nearestFireStationOrStandby: 'Safety Standby Team',
    startDateTime: '2026-03-24T09:00',
    expiryDateTime: '2026-03-24T17:00',
    status: 'ACTIVE',
    approvals: {
      issuingAuthoritySigned: true,
      issuingAuthorityName: 'Eng. Farhan Al-Kuwari',
      issuingSignedAt: '2026-03-24T08:50:00Z',
      performingAuthoritySigned: true,
      performingAuthorityName: 'Rajesh Kumar',
      performingSignedAt: '2026-03-24T08:55:00Z',
      safetyOfficerSigned: true,
      safetyOfficerName: 'Dr. Tariq Al-Mansoor',
      safetySignedAt: '2026-03-24T09:00:00Z',
    },
    createdAt: '2026-03-24T08:30:00Z',
    updatedAt: '2026-03-24T09:00:00Z',
  },
  {
    id: 'PTW-2026-1102',
    permitNumber: 'PTW-2026-1102',
    permitType: 'ELECTRICAL_ISOLATION',
    workDescription: '415V Motor Control Center (MCC) Busbar Shroud Retrofit & Insulation Megger Testing.',
    location: 'Substation Building SS-03 Switchgear Room',
    contractor: 'Siemens Energy',
    workPartyCount: 3,
    workPartyLead: 'K. Venkatraman (HV Authority)',
    workPartyMembers: ['K. Venkatraman', 'Khalid Al-Ghamdi', 'P. Anand'],
    issuer: 'Eng. Salem Al-Hajri',
    receiver: 'K. Venkatraman',
    projectId: 'PRJ-RL-01',
    projectName: 'Ras Laffan EPC-4 Liquefaction Expansion',
    controlsSummary: 'Rack out main breaker CB-301, prove dead with calibrated proximity detector, apply earth switch and red master padlock.',
    mandatoryPpe: ['Arc Flash Suit 40 cal/cm²', 'Insulating Gloves Class 0 (1000V)', 'Safety Boots EH-Rated', 'Arc Face Shield'],
    requiresFireWatch: false,
    requiresStandbyPerson: true,
    requiresIsolation: true,
    isolations: [
      { id: 'ISO-03', tagNumber: 'CB-301', equipmentDescription: '415V Incomer Breaker', isolationType: 'ELECTRICAL_LOTO', lockNumber: 'LOTO-ELEC-401', appliedBy: 'K. Venkatraman', verifiedBy: 'Eng. Salem' },
    ],
    requiresGasTesting: false,
    gasTestPassed: true,
    gasReadings: [],
    emergencyArrangements: 'Electrical rescue crook staged at substation door. First aider present.',
    assemblyPoint: 'Muster Point #2',
    nearestFireStationOrStandby: 'Substation Medic',
    startDateTime: '2026-03-20T08:00',
    expiryDateTime: '2026-03-20T16:00',
    status: 'CLOSED',
    approvals: {
      issuingAuthoritySigned: true,
      issuingAuthorityName: 'Eng. Salem Al-Hajri',
      issuingSignedAt: '2026-03-20T07:50:00Z',
      performingAuthoritySigned: true,
      performingAuthorityName: 'K. Venkatraman',
      performingSignedAt: '2026-03-20T07:55:00Z',
      safetyOfficerSigned: true,
      safetyOfficerName: 'Dr. Tariq Al-Mansoor',
      safetySignedAt: '2026-03-20T08:00:00Z',
    },
    closureDetails: {
      closedAt: '2026-03-20T16:15:00Z',
      closedBy: 'Eng. Salem Al-Hajri',
      worksiteRestoredClean: true,
      isolationsRemoved: true,
      comments: 'Work completed, busbar megger tested satisfactory at >100 MOhm. Isolations removed and panel energized.',
    },
    createdAt: '2026-03-20T07:30:00Z',
    updatedAt: '2026-03-20T16:15:00Z',
  },
];

// ==========================================
// PHASE 7 SERVICE IMPLEMENTATION
// ==========================================

class Phase7Service {
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      // 1. Seed Training Courses
      const existingCourses = await indexedDbService.getAll<TrainingCourseModel>('training_courses');
      if (!existingCourses || existingCourses.length === 0) {
        for (const crs of DEFAULT_TRAINING_COURSES) {
          await indexedDbService.put('training_courses', crs);
        }
      }

      // 2. Seed Training Records
      const existingRecords = await indexedDbService.getAll<EmployeeTrainingRecordModel>('training_records');
      if (!existingRecords || existingRecords.length === 0) {
        for (const tr of DEFAULT_TRAINING_RECORDS) {
          await indexedDbService.put('training_records', tr);
        }
      }

      // 3. Seed KPI Definitions
      const existingKpis = await indexedDbService.getAll<KpiDefinitionModel>('kpis');
      if (!existingKpis || existingKpis.length === 0) {
        for (const k of DEFAULT_KPI_DEFINITIONS) {
          await indexedDbService.put('kpis', k);
        }
      }

      // 4. Seed Permits to Work
      const existingPermits = await indexedDbService.getAll<PermitToWorkModel>('permits_to_work');
      if (!existingPermits || existingPermits.length === 0) {
        for (const p of DEFAULT_PERMITS) {
          await indexedDbService.put('permits_to_work', p);
        }
      }

      this.initialized = true;
    } catch (err) {
      console.warn('Phase7Service initialization warning:', err);
      this.initialized = true;
    }
  }

  // ==========================================
  // A. TRAINING MANAGEMENT METHODS
  // ==========================================

  public async getTrainingCourses(): Promise<TrainingCourseModel[]> {
    await this.init();
    const courses = await indexedDbService.getAll<TrainingCourseModel>('training_courses');
    return courses.sort((a, b) => a.code.localeCompare(b.code));
  }

  public async saveTrainingCourse(course: TrainingCourseModel): Promise<TrainingCourseModel> {
    await this.init();
    const now = new Date().toISOString();
    const updated: TrainingCourseModel = {
      ...course,
      updatedAt: now,
      createdAt: course.createdAt || now,
    };
    await indexedDbService.put('training_courses', updated);
    return updated;
  }

  public async deleteTrainingCourse(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('training_courses', id);
    return true;
  }

  public async getEmployeeTrainingRecords(): Promise<EmployeeTrainingRecordModel[]> {
    await this.init();
    const records = await indexedDbService.getAll<EmployeeTrainingRecordModel>('training_records');
    const today = new Date().toISOString().split('T')[0];

    // Compute dynamic expiry status
    const enriched = records.map((rec) => {
      let status: TrainingRecordStatus = 'VALID';
      if (!rec.trainingDate) {
        status = 'NOT COMPLETED';
      } else if (rec.expiryDate && rec.expiryDate < today) {
        status = 'EXPIRED';
      } else if (rec.expiryDate) {
        const daysToExpiry = (new Date(rec.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24);
        if (daysToExpiry <= 30) {
          status = 'EXPIRING';
        }
      }
      return { ...rec, status };
    });

    return enriched.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
  }

  public async saveTrainingRecord(record: EmployeeTrainingRecordModel): Promise<EmployeeTrainingRecordModel> {
    await this.init();
    const now = new Date().toISOString();
    const today = now.split('T')[0];

    let computedStatus: TrainingRecordStatus = 'VALID';
    if (!record.trainingDate) {
      computedStatus = 'NOT COMPLETED';
    } else if (record.expiryDate && record.expiryDate < today) {
      computedStatus = 'EXPIRED';
    } else if (record.expiryDate) {
      const daysToExpiry = (new Date(record.expiryDate).getTime() - new Date(today).getTime()) / (1000 * 3600 * 24);
      if (daysToExpiry <= 30) {
        computedStatus = 'EXPIRING';
      }
    }

    const updated: EmployeeTrainingRecordModel = {
      ...record,
      status: computedStatus,
      updatedAt: now,
      createdAt: record.createdAt || now,
    };
    await indexedDbService.put('training_records', updated);
    return updated;
  }

  public async deleteTrainingRecord(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('training_records', id);
    return true;
  }

  // ==========================================
  // B. KPI MANAGEMENT METHODS
  // ==========================================

  public async getKpiDefinitions(): Promise<KpiDefinitionModel[]> {
    await this.init();
    return indexedDbService.getAll<KpiDefinitionModel>('kpis');
  }

  public async saveKpiDefinition(kpi: KpiDefinitionModel): Promise<KpiDefinitionModel> {
    await this.init();
    await indexedDbService.put('kpis', kpi);
    return kpi;
  }

  public async getKpiAnalytics(periodType: KpiPeriodType = 'MONTHLY'): Promise<KpiSummaryReport[]> {
    await this.init();
    const defs = await this.getKpiDefinitions();
    const series = DEFAULT_KPI_HISTORICAL_SERIES;
    const latest = series[series.length - 1];

    return defs.map((def) => {
      let currentVal = 0;
      switch (def.code) {
        case 'TRIR':
          currentVal = latest.actualValue;
          break;
        case 'LTIFR':
          currentVal = 0.00;
          break;
        case 'NEAR_MISSES':
          currentVal = latest.nearMissCount || 58;
          break;
        case 'RECORDABLE_INCIDENTS':
          currentVal = latest.recordablesCount || 1;
          break;
        case 'LOST_TIME_INJURIES':
          currentVal = latest.lostTimeCount || 0;
          break;
        case 'FIRST_AID_CASES':
          currentVal = 2;
          break;
        case 'SAFETY_OBSERVATIONS':
          currentVal = 184;
          break;
        case 'INSPECTIONS_COMPLETED':
          currentVal = latest.inspectionsCompleted || 30;
          break;
        case 'AUDITS_COMPLETED':
          currentVal = latest.auditsCompleted || 3;
          break;
        case 'CAPA_ON_TIME_CLOSURE':
          currentVal = latest.capasClosedOnTimePercent || 98;
          break;
        case 'TRAINING_COMPLETION':
          currentVal = latest.trainingCompliancePercent || 95;
          break;
        case 'PERMIT_COMPLIANCE':
          currentVal = latest.permitCompliancePercent || 99;
          break;
        default:
          currentVal = def.targetThreshold;
      }

      const onTarget = def.isLowerBetter
        ? currentVal <= def.targetThreshold
        : currentVal >= def.targetThreshold;

      // Group series data according to periodType if needed
      let points = series;
      if (periodType === 'QUARTERLY') {
        points = [
          { periodKey: '2025-Q4', periodLabel: 'Q4 2025', actualValue: 0.18, targetValue: 0.20, manHoursWorked: 1520000 },
          { periodKey: '2026-Q1', periodLabel: 'Q1 2026', actualValue: 0.12, targetValue: 0.20, manHoursWorked: 1750000 },
        ];
      } else if (periodType === 'YEARLY') {
        points = [
          { periodKey: '2024', periodLabel: 'Year 2024', actualValue: 0.22, targetValue: 0.20, manHoursWorked: 4800000 },
          { periodKey: '2025', periodLabel: 'Year 2025', actualValue: 0.17, targetValue: 0.20, manHoursWorked: 6200000 },
          { periodKey: '2026', periodLabel: 'Year 2026 (YTD)', actualValue: 0.12, targetValue: 0.20, manHoursWorked: 1750000 },
        ];
      }

      return {
        kpiCode: def.code,
        name: def.name,
        category: def.category,
        currentValue: currentVal,
        targetValue: def.targetThreshold,
        unit: def.unit,
        onTarget,
        trend: 'DOWN',
        historicalPoints: points,
      };
    });
  }

  // ==========================================
  // C. PERMIT TO WORK METHODS
  // ==========================================

  public async getPermits(): Promise<PermitToWorkModel[]> {
    await this.init();
    const records = await indexedDbService.getAll<PermitToWorkModel>('permits_to_work');
    const now = new Date().toISOString();

    // Compute automatic expired status
    const enriched = records.map((p) => {
      if ((p.status === 'ACTIVE' || p.status === 'ISSUED') && p.expiryDateTime && p.expiryDateTime < now) {
        return { ...p, status: 'EXPIRED' as const };
      }
      return p;
    });

    return enriched.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public async getPermitById(id: string): Promise<PermitToWorkModel | null> {
    await this.init();
    return indexedDbService.get<PermitToWorkModel>('permits_to_work', id);
  }

  public async savePermit(permit: PermitToWorkModel): Promise<PermitToWorkModel> {
    await this.init();
    const now = new Date().toISOString();
    const updated: PermitToWorkModel = {
      ...permit,
      updatedAt: now,
      createdAt: permit.createdAt || now,
    };
    await indexedDbService.put('permits_to_work', updated);
    return updated;
  }

  public async deletePermit(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('permits_to_work', id);
    return true;
  }

  // Status transitions
  public async activatePermit(id: string, safetyOfficerName: string): Promise<PermitToWorkModel | null> {
    await this.init();
    const permit = await this.getPermitById(id);
    if (!permit) return null;

    permit.status = 'ACTIVE';
    permit.approvals.safetyOfficerSigned = true;
    permit.approvals.safetyOfficerName = safetyOfficerName;
    permit.approvals.safetySignedAt = new Date().toISOString();

    return this.savePermit(permit);
  }

  public async suspendPermit(id: string, reason: string): Promise<PermitToWorkModel | null> {
    await this.init();
    const permit = await this.getPermitById(id);
    if (!permit) return null;

    permit.status = 'SUSPENDED';
    permit.suspensionReason = reason;

    return this.savePermit(permit);
  }

  public async closePermit(
    id: string,
    closedBy: string,
    comments: string,
    restoredClean: boolean = true,
    isolationsRemoved: boolean = true
  ): Promise<PermitToWorkModel | null> {
    await this.init();
    const permit = await this.getPermitById(id);
    if (!permit) return null;

    permit.status = 'CLOSED';
    permit.closureDetails = {
      closedAt: new Date().toISOString(),
      closedBy,
      comments,
      worksiteRestoredClean: restoredClean,
      isolationsRemoved,
    };

    return this.savePermit(permit);
  }
}

export const phase7Service = new Phase7Service();
