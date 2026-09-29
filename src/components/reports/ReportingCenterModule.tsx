import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ReportingService,
  AVAILABLE_REPORTS,
  ReportMeta,
  ReportType,
  DashboardMetricsData,
} from '../../services/reportingService';

export const ReportingCenterModule: React.FC = () => {
  const { showToast } = useApp();

  const [selectedReport, setSelectedReport] = useState<ReportMeta>(AVAILABLE_REPORTS[0]);
  const [metrics, setMetrics] = useState<DashboardMetricsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Load metrics from database
  useEffect(() => {
    ReportingService.getDashboardMetrics()
      .then((data) => {
        setMetrics(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load metrics', err);
        setLoading(false);
      });
  }, []);

  // Filtered reports list
  const filteredReports = useMemo(() => {
    return AVAILABLE_REPORTS.filter((r) => {
      const matchSearch =
        searchFilter === '' ||
        r.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.documentNumber.toLowerCase().includes(searchFilter.toLowerCase()) ||
        r.description.toLowerCase().includes(searchFilter.toLowerCase());
      const matchCategory = categoryFilter === 'ALL' || r.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [searchFilter, categoryFilter]);

  const categories = useMemo(() => {
    const set = new Set(AVAILABLE_REPORTS.map((r) => r.category));
    return ['ALL', ...Array.from(set)];
  }, []);

  // Handler: Generate and Download PDF
  const handleDownloadPdf = async (reportType: ReportType) => {
    try {
      setGeneratingPdf(true);
      showToast(`Generating text-based vector PDF for ${selectedReport.title}...`);
      const blob = await ReportingService.generateReportPdf(reportType);
      const filename = `${selectedReport.documentNumber}_${selectedReport.type}.pdf`;
      ReportingService.downloadPdfBlob(blob, filename);
      showToast(`PDF "${filename}" generated and downloaded successfully.`);
    } catch (err) {
      console.error('PDF generation error:', err);
      showToast('Error generating PDF report.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Handler: Export CSV
  const handleExportCsv = async (reportType: ReportType) => {
    try {
      showToast(`Exporting CSV dataset for ${selectedReport.title}...`);
      await ReportingService.exportReportToCsv(reportType);
      showToast('CSV report downloaded successfully.');
    } catch (err) {
      console.error('CSV export error:', err);
      showToast('Error exporting CSV.');
    }
  };

  // Handler: Print
  const handlePrint = async (reportType: ReportType) => {
    try {
      setGeneratingPdf(true);
      const blob = await ReportingService.generateReportPdf(reportType);
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (win) {
        win.focus();
      } else {
        ReportingService.downloadPdfBlob(blob, `${selectedReport.documentNumber}.pdf`);
      }
    } catch (err) {
      console.error('Print preview error:', err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
              ISO 45001:2018 §9.1 &amp; §7.5
            </span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">
              Corporate Reporting Center &amp; Document Generator
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Enterprise HSE Reports &amp; Verified PDF Generation
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Generate official, text-based printable PDF dossiers and CSV registers with corporate title blocks, signatures, and page numbers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={generatingPdf}
            onClick={() => handleDownloadPdf(selectedReport.type)}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005238] transition-all flex items-center gap-2 shadow-xs disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-[18px]">picture_as_pdf</span>
            <span>{generatingPdf ? 'Rendering PDF...' : 'Download Selected PDF'}</span>
          </button>
          <button
            type="button"
            onClick={() => handleExportCsv(selectedReport.type)}
            className="px-3.5 py-2 rounded-lg border border-gray-300 bg-white text-[#0b1c30] text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5 shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px] text-green-700">table_view</span>
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left List (11 Reports) & Right Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Report Catalogue (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b">
            <h2 className="text-sm font-bold text-[#0b1c30] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px] text-[#006c4a]">folder_supervised</span>
              <span>Available Reports Register (11)</span>
            </h2>
            <span className="text-[11px] font-mono text-gray-500">Live DB Powered</span>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-gray-400 text-[18px]">
                search
              </span>
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search reports by title or doc number..."
                className="w-full pl-9 pr-3 py-2 text-xs border rounded-lg focus:outline-none focus:ring-1 focus:ring-[#006c4a]"
              />
            </div>

            <div className="flex flex-wrap gap-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-1 rounded text-[10px] font-bold transition-all ${
                    categoryFilter === cat
                      ? 'bg-[#006c4a] text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
            {filteredReports.map((rpt) => (
              <div
                key={rpt.type}
                onClick={() => setSelectedReport(rpt)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedReport.type === rpt.type
                    ? 'bg-[#eff4ff] border-[#006c4a] shadow-xs'
                    : 'bg-white border-gray-200 hover:border-gray-400 hover:bg-gray-50/50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        selectedReport.type === rpt.type
                          ? 'bg-[#006c4a] text-white'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[16px]">{rpt.icon}</span>
                    </div>
                    <div>
                      <div className="font-bold text-xs text-[#0b1c30] leading-snug">{rpt.title}</div>
                      <div className="font-mono text-[10px] text-gray-500">
                        {rpt.documentNumber} • {rpt.revision}
                      </div>
                    </div>
                  </div>
                  <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded bg-white border border-gray-200 text-gray-600">
                    {rpt.category.split('&')[0]}
                  </span>
                </div>
                <p className="text-[11px] text-gray-600 mt-2 line-clamp-2 leading-relaxed">
                  {rpt.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Live Document Preview & Actions (7 cols) */}
        <div className="lg:col-span-7 bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
          {/* Top Title Block Mockup */}
          <div className="border border-[#c6c6cd]/40 rounded-lg p-4 bg-[#f8f9ff] space-y-3">
            <div className="flex items-start justify-between border-b pb-3 border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#006c4a] text-white flex items-center justify-center font-bold text-xs">
                  HSE
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0b1c30] tracking-wide">
                    4M ENGINEERING CLOUD — HSE ENTERPRISE
                  </div>
                  <div className="text-[10px] text-gray-500">
                    Project: Ras Laffan EPC-4 Industrial Expansion
                  </div>
                  <div className="text-[9px] text-gray-400 font-mono">
                    Integrated Management System • ISO 45001:2018
                  </div>
                </div>
              </div>

              <div className="text-right font-mono text-[10px] space-y-0.5">
                <div>
                  <span className="text-gray-400">DOC:</span>{' '}
                  <span className="font-bold text-gray-800">{selectedReport.documentNumber}</span>
                </div>
                <div>
                  <span className="text-gray-400">REV:</span>{' '}
                  <span className="font-bold text-gray-800">{selectedReport.revision}</span>
                </div>
                <div>
                  <span className="text-gray-400">DATE:</span>{' '}
                  <span className="font-bold text-gray-800">
                    {new Date().toISOString().split('T')[0]}
                  </span>
                </div>
                <div className="text-[9px] text-green-700 font-bold uppercase">
                  Approved &amp; Controlled
                </div>
              </div>
            </div>

            <div>
              <span className="font-mono text-[10px] text-[#006c4a] font-bold uppercase">
                {selectedReport.category}
              </span>
              <h2 className="text-base font-bold text-[#0b1c30] mt-0.5">{selectedReport.title}</h2>
              <p className="text-xs text-gray-600 mt-1">{selectedReport.description}</p>
            </div>
          </div>

          {/* Quick Metrics Bar for Selected Report Context */}
          {metrics && (
            <div className="grid grid-cols-4 gap-2 py-2">
              <div className="p-2.5 rounded-lg bg-gray-50 border text-center">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Surveillance Facilities</div>
                <div className="font-bold text-base font-mono text-[#0b1c30]">{metrics.projectsCount}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border text-center">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Current TRIR</div>
                <div className="font-bold text-base font-mono text-[#006c4a]">
                  {metrics.kpiStatistics.trir}
                </div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border text-center">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Active PTWs</div>
                <div className="font-bold text-base font-mono text-[#0b1c30]">{metrics.activePtwsCount}</div>
              </div>
              <div className="p-2.5 rounded-lg bg-gray-50 border text-center">
                <div className="text-[10px] text-gray-500 font-mono uppercase">Training Rate</div>
                <div className="font-bold text-base font-mono text-[#006c4a]">
                  {metrics.trainingCompliancePercent}%
                </div>
              </div>
            </div>
          )}

          {/* Document Content Sample Preview */}
          <div className="border rounded-lg p-4 space-y-3 bg-white">
            <h3 className="font-bold text-xs text-[#0b1c30] flex items-center justify-between">
              <span>Executive Data Table Preview (Sample Rows)</span>
              <span className="text-[10px] font-mono text-gray-400">PDF Output Engine: jsPDF Vector</span>
            </h3>

            {selectedReport.type === 'RISK_REGISTER' && (
              <table className="w-full text-left text-xs border">
                <thead className="bg-[#eff4ff] text-[10px] font-mono text-gray-700">
                  <tr>
                    <th className="p-1.5 border">Activity</th>
                    <th className="p-1.5 border">Hazard</th>
                    <th className="p-1.5 border">Initial</th>
                    <th className="p-1.5 border">Residual</th>
                    <th className="p-1.5 border">ALARP Justification</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <tr>
                    <td className="p-1.5 border font-semibold">Tandem Crane Lifting</td>
                    <td className="p-1.5 border">Boom collapse, wind gust</td>
                    <td className="p-1.5 border text-red-600 font-bold">20 (EXTREME)</td>
                    <td className="p-1.5 border text-green-700 font-bold">4 (LOW)</td>
                    <td className="p-1.5 border">Engineered lift plan &amp; dual anemometer.</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border font-semibold">Confined Space Entry</td>
                    <td className="p-1.5 border">Oxygen deficiency, toxic gas</td>
                    <td className="p-1.5 border text-red-600 font-bold">20 (EXTREME)</td>
                    <td className="p-1.5 border text-green-700 font-bold">3 (LOW)</td>
                    <td className="p-1.5 border">Forced ventilation &amp; multi-gas detector.</td>
                  </tr>
                </tbody>
              </table>
            )}

            {selectedReport.type === 'INCIDENT_REPORT' && (
              <div className="text-xs space-y-2 text-gray-700">
                <div className="p-2 bg-gray-50 rounded border text-[11px]">
                  <strong>Incident Dossier:</strong> #INC-2026-042 • Lost Time Injury • Substation 4
                </div>
                <div className="p-2 bg-gray-50 rounded border text-[11px]">
                  <strong>5-Why Root Cause:</strong> Cable pulling winch wire snapped due to missing cotter pin on fairlead replaced with improvised wire.
                </div>
                <div className="p-2 bg-gray-50 rounded border text-[11px]">
                  <strong>Actions Dispatched:</strong> 3 Corrective actions created and linked to Central CAPA Register.
                </div>
              </div>
            )}

            {selectedReport.type === 'INSPECTION_REPORT' && (
              <table className="w-full text-left text-xs border">
                <thead className="bg-[#eff4ff] text-[10px] font-mono text-gray-700">
                  <tr>
                    <th className="p-1.5 border">Item</th>
                    <th className="p-1.5 border">Inspection Checkpoint</th>
                    <th className="p-1.5 border">Result</th>
                    <th className="p-1.5 border">Action</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <tr>
                    <td className="p-1.5 border font-mono">01</td>
                    <td className="p-1.5 border">Base plates and sole boards supported on solid ground</td>
                    <td className="p-1.5 border text-green-700 font-bold">PASS</td>
                    <td className="p-1.5 border text-gray-400">None</td>
                  </tr>
                  <tr>
                    <td className="p-1.5 border font-mono">05</td>
                    <td className="p-1.5 border">Guardrails &amp; intermediate toe-boards fitted</td>
                    <td className="p-1.5 border text-red-600 font-bold">FAIL</td>
                    <td className="p-1.5 border text-blue-700 font-bold">Dispatched to CAPA</td>
                  </tr>
                </tbody>
              </table>
            )}

            {selectedReport.type !== 'RISK_REGISTER' &&
              selectedReport.type !== 'INCIDENT_REPORT' &&
              selectedReport.type !== 'INSPECTION_REPORT' && (
                <div className="p-3 bg-gray-50 rounded border text-xs text-gray-600 leading-relaxed">
                  This report will compile live records from the database covering surveillance metrics, active personnel qualifications, audit results, and corporate HSE key performance indicators into a verified ISO 45001 compliant vector PDF.
                </div>
              )}
          </div>

          {/* Corporate Signatures & Security Block */}
          <div className="border border-dashed p-3 rounded-lg flex flex-col md:flex-row items-center justify-between gap-3 text-[10px] font-mono text-gray-500">
            <div>Prepared By: Lead HSE Engineer</div>
            <div>Reviewed By: Project QHSE Manager</div>
            <div>Approved By: VP of Operations</div>
            <div className="font-bold text-gray-700">Page 1 of 1</div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t gap-2">
            <div className="text-[11px] text-gray-500 font-mono">
              Vector Text PDF • High-Res Printable • WORM Compliant
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handlePrint(selectedReport.type)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">print</span>
                <span>Print Preview</span>
              </button>

              <button
                type="button"
                onClick={() => handleExportCsv(selectedReport.type)}
                className="px-3 py-1.5 rounded-lg border border-gray-300 text-xs font-semibold text-gray-700 hover:bg-gray-100 flex items-center gap-1.5 shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px] text-green-700">csv</span>
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                disabled={generatingPdf}
                onClick={() => handleDownloadPdf(selectedReport.type)}
                className="px-4 py-1.5 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#005238] flex items-center gap-1.5 shadow-xs disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>{generatingPdf ? 'Rendering...' : 'Download PDF'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
