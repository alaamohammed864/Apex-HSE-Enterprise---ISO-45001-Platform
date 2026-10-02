import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  RiskAssessmentRecord,
  RiskMatrixConfig,
  HazardItem,
  ControlMeasureItem,
  RiskTierId,
} from '../../types/risk';
import { riskService, DEFAULT_RISK_MATRIX_CONFIG } from '../../services/riskService';
import { ExportService } from '../../services/exportService';
import { RiskMatrixInteractiveGrid } from './RiskMatrixInteractiveGrid';
import { MatrixConfigModal } from './MatrixConfigModal';
import { RiskAssessmentEditorModal } from './RiskAssessmentEditorModal';
import { HazardRegisterView } from './HazardRegisterView';
import { ControlMeasuresView } from './ControlMeasuresView';
import { RiskDossierPrintModal } from './RiskDossierPrintModal';

export const RiskManagementModule: React.FC = () => {
  const { language, showToast } = useApp();

  // Active Tab: 'register' | 'hazards' | 'controls' | 'config'
  const [activeTab, setActiveTab] = useState<'register' | 'hazards' | 'controls'>('register');

  // Service State
  const [assessments, setAssessments] = useState<RiskAssessmentRecord[]>([]);
  const [hazards, setHazards] = useState<HazardItem[]>([]);
  const [controlMeasures, setControlMeasures] = useState<ControlMeasureItem[]>([]);
  const [matrixConfig, setMatrixConfig] = useState<RiskMatrixConfig>(DEFAULT_RISK_MATRIX_CONFIG);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters State
  const [search, setSearch] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [activeCellFilter, setActiveCellFilter] = useState<{ likelihood: number; severity: number } | null>(null);
  const [matrixView, setMatrixView] = useState<'initial' | 'residual'>('initial');

  // Modals State
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'create' | 'edit' | 'view' | 'duplicate'>('create');
  const [selectedAssessment, setSelectedAssessment] = useState<RiskAssessmentRecord | null>(null);

  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printAssessment, setPrintAssessment] = useState<RiskAssessmentRecord | null>(null);

  // Initial Load from DB
  const loadData = async () => {
    setIsLoading(true);
    try {
      await riskService.init();
      const [raList, hazList, ctrlList, cfg] = await Promise.all([
        riskService.getRiskAssessments(),
        riskService.getHazards(),
        riskService.getControlMeasures(),
        riskService.getMatrixConfig(),
      ]);
      setAssessments(raList);
      setHazards(hazList);
      setControlMeasures(ctrlList);
      setMatrixConfig(cfg);
    } catch (err) {
      console.error('Failed to load risk management data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // CRUD Operations on Risk Assessments
  const handleSaveAssessment = async (record: RiskAssessmentRecord) => {
    if (editorMode === 'edit') {
      const updated = await riskService.updateRiskAssessment(record.id, record);
      setAssessments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      showToast(language === 'ar' ? `تم تحديث تقييم المخاطر ${record.id} بنجاح` : `Updated Risk Assessment ${record.id}`);
    } else {
      const created = await riskService.createRiskAssessment(record);
      setAssessments((prev) => [created, ...prev]);
      showToast(
        language === 'ar'
          ? `تم إنشاء وحفظ تقييم المخاطر ${created.id} في قاعدة البيانات`
          : `Created & Saved Risk Assessment ${created.id} to Database`
      );
    }
  };

  const handleDuplicateAssessment = async (id: string) => {
    try {
      const copy = await riskService.duplicateRiskAssessment(id);
      setAssessments((prev) => [copy, ...prev]);
      showToast(
        language === 'ar' ? `تم استنساخ تقييم المخاطر ${id} إلى مسودة جديدة` : `Duplicated ${id} to new draft ${copy.id}`
      );
    } catch (e: any) {
      alert(e?.message);
    }
  };

  const handleArchiveAssessment = async (id: string) => {
    if (
      window.confirm(
        language === 'ar'
          ? `هل أنت متأكد من أرشفة تقييم المخاطر ${id} ونقله إلى السجل التاريخي؟`
          : `Are you sure you want to archive Risk Assessment ${id}?`
      )
    ) {
      const archived = await riskService.archiveRiskAssessment(id);
      setAssessments((prev) => prev.map((a) => (a.id === id ? archived : a)));
      showToast(
        language === 'ar' ? `تم نقل التقييم ${id} إلى الأرشيف التاريخي` : `Risk Assessment ${id} moved to archive`
      );
    }
  };

  const handleSaveMatrixConfig = async (newConfig: RiskMatrixConfig) => {
    const saved = await riskService.saveMatrixConfig(newConfig);
    setMatrixConfig(saved);
    // Refresh assessments with recalculated tiers
    loadData();
    showToast(
      language === 'ar'
        ? 'تم حفظ إعدادات مصفوفة المخاطر 5×5 وتطبيقها على كافة التقييمات'
        : '5x5 Risk Matrix configuration saved and recalculated across all records'
    );
  };

  // Hazard CRUD
  const handleCreateHazard = async (data: Omit<HazardItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await riskService.createHazard(data);
    setHazards((prev) => [created, ...prev]);
    showToast(language === 'ar' ? `تم تسجيل الخطر ${created.code}` : `Registered Hazard ${created.code}`);
  };

  const handleUpdateHazard = async (id: string, updates: Partial<HazardItem>) => {
    const updated = await riskService.updateHazard(id, updates);
    setHazards((prev) => prev.map((h) => (h.id === id ? updated : h)));
    showToast(language === 'ar' ? `تم تحديث الخطر ${updated.code}` : `Updated Hazard ${updated.code}`);
  };

  const handleDuplicateHazard = async (id: string) => {
    const clone = await riskService.duplicateHazard(id);
    setHazards((prev) => [clone, ...prev]);
    showToast(language === 'ar' ? `تم استنساخ الخطر` : `Duplicated Hazard`);
  };

  const handleArchiveHazard = async (id: string) => {
    const archived = await riskService.archiveHazard(id);
    setHazards((prev) => prev.map((h) => (h.id === id ? archived : h)));
    showToast(language === 'ar' ? `تمت أرشفة الخطر` : `Archived Hazard`);
  };

  // Control Measures CRUD
  const handleCreateControl = async (data: Omit<ControlMeasureItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await riskService.createControlMeasure(data);
    setControlMeasures((prev) => [created, ...prev]);
    showToast(language === 'ar' ? `تم تسجيل تدبير التحكم ${created.code}` : `Registered Control ${created.code}`);
  };

  const handleUpdateControl = async (id: string, updates: Partial<ControlMeasureItem>) => {
    const updated = await riskService.updateControlMeasure(id, updates);
    setControlMeasures((prev) => prev.map((c) => (c.id === id ? updated : c)));
    showToast(language === 'ar' ? `تم تحديث تدبير التحكم` : `Updated Control Measure`);
  };

  const handleArchiveControl = async (id: string) => {
    const archived = await riskService.archiveControlMeasure(id);
    setControlMeasures((prev) => prev.map((c) => (c.id === id ? archived : c)));
    showToast(language === 'ar' ? `تمت أرشفة تدبير التحكم` : `Archived Control Measure`);
  };

  // Export handlers
  const handleExportCsv = () => {
    ExportService.exportCompleteRiskRegisterToCsv(filteredAssessments);
    showToast(language === 'ar' ? 'تم تصدير سجل المخاطر بصيغة CSV' : 'Exported complete Risk Register to CSV');
  };

  const handleExportJson = () => {
    ExportService.exportRiskRegisterToJson(filteredAssessments);
    showToast(language === 'ar' ? 'تم تصدير سجل المخاطر بصيغة JSON' : 'Exported Risk Register to JSON');
  };

  const handlePrintDossier = (ra: RiskAssessmentRecord) => {
    setPrintAssessment(ra);
    setIsPrintModalOpen(true);
  };

  // Cell Click in 5x5 Matrix
  const handleCellClick = (l: number, s: number) => {
    if (activeCellFilter && activeCellFilter.likelihood === l && activeCellFilter.severity === s) {
      setActiveCellFilter(null);
    } else {
      setActiveCellFilter({ likelihood: l, severity: s });
    }
  };

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((item) => {
      // Cell filter
      if (activeCellFilter) {
        const itemL = matrixView === 'initial' ? item.likelihood : item.residualLikelihood;
        const itemS = matrixView === 'initial' ? item.severity : item.residualSeverity;
        if (itemL !== activeCellFilter.likelihood || itemS !== activeCellFilter.severity) {
          return false;
        }
      }

      // Discipline filter
      if (selectedDiscipline !== 'ALL' && item.discipline !== selectedDiscipline) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && item.status !== selectedStatus) {
        return false;
      }

      // Tier filter
      if (selectedTier !== 'ALL') {
        const activeTier = matrixView === 'initial' ? item.initialRiskTier : item.residualRiskTier;
        if (activeTier !== selectedTier) return false;
      }

      // Search term
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          item.id.toLowerCase().includes(q) ||
          item.activity.toLowerCase().includes(q) ||
          (item.task && item.task.toLowerCase().includes(q)) ||
          item.hazard.toLowerCase().includes(q) ||
          item.potentialConsequence.toLowerCase().includes(q) ||
          item.responsiblePerson.toLowerCase().includes(q) ||
          (item.alarpJustification && item.alarpJustification.toLowerCase().includes(q));
        if (!match) return false;
      }

      return true;
    });
  }, [assessments, activeCellFilter, matrixView, selectedDiscipline, selectedStatus, selectedTier, search]);

  const getTierForScore = (score: number) => {
    for (const t of matrixConfig.riskTiers) {
      if (score >= t.minScore && score <= t.maxScore) return t;
    }
    return matrixConfig.riskTiers[0];
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'CONTROLLED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'IN_REVIEW':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
      case 'DRAFT':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'ACTION_REQUIRED':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/30';
      case 'ARCHIVED':
        return 'bg-slate-700 text-slate-400 border-slate-600';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-[1700px] mx-auto max-w-full overflow-x-hidden">
      {/* Module Title & Executive Header */}
      <div className="bg-[#121c2c] border border-[#23354c] rounded-2xl p-4 sm:p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-wrap items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-amber-400 text-2xl">shield_with_heart</span>
              <h1 className="text-2xl font-black text-slate-100 tracking-tight">
                {language === 'ar' ? 'إدارة المخاطر التشغيلية وسجل ALARP' : 'Operational Risk Management & ALARP Register'}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono font-bold border border-emerald-500/30">
                ISO 45001:2018 §6.1.2
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              {language === 'ar'
                ? 'نظام شامل ومترابط لتحديد المخاطر، مصفوفة 5×5 قابلة للتهيئة للمشرفين، حساب المخاطر المتبقية بعد الحواجز، هرم السيطرة، وتوثيق الامتثال لمبدأ ALARP مع الربط المباشر بالمشاريع والتصاريح والوثائق والحوادث.'
                : 'Comprehensive risk engineering platform: Hazard Register, configurable 5x5 probability matrix, quantitative ALARP residual reduction, Hierarchy of Controls verification, and cross-linking to Projects, SOPs, e-PTWs, Incidents & Audits.'}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsConfigModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-[#1a273a] hover:bg-[#23344d] text-slate-200 text-xs font-semibold border border-[#344862] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-amber-400">tune</span>
              <span>{language === 'ar' ? 'تهيئة مصفوفة 5×5' : 'Configure 5x5 Matrix'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportCsv}
              className="px-3.5 py-2 rounded-xl bg-[#1a273a] hover:bg-[#23344d] text-slate-200 text-xs font-semibold border border-[#344862] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-blue-400">table_view</span>
              <span>{language === 'ar' ? 'تصدير CSV' : 'Export CSV'}</span>
            </button>

            <button
              type="button"
              onClick={handleExportJson}
              className="px-3 py-2 rounded-xl bg-[#1a273a] hover:bg-[#23344d] text-slate-200 text-xs font-semibold border border-[#344862] flex items-center gap-1.5 transition-all shadow-sm"
            >
              <span className="material-symbols-outlined text-sm text-cyan-400">code</span>
              <span>JSON</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setSelectedAssessment(null);
                setEditorMode('create');
                setIsEditorOpen(true);
              }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-black shadow-xl shadow-amber-500/25 flex items-center gap-1.5 transition-all"
            >
              <span className="material-symbols-outlined text-base">add_moderator</span>
              <span>{language === 'ar' ? '+ تقييم مخاطر جديد' : '+ Conduct New Risk Assessment'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-1 mt-6 border-b border-[#23354c] pt-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('register')}
            className={`pb-3 px-4 font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'register'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">grid_4x4</span>
            <span>{language === 'ar' ? 'سجل المخاطر والمصفوفة (5×5 Register)' : 'Risk Register & 5x5 Matrix'}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {assessments.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('hazards')}
            className={`pb-3 px-4 font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'hazards'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{language === 'ar' ? 'سجل الأخطار المعتمد (Hazard Register)' : 'Hazard Register'}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {hazards.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('controls')}
            className={`pb-3 px-4 font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'controls'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">shield</span>
            <span>{language === 'ar' ? 'تدابير السيطرة وهرم التحكم (Control Measures)' : 'Control Measures & Barriers'}</span>
            <span className="font-mono text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {controlMeasures.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: Risk Register & 5x5 Matrix */}
      {activeTab === 'register' && (
        <div className="space-y-6">
          {/* Interactive 5x5 Grid */}
          <RiskMatrixInteractiveGrid
            config={matrixConfig}
            assessments={assessments}
            matrixView={matrixView}
            onViewChange={setMatrixView}
            activeCellFilter={activeCellFilter}
            onCellClick={handleCellClick}
            onClearCellFilter={() => setActiveCellFilter(null)}
            language={language}
          />

          {/* Filters & Search Toolbar */}
          <div className="bg-[#141e2d] p-4 rounded-2xl border border-[#27384e] flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
              {/* Search */}
              <div className="relative flex-1 min-w-[220px]">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-sm">
                  search
                </span>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={
                    language === 'ar'
                      ? 'بحث بالنشاط، الخطر، المسؤول، العواقب...'
                      : 'Search assessments by activity, hazard, person, consequence...'
                  }
                  className="w-full pl-9 pr-3 py-2 bg-[#0c1421] border border-[#2b3c53] rounded-xl text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Discipline Filter */}
              <select
                value={selectedDiscipline}
                onChange={(e) => setSelectedDiscipline(e.target.value)}
                className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Disciplines (كافة التخصصات)</option>
                <option value="CIVIL">Civil & Earthwork</option>
                <option value="HEAVY_LIFTING">Heavy Lifting & Rigging</option>
                <option value="PIPING">Piping & Mechanical</option>
                <option value="ELECTRICAL">Electrical & Instrumentation</option>
                <option value="SCAFFOLDING">Scaffolding & Height</option>
                <option value="RADIOGRAPHY">Industrial Radiography</option>
              </select>

              {/* Risk Tier Filter */}
              <select
                value={selectedTier}
                onChange={(e) => setSelectedTier(e.target.value)}
                className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Risk Tiers (كافة المستويات)</option>
                <option value="EXTREME">Extreme Risk (شديد الخطورة)</option>
                <option value="HIGH">High Risk (خطر عالي)</option>
                <option value="MEDIUM">Medium Risk (خطر متوسط)</option>
                <option value="LOW">Low Risk (خطر منخفض)</option>
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-[#0c1421] border border-[#2b3c53] rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="ALL">All Status (كافة الحالات)</option>
                <option value="CONTROLLED">CONTROLLED (متحكم به)</option>
                <option value="IN_REVIEW">IN_REVIEW (قيد المراجعة)</option>
                <option value="DRAFT">DRAFT (مسودة)</option>
                <option value="ACTION_REQUIRED">ACTION_REQUIRED (مطلوب إجراء)</option>
                <option value="ARCHIVED">ARCHIVED (مؤرشف)</option>
              </select>

              {(search || selectedDiscipline !== 'ALL' || selectedStatus !== 'ALL' || selectedTier !== 'ALL' || activeCellFilter) && (
                <button
                  type="button"
                  onClick={() => {
                    setSearch('');
                    setSelectedDiscipline('ALL');
                    setSelectedStatus('ALL');
                    setSelectedTier('ALL');
                    setActiveCellFilter(null);
                  }}
                  className="px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:text-rose-200 hover:bg-rose-500/10 transition-colors flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-sm">filter_alt_off</span>
                  <span>{language === 'ar' ? 'إعادة ضبط' : 'Reset Filters'}</span>
                </button>
              )}
            </div>

            <div className="text-xs text-slate-400 font-mono">
              Showing <strong>{filteredAssessments.length}</strong> of <strong>{assessments.length}</strong> records
            </div>
          </div>

          {/* Risk Register Table */}
          <div className="bg-[#141e2d] rounded-2xl border border-[#27384e] overflow-hidden shadow-2xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-[#19263a] text-slate-400 uppercase text-[10px] tracking-wider border-b border-[#27384e]">
                  <tr>
                    <th className="py-3 px-4">RA Code & Rev</th>
                    <th className="py-3 px-4">Activity & Task</th>
                    <th className="py-3 px-4">Hazard & Potential Consequence</th>
                    <th className="py-3 px-4 text-center">Initial Risk (L×S)</th>
                    <th className="py-3 px-4">Additional Controls & Hierarchy</th>
                    <th className="py-3 px-4 text-center">Residual Risk (L×S)</th>
                    <th className="py-3 px-4">Owner & Date</th>
                    <th className="py-3 px-4">Links & Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#233246]">
                  {isLoading ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-400">
                        <span className="material-symbols-outlined animate-spin text-2xl mb-2 text-amber-400 block">
                          progress_activity
                        </span>
                        <span>{language === 'ar' ? 'جار تحميل سجل تقييم المخاطر...' : 'Loading Risk Register...'}</span>
                      </td>
                    </tr>
                  ) : filteredAssessments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-12 text-center text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-2 text-slate-600 block">
                          inventory_2
                        </span>
                        <div>{language === 'ar' ? 'لا توجد تقييمات مخاطر مطابقة للتصفية الحالية' : 'No risk assessments found matching active criteria.'}</div>
                      </td>
                    </tr>
                  ) : (
                    filteredAssessments.map((ra) => {
                      const initTier = getTierForScore(ra.initialRiskScore);
                      const resTier = getTierForScore(ra.residualRiskScore);
                      const reduction = Math.round(
                        ((ra.initialRiskScore - ra.residualRiskScore) / ra.initialRiskScore) * 100
                      );

                      return (
                        <tr key={ra.id} className="hover:bg-white/[0.02] transition-colors group">
                          {/* Code & Rev */}
                          <td className="py-3.5 px-4 font-mono">
                            <div className="font-bold text-amber-300">{ra.id}</div>
                            <div className="text-[10px] text-slate-400">{ra.rev || 'REV-01'}</div>
                            {ra.discipline && (
                              <div className="text-[9px] text-cyan-400 mt-1 uppercase font-semibold">
                                {ra.discipline}
                              </div>
                            )}
                          </td>

                          {/* Activity & Task */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-bold text-slate-100 group-hover:text-amber-200 transition-colors">
                              {ra.activity}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                              {ra.task || ra.activity}
                            </div>
                            {ra.zone && (
                              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                                <span className="material-symbols-outlined text-[12px]">location_on</span>
                                <span>{ra.zone}</span>
                              </div>
                            )}
                          </td>

                          {/* Hazard & Consequence */}
                          <td className="py-3.5 px-4 max-w-xs">
                            <div className="font-semibold text-rose-300">{ra.hazard}</div>
                            <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2">
                              <strong>Cons:</strong> {ra.potentialConsequence}
                            </div>
                            {ra.existingControls && (
                              <div className="text-[10px] text-slate-500 mt-1 truncate">
                                <strong>Existing:</strong> {ra.existingControls}
                              </div>
                            )}
                          </td>

                          {/* Initial Risk Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <div
                              className="inline-flex flex-col items-center justify-center p-1.5 rounded-xl border font-mono min-w-[70px]"
                              style={{
                                backgroundColor: `${initTier.color}20`,
                                borderColor: `${initTier.color}60`,
                              }}
                            >
                              <div className="text-[10px] text-slate-300">
                                L{ra.likelihood} × S{ra.severity}
                              </div>
                              <div className="text-sm font-black" style={{ color: initTier.color }}>
                                {ra.initialRiskScore}
                              </div>
                              <div className="text-[9px] font-bold uppercase truncate max-w-[65px]" style={{ color: initTier.color }}>
                                {initTier.id}
                              </div>
                            </div>
                          </td>

                          {/* Additional Controls & Hierarchy */}
                          <td className="py-3.5 px-4 max-w-xs">
                            {/* Hierarchy indicators */}
                            <div className="flex flex-wrap gap-1 mb-1">
                              {ra.hierarchyOfControls?.elimination && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                  Elimination
                                </span>
                              )}
                              {ra.hierarchyOfControls?.substitution && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                                  Substitution
                                </span>
                              )}
                              {ra.hierarchyOfControls?.engineering && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                  Engineering
                                </span>
                              )}
                              {ra.hierarchyOfControls?.administrative && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                                  Admin
                                </span>
                              )}
                              {ra.hierarchyOfControls?.ppe && (
                                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                  PPE
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] text-slate-300 line-clamp-2">
                              {ra.additionalControls}
                            </div>
                            {ra.alarpJustification && (
                              <div className="text-[10px] text-amber-300/80 italic mt-1 line-clamp-1">
                                ALARP: {ra.alarpJustification}
                              </div>
                            )}
                          </td>

                          {/* Residual Risk Badge */}
                          <td className="py-3.5 px-4 text-center">
                            <div
                              className="inline-flex flex-col items-center justify-center p-1.5 rounded-xl border font-mono min-w-[70px]"
                              style={{
                                backgroundColor: `${resTier.color}20`,
                                borderColor: `${resTier.color}60`,
                              }}
                            >
                              <div className="text-[10px] text-slate-300">
                                L{ra.residualLikelihood} × S{ra.residualSeverity}
                              </div>
                              <div className="text-sm font-black" style={{ color: resTier.color }}>
                                {ra.residualRiskScore}
                              </div>
                              <div className="text-[9px] font-bold uppercase truncate max-w-[65px]" style={{ color: resTier.color }}>
                                -{reduction}%
                              </div>
                            </div>
                          </td>

                          {/* Owner & Date */}
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-slate-200">{ra.responsiblePerson}</div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                              Target: {ra.targetDate}
                            </div>
                          </td>

                          {/* Links & Status */}
                          <td className="py-3.5 px-4">
                            <div className="mb-1.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getStatusBadge(ra.status)}`}>
                                {ra.status}
                              </span>
                            </div>

                            {/* Badges for linked items */}
                            <div className="flex flex-wrap gap-1">
                              {ra.linkedProjectName && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-cyan-300 text-[9px] border border-cyan-500/30 truncate max-w-[120px]" title={ra.linkedProjectName}>
                                  {ra.linkedProjectName}
                                </span>
                              )}
                              {ra.linkedDocumentCode && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-amber-300 text-[9px] border border-amber-500/30">
                                  {ra.linkedDocumentCode}
                                </span>
                              )}
                              {ra.linkedPermitNumber && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-emerald-300 text-[9px] border border-emerald-500/30">
                                  {ra.linkedPermitNumber}
                                </span>
                              )}
                              {ra.linkedSopCode && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-purple-300 text-[9px] border border-purple-500/30">
                                  {ra.linkedSopCode}
                                </span>
                              )}
                              {ra.linkedIncidentRef && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-rose-300 text-[9px] border border-rose-500/30">
                                  {ra.linkedIncidentRef}
                                </span>
                              )}
                              {ra.linkedAuditRef && (
                                <span className="px-1.5 py-0.2 rounded bg-black/40 text-teal-300 text-[9px] border border-teal-500/30">
                                  {ra.linkedAuditRef}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAssessment(ra);
                                  setEditorMode('view');
                                  setIsEditorOpen(true);
                                }}
                                title="View Details"
                                className="p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/5 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">visibility</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setSelectedAssessment(ra);
                                  setEditorMode('edit');
                                  setIsEditorOpen(true);
                                }}
                                title="Edit Assessment"
                                className="p-1 rounded-lg text-slate-400 hover:text-amber-300 hover:bg-white/5 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">edit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDuplicateAssessment(ra.id)}
                                title="Duplicate"
                                className="p-1 rounded-lg text-slate-400 hover:text-blue-300 hover:bg-white/5 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">content_copy</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => handlePrintDossier(ra)}
                                title="Print ALARP Dossier"
                                className="p-1 rounded-lg text-slate-400 hover:text-emerald-300 hover:bg-white/5 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm">print</span>
                              </button>
                              {ra.status !== 'ARCHIVED' && (
                                <button
                                  type="button"
                                  onClick={() => handleArchiveAssessment(ra.id)}
                                  title="Archive"
                                  className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/5 transition-colors"
                                >
                                  <span className="material-symbols-outlined text-sm">archive</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: Hazard Register */}
      {activeTab === 'hazards' && (
        <HazardRegisterView
          hazards={hazards}
          onCreateHazard={handleCreateHazard}
          onUpdateHazard={handleUpdateHazard}
          onDuplicateHazard={handleDuplicateHazard}
          onArchiveHazard={handleArchiveHazard}
          language={language}
        />
      )}

      {/* TAB 3: Control Measures */}
      {activeTab === 'controls' && (
        <ControlMeasuresView
          controlMeasures={controlMeasures}
          onCreateControl={handleCreateControl}
          onUpdateControl={handleUpdateControl}
          onArchiveControl={handleArchiveControl}
          language={language}
        />
      )}

      {/* MODAL 1: Assessment Editor (Create / Edit / View / Duplicate) */}
      {isEditorOpen && (
        <RiskAssessmentEditorModal
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          assessment={selectedAssessment}
          mode={editorMode}
          matrixConfig={matrixConfig}
          hazards={hazards}
          controlMeasures={controlMeasures}
          onSave={handleSaveAssessment}
          language={language}
        />
      )}

      {/* MODAL 2: 5x5 Matrix Configuration */}
      {isConfigModalOpen && (
        <MatrixConfigModal
          isOpen={isConfigModalOpen}
          onClose={() => setIsConfigModalOpen(false)}
          config={matrixConfig}
          onSave={handleSaveMatrixConfig}
          language={language}
        />
      )}

      {/* MODAL 3: Print Dossier */}
      {isPrintModalOpen && printAssessment && (
        <RiskDossierPrintModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          assessment={printAssessment}
          matrixConfig={matrixConfig}
          language={language}
        />
      )}
    </div>
  );
};
