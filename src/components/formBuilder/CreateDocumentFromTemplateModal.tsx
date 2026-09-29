import React, { useState } from 'react';
import { DynamicDocumentTemplateConfig } from '../../types/formFieldConfig';
import { TemplateManagementService } from '../../services/templateService';
import { DynamicFieldRenderer } from '../documents/DynamicFieldRenderer';
import { SEED_PROJECTS } from '../../data/seedDatabase';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';

interface CreateDocumentFromTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: DynamicDocumentTemplateConfig | null;
  onDocumentCreated: (docId: string) => void;
}

export const CreateDocumentFromTemplateModal: React.FC<CreateDocumentFromTemplateModalProps> = ({
  isOpen,
  onClose,
  template,
  onDocumentCreated,
}) => {
  if (!isOpen || !template) return null;

  const { currentUser } = useAuth();
  const { language, showToast } = useApp();

  // Document metadata state
  const codePrefix = template.code.replace('TMPL-', '');
  const [docCode, setDocCode] = useState(`${codePrefix}-001-REV00`);
  const [docTitle, setDocTitle] = useState(template.title.replace(' Template', ''));
  const [docTitleAr, setDocTitleAr] = useState(template.titleAr.replace('قالب ', ''));
  const [selectedProjectId, setSelectedProjectId] = useState(SEED_PROJECTS[0]?.id || 'prj-rl-epc4');
  const [retentionYears, setRetentionYears] = useState(15);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field values state populated from template defaults
  const [fieldValues, setFieldValues] = useState<Record<string, any>>(() => {
    const initial: Record<string, any> = {};
    template.sections.forEach((sec) => {
      sec.fields.forEach((fld) => {
        if (fld.defaultValue !== undefined) {
          initial[fld.id] = fld.defaultValue;
        }
      });
    });
    return initial;
  });

  const handleFieldChange = (fieldId: string, val: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleCreateDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docCode.trim()) {
      showToast('Document Title and Code are mandatory');
      return;
    }

    setIsSubmitting(true);
    try {
      const newDoc = await TemplateManagementService.createDocumentFromTemplate(
        template,
        {
          code: docCode.trim(),
          title: docTitle.trim(),
          titleAr: docTitleAr.trim() || docTitle.trim(),
          projectId: selectedProjectId,
          retentionYears: Number(retentionYears),
          authorId: currentUser?.name || 'Authorized Engineer',
          revisionNumber: 'Rev 1.0',
        },
        fieldValues
      );

      showToast(
        language === 'ar'
          ? `تم إنشاء الوثيقة بنجاح: ${newDoc.code}`
          : `Created Controlled Document: ${newDoc.code}`
      );

      onDocumentCreated(newDoc.id);
      onClose();
    } catch (err: any) {
      showToast(`Error creating document: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#82f5c1] text-[22px]">post_add</span>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {language === 'ar' ? 'إنشاء وثيقة حية من القالب' : 'Generate Living Document from Template'}
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                {template.code} &bull; {template.title} (v{template.version})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleCreateDocument} className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* Metadata Section */}
          <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] font-mono flex items-center gap-2">
              <span className="material-symbols-outlined text-[16px]">verified</span>
              Controlled Document Registration Metadata
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docCode}
                  onChange={(e) => setDocCode(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono font-bold focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Project Asset</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none font-medium"
                >
                  {SEED_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} &bull; {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Retention Period</label>
                <select
                  value={retentionYears}
                  onChange={(e) => setRetentionYears(Number(e.target.value))}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                >
                  <option value={7}>7 Years (Statutory)</option>
                  <option value={10}>10 Years (Operational)</option>
                  <option value={15}>15 Years (ISO 45001)</option>
                  <option value={20}>20 Years (Asset Life)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Document Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none font-semibold text-[#0b1c30]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  value={docTitleAr}
                  onChange={(e) => setDocTitleAr(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none text-right font-semibold text-[#0b1c30]"
                />
              </div>
            </div>
          </div>

          {/* Living Sections & Fields */}
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b pb-2">
              <h4 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#006c4a] text-[18px]">edit_document</span>
                Dynamic Document Content Fields ({template.sections.length} Sections)
              </h4>
              <span className="text-xs text-slate-500">
                All fields remain fully editable before and after submission.
              </span>
            </div>

            {template.sections.map((sec, secIdx) => (
              <div key={sec.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                <div className="border-b border-slate-100 pb-2.5">
                  <div className="flex items-center justify-between">
                    <h5 className="font-bold text-sm text-[#0b1c30]">
                      {language === 'ar' && sec.titleAr ? sec.titleAr : sec.title}
                    </h5>
                    <span className="text-[11px] font-mono text-slate-400">
                      Section {secIdx + 1} of {template.sections.length}
                    </span>
                  </div>
                  {(sec.description || sec.descriptionAr) && (
                    <p className="text-xs text-slate-500 mt-0.5">
                      {language === 'ar' && sec.descriptionAr ? sec.descriptionAr : sec.description}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {sec.fields.map((fld) => (
                    <div
                      key={fld.id}
                      className={
                        ['TEXTAREA', 'LONG_TEXT', 'RICH_TEXT', 'TABLE', 'ATTACHMENT', 'IMAGE', 'SIGNATURE'].includes(
                          fld.fieldType
                        )
                          ? 'md:col-span-2'
                          : 'col-span-1'
                      }
                    >
                      <DynamicFieldRenderer
                        field={fld}
                        value={fieldValues[fld.id]}
                        onChange={(val) => handleFieldChange(fld.id, val)}
                        language={language}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
              <span>WORM Ledger Integrity Enabled &bull; ISO 45001 Compliance Verified</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">save</span>
                {isSubmitting ? 'Registering Document...' : 'Save & Register Controlled Document'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
