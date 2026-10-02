import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  InspectionChecklistTemplate,
  InspectionChecklistItem,
  InspectionRecordExecution,
  InspectionItemExecution,
  InspectionDiscipline,
  ItemEvaluationResult,
} from '../../types/safetyOps';
import { safetyOpsService, DEFAULT_INSPECTION_TEMPLATES } from '../../services/safetyOpsService';

const ALL_DISCIPLINES: InspectionDiscipline[] = [
  'PPE',
  'Scaffold',
  'Crane',
  'Lifting Equipment',
  'Fire Equipment',
  'Vehicle',
  'Excavation',
  'Housekeeping',
  'Electrical',
  'Working at Height',
  'Confined Space',
  'Emergency Equipment',
];

export const InspectionsManagementModule: React.FC<{ onNavigateToCapa?: () => void }> = ({
  onNavigateToCapa,
}) => {
  const { showToast } = useApp();

  const [activeTab, setActiveTab] = useState<'BUILDER' | 'RUNNER' | 'HISTORY'>('BUILDER');
  const [templates, setTemplates] = useState<InspectionChecklistTemplate[]>([]);
  const [history, setHistory] = useState<InspectionRecordExecution[]>([]);
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);

  // Active Runner State
  const [activeTemplate, setActiveTemplate] = useState<InspectionChecklistTemplate | null>(null);
  const [inspectorName, setInspectorName] = useState('Eng. Farhan Al-Kuwari (Lead Field Inspector)');
  const [projectName, setProjectName] = useState('Ras Laffan EPC-4 Liquefaction Expansion');
  const [locationName, setLocationName] = useState('Process Train Unit 3 - Sector B');
  const [contractorName, setContractorName] = useState('CCC Mechanical & Civils Consortium');
  const [inspectionDate, setInspectionDate] = useState(new Date().toISOString().split('T')[0]);
  const [inspectionItems, setInspectionItems] = useState<InspectionItemExecution[]>([]);
  const [inspectionNotes, setInspectionNotes] = useState('');

  // Checklist Builder Modal
  const [editingTemplate, setEditingTemplate] = useState<InspectionChecklistTemplate | null>(null);
  const [isBuilderModalOpen, setIsBuilderModalOpen] = useState(false);

  // View Record Modal
  const [viewingRecord, setViewingRecord] = useState<InspectionRecordExecution | null>(null);

  // Load templates & history
  const loadData = async () => {
    try {
      setLoading(true);
      const tmpls = await safetyOpsService.getChecklistTemplates();
      setTemplates(tmpls);
      const hist = await safetyOpsService.getInspectionRecords();
      setHistory(hist);
    } catch (err) {
      console.error('Failed to load inspection data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    if (selectedDiscipline === 'ALL') return templates;
    return templates.filter((t) => t.discipline === selectedDiscipline);
  }, [templates, selectedDiscipline]);

  // Start field inspection with a template
  const handleStartInspection = (tmpl: InspectionChecklistTemplate) => {
    setActiveTemplate(tmpl);
    const initialItems: InspectionItemExecution[] = tmpl.items.map((item) => ({
      itemId: item.id,
      requirement: item.requirement,
      status: 'PASS',
      comment: '',
      correctiveAction: '',
    }));
    setInspectionItems(initialItems);
    setActiveTab('RUNNER');
    showToast(`Started inspection for ${tmpl.title}`);
  };

  // Update item evaluation in runner
  const handleItemStatusChange = (index: number, status: ItemEvaluationResult) => {
    const copy = [...inspectionItems];
    copy[index].status = status;
    setInspectionItems(copy);
  };

  const handleItemCommentChange = (index: number, comment: string) => {
    const copy = [...inspectionItems];
    copy[index].comment = comment;
    setInspectionItems(copy);
  };

  const handleItemCorrectiveActionChange = (index: number, correctiveAction: string) => {
    const copy = [...inspectionItems];
    copy[index].correctiveAction = correctiveAction;
    setInspectionItems(copy);
  };

  const handleItemPhotoAttach = (index: number) => {
    const samplePhotos = [
      'https://images.unsplash.com/photo-1541888946425-d0fbb1861578?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=60',
    ];
    const chosen = samplePhotos[index % samplePhotos.length];
    const copy = [...inspectionItems];
    copy[index].photo = chosen;
    setInspectionItems(copy);
    showToast('Photo evidence captured from field camera.');
  };

  // Instant CAPA creation from failed inspection item
  const handleSpawnCapaFromItem = async (item: InspectionItemExecution, index: number) => {
    try {
      const now = new Date();
      const capaId = `CAPA-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      const capa = await safetyOpsService.saveCapa({
        id: capaId,
        finding: `Field Inspection Failure (${activeTemplate?.discipline}): "${item.requirement}". Inspector Observation: ${item.comment || 'Non-compliance observed'}`,
        source: 'INSPECTION',
        sourceReferenceId: activeTemplate?.id || 'INSP',
        sourceTitle: `${activeTemplate?.title} at ${locationName}`,
        riskLevel: 'HIGH',
        actionRequired: item.correctiveAction || 'Immediate rectification of failed inspection checkpoint before operation proceeds.',
        responsiblePerson: contractorName,
        department: activeTemplate?.discipline || 'Field Safety',
        targetDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
        evidence: item.photo ? [{ id: 'EVD-INSP', title: 'Inspection Photo', type: 'PHOTO', urlOrBase64: item.photo, description: 'Field capture', uploadedAt: now.toISOString(), capturedBy: inspectorName }] : [],
        status: 'OPEN',
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      const copy = [...inspectionItems];
      copy[index].capaIdCreated = capa.id;
      setInspectionItems(copy);

      showToast(`CAPA #${capa.id} dispatched directly from failed inspection item!`);
    } catch (err: any) {
      showToast(err.message || 'Error generating CAPA');
    }
  };

  // Compute live score
  const liveScore = useMemo(() => {
    const evaluated = inspectionItems.filter((i) => i.status !== 'N/A');
    if (evaluated.length === 0) return { score: 100, result: 'PASS' as const };
    const passed = evaluated.filter((i) => i.status === 'PASS').length;
    const score = Math.round((passed / evaluated.length) * 100);
    let result: 'PASS' | 'CONDITIONAL_PASS' | 'FAIL' = 'PASS';
    if (score < 80 || inspectionItems.some((i) => i.status === 'FAIL')) {
      result = score >= 70 ? 'CONDITIONAL_PASS' : 'FAIL';
    }
    return { score, result };
  }, [inspectionItems]);

  // Complete and submit inspection
  const handleSubmitInspection = async () => {
    if (!activeTemplate) return;
    const now = new Date();
    const recordId = `INS-${now.getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;

    const record: InspectionRecordExecution = {
      id: recordId,
      templateId: activeTemplate.id,
      templateTitle: activeTemplate.title,
      discipline: activeTemplate.discipline,
      date: inspectionDate,
      inspectorName,
      project: projectName,
      location: locationName,
      contractor: contractorName,
      items: inspectionItems,
      overallResult: liveScore.result,
      complianceScorePercent: liveScore.score,
      notes: inspectionNotes,
      createdAt: now.toISOString(),
    };

    await safetyOpsService.saveInspectionRecord(record);
    showToast(`Inspection ${recordId} completed with score ${liveScore.score}% (${liveScore.result}).`);
    await loadData();
    setActiveTab('HISTORY');
    setActiveTemplate(null);
  };

  // Save template in builder
  const handleSaveTemplate = async () => {
    if (!editingTemplate) return;
    await safetyOpsService.saveChecklistTemplate(editingTemplate);
    showToast(`Checklist template ${editingTemplate.title} saved.`);
    setIsBuilderModalOpen(false);
    loadData();
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §9.1.2 &amp; OSHA 1926
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Dynamic Checklist Builder &amp; Field Inspection Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Site Inspections &amp; Checklist Verification
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Evaluate PPE, Scaffolds, Cranes, Lifting Gear, Fire Safety, Excavations, Electrical, Confined Spaces, and auto-dispatch CAPA for failed items.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {onNavigateToCapa && (
            <button
              type="button"
              onClick={onNavigateToCapa}
              className="px-3.5 py-2 rounded-lg border border-[#006c4a] text-[#006c4a] text-xs font-bold hover:bg-[#eaf5ef] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>Open CAPA Register</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              const newTmpl: InspectionChecklistTemplate = {
                id: `TMPL-${Date.now().toString().slice(-4)}`,
                title: 'New Site Safety Checklist',
                discipline: 'General Site',
                version: '1.0',
                description: 'Custom checklist for specific project activities.',
                items: [
                  { id: 'CHK-01', code: 'C.1', requirement: 'Initial safety barrier and signage in place.', standardReference: 'OSHA 1926.200', criticalItem: true },
                ],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              };
              setEditingTemplate(newTmpl);
              setIsBuilderModalOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span className="material-symbols-outlined text-[18px]">playlist_add</span>
            <span>+ New Checklist Template</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center border-b border-[#c6c6cd]/30 gap-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab('BUILDER')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'BUILDER'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">checklist_rtl</span>
          <span>1. Dynamic Checklist Library ({templates.length} Standards)</span>
        </button>

        <button
          type="button"
          onClick={() => {
            if (!activeTemplate && templates.length > 0) {
              handleStartInspection(templates[0]);
            } else {
              setActiveTab('RUNNER');
            }
          }}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'RUNNER'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">draw</span>
          <span>
            2. Active Field Inspection Conductor {activeTemplate ? `(${activeTemplate.discipline})` : ''}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('HISTORY')}
          className={`py-3 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'HISTORY'
              ? 'border-[#006c4a] text-[#006c4a] font-bold'
              : 'border-transparent text-gray-500 hover:text-gray-900'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">history</span>
          <span>3. Completed Inspection Records ({history.length})</span>
        </button>
      </div>

      {/* TAB 1: DYNAMIC CHECKLIST BUILDER & LIBRARY */}
      {activeTab === 'BUILDER' && (
        <div className="space-y-4">
          {/* Discipline Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDiscipline('ALL')}
              className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                selectedDiscipline === 'ALL'
                  ? 'bg-[#006c4a] text-white font-bold'
                  : 'bg-white border text-gray-700 hover:bg-gray-100'
              }`}
            >
              All Disciplines ({templates.length})
            </button>
            {ALL_DISCIPLINES.map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDiscipline(d)}
                className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-colors ${
                  selectedDiscipline === d
                    ? 'bg-[#006c4a] text-white font-bold'
                    : 'bg-white border text-gray-700 hover:bg-gray-100'
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {filteredTemplates.map((tmpl) => (
              <div
                key={tmpl.id}
                className="bg-white rounded-xl border border-[#c6c6cd]/30 p-5 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#004f80]">
                      {tmpl.discipline}
                    </span>
                    <span className="font-mono text-[10px] text-gray-400 font-bold">
                      v{tmpl.version} • {tmpl.items.length} Items
                    </span>
                  </div>
                  <h3 className="font-bold text-sm text-[#0b1c30] mt-2 line-clamp-2">
                    {tmpl.title}
                  </h3>
                  <p className="text-xs text-[#45464d] mt-1 line-clamp-2">
                    {tmpl.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingTemplate(JSON.parse(JSON.stringify(tmpl)));
                      setIsBuilderModalOpen(true);
                    }}
                    className="text-xs text-gray-600 hover:text-black font-semibold flex items-center gap-1"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span>Edit Checklist</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleStartInspection(tmpl)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span className="material-symbols-outlined text-[16px]">play_arrow</span>
                    <span>Conduct Inspection</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: ACTIVE FIELD INSPECTION RUNNER */}
      {activeTab === 'RUNNER' && activeTemplate && (
        <div className="space-y-6">
          {/* Runner Header Bar */}
          <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#e2f1ff] text-[#004f80]">
                  {activeTemplate.discipline}
                </span>
                <span className="font-mono text-xs font-bold text-gray-500">
                  {activeTemplate.id}
                </span>
              </div>
              <h2 className="text-xl font-bold text-[#0b1c30]">{activeTemplate.title}</h2>
            </div>

            {/* Score Summary Box */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 px-4 bg-[#eff4ff] rounded-xl border border-[#c6c6cd]/30 text-center">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Compliance Score</div>
                <div className="text-2xl font-bold font-mono text-[#006c4a]">{liveScore.score}%</div>
              </div>
              <div
                className={`px-3 py-2 rounded-xl font-mono text-xs font-bold uppercase ${
                  liveScore.result === 'PASS'
                    ? 'bg-[#dcfce7] text-[#15803d]'
                    : liveScore.result === 'CONDITIONAL_PASS'
                    ? 'bg-[#fef9c3] text-[#a16207]'
                    : 'bg-[#ffdad6] text-[#ba1a1a]'
                }`}
              >
                {liveScore.result.replace(/_/g, ' ')}
              </div>
            </div>
          </div>

          {/* Operational Context Inputs */}
          <div className="bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Inspector</label>
              <input
                type="text"
                value={inspectorName}
                onChange={(e) => setInspectorName(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Date</label>
              <input
                type="date"
                value={inspectionDate}
                onChange={(e) => setInspectionDate(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs font-mono"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Location / Tag</label>
              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
              />
            </div>
            <div>
              <label className="font-semibold text-gray-700 block mb-1">Contractor</label>
              <input
                type="text"
                value={contractorName}
                onChange={(e) => setContractorName(e.target.value)}
                className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-1.5 text-xs"
              />
            </div>
          </div>

          {/* Checkpoints Checklist Evaluation */}
          <div className="space-y-3">
            {inspectionItems.map((item, index) => {
              const tmplItem = activeTemplate.items[index];
              return (
                <div
                  key={item.itemId}
                  className={`p-4 rounded-xl border transition-all ${
                    item.status === 'FAIL'
                      ? 'bg-[#fff5f5] border-[#ba1a1a]/40 shadow-xs'
                      : item.status === 'PASS'
                      ? 'bg-white border-gray-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="space-y-0.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-gray-500">
                          #{index + 1}
                        </span>
                        {tmplItem?.criticalItem && (
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-[#ba1a1a] text-white font-bold">
                            CRITICAL
                          </span>
                        )}
                        {tmplItem?.standardReference && (
                          <span className="font-mono text-[10px] text-gray-400">
                            {tmplItem.standardReference}
                          </span>
                        )}
                      </div>
                      <p className="font-bold text-xs text-[#0b1c30]">{item.requirement}</p>
                    </div>

                    {/* PASS / FAIL / N/A Toggle Buttons */}
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(index, 'PASS')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          item.status === 'PASS'
                            ? 'bg-[#006c4a] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        PASS
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(index, 'FAIL')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          item.status === 'FAIL'
                            ? 'bg-[#ba1a1a] text-white shadow-xs'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        FAIL
                      </button>
                      <button
                        type="button"
                        onClick={() => handleItemStatusChange(index, 'N/A')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                          item.status === 'N/A'
                            ? 'bg-gray-600 text-white shadow-xs'
                            : 'text-gray-600 hover:text-black'
                        }`}
                      >
                        N/A
                      </button>
                    </div>
                  </div>

                  {/* Comment, Photo & Corrective Action Inputs */}
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block mb-1">
                        Inspector Comment / Field Observation
                      </label>
                      <input
                        type="text"
                        value={item.comment}
                        onChange={(e) => handleItemCommentChange(index, e.target.value)}
                        placeholder="Add field observation..."
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-500 font-mono block mb-1">
                        Corrective Action (Immediate)
                      </label>
                      <input
                        type="text"
                        value={item.correctiveAction || ''}
                        onChange={(e) => handleItemCorrectiveActionChange(index, e.target.value)}
                        placeholder="Action needed if failed..."
                        className="w-full bg-white border border-gray-300 rounded p-1.5 text-xs"
                      />
                    </div>

                    <div className="flex items-end gap-2">
                      <button
                        type="button"
                        onClick={() => handleItemPhotoAttach(index)}
                        className="px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-xs font-medium flex items-center gap-1 flex-1 justify-center"
                      >
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        <span>{item.photo ? 'Photo Attached' : 'Attach Photo'}</span>
                      </button>

                      {/* Prominent Create CAPA button for FAIL items */}
                      {item.status === 'FAIL' && (
                        <button
                          type="button"
                          onClick={() => handleSpawnCapaFromItem(item, index)}
                          disabled={!!item.capaIdCreated}
                          className={`px-3 py-1.5 rounded text-xs font-bold flex items-center gap-1 shadow-xs transition-colors ${
                            item.capaIdCreated
                              ? 'bg-green-700 text-white cursor-default'
                              : 'bg-[#ba1a1a] text-white hover:bg-[#93000a]'
                          }`}
                        >
                          <span className="material-symbols-outlined text-[16px]">
                            {item.capaIdCreated ? 'task_alt' : 'send'}
                          </span>
                          <span>{item.capaIdCreated ? item.capaIdCreated : 'Dispatch CAPA'}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {item.photo && (
                    <div className="mt-2 flex items-center gap-2">
                      <img
                        src={item.photo}
                        alt="Evidence"
                        className="w-12 h-12 object-cover rounded border"
                      />
                      <span className="text-[11px] text-gray-500 font-mono">
                        Inspection site photo recorded.
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Submission Bar */}
          <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-gray-600">
                Ensure all critical safety checkpoints have been physically verified.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('BUILDER')}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Back to Library
              </button>
              <button
                type="button"
                onClick={handleSubmitInspection}
                className="px-6 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <span className="material-symbols-outlined text-[18px]">verified</span>
                <span>Submit &amp; Sign-Off Inspection</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED INSPECTION RECORDS */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase border-b border-[#c6c6cd]/20">
                <tr>
                  <th className="py-3 px-4">Inspection ID</th>
                  <th className="py-3 px-4">Discipline &amp; Template</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Inspector &amp; Contractor</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Result</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-gray-500">
                      No inspection runs recorded yet.
                    </td>
                  </tr>
                ) : (
                  history.map((rec) => (
                    <tr key={rec.id} className="hover:bg-[#eff4ff]/50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#006c4a]">{rec.id}</td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{rec.templateTitle}</div>
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-gray-100 text-gray-700">
                          {rec.discipline}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono">{rec.date}</td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-gray-900">{rec.inspectorName}</div>
                        <div className="text-[11px] text-gray-500">{rec.contractor}</div>
                      </td>
                      <td className="py-3 px-4 text-gray-700">{rec.location}</td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">
                        {rec.complianceScorePercent}%
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded font-mono text-[10px] font-bold ${
                            rec.overallResult === 'PASS'
                              ? 'bg-[#dcfce7] text-[#15803d]'
                              : rec.overallResult === 'CONDITIONAL_PASS'
                              ? 'bg-[#fef9c3] text-[#a16207]'
                              : 'bg-[#ffdad6] text-[#ba1a1a]'
                          }`}
                        >
                          {rec.overallResult.replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setViewingRecord(rec)}
                          className="px-2.5 py-1 rounded bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#dce9ff]"
                        >
                          View Report
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Template Builder / Editor Modal */}
      {isBuilderModalOpen && editingTemplate && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">
                  Checklist Template Builder
                </span>
                <h2 className="text-lg font-bold text-[#0b1c30]">{editingTemplate.title}</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsBuilderModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4 text-xs text-[#0b1c30]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <label className="font-semibold text-gray-700 block mb-1">Template Title</label>
                  <input
                    type="text"
                    value={editingTemplate.title}
                    onChange={(e) =>
                      setEditingTemplate({ ...editingTemplate, title: e.target.value })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Discipline</label>
                  <select
                    value={editingTemplate.discipline}
                    onChange={(e) =>
                      setEditingTemplate({
                        ...editingTemplate,
                        discipline: e.target.value as InspectionDiscipline,
                      })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-medium"
                  >
                    {ALL_DISCIPLINES.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Scope &amp; Description</label>
                <textarea
                  rows={2}
                  value={editingTemplate.description}
                  onChange={(e) =>
                    setEditingTemplate({ ...editingTemplate, description: e.target.value })
                  }
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                />
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase font-mono text-gray-700">
                    Checklist Verification Items ({editingTemplate.items.length})
                  </h4>
                  <button
                    type="button"
                    onClick={() => {
                      const newItem: InspectionChecklistItem = {
                        id: `ITEM-${Date.now().toString().slice(-4)}`,
                        code: `CHK.${editingTemplate.items.length + 1}`,
                        requirement: '',
                        standardReference: 'ISO 45001 / OSHA',
                        criticalItem: false,
                      };
                      setEditingTemplate({
                        ...editingTemplate,
                        items: [...editingTemplate.items, newItem],
                      });
                    }}
                    className="px-2.5 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e]"
                  >
                    + Add Item
                  </button>
                </div>

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {editingTemplate.items.map((it, idx) => (
                    <div
                      key={it.id}
                      className="p-3 bg-gray-50 border rounded-lg flex items-start gap-2 text-xs"
                    >
                      <span className="font-mono text-gray-400 font-bold mt-1">#{idx + 1}</span>
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            value={it.requirement}
                            onChange={(e) => {
                              const copy = [...editingTemplate.items];
                              copy[idx].requirement = e.target.value;
                              setEditingTemplate({ ...editingTemplate, items: copy });
                            }}
                            placeholder="Verification requirement text..."
                            className="w-full bg-white border border-gray-300 rounded p-1 text-xs"
                          />
                        </div>
                        <div>
                          <input
                            type="text"
                            value={it.standardReference || ''}
                            onChange={(e) => {
                              const copy = [...editingTemplate.items];
                              copy[idx].standardReference = e.target.value;
                              setEditingTemplate({ ...editingTemplate, items: copy });
                            }}
                            placeholder="Standard ref (e.g. OSHA 1926)"
                            className="w-full bg-white border border-gray-300 rounded p-1 text-xs font-mono"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 font-mono text-[10px]">
                            <input
                              type="checkbox"
                              checked={it.criticalItem}
                              onChange={(e) => {
                                const copy = [...editingTemplate.items];
                                copy[idx].criticalItem = e.target.checked;
                                setEditingTemplate({ ...editingTemplate, items: copy });
                              }}
                            />
                            <span>Critical</span>
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              const copy = editingTemplate.items.filter((_, i) => i !== idx);
                              setEditingTemplate({ ...editingTemplate, items: copy });
                            }}
                            className="text-red-500 hover:text-red-700 ml-auto"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsBuilderModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveTemplate}
                className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Viewing Record Modal */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">
                  {viewingRecord.id}
                </span>
                <h2 className="text-lg font-bold text-[#0b1c30]">
                  {viewingRecord.templateTitle}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs bg-gray-50 p-3 rounded-lg">
              <div>
                <span className="text-gray-400 font-mono text-[10px]">Inspector:</span>
                <div className="font-bold">{viewingRecord.inspectorName}</div>
              </div>
              <div>
                <span className="text-gray-400 font-mono text-[10px]">Date:</span>
                <div className="font-bold">{viewingRecord.date}</div>
              </div>
              <div>
                <span className="text-gray-400 font-mono text-[10px]">Location:</span>
                <div className="font-bold">{viewingRecord.location}</div>
              </div>
              <div>
                <span className="text-gray-400 font-mono text-[10px]">Score / Result:</span>
                <div className="font-bold text-[#006c4a]">
                  {viewingRecord.complianceScorePercent}% ({viewingRecord.overallResult})
                </div>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <h4 className="font-bold text-gray-800">Checklist Results:</h4>
              <div className="divide-y border rounded-lg">
                {viewingRecord.items.map((item, idx) => (
                  <div key={idx} className="p-2.5 flex items-center justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{item.requirement}</div>
                      {item.comment && (
                        <div className="text-[11px] text-gray-500 italic">Note: {item.comment}</div>
                      )}
                      {item.capaIdCreated && (
                        <div className="text-[10px] text-green-700 font-mono font-bold">
                          Linked CAPA: {item.capaIdCreated}
                        </div>
                      )}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold ${
                        item.status === 'PASS'
                          ? 'bg-green-100 text-green-800'
                          : item.status === 'FAIL'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t">
              <button
                type="button"
                onClick={() => setViewingRecord(null)}
                className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
