import React, { useState } from 'react';
import { RiskMatrixConfig, RiskTierConfig } from '../../types/risk';
import { DEFAULT_RISK_MATRIX_CONFIG } from '../../services/riskService';

interface MatrixConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: RiskMatrixConfig;
  onSave: (newConfig: RiskMatrixConfig) => void;
  language: 'en' | 'ar';
}

export const MatrixConfigModal: React.FC<MatrixConfigModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
  language,
}) => {
  const [activeTab, setActiveTab] = useState<'tiers' | 'likelihood' | 'severity'>('tiers');
  const [formData, setFormData] = useState<RiskMatrixConfig>(JSON.parse(JSON.stringify(config)));

  if (!isOpen) return null;

  const handleTierChange = (index: number, field: keyof RiskTierConfig, value: any) => {
    const updatedTiers = [...formData.riskTiers];
    updatedTiers[index] = { ...updatedTiers[index], [field]: value };
    setFormData({ ...formData, riskTiers: updatedTiers });
  };

  const handleLikelihoodChange = (index: number, field: string, value: any) => {
    const updated = [...formData.likelihoodLevels];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, likelihoodLevels: updated });
  };

  const handleSeverityChange = (index: number, field: string, value: any) => {
    const updated = [...formData.severityLevels];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, severityLevels: updated });
  };

  const handleResetDefaults = () => {
    if (
      window.confirm(
        language === 'ar'
          ? 'هل أنت متأكد من إعادة تعيين مصفوفة المخاطر إلى الإعدادات القياسية لـ ISO 45001؟'
          : 'Are you sure you want to reset the 5x5 Matrix to standard ISO 45001 defaults?'
      )
    ) {
      setFormData(JSON.parse(JSON.stringify(DEFAULT_RISK_MATRIX_CONFIG)));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-[#151f2e] border border-[#2c3d53] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl text-slate-100 overflow-hidden animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2c3d53] flex items-center justify-between bg-[#192639]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-amber-400 text-2xl">tune</span>
            <div>
              <h2 className="text-lg font-bold">
                {language === 'ar' ? 'إعدادات مصفوفة المخاطر 5×5 (لوحة المشرف)' : '5x5 Risk Matrix Configuration (Admin)'}
              </h2>
              <p className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'تخصيص مستويات الاحتمالية والشدة، وعتبات النقاط، والألوان وفق معايير المشروع'
                  : 'Customize likelihood & severity levels, score thresholds, and color palettes per project requirements'}
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

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#2c3d53] bg-[#111a27] px-6">
          <button
            type="button"
            onClick={() => setActiveTab('tiers')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'tiers'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">palette</span>
            <span>{language === 'ar' ? 'تصنيفات المخاطر والألوان والعتبات' : 'Risk Tiers, Colors & Thresholds'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('likelihood')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'likelihood'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">trending_up</span>
            <span>{language === 'ar' ? 'مستويات الاحتمالية (1 - 5)' : 'Likelihood Levels (1 - 5)'}</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('severity')}
            className={`py-3 px-4 text-xs font-bold border-b-2 flex items-center gap-2 transition-all ${
              activeTab === 'severity'
                ? 'border-amber-400 text-amber-300 bg-white/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="material-symbols-outlined text-sm">warning</span>
            <span>{language === 'ar' ? 'مستويات الشدة والأثر (1 - 5)' : 'Severity Levels (1 - 5)'}</span>
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: Risk Tiers, Thresholds & Colors */}
          {activeTab === 'tiers' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'قم بضبط عتبات النقاط لكل مستوى خطورة وتحديد اللون المناسب وإجراءات التحكم الإلزامية:'
                  : 'Define the score boundaries (1-25) for each tier, custom display color, and mandatory actions:'}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {formData.riskTiers.map((tier, idx) => (
                  <div
                    key={tier.id}
                    className="p-4 rounded-xl border bg-[#111925]"
                    style={{ borderColor: `${tier.color}60` }}
                  >
                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                      <div className="flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: tier.color }} />
                        <span className="font-bold text-sm" style={{ color: tier.color }}>
                          {tier.id} ({tier.minScore} - {tier.maxScore})
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="text-[10px] text-slate-400">Color:</label>
                        <input
                          type="color"
                          value={tier.color}
                          onChange={(e) => handleTierChange(idx, 'color', e.target.value)}
                          className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 text-xs">
                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {language === 'ar' ? 'الاسم بالإنجليزية:' : 'Name (English):'}
                        </label>
                        <input
                          type="text"
                          value={tier.name}
                          onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                          className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {language === 'ar' ? 'الاسم بالعربية:' : 'Name (Arabic):'}
                        </label>
                        <input
                          type="text"
                          dir="rtl"
                          value={tier.nameAr}
                          onChange={(e) => handleTierChange(idx, 'nameAr', e.target.value)}
                          className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            {language === 'ar' ? 'الحد الأدنى للنقاط:' : 'Min Score:'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="25"
                            value={tier.minScore}
                            onChange={(e) => handleTierChange(idx, 'minScore', parseInt(e.target.value) || 1)}
                            className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-slate-400 mb-1">
                            {language === 'ar' ? 'الحد الأقصى للنقاط:' : 'Max Score:'}
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="25"
                            value={tier.maxScore}
                            onChange={(e) => handleTierChange(idx, 'maxScore', parseInt(e.target.value) || 25)}
                            className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] text-slate-400 mb-1">
                          {language === 'ar' ? 'إجراء التحكم المطلوب:' : 'Action Required:'}
                        </label>
                        <textarea
                          rows={2}
                          value={tier.actionRequired}
                          onChange={(e) => handleTierChange(idx, 'actionRequired', e.target.value)}
                          className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100 focus:outline-none focus:border-amber-400 text-xs"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: Likelihood Levels (1 to 5) */}
          {activeTab === 'likelihood' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'قم بضبط مسميات ووصف وتكرار درجات الاحتمالية الخمس:'
                  : 'Configure the label, description, and statistical frequency for each of the 5 Likelihood tiers:'}
              </div>

              {formData.likelihoodLevels.map((item, idx) => (
                <div key={item.level} className="p-4 rounded-xl border border-[#2b3a4f] bg-[#111925] space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
                    <span className="w-6 h-6 rounded-full bg-amber-400/20 text-amber-300 flex items-center justify-center text-xs">
                      {item.level}
                    </span>
                    <span>Level {item.level} (Code: {item.code})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title (EN):</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleLikelihoodChange(idx, 'name', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title (AR):</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={item.nameAr}
                        onChange={(e) => handleLikelihoodChange(idx, 'nameAr', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Probability Description:</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleLikelihoodChange(idx, 'description', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Expected Frequency:</label>
                      <input
                        type="text"
                        value={item.frequency}
                        onChange={(e) => handleLikelihoodChange(idx, 'frequency', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: Severity Levels (1 to 5) */}
          {activeTab === 'severity' && (
            <div className="space-y-4">
              <div className="text-xs text-slate-400">
                {language === 'ar'
                  ? 'قم بضبط مسميات ووصف وعواقب درجات الشدة الخمس:'
                  : 'Configure the label, consequence threshold, and safety impact for each of the 5 Severity tiers:'}
              </div>

              {formData.severityLevels.map((item, idx) => (
                <div key={item.level} className="p-4 rounded-xl border border-[#2b3a4f] bg-[#111925] space-y-3 text-xs">
                  <div className="flex items-center gap-2 text-sm font-bold text-rose-300">
                    <span className="w-6 h-6 rounded-full bg-rose-400/20 text-rose-300 flex items-center justify-center text-xs">
                      {item.level}
                    </span>
                    <span>Level {item.level} (Code: {item.code})</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title (EN):</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleSeverityChange(idx, 'name', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Title (AR):</label>
                      <input
                        type="text"
                        dir="rtl"
                        value={item.nameAr}
                        onChange={(e) => handleSeverityChange(idx, 'nameAr', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2">
                      <label className="block text-[11px] text-slate-400 mb-1">Consequence Impact Description:</label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleSeverityChange(idx, 'description', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400 mb-1">Safety Impact Category:</label>
                      <input
                        type="text"
                        value={item.safetyImpact}
                        onChange={(e) => handleSeverityChange(idx, 'safetyImpact', e.target.value)}
                        className="w-full bg-[#1b2636] border border-[#344862] rounded-lg px-3 py-1.5 text-slate-100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-[#2c3d53] flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetDefaults}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-sm">restart_alt</span>
              <span>{language === 'ar' ? 'استعادة الإعدادات الافتراضية' : 'Reset to ISO 45001 Defaults'}</span>
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#344862] text-slate-300 hover:text-white hover:bg-white/5 text-xs font-semibold transition-colors"
              >
                {language === 'ar' ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black text-xs font-bold shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all"
              >
                <span className="material-symbols-outlined text-sm">save</span>
                <span>{language === 'ar' ? 'حفظ إعدادات المصفوفة' : 'Save Matrix Configuration'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
