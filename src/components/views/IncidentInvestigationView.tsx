import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';

export const IncidentInvestigationView: React.FC = () => {
  const { showToast } = useApp();

  const [activeStep, setActiveStep] = useState(1);
  const [why1, setWhy1] = useState('Secondary containment drain valve was left unlocked in open position during lube oil transfer.');
  const [why2, setWhy2] = useState('Operator failed to apply LOTO padlock following routine morning line purge.');
  const [why3, setWhy3] = useState('Shift handover sheet lacked explicit containment valve physical verification checkbox.');
  const [why4, setWhy4] = useState('Subcontractor procedure was not harmonized with EPC-4 Golden Rules revision 04.');
  const [why5, setWhy5] = useState('Root Cause: Pre-commissioning contractor onboarding skipped formal secondary containment isolation competency module.');

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a]">
              ISO 45001:2018 §10.2
            </span>
            <span className="font-mono text-xs text-[#ba1a1a] font-bold">
              Active Investigation: INC-2026-042
            </span>
          </div>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
            Workplace Incident Investigation &amp; 5-Why Root Cause Analysis
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Secondary Containment Berm Drain Valve Left Open • Process Unit B Lube Skid
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast('5-Why Root Cause approved and CAPA ticket #NCR-2026-019 updated.')}
          className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors"
        >
          Approve Root Cause &amp; Dispatch CAPA
        </button>
      </div>

      {/* 5-Why Interactive Stepper */}
      <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-[#c6c6cd]/20 pb-3">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0b1c30]">
            <span className="material-symbols-outlined text-[#006c4a]">psychology</span>
            <span>Interactive 5-Why Root Cause Methodology</span>
          </div>
          <span className="font-mono text-xs text-[#006c4a] font-bold">Root Cause Reached (Level 5)</span>
        </div>

        <div className="space-y-3">
          {[
            { level: 1, why: 'Why 1: What directly caused the event?', val: why1, setVal: setWhy1 },
            { level: 2, why: 'Why 2: Why was the operator able to do this?', val: why2, setVal: setWhy2 },
            { level: 3, why: 'Why 3: Why was it not caught during shift transition?', val: why3, setVal: setWhy3 },
            { level: 4, why: 'Why 4: Why was the handover checklist incomplete?', val: why4, setVal: setWhy4 },
            { level: 5, why: 'Why 5: Systemic Root Cause (Management System Defect)', val: why5, setVal: setWhy5, isRoot: true },
          ].map((item) => (
            <div
              key={item.level}
              className={`p-4 rounded-xl border transition-all ${
                item.isRoot
                  ? 'bg-[#82f5c1]/20 border-[#006c4a] ring-2 ring-[#006c4a]/20'
                  : 'bg-[#eff4ff] border-[#c6c6cd]/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-[#0b1c30] flex items-center gap-2">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] text-white ${item.isRoot ? 'bg-[#006c4a]' : 'bg-[#131b2e]'}`}>
                    {item.level}
                  </span>
                  {item.why}
                </span>
                {item.isRoot && (
                  <span className="font-mono text-[10px] uppercase font-bold text-[#006c4a] bg-white px-2 py-0.5 rounded border border-[#006c4a]/30">
                    Systemic Defect
                  </span>
                )}
              </div>
              <input
                type="text"
                value={item.val}
                onChange={(e) => item.setVal(e.target.value)}
                className="w-full bg-white text-[#0b1c30] text-xs rounded-lg p-2.5 border border-[#c6c6cd]/30 focus:border-[#006c4a] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Corrective & Preventive Actions (CAPA) Action Plan Table */}
      <div className="bg-white p-6 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-sm text-[#0b1c30]">
            <span className="material-symbols-outlined text-[#ba1a1a]">task_alt</span>
            <span>Assigned Corrective &amp; Preventive Actions (CAPA)</span>
          </div>
          <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#ffdad6] text-[#93000a] font-bold">
            Target SLA: 72 Hours
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-3">CAPA ID</th>
                <th className="py-2.5 px-3">Action Description</th>
                <th className="py-2.5 px-3">Actionee</th>
                <th className="py-2.5 px-3">Hierarchy Tier</th>
                <th className="py-2.5 px-3">Due Date</th>
                <th className="py-2.5 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
              <tr className="hover:bg-[#eff4ff]/60">
                <td className="py-3 px-3 font-mono font-bold">CAPA-042-A</td>
                <td className="py-3 px-3 font-medium">Install captive padlock chain with numbered car seal on valve V-802.</td>
                <td className="py-3 px-3">Eng. S. Varma (Mech)</td>
                <td className="py-3 px-3 font-mono text-[#006c4a]">3. Engineering Control</td>
                <td className="py-3 px-3 font-mono">Today 18:00 AST</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold font-mono text-[10px]">
                    COMPLETED
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-[#eff4ff]/60">
                <td className="py-3 px-3 font-mono font-bold">CAPA-042-B</td>
                <td className="py-3 px-3 font-medium">Mandatory re-induction of 84 subcontractor piping technicians on isolation protocol.</td>
                <td className="py-3 px-3">HSE Training Lead</td>
                <td className="py-3 px-3 font-mono text-[#c76c00]">4. Administrative</td>
                <td className="py-3 px-3 font-mono">2026-03-30</td>
                <td className="py-3 px-3 text-right">
                  <span className="px-2 py-0.5 rounded bg-[#ffdcc3] text-[#6e3900] font-bold font-mono text-[10px]">
                    IN PROGRESS
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
