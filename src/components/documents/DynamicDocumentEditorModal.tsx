import React, { useState, useEffect } from 'react';
import { ControlledDocument } from '../../types';
import { DynamicDocumentTemplateConfig, FormFieldConfig } from '../../types/formFieldConfig';
import { TemplateManagementService } from '../../services/templateService';
import { DynamicFieldRenderer } from './DynamicFieldRenderer';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { DocumentControlService } from '../../services/documentControlService';
import { AuditLogService } from '../../services/auditLogService';

interface DynamicDocumentEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: ControlledDocument | null;
  onDocumentUpdated?: () => void;
}

export const DynamicDocumentEditorModal: React.FC<DynamicDocumentEditorModalProps> = ({
  isOpen,
  onClose,
  document,
  onDocumentUpdated,
}) => {
  if (!isOpen || !document) return null;

  const { language, showToast } = useApp();
  const { currentUser } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [template, setTemplate] = useState<DynamicDocumentTemplateConfig | null>(null);
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({});
  const [docTitle, setDocTitle] = useState(document.title);
  const [docTitleAr, setDocTitleAr] = useState(document.titleAr || '');
  const [changeSummary, setChangeSummary] = useState('Updated operational parameters and field verification');
  const [isSaving, setIsSaving] = useState(false);
  const [isLockedApproved, setIsLockedApproved] = useState(false);
  const [nextRevLabel, setNextRevLabel] = useState('Rev 01');

  // Check if current revision is approved/published
  useEffect(() => {
    const isApprovedOrPublished =
      document.signoffStatus === 'APPROVED' ||
      document.signoffStatusLabel === 'ACTIVE & CONTROLLED';
    setIsLockedApproved(isApprovedOrPublished);

    // Calculate next revision format Rev 00 -> Rev 01 -> Rev 02
    const currentRevMatch = document.currentRevision.match(/(\d+)/);
    const currentNum = currentRevMatch ? parseInt(currentRevMatch[1], 10) : 0;
    const nextNum = currentNum + 1;
    setNextRevLabel(`Rev ${nextNum < 10 ? '0' + nextNum : nextNum}`);
  }, [document]);

  // Load document content and matching dynamic template
  useEffect(() => {
    loadContent();
  }, [document.code]);

  const loadContent = async () => {
    setIsLoading(true);
    try {
      const content = await TemplateManagementService.loadDocumentContent(document.code);
      if (content.template) {
        setTemplate(content.template);
        setFieldValues(content.values || {});
      } else {
        // Fallback: match by code prefix to default dynamic templates
        const allTemplates = await TemplateManagementService.getAllTemplates();
        const matched =
          allTemplates.find((t) => document.code.startsWith(t.code.replace('TMPL-', ''))) ||
          allTemplates[0];

        if (matched) {
          setTemplate(matched);
          const initial: Record<string, any> = {};
          matched.sections.forEach((s) => {
            s.fields.forEach((f) => {
              if (f.defaultValue !== undefined) initial[f.id] = f.defaultValue;
            });
          });
          setFieldValues(content.values && Object.keys(content.values).length > 0 ? content.values : initial);
        }
      }
    } catch (err) {
      console.error('Failed to load document content:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (fieldId: string, val: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: val,
    }));
  };

  const handleSaveDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // Execute strict Phase 9 Revision Immutability rule:
      // If document is approved, never overwrite! Create new revision in DRAFT state.
      const saveResult = await DocumentControlService.editOrCreateDocumentRevision({
        documentId: `doc-${document.code.toLowerCase()}`,
        documentCode: document.code,
        title: docTitle,
        changeSummary: changeSummary.trim() || 'Operational parameters updated',
        contentData: fieldValues,
        authorId: currentUser.id || 'USR-CURRENT',
        authorName: currentUser.name,
        authorRole: currentUser.role,
      });

      // Also persist to template content table
      await TemplateManagementService.updateDocumentContent(
        document.code,
        fieldValues,
        currentUser.name,
        changeSummary
      );

      // Audit log the edit action
      await AuditLogService.logAction({
        action: 'Edit',
        entityType: 'DOCUMENT',
        entityId: document.code,
        entityTitle: `${docTitle} (${saveResult.revision.revisionNumber})`,
        details: isLockedApproved
          ? `Created new revision ${saveResult.revision.revisionNumber} (DRAFT) as predecessor was approved/locked. ${changeSummary}`
          : `Updated DRAFT revision ${saveResult.revision.revisionNumber}. ${changeSummary}`,
        actorName: currentUser.name,
        actorRole: currentUser.role,
        isoClause: document.clause || 'ISO 45001 §7.5.3',
      });

      if (isLockedApproved) {
        showToast(
          language === 'ar'
            ? `تم إنشاء مراجعة جديدة (${saveResult.revision.revisionNumber}) للمراجعة؛ النسخة المعتمدة محفوظة دون تعديل.`
            : `Created new revision ${saveResult.revision.revisionNumber} (DRAFT). Previous approved revision is safely preserved!`
        );
      } else {
        showToast(
          language === 'ar'
            ? `تم حفظ التعديلات على المراجعة: ${saveResult.revision.revisionNumber}`
            : `Saved updates to revision ${saveResult.revision.revisionNumber}`
        );
      }

      if (onDocumentUpdated) onDocumentUpdated();
      onClose();
    } catch (err: any) {
      console.error('Save failed:', err);
      showToast(language === 'ar' ? 'فشل الحفظ: ' + err.message : 'Save failed: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl my-6 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#82f5c1] text-[22px]">edit_note</span>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {language === 'ar' ? 'تعديل وثيقة السلامة الحية وضبط المراجعات' : 'Edit Living Document & Revision Control'}
              </h3>
              <p className="text-[11px] text-slate-300 font-mono">
                {document.code} &bull; {document.currentRevision} &bull; ISO {document.clause}
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

        {/* Immutability Banner for Approved Revisions */}
        {isLockedApproved && (
          <div className="bg-[#fff8e1] border-b border-[#ffe082] px-6 py-3 flex items-start gap-3 text-xs text-[#8d6e63]">
            <span className="material-symbols-outlined text-[#f57f17] text-[20px] flex-shrink-0 mt-0.5">
              lock
            </span>
            <div>
              <div className="font-bold text-[#b78103]">
                CRITICAL REVISION INTEGRITY RULE (ISO 45001 Clause 7.5.3)
              </div>
              <p className="text-[11px] text-[#5d4037] leading-relaxed">
                Current revision <strong>{document.currentRevision}</strong> is APPROVED and LOCKED.
                An approved revision must <strong>NEVER</strong> be overwritten. Saving changes will automatically
                create new revision <strong>{nextRevLabel}</strong> in <span className="font-bold text-[#d97706]">DRAFT</span> status,
                preserving the approved baseline for complete auditability.
              </p>
            </div>
          </div>
        )}

        {/* Content Form */}
        <form onSubmit={handleSaveDocument} className="p-6 overflow-y-auto space-y-6 flex-1">
          {isLoading ? (
            <div className="py-12 text-center text-xs font-mono text-slate-500">
              Loading dynamic document fields...
            </div>
          ) : (
            <>
              {/* Document Identity metadata */}
              <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#0b1c30] font-mono">
                    Document Metadata &amp; Revision Control
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                    isLockedApproved ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-emerald-100 text-[#006c4a]'
                  }`}>
                    {isLockedApproved ? `WILL CREATE ${nextRevLabel}` : 'EDITING DRAFT'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Document Title (EN)</label>
                    <input
                      type="text"
                      required
                      value={docTitle}
                      onChange={(e) => setDocTitle(e.target.value)}
                      className="w-full bg-white text-xs font-bold rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Document Title (AR)</label>
                    <input
                      type="text"
                      dir="rtl"
                      value={docTitleAr}
                      onChange={(e) => setDocTitleAr(e.target.value)}
                      className="w-full bg-white text-xs font-bold rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Revision Change Summary / Justification <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={changeSummary}
                    onChange={(e) => setChangeSummary(e.target.value)}
                    className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                    placeholder="E.g., Updated section 4 hazard mitigations and emergency response contacts"
                  />
                  <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
                    Recorded permanently in the immutable revision log &amp; audit trail.
                  </span>
                </div>
              </div>

              {/* Sections & Fields */}
              {template && (
                <div className="space-y-6">
                  {template.sections.map((sec, secIdx) => (
                    <div key={sec.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm space-y-4">
                      <div className="border-b border-slate-100 pb-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[#0b1c30]">
                            {language === 'ar' && sec.titleAr ? sec.titleAr : sec.title}
                          </h4>
                          <span className="text-[11px] font-mono text-slate-400">
                            Section {secIdx + 1}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {sec.fields.map((fld: FormFieldConfig) => (
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
              )}
            </>
          )}

          {/* Footer actions */}
          <div className="pt-4 flex items-center justify-between border-t border-slate-200">
            <div className="flex items-center gap-2 text-xs text-slate-500 font-mono">
              <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span>
              <span>
                {isLockedApproved
                  ? `Immutability Protected: Spawns ${nextRevLabel} (DRAFT)`
                  : 'Updating Current Revision (DRAFT)'}
              </span>
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
                disabled={isSaving}
                className="px-5 py-2.5 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold shadow-md flex items-center gap-2 disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">
                  {isLockedApproved ? 'add_circle' : 'save'}
                </span>
                {isSaving
                  ? 'Saving Revision...'
                  : isLockedApproved
                  ? `Save as New Revision (${nextRevLabel})`
                  : 'Save Revision'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
