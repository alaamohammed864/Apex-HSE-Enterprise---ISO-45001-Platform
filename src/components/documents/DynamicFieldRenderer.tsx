import React, { useState } from 'react';
import {
  FormFieldConfig,
  SEED_EQUIPMENT_LIST,
  SEED_RISK_REGISTER_LIST,
  SEED_KPI_LIST,
  SEED_INCIDENT_LIST,
  SEED_TRAINING_LIST,
} from '../../types/formFieldConfig';
import { useAuth } from '../../context/AuthContext';
import { SEED_PROJECTS } from '../../data/seedDatabase';

interface DynamicFieldRendererProps {
  field: FormFieldConfig;
  value: any;
  onChange: (val: any) => void;
  language: 'en' | 'ar';
  readOnly?: boolean;
}

export const DynamicFieldRenderer: React.FC<DynamicFieldRendererProps> = ({
  field,
  value,
  onChange,
  language,
  readOnly = false,
}) => {
  const { allUsers } = useAuth();
  const [signatureDone, setSignatureDone] = useState(
    value === 'DIGITALLY_SIGNED_SHA256' || (typeof value === 'string' && value.startsWith('DIGITALLY_SIGNED'))
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(
    typeof value === 'string' && value.includes('.') ? value : null
  );

  const label = language === 'ar' ? field.labelAr || field.label : field.label;
  const description = language === 'ar' ? field.descriptionAr || field.description : field.description;
  const placeholder = language === 'ar' ? field.placeholderAr || field.placeholder : field.placeholder;

  // Render header label and optional description
  const renderFieldHeader = () => (
    <div className="space-y-0.5 mb-1.5">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#0b1c30]">
          {label} {field.isRequired && <span className="text-red-500 font-bold">*</span>}
        </label>
        {field.permissions && field.permissions !== 'ALL' && (
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
            {field.permissions}
          </span>
        )}
      </div>
      {description && (
        <p className="text-[11px] text-[#45464d] leading-relaxed">{description}</p>
      )}
    </div>
  );

  switch (field.fieldType) {
    case 'TEXT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <input
            type="text"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (language === 'ar' ? 'أدخل النص هنا...' : 'Enter text here...')}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all disabled:opacity-75"
          />
        </div>
      );

    case 'TEXTAREA':
    case 'LONG_TEXT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <textarea
            rows={3}
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder || (language === 'ar' ? 'اكتب التفاصيل الكاملة هنا...' : 'Provide complete operational details here...')}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all disabled:opacity-75"
          />
        </div>
      );

    case 'RICH_TEXT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="rounded-lg border border-[#c6c6cd]/40 overflow-hidden bg-white">
            <div className="bg-[#eff4ff] px-3 py-1.5 border-b border-[#c6c6cd]/30 flex items-center gap-2 text-slate-600 text-xs font-mono">
              <span className="font-bold cursor-pointer hover:text-black">B</span>
              <span className="italic cursor-pointer hover:text-black">I</span>
              <span className="underline cursor-pointer hover:text-black">U</span>
              <span className="border-r border-[#c6c6cd]/40 h-4"></span>
              <span className="cursor-pointer hover:text-black">&bull; List</span>
              <span className="cursor-pointer hover:text-black">1. Num</span>
              <span className="border-r border-[#c6c6cd]/40 h-4"></span>
              <span className="text-[10px] text-slate-500 font-sans">
                {language === 'ar' ? 'محرر نص منسق ISO 45001' : 'ISO 45001 Formatted Text'}
              </span>
            </div>
            <textarea
              rows={4}
              disabled={readOnly}
              value={value ?? ''}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder || (language === 'ar' ? 'اكتب الإجراءات المنهجية والشروط...' : 'Write methodology, statutory steps, and technical justifications...')}
              className="w-full p-3 text-xs text-[#0b1c30] focus:outline-none transition-all resize-y"
            />
          </div>
        </div>
      );

    case 'NUMBER':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <input
            type="number"
            disabled={readOnly}
            value={value ?? ''}
            min={field.validation?.min}
            max={field.validation?.max}
            onChange={(e) => onChange(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder={placeholder || '0'}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all disabled:opacity-75"
          />
        </div>
      );

    case 'DATE':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <input
            type="date"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all disabled:opacity-75"
          />
        </div>
      );

    case 'TIME':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <input
            type="time"
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none transition-all disabled:opacity-75"
          />
        </div>
      );

    case 'YES_NO':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="flex items-center gap-3 pt-0.5">
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange('YES')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                value === 'YES'
                  ? 'bg-[#006c4a] text-white border-[#006c4a] shadow-sm'
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#c6c6cd]/40 hover:bg-[#e2ebfc]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">check_circle</span>
              {language === 'ar' ? 'نعم (مطابق / معتمد)' : 'YES (Conforming / Approved)'}
            </button>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange('NO')}
              className={`px-4 py-2 rounded-lg text-xs font-bold border transition-colors flex items-center gap-1.5 ${
                value === 'NO'
                  ? 'bg-[#ba1a1a] text-white border-[#ba1a1a] shadow-sm'
                  : 'bg-[#eff4ff] text-[#0b1c30] border-[#c6c6cd]/40 hover:bg-[#e2ebfc]'
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">cancel</span>
              {language === 'ar' ? 'لا (غير مطابق / مرفوض)' : 'NO (Non-Conforming)'}
            </button>
          </div>
        </div>
      );

    case 'DROPDOWN':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none disabled:opacity-75"
          >
            <option value="">{language === 'ar' ? '-- اختر خياراً من القائمة --' : '-- Select an Option --'}</option>
            {field.options?.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {language === 'ar' && opt.labelAr ? opt.labelAr : opt.label}
              </option>
            ))}
          </select>
        </div>
      );

    case 'RADIO':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="space-y-2 pt-1">
            {field.options?.map((opt) => {
              const isSelected = value === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-[#eff4ff] border-[#006c4a] ring-1 ring-[#006c4a] text-[#0b1c30] font-bold'
                      : 'bg-white border-[#c6c6cd]/40 text-[#45464d] hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name={field.id}
                    disabled={readOnly}
                    checked={isSelected}
                    onChange={() => onChange(opt.value)}
                    className="text-[#006c4a] focus:ring-[#006c4a]"
                  />
                  <span>{language === 'ar' && opt.labelAr ? opt.labelAr : opt.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      );

    case 'MULTI_SELECT':
      const currentValues: string[] = Array.isArray(value) ? value : [];
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="flex flex-wrap gap-2 pt-1">
            {field.options?.map((opt) => {
              const isSelected = currentValues.includes(opt.value);
              return (
                <button
                  type="button"
                  disabled={readOnly}
                  key={opt.value}
                  onClick={() => {
                    const next = isSelected
                      ? currentValues.filter((v) => v !== opt.value)
                      : [...currentValues, opt.value];
                    onChange(next);
                  }}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                    isSelected
                      ? 'bg-[#dce9ff] text-[#0b1c30] border-[#006c4a] ring-1 ring-[#006c4a]'
                      : 'bg-white text-[#45464d] border-[#c6c6cd]/40 hover:bg-[#eff4ff]'
                  }`}
                >
                  {isSelected && '✓ '}
                  {language === 'ar' && opt.labelAr ? opt.labelAr : opt.label}
                </button>
              );
            })}
          </div>
        </div>
      );

    case 'CHECKBOX':
      return (
        <div className="pt-2">
          <label className="flex items-center gap-2.5 cursor-pointer">
            <input
              type="checkbox"
              disabled={readOnly}
              checked={!!value}
              onChange={(e) => onChange(e.target.checked)}
              id={field.id}
              className="w-4 h-4 rounded text-[#006c4a] focus:ring-[#006c4a]"
            />
            <div>
              <span className="text-xs font-bold text-[#0b1c30] block">
                {label} {field.isRequired && <span className="text-red-500 font-bold">*</span>}
              </span>
              {description && <p className="text-[11px] text-[#45464d]">{description}</p>}
            </div>
          </label>
        </div>
      );

    case 'PROJECT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر المشروع المنفذ له --' : '-- Select Project Asset --'}</option>
            {SEED_PROJECTS.map((p) => (
              <option key={p.id} value={p.name}>
                {p.code} &bull; {language === 'ar' ? p.nameAr : p.name}
              </option>
            ))}
          </select>
        </div>
      );

    case 'EMPLOYEE':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر المسؤول / الموظف --' : '-- Select Authorized Personnel --'}</option>
            {allUsers.map((u) => (
              <option key={u.id} value={u.name}>
                {language === 'ar' ? u.nameAr : u.name} ({u.roleTitleEn})
              </option>
            ))}
          </select>
        </div>
      );

    case 'CONTRACTOR':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر المقاول / الجهة المنفذة --' : '-- Select Main Contractor / JV --'}</option>
            <option value="Consolidated Contractors Corp (CCC)">Consolidated Contractors Corp (CCC - Tier 1 EPC)</option>
            <option value="Al-Jaber Heavy Lift & Rigging">Al-Jaber Heavy Lift &amp; Rigging W.L.L (Specialist)</option>
            <option value="Kent Scaffolding Solutions">Kent Scaffolding Solutions (Certified TG20:21)</option>
            <option value="Qatar Petrochem Electrical JV">Qatar Petrochem Electrical JV (HV Commissioning)</option>
          </select>
        </div>
      );

    case 'EQUIPMENT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر المعدة أو الآلية المسجلة --' : '-- Select Plant & Machinery Asset --'}</option>
            {SEED_EQUIPMENT_LIST.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.code} &bull; {eq.name} ({eq.status})
              </option>
            ))}
          </select>
        </div>
      );

    case 'RISK':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر الخطر الحاكم من سجل ALARP --' : '-- Select ALARP Risk Assessment --'}</option>
            {SEED_RISK_REGISTER_LIST.map((r) => (
              <option key={r.id} value={r.id}>
                {r.code}: {r.hazard} [{r.rating}]
              </option>
            ))}
          </select>
        </div>
      );

    case 'KPI':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر مؤشر الأداء الحاكم --' : '-- Select Governing Safety KPI --'}</option>
            {SEED_KPI_LIST.map((k) => (
              <option key={k.id} value={k.id}>
                {k.code} &bull; {k.name} (Target: {k.target})
              </option>
            ))}
          </select>
        </div>
      );

    case 'INCIDENT':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر مرجع سجل الحادث --' : '-- Select Incident Investigation Reference --'}</option>
            {SEED_INCIDENT_LIST.map((inc) => (
              <option key={inc.id} value={inc.id}>
                {inc.code}: {inc.title} ({inc.date})
              </option>
            ))}
          </select>
        </div>
      );

    case 'TRAINING':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <select
            disabled={readOnly}
            value={value ?? ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full bg-[#eff4ff] text-[#0b1c30] text-xs rounded-lg px-3 py-2 border border-[#c6c6cd]/40 focus:border-[#006c4a] focus:bg-white focus:outline-none"
          >
            <option value="">{language === 'ar' ? '-- اختر الدورة التدريبية الإلزامية --' : '-- Select Mandatory Competency Course --'}</option>
            {SEED_TRAINING_LIST.map((trn) => (
              <option key={trn.id} value={trn.id}>
                {trn.code}: {trn.title} (Valid: {trn.validYears} Years)
              </option>
            ))}
          </select>
        </div>
      );

    case 'SIGNATURE':
      return (
        <div className="space-y-1.5">
          {renderFieldHeader()}
          <div className="p-3.5 rounded-lg bg-[#f8fafc] border border-dashed border-[#c6c6cd] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${signatureDone ? 'bg-[#006c4a] text-white' : 'bg-slate-200 text-slate-500'}`}>
                <span className="material-symbols-outlined text-[18px]">
                  {signatureDone ? 'verified' : 'draw'}
                </span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#0b1c30] block">
                  {signatureDone
                    ? (language === 'ar' ? 'تم التوقيع إلكترونياً (معتمد WORM)' : 'Signed Digitally (WORM Certified)')
                    : (language === 'ar' ? 'انقر للاعتماد والتوقيع الرقمي' : 'Awaiting Digital Signature')}
                </span>
                <span className="font-mono text-[10px] text-slate-500">
                  {signatureDone ? 'SHA256::7e3b8a1c90f230aa... [Immutable]' : (language === 'ar' ? 'يتطلب صلاحيات معتمدة' : 'Authorized Role Credentials Required')}
                </span>
              </div>
            </div>
            {!readOnly && (
              <button
                type="button"
                onClick={() => {
                  const nextState = !signatureDone;
                  setSignatureDone(nextState);
                  onChange(nextState ? 'DIGITALLY_SIGNED_SHA256' : null);
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  signatureDone
                    ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                    : 'bg-[#131b2e] hover:bg-[#213145] text-white shadow-sm'
                }`}
              >
                {signatureDone ? (language === 'ar' ? 'إلغاء التوقيع' : 'Clear Signature') : (language === 'ar' ? 'توقيع واعتماد الآن' : 'Sign & Authorize')}
              </button>
            )}
          </div>
        </div>
      );

    case 'ATTACHMENT':
    case 'IMAGE':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-dashed border-[#c6c6cd] flex flex-col items-center justify-center text-center cursor-pointer hover:bg-[#e2ebfc] transition-colors">
            <span className="material-symbols-outlined text-[26px] text-slate-600">
              {field.fieldType === 'IMAGE' ? 'add_photo_alternate' : 'upload_file'}
            </span>
            <div className="text-xs font-bold text-[#0b1c30] mt-1">
              {uploadedFileName || (language === 'ar' ? 'انقر لرفع ملف مرفق أو صورة' : 'Click to Upload Document Attachment or Photo')}
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">
              {field.fieldType === 'IMAGE' ? 'PNG, JPG, SVG up to 15MB' : 'PDF, DWG, XLSX, DOCX up to 50MB'}
            </div>
            {!readOnly && !uploadedFileName && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const sampleName = field.fieldType === 'IMAGE' ? 'site_rigging_drawing.png' : 'certified_annex_doc.pdf';
                  setUploadedFileName(sampleName);
                  onChange(sampleName);
                }}
                className="mt-2 text-[11px] font-bold text-[#006c4a] underline"
              >
                {language === 'ar' ? 'إرفاق ملف نموذجي' : 'Attach Sample Certified File'}
              </button>
            )}
          </div>
        </div>
      );

    case 'TABLE':
      return (
        <div className="space-y-1">
          {renderFieldHeader()}
          <div className="overflow-x-auto rounded-lg border border-[#c6c6cd]/30 bg-white">
            <table className="w-full text-xs">
              <thead className="bg-[#eff4ff] font-bold text-slate-700">
                <tr>
                  <th className="p-2 text-left">#</th>
                  <th className="p-2 text-left">{language === 'ar' ? 'عنصر التحقق / الفحص' : 'Verification Item'}</th>
                  <th className="p-2 text-left">{language === 'ar' ? 'المعيار / القيمة' : 'Standard / Metric'}</th>
                  <th className="p-2 text-left">{language === 'ar' ? 'الحالة' : 'Conformity Status'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="p-2 font-mono">01</td>
                  <td className="p-2">Perimeter Security Fence 2.4m Anti-Climb</td>
                  <td className="p-2 font-mono">2,450 meters</td>
                  <td className="p-2 text-[#006c4a] font-bold">Verified Compliant</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">02</td>
                  <td className="p-2">Site Nurse &amp; Paramedic Clinic 24/7</td>
                  <td className="p-2 font-mono">Manned &amp; Stocked</td>
                  <td className="p-2 text-[#006c4a] font-bold">Operational</td>
                </tr>
                <tr>
                  <td className="p-2 font-mono">03</td>
                  <td className="p-2">Emergency Eye Wash Stations Installed</td>
                  <td className="p-2 font-mono">12 Locations Tested</td>
                  <td className="p-2 text-[#006c4a] font-bold">Pressure OK</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      );

    default:
      return null;
  }
};
