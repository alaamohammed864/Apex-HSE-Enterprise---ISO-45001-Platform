/**
 * Risk Management Service — ISO 45001 & ALARP Engine
 * Persists Hazards, Control Measures, Risk Assessments, and Configurable 5x5 Matrix to IndexedDB.
 */

import { indexedDbService } from './db';
import {
  HazardItem,
  ControlMeasureItem,
  RiskAssessmentRecord,
  RiskMatrixConfig,
  RiskTierId,
} from '../types/risk';

export const DEFAULT_RISK_MATRIX_CONFIG: RiskMatrixConfig = {
  id: 'DEFAULT_5X5_MATRIX',
  name: 'Standard ISO 45001 5x5 Industrial Matrix',
  nameAr: 'مصفوفة تقييم المخاطر الصناعية القياسية 5×5 (ISO 45001)',
  likelihoodLevels: [
    {
      level: 1,
      code: 'L1',
      name: '1 - Rare',
      nameAr: '1 - نادر جداً',
      description: 'May occur only in exceptional circumstances (< 1 in 10 years).',
      frequency: '< 0.1 / yr',
    },
    {
      level: 2,
      code: 'L2',
      name: '2 - Unlikely',
      nameAr: '2 - غير محتمل',
      description: 'Could occur at some time, remote possibility in this industry.',
      frequency: 'Once in 5-10 yrs',
    },
    {
      level: 3,
      code: 'L3',
      name: '3 - Possible',
      nameAr: '3 - محتمل',
      description: 'Might occur occasionally, known history in similar facilities.',
      frequency: 'Once in 1-5 yrs',
    },
    {
      level: 4,
      code: 'L4',
      name: '4 - Likely',
      nameAr: '4 - مرجح',
      description: 'Will probably occur in most circumstances; frequent occurrence.',
      frequency: 'Once in 1-12 mos',
    },
    {
      level: 5,
      code: 'L5',
      name: '5 - Almost Certain',
      nameAr: '5 - شبه مؤكد',
      description: 'Expected to occur frequently, daily or weekly operational hazard.',
      frequency: '> 1 / month',
    },
  ],
  severityLevels: [
    {
      level: 1,
      code: 'S1',
      name: '1 - Insignificant',
      nameAr: '1 - طفيف جداً',
      description: 'First aid only; negligible environmental or material damage (< $5k).',
      safetyImpact: 'First Aid / Superficial',
    },
    {
      level: 2,
      code: 'S2',
      name: '2 - Minor',
      nameAr: '2 - بسيط',
      description: 'Medical treatment case; localized minor environmental spill (< $25k).',
      safetyImpact: 'Medical Treatment / Non-Lost Time',
    },
    {
      level: 3,
      code: 'S3',
      name: '3 - Moderate',
      nameAr: '3 - متوسط',
      description: 'Lost time injury (< 30 days); contained on-site spill; downtime (< $100k).',
      safetyImpact: 'Lost Time Incident (<30 Days)',
    },
    {
      level: 4,
      code: 'S4',
      name: '4 - Major',
      nameAr: '4 - جوهري / بليغ',
      description: 'Permanent disability; major fire/structural collapse; off-site impact (< $1M).',
      safetyImpact: 'Permanent Disability / Extensive Loss',
    },
    {
      level: 5,
      code: 'S5',
      name: '5 - Catastrophic',
      nameAr: '5 - كارثي',
      description: 'Fatality (single or multiple); catastrophic plant destruction (> $1M).',
      safetyImpact: 'Fatalities / Catastrophic Destruction',
    },
  ],
  riskTiers: [
    {
      id: 'LOW',
      name: 'Low / Broadly Acceptable',
      nameAr: 'منخفض / مقبول إجمالاً',
      minScore: 1,
      maxScore: 4,
      color: '#10b981',
      textColor: '#ffffff',
      bgClass: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
      borderClass: 'border-emerald-500',
      textClass: 'text-emerald-400',
      actionRequired: 'Manage by routine procedures. Standard PPE and supervision sufficient.',
      actionRequiredAr: 'تتم الإدارة من خلال الإجراءات التشغيلية المعتادة. معدات الوقاية والإشراف كافية.',
    },
    {
      id: 'MEDIUM',
      name: 'Medium / Tolerable (ALARP Required)',
      nameAr: 'متوسط / مقبول بشرط ALARP',
      minScore: 5,
      maxScore: 9,
      color: '#eab308',
      textColor: '#000000',
      bgClass: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
      borderClass: 'border-amber-500',
      textClass: 'text-amber-400',
      actionRequired: 'Implement specific engineering/administrative controls. Formal ALARP justification needed.',
      actionRequiredAr: 'تطبيق ضوابط هندسية وإدارية محددة. يلزم تقديم تبرير معتمد لـ ALARP.',
    },
    {
      id: 'HIGH',
      name: 'High / Substantial Risk',
      nameAr: 'عالي / خطر جوهري',
      minScore: 10,
      maxScore: 14,
      color: '#f97316',
      textColor: '#ffffff',
      bgClass: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
      borderClass: 'border-orange-500',
      textClass: 'text-orange-400',
      actionRequired: 'Strict control regime. PTW mandatory. HSE Lead sign-off prior to task commencement.',
      actionRequiredAr: 'نظام رقابة صارم. تصريح العمل (PTW) إلزامي. موافقة رئيس السلامة مطلوبة قبل البدء.',
    },
    {
      id: 'EXTREME',
      name: 'Extreme / Unacceptable Risk',
      nameAr: 'شديد الخطورة / غير مقبول إطلاقاً',
      minScore: 15,
      maxScore: 25,
      color: '#ef4444',
      textColor: '#ffffff',
      bgClass: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
      borderClass: 'border-rose-500',
      textClass: 'text-rose-400',
      actionRequired: 'STOP-WORK MANDATORY. Activity cannot commence without fundamental engineering redesign.',
      actionRequiredAr: 'إيقاف العمل إلزامي. يحظر مباشرة النشاط دون إعادة تصميم هندسي جذري.',
    },
  ],
  updatedAt: new Date().toISOString(),
  updatedBy: 'HSE Director (Admin)',
};

