import React, { useState, useEffect, useMemo } from 'react';
import {
  DynamicDocumentTemplateConfig,
  FormSectionConfig,
  FormFieldConfig,
  FormFieldType,
} from '../../types/formFieldConfig';
import { TemplateManagementService } from '../../services/templateService';
import { FieldEditorModal } from './FieldEditorModal';
import { CreateDocumentFromTemplateModal } from './CreateDocumentFromTemplateModal';
import { DynamicFieldRenderer } from '../documents/DynamicFieldRenderer';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';

interface DynamicFormBuilderProps {
  initialCategory?: string;
  initialTemplateCode?: string;
}

export const DynamicFormBuilder: React.FC<DynamicFormBuilderProps> = ({
  initialCategory = 'ALL',
  initialTemplateCode,
}) => {
  const { language, t, showToast, setActiveNav } = useApp();
  const { currentUser } = useAuth();

  // Mode: 'TEMPLATES_LIST' or 'TEMPLATE_EDITOR'
  const [viewMode, setViewMode] = useState<'TEMPLATES_LIST' | 'TEMPLATE_EDITOR'>('TEMPLATES_LIST');
  const [editorTab, setEditorTab] = useState<'BUILDER' | 'PREVIEW'>('BUILDER');

  // Templates state
  const [templates, setTemplates] = useState<DynamicDocumentTemplateConfig[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DynamicDocumentTemplateConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>(initialCategory);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Modals state
  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<FormFieldConfig | null>(null);
  const [targetSectionId, setTargetSectionId] = useState<string>('');
  const [isCreateDocModalOpen, setIsCreateDocModalOpen] = useState(false);
  const [isNewTemplateModalOpen, setIsNewTemplateModalOpen] = useState(false);

  // Preview live form testing values
  const [previewValues, setPreviewValues] = useState<Record<string, any>>({});

  // New Template form state
  const [newTmplCode, setNewTmplCode] = useState('');
  const [newTmplTitle, setNewTmplTitle] = useState('');
  const [newTmplTitleAr, setNewTmplTitleAr] = useState('');
  const [newTmplCategory, setNewTmplCategory] = useState<'PLANS' | 'PROCEDURES' | 'FORMS' | 'RECORDS' | 'POLICIES'>('FORMS');
  const [newTmplIso, setNewTmplIso] = useState('8.1.2');
  const [newTmplDesc, setNewTmplDesc] = useState('');

  // Load templates on mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      const list = await TemplateManagementService.getAllTemplates();
      setTemplates(list);
      if (initialTemplateCode) {
        const found = list.find((t) => t.code === initialTemplateCode);
        if (found) {
          setSelectedTemplate(found);
        } else if (list.length > 0) {
          setSelectedTemplate(list[0]);
        }
      } else if (!selectedTemplate && list.length > 0) {
        setSelectedTemplate(list[0]);
      }
    } catch (err) {
      console.error('Failed to load templates:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filtered templates list
  const filteredTemplates = useMemo(() => {
    return templates.filter((tmpl) => {
      const matchesSearch =
        tmpl.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.titleAr.includes(searchQuery) ||
        tmpl.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tmpl.isoClause.includes(searchQuery);

      const matchesCat = categoryFilter === 'ALL' || tmpl.category === categoryFilter;
      const matchesStatus = statusFilter === 'ALL' || tmpl.status === statusFilter;

      return matchesSearch && matchesCat && matchesStatus;
    });
  }, [templates, searchQuery, categoryFilter, statusFilter]);

  // Handle Create Template
  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTmplCode.trim() || !newTmplTitle.trim()) {
      showToast('Template code and title are required');
      return;
    }

    const newId = `tmpl-${Date.now()}`;
    const initialSectionId = `sec-${Date.now()}-1`;

    const freshTemplate: DynamicDocumentTemplateConfig = {
      id: newId,
      code: newTmplCode.trim().toUpperCase(),
      title: newTmplTitle.trim(),
      titleAr: newTmplTitleAr.trim() || newTmplTitle.trim(),
      category: newTmplCategory,
      isoClause: newTmplIso.trim() || '8.1.2',
      description: newTmplDesc.trim() || 'Dynamic HSE template managed via Dynamic Form Builder.',
      version: '1.0',
      status: 'DRAFT',
      createdBy: currentUser?.name || 'Administrator',
      updatedBy: currentUser?.name || 'Administrator',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sections: [
        {
          id: initialSectionId,
          title: '1. General Section',
          titleAr: '1. القسم العام',
          description: 'Primary operational scope and administrative fields.',
          order: 1,
          isMandatory: true,
          fields: [
            {
              id: `fld-${Date.now()}-title`,
              fieldKey: 'generalTitle',
              label: 'Title / Subject',
              labelAr: 'الموضوع / العنوان',
              fieldType: 'TEXT',
              isRequired: true,
              order: 1,
              sectionId: initialSectionId,
              visibility: 'VISIBLE',
              permissions: 'ALL',
            },
          ],
        },
      ],
    };

    await TemplateManagementService.saveTemplate(freshTemplate);
    await loadTemplates();
    setSelectedTemplate(freshTemplate);
    setViewMode('TEMPLATE_EDITOR');
    setEditorTab('BUILDER');
    setIsNewTemplateModalOpen(false);
    showToast(`Created new template: ${freshTemplate.code}`);
  };

  // Handle Duplicate Template
  const handleDuplicateTemplate = async (tmplId: string) => {
    try {
      const duplicated = await TemplateManagementService.duplicateTemplate(
        tmplId,
        currentUser?.name || 'Corporate Admin'
      );
      await loadTemplates();
      setSelectedTemplate(duplicated);
      showToast(`Duplicated template into: ${duplicated.code}`);
    } catch (err: any) {
      showToast(`Error duplicating template: ${err.message}`);
    }
  };

  // Handle Archive Template
  const handleArchiveTemplate = async (tmplId: string) => {
    try {
      await TemplateManagementService.archiveTemplate(tmplId);
      await loadTemplates();
      if (selectedTemplate?.id === tmplId) {
        const remaining = templates.filter((t) => t.id !== tmplId);
        setSelectedTemplate(remaining[0] || null);
      }
      showToast('Template archived successfully');
    } catch (err: any) {
      showToast(`Error archiving template: ${err.message}`);
    }
  };

  // Handle Save Active Template
  const handleSaveActiveTemplate = async () => {
    if (!selectedTemplate) return;
    try {
      await TemplateManagementService.saveTemplate(selectedTemplate);
      await loadTemplates();
      showToast(`Saved template "${selectedTemplate.code}" with full schema.`);
    } catch (err: any) {
      showToast(`Save error: ${err.message}`);
    }
  };

  // Section Operations
  const handleAddSection = () => {
    if (!selectedTemplate) return;
    const newSecNum = selectedTemplate.sections.length + 1;
    const newSecId = `sec-${Date.now()}-${newSecNum}`;
    const newSec: FormSectionConfig = {
      id: newSecId,
      title: `${newSecNum}. New Section Title`,
      titleAr: `${newSecNum}. عنوان القسم الجديد`,
      order: newSecNum,
      isMandatory: true,
      fields: [],
    };

    const updated = {
      ...selectedTemplate,
      sections: [...selectedTemplate.sections, newSec],
    };
    setSelectedTemplate(updated);
    showToast(`Added Section ${newSecNum}`);
  };

  const handleUpdateSectionTitle = (secId: string, titleEn: string, titleAr: string) => {
    if (!selectedTemplate) return;
    const updated = {
      ...selectedTemplate,
      sections: selectedTemplate.sections.map((s) =>
        s.id === secId ? { ...s, title: titleEn, titleAr: titleAr } : s
      ),
    };
    setSelectedTemplate(updated);
  };

  const handleMoveSection = (index: number, direction: 'UP' | 'DOWN') => {
    if (!selectedTemplate) return;
    const targetIdx = direction === 'UP' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= selectedTemplate.sections.length) return;

    const newSections = [...selectedTemplate.sections];
    const temp = newSections[index];
    newSections[index] = newSections[targetIdx];
    newSections[targetIdx] = temp;

    // Recalculate order numbers
    newSections.forEach((s, idx) => {
      s.order = idx + 1;
    });

    setSelectedTemplate({
      ...selectedTemplate,
      sections: newSections,
    });
  };

  const handleDeleteSection = (secId: string) => {
    if (!selectedTemplate) return;
    if (selectedTemplate.sections.length <= 1) {
      showToast('A template must have at least one section');
      return;
    }
    const filtered = selectedTemplate.sections.filter((s) => s.id !== secId);
    filtered.forEach((s, idx) => {
      s.order = idx + 1;
    });
    setSelectedTemplate({
      ...selectedTemplate,
      sections: filtered,
    });
    showToast('Deleted section');
  };

  // Field Operations inside Section
  const handleOpenAddField = (secId: string) => {
    setTargetSectionId(secId);
    setEditingField(null);
    setIsFieldModalOpen(true);
  };

  const handleOpenEditField = (fld: FormFieldConfig, secId: string) => {
    setTargetSectionId(secId);
    setEditingField(fld);
    setIsFieldModalOpen(true);
  };

  const handleSaveField = (savedField: FormFieldConfig) => {
    if (!selectedTemplate) return;

    const newSections = selectedTemplate.sections.map((sec) => {
      // If field was moved to a different section or is in this section
      if (sec.id === savedField.sectionId) {
        const existingIdx = sec.fields.findIndex((f) => f.id === savedField.id);
        if (existingIdx >= 0) {
          const updatedFields = [...sec.fields];
          updatedFields[existingIdx] = savedField;
          return { ...sec, fields: updatedFields };
        } else {
          return { ...sec, fields: [...sec.fields, savedField] };
        }
      } else {
        // Remove from old section if it moved
        return {
          ...sec,
          fields: sec.fields.filter((f) => f.id !== savedField.id),
        };
      }
    });

    setSelectedTemplate({
      ...selectedTemplate,
      sections: newSections,
    });
    showToast(`Saved field "${savedField.label}"`);
  };

  const handleDeleteField = (secId: string, fieldId: string) => {
    if (!selectedTemplate) return;
    const newSections = selectedTemplate.sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          fields: sec.fields.filter((f) => f.id !== fieldId),
        };
      }
      return sec;
    });

    setSelectedTemplate({
      ...selectedTemplate,
      sections: newSections,
    });
    showToast('Field deleted');
  };

  const handleMoveField = (secId: string, fieldIdx: number, direction: 'UP' | 'DOWN') => {
    if (!selectedTemplate) return;
    const targetIdx = direction === 'UP' ? fieldIdx - 1 : fieldIdx + 1;

    const newSections = selectedTemplate.sections.map((sec) => {
      if (sec.id === secId) {
        if (targetIdx < 0 || targetIdx >= sec.fields.length) return sec;
        const newFields = [...sec.fields];
        const temp = newFields[fieldIdx];
        newFields[fieldIdx] = newFields[targetIdx];
        newFields[targetIdx] = temp;
        newFields.forEach((f, idx) => {
          f.order = idx + 1;
        });
        return { ...sec, fields: newFields };
      }
      return sec;
    });

    setSelectedTemplate({
      ...selectedTemplate,
      sections: newSections,
    });
  };

  const handleDuplicateField = (secId: string, fld: FormFieldConfig) => {
    if (!selectedTemplate) return;
    const newFieldId = `fld-${Date.now()}`;
    const clonedField: FormFieldConfig = {
      ...fld,
      id: newFieldId,
      fieldKey: `${fld.fieldKey}_copy`,
      label: `${fld.label} (Copy)`,
      labelAr: `${fld.labelAr} (نسخة)`,
      order: fld.order + 1,
    };

    const newSections = selectedTemplate.sections.map((sec) => {
      if (sec.id === secId) {
        return {
          ...sec,
          fields: [...sec.fields, clonedField],
        };
      }
      return sec;
    });

    setSelectedTemplate({
      ...selectedTemplate,
      sections: newSections,
    });
    showToast(`Duplicated field ${fld.label}`);
  };

  // Helper badge color for field type
  const getFieldTypeBadge = (type: FormFieldType) => {
    switch (type) {
      case 'EQUIPMENT':
      case 'RISK':
      case 'KPI':
      case 'INCIDENT':
      case 'TRAINING':
      case 'PROJECT':
      case 'EMPLOYEE':
      case 'CONTRACTOR':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SIGNATURE':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'YES_NO':
      case 'RADIO':
      case 'DROPDOWN':
      case 'MULTI_SELECT':
      case 'CHECKBOX':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'TABLE':
      case 'IMAGE':
      case 'ATTACHMENT':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="flex flex-col w-full min-h-screen">
      {/* Top Header Bar */}
      <header className="w-full bg-white px-3.5 sm:px-6 py-3 sm:py-4 shadow-sm border-b border-[#c6c6cd]/30 sticky top-16 z-20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#0b1c30] text-white flex items-center justify-center shadow-md">
              <span className="material-symbols-outlined text-[22px]">dynamic_form</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#0b1c30] tracking-tight">
                  {language === 'ar' ? 'منشئ قوالب وثائق السلامة الديناميكي' : 'Dynamic HSE Document Template Builder'}
                </h1>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-[#82f5c1] text-[#006c4a] border border-[#006c4a]/30">
                  ISO 45001 §7.5 &amp; §8.1
                </span>
              </div>
              <p className="text-xs text-[#45464d]">
                {language === 'ar'
                  ? 'بناء وإدارة قوالب الوثائق الهندسية بـ 23 نوعاً من الحقول والأقسام الديناميكية وتوليد الوثائق الحية'
                  : 'Design, configure, and manage dynamic templates with 23 field types, interactive sections, and instant document generation.'}
              </p>
            </div>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5">
            {viewMode === 'TEMPLATE_EDITOR' ? (
              <>
                {/* Switch between Editor & Live Preview */}
                <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => setEditorTab('BUILDER')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      editorTab === 'BUILDER'
                        ? 'bg-white text-[#0b1c30] shadow-sm'
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">design_services</span>
                    {language === 'ar' ? 'محرر الحقول' : 'Field Builder'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditorTab('PREVIEW')}
                    className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-1.5 ${
                      editorTab === 'PREVIEW'
                        ? 'bg-white text-[#006c4a] shadow-sm font-bold'
                        : 'text-slate-600 hover:text-black'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    {language === 'ar' ? 'معاينة القالب الحية' : 'Live Preview'}
                  </button>
                </div>

                {/* Create Document from this Template */}
                <button
                  type="button"
                  onClick={() => setIsCreateDocModalOpen(true)}
                  className="px-3.5 py-2 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">post_add</span>
                  {language === 'ar' ? 'إنشاء وثيقة حية من هذا القالب' : 'Generate Document from Template'}
                </button>

                {/* Save Template Button */}
                <button
                  type="button"
                  onClick={handleSaveActiveTemplate}
                  className="px-3.5 py-2 rounded-lg bg-[#0b1c30] hover:bg-[#1a2b42] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-[16px]">save</span>
                  {language === 'ar' ? 'حفظ القالب' : 'Save Template'}
                </button>

                {/* Back to Templates List */}
                <button
                  type="button"
                  onClick={() => setViewMode('TEMPLATES_LIST')}
                  className="px-3 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">view_list</span>
                  {language === 'ar' ? 'قائمة القوالب' : 'All Templates'}
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(true)}
                  className="px-4 py-2 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                >
                  <span className="material-symbols-outlined text-[18px]">add_circle</span>
                  {language === 'ar' ? 'قالب جديد' : 'New Template'}
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="p-3.5 sm:p-6 flex-1 w-full max-w-7xl mx-auto space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        {/* VIEW 1: TEMPLATES LIST */}
        {viewMode === 'TEMPLATES_LIST' && (
          <div className="space-y-5">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <div className="relative flex-1 w-full">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-400 text-[18px]">
                  search
                </span>
                <input
                  type="text"
                  placeholder={language === 'ar' ? 'بحث في قوالب الوثائق...' : 'Search templates by code, title, or ISO clause...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:border-[#006c4a] focus:outline-none"
                >
                  <option value="ALL">All Categories</option>
                  <option value="PLANS">Plans (HSE-PLN)</option>
                  <option value="PROCEDURES">Procedures (HSE-SOP)</option>
                  <option value="FORMS">Forms &amp; Checklists</option>
                  <option value="RECORDS">Records &amp; Incidents</option>
                  <option value="POLICIES">Policies &amp; Manuals</option>
                </select>

                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 text-xs rounded-lg border border-slate-300 bg-white font-medium text-slate-700 focus:border-[#006c4a] focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="PUBLISHED">Published</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>
            </div>

            {/* Template Cards Grid */}
            {isLoading ? (
              <div className="p-12 text-center text-slate-500 font-mono text-xs">
                Loading dynamic document templates...
              </div>
            ) : filteredTemplates.length === 0 ? (
              <div className="p-12 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-3">
                <span className="material-symbols-outlined text-[36px] text-slate-400">inventory_2</span>
                <p className="text-sm font-bold text-slate-700">No templates found matching your criteria</p>
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(true)}
                  className="px-4 py-2 bg-[#006c4a] text-white text-xs font-bold rounded-lg"
                >
                  Create New Template
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTemplates.map((tmpl) => {
                  const totalFields = tmpl.sections.reduce((acc, s) => acc + s.fields.length, 0);
                  const isArchived = tmpl.status === 'ARCHIVED';

                  return (
                    <div
                      key={tmpl.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
                      <div className="p-5 space-y-3">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 text-[#0b1c30] border border-slate-200">
                            {tmpl.code}
                          </span>
                          <span
                            className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                              isArchived
                                ? 'bg-rose-100 text-rose-800'
                                : tmpl.status === 'PUBLISHED'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tmpl.status}
                          </span>
                        </div>

                        {/* Title */}
                        <div>
                          <h3 className="font-bold text-sm text-[#0b1c30] leading-snug">
                            {language === 'ar' && tmpl.titleAr ? tmpl.titleAr : tmpl.title}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {language === 'ar' && tmpl.descriptionAr ? tmpl.descriptionAr : tmpl.description}
                          </p>
                        </div>

                        {/* Metadata Pills */}
                        <div className="flex flex-wrap gap-2 pt-1 text-[11px] font-mono text-slate-600">
                          <span className="px-2 py-0.5 rounded bg-[#eff4ff] border border-slate-200">
                            ISO {tmpl.isoClause}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                            {tmpl.sections.length} Sections
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                            {totalFields} Fields
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200">
                            v{tmpl.version}
                          </span>
                        </div>
                      </div>

                      {/* Card Footer Actions */}
                      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                          {/* Edit / Build */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(tmpl);
                              setViewMode('TEMPLATE_EDITOR');
                              setEditorTab('BUILDER');
                            }}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1"
                            title="Edit and build template sections & fields"
                          >
                            <span className="material-symbols-outlined text-[16px] text-[#006c4a]">edit</span>
                            Edit
                          </button>

                          {/* Duplicate */}
                          <button
                            type="button"
                            onClick={() => handleDuplicateTemplate(tmpl.id)}
                            className="p-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold"
                            title="Duplicate Template"
                          >
                            <span className="material-symbols-outlined text-[16px]">content_copy</span>
                          </button>

                          {/* Archive */}
                          {!isArchived && (
                            <button
                              type="button"
                              onClick={() => handleArchiveTemplate(tmpl.id)}
                              className="p-1.5 rounded-lg bg-white hover:bg-rose-50 text-slate-700 hover:text-red-700 border border-slate-200 text-xs font-semibold"
                              title="Archive Template"
                            >
                              <span className="material-symbols-outlined text-[16px]">archive</span>
                            </button>
                          )}
                        </div>

                        {/* Generate Document CTA */}
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(tmpl);
                            setIsCreateDocModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1 shadow-sm"
                        >
                          <span className="material-symbols-outlined text-[15px]">post_add</span>
                          Use Template
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: TEMPLATE EDITOR (BUILDER & PREVIEW TABS) */}
        {viewMode === 'TEMPLATE_EDITOR' && selectedTemplate && (
          <div className="space-y-6">
            {/* Template Info Card */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b pb-3">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#eff4ff] text-[#0b1c30] border border-[#c6c6cd]/40">
                    {selectedTemplate.code}
                  </span>
                  <span className="text-xs font-mono text-slate-500">ISO {selectedTemplate.isoClause}</span>
                  <span className="text-xs font-mono text-slate-500">v{selectedTemplate.version}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                      selectedTemplate.status === 'PUBLISHED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {selectedTemplate.status}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const newStatus = selectedTemplate.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
                      setSelectedTemplate({ ...selectedTemplate, status: newStatus });
                      showToast(`Status changed to ${newStatus}`);
                    }}
                    className="text-xs font-bold text-[#006c4a] hover:underline"
                  >
                    Switch to {selectedTemplate.status === 'PUBLISHED' ? 'Draft' : 'Published'}
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => handleDuplicateTemplate(selectedTemplate.id)}
                    className="text-xs font-bold text-slate-600 hover:text-black"
                  >
                    Duplicate Template
                  </button>
                </div>
              </div>

              {/* Title & Description inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Title (English)</label>
                  <input
                    type="text"
                    value={selectedTemplate.title}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, title: e.target.value })}
                    className="w-full bg-slate-50 text-xs font-bold rounded-lg px-3 py-2 border border-slate-300 focus:bg-white focus:border-[#006c4a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Template Title (Arabic)</label>
                  <input
                    type="text"
                    dir="rtl"
                    value={selectedTemplate.titleAr}
                    onChange={(e) => setSelectedTemplate({ ...selectedTemplate, titleAr: e.target.value })}
                    className="w-full bg-slate-50 text-xs font-bold rounded-lg px-3 py-2 border border-slate-300 focus:bg-white focus:border-[#006c4a] focus:outline-none text-right"
                  />
                </div>
              </div>
            </div>

            {/* TAB 1: FIELD BUILDER */}
            {editorTab === 'BUILDER' && (
              <div className="space-y-6">
                {/* Section Controls Toolbar */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-[#0b1c30]">
                      Template Sections ({selectedTemplate.sections.length})
                    </h3>
                    <span className="text-xs text-slate-500">
                      Drag or use Up/Down controls to reorder sections and fields.
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddSection}
                    className="px-3.5 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-[16px]">add_box</span>
                    Add New Section
                  </button>
                </div>

                {/* Sections List */}
                <div className="space-y-6">
                  {selectedTemplate.sections.map((section, secIdx) => (
                    <div
                      key={section.id}
                      className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden"
                    >
                      {/* Section Header */}
                      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                        <div className="flex items-center gap-3 flex-1">
                          <span className="material-symbols-outlined text-slate-400 cursor-grab">
                            drag_indicator
                          </span>

                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-1">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => handleUpdateSectionTitle(section.id, e.target.value, section.titleAr)}
                              className="font-bold text-sm text-[#0b1c30] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#006c4a] focus:bg-white focus:outline-none px-1 rounded flex-1"
                              placeholder="Section Title (EN)"
                            />
                            <input
                              type="text"
                              dir="rtl"
                              value={section.titleAr}
                              onChange={(e) => handleUpdateSectionTitle(section.id, section.title, e.target.value)}
                              className="font-bold text-sm text-[#0b1c30] bg-transparent border-b border-transparent hover:border-slate-300 focus:border-[#006c4a] focus:bg-white focus:outline-none px-1 rounded flex-1 text-right"
                              placeholder="عنوان القسم (عربي)"
                            />
                          </div>
                        </div>

                        {/* Section Actions */}
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {/* Reorder Up */}
                          <button
                            type="button"
                            disabled={secIdx === 0}
                            onClick={() => handleMoveSection(secIdx, 'UP')}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            title="Move section up"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                          </button>

                          {/* Reorder Down */}
                          <button
                            type="button"
                            disabled={secIdx === selectedTemplate.sections.length - 1}
                            onClick={() => handleMoveSection(secIdx, 'DOWN')}
                            className="p-1 rounded bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-30"
                            title="Move section down"
                          >
                            <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                          </button>

                          {/* Add Field */}
                          <button
                            type="button"
                            onClick={() => handleOpenAddField(section.id)}
                            className="px-2.5 py-1 rounded bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[14px]">add</span>
                            Add Field
                          </button>

                          {/* Delete Section */}
                          <button
                            type="button"
                            onClick={() => handleDeleteSection(section.id)}
                            className="p-1 rounded bg-white hover:bg-rose-50 text-slate-500 hover:text-red-700 border border-slate-200"
                            title="Delete section"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </div>

                      {/* Fields Inside Section */}
                      <div className="p-4 space-y-3">
                        {section.fields.length === 0 ? (
                          <div className="p-6 border border-dashed border-slate-200 rounded-lg text-center space-y-2">
                            <p className="text-xs text-slate-500">This section has no fields yet.</p>
                            <button
                              type="button"
                              onClick={() => handleOpenAddField(section.id)}
                              className="px-3 py-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006c4a] text-xs font-bold rounded-lg border border-[#c6c6cd]/40"
                            >
                              + Add First Field
                            </button>
                          </div>
                        ) : (
                          <div className="divide-y divide-slate-100">
                            {section.fields.map((fld, fldIdx) => (
                              <div
                                key={fld.id}
                                className="py-2.5 px-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50 rounded-lg transition-colors"
                              >
                                <div className="flex items-center gap-3">
                                  {/* Field Order badge */}
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold font-mono flex items-center justify-center flex-shrink-0">
                                    {fldIdx + 1}
                                  </span>

                                  {/* Type Badge */}
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase border ${getFieldTypeBadge(
                                      fld.fieldType
                                    )}`}
                                  >
                                    {fld.fieldType}
                                  </span>

                                  {/* Label & Field ID */}
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <span className="font-bold text-xs text-[#0b1c30]">{fld.label}</span>
                                      {fld.isRequired && <span className="text-red-500 font-bold text-xs">*</span>}
                                      {fld.labelAr && (
                                        <span className="text-slate-400 text-xs">&bull; {fld.labelAr}</span>
                                      )}
                                    </div>
                                    <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500 font-mono">
                                      <span>ID: {fld.id}</span>
                                      {fld.permissions !== 'ALL' && <span>Perm: {fld.permissions}</span>}
                                      {fld.visibility !== 'VISIBLE' && <span>Vis: {fld.visibility}</span>}
                                    </div>
                                  </div>
                                </div>

                                {/* Field Action buttons */}
                                <div className="flex items-center gap-1 self-end sm:self-auto">
                                  {/* Move Up */}
                                  <button
                                    type="button"
                                    disabled={fldIdx === 0}
                                    onClick={() => handleMoveField(section.id, fldIdx, 'UP')}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20"
                                    title="Move field up"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                                  </button>

                                  {/* Move Down */}
                                  <button
                                    type="button"
                                    disabled={fldIdx === section.fields.length - 1}
                                    onClick={() => handleMoveField(section.id, fldIdx, 'DOWN')}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-20"
                                    title="Move field down"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">arrow_downward</span>
                                  </button>

                                  {/* Edit Field */}
                                  <button
                                    type="button"
                                    onClick={() => handleOpenEditField(fld, section.id)}
                                    className="p-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#006c4a] font-semibold text-xs px-2 flex items-center gap-1"
                                  >
                                    <span className="material-symbols-outlined text-[14px]">edit</span>
                                    Edit
                                  </button>

                                  {/* Duplicate Field */}
                                  <button
                                    type="button"
                                    onClick={() => handleDuplicateField(section.id, fld)}
                                    className="p-1 rounded hover:bg-slate-200 text-slate-600"
                                    title="Duplicate field"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">content_copy</span>
                                  </button>

                                  {/* Delete Field */}
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteField(section.id, fld.id)}
                                    className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-red-700"
                                    title="Delete field"
                                  >
                                    <span className="material-symbols-outlined text-[16px]">delete</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: LIVE TEMPLATE PREVIEW */}
            {editorTab === 'PREVIEW' && (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-8">
                {/* Preview Banner */}
                <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#006c4a] text-[20px]">preview</span>
                    <div>
                      <h4 className="text-xs font-bold text-[#0b1c30]">
                        Interactive Live Preview of Final Document
                      </h4>
                      <p className="text-[11px] text-[#45464d]">
                        Test the real user experience. All 23 field types render exactly as end users will experience them.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsCreateDocModalOpen(true)}
                    className="px-4 py-2 bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold rounded-lg shadow-sm flex items-center gap-1.5 self-start sm:self-auto"
                  >
                    <span className="material-symbols-outlined text-[16px]">post_add</span>
                    Instantiate Living Document
                  </button>
                </div>

                {/* Document Formal Header Display */}
                <div className="border border-slate-300 rounded-xl p-6 bg-slate-50 space-y-4">
                  <div className="flex items-start justify-between border-b pb-4">
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                        ISO 45001:2018 Statutory Controlled Dossier
                      </span>
                      <h2 className="text-lg font-bold text-[#0b1c30] mt-1">
                        {language === 'ar' && selectedTemplate.titleAr ? selectedTemplate.titleAr : selectedTemplate.title}
                      </h2>
                      <p className="text-xs text-slate-600 mt-1">
                        {language === 'ar' && selectedTemplate.descriptionAr
                          ? selectedTemplate.descriptionAr
                          : selectedTemplate.description}
                      </p>
                    </div>

                    <div className="text-right font-mono text-xs space-y-1">
                      <div className="font-bold text-[#006c4a]">{selectedTemplate.code}</div>
                      <div className="text-slate-500">Version: {selectedTemplate.version}</div>
                      <div className="text-slate-500">Clause: {selectedTemplate.isoClause}</div>
                    </div>
                  </div>
                </div>

                {/* Render All Sections in Preview */}
                <div className="space-y-8">
                  {selectedTemplate.sections.map((sec, secIdx) => (
                    <div key={sec.id} className="space-y-4">
                      <div className="border-b-2 border-[#0b1c30] pb-2">
                        <h3 className="font-bold text-sm text-[#0b1c30]">
                          {language === 'ar' && sec.titleAr ? sec.titleAr : sec.title}
                        </h3>
                        {(sec.description || sec.descriptionAr) && (
                          <p className="text-xs text-slate-500">
                            {language === 'ar' && sec.descriptionAr ? sec.descriptionAr : sec.description}
                          </p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
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
                              value={previewValues[fld.id] ?? fld.defaultValue}
                              onChange={(val) =>
                                setPreviewValues((prev) => ({
                                  ...prev,
                                  [fld.id]: val,
                                }))
                              }
                              language={language}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: Field Editor Modal */}
      {selectedTemplate && (
        <FieldEditorModal
          isOpen={isFieldModalOpen}
          onClose={() => setIsFieldModalOpen(false)}
          onSave={handleSaveField}
          field={editingField}
          sections={selectedTemplate.sections}
          currentSectionId={targetSectionId}
          language={language}
        />
      )}

      {/* MODAL 2: Create Document from Template Modal */}
      {selectedTemplate && (
        <CreateDocumentFromTemplateModal
          isOpen={isCreateDocModalOpen}
          onClose={() => setIsCreateDocModalOpen(false)}
          template={selectedTemplate}
          onDocumentCreated={(docId) => {
            showToast(`Document created with ID: ${docId}`);
            setActiveNav('controlled-document-library');
          }}
        />
      )}

      {/* MODAL 3: New Template Creation Modal */}
      {isNewTemplateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#82f5c1] text-[20px]">add_box</span>
                <h3 className="font-bold text-sm">
                  {language === 'ar' ? 'إنشاء قالب وثيقة ديناميكي جديد' : 'Create New Document Template'}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsNewTemplateModalOpen(false)}
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
              >
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <form onSubmit={handleCreateTemplate} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Template Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. TMPL-HSE-GEN"
                    value={newTmplCode}
                    onChange={(e) => setNewTmplCode(e.target.value)}
                    className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono font-bold focus:bg-white focus:border-[#006c4a] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">ISO Clause</label>
                  <input
                    type="text"
                    placeholder="e.g. 8.1.2"
                    value={newTmplIso}
                    onChange={(e) => setNewTmplIso(e.target.value)}
                    className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono focus:bg-white focus:border-[#006c4a] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Template Title (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Confined Space Entry & Rescue Protocol"
                  value={newTmplTitle}
                  onChange={(e) => setNewTmplTitle(e.target.value)}
                  className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 font-semibold focus:bg-white focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Template Title (Arabic)</label>
                <input
                  type="text"
                  dir="rtl"
                  placeholder="مثال: بروتوكول دخول الأماكن المغلقة والإنقاذ"
                  value={newTmplTitleAr}
                  onChange={(e) => setNewTmplTitleAr(e.target.value)}
                  className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 font-semibold focus:bg-white focus:border-[#006c4a] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Document Category</label>
                <select
                  value={newTmplCategory}
                  onChange={(e) => setNewTmplCategory(e.target.value as any)}
                  className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:bg-white focus:border-[#006c4a] focus:outline-none"
                >
                  <option value="PLANS">Plans (HSE-PLN)</option>
                  <option value="PROCEDURES">Procedures (HSE-SOP / HSE-GEN)</option>
                  <option value="FORMS">Forms &amp; Checklists (HSE-CHK / HSE-CAP)</option>
                  <option value="RECORDS">Records &amp; Investigations (HSE-INC / HSE-AUD)</option>
                  <option value="POLICIES">Policies &amp; Manuals (HSE-POL / HSE-MNL)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Scope</label>
                <textarea
                  rows={2}
                  placeholder="Purpose, boundaries, and statutory obligations..."
                  value={newTmplDesc}
                  onChange={(e) => setNewTmplDesc(e.target.value)}
                  className="w-full bg-slate-50 text-xs rounded-lg px-3 py-2 border border-slate-300 focus:bg-white focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewTemplateModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-[16px]">check</span>
                  Create &amp; Open Builder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
