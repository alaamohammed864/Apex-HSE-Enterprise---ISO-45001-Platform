import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import {
  INITIAL_23_DOCUMENT_TYPES,
  DocumentManagementService,
  DocumentTypeDefinition,
} from '../../services/documentService';
import { ControlledDocument } from '../../types';
import { SEED_PROJECTS } from '../../data/seedDatabase';

interface CreateEditDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentToEdit?: ControlledDocument | null;
  mode: 'create' | 'edit';
}

export const CreateEditDocumentModal: React.FC<CreateEditDocumentModalProps> = ({
  isOpen,
  onClose,
  documentToEdit,
  mode,
}) => {
  const { language, showToast, addControlledDocument, operatingUnit } = useApp();
  const { currentUser } = useAuth();

  const [selectedType, setSelectedType] = useState<DocumentTypeDefinition>(
    INITIAL_23_DOCUMENT_TYPES[8] // default HSE Plan
  );
  const [docTitle, setDocTitle] = useState(
    documentToEdit?.title || 'Site Environmental, Health & Safety Plan'
  );
  const [docTitleAr, setDocTitleAr] = useState(
    documentToEdit?.titleAr || 'خطة السلامة والصحة المهنية والبيئة للموقع'
  );
  const [category, setCategory] = useState(documentToEdit?.categoryName || 'Cat 09: HSE Plan');
  const [isoClause, setIsoClause] = useState(documentToEdit?.clause || 'CL-7.5.1');
  const [custodian, setCustodian] = useState(documentToEdit?.custodian || currentUser.name);
  const [custodianDept, setCustodianDept] = useState(
    documentToEdit?.custodianDept || 'HSE Operations & Risk Division'
  );
  const [retentionYears, setRetentionYears] = useState(
    documentToEdit?.mandatoryFrequencyDays ? Math.round(documentToEdit.mandatoryFrequencyDays / 365) : 10
  );
  const [securityClassification, setSecurityClassification] = useState(
    documentToEdit?.securityClassification || 'CONFIDENTIAL - PROJECT RESTRICTED'
  );
  const [seqNumber, setSeqNumber] = useState(1);
  const [revNumber, setRevNumber] = useState(0);
  const [customCode, setCustomCode] = useState('');

  if (!isOpen) return null;

  const generatedCode =
    customCode.trim() ||
    DocumentManagementService.generateDocumentNumber(selectedType.codePrefix, seqNumber, revNumber);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!docTitle.trim()) {
      showToast('Document Title is required.');
      return;
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const nextYearDate = new Date();
    nextYearDate.setFullYear(nextYearDate.getFullYear() + 1);
    const nextReviewStr = nextYearDate.toISOString().split('T')[0];

    const newDoc: ControlledDocument = {
      code: generatedCode,
      clause: isoClause,
      title: docTitle,
      titleAr: docTitleAr,
      categoryNumber: selectedType.id,
      categoryName: `${selectedType.category}: ${selectedType.name}`,
      isBilingual: true,
      currentRevision: `Rev ${revNumber}.0`,
      totalRevisionsCount: 1,
      custodian,
      custodianDept,
      signoffStatus: 'APPROVED',
      signoffStatusLabel: 'ACTIVE & CONTROLLED',
      signoffDetail: 'WORM Cryptographically Signed',
      effectiveDate: todayStr,
      nextReviewDate: nextReviewStr,
      securityClassification,
      mandatoryFrequencyDays: retentionYears * 365,
      revisions: [
        {
          revId: `rev-1-${Date.now()}`,
          label: `Rev ${revNumber}.0`,
          date: todayStr,
          description: `Initial formal release of ${docTitle} conforming to ISO 45001 §${isoClause}`,
          signer: currentUser.name,
          isCurrent: true,
        },
      ],
      referencedComplianceArtifacts: [
        { code: 'ISO-45001-2018', title: 'Occupational Health and Safety Standard', typeBadge: 'ISO Clause', icon: 'verified' },
        { code: 'QAT-MOI-CD', title: 'Civil Defense Life Safety Regulations', typeBadge: 'Statutory', icon: 'local_fire_department' },
      ],
    };

    addControlledDocument(newDoc);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="w-full max-w-3xl bg-white rounded-2xl shadow-2xl border border-[#c6c6cd]/50 overflow-hidden my-8"
        dir={language === 'ar' ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="bg-[#131b2e] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[24px] text-[#82f5c1]">
              {mode === 'create' ? 'note_add' : 'edit_document'}
            </span>
            <div>
              <h3 className="font-bold text-base">
                {mode === 'create'
                  ? language === 'ar'
                    ? 'تسجيل وثيقة ISO 45001 جديدة'
                    : 'Register New Controlled Document'
                  : language === 'ar'
                  ? 'تعديل بيانات الوثيقة المعتمدة'
                  : 'Edit Controlled Document Metadata'}
              </h3>
              <p className="text-xs text-white/70">
                ISO 45001:2018 Clause 7.5 Documented Information & Lifecycle Architecture
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {/* Document Type Selector (23 Types) */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-[#0b1c30]">
              {language === 'ar' ? 'نوع الوثيقة الهندسية (من 23 نوعاً معتمداً)' : 'ISO 45001 Document Type (23 Types)'}
            </label>
            <select
              value={selectedType.id}
              onChange={(e) => {
                const found = INITIAL_23_DOCUMENT_TYPES.find((t) => t.id === Number(e.target.value));
                if (found) {
                  setSelectedType(found);
                  setIsoClause(`CL-${found.isoClause}`);
                  setDocTitle(`${found.name} - ${operatingUnit}`);
                  setDocTitleAr(`${found.nameAr} - ${operatingUnit}`);
                }
              }}
              className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-semibold rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
            >
              {INITIAL_23_DOCUMENT_TYPES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.codePrefix} &bull; {t.name} ({t.nameAr}) &bull; [ISO {t.isoClause}]
                </option>
              ))}
            </select>
            <p className="text-[11px] text-[#45464d] leading-relaxed">
              {selectedType.description}
            </p>
          </div>

          {/* Configurable Numbering Preview */}
          <div className="p-3 rounded-xl bg-[#eff4ff] border border-[#006c4a]/30 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-[#0b1c30]">
                {language === 'ar' ? 'رمز الترقيم المولد تلقائياً:' : 'Generated Controlled Document Number:'}
              </span>
              <span className="font-mono font-bold text-sm text-[#006c4a] bg-white px-2.5 py-0.5 rounded border border-[#006c4a]/40">
                {generatedCode}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div>
                <label className="text-[10px] font-mono text-[#45464d] block">Sequence Number</label>
                <input
                  type="number"
                  min="1"
                  max="999"
                  value={seqNumber}
                  onChange={(e) => setSeqNumber(Number(e.target.value))}
                  className="w-full bg-white text-xs font-mono rounded px-2 py-1 border border-[#c6c6cd]/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#45464d] block">Revision Sequence</label>
                <input
                  type="number"
                  min="0"
                  max="99"
                  value={revNumber}
                  onChange={(e) => setRevNumber(Number(e.target.value))}
                  className="w-full bg-white text-xs font-mono rounded px-2 py-1 border border-[#c6c6cd]/40"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-[#45464d] block">Override Code (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. HSE-INC-2026-001"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-white text-xs font-mono rounded px-2 py-1 border border-[#c6c6cd]/40"
                />
              </div>
            </div>
          </div>

          {/* Bilingual Titles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">
                Document Title (English) *
              </label>
              <input
                type="text"
                required
                value={docTitle}
                onChange={(e) => setDocTitle(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">
                عنوان الوثيقة (باللغة العربية) *
              </label>
              <input
                type="text"
                required
                dir="rtl"
                value={docTitleAr}
                onChange={(e) => setDocTitleAr(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Custodian & Department */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">
                Author / Designated Custodian
              </label>
              <input
                type="text"
                value={custodian}
                onChange={(e) => setCustodian(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">
                Department / Division
              </label>
              <input
                type="text"
                value={custodianDept}
                onChange={(e) => setCustodianDept(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Retention & Classification */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">ISO 45001 Clause</label>
              <input
                type="text"
                value={isoClause}
                onChange={(e) => setIsoClause(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs font-mono rounded-lg px-3 py-2 border border-[#c6c6cd]/40"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">Retention (Years)</label>
              <input
                type="number"
                min="1"
                max="50"
                value={retentionYears}
                onChange={(e) => setRetentionYears(Number(e.target.value))}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-bold text-[#0b1c30]">Classification</label>
              <select
                value={securityClassification}
                onChange={(e) => setSecurityClassification(e.target.value)}
                className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40"
              >
                <option value="CONFIDENTIAL - PROJECT RESTRICTED">CONFIDENTIAL - RESTRICTED</option>
                <option value="INTERNAL OPERATIONAL USE">INTERNAL OPERATIONAL</option>
                <option value="PUBLIC SAFETY RELEASE">PUBLIC SAFETY RELEASE</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#c6c6cd]/30 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-bold transition-colors"
            >
              {language === 'ar' ? 'إلغاء' : 'Cancel'}
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#000000] hover:bg-[#213145] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">verified</span>
              <span>
                {mode === 'create'
                  ? language === 'ar'
                    ? 'تسجيل واعتماد الوثيقة'
                    : 'Publish & Lock in Ledger'
                  : language === 'ar'
                  ? 'حفظ التعديلات'
                  : 'Save Changes'}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
