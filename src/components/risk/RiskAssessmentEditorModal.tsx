import React, { useState, useEffect } from 'react';
import {
  RiskAssessmentRecord,
  RiskMatrixConfig,
  HazardItem,
  ControlMeasureItem,
  RiskStatus,
} from '../../types/risk';
import { LinkableEntitiesService, LinkableEntityItem } from '../../services/linkableEntitiesService';

interface RiskAssessmentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  assessment?: RiskAssessmentRecord | null;
  mode: 'create' | 'edit' | 'view' | 'duplicate';
  matrixConfig: RiskMatrixConfig;
  hazards: HazardItem[];
  controlMeasures: ControlMeasureItem[];
  onSave: (record: RiskAssessmentRecord) => Promise<void>;
  language: 'en' | 'ar';
}

export const RiskAssessmentEditorModal: React.FC<RiskAssessmentEditorModalProps> = ({
  isOpen,
  onClose,
  assessment,
  mode,
  matrixConfig,
  hazards,
  controlMeasures,
  onSave,
  language,
}) => {
  // Available links
  const [projectsList, setProjectsList] = useState<LinkableEntityItem[]>([]);
  const [docsList, setDocsList] = useState<LinkableEntityItem[]>([]);
  const [sopsList, setSopsList] = useState<LinkableEntityItem[]>([]);
  const [permitsList, setPermitsList] = useState<LinkableEntityItem[]>([]);
  const [incidentsList, setIncidentsList] = useState<LinkableEntityItem[]>([]);
  const [auditsList, setAuditsList] = useState<LinkableEntityItem[]>([]);

  // Form State
  const [activity, setActivity] = useState('');
  const [task, setTask] = useState('');
  const [hazard, setHazard] = useState('');
  const [hazardId, setHazardId] = useState('');
  const [potentialConsequence, setPotentialConsequence] = useState('');
  const [existingControls, setExistingControls] = useState('');

  const [likelihood, setLikelihood] = useState<number>(4);
  const [severity, setSeverity] = useState<number>(4);

  const [additionalControls, setAdditionalControls] = useState('');
  const [hierarchyOfControls, setHierarchyOfControls] = useState({
    elimination: false,
    substitution: false,
    engineering: true,
    administrative: true,
    ppe: true,
  });

  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const [residualLikelihood, setResidualLikelihood] = useState<number>(1);
  const [residualSeverity, setResidualSeverity] = useState<number>(3);

  const [alarpJustification, setAlarpJustification] = useState('');
  const [status, setStatus] = useState<RiskStatus>('IN_REVIEW');

  // Links
  const [linkedProjectId, setLinkedProjectId] = useState('');
  const [linkedDocumentId, setLinkedDocumentId] = useState('');
  const [linkedSopId, setLinkedSopId] = useState('');
  const [linkedPermitId, setLinkedPermitId] = useState('');
  const [linkedIncidentId, setLinkedIncidentId] = useState('');
  const [linkedAuditId, setLinkedAuditId] = useState('');

  const [discipline, setDiscipline] = useState('CIVIL');
  const [zone, setZone] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load linkables on mount
  useEffect(() => {
    LinkableEntitiesService.getAvailableProjects().then(setProjectsList);
    LinkableEntitiesService.getAvailableDocuments().then(setDocsList);
    LinkableEntitiesService.getAvailableSops().then(setSopsList);
    LinkableEntitiesService.getAvailablePermits().then(setPermitsList);
    LinkableEntitiesService.getAvailableIncidents().then(setIncidentsList);
    LinkableEntitiesService.getAvailableAudits().then(setAuditsList);
  }, []);

  // Initialize form when assessment changes
  useEffect(() => {
    if (assessment && (mode === 'edit' || mode === 'view' || mode === 'duplicate')) {
      setActivity(mode === 'duplicate' ? `${assessment.activity} (Copy)` : assessment.activity);
      setTask(assessment.task || assessment.activity);
      setHazard(assessment.hazard || (assessment as any).hazardDescription || '');
      setHazardId(assessment.hazardId || '');
      setPotentialConsequence(assessment.potentialConsequence || '');
      setExistingControls(
        assessment.existingControls ||
          ((assessment as any).baselineControls ? (assessment as any).baselineControls.join('; ') : '')
      );
      setLikelihood(assessment.likelihood || assessment.initialLikelihood || 4);
      setSeverity(assessment.severity || assessment.initialSeverity || 4);
      setAdditionalControls(
        assessment.additionalControls || (assessment as any).additionalMitigation || ''
      );
      setHierarchyOfControls(
        assessment.hierarchyOfControls ||
          (assessment as any).appliedHierarchy || {
            elimination: false,
            substitution: false,
            engineering: true,
            administrative: true,
            ppe: true,
          }
      );
      setResponsiblePerson(assessment.responsiblePerson || (assessment as any).reviewer || '');
      setTargetDate(assessment.targetDate || new Date().toISOString().split('T')[0]);
      setResidualLikelihood(assessment.residualLikelihood || 1);
      setResidualSeverity(assessment.residualSeverity || 3);
      setAlarpJustification(assessment.alarpJustification || '');
      setStatus(mode === 'duplicate' ? 'DRAFT' : assessment.status || 'IN_REVIEW');

      setLinkedProjectId(assessment.linkedProjectId || '');
      setLinkedDocumentId(assessment.linkedDocumentId || '');
      setLinkedSopId(assessment.linkedSopId || '');
      setLinkedPermitId(assessment.linkedPermitId || '');
      setLinkedIncidentId(assessment.linkedIncidentId || '');
      setLinkedAuditId(assessment.linkedAuditId || '');

      setDiscipline(assessment.discipline || 'CIVIL');
      setZone(assessment.zone || '');
    } else {
      // Default creation state
      setActivity('');
      setTask('');
      setHazard('');
      setHazardId('');
      setPotentialConsequence('');
      setExistingControls('Standard site safety rules; daily toolbox talk; mandatory PPE.');
      setLikelihood(3);
      setSeverity(3);
      setAdditionalControls('');
      setHierarchyOfControls({
        elimination: false,
        substitution: false,
        engineering: true,
        administrative: true,
        ppe: true,
      });
      setResponsiblePerson('');
      setTargetDate(new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]);
      setResidualLikelihood(1);
      setResidualSeverity(2);
      setAlarpJustification('All reasonable physical barriers implemented; remaining risk controlled to ALARP.');
      setStatus('DRAFT');
      setLinkedProjectId(projectsList[0]?.id || 'prj-rl-epc4');
      setLinkedDocumentId('');
      setLinkedSopId('');
      setLinkedPermitId('');
      setLinkedIncidentId('');
      setLinkedAuditId('');
      setDiscipline('CIVIL');
      setZone('Zone 1 Construction Area');
    }
  }, [assessment, mode, isOpen, projectsList]);

  if (!isOpen) return null;

  // Real-time calculations
  const initialRiskScore = likelihood * severity;
  const residualRiskScore = residualLikelihood * residualSeverity;
  const deltaReduction = Math.round(((initialRiskScore - residualRiskScore) / initialRiskScore) * 100);

  const getTier = (score: number) => {
    for (const tier of matrixConfig.riskTiers) {
      if (score >= tier.minScore && score <= tier.maxScore) return tier;
    }
    return matrixConfig.riskTiers[0];
  };

  const initialTier = getTier(initialRiskScore);
  const residualTier = getTier(residualRiskScore);

  const handleHazardSelect = (hId: string) => {
    setHazardId(hId);
    const selected = hazards.find((h) => h.id === hId);
    if (selected) {
      setHazard(selected.title);
      if (selected.potentialConsequences && selected.potentialConsequences.length > 0) {
        setPotentialConsequence(selected.potentialConsequences.join('; '));
      }
    }
  };

  const handleInsertControl = (cId: string) => {
    const selected = controlMeasures.find((c) => c.id === cId);
    if (!selected) return;
    const addition = `${selected.code}: ${selected.title} (${selected.hierarchyLevel})`;
    setAdditionalControls((prev) => (prev ? `${prev}\n• ${addition}` : `• ${addition}`));

    // Auto-check hierarchy level
    const lvl = selected.hierarchyLevel.toLowerCase();
    if (lvl in hierarchyOfControls) {
      setHierarchyOfControls((prev) => ({ ...prev, [lvl]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activity.trim()) {
      alert(language === 'ar' ? 'يرجى إدخال اسم النشاط' : 'Please provide an Activity title');
      return;
    }

    setIsSubmitting(true);
    try {
      const selectedProj = projectsList.find((p) => p.id === linkedProjectId);
      const selectedDoc = docsList.find((d) => d.id === linkedDocumentId);
      const selectedSop = sopsList.find((s) => s.id === linkedSopId);
      const selectedPtw = permitsList.find((p) => p.id === linkedPermitId);
      const selectedInc = incidentsList.find((i) => i.id === linkedIncidentId);
      const selectedAud = auditsList.find((a) => a.id === linkedAuditId);

      const record: RiskAssessmentRecord = {
        id: assessment && mode === 'edit' ? assessment.id : `RA-${new Date().getFullYear()}-${Math.floor(Math.random() * 900) + 100}`,
        rev: assessment && mode === 'edit' ? assessment.rev : 'REV-01',
        activity,
        task: task || activity,
        hazard,
        hazardId: hazardId || undefined,
        potentialConsequence,
        existingControls,
        likelihood,
        severity,
        initialRiskScore,
        initialRiskTier: initialTier.id,
        additionalControls,
        responsiblePerson,
        targetDate,
        residualLikelihood,
        residualSeverity,
        residualRiskScore,
        residualRiskTier: residualTier.id,
        alarpJustification,
        status,
        hierarchyOfControls,
        linkedProjectId: linkedProjectId || undefined,
        linkedProjectName: selectedProj?.title,
        linkedDocumentId: linkedDocumentId || undefined,
        linkedDocumentCode: selectedDoc?.code,
        linkedSopId: linkedSopId || undefined,
        linkedSopCode: selectedSop?.code,
        linkedPermitId: linkedPermitId || undefined,
        linkedPermitNumber: selectedPtw?.code,
        linkedIncidentId: linkedIncidentId || undefined,
        linkedIncidentRef: selectedInc?.code,
        linkedAuditId: linkedAuditId || undefined,
        linkedAuditRef: selectedAud?.code,
        discipline,
        disciplineLabel: discipline,
        zone,
        createdAt: assessment?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      await onSave(record);
      onClose();
    } catch (err: any) {
      alert(err?.message || 'Failed to save risk assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isReadOnly = mode === 'view';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#121c2b] border border-[#27394f] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#27394f] flex items-center justify-between bg-[#182538]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">
              {mode === 'view' ? 'visibility' : mode === 'edit' ? 'edit_note' : 'add_moderator'}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold">
                  {mode === 'view'
                    ? language === 'ar'
                      ? 'عرض تقييم المخاطر (ALARP Dossier)'
                      : 'View Risk Assessment Dossier'
                    : mode === 'edit'
                    ? language === 'ar'
                      ? 'تعديل تقييم المخاطر'
                      : 'Edit Risk Assessment'
                    : mode === 'duplicate'
                    ? language === 'ar'
                      ? 'استنساخ تقييم المخاطر'
                      : 'Duplicate Risk Assessment'
                    : language === 'ar'
                    ? 'إجراء تقييم مخاطر جديد (New Risk Assessment)'
                    : 'Conduct New Risk Assessment'}
                </h2>
                {assessment?.id && (
                  <span className="font-mono text-xs px-2 py-0.5 rounded bg-black/40 text-amber-300 border border-amber-400/30">
                    {mode === 'duplicate' ? `${assessment.id}-COPY` : assessment.id}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'نموذج تقييم المخاطر المعتمد وفق ISO 45001 ومبدأ ALARP مع الربط بالوثائق والتصاريح والحوادث'
                  : 'Official ISO 45001 & ALARP Risk Assessment linked to Projects, SOPs, Permits, Incidents & Audits'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* SECTION 1: Activity, Task & Scope */}
          <div className="bg-[#172335] p-4 rounded-xl border border-[#26374d] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#26374d] text-sm font-bold text-amber-400">
              <span className="material-symbols-outlined text-base">construction</span>
              <span>{language === 'ar' ? '1. النشاط ومهمة العمل ونطاق التنفيذ' : '1. Activity, Task & Operational Scope'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'النشاط الرئيسي (Activity): *' : 'Main Activity: *'}
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  required
                  value={activity}
                  onChange={(e) => setActivity(e.target.value)}
                  placeholder="e.g. Heavy Tandem Crane Lift 120T Cryogenic Vessel"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'التخصص الهندسي (Discipline):' : 'Engineering Discipline:'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={discipline}
                  onChange={(e) => setDiscipline(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="CIVIL">Civil & Earthworks (الأعمال المدنية والحفريات)</option>
                  <option value="HEAVY_LIFTING">Heavy Lifting & Rigging (الرفع والرافعات)</option>
                  <option value="PIPING">Piping & Mechanical (الأنابيب والأعمال الميكانيكية)</option>
                  <option value="ELECTRICAL">Electrical & Instrumentation (الكهرباء والأجهزة)</option>
                  <option value="SCAFFOLDING">Scaffolding & Working at Height (السقالات والارتفاعات)</option>
                  <option value="RADIOGRAPHY">Industrial Radiography NDT (التصوير الإشعاعي)</option>
                  <option value="CONFINED_SPACE">Confined Space Entry (الأماكن المغلقة)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'تفاصيل المهمة (Task Description):' : 'Specific Task Breakdown:'}
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="Describe step-by-step physical task elements..."
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'موقع / منطقة العمل (Location / Zone):' : 'Operational Zone / Location:'}
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  placeholder="e.g. Zone 1 Marine Pier Berth #2 / Train 7 Area"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Hazard Identification & Potential Consequence */}
          <div className="bg-[#172335] p-4 rounded-xl border border-[#26374d] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26374d]">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <span className="material-symbols-outlined text-base">warning</span>
                <span>{language === 'ar' ? '2. تحديد الخطر والعواقب المحتملة' : '2. Hazard Identification & Potential Consequence'}</span>
              </div>
              {!isReadOnly && hazards.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'اختيار من سجل المخاطر:' : 'Select from Hazard Register:'}
                  </span>
                  <select
                    value={hazardId}
                    onChange={(e) => handleHazardSelect(e.target.value)}
                    className="bg-[#0d1624] border border-amber-400/40 text-amber-300 text-xs rounded-lg px-2.5 py-1 focus:outline-none"
                  >
                    <option value="">-- Choose Predefined Hazard --</option>
                    {hazards.map((h) => (
                      <option key={h.id} value={h.id}>
                        [{h.category}] {h.code} - {h.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'الخطر المحدد (Hazard): *' : 'Identified Hazard: *'}
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  required
                  value={hazard}
                  onChange={(e) => setHazard(e.target.value)}
                  placeholder="Boom collapse, soil subsidence, high wind gust > 20 knots..."
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'العواقب والأضرار المحتملة (Potential Consequence): *' : 'Potential Consequence / Harm: *'}
                </label>
                <textarea
                  rows={2}
                  disabled={isReadOnly}
                  required
                  value={potentialConsequence}
                  onChange={(e) => setPotentialConsequence(e.target.value)}
                  placeholder="Catastrophic structural failure, personnel crush injuries, multiple fatalities..."
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ar' ? 'إجراءات التحكم الحالية القائمة (Existing Controls):' : 'Existing Baseline Controls in Place:'}
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                value={existingControls}
                onChange={(e) => setExistingControls(e.target.value)}
                placeholder="Certified mobile cranes with load charts, standard 20m safety exclusion zone..."
                className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
              />
            </div>
          </div>

          {/* SECTION 3: Initial Inherent Risk Scoring (Likelihood × Severity) */}
          <div className="bg-[#172335] p-4 rounded-xl border border-rose-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26374d]">
              <div className="flex items-center gap-2 text-sm font-bold text-rose-400">
                <span className="material-symbols-outlined text-base">emergency_home</span>
                <span>{language === 'ar' ? '3. تقييم المخاطر الأولية الكامنة (Initial Risk)' : '3. Initial Inherent Risk Assessment'}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Initial Score:</span>
                <span className="font-mono text-base font-black px-3 py-0.5 rounded-lg border text-white" style={{ backgroundColor: initialTier.color, borderColor: initialTier.color }}>
                  {initialRiskScore} / 25 — {initialTier.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Likelihood (1-5) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'ar' ? 'الاحتمالية الأولية (Likelihood 1 - 5):' : 'Initial Likelihood (1 - 5):'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {matrixConfig.likelihoodLevels.map((l) => (
                    <button
                      type="button"
                      key={l.level}
                      disabled={isReadOnly}
                      onClick={() => setLikelihood(l.level)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        likelihood === l.level
                          ? 'bg-rose-500/30 border-rose-400 text-rose-200 ring-2 ring-rose-400'
                          : 'bg-[#0d1624] border-[#344862] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">L{l.level}</div>
                      <div className="text-[10px] truncate">{l.name.split('-')[1]?.trim() || l.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  {matrixConfig.likelihoodLevels.find((l) => l.level === likelihood)?.description}
                </div>
              </div>

              {/* Severity (1-5) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'ar' ? 'الشدة / الأثر الأولي (Severity 1 - 5):' : 'Initial Severity (1 - 5):'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {matrixConfig.severityLevels.map((s) => (
                    <button
                      type="button"
                      key={s.level}
                      disabled={isReadOnly}
                      onClick={() => setSeverity(s.level)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        severity === s.level
                          ? 'bg-rose-500/30 border-rose-400 text-rose-200 ring-2 ring-rose-400'
                          : 'bg-[#0d1624] border-[#344862] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">S{s.level}</div>
                      <div className="text-[10px] truncate">{s.name.split('-')[1]?.trim() || s.name}</div>
                    </button>
                  ))}
                </div>
                <div className="mt-2 text-[11px] text-slate-400 italic">
                  {matrixConfig.severityLevels.find((s) => s.level === severity)?.description}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: Additional Controls & Hierarchy of Controls */}
          <div className="bg-[#172335] p-4 rounded-xl border border-[#26374d] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26374d]">
              <div className="flex items-center gap-2 text-sm font-bold text-amber-400">
                <span className="material-symbols-outlined text-base">shield</span>
                <span>{language === 'ar' ? '4. ضوابط التحكم الإضافية وتدرج السيطرة' : '4. Additional Controls & Hierarchy of Controls'}</span>
              </div>
              {!isReadOnly && controlMeasures.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-400">
                    {language === 'ar' ? 'إدراج من تدابير السيطرة:' : 'Insert from Controls Library:'}
                  </span>
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        handleInsertControl(e.target.value);
                        e.target.value = '';
                      }
                    }}
                    className="bg-[#0d1624] border border-blue-400/40 text-blue-300 text-xs rounded-lg px-2 py-1 focus:outline-none"
                  >
                    <option value="">+ Add Approved Barrier</option>
                    {controlMeasures.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.hierarchyLevel}] {c.code} - {c.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Hierarchy of Controls Toggles */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                {language === 'ar' ? 'مستويات هرم السيطرة المطبقة (Hierarchy of Controls):' : 'Applied Hierarchy of Controls Checklist:'}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[
                  { key: 'elimination', label: '1. Elimination', ar: '1. الإزالة', badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' },
                  { key: 'substitution', label: '2. Substitution', ar: '2. الاستبدال', badge: 'bg-teal-500/20 text-teal-300 border-teal-500/30' },
                  { key: 'engineering', label: '3. Engineering', ar: '3. التحكم الهندسي', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30' },
                  { key: 'administrative', label: '4. Administrative', ar: '4. التحكم الإداري', badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
                  { key: 'ppe', label: '5. Critical PPE', ar: '5. مهمات الوقاية', badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
                ].map((tier) => {
                  const isChecked = (hierarchyOfControls as any)[tier.key];
                  return (
                    <label
                      key={tier.key}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-xs cursor-pointer transition-all ${
                        isChecked
                          ? tier.badge
                          : 'bg-[#0d1624] border-[#344862] text-slate-400 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        disabled={isReadOnly}
                        checked={isChecked}
                        onChange={(e) =>
                          setHierarchyOfControls((prev) => ({
                            ...prev,
                            [tier.key]: e.target.checked,
                          }))
                        }
                        className="rounded border-slate-600 text-amber-500 focus:ring-amber-400"
                      />
                      <span className="font-semibold text-[11px] truncate">
                        {language === 'ar' ? tier.ar : tier.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ar' ? 'تفاصيل إجراءات التحكم الإضافية (Additional Controls): *' : 'Additional Controls & Mitigation Measures: *'}
              </label>
              <textarea
                rows={3}
                disabled={isReadOnly}
                required
                value={additionalControls}
                onChange={(e) => setAdditionalControls(e.target.value)}
                placeholder="Dual crane computerized sync limiter, soil bearing plate test (250 kN/m²), ultrasonic anemometer cutoff at 20 knots..."
                className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'الشخص المسؤول عن المتابعة (Responsible Person): *' : 'Responsible Person / Action Owner: *'}
                </label>
                <input
                  type="text"
                  disabled={isReadOnly}
                  required
                  value={responsiblePerson}
                  onChange={(e) => setResponsiblePerson(e.target.value)}
                  placeholder="e.g. Eng. Farhan Al-Kuwari (Lifting Engineer)"
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'تاريخ الاستحقاق المستهدف (Target Date): *' : 'Target Completion Date: *'}
                </label>
                <input
                  type="date"
                  disabled={isReadOnly}
                  required
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: Residual Risk (Post-Mitigation ALARP Scoring) */}
          <div className="bg-[#172335] p-4 rounded-xl border border-emerald-500/30 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#26374d]">
              <div className="flex items-center gap-2 text-sm font-bold text-emerald-400">
                <span className="material-symbols-outlined text-base">verified_user</span>
                <span>{language === 'ar' ? '5. تقييم المخاطر المتبقية بعد التحكم (Residual Risk)' : '5. Residual Risk Assessment (Post-Mitigation)'}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-emerald-400 font-bold">
                  Risk Reduction: -{deltaReduction}%
                </span>
                <span className="font-mono text-base font-black px-3 py-0.5 rounded-lg border text-white" style={{ backgroundColor: residualTier.color, borderColor: residualTier.color }}>
                  {residualRiskScore} / 25 — {residualTier.name}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Residual Likelihood (1-5) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'ar' ? 'الاحتمالية المتبقية (Residual Likelihood 1 - 5):' : 'Residual Likelihood (1 - 5):'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {matrixConfig.likelihoodLevels.map((l) => (
                    <button
                      type="button"
                      key={l.level}
                      disabled={isReadOnly}
                      onClick={() => setResidualLikelihood(l.level)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        residualLikelihood === l.level
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                          : 'bg-[#0d1624] border-[#344862] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">L{l.level}</div>
                      <div className="text-[10px] truncate">{l.name.split('-')[1]?.trim() || l.name}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Residual Severity (1-5) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  {language === 'ar' ? 'الشدة المتبقية (Residual Severity 1 - 5):' : 'Residual Severity (1 - 5):'}
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {matrixConfig.severityLevels.map((s) => (
                    <button
                      type="button"
                      key={s.level}
                      disabled={isReadOnly}
                      onClick={() => setResidualSeverity(s.level)}
                      className={`p-2 rounded-xl border text-center transition-all ${
                        residualSeverity === s.level
                          ? 'bg-emerald-500/30 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400'
                          : 'bg-[#0d1624] border-[#344862] text-slate-400 hover:text-white'
                      }`}
                    >
                      <div className="text-sm font-black">S{s.level}</div>
                      <div className="text-[10px] truncate">{s.name.split('-')[1]?.trim() || s.name}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ar' ? 'مبررات الامتثال لمبدأ ALARP (ALARP Justification): *' : 'ALARP Compliance Justification (ISO 45001 §6.1.2): *'}
              </label>
              <textarea
                rows={2}
                disabled={isReadOnly}
                required
                value={alarpJustification}
                onChange={(e) => setAlarpJustification(e.target.value)}
                placeholder="Explain why further risk reduction is practically infeasible or disproportionate to cost/benefit..."
                className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
              />
            </div>
          </div>

          {/* SECTION 6: Cross-Module Links & Governance Status */}
          <div className="bg-[#172335] p-4 rounded-xl border border-[#26374d] space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-[#26374d] text-sm font-bold text-amber-400">
              <span className="material-symbols-outlined text-base">link</span>
              <span>{language === 'ar' ? '6. الربط بالمشاريع والوثائق والتصاريح والحوادث' : '6. Cross-Module Links & System Records'}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Linked Project */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'المشروع المرتبط (Project):' : 'Linked Project:'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedProjectId}
                  onChange={(e) => setLinkedProjectId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No Project Link --</option>
                  {projectsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Document */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'وثيقة HSE المرتبطة (Document):' : 'Linked Controlled Document:'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedDocumentId}
                  onChange={(e) => setLinkedDocumentId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No Document Link --</option>
                  {docsList.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.code} - {d.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked SOP */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'إجراء التشغيل القياسي (SOP):' : 'Linked Standard Operating Procedure (SOP):'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedSopId}
                  onChange={(e) => setLinkedSopId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No SOP Link --</option>
                  {sopsList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Linked Permit to Work */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'تصريح العمل (Permit to Work - PTW):' : 'Linked Permit to Work (e-PTW):'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedPermitId}
                  onChange={(e) => setLinkedPermitId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No Permit Link --</option>
                  {permitsList.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} - {p.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Incident */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'سجل الحوادث (Incident Record):' : 'Linked Incident Record:'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedIncidentId}
                  onChange={(e) => setLinkedIncidentId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No Incident Link --</option>
                  {incidentsList.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.code} - {i.title}
                    </option>
                  ))}
                </select>
              </div>

              {/* Linked Audit */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  {language === 'ar' ? 'ملاحظة التدقيق / عدم المطابقة (Audit/NCR):' : 'Linked Audit / NCR Finding:'}
                </label>
                <select
                  disabled={isReadOnly}
                  value={linkedAuditId}
                  onChange={(e) => setLinkedAuditId(e.target.value)}
                  className="w-full bg-[#0d1624] border border-[#344862] rounded-lg px-2.5 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-amber-400 disabled:opacity-60"
                >
                  <option value="">-- No Audit Link --</option>
                  {auditsList.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.title}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Status Selector */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'ar' ? 'حالة التقييم (Status): *' : 'Assessment Workflow Status: *'}
              </label>
              <div className="flex flex-wrap gap-2">
                {(['DRAFT', 'IN_REVIEW', 'CONTROLLED', 'ACTION_REQUIRED', 'ARCHIVED'] as RiskStatus[]).map((st) => (
                  <button
                    type="button"
                    key={st}
                    disabled={isReadOnly}
                    onClick={() => setStatus(st)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      status === st
                        ? 'bg-amber-500 text-black border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#0d1624] border-[#344862] text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-[#27394f] flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-[#344862] text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
            >
              {isReadOnly ? (language === 'ar' ? 'إغلاق' : 'Close') : language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>

            {!isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold shadow-xl shadow-amber-500/25 flex items-center gap-2 transition-all disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-sm">
                  {isSubmitting ? 'hourglass_top' : 'check_circle'}
                </span>
                <span>
                  {isSubmitting
                    ? language === 'ar'
                      ? 'جار الحفظ في قاعدة البيانات...'
                      : 'Saving to Database...'
                    : mode === 'edit'
                    ? language === 'ar'
                      ? 'تحديث وحفظ التقييم'
                      : 'Update & Commit Assessment'
                    : language === 'ar'
                    ? 'تسجيل وحفظ تقييم المخاطر'
                    : 'Save & Commit Risk Assessment'}
                </span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
