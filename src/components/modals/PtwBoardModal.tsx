import React from 'react';
import { useApp } from '../../context/AppContext';

export const PtwBoardModal: React.FC = () => {
  const { isPtwBoardOpen, setIsPtwBoardOpen, permits, showToast } = useApp();

  if (!isPtwBoardOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40 flex flex-col max-h-[85vh]">
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              assignment_turned_in
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0b1c30]">
                  Permit to Work (PTW) Live Operations Command
                </h3>
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-[#82f5c1] text-[#00714e] font-bold">
                  14 Active Concurrent Permits
                </span>
              </div>
              <span className="text-xs text-[#45464d]">
                ISO 45001:2018 Clause 8.1.2 Operational Planning &amp; Control
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPtwBoardOpen(false)}
            className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-3.5 sm:p-6 overflow-y-auto space-y-4 text-xs">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/30 text-center">
              <span className="block font-mono text-2xl font-bold text-[#006c4a]">14</span>
              <span className="text-[11px] uppercase font-bold text-[#0b1c30]">Total Active PTWs</span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/30 text-center">
              <span className="block font-mono text-2xl font-bold text-[#c76c00]">02</span>
              <span className="text-[11px] uppercase font-bold text-[#0b1c30]">Gas Re-Test Due</span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/30 text-center">
              <span className="block font-mono text-2xl font-bold text-[#006c4a]">100%</span>
              <span className="text-[11px] uppercase font-bold text-[#0b1c30]">LOTO Compliance</span>
            </div>
            <div className="p-3 rounded-lg bg-[#eff4ff] border border-[#c6c6cd]/30 text-center">
              <span className="block font-mono text-2xl font-bold text-[#0b1c30]">00</span>
              <span className="text-[11px] uppercase font-bold text-[#ba1a1a]">Stop-Work Triggers</span>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl border border-[#c6c6cd]/30 overflow-hidden bg-white">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#eff4ff] text-[#45464d] font-mono text-[11px] uppercase">
                <tr>
                  <th className="py-2.5 px-3">Permit UID</th>
                  <th className="py-2.5 px-3">Discipline / Type</th>
                  <th className="py-2.5 px-3">Plant Location</th>
                  <th className="py-2.5 px-3">Gas Telemetry</th>
                  <th className="py-2.5 px-3">Time Left</th>
                  <th className="py-2.5 px-3 text-right">Emergency Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#c6c6cd]/20">
                {permits.map((p) => (
                  <tr key={p.id} className="hover:bg-[#eff4ff]/60">
                    <td className="py-3 px-3 font-mono font-bold text-[#0b1c30]">{p.id}</td>
                    <td className="py-3 px-3 font-semibold text-[#0b1c30]">{p.type}</td>
                    <td className="py-3 px-3 text-[#45464d]">{p.location} ({p.locationDetail})</td>
                    <td className="py-3 px-3 font-mono">
                      <span className={`font-bold ${p.gasStatus === 'PASS' ? 'text-[#006c4a]' : 'text-[#c76c00]'}`}>
                        {p.gasStatus}: {p.gasReadings}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-[#0b1c30]">{p.timeLeft}</td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => showToast(`Emergency Stop-Work Triggered for ${p.id}`)}
                        className="px-2.5 py-1 rounded bg-[#ffdad6] text-[#ba1a1a] hover:bg-[#ba1a1a] hover:text-white font-bold transition-colors"
                      >
                        Stop-Work
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="p-4 bg-[#eff4ff] border-t border-[#c6c6cd]/20 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#45464d]">
            DCS Telemetry Update Rate: 1000ms Real-Time
          </span>
          <button
            type="button"
            onClick={() => setIsPtwBoardOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#000000] text-white font-semibold"
          >
            Close Board
          </button>
        </div>
      </div>
    </div>
  );
};