// Seed Hazard Catalogue
export const SEED_HAZARDS: HazardItem[] = [
  {
    id: 'HAZ-001',
    code: 'HAZ-PHYS-01',
    category: 'PHYSICAL',
    title: 'Working at Height (> 1.8m) / Fall Hazard',
    titleAr: 'العمل على ارتفاعات (> 1.8 م) / خطر السقوط',
    description: 'Fall of personnel or dropped tools from scaffolding, piperacks, or elevated platforms.',
    potentialConsequences: ['Severe bodily injury', 'Permanent disability', 'Fatal trauma'],
    standardReference: 'OSHA 1926.501 / ISO 45001 §8.1.2',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-002',
    code: 'HAZ-MECH-02',
    category: 'MECHANICAL',
    title: 'Heavy Tandem Crane Lifting / Boom Failure',
    titleAr: 'الرفع الثقيل المزدوج بالرافعات / عطل ذراع الرافعة',
    description: 'Suspended load loss, ground subsidence under outriggers, high wind gust boom overload.',
    potentialConsequences: ['Crush injury', 'Asset destruction', 'Multiple fatalities'],
    standardReference: 'BS 7121 / ASME B30.5',
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-003',
    code: 'HAZ-CHEM-03',
    category: 'CHEMICAL',
    title: 'Hydrogen Sulfide (H2S) & Toxic Gas Ingress',
    titleAr: 'غاز كبريتيد الهيدروجين (H2S) ودخول الغازات السامة',
    description: 'Accumulation of pyrophoric or toxic gas in deep excavations, trenches, or vessels.',
    potentialConsequences: ['Asphyxiation', 'Instant olfactory paralysis', 'Fatality within seconds'],
    standardReference: 'NFPA 55 / OSHA 1910.1000',
    status: 'ACTIVE',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-004',
    code: 'HAZ-PHYS-04',
    category: 'PHYSICAL',
    title: 'Deep Trenching & Excavation Collapse',
    titleAr: 'انهيار التربة في الحفريات والخنادق العميقة',
    description: 'Trench cave-in due to vibration from heavy plant, rainwater softening, or improper benching.',
    potentialConsequences: ['Suffocation under soil mass', 'Crush asphyxia'],
    standardReference: 'OSHA 1926 Subpart P',
    status: 'ACTIVE',
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-005',
    code: 'HAZ-ELEC-05',
    category: 'ELECTRICAL',
    title: 'High Voltage Flashover / Live Busbar Contact',
    titleAr: 'وميض كهربائي عالي الجهد / ملامسة قضبان التوصيل الحية',
    description: 'Electric arc flash explosion during substation testing or cable pulling near energized switchgear.',
    potentialConsequences: ['Severe third-degree burns', 'Cardiac arrest', 'Blast impact'],
    standardReference: 'NFPA 70E / IEC 60909',
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-006',
    code: 'HAZ-PHYS-06',
    category: 'PHYSICAL',
    title: 'Confined Space Oxygen Depletion & Entrapment',
    titleAr: 'نقص الأكسجين والانحباس في الأماكن المغلقة',
    description: 'Working inside vessels, column tanks, or culverts with restricted ingress/egress.',
    potentialConsequences: ['Hypoxia', 'Loss of consciousness', 'Multiple casualty entrapment'],
    standardReference: 'OSHA 1910.146 / ISO 45001 §8.1.2',
    status: 'ACTIVE',
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-007',
    code: 'HAZ-PHYS-07',
    category: 'PHYSICAL',
    title: 'Hydrocarbon Hot Work / Vapor Ignition',
    titleAr: 'الأعمال الساخنة بالقرب من الهيدروكربونات / اشتعال الأبخرة',
    description: 'Sparks from grinding or welding igniting residual flammable vapors in live pipe tracks.',
    potentialConsequences: ['Vapor cloud explosion (VCE)', 'Flash fire', 'Major property destruction'],
    standardReference: 'NFPA 51B / API RP 2009',
    status: 'ACTIVE',
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-008',
    code: 'HAZ-PHYS-08',
    category: 'PHYSICAL',
    title: 'Industrial Radiography (NDT) Gamma Radiation Exposure',
    titleAr: 'التعرض للإشعاع في اختبارات التصوير الصناعي (NDT)',
    description: 'Gamma ray source unshielded exposure (Iridium-192 / Cobalt-60) during weld inspections.',
    potentialConsequences: ['Radiation sickness', 'Cellular tissue damage', 'Fatal radiation dose'],
    standardReference: 'IAEA Safety Standards / 10 CFR 34',
    status: 'ACTIVE',
    createdAt: '2026-01-20T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'HAZ-009',
    code: 'HAZ-ENV-09',
    category: 'ENVIRONMENTAL',
    title: 'Extreme Heat Stress (> 48°C Wet Bulb Globe Index)',
    titleAr: 'الإجهاد الحراري الشديد في بيئة الخليج الصيفية',
    description: 'Dehydration, heat cramps, and heat stroke among outdoor workforce in summer conditions.',
    potentialConsequences: ['Heat exhaustion', 'Organ failure', 'Fatal heat stroke'],
    standardReference: 'Qatar Labor Law / OSHA Technical Manual',
    status: 'ACTIVE',
    createdAt: '2026-01-22T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
];

// Seed Control Measures Catalogue
export const SEED_CONTROL_MEASURES: ControlMeasureItem[] = [
  {
    id: 'CTRL-001',
    code: 'CTRL-ENG-01',
    hierarchyLevel: 'ENGINEERING',
    title: 'Hydraulic Slide-Rail Trench Shoring Box (45 kN/m²)',
    titleAr: 'صناديق تدعيم هيدروليكية ذات سكة انزلاقية للحفريات',
    description: 'Pre-fabricated structural steel shields installed prior to personnel entry in trenches.',
    verificationMethod: 'Third-party structural engineering calculation & daily pre-shift inspection certificate.',
    typicalEffectiveness: 85,
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-002',
    code: 'CTRL-ENG-02',
    hierarchyLevel: 'ENGINEERING',
    title: 'Continuous Fixed 4-Gas Telemetry Monitoring & Auto-Alarm',
    titleAr: 'أجهزة قياس الغازات الرباعية اللاسلكية الثابتة مع إنذار فوري',
    description: 'Fixed LEL, O2, H2S, and CO sensors with 85dB strobe sirens and telemetry back to Control Room.',
    verificationMethod: 'Daily bump test and weekly calibration certificate using span gas.',
    typicalEffectiveness: 90,
    status: 'ACTIVE',
    createdAt: '2026-01-10T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-003',
    code: 'CTRL-ENG-03',
    hierarchyLevel: 'ENGINEERING',
    title: 'Dual Crane Computerized Synchronization & Wind Cutoff Limiter',
    titleAr: 'نظام تزامن إلكتروني للرافعات المزدوجة مع قاطع رياح آلي',
    description: 'Computer-linked load cells limiting asymmetric load transfer; ultrasonic anemometer auto-trips at 20 knots.',
    verificationMethod: 'Pre-lift calibration log signed by certified Lifting Engineer.',
    typicalEffectiveness: 92,
    status: 'ACTIVE',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-004',
    code: 'CTRL-ADM-04',
    hierarchyLevel: 'ADMINISTRATIVE',
    title: 'Electronic Permit to Work (e-PTW) with Mandatory Atmospheric Sign-off',
    titleAr: 'نظام تصاريح العمل الإلكتروني مع اعتماد فحص الغازات الإلزامي',
    description: 'Formal e-PTW authorization hierarchy requiring certified Gas Tester and Area Authority signatures.',
    verificationMethod: 'System cryptographic ledger record & physical permit placard at job site.',
    typicalEffectiveness: 70,
    status: 'ACTIVE',
    createdAt: '2026-01-12T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-005',
    code: 'CTRL-PPE-05',
    hierarchyLevel: 'PPE',
    title: 'Full Body Fall Arrest Harness with Twin Lanyards & Shock Absorber',
    titleAr: 'حزام أمان كامل للجسم مع حبلين مزدوجين وممتص صدمات معتمد',
    description: 'EN 361 certified harness 100% tied-off to certified 22kN anchor points or static lifelines.',
    verificationMethod: 'Color-coded quarterly inspection tag and daily pre-use visual inspection.',
    typicalEffectiveness: 60,
    status: 'ACTIVE',
    createdAt: '2026-01-14T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-006',
    code: 'CTRL-ELIM-06',
    hierarchyLevel: 'ELIMINATION',
    title: 'Pre-fabrication Spool Welding at Ground Level Fabrication Shop',
    titleAr: 'اللحام المسبق للأنابيب على مستوى الأرض في ورش التصنيع',
    description: 'Eliminates 80% of elevated working at height by assembling large spools at ground grade.',
    verificationMethod: 'Engineering construction methodology review & Isometric drawing sign-off.',
    typicalEffectiveness: 100,
    status: 'ACTIVE',
    createdAt: '2026-01-15T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-007',
    code: 'CTRL-SUB-07',
    hierarchyLevel: 'SUBSTITUTION',
    title: 'Cold Cutting & Mechanical Flange Couplings (Eliminate Hot Work)',
    titleAr: 'القطع الميكانيكي البارد واستخدام الوصلات الميكانيكية بدلاً من اللحام',
    description: 'Replaces flame cutting and open arc welding with pneumatic cold cutting machines.',
    verificationMethod: 'Method statement approval and piping spec conformity check.',
    typicalEffectiveness: 95,
    status: 'ACTIVE',
    createdAt: '2026-01-16T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
  {
    id: 'CTRL-008',
    code: 'CTRL-ADM-08',
    hierarchyLevel: 'ADMINISTRATIVE',
    title: 'Radiography Exclusion Barricade (2.5 µSv/hr Boundary) & Warning Lights',
    titleAr: 'تطويق أمني لموقع التصوير الإشعاعي مع إشارات تحذيرية وميضية',
    description: 'Rope off area where dose rate exceeds 2.5 microSieverts/hr; calibrated survey meter patrol.',
    verificationMethod: 'Continuous radiation patrol log by licensed Radiation Protection Officer (RPO).',
    typicalEffectiveness: 75,
    status: 'ACTIVE',
    createdAt: '2026-01-18T00:00:00Z',
    updatedAt: '2026-09-28T00:00:00Z',
  },
];

// Seed Initial Risk Assessments with all 16 required fields and cross-module links
export const SEED_RISK_ASSESSMENTS: RiskAssessmentRecord[] = [
  {
    id: 'RA-2026-042',
    rev: 'REV-04',
    activity: 'Heavy Tandem Crane Lift 120T Cryogenic Vessel',
    task: 'Rigging and lifting of 120-tonne cryogenic cold box using 500T & 400T crawler cranes at Jetty Berth #2',
    hazard: 'Boom failure, crane outrigger soil subsidence, sudden gust > 20 knots',
    hazardId: 'HAZ-002',
    potentialConsequence: 'Catastrophic boom collapse, crushing personnel, marine berth structural destruction',
    existingControls: 'Certified mobile cranes with load charts, standard 20m perimeter barricade, rigging supervisor present',
    likelihood: 4,
    severity: 5,
    initialRiskScore: 20,
    initialRiskTier: 'EXTREME',
    additionalControls: 'Dual crane computerized sync limiter, ground load plate test (250 kN/m²), ultrasonic anemometer auto-cutoff at 20 knots, 100m absolute exclusion perimeter.',
    responsiblePerson: 'Eng. Farhan Al-Kuwari (Lead Lifting Specialist)',
    targetDate: '2026-04-15',
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    residualRiskTier: 'LOW',
    alarpJustification: 'Further engineering redesign is structurally infeasible; computerized sync and soil compaction verification reduce residual risk to As Low As Reasonably Practicable (ALARP).',
    status: 'CONTROLLED',
    hierarchyOfControls: {
      elimination: false,
      substitution: false,
      engineering: true,
      administrative: true,
      ppe: true,
    },
    linkedProjectId: 'prj-rl-epc4',
    linkedProjectName: 'Ras Laffan North Field Expansion LNG EPC-4',
    linkedDocumentId: 'doc-pln-001',
    linkedDocumentCode: 'HSE-PLN-001-REV00',
    linkedSopId: 'tmpl-sop-01',
    linkedSopCode: 'TMPL-HSE-SOP',
    linkedPermitId: 'ptw-2026-881',
    linkedPermitNumber: 'PTW-LIFT-2026-881',
    linkedIncidentId: 'inc-prev-01',
    linkedIncidentRef: 'INC-2025-014',
    linkedAuditId: 'aud-finding-02',
    linkedAuditRef: 'AUD-NCR-2026-02',
    discipline: 'HEAVY_LIFTING',
    disciplineLabel: 'Heavy Lifting & Rigging',
    zone: 'Zone 1 Marine Pier Berth #2',
    reviewerName: 'Dr. Tariq Al-Hashimi',
    reviewerRole: 'Corporate HSE Director',
    signoffDate: '2026-03-24',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-24T00:00:00Z',
  },
  {
    id: 'RA-2026-038',
    rev: 'REV-02',
    activity: 'Deep Trenching & Excavation for Cooling Water Return Line',
    task: 'Excavating 5.5-meter deep trench in rocky / sandy terrain adjacent to live high-voltage corridor',
    hazard: 'Trench cave-in, toxic hydrocarbon vapor accumulation (H2S), underground utility strike',
    hazardId: 'HAZ-004',
    potentialConsequence: 'Personnel burial and suffocation, gas inhalation fatality, electrocution from 33kV feeder strike',
    existingControls: 'Timber shoring planks, hand-held spot gas detector, daily morning toolbox briefing',
    likelihood: 4,
    severity: 4,
    initialRiskScore: 16,
    initialRiskTier: 'EXTREME',
    additionalControls: 'Hydraulic slide-rail shoring box rated to 45 kN/m², continuous fixed optical 4-gas telemetry sensor, vacuum excavation for cable daylighting.',
    responsiblePerson: 'Eng. Marcus Brody (Civil Superintendent)',
    targetDate: '2026-04-20',
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    residualRiskTier: 'LOW',
    alarpJustification: 'Physical shoring shields personnel from ground movement; vacuum daylighting guarantees zero mechanical contact with energized conductors; residual risk ALARP.',
    status: 'CONTROLLED',
    hierarchyOfControls: {
      elimination: false,
      substitution: false,
      engineering: true,
      administrative: true,
      ppe: true,
    },
    linkedProjectId: 'prj-rl-epc4',
    linkedProjectName: 'Ras Laffan North Field Expansion LNG EPC-4',
    linkedDocumentId: 'doc-trf-001',
    linkedDocumentCode: 'HSE-TRF-001-REV00',
    linkedSopId: 'tmpl-sop-01',
    linkedSopCode: 'TMPL-HSE-SOP',
    linkedPermitId: 'ptw-2026-882',
    linkedPermitNumber: 'PTW-EXCAV-2026-882',
    linkedIncidentId: 'inc-prev-02',
    linkedIncidentRef: 'INC-2025-089',
    linkedAuditId: 'aud-finding-03',
    linkedAuditRef: 'AUD-NCR-2026-03',
    discipline: 'CIVIL',
    disciplineLabel: 'Civil & Earthwork',
    zone: 'Block 4 Main Spine Infrastructure',
    reviewerName: 'Sarah Jenkins',
    reviewerRole: 'Lead ISO 45001 Auditor',
    signoffDate: '2026-03-25',
    createdAt: '2026-03-05T00:00:00Z',
    updatedAt: '2026-03-25T00:00:00Z',
  },
  {
    id: 'RA-2026-029',
    rev: 'REV-03',
    activity: 'Hot Work Tie-In Welding on Flare Gas Knockout Header',
    task: 'Arc welding of 24-inch tie-in flange on live hydrocarbon header within operating refinery battery limits',
    hazard: 'Residual gas ignition, backfire into flare header, toxic gas release',
    hazardId: 'HAZ-007',
    potentialConsequence: 'Flash fire explosion, major unit trip, catastrophic asset loss and personnel burns',
    existingControls: 'Fire blanket protection, 2x 50kg dry chemical fire extinguishers, standby fire watcher',
    likelihood: 4,
    severity: 5,
    initialRiskScore: 20,
    initialRiskTier: 'EXTREME',
    additionalControls: 'Double block and bleed positive nitrogen purge isolation, continuous multi-gas monitor with auto shutoff, pressurized habitat enclosure.',
    responsiblePerson: 'Eng. Ahmed Zaki (Piping Lead Engineer)',
    targetDate: '2026-05-01',
    residualLikelihood: 1,
    residualSeverity: 4,
    residualRiskScore: 4,
    residualRiskTier: 'LOW',
    alarpJustification: 'Habitat pressurization prevents any external gas ingress; mechanical hot-tap certification guarantees zero line breaching.',
    status: 'CONTROLLED',
    hierarchyOfControls: {
      elimination: false,
      substitution: true,
      engineering: true,
      administrative: true,
      ppe: true,
    },
    linkedProjectId: 'prj-ms-ref3',
    linkedProjectName: 'Mesaieed Refinery Clean Fuels Unit 3',
    linkedDocumentId: 'doc-fir-001',
    linkedDocumentCode: 'HSE-FIR-001-REV00',
    linkedSopId: 'tmpl-sop-01',
    linkedSopCode: 'TMPL-HSE-SOP',
    linkedPermitId: 'ptw-2026-883',
    linkedPermitNumber: 'PTW-HOT-2026-883',
    linkedIncidentId: undefined,
    linkedIncidentRef: undefined,
    linkedAuditId: 'aud-finding-01',
    linkedAuditRef: 'AUD-NCR-2026-01',
    discipline: 'PIPING',
    disciplineLabel: 'Piping & Mechanical',
    zone: 'Flare Header Unit Battery Limit',
    reviewerName: 'Dr. Tariq Al-Hashimi',
    reviewerRole: 'Corporate HSE Director',
    signoffDate: '2026-03-26',
    createdAt: '2026-03-10T00:00:00Z',
    updatedAt: '2026-03-26T00:00:00Z',
  },
  {
    id: 'RA-2026-015',
    rev: 'REV-01',
    activity: 'Erection of 36m Cantilever Scaffolding for Flare Stack Maintenance',
    task: 'Erecting specialized system tube-and-coupler scaffolding hanging over sea water jetty flare stack',
    hazard: 'Fall from height, dropped couplers/tubes, scaffold structural deflection in wind',
    hazardId: 'HAZ-001',
    potentialConsequence: 'Fatal fall into sea, dropped object striking personnel or boat below, scaffold collapse',
    existingControls: 'Standard safety harness, scaffold warning sign, scaffolding foreman',
    likelihood: 4,
    severity: 4,
    initialRiskScore: 16,
    initialRiskTier: 'EXTREME',
    additionalControls: 'Advanced Scaffolder certified crew only, 100% dual lanyard tie-off to dedicated overhead static lifeline, tool lanyards on all wrenches, debris catch netting.',
    responsiblePerson: 'Eng. Patrick O’Connor (Scaffolding Superintendent)',
    targetDate: '2026-05-15',
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    residualRiskTier: 'LOW',
    alarpJustification: 'Scaffolding design verified with 3D finite element calculation; mandatory inertia reels and catch netting reduce residual risk to ALARP.',
    status: 'IN_REVIEW',
    hierarchyOfControls: {
      elimination: false,
      substitution: false,
      engineering: true,
      administrative: true,
      ppe: true,
    },
    linkedProjectId: 'prj-rl-epc4',
    linkedProjectName: 'Ras Laffan North Field Expansion LNG EPC-4',
    linkedDocumentId: 'doc-pln-001',
    linkedDocumentCode: 'HSE-PLN-001-REV00',
    linkedSopId: 'tmpl-sop-01',
    linkedSopCode: 'TMPL-HSE-SOP',
    linkedPermitId: 'ptw-2026-884',
    linkedPermitNumber: 'PTW-HEIGHT-2026-884',
    discipline: 'SCAFFOLDING',
    disciplineLabel: 'Scaffolding & Access',
    zone: 'Flare Stack South Pier',
    reviewerName: 'Sarah Jenkins',
    reviewerRole: 'Lead ISO 45001 Auditor',
    signoffDate: undefined,
    createdAt: '2026-03-15T00:00:00Z',
    updatedAt: '2026-03-27T00:00:00Z',
  },
  {
    id: 'RA-2026-051',
    rev: 'REV-01',
    activity: 'Industrial Gamma Radiography of 48-Inch Subsea Pipeline Welds',
    task: 'Non-Destructive Testing (NDT) using Iridium-192 isotope camera at night shift',
    hazard: 'Accidental ionizing gamma radiation exposure, source disconnect or jamming',
    hazardId: 'HAZ-008',
    potentialConsequence: 'Acute radiation exposure, radiation burns, long-term oncological illness',
    existingControls: 'Night work scheduling, basic rope barricade, local audible buzzer',
    likelihood: 3,
    severity: 4,
    initialRiskScore: 12,
    initialRiskTier: 'HIGH',
    additionalControls: 'Radiation Protection Officer (RPO) continuous supervision, 50m calculated perimeter, digital Geiger counter alarms, physical source guide tube lock.',
    responsiblePerson: 'Dr. Tariq Al-Hashimi (RPO Lead)',
    targetDate: '2026-04-28',
    residualLikelihood: 1,
    residualSeverity: 3,
    residualRiskScore: 3,
    residualRiskTier: 'LOW',
    alarpJustification: 'Night execution when zero non-NDT personnel on site; collimator shield cuts 95% of scatter radiation; dose rate strictly < 2.5 µSv/hr at perimeter.',
    status: 'CONTROLLED',
    hierarchyOfControls: {
      elimination: false,
      substitution: false,
      engineering: true,
      administrative: true,
      ppe: true,
    },
    linkedProjectId: 'prj-rl-epc4',
    linkedProjectName: 'Ras Laffan North Field Expansion LNG EPC-4',
    linkedDocumentId: 'doc-prc-001',
    linkedDocumentCode: 'HSE-PRC-001-REV00',
    linkedSopId: 'tmpl-sop-01',
    linkedSopCode: 'TMPL-HSE-SOP',
    linkedPermitId: 'ptw-2026-885',
    linkedPermitNumber: 'PTW-RAD-2026-885',
    discipline: 'RADIOGRAPHY',
    disciplineLabel: 'NDT & Inspection',
    zone: 'Subsea Spool Tie-In Trench',
    reviewerName: 'Dr. Tariq Al-Hashimi',
    reviewerRole: 'Corporate HSE Director',
    signoffDate: '2026-03-20',
    createdAt: '2026-03-18T00:00:00Z',
    updatedAt: '2026-03-20T00:00:00Z',
  },
];

class RiskService {
  private matrixConfig: RiskMatrixConfig = DEFAULT_RISK_MATRIX_CONFIG;
  private initialized = false;

  public async init(): Promise<void> {
    if (this.initialized) return;

    try {
      await indexedDbService.init();

      // Load or seed Matrix Config
      const savedConfig = await this.loadMatrixConfig();
      if (savedConfig) {
        this.matrixConfig = savedConfig;
      } else {
        await this.saveMatrixConfig(DEFAULT_RISK_MATRIX_CONFIG);
      }

      // Check hazards store
      const existingHazards = await indexedDbService.getAll<HazardItem>('hazards');
      if (!existingHazards || existingHazards.length === 0) {
        for (const h of SEED_HAZARDS) {
          await indexedDbService.put('hazards', h);
        }
      }

      // Check control_measures store
      const existingControls = await indexedDbService.getAll<ControlMeasureItem>('control_measures');
      if (!existingControls || existingControls.length === 0) {
        for (const c of SEED_CONTROL_MEASURES) {
          await indexedDbService.put('control_measures', c);
        }
      }

      // Check risk_assessments store
      const existingRAs = await indexedDbService.getAll<RiskAssessmentRecord>('risk_assessments');
      if (!existingRAs || existingRAs.length === 0) {
        for (const ra of SEED_RISK_ASSESSMENTS) {
          await indexedDbService.put('risk_assessments', ra);
        }
      }

      this.initialized = true;
    } catch (err) {
      console.warn('RiskService initialization fallback to in-memory mode:', err);
      this.initialized = true;
    }
  }

  // --- MATRIX CONFIGURATION ---
  public getMatrixConfig(): RiskMatrixConfig {
    return { ...this.matrixConfig };
  }

  public async saveMatrixConfig(config: RiskMatrixConfig): Promise<RiskMatrixConfig> {
    this.matrixConfig = { ...config, updatedAt: new Date().toISOString() };
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('APEX_RISK_MATRIX_CONFIG', JSON.stringify(this.matrixConfig));
      }
    } catch (e) {
      // ignore storage error
    }
    return this.matrixConfig;
  }

  private async loadMatrixConfig(): Promise<RiskMatrixConfig | null> {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const raw = window.localStorage.getItem('APEX_RISK_MATRIX_CONFIG');
        if (raw) return JSON.parse(raw);
      }
    } catch (e) {
      // ignore
    }
    return null;
  }

  public calculateTier(score: number): RiskTierId {
    const config = this.matrixConfig;
    for (const tier of config.riskTiers) {
      if (score >= tier.minScore && score <= tier.maxScore) {
        return tier.id;
      }
    }
    if (score >= 15) return 'EXTREME';
    if (score >= 10) return 'HIGH';
    if (score >= 5) return 'MEDIUM';
    return 'LOW';
  }

  // --- RISK ASSESSMENTS CRUD ---
  public async getRiskAssessments(): Promise<RiskAssessmentRecord[]> {
    await this.init();
    const records = await indexedDbService.getAll<RiskAssessmentRecord>('risk_assessments');
    return records && records.length > 0 ? records : SEED_RISK_ASSESSMENTS;
  }

  public async getRiskAssessmentById(id: string): Promise<RiskAssessmentRecord | null> {
    await this.init();
    const item = await indexedDbService.getById<RiskAssessmentRecord>('risk_assessments', id);
    if (item) return item;
    return SEED_RISK_ASSESSMENTS.find((r) => r.id === id) || null;
  }

  public async createRiskAssessment(
    data: Omit<RiskAssessmentRecord, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<RiskAssessmentRecord> {
    await this.init();
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    const year = new Date().getFullYear();
    const id = `RA-${year}-${nextSeq}`;

    const initialScore = data.likelihood * data.severity;
    const residualScore = data.residualLikelihood * data.residualSeverity;

    const newRecord: RiskAssessmentRecord = {
      ...data,
      id,
      initialRiskScore: initialScore,
      initialRiskTier: this.calculateTier(initialScore),
      residualRiskScore: residualScore,
      residualRiskTier: this.calculateTier(residualScore),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await indexedDbService.put('risk_assessments', newRecord);
    return newRecord;
  }

  public async updateRiskAssessment(
    id: string,
    updates: Partial<RiskAssessmentRecord>
  ): Promise<RiskAssessmentRecord> {
    await this.init();
    const existing = await this.getRiskAssessmentById(id);
    if (!existing) {
      throw new Error(`Risk Assessment with ID ${id} not found.`);
    }

    const likelihood = updates.likelihood !== undefined ? updates.likelihood : existing.likelihood;
    const severity = updates.severity !== undefined ? updates.severity : existing.severity;
    const initialScore = likelihood * severity;

    const resLikelihood = updates.residualLikelihood !== undefined ? updates.residualLikelihood : existing.residualLikelihood;
    const resSeverity = updates.residualSeverity !== undefined ? updates.residualSeverity : existing.residualSeverity;
    const residualScore = resLikelihood * resSeverity;

    const updated: RiskAssessmentRecord = {
      ...existing,
      ...updates,
      likelihood,
      severity,
      initialRiskScore: initialScore,
      initialRiskTier: this.calculateTier(initialScore),
      residualLikelihood: resLikelihood,
      residualSeverity: resSeverity,
      residualRiskScore: residualScore,
      residualRiskTier: this.calculateTier(residualScore),
      updatedAt: new Date().toISOString(),
    };

    await indexedDbService.put('risk_assessments', updated);
    return updated;
  }

  public async duplicateRiskAssessment(id: string): Promise<RiskAssessmentRecord> {
    await this.init();
    const existing = await this.getRiskAssessmentById(id);
    if (!existing) {
      throw new Error(`Risk Assessment ${id} not found to duplicate.`);
    }

    const nextSeq = Math.floor(Math.random() * 900) + 100;
    const year = new Date().getFullYear();
    const newId = `${id}-COPY-${nextSeq}`;

    const clone: RiskAssessmentRecord = {
      ...existing,
      id: newId,
      activity: `${existing.activity} (Copy)`,
      rev: 'REV-01',
      status: 'DRAFT',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await indexedDbService.put('risk_assessments', clone);
    return clone;
  }

  public async archiveRiskAssessment(id: string): Promise<RiskAssessmentRecord> {
    await this.init();
    return this.updateRiskAssessment(id, {
      status: 'ARCHIVED',
      isArchived: true,
    });
  }

  public async deleteRiskAssessment(id: string): Promise<boolean> {
    await this.init();
    await indexedDbService.delete('risk_assessments', id);
    return true;
  }

  // --- HAZARDS CRUD ---
  public async getHazards(): Promise<HazardItem[]> {
    await this.init();
    const items = await indexedDbService.getAll<HazardItem>('hazards');
    return items && items.length > 0 ? items : SEED_HAZARDS;
  }

  public async createHazard(data: Omit<HazardItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<HazardItem> {
    await this.init();
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    const id = `HAZ-${nextSeq}`;
    const newHazard: HazardItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await indexedDbService.put('hazards', newHazard);
    return newHazard;
  }

  public async updateHazard(id: string, updates: Partial<HazardItem>): Promise<HazardItem> {
    await this.init();
    const existing = (await indexedDbService.getById<HazardItem>('hazards', id)) || SEED_HAZARDS.find(h => h.id === id);
    if (!existing) throw new Error(`Hazard ${id} not found.`);
    const updated: HazardItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await indexedDbService.put('hazards', updated);
    return updated;
  }

  public async duplicateHazard(id: string): Promise<HazardItem> {
    await this.init();
    const existing = (await indexedDbService.getById<HazardItem>('hazards', id)) || SEED_HAZARDS.find(h => h.id === id);
    if (!existing) throw new Error(`Hazard ${id} not found.`);
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    const newHazard: HazardItem = {
      ...existing,
      id: `HAZ-${nextSeq}`,
      code: `${existing.code}-COPY`,
      title: `${existing.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await indexedDbService.put('hazards', newHazard);
    return newHazard;
  }

  public async archiveHazard(id: string): Promise<HazardItem> {
    return this.updateHazard(id, { status: 'ARCHIVED' });
  }

  // --- CONTROL MEASURES CRUD ---
  public async getControlMeasures(): Promise<ControlMeasureItem[]> {
    await this.init();
    const items = await indexedDbService.getAll<ControlMeasureItem>('control_measures');
    return items && items.length > 0 ? items : SEED_CONTROL_MEASURES;
  }

  public async createControlMeasure(
    data: Omit<ControlMeasureItem, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ControlMeasureItem> {
    await this.init();
    const nextSeq = Math.floor(Math.random() * 900) + 100;
    const id = `CTRL-${nextSeq}`;
    const newControl: ControlMeasureItem = {
      ...data,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await indexedDbService.put('control_measures', newControl);
    return newControl;
  }

  public async updateControlMeasure(id: string, updates: Partial<ControlMeasureItem>): Promise<ControlMeasureItem> {
    await this.init();
    const existing =
      (await indexedDbService.getById<ControlMeasureItem>('control_measures', id)) ||
      SEED_CONTROL_MEASURES.find(c => c.id === id);
    if (!existing) throw new Error(`Control Measure ${id} not found.`);
    const updated: ControlMeasureItem = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    await indexedDbService.put('control_measures', updated);
    return updated;
  }

  public async archiveControlMeasure(id: string): Promise<ControlMeasureItem> {
    return this.updateControlMeasure(id, { status: 'ARCHIVED' });
  }
}

export const riskService = new RiskService();
