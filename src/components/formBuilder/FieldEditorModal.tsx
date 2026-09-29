import React, { useState } from 'react';
import {
  FormFieldConfig,
  FormFieldType,
  FieldVisibility,
  FieldPermissionLevel,
  FormSectionConfig,
} from '../../types/formFieldConfig';

interface FieldEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (field: FormFieldConfig) => void;
  field: FormFieldConfig | null;
  sections: FormSectionConfig[];
  currentSectionId: string;
  language: 'en' | 'ar';
}

const FIELD_TYPE_OPTIONS: { type: FormFieldType; label: string; group: string }[] = [
  // Standard Inputs
  { type: 'TEXT', label: 'Single-line Text', group: 'Standard Inputs' },
  { type: 'TEXTAREA', label: 'Textarea (Multi-line)', group: 'Standard Inputs' },
  { type: 'RICH_TEXT', label: 'Rich Text / Formatted', group: 'Standard Inputs' },
  { type: 'NUMBER', label: 'Number / Decimal', group: 'Standard Inputs' },
  { type: 'DATE', label: 'Date Picker', group: 'Standard Inputs' },
  { type: 'TIME', label: 'Time Picker', group: 'Standard Inputs' },
  // Choices & Selection
  { type: 'DROPDOWN', label: 'Dropdown (Single Selection)', group: 'Choices & Options' },
  { type: 'MULTI_SELECT', label: 'Multi-Select (Tag Badges)', group: 'Choices & Options' },
  { type: 'CHECKBOX', label: 'Checkbox (Boolean)', group: 'Choices & Options' },
  { type: 'RADIO', label: 'Radio Button Group', group: 'Choices & Options' },
  { type: 'YES_NO', label: 'Yes / No (Conformity Toggle)', group: 'Choices & Options' },
  // Media & Tables
  { type: 'TABLE', label: 'Dynamic Data Table', group: 'Structured Data & Media' },
  { type: 'IMAGE', label: 'Image Upload / Photo', group: 'Structured Data & Media' },
  { type: 'ATTACHMENT', label: 'File Attachment (PDF/DWG)', group: 'Structured Data & Media' },
  { type: 'SIGNATURE', label: 'Digital Cryptographic Signature', group: 'Structured Data & Media' },
  // Selectors & HSE Entities
  { type: 'EMPLOYEE', label: 'Employee / Personnel Selector', group: 'HSE Entity Selectors' },
  { type: 'PROJECT', label: 'Project Asset Selector', group: 'HSE Entity Selectors' },
  { type: 'CONTRACTOR', label: 'Contractor / Vendor Selector', group: 'HSE Entity Selectors' },
  { type: 'EQUIPMENT', label: 'Equipment & Machinery Asset', group: 'HSE Entity Selectors' },
  { type: 'RISK', label: 'ALARP Risk Register Reference', group: 'HSE Entity Selectors' },
  { type: 'KPI', label: 'Safety KPI Metric Reference', group: 'HSE Entity Selectors' },
  { type: 'INCIDENT', label: 'Incident Investigation Reference', group: 'HSE Entity Selectors' },
  { type: 'TRAINING', label: 'Training Competency Course', group: 'HSE Entity Selectors' },
];

