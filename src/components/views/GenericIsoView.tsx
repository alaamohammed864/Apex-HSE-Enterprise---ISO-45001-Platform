import React from 'react';
import { useApp } from '../../context/AppContext';
import { NavigationPath } from '../../types';

export const GenericIsoView: React.FC<{ path: NavigationPath }> = ({ path }) => {
  const { showToast, setIsBilingualViewerOpen } = useApp();

  if (path === 'formal-hse-plan-generator') {
    return (
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
                ISO 45001:2018 Clause 4 - 10
              </span>
              <span className="font-mono text-xs text-[#006c4a] font-bold">
                Automated Plan Synthesis Engine
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
              Formal Project HSE Plan Generator
            </h1>
            <p className="text-xs text-[#45464d] mt-0.5">
              Automated compilation of project governance, risk matrices, legal registers, and emergency protocols.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              showToast('Generating formal 120-page ISO 45001 Site Master Plan...');
              setIsBilingualViewerOpen(true);
            }}
            className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e] transition-colors flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-[18px]">auto_stories</span>
            <span>Compile Formal Plan (Rev 03)</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {[
            { title: 'Part 1: Context of Organization & Leadership', clause: 'ISO §4 & §5', status: 'Ready (14 Docs)', icon: 'corporate_fare' },
            { title: 'Part 2: Planning & Risk Assessment (HIRA)', clause: 'ISO §6', status: 'Ready (28 RAs)', icon: 'grid_4x4' },
            { title: 'Part 3: Operational Control & PTW Rules', clause: 'ISO §8', status: 'Ready (12 SOPs)', icon: 'build' },
            { title: 'Part 4: Performance Evaluation & KPIs', clause: 'ISO §9', status: 'Ready (TRIR 0.18)', icon: 'trending_up' },
            { title: 'Part 5: Incident Investigation & CAPA', clause: 'ISO §10', status: 'Ready (5-Why Active)', icon: 'emergency' },
            { title: 'Part 6: Emergency Preparedness & Spill Response', clause: 'ISO §8.2', status: 'Ready (ERP-401)', icon: 'local_fire_department' },
          ].map((item, i) => (
            <div key={i} className="p-4 rounded-xl bg-white border border-[#c6c6cd]/30 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="material-symbols-outlined text-[#006c4a] text-[20px]">{item.icon}</span>
                <span className="font-mono text-[10px] text-[#45464d] font-bold">{item.clause}</span>
              </div>
              <h3 className="font-bold text-[#0b1c30] text-sm">{item.title}</h3>
              <div className="flex items-center justify-between pt-1 border-t border-[#c6c6cd]/20">
                <span className="font-mono text-[#006c4a] font-bold">{item.status}</span>
                <span className="material-symbols-outlined text-[#006c4a] text-[16px]">check_circle</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (path === 'training-competency-matrix') {
    return (
      <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
        <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
                ISO 45001:2018 §7.2
              </span>
              <span className="font-mono text-xs text-[#006c4a] font-bold">
                Overall Competency Score: 94.6%
              </span>
            </div>
            <h1 className="text-2xl font-bold text-[#0b1c30] mt-1">
              Field Worker Training &amp; Competency Passport Matrix
            </h1>
            <p className="text-xs text-[#45464d] mt-0.5">
              Real-time RFID &amp; Badge verification of 3,120 active site technicians and equipment operators.
            </p>
          </div>

          <button
            type="button"
            onClick={() => showToast('Exporting worker competency passport cards...')}
            className="px-4 py-2 rounded-lg bg-[#000000] text-white text-xs font-semibold hover:bg-[#213145]"
          >
            Export Competency Passports
          </button>
        </div>

        <div className="bg-white rounded-xl border border-[#c6c6cd]/30 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase">
              <tr>
                <th className="py-2.5 px-4">Badge ID</th>
                <th className="py-2.5 px-4">Worker Name &amp; Trade</th>
                <th className="py-2.5 px-4">Contractor</th>
                <th className="py-2.5 px-4">H2S Escape</th>
                <th className="py-2.5 px-4">Confined Space</th>
                <th className="py-2.5 px-4">Work at Height</th>
                <th className="py-2.5 px-4 text-right">Card Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c6c6cd]/20 text-[#0b1c30]">
              {[
                { id: 'QA-8812', name: 'Farhan Al-Kuwari', trade: 'Rigging Appointed Person', sub: 'CCC Heavy Lift', h2s: 'VALID (2027)', cs: 'VALID (2026)', wah: 'VALID (2026)', status: 'ACTIVE' },
                { id: 'QA-9904', name: 'Mustafa Idris, PE', trade: 'Civil Geotech Lead', sub: 'CCC Civils', h2s: 'VALID (2027)', cs: 'VALID (2026)', wah: 'EXEMPT', status: 'ACTIVE' },
                { id: 'QA-7721', name: 'T. Suresh', trade: 'Scaffolding Inspector', sub: 'Al-Futtaim Heavy', h2s: 'VALID (2026)', cs: 'VALID (2026)', wah: 'VALID (2027)', status: 'ACTIVE' },
                { id: 'QA-6612', name: 'K. Venkatraman', trade: 'HV Electrical Authority', sub: 'Siemens Energy', h2s: 'VALID (2026)', cs: 'DUE 14d', wah: 'VALID (2026)', status: 'ACTIVE' },
              ].map((w) => (
                <tr key={w.id} className="hover:bg-[#eff4ff]/60">
                  <td className="py-3 px-4 font-mono font-bold">{w.id}</td>
                  <td className="py-3 px-4">
                    <div className="font-bold">{w.name}</div>
                    <div className="text-[11px] text-[#45464d]">{w.trade}</div>
                  </td>
                  <td className="py-3 px-4 text-[#45464d]">{w.sub}</td>
                  <td className="py-3 px-4 font-mono text-[#006c4a]">{w.h2s}</td>
                  <td className="py-3 px-4 font-mono text-[#006c4a]">{w.cs}</td>
                  <td className="py-3 px-4 font-mono text-[#006c4a]">{w.wah}</td>
                  <td className="py-3 px-4 text-right">
                    <span className="px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-mono text-[10px] font-bold">
                      {w.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  // Fallback rich standard layout for other routes
  return (
    <div className="p-3.5 sm:p-6 space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs flex items-center justify-between">
        <div>
          <span className="font-mono text-xs font-bold uppercase px-2 py-0.5 rounded bg-[#dce9ff] text-[#0b1c30]">
            ISO 45001:2018 Management System
          </span>
          <h1 className="text-2xl font-bold text-[#0b1c30] mt-1 capitalize">
            {path.replace(/-/g, ' ')}
          </h1>
          <p className="text-xs text-[#45464d] mt-0.5">
            Operational module active under Ras Laffan EPC-4 Package governance.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast(`Audit trail recorded for ${path}`)}
          className="px-4 py-2 rounded-lg bg-[#006c4a] text-white text-xs font-bold hover:bg-[#00714e]"
        >
          Verify Regulatory Status
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#006c4a]">verified</span>
            <span>Compliance Integrity &amp; Continuous Oversight</span>
          </h3>
          <p className="text-[#45464d] leading-relaxed">
            All records, digital signatures, and inspection observations for this section are cryptographically sealed and synchronized with the central WORM ledger.
          </p>
          <div className="p-3 bg-[#eff4ff] rounded-lg font-mono text-[11px] text-[#006c4a] font-bold">
            Status: Fully Compliant with Zero Overdue Non-Conformances
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#c6c6cd]/30 shadow-xs space-y-3">
          <h3 className="font-bold text-sm text-[#0b1c30] flex items-center gap-2">
            <span className="material-symbols-outlined text-[#000000]">history</span>
            <span>Recent Operational Audit Entries</span>
          </h3>
          <div className="space-y-2 font-mono text-[11px] text-[#45464d]">
            <div className="p-2 rounded bg-[#eff4ff] flex justify-between">
              <span>Auditor Check: Dr. Tariq Al-Mansoor</span>
              <span className="text-[#006c4a] font-bold">PASSED</span>
            </div>
            <div className="p-2 rounded bg-[#eff4ff] flex justify-between">
              <span>Third-party BSI Surveillance Snapshot</span>
              <span className="text-[#006c4a] font-bold">CLASS A</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
