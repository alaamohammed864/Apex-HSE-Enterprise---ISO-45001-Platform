import React from 'react';
import { useApp } from '../../context/AppContext';
import { INITIAL_AUDIT_BLOCKS } from '../../data/mockData';

export const AuditLedgerModal: React.FC = () => {
  const { isAuditLedgerOpen, setIsAuditLedgerOpen, showToast } = useApp();

  if (!isAuditLedgerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#213145]/70 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-[#c6c6cd]/40 flex flex-col max-h-[85vh]">
        <div className="p-4 bg-[#eff4ff] border-b border-[#c6c6cd]/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006c4a]">
              verified_user
            </span>
            <div>
              <h3 className="text-base font-bold text-[#0b1c30]">
                Immutable WORM Audit Ledger &amp; Cryptographic Proof
              </h3>
              <span className="text-xs text-[#45464d] font-mono">
                ISO 45001:2018 Clause 7.5.3 Cryptographic Integrity Check
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAuditLedgerOpen(false)}
            className="p-1 rounded hover:bg-[#dce9ff] text-[#0b1c30]"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          <div className="p-3 rounded-lg bg-[#82f5c1]/30 border border-[#006c4a]/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#006c4a] text-[20px]">verified</span>
              <div>
                <span className="font-bold text-[#00714e] block">Ledger State: Validated (100% Chain Intact)</span>
                <span className="font-mono text-[11px] text-[#45464d]">Last Root Block Hash: 0x941204e3b0c442...</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => showToast('Cryptographic chain verified: 0 tampering events detected')}
              className="px-3 py-1 rounded bg-[#006c4a] text-white font-bold hover:bg-[#00714e]"
            >
              Verify Hashes
            </button>
          </div>

          <div className="space-y-3">
            {INITIAL_AUDIT_BLOCKS.map((block) => (
              <div
                key={block.blockId}
                className="p-4 rounded-xl bg-[#eff4ff] border border-[#c6c6cd]/30 space-y-2 font-mono"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#000000] text-white font-bold text-[11px]">
                      {block.blockId}
                    </span>
                    <span className="text-xs text-[#006c4a] font-bold">{block.isoClause}</span>
                  </div>
                  <span className="text-[11px] text-[#45464d]">{block.timestamp}</span>
                </div>

                <div className="text-xs font-bold text-[#0b1c30]">{block.action}</div>

                <div className="flex items-center justify-between text-[11px] text-[#45464d] pt-1 border-t border-[#c6c6cd]/20">
                  <span>Signer: <strong className="text-[#0b1c30]">{block.actor}</strong></span>
                  <span>Signature: <strong className="text-[#006c4a]">SHA256::{block.hash}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#eff4ff] border-t border-[#c6c6cd]/20 flex items-center justify-between text-xs">
          <span className="font-mono text-[11px] text-[#45464d]">
            Storage: Write-Once-Read-Many (WORM) Hardware Compliant
          </span>
          <button
            type="button"
            onClick={() => setIsAuditLedgerOpen(false)}
            className="px-4 py-1.5 rounded-lg bg-[#000000] text-white font-semibold"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
