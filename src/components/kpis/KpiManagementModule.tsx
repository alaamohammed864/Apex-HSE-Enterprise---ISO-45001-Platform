import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  KpiDefinitionModel,
  KpiPeriodType,
  KpiSummaryReport,
} from '../../types/phase7';
import { phase7Service } from '../../services/phase7Service';

export const KpiManagementModule: React.FC = () => {
  const { showToast } = useApp();

  const [periodType, setPeriodType] = useState<KpiPeriodType>('MONTHLY');
  const [kpiReports, setKpiReports] = useState<KpiSummaryReport[]>([]);
  const [kpiDefs, setKpiDefs] = useState<KpiDefinitionModel[]>([]);
  const [loading, setLoading] = useState(true);

  // Configuration modal
  const [editingKpi, setEditingKpi] = useState<KpiDefinitionModel | null>(null);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Active highlighted chart KPI
  const [selectedChartKpi, setSelectedChartKpi] = useState<string>('TRIR');

  const loadKpis = async () => {
    try {
      setLoading(true);
      const [reports, defs] = await Promise.all([
        phase7Service.getKpiAnalytics(periodType),
        phase7Service.getKpiDefinitions(),
      ]);
      setKpiReports(reports);
      setKpiDefs(defs);
    } catch (err) {
      console.error('Failed to load KPIs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadKpis();
  }, [periodType]);

  // Overall compliance score summary
  const summaryScore = useMemo(() => {
    if (kpiReports.length === 0) return { onTargetCount: 0, total: 0, rate: 0 };
    const onTargetCount = kpiReports.filter((k) => k.onTarget).length;
    const total = kpiReports.length;
    const rate = Math.round((onTargetCount / total) * 100);
    return { onTargetCount, total, rate };
  }, [kpiReports]);

  // Selected KPI for chart
  const currentChartReport = useMemo(() => {
    return kpiReports.find((k) => k.kpiCode === selectedChartKpi) || kpiReports[0];
  }, [kpiReports, selectedChartKpi]);

  const handleSaveConfig = async () => {
    if (!editingKpi) return;
    try {
      await phase7Service.saveKpiDefinition(editingKpi);
      showToast(`KPI target for ${editingKpi.name} updated.`);
      setIsConfigModalOpen(false);
      loadKpis();
    } catch (err) {
      showToast('Error saving KPI configuration.');
    }
  };

  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §9.1 Performance Evaluation
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Configurable HSE KPIs &amp; Trend Analytics
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Safety Performance KPIs &amp; Executive Analytics
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Lagging &amp; leading safety indicators: TRIR, LTIFR, Near Misses, Recordables, Observations, Inspections, Audits, CAPA closure, and Permit compliance.
          </p>
        </div>

        {/* Period Selector (Monthly, Quarterly, Yearly) */}
        <div className="flex items-center gap-2 bg-[#eff4ff] p-1.5 rounded-xl border border-gray-200">
          {(['MONTHLY', 'QUARTERLY', 'YEARLY'] as KpiPeriodType[]).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPeriodType(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                periodType === p
                  ? 'bg-[#006c4a] text-white shadow-xs'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Performance Summary Banner */}
      <div className="p-4 bg-gradient-to-r from-[#eff4ff] to-white rounded-xl border border-[#c6c6cd]/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#006c4a] text-white flex items-center justify-center font-bold">
            <span className="material-symbols-outlined text-[26px]">analytics</span>
          </div>
          <div>
            <div className="font-bold text-sm text-[#0b1c30]">
              Overall HSE Performance Health: {summaryScore.rate}% On-Target
            </div>
            <div className="text-xs text-gray-500">
              {summaryScore.onTargetCount} of {summaryScore.total} key performance thresholds met during {periodType.toLowerCase()} reporting period.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            showToast('Executive KPI Performance Report exported for board review.');
          }}
          className="px-4 py-2 rounded-lg bg-white border border-gray-300 text-[#0b1c30] text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Export Board KPI Report</span>
        </button>
      </div>

      {/* KPI Cards Grid (12 Configurable KPIs) */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {kpiReports.map((kpi) => (
          <div
            key={kpi.kpiCode}
            onClick={() => setSelectedChartKpi(kpi.kpiCode)}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              selectedChartKpi === kpi.kpiCode
                ? 'bg-white border-[#006c4a] ring-2 ring-[#006c4a]/20 shadow-md'
                : 'bg-white border-[#c6c6cd]/30 shadow-xs hover:border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-[10px] text-gray-400 font-bold uppercase truncate">
                {kpi.category}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  kpi.onTarget ? 'bg-green-500' : 'bg-red-500 animate-pulse'
                }`}
              ></span>
            </div>

            <div className="font-bold text-xs text-gray-900 mt-1 line-clamp-1" title={kpi.name}>
              {kpi.name}
            </div>

            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-bold font-mono text-[#0b1c30]">
                {kpi.currentValue}
              </span>
              <span className="text-[10px] text-gray-400 font-mono">{kpi.unit}</span>
            </div>

            <div className="pt-2 mt-2 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
              <span>Tgt: {kpi.targetValue}</span>
              <span className={kpi.onTarget ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                {kpi.onTarget ? 'PASS' : 'ALERT'}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Interactive Charts & Trend Reports Section */}
      {currentChartReport && (
        <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-[#006c4a]">
                  {currentChartReport.kpiCode}
                </span>
                <span className="font-mono text-[10px] uppercase px-2 py-0.5 rounded bg-[#eff4ff] text-[#004f80]">
                  {currentChartReport.category} INDICATOR
                </span>
                <span
                  className={`font-mono text-[10px] px-2 py-0.5 rounded font-bold ${
                    currentChartReport.onTarget
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {currentChartReport.onTarget ? 'ON TARGET' : 'ATTENTION REQUIRED'}
                </span>
              </div>
              <h2 className="text-base font-bold text-[#0b1c30] mt-0.5">
                {currentChartReport.name} — {periodType} Trend Analysis
              </h2>
            </div>

            <button
              type="button"
              onClick={() => {
                const def = kpiDefs.find((d) => d.code === currentChartReport.kpiCode);
                if (def) {
                  setEditingKpi(JSON.parse(JSON.stringify(def)));
                  setIsConfigModalOpen(true);
                }
              }}
              className="px-3 py-1.5 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Configure Target</span>
            </button>
          </div>

          {/* SVG Trend Chart */}
          <div className="pt-2">
            <div className="h-64 w-full flex items-end justify-between gap-4 px-4 pb-4 border-b border-l border-gray-200 bg-[#f8f9ff]/50 rounded-lg relative">
              {/* Target Benchmark Line Indicator */}
              <div className="absolute left-0 right-0 top-1/3 border-b-2 border-dashed border-[#006c4a]/40 z-0 flex items-center justify-end pr-2">
                <span className="font-mono text-[10px] text-[#006c4a] bg-white px-1 font-bold">
                  Target Threshold: {currentChartReport.targetValue} {currentChartReport.unit}
                </span>
              </div>

              {currentChartReport.historicalPoints.map((pt, idx) => {
                // Calculate height percentage relative to target
                const maxVal = Math.max(currentChartReport.targetValue * 1.5, 1);
                const heightPct = Math.min(Math.round((pt.actualValue / maxVal) * 100), 100);

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 z-10">
                    <div className="font-mono text-[11px] font-bold text-gray-700">
                      {pt.actualValue}
                    </div>
                    <div
                      style={{ height: `${Math.max(heightPct, 15)}%` }}
                      className={`w-full max-w-[48px] rounded-t-lg transition-all ${
                        currentChartReport.onTarget
                          ? 'bg-gradient-to-t from-[#006c4a] to-[#82f5c1]'
                          : 'bg-gradient-to-t from-[#ba1a1a] to-[#ffdad6]'
                      }`}
                    ></div>
                    <div className="font-mono text-[10px] text-gray-500 whitespace-nowrap">
                      {pt.periodLabel}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Trend Details Table */}
          <div className="pt-2">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#eff4ff] text-gray-600 text-[10px] uppercase border-b">
                <tr>
                  <th className="py-2 px-3">Reporting Period</th>
                  <th className="py-2 px-3">Actual Value</th>
                  <th className="py-2 px-3">Target Threshold</th>
                  <th className="py-2 px-3">Man-Hours Worked</th>
                  <th className="py-2 px-3 text-right">Variance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-800 text-[11px]">
                {currentChartReport.historicalPoints.map((pt, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="py-2 px-3 font-bold">{pt.periodLabel}</td>
                    <td className="py-2 px-3 text-[#006c4a] font-bold">
                      {pt.actualValue} {currentChartReport.unit}
                    </td>
                    <td className="py-2 px-3 text-gray-500">{currentChartReport.targetValue}</td>
                    <td className="py-2 px-3 text-gray-600">
                      {pt.manHoursWorked?.toLocaleString() || '—'}
                    </td>
                    <td className="py-2 px-3 text-right font-bold">
                      <span
                        className={
                          pt.actualValue <= currentChartReport.targetValue
                            ? 'text-green-600'
                            : 'text-red-600'
                        }
                      >
                        {pt.actualValue <= currentChartReport.targetValue
                          ? 'Satisfactory'
                          : 'Over Threshold'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Configure KPI Target Modal */}
      {isConfigModalOpen && editingKpi && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#c6c6cd]/30 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-[#006c4a]">{editingKpi.code}</span>
                <h2 className="text-lg font-bold text-[#0b1c30]">Configure KPI Parameters</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-500"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="space-y-3 text-xs text-[#0b1c30]">
              <div>
                <label className="font-semibold text-gray-700 block mb-1">KPI Title</label>
                <input
                  type="text"
                  value={editingKpi.name}
                  onChange={(e) => setEditingKpi({ ...editingKpi, name: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Target Threshold</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingKpi.targetThreshold}
                    onChange={(e) =>
                      setEditingKpi({ ...editingKpi, targetThreshold: Number(e.target.value) })
                    }
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 block mb-1">Unit</label>
                  <input
                    type="text"
                    value={editingKpi.unit}
                    onChange={(e) => setEditingKpi({ ...editingKpi, unit: e.target.value })}
                    className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Calculation Formula</label>
                <input
                  type="text"
                  value={editingKpi.calculationFormula}
                  onChange={(e) =>
                    setEditingKpi({ ...editingKpi, calculationFormula: e.target.value })
                  }
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs font-mono text-gray-700"
                />
              </div>

              <div>
                <label className="font-semibold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingKpi.description}
                  onChange={(e) => setEditingKpi({ ...editingKpi, description: e.target.value })}
                  className="w-full bg-[#f8f9ff] border border-gray-300 rounded p-2 text-xs"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t">
              <button
                type="button"
                onClick={() => setIsConfigModalOpen(false)}
                className="px-4 py-2 rounded-lg border text-xs font-semibold text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveConfig}
                className="px-5 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
