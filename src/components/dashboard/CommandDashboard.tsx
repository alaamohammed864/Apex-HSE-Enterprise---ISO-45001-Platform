import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const CommandDashboard: React.FC = () => {
  const {
    t,
    operatingUnit,
    permits,
    showToast,
    setActiveNav,
    setIsNewRecordModalOpen,
    setIsAuditLedgerOpen,
    setIsPtwBoardOpen,
  } = useApp();

  const [reportingWindow, setReportingWindow] = useState('Q1 2026 (Jan - Mar)');
  const [siteSector, setSiteSector] = useState('All EPC-4 Zones (3 Active)');
  const [subcontractor, setSubcontractor] = useState('All CCC & Tier-1 Subs');

  const handleResetFilters = () => {
    setReportingWindow('Q1 2026 (Jan - Mar)');
    setSiteSector('All EPC-4 Zones (3 Active)');
    setSubcontractor('All CCC & Tier-1 Subs');
    showToast('Dashboard filters reset to plant defaults');
  };

  const handleExportBoardReport = () => {
    showToast('Exporting ISO 45001 Executive Board Dossier (PDF & Excel)...');
  };

  const handleEmergencyStopWork = (permitId: string) => {
    showToast(`EMERGENCY STOP-WORK ORDER ISSUED for Permit #${permitId}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Executive Overview Banner */}
      <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-[#c6c6cd]/30">
        <div className="absolute right-0 top-0 w-96 h-full bg-gradient-to-l from-[#dce9ff]/40 via-[#eff4ff]/20 to-transparent pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#45464d]">
              <span className="font-mono text-xs uppercase tracking-wider text-[#006c4a] font-bold flex items-center gap-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-[#006c4a] animate-pulse"></span>
                {t.liveTelemetry}
              </span>
              <span>•</span>
              <span className="font-mono text-xs">{t.isoClause9}</span>
            </div>

            <h1 className="text-2xl lg:text-3xl font-bold text-[#0b1c30] tracking-tight mt-1 flex items-baseline gap-3 flex-wrap">
              {t.commandCenterTitle}
              <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">
                Q1-2026
              </span>
            </h1>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-[#45464d] text-xs">
              <div className="flex items-center gap-1">
                <span className="uppercase font-bold text-[#0b1c30]">{t.contractorLabel}</span>
                <span className="font-semibold text-[#0b1c30]">Consolidated Contractors Corp (CCC)</span>
              </div>
              <div className="h-3 w-px bg-[#c6c6cd]"></div>
              <div className="flex items-center gap-1">
                <span className="uppercase font-bold text-[#0b1c30]">{t.areaLabel}</span>
                <span className="text-[#0b1c30]">{operatingUnit}</span>
              </div>
            </div>
          </div>

          {/* Man-Hour Milestone Badges */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="bg-[#eff4ff] px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-xs border border-[#c6c6cd]/30">
              <div className="w-10 h-10 rounded-lg bg-[#82f5c1] text-[#00714e] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">verified</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#45464d]">
                  {t.manHoursWithoutLti}
                </span>
                <span className="font-mono text-[17px] leading-tight font-bold text-[#006c4a]">
                  3,842,910 <span className="text-xs font-normal">hrs</span>
                </span>
              </div>
            </div>

            <div className="bg-[#eff4ff] px-4 py-2.5 rounded-lg flex items-center gap-3 shadow-xs border border-[#c6c6cd]/30">
              <div className="w-10 h-10 rounded-lg bg-[#dce9ff] text-[#0b1c30] flex items-center justify-center font-bold">
                <span className="material-symbols-outlined text-[24px]">schedule</span>
              </div>
              <div>
                <span className="block font-mono text-[10px] uppercase tracking-wider text-[#45464d]">
                  {t.continuousDays}
                </span>
                <span className="font-mono text-[17px] leading-tight font-bold text-[#0b1c30]">
                  412 <span className="text-xs font-normal">Days</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Strip */}
        <div className="mt-4 pt-3 bg-[#eff4ff] rounded-lg p-2.5 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-3 border border-[#c6c6cd]/30 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white shadow-xs text-[#0b1c30] border border-[#c6c6cd]/30">
              <span className="material-symbols-outlined text-[16px] text-[#45464d]">calendar_today</span>
              <span className="font-bold">{t.reportingWindow}</span>
              <select
                value={reportingWindow}
                onChange={(e) => setReportingWindow(e.target.value)}
                className="bg-transparent font-mono text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option>Q1 2026 (Jan - Mar)</option>
                <option>Full Year 2025</option>
                <option>Trailing 12-Months (TTM)</option>
                <option>Custom Auditor Window</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white shadow-xs text-[#0b1c30] border border-[#c6c6cd]/30">
              <span className="material-symbols-outlined text-[16px] text-[#45464d]">factory</span>
              <span className="font-bold">{t.siteSector}</span>
              <select
                value={siteSector}
                onChange={(e) => setSiteSector(e.target.value)}
                className="bg-transparent font-mono text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option>All EPC-4 Zones (3 Active)</option>
                <option>Process Unit B (Cracker)</option>
                <option>Tank Farm 12-A / Storage</option>
                <option>Marine Jetty & Offloading</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded bg-white shadow-xs text-[#0b1c30] border border-[#c6c6cd]/30">
              <span className="material-symbols-outlined text-[16px] text-[#45464d]">engineering</span>
              <span className="font-bold">{t.subcontractor}</span>
              <select
                value={subcontractor}
                onChange={(e) => setSubcontractor(e.target.value)}
                className="bg-transparent font-mono text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option>All CCC & Tier-1 Subs</option>
                <option>Al-Futtaim Heavy Scaffolding</option>
                <option>Q-Chem Piping Specialists</option>
                <option>Siemens Energy Electrical Unit</option>
              </select>
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="px-2.5 py-1 rounded bg-[#e5eeff] text-[#0b1c30] font-semibold hover:bg-[#dce9ff] transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">filter_alt_off</span>
              {t.reset}
            </button>
          </div>

          <div className="flex items-center gap-2 self-end xl:self-auto">
            <button
              type="button"
              onClick={handleExportBoardReport}
              className="px-3 py-1.5 rounded bg-white text-[#0b1c30] font-semibold shadow-xs hover:bg-[#eff4ff] border border-[#c6c6cd]/30 transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px] text-[#006c4a]">download</span>
              {t.exportIsoBoardReport}
            </button>

            <button
              type="button"
              onClick={() => setIsNewRecordModalOpen(true)}
              className="px-3.5 py-1.5 rounded bg-[#000000] text-white font-semibold shadow-sm hover:bg-[#213145] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              {t.logSafetyEvent}
            </button>
          </div>
        </div>
      </div>

      {/* 6-Metric High-Impact KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Metric 1: TRIR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.trirLabel}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span> -12% LY
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30] tracking-tight">0.18</span>
            <span className="font-mono text-xs text-[#45464d] font-medium">/ 200k hrs</span>
          </div>
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Target threshold: &lt;0.50</span>
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">verified_user</span>
          </div>
        </div>

        {/* Metric 2: LTIFR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.ltifrLabel}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold">
              ZERO TARGET
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#006c4a] tracking-tight">0.00</span>
            <span className="font-mono text-xs text-[#45464d] font-medium">/ 1M hrs</span>
          </div>
          <div className="flex items-center justify-between text-[#45464d] text-xs">
            <span>Zero harm commitment</span>
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">workspace_premium</span>
          </div>
        </div>

        {/* Metric 3: Active High-Risk PTWs */}
        <div
          onClick={() => setActiveNav('permit-to-work')}
          className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.activePtwsLabel}
            </span>
            <span className="w-2 h-2 rounded-full bg-[#68dba9] animate-ping"></span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30] tracking-tight">14</span>
            <span className="font-mono text-xs text-[#006c4a] font-semibold">Active Authorized</span>
          </div>
          <div className="flex items-center gap-1 font-mono text-[10px] text-[#45464d] truncate">
            <span className="px-1 bg-[#e5eeff] rounded">3 HW</span>
            <span className="px-1 bg-[#e5eeff] rounded">2 CS</span>
            <span className="px-1 bg-[#e5eeff] rounded">4 WAH</span>
            <span className="px-1 bg-[#e5eeff] rounded">5 Lift</span>
          </div>
        </div>

        {/* Metric 4: Training Compliance */}
        <div
          onClick={() => setActiveNav('training-competency-matrix')}
          className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.trainingComplianceLabel}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">
              94.6%
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30] tracking-tight">94.6%</span>
            <span className="font-mono text-xs text-[#45464d]">3,120 valid</span>
          </div>
          <div className="flex items-center justify-between font-mono text-[11px]">
            <span className="text-[#c76c00] font-semibold">18 due &lt;14d</span>
            <span className="text-[#ba1a1a] font-bold">3 expired</span>
          </div>
        </div>

        {/* Metric 5: Overdue CAPA */}
        <div
          onClick={() => setActiveNav('incident-investigations')}
          className="bg-gradient-to-br from-white via-[#ffdad6]/20 to-white p-4 rounded-xl shadow-sm border border-[#ffdad6] flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.overdueCapaLabel}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#ba1a1a]"></span> ACTION REQ
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#ba1a1a] tracking-tight">02</span>
            <span className="font-mono text-xs text-[#ba1a1a] font-semibold">Critical Overdue</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#45464d]">
            <span>Click to review</span>
            <span className="material-symbols-outlined text-[#ba1a1a] text-[18px]">arrow_forward</span>
          </div>
        </div>

        {/* Metric 6: ISO 45001 Readiness */}
        <div
          onClick={() => setActiveNav('hse-audits-non-conformances')}
          className="bg-white p-4 rounded-xl shadow-sm border border-[#c6c6cd]/30 flex flex-col justify-between hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className="flex items-start justify-between">
            <span className="text-[11px] uppercase tracking-wider font-bold text-[#45464d]">
              {t.isoReadinessLabel}
            </span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">
              AUDITED Q4
            </span>
          </div>
          <div className="my-2 flex items-baseline gap-1.5">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30] tracking-tight">98.2%</span>
            <span className="font-mono text-xs text-[#006c4a] font-bold">CLASS A</span>
          </div>
          <div className="flex items-center justify-between text-xs text-[#45464d]">
            <span>BSI Surveillance</span>
            <span className="material-symbols-outlined text-[#006c4a] text-[18px]">verified</span>
          </div>
        </div>
      </div>

      {/* Main Command Grid: 8 Cols Left / 4 Cols Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Operational Context Banner */}
          <div className="relative overflow-hidden rounded-xl bg-white p-6 shadow-sm border border-[#c6c6cd]/30">
            <div className="flex flex-col md:flex-row gap-5 items-center">
              <div className="w-full md:w-5/12 h-44 rounded-lg overflow-hidden relative shadow-inner bg-[#e5eeff]">
                <img
                  className="w-full h-full object-cover"
                  alt="Zone 4 Petrochemical Train industrial construction"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDMhtseTfHNgQbcIMEc6yMsuUEycogfvU65yl8ZPzh7y_4afhrvEhj3k9gCowIP_gM0v9vdrQoZkHcH68dtOqt0Vpb5jsZhBSg1JFxMDnWlcSu8eE0apJ58AJpSyj5KUFKWXPF9BQ9M6iK1st-FUWLTwJSkpX5mswcZOr7dHfue6QBVOQV5yGsJ5gwpznFpGoEHTatH1cEC7PwAgiRYk1ozBllJ_p5U52jIBEmvUKj5pqErqaC5FUwK"
                />
                <div className="absolute bottom-2 left-2 px-2 py-1 rounded bg-[#213145]/90 backdrop-blur-sm text-white font-mono text-[10px] uppercase font-bold flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-[#82f5c1]"></span> Zone 4 Petrochemical Train
                </div>
              </div>

              <div className="w-full md:w-7/12 space-y-1.5">
                <div className="flex items-center gap-1.5 text-[#45464d]">
                  <span className="material-symbols-outlined text-[16px] text-[#006c4a]">
                    security_update_good
                  </span>
                  <span className="font-mono text-xs uppercase tracking-wide font-bold">
                    Shift Superintendent Log • Handover Clear
                  </span>
                </div>
                <h2 className="text-lg font-bold text-[#0b1c30] leading-snug">
                  Major Plant Outage & Cold Tie-In Phase Underway
                </h2>
                <p className="text-xs text-[#45464d] leading-relaxed">
                  Simultaneous operations (SIMOPS) protocol active on Tank Farm cryogenic tie-in header. 14 critical permits authorized under Level 3 Gas Free Certification. Zero uncontrolled releases or atmospheric deviations recorded.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[#0b1c30] font-mono text-[11px] border-t border-[#c6c6cd]/20">
                  <div>
                    <span className="text-[#45464d]">Shift Lead:</span> Eng. Khalid Al-Dosari
                  </div>
                  <div>
                    <span className="text-[#45464d]">Gas Sniffer Calibration:</span> 06:00 AST (Valid)
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Incident Frequency & Proactive Safety Ratio Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    Live Incident Frequency & Proactive Safety Ratio
                  </h3>
                  <span className="px-2 py-0.5 rounded bg-[#dce9ff] font-mono text-[11px] font-bold text-[#0b1c30]">
                    Monthly Trend 2025-2026
                  </span>
                </div>
                <p className="text-xs text-[#45464d] mt-0.5">
                  Target proactive-to-reactive reporting ratio: ≥ 4.0:1 | Current Ratio:{' '}
                  <span className="font-bold text-[#006c4a]">4.5:1</span>
                </p>
              </div>

              <div className="flex items-center gap-4 text-[#45464d] font-mono text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#006c4a]"></span> Near Misses (9)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#dce9ff] border border-[#c6c6cd]"></span> First Aid (2)
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-sm bg-[#ba1a1a]"></span> LTI (0)
                </div>
              </div>
            </div>

            {/* SVG Chart */}
            <div className="w-full bg-[#eff4ff] rounded-lg p-4 border border-[#c6c6cd]/20">
              <svg className="w-full h-44" viewBox="0 0 680 180" preserveAspectRatio="none" fill="none">
                {/* Horizontal Grid lines */}
                <line x1="40" y1="20" x2="660" y2="20" stroke="#0b1c30" strokeOpacity="0.08" />
                <line x1="40" y1="60" x2="660" y2="60" stroke="#0b1c30" strokeOpacity="0.08" />
                <line x1="40" y1="100" x2="660" y2="100" stroke="#0b1c30" strokeOpacity="0.08" />
                <line x1="40" y1="140" x2="660" y2="140" stroke="#0b1c30" strokeOpacity="0.08" />
                <line x1="40" y1="170" x2="660" y2="170" stroke="#0b1c30" strokeOpacity="0.2" />

                {/* Y-axis Labels */}
                <text x="25" y="24" fill="#45464d" fontSize="10" fontFamily="JetBrains Mono">12</text>
                <text x="25" y="64" fill="#45464d" fontSize="10" fontFamily="JetBrains Mono">9</text>
                <text x="25" y="104" fill="#45464d" fontSize="10" fontFamily="JetBrains Mono">6</text>
                <text x="25" y="144" fill="#45464d" fontSize="10" fontFamily="JetBrains Mono">3</text>
                <text x="25" y="173" fill="#45464d" fontSize="10" fontFamily="JetBrains Mono">0</text>

                {/* Near Miss Bars (Emerald) */}
                <rect x="70" y="80" width="22" height="90" rx="2" fill="#006c4a" opacity="0.9" />
                <rect x="170" y="68" width="22" height="102" rx="2" fill="#006c4a" opacity="0.9" />
                <rect x="270" y="55" width="22" height="115" rx="2" fill="#006c4a" opacity="0.9" />
                <rect x="370" y="60" width="22" height="110" rx="2" fill="#006c4a" opacity="0.9" />
                <rect x="470" y="70" width="22" height="100" rx="2" fill="#006c4a" opacity="0.9" />
                <rect x="570" y="50" width="22" height="120" rx="2" fill="#006c4a" />

                {/* First Aid Cases (Slate) */}
                <rect x="96" y="156" width="16" height="14" rx="2" fill="#45464d" opacity="0.4" />
                <rect x="196" y="142" width="16" height="28" rx="2" fill="#45464d" opacity="0.4" />
                <rect x="296" y="156" width="16" height="14" rx="2" fill="#45464d" opacity="0.4" />
                <rect x="396" y="170" width="16" height="0" rx="2" fill="#45464d" opacity="0.4" />
                <rect x="496" y="142" width="16" height="28" rx="2" fill="#45464d" opacity="0.4" />
                <rect x="596" y="142" width="16" height="28" rx="2" fill="#45464d" opacity="0.6" />

                {/* Zero line marker for LTI */}
                <path d="M 80 168 L 180 168 L 280 168 L 380 168 L 480 168 L 580 168" stroke="#ba1a1a" strokeWidth="2" strokeDasharray="3 3" />

                {/* X-axis Labels */}
                <text x="82" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">OCT</text>
                <text x="182" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">NOV</text>
                <text x="282" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">DEC</text>
                <text x="382" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">JAN</text>
                <text x="482" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" textAnchor="middle">FEB</text>
                <text x="582" y="182" fill="#0b1c30" fontSize="11" fontFamily="JetBrains Mono" fontWeight="bold" textAnchor="middle">MAR (M-T-D)</text>
              </svg>
            </div>

            {/* Bottom Chart Summaries */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-lg bg-[#eff4ff] flex items-center justify-between border border-[#c6c6cd]/20">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#45464d]">LTI Free Target</span>
                  <span className="font-bold text-[#006c4a] text-sm">100% Target Met</span>
                </div>
                <span className="material-symbols-outlined text-[#006c4a] text-[22px]">thumb_up</span>
              </div>

              <div className="p-3 rounded-lg bg-[#eff4ff] flex items-center justify-between border border-[#c6c6cd]/20">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#45464d]">Near Miss Submissions</span>
                  <span className="font-bold text-[#0b1c30] text-sm">+18% Proactive</span>
                </div>
                <span className="material-symbols-outlined text-[#006c4a] text-[22px]">trending_up</span>
              </div>

              <div className="p-3 rounded-lg bg-[#eff4ff] flex items-center justify-between border border-[#c6c6cd]/20">
                <div>
                  <span className="block font-mono text-[10px] uppercase text-[#45464d]">Root-Cause Closure</span>
                  <span className="font-bold text-[#0b1c30] text-sm">94.8% on-time</span>
                </div>
                <span className="material-symbols-outlined text-[#45464d] text-[22px]">done_all</span>
              </div>
            </div>
          </div>

          {/* High-Risk Operations Board (PTW Table) */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#006c4a] animate-pulse"></span>
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    Real-Time High-Risk Operations Board (PTW)
                  </h3>
                </div>
                <p className="text-xs text-[#45464d] mt-0.5">
                  Active permits requiring real-time gas monitoring, cross-unit isolation, and continuous supervision.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[#45464d]">Auto-sync: 30s</span>
                <button
                  type="button"
                  onClick={() => showToast('Permit board refreshed from plant DCS')}
                  className="p-1 rounded bg-[#eff4ff] hover:bg-[#dce9ff] transition-colors"
                  title="Force Refresh"
                >
                  <span className="material-symbols-outlined text-[16px] text-[#0b1c30]">refresh</span>
                </button>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#eff4ff] uppercase tracking-wider text-[#45464d] font-mono text-[11px]">
                    <th className="py-2.5 px-3 rounded-l font-bold">Permit ID / Type</th>
                    <th className="py-2.5 px-3 font-bold">Site Location</th>
                    <th className="py-2.5 px-3 font-bold">Permit Holder</th>
                    <th className="py-2.5 px-3 font-bold">Gas Test Status</th>
                    <th className="py-2.5 px-3 font-bold">Validity</th>
                    <th className="py-2.5 px-3 font-bold">Auth Chain</th>
                    <th className="py-2.5 px-3 rounded-r text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
                  {permits.map((p) => (
                    <tr key={p.id} className="hover:bg-[#eff4ff]/60 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#c76c00] text-[18px]">
                            {p.typeIcon}
                          </span>
                          <div>
                            <span className="font-mono text-xs font-bold text-[#0b1c30] block">
                              {p.id}
                            </span>
                            <span className="text-[10px] uppercase font-bold text-[#45464d]">
                              {p.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold block text-[#0b1c30]">{p.location}</span>
                        <span className="font-mono text-[10px] text-[#45464d]">{p.locationDetail}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-semibold block text-[#0b1c30]">{p.holder}</span>
                        <span className="font-mono text-[10px] text-[#45464d]">{p.holderOrg}</span>
                      </td>
                      <td className="py-3 px-3">
                        <div className="flex flex-col">
                          <span
                            className={`font-mono text-[11px] font-bold flex items-center gap-1 ${
                              p.gasStatus === 'PASS' ? 'text-[#006c4a]' : 'text-[#c76c00]'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                p.gasStatus === 'PASS' ? 'bg-[#006c4a]' : 'bg-[#c76c00] animate-ping'
                              }`}
                            ></span>
                            {p.gasStatus === 'PASS' ? `PASS (${p.gasTime})` : p.gasTime}
                          </span>
                          <span className="font-mono text-[10px] text-[#45464d]">{p.gasReadings}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-xs font-bold text-[#0b1c30]">
                          {p.validityTime}
                        </span>
                        <span
                          className={`text-[11px] block font-medium ${
                            p.gasStatus === 'PASS' ? 'text-[#006c4a]' : 'text-[#c76c00] font-bold'
                          }`}
                        >
                          {p.timeLeft}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-semibold">
                          {p.authChain}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setIsPtwBoardOpen(true)}
                            className="p-1 rounded hover:bg-[#eff4ff] text-[#45464d] hover:text-[#0b1c30]"
                            title="View Permit Details"
                          >
                            <span className="material-symbols-outlined text-[18px]">visibility</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleEmergencyStopWork(p.id)}
                            className="p-1 rounded hover:bg-[#ffdad6] text-[#ba1a1a]"
                            title="Emergency Stop-Work Order"
                          >
                            <span className="material-symbols-outlined text-[18px]">gpp_bad</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 pt-2 flex items-center justify-between text-[#45464d] font-mono text-xs border-t border-[#c6c6cd]/20">
              <span>Showing 4 of 14 concurrent permits</span>
              <button
                type="button"
                onClick={() => setIsPtwBoardOpen(true)}
                className="font-bold text-[#0b1c30] hover:text-[#006c4a] flex items-center gap-1 transition-colors"
              >
                Open PTW Live Board (14 total) <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* 5x5 Enterprise Risk Matrix & ALARP Heatmap */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-[#0b1c30]">
                    5x5 Enterprise Risk Matrix & ALARP Heatmap
                  </h3>
                  <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold">
                    ALARP COMPLIANT
                  </span>
                </div>
                <p className="text-xs text-[#45464d] mt-0.5">
                  Active hazard register: 43 residual risks scored against ISO 45001 ALARP tolerance standards.
                </p>
              </div>

              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">Low: 28</span>
                <span className="px-2 py-0.5 rounded bg-[#ffdcc3] text-[#2f1500] font-bold">Med: 12</span>
                <span className="px-2 py-0.5 rounded bg-[#ffb77d] text-[#2f1500] font-bold">High: 3</span>
                <span className="px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-bold">Extreme: 0</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              {/* 5x5 Visual Grid */}
              <div className="md:col-span-8 overflow-x-auto">
                <div className="min-w-[320px]">
                  <div className="flex items-center justify-between mb-1 text-[10px] font-mono uppercase font-bold text-[#45464d]">
                    <span>Consequence (1 to 5) ↑</span>
                    <span>Likelihood (A to E) →</span>
                  </div>

                  {/* 5x5 Matrix Layout */}
                  <div className="grid grid-cols-5 gap-1.5 text-center font-mono text-[11px]">
                    {/* Row 5 */}
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (0)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">H (1)</div>
                    <div className="p-2 rounded bg-[#ffdad6] text-[#93000a] font-bold">H (1)</div>
                    <div className="p-2 rounded bg-[#ba1a1a] text-white font-bold">E (0)</div>
                    <div className="p-2 rounded bg-[#ba1a1a] text-white font-bold">E (0)</div>

                    {/* Row 4 */}
                    <div className="p-2 rounded bg-[#d3e4fe] text-[#0b1c30] font-bold">L (2)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (3)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">H (1)</div>
                    <div className="p-2 rounded bg-[#ffdad6] text-[#93000a] font-bold">H (0)</div>
                    <div className="p-2 rounded bg-[#ba1a1a] text-white font-bold">E (0)</div>

                    {/* Row 3 */}
                    <div className="p-2 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">L (4)</div>
                    <div className="p-2 rounded bg-[#d3e4fe] text-[#0b1c30] font-bold">L (5)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (4)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (2)</div>
                    <div className="p-2 rounded bg-[#ffdad6] text-[#93000a] font-bold">H (0)</div>

                    {/* Row 2 */}
                    <div className="p-2 rounded bg-[#82f5c1] text-[#00714e] font-bold">L (6)</div>
                    <div className="p-2 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">L (5)</div>
                    <div className="p-2 rounded bg-[#d3e4fe] text-[#0b1c30] font-bold">L (3)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (1)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (1)</div>

                    {/* Row 1 */}
                    <div className="p-2 rounded bg-[#82f5c1] text-[#00714e] font-bold">L (2)</div>
                    <div className="p-2 rounded bg-[#82f5c1] text-[#00714e] font-bold">L (1)</div>
                    <div className="p-2 rounded bg-[#dce9ff] text-[#0b1c30] font-bold">L (0)</div>
                    <div className="p-2 rounded bg-[#d3e4fe] text-[#0b1c30] font-bold">L (0)</div>
                    <div className="p-2 rounded bg-[#ffb77d] text-[#2f1500] font-bold">M (1)</div>
                  </div>
                </div>
              </div>

              {/* Sidebar Focus Details */}
              <div className="md:col-span-4 bg-[#eff4ff] p-4 rounded-lg space-y-3 border border-[#c6c6cd]/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-bold text-[#0b1c30]">ALARP Ledger</span>
                  <span className="font-mono text-[10px] text-[#006c4a] font-bold">98% Verified</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded bg-white shadow-xs border border-[#c6c6cd]/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1c30]">3 High Risks Active</span>
                      <span className="font-mono text-[10px] px-1 bg-[#ffb77d] text-[#2f1500] rounded font-bold">
                        REVIEWED
                      </span>
                    </div>
                    <p className="text-[#45464d] text-[11px] mt-1">
                      Heavy tandem lift at Jetty, Cryogenic tie-in pressure test, and Subsea trench excavation.
                    </p>
                  </div>

                  <div className="p-2.5 rounded bg-white shadow-xs border border-[#c6c6cd]/20">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[#0b1c30]">0 Extreme Risks</span>
                      <span className="font-mono text-[10px] px-1 bg-[#82f5c1] text-[#00714e] rounded font-bold">
                        SAFE
                      </span>
                    </div>
                    <p className="text-[#45464d] text-[11px] mt-1">
                      No active tasks currently breach the unmitigated stop-work threshold.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveNav('risk-assessments-alarp')}
                  className="w-full text-center py-2 rounded bg-[#e5eeff] font-bold text-xs text-[#0b1c30] hover:bg-[#dce9ff] transition-colors"
                >
                  Full 5x5 Hazard Registry →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Immediate Action Center */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex items-center justify-between pb-2">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[#ba1a1a] text-[20px]">
                  notification_important
                </span>
                <h3 className="text-base font-bold text-[#0b1c30]">Immediate Action Center</h3>
              </div>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-bold">
                3 Pending
              </span>
            </div>
            <p className="text-xs text-[#45464d] mb-4">
              Critical bottlenecks requiring immediate HSE Management escalation or digital sign-off.
            </p>

            <div className="space-y-3">
              {/* Overdue CAPA 1 */}
              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 space-y-1">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#ba1a1a] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#ba1a1a]"></span> Overdue CAPA (3 Days)
                  </span>
                  <span className="font-mono text-[11px] text-[#45464d]">NCR-2026-019</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  Recertification of Crane Rigger Lanyards
                </h4>
                <p className="text-[11px] text-[#45464d]">
                  Assigned to: Consolidated Sub-Contractor Lead. Third-party testing cert document missing.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => showToast('Immediate Work Hold Enforced for Crane Lanyards')}
                    className="text-xs font-bold text-[#ba1a1a] hover:underline flex items-center gap-1"
                  >
                    Enforce Immediate Hold <span className="material-symbols-outlined text-[14px]">flag</span>
                  </button>
                  <span className="font-mono text-[10px] text-[#45464d]">Due: 28-Feb-2026</span>
                </div>
              </div>

              {/* Overdue CAPA 2 */}
              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 space-y-1">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#c76c00] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#c76c00]"></span> Overdue CAPA (1 Day)
                  </span>
                  <span className="font-mono text-[11px] text-[#45464d]">INC-2026-042</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  Secondary Containment Berm Drain Valve
                </h4>
                <p className="text-[11px] text-[#45464d]">
                  Process Unit B lube skid found locked open. Lockout tagout reinstatement pending photo evidence.
                </p>
                <div className="pt-2 flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => showToast('Photo proof verification approved')}
                    className="text-xs font-bold text-[#0b1c30] hover:underline flex items-center gap-1"
                  >
                    Verify Photo Proof <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  </button>
                  <span className="font-mono text-[10px] text-[#45464d]">Due: 02-Mar-2026</span>
                </div>
              </div>

              {/* Pending Sign-Off Document */}
              <div className="p-3.5 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/20 space-y-1">
                <div className="flex items-start justify-between">
                  <span className="font-mono text-[10px] uppercase font-bold text-[#006c4a] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-[#006c4a]"></span> Sign-Off Required
                  </span>
                  <span className="font-mono text-[11px] text-[#45464d]">v2.0 Formal</span>
                </div>
                <h4 className="text-xs font-bold text-[#0b1c30]">
                  Project HSE Plan Rev 02 - EPC-4
                </h4>
                <p className="text-[11px] text-[#45464d]">
                  Awaiting Lead HSE Director final endorsement for Q1-Q2 operational handoff.
                </p>
                <div className="pt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => showToast('Project HSE Plan Rev 02 Endorsed & Cryptographically Signed')}
                    className="flex-1 py-1 rounded bg-[#006c4a] text-white text-xs font-semibold hover:bg-[#00714e] transition-colors"
                  >
                    Authorize & Sign
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveNav('controlled-document-library')}
                    className="px-3 py-1 rounded bg-[#dce9ff] text-[#0b1c30] text-xs font-semibold hover:bg-[#e5eeff] transition-colors"
                  >
                    Review
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Document Control Pulse */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">Document Control Pulse</h3>
                <p className="text-xs text-[#45464d]">ISO 45001 §7.5 Documented Information</p>
              </div>
              <span className="material-symbols-outlined text-[#45464d] text-[20px]">
                folder_special
              </span>
            </div>

            {/* Document Counts */}
            <div className="grid grid-cols-2 gap-2.5 my-3">
              <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center border border-[#c6c6cd]/20">
                <span className="block font-mono text-[22px] font-bold text-[#006c4a]">42</span>
                <span className="text-[11px] uppercase tracking-wider text-[#0b1c30] font-bold">
                  Approved
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center border border-[#c6c6cd]/20">
                <span className="block font-mono text-[22px] font-bold text-[#0b1c30]">06</span>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  In Review
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center border border-[#c6c6cd]/20">
                <span className="block font-mono text-[22px] font-bold text-[#45464d]">04</span>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  Draft
                </span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#eff4ff] text-center border border-[#c6c6cd]/20">
                <span className="block font-mono text-[22px] font-bold text-[#45464d]">89</span>
                <span className="text-[11px] uppercase tracking-wider text-[#45464d] font-bold">
                  Superseded
                </span>
              </div>
            </div>

            {/* Recent Docs */}
            <div className="space-y-2 text-xs">
              <div
                onClick={() => setActiveNav('controlled-document-library')}
                className="flex items-center justify-between p-2 rounded hover:bg-[#eff4ff] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[18px] text-[#006c4a]">description</span>
                  <div className="truncate">
                    <span className="font-bold text-[#0b1c30] block truncate">
                      ERP-401 Emergency Response Manual
                    </span>
                    <span className="font-mono text-[10px] text-[#45464d]">Approved • v4.1</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30]">
                  PDF
                </span>
              </div>

              <div
                onClick={() => setActiveNav('controlled-document-library')}
                className="flex items-center justify-between p-2 rounded hover:bg-[#eff4ff] cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="material-symbols-outlined text-[18px] text-[#c76c00]">architecture</span>
                  <div className="truncate">
                    <span className="font-bold text-[#0b1c30] block truncate">
                      SOP-MECH-109 Hot Tapping Procedure
                    </span>
                    <span className="font-mono text-[10px] text-[#45464d]">In Review • v1.3</span>
                  </div>
                </div>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#e5eeff] text-[#0b1c30]">
                  DOCX
                </span>
              </div>
            </div>

            <div className="mt-4 pt-1">
              <button
                type="button"
                onClick={() => setActiveNav('controlled-document-library')}
                className="w-full py-2 rounded bg-[#eff4ff] hover:bg-[#dce9ff] text-[#0b1c30] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
              >
                <span className="material-symbols-outlined text-[16px]">folder_open</span>
                Browse Controlled Document Library (23 Categories)
              </button>
            </div>
          </div>

          {/* WORM Audit Ledger Pulse */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-[#c6c6cd]/30">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-base font-bold text-[#0b1c30]">WORM Audit Ledger Pulse</h3>
                <p className="text-xs text-[#45464d]">Cryptographic Append-Only Ledger</p>
              </div>
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">lock</span>
            </div>

            <div className="space-y-2.5 mt-2">
              <div className="p-2.5 rounded bg-[#eff4ff] text-[#0b1c30] text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#45464d]">Today 09:22:14 AST</span>
                  <span className="text-[#006c4a] font-bold">BLOCK #941,204</span>
                </div>
                <p className="font-bold text-xs mt-0.5">PTW Gas Test Authorization Re-certified</p>
                <div className="flex items-center justify-between text-[#45464d] text-[10px] mt-1 font-mono">
                  <span>By: Eng. Fahad Al-Naimi</span>
                  <span>ISO §9.1.1</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#eff4ff] text-[#0b1c30] text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#45464d]">Today 08:45:00 AST</span>
                  <span className="text-[#006c4a] font-bold">BLOCK #941,203</span>
                </div>
                <p className="font-bold text-xs mt-0.5">CAPA Action Status Modified -&gt; Overdue</p>
                <div className="flex items-center justify-between text-[#45464d] text-[10px] mt-1 font-mono">
                  <span>By: Apex Watchdog</span>
                  <span>ISO §10.2</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#eff4ff] text-[#0b1c30] text-xs">
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="text-[#45464d]">Today 07:11:32 AST</span>
                  <span className="text-[#006c4a] font-bold">BLOCK #941,202</span>
                </div>
                <p className="font-bold text-xs mt-0.5">Scaffold Green Tag Clearance: #GR-992</p>
                <div className="flex items-center justify-between text-[#45464d] text-[10px] mt-1 font-mono">
                  <span>By: T. Suresh (Competent)</span>
                  <span>ISO §8.1</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-1 flex items-center justify-between font-mono text-[11px] text-[#45464d]">
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#006c4a]"></span> Ledger Verified
              </span>
              <button
                type="button"
                onClick={() => setIsAuditLedgerOpen(true)}
                className="font-bold text-[#0b1c30] hover:underline"
              >
                Full System Ledger →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
