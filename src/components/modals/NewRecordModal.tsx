import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { RiskAssessment, ControlledDocument } from '../../types';
import { SecurityService } from '../../services/securityService';

export const NewRecordModal: React.FC = () => {
  const {
    isNewRecordModalOpen,
    setIsNewRecordModalOpen,
    addRiskAssessment,
    addControlledDocument,
    setActiveNav,
    language,
    t,
    showToast,
  } = useApp();

  const { currentUser } = useAuth();

  const [recordType, setRecordType] = useState<'RA' | 'PTW' | 'DOC' | 'INCIDENT'>('RA');

  // Form states for RA
  const [activity, setActivity] = useState('');
  const [discipline, setDiscipline] = useState<'HEAVY_LIFTING' | 'CIVIL' | 'PIPING' | 'RADIOGRAPHY' | 'ELECTRICAL' | 'SCAFFOLDING'>('HEAVY_LIFTING');
  const [zone, setZone] = useState('Zone 1 Process Area');
  const [hazard, setHazard] = useState('');
  const [likelihood, setLikelihood] = useState(4);
  const [severity, setSeverity] = useState(4);
  const [mitigation, setMitigation] = useState('');

  // Form states for Doc
  const [docCode, setDocCode] = useState('HSE-SOP-024');
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState(7);

  // Form states for Incident / PTW
  const [incidentTitle, setIncidentTitle] = useState('');
  const [ptwTitle, setPtwTitle] = useState('');

  if (!isNewRecordModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (recordType === 'RA') {
      const sanitizedActivity = SecurityService.sanitizeInput(activity) || 'New Hazardous Work Activity';
      const sanitizedHazard = SecurityService.sanitizeInput(hazard) || 'Uncontrolled kinetic/pressure release hazard.';
      const sanitizedMitigation = SecurityService.sanitizeInput(mitigation) || 'Double physical interlock and continuous monitoring.';
      const initScore = likelihood * severity;
      const resScore = 1 * (severity > 2 ? severity - 1 : 1);

      const newRa: RiskAssessment = {
        id: `RA-2026-0${Math.floor(Math.random() * 899 + 100)}`,
        rev: 'REV-01',
        activity: sanitizedActivity,
        hazardDescription: sanitizedHazard,
        discipline,
        disciplineLabel: discipline.replace('_', ' '),
        zone: SecurityService.sanitizeInput(zone),
        initialLikelihood: likelihood,
        initialSeverity: severity,
        initialScore: initScore,
        initialTier: initScore >= 15 ? 'EXTREME' : initScore >= 8 ? 'HIGH' : 'LOW',
        baselineControls: ['Standard certified equipment', 'Safety exclusion perimeter'],
        controlsApplied: [
          { tierNumber: 3, tierName: 'Engineering', label: '3. Engineering', badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' },
          { tierNumber: 4, tierName: 'Admin', label: '4. Admin (PTW)', badgeColor: 'bg-blue-100 text-blue-900 border border-blue-200' },
        ],
        additionalMitigation: sanitizedMitigation,
        alarpJustification: 'ALARP Justification: Engineered barriers reduce residual risk to broadly acceptable level.',
        residualLikelihood: 1,
        residualSeverity: severity > 2 ? severity - 1 : 1,
        residualScore: resScore,
        residualTier: 'Acceptable',
        deltaReduction: Math.round(((initScore - resScore) / initScore) * 100),
        reviewer: currentUser.name,
        reviewerRole: currentUser.roleTitleEn,
        status: 'CONTROLLED',
        signoffDate: new Date().toISOString().split('T')[0],
        appliedHierarchy: {
          elimination: false,
          substitution: false,
          engineering: true,
          administrative: true,
          ppe: true,
        },
      };

      addRiskAssessment(newRa);
      SecurityService.logSecurityEvent('Create', `Registered Risk Assessment ${newRa.id} for "${sanitizedActivity}"`, currentUser, newRa.id, 'RISK');
      showToast(language === 'ar' ? `تم إضافة تقييم المخاطر الجديد: ${newRa.id}` : `Risk Assessment created: ${newRa.id}`);
      setActiveNav('risk-assessments-alarp');
    } else if (recordType === 'DOC') {
      const sanitizedDocCode = SecurityService.sanitizeInput(docCode) || `HSE-DOC-${Math.floor(Math.random() * 900 + 100)}`;
      const sanitizedDocTitle = SecurityService.sanitizeInput(docTitle) || 'New Controlled Technical Procedure';

      const newDoc: ControlledDocument = {
        code: sanitizedDocCode,
        clause: 'CL-7.5.2',
        title: sanitizedDocTitle,
        categoryNumber: docCategory,
        categoryName: `Cat ${docCategory < 10 ? '0' + docCategory : docCategory}: Procedures`,
        isBilingual: true,
        currentRevision: 'Rev 00 (Draft)',
        totalRevisionsCount: 1,
        custodian: currentUser.name,
        custodianDept: 'HSE Directorate',
        signoffStatus: 'DRAFT',
        signoffStatusLabel: 'Draft Revision',
        signoffDetail: 'Initial Baseline Revision',
        effectiveDate: new Date().toISOString().split('T')[0],
        nextReviewDate: '2027-03-31',
        securityClassification: 'RESTRICTED - EPC-4 SITE',
        mandatoryFrequencyDays: 365,
        revisions: [
          {
            revId: 'Rev 00',
            label: 'Rev 00 (Draft)',
            date: new Date().toISOString().split('T')[0],
            description: 'Initial creation of controlled compliance artifact.',
            isCurrent: true,
          },
        ],
        referencedComplianceArtifacts: [],
      };

      addControlledDocument(newDoc);
      SecurityService.logSecurityEvent('Create', `Created controlled document draft ${newDoc.code} - "${sanitizedDocTitle}"`, currentUser, newDoc.code, 'DOCUMENT');
      showToast(language === 'ar' ? `تم إنشاء الوثيقة المراقبة: ${newDoc.code}` : `Controlled document created: ${newDoc.code}`);
      setActiveNav('controlled-document-library');
    } else if (recordType === 'PTW') {
      const title = SecurityService.sanitizeInput(ptwTitle) || 'Hot Work & Electrical Isolation';
      showToast(language === 'ar' ? `تم تهيئة تصريح العمل: ${title}` : `Permit to Work initiated: ${title}`);
      setActiveNav('permit-to-work');
    } else {
      const title = SecurityService.sanitizeInput(incidentTitle) || 'Near Miss / Hazard Observation';
      showToast(language === 'ar' ? `تم فتح استمارة التحقيق في الحادث: ${title}` : `Incident 5-Why investigation initiated: ${title}`);
      setActiveNav('incident-investigations');
    }

    setIsNewRecordModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div
        className="bg-white w-full max-w-xl max-h-[92vh] flex flex-col rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Modal Header */}
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              add_circle
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#0b1c30]">
                {language === 'ar' ? 'إدخال سجل رسمي في سجل ISO 45001' : 'Record Entry & ISO 45001 Ledger Dispatch'}
              </h3>
              <span className="text-[11px] text-[#45464d] font-mono">
                {language === 'ar' ? 'بدء تسجيل جديد معتمد ومُحكم أمنيًا' : 'Initiate Controlled Operational Safety Record'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsNewRecordModalOpen(false)}
            className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Record Type Selector */}
        <div className="p-3 sm:p-4 bg-[#f8f9ff] border-b border-[#c6c6cd]/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs flex-shrink-0">
          {[
            { id: 'RA', label: language === 'ar' ? 'تقييم مخاطر' : 'Risk Assessment', icon: 'grid_4x4' },
            { id: 'PTW', label: language === 'ar' ? 'تصريح عمل' : 'Permit to Work', icon: 'assignment_turned_in' },
            { id: 'DOC', label: language === 'ar' ? 'وثيقة مراقبة' : 'Controlled Doc', icon: 'description' },
            { id: 'INCIDENT', label: language === 'ar' ? 'حادث / 5-Why' : 'Incident / 5-Why', icon: 'emergency' },
          ].map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setRecordType(type.id as any)}
              className={`p-2 sm:p-2.5 rounded-lg flex flex-col items-center gap-1 font-semibold transition-all border ${
                recordType === type.id
                  ? 'bg-[#131b2e] text-white border-[#131b2e] shadow-xs'
                  : 'bg-white text-[#45464d] border-[#c6c6cd]/30 hover:bg-[#eff4ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{type.icon}</span>
              <span className="text-[11px] text-center leading-tight">{type.label}</span>
            </button>
          ))}
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 text-xs overflow-y-auto flex-1">
          {recordType === 'RA' && (
            <>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'عنوان النشاط الخاضع للتقييم' : 'Work Activity Title'} <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: تركيب السقالات على ارتفاعات عالية (18 مترًا)' : 'e.g. Scaffolding Erection at High Elevations (18m)'}
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    {language === 'ar' ? 'التخصص الهندسي' : 'Discipline'}
                  </label>
                  <select
                    value={discipline}
                    onChange={(e) => setDiscipline(e.target.value as any)}
                    className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:outline-none"
                  >
                    <option value="HEAVY_LIFTING">Heavy Lifting &amp; Rigging</option>
                    <option value="CIVIL">Civil &amp; Earthwork</option>
                    <option value="PIPING">Piping &amp; Pressure</option>
                    <option value="RADIOGRAPHY">Radiography (NDT)</option>
                    <option value="ELECTRICAL">High Voltage Electrical</option>
                    <option value="SCAFFOLDING">Work at Height / Scaffolding</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    {language === 'ar' ? 'الموقع / المنطقة الميدانية' : 'Zone Location'}
                  </label>
                  <input
                    type="text"
                    value={zone}
                    onChange={(e) => setZone(e.target.value)}
                    className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'وصف الخطر المحتمل' : 'Hazard Description'}
                </label>
                <textarea
                  rows={2}
                  placeholder={language === 'ar' ? 'صف آليات الفشل، التعرض للمواد السامة، أو المخاطر الحركية...' : 'Describe failure mechanisms, toxic exposures, or kinetic hazards...'}
                  value={hazard}
                  onChange={(e) => setHazard(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#eff4ff] rounded-lg border border-[#c6c6cd]/20">
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    {language === 'ar' ? 'الاحتمالية المبدئية (1-5):' : 'Initial Likelihood (1-5):'} <strong className="font-mono">{likelihood}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={likelihood}
                    onChange={(e) => setLikelihood(parseInt(e.target.value, 10))}
                    className="w-full accent-[#006c4a]"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-[#0b1c30] mb-1">
                    {language === 'ar' ? 'الشدة المبدئية (1-5):' : 'Initial Severity (1-5):'} <strong className="font-mono">{severity}</strong>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={severity}
                    onChange={(e) => setSeverity(parseInt(e.target.value, 10))}
                    className="w-full accent-[#ba1a1a]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'تدابير التحكم الهندسية المقترحة' : 'Proposed Engineered Mitigation'}
                </label>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'مثال: خط حياة مزدوج، حساسات غاز معايرة...' : 'e.g. Redundant umbilical cord, computerized torque limiter...'}
                  value={mitigation}
                  onChange={(e) => setMitigation(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </>
          )}

          {recordType === 'DOC' && (
            <>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'رمز الوثيقة المعتمد' : 'Document Identifier Code'}
                </label>
                <input
                  type="text"
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] font-mono text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'عنوان الوثيقة' : 'Document Title'} <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: إجراءات التفتيش والوسم للسقالات الميدانية' : 'e.g. Scaffolding Inspection & Tagging Standard Operating Procedure'}
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'فئة ISO 45001' : 'ISO Category (1-23)'}
                </label>
                <select
                  value={docCategory}
                  onChange={(e) => setDocCategory(parseInt(e.target.value, 10))}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] rounded-lg p-2 border border-[#c6c6cd]/30"
                >
                  <option value={7}>07. Standard Operating Procedures (SOPs)</option>
                  <option value={9}>09. HSE Plan (Site Master Plan)</option>
                  <option value={10}>10. Risk Management &amp; ALARP</option>
                  <option value={14}>14. Permit to Work System</option>
                  <option value={15}>15. Emergency Response Plan</option>
                  <option value={18}>18. Inspection Checklists</option>
                </select>
              </div>
            </>
          )}

          {recordType === 'PTW' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'عنوان تصريح العمل عالي الخطورة' : 'High-Hazard Permit Work Title'} <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: أعمال لحام وقطع في منطقة محصورة خطرة' : 'e.g. Hot Work & Confined Space Entry in Column T-102'}
                  value={ptwTitle}
                  onChange={(e) => setPtwTitle(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div className="p-3.5 bg-[#eff4ff] rounded-xl text-center space-y-1.5">
                <span className="material-symbols-outlined text-[28px] text-[#006c4a]">
                  assignment_turned_in
                </span>
                <h4 className="font-bold text-[#0b1c30]">
                  {language === 'ar' ? 'إجراءات تصريح العمل المتتابعة' : 'Sequential PTW Authorization Chain'}
                </h4>
                <p className="text-[11px] text-[#45464d]">
                  {language === 'ar'
                    ? 'سيتم تفعيل فحص عزل الطاقة (LOTO)، معايرة غازات الأكسجين وكبريتيد الهيدروجين، والتوقيع الرقمي لسلطة الإصدار والتنفيذ.'
                    : 'Requires sequential verification: LOTO isolation check, gas sniffer calibration, and multi-tier digital signatures.'}
                </p>
              </div>
            </div>
          )}

          {recordType === 'INCIDENT' && (
            <div className="space-y-3">
              <div>
                <label className="block font-bold text-[#0b1c30] mb-1">
                  {language === 'ar' ? 'عنوان تقرير الحادث أو شبه الحادث' : 'Incident / Near Miss Event Title'} <span className="text-[#ba1a1a]">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder={language === 'ar' ? 'مثال: سقوط شظايا معدنية من ارتفاع 12 مترًا دون إصابات' : 'e.g. High Potential Near Miss: Dropped Object from Rigging Deck'}
                  value={incidentTitle}
                  onChange={(e) => setIncidentTitle(e.target.value)}
                  className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30"
                />
              </div>
              <div className="p-3.5 bg-[#eff4ff] rounded-xl text-center space-y-1.5">
                <span className="material-symbols-outlined text-[28px] text-[#ba1a1a]">
                  crisis_alert
                </span>
                <h4 className="font-bold text-[#0b1c30]">
                  {language === 'ar' ? 'تحقيق 5-Why والتحليل الجذري المعتمد' : '5-Why Causal Tree & CAPA Bridge'}
                </h4>
                <p className="text-[11px] text-[#45464d]">
                  {language === 'ar'
                    ? 'يفتح هذا الإجراء شجرة التحليل السببي الخماسي مع تحديد العوامل المساهمة وإصدار إجراء تصحيحي فوري.'
                    : 'Instantiates the 5-Why root cause diagram, assigns investigator team, and generates linked corrective action.'}
                </p>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-3 border-t border-[#c6c6cd]/20 flex items-center justify-end gap-2 flex-shrink-0">
            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(false)}
              className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] font-semibold"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006c4a] hover:bg-[#00714e] text-white font-bold shadow-sm"
            >
              {language === 'ar' ? 'اعتماد وإرسال السجل' : 'Commit & Authorize Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
