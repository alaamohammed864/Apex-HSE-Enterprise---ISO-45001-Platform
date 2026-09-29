import React from 'react';
import { RiskMatrixConfig, RiskAssessmentRecord, RiskTierId } from '../../types/risk';

interface RiskMatrixInteractiveGridProps {
  config: RiskMatrixConfig;
  assessments: RiskAssessmentRecord[];
  matrixView: 'initial' | 'residual';
  onViewChange: (view: 'initial' | 'residual') => void;
  activeCellFilter: { likelihood: number; severity: number } | null;
  onCellClick: (likelihood: number, severity: number) => void;
  onClearCellFilter: () => void;
  language: 'en' | 'ar';
}

export const RiskMatrixInteractiveGrid: React.FC<RiskMatrixInteractiveGridProps> = ({
  config,
  assessments,
  matrixView,
  onViewChange,
  activeCellFilter,
  onCellClick,
  onClearCellFilter,
  language,
}) => {
  // Count items per cell (5x5: likelihood 1-5, severity 1-5)
  const cellCounts: Record<string, number> = {};
  assessments.forEach((ra) => {
    const l = matrixView === 'initial' ? ra.likelihood : ra.residualLikelihood;
    const s = matrixView === 'initial' ? ra.severity : ra.residualSeverity;
    const key = `${l}_${s}`;
    cellCounts[key] = (cellCounts[key] || 0) + 1;
  });

  const getTierForScore = (score: number) => {
    for (const tier of config.riskTiers) {
      if (score >= tier.minScore && score <= tier.maxScore) {
        return tier;
      }
    }
    return config.riskTiers[0];
  };

  return (
    <div className="bg-[#182334] rounded-2xl p-5 border border-[#334661] shadow-xl text-white">
      {/* Header with View Toggle & Active Filter Indicator */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4 pb-3 border-b border-[#334661]/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-xl">grid_4x4</span>
            <h3 className="text-base font-bold text-slate-100">
              {language === 'ar' ? 'مصفوفة المخاطر التفاعلية (5×5)' : 'Interactive 5x5 Risk Matrix'}
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-mono border border-blue-500/30">
              ISO 45001 §6.1.2
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            {language === 'ar'
              ? 'انقر على أي خلية لتصفية سجل تقييم المخاطر حسب نقاط الخطورة'
              : 'Click any cell to filter the Risk Register by that exact probability × impact coordinate'}
          </p>
        </div>

        {/* View Toggle (Initial Inherent vs Post-Mitigation Residual) */}
        <div className="flex items-center gap-2 bg-[#0d1624] p-1 rounded-xl border border-[#2b3a50]">
          <button
            type="button"
            onClick={() => onViewChange('initial')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              matrixView === 'initial'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'المخاطر الأولية الكامنة' : 'Initial Inherent Risk'}
          </button>
          <button
            type="button"
            onClick={() => onViewChange('residual')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              matrixView === 'residual'
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {language === 'ar' ? 'المخاطر المتبقية بعد التحكم' : 'Residual ALARP Risk'}
          </button>
        </div>
      </div>

      {/* Active Cell Filter Notice */}
      {activeCellFilter && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-blue-300">
            <span className="material-symbols-outlined text-sm">filter_alt</span>
            <span>
              {language === 'ar'
                ? `تصفية نشطة: الاحتمالية ${activeCellFilter.likelihood} × الشدة ${activeCellFilter.severity} (النقاط: ${
                    activeCellFilter.likelihood * activeCellFilter.severity
                  })`
                : `Active Filter: Likelihood ${activeCellFilter.likelihood} × Severity ${activeCellFilter.severity} (Score: ${
                    activeCellFilter.likelihood * activeCellFilter.severity
                  })`}
            </span>
          </div>
          <button
            type="button"
            onClick={onClearCellFilter}
            className="text-xs text-rose-300 hover:text-rose-100 underline flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-xs">close</span>
            {language === 'ar' ? 'إلغاء التصفية' : 'Clear filter'}
          </button>
        </div>
      )}

      {/* 5x5 Matrix Layout */}
      <div className="flex flex-col md:flex-row gap-4 items-start">
        {/* The Grid */}
        <div className="flex-1 w-full overflow-x-auto">
          <div className="min-w-[460px]">
            {/* Top X-Axis Label: Severity */}
            <div className="text-center text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-center gap-1">
              <span>{language === 'ar' ? 'شدة الأثر / العواقب (Severity →)' : 'Severity / Consequence (1 to 5) →'}</span>
            </div>

            {/* Severity Column Headers */}
            <div className="grid grid-cols-6 gap-1.5 mb-1.5 text-center">
              <div className="text-[11px] font-semibold text-slate-400 flex items-center justify-center">
                {language === 'ar' ? 'الاحتمالية ↓' : 'Likelihood ↓'}
              </div>
              {config.severityLevels.map((s) => (
                <div
                  key={s.level}
                  className="bg-[#213148] py-1.5 px-1 rounded-lg border border-[#334661] text-center"
                  title={s.description}
                >
                  <div className="text-[11px] font-bold text-slate-200">S{s.level}</div>
                  <div className="text-[9px] text-slate-400 truncate">
                    {language === 'ar' ? s.nameAr.split('-')[1]?.trim() || s.nameAr : s.name.split('-')[1]?.trim() || s.name}
                  </div>
                </div>
              ))}
            </div>

            {/* Matrix Rows (Likelihood from 5 down to 1) */}
            {[5, 4, 3, 2, 1].map((likelihood) => {
              const lConfig = config.likelihoodLevels.find((l) => l.level === likelihood);
              return (
                <div key={likelihood} className="grid grid-cols-6 gap-1.5 mb-1.5">
                  {/* Y-Axis Row Header */}
                  <div
                    className="bg-[#213148] py-2 px-1.5 rounded-lg border border-[#334661] flex flex-col justify-center text-left"
                    title={lConfig?.description}
                  >
                    <div className="text-[11px] font-bold text-slate-200">L{likelihood}</div>
                    <div className="text-[9px] text-slate-400 truncate">
                      {language === 'ar'
                        ? lConfig?.nameAr.split('-')[1]?.trim() || lConfig?.nameAr
                        : lConfig?.name.split('-')[1]?.trim() || lConfig?.name}
                    </div>
                  </div>

                  {/* 5 Severity Cells */}
                  {[1, 2, 3, 4, 5].map((severity) => {
                    const score = likelihood * severity;
                    const tier = getTierForScore(score);
                    const count = cellCounts[`${likelihood}_${severity}`] || 0;
                    const isSelected =
                      activeCellFilter?.likelihood === likelihood && activeCellFilter?.severity === severity;

                    return (
                      <button
                        type="button"
                        key={`${likelihood}_${severity}`}
                        onClick={() => onCellClick(likelihood, severity)}
                        style={{
                          backgroundColor: `${tier.color}25`,
                          borderColor: isSelected ? '#ffffff' : `${tier.color}70`,
                        }}
                        className={`relative h-14 rounded-xl border flex flex-col items-center justify-center transition-all p-1 group hover:scale-[1.03] hover:shadow-lg ${
                          isSelected
                            ? 'ring-2 ring-white scale-[1.02] shadow-xl shadow-cyan-500/20'
                            : 'hover:brightness-125'
                        }`}
                        title={`${lConfig?.name} × S${severity} = Score ${score} (${tier.name})`}
                      >
                        {/* Score Indicator */}
                        <span className="text-xs font-black tracking-tight" style={{ color: tier.color }}>
                          {score}
                        </span>

                        {/* Item Count Badge */}
                        {count > 0 ? (
                          <span
                            className="mt-0.5 px-2 py-0.2 text-[10px] font-bold rounded-full text-white shadow-sm flex items-center gap-0.5"
                            style={{ backgroundColor: tier.color }}
                          >
                            <span className="text-[9px] font-mono">{count}</span>
                            <span className="text-[8px] opacity-80">{count === 1 ? 'item' : 'items'}</span>
                          </span>
                        ) : (
                          <span className="text-[9px] text-slate-500 font-mono">-</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend & Summary Sidebar */}
        <div className="w-full md:w-56 bg-[#111c2a] p-3 rounded-xl border border-[#26374d] flex flex-col gap-2.5">
          <div className="text-xs font-bold text-slate-300 pb-1.5 border-b border-[#26374d]">
            {language === 'ar' ? 'مستويات تصنيف المخاطر' : 'Risk Tier Thresholds'}
          </div>

          <div className="space-y-2">
            {config.riskTiers.map((tier) => (
              <div
                key={tier.id}
                className="p-2 rounded-lg border text-xs"
                style={{
                  backgroundColor: `${tier.color}15`,
                  borderColor: `${tier.color}40`,
                }}
              >
                <div className="flex items-center justify-between mb-0.5">
                  <div className="flex items-center gap-1.5 font-bold" style={{ color: tier.color }}>
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: tier.color }} />
                    <span>{language === 'ar' ? tier.nameAr : tier.name}</span>
                  </div>
                  <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-black/30 text-slate-200">
                    {tier.minScore} - {tier.maxScore}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 line-clamp-2">
                  {language === 'ar' ? tier.actionRequiredAr : tier.actionRequired}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-2 pt-2 border-t border-[#26374d] text-[11px] text-slate-400">
            <div className="flex justify-between py-0.5">
              <span>{language === 'ar' ? 'إجمالي التقييمات:' : 'Total Assessments:'}</span>
              <span className="font-mono font-bold text-slate-200">{assessments.length}</span>
            </div>
            <div className="flex justify-between py-0.5">
              <span>{language === 'ar' ? 'العرض الحالي:' : 'Current View:'}</span>
              <span className="font-bold text-cyan-300">
                {matrixView === 'initial'
                  ? language === 'ar'
                    ? 'أولي (Inherent)'
                    : 'Initial (Inherent)'
                  : language === 'ar'
                  ? 'متبقي (Residual)'
                  : 'Residual (ALARP)'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