export const FieldEditorModal: React.FC<FieldEditorModalProps> = ({
  isOpen,
  onClose,
  onSave,
  field,
  sections,
  currentSectionId,
  language,
}) => {
  if (!isOpen) return null;

  const [id, setId] = useState(field?.id || `fld-${Date.now()}`);
  const [fieldKey, setFieldKey] = useState(field?.fieldKey || `field_${Date.now().toString().slice(-4)}`);
  const [label, setLabel] = useState(field?.label || '');
  const [labelAr, setLabelAr] = useState(field?.labelAr || '');
  const [description, setDescription] = useState(field?.description || '');
  const [descriptionAr, setDescriptionAr] = useState(field?.descriptionAr || '');
  const [fieldType, setFieldType] = useState<FormFieldType>(field?.fieldType || 'TEXT');
  const [isRequired, setIsRequired] = useState(field?.isRequired ?? false);
  const [defaultValue, setDefaultValue] = useState(field?.defaultValue ?? '');
  const [order, setOrder] = useState<number>(field?.order || 1);
  const [sectionId, setSectionId] = useState(field?.sectionId || currentSectionId);
  const [visibility, setVisibility] = useState<FieldVisibility>(field?.visibility || 'VISIBLE');
  const [permissions, setPermissions] = useState<FieldPermissionLevel>(field?.permissions || 'ALL');

  // Validation
  const [validationRegex, setValidationRegex] = useState(field?.validation?.regex || '');
  const [validationMin, setValidationMin] = useState<string>(
    field?.validation?.min !== undefined ? String(field?.validation?.min) : ''
  );
  const [validationMax, setValidationMax] = useState<string>(
    field?.validation?.max !== undefined ? String(field?.validation?.max) : ''
  );
  const [validationErrorMessage, setValidationErrorMessage] = useState(field?.validation?.errorMessage || '');

  // Options (for Dropdown, Multi-select, Radio)
  const [options, setOptions] = useState<{ value: string; label: string; labelAr?: string }[]>(
    field?.options || [
      { value: 'OPT_1', label: 'Option 1', labelAr: 'الخيار الأول' },
      { value: 'OPT_2', label: 'Option 2', labelAr: 'الخيار الثاني' },
    ]
  );
  const [newOptionVal, setNewOptionVal] = useState('');
  const [newOptionLabel, setNewOptionLabel] = useState('');
  const [newOptionLabelAr, setNewOptionLabelAr] = useState('');

  const handleAddOption = () => {
    if (!newOptionLabel.trim()) return;
    const val = newOptionVal.trim() || newOptionLabel.trim().toUpperCase().replace(/\s+/g, '_');
    setOptions([...options, { value: val, label: newOptionLabel.trim(), labelAr: newOptionLabelAr.trim() || undefined }]);
    setNewOptionVal('');
    setNewOptionLabel('');
    setNewOptionLabelAr('');
  };

  const handleRemoveOption = (index: number) => {
    setOptions(options.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim()) return;

    const updatedField: FormFieldConfig = {
      id: id.trim(),
      fieldKey: fieldKey.trim() || id.trim(),
      label: label.trim(),
      labelAr: labelAr.trim() || label.trim(),
      description: description.trim() || undefined,
      descriptionAr: descriptionAr.trim() || undefined,
      fieldType,
      isRequired,
      defaultValue: defaultValue || undefined,
      order,
      sectionId,
      visibility,
      permissions,
      validation: {
        regex: validationRegex.trim() || undefined,
        min: validationMin !== '' ? Number(validationMin) : undefined,
        max: validationMax !== '' ? Number(validationMax) : undefined,
        errorMessage: validationErrorMessage.trim() || undefined,
      },
      options: ['DROPDOWN', 'MULTI_SELECT', 'RADIO'].includes(fieldType) ? options : undefined,
    };

    onSave(updatedField);
    onClose();
  };

  const needsOptions = ['DROPDOWN', 'MULTI_SELECT', 'RADIO'].includes(fieldType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-[#0b1c30] text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#82f5c1] text-[22px]">tune</span>
            <h3 className="font-bold text-base">
              {field ? (language === 'ar' ? 'تعديل خصائص الحقل' : 'Edit Field Configuration') : (language === 'ar' ? 'إضافة حقل جديد' : 'Add New Field')}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Group 1: Identity & Type */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              1. Field Identification & Type
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono focus:border-[#006c4a] focus:outline-none"
                  placeholder="fld_001"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Field Key (Machine Name)</label>
                <input
                  type="text"
                  value={fieldKey}
                  onChange={(e) => setFieldKey(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono focus:border-[#006c4a] focus:outline-none"
                  placeholder="field_key_name"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Field Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={fieldType}
                  onChange={(e) => setFieldType(e.target.value as FormFieldType)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none font-semibold text-[#006c4a]"
                >
                  {FIELD_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.type} value={opt.type}>
                      [{opt.group}] {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Group 2: Labels & Descriptions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              2. Labels & Help Descriptions (Bilingual)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Label (English) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="e.g. Scaffolding Load Capacity (kg)"
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Label (Arabic) <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  dir="rtl"
                  required
                  value={labelAr}
                  onChange={(e) => setLabelAr(e.target.value)}
                  placeholder="مثال: حمولة السقالة القصوى (كجم)"
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none text-right"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Guidance (English)</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Operational guidance shown below the label..."
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Guidance (Arabic)</label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={descriptionAr}
                  onChange={(e) => setDescriptionAr(e.target.value)}
                  placeholder="إرشادات تشغيلية تظهر أسفل العنوان..."
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none text-right"
                />
              </div>
            </div>
          </div>

          {/* Group 3: Structure, Section, Order, Visibility & Permissions */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              3. Section, Order, Visibility & Permissions
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Belongs to Section</label>
                <select
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                >
                  {sections.map((sec) => (
                    <option key={sec.id} value={sec.id}>
                      {sec.order}. {sec.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Order Sequence</label>
                <input
                  type="number"
                  min={1}
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as FieldVisibility)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                >
                  <option value="VISIBLE">Visible (Default)</option>
                  <option value="HIDDEN">Hidden</option>
                  <option value="CONDITIONAL">Conditional</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Permissions</label>
                <select
                  value={permissions}
                  onChange={(e) => setPermissions(e.target.value)}
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                >
                  <option value="ALL">All Users (Full Access)</option>
                  <option value="ADMIN_ONLY">Admin Only</option>
                  <option value="HSE_LEAD_ONLY">HSE Lead / Custodian Only</option>
                  <option value="SAFETY_ENGINEER_ONLY">Safety Engineers Only</option>
                </select>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isRequired}
                  onChange={(e) => setIsRequired(e.target.checked)}
                  className="w-4 h-4 rounded text-[#006c4a] focus:ring-[#006c4a]"
                />
                <span className="text-xs font-bold text-slate-800">
                  Required Field (Mandatory for Completion)
                </span>
              </label>

              <div className="flex items-center gap-2 flex-1">
                <label className="text-xs font-bold text-slate-700 whitespace-nowrap">Default Value:</label>
                <input
                  type="text"
                  value={defaultValue}
                  onChange={(e) => setDefaultValue(e.target.value)}
                  placeholder="Optional preset value"
                  className="w-full bg-white text-xs rounded-lg px-3 py-1.5 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Group 4: Options Builder (For Dropdown, Multi-select, Radio) */}
          {needsOptions && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
                4. Selectable Options List ({options.length} configured)
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {options.map((opt, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-bold">
                        {opt.value}
                      </span>
                      <span className="font-semibold text-slate-800">{opt.label}</span>
                      {opt.labelAr && <span className="text-slate-500 text-[11px]">&bull; {opt.labelAr}</span>}
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="text-red-500 hover:text-red-700 p-1 rounded"
                    >
                      <span className="material-symbols-outlined text-[16px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Key (e.g. HIGH)"
                  value={newOptionVal}
                  onChange={(e) => setNewOptionVal(e.target.value)}
                  className="bg-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 font-mono w-28"
                />
                <input
                  type="text"
                  placeholder="Label EN (e.g. High Risk)"
                  value={newOptionLabel}
                  onChange={(e) => setNewOptionLabel(e.target.value)}
                  className="bg-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 flex-1"
                />
                <input
                  type="text"
                  dir="rtl"
                  placeholder="Label AR (e.g. عالي الخطورة)"
                  value={newOptionLabelAr}
                  onChange={(e) => setNewOptionLabelAr(e.target.value)}
                  className="bg-white text-xs rounded-lg px-2.5 py-1.5 border border-slate-300 flex-1 text-right"
                />
                <button
                  type="button"
                  onClick={handleAddOption}
                  className="px-3 py-1.5 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Add
                </button>
              </div>
            </div>
          )}

          {/* Group 5: Validation Rules */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-500 font-mono">
              5. Validation Rules (Regex, Range, Error Message)
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Regex Pattern</label>
                <input
                  type="text"
                  value={validationRegex}
                  onChange={(e) => setValidationRegex(e.target.value)}
                  placeholder="e.g. ^[A-Z0-9_-]+$"
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 font-mono focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Minimum (Min)</label>
                <input
                  type="number"
                  value={validationMin}
                  onChange={(e) => setValidationMin(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Maximum (Max)</label>
                <input
                  type="number"
                  value={validationMax}
                  onChange={(e) => setValidationMax(e.target.value)}
                  placeholder="1000"
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Custom Error Alert</label>
                <input
                  type="text"
                  value={validationErrorMessage}
                  onChange={(e) => setValidationErrorMessage(e.target.value)}
                  placeholder="Value must adhere to standard..."
                  className="w-full bg-white text-xs rounded-lg px-3 py-2 border border-slate-300 focus:border-[#006c4a] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Footer buttons */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#006c4a] hover:bg-[#005238] text-white text-xs font-bold shadow-md flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">check</span>
              Save Field Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
